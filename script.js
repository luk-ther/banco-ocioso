const formatBRL = (value) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);

const API_BASE = "/api";
const TOKEN_STORAGE_KEY = "banco_ocioso_auth_token";

const revealNodes = document.querySelectorAll(".reveal");
const rulesCheckbox = document.getElementById("confirmRules");
const createVaultBtn = document.getElementById("createVaultBtn");
const vaultForm = document.getElementById("vaultForm");
const feedback = document.getElementById("formFeedback");
const vaultList = document.getElementById("vaultList");

const authGuest = document.getElementById("authGuest");
const authUser = document.getElementById("authUser");
const authUserName = document.getElementById("authUserName");
const authFeedback = document.getElementById("authFeedback");
const tabLogin = document.getElementById("tabLogin");
const tabRegister = document.getElementById("tabRegister");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const logoutBtn = document.getElementById("logoutBtn");

const vaults = [];
let authToken = localStorage.getItem(TOKEN_STORAGE_KEY) || "";
let currentUser = null;

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  },
  { threshold: 0.2 }
);

revealNodes.forEach((node) => observer.observe(node));
setupShortcutScroll();
setupAuthUI();
setupVaultHandlers();

init();

async function init() {
  if (authToken) {
    try {
      const me = await apiRequest("/auth/me", { method: "GET" });
      currentUser = me.user;
      await loadVaultsFromApi();
    } catch (_) {
      clearSession();
    }
  }

  updateAuthUI();
  renderVaults();
  updateVaultAccessState();
}

function setupAuthUI() {
  tabLogin.addEventListener("click", () => toggleAuthTab("login"));
  tabRegister.addEventListener("click", () => toggleAuthTab("register"));

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    if (!email || !password) {
      setAuthError("Preencha e-mail e senha para entrar.");
      return;
    }

    try {
      const result = await apiRequest("/auth/login", {
        method: "POST",
        body: { email, password },
        auth: false,
      });
      startSession(result.token, result.user);
      setAuthMessage("Login realizado com sucesso.");
      await loadVaultsFromApi();
      renderVaults();
      updateVaultAccessState();
      loginForm.reset();
    } catch (error) {
      setAuthError(error.message);
    }
  });

  registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = document.getElementById("registerName").value.trim();
    const email = document.getElementById("registerEmail").value.trim();
    const password = document.getElementById("registerPassword").value;

    if (!name || !email || !password) {
      setAuthError("Preencha nome, e-mail e senha para criar sua conta.");
      return;
    }

    if (password.length < 6) {
      setAuthError("A senha precisa ter no minimo 6 caracteres.");
      return;
    }

    try {
      const result = await apiRequest("/auth/register", {
        method: "POST",
        body: { name, email, password },
        auth: false,
      });
      startSession(result.token, result.user);
      setAuthMessage("Conta criada com sucesso. Voce ja esta conectado.");
      await loadVaultsFromApi();
      renderVaults();
      updateVaultAccessState();
      registerForm.reset();
    } catch (error) {
      setAuthError(error.message);
    }
  });

  logoutBtn.addEventListener("click", () => {
    clearSession();
    vaults.splice(0, vaults.length);
    renderVaults();
    updateAuthUI();
    updateVaultAccessState();
    feedback.textContent = "";
    feedback.classList.remove("error");
    setAuthMessage("Sessao encerrada.");
  });
}

