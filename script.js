const formatBRL = (value) => {
  const safeValue = Number.isFinite(Number(value)) ? Number(value) : 0;
  const absolute = Math.abs(safeValue);
  const fixed = absolute.toFixed(2);
  const [intPart, decimalPart] = fixed.split(".");
  const withThousands = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const prefix = safeValue < 0 ? "-$ " : "$ ";
  return `${prefix}${withThousands},${decimalPart}`;
};

const ONBOARDING_STORAGE_KEY = "bo_onboarding_seen_v1";
const ONBOARDING_PAGE = "onboarding.html";
const LOGIN_PAGE = "login.html";
const AUTH_REQUIRED_PAGES = new Set([
  "index.html",
  "chats.html",
  "notificacoes.html",
  "perfil.html",
  "personalizacao.html",
  "ranking.html",
  "perfil-publico.html",
]);
const PROFILE_THEME_KEYS = [
  "neon",
  "ocean",
  "sunset",
  "graphite",
  "aurora",
  "midnight",
  "ember",
  "forest",
  "royal",
  "ruby",
  "ice",
  "sand",
  "violet",
  "carbon",
];
const PROFILE_DECORATION_KEYS = [
  "glow",
  "ring",
  "spark",
  "pulse",
  "grid",
  "stars",
  "stripes",
  "dots",
];
const PROFILE_THEME_LABELS = {
  neon: "Neon",
  ocean: "Ocean",
  sunset: "Sunset",
  graphite: "Graphite",
  aurora: "Aurora",
  midnight: "Midnight",
  ember: "Ember",
  forest: "Forest",
  royal: "Royal",
  ruby: "Ruby",
  ice: "Ice",
  sand: "Sand",
  violet: "Violet",
  carbon: "Carbon",
};

const revealNodes = document.querySelectorAll(".reveal");
const rulesCheckbox = document.getElementById("confirmRules");
const createVaultBtn = document.getElementById("createVaultBtn");
const vaultForm = document.getElementById("vaultForm");
const feedback = document.getElementById("formFeedback");
const activeVaultList = document.getElementById("activeVaultList");
const achievementVaultList = document.getElementById("achievementVaultList");
const vaultGroupActive = document.getElementById("vaultGroupActive");
const vaultGroupAchievements = document.getElementById("vaultGroupAchievements");
const toggleActiveVaultsBtn = document.getElementById("toggleActiveVaults");
const toggleAchievementVaultsBtn = document.getElementById("toggleAchievementVaults");
const vaultDashTotal = document.getElementById("vaultDashTotal");
const vaultDashActive = document.getElementById("vaultDashActive");
const vaultDashCompleted = document.getElementById("vaultDashCompleted");
const vaultDashProgress = document.getElementById("vaultDashProgress");
const vaultDashProgressBar = document.getElementById("vaultDashProgressBar");
const vaultDashBest = document.getElementById("vaultDashBest");

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
const authToggle = document.getElementById("authToggle");
const authPanel = document.getElementById("authPanel");
const authClose = document.getElementById("authClose");
const bottomNotifyBtn = document.getElementById("bottomNotifyBtn");
const bottomAuthToggle = document.getElementById("bottomAuthToggle");
const bottomAuthLabel = document.getElementById("bottomAuthLabel");
const inboxPageRoot = document.getElementById("inboxPageRoot");
const inboxThreadList = document.getElementById("inboxThreadList");
const inboxFeedback = document.getElementById("inboxFeedback");
const inboxActiveName = document.getElementById("inboxActiveName");
const inboxActiveMeta = document.getElementById("inboxActiveMeta");
const inboxMessages = document.getElementById("inboxMessages");
const inboxMessageForm = document.getElementById("inboxMessageForm");
const inboxMessageInput = document.getElementById("inboxMessageInput");
const inboxComposerFeedback = document.getElementById("inboxComposerFeedback");
const notificationsRoot = document.getElementById("notificationsRoot");
const notificationsList = document.getElementById("notificationsList");
const notificationsFeedback = document.getElementById("notificationsFeedback");
const deviceNotifyStatus = document.getElementById("deviceNotifyStatus");
const deviceNotifyEnableBtn = document.getElementById("deviceNotifyEnableBtn");
const profileHubRoot = document.getElementById("profileHubRoot");
const profileHubGuest = document.getElementById("profileHubGuest");
const profileHubUser = document.getElementById("profileHubUser");
const profileHubOpenLogin = document.getElementById("profileHubOpenLogin");
const profileHubDisplayName = document.getElementById("profileHubDisplayName");
const profileForm = document.getElementById("profileForm");
const profileDisplayNameInput = document.getElementById("profileDisplayName");
const profileThemeSelect = document.getElementById("profileTheme");
const profileAccentColorInput = document.getElementById("profileAccentColor");
const profileNameFontSelect = document.getElementById("profileNameFont");
const profileDecorationSelect = document.getElementById("profileDecoration");
const profileBioInput = document.getElementById("profileBio");
const profileAvatarFileInput = document.getElementById("profileAvatarFile");
const profileRemoveAvatarBtn = document.getElementById("profileRemoveAvatarBtn");
const profileBannerFileInput = document.getElementById("profileBannerFile");
const profileRemoveBannerBtn = document.getElementById("profileRemoveBannerBtn");
const profileFeedback = document.getElementById("profileFeedback");
const profilePreviewCard = document.getElementById("profilePreviewCard");
const profilePreviewAvatar = document.getElementById("profilePreviewAvatar");
const profilePreviewName = document.getElementById("profilePreviewName");
const profilePreviewTagline = document.getElementById("profilePreviewTagline");
const profilePreviewMeta = document.getElementById("profilePreviewMeta");
const rankingList = document.getElementById("rankingList");
const rankingFeedback = document.getElementById("rankingFeedback");
const rankingProfileSheet = document.getElementById("rankingProfileSheet");
const rankingProfileClose = document.getElementById("rankingProfileClose");
const rankingProfileAvatar = document.getElementById("rankingProfileAvatar");
const rankingProfileName = document.getElementById("rankingProfileName");
const rankingProfileTheme = document.getElementById("rankingProfileTheme");
const rankingProfileGoals = document.getElementById("rankingProfileGoals");
const rankingProfileBio = document.getElementById("rankingProfileBio");
const rankingProfileCreated = document.getElementById("rankingProfileCreated");
const rankingProfileUpdated = document.getElementById("rankingProfileUpdated");
const publicProfileRoot = document.getElementById("publicProfileRoot");
const publicProfileHeaderCopy = document.getElementById("publicProfileHeaderCopy");
const publicProfileCard = document.getElementById("publicProfileCard");
const publicProfileAvatar = document.getElementById("publicProfileAvatar");
const publicProfileName = document.getElementById("publicProfileName");
const publicProfileTagline = document.getElementById("publicProfileTagline");
const publicProfileMeta = document.getElementById("publicProfileMeta");
const publicFollowersCount = document.getElementById("publicFollowersCount");
const publicFollowingCount = document.getElementById("publicFollowingCount");
const publicFriendsCount = document.getElementById("publicFriendsCount");
const publicGoalsCount = document.getElementById("publicGoalsCount");
const publicProfileActions = document.getElementById("publicProfileActions");
const followUserBtn = document.getElementById("followUserBtn");
const friendActionBtn = document.getElementById("friendActionBtn");
const publicProfileFeedback = document.getElementById("publicProfileFeedback");
const publicAchievementsList = document.getElementById("publicAchievementsList");
const publicChatPanel = document.getElementById("publicChatPanel");
const publicChatStatus = document.getElementById("publicChatStatus");
const publicChatMessages = document.getElementById("publicChatMessages");
const publicChatForm = document.getElementById("publicChatForm");
const publicChatInput = document.getElementById("publicChatInput");
const publicChatFeedback = document.getElementById("publicChatFeedback");

const vaults = [];
let currentUser = null;
let supabaseClient = null;
let supabaseReady = false;
let authToggleFixedWidth = "";
let currentProfile = null;
let profileAvatarDraftUrl = "";
let profileBannerDraftUrl = "";
let rankingCache = [];
let publicProfileTargetId = "";
let publicProfileTargetData = null;
let socialRelationState = {
  isFollowing: false,
  friendshipId: "",
  friendRequestOutgoingId: "",
  friendRequestIncomingId: "",
};
let publicChatPollTimer = null;
let bottomNoticeTimer = null;
let bottomNoticeNode = null;
let inboxActiveUserId = "";
let inboxThreadsCache = [];
let inboxPollTimer = null;
let notificationServiceWorkerRegistration = null;
let knownIncomingMessageIds = new Set();
let knownPendingRequestIds = new Set();
let messageNotificationPrimed = false;
let requestNotificationPrimed = false;
let deviceNotificationPollTimer = null;

const DEVICE_NOTIFY_PREF_KEY = "bo_device_notifications_enabled";
const INTERACTION_TARGET_SELECTOR = [
  "button",
  ".btn",
  ".app-nav-item",
  ".auth-toggle",
  ".menu-toggle",
  ".vault-group-toggle",
  ".inbox-thread",
  ".ranking-item",
  ".notification-item",
  ".vault-card",
  ".vault-stat-card",
  ".feature-card",
  ".pillar-card",
  ".onboarding-dot",
  ".auth-close",
  ".ranking-profile-close",
  "a[href]",
  "input[type='checkbox']",
  "input[type='radio']",
].join(",");

let feedbackMotionObserver = null;
let interactionInsertObserver = null;

function getCurrentPageName() {
  return (window.location.pathname.split("/").pop() || "index.html").toLowerCase();
}

function hasSeenOnboarding() {
  try {
    return localStorage.getItem(ONBOARDING_STORAGE_KEY) === "1";
  } catch (_error) {
    return true;
  }
}

function sanitizeNextPath(rawPath) {
  const raw = String(rawPath || "").trim();
  if (!raw) {
    return "";
  }

  if (raw.includes("://") || raw.startsWith("//")) {
    return "";
  }

  const normalized = raw.replace(/^\//, "");
  if (!/^[a-z0-9._\-\/?#=&%]+$/i.test(normalized)) {
    return "";
  }

  const page = normalized.split("?")[0].split("#")[0].toLowerCase();
  if (!page.endsWith(".html")) {
    return "";
  }

  return normalized;
}

function getNextDestinationFromQuery() {
  const params = new URLSearchParams(window.location.search);
  const rawNext = params.get("next");
  const safeNext = sanitizeNextPath(rawNext);
  if (!safeNext) {
    return "index.html";
  }

  const nextPage = safeNext.split("?")[0].split("#")[0].toLowerCase();
  if (nextPage === LOGIN_PAGE || nextPage === ONBOARDING_PAGE) {
    return "index.html";
  }
  return safeNext;
}

function redirectToLoginPage() {
  const currentPath = window.location.pathname.split("/").pop() || "index.html";
  const fullNext = `${currentPath}${window.location.search || ""}${window.location.hash || ""}`;
  const encoded = encodeURIComponent(fullNext);
  window.location.replace(`${LOGIN_PAGE}?next=${encoded}`);
}

function redirectAfterAuth() {
  if (!hasSeenOnboarding()) {
    const destination = getNextDestinationFromQuery();
    const encoded = encodeURIComponent(destination);
    window.location.replace(`${ONBOARDING_PAGE}?next=${encoded}`);
    return;
  }
  window.location.replace(getNextDestinationFromQuery());
}

function redirectToOnboardingWithCurrentDestination() {
  const currentPath = window.location.pathname.split("/").pop() || "index.html";
  const fullNext = `${currentPath}${window.location.search || ""}${window.location.hash || ""}`;
  const encoded = encodeURIComponent(fullNext);
  window.location.replace(`${ONBOARDING_PAGE}?next=${encoded}`);
}

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
setupAuthWidget();
setupBottomNav();
setupInboxUI();
setupNotificationsUI();
setupProfileHubUI();
setupAuthUI();
setupProfileUI();
setupRankingInteractions();
setupPublicProfileUI();
setupVaultHandlers();
setupMoneyInputs();
setupVaultGroupToggles();
setupInteractionAnimations();
void setupDeviceNotifications();
init();

async function init() {
  const currentPage = getCurrentPageName();
  supabaseReady = initSupabase();

  if (!supabaseReady) {
    stopDeviceNotificationPolling();
    resetDeviceNotificationCaches();
    setAuthError("Configure SUPABASE_URL e SUPABASE_ANON_KEY em supabase-config.js.");
    disableAuthForms();
    resetProfileUI();
    updateVaultAccessState();
    renderVaults();
    renderRanking([]);
    resetPublicProfileUI("Faça login e execute o SQL social para usar perfis públicos completos.");
    resetInboxUI("Configure o Supabase para usar chats.");
    resetNotificationsUI("Configure o Supabase para usar notificações.");
    updateProfileHubUI();
    return;
  }

  const { data, error } = await supabaseClient.auth.getSession();
  if (error) {
    setAuthError(getFriendlyAuthError(error));
  }

  currentUser = data?.session?.user || null;

  if (currentPage === LOGIN_PAGE) {
    if (currentUser) {
      redirectAfterAuth();
      return;
    }
    resetProfileUI();
    updateAuthUI();
    updateProfileHubUI();
    return;
  }

  if (AUTH_REQUIRED_PAGES.has(currentPage)) {
    if (!currentUser) {
      redirectToLoginPage();
      return;
    }
    if (!hasSeenOnboarding()) {
      redirectToOnboardingWithCurrentDestination();
      return;
    }
  }

  if (!currentUser) {
    resetDeviceNotificationCaches();
    stopDeviceNotificationPolling();
  }

  if (currentUser) {
    await loadVaultsFromDb();
    await loadUserProfile();
  } else {
    resetProfileUI();
  }
  await loadGlobalRanking();
  await loadPublicProfilePageData();
  await loadInboxPageData();
  await loadNotificationsPageData();
  if (currentUser) {
    await pollDeviceNotificationsOnce();
    startDeviceNotificationPolling();
  }
  updateProfileHubUI();

  supabaseClient.auth.onAuthStateChange(async (_event, session) => {
    const activePage = getCurrentPageName();
    currentUser = session?.user || null;

    if (activePage === LOGIN_PAGE) {
      if (currentUser) {
        redirectAfterAuth();
      }
      return;
    }

    if (AUTH_REQUIRED_PAGES.has(activePage)) {
      if (!currentUser) {
        redirectToLoginPage();
        return;
      }
      if (!hasSeenOnboarding()) {
        redirectToOnboardingWithCurrentDestination();
        return;
      }
    }

    if (!currentUser) {
      resetDeviceNotificationCaches();
      stopDeviceNotificationPolling();
    }

    if (currentUser) {
      await loadVaultsFromDb();
      await loadUserProfile();
    } else {
      vaults.splice(0, vaults.length);
      currentProfile = null;
      resetProfileUI();
    }
    await loadGlobalRanking();
    await loadPublicProfilePageData();
    await loadInboxPageData();
    await loadNotificationsPageData();
    if (currentUser) {
      await pollDeviceNotificationsOnce();
      startDeviceNotificationPolling();
    }
    updateAuthUI();
    updateProfileHubUI();
    updateVaultAccessState();
    renderVaults();
  });

  updateAuthUI();
  updateProfileHubUI();
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
  if (!loginForm || !registerForm) {
    return;
  }
  loginForm.querySelectorAll("input, button").forEach((el) => {
    el.disabled = true;
  });
  registerForm.querySelectorAll("input, button").forEach((el) => {
    el.disabled = true;
  });
}

function setupAuthUI() {
  if (!tabLogin || !tabRegister || !loginForm || !registerForm || !logoutBtn) {
    return;
  }

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

    try {
      const { error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setAuthError(getFriendlyAuthError(error));
        return;
      }

      setAuthMessage("Login realizado com sucesso.");
      loginForm.reset();
      if (getCurrentPageName() === LOGIN_PAGE) {
        redirectAfterAuth();
      }
    } catch (error) {
      setAuthError(getFriendlyAuthError(error));
    }
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

    try {
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
        setAuthError(getFriendlyAuthError(error));
        return;
      }
      const existingUserDetected = Boolean(
        data?.user &&
          Array.isArray(data.user.identities) &&
          data.user.identities.length === 0
      );

      if (existingUserDetected) {
        setAuthError("Ja existe uma conta com este e-mail. Tente entrar ou recuperar a senha.");
        return;
      }

      if (!data?.user) {
        setAuthError("Não foi possível criar sua conta agora. Tente novamente em instantes.");
        return;
      }
      if (data.session) {
        setAuthMessage("Conta criada e login efetuado.");
        if (getCurrentPageName() === LOGIN_PAGE) {
          redirectAfterAuth();
        }
      } else {
        setAuthMessage("Conta criada. Verifique seu e-mail e confirme a conta antes de entrar.");
      }

      registerForm.reset();
    } catch (error) {
      setAuthError(getFriendlyAuthError(error));
    }
  });

  logoutBtn.addEventListener("click", async () => {
    if (!supabaseReady) {
      return;
    }

    const { error } = await supabaseClient.auth.signOut();
    if (error) {
      setAuthError(getFriendlyAuthError(error));
      return;
    }

    setAuthMessage("Sessão encerrada.");
    if (feedback) {
      feedback.textContent = "";
      feedback.classList.remove("error");
    }
  });
}

