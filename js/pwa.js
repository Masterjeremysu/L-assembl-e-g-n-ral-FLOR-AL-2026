/**
 * Module d'Installation et Gestion PWA (Progressive Web App)
 * Résidence Le Floréal - AG 2026
 * Gère la détection d'installation, le prompt non intrusif et le guidage Apple / Android
 */

let deferredInstallPrompt = null;
const PWA_DISMISSED_KEY = "AG_PWA_PROMPT_DISMISSED_2026";
const PWA_INSTALLED_KEY = "AG_PWA_INSTALLED_2026";

document.addEventListener("DOMContentLoaded", () => {
  initPwaHandler();
});

function initPwaHandler() {
  // 1. Contrôler si l'application est DÉJÀ installée et s'exécute en mode autonome
  if (isPwaInstalled()) {
    console.log("PWA : L'application est déjà installée et s'exécute en mode autonome.");
    markPwaAsInstalled();
    updatePwaStatusBadge(true);
    return;
  }

  updatePwaStatusBadge(false);

  // 2. Écouter l'événement standard d'installation (Chrome, Android, Edge, PC)
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;

    // Ne pas afficher si l'utilisateur a déjà choisi "Plus tard" ou "Ne plus afficher"
    if (!localStorage.getItem(PWA_DISMISSED_KEY)) {
      setTimeout(() => {
        showPwaBanner("standard");
      }, 2500); // Déclenchement fluide après 2.5 secondes
    }
  });

  // 3. Détecter la réussite de l'installation
  window.addEventListener("appinstalled", () => {
    console.log("PWA : Application installée avec succès !");
    deferredInstallPrompt = null;
    markPwaAsInstalled();
    hidePwaBanner();
    updatePwaStatusBadge(true);
    if (typeof showToast === "function") {
      showToast("🎉 Floréal 2026 installée avec succès sur votre écran d'accueil !", "success");
    }
  });

  // 4. Cas spécifique Apple (iPad / iPhone Safari ne supporte pas beforeinstallprompt)
  if (isAppleDevice() && !isPwaInstalled() && !localStorage.getItem(PWA_DISMISSED_KEY)) {
    setTimeout(() => {
      showPwaBanner("apple");
    }, 3500);
  }
}

/**
 * Vérifie si l'application s'exécute déjà en PWA autonome (Standalone)
 */
function isPwaInstalled() {
  const isStandaloneMatch = window.matchMedia("(display-mode: standalone)").matches;
  const isNavigatorStandalone = window.navigator.standalone === true;
  const isLocalInstalled = localStorage.getItem(PWA_INSTALLED_KEY) === "true";
  return isStandaloneMatch || isNavigatorStandalone || isLocalInstalled;
}

/**
 * Détecte si l'appareil est un iPad, iPhone ou iPod
 */
function isAppleDevice() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

function markPwaAsInstalled() {
  localStorage.setItem(PWA_INSTALLED_KEY, "true");
}

/**
 * Affiche la bannière d'installation PWA
 */
function showPwaBanner(mode = "standard") {
  const banner = document.getElementById("pwaInstallBanner");
  if (!banner || isPwaInstalled()) return;

  const appleInstructions = document.getElementById("pwaAppleInstructions");
  const standardAction = document.getElementById("pwaStandardAction");

  if (mode === "apple") {
    if (appleInstructions) appleInstructions.style.display = "block";
    if (standardAction) standardAction.style.display = "none";
  } else {
    if (appleInstructions) appleInstructions.style.display = "none";
    if (standardAction) standardAction.style.display = "inline-flex";
  }

  banner.classList.add("visible");
}

/**
 * Masque la bannière d'installation PWA
 */
function hidePwaBanner() {
  const banner = document.getElementById("pwaInstallBanner");
  if (banner) {
    banner.classList.remove("visible");
  }
}

/**
 * Déclenché quand l'utilisateur clique sur "Plus tard" ou "✕"
 */
function dismissPwaBanner(permanently = true) {
  if (permanently) {
    localStorage.setItem(PWA_DISMISSED_KEY, "true");
  }
  hidePwaBanner();
}

/**
 * Déclenche l'installation native en 1 clic
 */
function triggerPwaInstall() {
  if (deferredInstallPrompt) {
    deferredInstallPrompt.prompt();
    deferredInstallPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === "accepted") {
        console.log("PWA : L'utilisateur a accepté l'installation.");
        markPwaAsInstalled();
        hidePwaBanner();
      } else {
        console.log("PWA : L'utilisateur a décliné l'installation.");
        dismissPwaBanner(true);
      }
      deferredInstallPrompt = null;
    });
  } else if (isAppleDevice()) {
    openModal("pwaAppleHelpModal");
  } else {
    // Si pas de prompt différé disponible (ex: déjà installé ou non supporté)
    alert("Pour installer l'application sur cet appareil :\n\n• Cliquez sur les 3 petits points de votre navigateur (en haut à droite)\n• Choisissez « Installer l'application » ou « Ajouter à l'écran d'accueil ».");
    dismissPwaBanner(true);
  }
}

/**
 * Met à jour le badge de statut dans l'onglet Paramètres ou le Header
 */
function updatePwaStatusBadge(isInstalled) {
  const badge = document.getElementById("pwaStatusBadge");
  if (!badge) return;

  if (isInstalled) {
    badge.className = "pwa-status-badge installed";
    badge.innerHTML = "✅ App installée en plein écran";
  } else {
    badge.className = "pwa-status-badge not-installed";
    badge.innerHTML = "📱 Version Web (Cliquer pour installer)";
    badge.onclick = () => triggerPwaInstall();
  }
}