function setupVaultHandlers() {
  rulesCheckbox.addEventListener("change", () => {
    updateVaultAccessState();
    feedback.classList.remove("error");
    feedback.textContent = rulesCheckbox.checked
      ? "Instrucoes confirmadas. Se estiver conectado, voce ja pode criar seu cofre."
      : "Confirme as instrucoes para liberar a criacao de cofre.";
  });

  vaultForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!currentUser) {
      showError("Entre na sua conta para criar e salvar cofres.");
      return;
    }

    if (!rulesCheckbox.checked) {
      showError("Confirme as instrucoes antes de criar a simulacao.");
      return;
    }

    const name = document.getElementById("vaultName").value.trim();
    const goal = Number(document.getElementById("vaultGoal").value);
    const initialDepositRaw = document.getElementById("vaultDeposit").value;
    const avgDepositExpected = Number(document.getElementById("vaultAvgDeposit").value);
    const initialDeposit = initialDepositRaw ? Number(initialDepositRaw) : 0;
    const challengeMode = document.getElementById("challengeMode").checked;
    const lockedMode = document.getElementById("lockedMode").checked;

    if (!name || !goal || goal <= 0 || initialDeposit < 0 || !avgDepositExpected || avgDepositExpected <= 0) {
      showError("Preencha os campos corretamente para criar o cofre.");
      return;
    }

    const nowIso = new Date().toISOString();
    const today = getDateKey(new Date());
    const hasInitial = initialDeposit > 0;

    const vault = {
      id: crypto.randomUUID(),
      name,
      goal,
      hiddenBalance: initialDeposit,
      totalDeposits: hasInitial ? 1 : 0,
      depositHistory: hasInitial ? [initialDeposit] : [],
      avgDepositExpected,
      createdAt: nowIso,
      updatedAt: nowIso,
      challengeMode,
      activeDays: hasInitial ? [today] : [],
      lockedMode,
      revealRequestAt: null,
      revealUntil: null,
      lastReflection: "",
      goalReachedAt: null,
      celebrateUntil: null,
    };

    handleGoalTransition(vault, 0);

    try {
      const created = await createVaultOnApi(vault);
      vaults.unshift(created);

      vaultForm.reset();
      document.getElementById("challengeMode").checked = true;
      document.getElementById("lockedMode").checked = true;
      updateVaultAccessState();
      feedback.classList.remove("error");
      feedback.textContent = `Cofre "${created.name}" criado com sucesso.`;
      renderVaults();
    } catch (error) {
      showError(error.message);
    }
  });
}

function renderVaults() {
  if (!currentUser) {
    vaultList.innerHTML = "<article class=\"vault-card\"><p class=\"vault-meta\">Entre na sua conta para carregar seus cofres.</p></article>";
    return;
  }

  if (vaults.length === 0) {
    vaultList.innerHTML = "<article class=\"vault-card\"><p class=\"vault-meta\">Nenhum cofre criado ainda. Comece pela primeira meta.</p></article>";
    return;
  }

  const now = Date.now();

  vaultList.innerHTML = vaults
    .map((vault) => {
      const isGoalReached = vault.hiddenBalance >= vault.goal;
      const isCelebrating =
        Boolean(vault.celebrateUntil) &&
        new Date(vault.celebrateUntil).getTime() > now;
      const progress = getProgress(vault.hiddenBalance, vault.goal);
      const blocksDone = Math.max(0, Math.min(10, Math.round(progress / 10)));
      const status = getStatusByProgress(progress);
      const phrase = getMysteryPhrase(progress);
      const depositsLeft = estimateDepositsLeft(vault);
      const challengeMarkup = vault.challengeMode ? buildChallenge(vault) : "";
      const lockedMarkup = vault.lockedMode && !isGoalReached ? buildLockedMode(vault, now) : "";

      return `
      <article class="vault-card ${isGoalReached ? "goal-reached" : ""} ${isCelebrating ? "goal-celebrating" : ""}">
        <div class="vault-head">
          <h3>${escapeHTML(vault.name)}</h3>
          <span class="badge">${isGoalReached ? "Meta batida" : "Saldo oculto"}</span>
        </div>

        <p class="vault-meta">Meta definida: ${formatBRL(vault.goal)} • Registros: ${vault.totalDeposits} • Atualizado em ${new Date(vault.updatedAt).toLocaleDateString("pt-BR")}</p>

        <div class="progress-strip">
          <strong>🔒 Cofre ${progress}% protegido</strong>
          <div class="progress-line"><span style="width:${progress}%"></span></div>
        </div>

        <div class="motivation-grid">
          <div class="motiv-box">
            <span class="motiv-label">Blocos</span>
            <span class="motiv-value">🧱 ${blocksDone} de 10 concluidos</span>
          </div>
          <div class="motiv-box">
            <span class="motiv-label">Status</span>
            <span class="motiv-value">🔥 ${status}</span>
          </div>
          <div class="motiv-box">
            <span class="motiv-label">Foco</span>
            <span class="motiv-value">🪙 ${depositsLeft}</span>
          </div>
          <div class="motiv-box">
            <span class="motiv-label">Reflexao</span>
            <span class="motiv-value">${phrase}</span>
          </div>
        </div>

        <div class="secret">
          <p>
            Valor guardado neste cofre:
            <strong>${isGoalReached ? formatBRL(vault.hiddenBalance) : "R$••••••"}</strong>
          </p>
          ${
            isGoalReached
              ? "<p class=\"goal-unlock\">Meta concluida: valor liberado automaticamente.</p>"
              : ""
          }
        </div>

        ${challengeMarkup}
        ${lockedMarkup}

        <form class="deposit-form" data-id="${vault.id}">
          <input type="number" min="0.01" step="0.01" placeholder="Registrar novo aporte (R$)" required />
          <button class="btn btn-ghost" type="submit">Registrar aporte</button>
        </form>
      </article>
      `;
    })
    .join("");

  attachVaultEvents();
}

