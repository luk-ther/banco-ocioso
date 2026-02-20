const path = require("path");
const fs = require("fs");
const express = require("express");
const Database = require("better-sqlite3");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = Number(process.env.PORT || 3000);
const JWT_SECRET = process.env.JWT_SECRET || "change-this-secret";

const ROOT_DIR = __dirname;
const DATA_DIR = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : (fs.existsSync("/var/data") ? "/var/data" : path.join(ROOT_DIR, "data"));
const DB_PATH = path.join(DATA_DIR, "banco-ocioso.db");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS vaults (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vault_id TEXT NOT NULL,
  user_id INTEGER NOT NULL,
  data TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(user_id, vault_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
`);

const findUserByEmailStmt = db.prepare("SELECT id, name, email, password_hash FROM users WHERE email = ?");
const findUserByIdStmt = db.prepare("SELECT id, name, email FROM users WHERE id = ?");
const createUserStmt = db.prepare("INSERT INTO users (name, email, password_hash, created_at) VALUES (?, ?, ?, ?)");

const listVaultsStmt = db.prepare("SELECT vault_id, data FROM vaults WHERE user_id = ? ORDER BY updated_at DESC");
const findVaultStmt = db.prepare("SELECT id FROM vaults WHERE user_id = ? AND vault_id = ?");
const createVaultStmt = db.prepare(
  "INSERT INTO vaults (vault_id, user_id, data, created_at, updated_at) VALUES (?, ?, ?, ?, ?)"
);
const updateVaultStmt = db.prepare(
  "UPDATE vaults SET data = ?, updated_at = ? WHERE user_id = ? AND vault_id = ?"
);

app.use(express.json({ limit: "1mb" }));
app.use(express.static(ROOT_DIR));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/auth/register", async (req, res) => {
  try {
    const name = String(req.body?.name || "").trim();
    const email = normalizeEmail(req.body?.email);
    const password = String(req.body?.password || "");

    if (!name || !email || password.length < 6) {
      return res.status(400).json({ error: "Dados invalidos. Informe nome, e-mail e senha (minimo 6)." });
    }

    const existing = findUserByEmailStmt.get(email);
    if (existing) {
      return res.status(409).json({ error: "Ja existe uma conta com este e-mail." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const now = new Date().toISOString();
    const result = createUserStmt.run(name, email, passwordHash, now);

    const user = {
      id: result.lastInsertRowid,
      name,
      email,
    };

    const token = issueToken(user.id);
    return res.status(201).json({ token, user });
  } catch (_error) {
    return res.status(500).json({ error: "Erro ao criar conta." });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const password = String(req.body?.password || "");

    if (!email || !password) {
      return res.status(400).json({ error: "Informe e-mail e senha." });
    }

    const user = findUserByEmailStmt.get(email);
    if (!user) {
      return res.status(401).json({ error: "Credenciais invalidas." });
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ error: "Credenciais invalidas." });
    }

    const token = issueToken(user.id);
    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (_error) {
    return res.status(500).json({ error: "Erro ao fazer login." });
  }
});

app.get("/api/auth/me", authRequired, (req, res) => {
  const user = findUserByIdStmt.get(req.userId);
  if (!user) {
    return res.status(401).json({ error: "Sessao invalida." });
  }

  return res.json({ user });
});

app.get("/api/vaults", authRequired, (req, res) => {
  try {
    const rows = listVaultsStmt.all(req.userId);
    const vaults = rows
      .map((row) => {
        try {
          return JSON.parse(row.data);
        } catch (_error) {
          return null;
        }
      })
      .filter((vault) => vault !== null);

    return res.json({ vaults });
  } catch (_error) {
    return res.status(500).json({ error: "Erro ao carregar cofres." });
  }
});

app.post("/api/vaults", authRequired, (req, res) => {
  try {
    const vault = sanitizeVaultPayload(req.body?.vault);
    const now = new Date().toISOString();
    vault.createdAt = vault.createdAt || now;
    vault.updatedAt = now;

    const existing = findVaultStmt.get(req.userId, vault.id);
    if (existing) {
      return res.status(409).json({ error: "Ja existe um cofre com este identificador." });
    }

    createVaultStmt.run(vault.id, req.userId, JSON.stringify(vault), vault.createdAt, vault.updatedAt);
    return res.status(201).json({ vault });
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: "Erro ao criar cofre." });
  }
});

app.put("/api/vaults/:vaultId", authRequired, (req, res) => {
  try {
    const vault = sanitizeVaultPayload(req.body?.vault);
    vault.id = req.params.vaultId;
    vault.updatedAt = new Date().toISOString();

    const existing = findVaultStmt.get(req.userId, vault.id);
    if (!existing) {
      return res.status(404).json({ error: "Cofre nao encontrado." });
    }

    updateVaultStmt.run(JSON.stringify(vault), vault.updatedAt, req.userId, vault.id);
    return res.json({ vault });
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: "Erro ao atualizar cofre." });
  }
});

app.get("*", (req, res) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ error: "Rota nao encontrada." });
  }
  return res.sendFile(path.join(ROOT_DIR, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Banco Ocioso rodando em http://localhost:${PORT}`);
});

