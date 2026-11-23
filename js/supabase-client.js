/**
 * Module Supabase Cloud BDD Temps Réel - Résidence Le Floréal AG 2026
 * Projet Dédié : xfsrcjdhojpwvsiyjksy (compte tac38000@gmail.com)
 * Architecture : PostgreSQL + Supabase Realtime (WebSocket) + Secours Local-First
 */

const SUPABASE_CONFIG = {
  url: "https://xfsrcjdhojpwvsiyjksy.supabase.co",
  anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhmc3JjamRob2pwd3ZzaXlqa3N5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTUwMzI3NTksImV4cCI6MjExMDYwODc1OX0.nhOT8xOOK66iRl3kA65cTUo8GNViKRhtzH7tn9WVH3s",
  stateId: "floreal_2026"
};

let supabaseClient = null;
let isSupabaseOnline = false;
let isSyncingSupabase = false;
let lastSupabaseSyncTimestamp = 0;
let realtimeChannels = [];

// Initialisation dès que le DOM est prêt
document.addEventListener("DOMContentLoaded", () => {
  initSupabase();
});

/**
 * Initialise le client Supabase et lance la synchronisation
 */
function initSupabase() {
  updateCloudStatusUI('syncing', 'Connexion BDD...');

  // Détection du réseau
  window.addEventListener('online', () => {
    updateCloudStatusUI('syncing', 'Reconnexion...');
    if (supabaseClient) {
      syncFromSupabase(true);
    } else {
      initSupabase();
    }
  });

  window.addEventListener('offline', () => {
    isSupabaseOnline = false;
    updateCloudStatusUI('offline', 'Mode Secours Local (Offline actif)');
  });

  if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
    try {
      supabaseClient = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
      console.log('✅ Supabase Client initialisé :', SUPABASE_CONFIG.url);
      setupSupabaseRealtime();
      syncFromSupabase(false);
    } catch (e) {
      console.error('Erreur initialisation Supabase Client :', e);
      updateCloudStatusUI('offline', 'Mode Secours Local (Erreur SDK)');
    }
  } else {
    console.warn('⚠️ SDK Supabase non présent sur window, repli direct sur API REST / LocalStorage');
    fallbackRestFetch();
  }
}

/**
 * Récupération complète depuis PostgreSQL Supabase
 */
