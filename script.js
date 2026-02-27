const formatBRL = (value) => {
  const safeValue = Number.isFinite(Number(value)) ? Number(value) : 0;
  const absolute = Math.abs(safeValue);
  const fixed = absolute.toFixed(2);
  const [intPart, decimalPart] = fixed.split(".");
  const withThousands = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const prefix = safeValue < 0 ? "-$ " : "$ ";
  return `${prefix}${withThousands},${decimalPart}`;
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
const authToggle = document.getElementById("authToggle");
const authPanel = document.getElementById("authPanel");
const authClose = document.getElementById("authClose");
const profileForm = document.getElementById("profileForm");
const profileDisplayNameInput = document.getElementById("profileDisplayName");
const profileThemeSelect = document.getElementById("profileTheme");
const profileAccentColorInput = document.getElementById("profileAccentColor");
const profileNameFontSelect = document.getElementById("profileNameFont");
const profileDecorationSelect = document.getElementById("profileDecoration");
const profileAvatarFileInput = document.getElementById("profileAvatarFile");
const profileRemoveAvatarBtn = document.getElementById("profileRemoveAvatarBtn");
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
const rankingProfileCreated = document.getElementById("rankingProfileCreated");
const rankingProfileUpdated = document.getElementById("rankingProfileUpdated");

const vaults = [];
let currentUser = null;
let supabaseClient = null;
let supabaseReady = false;
let authToggleFixedWidth = "";
let currentProfile = null;
let profileAvatarDraftUrl = "";
let rankingCache = [];

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
setupAuthWidget();
setupAuthUI();
setupProfileUI();
setupRankingInteractions();
setupVaultHandlers();
setupMoneyInputs();
setupVaultGroupToggles();
init();

async function init() {
  supabaseReady = initSupabase();

  if (!supabaseReady) {
    setAuthError("Configure SUPABASE_URL e SUPABASE_ANON_KEY em supabase-config.js.");
    disableAuthForms();
    resetProfileUI();
    updateVaultAccessState();
    renderVaults();
    renderRanking([]);
    return;
  }

  const { data, error } = await supabaseClient.auth.getSession();
  if (error) {
    setAuthError(getFriendlyAuthError(error));
  }

  currentUser = data?.session?.user || null;
  if (currentUser) {
    await loadVaultsFromDb();
    await loadUserProfile();
  } else {
    resetProfileUI();
  }
  await loadGlobalRanking();

  supabaseClient.auth.onAuthStateChange(async (_event, session) => {
    currentUser = session?.user || null;
    if (currentUser) {
      await loadVaultsFromDb();
      await loadUserProfile();
    } else {
      vaults.splice(0, vaults.length);
      currentProfile = null;
      resetProfileUI();
    }
    await loadGlobalRanking();
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
      setAuthError("Supabase nao configurado.");
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
    } catch (error) {
      setAuthError(getFriendlyAuthError(error));
    }
  });

  registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!supabaseReady) {
      setAuthError("Supabase nao configurado.");
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
      setAuthError("A senha precisa ter no minimo 6 caracteres.");
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
        setAuthError("Nao foi possivel criar sua conta agora. Tente novamente em instantes.");
        return;
      }
      if (data.session) {
        setAuthMessage("Conta criada e login efetuado.");
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
    feedback.textContent = "";
    feedback.classList.remove("error");
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
      avatar_url: draft.avatar_url,
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
  profileForm.querySelectorAll("input, select, button").forEach((el) => {
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

function getDefaultProfile(user) {
  return {
    user_id: user?.id || "",
    display_name: getUserDisplayName(user),
    theme_key: "neon",
    accent_color: "#0ce0ff",
    name_font: "sora",
    decoration: "glow",
    avatar_url: "",
    goals_completed: 0,
    created_at: typeof user?.created_at === "string" ? user.created_at : new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

function normalizeProfile(input, user = currentUser) {
  const safe = input && typeof input === "object" ? input : {};
  const fallback = getDefaultProfile(user);
  const theme = ["neon", "ocean", "sunset", "graphite"].includes(String(safe.theme_key || "").toLowerCase())
    ? String(safe.theme_key).toLowerCase()
    : fallback.theme_key;
  const nameFont = ["sora", "manrope", "space", "poppins"].includes(String(safe.name_font || "").toLowerCase())
    ? String(safe.name_font).toLowerCase()
    : fallback.name_font;
  const decoration = ["glow", "ring", "spark"].includes(String(safe.decoration || "").toLowerCase())
    ? String(safe.decoration).toLowerCase()
    : fallback.decoration;
  const accent = isValidHexColor(safe.accent_color) ? String(safe.accent_color).toLowerCase() : fallback.accent_color;
  const displayName = String(safe.display_name || fallback.display_name).trim().slice(0, 32) || fallback.display_name;
  const avatarUrl = sanitizeAvatarUrl(safe.avatar_url || fallback.avatar_url || "");
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
    avatar_url: avatarUrl,
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

function collectProfileDraft(user, fallbackProfile) {
  const fallback = normalizeProfile(fallbackProfile, user);
  const displayName = String(profileDisplayNameInput?.value || fallback.display_name).trim().slice(0, 32) || fallback.display_name;
  const theme = String(profileThemeSelect?.value || fallback.theme_key).toLowerCase();
  const accent = String(profileAccentColorInput?.value || fallback.accent_color).toLowerCase();
  const nameFont = String(profileNameFontSelect?.value || fallback.name_font).toLowerCase();
  const decoration = String(profileDecorationSelect?.value || fallback.decoration).toLowerCase();
  const avatarUrl = sanitizeAvatarUrl(profileAvatarDraftUrl || fallback.avatar_url || "");

  return normalizeProfile(
    {
      ...fallback,
      display_name: displayName,
      theme_key: theme,
      accent_color: accent,
      name_font: nameFont,
      decoration,
      avatar_url: avatarUrl,
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
  profileAvatarDraftUrl = profile.avatar_url || "";
  if (profileAvatarFileInput) {
    profileAvatarFileInput.value = "";
  }
}

function updateProfilePreview(profile) {
  if (!profilePreviewName || !profilePreviewTagline || !profilePreviewMeta || !profilePreviewCard) {
    return;
  }
  const safe = normalizeProfile(profile, currentUser);
  profilePreviewName.textContent = safe.display_name;
  profilePreviewTagline.textContent = "Blindagem financeira personalizada";
  profilePreviewMeta.textContent = `Metas batidas: ${safe.goals_completed}`;
  profilePreviewCard.dataset.decoration = safe.decoration;
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
      avatar_url: defaultProfile.avatar_url,
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
    avatar_url: currentProfile.avatar_url,
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
  switch (themeKey) {
    case "ocean":
      return "Ocean";
    case "sunset":
      return "Sunset";
    case "graphite":
      return "Graphite";
    case "neon":
    default:
      return "Neon";
  }
}

async function loadGlobalRanking() {
  if (!supabaseReady || !rankingList || !rankingFeedback) {
    return;
  }

  rankingFeedback.classList.remove("error");
  rankingFeedback.textContent = "";

  const { data, error } = await supabaseClient
    .from("user_profiles")
    .select("user_id, display_name, goals_completed, theme_key, name_font, accent_color, decoration, avatar_url, created_at, updated_at")
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
    return `
      <article class="ranking-item" tabindex="0" role="button" aria-label="Ver perfil de ${escapeHTML(safe.display_name)}" data-user-id="${safe.user_id}">
        <span class="ranking-position ${isTop ? "top" : ""}">${position}</span>
        <img class="ranking-avatar" src="${avatarSrc}" alt="Foto de ${escapeHTML(safe.display_name)}" loading="lazy" />
        <div class="ranking-user">
          <strong class="ranking-name" style="font-family:${fontFamily}">${escapeHTML(safe.display_name)}</strong>
          <span class="ranking-theme">Tema: ${getThemeLabel(safe.theme_key)}</span>
        </div>
        <span class="ranking-score">${goals} metas</span>
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
  if (rankingProfileCreated) {
    rankingProfileCreated.textContent = `Conta criada em: ${created}`;
  }
  rankingProfileUpdated.textContent = `Atualizado em: ${updated}`;
  rankingProfileSheet.style.setProperty("--ranking-accent", safe.accent_color);
  rankingProfileSheet.dataset.decoration = safe.decoration;
  rankingProfileSheet.classList.remove("hidden");
}

function closeRankingProfile() {
  if (!rankingProfileSheet) {
    return;
  }
  rankingProfileSheet.style.removeProperty("--ranking-accent");
  rankingProfileSheet.removeAttribute("data-decoration");
  rankingProfileSheet.classList.add("hidden");
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

function renderVaults() {
  if (!activeVaultList || !achievementVaultList) {
    return;
  }

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
  if (!createVaultBtn || !vaultForm || !rulesCheckbox) {
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
  const cards = document.querySelectorAll("#activeVaultList .vault-card, #achievementVaultList .vault-card");
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

function setupAuthWidget() {
  if (!authToggle || !authPanel || !authClose) {
    return;
  }

  lockAuthToggleWidth();

  authToggle.addEventListener("click", () => {
    const isOpen = authPanel.classList.toggle("is-open");
    authPanel.setAttribute("aria-hidden", String(!isOpen));
    authToggle.setAttribute("aria-expanded", String(isOpen));
    authToggle.classList.toggle("is-active", isOpen);
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
  if (!authToggle || !authPanel) {
    return;
  }
  authPanel.classList.remove("is-open");
  authPanel.setAttribute("aria-hidden", "true");
  authToggle.setAttribute("aria-expanded", "false");
  authToggle.classList.remove("is-active");
}

function updateAuthUI() {
  if (!authGuest || !authUser || !authUserName || !authToggle) {
    return;
  }

  lockAuthToggleWidth();

  if (currentUser) {
    const displayName = currentProfile?.display_name || getUserDisplayName(currentUser);
    authGuest.classList.add("hidden");
    authUser.classList.remove("hidden");
    authUserName.textContent = displayName;
    authToggle.textContent = displayName;
    authToggle.title = displayName;
    authToggle.setAttribute("aria-label", `Abrir conta de ${displayName}`);
  } else {
    authGuest.classList.remove("hidden");
    authUser.classList.add("hidden");
    authUserName.textContent = "";
    authToggle.textContent = "Login";
    authToggle.title = "Login";
    authToggle.setAttribute("aria-label", "Abrir login");
  }
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
    return "Falha temporaria no servidor de autenticacao. Tente novamente em alguns minutos.";
  }

  if (!rawMessage || rawMessage === "{}" || rawMessage === "[object object]") {
    return "Nao foi possivel concluir a autenticacao agora. Aguarde alguns minutos e tente novamente.";
  }

  return rawMessage;
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

