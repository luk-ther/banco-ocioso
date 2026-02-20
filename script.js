const formatBRL = (value) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);

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
const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");
const supportToggle = document.getElementById("supportToggle");
const supportPanel = document.getElementById("supportPanel");
const supportClose = document.getElementById("supportClose");
const supportForm = document.getElementById("supportForm");
const supportFrame = document.getElementById("supportFrame");
const supportToast = document.getElementById("supportToast");

const vaults = [];
let currentUser = null;
let supabaseClient = null;
let supabaseReady = false;

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

revealNodes.forEach((node, index) => {
  node.style.transitionDelay = `${Math.min(index * 80, 320)}ms`;
  observer.observe(node);
});
setupShortcutScroll();
setupMobileMenu();
setupSupportWidget();
setupAuthUI();
setupVaultHandlers();
init();

async function init() {
  supabaseReady = initSupabase();

  if (!supabaseReady) {
    setAuthError("Configure SUPABASE_URL e SUPABASE_ANON_KEY em supabase-config.js.");
    disableAuthForms();
    updateVaultAccessState();
    renderVaults();
    return;
  }

  const { data, error } = await supabaseClient.auth.getSession();
  if (error) {
    setAuthError(error.message);
  }

  currentUser = data?.session?.user || null;
  if (currentUser) {
    await loadVaultsFromDb();
  }

  supabaseClient.auth.onAuthStateChange(async (_event, session) => {
    currentUser = session?.user || null;
    if (currentUser) {
      await loadVaultsFromDb();
    } else {
      vaults.splice(0, vaults.length);
    }
    updateAuthUI();
    updateVaultAccessState();
    renderVaults();
  });

  updateAuthUI();
  updateVaultAccessState();
  renderVaults();
}

function initSupabase() {
  if (!window.supabase || typeof window.supabase.createClient !== "function") {
    return false;
  }

  const url = String(window.SUPABASE_URL || "").trim();
  const key = String(window.SUPABASE_ANON_KEY || "").trim();

  if (!url || !key) {
    return false;
  }

  supabaseClient = window.supabase.createClient(url, key);
  return true;
}

function disableAuthForms() {
  loginForm.querySelectorAll("input, button").forEach((el) => {
    el.disabled = true;
  });
  registerForm.querySelectorAll("input, button").forEach((el) => {
    el.disabled = true;
  });
}

function setupAuthUI() {
  tabLogin.addEventListener("click", () => toggleAuthTab("login"));
  tabRegister.addEventListener("click", () => toggleAuthTab("register"));

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!supabaseReady) {
      setAuthError("Supabase não configurado.");
      return;
    }

    const email = String(document.getElementById("loginEmail").value || "")
      .trim()
      .toLowerCase();
    const password = String(document.getElementById("loginPassword").value || "");

    if (!email || !password) {
      setAuthError("Preencha e-mail e senha para entrar.");
      return;
    }

    const { error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setAuthError(error.message);
      return;
    }

    setAuthMessage("Login realizado com sucesso.");
    loginForm.reset();
  });

  registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!supabaseReady) {
      setAuthError("Supabase não configurado.");
      return;
    }

    const name = String(document.getElementById("registerName").value || "").trim();
    const email = String(document.getElementById("registerEmail").value || "")
      .trim()
      .toLowerCase();
    const password = String(document.getElementById("registerPassword").value || "");

    if (!name || !email || !password) {
      setAuthError("Preencha nome, e-mail e senha para criar sua conta.");
      return;
    }

    if (password.length < 6) {
      setAuthError("A senha precisa ter no mínimo 6 caracteres.");
      return;
    }

    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });

    if (error) {
      setAuthError(error.message);
      return;
    }

    if (data.session) {
      setAuthMessage("Conta criada e login efetuado.");
    } else {
      setAuthMessage("Conta criada. Agora faça login com seu acesso.");
    }

    registerForm.reset();
  });

  logoutBtn.addEventListener("click", async () => {
    if (!supabaseReady) {
      return;
    }

    const { error } = await supabaseClient.auth.signOut();
    if (error) {
      setAuthError(error.message);
      return;
    }

    setAuthMessage("Sessão encerrada.");
    feedback.textContent = "";
    feedback.classList.remove("error");
  });
}