async function syncFromSupabase(isManual = false) {
  if (!supabaseClient || isSyncingSupabase) return;
  isSyncingSupabase = true;

  try {
    if (isManual) updateCloudStatusUI('syncing', 'Téléchargement données BDD...');

    // 1. Récupérer les copropriétaires
    const { data: copros, error: errCopros } = await supabaseClient
      .from('ag_coproprietaires')
      .select('*')
      .order('id', { ascending: true });

    if (errCopros) throw errCopros;

    // 2. Récupérer les résolutions
    const { data: resolutions, error: errRes } = await supabaseClient
      .from('ag_resolutions')
      .select('*')
      .order('numero', { ascending: true });

    if (errRes) throw errRes;

    // 3. Récupérer l'état de séance et de projection
    const { data: stateData, error: errState } = await supabaseClient
      .from('ag_state')
      .select('*')
      .eq('id', SUPABASE_CONFIG.stateId)
      .maybeSingle();

    if (errState) throw errState;

    // Mise à jour intelligente de appData en mémoire (Fusion protectrice local/cloud)
    if (copros && copros.length > 0 && typeof appData !== 'undefined') {
      let localPouvoirsToPush = [];
      copros.forEach(c => {
        const local = appData.coproprietaires.find(item => item.id === c.id);
        if (local) {
          const remotePresence = (c.presence || 'ABSENT').toUpperCase();
          // Protection : Si l'utilisateur a enregistré un pouvoir sur son PC et que Supabase l'a encore en absent
          if (local.statut === 'POUVOIR' && remotePresence === 'ABSENT' && local.mandataire) {
            localPouvoirsToPush.push(local);
          } else {
            local.statut = remotePresence;
            local.mandataire = c.mandataire_id || '';
            local.tantiemes = c.tantiemes;
            if (c.heure_emargement) local.heure_emargement = c.heure_emargement;
            if (c.signature) local.signature = c.signature;
          }
        }
      });

      // Auto-push des pouvoirs locaux vers Supabase s'il y avait un décalage
      if (localPouvoirsToPush.length > 0) {
        console.log(`📡 Rapprochement : ${localPouvoirsToPush.length} pouvoir(s) locaux poussés vers Supabase`);
        localPouvoirsToPush.forEach(lp => {
          cloudUpdateCopro(lp.id, 'POUVOIR', lp.mandataire);
        });
      }
    }

    if (resolutions && resolutions.length > 0 && typeof appData !== 'undefined') {
      resolutions.forEach(r => {
        const local = appData.resolutions.find(item => item.id === r.id);
        if (local) {
          local.status = (r.statut || 'EN_ATTENTE').toUpperCase();
          local.tantiemesPour = r.votes_pour || 0;
          local.tantiemesContre = r.votes_contre || 0;
          local.tantiemesAbs = r.votes_abstention || 0;
          const details = r.votes_details || {};
          if (details.eluNom !== undefined) local.eluNom = details.eluNom;
          if (details.heureVote) local.heureVote = details.heureVote;
          if (details.opponentsText !== undefined) local.opponentsText = details.opponentsText;
          if (details.adoptedVia251 !== undefined) local.adoptedVia251 = !!details.adoptedVia251;
          if (details.amendedInSession !== undefined) local.amendedInSession = !!details.amendedInSession;
          local.votes = {
            pour: r.votes_pour || 0,
            contre: r.votes_contre || 0,
            abstention: r.votes_abstention || 0,
            details: details
          };
        }
      });
    }

    // 4. Synchronisation des codes PIN personnalisés (memberPins) & messages persos
    if (stateData && stateData.config && typeof appData !== 'undefined') {
      if (stateData.config.memberPins) {
        appData.memberPins = { ...(appData.memberPins || {}), ...stateData.config.memberPins };
        if (typeof updateAuthPinHint === 'function') updateAuthPinHint();
      }
      if (Array.isArray(stateData.config.customMessages)) {
        if (!appData.config) appData.config = {};
        appData.config.customMessages = stateData.config.customMessages;
      }
      if (stateData.config.vpcVotes && typeof stateData.config.vpcVotes === 'object') {
        appData.vpcVotes = { ...(appData.vpcVotes || {}), ...stateData.config.vpcVotes };
        if (!appData.config) appData.config = {};
        appData.config.vpcVotes = appData.vpcVotes;
      }
    }

    // 5. Récupérer les derniers journaux d'audit partagés (ag_audit_logs)
    try {
      const { data: auditRows } = await supabaseClient
        .from('ag_audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(60);
      if (auditRows && auditRows.length > 0 && typeof appData !== 'undefined') {
        const mapped = auditRows.map(row => {
          const parts = String(row.action || 'CONFIG : Action CS').split(':');
          const typeStr = (parts[0] || 'CONFIG').trim();
          const descStr = parts.slice(1).join(':').trim() || row.action || 'Action CS';
          return {
            id: 'sb_' + row.id,
            timestamp: row.created_at || new Date().toISOString(),
            heure: row.created_at ? new Date(row.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '',
            date: row.created_at ? new Date(row.created_at).toLocaleDateString('fr-FR') : '',
            user: row.auteur || 'Membre CS',
            type: typeStr,
            description: descStr,
            details: (row.details && typeof row.details === 'object') ? (row.details.text || '') : String(row.details || '')
          };
        });
        const existingKeys = new Set((appData.auditLogs || []).map(l => `${l.heure}|${l.description}|${l.user}`));
        mapped.forEach(m => {
          const key = `${m.heure}|${m.description}|${m.user}`;
          if (!existingKeys.has(key)) {
            appData.auditLogs = appData.auditLogs || [];
            appData.auditLogs.push(m);
            existingKeys.add(key);
          }
        });
      }
    } catch (eAudit) {
      console.warn('Lecture ag_audit_logs ignorée :', eAudit);
    }

    if (stateData && stateData.display_state) {
      if (typeof window.onRemoteDisplayStateUpdate === 'function') {
        window.onRemoteDisplayStateUpdate(stateData.display_state);
      } else if (typeof window.broadcastDisplayState === 'function') {
        window.broadcastDisplayState(stateData.display_state);
      }
    }

    // Sauvegarde miroir dans localStorage
    if (typeof STORAGE_KEY !== 'undefined' && typeof appData !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
    }

    isSupabaseOnline = true;
    lastSupabaseSyncTimestamp = Date.now();
    updateCloudStatusUI('online', 'Supabase Direct');

    if (typeof updateUI === 'function') {
      updateUI();
    }

    if (isManual && typeof showToast === 'function') {
      showToast('✅ Base PostgreSQL Supabase synchronisée !', 'success');
    }

  } catch (err) {
    console.warn('⚠️ Repli sur le cache local :', err);
    isSupabaseOnline = false;
    updateCloudStatusUI('offline', 'Mode Secours Local (Offline actif)');
    if (isManual && typeof showToast === 'function') {
      showToast('⚠️ Réseau ou BDD indisponible : données locales conservées', 'warning');
    }
  } finally {
    isSyncingSupabase = false;
  }
}

/**
 * Mise en place des abonnements Realtime Supabase (WebSocket)
 */
function setupSupabaseRealtime() {
  if (!supabaseClient) return;

  // Canal Copropriétaires (Émargements en direct)
  const coprosChannel = supabaseClient
    .channel('realtime_ag_coproprietaires')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'ag_coproprietaires' }, (payload) => {
      console.log('📡 Realtime Copro :', payload);
      const row = payload.new;
      if (row && typeof appData !== 'undefined') {
        const local = appData.coproprietaires.find(c => c.id === row.id);
        if (local) {
          local.statut = (row.presence || 'ABSENT').toUpperCase();
          local.mandataire = row.mandataire_id || '';
          if (row.heure_emargement) local.heure_emargement = row.heure_emargement;
          if (row.signature) local.signature = row.signature;
          
          if (typeof STORAGE_KEY !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
          }
          if (typeof updateUI === 'function') updateUI();
        }
      }
    })
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('⚡ Supabase Realtime : Connecté au flux Copropriétaires');
      }
    });

  // Canal Résolutions (Votes en direct)
  const resChannel = supabaseClient
    .channel('realtime_ag_resolutions')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'ag_resolutions' }, (payload) => {
      console.log('📡 Realtime Résolution :', payload);
      const row = payload.new;
      if (row && typeof appData !== 'undefined') {
        const local = appData.resolutions.find(r => r.id === row.id);
        if (local) {
          local.status = (row.statut || 'EN_ATTENTE').toUpperCase();
          local.tantiemesPour = row.votes_pour || 0;
          local.tantiemesContre = row.votes_contre || 0;
          local.tantiemesAbs = row.votes_abstention || 0;
          const details = row.votes_details || {};
          if (details.eluNom !== undefined) local.eluNom = details.eluNom;
          if (details.heureVote) local.heureVote = details.heureVote;
          if (details.opponentsText !== undefined) local.opponentsText = details.opponentsText;
          if (details.adoptedVia251 !== undefined) local.adoptedVia251 = !!details.adoptedVia251;
          if (details.amendedInSession !== undefined) local.amendedInSession = !!details.amendedInSession;
          local.votes = {
            pour: row.votes_pour || 0,
            contre: row.votes_contre || 0,
            abstention: row.votes_abstention || 0,
            details: details
          };
          
          if (typeof STORAGE_KEY !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
          }
          if (typeof updateUI === 'function') updateUI();
        }
      }
    })
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('⚡ Supabase Realtime : Connecté au flux Résolutions');
      }
    });

  // Canal Écran Public / Rétroprojecteur
  const stateChannel = supabaseClient
    .channel('realtime_ag_state')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'ag_state' }, (payload) => {
      console.log('📡 Realtime État Écran :', payload);
      const row = payload.new;
      if (row && row.display_state) {
        localStorage.setItem('AG_PUBLIC_DISPLAY_STATE', JSON.stringify(row.display_state));
        if (typeof window.onRemoteDisplayStateUpdate === 'function') {
          window.onRemoteDisplayStateUpdate(row.display_state);
        }
      }
      if (row && row.config && row.config.vpcVotes && typeof appData !== 'undefined') {
        appData.vpcVotes = row.config.vpcVotes;
        if (!appData.config) appData.config = {};
        appData.config.vpcVotes = row.config.vpcVotes;
        if (typeof STORAGE_KEY !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
        }
        if (typeof updateUI === 'function') updateUI();
      }
    })
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('⚡ Supabase Realtime : Connecté au flux Rétroprojecteur');
      }
    });

  realtimeChannels = [coprosChannel, resChannel, stateChannel];
}