function setupProfileUI() {
  if (!profileForm) {
    return;
  }

  const previewFields = [
    profileDisplayNameInput,
    profileThemeSelect,
    profileAccentColorInput,
    profileNameFontSelect,
    profileDecorationSelect,
    profileBioInput,
  ].filter(Boolean);

  previewFields.forEach((field) => {
    field.addEventListener("input", () => {
      if (!currentUser) {
        return;
      }
      const draft = collectProfileDraft(currentUser, currentProfile || getDefaultProfile(currentUser));
      applyProfileAppearance(draft);
      updateProfilePreview(draft);
    });
    field.addEventListener("change", () => {
      if (!currentUser) {
        return;
      }
      const draft = collectProfileDraft(currentUser, currentProfile || getDefaultProfile(currentUser));
      applyProfileAppearance(draft);
      updateProfilePreview(draft);
    });
  });

  if (profileAvatarFileInput) {
    profileAvatarFileInput.addEventListener("change", async () => {
      if (!currentUser) {
        setProfileError("Entre na sua conta para anexar foto de perfil.");
        profileAvatarFileInput.value = "";
        return;
      }

      const file = profileAvatarFileInput.files?.[0];
      if (!file) {
        return;
      }

      try {
        profileAvatarDraftUrl = await buildAvatarDataUrl(file);
        const draft = collectProfileDraft(currentUser, currentProfile || getDefaultProfile(currentUser));
        applyProfileAppearance(draft);
        updateProfilePreview(draft);
        setProfileMessage("Foto carregada. Clique em \"Salvar perfil\" para publicar.");
      } catch (error) {
        setProfileError(String(error?.message || "Não foi possível processar a foto."));
      } finally {
        profileAvatarFileInput.value = "";
      }
    });
  }

  if (profileBannerFileInput) {
    profileBannerFileInput.addEventListener("change", async () => {
      if (!currentUser) {
        setProfileError("Entre na sua conta para anexar banner.");
        profileBannerFileInput.value = "";
        return;
      }

      const file = profileBannerFileInput.files?.[0];
      if (!file) {
        return;
      }

      try {
        profileBannerDraftUrl = await buildBannerDataUrl(file);
        const draft = collectProfileDraft(currentUser, currentProfile || getDefaultProfile(currentUser));
        applyProfileAppearance(draft);
        updateProfilePreview(draft);
        setProfileMessage("Banner carregado. Clique em \"Salvar perfil\" para publicar.");
      } catch (error) {
        setProfileError(String(error?.message || "Não foi possível processar o banner."));
      } finally {
        profileBannerFileInput.value = "";
      }
    });
  }

  if (profileRemoveAvatarBtn) {
    profileRemoveAvatarBtn.addEventListener("click", () => {
      if (!currentUser) {
        setProfileError("Entre na sua conta para editar foto de perfil.");
        return;
      }
      profileAvatarDraftUrl = "";
      const draft = collectProfileDraft(currentUser, currentProfile || getDefaultProfile(currentUser));
      applyProfileAppearance(draft);
      updateProfilePreview(draft);
      setProfileMessage("Foto removida do rascunho. Salve o perfil para confirmar.");
    });
  }

  if (profileRemoveBannerBtn) {
    profileRemoveBannerBtn.addEventListener("click", () => {
      if (!currentUser) {
        setProfileError("Entre na sua conta para editar o banner.");
        return;
      }
      profileBannerDraftUrl = "";
      const draft = collectProfileDraft(currentUser, currentProfile || getDefaultProfile(currentUser));
      applyProfileAppearance(draft);
      updateProfilePreview(draft);
      setProfileMessage("Banner removido do rascunho. Salve o perfil para confirmar.");
    });
  }

  profileForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!supabaseReady) {
      setProfileError("Supabase não configurado.");
      return;
    }

    if (!currentUser) {
      setProfileError("Entre na sua conta para editar o perfil.");
      return;
    }

    const draft = collectProfileDraft(currentUser, currentProfile || getDefaultProfile(currentUser));
    const payload = {
      user_id: currentUser.id,
      display_name: draft.display_name,
      theme_key: draft.theme_key,
      accent_color: draft.accent_color,
      name_font: draft.name_font,
      decoration: draft.decoration,
      bio: draft.bio,
      avatar_url: draft.avatar_url,
      banner_url: draft.banner_url,
      goals_completed: countCompletedGoals(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseClient
      .from("user_profiles")
      .upsert(payload, { onConflict: "user_id" })
      .select("*")
      .single();

    if (error) {
      setProfileError(getFriendlyProfileError(error));
      return;
    }

    currentProfile = normalizeProfile(data, currentUser);
    profileAvatarDraftUrl = currentProfile.avatar_url;
    profileBannerDraftUrl = currentProfile.banner_url;
    hydrateProfileForm(currentProfile);
    applyProfileAppearance(currentProfile);
    updateProfilePreview(currentProfile);
    updateAuthUI();
    setProfileMessage("Perfil atualizado com sucesso.");
    await loadGlobalRanking();
  });
}

function setProfileFormDisabled(disabled) {
  if (!profileForm) {
    return;
  }
  profileForm.querySelectorAll("input, select, textarea, button").forEach((el) => {
    el.disabled = disabled;
  });
}

function setProfileMessage(message) {
  if (!profileFeedback) {
    return;
  }
  profileFeedback.classList.remove("error");
  profileFeedback.textContent = message;
}

function setProfileError(message) {
  if (!profileFeedback) {
    return;
  }
  profileFeedback.classList.add("error");
  profileFeedback.textContent = message;
}

function getFriendlyProfileError(error) {
  const raw = String(error?.message || "").trim();
  if (!raw) {
    return "Não foi possível salvar o perfil agora. Tente novamente.";
  }
  if (raw.toLowerCase().includes("relation") || raw.toLowerCase().includes("user_profiles")) {
    return "Tabela de perfil não encontrada. Execute o SQL atualizado no Supabase.";
  }
  return raw;
}

function getFriendlySocialError(error, fallbackMessage) {
  const raw = String(error?.message || "").trim();
  if (!raw) {
    return fallbackMessage;
  }

  const lowered = raw.toLowerCase();
  if (lowered.includes("relation") || lowered.includes("social_")) {
    return "Recurso social não encontrado no banco. Execute o SQL atualizado no Supabase.";
  }
  if (lowered.includes("row-level security")) {
    return "Permissão negada pelo banco. Verifique as políticas RLS do SQL atualizado.";
  }

  return raw;
}

function getDefaultProfile(user) {
  return {
    user_id: user?.id || "",
    display_name: getUserDisplayName(user),
    theme_key: "neon",
    accent_color: "#0ce0ff",
    name_font: "sora",
    decoration: "glow",
    bio: "Blindagem financeira personalizada.",
    avatar_url: "",
    banner_url: "",
    goals_completed: 0,
    created_at: typeof user?.created_at === "string" ? user.created_at : new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

function normalizeProfile(input, user = currentUser) {
  const safe = input && typeof input === "object" ? input : {};
  const fallback = getDefaultProfile(user);
  const theme = PROFILE_THEME_KEYS.includes(String(safe.theme_key || "").toLowerCase())
    ? String(safe.theme_key).toLowerCase()
    : fallback.theme_key;
  const nameFont = ["sora", "manrope", "space", "poppins"].includes(String(safe.name_font || "").toLowerCase())
    ? String(safe.name_font).toLowerCase()
    : fallback.name_font;
  const decoration = PROFILE_DECORATION_KEYS.includes(String(safe.decoration || "").toLowerCase())
    ? String(safe.decoration).toLowerCase()
    : fallback.decoration;
  const accent = isValidHexColor(safe.accent_color) ? String(safe.accent_color).toLowerCase() : fallback.accent_color;
  const displayName = String(safe.display_name || fallback.display_name).trim().slice(0, 32) || fallback.display_name;
  const bio = sanitizeProfileBio(safe.bio ?? fallback.bio ?? "");
  const avatarUrl = sanitizeAvatarUrl(safe.avatar_url || fallback.avatar_url || "");
  const bannerUrl = sanitizeBannerUrl(safe.banner_url || fallback.banner_url || "");
  const goalsCompleted = Number.isFinite(Number(safe.goals_completed)) && Number(safe.goals_completed) >= 0
    ? Math.floor(Number(safe.goals_completed))
    : 0;

  return {
    user_id: String(safe.user_id || fallback.user_id || ""),
    display_name: displayName,
    theme_key: theme,
    accent_color: accent,
    name_font: nameFont,
    decoration,
    bio,
    avatar_url: avatarUrl,
    banner_url: bannerUrl,
    goals_completed: goalsCompleted,
    created_at: typeof safe.created_at === "string" ? safe.created_at : fallback.created_at,
    updated_at: typeof safe.updated_at === "string" ? safe.updated_at : new Date().toISOString(),
  };
}

function isValidHexColor(value) {
  return typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value.trim());
}

function sanitizeAvatarUrl(value) {
  const raw = String(value || "").trim();
  if (!raw) {
    return "";
  }
  if (raw.startsWith("data:image/")) {
    return raw.length <= 360000 ? raw : "";
  }
  if (/^https?:\/\//i.test(raw)) {
    return raw.length <= 1000 ? raw : "";
  }
  return "";
}

function sanitizeBannerUrl(value) {
  const raw = String(value || "").trim();
  if (!raw) {
    return "";
  }
  if (raw.startsWith("data:image/")) {
    return raw.length <= 560000 ? raw : "";
  }
  if (/^https?:\/\//i.test(raw)) {
    return raw.length <= 1400 ? raw : "";
  }
  return "";
}

function sanitizeProfileBio(value) {
  const fallback = "Blindagem financeira personalizada.";
  const normalized = String(value || "")
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, 180);
  return normalized || fallback;
}

function getAvatarInitials(name) {
  const words = String(name || "").trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return "BO";
  }
  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }
  return `${words[0][0] || ""}${words[1][0] || ""}`.toUpperCase();
}

function buildAvatarPlaceholder(name, accentColor = "#0ce0ff") {
  const safeAccent = isValidHexColor(accentColor) ? accentColor : "#0ce0ff";
  const initials = getAvatarInitials(name);
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" viewBox="0 0 320 320">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${safeAccent}" />
      <stop offset="100%" stop-color="#111a2b" />
    </linearGradient>
  </defs>
  <rect width="320" height="320" fill="url(#bg)" />
  <circle cx="88" cy="72" r="82" fill="rgba(255,255,255,0.12)" />
  <text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle"
    font-family="Sora, sans-serif" font-size="116" font-weight="800" fill="#ffffff">${initials}</text>
</svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function getAvatarSrc(profile) {
  const safe = normalizeProfile(profile, currentUser);
  return safe.avatar_url || buildAvatarPlaceholder(safe.display_name, safe.accent_color);
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Falha ao ler o arquivo de imagem."));
    reader.readAsDataURL(file);
  });
}

function loadImage(dataUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Formato de imagem inválido."));
    img.src = dataUrl;
  });
}

async function buildAvatarDataUrl(file) {
  const maxFileBytes = 8 * 1024 * 1024;
  if (!file || !String(file.type || "").startsWith("image/")) {
    throw new Error("Selecione uma imagem válida (PNG, JPG ou WEBP).");
  }
  if (file.size > maxFileBytes) {
    throw new Error("Imagem muito grande. O limite é 8 MB.");
  }

  const rawDataUrl = await readFileAsDataUrl(file);
  const img = await loadImage(rawDataUrl);
  const minSide = Math.min(img.naturalWidth || img.width, img.naturalHeight || img.height);
  const sourceX = Math.max(0, Math.floor(((img.naturalWidth || img.width) - minSide) / 2));
  const sourceY = Math.max(0, Math.floor(((img.naturalHeight || img.height) - minSide) / 2));

  const canvas = document.createElement("canvas");
  const targetSize = 320;
  canvas.width = targetSize;
  canvas.height = targetSize;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Não foi possível processar a imagem.");
  }
  ctx.drawImage(img, sourceX, sourceY, minSide, minSide, 0, 0, targetSize, targetSize);

  let quality = 0.88;
  let output = canvas.toDataURL("image/jpeg", quality);
  while (output.length > 320000 && quality > 0.5) {
    quality -= 0.08;
    output = canvas.toDataURL("image/jpeg", quality);
  }

  if (output.length > 360000) {
    throw new Error("A imagem ficou muito pesada. Use uma foto menor.");
  }

  return output;
}