function attachVaultEvents() {
  const depositForms = vaultList.querySelectorAll(".deposit-form");
  depositForms.forEach((form) => {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const id = form.dataset.id;
      const value = Number(form.querySelector("input").value);

      if (!value || value <= 0) {
        return;
      }

      const vault = vaults.find((item) => item.id === id);
      if (!vault) {
        return;
      }

      const previousBalance = vault.hiddenBalance;
      vault.hiddenBalance += value;
      vault.totalDeposits += 1;
      vault.depositHistory.push(value);
      vault.updatedAt = new Date().toISOString();
      addActiveDay(vault, getDateKey(new Date()));
      handleGoalTransition(vault, previousBalance);

      try {
        await updateVaultOnApi(vault);
        feedback.classList.remove("error");
        feedback.textContent = `Aporte registrado no cofre "${vault.name}".`;
        renderVaults();
      } catch (error) {
        vault.hiddenBalance = previousBalance;
        vault.totalDeposits -= 1;
        vault.depositHistory.pop();
        showError(error.message);
      }
    });
  });

  const lockForms = vaultList.querySelectorAll(".lock-form");
  lockForms.forEach((form) => {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const id = form.dataset.id;
      const action = form.dataset.action;
      const vault = vaults.find((item) => item.id === id);

      if (!vault) {
        return;
      }

      if (action === "request") {
        vault.revealRequestAt = new Date().toISOString();
        vault.updatedAt = new Date().toISOString();

        try {
          await updateVaultOnApi(vault);
          feedback.classList.remove("error");
          feedback.textContent = `Pedido de visualizacao iniciado para "${vault.name}". Aguarde 24h.`;
          renderVaults();
        } catch (error) {
          showError(error.message);
        }
        return;
      }

      if (action === "unlock") {
        const reflection = (form.querySelector("textarea")?.value || "").trim();
        if (reflection.length < 20) {
          showError("Escreva uma reflexao com pelo menos 20 caracteres para liberar visualizacao.");
          return;
        }

        const readyAt = new Date(vault.revealRequestAt).getTime() + 24 * 60 * 60 * 1000;
        if (Date.now() < readyAt) {
          showError("A visualizacao ainda nao esta liberada. Aguarde completar 24h.");
          return;
        }

        vault.lastReflection = reflection;
        vault.revealUntil = new Date(Date.now() + 15000).toISOString();
        vault.updatedAt = new Date().toISOString();

        try {
          await updateVaultOnApi(vault);
          feedback.classList.remove("error");
          feedback.textContent = `Visualizacao temporaria liberada por 15 segundos para "${vault.name}".`;

          setTimeout(async () => {
            const liveVault = vaults.find((item) => item.id === id);
            if (!liveVault) {
              return;
            }
            liveVault.revealUntil = null;
            liveVault.updatedAt = new Date().toISOString();
            try {
              await updateVaultOnApi(liveVault);
            } catch (_) {
              // no-op
            }
            renderVaults();
          }, 15100);

          renderVaults();
        } catch (error) {
          showError(error.message);
        }
      }
    });
  });
}

function updateVaultAccessState() {
  createVaultBtn.disabled = !rulesCheckbox.checked || !currentUser;
  const fields = vaultForm.querySelectorAll("input, button");
  fields.forEach((field) => {
    if (field.id === "createVaultBtn") {
      return;
    }
    field.disabled = !currentUser;
  });

  if (!currentUser) {
    feedback.classList.remove("error");
    feedback.textContent = "Entre na sua conta para criar e salvar cofres.";
  }
}

function buildChallenge(vault) {
  const days = Math.min(30, vault.activeDays.length);
  const done = Math.round((days / 30) * 100);
  const message = days >= 30 ? "Desafio concluido." : `Faltam ${30 - days} dias para fechar o desafio.`;

  return `
    <div class="challenge">
      <p><strong>Modo Desafio:</strong> ${days}/30 dias com consistencia.</p>
      <div class="progress-line"><span style="width:${done}%"></span></div>
      <p>${message}</p>
    </div>
  `;
}