/**
 * Pousse les modifications d'un émargement vers Supabase
 */
async function cloudUpdateCopro(coproId, presence, mandataireId = null, signature = null) {
  if (!supabaseClient || !isSupabaseOnline) return;

  try {
    const updatePayload = {
      presence: (presence || 'absent').toLowerCase(),
      mandataire_id: mandataireId || null,
      updated_at: new Date().toISOString()
    };
    if (presence && presence.toUpperCase() === 'PRESENT') {
      updatePayload.heure_emargement = new Date().toISOString();
    }
    if (signature) {
      updatePayload.signature = signature;
    }

    const { error } = await supabaseClient
      .from('ag_coproprietaires')
      .update(updatePayload)
      .eq('id', coproId);

    if (error) console.error('Erreur push copro Supabase :', error);
  } catch (e) {
    console.warn('Erreur réseau push copro :', e);
  }
}

/**
 * Pousse les modifications d'un vote de résolution vers Supabase
 */
async function cloudUpdateResolution(resId, statut, votesPour, votesContre, votesAbstention, details = {}) {
  if (!supabaseClient || !isSupabaseOnline) return;

  try {
    const { error } = await supabaseClient
      .from('ag_resolutions')
      .update({
        statut: (statut || 'en_attente').toLowerCase(),
        votes_pour: votesPour || 0,
        votes_contre: votesContre || 0,
        votes_abstention: votesAbstention || 0,
        votes_details: details,
        updated_at: new Date().toISOString()
      })
      .eq('id', resId);

    if (error) console.error('Erreur push résolution Supabase :', error);
  } catch (e) {
    console.warn('Erreur réseau push résolution :', e);
  }
}