async function buildBannerDataUrl(file) {
  const maxFileBytes = 10 * 1024 * 1024;
  if (!file || !String(file.type || "").startsWith("image/")) {
    throw new Error("Selecione uma imagem valida (PNG, JPG ou WEBP).");
  }
  if (file.size > maxFileBytes) {
    throw new Error("Banner muito grande. O limite e 10 MB.");
  }

  const rawDataUrl = await readFileAsDataUrl(file);
  const img = await loadImage(rawDataUrl);
  const sourceWidth = img.naturalWidth || img.width;
  const sourceHeight = img.naturalHeight || img.height;
  const targetWidth = 1280;
  const targetHeight = 720;
  const sourceRatio = sourceWidth / sourceHeight;
  const targetRatio = targetWidth / targetHeight;

  let cropWidth = sourceWidth;
  let cropHeight = sourceHeight;
  if (sourceRatio > targetRatio) {
    cropWidth = Math.max(1, Math.floor(sourceHeight * targetRatio));
  } else {
    cropHeight = Math.max(1, Math.floor(sourceWidth / targetRatio));
  }

  const sourceX = Math.max(0, Math.floor((sourceWidth - cropWidth) / 2));
  const sourceY = Math.max(0, Math.floor((sourceHeight - cropHeight) / 2));

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Não foi possível processar o banner.");
  }

  ctx.drawImage(img, sourceX, sourceY, cropWidth, cropHeight, 0, 0, targetWidth, targetHeight);

  let quality = 0.9;
  let output = canvas.toDataURL("image/jpeg", quality);
  while (output.length > 520000 && quality > 0.48) {
    quality -= 0.07;
    output = canvas.toDataURL("image/jpeg", quality);
  }

  if (output.length > 560000) {
    throw new Error("O banner ficou muito pesado. Use uma imagem menor.");
  }

  return output;
}

function applyProfileCardBanner(card, bannerUrl) {
  if (!card) {
    return;
  }
  const bannerLayer = card.querySelector(".profile-preview-banner");
  if (!(bannerLayer instanceof HTMLElement)) {
    return;
  }

  const safeBannerUrl = sanitizeBannerUrl(bannerUrl);
  if (!safeBannerUrl) {
    bannerLayer.style.backgroundImage = "";
    card.classList.remove("has-banner");
    return;
  }

  bannerLayer.style.backgroundImage = `url("${safeBannerUrl}")`;
  card.classList.add("has-banner");
}

function applyRankingCardBanner(sheet, bannerUrl) {
  if (!sheet) {
    return;
  }
  const bannerLayer = sheet.querySelector(".ranking-profile-banner");
  if (!(bannerLayer instanceof HTMLElement)) {
    return;
  }

  const safeBannerUrl = sanitizeBannerUrl(bannerUrl);
  if (!safeBannerUrl) {
    bannerLayer.style.backgroundImage = "";
    sheet.classList.remove("has-banner");
    return;
  }

  bannerLayer.style.backgroundImage = `url("${safeBannerUrl}")`;
  sheet.classList.add("has-banner");
}

function collectProfileDraft(user, fallbackProfile) {
  const fallback = normalizeProfile(fallbackProfile, user);
  const displayName = String(profileDisplayNameInput?.value || fallback.display_name).trim().slice(0, 32) || fallback.display_name;
  const theme = String(profileThemeSelect?.value || fallback.theme_key).toLowerCase();
  const accent = String(profileAccentColorInput?.value || fallback.accent_color).toLowerCase();
  const nameFont = String(profileNameFontSelect?.value || fallback.name_font).toLowerCase();
  const decoration = String(profileDecorationSelect?.value || fallback.decoration).toLowerCase();
  const bio = sanitizeProfileBio(profileBioInput?.value || fallback.bio || "");
  const avatarUrl = sanitizeAvatarUrl(profileAvatarDraftUrl || fallback.avatar_url || "");
  const bannerUrl = sanitizeBannerUrl(profileBannerDraftUrl || fallback.banner_url || "");

  return normalizeProfile(
    {
      ...fallback,
      display_name: displayName,
      theme_key: theme,
      accent_color: accent,
      name_font: nameFont,
      decoration,
      bio,
      avatar_url: avatarUrl,
      banner_url: bannerUrl,
    },
    user
  );
}

function hydrateProfileForm(profile) {
  if (!profileForm || !profile) {
    return;
  }
  profileDisplayNameInput.value = profile.display_name;
  profileThemeSelect.value = profile.theme_key;
  profileAccentColorInput.value = profile.accent_color;
  profileNameFontSelect.value = profile.name_font;
  profileDecorationSelect.value = profile.decoration;
  if (profileBioInput) {
    profileBioInput.value = profile.bio;
  }
  profileAvatarDraftUrl = profile.avatar_url || "";
  profileBannerDraftUrl = profile.banner_url || "";
  if (profileAvatarFileInput) {
    profileAvatarFileInput.value = "";
  }
  if (profileBannerFileInput) {
    profileBannerFileInput.value = "";
  }
}

function updateProfilePreview(profile) {
  if (!profilePreviewName || !profilePreviewTagline || !profilePreviewMeta || !profilePreviewCard) {
    return;
  }
  const safe = normalizeProfile(profile, currentUser);
  profilePreviewName.textContent = safe.display_name;
  profilePreviewTagline.textContent = safe.bio;
  profilePreviewMeta.textContent = `Metas batidas: ${safe.goals_completed}`;
  profilePreviewCard.dataset.decoration = safe.decoration;
  profilePreviewCard.style.setProperty("--user-accent", safe.accent_color);
  applyProfileCardBanner(profilePreviewCard, safe.banner_url);
  if (profilePreviewAvatar) {
    profilePreviewAvatar.src = getAvatarSrc(safe);
    profilePreviewAvatar.alt = `Foto de ${safe.display_name}`;
  }
}

function getNameFontFamily(fontKey) {
  switch (String(fontKey || "").toLowerCase()) {
    case "manrope":
      return "'Manrope', sans-serif";
    case "space":
      return "'Space Grotesk', 'Sora', sans-serif";
    case "poppins":
      return "'Poppins', 'Sora', sans-serif";
    case "sora":
    default:
      return "'Sora', sans-serif";
  }
}

function applyProfileAppearance(profile) {
  if (!document.body) {
    return;
  }

  if (!profile) {
    document.body.setAttribute("data-theme", "neon");
    document.body.style.removeProperty("--user-accent");
    const defaultFont = getNameFontFamily("sora");
    if (authToggle) {
      authToggle.style.fontFamily = defaultFont;
    }
    if (authUserName) {
      authUserName.style.fontFamily = defaultFont;
    }
    if (profilePreviewName) {
      profilePreviewName.style.fontFamily = defaultFont;
    }
    if (profilePreviewCard) {
      profilePreviewCard.dataset.decoration = "glow";
      applyProfileCardBanner(profilePreviewCard, "");
    }
    return;
  }

  const safe = normalizeProfile(profile, currentUser);
  document.body.setAttribute("data-theme", safe.theme_key);
  document.body.style.setProperty("--user-accent", safe.accent_color);

  const fontFamily = getNameFontFamily(safe.name_font);
  if (authToggle) {
    authToggle.style.fontFamily = fontFamily;
  }
  if (authUserName) {
    authUserName.style.fontFamily = fontFamily;
  }
  if (profilePreviewName) {
    profilePreviewName.style.fontFamily = fontFamily;
  }
  if (profilePreviewCard) {
    profilePreviewCard.dataset.decoration = safe.decoration;
  }
}

function resetProfileUI() {
  const fallback = getDefaultProfile(currentUser);
  currentProfile = currentUser ? fallback : null;
  hydrateProfileForm(fallback);
  updateProfilePreview(fallback);
  applyProfileAppearance(currentProfile);
  setProfileFormDisabled(!currentUser);
  if (!currentUser) {
    setProfileMessage("Entre na sua conta para editar seu perfil.");
  } else {
    setProfileMessage("");
  }
}

async function loadUserProfile() {
  if (!supabaseReady || !currentUser) {
    return;
  }

  const { data, error } = await supabaseClient
    .from("user_profiles")
    .select("*")
    .eq("user_id", currentUser.id)
    .maybeSingle();

  if (error) {
    setProfileError(getFriendlyProfileError(error));
    resetProfileUI();
    return;
  }

  if (!data) {
    const defaultProfile = normalizeProfile(getDefaultProfile(currentUser), currentUser);
    const payload = {
      user_id: currentUser.id,
      display_name: defaultProfile.display_name,
      theme_key: defaultProfile.theme_key,
      accent_color: defaultProfile.accent_color,
      name_font: defaultProfile.name_font,
      decoration: defaultProfile.decoration,
      bio: defaultProfile.bio,
      avatar_url: defaultProfile.avatar_url,
      banner_url: defaultProfile.banner_url,
      goals_completed: countCompletedGoals(),
      updated_at: new Date().toISOString(),
    };

    const inserted = await supabaseClient
      .from("user_profiles")
      .upsert(payload, { onConflict: "user_id" })
      .select("*")
      .single();

    if (inserted.error) {
      setProfileError(getFriendlyProfileError(inserted.error));
      currentProfile = defaultProfile;
    } else {
      currentProfile = normalizeProfile(inserted.data, currentUser);
    }
  } else {
    currentProfile = normalizeProfile(data, currentUser);
  }

  hydrateProfileForm(currentProfile);
  applyProfileAppearance(currentProfile);
  updateProfilePreview(currentProfile);
  setProfileFormDisabled(false);
  setProfileMessage("");
  await syncGoalsCompletedToProfile(false);
}

function countCompletedGoals() {
  return vaults.reduce((count, vault) => (vault.hiddenBalance >= vault.goal ? count + 1 : count), 0);
}

async function syncGoalsCompletedToProfile(force = false) {
  if (!supabaseReady || !currentUser || !currentProfile) {
    return;
  }

  const completed = countCompletedGoals();
  if (!force && completed === currentProfile.goals_completed) {
    updateProfilePreview(currentProfile);
    return;
  }

  currentProfile.goals_completed = completed;
  currentProfile.updated_at = new Date().toISOString();
  updateProfilePreview(currentProfile);

  const payload = {
    user_id: currentUser.id,
    display_name: currentProfile.display_name,
    theme_key: currentProfile.theme_key,
    accent_color: currentProfile.accent_color,
    name_font: currentProfile.name_font,
    decoration: currentProfile.decoration,
    bio: currentProfile.bio,
    avatar_url: currentProfile.avatar_url,
    banner_url: currentProfile.banner_url,
    goals_completed: currentProfile.goals_completed,
    updated_at: currentProfile.updated_at,
  };

  const { error } = await supabaseClient
    .from("user_profiles")
    .upsert(payload, { onConflict: "user_id" });

  if (!error) {
    await loadGlobalRanking();
  }
}

function getThemeLabel(themeKey) {
  const key = String(themeKey || "").toLowerCase();
  return PROFILE_THEME_LABELS[key] || PROFILE_THEME_LABELS.neon;
}

async function loadGlobalRanking() {
  if (!supabaseReady || !rankingList || !rankingFeedback) {
    return;
  }

  rankingFeedback.classList.remove("error");
  rankingFeedback.textContent = "";

  const { data, error } = await supabaseClient
    .from("user_profiles")
    .select("user_id, display_name, goals_completed, theme_key, name_font, accent_color, decoration, bio, avatar_url, banner_url, created_at, updated_at")
    .order("goals_completed", { ascending: false })
    .order("updated_at", { ascending: true })
    .limit(50);

  if (error) {
    rankingFeedback.classList.add("error");
    rankingFeedback.textContent = "Não foi possível carregar o ranking. Verifique o SQL da tabela user_profiles.";
    renderRanking([]);
    return;
  }

  renderRanking(Array.isArray(data) ? data : []);
}

function renderRanking(items) {
  if (!rankingList) {
    return;
  }

  rankingCache = Array.isArray(items)
    ? items.map((item) => normalizeProfile(item, null))
    : [];

  if (!Array.isArray(items) || items.length === 0) {
    rankingList.innerHTML = "<article class=\"ranking-item\"><span class=\"ranking-position\">-</span><div class=\"ranking-user\"><strong class=\"ranking-name\">Ainda sem dados no ranking</strong><span class=\"ranking-theme\">Complete metas para aparecer aqui.</span></div><span class=\"ranking-score\">0</span></article>";
    closeRankingProfile();
    return;
  }

  rankingList.innerHTML = rankingCache.map((safe, index) => {
    const position = index + 1;
    const isTop = position <= 3;
    const fontFamily = getNameFontFamily(safe.name_font);
    const goals = Number.isFinite(Number(safe.goals_completed)) ? Math.max(0, Math.floor(Number(safe.goals_completed))) : 0;
    const avatarSrc = escapeAttr(getAvatarSrc(safe));
    const profileHref = `perfil-publico.html?u=${encodeURIComponent(safe.user_id)}`;
    return `
      <article class="ranking-item" tabindex="0" role="button" aria-label="Ver perfil de ${escapeHTML(safe.display_name)}" data-user-id="${safe.user_id}">
        <span class="ranking-position ${isTop ? "top" : ""}">${position}</span>
        <img class="ranking-avatar" src="${avatarSrc}" alt="Foto de ${escapeHTML(safe.display_name)}" loading="lazy" />
        <div class="ranking-user">
          <strong class="ranking-name" style="font-family:${fontFamily}">${escapeHTML(safe.display_name)}</strong>
          <span class="ranking-theme">Tema: ${getThemeLabel(safe.theme_key)}</span>
        </div>
        <div class="ranking-actions">
          <span class="ranking-score">${goals} metas</span>
          <a class="btn btn-ghost ranking-more" href="${profileHref}">Ver mais</a>
        </div>
      </article>
    `;
  }).join("");
}

function setupRankingInteractions() {
  if (!rankingList) {
    return;
  }

  rankingList.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }
    if (target.closest(".ranking-more")) {
      return;
    }
    const item = target.closest(".ranking-item[data-user-id]");
    if (!item) {
      return;
    }
    const userId = String(item.getAttribute("data-user-id") || "");
    if (!userId) {
      return;
    }
    const profile = rankingCache.find((entry) => entry.user_id === userId);
    if (!profile) {
      return;
    }
    openRankingProfile(profile);
  });

  rankingList.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }
    if (target.closest(".ranking-more")) {
      return;
    }
    const item = target.closest(".ranking-item[data-user-id]");
    if (!item) {
      return;
    }
    event.preventDefault();
    const userId = String(item.getAttribute("data-user-id") || "");
    const profile = rankingCache.find((entry) => entry.user_id === userId);
    if (!profile) {
      return;
    }
    openRankingProfile(profile);
  });

  if (rankingProfileClose) {
    rankingProfileClose.addEventListener("click", () => {
      closeRankingProfile();
    });
  }
}

function openRankingProfile(profile) {
  if (!rankingProfileSheet || !rankingProfileAvatar || !rankingProfileName || !rankingProfileTheme || !rankingProfileGoals || !rankingProfileUpdated) {
    return;
  }
  const safe = normalizeProfile(profile, null);
  const goals = Number.isFinite(Number(safe.goals_completed)) ? Math.max(0, Math.floor(Number(safe.goals_completed))) : 0;
  const created = safe.created_at ? new Date(safe.created_at).toLocaleDateString("pt-BR") : "-";
  const updated = safe.updated_at ? new Date(safe.updated_at).toLocaleDateString("pt-BR") : "-";
  const fontFamily = getNameFontFamily(safe.name_font);

  rankingProfileAvatar.src = getAvatarSrc(safe);
  rankingProfileAvatar.alt = `Foto de ${safe.display_name}`;
  rankingProfileName.textContent = safe.display_name;
  rankingProfileName.style.color = safe.accent_color;
  rankingProfileName.style.fontFamily = fontFamily;
  rankingProfileTheme.textContent = `Tema: ${getThemeLabel(safe.theme_key)} • Decoração: ${safe.decoration}`;
  rankingProfileGoals.textContent = `Metas batidas: ${goals}`;
  if (rankingProfileBio) {
    rankingProfileBio.textContent = safe.bio;
  }
  if (rankingProfileCreated) {
    rankingProfileCreated.textContent = `Conta criada em: ${created}`;
  }
  rankingProfileUpdated.textContent = `Atualizado em: ${updated}`;
  rankingProfileSheet.style.setProperty("--ranking-accent", safe.accent_color);
  rankingProfileSheet.dataset.decoration = safe.decoration;
  applyRankingCardBanner(rankingProfileSheet, safe.banner_url);
  rankingProfileSheet.classList.remove("hidden");
}

