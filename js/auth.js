/**
 * Module d'Authentification Sécurisée & Code PIN
 * Résidence Le Floréal - AG 2026
 */

const DEFAULT_PIN = "2026";
const AUTH_SESSION_KEY = "AG_CS_ACTIVE_USER_2026";

let currentEnteredPin = "";
let currentUser = null;

// Initialisation au chargement
document.addEventListener("DOMContentLoaded", () => {
  initAuth();
});

function initAuth() {
  populateAuthProfiles();
  setupKeyboardListener();

  // Vérifier si une session valide existe déjà dans ce navigateur
  const savedSession = sessionStorage.getItem(AUTH_SESSION_KEY);
  if (savedSession) {
    try {
      currentUser = JSON.parse(savedSession);
      unlockScreen(false);
      updateAuthUI();
      return;
    } catch (e) {
      console.warn("Session expirée ou invalide", e);
    }
  }

  // Sinon, écran verrouillé par défaut
  lockScreen();
}

/**
 * Remplit le menu déroulant des profils de membres CS
 */
function populateAuthProfiles() {
  const select = document.getElementById("authProfileSelect");
  if (!select) return;

  let memberList = [];
  if (typeof appData !== 'undefined' && appData.members && appData.members.length > 0) {
    memberList = appData.members
      .filter(m => m.statut !== 'DEMISSIONNAIRE')
      .map(m => {
        let n = m.name;
        // Supprimer Laura FALCON du profil CS
        n = n.replace(/&?\s*Mme\s+FALCON\s+Laura/gi, '').replace(/\s+/g, ' ').trim();
        return n;
      });
  }

  if (memberList.length === 0) {
    memberList = [
      "M. SUZET Jérémy",
      "Mme GUERRE Sylvie",
      "M. GUERRE Joël",
      "M. BRUN Éric",
      "M. CASARI Jean-Paul",
      "M. ARMONIA Frédéric",
      "Mme ARMONIA Diane",
      "Mme GANET Chantal",
      "Mlle PIGOIS Véronique",
      "M. BEZY David",
      "M. BONSIGNORE Alexis",
      "M. LOUIS Janick"
    ];
  }

  // Filtrer pour garantir l'absence totale de Laura FALCON des accès CS
  memberList = memberList.filter(m => !m.toLowerCase().includes('falcon'));

  // Profils génériques de séance
  memberList.push("Scrutateur / Observateur CS", "Autre membre CS");

  // Dédupliquer
  memberList = [...new Set(memberList)];

  select.innerHTML = memberList
    .map((m, idx) => `<option value="${escapeHtml(m)}" ${idx === 0 ? "selected" : ""}>${escapeHtml(m)}</option>`)
    .join("");
}

/**
 * Gestion du clavier physique (0-9, Backspace, Entrée)
 */
function setupKeyboardListener() {
  document.addEventListener("keydown", (e) => {
    const lockscreen = document.getElementById("authLockscreen");
    if (!lockscreen || lockscreen.classList.contains("unlocked")) return;

    if (e.key >= "0" && e.key <= "9") {
      e.preventDefault();
      onKeypadPress(e.key);
    } else if (e.key === "Backspace") {
      e.preventDefault();
      onKeypadDelete();
    } else if (e.key === "Enter") {
      e.preventDefault();
      verifyEnteredPin();
    } else if (e.key === "Escape") {
      onKeypadClear();
    }
  });
}

/**
 * Appui sur une touche du clavier virtuel
 */
function onKeypadPress(digit) {
  if (currentEnteredPin.length >= 8) return;
  currentEnteredPin += digit;
  updatePinDots();
  clearAuthError();

  // Si 4 chiffres atteints (ou longueur du code actuel)
  const activePin = getActivePin();
  if (currentEnteredPin.length === activePin.length) {
    setTimeout(verifyEnteredPin, 100);
  }
}

/**
 * Suppression d'un chiffre
 */
function onKeypadDelete() {
  if (currentEnteredPin.length > 0) {
    currentEnteredPin = currentEnteredPin.slice(0, -1);
    updatePinDots();
    clearAuthError();
  }
}

/**
 * Effacement complet
 */
function onKeypadClear() {
  currentEnteredPin = "";
  updatePinDots();
  clearAuthError();
}

/**
 * Mise à jour visuelle des pastilles de PIN
 */
function updatePinDots() {
  const dots = document.querySelectorAll(".auth-pin-dot");
  dots.forEach((dot, idx) => {
    if (idx < currentEnteredPin.length) {
      dot.classList.add("filled");
    } else {
      dot.classList.remove("filled");
      dot.classList.remove("error");
    }
  });
}

/**
 * Récupère le code PIN configuré (dans appData ou défaut 2026)
 */
function getActivePin() {
  if (typeof appData !== "undefined" && appData.config && appData.config.pinCode) {
    return String(appData.config.pinCode).trim();
  }
  return DEFAULT_PIN;
}

/**
 * Vérification du code PIN saisi
 */