/**
 * Pousse l'état d'affichage pour le Rétroprojecteur vers Supabase
 */
async function cloudUpdateDisplayState(displayState) {
  if (!supabaseClient || !isSupabaseOnline) return;

  try {
    const { error } = await supabaseClient
      .from('ag_state')
      .update({
        display_state: displayState,
        updated_at: new Date().toISOString(),
        updated_by: typeof getCurrentUser === 'function' ? getCurrentUser().name : 'CS Régie'
      })
      .eq('id', SUPABASE_CONFIG.stateId);

    if (error) console.error('Erreur push display state Supabase :', error);
  } catch (e) {
    console.warn('Erreur réseau push display state :', e);
  }
}

/**
 * Fonction globale appelée par persistData() dans app.js
 */
function cloudPushData(data) {
  if (!supabaseClient || !isSupabaseOnline || !data) return;

  const activeResIndex = data.seance?.currentResolutionIndex || 0;
  const activeRes = data.resolutions ? data.resolutions[activeResIndex] : null;

  if (activeRes) {
    cloudUpdateResolution(
      activeRes.id,
      activeRes.status,
      Number(activeRes.tantiemesPour) || activeRes.votes?.pour || 0,
      Number(activeRes.tantiemesContre) || activeRes.votes?.contre || 0,
      Number(activeRes.tantiemesAbs) || activeRes.votes?.abstention || 0,
      {
        ...(activeRes.votes?.details || {}),
        eluNom: activeRes.eluNom || '',
        heureVote: activeRes.heureVote || '',
        opponentsText: activeRes.opponentsText || ''
      }
    );
  }
}

/**
 * Repli direct REST si le SDK CDN est bloqué
 */