function authRequired(req, res, next) {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token ausente." });
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = Number(payload.sub);
    return next();
  } catch (_error) {
    return res.status(401).json({ error: "Token invalido." });
  }
}

function issueToken(userId) {
  return jwt.sign({ sub: String(userId) }, JWT_SECRET, { expiresIn: "30d" });
}

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function sanitizeVaultPayload(input) {
  if (!input || typeof input !== "object") {
    throw new ValidationError("Dados de cofre invalidos.");
  }

  const id = String(input.id || "").trim();
  const name = String(input.name || "").trim();
  const goal = Number(input.goal);
  const hiddenBalance = Number(input.hiddenBalance);
  const totalDeposits = Number(input.totalDeposits);
  const avgDepositExpected = Number(input.avgDepositExpected);

  if (!id) {
    throw new ValidationError("Cofre sem identificador.");
  }

  if (!name || !Number.isFinite(goal) || goal <= 0) {
    throw new ValidationError("Nome e meta do cofre sao obrigatorios.");
  }

  if (!Number.isFinite(hiddenBalance) || hiddenBalance < 0) {
    throw new ValidationError("Saldo oculto invalido.");
  }

  const depositHistory = Array.isArray(input.depositHistory)
    ? input.depositHistory.map(Number).filter((value) => Number.isFinite(value) && value > 0)
    : [];

  const activeDays = Array.isArray(input.activeDays)
    ? input.activeDays
      .map((day) => String(day))
      .filter((day) => /^\d{4}-\d{2}-\d{2}$/.test(day))
    : [];

  return {
    id,
    name,
    goal,
    hiddenBalance,
    totalDeposits: Number.isFinite(totalDeposits) && totalDeposits >= 0 ? totalDeposits : depositHistory.length,
    depositHistory,
    avgDepositExpected: Number.isFinite(avgDepositExpected) && avgDepositExpected > 0 ? avgDepositExpected : 100,
    createdAt: typeof input.createdAt === "string" ? input.createdAt : new Date().toISOString(),
    updatedAt: typeof input.updatedAt === "string" ? input.updatedAt : new Date().toISOString(),
    challengeMode: Boolean(input.challengeMode),
    activeDays,
    lockedMode: Boolean(input.lockedMode),
    revealRequestAt: typeof input.revealRequestAt === "string" ? input.revealRequestAt : null,
    revealUntil: typeof input.revealUntil === "string" ? input.revealUntil : null,
    lastReflection: typeof input.lastReflection === "string" ? input.lastReflection.slice(0, 2000) : "",
    goalReachedAt: typeof input.goalReachedAt === "string" ? input.goalReachedAt : null,
    celebrateUntil: typeof input.celebrateUntil === "string" ? input.celebrateUntil : null,
  };
}

class ValidationError extends Error {}