function closeRankingProfile() {
  if (!rankingProfileSheet) {
    return;
  }
  rankingProfileSheet.style.removeProperty("--ranking-accent");
  rankingProfileSheet.removeAttribute("data-decoration");
  applyRankingCardBanner(rankingProfileSheet, "");
  rankingProfileSheet.classList.add("hidden");
}

function setupPublicProfileUI() {
  if (!publicProfileRoot) {
    return;
  }

  if (followUserBtn) {
    followUserBtn.addEventListener("click", async () => {
      if (!currentUser || !publicProfileTargetId || currentUser.id === publicProfileTargetId) {
        return;
      }

      followUserBtn.disabled = true;
      const shouldFollow = !socialRelationState.isFollowing;

      const op = shouldFollow
        ? supabaseClient.from("social_follows").insert({ follower_id: currentUser.id, followed_id: publicProfileTargetId })
        : supabaseClient.from("social_follows").delete().eq("follower_id", currentUser.id).eq("followed_id", publicProfileTargetId);

      const { error } = await op;
      followUserBtn.disabled = false;

      if (error) {
        setPublicProfileError(getFriendlySocialError(error, "Não foi possível atualizar o seguimento."));
        return;
      }

      setPublicProfileMessage(shouldFollow ? "Agora você está seguindo este perfil." : "Você deixou de seguir este perfil.");
      await loadPublicProfilePageData();
    });
  }

  if (friendActionBtn) {
    friendActionBtn.addEventListener("click", async () => {
      if (!currentUser || !publicProfileTargetId || currentUser.id === publicProfileTargetId) {
        return;
      }

      friendActionBtn.disabled = true;
      const [userA, userB] = canonicalPairIds(currentUser.id, publicProfileTargetId);

      let error = null;
      if (socialRelationState.friendshipId) {
        const res = await supabaseClient
          .from("social_friendships")
          .delete()
          .eq("id", socialRelationState.friendshipId);
        error = res.error;
      } else if (socialRelationState.friendRequestIncomingId) {
        const updateReq = await supabaseClient
          .from("social_friend_requests")
          .update({ status: "accepted", updated_at: new Date().toISOString() })
          .eq("id", socialRelationState.friendRequestIncomingId);
        error = updateReq.error;

        if (!error) {
          const createFriend = await supabaseClient
            .from("social_friendships")
            .upsert(
              { user_a: userA, user_b: userB, created_at: new Date().toISOString() },
              { onConflict: "user_a,user_b" }
            );
          error = createFriend.error;
        }
      } else if (socialRelationState.friendRequestOutgoingId) {
        const cancelReq = await supabaseClient
          .from("social_friend_requests")
          .update({ status: "canceled", updated_at: new Date().toISOString() })
          .eq("id", socialRelationState.friendRequestOutgoingId);
        error = cancelReq.error;
      } else {
        const sendReq = await supabaseClient
          .from("social_friend_requests")
          .insert({
            requester_id: currentUser.id,
            addressee_id: publicProfileTargetId,
            status: "pending",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        error = sendReq.error;
      }

      friendActionBtn.disabled = false;
      if (error) {
        setPublicProfileError(getFriendlySocialError(error, "Não foi possível atualizar amizade."));
        return;
      }

      setPublicProfileMessage("Status de amizade atualizado.");
      await loadPublicProfilePageData();
    });
  }

  if (publicChatForm && publicChatInput) {
    publicChatForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!currentUser || !publicProfileTargetId || !socialRelationState.friendshipId) {
        setPublicChatError("Chat disponível apenas para amigos.");
        return;
      }

      const message = String(publicChatInput.value || "").trim();
      if (!message) {
        return;
      }
      if (message.length > 1200) {
        setPublicChatError("Mensagem muito longa (máximo 1200 caracteres).");
        return;
      }

      const { error } = await supabaseClient
        .from("social_messages")
        .insert({
          sender_id: currentUser.id,
          receiver_id: publicProfileTargetId,
          content: message,
          created_at: new Date().toISOString(),
        });

      if (error) {
        setPublicChatError(getFriendlySocialError(error, "Não foi possível enviar mensagem."));
        return;
      }

      publicChatInput.value = "";
      setPublicChatMessage("Mensagem enviada.");
      await loadPublicChatMessages();
    });
  }
}

function resetPublicProfileUI(message = "") {
  if (!publicProfileRoot) {
    return;
  }
  publicProfileTargetId = "";
  publicProfileTargetData = null;
  socialRelationState = {
    isFollowing: false,
    friendshipId: "",
    friendRequestOutgoingId: "",
    friendRequestIncomingId: "",
  };
  stopPublicChatPolling();

  if (publicProfileName) {
    publicProfileName.textContent = "Usuário";
  }
  if (publicProfileTagline) {
    publicProfileTagline.textContent = "Perfil público";
  }
  if (publicProfileMeta) {
    publicProfileMeta.textContent = "Conta criada em: -";
  }
  if (publicProfileAvatar) {
    publicProfileAvatar.src = buildAvatarPlaceholder("BO", "#0ce0ff");
  }
  if (publicProfileCard) {
    publicProfileCard.style.removeProperty("--user-accent");
    publicProfileCard.removeAttribute("data-decoration");
    applyProfileCardBanner(publicProfileCard, "");
  }
  if (publicFollowersCount) {
    publicFollowersCount.textContent = "0";
  }
  if (publicFollowingCount) {
    publicFollowingCount.textContent = "0";
  }
  if (publicFriendsCount) {
    publicFriendsCount.textContent = "0";
  }
  if (publicGoalsCount) {
    publicGoalsCount.textContent = "0";
  }
  if (publicAchievementsList) {
    publicAchievementsList.innerHTML = "";
  }
  if (publicProfileActions) {
    publicProfileActions.classList.add("hidden");
  }
  if (publicChatPanel) {
    publicChatPanel.classList.add("hidden");
  }
  if (publicChatMessages) {
    publicChatMessages.innerHTML = "";
  }
  if (publicProfileFeedback) {
    publicProfileFeedback.classList.remove("error");
    publicProfileFeedback.textContent = message;
  }
}

async function loadPublicProfilePageData() {
  if (!publicProfileRoot || !supabaseReady) {
    return;
  }

  const targetId = String(new URLSearchParams(window.location.search).get("u") || "").trim();
  if (!targetId) {
    resetPublicProfileUI("Perfil não informado. Abra um usuário pelo ranking.");
    return;
  }
  publicProfileTargetId = targetId;

  const { data: profileRow, error: profileError } = await supabaseClient
    .from("user_profiles")
    .select("*")
    .eq("user_id", publicProfileTargetId)
    .maybeSingle();

  if (profileError) {
    resetPublicProfileUI("Não foi possível carregar o perfil. Execute o SQL social no Supabase.");
    setPublicProfileError(getFriendlySocialError(profileError, "Falha ao carregar perfil."));
    return;
  }

  if (!profileRow) {
    resetPublicProfileUI("Perfil não encontrado.");
    return;
  }

  const safeProfile = normalizeProfile(profileRow, null);
  publicProfileTargetData = safeProfile;

  const [followersCount, followingCount, friendsCount] = await Promise.all([
    countByField("social_follows", "followed_id", publicProfileTargetId),
    countByField("social_follows", "follower_id", publicProfileTargetId),
    countFriendships(publicProfileTargetId),
  ]);

  renderPublicProfileCard(safeProfile, {
    followers: followersCount,
    following: followingCount,
    friends: friendsCount,
    goals: safeProfile.goals_completed,
  });

  if (!currentUser || currentUser.id === publicProfileTargetId) {
    if (publicProfileActions) {
      publicProfileActions.classList.add("hidden");
    }
    if (currentUser && currentUser.id === publicProfileTargetId) {
      setPublicProfileMessage("Este é o seu perfil público.");
    } else {
      setPublicProfileMessage("Faça login para seguir, adicionar amigos e conversar.");
    }
    if (publicChatPanel) {
      publicChatPanel.classList.add("hidden");
    }
    stopPublicChatPolling();
    return;
  }

  await loadSocialRelationState();
  renderPublicSocialActions();
  await syncPublicChatVisibility();
}

async function loadSocialRelationState() {
  if (!currentUser || !publicProfileTargetId || currentUser.id === publicProfileTargetId) {
    socialRelationState = {
      isFollowing: false,
      friendshipId: "",
      friendRequestOutgoingId: "",
      friendRequestIncomingId: "",
    };
    return;
  }

  const [userA, userB] = canonicalPairIds(currentUser.id, publicProfileTargetId);
  const [followRes, outgoingReqRes, incomingReqRes, friendshipRes] = await Promise.all([
    supabaseClient
      .from("social_follows")
      .select("follower_id")
      .eq("follower_id", currentUser.id)
      .eq("followed_id", publicProfileTargetId)
      .maybeSingle(),
    supabaseClient
      .from("social_friend_requests")
      .select("id")
      .eq("requester_id", currentUser.id)
      .eq("addressee_id", publicProfileTargetId)
      .eq("status", "pending")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabaseClient
      .from("social_friend_requests")
      .select("id")
      .eq("requester_id", publicProfileTargetId)
      .eq("addressee_id", currentUser.id)
      .eq("status", "pending")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabaseClient
      .from("social_friendships")
      .select("id")
      .eq("user_a", userA)
      .eq("user_b", userB)
      .maybeSingle(),
  ]);

  socialRelationState = {
    isFollowing: Boolean(followRes?.data),
    friendshipId: String(friendshipRes?.data?.id || ""),
    friendRequestOutgoingId: String(outgoingReqRes?.data?.id || ""),
    friendRequestIncomingId: String(incomingReqRes?.data?.id || ""),
  };
}

function renderPublicSocialActions() {
  if (!publicProfileActions || !followUserBtn || !friendActionBtn) {
    return;
  }
  publicProfileActions.classList.remove("hidden");

  followUserBtn.textContent = socialRelationState.isFollowing ? "Deixar de seguir" : "Seguir";

  if (socialRelationState.friendshipId) {
    friendActionBtn.textContent = "Desfazer amizade";
  } else if (socialRelationState.friendRequestIncomingId) {
    friendActionBtn.textContent = "Aceitar amizade";
  } else if (socialRelationState.friendRequestOutgoingId) {
    friendActionBtn.textContent = "Cancelar pedido";
  } else {
    friendActionBtn.textContent = "Adicionar amigo";
  }
}

async function syncPublicChatVisibility() {
  if (!publicChatPanel || !publicChatStatus) {
    return;
  }

  if (!socialRelationState.friendshipId) {
    publicChatPanel.classList.add("hidden");
    publicChatStatus.textContent = "Disponível apenas quando a amizade é aceita.";
    if (publicChatMessages) {
      publicChatMessages.innerHTML = "";
    }
    stopPublicChatPolling();
    return;
  }

  publicChatPanel.classList.remove("hidden");
  publicChatStatus.textContent = "Chat ativo entre amigos.";
  await loadPublicChatMessages();
  startPublicChatPolling();
}

async function loadPublicChatMessages() {
  if (!publicChatMessages || !currentUser || !publicProfileTargetId) {
    return;
  }

  const filter = `and(sender_id.eq.${currentUser.id},receiver_id.eq.${publicProfileTargetId}),and(sender_id.eq.${publicProfileTargetId},receiver_id.eq.${currentUser.id})`;
  const { data, error } = await supabaseClient
    .from("social_messages")
    .select("id, sender_id, receiver_id, content, created_at")
    .or(filter)
    .order("created_at", { ascending: true })
    .limit(200);

  if (error) {
    setPublicChatError(getFriendlySocialError(error, "Não foi possível carregar mensagens."));
    return;
  }

  if (!Array.isArray(data) || data.length === 0) {
    publicChatMessages.innerHTML = "<article class=\"chat-bubble\"><span class=\"chat-meta\">Sem mensagens ainda</span><p class=\"chat-content\">Inicie a conversa.</p></article>";
    return;
  }

  publicChatMessages.innerHTML = data.map((item) => {
    const mine = item.sender_id === currentUser.id;
    const when = item.created_at ? new Date(item.created_at).toLocaleString("pt-BR") : "-";
    return `
      <article class="chat-bubble ${mine ? "mine" : ""}">
        <span class="chat-meta">${mine ? "Você" : "Amigo"} • ${when}</span>
        <p class="chat-content">${escapeHTML(String(item.content || ""))}</p>
      </article>
    `;
  }).join("");

  publicChatMessages.scrollTop = publicChatMessages.scrollHeight;
}

function startPublicChatPolling() {
  stopPublicChatPolling();
  publicChatPollTimer = window.setInterval(() => {
    if (!publicChatPanel || publicChatPanel.classList.contains("hidden")) {
      return;
    }
    void loadPublicChatMessages();
  }, 7000);
}

function stopPublicChatPolling() {
  if (publicChatPollTimer) {
    clearInterval(publicChatPollTimer);
    publicChatPollTimer = null;
  }
}

function setPublicProfileMessage(message) {
  if (!publicProfileFeedback) {
    return;
  }
  publicProfileFeedback.classList.remove("error");
  publicProfileFeedback.textContent = message;
}

function setPublicProfileError(message) {
  if (!publicProfileFeedback) {
    return;
  }
  publicProfileFeedback.classList.add("error");
  publicProfileFeedback.textContent = message;
}

function setPublicChatMessage(message) {
  if (!publicChatFeedback) {
    return;
  }
  publicChatFeedback.classList.remove("error");
  publicChatFeedback.textContent = message;
}

function setPublicChatError(message) {
  if (!publicChatFeedback) {
    return;
  }
  publicChatFeedback.classList.add("error");
  publicChatFeedback.textContent = message;
}

function canonicalPairIds(idA, idB) {
  return String(idA) < String(idB) ? [String(idA), String(idB)] : [String(idB), String(idA)];
}

async function countByField(table, field, value) {
  const { count, error } = await supabaseClient
    .from(table)
    .select("*", { count: "exact", head: true })
    .eq(field, value);
  if (error) {
    return 0;
  }
  return Number(count || 0);
}

async function countFriendships(userId) {
  const [a, b] = await Promise.all([
    countByField("social_friendships", "user_a", userId),
    countByField("social_friendships", "user_b", userId),
  ]);
  return Number(a || 0) + Number(b || 0);
}