function fallbackRestFetch() {
  fetch(`${SUPABASE_CONFIG.url}/rest/v1/ag_state?id=eq.${SUPABASE_CONFIG.stateId}&select=*`, {
    headers: {
      'apikey': SUPABASE_CONFIG.anonKey,
      'Authorization': `Bearer ${SUPABASE_CONFIG.anonKey}`
    }
  })
  .then(r => r.json())
  .then(res => {
    if (res && res.length > 0) {
      isSupabaseOnline = true;
      updateCloudStatusUI('online', 'PostgreSQL Supabase (Mode REST actif)');
    }
  })
  .catch(() => {
    updateCloudStatusUI('offline', 'Mode Secours Local (Offline actif)');
  });
}

/**
 * Mise à jour de l'indicateur visuel UI
 */
function updateCloudStatusUI(status, text) {
  const badge = document.getElementById('cloudStatusBadge');
  const textEl = document.getElementById('cloudStatusText');
  const dotEl = document.getElementById('cloudStatusDot');

  if (textEl) textEl.textContent = text;
  if (badge) {
    badge.className = 'cloud-status-badge ' + status;
    badge.title = text;
  }
  if (dotEl) {
    dotEl.className = 'cloud-dot ' + status;
  }
}

/**
 * Bouton d'actualisation manuelle
 */
function forceSyncFromCloud() {
  syncFromSupabase(true);
}

/**
 * Pousse TOUS les copropriétaires et leurs pouvoirs locaux vers Supabase
 * Idéal pour synchroniser en un clic l'intégralité des pouvoirs saisis sur le PC
 */
async function cloudPushAllCoprosToSupabase(silent = false) {
  if (!supabaseClient || !isSupabaseOnline) {
    if (!silent && typeof showToast === 'function') {
      showToast('⚠️ Impossible de pousser vers Supabase : client non connecté.', 'warning');
    }
    return;
  }

  if (typeof appData === 'undefined' || !appData.coproprietaires) return;

  try {
    updateCloudStatusUI('syncing', 'Envoi des pouvoirs vers Supabase...');
    const coprosToPush = appData.coproprietaires.map(c => ({
      id: c.id,
      nom: c.nom,
      lots: c.lots || '',
      tantiemes: Number(c.tantiemes) || 0,
      presence: (c.statut || 'ABSENT').toLowerCase(),
      mandataire_id: (c.statut === 'POUVOIR' ? (c.mandataire || null) : null),
      signature: c.signature || null,
      updated_at: new Date().toISOString()
    }));

    // Envoi par tranches de 60
    const chunkSize = 60;
    for (let i = 0; i < coprosToPush.length; i += chunkSize) {
      const chunk = coprosToPush.slice(i, i + chunkSize);
      const { error } = await supabaseClient
        .from('ag_coproprietaires')
        .upsert(chunk, { onConflict: 'id' });

      if (error) throw error;
    }

    // Pousser également l'état global et les résolutions
    if (appData.config || appData.seance || appData.vpcVotes) {
      const mergedConfig = { ...(appData.config || {}), vpcVotes: appData.vpcVotes || {} };
      await supabaseClient
        .from('ag_state')
        .upsert({
          id: SUPABASE_CONFIG.stateId,
          config: mergedConfig,
          seance: appData.seance || {},
          updated_at: new Date().toISOString(),
          updated_by: typeof getCurrentUser === 'function' ? getCurrentUser().name : 'CS Sync'
        });
    }

    isSupabaseOnline = true;
    lastSupabaseSyncTimestamp = Date.now();
    updateCloudStatusUI('online', 'Supabase Direct');

    const countPouvoirs = appData.coproprietaires.filter(c => c.statut === 'POUVOIR').length;
    if (!silent && typeof showToast === 'function') {
      showToast(`☁️ Base Supabase synchronisée : ${countPouvoirs} pouvoirs et ${appData.coproprietaires.length} copropriétaires à jour !`, 'success');
    }
  } catch (err) {
    console.error('Erreur push complet Supabase :', err);
    updateCloudStatusUI('online', 'PostgreSQL Supabase');
    if (!silent && typeof showToast === 'function') {
      showToast(`Erreur lors de l'envoi vers Supabase : ${err.message}`, 'error');
    }
  }
}

/**
 * Synchronise les codes PIN personnalisés des membres CS dans ag_state.config
 */