function buildLockedMode(vault, now) {
  const lockState = getLockState(vault, now);

  if (lockState.type === "none") {
    return `
      <div class="locked-mode">
        <p><strong>Modo Bloqueado:</strong> para ver o valor real, inicie um pedido e aguarde 24h.</p>
        <form class="locked-actions lock-form" data-id="${vault.id}" data-action="request">
          <button type="submit" class="btn btn-ghost">Solicitar visualizacao do saldo</button>
        </form>
      </div>
    `;
  }

  if (lockState.type === "pending") {
    return `
      <div class="locked-mode">
        <p><strong>Modo Bloqueado:</strong> pedido em andamento. Tempo restante: ${lockState.remaining}.</p>
      </div>
    `;
  }

  if (lockState.type === "unlocked") {
    return `
      <div class="locked-mode">
        <p><strong>Modo Bloqueado:</strong> visualizacao temporaria ativa.</p>
        <p class="reveal-balance">Saldo visivel por alguns segundos: ${formatBRL(vault.hiddenBalance)}</p>
      </div>
    `;
  }

  return `
    <div class="locked-mode">
      <p><strong>Modo Bloqueado:</strong> liberado. Reflita antes de visualizar o valor.</p>
      <form class="locked-actions lock-form" data-id="${vault.id}" data-action="unlock">
        <textarea placeholder="Por que voce precisa ver este valor agora e como vai evitar gastar por impulso?" required></textarea>
        <button type="submit" class="btn btn-ghost">Liberar visualizacao por 15s</button>
      </form>
    </div>
  `;
}

function getLockState(vault, now) {
  if (!vault.revealRequestAt) {
    return { type: "none" };
  }

  if (vault.revealUntil && new Date(vault.revealUntil).getTime() > now) {
    return { type: "unlocked" };
  }

  const readyAt = new Date(vault.revealRequestAt).getTime() + 24 * 60 * 60 * 1000;
  if (now < readyAt) {
    return {
      type: "pending",
      remaining: formatDuration(readyAt - now),
    };
  }

  return { type: "ready" };
}

function getProgress(balance, goal) {
  return Math.max(0, Math.min(100, Math.round((balance / goal) * 100)));
}

function getStatusByProgress(progress) {
  if (progress >= 100) {
    return "Meta concluida";
  }
  if (progress >= 75) {
    return "Meta em reta final";
  }
  if (progress >= 40) {
    return "Meta em andamento";
  }
  return "Base da reserva em construcao";
}

function getMysteryPhrase(progress) {
  if (progress >= 100) {
    return "Voce blindou esta meta.";
  }
  if (progress >= 65) {
    return "Voce esta mais perto do que imagina.";
  }
  if (progress >= 30) {
    return "Constancia hoje, tranquilidade amanha.";
  }
  return "Primeiros passos constroem liberdade.";
}

function estimateDepositsLeft(vault) {
  const remaining = Math.max(0, vault.goal - vault.hiddenBalance);
  if (remaining <= 0) {
    return "Meta atingida";
  }

  const avg = vault.depositHistory.length > 0
    ? vault.depositHistory.reduce((sum, value) => sum + value, 0) / vault.depositHistory.length
    : vault.avgDepositExpected;

  if (!avg || avg <= 0) {
    return "Defina um deposito medio";
  }

  const missing = Math.ceil(remaining / avg);
  return `Faltam ${missing} depositos`;
}

function addActiveDay(vault, dateKey) {
  if (!vault.activeDays.includes(dateKey)) {
    vault.activeDays.push(dateKey);
  }
}