function setupVaultHandlers() {
  rulesCheckbox.addEventListener("change", () => {
    updateVaultAccessState();
    feedback.classList.remove("error");
    feedback.textContent = rulesCheckbox.checked
      ? "Instruções confirmadas. Se estiver conectado, você já pode criar seu cofre."
      : "Confirme as instruções para liberar a criação de cofre.";
  });

  vaultForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!supabaseReady) {
      showError("Supabase não configurado.");
      return;
    }

    if (!currentUser) {
      showError("Entre na sua conta para criar e salvar cofres.");
      return;
    }

    if (!rulesCheckbox.checked) {
      showError("Confirme as instruções antes de criar a simulação.");
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

    const { error } = await upsertVault(vault);
    if (error) {
      showError(error.message);
      return;
    }

    vaults.unshift(vault);
    vaultForm.reset();
    document.getElementById("challengeMode").checked = true;
    document.getElementById("lockedMode").checked = true;
    updateVaultAccessState();
    feedback.classList.remove("error");
    feedback.textContent = `Cofre "${vault.name}" criado com sucesso.`;
    renderVaults();
  });
}

function renderVaults() {
  if (!supabaseReady) {
    vaultList.innerHTML = "<article class=\"vault-card\"><p class=\"vault-meta\">Configure o Supabase para ativar login e cofres.</p></article>";
    return;
  }

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
      const isCelebrating = Boolean(vault.celebrateUntil) && new Date(vault.celebrateUntil).getTime() > now;
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
          <span class="badge">${isGoalReached ? "Meta concluída" : "Saldo oculto"}</span>
        </div>

        <p class="vault-meta">Meta definida: ${formatBRL(vault.goal)} • Registros: ${vault.totalDeposits} • Atualizado em ${new Date(vault.updatedAt).toLocaleDateString("pt-BR")}</p>

        <div class="progress-strip">
          <strong>🔒 Cofre ${progress}% concluído</strong>
          <div class="progress-line"><span style="width:${progress}%"></span></div>
        </div>

        <div class="motivation-grid">
          <div class="motiv-box">
            <span class="motiv-label">Blocos</span>
            <span class="motiv-value">🧱 ${blocksDone} de 10 concluídos</span>
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
            <span class="motiv-label">Reflexão</span>
            <span class="motiv-value">${phrase}</span>
          </div>
        </div>

        <div class="secret">
          <p>
            Valor guardado neste cofre:
            <strong>${isGoalReached ? formatBRL(vault.hiddenBalance) : "R$••••••"}</strong>
          </p>
          ${isGoalReached ? "<p class=\"goal-unlock\">Meta concluída: valor liberado automaticamente.</p>" : ""}
        </div>

        ${challengeMarkup}
        ${lockedMarkup}

        <form class="deposit-form" data-id="${vault.id}">
          <input type="number" min="0.01" step="0.01" placeholder="Registrar novo aporte (R$)" required />
          <button class="btn btn-ghost" type="submit">Registrar aporte</button>
        </form>

        <button class="btn btn-danger delete-vault-btn" type="button" data-id="${vault.id}">
          Excluir meta
        </button>
      </article>
      `;
    })
    .join("");

  attachVaultEvents();
  animateVaultCards();
}

function attachVaultEvents() {
  const deleteButtons = vaultList.querySelectorAll(".delete-vault-btn");
  deleteButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      const id = button.dataset.id;
      const vault = vaults.find((item) => item.id === id);
      if (!vault) {
        return;
      }

      const confirmed = window.confirm(`Deseja excluir a meta "${vault.name}"? Essa ação não pode ser desfeita.`);
      if (!confirmed) {
        return;
      }

      const { error } = await deleteVault(vault.id);
      if (error) {
        showError(error.message);
        return;
      }

      const index = vaults.findIndex((item) => item.id === vault.id);
      if (index >= 0) {
        vaults.splice(index, 1);
      }

      feedback.classList.remove("error");
      feedback.textContent = `Meta "${vault.name}" excluída com sucesso.`;
      renderVaults();
    });
  });

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

      const { error } = await upsertVault(vault);
      if (error) {
        vault.hiddenBalance = previousBalance;
        vault.totalDeposits -= 1;
        vault.depositHistory.pop();
        showError(error.message);
        return;
      }

      feedback.classList.remove("error");
      feedback.textContent = `Aporte registrado no cofre "${vault.name}".`;
      renderVaults();
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

        const { error } = await upsertVault(vault);
        if (error) {
          showError(error.message);
          return;
        }

        feedback.classList.remove("error");
        feedback.textContent = `Pedido de visualização iniciado para "${vault.name}". Aguarde 24h.`;
        renderVaults();
        return;
      }

      if (action === "unlock") {
        const reflection = (form.querySelector("textarea")?.value || "").trim();
        if (reflection.length < 20) {
          showError("Escreva uma reflexão com pelo menos 20 caracteres para liberar visualização.");
          return;
        }

        const readyAt = new Date(vault.revealRequestAt).getTime() + 24 * 60 * 60 * 1000;
        if (Date.now() < readyAt) {
          showError("A visualização ainda não está liberada. Aguarde completar 24h.");
          return;
        }

        vault.lastReflection = reflection;
        vault.revealUntil = new Date(Date.now() + 15000).toISOString();
        vault.updatedAt = new Date().toISOString();

        const unlockSave = await upsertVault(vault);
        if (unlockSave.error) {
          showError(unlockSave.error.message);
          return;
        }

        feedback.classList.remove("error");
        feedback.textContent = `Visualização temporária liberada por 15 segundos para "${vault.name}".`;

        setTimeout(async () => {
          const liveVault = vaults.find((item) => item.id === id);
          if (!liveVault) {
            return;
          }
          liveVault.revealUntil = null;
          liveVault.updatedAt = new Date().toISOString();
          await upsertVault(liveVault);
          renderVaults();
        }, 15100);

        renderVaults();
      }
    });
  });
}

function updateVaultAccessState() {
  createVaultBtn.disabled = !supabaseReady || !rulesCheckbox.checked || !currentUser;
  const fields = vaultForm.querySelectorAll("input, button");
  fields.forEach((field) => {
    if (field.id === "createVaultBtn") {
      return;
    }
    field.disabled = !supabaseReady || !currentUser;
  });

  if (!supabaseReady) {
    feedback.classList.remove("error");
    feedback.textContent = "Configure o Supabase para ativar o salvamento em nuvem.";
    return;
  }

  if (!currentUser) {
    feedback.classList.remove("error");
    feedback.textContent = "Entre na sua conta para criar e salvar cofres.";
  }
}

async function loadVaultsFromDb() {
  vaults.splice(0, vaults.length);

  const { data, error } = await supabaseClient
    .from("vaults")
    .select("id, payload, updated_at")
    .order("updated_at", { ascending: false });

  if (error) {
    showError(error.message);
    return;
  }

  data.forEach((row) => {
    const vault = sanitizeVault(row.payload, row.id);
    if (vault) {
      vaults.push(vault);
    }
  });
}

function sanitizeVault(input, fallbackId = "") {
  if (!input || typeof input !== "object") {
    return null;
  }

  const nowIso = new Date().toISOString();
  const id = String(input.id || fallbackId || "").trim();
  const name = String(input.name || "").trim();
  const goal = Number(input.goal);
  const hiddenBalance = Number(input.hiddenBalance);

  if (!id || !name || !Number.isFinite(goal) || goal <= 0 || !Number.isFinite(hiddenBalance) || hiddenBalance < 0) {
    return null;
  }

  const depositHistory = Array.isArray(input.depositHistory)
    ? input.depositHistory.map(Number).filter((value) => Number.isFinite(value) && value > 0)
    : [];

  const activeDays = Array.isArray(input.activeDays)
    ? input.activeDays.map(String).filter((day) => /^\d{4}-\d{2}-\d{2}$/.test(day))
    : [];

  return {
    id,
    name,
    goal,
    hiddenBalance,
    totalDeposits: Number.isFinite(Number(input.totalDeposits)) ? Number(input.totalDeposits) : depositHistory.length,
    depositHistory,
    avgDepositExpected: Number.isFinite(Number(input.avgDepositExpected)) && Number(input.avgDepositExpected) > 0
      ? Number(input.avgDepositExpected)
      : 100,
    createdAt: typeof input.createdAt === "string" ? input.createdAt : nowIso,
    updatedAt: typeof input.updatedAt === "string" ? input.updatedAt : nowIso,
    challengeMode: Boolean(input.challengeMode),
    activeDays,
    lockedMode: Boolean(input.lockedMode),
    revealRequestAt: typeof input.revealRequestAt === "string" ? input.revealRequestAt : null,
    revealUntil: typeof input.revealUntil === "string" ? input.revealUntil : null,
    lastReflection: typeof input.lastReflection === "string" ? input.lastReflection : "",
    goalReachedAt: typeof input.goalReachedAt === "string" ? input.goalReachedAt : null,
    celebrateUntil: typeof input.celebrateUntil === "string" ? input.celebrateUntil : null,
  };
}

async function upsertVault(vault) {
  const payload = {
    ...vault,
    id: vault.id,
  };

  const { error } = await supabaseClient
    .from("vaults")
    .upsert(
      {
        id: vault.id,
        user_id: currentUser.id,
        payload,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "id",
      }
    );

  return { error };
}

async function deleteVault(vaultId) {
  const { error } = await supabaseClient
    .from("vaults")
    .delete()
    .eq("id", vaultId);

  return { error };
}

function buildChallenge(vault) {
  const days = Math.min(30, vault.activeDays.length);
  const done = Math.round((days / 30) * 100);
  const message = days >= 30 ? "Desafio concluído." : `Faltam ${30 - days} dias para fechar o desafio.`;

  return `
    <div class="challenge">
      <p><strong>Modo Desafio:</strong> ${days}/30 dias com consistência.</p>
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
          <button type="submit" class="btn btn-ghost">Solicitar visualização do saldo</button>
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
        <p><strong>Modo Bloqueado:</strong> visualização temporária ativa.</p>
        <p class="reveal-balance">Saldo visivel por alguns segundos: ${formatBRL(vault.hiddenBalance)}</p>
      </div>
    `;
  }

  return `
    <div class="locked-mode">
      <p><strong>Modo Bloqueado:</strong> liberado. Reflita antes de visualizar o valor.</p>
      <form class="locked-actions lock-form" data-id="${vault.id}" data-action="unlock">
        <textarea placeholder="Por que você precisa ver este valor agora e como vai evitar gastar por impulso?" required></textarea>
        <button type="submit" class="btn btn-ghost">Liberar visualização por 15s</button>
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
    return "Meta concluída";
  }
  if (progress >= 75) {
    return "Meta em reta final";
  }
  if (progress >= 40) {
    return "Meta em andamento";
  }
  return "Base da reserva em construção";
}

