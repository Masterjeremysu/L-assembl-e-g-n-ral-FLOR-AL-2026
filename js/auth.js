/**
 * Module d'Authentification Sécurisée Individuelle & Postes CS
 * Résidence Le Floréal - AG 2026
 * Chaque membre du Conseil Syndical a son propre profil et son propre code PIN
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
 * Exclut formellement les non-membres (ex: Laura FALCON)
 */
function populateAuthProfiles() {
  const select = document.getElementById("authProfileSelect");
  if (!select) return;

  const currentVal = select.value;

  let memberList = [];
  if (typeof appData !== 'undefined' && appData.members && appData.members.length > 0) {
    memberList = appData.members
      .filter(m => m.statut !== 'DEMISSIONNAIRE')
      .map(m => {
        let n = m.name;
        // Supprimer Laura FALCON de l'intitulé CS
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

  // Filtrage strict : Laura FALCON n'a jamais accès en tant que CS
  memberList = memberList.filter(m => !m.toLowerCase().includes('falcon'));

  // Profils génériques de séance
  memberList.push("Scrutateur / Observateur CS", "Autre membre CS");

  // Déduplication
  memberList = [...new Set(memberList)];

  select.innerHTML = memberList
    .map(m => `<option value="${escapeHtml(m)}" ${m === currentVal ? "selected" : ""}>${escapeHtml(m)}</option>`)
    .join("");

  updateAuthPinHint();
}

/**
 * Déclenché lors du changement de membre dans le menu déroulant
 */
function onAuthProfileChanged() {
  onKeypadClear();
  clearAuthError();
  updateAuthPinHint();
}

/**
 * Met à jour le texte d'aide du PIN selon le membre sélectionné
 */
function updateAuthPinHint() {
  const hintEl = document.getElementById("authPinHint");
  if (!hintEl) return;

  const select = document.getElementById("authProfileSelect");
  const memberName = select ? select.value : "";
  const pin = getActivePinForMember(memberName);

  if (pin === DEFAULT_PIN) {
    hintEl.innerHTML = `💡 Code PIN initial de ce profil : <code>${DEFAULT_PIN}</code> (modifiable une fois connecté)`;
  } else {
    hintEl.innerHTML = `🔒 Ce membre a configuré un <strong>code PIN personnel</strong> secret.`;
  }
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

  const activePin = getActivePinForSelectedMember();
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
 * Récupère le code PIN du membre actuellement sélectionné dans le formulaire
 */
function getActivePinForSelectedMember() {
  const select = document.getElementById("authProfileSelect");
  const memberName = select ? select.value : "";
  return getActivePinForMember(memberName);
}

/**
 * Récupère le code PIN personnel d'un membre (avec fallback 2026)
 */
function getActivePinForMember(memberName) {
  if (!memberName) return DEFAULT_PIN;

  if (typeof appData !== "undefined") {
    // 1. Recherche dans les PINs personnels
    if (appData.memberPins && appData.memberPins[memberName]) {
      return String(appData.memberPins[memberName]).trim();
    }

    // 2. Recherche par ID de membre
    const m = (appData.members || []).find(x => x.name === memberName || (x.name && x.name.includes(memberName)));
    if (m && appData.memberPins && appData.memberPins[m.id]) {
      return String(appData.memberPins[m.id]).trim();
    }

    // 3. Fallback sur le PIN global s'il existe
    if (appData.config && appData.config.pinCode && memberName.includes("SUZET")) {
      return String(appData.config.pinCode).trim();
    }
  }

  return DEFAULT_PIN;
}

/**
 * Vérification du code PIN saisi pour le membre sélectionné
 */
function verifyEnteredPin() {
  const activePin = getActivePinForSelectedMember();
  const select = document.getElementById("authProfileSelect");
  const selectedName = select ? select.value : "Membre CS";

  const missionSelect = document.getElementById("authMissionSelect");
  const selectedMission = missionSelect ? missionSelect.value : "Membre CS";

  if (currentEnteredPin === activePin) {
    // Succès
    currentUser = {
      name: selectedName,
      mission: selectedMission,
      role: "CS_ADMIN",
      unlockedAt: new Date().toISOString()
    };
    sessionStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(currentUser));

    // Audit Log de connexion avec le poste
    if (typeof logAuditAction === "function") {
      logAuditAction("SECURITE", "Prise de poste", `${selectedName} a ouvert sa session au poste « ${selectedMission} »`);
    }

    unlockScreen(true);
    updateAuthUI();
    showToast(`Bienvenue ${selectedName} ! Poste : ${selectedMission}`, "success");
    currentEnteredPin = "";

    // Si le membre se connecte avec le code initial (2026), l'accompagner pour créer son PIN personnel
    if (activePin === DEFAULT_PIN) {
      setTimeout(() => {
        openOnboardingPinModal(selectedName, selectedMission);
      }, 500);
    }
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

    showAuthError(`Code PIN incorrect pour ${selectedName}.`);
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
  if (confirm("Voulez-vous verrouiller l'application et libérer ce poste ?")) {
    if (typeof logAuditAction === "function" && currentUser) {
      logAuditAction("SECURITE", "Fin de session", `Session fermée par ${currentUser.name}`);
    }
    sessionStorage.removeItem(AUTH_SESSION_KEY);
    currentUser = null;
    lockScreen();
    updateAuthUI();
    showToast("Session verrouillée.", "info");
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
  return { name: "Membre CS", mission: "CS", role: "CS" };
}

/**
 * Met à jour le badge utilisateur et son poste dans le Header
 */
function updateAuthUI() {
  const userPill = document.getElementById("authUserPill");
  const userNameEl = document.getElementById("authUserName");
  const userAvatarEl = document.getElementById("authUserAvatar");

  if (!userPill || !userNameEl) return;

  const u = getCurrentUser();
  if (u && u.name) {
    userPill.style.display = "inline-flex";
    
    // Afficher Prénom/Nom + Mission courte
    const missionCourte = u.mission ? u.mission.split(' ')[0] : 'CS';
    userNameEl.innerHTML = `${escapeHtml(u.name)} <span style="font-weight:400; color:#475569; font-size:0.75rem;">(${missionCourte})</span>`;

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
 * Modal : Changer SON code PIN personnel
 */
function openChangePinModal() {
  const u = getCurrentUser();
  const titleEl = document.querySelector("#changePinModal .modal-title");
  if (titleEl) {
    titleEl.innerText = `🔒 Code PIN personnel de ${u.name || 'Membre'}`;
  }

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

/**
 * Enregistrement du code PIN personnel (chacun son code sans impacter les collègues)
 */
function saveNewPinForm(e) {
  e.preventDefault();
  const oldPin = document.getElementById("pinOldInput").value.trim();
  const newPin = document.getElementById("pinNewInput").value.trim();
  const confirmPin = document.getElementById("pinConfirmInput").value.trim();
  const errEl = document.getElementById("changePinErrorMsg");

  const u = getCurrentUser();
  const currentPin = getActivePinForMember(u.name);

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

  // Enregistrer dans appData.memberPins (par nom de membre)
  if (typeof appData !== "undefined") {
    if (!appData.memberPins) appData.memberPins = {};
    appData.memberPins[u.name] = newPin;

    // Si le membre a un id dans appData.members, l'enregistrer aussi sous cet id
    const m = (appData.members || []).find(x => x.name === u.name || (x.name && x.name.includes(u.name)));
    if (m) {
      appData.memberPins[m.id] = newPin;
    }

    if (typeof logAuditAction === "function") {
      logAuditAction("SECURITE", "Code PIN personnel modifié", `${u.name} a mis à jour son code PIN personnel`);
    }

    if (typeof persistData === "function") {
      persistData();
    }
  }

  closeModal("changePinModal");
  showToast(`✅ Votre code PIN personnel a été enregistré avec succès !`, "success");
}

/**
 * Ouvre le modal d'accompagnement pour la création du 1er PIN personnel
 */
function openOnboardingPinModal(memberName, missionName) {
  const titleEl = document.getElementById("onboardingMemberTitle");
  const missionEl = document.getElementById("onboardingMemberMission");
  const pinInput = document.getElementById("onboardingPinInput");
  const confirmInput = document.getElementById("onboardingPinConfirmInput");
  const errEl = document.getElementById("onboardingPinErrorMsg");

  if (titleEl) titleEl.innerText = `Bienvenue, ${memberName} !`;
  if (missionEl) missionEl.innerText = `🎯 Votre mission : ${missionName || 'Membre du Conseil Syndical'}`;
  if (pinInput) pinInput.value = "";
  if (confirmInput) confirmInput.value = "";
  if (errEl) errEl.innerText = "";

  openModal("onboardingPinModal");
}

/**
 * Enregistre le code PIN personnel lors de la première connexion
 */
function saveOnboardingPinForm(e) {
  e.preventDefault();
  const newPin = document.getElementById("onboardingPinInput").value.trim();
  const confirmPin = document.getElementById("onboardingPinConfirmInput").value.trim();
  const errEl = document.getElementById("onboardingPinErrorMsg");

  if (newPin.length < 4 || newPin.length > 8) {
    errEl.innerText = "Le code doit comporter entre 4 et 8 chiffres.";
    return;
  }

  if (!/^\d+$/.test(newPin)) {
    errEl.innerText = "Le code PIN ne doit contenir que des chiffres.";
    return;
  }

  if (newPin !== confirmPin) {
    errEl.innerText = "Les deux codes saisis ne correspondent pas.";
    return;
  }

  const u = getCurrentUser();

  // Enregistrer le PIN individuel
  if (typeof appData !== "undefined") {
    if (!appData.memberPins) appData.memberPins = {};
    appData.memberPins[u.name] = newPin;

    const m = (appData.members || []).find(x => x.name === u.name || (x.name && x.name.includes(u.name)));
    if (m) {
      appData.memberPins[m.id] = newPin;
    }

    if (typeof logAuditAction === "function") {
      logAuditAction("SECURITE", "Code PIN personnel activé", `${u.name} a activé son code PIN personnel lors de sa 1ère connexion`);
    }

    if (typeof persistData === "function") {
      persistData();
    }
  }

  closeModal("onboardingPinModal");
  showToast(`🎉 Félicitations ${u.name} ! Votre code PIN secret est actif. Bon courage pour l'AG !`, "success");
}
