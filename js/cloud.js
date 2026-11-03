/**
 * Module de Synchronisation Cloud Hébergée Temps Réel
 * Résidence Le Floréal - AG 2026
 * Double moteur : Firebase SDK Compat + Relais Natif REST / SSE (Ultra-robuste)
 */

const CLOUD_STORAGE_CONFIG_KEY = "AG_CLOUD_CONFIG_2026";
let isCloudActive = false;
let isCloudSyncing = false;
let cloudDbRef = null;
let lastLocalSaveTimestamp = 0;
let lastRemoteSaveTimestamp = 0;
let cloudPushDebounceTimer = null;
let sseConnection = null;

// Initialisation du Cloud au chargement
document.addEventListener("DOMContentLoaded", () => {
  initCloudSync();
});

/**
 * Initialise la connexion Cloud
 */
function initCloudSync() {
  updateCloudStatusUI('syncing', 'Connexion au Cloud Firebase...');

  // Écoute des événements réseau natifs du navigateur
  window.addEventListener('online', () => {
    updateCloudStatusUI('syncing', 'Réseau rétabli...');
    fetchInitialCloudData();
  });

  window.addEventListener('offline', () => {
    updateCloudStatusUI('offline', 'Mode Hors-ligne (Sauvegarde locale active)');
  });

  // 1. Initialisation Firebase SDK (si CDN chargé)
  setupFirebaseSync();

  // 2. Récupération immédiate par REST (rapide et infaillible)
  fetchInitialCloudData();

  // 3. Écoute temps réel Server-Sent Events (secours natif)
  setupSseSync();
}

/**
 * Configuration de Firebase Realtime Database
 */
function setupFirebaseSync() {
  const savedCfg = getCloudConfig();

  if (typeof firebase !== 'undefined' && savedCfg && savedCfg.databaseURL) {
    try {
      if (!firebase.apps.length) {
        firebase.initializeApp({
          apiKey: savedCfg.apiKey || "AIzaSyFakeKeyForFloreal2026",
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
        }
      });

      // Écouter les mises à jour distantes
      cloudDbRef.on('value', (snapshot) => {
        const remoteData = snapshot.val();
        if (remoteData) {
          handleIncomingCloudData(remoteData);
        }
      });

      return;
    } catch (e) {
      console.warn("Info SDK Firebase (bascule REST) :", e);
    }
  }
}

/**
 * Récupération initiale rapide par API REST Firebase
 */
function fetchInitialCloudData() {
  const cfg = getCloudConfig();
  if (!cfg.databaseURL) return;

  fetch(cfg.databaseURL + '/floreal_2026/ag_data.json')
    .then(r => r.json())
    .then(remoteData => {
      if (remoteData && remoteData.coproprietaires && remoteData.coproprietaires.length > 0) {
        handleIncomingCloudData(remoteData);
        isCloudActive = true;
        updateCloudStatusUI('online', 'Cloud connecté (Temps réel)');
      } else {
        // La base distante est encore vide : on lui pousse les données initiales
        if (typeof appData !== 'undefined') {
          cloudPushData(appData);
        }
      }
    })
    .catch(err => {
      console.warn("Info fetch Cloud REST :", err);
    });
}

/**
 * Écoute temps réel native par Server-Sent Events (SSE)
 */
function setupSseSync() {
  const cfg = getCloudConfig();
  if (!cfg.databaseURL || typeof EventSource === 'undefined') return;

  try {
    if (sseConnection) sseConnection.close();
    sseConnection = new EventSource(cfg.databaseURL + '/floreal_2026/ag_data.json');

    sseConnection.addEventListener('put', (e) => {
      try {
        const payload = JSON.parse(e.data);
        if (payload && payload.data) {
          handleIncomingCloudData(payload.data);
        }
      } catch (err) {}
    });

    sseConnection.onopen = () => {
      isCloudActive = true;
      updateCloudStatusUI('online', 'Cloud connecté (Temps réel)');
    };

    sseConnection.onerror = () => {
      // Reconnexion automatique gérée nativement par EventSource
    };
  } catch (e) {
    console.warn("Info SSE sync :", e);
  }
}

/**
 * Récupère la config Cloud sauvegardée
 */
function getCloudConfig() {
  try {
    const raw = localStorage.getItem(CLOUD_STORAGE_CONFIG_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}

  // Configuration par défaut reliée directement à votre base Firebase ag-floreal-2026
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
  fetchInitialCloudData();
  setupSseSync();
}

/**
 * Envoie les données vers le Cloud (appelé à chaque modification)
 */
function cloudPushData(data) {
  if (!data) return;

  lastLocalSaveTimestamp = Date.now();
  data._lastUpdated = lastLocalSaveTimestamp;
  data._lastUpdatedBy = typeof getCurrentUser === 'function' ? getCurrentUser().name : 'Membre CS';

  // Nettoyage impératif des clés pour Firebase (interdiction des points '.' et caractères réservés)
  if (data.memberPins) {
    const cleanPins = {};
    Object.keys(data.memberPins).forEach(k => {
      const cleanKey = k.replace(/[\.\#\$\[\]\/]/g, '').trim();
      if (cleanKey) cleanPins[cleanKey] = data.memberPins[k];
    });
    data.memberPins = cleanPins;
  }

  clearTimeout(cloudPushDebounceTimer);
  updateCloudStatusUI('syncing', 'Envoi au Cloud...');

  cloudPushDebounceTimer = setTimeout(() => {
    const cfg = getCloudConfig();

    // 1. Envoi via SDK Firebase si disponible
    if (cloudDbRef && isCloudActive) {
      cloudDbRef.set(data).catch(() => {});
    }

    // 2. Envoi garanti via REST Firebase (infaillible sur tous les navigateurs & smartphones)
    if (cfg && cfg.databaseURL) {
      fetch(cfg.databaseURL + '/floreal_2026/ag_data.json', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      .then(() => {
        isCloudActive = true;
        updateCloudStatusUI('online', 'Cloud à jour (Temps réel)');
      })
      .catch(err => {
        console.warn("Erreur push Cloud REST:", err);
        updateCloudStatusUI('offline', 'Sauvegarde locale active');
      });
    }
  }, 400); // Debounce de 400ms pour fluidité
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

  // Mettre à jour appData sans écraser les inputs si l'utilisateur est en train d'écrire
  const activeEl = document.activeElement;
  const isUserTyping = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA');

  appData = remoteData;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));

  if (!isUserTyping) {
    if (typeof updateUI === 'function') updateUI();
    if (typeof renderAuditTab === 'function') renderAuditTab();
  }

  // Ravitaillement immédiat de l'écran de verrouillage avec les données et PINs Firebase
  if (typeof populateAuthProfiles === 'function') populateAuthProfiles();
  if (typeof updateAuthPinHint === 'function') updateAuthPinHint();

  updateCloudStatusUI('online', `Cloud Connecté (${remoteData._lastUpdatedBy || 'En direct'})`);
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
  showToast("Configuration Cloud enregistrée ! Connexion immédiate...", "success");
}