function renderPublicProfileCard(profile, stats) {
  if (!publicProfileCard || !publicProfileName || !publicProfileTagline || !publicProfileMeta) {
    return;
  }
  const safe = normalizeProfile(profile, null);
  const createdAt = safe.created_at ? new Date(safe.created_at).toLocaleDateString("pt-BR") : "-";

  if (publicProfileHeaderCopy) {
    publicProfileHeaderCopy.textContent = `Perfil de ${safe.display_name}`;
  }
  publicProfileCard.dataset.decoration = safe.decoration;
  publicProfileCard.style.setProperty("--user-accent", safe.accent_color);
  publicProfileName.textContent = safe.display_name;
  publicProfileName.style.fontFamily = getNameFontFamily(safe.name_font);
  publicProfileName.style.color = safe.accent_color;
  publicProfileTagline.textContent = safe.bio;
  publicProfileMeta.textContent = `Conta criada em: ${createdAt}`;
  applyProfileCardBanner(publicProfileCard, safe.banner_url);

  if (publicProfileAvatar) {
    publicProfileAvatar.src = getAvatarSrc(safe);
    publicProfileAvatar.alt = `Foto de ${safe.display_name}`;
  }

  if (publicFollowersCount) {
    publicFollowersCount.textContent = String(stats.followers || 0);
  }
  if (publicFollowingCount) {
    publicFollowingCount.textContent = String(stats.following || 0);
  }
  if (publicFriendsCount) {
    publicFriendsCount.textContent = String(stats.friends || 0);
  }
  if (publicGoalsCount) {
    publicGoalsCount.textContent = String(stats.goals || 0);
  }

  renderPublicAchievements(safe, stats);
}

function getAchievementCatalog(stats) {
  const goals = Number(stats.goals || 0);
  const followers = Number(stats.followers || 0);
  const friends = Number(stats.friends || 0);

  return [
    {
      id: "goal_1",
      icon: "🏆",
      name: "Primeira meta",
      copy: "Bateu a primeira meta no Banco Ocioso.",
      unlocked: goals >= 1,
      progress: `${Math.min(goals, 1)}/1`,
    },
    {
      id: "goal_5",
      icon: "🥈",
      name: "Colecionador prata",
      copy: "Acumulou 5 metas concluídas.",
      unlocked: goals >= 5,
      progress: `${Math.min(goals, 5)}/5`,
    },
    {
      id: "goal_10",
      icon: "🥇",
      name: "Colecionador ouro",
      copy: "Acumulou 10 metas concluídas.",
      unlocked: goals >= 10,
      progress: `${Math.min(goals, 10)}/10`,
    },
    {
      id: "followers_1",
      icon: "🤝",
      name: "Primeiro seguidor",
      copy: "Recebeu o primeiro seguidor.",
      unlocked: followers >= 1,
      progress: `${Math.min(followers, 1)}/1`,
    },
    {
      id: "followers_10",
      icon: "🌟",
      name: "Influência crescente",
      copy: "Alcançou 10 seguidores.",
      unlocked: followers >= 10,
      progress: `${Math.min(followers, 10)}/10`,
    },
    {
      id: "friends_1",
      icon: "🫂",
      name: "Primeira amizade",
      copy: "Conectou com um amigo na plataforma.",
      unlocked: friends >= 1,
      progress: `${Math.min(friends, 1)}/1`,
    },
    {
      id: "friends_5",
      icon: "🛡️",
      name: "Círculo forte",
      copy: "Formou uma rede com 5 amigos.",
      unlocked: friends >= 5,
      progress: `${Math.min(friends, 5)}/5`,
    },
  ];
}

function renderPublicAchievements(profile, stats) {
  if (!publicAchievementsList) {
    return;
  }
  const catalog = getAchievementCatalog(stats);
  publicAchievementsList.innerHTML = catalog.map((item) => `
    <article class="achievement-card ${item.unlocked ? "" : "locked"}">
      <div class="achievement-head">
        <span class="achievement-icon">${item.icon}</span>
        <strong class="achievement-name">${escapeHTML(item.name)}</strong>
      </div>
      <p class="achievement-copy">${escapeHTML(item.copy)}</p>
      <p class="achievement-state">${item.unlocked ? "Troféu coletado" : `Progresso ${item.progress}`}</p>
    </article>
  `).join("");
}

function setupVaultHandlers() {
  if (!rulesCheckbox || !vaultForm || !feedback) {
    return;
  }

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
    const goal = parseCurrencyInput(document.getElementById("vaultGoal").value);
    const initialDepositRaw = document.getElementById("vaultDeposit").value;
    const avgDepositExpected = parseCurrencyInput(document.getElementById("vaultAvgDeposit").value);
    const initialDeposit = parseCurrencyInput(initialDepositRaw);
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
      revealViewsUsed: 0,
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

function updateVaultDashboard() {
  if (
    !vaultDashTotal ||
    !vaultDashActive ||
    !vaultDashCompleted ||
    !vaultDashProgress ||
    !vaultDashProgressBar ||
    !vaultDashBest
  ) {
    return;
  }

  if (!supabaseReady) {
    vaultDashTotal.textContent = "-";
    vaultDashActive.textContent = "-";
    vaultDashCompleted.textContent = "-";
    vaultDashProgress.textContent = "-";
    vaultDashProgressBar.style.width = "0%";
    vaultDashBest.textContent = "Melhor cofre: configure o Supabase.";
    return;
  }

  if (!currentUser) {
    vaultDashTotal.textContent = "0";
    vaultDashActive.textContent = "0";
    vaultDashCompleted.textContent = "0";
    vaultDashProgress.textContent = "0%";
    vaultDashProgressBar.style.width = "0%";
    vaultDashBest.textContent = "Melhor cofre: entre na sua conta.";
    return;
  }

  const total = vaults.length;
  const active = vaults.filter((vault) => vault.hiddenBalance < vault.goal).length;
  const completed = total - active;
  const averageProgress = total > 0
    ? Math.round(vaults.reduce((sum, vault) => sum + getProgress(vault.hiddenBalance, vault.goal), 0) / total)
    : 0;

  let bestLabel = "Melhor cofre: crie sua primeira meta.";
  if (total > 0) {
    const bestVault = vaults
      .map((vault) => ({ vault, progress: getProgress(vault.hiddenBalance, vault.goal) }))
      .sort((a, b) => b.progress - a.progress)[0];
    if (bestVault?.vault) {
      bestLabel = `Melhor cofre: ${bestVault.vault.name} (${bestVault.progress}%).`;
    }
  }

  vaultDashTotal.textContent = String(total);
  vaultDashActive.textContent = String(active);
  vaultDashCompleted.textContent = String(completed);
  vaultDashProgress.textContent = `${averageProgress}%`;
  vaultDashProgressBar.style.width = `${averageProgress}%`;
  vaultDashBest.textContent = bestLabel;
}

function renderVaults() {
  if (!activeVaultList || !achievementVaultList) {
    return;
  }

  updateVaultDashboard();

  if (!supabaseReady) {
    activeVaultList.innerHTML = "<article class=\"vault-card\"><p class=\"vault-meta\">Configure o Supabase para ativar login e cofres.</p></article>";
    achievementVaultList.innerHTML = "<article class=\"vault-card\"><p class=\"vault-meta\">Conquistas aparecerão aqui quando uma meta for concluída.</p></article>";
    return;
  }

  if (!currentUser) {
    activeVaultList.innerHTML = "<article class=\"vault-card\"><p class=\"vault-meta\">Entre na sua conta para carregar seus cofres.</p></article>";
    achievementVaultList.innerHTML = "<article class=\"vault-card\"><p class=\"vault-meta\">Conquistas aparecerão aqui quando uma meta for concluída.</p></article>";
    return;
  }

  if (vaults.length === 0) {
    activeVaultList.innerHTML = "<article class=\"vault-card\"><p class=\"vault-meta\">Nenhum cofre criado ainda. Comece pela primeira meta.</p></article>";
    achievementVaultList.innerHTML = "<article class=\"vault-card\"><p class=\"vault-meta\">Nenhuma conquista ainda.</p></article>";
    return;
  }

  const now = Date.now();
  const activeVaults = vaults.filter((vault) => vault.hiddenBalance < vault.goal);
  const achievementVaults = vaults.filter((vault) => vault.hiddenBalance >= vault.goal);

  activeVaultList.innerHTML = activeVaults.length
    ? activeVaults.map((vault) => buildVaultCard(vault, now)).join("")
    : "<article class=\"vault-card\"><p class=\"vault-meta\">Nenhuma meta em andamento no momento.</p></article>";

  achievementVaultList.innerHTML = achievementVaults.length
    ? achievementVaults.map((vault) => buildVaultCard(vault, now)).join("")
    : "<article class=\"vault-card\"><p class=\"vault-meta\">Nenhuma conquista ainda. Continue registrando aportes.</p></article>";

  attachVaultEvents();
  setupMoneyInputs(document);
  animateVaultCards();
  if (currentUser && currentProfile) {
    void syncGoalsCompletedToProfile(false);
  }
}

function buildVaultCard(vault, now) {
  const isGoalReached = vault.hiddenBalance >= vault.goal;
  const isCelebrating = Boolean(vault.celebrateUntil) && new Date(vault.celebrateUntil).getTime() > now;
  const progress = getProgress(vault.hiddenBalance, vault.goal);
  const blocksDone = Math.max(0, Math.min(10, Math.round(progress / 10)));
  const status = getStatusByProgress(progress);
  const phrase = getMysteryPhrase(progress);
  const depositsLeft = estimateDepositsLeft(vault);
  const challengeMarkup = vault.challengeMode ? buildChallenge(vault) : "";
  const lockedMarkup = vault.lockedMode && !isGoalReached ? buildLockedMode(vault, now) : "";
  const depositFormMarkup = isGoalReached
    ? "<p class=\"vault-meta\">Meta concluída. Novos aportes estão bloqueados neste cofre.</p>"
    : `
        <form class="deposit-form" data-id="${vault.id}">
          <input class="money-input" type="text" inputmode="numeric" autocomplete="off" placeholder="Registrar novo aporte ($)" required />
          <button class="btn btn-ghost" type="submit">Registrar aporte</button>
        </form>
      `;

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
            <span class="motiv-value">${status}</span>
          </div>
          <div class="motiv-box">
            <span class="motiv-label">Foco</span>
            <span class="motiv-value">🪙 ${depositsLeft}</span>
          </div>
          <div class="motiv-box">
            <span class="motiv-label">Reflexão</span>
            <span class="motiv-value">💭 ${phrase}</span>
          </div>
        </div>

        <div class="secret">
          <p>
            Valor guardado neste cofre:
            <strong>${isGoalReached ? formatBRL(vault.hiddenBalance) : "$••••••"}</strong>
          </p>
          ${isGoalReached ? "<p class=\"goal-unlock\">Meta concluída: valor liberado automaticamente.</p>" : ""}
        </div>

        ${challengeMarkup}
        ${lockedMarkup}

        ${depositFormMarkup}

        <button class="btn btn-danger delete-vault-btn" type="button" data-id="${vault.id}">
          Excluir meta
        </button>
      </article>
      `;
}

function attachVaultEvents() {
  const deleteButtons = document.querySelectorAll("#activeVaultList .delete-vault-btn, #achievementVaultList .delete-vault-btn");
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

      updateVaultAccessState();
      feedback.classList.remove("error");
      feedback.textContent = `Meta "${vault.name}" excluída com sucesso.`;
      renderVaults();
    });
  });

  const depositForms = document.querySelectorAll("#activeVaultList .deposit-form, #achievementVaultList .deposit-form");
  depositForms.forEach((form) => {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const id = form.dataset.id;
      const value = parseCurrencyInput(form.querySelector("input").value);

      if (!value || value <= 0) {
        return;
      }

      const vault = vaults.find((item) => item.id === id);
      if (!vault) {
        return;
      }
      if (vault.hiddenBalance >= vault.goal) {
        showError(`A meta "${vault.name}" já foi concluída. Novos aportes estão bloqueados.`);
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

  const lockForms = document.querySelectorAll("#activeVaultList .lock-form, #achievementVaultList .lock-form");
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
        const revealStats = getRevealStatsByBalance(vault.hiddenBalance, vault.revealViewsUsed);
        if (revealStats.remaining <= 0) {
          showError(`Limite de visualizações atingido no cofre "${vault.name}" (${revealStats.used}/${revealStats.limit}).`);
          return;
        }

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
        const revealStats = getRevealStatsByBalance(vault.hiddenBalance, vault.revealViewsUsed);
        if (revealStats.remaining <= 0) {
          showError(`Limite de visualizações atingido no cofre "${vault.name}" (${revealStats.used}/${revealStats.limit}).`);
          return;
        }

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

        const previousRevealViewsUsed = Number(vault.revealViewsUsed || 0);
        const previousRevealUntil = vault.revealUntil;
        const previousUpdatedAt = vault.updatedAt;
        vault.lastReflection = reflection;
        vault.revealViewsUsed = previousRevealViewsUsed + 1;
        vault.revealUntil = new Date(Date.now() + 15000).toISOString();
        vault.updatedAt = new Date().toISOString();

        const unlockSave = await upsertVault(vault);
        if (unlockSave.error) {
          vault.revealViewsUsed = previousRevealViewsUsed;
          vault.revealUntil = previousRevealUntil;
          vault.updatedAt = previousUpdatedAt;
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
  if (!createVaultBtn || !vaultForm || !rulesCheckbox || !feedback) {
    return;
  }

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
    return;
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

  updateVaultAccessState();
}

function setupMoneyInputs(scope = document) {
  const moneyInputs = scope.querySelectorAll(".money-input");
  moneyInputs.forEach((input) => {
    if (input.dataset.moneyBound === "1") {
      return;
    }

    input.dataset.moneyBound = "1";

    input.addEventListener("input", () => {
      const digits = String(input.value || "").replace(/\D/g, "").slice(0, 12);
      if (!digits) {
        input.value = "";
        return;
      }

      input.value = formatCurrencyFromDigits(digits);
    });
  });
}

function formatCurrencyFromDigits(digits) {
  const normalized = String(digits || "").replace(/\D/g, "").replace(/^0+(?=\d)/, "");
  if (!normalized) {
    return "";
  }

  const cents = normalized.padStart(3, "0");
  const intPart = cents.slice(0, -2).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const decimalPart = cents.slice(-2);
  return `$ ${intPart},${decimalPart}`;
}

function parseCurrencyInput(value) {
  const digits = String(value || "").replace(/\D/g, "");
  if (!digits) {
    return 0;
  }
  return Number(digits) / 100;
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
    revealViewsUsed: Number.isFinite(Number(input.revealViewsUsed)) && Number(input.revealViewsUsed) >= 0
      ? Math.floor(Number(input.revealViewsUsed))
      : 0,
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
  const revealStats = getRevealStatsByBalance(vault.hiddenBalance, vault.revealViewsUsed);
  const counterMarkup = `<p class="vault-meta">Visualizações: ${revealStats.used}/${revealStats.limit} • Restantes: ${revealStats.remaining}</p>`;

  if (revealStats.remaining <= 0) {
    return `
      <div class="locked-mode">
        <p><strong>Modo Bloqueado:</strong> limite de visualizações atingido para este cofre.</p>
        ${counterMarkup}
      </div>
    `;
  }

  const lockState = getLockState(vault, now);

  if (lockState.type === "none") {
    return `
      <div class="locked-mode">
        <p><strong>Modo Bloqueado:</strong> para ver o valor real, inicie um pedido e aguarde 24h.</p>
        ${counterMarkup}
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
        ${counterMarkup}
      </div>
    `;
  }

  if (lockState.type === "unlocked") {
    return `
      <div class="locked-mode">
        <p><strong>Modo Bloqueado:</strong> visualização temporária ativa.</p>
        ${counterMarkup}
        <p class="reveal-balance">Saldo visível por alguns segundos: ${formatBRL(vault.hiddenBalance)}</p>
      </div>
    `;
  }

  return `
    <div class="locked-mode">
      <p><strong>Modo Bloqueado:</strong> liberado. Reflita antes de visualizar o valor.</p>
      ${counterMarkup}
      <form class="locked-actions lock-form" data-id="${vault.id}" data-action="unlock">
        <textarea placeholder="Por que você precisa ver este valor agora e como vai evitar gastar por impulso?" required></textarea>
        <button type="submit" class="btn btn-ghost">Liberar visualização por 15s</button>
      </form>
    </div>
  `;
}

function getRevealLimitByBalance(balance) {
  const value = Number(balance) || 0;
  if (value <= 1000) {
    return 1;
  }
  if (value <= 3000) {
    return 3;
  }
  if (value <= 6000) {
    return 5;
  }
  if (value <= 20000) {
    return 6;
  }
  return 6;
}

function getRevealStatsByBalance(balance, used) {
  const limit = getRevealLimitByBalance(balance);
  const usedSafe = Math.max(0, Math.floor(Number(used) || 0));
  return {
    limit,
    used: Math.min(usedSafe, limit),
    remaining: Math.max(0, limit - usedSafe),
  };
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
    return "🎉 Meta concluída";
  }
  if (progress >= 75) {
    return "🏁 Meta em reta final";
  }
  if (progress >= 40) {
    return "🚀 Meta em andamento";
  }
  return "👷‍♀️ Base da reserva em construção";
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
  if (feedback) {
    feedback.classList.remove("error");
    feedback.textContent = `Meta batida no cofre "${vault.name}". Valor liberado para visualização.`;
  } else {
    showBottomNotice(`Meta batida no cofre "${vault.name}".`);
  }
  setTimeout(() => {
    renderVaults();
  }, 6100);
}

function setupBottomNav() {
  updateBottomNavActiveState();

  if (bottomNotifyBtn) {
    bottomNotifyBtn.addEventListener("click", (event) => {
      event.preventDefault();
      showBottomNotice("Sem notificações novas por enquanto.");
    });
  }

  if (bottomAuthToggle) {
    bottomAuthToggle.addEventListener("click", (event) => {
      event.preventDefault();
      if (!authPanel || !authToggle) {
        return;
      }
      const isOpen = !authPanel.classList.contains("is-open");
      setAuthPanelState(isOpen);
    });
  }

  window.addEventListener("hashchange", () => {
    updateBottomNavActiveState();
  });
}

function updateBottomNavActiveState() {
  const navItems = document.querySelectorAll(".app-bottom-nav a.app-nav-item[href]");
  if (navItems.length === 0) {
    return;
  }

  const currentPath = window.location.pathname.split("/").pop() || "index.html";
  const currentHash = window.location.hash || "";

  navItems.forEach((item) => {
    const href = item.getAttribute("href") || "";
    let isActive = false;

    if (href.startsWith("#")) {
      if (currentPath.toLowerCase().endsWith("index.html") || currentPath === "") {
        isActive = currentHash === href || (href === "#inicio" && currentHash === "");
      }
    } else {
      const [pathPart, hashPart] = href.split("#");
      const normalizedPath = (pathPart || "").split("/").pop() || "index.html";
      if (normalizedPath.toLowerCase() === currentPath.toLowerCase()) {
        if (!hashPart) {
          isActive = true;
        } else if (currentPath.toLowerCase().endsWith("index.html")) {
          isActive = currentHash === `#${hashPart}`;
        }
      }
    }

    item.classList.toggle("is-active", isActive);
  });
}

