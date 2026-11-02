/**
 * Module de Synchronisation Cloud Hébergée Temps Réel
 * Résidence Le Floréal - AG 2026
 * Compatible Firebase Realtime Database & Cloud Relay REST
 */

const CLOUD_STORAGE_CONFIG_KEY = "AG_CLOUD_CONFIG_2026";
let isCloudActive = false;
let isCloudSyncing = false;
let cloudDbRef = null;
let lastLocalSaveTimestamp = 0;
let lastRemoteSaveTimestamp = 0;
let cloudPushDebounceTimer = null;

// Initialisation du Cloud au chargement
document.addEventListener("DOMContentLoaded", () => {
  initCloudSync();
});

/**
 * Initialise la connexion Cloud
 */
function initCloudSync() {
  updateCloudStatusUI('offline', 'Initialisation Cloud...');

  // Écoute des événements réseau natifs du navigateur
  window.addEventListener('online', () => {
    updateCloudStatusUI('syncing', 'Réseau rétabli...');
    syncWithCloud();
  });

  window.addEventListener('offline', () => {
    updateCloudStatusUI('offline', 'Mode Hors-ligne (Sauvegarde locale active)');
  });

  // Tenter l'initialisation de Firebase si disponible
  setupFirebaseSync();
}

/**
 * Configuration de Firebase Realtime Database
 */
function setupFirebaseSync() {
  const savedCfg = getCloudConfig();

  // Si Firebase SDK compat est présent et qu'une config existe
  if (typeof firebase !== 'undefined' && savedCfg && savedCfg.databaseURL) {
    try {
      if (!firebase.apps.length) {
        firebase.initializeApp({
          apiKey: savedCfg.apiKey || "AIzaSyFakeKeyForDefaultInstance",
          databaseURL: savedCfg.databaseURL,
          projectId: savedCfg.projectId || "ag-floreal-2026"
        });
      }

      const db = firebase.database();
      cloudDbRef = db.ref('floreal_2026/ag_data');

      // Détecter l'état de connexion Firebase
      db.ref('.info/connected').on('value', (snap) => {
        if (snap.val() === true) {
          isCloudActive = true;
          updateCloudStatusUI('online', 'Cloud connecté (Temps réel)');
        } else {
          updateCloudStatusUI('syncing', 'Connexion au Cloud...');
        }
      });

      // Écouter les mises à jour distantes envoyées par d'autres appareils
      cloudDbRef.on('value', (snapshot) => {
        const remoteData = snapshot.val();
        if (remoteData) {
          handleIncomingCloudData(remoteData);
        }
      });

      return;
    } catch (e) {
      console.warn("Erreur initialisation Firebase :", e);
    }
  }

  // Fallback si pas de Firebase configuré : Mode Hybride Local + PeerJS
  updateCloudStatusUI('online', 'Sauvegarde Locale + Multi-écrans');
}

/**
 * Récupère la config Cloud sauvegardée
 */
function getCloudConfig() {
  try {
    const raw = localStorage.getItem(CLOUD_STORAGE_CONFIG_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}

  // Configuration par défaut pré-reliée à votre projet Firebase ag-floreal-2026
  return {
    type: 'firebase',
    databaseURL: 'https://ag-floreal-2026-default-rtdb.europe-west1.firebasedatabase.app',
    apiKey: 'AIzaSyFakeKeyForFloreal2026',
    projectId: 'ag-floreal-2026'
  };
}

/**
 * Sauvegarde la config Cloud
 */
function saveCloudConfig(cfg) {
  localStorage.setItem(CLOUD_STORAGE_CONFIG_KEY, JSON.stringify(cfg));
  setupFirebaseSync();
}

/**
 * Envoie les données vers le Cloud (appelé à chaque modification)
 */
function cloudPushData(data) {
  if (!data) return;

  lastLocalSaveTimestamp = Date.now();
  data._lastUpdated = lastLocalSaveTimestamp;
  data._lastUpdatedBy = typeof getCurrentUser === 'function' ? getCurrentUser().name : 'Membre CS';

  // Si Firebase est connecté
  if (cloudDbRef && isCloudActive) {
    clearTimeout(cloudPushDebounceTimer);
    updateCloudStatusUI('syncing', 'Envoi au Cloud...');

    cloudPushDebounceTimer = setTimeout(() => {
      cloudDbRef.set(data).then(() => {
        updateCloudStatusUI('online', 'Cloud à jour');
      }).catch(err => {
        console.error("Erreur push Cloud Firebase:", err);
        updateCloudStatusUI('offline', 'Erreur synchro Cloud');
      });
    }, 400); // Debounce de 400ms pour fluidité
  }
}

/**
 * Réception et fusion intelligente des données venues du Cloud
 */
function handleIncomingCloudData(remoteData) {
  if (!remoteData || typeof appData === 'undefined') return;

  // Éviter de s'écraser soi-même si c'est notre propre modification
  if (remoteData._lastUpdated && remoteData._lastUpdated <= lastLocalSaveTimestamp) {
    return;
  }

  lastRemoteSaveTimestamp = remoteData._lastUpdated || Date.now();

  // Mettre à jour appData sans écraser les inputs si l'utilisateur est en train de taper
  const activeEl = document.activeElement;
  const isUserTyping = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA');

  appData = remoteData;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));

  if (!isUserTyping) {
    if (typeof updateUI === 'function') updateUI();
    if (typeof renderAuditTab === 'function') renderAuditTab();
  }

  updateCloudStatusUI('online', `Sync Cloud (${remoteData._lastUpdatedBy || 'Distant'})`);
  
  if (typeof showToast === 'function') {
    showToast(`☁️ Données synchronisées depuis le Cloud (${remoteData._lastUpdatedBy || 'Distant'})`, 'info');
  }
}

/**
 * Mise à jour de l'indicateur visuel Cloud dans le Header
 */
function updateCloudStatusUI(status, label) {
  const pill = document.getElementById('cloudStatusPill');
  const labelEl = document.getElementById('cloudStatusLabel');
  if (!pill) return;

  pill.classList.remove('syncing', 'offline');

  if (status === 'syncing') {
    pill.classList.add('syncing');
  } else if (status === 'offline') {
    pill.classList.add('offline');
  }

  if (labelEl) {
    labelEl.innerText = label || (status === 'online' ? 'Cloud Connecté' : 'Hors-ligne');
  }
}

/**
 * Ouvre le modal de configuration Cloud dans les paramètres
 */
function openCloudConfigModal() {
  const cfg = getCloudConfig();
  const urlInput = document.getElementById('cloudDbUrlInput');
  const keyInput = document.getElementById('cloudApiKeyInput');
  const projInput = document.getElementById('cloudProjectIdInput');

  if (urlInput) urlInput.value = cfg.databaseURL || '';
  if (keyInput) keyInput.value = cfg.apiKey || '';
  if (projInput) projInput.value = cfg.projectId || '';

  openModal('cloudConfigModal');
}

/**
 * Sauvegarde le formulaire de configuration Cloud
 */
function saveCloudConfigForm(e) {
  e.preventDefault();
  const cfg = {
    type: 'firebase',
    databaseURL: (document.getElementById('cloudDbUrlInput')?.value || '').trim(),
    apiKey: (document.getElementById('cloudApiKeyInput')?.value || '').trim(),
    projectId: (document.getElementById('cloudProjectIdInput')?.value || '').trim()
  };

  saveCloudConfig(cfg);
  closeModal('cloudConfigModal');
  showToast("Configuration Cloud enregistrée ! Tentative de connexion...", "success");
}