function formatDuration(ms) {
  const totalMinutes = Math.max(1, Math.floor(ms / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}min`;
}

function getDateKey(date) {
  return date.toISOString().slice(0, 10);
}

function handleGoalTransition(vault, previousBalance) {
  const crossedGoal = previousBalance < vault.goal && vault.hiddenBalance >= vault.goal;
  if (!crossedGoal) {
    if (!vault.goalReachedAt && vault.hiddenBalance >= vault.goal) {
      vault.goalReachedAt = new Date().toISOString();
    }
    return;
  }

  const now = Date.now();
  vault.goalReachedAt = new Date(now).toISOString();
  vault.celebrateUntil = new Date(now + 6000).toISOString();
  feedback.classList.remove("error");
  feedback.textContent = `Meta batida no cofre "${vault.name}". Valor liberado para visualizacao.`;
  setTimeout(() => {
    renderVaults();
  }, 6100);
}

function setupShortcutScroll() {
  const shortcutLinks = document.querySelectorAll('a[href^="#"]');
  shortcutLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");
      if (!href || href === "#") {
        return;
      }

      const target = document.querySelector(href);
      if (!target) {
        return;
      }

      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      target.classList.remove("section-focus");
      void target.offsetWidth;
      target.classList.add("section-focus");
      setTimeout(() => target.classList.remove("section-focus"), 900);
    });
  });
}

async function loadVaultsFromApi() {
  const result = await apiRequest("/vaults", { method: "GET" });
  vaults.splice(0, vaults.length, ...result.vaults.map(sanitizeVaultFromApi));
}

async function createVaultOnApi(vault) {
  const result = await apiRequest("/vaults", {
    method: "POST",
    body: { vault },
  });
  return sanitizeVaultFromApi(result.vault);
}

async function updateVaultOnApi(vault) {
  const result = await apiRequest(`/vaults/${encodeURIComponent(vault.id)}`, {
    method: "PUT",
    body: { vault },
  });
  return sanitizeVaultFromApi(result.vault);
}

function sanitizeVaultFromApi(input) {
  const nowIso = new Date().toISOString();
  return {
    id: String(input.id || crypto.randomUUID()),
    name: String(input.name || "Cofre"),
    goal: Number(input.goal || 0),
    hiddenBalance: Number(input.hiddenBalance || 0),
    totalDeposits: Number(input.totalDeposits || 0),
    depositHistory: Array.isArray(input.depositHistory) ? input.depositHistory.map(Number).filter((n) => n > 0) : [],
    avgDepositExpected: Number(input.avgDepositExpected || 100),
    createdAt: typeof input.createdAt === "string" ? input.createdAt : nowIso,
    updatedAt: typeof input.updatedAt === "string" ? input.updatedAt : nowIso,
    challengeMode: Boolean(input.challengeMode),
    activeDays: Array.isArray(input.activeDays) ? input.activeDays : [],
    lockedMode: Boolean(input.lockedMode),
    revealRequestAt: typeof input.revealRequestAt === "string" ? input.revealRequestAt : null,
    revealUntil: typeof input.revealUntil === "string" ? input.revealUntil : null,
    lastReflection: typeof input.lastReflection === "string" ? input.lastReflection : "",
    goalReachedAt: typeof input.goalReachedAt === "string" ? input.goalReachedAt : null,
    celebrateUntil: typeof input.celebrateUntil === "string" ? input.celebrateUntil : null,
  };
}

function updateAuthUI() {
  if (currentUser) {
    authGuest.classList.add("hidden");
    authUser.classList.remove("hidden");
    authUserName.textContent = currentUser.name;
  } else {
    authGuest.classList.remove("hidden");
    authUser.classList.add("hidden");
    authUserName.textContent = "";
  }
}

function toggleAuthTab(tab) {
  const isLogin = tab === "login";
  tabLogin.classList.toggle("active", isLogin);
  tabRegister.classList.toggle("active", !isLogin);
  loginForm.classList.toggle("hidden", !isLogin);
  registerForm.classList.toggle("hidden", isLogin);
}

function startSession(token, user) {
  authToken = token;
  currentUser = user;
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
  updateAuthUI();
}

function clearSession() {
  authToken = "";
  currentUser = null;
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  updateAuthUI();
}

function setAuthMessage(message) {
  authFeedback.classList.remove("error");
  authFeedback.textContent = message;
}

function setAuthError(message) {
  authFeedback.classList.add("error");
  authFeedback.textContent = message;
}

function showError(message) {
  feedback.textContent = message;
  feedback.classList.add("error");
}

async function apiRequest(path, options = {}) {
  const {
    method = "GET",
    body,
    auth = true,
  } = options;

  const headers = {
    "Content-Type": "application/json",
  };

  if (auth && authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401) {
      clearSession();
      vaults.splice(0, vaults.length);
      renderVaults();
      updateVaultAccessState();
    }
    throw new Error(data.error || "Erro ao processar sua solicitacao.");
  }

  return data;
}

function escapeHTML(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