async function cloudSaveMemberPins(memberPins) {
  if (!supabaseClient || !isSupabaseOnline || !memberPins) return;
  try {
    const { data: stateRow } = await supabaseClient
      .from('ag_state')
      .select('config')
      .eq('id', SUPABASE_CONFIG.stateId)
      .maybeSingle();

    const currentConfig = (stateRow && stateRow.config) ? stateRow.config : {};
    const mergedPins = { ...(currentConfig.memberPins || {}), ...memberPins };

    await supabaseClient
      .from('ag_state')
      .update({
        config: { ...currentConfig, memberPins: mergedPins },
        updated_at: new Date().toISOString(),
        updated_by: typeof getCurrentUser === 'function' ? getCurrentUser().name : 'CS Sécurité'
      })
      .eq('id', SUPABASE_CONFIG.stateId);
  } catch (e) {
    console.warn('Erreur synchro memberPins Supabase :', e);
  }
}

/**
 * Enregistre une entrée du Journal d'Audit dans public.ag_audit_logs
 */
async function cloudPushAuditLog(entry) {
  if (!supabaseClient || !isSupabaseOnline || !entry) return;
  try {
    await supabaseClient
      .from('ag_audit_logs')
      .insert({
        auteur: entry.user || 'Membre CS',
        action: `${entry.category || 'ACTION'} : ${entry.title || ''}`,
        details: { text: entry.details || '' },
        created_at: new Date().toISOString()
      });
  } catch (e) {
    console.warn('Erreur push ag_audit_logs :', e);
  }
}

async function cloudSaveCustomMessages(customMessages) {
  if (!supabaseClient || !isSupabaseOnline || !Array.isArray(customMessages)) return;
  try {
    const { data: stateRow } = await supabaseClient
      .from('ag_state')
      .select('config')
      .eq('id', SUPABASE_CONFIG.stateId)
      .maybeSingle();

    const currentConfig = (stateRow && stateRow.config) ? stateRow.config : {};
    await supabaseClient
      .from('ag_state')
      .update({
        config: { ...currentConfig, customMessages: customMessages },
        updated_at: new Date().toISOString(),
        updated_by: typeof getCurrentUser === 'function' ? getCurrentUser().name : 'CS Régie'
      })
      .eq('id', SUPABASE_CONFIG.stateId);
  } catch (e) {
    console.warn('Erreur synchro customMessages Supabase :', e);
  }
}

async function cloudSaveVpcVotes(vpcVotes) {
  if (!supabaseClient || !isSupabaseOnline || !vpcVotes || typeof vpcVotes !== 'object') return;
  try {
    const { data: stateRow } = await supabaseClient
      .from('ag_state')
      .select('config')
      .eq('id', SUPABASE_CONFIG.stateId)
      .maybeSingle();

    const currentConfig = (stateRow && stateRow.config) ? stateRow.config : {};
    await supabaseClient
      .from('ag_state')
      .update({
        config: { ...currentConfig, vpcVotes: vpcVotes },
        updated_at: new Date().toISOString(),
        updated_by: typeof getCurrentUser === 'function' ? getCurrentUser().name : 'CS VPC'
      })
      .eq('id', SUPABASE_CONFIG.stateId);
  } catch (e) {
    console.warn('Erreur synchro vpcVotes Supabase :', e);
  }
}

// Export global pour compatibilité
window.initSupabase = initSupabase;
window.syncFromSupabase = syncFromSupabase;
window.cloudUpdateCopro = cloudUpdateCopro;
window.cloudUpdateResolution = cloudUpdateResolution;
window.cloudUpdateDisplayState = cloudUpdateDisplayState;
window.cloudPushAllCoprosToSupabase = cloudPushAllCoprosToSupabase;
window.cloudSaveMemberPins = cloudSaveMemberPins;
window.cloudSaveCustomMessages = cloudSaveCustomMessages;
window.cloudSaveVpcVotes = cloudSaveVpcVotes;
window.cloudPushAuditLog = cloudPushAuditLog;
window.cloudPushData = cloudPushData;
window.forceSyncFromCloud = forceSyncFromCloud;