function showBottomNotice(message) {
  if (!message) {
    return;
  }

  if (!bottomNoticeNode) {
    bottomNoticeNode = document.getElementById("bottomNotice");
  }
  if (!bottomNoticeNode) {
    bottomNoticeNode = document.createElement("div");
    bottomNoticeNode.id = "bottomNotice";
    bottomNoticeNode.className = "bottom-notice";
    bottomNoticeNode.setAttribute("role", "status");
    bottomNoticeNode.setAttribute("aria-live", "polite");
    document.body.appendChild(bottomNoticeNode);
  }

  bottomNoticeNode.textContent = message;
  bottomNoticeNode.classList.add("is-visible");
  if (bottomNoticeTimer) {
    clearTimeout(bottomNoticeTimer);
  }
  bottomNoticeTimer = window.setTimeout(() => {
    if (bottomNoticeNode) {
      bottomNoticeNode.classList.remove("is-visible");
    }
    bottomNoticeTimer = null;
  }, 2600);
}

function canUseDeviceNotifications() {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return false;
  }
  if (window.isSecureContext) {
    return true;
  }
  return window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
}

function getDeviceNotificationPreference() {
  try {
    const raw = localStorage.getItem(DEVICE_NOTIFY_PREF_KEY);
    if (!raw) {
      return true;
    }
    return raw === "1";
  } catch (_error) {
    return true;
  }
}

function setDeviceNotificationPreference(enabled) {
  try {
    localStorage.setItem(DEVICE_NOTIFY_PREF_KEY, enabled ? "1" : "0");
  } catch (_error) {
    // Sem bloqueio se localStorage não estiver disponível.
  }
}

async function setupDeviceNotifications() {
  if (!canUseDeviceNotifications()) {
    syncDeviceNotificationStatusUI();
    return;
  }

  if ("serviceWorker" in navigator) {
    try {
      notificationServiceWorkerRegistration = await navigator.serviceWorker.register("./sw.js");
    } catch (_error) {
      notificationServiceWorkerRegistration = null;
    }
  }

  syncDeviceNotificationStatusUI();
}

function syncDeviceNotificationStatusUI() {
  if (!deviceNotifyStatus || !deviceNotifyEnableBtn) {
    return;
  }

  if (!canUseDeviceNotifications()) {
    deviceNotifyStatus.textContent = "Seu dispositivo/navegador não suporta notificações de sistema.";
    deviceNotifyEnableBtn.textContent = "Indisponível";
    deviceNotifyEnableBtn.disabled = true;
    return;
  }

  const prefEnabled = getDeviceNotificationPreference();
  const permission = Notification.permission;

  if (!prefEnabled) {
    deviceNotifyStatus.textContent = "Notificações do dispositivo estão desativadas neste navegador.";
    deviceNotifyEnableBtn.textContent = "Ativar";
    deviceNotifyEnableBtn.disabled = false;
    return;
  }

  if (permission === "granted") {
    deviceNotifyStatus.textContent = "Ativas no dispositivo. Você receberá alertas de mensagens e pedidos de amizade.";
    deviceNotifyEnableBtn.textContent = "Ativado";
    deviceNotifyEnableBtn.disabled = true;
    return;
  }

  if (permission === "denied") {
    deviceNotifyStatus.textContent = "Permissão negada no navegador. Libere manualmente nas configurações do site.";
    deviceNotifyEnableBtn.textContent = "Bloqueado";
    deviceNotifyEnableBtn.disabled = true;
    return;
  }

  deviceNotifyStatus.textContent = "Toque em ativar para permitir notificações do dispositivo.";
  deviceNotifyEnableBtn.textContent = "Ativar";
  deviceNotifyEnableBtn.disabled = false;
}

async function requestDeviceNotificationPermission() {
  if (!canUseDeviceNotifications()) {
    showBottomNotice("Notificações do dispositivo não são suportadas neste navegador.");
    syncDeviceNotificationStatusUI();
    return false;
  }

  setDeviceNotificationPreference(true);

  if (Notification.permission === "granted") {
    syncDeviceNotificationStatusUI();
    return true;
  }

  if (Notification.permission === "denied") {
    syncDeviceNotificationStatusUI();
    return false;
  }

  const result = await Notification.requestPermission();
  syncDeviceNotificationStatusUI();
  return result === "granted";
}

async function showDeviceNotification(title, options = {}) {
  if (!canUseDeviceNotifications()) {
    return;
  }
  if (!getDeviceNotificationPreference() || Notification.permission !== "granted") {
    return;
  }

  const safeTitle = String(title || "").trim() || "Banco Ocioso";
  const payload = {
    badge: "img/favicon.png",
    icon: "img/favicon.png",
    ...options,
  };

  if (notificationServiceWorkerRegistration && typeof notificationServiceWorkerRegistration.showNotification === "function") {
    try {
      await notificationServiceWorkerRegistration.showNotification(safeTitle, payload);
      return;
    } catch (_error) {
      // fallback abaixo
    }
  }

  try {
    // Fallback para contexto sem SW ativo.
    const instance = new Notification(safeTitle, payload);
    instance.onclick = () => {
      const target = String(payload?.data?.url || "index.html");
      window.focus();
      window.location.href = target;
      instance.close();
    };
  } catch (_error) {
    // Ignora falhas silenciosamente.
  }
}

function resetDeviceNotificationCaches() {
  knownIncomingMessageIds = new Set();
  knownPendingRequestIds = new Set();
  messageNotificationPrimed = false;
  requestNotificationPrimed = false;
}

function startDeviceNotificationPolling() {
  stopDeviceNotificationPolling();

  if (!supabaseReady || !currentUser) {
    return;
  }

  deviceNotificationPollTimer = window.setInterval(() => {
    void pollDeviceNotificationsOnce();
  }, 12000);
}

function stopDeviceNotificationPolling() {
  if (deviceNotificationPollTimer) {
    clearInterval(deviceNotificationPollTimer);
    deviceNotificationPollTimer = null;
  }
}

async function pollDeviceNotificationsOnce() {
  if (!supabaseReady || !currentUser) {
    return;
  }

  const friendIds = await loadFriendIdsForCurrentUser();
  let profileMap = new Map();

  if (friendIds.length > 0) {
    const [profileRes, messageRes] = await Promise.all([
      supabaseClient
        .from("user_profiles")
        .select("*")
        .in("user_id", friendIds),
      supabaseClient
        .from("social_messages")
        .select("id, sender_id, receiver_id, content, created_at")
        .or(`sender_id.eq.${currentUser.id},receiver_id.eq.${currentUser.id}`)
        .order("created_at", { ascending: false })
        .limit(400),
    ]);

    profileMap = new Map(
      (Array.isArray(profileRes?.data) ? profileRes.data : []).map((row) => {
        const safe = normalizeProfile(row, null);
        return [safe.user_id, safe];
      })
    );

    if (!messageRes?.error) {
      await trackAndNotifyIncomingMessages(
        Array.isArray(messageRes.data) ? messageRes.data : [],
        profileMap,
        friendIds
      );
    }
  }

  const { data: requestRows, error: requestError } = await supabaseClient
    .from("social_friend_requests")
    .select("id, requester_id, addressee_id, status, created_at, updated_at")
    .eq("addressee_id", currentUser.id)
    .eq("status", "pending")
    .order("updated_at", { ascending: false })
    .limit(100);

  if (requestError) {
    return;
  }

  const safeRequests = Array.isArray(requestRows) ? requestRows : [];
  if (safeRequests.length === 0) {
    await trackAndNotifyFriendRequests([], new Map());
    return;
  }

  const requesterIds = Array.from(new Set(safeRequests.map((item) => String(item.requester_id || "")).filter(Boolean)));
  const { data: requesterProfiles } = await supabaseClient
    .from("user_profiles")
    .select("*")
    .in("user_id", requesterIds);

  const requestProfileMap = new Map(
    (Array.isArray(requesterProfiles) ? requesterProfiles : []).map((row) => {
      const safe = normalizeProfile(row, null);
      return [safe.user_id, safe];
    })
  );

  await trackAndNotifyFriendRequests(safeRequests, requestProfileMap);
}

async function trackAndNotifyIncomingMessages(messageRows, profileMap, friendIds) {
  if (!currentUser || !Array.isArray(messageRows)) {
    return;
  }

  const incoming = messageRows
    .filter((row) =>
      row &&
      row.receiver_id === currentUser.id &&
      friendIds.includes(String(row.sender_id))
    )
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  if (!messageNotificationPrimed) {
    incoming.forEach((row) => {
      if (row?.id) {
        knownIncomingMessageIds.add(String(row.id));
      }
    });
    messageNotificationPrimed = true;
    return;
  }

  for (const row of incoming) {
    const msgId = String(row?.id || "");
    if (!msgId || knownIncomingMessageIds.has(msgId)) {
      continue;
    }
    knownIncomingMessageIds.add(msgId);

    const senderId = String(row.sender_id || "");
    const sender = profileMap.get(senderId);
    const senderName = sender?.display_name || "Amigo";
    const isActiveConversationOpen =
      getCurrentPageName() === "chats.html" &&
      document.visibilityState === "visible" &&
      inboxActiveUserId === senderId;

    if (isActiveConversationOpen) {
      continue;
    }

    const messageText = String(row.content || "").trim();
    await showDeviceNotification(`Nova mensagem de ${senderName}`, {
      body: messageText.length > 120 ? `${messageText.slice(0, 117)}...` : messageText,
      tag: `msg-${msgId}`,
      data: { url: "chats.html" },
    });
  }

  if (knownIncomingMessageIds.size > 2500) {
    const ids = Array.from(knownIncomingMessageIds).slice(-1200);
    knownIncomingMessageIds = new Set(ids);
  }
}

async function trackAndNotifyFriendRequests(requestRows, profileMap) {
  if (!currentUser || !Array.isArray(requestRows)) {
    return;
  }

  const currentIds = new Set(requestRows.map((row) => String(row.id || "")).filter(Boolean));
  if (!requestNotificationPrimed) {
    currentIds.forEach((id) => knownPendingRequestIds.add(id));
    requestNotificationPrimed = true;
    return;
  }

  for (const row of requestRows) {
    const id = String(row?.id || "");
    if (!id || knownPendingRequestIds.has(id)) {
      continue;
    }
    knownPendingRequestIds.add(id);
    const profile = profileMap.get(String(row.requester_id || ""));
    const name = profile?.display_name || "Usuário";
    await showDeviceNotification("Novo pedido de amizade", {
      body: `${name} enviou um pedido para você.`,
      tag: `friend-request-${id}`,
      data: { url: "notificacoes.html" },
    });
  }

  // Remove ids já resolvidos para não crescer sem limite.
  knownPendingRequestIds.forEach((id) => {
    if (!currentIds.has(id)) {
      knownPendingRequestIds.delete(id);
    }
  });
}

function setupProfileHubUI() {
  if (!profileHubRoot || !profileHubOpenLogin) {
    return;
  }

  profileHubOpenLogin.addEventListener("click", () => {
    if (!authPanel || !authToggle) {
      return;
    }
    setAuthPanelState(true);
  });
}

function updateProfileHubUI() {
  if (!profileHubRoot || !profileHubGuest || !profileHubUser) {
    return;
  }

  if (currentUser) {
    profileHubGuest.classList.add("hidden");
    profileHubUser.classList.remove("hidden");
    if (profileHubDisplayName) {
      const displayName = currentProfile?.display_name || getUserDisplayName(currentUser);
      profileHubDisplayName.textContent = `Conta de ${displayName}`;
    }
  } else {
    profileHubGuest.classList.remove("hidden");
    profileHubUser.classList.add("hidden");
    if (profileHubDisplayName) {
      profileHubDisplayName.textContent = "Conta";
    }
  }
}

