/**
 * Module de Synchronisation Cloud Hébergée Temps Réel
 * Résidence Le Floréal - AG 2026
 * Double moteur : Firebase SDK Compat + Relais Natif REST / SSE (Ultra-robuste)
 * 
 * RÈGLE D'OR : LA BASE DE DONNÉES CLOUD EST LE MAÎTRE ABSOLU (BDD > LocalStorage)
 * Dès qu'un appareil se connecte, la base Firebase écrase et rafraîchit le cache local.
 */

const CLOUD_STORAGE_CONFIG_KEY = "AG_CLOUD_CONFIG_2026";
const CLIENT_SESSION_ID = "client_" + Date.now() + "_" + Math.random().toString(36).substring(2, 8);

let isCloudActive = false;
let isCloudSyncing = false;
let hasSyncedInitialCloud = false;
let cloudDbRef = null;
let lastLocalSaveTimestamp = 0;
let lastRemoteSaveTimestamp = 0;
let cloudPushDebounceTimer = null;
let sseConnection = null;

// Initialisation du Cloud dès le chargement du DOM
document.addEventListener("DOMContentLoaded", () => {
  initCloudSync();
});

/**
 * Initialise la connexion Cloud
 */
function initCloudSync() {
  updateCloudStatusUI('syncing', 'Connexion à la BDD Cloud...');

  // Écoute des événements réseau natifs du navigateur
  window.addEventListener('online', () => {
    updateCloudStatusUI('syncing', 'Réseau rétabli...');
    fetchInitialCloudData();
  });

  window.addEventListener('offline', () => {
    updateCloudStatusUI('offline', 'Mode Hors-ligne (Cache local actif)');
  });

  // 1. Initialisation SDK Firebase (si CDN disponible)
  setupFirebaseSync();

  // 2. Récupération immédiate par REST sans cache (garantit d'avoir la vérité BDD en direct)
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
          updateCloudStatusUI('online', 'BDD Connectée (Temps réel)');
        }
      });

      // Écouter les mises à jour distantes (instantané quand quelqu'un modifie sur PC ou mobile)
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
 * Le paramètre ?t= assure qu'aucun proxy / cache navigateur ne serve des données périmées
 */
function fetchInitialCloudData(force = false) {
  const cfg = getCloudConfig();
  if (!cfg.databaseURL) return;

  if (force) {
    updateCloudStatusUI('syncing', 'Actualisation BDD en cours...');
  }

  const cacheBuster = `?t=${Date.now()}`;
  fetch(cfg.databaseURL + '/floreal_2026/ag_data.json' + cacheBuster)
    .then(r => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    })
    .then(remoteData => {
      if (remoteData && remoteData.coproprietaires && remoteData.coproprietaires.length > 0) {
        // La BDD distante existe et a des données : elle prend immédiatement le dessus
        handleIncomingCloudData(remoteData, true);
        isCloudActive = true;
        hasSyncedInitialCloud = true;
        updateCloudStatusUI('online', `BDD Synchronisée (${remoteData._lastUpdatedBy || 'En direct'})`);
        if (force && typeof showToast === 'function') {
          showToast('✅ Base de données Cloud synchronisée en direct !', 'success');
        }
      } else {
        hasSyncedInitialCloud = true;
        // La BDD distante est totalement vide : initialisation prudente
        if (typeof appData !== 'undefined' && appData._hasLocalEdits) {
          cloudPushData(appData);
        }
      }
    })
    .catch(err => {
      console.warn("Info fetch Cloud REST :", err);
      if (!isCloudActive) {
        updateCloudStatusUI('offline', 'Mode Hors-ligne (Cache local actif)');
      }
      if (force && typeof showToast === 'function') {
        showToast("⚠️ Impossible de joindre la base distante (Vérifiez la connexion)", "warning");
      }
    });
}

/**
 * Force l'actualisation immédiate depuis la BDD Firebase (appelable via le bouton 🔄)
 */
function forceSyncFromCloud() {
  fetchInitialCloudData(true);
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
      updateCloudStatusUI('online', 'BDD Connectée (Temps réel)');
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

  // Sécurité anti-écrasement au démarrage d'un nouvel appareil :
  // Si le Cloud n'a pas encore répondu au premier chargement, on temporise pour ne pas risquer
  // d'écraser la base distante avec des données par défaut non synchronisées.
  if (!hasSyncedInitialCloud && !isCloudActive) {
    console.warn("Cloud push différé : attente de la synchronisation BDD maître...");
    setTimeout(() => {
      cloudPushData(appData);
    }, 1200);
    return;
  }

  lastLocalSaveTimestamp = Date.now();
  data._lastUpdated = lastLocalSaveTimestamp;
  data._lastClientId = CLIENT_SESSION_ID;
  data._lastUpdatedBy = typeof getCurrentUser === 'function' ? getCurrentUser().name : 'Membre CS';
  data._hasLocalEdits = true;

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
  updateCloudStatusUI('syncing', 'Envoi à la BDD...');

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
        updateCloudStatusUI('online', 'BDD à jour (Temps réel)');
      })
      .catch(err => {
        console.warn("Erreur push Cloud REST:", err);
        updateCloudStatusUI('offline', 'Sauvegarde locale active');
      });
    }
  }, 350); // Debounce fluide de 350ms
}

/**
 * Réception et fusion des données venues du Cloud
 * RÈGLE FONDAMENTALE : LE CLOUD EST LA SOURCE UNIQUE DE VÉRITÉ
 */
function handleIncomingCloudData(remoteData, isInitialOrForced = false) {
  if (!remoteData || typeof appData === 'undefined') return;

  // Si c'est notre propre modification et qu'on ne force pas, ignorer le retour écho
  if (!isInitialOrForced && remoteData._lastClientId === CLIENT_SESSION_ID) {
    return;
  }

  lastRemoteSaveTimestamp = remoteData._lastUpdated || Date.now();
  hasSyncedInitialCloud = true;

  // Préserver la valeur d'un champ de recherche s'il est en cours de saisie
  const activeEl = document.activeElement;
  const isSearchInput = activeEl && (activeEl.id === 'searchCoproprietaire' || activeEl.id === 'searchPouvoir' || activeEl.id === 'searchResolution');
  const searchVal = isSearchInput ? activeEl.value : null;

  // ÉCRASEMENT DU LOCAL STORAGE AVEC LA VÉRITÉ DE LA BDD
  appData = remoteData;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));

  // Réactualisation immédiate de l'ensemble de l'interface
  if (typeof updateUI === 'function') updateUI();
  if (typeof renderAuditTab === 'function') renderAuditTab();

  // Ravitaillement immédiat de l'écran de verrouillage avec les données et PINs Firebase
  if (typeof populateAuthProfiles === 'function') populateAuthProfiles();
  if (typeof updateAuthPinHint === 'function') updateAuthPinHint();

  // Restaurer le champ de filtre si besoin
  if (isSearchInput && searchVal !== null) {
    const elAfter = document.getElementById(activeEl.id);
    if (elAfter) {
      elAfter.value = searchVal;
      elAfter.focus();
    }
  }

  updateCloudStatusUI('online', `BDD Synchronisée (${remoteData._lastUpdatedBy || 'En direct'})`);
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
    labelEl.innerText = label || (status === 'online' ? 'BDD Connectée' : 'Hors-ligne');
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
