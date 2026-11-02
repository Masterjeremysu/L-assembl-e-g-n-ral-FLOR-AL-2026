/**
 * Module Journal d'Audit & Traçabilité CS ("Qui a fait quoi ?")
 * Résidence Le Floréal - AG 2026
 */

let activeAuditFilter = 'ALL';
let activeAuditSearch = '';

/**
 * Enregistre une action horodatée dans l'historique d'audit
 */
function logAuditAction(type, description, details = '') {
  if (typeof appData === 'undefined') return;
  if (!appData.auditLogs) appData.auditLogs = [];

  const user = typeof getCurrentUser === 'function' ? getCurrentUser() : { name: 'Membre CS' };
  const heure = typeof getHeureParis === 'function' ? getHeureParis() : new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const dateStr = new Date().toLocaleDateString('fr-FR');

  const missionLabel = user.mission ? ` [${user.mission.split(' ')[0]}]` : '';
  const logEntry = {
    id: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    timestamp: new Date().toISOString(),
    heure: heure,
    date: dateStr,
    user: (user.name || 'Membre CS') + missionLabel,
    type: type, // 'POUVOIR', 'VOTE', 'PRESENCE', 'SECURITE', 'CONFIG'
    description: description,
    details: details
  };

  // Ajout en tête de liste
  appData.auditLogs.unshift(logEntry);

  // Limite de taille à 500 entrées pour éviter de surcharger la mémoire
  if (appData.auditLogs.length > 500) {
    appData.auditLogs = appData.auditLogs.slice(0, 500);
  }

  // Mettre à jour l'affichage si on est sur l'onglet Audit
  const sec = document.getElementById('section-audit');
  if (sec && sec.style.display !== 'none') {
    renderAuditTab();
  }
}

/**
 * Rendu complet de l'onglet Journal d'Audit
 */
function renderAuditTab() {
  if (typeof appData === 'undefined' || !appData.auditLogs) return;

  const logs = appData.auditLogs || [];

  // 1. Calcul des statistiques
  const total = logs.length;
  const countPouvoir = logs.filter(l => l.type === 'POUVOIR').length;
  const countVote = logs.filter(l => l.type === 'VOTE').length;
  const countPresence = logs.filter(l => l.type === 'PRESENCE').length;
  const countSecurite = logs.filter(l => l.type === 'SECURITE').length;

  const statTotalEl = document.getElementById('auditStatTotal');
  const statPouvoirEl = document.getElementById('auditStatPouvoir');
  const statVoteEl = document.getElementById('auditStatVote');
  const statPresenceEl = document.getElementById('auditStatPresence');
  const statSecuriteEl = document.getElementById('auditStatSecurite');

  if (statTotalEl) statTotalEl.innerText = total;
  if (statPouvoirEl) statPouvoirEl.innerText = countPouvoir;
  if (statVoteEl) statVoteEl.innerText = countVote;
  if (statPresenceEl) statPresenceEl.innerText = countPresence;
  if (statSecuriteEl) statSecuriteEl.innerText = countSecurite;

  // 2. Filtrage
  let filtered = logs;
  if (activeAuditFilter !== 'ALL') {
    filtered = filtered.filter(l => l.type === activeAuditFilter);
  }

  if (activeAuditSearch.trim()) {
    const q = activeAuditSearch.toLowerCase().trim();
    filtered = filtered.filter(l => 
      (l.user && l.user.toLowerCase().includes(q)) ||
      (l.description && l.description.toLowerCase().includes(q)) ||
      (l.details && l.details.toLowerCase().includes(q)) ||
      (l.heure && l.heure.includes(q))
    );
  }

  // 3. Rendu de la timeline
  const timelineEl = document.getElementById('auditTimelineContainer');
  if (!timelineEl) return;

  if (filtered.length === 0) {
    timelineEl.innerHTML = `
      <div style="text-align:center; padding:3rem 1rem; color:var(--gray-500); background:#ffffff; border-radius:12px; border:1px dashed #cbd5e1;">
        <div style="font-size:2rem; margin-bottom:0.5rem;">📋</div>
        <div style="font-weight:700; color:#334155;">Aucun événement enregistré pour ce filtre</div>
        <div style="font-size:0.85rem; margin-top:0.25rem;">Les actions des membres du CS (votes, pouvoirs, présences) apparaîtront ici automatiquement en temps réel.</div>
      </div>
    `;
    return;
  }

  timelineEl.innerHTML = filtered.map(item => {
    let typeClass = 'type-autre';
    let tagClass = 'tag-autre';
    let icon = '📝';

    if (item.type === 'POUVOIR') {
      typeClass = 'type-pouvoir';
      tagClass = 'tag-pouvoir';
      icon = '✉️ Pouvoir';
    } else if (item.type === 'VOTE') {
      typeClass = 'type-vote';
      tagClass = 'tag-vote';
      icon = '🗳️ Vote';
    } else if (item.type === 'PRESENCE') {
      typeClass = 'type-presence';
      tagClass = 'tag-presence';
      icon = '🚪 Émargement';
    } else if (item.type === 'SECURITE') {
      typeClass = 'type-securite';
      tagClass = 'tag-securite';
      icon = '🔒 Sécurité';
    }

    return `
      <div class="audit-card ${typeClass}">
        <div class="audit-main">
          <div class="audit-header-line">
            <span class="audit-tag ${tagClass}">${icon}</span>
            <span class="audit-user">👤 ${escapeHtml(item.user)}</span>
          </div>
          <div class="audit-desc">${escapeHtml(item.description)}</div>
          ${item.details ? `<div class="audit-details">${escapeHtml(item.details)}</div>` : ''}
        </div>
        <div class="audit-time">
          ⏱️ ${escapeHtml(item.heure)}
          <div style="font-size:0.7rem; color:#94a3b8; font-weight:normal; text-align:right;">${escapeHtml(item.date)}</div>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * Filtrer par catégorie
 */
function setAuditFilter(category, btnEl) {
  activeAuditFilter = category;
  document.querySelectorAll('.audit-filter-btn').forEach(b => b.classList.remove('active'));
  if (btnEl) btnEl.classList.add('active');
  renderAuditTab();
}

/**
 * Recherche dans les logs
 */
function onAuditSearch(val) {
  activeAuditSearch = val;
  renderAuditTab();
}

/**
 * Export du journal au format CSV (Excel UTF-8)
 */
function exportAuditLogsCsv() {
  if (typeof appData === 'undefined' || !appData.auditLogs || appData.auditLogs.length === 0) {
    alert("Aucun log à exporter.");
    return;
  }

  const logs = appData.auditLogs;
  let csv = "\uFEFF"; // BOM UTF-8 pour Excel
  csv += "ID;Date;Heure;Utilisateur CS;Categorie;Action;Details\r\n";

  logs.forEach(l => {
    const esc = (txt) => `"${String(txt || '').replace(/"/g, '""')}"`;
    csv += [
      esc(l.id),
      esc(l.date),
      esc(l.heure),
      esc(l.user),
      esc(l.type),
      esc(l.description),
      esc(l.details)
    ].join(";") + "\r\n";
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Journal_Audit_AG_CS_Floreal_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Effacer le journal d'audit (action réservée)
 */
function clearAuditLogs() {
  if (confirm("⚠️ Voulez-vous vraiment réinitialiser l'historique du journal d'audit ?")) {
    appData.auditLogs = [];
    logAuditAction('SECURITE', 'Journal réinitialisé', 'Historique d\'audit effacé');
    if (typeof persistData === 'function') persistData();
    renderAuditTab();
    showToast("Journal d'audit réinitialisé.", "info");
  }
}