function setupInboxUI() {
  if (!inboxPageRoot) {
    return;
  }

  if (inboxThreadList) {
    inboxThreadList.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }
      const item = target.closest(".inbox-thread[data-user-id]");
      if (!item) {
        return;
      }
      const userId = String(item.getAttribute("data-user-id") || "");
      if (!userId) {
        return;
      }
      void selectInboxThread(userId);
    });
  }

  if (inboxMessageForm && inboxMessageInput) {
    inboxMessageForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (!supabaseReady || !currentUser || !inboxActiveUserId) {
        setInboxComposerFeedback("Abra um chat válido para enviar mensagens.", true);
        return;
      }

      const content = String(inboxMessageInput.value || "").trim();
      if (!content) {
        return;
      }
      if (content.length > 1200) {
        setInboxComposerFeedback("Mensagem muito longa (máximo 1200 caracteres).", true);
        return;
      }

      const { error } = await supabaseClient
        .from("social_messages")
        .insert({
          sender_id: currentUser.id,
          receiver_id: inboxActiveUserId,
          content,
          created_at: new Date().toISOString(),
        });

      if (error) {
        setInboxComposerFeedback(getFriendlySocialError(error, "Não foi possível enviar a mensagem."), true);
        return;
      }

      inboxMessageInput.value = "";
      setInboxComposerFeedback("Mensagem enviada.");
      await loadInboxMessages(inboxActiveUserId);
      await loadInboxPageData();
    });
  }
}

function resetInboxUI(message = "") {
  stopInboxPolling();
  inboxThreadsCache = [];
  inboxActiveUserId = "";

  if (inboxThreadList) {
    inboxThreadList.innerHTML = "";
  }
  if (inboxMessages) {
    inboxMessages.innerHTML = "";
  }
  if (inboxActiveName) {
    inboxActiveName.textContent = "Selecione um chat";
  }
  if (inboxActiveMeta) {
    inboxActiveMeta.textContent = "A conversa aparece aqui.";
  }
  if (inboxMessageForm) {
    inboxMessageForm.classList.add("hidden");
  }
  if (inboxComposerFeedback) {
    inboxComposerFeedback.textContent = "";
    inboxComposerFeedback.classList.remove("error");
  }
  setInboxFeedback(message || "");
}

function setInboxFeedback(message, isError = false) {
  if (!inboxFeedback) {
    return;
  }
  inboxFeedback.textContent = message;
  inboxFeedback.classList.toggle("error", Boolean(isError));
}

function setInboxComposerFeedback(message, isError = false) {
  if (!inboxComposerFeedback) {
    return;
  }
  inboxComposerFeedback.textContent = message;
  inboxComposerFeedback.classList.toggle("error", Boolean(isError));
}

async function loadInboxPageData() {
  if (!inboxPageRoot) {
    return;
  }

  if (!supabaseReady) {
    resetInboxUI("Supabase não configurado.");
    return;
  }

  if (!currentUser) {
    resetInboxUI("Entre na sua conta para acessar os chats.");
    return;
  }

  const friendIds = await loadFriendIdsForCurrentUser();
  if (friendIds.length === 0) {
    resetInboxUI("Você ainda não possui amizades aceitas.");
    return;
  }

  const { data: profileRows, error: profileError } = await supabaseClient
    .from("user_profiles")
    .select("*")
    .in("user_id", friendIds);

  if (profileError) {
    resetInboxUI(getFriendlySocialError(profileError, "Não foi possível carregar os perfis dos chats."));
    return;
  }

  const profileMap = new Map(
    (Array.isArray(profileRows) ? profileRows : []).map((row) => {
      const safe = normalizeProfile(row, null);
      return [safe.user_id, safe];
    })
  );

  const { data: messageRows, error: messageError } = await supabaseClient
    .from("social_messages")
    .select("id, sender_id, receiver_id, content, created_at")
    .or(`sender_id.eq.${currentUser.id},receiver_id.eq.${currentUser.id}`)
    .order("created_at", { ascending: false })
    .limit(600);

  if (messageError) {
    resetInboxUI(getFriendlySocialError(messageError, "Não foi possível carregar os chats."));
    return;
  }

  await trackAndNotifyIncomingMessages(
    Array.isArray(messageRows) ? messageRows : [],
    profileMap,
    friendIds
  );

  const lastByFriend = new Map();
  (Array.isArray(messageRows) ? messageRows : []).forEach((msg) => {
    const friendId = msg.sender_id === currentUser.id ? msg.receiver_id : msg.sender_id;
    if (!friendIds.includes(friendId)) {
      return;
    }
    if (!lastByFriend.has(friendId)) {
      lastByFriend.set(friendId, msg);
    }
  });

  inboxThreadsCache = friendIds.map((friendId) => {
    const profile = profileMap.get(friendId) || normalizeProfile({ user_id: friendId, display_name: "Usuário" }, null);
    return {
      friendId,
      profile,
      lastMessage: lastByFriend.get(friendId) || null,
    };
  }).sort((a, b) => {
    const timeA = a.lastMessage?.created_at ? new Date(a.lastMessage.created_at).getTime() : 0;
    const timeB = b.lastMessage?.created_at ? new Date(b.lastMessage.created_at).getTime() : 0;
    return timeB - timeA;
  });

  if (!inboxActiveUserId || !friendIds.includes(inboxActiveUserId)) {
    inboxActiveUserId = inboxThreadsCache[0]?.friendId || "";
  }

  renderInboxThreads();

  if (!inboxActiveUserId) {
    resetInboxUI("Sem conversas disponíveis.");
    return;
  }

  await loadInboxMessages(inboxActiveUserId);
  startInboxPolling();
}

function renderInboxThreads() {
  if (!inboxThreadList) {
    return;
  }

  if (inboxThreadsCache.length === 0) {
    inboxThreadList.innerHTML = "<article class=\"inbox-thread-empty\">Sem conversas ainda.</article>";
    return;
  }

  inboxThreadList.innerHTML = inboxThreadsCache.map((item) => {
    const safe = item.profile;
    const last = item.lastMessage;
    const preview = last ? escapeHTML(String(last.content || "").slice(0, 70)) : "Sem mensagens ainda";
    const when = last?.created_at ? new Date(last.created_at).toLocaleDateString("pt-BR") : "";
    const isActive = inboxActiveUserId === item.friendId;
    return `
      <button class="inbox-thread ${isActive ? "active" : ""}" type="button" data-user-id="${item.friendId}" aria-label="Abrir chat com ${escapeHTML(safe.display_name)}">
        <img class="inbox-thread-avatar" src="${escapeAttr(getAvatarSrc(safe))}" alt="Foto de ${escapeHTML(safe.display_name)}" />
        <span class="inbox-thread-body">
          <strong class="inbox-thread-name">${escapeHTML(safe.display_name)}</strong>
          <span class="inbox-thread-preview">${preview}</span>
        </span>
        <span class="inbox-thread-time">${when}</span>
      </button>
    `;
  }).join("");
}

async function selectInboxThread(friendId) {
  inboxActiveUserId = friendId;
  renderInboxThreads();
  await loadInboxMessages(friendId);
}

async function loadInboxMessages(friendId) {
  if (!inboxMessages || !currentUser || !friendId) {
    return;
  }

  const thread = inboxThreadsCache.find((item) => item.friendId === friendId);
  if (inboxActiveName) {
    inboxActiveName.textContent = thread?.profile?.display_name || "Conversa";
  }
  if (inboxActiveMeta) {
    inboxActiveMeta.textContent = "Chat entre amigos";
  }
  if (inboxMessageForm) {
    inboxMessageForm.classList.remove("hidden");
  }

  const filter = `and(sender_id.eq.${currentUser.id},receiver_id.eq.${friendId}),and(sender_id.eq.${friendId},receiver_id.eq.${currentUser.id})`;
  const { data, error } = await supabaseClient
    .from("social_messages")
    .select("id, sender_id, receiver_id, content, created_at")
    .or(filter)
    .order("created_at", { ascending: true })
    .limit(300);

  if (error) {
    setInboxComposerFeedback(getFriendlySocialError(error, "Não foi possível carregar as mensagens."), true);
    return;
  }

  if (!Array.isArray(data) || data.length === 0) {
    inboxMessages.innerHTML = "<article class=\"chat-bubble\"><span class=\"chat-meta\">Sem mensagens</span><p class=\"chat-content\">Comece a conversa com seu amigo.</p></article>";
    return;
  }

  inboxMessages.innerHTML = data.map((msg) => {
    const mine = msg.sender_id === currentUser.id;
    const when = msg.created_at ? new Date(msg.created_at).toLocaleString("pt-BR") : "-";
    return `
      <article class="chat-bubble ${mine ? "mine" : ""}">
        <span class="chat-meta">${mine ? "Você" : "Amigo"} • ${when}</span>
        <p class="chat-content">${escapeHTML(String(msg.content || ""))}</p>
      </article>
    `;
  }).join("");

  inboxMessages.scrollTop = inboxMessages.scrollHeight;
}

function startInboxPolling() {
  if (!inboxPageRoot || !currentUser) {
    return;
  }
  stopInboxPolling();
  inboxPollTimer = window.setInterval(() => {
    if (!document.body.contains(inboxPageRoot) || !inboxActiveUserId) {
      return;
    }
    void loadInboxMessages(inboxActiveUserId);
    void loadInboxPageData();
  }, 8000);
}

function stopInboxPolling() {
  if (inboxPollTimer) {
    clearInterval(inboxPollTimer);
    inboxPollTimer = null;
  }
}

async function loadFriendIdsForCurrentUser() {
  if (!currentUser) {
    return [];
  }

  const [aRes, bRes] = await Promise.all([
    supabaseClient
      .from("social_friendships")
      .select("user_b")
      .eq("user_a", currentUser.id),
    supabaseClient
      .from("social_friendships")
      .select("user_a")
      .eq("user_b", currentUser.id),
  ]);

  const ids = new Set();
  (Array.isArray(aRes?.data) ? aRes.data : []).forEach((row) => {
    if (row?.user_b) {
      ids.add(String(row.user_b));
    }
  });
  (Array.isArray(bRes?.data) ? bRes.data : []).forEach((row) => {
    if (row?.user_a) {
      ids.add(String(row.user_a));
    }
  });

  return Array.from(ids);
}

function setupNotificationsUI() {
  if (deviceNotifyEnableBtn) {
    deviceNotifyEnableBtn.addEventListener("click", async () => {
      const granted = await requestDeviceNotificationPermission();
      if (granted) {
        showBottomNotice("Notificações do dispositivo ativadas.");
      } else if (canUseDeviceNotifications() && Notification.permission !== "granted") {
        showBottomNotice("Permissão de notificação não concedida.");
      }
    });
  }

  syncDeviceNotificationStatusUI();

  if (!notificationsRoot || !notificationsList) {
    return;
  }

  notificationsList.addEventListener("click", async (event) => {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }
    const actionButton = target.closest("button[data-request-id][data-action]");
    if (!actionButton) {
      return;
    }
    const requestId = String(actionButton.getAttribute("data-request-id") || "");
    const requesterId = String(actionButton.getAttribute("data-requester-id") || "");
    const action = String(actionButton.getAttribute("data-action") || "");
    if (!requestId || !action) {
      return;
    }
    await handleNotificationAction(requestId, requesterId, action);
  });
}

function resetNotificationsUI(message = "") {
  if (notificationsList) {
    notificationsList.innerHTML = "";
  }
  setNotificationsFeedback(message, false);
  syncDeviceNotificationStatusUI();
}

function setNotificationsFeedback(message, isError = false) {
  if (!notificationsFeedback) {
    return;
  }
  notificationsFeedback.textContent = message;
  notificationsFeedback.classList.toggle("error", Boolean(isError));
}

async function loadNotificationsPageData() {
  if (!notificationsRoot || !notificationsList) {
    return;
  }

  if (!supabaseReady) {
    resetNotificationsUI("Supabase não configurado.");
    return;
  }

  if (!currentUser) {
    resetNotificationsUI("Entre na sua conta para ver notificações.");
    return;
  }

  const { data: requests, error } = await supabaseClient
    .from("social_friend_requests")
    .select("id, requester_id, addressee_id, status, created_at, updated_at")
    .eq("addressee_id", currentUser.id)
    .eq("status", "pending")
    .order("updated_at", { ascending: false });

  if (error) {
    resetNotificationsUI(getFriendlySocialError(error, "Não foi possível carregar notificações."));
    setNotificationsFeedback(getFriendlySocialError(error, "Não foi possível carregar notificações."), true);
    return;
  }

  const safeRequests = Array.isArray(requests) ? requests : [];
  if (safeRequests.length === 0) {
    await trackAndNotifyFriendRequests([], new Map());
    notificationsList.innerHTML = "<article class=\"notification-item\"><p class=\"vault-meta\">Sem notificações novas no momento.</p></article>";
    setNotificationsFeedback("");
    return;
  }

  const requesterIds = Array.from(new Set(safeRequests.map((item) => String(item.requester_id)).filter(Boolean)));
  const { data: profilesData } = await supabaseClient
    .from("user_profiles")
    .select("*")
    .in("user_id", requesterIds);

  const profileMap = new Map(
    (Array.isArray(profilesData) ? profilesData : []).map((row) => {
      const safe = normalizeProfile(row, null);
      return [safe.user_id, safe];
    })
  );

  await trackAndNotifyFriendRequests(safeRequests, profileMap);

  notificationsList.innerHTML = safeRequests.map((item) => {
    const profile = profileMap.get(String(item.requester_id)) || normalizeProfile({ user_id: item.requester_id, display_name: "Usuário" }, null);
    const when = item.created_at ? new Date(item.created_at).toLocaleString("pt-BR") : "-";
    return `
      <article class="notification-item">
        <img class="notification-avatar" src="${escapeAttr(getAvatarSrc(profile))}" alt="Foto de ${escapeHTML(profile.display_name)}" />
        <div class="notification-content">
          <strong>${escapeHTML(profile.display_name)}</strong>
          <p class="vault-meta">Enviou pedido de amizade • ${when}</p>
          <div class="notification-actions">
            <button class="btn btn-primary" type="button" data-action="accept" data-request-id="${item.id}" data-requester-id="${item.requester_id}">Aceitar</button>
            <button class="btn btn-ghost" type="button" data-action="reject" data-request-id="${item.id}" data-requester-id="${item.requester_id}">Recusar</button>
          </div>
        </div>
      </article>
    `;
  }).join("");

  setNotificationsFeedback("");
}