function getMysteryPhrase(progress) {
  if (progress >= 100) {
    return "Você blindou esta meta.";
  }
  if (progress >= 65) {
    return "Você está mais perto do que imagina.";
  }
  if (progress >= 30) {
    return "Constância hoje, tranquilidade amanhã.";
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
    return "Defina um depósito médio";
  }

  const missing = Math.ceil(remaining / avg);
  return `Faltam ${missing} depósitos`;
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
  feedback.textContent = `Meta batida no cofre "${vault.name}". Valor liberado para visualização.`;
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
      closeMobileMenu();
    });
  });
}

function setupMobileMenu() {
  if (!menuToggle || !mainNav) {
    return;
  }

  menuToggle.addEventListener("click", () => {
    const isOpen = mainNav.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 960) {
      closeMobileMenu();
    }
  });
}

function closeMobileMenu() {
  if (!menuToggle || !mainNav) {
    return;
  }
  mainNav.classList.remove("is-open");
  menuToggle.setAttribute("aria-expanded", "false");
}

function animateVaultCards() {
  const cards = vaultList.querySelectorAll(".vault-card");
  cards.forEach((card, index) => {
    card.classList.remove("card-enter");
    card.style.animationDelay = `${Math.min(index * 70, 280)}ms`;
    void card.offsetWidth;
    card.classList.add("card-enter");
  });
}