function verifyEnteredPin() {
  const activePin = getActivePin();
  const select = document.getElementById("authProfileSelect");
  const selectedName = select ? select.value : "Membre CS";

  if (currentEnteredPin === activePin) {
    // Succès
    currentUser = {
      name: selectedName,
      role: "CS_ADMIN",
      unlockedAt: new Date().toISOString()
    };
    sessionStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(currentUser));

    // Audit Log de connexion
    if (typeof logAuditAction === "function") {
      logAuditAction("SECURITE", "Connexion réussie", `Connexion au panneau CS par ${selectedName}`);
    }

    unlockScreen(true);
    updateAuthUI();
    showToast(`Bienvenue, ${selectedName} ! Session déverrouillée.`, "success");
    currentEnteredPin = "";
  } else {
    // Échec : secousse et message d'erreur
    const card = document.querySelector(".auth-card");
    const dots = document.querySelectorAll(".auth-pin-dot");
    if (card) {
      card.classList.remove("shake-animation");
      void card.offsetWidth; // Trigger reflow
      card.classList.add("shake-animation");
    }
    dots.forEach(d => d.classList.add("error"));

    showAuthError(`Code PIN incorrect. (Code par défaut : ${activePin === DEFAULT_PIN ? DEFAULT_PIN : '••••'})`);
    setTimeout(() => {
      onKeypadClear();
    }, 600);
  }
}

function showAuthError(msg) {
  const errEl = document.getElementById("authErrorMsg");
  if (errEl) errEl.innerText = msg;
}

function clearAuthError() {
  const errEl = document.getElementById("authErrorMsg");
  if (errEl) errEl.innerText = "";
}

/**
 * Déverrouille l'écran principal
 */
function unlockScreen(animate = true) {
  const lockscreen = document.getElementById("authLockscreen");
  if (lockscreen) {
    lockscreen.classList.add("unlocked");
  }
  document.body.style.overflow = "";
}

/**
 * Verrouille l'écran
 */
function lockScreen() {
  const lockscreen = document.getElementById("authLockscreen");
  if (lockscreen) {
    lockscreen.classList.remove("unlocked");
  }
  document.body.style.overflow = "hidden";
  populateAuthProfiles();
  onKeypadClear();
}

/**
 * Déconnexion de l'utilisateur
 */
function logoutUser() {
  if (confirm("Voulez-vous verrouiller l'application et vous déconnecter ?")) {
    if (typeof logAuditAction === "function" && currentUser) {
      logAuditAction("SECURITE", "Déconnexion", `Déconnexion volontaire de ${currentUser.name}`);
    }
    sessionStorage.removeItem(AUTH_SESSION_KEY);
    currentUser = null;
    lockScreen();
    updateAuthUI();
    showToast("Application verrouillée.", "info");
  }
}

/**
 * Récupère l'utilisateur connecté actuellement
 */
function getCurrentUser() {
  if (currentUser) return currentUser;
  const saved = sessionStorage.getItem(AUTH_SESSION_KEY);
  if (saved) {
    try {
      currentUser = JSON.parse(saved);
      return currentUser;
    } catch (e) {}
  }
  return { name: "Membre CS", role: "CS" };
}

/**
 * Met à jour le badge utilisateur dans le Header
 */
function updateAuthUI() {
  const userPill = document.getElementById("authUserPill");
  const userNameEl = document.getElementById("authUserName");
  const userAvatarEl = document.getElementById("authUserAvatar");

  if (!userPill || !userNameEl) return;

  const u = getCurrentUser();
  if (u && u.name) {
    userPill.style.display = "inline-flex";
    userNameEl.innerText = u.name;
    if (userAvatarEl) {
      const initials = u.name
        .split(" ")
        .map(w => w[0])
        .filter(c => c && c.match(/[a-zA-Z]/))
        .slice(0, 2)
        .join("")
        .toUpperCase() || "CS";
      userAvatarEl.innerText = initials;
    }
  } else {
    userPill.style.display = "none";
  }
}

/**
 * Modal : Changer le code PIN
 */
function openChangePinModal() {
  document.getElementById("pinOldInput").value = "";
  document.getElementById("pinNewInput").value = "";
  document.getElementById("pinConfirmInput").value = "";
  clearChangePinError();
  openModal("changePinModal");
}

function clearChangePinError() {
  const err = document.getElementById("changePinErrorMsg");
  if (err) err.innerText = "";
}

function saveNewPinForm(e) {
  e.preventDefault();
  const oldPin = document.getElementById("pinOldInput").value.trim();
  const newPin = document.getElementById("pinNewInput").value.trim();
  const confirmPin = document.getElementById("pinConfirmInput").value.trim();
  const errEl = document.getElementById("changePinErrorMsg");

  const currentPin = getActivePin();

  if (oldPin !== currentPin) {
    errEl.innerText = "L'ancien code PIN est incorrect.";
    return;
  }

  if (newPin.length < 4 || newPin.length > 8) {
    errEl.innerText = "Le nouveau code doit comporter entre 4 et 8 chiffres.";
    return;
  }

  if (!/^\d+$/.test(newPin)) {
    errEl.innerText = "Le code PIN ne doit contenir que des chiffres.";
    return;
  }

  if (newPin !== confirmPin) {
    errEl.innerText = "La confirmation ne correspond pas au nouveau code PIN.";
    return;
  }

  // Enregistrer dans appData
  if (typeof appData !== "undefined") {
    if (!appData.config) appData.config = {};
    appData.config.pinCode = newPin;

    if (typeof logAuditAction === "function") {
      const u = getCurrentUser();
      logAuditAction("SECURITE", "Code PIN modifié", `Code PIN mis à jour par ${u.name}`);
    }

    if (typeof persistData === "function") {
      persistData();
    }
  }

  closeModal("changePinModal");
  showToast(`✅ Code PIN modifié avec succès ! (Nouveau code : ${newPin})`, "success");
}