async function handleNotificationAction(requestId, requesterId, action) {
  if (!currentUser) {
    setNotificationsFeedback("Entre na sua conta para responder pedidos.", true);
    return;
  }

  const nextStatus = action === "accept" ? "accepted" : "rejected";
  const { error: updateError } = await supabaseClient
    .from("social_friend_requests")
    .update({ status: nextStatus, updated_at: new Date().toISOString() })
    .eq("id", requestId)
    .eq("addressee_id", currentUser.id)
    .eq("status", "pending");

  if (updateError) {
    setNotificationsFeedback(getFriendlySocialError(updateError, "Não foi possível atualizar a solicitação."), true);
    return;
  }

  if (nextStatus === "accepted") {
    const [userA, userB] = canonicalPairIds(currentUser.id, requesterId);
    const { error: friendshipError } = await supabaseClient
      .from("social_friendships")
      .upsert(
        { user_a: userA, user_b: userB, created_at: new Date().toISOString() },
        { onConflict: "user_a,user_b" }
      );

    if (friendshipError) {
      setNotificationsFeedback(getFriendlySocialError(friendshipError, "Amizade não foi criada."), true);
      return;
    }
  }

  setNotificationsFeedback(nextStatus === "accepted" ? "Pedido aceito com sucesso." : "Pedido recusado.");
  await loadNotificationsPageData();
  await loadInboxPageData();
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
      updateBottomNavActiveState();
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
  const cards = document.querySelectorAll("#activeVaultList .vault-card, #achievementVaultList .vault-card");
  cards.forEach((card, index) => {
    card.classList.remove("card-enter");
    card.style.animationDelay = `${Math.min(index * 70, 280)}ms`;
    void card.offsetWidth;
    card.classList.add("card-enter");
  });
}

function setupAuthWidget() {
  if (!authToggle || !authPanel || !authClose) {
    return;
  }

  lockAuthToggleWidth();

  authToggle.addEventListener("click", () => {
    const isOpen = !authPanel.classList.contains("is-open");
    setAuthPanelState(isOpen);
  });

  authClose.addEventListener("click", () => {
    closeAuthWidget();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeAuthWidget();
    }
  });

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Node)) {
      return;
    }
    if (!authPanel.classList.contains("is-open")) {
      return;
    }
    if (!authPanel.contains(target) && !authToggle.contains(target)) {
      closeAuthWidget();
    }
  });
}

function closeAuthWidget() {
  setAuthPanelState(false);
}

function setAuthPanelState(isOpen) {
  if (!authToggle || !authPanel) {
    return;
  }
  authPanel.classList.toggle("is-open", isOpen);
  authPanel.setAttribute("aria-hidden", String(!isOpen));
  authToggle.setAttribute("aria-expanded", String(isOpen));
  authToggle.classList.toggle("is-active", isOpen);

  if (bottomAuthToggle) {
    bottomAuthToggle.setAttribute("aria-expanded", String(isOpen));
    bottomAuthToggle.classList.toggle("is-active", isOpen);
  }
}

function updateAuthUI() {
  if (!authGuest || !authUser || !authUserName) {
    return;
  }

  lockAuthToggleWidth();

  if (currentUser) {
    const displayName = currentProfile?.display_name || getUserDisplayName(currentUser);
    authGuest.classList.add("hidden");
    authUser.classList.remove("hidden");
    authUserName.textContent = displayName;
    if (authToggle) {
      authToggle.textContent = displayName;
      authToggle.title = displayName;
      authToggle.setAttribute("aria-label", `Abrir conta de ${displayName}`);
    }
    if (bottomAuthLabel) {
      bottomAuthLabel.textContent = "Perfil";
    }
    if (bottomAuthToggle) {
      bottomAuthToggle.title = displayName;
      bottomAuthToggle.setAttribute("aria-label", `Abrir conta de ${displayName}`);
    }
  } else {
    authGuest.classList.remove("hidden");
    authUser.classList.add("hidden");
    authUserName.textContent = "";
    if (authToggle) {
      authToggle.textContent = "Login";
      authToggle.title = "Login";
      authToggle.setAttribute("aria-label", "Abrir login");
    }
    if (bottomAuthLabel) {
      bottomAuthLabel.textContent = "Perfil";
    }
    if (bottomAuthToggle) {
      bottomAuthToggle.title = "Login";
      bottomAuthToggle.setAttribute("aria-label", "Abrir login");
    }
  }

  syncDeviceNotificationStatusUI();
}

function getUserDisplayName(user) {
  const fallback = "Usuário";
  const raw = String(user?.user_metadata?.name || user?.email || fallback).trim();
  if (!raw) {
    return fallback;
  }
  if (raw.includes("@")) {
    const emailName = raw.split("@")[0].trim();
    return emailName || fallback;
  }
  return raw;
}

function lockAuthToggleWidth() {
  if (!authToggle || authToggleFixedWidth) {
    return;
  }
  const width = Math.ceil(authToggle.getBoundingClientRect().width);
  authToggleFixedWidth = `${Math.max(width, 72)}px`;
  authToggle.style.width = authToggleFixedWidth;
}

function toggleAuthTab(tab) {
  if (!tabLogin || !tabRegister || !loginForm || !registerForm) {
    return;
  }

  const isLogin = tab === "login";
  tabLogin.classList.toggle("active", isLogin);
  tabRegister.classList.toggle("active", !isLogin);
  loginForm.classList.toggle("hidden", !isLogin);
  registerForm.classList.toggle("hidden", isLogin);
}

function setAuthMessage(message) {
  if (!authFeedback) {
    return;
  }
  authFeedback.classList.remove("error");
  authFeedback.textContent = message;
}

function setAuthError(message) {
  if (!authFeedback) {
    return;
  }
  authFeedback.classList.add("error");
  authFeedback.textContent = message;
}

function getFriendlyAuthError(error) {
  const rawCode = String(error?.code || "").trim().toLowerCase();
  const rawStatus = Number(error?.status || 0);
  const rawMessage = String(error?.message || error?.error_description || "").trim();
  const raw = rawMessage.toLowerCase();

  if (
    rawCode.includes("user_already_exists") ||
    rawCode.includes("email_address_taken") ||
    raw.includes("already registered") ||
    raw.includes("already exists") ||
    raw.includes("ja existe")
  ) {
    return "Ja existe uma conta com este e-mail. Tente entrar ou recuperar a senha.";
  }

  if (
    rawCode.includes("email_not_confirmed") ||
    raw.includes("email not confirmed")
  ) {
    return "Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada e spam.";
  }

  if (
    rawCode.includes("invalid_email") ||
    raw.includes("invalid email")
  ) {
    return "E-mail invalido. Revise o endereco digitado e tente novamente.";
  }

  if (
    rawCode.includes("weak_password") ||
    raw.includes("password should be") ||
    raw.includes("password is too weak")
  ) {
    return "Senha fraca. Use pelo menos 6 caracteres com letras e numeros.";
  }

  if (
    rawCode.includes("signup_disabled") ||
    raw.includes("signups not allowed")
  ) {
    return "Cadastro temporariamente desativado na configuracao do Supabase.";
  }

  if (raw.includes("email rate limit") || raw.includes("rate limit") || rawStatus === 429) {
    return "Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente novamente.";
  }

  if (raw.includes("failed to fetch") || raw.includes("networkerror") || raw.includes("network request failed")) {
    return "Falha de conexao com o Supabase. Verifique internet, URL do projeto e chave publica.";
  }

  if (rawStatus >= 500) {
    return "Falha temporária no servidor de autenticação. Tente novamente em alguns minutos.";
  }

  if (!rawMessage || rawMessage === "{}" || rawMessage === "[object object]") {
    return "Não foi possível concluir a autenticação agora. Aguarde alguns minutos e tente novamente.";
  }

  return rawMessage;
}
function showError(message) {
  if (feedback) {
    feedback.textContent = message;
    feedback.classList.add("error");
    return;
  }
  showBottomNotice(message);
}

function escapeHTML(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function escapeAttr(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function setupVaultGroupToggles() {
  bindVaultGroupToggle("active", vaultGroupActive, toggleActiveVaultsBtn);
  bindVaultGroupToggle("achievements", vaultGroupAchievements, toggleAchievementVaultsBtn);
}

function bindVaultGroupToggle(key, sectionNode, buttonNode) {
  if (!sectionNode || !buttonNode) {
    return;
  }

  const storageKey = `vault_group_collapsed_${key}`;
  let collapsed = false;
  try {
    collapsed = localStorage.getItem(storageKey) === "1";
  } catch (_error) {
    collapsed = false;
  }

  applyVaultGroupState(sectionNode, buttonNode, collapsed);

  buttonNode.addEventListener("click", () => {
    const isCollapsed = sectionNode.classList.toggle("is-collapsed");
    applyVaultGroupState(sectionNode, buttonNode, isCollapsed);
    try {
      localStorage.setItem(storageKey, isCollapsed ? "1" : "0");
    } catch (_error) {
      // Sem bloqueio se localStorage não estiver disponível.
    }
  });
}

function applyVaultGroupState(sectionNode, buttonNode, collapsed) {
  sectionNode.classList.toggle("is-collapsed", collapsed);
  buttonNode.setAttribute("aria-expanded", String(!collapsed));
  buttonNode.textContent = collapsed ? "Expandir" : "Minimizar";
}

function setupInteractionAnimations() {
  if (!document.body) {
    return;
  }

  document.body.classList.add("ui-boot");
  window.setTimeout(() => {
    document.body?.classList.add("ui-boot-ready");
  }, 30);

  setupInteractionPointerFeedback();
  setupFeedbackMotionObserver();
  setupDynamicInsertMotion();
}

function setupInteractionPointerFeedback() {
  const releasePressedState = () => {
    document.querySelectorAll(".interaction-press, .interaction-key-press").forEach((node) => {
      node.classList.remove("interaction-press", "interaction-key-press");
    });
  };

  document.addEventListener("pointerdown", (event) => {
    const target = resolveInteractionTarget(event.target);
    if (!target) {
      return;
    }

    target.classList.add("interaction-press");
    createInteractionRipple(target, event);
  }, { passive: true });

  document.addEventListener("pointerup", releasePressedState, { passive: true });
  document.addEventListener("pointercancel", releasePressedState, { passive: true });
  document.addEventListener("mouseleave", releasePressedState, { passive: true });
  window.addEventListener("blur", releasePressedState);

  document.addEventListener("keydown", (event) => {
    if (event.repeat) {
      return;
    }
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    const target = resolveInteractionTarget(event.target);
    if (!target) {
      return;
    }

    target.classList.add("interaction-key-press");
    createInteractionRipple(target, null);
  });

  document.addEventListener("keyup", (event) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }
    const target = resolveInteractionTarget(event.target);
    if (!target) {
      return;
    }
    target.classList.remove("interaction-key-press");
  });
}

function resolveInteractionTarget(startNode) {
  if (!(startNode instanceof Element)) {
    return null;
  }

  const target = startNode.closest(INTERACTION_TARGET_SELECTOR);
  if (!(target instanceof HTMLElement)) {
    return null;
  }

  if (target.hasAttribute("disabled") || target.getAttribute("aria-disabled") === "true") {
    return null;
  }

  if (target instanceof HTMLInputElement) {
    const type = String(target.type || "").toLowerCase();
    if (type === "text" || type === "email" || type === "password" || type === "number" || type === "search") {
      return null;
    }
  }

  return target;
}

function createInteractionRipple(target, event) {
  if (!(target instanceof HTMLElement)) {
    return;
  }

  const computed = window.getComputedStyle(target);
  if (computed.display === "inline") {
    return;
  }

  const rect = target.getBoundingClientRect();
  if (rect.width < 14 || rect.height < 14) {
    return;
  }

  target.classList.add("has-interaction-layer");
  const ripple = document.createElement("span");
  ripple.className = "ui-ripple";

  const diameter = Math.max(rect.width, rect.height) * 1.35;
  let x = rect.width / 2;
  let y = rect.height / 2;

  if (event && Number.isFinite(event.clientX) && Number.isFinite(event.clientY)) {
    x = event.clientX - rect.left;
    y = event.clientY - rect.top;
  }

  ripple.style.width = `${diameter}px`;
  ripple.style.height = `${diameter}px`;
  ripple.style.left = `${x - (diameter / 2)}px`;
  ripple.style.top = `${y - (diameter / 2)}px`;
  target.appendChild(ripple);

  ripple.addEventListener("animationend", () => {
    ripple.remove();
  }, { once: true });
}

function setupFeedbackMotionObserver() {
  if (feedbackMotionObserver) {
    feedbackMotionObserver.disconnect();
    feedbackMotionObserver = null;
  }

  const feedbackNodes = document.querySelectorAll(".feedback");
  feedbackNodes.forEach((node) => {
    if (node instanceof HTMLElement && String(node.textContent || "").trim()) {
      animateFeedbackNode(node);
    }
  });

  feedbackMotionObserver = new MutationObserver((mutationList) => {
    mutationList.forEach((mutation) => {
      if (mutation.type === "characterData") {
        const parent = mutation.target?.parentElement?.closest?.(".feedback");
        if (parent instanceof HTMLElement) {
          animateFeedbackNode(parent);
        }
        return;
      }

      if (mutation.type === "attributes") {
        const target = mutation.target;
        if (target instanceof HTMLElement && target.matches(".feedback")) {
          animateFeedbackNode(target);
        }
        return;
      }

      if (mutation.type === "childList") {
        mutation.addedNodes.forEach((node) => {
          if (!(node instanceof Element)) {
            return;
          }
          if (node.matches(".feedback")) {
            animateFeedbackNode(node);
          }
          node.querySelectorAll?.(".feedback").forEach((child) => {
            if (child instanceof HTMLElement) {
              animateFeedbackNode(child);
            }
          });
        });
      }
    });
  });

  feedbackMotionObserver.observe(document.body, {
    subtree: true,
    childList: true,
    characterData: true,
    attributes: true,
    attributeFilter: ["class"],
  });
}

function animateFeedbackNode(node) {
  if (!(node instanceof HTMLElement)) {
    return;
  }

  const message = String(node.textContent || "").trim();
  if (!message) {
    return;
  }

  node.classList.remove("feedback-pop-ok", "feedback-pop-error");
  void node.offsetWidth;
  node.classList.add(node.classList.contains("error") ? "feedback-pop-error" : "feedback-pop-ok");
}

function setupDynamicInsertMotion() {
  if (interactionInsertObserver) {
    interactionInsertObserver.disconnect();
    interactionInsertObserver = null;
  }

  const animatedSelector = [
    ".vault-card",
    ".ranking-item",
    ".notification-item",
    ".inbox-thread",
    ".chat-bubble",
    ".achievement-card",
    ".panel",
    ".vault-group",
    ".vault-stat-card",
  ].join(",");

  interactionInsertObserver = new MutationObserver((mutationList) => {
    mutationList.forEach((mutation) => {
      if (mutation.type !== "childList" || mutation.addedNodes.length === 0) {
        return;
      }

      mutation.addedNodes.forEach((node) => {
        if (!(node instanceof Element)) {
          return;
        }

        if (node.matches(animatedSelector)) {
          queueEnterAnimation(node);
        }

        node.querySelectorAll?.(animatedSelector).forEach((child) => {
          if (child instanceof HTMLElement) {
            queueEnterAnimation(child);
          }
        });
      });
    });
  });

  interactionInsertObserver.observe(document.body, {
    subtree: true,
    childList: true,
  });
}

function queueEnterAnimation(node) {
  if (!(node instanceof HTMLElement) || node.classList.contains("ui-enter")) {
    return;
  }
  node.classList.add("ui-enter");
  window.setTimeout(() => {
    node.classList.remove("ui-enter");
  }, 650);
}