function setupSupportWidget() {
  if (!supportToggle || !supportPanel || !supportClose) {
    return;
  }

  let supportSubmitPending = false;
  let supportToastTimer = null;

  supportToggle.addEventListener("click", () => {
    const isOpen = supportPanel.classList.toggle("is-open");
    supportPanel.setAttribute("aria-hidden", String(!isOpen));
    supportToggle.setAttribute("aria-expanded", String(isOpen));
    supportToggle.classList.toggle("is-active", isOpen);
  });

  supportClose.addEventListener("click", () => {
    closeSupportWidget();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeSupportWidget();
    }
  });

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Node)) {
      return;
    }
    if (!supportPanel.classList.contains("is-open")) {
      return;
    }
    if (!supportPanel.contains(target) && !supportToggle.contains(target)) {
      closeSupportWidget();
    }
  });

  if (supportForm && supportFrame && supportToast) {
    supportForm.addEventListener("submit", () => {
      supportSubmitPending = true;
    });

    supportFrame.addEventListener("load", () => {
      if (!supportSubmitPending) {
        return;
      }

      supportSubmitPending = false;
      supportForm.reset();
      closeSupportWidget();
      supportToast.classList.remove("hidden");

      if (supportToastTimer) {
        clearTimeout(supportToastTimer);
      }

      supportToastTimer = setTimeout(() => {
        supportToast.classList.add("hidden");
      }, 4200);
    });
  }
}

function closeSupportWidget() {
  if (!supportToggle || !supportPanel) {
    return;
  }
  supportPanel.classList.remove("is-open");
  supportPanel.setAttribute("aria-hidden", "true");
  supportToggle.setAttribute("aria-expanded", "false");
  supportToggle.classList.remove("is-active");
}

function updateAuthUI() {
  if (currentUser) {
    authGuest.classList.add("hidden");
    authUser.classList.remove("hidden");
    authUserName.textContent = currentUser.user_metadata?.name || currentUser.email || "Usuário";
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

function escapeHTML(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
