/**
 * Application principale - Suivi AG & Votes Conseil Syndical (Module Anti-Fraude & Émargement)
 */

let appData = loadData();

function loadData() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (!parsed.coproprietaires) parsed.coproprietaires = [];
      if (!parsed.members) parsed.members = [];

      // Nettoyage automatique : Mme FANTINI n'a jamais été membre CS
      parsed.members = parsed.members.filter(m => m.id !== 'm_fantini' && !m.name.toLowerCase().includes('fantini'));

      // Démissions officielles en cours d'exercice
      const demissionnairesNoms = ['courant', 'legrand', 'duchez'];
      parsed.members.forEach(m => {
        const isDem = demissionnairesNoms.some(n => m.name.toLowerCase().includes(n) || (m.id && m.id.toLowerCase().includes(n)));
        if (isDem && m.statut !== 'ACTIF_FORCE') {
          m.statut = 'DEMISSIONNAIRE';
          if (!m.dateDemission) m.dateDemission = "Démission en cours d'exercice";
        } else if (!m.statut) {
          m.statut = 'ACTIF';
        }
      });
      return parsed;
    } catch (e) {
      console.error("Erreur parsing localStorage", e);
    }
  }
  return JSON.parse(JSON.stringify(DEFAULT_AG_DATA));
}

function persistData(broadcast = true) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
  updateUI();
  if (broadcast && isLiveActive) {
    broadcastLiveUpdate({ type: 'SYNC_FULL_DATA', data: appData });
  }
}

function reloadConvocationData() {
  if (confirm("Réinitialiser avec toutes les résolutions et copropriétaires de la convocation ?")) {
    appData = JSON.parse(JSON.stringify(DEFAULT_AG_DATA));
    persistData();
  }
}

// Navigation Tabs
function switchTab(tabId) {
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('main > section').forEach(sec => sec.style.display = 'none');

  const targetSec = document.getElementById('section-' + tabId);
  if (targetSec) targetSec.style.display = 'block';

  const buttons = document.querySelectorAll('.tab-btn');
  if (tabId === 'votes') buttons[0]?.classList.add('active');
  else if (tabId === 'presence') buttons[1]?.classList.add('active');
  else if (tabId === 'pouvoirs') buttons[2]?.classList.add('active');
  else if (tabId === 'members') buttons[3]?.classList.add('active');
  else if (tabId === 'settings') buttons[4]?.classList.add('active');
}

// UI Updates
function updateUI() {
  const totalTant = Number(appData.config.totalTantiemes) || 97478;

  // Synchronisation stricte des mandats et des pouvoirs avec le Conseil Syndical
  syncMembersAndPouvoirs();

  document.getElementById('headerSubtitle').innerText = `${appData.config.coproName} - AG du ${formatDate(appData.config.agDate)}`;
  document.getElementById('printAgTitle').innerText = `${appData.config.coproName} - Relevé Miroir des Votes du Conseil Syndical`;
  document.getElementById('printAgMeta').innerText = `AG du 25/11/2026 - Total syndicat : ${totalTant} tantièmes - Contrôle strict des délibérations`;

  // Compteurs d'émargement en temps réel
  const copros = appData.coproprietaires || [];
  let presentsPhysiques = 0;
  let representesPouvoir = 0;
  let votesCorresp = 0;
  let partisEnCours = 0;
  let tantiemesEnSalle = 0;

  copros.forEach(c => {
    const t = Number(c.tantiemes) || 0;
    if (c.statut === 'PRESENT') {
      presentsPhysiques++;
      tantiemesEnSalle += t;
    } else if (c.statut === 'POUVOIR') {
      representesPouvoir++;
      tantiemesEnSalle += t;
    } else if (c.statut === 'VPC') {
      votesCorresp++;
      tantiemesEnSalle += t;
    } else if (c.statut === 'PARTI') {
      partisEnCours++;
    }
  });

  const totalExprimesEnSalle = tantiemesEnSalle;
  appData.config.presentTantiemes = totalExprimesEnSalle;

  // Stats des votes
  const voteResolutions = appData.resolutions.filter(r => r.majorite !== 'article sans vote');
  const total = voteResolutions.length;
  const adopted = voteResolutions.filter(r => r.status === 'ADOPTEE').length;
  const rejected = voteResolutions.filter(r => r.status === 'REJETEE').length;
  const postponed = voteResolutions.filter(r => r.status === 'REPORTEE').length;
  const voted = adopted + rejected + postponed;

  document.getElementById('statTotal').innerText = total;
  document.getElementById('statVoted').innerText = voted;
  document.getElementById('statAdopted').innerText = adopted;
  document.getElementById('statRejected').innerText = rejected;
  document.getElementById('statPercent').innerText = total > 0 ? Math.round((voted / total) * 100) + '% voté' : '0%';

  // Voix du CS (Membres ACTIFS uniquement)
  const activeMembers = (appData.members || []).filter(m => m.statut !== 'DEMISSIONNAIRE');
  const csPerso = activeMembers.reduce((acc, m) => acc + (Number(m.tantiemes) || 0), 0);
  const csMandats = activeMembers.reduce((acc, m) => acc + (Number(m.mandatTantiemes) || 0), 0);
  const csTotal = csPerso + csMandats;
  const csPct = totalTant > 0 ? ((csTotal / totalTant) * 100).toFixed(1) : '0';

  document.getElementById('statCsWeight').innerText = `${csTotal} / ${totalTant}`;
  document.getElementById('statCsPercent').innerText = `${csPct}% des tantièmes totaux`;

  // Compteurs Émargement
  document.getElementById('statTantiemesEnSalle').innerText = `${totalExprimesEnSalle} / ${totalTant}`;
  document.getElementById('statEnSallePct').innerText = `${((totalExprimesEnSalle / totalTant) * 100).toFixed(1)}% des voix représentées`;
  document.getElementById('statPresentsCount').innerText = `${presentsPhysiques} présents, ${representesPouvoir} pouvoirs, ${partisEnCours} parti(s)`;

  // Badges d'onglets
  document.getElementById('badgeVotesCount').innerText = `${voted}/${total}`;
  document.getElementById('badgePresenceCount').innerText = `${presentsPhysiques + representesPouvoir + votesCorresp}/${copros.length}`;
  document.getElementById('badgeMembersCount').innerText = appData.members.length;

  renderResolutions(totalExprimesEnSalle, totalTant);
  renderCoproprietaires(totalExprimesEnSalle, totalTant);
  renderMembers(csPerso, csMandats, csTotal, totalTant);
  renderPouvoirsTab();

  if (isModeSeanceActive) {
    renderModeSeance();
  }

  // Settings
  document.getElementById('cfgCoproname').value = appData.config.coproName || '';
  document.getElementById('cfgAgDate').value = appData.config.agDate || '';
  document.getElementById('cfgTotalTantiemes').value = appData.config.totalTantiemes || 97478;
  document.getElementById('cfgPresentTantiemes').value = appData.config.presentTantiemes || totalExprimesEnSalle;
}

// Render Resolutions avec module de calcul de majorité miroir
function renderResolutions(totalEnSalle, totalCopro) {
  const listEl = document.getElementById('resolutionsList');
  const search = (document.getElementById('searchInput')?.value || '').toLowerCase();
  const statusFilter = document.getElementById('filterStatus')?.value || 'ALL';
  const csFilter = document.getElementById('filterCsConsigne')?.value || 'ALL';

  // Calcul du cumul des voix détenues par le CS (voix perso + mandats reçus)
  const csTotalVoix = appData.members.reduce((acc, m) => acc + (Number(m.tantiemes) || 0) + (Number(m.mandatTantiemes) || 0), 0);

  const filtered = appData.resolutions.filter(r => {
    const matchSearch = (r.number + ' ' + r.title + ' ' + (r.description || '') + ' ' + (r.csNotes || '')).toLowerCase().includes(search);
    const matchStatus = statusFilter === 'ALL' || r.status === statusFilter;
    const matchCs = csFilter === 'ALL' || r.csConsigne === csFilter;
    return matchSearch && matchStatus && matchCs;
  });

  if (filtered.length === 0) {
    listEl.innerHTML = `<div class="empty-state"><p>Aucune résolution ne correspond à vos filtres.</p></div>`;
    return;
  }

  listEl.innerHTML = filtered.map(r => {
    const isSansVote = (r.majorite === 'article sans vote');
    const csBadgeClass = {
      'POUR': 'tag-cs-pour',
      'CONTRE': 'tag-cs-contre',
      'ABSTENTION': 'tag-cs-abstention',
      'LIBRE': 'tag-cs-libre'
    }[r.csConsigne] || 'tag-cs-libre';

    const statusLabel = {
      'EN_ATTENTE': isSansVote ? 'Information' : 'En attente',
      'ADOPTEE': '✅ Adoptée',
      'REJETEE': '❌ Rejetée',
      'REPORTEE': '⏳ Reportée / Retirée'
    }[r.status] || r.status;

    // Calculs de dépouillement en direct
    const pour = Number(r.tantiemesPour) || 0;
    const contre = Number(r.tantiemesContre) || 0;
    const abs = Number(r.tantiemesAbs) || 0;
    const hasNumbers = (pour > 0 || contre > 0 || abs > 0);

    // Calcul légal de majorité selon l'article
    let legalNotice = '';
    let legalClass = '';
    if (hasNumbers && !isSansVote) {
      if (r.majorite === 'Article 24') {
        // Art. 24 : Majorité simple des voix exprimées (Pour > Contre, abstentions ne comptent pas)
        if (pour > contre) {
          legalNotice = `⚖️ Légalement ADOPTÉE (Art. 24) : ${pour} POUR > ${contre} CONTRE (Abstentions ${abs} exclues)`;
          legalClass = 'thresh-adoptee';
        } else {
          legalNotice = `⚖️ Légalement REJETÉE (Art. 24) : ${contre} CONTRE >= ${pour} POUR`;
          legalClass = 'thresh-rejetee';
        }
      } else if (r.majorite.includes('Article 25')) {
        // Art. 25 : Majorité absolue de TOUS les copropriétaires (> 50% de totalCopro)
        const seuil25 = Math.floor(totalCopro / 2) + 1;
        const seuilPasserelle = Math.ceil(totalCopro / 3);

        if (pour >= seuil25) {
          legalNotice = `⚖️ Légalement ADOPTÉE à l'Article 25 : ${pour} voix >= ${seuil25} (Majorité absolue atteinte)`;
          legalClass = 'thresh-adoptee';
        } else if (pour >= seuilPasserelle) {
          legalNotice = `⚠️ PASSERELLE ART. 25-1 DISPONIBLE : ${pour} voix >= ${seuilPasserelle} (1/3 atteint). Le syndic DOIT organiser un second vote immédiat à l'Art. 24 !`;
          legalClass = 'thresh-passerelle';
        } else {
          legalNotice = `⚖️ Légalement REJETÉE à l'Art. 25 et 25-1 : ${pour} voix < ${seuilPasserelle} (Moins d'un tiers des voix totales)`;
          legalClass = 'thresh-rejetee';
        }
      }
    }

    return `
      <div class="resolution-card status-${r.status}" id="res-card-${r.id}">
        <div class="resolution-header">
          <div style="flex:1;">
            <span class="resolution-num">Résolution n° ${escapeHtml(r.number)}</span>
            <h2 class="resolution-title">${escapeHtml(r.title)}</h2>
            <div class="tags">
              <span class="tag ${isSansVote ? 'tag-maj-sansvote' : 'tag-maj'}">${escapeHtml(r.majorite)}</span>
              ${!isSansVote ? `<span class="tag ${csBadgeClass}">Consigne CS : ${r.csConsigne}</span>` : ''}
              <span class="tag tag-status-${r.status}">${statusLabel}</span>
              ${r.heureVote ? `<span class="tag" style="background:#f1f5f9; color:#475569; font-weight:600;" title="Heure officielle du vote">⏱️ Votée à ${r.heureVote}</span>` : ''}
              ${r.opponentsList && r.opponentsList.length > 0 ? `<span class="badge-anti-fraude">🚨 ${r.opponentsList.length} opposant(s) consigné(s)</span>` : ''}
            </div>
          </div>
          <div class="resolution-actions no-print">
            ${!isSansVote ? `
              <button class="btn btn-outline-primary btn-sm" onclick="ouvrirSeanceSurRes('${r.id}')" title="Passer en mode séance grand format sur cette résolution">
                ▶ Séance
              </button>
              <button class="btn btn-purple btn-sm" onclick="openScrutinModal('${r.id}')" title="Contrôle des opposants et abstentions">
                🎯 Dépouillement
              </button>
            ` : ''}
            <button class="btn btn-secondary btn-sm" onclick="editResolution('${r.id}')" title="Modifier">✏️</button>
            <button class="btn btn-secondary btn-sm" onclick="deleteResolution('${r.id}')" title="Supprimer" style="color:var(--danger)">🗑️</button>
          </div>
        </div>

        ${r.description ? `<div class="resolution-desc">${escapeHtml(r.description)}</div>` : ''}

        ${r.eluNom ? `
          <div class="badge-elu-winner">
            👑 Élu(e) / Désigné(e) : <strong>${escapeHtml(r.eluNom)}</strong>
          </div>
        ` : ''}

        ${r.csNotes ? `
          <div class="cs-argument-box">
            <strong>💡 Recommandation du CS :</strong> ${escapeHtml(r.csNotes)}
          </div>
        ` : ''}

        ${r.notesSeance ? `
          <div style="font-size:0.83rem; color:var(--gray-700); margin:0.4rem 0; font-style:italic;">
            <strong>📝 Note de séance :</strong> ${escapeHtml(r.notesSeance)}
          </div>
        ` : ''}

        ${!isSansVote ? renderTacticalMajorityGauge(r, totalEnSalle, totalCopro, csTotalVoix) : ''}

        ${hasNumbers ? `
          <div class="depouillement-box">
            <div class="depouillement-header">
              <span>📊 Contrôle des voix (Feuille de vote CS)</span>
              <span style="font-size:0.75rem; color:var(--gray-600); font-weight:600;">En salle au moment du vote : ${totalEnSalle} tantièmes</span>
            </div>
            <div class="depouillement-meters">
              <div class="meter-card">
                <div class="meter-label">👍 POUR</div>
                <div class="meter-val c-pour">${pour}</div>
              </div>
              <div class="meter-card">
                <div class="meter-label">👎 CONTRE</div>
                <div class="meter-val c-contre">${contre}</div>
              </div>
              <div class="meter-card">
                <div class="meter-label">⚠️ ABSTENTION</div>
                <div class="meter-val c-abs">${abs}</div>
              </div>
            </div>
            ${legalNotice ? `<div class="legal-threshold-notice ${legalClass}">${legalNotice}</div>` : ''}
          </div>
        ` : ''}

        ${!isSansVote ? `
          <div class="resolution-vote-zone">
            <div class="vote-quick-actions no-print">
              <span style="font-size:0.82rem; font-weight:700; color:var(--gray-700); margin-right:0.3rem;">Décision finale :</span>
              <button class="vote-btn-choice ${r.status === 'ADOPTEE' ? 'selected-adoptee' : ''}" onclick="setQuickVote('${r.id}', 'ADOPTEE')">
                ✅ Adoptée
              </button>
              <button class="vote-btn-choice ${r.status === 'REJETEE' ? 'selected-rejetee' : ''}" onclick="setQuickVote('${r.id}', 'REJETEE')">
                ❌ Rejetée
              </button>
              <button class="vote-btn-choice ${r.status === 'REPORTEE' ? 'selected-reportee' : ''}" onclick="setQuickVote('${r.id}', 'REPORTEE')">
                ⏳ Reportée
              </button>
              ${r.status !== 'EN_ATTENTE' ? `
                <button class="vote-btn-choice" onclick="setQuickVote('${r.id}', 'EN_ATTENTE')" title="Annuler le vote" style="color:var(--gray-500);">
                  ↺ Annuler
                </button>
              ` : ''}
            </div>

            <div style="font-size:0.8rem; color:var(--gray-600);">
              ${r.syndicClaimStatus ? `<span>Syndic prétend : <strong>${r.syndicClaimStatus}</strong></span>` : ''}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }).join('');
}

// ==========================================
// CLASSIFICATION DES LOTS & TANTIÈMES (RÉSIDENCE LE FLORÉAL)
// ==========================================

function getCoproLotType(tantiemes) {
  const t = Number(tantiemes) || 0;
  if (t < 20) {
    return {
      code: 'PARKING',
      label: 'Parking / Cave',
      badgeClass: 'badge-lot-parking',
      icon: '🅿️'
    };
  } else if (t < 100) {
    return {
      code: 'GARAGE',
      label: 'Box seul (~44 t.)',
      badgeClass: 'badge-lot-garage',
      icon: '🚗'
    };
  } else if (t <= 445) {
    return {
      code: 'T4',
      label: 'Logement T4',
      badgeClass: 'badge-lot-t4',
      icon: '🏢'
    };
  } else {
    return {
      code: 'T5_CUMUL',
      label: 'T5 / Cumul Box',
      badgeClass: 'badge-lot-t5',
      icon: '🏰'
    };
  }
}

let coproSortCol = 'nom';
let coproSortDir = 'asc';

function toggleCoproSort(col) {
  if (coproSortCol === col) {
    coproSortDir = (coproSortDir === 'asc') ? 'desc' : 'asc';
  } else {
    coproSortCol = col;
    coproSortDir = (col === 'tantiemes') ? 'desc' : 'asc';
  }
  renderCoproprietaires(appData.config.presentTantiemes, appData.config.totalTantiemes);
}

// ==========================================
// MOTEUR DE RECHERCHE FUZZY PUR JAVASCRIPT
// ==========================================
function normalizeStr(str) {
  if (!str) return '';
  return String(str)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function levenshteinDistance(a, b) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

function fuzzyMatch(query, target) {
  if (!query) return true;
  if (!target) return false;

  const nQuery = normalizeStr(query);
  const nTarget = normalizeStr(target);
  if (!nQuery) return true;
  if (nTarget.includes(nQuery)) return true;

  const qTokens = nQuery.split(' ').filter(Boolean);
  const tTokens = nTarget.split(' ').filter(Boolean);

  return qTokens.every(qTok => {
    if (tTokens.some(tTok => tTok.includes(qTok))) return true;
    if (qTok.length >= 3) {
      const maxDist = qTok.length <= 4 ? 1 : 2;
      return tTokens.some(tTok => {
        if (Math.abs(tTok.length - qTok.length) > maxDist) return false;
        return levenshteinDistance(qTok, tTok) <= maxDist;
      });
    }
    return false;
  });
}

// Render Copropriétaires (Accueil / Émargement & Départs en séance)
function renderCoproprietaires(totalEnSalle, totalTant) {
  const tbody = document.getElementById('coproTableBody');
  if (!tbody) return;

  const list = appData.coproprietaires || [];
  const search = document.getElementById('searchCoproInput')?.value || '';
  const filterStatut = document.getElementById('filterCoproStatut')?.value || 'ALL';
  const filterLot = document.getElementById('filterCoproLotType')?.value || 'ALL';

  const filtered = list.filter(c => {
    const matchSearch = fuzzyMatch(search, `${c.nom} ${c.mandataire || ''} ${c.notes || ''} ${c.lots || ''}`);
    let matchStatut = true;
    if (filterStatut === 'TOP20') {
      matchStatut = (c.categorie && c.categorie.includes('Top 20%')) || (c.notes && c.notes.includes('Top 20%'));
    } else if (filterStatut !== 'ALL') {
      matchStatut = (c.statut === filterStatut);
    }

    let matchLot = true;
    if (filterLot !== 'ALL') {
      const lotInfo = getCoproLotType(c.tantiemes);
      matchLot = (lotInfo.code === filterLot);
    }

    return matchSearch && matchStatut && matchLot;
  });

  // Tri dynamique
  filtered.sort((a, b) => {
    let res = 0;
    if (coproSortCol === 'tantiemes') {
      res = (Number(a.tantiemes) || 0) - (Number(b.tantiemes) || 0);
    } else {
      res = (a.nom || '').localeCompare(b.nom || '', 'fr', { sensitivity: 'base' });
    }
    return coproSortDir === 'desc' ? -res : res;
  });

  // Indicateurs de tri dans les en-têtes
  const indNom = document.getElementById('sortIndicatorNom');
  const indTant = document.getElementById('sortIndicatorTant');
  if (indNom) indNom.innerText = coproSortCol === 'nom' ? (coproSortDir === 'asc' ? ' ▲' : ' ▼') : '';
  if (indTant) indTant.innerText = coproSortCol === 'tantiemes' ? (coproSortDir === 'asc' ? ' ▲' : ' ▼') : ' ↕️';

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:1.5rem; color:var(--gray-500);">Aucun copropriétaire trouvé avec ces filtres.</td></tr>`;
  } else {
    tbody.innerHTML = filtered.map(c => {
      const isTop20 = (c.categorie && c.categorie.includes('Top 20%')) || (c.notes && c.notes.includes('Top 20%'));
      const lotInfo = getCoproLotType(c.tantiemes);

      let statutBadge = '';
      if (c.statut === 'PRESENT') {
        statutBadge = `<span class="badge-present">✅ Présent (${c.heureArrivee || '18h00'})</span>`;
      } else if (c.statut === 'POUVOIR') {
        statutBadge = `<span class="badge-pouvoir">✉️ Pouvoir : ${escapeHtml(c.mandataire || 'Inconnu')}</span>`;
      } else if (c.statut === 'VPC') {
        statutBadge = `<span class="badge-vpc">📬 Vote Corresp.</span>`;
      } else if (c.statut === 'PARTI') {
        statutBadge = `<span class="badge-parti">🚪 Parti (${c.heureDepart || 'En cours'})</span>`;
      } else {
        statutBadge = `<span class="badge-absent">❌ Absent</span>`;
      }

      return `
        <tr>
          <td>
            <strong>${escapeHtml(c.nom)}</strong>
            ${isTop20 ? '<span style="font-size:0.75rem; color:#dc2626; margin-left:0.3rem;">🔥 Top 20%</span>' : ''}
          </td>
          <td>${escapeHtml(c.lots || '-')}</td>
          <td><span class="tantieme-pill">${c.tantiemes || 0}</span></td>
          <td><span class="badge-lot ${lotInfo.badgeClass}">${lotInfo.icon} ${lotInfo.label}</span></td>
          <td>${statutBadge}</td>
          <td>${escapeHtml(c.notes || '-')}</td>
          <td class="no-print">
            <div class="pointage-btn-group">
              <button class="btn btn-sm btn-success" onclick="pointerCoproPresent('${c.id}')" title="Pointer comme Présent en personne (révoque son pouvoir si existant)">
                Présent
              </button>
              <button class="btn btn-sm ${c.statut === 'POUVOIR' ? 'btn-info' : 'btn-outline-primary'}" onclick="openPouvoirModalForCopro('${c.id}')" title="Administrer / Attribuer le pouvoir">
                ✉️ Pouvoir
              </button>
              <button class="btn btn-sm btn-warning" onclick="promptDepartCopro('${c.id}')" title="Enregistrer son départ en cours d'AG">
                Parti
              </button>
              <button class="btn btn-sm btn-secondary" onclick="editCopro('${c.id}')" title="Modifier le statut / pouvoir">
                ✏️
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  const effectiveTotal = totalTant || 97478;
  document.getElementById('footPresentTantiemes').innerText = `${totalEnSalle} / ${effectiveTotal} tantièmes en salle (${((totalEnSalle / effectiveTotal) * 100).toFixed(1)}%)`;
}

// Horodatage officiel Garanti Heure de Paris (Europe/Paris)
function getHeureParis() {
  try {
    const formatter = new Intl.DateTimeFormat('fr-FR', {
      timeZone: 'Europe/Paris',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    return formatter.format(new Date()).replace(':', 'h');
  } catch (e) {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}h${String(d.getMinutes()).padStart(2, '0')}`;
  }
}

// Pointage express à l'accueil
function setCoproStatut(id, newStatut) {
  const c = appData.coproprietaires.find(x => x.id === id);
  if (c) {
    c.statut = newStatut;
    if (newStatut === 'PRESENT') {
      c.heureArrivee = getHeureParis();
      delete c.heureDepart;
    }
    persistData();
    showToast(`${c.nom} pointé comme ${newStatut}`, "success");
  }
}

function promptDepartCopro(id) {
  const c = appData.coproprietaires.find(x => x.id === id);
  if (!c) return;

  const defaultHour = getHeureParis();
  const heure = prompt(`Heure de départ de ${c.nom} (obligatoire sur feuille de présence) :`, defaultHour);
  if (heure !== null) {
    c.statut = 'PARTI';
    c.heureDepart = heure;
    c.notes = (c.notes ? c.notes + ' | ' : '') + `Parti à ${heure}`;
    persistData();
    showToast(`Départ de ${c.nom} enregistré à ${heure}. Ses tantièmes sont retirés des votes suivants.`, "warning");
  }
}

// Render Members CS
function renderMembers(csPerso, csMandats, csTotal, totalTant) {
  const tbody = document.getElementById('membersTableBody');

  if (appData.members.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:1.5rem; color:var(--gray-500);">Aucun membre du Conseil Syndical renseigné.</td></tr>`;
  } else {
    tbody.innerHTML = appData.members.map(m => {
      const isDemissionnaire = m.statut === 'DEMISSIONNAIRE';
      const perso = Number(m.tantiemes) || 0;
      const mand = Number(m.mandatTantiemes) || 0;
      const tot = perso + mand;
      const pct = totalTant > 0 ? ((tot / totalTant) * 100).toFixed(1) : 0;
      const isOverTenPct = !isDemissionnaire && totalTant > 0 && (tot / totalTant) > 0.10;

      const statutBadge = isDemissionnaire
        ? `<span class="badge-cs-demission" title="${escapeHtml(m.dateDemission || 'Démission en cours d\'exercice')}">🚪 Démissionnaire</span>`
        : `<span class="badge-cs-actif">🟢 En fonction</span>`;

      return `
        <tr class="${isDemissionnaire ? 'tr-demissionnaire' : ''}">
          <td>
            <strong>${escapeHtml(m.name)}</strong>
            ${isDemissionnaire && m.dateDemission ? `<div style="font-size:0.73rem; color:#dc2626; font-style:italic;">${escapeHtml(m.dateDemission)}</div>` : ''}
          </td>
          <td>${statutBadge}</td>
          <td>${escapeHtml(m.lots || '-')}</td>
          <td><span class="tantieme-pill" style="${isDemissionnaire ? 'opacity:0.6;' : ''}">${perso}</span></td>
          <td>${escapeHtml(m.mandats || 'Aucun')}</td>
          <td><span class="tantieme-pill" style="${isDemissionnaire ? 'opacity:0.6;' : ''}">${mand}</span></td>
          <td>
            <strong>${tot}</strong> ${isDemissionnaire ? '<span style="font-size:0.75rem; color:var(--gray-500);">(Hors CS)</span>' : `(${pct}%)`}
            ${isOverTenPct ? `<span title="Attention: dépasse 10% des voix totales de l'immeuble" style="color:var(--danger); font-size:0.75rem; font-weight:700;"> ⚠️ &gt;10%</span>` : ''}
          </td>
          <td class="no-print" style="text-align:right;">
            ${!isDemissionnaire ? `
              <button class="btn btn-warning-gold btn-sm" onclick="openNewPouvoirModal(null, '${m.id}')" title="Attribuer un pouvoir à ce membre du CS">✉️ + Pouvoir</button>
              <button class="btn btn-outline-danger btn-sm" onclick="toggleMemberDemission('${m.id}')" title="Déclarer démissionnaire en cours d'exercice">🚪 Démission</button>
            ` : `
              <button class="btn btn-secondary btn-sm" onclick="toggleMemberDemission('${m.id}')" title="Réintégrer parmi les membres actifs du CS">🔄 Réactiver</button>
            `}
            <button class="btn btn-secondary btn-sm" onclick="editMember('${m.id}')" title="Modifier fiche et tantièmes">✏️</button>
            <button class="btn btn-secondary btn-sm" onclick="deleteMember('${m.id}')" style="color:var(--danger)" title="Supprimer définitivement">🗑️</button>
          </td>
        </tr>
      `;
    }).join('');
  }

  document.getElementById('footPersoTantiemes').innerText = csPerso;
  document.getElementById('footMandatTantiemes').innerText = csMandats;
  document.getElementById('footTotalCsTantiemes').innerText = `${csTotal} / ${totalTant} (${totalTant > 0 ? ((csTotal / totalTant) * 100).toFixed(1) : 0}%)`;
}

// Quick Vote Action
function setQuickVote(id, newStatus) {
  const res = appData.resolutions.find(r => r.id === id);
  if (res) {
    res.status = newStatus;
    const totalEnSalle = appData.config.presentTantiemes || 0;
    if (newStatus !== 'EN_ATTENTE') {
      res.heureVote = getHeureParis();
      if (newStatus === 'ADOPTEE' && (!res.tantiemesPour || res.tantiemesPour === 0)) {
        res.tantiemesPour = totalEnSalle;
        res.tantiemesContre = res.tantiemesContre || 0;
        res.tantiemesAbs = res.tantiemesAbs || 0;
        res.syndicClaimStatus = res.syndicClaimStatus || 'ADOPTEE';
      } else if (newStatus === 'REJETEE' && (!res.tantiemesContre || res.tantiemesContre === 0)) {
        res.tantiemesContre = totalEnSalle;
        res.tantiemesPour = res.tantiemesPour || 0;
        res.tantiemesAbs = res.tantiemesAbs || 0;
        res.syndicClaimStatus = res.syndicClaimStatus || 'REJETEE';
      }
    } else {
      delete res.heureVote;
    }
    persistData();
    if (typeof isModeSeanceActive !== 'undefined' && isModeSeanceActive && activeSeanceResId === id) {
      renderModeSeance();
    }
    if (isLiveActive) {
      broadcastLiveUpdate({ type: 'QUICK_VOTE', id: id, status: newStatus, heureVote: res.heureVote });
    }
  }
}

// ==========================================
// MODULE DÉPOUILLEMENT MIROIR & SCRUTIN
// ==========================================
let currentScrutinResId = null;

function openScrutinModal(resId) {
  currentScrutinResId = resId;
  const res = appData.resolutions.find(r => r.id === resId);
  if (!res) return;

  document.getElementById('scrutinModalTitle').innerText = `Dépouillement Miroir - Résolution n° ${res.number}`;
  document.getElementById('scrutinResTitle').innerText = res.title;
  document.getElementById('scrutinResMaj').innerText = `Majorité légale requise : ${res.majorite}`;

  // Tantièmes présents en salle actuellement
  const totalEnSalle = appData.config.presentTantiemes || 0;
  document.getElementById('scrutinTotalSalle').innerText = totalEnSalle;

  document.getElementById('scrutinPourInput').value = res.tantiemesPour || '';
  document.getElementById('scrutinContreInput').value = res.tantiemesContre || '';
  document.getElementById('scrutinAbsInput').value = res.tantiemesAbs || '';
  document.getElementById('scrutinSyndicClaim').value = res.syndicClaimStatus || '';
  const voixInput = document.getElementById('scrutinSyndicVoixInput');
  if (voixInput) voixInput.value = res.syndicClaimVoix || '';
  document.getElementById('scrutinOpponentsList').value = res.opponentsText || '';
  const eluInput = document.getElementById('scrutinEluNomInput');
  if (eluInput) eluInput.value = res.eluNom || '';

  const searchInput = document.getElementById('scrutinChecklistSearch');
  if (searchInput) searchInput.value = '';

  // Calcul instantané des opposants cochés
  renderScrutinChecklist();
  computeScrutinTotals();
  verifierDiscordanceScrutin();
  openModal('scrutinModal');
}

function renderScrutinChecklist() {
  const container = document.getElementById('scrutinCoproChecklist');
  if (!container) return;

  const res = appData.resolutions.find(r => r.id === currentScrutinResId);
  const activeOpponents = res.opponentsIds || [];
  const activeAbs = res.absenteeIds || [];

  // Filtrer uniquement les copropriétaires présents ou représentés en salle
  const presents = (appData.coproprietaires || []).filter(c => c.statut === 'PRESENT' || c.statut === 'POUVOIR' || c.statut === 'VPC');

  if (presents.length === 0) {
    container.innerHTML = `<div style="font-size:0.82rem; color:var(--gray-500); padding:0.5rem;">
      Astuce : Pointez d'abord les présents dans l'onglet « Copropriétaires & Pouvoirs », ou saisissez directement les chiffres ci-dessous.
    </div>`;
    return;
  }

  container.innerHTML = `
    <div style="font-size:0.8rem; font-weight:700; color:var(--primary); margin-bottom:0.4rem;">
      Mains levées en salle (Cochez uniquement CONTRE ou ABSTENTION — Le reste vote POUR automatiquement) :
    </div>
    <div class="scrutin-checklist-box">
      ${presents.map(c => `
        <div class="scrutin-item-row" data-search="${escapeHtml(c.nom)} ${escapeHtml(c.lots || '')} ${c.tantiemes}" style="display:flex; justify-content:space-between; align-items:center; padding:0.35rem 0.4rem; border-bottom:1px solid #f1f5f9; font-size:0.82rem;">
          <label style="display:flex; align-items:center; gap:0.45rem; cursor:pointer; flex:1; min-width:0; margin-right:0.5rem;">
            <input type="checkbox" class="chk-contre" data-id="${c.id}" data-tant="${c.tantiemes}" ${activeOpponents.includes(c.id) ? 'checked' : ''} onchange="onScrutinCheckboxChange(this, 'CONTRE')">
            <span style="font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escapeHtml(c.nom)}</span>
            <span class="tantieme-pill" style="font-size:0.75rem;">${c.tantiemes} t.</span>
            ${c.statut === 'POUVOIR' ? `<span style="font-size:0.72rem; color:#2563eb;">(➔ ${escapeHtml(c.mandataire || 'CS')})</span>` : ''}
            ${c.statut === 'VPC' ? `<span style="font-size:0.72rem; color:#7c3aed;">(VPC)</span>` : ''}
          </label>
          <label style="display:flex; align-items:center; gap:0.3rem; font-size:0.75rem; color:#d97706; cursor:pointer; white-space:nowrap;">
            <input type="checkbox" class="chk-abs" data-id="${c.id}" data-tant="${c.tantiemes}" ${activeAbs.includes(c.id) ? 'checked' : ''} onchange="onScrutinCheckboxChange(this, 'ABS')">
            Abstention
          </label>
        </div>
      `).join('')}
    </div>
  `;
}

function filtrerScrutinChecklist() {
  const q = document.getElementById('scrutinChecklistSearch')?.value || '';
  const rows = document.querySelectorAll('#scrutinCoproChecklist .scrutin-item-row');
  rows.forEach(row => {
    const text = row.getAttribute('data-search') || '';
    if (fuzzyMatch(q, text)) {
      row.style.display = 'flex';
    } else {
      row.style.display = 'none';
    }
  });
}

function scrutinValiderUnanimite() {
  const totalSalle = Number(document.getElementById('scrutinTotalSalle').innerText) || appData.config.presentTantiemes || 0;

  // Décocher toutes les cases de la checklist
  document.querySelectorAll('.chk-contre').forEach(cb => cb.checked = false);
  document.querySelectorAll('.chk-abs').forEach(cb => cb.checked = false);

  document.getElementById('scrutinContreInput').value = 0;
  document.getElementById('scrutinAbsInput').value = 0;
  document.getElementById('scrutinPourInput').value = totalSalle;
  document.getElementById('scrutinOpponentsList').value = "Aucun opposant (Unanimité)";
  document.getElementById('scrutinSyndicClaim').value = 'ADOPTEE';
  document.getElementById('scrutinSyndicVoixInput').value = totalSalle;

  const res = appData.resolutions.find(r => r.id === currentScrutinResId);
  if (res) {
    res.opponentsIds = [];
    res.absenteeIds = [];
    res.opponentsList = [];
    res.opponentsText = "Adoptée à l'unanimité (0 contre, 0 abstention)";
    res.tantiemesPour = totalSalle;
    res.tantiemesContre = 0;
    res.tantiemesAbs = 0;
  }

  computeScrutinTotals();
  verifierDiscordanceScrutin();
  showToast("⚡ Scrutin pré-rempli à l'UNANIMITÉ (100% POUR) !", "success");
}

function onScrutinCheckboxChange(el, type) {
  if (el) {
    const id = el.getAttribute('data-id');
    if (type === 'CONTRE' && el.checked) {
      // Exclusivité mutuelle : si on coche Contre, on décoche Abstention
      const absCb = document.querySelector(`.chk-abs[data-id="${id}"]`);
      if (absCb) absCb.checked = false;
    } else if (type === 'ABS' && el.checked) {
      // Exclusivité mutuelle : si on coche Abstention, on décoche Contre
      const contreCb = document.querySelector(`.chk-contre[data-id="${id}"]`);
      if (contreCb) contreCb.checked = false;
    }
  }

  let contreTotal = 0;
  let absTotal = 0;
  const contreNoms = [];
  const contreIds = [];
  const absIds = [];

  document.querySelectorAll('.chk-contre:checked').forEach(cb => {
    const tant = Number(cb.getAttribute('data-tant')) || 0;
    const id = cb.getAttribute('data-id');
    contreTotal += tant;
    contreIds.push(id);
    const copro = appData.coproprietaires.find(c => c.id === id);
    if (copro) contreNoms.push(`${copro.nom} (${tant})`);
  });

  document.querySelectorAll('.chk-abs:checked').forEach(cb => {
    const tant = Number(cb.getAttribute('data-tant')) || 0;
    const id = cb.getAttribute('data-id');
    absTotal += tant;
    absIds.push(id);
  });

  document.getElementById('scrutinContreInput').value = contreTotal;
  document.getElementById('scrutinAbsInput').value = absTotal;
  document.getElementById('scrutinOpponentsList').value = contreNoms.join(', ');

  const res = appData.resolutions.find(r => r.id === currentScrutinResId);
  if (res) {
    res.opponentsIds = contreIds;
    res.absenteeIds = absIds;
    res.opponentsList = contreNoms;
  }

  computeScrutinTotals();
}

function computeScrutinTotals() {
  const totalSalle = Number(document.getElementById('scrutinTotalSalle').innerText) || appData.config.presentTantiemes || 0;
  const contre = Number(document.getElementById('scrutinContreInput').value) || 0;
  const abs = Number(document.getElementById('scrutinAbsInput').value) || 0;

  // En droit, Voix Pour = Total Présents - Contre - Abstention
  const pourCalcule = Math.max(0, totalSalle - contre - abs);
  document.getElementById('scrutinPourInput').value = pourCalcule;

  // Calcul du résultat légal
  const res = appData.resolutions.find(r => r.id === currentScrutinResId);
  const totalCopro = Number(appData.config.totalTantiemes) || 97478;
  const resultBox = document.getElementById('scrutinLegalVerdict');

  if (!res || res.majorite === 'article sans vote') {
    resultBox.innerHTML = `<em>Résolution sans vote.</em>`;
    return;
  }

  if (res.majorite === 'Article 24') {
    if (pourCalcule > contre) {
      resultBox.innerHTML = `<span style="color:var(--success); font-weight:700;">✅ ADOPTÉE à l'Article 24</span> (${pourCalcule} Pour contre ${contre} Contre). Les ${abs} abstentions sont légales et non comptabilisées.`;
    } else {
      resultBox.innerHTML = `<span style="color:var(--danger); font-weight:700;">❌ REJETÉE à l'Article 24</span> (${contre} Contre >= ${pourCalcule} Pour).`;
    }
  } else if (res.majorite.includes('Article 25')) {
    const seuil25 = Math.floor(totalCopro / 2) + 1;
    const seuil13 = Math.ceil(totalCopro / 3);

    if (pourCalcule >= seuil25) {
      resultBox.innerHTML = `<span style="color:var(--success); font-weight:700;">✅ ADOPTÉE à l'Article 25</span> (${pourCalcule} Pour >= ${seuil25} requis).`;
    } else if (pourCalcule >= seuil13) {
      resultBox.innerHTML = `<span style="color:#b45309; font-weight:700;">⚠️ PASSERELLE ART. 25-1 DISPONIBLE</span> (${pourCalcule} Pour >= ${seuil13} soit 1/3 des voix). Le syndic n'a PAS le droit de rejeter définitivement : un 2nd vote à l'Art. 24 est obligatoire en séance !`;
    } else {
      resultBox.innerHTML = `<span style="color:var(--danger); font-weight:700;">❌ REJETÉE Définitivement</span> (${pourCalcule} Pour < ${seuil13} requis pour la passerelle).`;
    }
  }

  // Contrôle automatique des discordances syndic en direct
  verifierDiscordanceScrutin();
}

function verifierDiscordanceScrutin() {
  const box = document.getElementById('scrutinDiscordanceBox');
  if (!box) return;

  const res = appData.resolutions.find(r => r.id === currentScrutinResId);
  if (!res || res.majorite === 'article sans vote') {
    box.style.display = 'none';
    return;
  }

  const claim = document.getElementById('scrutinSyndicClaim')?.value;
  const syndicVoix = Number(document.getElementById('scrutinSyndicVoixInput')?.value) || 0;
  const pourCalcule = Number(document.getElementById('scrutinPourInput')?.value) || 0;
  const contre = Number(document.getElementById('scrutinContreInput')?.value) || 0;
  const totalCopro = Number(appData.config.totalTantiemes) || 97478;

  let legalVerdict = 'REJETEE';
  let isPasserelle = false;

  if (res.majorite === 'Article 24') {
    legalVerdict = (pourCalcule > contre) ? 'ADOPTEE' : 'REJETEE';
  } else if (res.majorite.includes('Article 25')) {
    const seuil25 = Math.floor(totalCopro / 2) + 1;
    const seuil13 = Math.ceil(totalCopro / 3);
    if (pourCalcule >= seuil25) {
      legalVerdict = 'ADOPTEE';
    } else if (pourCalcule >= seuil13) {
      legalVerdict = 'REJETEE';
      isPasserelle = true;
    } else {
      legalVerdict = 'REJETEE';
    }
  }

  const isDiscordanceStatus = claim && (claim !== legalVerdict);
  const diffVoix = (syndicVoix > 0) ? Math.abs(syndicVoix - pourCalcule) : 0;
  const isDiscordanceVoix = (syndicVoix > 0 && diffVoix >= 300);

  if (isDiscordanceStatus || isDiscordanceVoix || (isPasserelle && claim === 'REJETEE')) {
    box.style.display = 'block';
    box.style.background = '#fef2f2';
    box.style.border = '2px solid #ef4444';
    box.style.borderRadius = '8px';
    box.style.padding = '0.75rem 1rem';
    box.style.color = '#991b1b';

    let details = [];
    if (isDiscordanceStatus) {
      details.push(`Le syndic Citya prétend la résolution <strong>${claim === 'ADOPTEE' ? 'ADOPTÉE' : 'REJETÉE'}</strong> alors que le décompte légal conclut à <strong>${legalVerdict === 'ADOPTEE' ? 'ADOPTÉE' : 'REJETÉE'}</strong> !`);
    }
    if (isPasserelle && claim === 'REJETEE') {
      details.push(`Attention : Le seuil du 1/3 (Art. 25-1) étant atteint (${pourCalcule.toLocaleString('fr-FR')} voix), Citya ne PEUT PAS prononcer un rejet définitif : un second vote immédiat à l'Art. 24 est obligatoire !`);
    }
    if (isDiscordanceVoix) {
      details.push(`Écart sur les voix : Citya annonce <strong>${syndicVoix.toLocaleString('fr-FR')} voix</strong> vs <strong>${pourCalcule.toLocaleString('fr-FR')} réelles</strong> (différence de ${diffVoix.toLocaleString('fr-FR')} voix).`);
    }

    box.innerHTML = `
      <div style="font-weight:800; font-size:0.92rem; margin-bottom:0.25rem;">🚨 ALERTE DISCORDANCE IMMÉDIATE (SYNDIC vs CONSEIL SYNDICAL)</div>
      <div style="font-size:0.84rem; line-height:1.45;">
        ${details.map(d => `<div>• ${d}</div>`).join('')}
      </div>
      <div style="margin-top:0.4rem; font-weight:700; color:#dc2626;">
        ⚖️ Cliquez ci-dessous sur « ⚠️ Rédiger une réserve au PV » pour consigner cette irrégularité avant le vote suivant !
      </div>
    `;
  } else if (claim && claim === legalVerdict) {
    box.style.display = 'block';
    box.style.background = '#ecfdf5';
    box.style.border = '1px solid #10b981';
    box.style.borderRadius = '8px';
    box.style.padding = '0.5rem 0.85rem';
    box.style.color = '#065f46';
    box.innerHTML = `
      <strong>✅ Annonce conforme au calcul légal :</strong> Le syndic et le dépouillement s'accordent sur le résultat (<strong>${claim}</strong>).
    `;
  } else {
    box.style.display = 'none';
  }
}

function ouvrirReserveModalDepuisScrutin() {
  if (!currentScrutinResId) return;
  const res = appData.resolutions.find(r => r.id === currentScrutinResId);
  const claim = document.getElementById('scrutinSyndicClaim')?.value;
  const syndicVoix = document.getElementById('scrutinSyndicVoixInput')?.value;
  const pour = document.getElementById('scrutinPourInput')?.value;

  closeModal('scrutinModal');
  openReserveModal(currentScrutinResId);

  // Pré-remplir les détails si discordance
  const detailsInput = document.getElementById('reserveDetailsInput');
  if (detailsInput && claim) {
    let detailMsg = `Le syndic prétend la résolution ${claim}`;
    if (syndicVoix) detailMsg += ` avec ${syndicVoix} voix`;
    if (pour) detailMsg += ` alors que le dépouillement contradictoire dénombre ${pour} voix pour`;
    detailsInput.value = detailMsg;
    genererTexteReserve();
  }
}

function saveScrutin(e) {
  e.preventDefault();
  const res = appData.resolutions.find(r => r.id === currentScrutinResId);
  if (!res) return;

  res.tantiemesPour = Number(document.getElementById('scrutinPourInput').value) || 0;
  res.tantiemesContre = Number(document.getElementById('scrutinContreInput').value) || 0;
  res.tantiemesAbs = Number(document.getElementById('scrutinAbsInput').value) || 0;
  res.syndicClaimStatus = document.getElementById('scrutinSyndicClaim').value;
  const syndicVoixVal = Number(document.getElementById('scrutinSyndicVoixInput')?.value) || 0;
  if (syndicVoixVal > 0) res.syndicClaimVoix = syndicVoixVal;
  res.opponentsText = document.getElementById('scrutinOpponentsList').value.trim();
  const eluVal = document.getElementById('scrutinEluNomInput')?.value.trim();
  if (eluVal !== undefined) res.eluNom = eluVal;

  // Détermination automatique du statut
  const totalCopro = Number(appData.config.totalTantiemes) || 97478;
  if (res.majorite === 'Article 24') {
    res.status = (res.tantiemesPour > res.tantiemesContre) ? 'ADOPTEE' : 'REJETEE';
  } else if (res.majorite.includes('Article 25')) {
    const seuil25 = Math.floor(totalCopro / 2) + 1;
    res.status = (res.tantiemesPour >= seuil25) ? 'ADOPTEE' : 'REJETEE';
  }

  // Horodatage officiel du vote (Heure de Paris)
  res.heureVote = getHeureParis();

  closeModal('scrutinModal');
  persistData();
  if (typeof isModeSeanceActive !== 'undefined' && isModeSeanceActive && activeSeanceResId === res.id) {
    renderModeSeance();
  }
  showToast(`Résultat miroir enregistré pour la résolution ${res.number} !`, "success");
}

// Modal helpers
function openModal(id) { document.getElementById(id)?.classList.add('active'); }
function closeModal(id) { document.getElementById(id)?.classList.remove('active'); }

// Resolution Handlers
function openNewResolutionModal() {
  document.getElementById('resModalTitle').innerText = 'Ajouter une résolution';
  document.getElementById('resFormId').value = '';
  document.getElementById('resFormNum').value = String(appData.resolutions.length + 1).padStart(2, '0');
  document.getElementById('resFormTitle').value = '';
  document.getElementById('resFormDesc').value = '';
  document.getElementById('resFormMaj').value = 'Article 24';
  document.getElementById('resFormCsConsigne').value = 'POUR';
  document.getElementById('resFormStatus').value = 'EN_ATTENTE';
  document.getElementById('resFormCsNotes').value = '';
  document.getElementById('resFormTantiemesPour').value = '';
  document.getElementById('resFormTantiemesContre').value = '';
  document.getElementById('resFormNotes').value = '';
  const eluInput = document.getElementById('resFormEluNom');
  if (eluInput) eluInput.value = '';
  openModal('resolutionModal');
}

function editResolution(id) {
  const res = appData.resolutions.find(r => r.id === id);
  if (!res) return;

  document.getElementById('resModalTitle').innerText = `Modifier la résolution n° ${res.number}`;
  document.getElementById('resFormId').value = res.id;
  document.getElementById('resFormNum').value = res.number || '';
  document.getElementById('resFormTitle').value = res.title || '';
  document.getElementById('resFormDesc').value = res.description || '';
  document.getElementById('resFormMaj').value = res.majorite || 'Article 24';
  document.getElementById('resFormCsConsigne').value = res.csConsigne || 'POUR';
  document.getElementById('resFormStatus').value = res.status || 'EN_ATTENTE';
  document.getElementById('resFormCsNotes').value = res.csNotes || '';
  document.getElementById('resFormTantiemesPour').value = res.tantiemesPour || '';
  document.getElementById('resFormTantiemesContre').value = res.tantiemesContre || '';
  document.getElementById('resFormNotes').value = res.notesSeance || '';
  const eluInput = document.getElementById('resFormEluNom');
  if (eluInput) eluInput.value = res.eluNom || '';

  openModal('resolutionModal');
}

function saveResolution(e) {
  e.preventDefault();
  const id = document.getElementById('resFormId').value;
  const resData = {
    number: document.getElementById('resFormNum').value.trim(),
    title: document.getElementById('resFormTitle').value.trim(),
    description: document.getElementById('resFormDesc').value.trim(),
    majorite: document.getElementById('resFormMaj').value,
    csConsigne: document.getElementById('resFormCsConsigne').value,
    status: document.getElementById('resFormStatus').value,
    csNotes: document.getElementById('resFormCsNotes').value.trim(),
    tantiemesPour: document.getElementById('resFormTantiemesPour').value.trim(),
    tantiemesContre: document.getElementById('resFormTantiemesContre').value.trim(),
    notesSeance: document.getElementById('resFormNotes').value.trim(),
    eluNom: document.getElementById('resFormEluNom')?.value.trim() || ''
  };

  if (id) {
    const index = appData.resolutions.findIndex(r => r.id === id);
    if (index !== -1) appData.resolutions[index] = { ...appData.resolutions[index], ...resData };
  } else {
    appData.resolutions.push({ id: 'res_' + Date.now(), ...resData });
  }

  closeModal('resolutionModal');
  persistData();
}

function deleteResolution(id) {
  const res = appData.resolutions.find(r => r.id === id);
  if (!res) return;
  if (confirm(`Supprimer la résolution n° ${res.number} ?`)) {
    appData.resolutions = appData.resolutions.filter(r => r.id !== id);
    persistData();
  }
}

// Members Handlers
function openNewMemberModal() {
  document.getElementById('memberModalTitle').innerText = 'Ajouter un membre du CS';
  document.getElementById('memberFormId').value = '';
  document.getElementById('memFormName').value = '';
  document.getElementById('memFormLots').value = '';
  document.getElementById('memFormTantiemes').value = '';
  document.getElementById('memFormMandats').value = '';
  document.getElementById('memFormMandatTantiemes').value = '';
  document.getElementById('memFormStatut').value = 'ACTIF';
  document.getElementById('memFormDateDemission').value = '';
  openModal('memberModal');
}

function editMember(id) {
  const m = appData.members.find(x => x.id === id);
  if (!m) return;
  document.getElementById('memberModalTitle').innerText = `Modifier le membre : ${m.name}`;
  document.getElementById('memberFormId').value = m.id;
  document.getElementById('memFormName').value = m.name || '';
  document.getElementById('memFormLots').value = m.lots || '';
  document.getElementById('memFormTantiemes').value = m.tantiemes || '';
  document.getElementById('memFormMandats').value = m.mandats || '';
  document.getElementById('memFormMandatTantiemes').value = m.mandatTantiemes || '';
  document.getElementById('memFormStatut').value = m.statut || 'ACTIF';
  document.getElementById('memFormDateDemission').value = m.dateDemission || '';
  openModal('memberModal');
}

function saveMember(e) {
  e.preventDefault();
  const id = document.getElementById('memberFormId').value;
  const memData = {
    name: document.getElementById('memFormName').value.trim(),
    lots: document.getElementById('memFormLots').value.trim(),
    tantiemes: Number(document.getElementById('memFormTantiemes').value) || 0,
    mandats: document.getElementById('memFormMandats').value.trim(),
    mandatTantiemes: Number(document.getElementById('memFormMandatTantiemes').value) || 0,
    statut: document.getElementById('memFormStatut').value || 'ACTIF',
    dateDemission: document.getElementById('memFormDateDemission').value.trim()
  };

  if (id) {
    const index = appData.members.findIndex(m => m.id === id);
    if (index !== -1) {
      const prevStatut = appData.members[index].statut || 'ACTIF';
      appData.members[index] = { ...appData.members[index], ...memData };
      if (prevStatut === 'ACTIF' && memData.statut === 'DEMISSIONNAIRE') {
        libererPouvoirsMembreDemissionnaire(appData.members[index]);
      }
    }
  } else {
    appData.members.push({ id: 'mem_' + Date.now(), ...memData });
  }

  closeModal('memberModal');
  persistData();
}

function toggleMemberDemission(id) {
  const m = appData.members.find(x => x.id === id);
  if (!m) return;

  if (m.statut === 'DEMISSIONNAIRE') {
    m.statut = 'ACTIF';
    persistData();
    showToast(`✅ ${m.name} est à nouveau actif au sein du Conseil Syndical.`, "success");
  } else {
    // Vérifier les pouvoirs rattachés
    const assigned = (appData.coproprietaires || []).filter(c =>
      c.statut === 'POUVOIR' && (c.mandataireMemberId === m.id || (c.mandataire && c.mandataire.toLowerCase().includes(m.name.toLowerCase())))
    );

    let msg = `Déclarer "${m.name}" démissionnaire en cours d'exercice ?\n\nSes voix personnelles (${m.tantiemes} tant.) ne seront plus comptabilisées dans la force du CS.`;
    if (assigned.length > 0) {
      msg += `\n\n⚠️ ATTENTION : ${assigned.length} pouvoir(s) lui sont actuellement confiés. Ils seront automatiquement convertis en 'Pouvoirs en blanc' afin d'être redistribués équitablement aux membres CS actifs.`;
    }

    if (!confirm(msg)) return;

    m.statut = 'DEMISSIONNAIRE';
    if (!m.dateDemission) {
      const now = new Date();
      m.dateDemission = `Démission en cours d'exercice (${now.toLocaleDateString('fr-FR')})`;
    }

    if (assigned.length > 0) {
      assigned.forEach(c => {
        c.mandataireMemberId = 'BLANC';
        c.mandataire = 'POUVOIR EN BLANC';
        c.notes = (c.notes ? c.notes + ' | ' : '') + `Pouvoir libéré suite à la démission de ${m.name}`;
      });
      showToast(`🚪 ${m.name} marqué démissionnaire. ${assigned.length} pouvoir(s) convertis en blanc.`, "warning");
    } else {
      showToast(`🚪 ${m.name} est maintenant marqué démissionnaire du CS.`, "info");
    }

    persistData();
  }
}

function libererPouvoirsMembreDemissionnaire(m) {
  const assigned = (appData.coproprietaires || []).filter(c =>
    c.statut === 'POUVOIR' && (c.mandataireMemberId === m.id || (c.mandataire && c.mandataire.toLowerCase().includes(m.name.toLowerCase())))
  );
  if (assigned.length > 0) {
    if (confirm(`Ce membre détient ${assigned.length} pouvoir(s). Voulez-vous les basculer automatiquement en pouvoirs en blanc pour le CS restant ?`)) {
      assigned.forEach(c => {
        c.mandataireMemberId = 'BLANC';
        c.mandataire = 'POUVOIR EN BLANC';
        c.notes = (c.notes ? c.notes + ' | ' : '') + `Pouvoir libéré suite à démission de ${m.name}`;
      });
    }
  }
}

function deleteMember(id) {
  const m = appData.members.find(x => x.id === id);
  if (!m) return;
  if (confirm(`Supprimer définitivement "${m.name}" de la base ?`)) {
    // Si des pouvoirs lui étaient rattachés, les passer en blanc
    (appData.coproprietaires || []).forEach(c => {
      if (c.mandataireMemberId === id) {
        c.mandataireMemberId = 'BLANC';
        c.mandataire = 'POUVOIR EN BLANC';
      }
    });
    appData.members = appData.members.filter(x => x.id !== id);
    persistData();
    showToast(`Membre supprimé`, "info");
  }
}

function syncMembersFromDefaultData() {
  if (!confirm("Voulez-vous synchroniser les membres du Conseil Syndical avec les données officielles de la convocation (statuts et tantièmes à jour) ? Vos votes et présences actuels seront conservés.")) {
    return;
  }
  const defaultMembers = DEFAULT_AG_DATA.members || [];
  defaultMembers.forEach(defM => {
    const existing = appData.members.find(m => m.id === defM.id || m.name.toLowerCase() === defM.name.toLowerCase());
    if (existing) {
      existing.statut = defM.statut || existing.statut || 'ACTIF';
      if (defM.dateDemission) existing.dateDemission = defM.dateDemission;
      if (defM.tantiemes && !existing.tantiemes) existing.tantiemes = defM.tantiemes;
    } else {
      appData.members.push({ ...defM });
    }
  });
  persistData();
  showToast("Composition du CS synchronisée avec les données officielles !", "success");
}

// Copropriétaire Handlers
function openNewCoproModal() {
  document.getElementById('coproModalTitle').innerText = 'Ajouter un copropriétaire';
  document.getElementById('coproFormId').value = '';
  document.getElementById('coproFormName').value = '';
  document.getElementById('coproFormLots').value = '';
  document.getElementById('coproFormTantiemes').value = '';
  document.getElementById('coproFormStatut').value = 'PRESENT';
  document.getElementById('coproFormMandataire').value = '';
  document.getElementById('coproFormNotes').value = '';
  openModal('coproModal');
}

function editCopro(id) {
  const c = appData.coproprietaires.find(x => x.id === id);
  if (!c) return;
  document.getElementById('coproModalTitle').innerText = `Modifier : ${c.nom}`;
  document.getElementById('coproFormId').value = c.id;
  document.getElementById('coproFormName').value = c.nom || '';
  document.getElementById('coproFormLots').value = c.lots || '';
  document.getElementById('coproFormTantiemes').value = c.tantiemes || '';
  document.getElementById('coproFormStatut').value = c.statut || 'PRESENT';
  document.getElementById('coproFormMandataire').value = c.mandataire || '';
  document.getElementById('coproFormNotes').value = c.notes || '';
  openModal('coproModal');
}

function saveCopro(e) {
  e.preventDefault();
  const id = document.getElementById('coproFormId').value;
  const coproData = {
    nom: document.getElementById('coproFormName').value.trim(),
    lots: document.getElementById('coproFormLots').value.trim(),
    tantiemes: Number(document.getElementById('coproFormTantiemes').value) || 0,
    statut: document.getElementById('coproFormStatut').value,
    mandataire: document.getElementById('coproFormMandataire').value.trim(),
    notes: document.getElementById('coproFormNotes').value.trim()
  };

  if (!appData.coproprietaires) appData.coproprietaires = [];

  if (id) {
    const index = appData.coproprietaires.findIndex(c => c.id === id);
    if (index !== -1) appData.coproprietaires[index] = { ...appData.coproprietaires[index], ...coproData };
  } else {
    appData.coproprietaires.push({ id: 'copro_' + Date.now(), ...coproData });
  }

  closeModal('coproModal');
  persistData();
}

function deleteCopro(id) {
  const c = appData.coproprietaires.find(x => x.id === id);
  if (!c) return;
  if (confirm(`Supprimer "${c.nom}" ?`)) {
    appData.coproprietaires = appData.coproprietaires.filter(x => x.id !== id);
    persistData();
  }
}

// Config Save
function saveConfig() {
  appData.config.coproName = document.getElementById('cfgCoproname').value.trim();
  appData.config.agDate = document.getElementById('cfgAgDate').value;
  appData.config.totalTantiemes = Number(document.getElementById('cfgTotalTantiemes').value) || 97478;
  appData.config.presentTantiemes = Number(document.getElementById('cfgPresentTantiemes').value) || 0;
  persistData();
}

function resetFilters() {
  document.getElementById('searchInput').value = '';
  document.getElementById('filterStatus').value = 'ALL';
  document.getElementById('filterCsConsigne').value = 'ALL';
  renderResolutions(appData.config.presentTantiemes, appData.config.totalTantiemes);
}

// Export / Import
function openExportModal() {
  openModal('exportModal');
}

function exportDataJson() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(appData, null, 2));
  const downloadAnchor = document.createElement('a');
  const filename = `Votes_AG_FLOREAL_25_NOV_2026.json`;
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", filename);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  showToast("💾 Sauvegarde JSON téléchargée !", "success");
}

function exportResolutionsCsv() {
  const resolutions = appData.resolutions || [];
  let csv = "Numero;Titre;Majorite;Statut;Voix_Pour;Voix_Contre;Voix_Abstention;Heure_Vote;Elu_Designee;Opposants_Consignes;Reserves_PV\n";

  resolutions.forEach(r => {
    const num = `"${r.number || ''}"`;
    const titre = `"${(r.title || '').replace(/"/g, '""')}"`;
    const maj = `"${(r.majorite || '').replace(/"/g, '""')}"`;
    const statut = `"${r.status || ''}"`;
    const pour = r.tantiemesPour || 0;
    const contre = r.tantiemesContre || 0;
    const abs = r.tantiemesAbs || 0;
    const heure = `"${r.heureVote || ''}"`;
    const elu = `"${(r.eluNom || '').replace(/"/g, '""')}"`;
    const opposants = `"${(r.opponentsText || (r.opponentsList ? r.opponentsList.join(', ') : '')).replace(/"/g, '""')}"`;
    const reserves = `"${((r.reservesPV || []).map(rv => rv.texte)).join(' | ').replace(/"/g, '""')}"`;

    csv += `${num};${titre};${maj};${statut};${pour};${contre};${abs};${heure};${elu};${opposants};${reserves}\n`;
  });

  const blob = new Blob(["\ufeff" + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Resultats_Votes_AG_FLOREAL_2026.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  showToast("📊 Export CSV Résolutions pour ERP téléchargé !", "success");
}

function exportPresenceCsv() {
  const copros = appData.coproprietaires || [];
  let csv = "Nom;Lots;Tantiemes;Statut;Mandataire;Heure_Arrivee;Heure_Depart;Notes\n";

  copros.forEach(c => {
    const nom = `"${(c.nom || '').replace(/"/g, '""')}"`;
    const lots = `"${(c.lots || '').replace(/"/g, '""')}"`;
    const tant = c.tantiemes || 0;
    const statut = `"${c.statut || 'ABSENT'}"`;
    const mandataire = `"${(c.mandataire || '').replace(/"/g, '""')}"`;
    const arr = `"${c.heureArrivee || ''}"`;
    const dep = `"${c.heureDepart || ''}"`;
    const notes = `"${(c.notes || '').replace(/"/g, '""')}"`;

    csv += `${nom};${lots};${tant};${statut};${mandataire};${arr};${dep};${notes}\n`;
  });

  const blob = new Blob(["\ufeff" + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Feuille_Presence_AG_FLOREAL_2026.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  showToast("📋 Export CSV Feuille de Présence pour ERP téléchargé !", "success");
}

function importDataJson(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (imported.resolutions && imported.config) {
        appData = imported;
        persistData();
        alert("Données importées avec succès !");
      } else {
        alert("Format JSON non valide.");
      }
    } catch (err) {
      alert("Erreur lors de la lecture du fichier : " + err.message);
    }
  };
  reader.readAsText(file);
  event.target.value = '';
}

// ==========================================
// GESTION ET ADMINISTRATION DES POUVOIRS (ART. 22)
// ==========================================

function findMemberByName(name) {
  if (!name || !appData.members) return null;
  const clean = name.trim().toLowerCase();
  
  // 1. Recherche exacte
  let found = appData.members.find(m => m.name.toLowerCase() === clean);
  if (found) return found;

  // 2. Recherche par mots significatifs
  const words = clean.split(/[\s,./\-]+/).filter(w => w.length >= 3 && !['mme', 'mr', 'monsieur', 'madame', 'mlle'].includes(w));
  found = appData.members.find(m => {
    const mName = m.name.toLowerCase();
    return words.some(w => mName.includes(w));
  });
  return found || null;
}

function syncMembersAndPouvoirs() {
  if (!appData.coproprietaires) appData.coproprietaires = [];
  if (!appData.members) appData.members = [];

  const totalCopro = Number(appData.config.totalTantiemes) || 97478;
  const maxVoix10Pct = totalCopro * 0.10;

  // Lier les mandataires existants s'ils n'ont pas encore mandataireMemberId
  appData.coproprietaires.forEach(c => {
    if (c.statut === 'POUVOIR') {
      const mandataireStr = (c.mandataire || '').trim();
      if (!c.mandataireMemberId) {
        if (mandataireStr.toUpperCase().includes('BLANC')) {
          c.mandataireMemberId = 'BLANC';
        } else {
          const m = findMemberByName(mandataireStr);
          if (m) {
            c.mandataireMemberId = m.id;
          } else if (mandataireStr) {
            c.mandataireMemberId = 'AUTRE';
          } else {
            c.mandataireMemberId = 'BLANC';
            c.mandataire = 'POUVOIR EN BLANC';
          }
        }
      }
    }
  });

  // Calcul et synchronisation pour chaque membre du CS
  appData.members.forEach(m => {
    const assignedCopros = appData.coproprietaires.filter(c =>
      c.statut === 'POUVOIR' && (
        c.mandataireMemberId === m.id ||
        (!c.mandataireMemberId && findMemberByName(c.mandataire)?.id === m.id)
      )
    );

    m._assignedCopros = assignedCopros;
    m._nbMandats = assignedCopros.length;
    m.mandatTantiemes = assignedCopros.reduce((sum, c) => sum + (Number(c.tantiemes) || 0), 0);
    m.mandats = assignedCopros.map(c => `${c.nom} (${c.tantiemes})`).join(', ');

    const perso = Number(m.tantiemes) || 0;
    const totalVoix = perso + m.mandatTantiemes;
    m._totalVoix = totalVoix;
    m._pctTotal = totalCopro > 0 ? ((totalVoix / totalCopro) * 100).toFixed(1) : '0';

    // Règle d'or Art. 22 de la loi du 10 juillet 1965 :
    // Max 3 mandats OU (nb > 3 SI totalVoix <= 10% du total de l'immeuble)
    if (m._nbMandats <= 3) {
      m._isLegalSafe = true;
      m._legalStatusText = `Conforme (Art. 22 : ≤ 3 mandats)`;
      m._legalBadgeClass = 'safe';
    } else if (totalVoix <= maxVoix10Pct) {
      m._isLegalSafe = true;
      m._legalStatusText = `Conforme (Art. 22 : ${m._nbMandats} mandats autorisés car ${totalVoix} ≤ 10% des voix)`;
      m._legalBadgeClass = 'safe';
    } else {
      m._isLegalSafe = false;
      m._legalStatusText = `⚠️ DÉPASSEMENT ILLÉGAL (>3 mandats ET >10% : ${totalVoix} / ${Math.floor(maxVoix10Pct)}). Risque de nullité !`;
      m._legalBadgeClass = 'warning';
    }
  });
}

function renderPouvoirsTab() {
  const pouvoirsGrid = document.getElementById('csPouvoirsGrid');
  const tableBody = document.getElementById('pouvoirsTableBody');
  if (!pouvoirsGrid || !tableBody) return;

  const totalCopro = Number(appData.config.totalTantiemes) || 97478;
  const copros = appData.coproprietaires || [];
  const allPouvoirs = copros.filter(c => c.statut === 'POUVOIR');

  const totalPouvoirsCount = allPouvoirs.length;
  const totalPouvoirsTant = allPouvoirs.reduce((sum, c) => sum + (Number(c.tantiemes) || 0), 0);

  const csPouvoirs = allPouvoirs.filter(c => {
    return c.mandataireMemberId && c.mandataireMemberId !== 'BLANC' && c.mandataireMemberId !== 'AUTRE';
  });
  const csPouvoirsCount = csPouvoirs.length;
  const csPouvoirsTant = csPouvoirs.reduce((sum, c) => sum + (Number(c.tantiemes) || 0), 0);

  const blancsPouvoirs = allPouvoirs.filter(c => c.mandataireMemberId === 'BLANC' || (c.mandataire && c.mandataire.toUpperCase().includes('BLANC')));
  const blancsCount = blancsPouvoirs.length;
  const blancsTant = blancsPouvoirs.reduce((sum, c) => sum + (Number(c.tantiemes) || 0), 0);

  const activeMembers = (appData.members || []).filter(m => m.statut !== 'DEMISSIONNAIRE');
  const csPerso = activeMembers.reduce((sum, m) => sum + (Number(m.tantiemes) || 0), 0);
  const csTotalVoix = csPerso + csPouvoirsTant;
  const csTotalPct = totalCopro > 0 ? ((csTotalVoix / totalCopro) * 100).toFixed(1) : '0';

  // Badges & Chiffres
  document.getElementById('statPouvoirsCountTotal').innerText = totalPouvoirsCount;
  document.getElementById('statPouvoirsTantTotal').innerText = `${totalPouvoirsTant} tantièmes (${totalCopro > 0 ? ((totalPouvoirsTant / totalCopro) * 100).toFixed(1) : 0}%)`;
  document.getElementById('statPouvoirsCsCount').innerText = `${csPouvoirsCount} mandats`;
  document.getElementById('statPouvoirsCsTant').innerText = `${csPouvoirsTant} tantièmes`;
  document.getElementById('statPouvoirsBlancsCount').innerText = blancsCount;
  document.getElementById('statPouvoirsBlancsTant').innerText = blancsCount > 0 ? `${blancsTant} tantièmes à attribuer` : 'Aucun pouvoir en attente';
  document.getElementById('statTotalCsVoixPouvoirs').innerText = `${csTotalVoix} / ${totalCopro}`;
  document.getElementById('statTotalCsPctPouvoirs').innerText = `${csTotalPct}% des voix du syndicat`;
  document.getElementById('badgePouvoirsCount').innerText = totalPouvoirsCount;

  // Bannière Pouvoirs en blanc
  const bannerBlancs = document.getElementById('pouvoirsBlancsBanner');
  if (bannerBlancs) {
    if (blancsCount > 0) {
      bannerBlancs.style.display = 'flex';
      document.getElementById('nbBlancsAlertText').innerText = `${blancsCount} pouvoir(s) en blanc (${blancsTant} tantièmes)`;
    } else {
      bannerBlancs.style.display = 'none';
    }
  }

  // 1. Grille des Membres CS (Membres actifs en priorité, alertes démissionnaires si pouvoirs orphelins)
  const displayMembers = appData.members.filter(m => m.statut !== 'DEMISSIONNAIRE' || (m._assignedCopros && m._assignedCopros.length > 0));

  if (displayMembers.length === 0) {
    pouvoirsGrid.innerHTML = `<div style="grid-column: 1/-1; padding:1.5rem; text-align:center; color:var(--gray-500); background:white; border-radius:8px;">Aucun membre du Conseil Syndical enregistré.</div>`;
  } else {
    pouvoirsGrid.innerHTML = displayMembers.map(m => {
      const isDemissionnaire = m.statut === 'DEMISSIONNAIRE';
      const assigned = m._assignedCopros || [];
      const perso = Number(m.tantiemes) || 0;
      const mand = m.mandatTantiemes || 0;
      const tot = m._totalVoix || (perso + mand);
      const isSafe = m._isLegalSafe !== false;
      const cardClass = isDemissionnaire ? 'legal-warning' : (assigned.length === 0 ? 'no-mandat' : (isSafe ? 'legal-safe' : 'legal-warning'));
      const badgeClass = isDemissionnaire ? 'warning' : (assigned.length === 0 ? 'neutral' : (isSafe ? 'safe' : 'warning'));
      const badgeText = isDemissionnaire ? '🚪 Démissionnaire' : (assigned.length === 0 ? '0 mandat' : (isSafe ? `🟢 ${m._nbMandats} mandat(s) : Conforme` : `🔴 Alerte Art. 22`));

      return `
        <div class="cs-pouvoir-card ${cardClass}">
          <div>
            <div class="cs-card-header">
              <div>
                <div class="cs-card-title">${escapeHtml(m.name)}</div>
                <div class="cs-card-lots">${escapeHtml(m.lots || 'Conseil Syndical')}</div>
              </div>
              <span class="legal-badge ${badgeClass}" title="${escapeHtml(m._legalStatusText || '')}">${badgeText}</span>
            </div>

            <div class="cs-card-metrics">
              <div>
                <div class="cs-metric-label">Voix Perso</div>
                <div class="cs-metric-val">${perso}</div>
              </div>
              <div>
                <div class="cs-metric-label">Mandats (${m._nbMandats || 0})</div>
                <div class="cs-metric-val highlight">+${mand}</div>
              </div>
              <div>
                <div class="cs-metric-label">Total Voix</div>
                <div class="cs-metric-val">${tot} (${m._pctTotal || 0}%)</div>
              </div>
            </div>

            <div style="font-size:0.75rem; font-weight:700; color:var(--gray-700); margin-bottom:0.3rem;">
              Pouvoirs détenus :
            </div>
            <div class="cs-mandats-list">
              ${assigned.length === 0 ? '<span style="font-size:0.75rem; color:var(--gray-500); font-style:italic;">Aucun pouvoir reçu pour le moment</span>' :
                assigned.map(cp => `
                  <span class="mandat-chip" title="Pouvoir de ${escapeHtml(cp.nom)} (${cp.tantiemes} tant.)">
                    <span>${escapeHtml(cp.nom)}</span>
                    <span class="mandat-chip-tant">${cp.tantiemes}</span>
                    <button class="mandat-chip-transfer-btn" onclick="openTransfertModal('${cp.id}')" title="Transférer le pouvoir de ${escapeHtml(cp.nom)} à un autre membre CS">
                      🔄
                    </button>
                  </span>
                `).join('')
              }
            </div>
          </div>

          <div class="cs-card-footer">
            <span style="font-size:0.72rem; color:var(--gray-500);">${assigned.length}/3 mandats (ou &lt;10%)</span>
            <button class="btn btn-sm btn-outline-primary" onclick="openNewPouvoirModal(null, '${m.id}')" title="Attribuer un pouvoir à ${escapeHtml(m.name)}">
              + Assigner un pouvoir
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  // 2. Table de tous les Pouvoirs
  const search = (document.getElementById('searchPouvoirInput')?.value || '').toLowerCase();
  const filterType = document.getElementById('filterPouvoirType')?.value || 'ALL';

  const filteredPouvoirs = allPouvoirs.filter(c => {
    const matchSearch = (c.nom + ' ' + (c.mandataire || '') + ' ' + (c.lots || '') + ' ' + (c.notes || '')).toLowerCase().includes(search);
    let matchType = true;
    if (filterType === 'CS') {
      matchType = c.mandataireMemberId && c.mandataireMemberId !== 'BLANC' && c.mandataireMemberId !== 'AUTRE';
    } else if (filterType === 'BLANC') {
      matchType = c.mandataireMemberId === 'BLANC' || (c.mandataire && c.mandataire.toUpperCase().includes('BLANC'));
    } else if (filterType === 'AUTRE') {
      matchType = c.mandataireMemberId === 'AUTRE';
    }
    return matchSearch && matchType;
  });

  document.getElementById('statPouvoirsTableCount').innerText = `${filteredPouvoirs.length} pouvoir(s) affiché(s)`;

  if (filteredPouvoirs.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:1.5rem; color:var(--gray-500);">Aucun pouvoir ne correspond à vos critères.</td></tr>`;
    return;
  }

  tableBody.innerHTML = filteredPouvoirs.map(c => {
    let mandataireBadge = '';
    let legalStatusBadge = '';
    const isBlanc = c.mandataireMemberId === 'BLANC' || (c.mandataire && c.mandataire.toUpperCase().includes('BLANC'));
    const isCs = c.mandataireMemberId && c.mandataireMemberId !== 'BLANC' && c.mandataireMemberId !== 'AUTRE';

    if (isBlanc) {
      mandataireBadge = `<span class="badge-vpc">⚠️ Pouvoir en blanc (Non attribué)</span>`;
      legalStatusBadge = `<span style="font-size:0.75rem; color:var(--warning); font-weight:700;">À répartir en séance</span>`;
    } else if (isCs) {
      const m = appData.members.find(mem => mem.id === c.mandataireMemberId) || findMemberByName(c.mandataire);
      mandataireBadge = `<span class="badge-pouvoir">👥 CS : <strong>${escapeHtml(m ? m.name : c.mandataire)}</strong></span>`;
      if (m && m._isLegalSafe === false) {
        legalStatusBadge = `<span class="legal-badge warning" title="Le mandataire dépasse le seuil légal">⚠️ Plafond Art. 22 dépassé</span>`;
      } else {
        legalStatusBadge = `<span class="legal-badge safe">🟢 Conforme Art. 22</span>`;
      }
    } else {
      mandataireBadge = `<span style="background:#f1f5f9; color:#475569; padding:0.2rem 0.5rem; border-radius:4px; font-weight:600; font-size:0.78rem;">Extérieur : ${escapeHtml(c.mandataire || 'Inconnu')}</span>`;
      legalStatusBadge = `<span style="font-size:0.75rem; color:var(--gray-500);">Mandataire extérieur</span>`;
    }

    const consignesText = c.consignes || c.notes || 'Pouvoir général';

    return `
      <tr>
        <td>
          <strong>${escapeHtml(c.nom)}</strong>
          ${(c.categorie && c.categorie.includes('Top 20%')) ? '<span style="font-size:0.72rem; color:#dc2626; margin-left:0.3rem;">🔥 Top 20%</span>' : ''}
        </td>
        <td>${escapeHtml(c.lots || '-')}</td>
        <td><span class="tantieme-pill">${c.tantiemes || 0}</span></td>
        <td>${mandataireBadge}</td>
        <td style="font-size:0.82rem; color:var(--gray-700);">${escapeHtml(consignesText)}</td>
        <td>${legalStatusBadge}</td>
        <td class="no-print" style="text-align:right;">
          <div style="display:flex; gap:0.3rem; justify-content:flex-end;">
            <button class="btn btn-sm btn-outline-primary" onclick="openTransfertModal('${c.id}')" title="Transférer vers un autre membre CS">
              🔄 Transférer
            </button>
            <button class="btn btn-sm btn-secondary" onclick="openPouvoirModalForCopro('${c.id}')" title="Modifier le pouvoir">
              ✏️
            </button>
            <button class="btn btn-sm btn-secondary" onclick="revoquerPouvoirDirect('${c.id}')" style="color:var(--danger)" title="Révoquer / Annuler ce pouvoir (ex: copropriétaire présent)">
              ❌
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

let currentPouvoirCoproId = null;

function openNewPouvoirModal(preselectedCoproId = null, preselectedMemberId = null) {
  currentPouvoirCoproId = preselectedCoproId;
  const copros = (appData.coproprietaires || []).slice().sort((a, b) => a.nom.localeCompare(b.nom));
  const mandantSelect = document.getElementById('pouvoirMandantSelect');
  const searchInput = document.getElementById('pouvoirMandantSearch');
  searchInput.value = '';

  mandantSelect.innerHTML = copros.map(c => {
    const isPouv = c.statut === 'POUVOIR';
    const isPres = c.statut === 'PRESENT';
    let statusLabel = 'Absent';
    if (isPouv) statusLabel = `✉️ Pouvoir (${c.mandataire || 'CS'})`;
    else if (isPres) statusLabel = '✅ Présent';
    else if (c.statut === 'VPC') statusLabel = '📬 VPC';
    return `<option value="${c.id}">${escapeHtml(c.nom)} — ${c.tantiemes || 0} tant. [${escapeHtml(c.lots || 'Sans lot')}] (${statusLabel})</option>`;
  }).join('');

  populateCsMemberSelect(preselectedMemberId);

  document.querySelector('input[name="pouvoirTypeRadio"][value="CS"]').checked = true;
  togglePouvoirTypeInputs();

  document.getElementById('pouvoirConsignes').value = '';
  document.getElementById('pouvoirSource').value = '';
  document.getElementById('btnRevokePouvoir').style.display = 'none';

  if (preselectedCoproId) {
    mandantSelect.value = preselectedCoproId;
    onPouvoirMandantChanged();
    const c = appData.coproprietaires.find(x => x.id === preselectedCoproId);
    if (c && c.statut === 'POUVOIR') {
      document.getElementById('pouvoirModalTitle').innerText = `✉️ Modifier le pouvoir de ${c.nom}`;
      document.getElementById('btnRevokePouvoir').style.display = 'inline-block';
      if (c.mandataireMemberId === 'BLANC') {
        document.querySelector('input[name="pouvoirTypeRadio"][value="BLANC"]').checked = true;
      } else if (c.mandataireMemberId === 'AUTRE') {
        document.querySelector('input[name="pouvoirTypeRadio"][value="AUTRE"]').checked = true;
        document.getElementById('pouvoirAutreNom').value = c.mandataire || '';
      } else {
        document.querySelector('input[name="pouvoirTypeRadio"][value="CS"]').checked = true;
        if (c.mandataireMemberId) {
          document.getElementById('pouvoirMemberSelect').value = c.mandataireMemberId;
        }
      }
      togglePouvoirTypeInputs();
      document.getElementById('pouvoirConsignes').value = c.consignes || '';
      document.getElementById('pouvoirSource').value = c.sourceReception || '';
    } else {
      document.getElementById('pouvoirModalTitle').innerText = `✉️ Enregistrer un Pouvoir (au dernier moment)`;
    }
  } else {
    document.getElementById('pouvoirModalTitle').innerText = `✉️ Enregistrer un Pouvoir (au dernier moment)`;
    if (mandantSelect.options.length > 0) {
      mandantSelect.selectedIndex = 0;
      onPouvoirMandantChanged();
    }
  }

  openModal('pouvoirModal');
}

function openPouvoirModalForCopro(id) {
  openNewPouvoirModal(id, null);
}

function populateCsMemberSelect(targetMemberId = null) {
  const select = document.getElementById('pouvoirMemberSelect');
  if (!select) return;

  const totalCopro = Number(appData.config.totalTantiemes) || 97478;
  const max10Pct = totalCopro * 0.10;

  // Uniquement les membres actifs du CS
  const activeMembers = appData.members.filter(m => m.statut !== 'DEMISSIONNAIRE');

  select.innerHTML = activeMembers.map(m => {
    const nb = m._nbMandats || 0;
    const tot = m._totalVoix || ((Number(m.tantiemes) || 0) + (m.mandatTantiemes || 0));
    let statusText = '🟢 Disponible';
    if (nb >= 3 && tot > max10Pct) {
      statusText = '🔴 Plafond dépassé';
    } else if (nb >= 3) {
      statusText = '🟡 >3 mandats (<10%)';
    } else if (nb === 0) {
      statusText = '🟢 0 mandat (Idéal)';
    }

    return `<option value="${m.id}">${escapeHtml(m.name)} — ${nb} mandat(s) (${tot} tant. total) — ${statusText}</option>`;
  }).join('');

  if (targetMemberId && appData.members.some(m => m.id === targetMemberId)) {
    select.value = targetMemberId;
  }
  onPouvoirMemberChanged();
}

function filterMandantOptions() {
  const search = document.getElementById('pouvoirMandantSearch')?.value || '';
  const select = document.getElementById('pouvoirMandantSelect');
  const copros = (appData.coproprietaires || []).slice().sort((a, b) => a.nom.localeCompare(b.nom));

  const filtered = copros.filter(c => fuzzyMatch(search, `${c.nom} ${c.lots || ''}`));
  select.innerHTML = filtered.map(c => {
    const isPouv = c.statut === 'POUVOIR';
    const isPres = c.statut === 'PRESENT';
    let statusLabel = 'Absent';
    if (isPouv) statusLabel = `✉️ Pouvoir (${c.mandataire || 'CS'})`;
    else if (isPres) statusLabel = '✅ Présent';
    else if (c.statut === 'VPC') statusLabel = '📬 VPC';
    return `<option value="${c.id}">${escapeHtml(c.nom)} — ${c.tantiemes || 0} tant. [${escapeHtml(c.lots || 'Sans lot')}] (${statusLabel})</option>`;
  }).join('');

  if (select.options.length > 0) {
    select.selectedIndex = 0;
    onPouvoirMandantChanged();
  }
}

function onPouvoirMandantChanged() {
  const select = document.getElementById('pouvoirMandantSelect');
  const coproId = select.value;
  const infoBox = document.getElementById('pouvoirMandantInfoBox');
  const c = appData.coproprietaires.find(x => x.id === coproId);
  if (!c) {
    infoBox.style.display = 'none';
    return;
  }

  infoBox.style.display = 'block';
  infoBox.innerHTML = `
    <strong>${escapeHtml(c.nom)}</strong> • Voix : <strong style="color:var(--primary); font-size:0.95rem;">${c.tantiemes || 0}</strong> tantièmes • Lot(s) : ${escapeHtml(c.lots || 'Non précisé')}<br>
    <span style="font-size:0.78rem; color:var(--gray-600);">Statut actuel : <strong>${c.statut || 'ABSENT'}</strong> ${c.mandataire ? `(Mandataire : ${escapeHtml(c.mandataire)})` : ''}</span>
  `;
  onPouvoirMemberChanged();
}

function togglePouvoirTypeInputs() {
  const type = document.querySelector('input[name="pouvoirTypeRadio"]:checked')?.value || 'CS';
  document.getElementById('pouvoirCsZone').style.display = (type === 'CS') ? 'block' : 'none';
  document.getElementById('pouvoirAutreZone').style.display = (type === 'AUTRE') ? 'block' : 'none';
}

function onPouvoirMemberChanged() {
  const memberId = document.getElementById('pouvoirMemberSelect')?.value;
  const m = appData.members.find(x => x.id === memberId);
  const noticeEl = document.getElementById('pouvoirLegalCheckNotice');
  if (!m || !noticeEl) return;

  const coproId = document.getElementById('pouvoirMandantSelect')?.value;
  const c = appData.coproprietaires.find(x => x.id === coproId);
  const addTant = (c && c.mandataireMemberId !== m.id) ? (Number(c.tantiemes) || 0) : 0;

  const currentMandats = m._nbMandats || 0;
  const nextMandats = (c && c.mandataireMemberId === m.id) ? currentMandats : currentMandats + 1;
  const nextVoix = (m._totalVoix || 0) + addTant;
  const totalCopro = Number(appData.config.totalTantiemes) || 97478;
  const max10Pct = totalCopro * 0.10;

  if (nextMandats <= 3) {
    noticeEl.innerHTML = `<span style="color:var(--success); font-weight:700;">🟢 Légal (Art. 22) :</span> ${m.name} aura ${nextMandats} mandat(s) (≤ 3 autorisés).`;
  } else if (nextVoix <= max10Pct) {
    noticeEl.innerHTML = `<span style="color:var(--success); font-weight:700;">🟢 Légal (Art. 22) :</span> ${m.name} aura ${nextMandats} mandats, total ${nextVoix} tantièmes ≤ 10% (${Math.floor(max10Pct)} max). Dérogation légale valide.`;
  } else {
    noticeEl.innerHTML = `<span style="color:var(--danger); font-weight:700;">⚠️ RISQUE D'ANNULATION :</span> ${m.name} aura ${nextMandats} mandats et dépasserait les 10% (${nextVoix} > ${Math.floor(max10Pct)}). Choisissez un autre membre !`;
  }
}

function suggererMeilleurMembreCS() {
  const coproId = document.getElementById('pouvoirMandantSelect')?.value;
  const c = appData.coproprietaires.find(x => x.id === coproId);
  const tantToAdd = c ? (Number(c.tantiemes) || 0) : 0;
  const totalCopro = Number(appData.config.totalTantiemes) || 97478;
  const max10Pct = totalCopro * 0.10;

  const activeMembers = appData.members.filter(m => m.statut !== 'DEMISSIONNAIRE');
  const sorted = activeMembers.slice().sort((a, b) => {
    const aNb = a._nbMandats || 0;
    const bNb = b._nbMandats || 0;
    const aSafe = (aNb + 1 <= 3) || (((a._totalVoix || 0) + tantToAdd) <= max10Pct);
    const bSafe = (bNb + 1 <= 3) || (((b._totalVoix || 0) + tantToAdd) <= max10Pct);

    if (aSafe && !bSafe) return -1;
    if (!aSafe && bSafe) return 1;
    if (aNb !== bNb) return aNb - bNb;
    return (a._totalVoix || 0) - (b._totalVoix || 0);
  });

  if (sorted.length > 0) {
    const best = sorted[0];
    document.getElementById('pouvoirMemberSelect').value = best.id;
    onPouvoirMemberChanged();
    showToast(`✨ Recommandé : ${best.name} (${best._nbMandats || 0} mandat, charge minimale)`, "info");
  }
}

function savePouvoirForm(e) {
  e.preventDefault();
  const coproId = document.getElementById('pouvoirMandantSelect').value;
  const c = appData.coproprietaires.find(x => x.id === coproId);
  if (!c) {
    alert("Veuillez sélectionner un copropriétaire.");
    return;
  }

  const type = document.querySelector('input[name="pouvoirTypeRadio"]:checked')?.value || 'CS';
  let mandataireNom = '';
  let memberId = '';

  if (type === 'CS') {
    memberId = document.getElementById('pouvoirMemberSelect').value;
    const m = appData.members.find(x => x.id === memberId);
    if (!m) {
      alert("Veuillez choisir un membre du Conseil Syndical.");
      return;
    }
    mandataireNom = m.name;
  } else if (type === 'BLANC') {
    memberId = 'BLANC';
    mandataireNom = 'POUVOIR EN BLANC';
  } else {
    memberId = 'AUTRE';
    mandataireNom = document.getElementById('pouvoirAutreNom').value.trim() || 'Mandataire tiers';
  }

  const consignes = document.getElementById('pouvoirConsignes').value.trim();
  const source = document.getElementById('pouvoirSource').value.trim();

  c.statut = 'POUVOIR';
  c.mandataire = mandataireNom;
  c.mandataireMemberId = memberId;
  c.consignes = consignes;
  c.sourceReception = source;
  c.notes = (consignes ? `Consignes : ${consignes}` : 'Pouvoir') + (source ? ` | ${source}` : '');
  delete c.heureDepart;

  closeModal('pouvoirModal');
  persistData();
  showToast(`✉️ Pouvoir de ${c.nom} (${c.tantiemes} tant.) confié à ${mandataireNom} !`, "success");
}

function revoquerPouvoirModal() {
  const coproId = document.getElementById('pouvoirMandantSelect')?.value;
  revoquerPouvoirDirect(coproId);
  closeModal('pouvoirModal');
}

function revoquerPouvoirDirect(coproId) {
  const c = appData.coproprietaires.find(x => x.id === coproId);
  if (!c) return;

  if (confirm(`Révoquer le pouvoir de ${c.nom} (${c.tantiemes} tantièmes) ?\nCe copropriétaire sera marqué comme Absent.`)) {
    c.statut = 'ABSENT';
    c.mandataire = '';
    delete c.mandataireMemberId;
    delete c.consignes;
    delete c.sourceReception;
    persistData();
    showToast(`Pouvoir de ${c.nom} révoqué.`, "warning");
  }
}

// Transfert Modal
let currentTransfertCoproId = null;

function openTransfertModal(coproId) {
  currentTransfertCoproId = coproId;
  const c = appData.coproprietaires.find(x => x.id === coproId);
  if (!c) return;

  document.getElementById('transfertCoproId').value = c.id;
  document.getElementById('transfertMandantNom').innerText = c.nom;
  document.getElementById('transfertMandantTant').innerText = c.tantiemes || 0;
  document.getElementById('transfertAncienMandataire').innerText = c.mandataire || 'Non défini';

  const select = document.getElementById('transfertNouveauMembreSelect');
  const otherMembers = appData.members.filter(m => m.id !== c.mandataireMemberId && m.statut !== 'DEMISSIONNAIRE');

  select.innerHTML = otherMembers.map(m => {
    const nb = m._nbMandats || 0;
    const tot = m._totalVoix || 0;
    return `<option value="${m.id}">${escapeHtml(m.name)} — ${nb} mandat(s) (${tot} tant.)</option>`;
  }).join('');

  if (select.options.length > 0) {
    select.selectedIndex = 0;
  }

  openModal('transfertPouvoirModal');
}

function suggererTransfertCS() {
  const coproId = currentTransfertCoproId;
  const c = appData.coproprietaires.find(x => x.id === coproId);
  const tantToAdd = c ? (Number(c.tantiemes) || 0) : 0;
  const totalCopro = Number(appData.config.totalTantiemes) || 97478;
  const max10Pct = totalCopro * 0.10;

  const candidates = appData.members.filter(m => m.id !== c?.mandataireMemberId && m.statut !== 'DEMISSIONNAIRE');
  candidates.sort((a, b) => {
    const aNb = a._nbMandats || 0;
    const bNb = b._nbMandats || 0;
    const aSafe = (aNb + 1 <= 3) || (((a._totalVoix || 0) + tantToAdd) <= max10Pct);
    const bSafe = (bNb + 1 <= 3) || (((b._totalVoix || 0) + tantToAdd) <= max10Pct);

    if (aSafe && !bSafe) return -1;
    if (!aSafe && bSafe) return 1;
    if (aNb !== bNb) return aNb - bNb;
    return (a._totalVoix || 0) - (b._totalVoix || 0);
  });

  if (candidates.length > 0) {
    document.getElementById('transfertNouveauMembreSelect').value = candidates[0].id;
    showToast(`Suggéré : ${candidates[0].name}`, "info");
  }
}

function saveTransfertPouvoir(e) {
  e.preventDefault();
  const coproId = document.getElementById('transfertCoproId').value;
  const c = appData.coproprietaires.find(x => x.id === coproId);
  if (!c) return;

  const newMemberId = document.getElementById('transfertNouveauMembreSelect').value;
  const newMember = appData.members.find(x => x.id === newMemberId);
  if (!newMember) return;

  c.mandataireMemberId = newMember.id;
  c.mandataire = newMember.name;
  c.notes = (c.notes ? c.notes + ' | ' : '') + `Transféré à ${newMember.name}`;

  closeModal('transfertPouvoirModal');
  persistData();
  showToast(`Pouvoir de ${c.nom} transféré avec succès à ${newMember.name} !`, "success");
}

function repartirPouvoirsBlancsAuto() {
  const blancs = (appData.coproprietaires || []).filter(c =>
    c.statut === 'POUVOIR' && (c.mandataireMemberId === 'BLANC' || (c.mandataire && c.mandataire.toUpperCase().includes('BLANC')))
  );

  if (blancs.length === 0) {
    showToast("Aucun pouvoir en blanc à répartir.", "info");
    return;
  }

  if (!confirm(`Voulez-vous répartir automatiquement les ${blancs.length} pouvoir(s) en blanc sur les membres du CS les plus disponibles ?`)) {
    return;
  }

  const totalCopro = Number(appData.config.totalTantiemes) || 97478;
  const max10Pct = totalCopro * 0.10;

  blancs.forEach(c => {
    const tant = Number(c.tantiemes) || 0;
    const activeCandidates = appData.members.filter(m => m.statut !== 'DEMISSIONNAIRE');
    const candidates = activeCandidates.slice().sort((a, b) => {
      const aNb = a._nbMandats || 0;
      const bNb = b._nbMandats || 0;
      const aSafe = (aNb + 1 <= 3) || (((a._totalVoix || 0) + tant) <= max10Pct);
      const bSafe = (bNb + 1 <= 3) || (((b._totalVoix || 0) + tant) <= max10Pct);

      if (aSafe && !bSafe) return -1;
      if (!aSafe && bSafe) return 1;
      if (aNb !== bNb) return aNb - bNb;
      return (a._totalVoix || 0) - (b._totalVoix || 0);
    });

    if (candidates.length > 0) {
      const chosen = candidates[0];
      c.mandataireMemberId = chosen.id;
      c.mandataire = chosen.name;
      c.notes = (c.notes ? c.notes + ' | ' : '') + `Pouvoir en blanc attribué au CS (${chosen.name})`;
      chosen._nbMandats = (chosen._nbMandats || 0) + 1;
      chosen._totalVoix = (chosen._totalVoix || 0) + tant;
    }
  });

  persistData();
  showToast(`${blancs.length} pouvoir(s) en blanc réparti(s) équitablement sur le CS !`, "success");
}

function pointerCoproPresent(id) {
  const c = appData.coproprietaires.find(x => x.id === id);
  if (!c) return;

  if (c.statut === 'POUVOIR') {
    const mandataireNom = c.mandataire || 'un mandataire';
    const conf = confirm(`⚠️ ATTENTION (Loi du 10 juillet 1965 - Art. 22) :\n\n${c.nom} avait délégué son pouvoir à "${mandataireNom}".\n\nEn pointant ce copropriétaire comme PRÉSENT en séance, la loi révoque automatiquement ce pouvoir.\n\nConfirmer la présence physique de ${c.nom} ?`);
    if (!conf) return;
    c.mandataire = '';
    delete c.mandataireMemberId;
    delete c.consignes;
    delete c.sourceReception;
  }

  setCoproStatut(id, 'PRESENT');
}

// ==========================================
// SIMULATEUR TACTIQUE DE MAJORITÉ & JAUGES
// ==========================================

function renderTacticalMajorityGauge(r, totalEnSalle, totalCopro, csTotalVoix) {
  const isSansVote = (r.majorite === 'article sans vote');
  if (isSansVote) return '';

  const isArt24 = (r.majorite === 'Article 24');
  const isArt25 = r.majorite.includes('Article 25');
  const isArt26 = r.majorite.includes('Article 26');

  // Voix du dépouillement en direct si saisi
  const pour = Number(r.tantiemesPour) || 0;
  const contre = Number(r.tantiemesContre) || 0;
  const abs = Number(r.tantiemesAbs) || 0;
  const hasNumbers = (pour > 0 || contre > 0 || abs > 0);

  let targetSeuil = 0;
  let ruleTag = '';
  let ruleSubtext = '';
  let seuilPct = 50;
  let passerelleSeuil = 0;
  let currentVal = hasNumbers ? pour : csTotalVoix;
  let percent = 0;
  let isAdoptable = false;
  let messageTactiquePro = '';
  let alertPasserelleHtml = '';

  if (isArt24) {
    // Art 24 : Majorité simple des voix exprimées en salle
    const exprimesActuels = hasNumbers ? (pour + contre) : (totalEnSalle || 1);
    targetSeuil = Math.floor(exprimesActuels / 2) + 1;
    seuilPct = 50;
    ruleTag = 'Article 24 • Majorité simple';
    ruleSubtext = `Seuil : > 50% des exprimés en salle (~${targetSeuil.toLocaleString('fr-FR')} voix)`;
    percent = exprimesActuels > 0 ? Math.min(100, Math.round((currentVal / exprimesActuels) * 100)) : 0;
    isAdoptable = currentVal >= targetSeuil;

    if (isAdoptable) {
      const surplus = currentVal - targetSeuil;
      messageTactiquePro = `Le CS détient <strong>${currentVal.toLocaleString('fr-FR')}</strong> voix, soit <strong>+${surplus.toLocaleString('fr-FR')} voix d'avance</strong> sur les ${targetSeuil.toLocaleString('fr-FR')} nécessaires pour l'adopter.`;
    } else {
      const besoin = Math.max(0, targetSeuil - currentVal);
      messageTactiquePro = `Le CS détient <strong>${currentVal.toLocaleString('fr-FR')}</strong> voix. Il manque <strong>${besoin.toLocaleString('fr-FR')} voix</strong> parmi les présents en séance pour emporter la décision.`;
    }
  } else if (isArt25) {
    // Art 25 : Majorité de tous les copropriétaires
    targetSeuil = Math.floor(totalCopro / 2) + 1; // 48 740
    passerelleSeuil = Math.ceil(totalCopro / 3); // 32 493
    seuilPct = 50;
    ruleTag = 'Article 25 • Majorité absolue';
    ruleSubtext = `Seuil : ${targetSeuil.toLocaleString('fr-FR')} voix (> 50% de l'immeuble)`;
    percent = totalCopro > 0 ? Math.min(100, Math.round((currentVal / totalCopro) * 100)) : 0;
    isAdoptable = currentVal >= targetSeuil;
    const besoin25 = Math.max(0, targetSeuil - currentVal);
    const besoinPasserelle = Math.max(0, passerelleSeuil - currentVal);

    if (hasNumbers && pour >= passerelleSeuil && pour < targetSeuil) {
      alertPasserelleHtml = `
        <div class="passerelle-alert-badge">
          🚨 PASSERELLE ART. 25-1 DE DROIT : ${pour.toLocaleString('fr-FR')} voix >= ${passerelleSeuil.toLocaleString('fr-FR')} (1/3 atteint). Le syndic DOIT organiser un second vote immédiat à l'Article 24 !
        </div>
      `;
    }

    if (isAdoptable) {
      messageTactiquePro = `Majorité absolue atteinte avec <strong>${currentVal.toLocaleString('fr-FR')}</strong> voix ! L'adoption directe à l'Article 25 est acquise.`;
    } else if (currentVal >= passerelleSeuil) {
      messageTactiquePro = `Le CS détient <strong>${currentVal.toLocaleString('fr-FR')}</strong> voix : seuil de passerelle 25-1 franchi ! Un second vote immédiat à l'Art. 24 peut être déclenché.`;
    } else {
      messageTactiquePro = `Force CS : <strong>${currentVal.toLocaleString('fr-FR')}</strong> voix. Il manque <strong>${besoin25.toLocaleString('fr-FR')}</strong> voix pour l'Art. 25 (ou <strong>${besoinPasserelle.toLocaleString('fr-FR')}</strong> voix pour la passerelle 25-1).`;
    }
  } else if (isArt26) {
    // Art 26 : Double majorité (2/3 de l'immeuble)
    targetSeuil = Math.ceil((totalCopro * 2) / 3);
    seuilPct = 67;
    ruleTag = 'Article 26 • Double majorité';
    ruleSubtext = `Seuil : ~${targetSeuil.toLocaleString('fr-FR')} voix (2/3 de l'immeuble)`;
    percent = totalCopro > 0 ? Math.min(100, Math.round((currentVal / totalCopro) * 100)) : 0;
    isAdoptable = currentVal >= targetSeuil;
    const besoin26 = Math.max(0, targetSeuil - currentVal);

    if (isAdoptable) {
      messageTactiquePro = `Double majorité acquise avec <strong>${currentVal.toLocaleString('fr-FR')}</strong> voix ! Seuil des 2/3 franchi.`;
    } else {
      messageTactiquePro = `Force CS : <strong>${currentVal.toLocaleString('fr-FR')}</strong> voix. Il manque <strong>${besoin26.toLocaleString('fr-FR')}</strong> voix pour atteindre les 2/3 de l'immeuble.`;
    }
  }

  const fillClass = isAdoptable ? 'success' : (percent >= 33 ? 'warning' : 'primary');

  return `
    <div class="majority-gauge-container">
      <div class="gauge-header-pro">
        <div class="gauge-rule-badge">
          <span class="gauge-rule-tag">${escapeHtml(ruleTag)}</span>
          <span class="gauge-rule-desc">${escapeHtml(ruleSubtext)}</span>
        </div>
        <div class="gauge-score-pill ${isAdoptable ? 'score-adopted' : ''}">
          <span class="score-label">${hasNumbers ? 'Scrutin' : 'Force CS'} :</span>
          <span class="score-val"><strong>${currentVal.toLocaleString('fr-FR')}</strong> voix</span>
          <span class="score-percent">(${percent}%)</span>
        </div>
      </div>

      <div class="gauge-bar-wrapper">
        <div class="gauge-track">
          <div class="gauge-bar-fill ${fillClass}" style="width: ${percent}%;"></div>
          ${isArt25 ? `
            <div class="gauge-marker-pin pin-passerelle" style="left: 33.33%;" title="Passerelle Art. 25-1 (33.3% - ${passerelleSeuil.toLocaleString('fr-FR')} voix)">
              <span class="marker-flag">⚡ Passerelle 1/3</span>
              <span class="marker-needle"></span>
            </div>
          ` : ''}
          <div class="gauge-marker-pin pin-seuil" style="left: ${seuilPct}%;" title="Seuil d'adoption (${seuilPct}% - ${targetSeuil.toLocaleString('fr-FR')} voix)">
            <span class="marker-flag">🎯 Seuil ${seuilPct}%</span>
            <span class="marker-needle"></span>
          </div>
        </div>

        <div class="gauge-scale-row">
          <span class="scale-point p-start">0%</span>
          ${isArt25 ? `
            <span class="scale-point p-passerelle" style="left: 33.33%;">
              <span class="scale-tick">▲</span> 33.3% <em>(${passerelleSeuil.toLocaleString('fr-FR')} voix)</em>
            </span>
          ` : ''}
          <span class="scale-point p-seuil" style="left: ${seuilPct}%;">
            <span class="scale-tick">▲</span> Seuil ${seuilPct}% <em>(${targetSeuil.toLocaleString('fr-FR')} voix)</em>
          </span>
          <span class="scale-point p-end">100%</span>
        </div>
      </div>

      <div class="tactique-card ${isAdoptable ? 'tactique-card-success' : 'tactique-card-warning'}">
        <div class="tactique-card-icon">${isAdoptable ? '🟢' : '⚠️'}</div>
        <div class="tactique-card-content">
          <strong>${isAdoptable ? 'Majorité garantie pour le CS :' : 'Majorité à consolider :'}</strong> ${messageTactiquePro}
        </div>
      </div>

      ${alertPasserelleHtml}
    </div>
  `;
}

// ==========================================
// DARK MODE (ÉCO-BATTERIE & SÉANCE)
// ==========================================

function toggleDarkMode() {
  const isDark = document.body.classList.toggle('dark-mode');
  localStorage.setItem('AG_DARK_MODE', isDark ? 'true' : 'false');
  const btn = document.getElementById('themeToggleBtn');
  if (btn) btn.innerText = isDark ? '☀️' : '🌙';
}

function initDarkMode() {
  const saved = localStorage.getItem('AG_DARK_MODE');
  if (saved === 'true') {
    document.body.classList.add('dark-mode');
    const btn = document.getElementById('themeToggleBtn');
    if (btn) btn.innerText = '☀️';
  }
}

// ==========================================
// MODE SÉANCE FOCUS (SPÉCIAL AG & SMARTPHONE)
// ==========================================

let isModeSeanceActive = false;
let activeSeanceResId = null;

function toggleModeSeance() {
  isModeSeanceActive = !isModeSeanceActive;
  const panel = document.getElementById('seanceFocusPanel');
  const btn = document.getElementById('btnToggleSeance');

  if (isModeSeanceActive) {
    if (!activeSeanceResId) {
      const pending = appData.resolutions.find(r => r.status === 'EN_ATTENTE' && r.majorite !== 'article sans vote');
      activeSeanceResId = pending ? pending.id : appData.resolutions[0]?.id;
    }
    if (panel) panel.style.display = 'block';
    if (btn) btn.innerHTML = '⏸ Quitter Séance';
    renderModeSeance();
    if (panel && typeof panel.scrollIntoView === 'function') {
      panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    if (isLiveActive) {
      broadcastLiveUpdate({ type: 'CHANGE_ACTIVE_SEANCE_RES', resId: activeSeanceResId });
    }
  } else {
    if (panel) panel.style.display = 'none';
    if (btn) btn.innerHTML = '▶ Mode Séance';
  }
}

function ouvrirSeanceSurRes(resId) {
  activeSeanceResId = resId;
  seanceResSeconds = 0;
  if (!isModeSeanceActive) {
    toggleModeSeance();
  } else {
    renderModeSeance();
    const focusPanel = document.getElementById('seanceFocusPanel');
    if (focusPanel && typeof focusPanel.scrollIntoView === 'function') {
      focusPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    if (isLiveActive) {
      broadcastLiveUpdate({ type: 'CHANGE_ACTIVE_SEANCE_RES', resId: activeSeanceResId });
    }
  }
}

function naviguerSeance(dir) {
  if (!appData.resolutions || appData.resolutions.length === 0) return;
  const currentIndex = appData.resolutions.findIndex(r => r.id === activeSeanceResId);
  let nextIndex = currentIndex + dir;

  if (nextIndex < 0) nextIndex = 0;
  if (nextIndex >= appData.resolutions.length) nextIndex = appData.resolutions.length - 1;

  activeSeanceResId = appData.resolutions[nextIndex].id;
  seanceResSeconds = 0;
  renderModeSeance();

  if (isLiveActive) {
    broadcastLiveUpdate({ type: 'CHANGE_ACTIVE_SEANCE_RES', resId: activeSeanceResId });
  }
}

function renderModeSeance() {
  const panel = document.getElementById('seanceFocusPanel');
  if (!panel || !activeSeanceResId) return;

  const res = appData.resolutions.find(r => r.id === activeSeanceResId);
  if (!res) return;

  const index = appData.resolutions.findIndex(r => r.id === activeSeanceResId);
  const total = appData.resolutions.length;

  document.getElementById('seanceResNumberBadge').innerText = res.number;
  document.getElementById('seanceResProgress').innerText = `Résolution ${index + 1} sur ${total}`;
  document.getElementById('seanceResTitle').innerText = res.title;
  document.getElementById('seanceResDesc').innerText = res.description || 'Aucune description détaillée.';
  document.getElementById('seanceResMajorite').innerText = `Règle de vote : ${res.majorite} • Statut actuel : ${res.status}`;

  const badgeEl = document.getElementById('seanceConsigneBadge');
  badgeEl.className = `seance-consigne-giant ${res.csConsigne || 'LIBRE'}`;
  const icon = { 'POUR': '✅', 'CONTRE': '❌', 'ABSTENTION': '⚠️', 'LIBRE': 'ℹ️' }[res.csConsigne] || 'ℹ️';
  badgeEl.innerText = `${icon} ${res.csConsigne || 'LIBRE'}`;

  document.getElementById('seanceCsArgumentsText').innerText = res.csNotes || 'Aucun argument particulier spécifié par le CS.';

  // Zone Candidat / Élu(e) de la séance
  const eluZone = document.getElementById('seanceElectionZone');
  const eluInput = document.getElementById('seanceEluInput');
  const eluDatalist = document.getElementById('seanceEluDatalist');
  const eluBadge = document.getElementById('seanceEluBadge');

  if (eluZone && eluInput && eluDatalist) {
    let optionsHtml = '';
    optionsHtml += '<optgroup label="Membres du CS">';
    (appData.members || []).filter(m => m.statut !== 'DEMISSIONNAIRE').forEach(m => {
      optionsHtml += `<option value="${escapeHtml(m.name)}">Conseil Syndical</option>`;
    });
    optionsHtml += '</optgroup>';
    optionsHtml += '<optgroup label="Syndic">';
    optionsHtml += `<option value="Cabinet ${escapeHtml(appData.config.syndic || 'Citya Agence Henry')} (Secrétaire de séance)">Syndic</option>`;
    optionsHtml += '</optgroup>';
    optionsHtml += '<optgroup label="Copropriétaires Présents">';
    (appData.coproprietaires || []).filter(c => c.statut === 'PRESENT').forEach(c => {
      optionsHtml += `<option value="${escapeHtml(c.nom)}">Présent (${c.tantiemes} tantièmes)</option>`;
    });
    optionsHtml += '</optgroup>';
    eluDatalist.innerHTML = optionsHtml;

    eluInput.value = res.eluNom || '';
    if (res.eluNom) {
      eluBadge.style.display = 'inline-block';
      eluBadge.innerHTML = `✓ Élu(e) : <strong>${escapeHtml(res.eluNom)}</strong>`;
    } else {
      eluBadge.style.display = 'none';
      eluBadge.innerHTML = '';
    }
  }

  // Simulateur tactique (Membres ACTIFS uniquement)
  const activeMembersSeance = (appData.members || []).filter(m => m.statut !== 'DEMISSIONNAIRE');
  const csTotalVoix = activeMembersSeance.reduce((acc, m) => acc + (Number(m.tantiemes) || 0) + (Number(m.mandatTantiemes) || 0), 0);
  const totalEnSalle = appData.config.presentTantiemes || 0;
  const totalCopro = Number(appData.config.totalTantiemes) || 97478;

  const zone = document.getElementById('seanceTactiqueZone');
  if (zone) {
    zone.innerHTML = renderTacticalMajorityGauge(res, totalEnSalle, totalCopro, csTotalVoix);
  }

  // Quorum en salle temps réel
  const totalEnSalleTantEl = document.getElementById('seanceTotalSalleTant');
  if (totalEnSalleTantEl) {
    totalEnSalleTantEl.innerText = (appData.config.presentTantiemes || 0).toLocaleString('fr-FR');
  }

  // Alerte Stratégique d'Épuisement de Quorum
  const alertBanner = document.getElementById('seanceQuorumAlertBanner');
  if (alertBanner) {
    const isArt25 = res.majorite && res.majorite.includes('Article 25');
    const isArt26 = res.majorite && res.majorite.includes('Article 26');
    const seuil25 = Math.floor(totalCopro / 2) + 1; // 48 740
    const seuilPasserelle = Math.ceil(totalCopro / 3); // 32 493

    if (isArt25 && totalEnSalle < seuil25) {
      alertBanner.style.display = 'block';
      alertBanner.style.background = '#fef2f2';
      alertBanner.style.border = '2px solid #ef4444';
      alertBanner.style.color = '#991b1b';
      alertBanner.innerHTML = `
        <strong>⚠️ ALERTE QUORUM CRITIQUE (DÉPARTS CONSTATÉS) :</strong><br>
        Il ne reste plus que <strong>${totalEnSalle.toLocaleString('fr-FR')} voix en salle</strong> (sur 97 478). Le seuil de majorité absolue de 48 740 voix est désormais <u>physiquement impossible à atteindre</u> au 1er vote !<br>
        👉 <strong>Consigne impérative :</strong> Exigez de plein droit le second vote immédiat à la majorité simple via la <strong>passerelle Article 25-1</strong> (seuil de 32 493 voix dépassé) !
      `;
    } else if (totalEnSalle < seuilPasserelle && (isArt25 || isArt26)) {
      alertBanner.style.display = 'block';
      alertBanner.style.background = '#fef2f2';
      alertBanner.style.border = '2px solid #b91c1c';
      alertBanner.style.color = '#991b1b';
      alertBanner.innerHTML = `
        <strong>🚨 ALERTE QUORUM MINIMUM FRANCHI :</strong> Le nombre de voix en salle (${totalEnSalle.toLocaleString('fr-FR')}) est inférieur au tiers de la copropriété (32 493). La passerelle de vote 25-1 n'est plus accessible !
      `;
    } else {
      alertBanner.style.display = 'none';
    }
  }

  if (typeof isCostSimOpen !== 'undefined' && isCostSimOpen) {
    calculerImpactCharges();
  }
}

function onSeanceEluChange() {
  enregistrerSeanceElu();
}

function enregistrerSeanceElu() {
  if (!activeSeanceResId) return;
  const res = appData.resolutions.find(r => r.id === activeSeanceResId);
  if (!res) return;

  const val = (document.getElementById('seanceEluInput')?.value || '').trim();
  res.eluNom = val;
  persistData();
  renderModeSeance();
  if (val) {
    showToast(`Élu(e) enregistré(e) : ${val}`, "success");
  } else {
    showToast("Nom réinitialisé", "info");
  }
}

function setSeanceVote(status) {
  if (!activeSeanceResId) return;
  const res = appData.resolutions.find(r => r.id === activeSeanceResId);
  if (res) {
    const inputEl = document.getElementById('seanceEluInput');
    if (inputEl && inputEl.value.trim() && !res.eluNom) {
      res.eluNom = inputEl.value.trim();
    }
  }
  setQuickVote(activeSeanceResId, status);
  renderModeSeance();
  showToast(`Résolution enregistrée : ${status}`, "success");
}

function setSeanceUnanimite() {
  if (!activeSeanceResId) return;
  const res = appData.resolutions.find(r => r.id === activeSeanceResId);
  if (!res) return;

  const totalEnSalle = appData.config.presentTantiemes || 0;

  res.status = 'ADOPTEE';
  res.tantiemesPour = totalEnSalle;
  res.tantiemesContre = 0;
  res.tantiemesAbs = 0;
  res.opponentsIds = [];
  res.absenteeIds = [];
  res.opponentsList = [];
  res.opponentsText = "Adoptée à l'unanimité (0 contre, 0 abstention)";
  res.syndicClaimStatus = 'ADOPTEE';
  res.syndicClaimVoix = totalEnSalle;

  res.heureVote = getHeureParis();

  const inputEl = document.getElementById('seanceEluInput');
  if (inputEl && inputEl.value.trim() && !res.eluNom) {
    res.eluNom = inputEl.value.trim();
  }

  persistData();
  renderModeSeance();
  showToast(`⚡ Résolution n° ${res.number} adoptée à l'UNANIMITÉ (${totalEnSalle.toLocaleString('fr-FR')} voix POUR) !`, "success");
}

// ==========================================
// MOUVEMENTS EN SÉANCE (DÉPARTS ET ARRIVÉES TARDIVES)
// ==========================================

let currentMouvementMode = 'DEPART';

function ouvrirDepartSeanceModal() {
  currentMouvementMode = 'DEPART';
  const rDep = document.getElementById('mouvementRadioDepart');
  if (rDep) rDep.checked = true;
  document.getElementById('mouvementModalTitle').innerText = "🚪 Consigner un départ en séance";
  document.getElementById('mouvementSubmitBtn').innerText = "Consigner le départ (- tantièmes)";
  document.getElementById('mouvementSubmitBtn').className = "btn btn-danger";

  document.getElementById('mouvementHeureInput').value = getHeureParis();
  document.getElementById('mouvementSearchInput').value = '';

  peuplerMouvementOptions('DEPART');
  openModal('mouvementSeanceModal');
}

function ouvrirArriveeTardiveModal() {
  currentMouvementMode = 'ARRIVEE';
  const rArr = document.getElementById('mouvementRadioArrivee');
  if (rArr) rArr.checked = true;
  document.getElementById('mouvementModalTitle').innerText = "👋 Consigner une arrivée tardive";
  document.getElementById('mouvementSubmitBtn').innerText = "Consigner l'arrivée (+ tantièmes)";
  document.getElementById('mouvementSubmitBtn').className = "btn btn-success";

  document.getElementById('mouvementHeureInput').value = getHeureParis();
  document.getElementById('mouvementSearchInput').value = '';

  peuplerMouvementOptions('ARRIVEE');
  openModal('mouvementSeanceModal');
}

function onMouvementTypeChanged() {
  const isDepart = document.getElementById('mouvementRadioDepart')?.checked;
  currentMouvementMode = isDepart ? 'DEPART' : 'ARRIVEE';
  if (isDepart) {
    document.getElementById('mouvementModalTitle').innerText = "🚪 Consigner un départ en séance";
    document.getElementById('mouvementSubmitBtn').innerText = "Consigner le départ (- tantièmes)";
    document.getElementById('mouvementSubmitBtn').className = "btn btn-danger";
  } else {
    document.getElementById('mouvementModalTitle').innerText = "👋 Consigner une arrivée tardive";
    document.getElementById('mouvementSubmitBtn').innerText = "Consigner l'arrivée (+ tantièmes)";
    document.getElementById('mouvementSubmitBtn').className = "btn btn-success";
  }
  peuplerMouvementOptions(currentMouvementMode);
}

function peuplerMouvementOptions(mode) {
  const select = document.getElementById('mouvementCoproSelect');
  if (!select) return;

  const copros = (appData.coproprietaires || []).slice().sort((a, b) => a.nom.localeCompare(b.nom));
  let list = [];

  if (mode === 'DEPART') {
    // Uniquement ceux actuellement en salle (Présents ou Pouvoirs)
    list = copros.filter(c => c.statut === 'PRESENT' || c.statut === 'POUVOIR');
  } else {
    // Uniquement ceux absents ou déjà partis
    list = copros.filter(c => c.statut === 'ABSENT' || c.statut === 'PARTI' || !c.statut);
  }

  select.innerHTML = list.map(c => `
    <option value="${c.id}" data-search="${escapeHtml(c.nom)} ${escapeHtml(c.lots || '')} ${c.tantiemes}">
      ${escapeHtml(c.nom)} — ${c.tantiemes} tant. [${escapeHtml(c.lots || 'Sans lot')}] (${c.statut})
    </option>
  `).join('');

  if (select.options.length > 0) {
    select.selectedIndex = 0;
  }
}

function filtrerMouvementOptions() {
  const q = document.getElementById('mouvementSearchInput')?.value || '';
  const select = document.getElementById('mouvementCoproSelect');
  if (!select) return;

  Array.from(select.options).forEach(opt => {
    const text = opt.getAttribute('data-search') || opt.text;
    if (fuzzyMatch(q, text)) {
      opt.style.display = '';
    } else {
      opt.style.display = 'none';
    }
  });

  const firstVisible = Array.from(select.options).find(opt => opt.style.display !== 'none');
  if (firstVisible) select.value = firstVisible.value;
}

function validerMouvementSeance(e) {
  e.preventDefault();
  const coproId = document.getElementById('mouvementCoproSelect')?.value;
  const heure = document.getElementById('mouvementHeureInput')?.value.trim();
  const c = appData.coproprietaires.find(x => x.id === coproId);

  if (!c) {
    alert("Veuillez sélectionner un copropriétaire.");
    return;
  }

  if (!heure) {
    alert("Veuillez renseigner l'heure officielle.");
    return;
  }

  if (currentMouvementMode === 'DEPART') {
    c.statut = 'PARTI';
    c.heureDepart = heure;
    c.notes = (c.notes ? c.notes + ' | ' : '') + `Parti en séance à ${heure}`;
    closeModal('mouvementSeanceModal');
    persistData();
    if (isModeSeanceActive) renderModeSeance();
    showToast(`🚪 Départ de ${c.nom} (${c.tantiemes} voix) consigné à ${heure}. Nouveau quorum : ${appData.config.presentTantiemes} voix.`, "warning");
  } else {
    c.statut = 'PRESENT';
    c.heureArrivee = heure;
    delete c.heureDepart;
    c.notes = (c.notes ? c.notes + ' | ' : '') + `Arrivé en séance à ${heure}`;
    closeModal('mouvementSeanceModal');
    persistData();
    if (isModeSeanceActive) renderModeSeance();
    showToast(`👋 Arrivée de ${c.nom} (${c.tantiemes} voix) consignée à ${heure}. Nouveau quorum : ${appData.config.presentTantiemes} voix.`, "success");
  }
}

// ==========================================
// RECHERCHE UNIVERSELLE SPOTLIGHT (TOUCHE '/')
// ==========================================

function openSpotlightModal() {
  openModal('spotlightModal');
  const input = document.getElementById('spotlightSearchInput');
  if (input) {
    input.value = '';
    setTimeout(() => input.focus(), 100);
  }
  onSpotlightSearchInput();
}

function onSpotlightSearchInput() {
  const query = (document.getElementById('spotlightSearchInput')?.value || '').toLowerCase().trim();
  const listEl = document.getElementById('spotlightResultsList');
  if (!listEl) return;

  if (!query) {
    listEl.innerHTML = `
      <div style="padding:1.5rem; text-align:center; color:var(--gray-500); font-size:0.85rem;">
        Tapez un <strong>nom</strong> de copropriétaire, un <strong>n° de lot</strong>, un <strong>membre CS</strong> ou une <strong>résolution</strong>...
      </div>
    `;
    return;
  }

  const copros = (appData.coproprietaires || []).filter(c =>
    fuzzyMatch(query, `${c.nom} ${c.lots || ''} ${c.mandataire || ''}`)
  ).slice(0, 6);

  const resMatches = (appData.resolutions || []).filter(r =>
    fuzzyMatch(query, `${r.number} ${r.title} ${r.csNotes || ''}`)
  ).slice(0, 4);

  const memMatches = (appData.members || []).filter(m =>
    fuzzyMatch(query, `${m.name} ${m.lots || ''} ${m.mandats || ''}`)
  ).slice(0, 3);

  let html = '';

  if (copros.length > 0) {
    html += `<div style="font-size:0.75rem; font-weight:700; color:var(--primary); padding:0.4rem 0.6rem; text-transform:uppercase;">Copropriétaires & Pouvoirs (${copros.length})</div>`;
    html += copros.map(c => {
      const lotInfo = getCoproLotType(c.tantiemes);
      return `
        <div class="spotlight-item" onclick="closeModal('spotlightModal'); switchTab('presence'); document.getElementById('searchCoproInput').value='${escapeHtml(c.nom)}'; renderCoproprietaires(appData.config.presentTantiemes, appData.config.totalTantiemes);">
          <div>
            <strong>${escapeHtml(c.nom)}</strong>
            <span style="font-size:0.75rem; color:var(--gray-500); margin-left:0.3rem;">[${escapeHtml(c.lots || 'Sans lot')}] • ${lotInfo.icon} ${lotInfo.label} • Statut : <strong>${c.statut}</strong> ${c.mandataire ? `(➔ ${escapeHtml(c.mandataire)})` : ''}</span>
          </div>
          <span class="tantieme-pill">${c.tantiemes} tantièmes</span>
        </div>
      `;
    }).join('');
  }

  if (resMatches.length > 0) {
    html += `<div style="font-size:0.75rem; font-weight:700; color:var(--primary); padding:0.6rem 0.6rem 0.4rem; text-transform:uppercase;">Résolutions (${resMatches.length})</div>`;
    html += resMatches.map(r => `
      <div class="spotlight-item" onclick="closeModal('spotlightModal'); switchTab('votes'); ouvrirSeanceSurRes('${r.id}');">
        <div>
          <span class="resolution-num" style="font-size:0.75rem; margin-right:0.4rem;">N° ${escapeHtml(r.number)}</span>
          <strong>${escapeHtml(r.title)}</strong>
        </div>
        <span class="tag tag-status-${r.status}">${r.status}</span>
      </div>
    `).join('');
  }

  if (memMatches.length > 0) {
    html += `<div style="font-size:0.75rem; font-weight:700; color:var(--primary); padding:0.6rem 0.6rem 0.4rem; text-transform:uppercase;">Conseil Syndical (${memMatches.length})</div>`;
    html += memMatches.map(m => `
      <div class="spotlight-item" onclick="closeModal('spotlightModal'); switchTab('pouvoirs');">
        <div>
          <strong>${escapeHtml(m.name)}</strong>
          <span style="font-size:0.75rem; color:var(--gray-500); margin-left:0.3rem;">${m._nbMandats || 0} mandat(s) détenu(s)</span>
        </div>
        <span class="tantieme-pill">${(Number(m.tantiemes)||0) + (Number(m.mandatTantiemes)||0)} voix</span>
      </div>
    `).join('');
  }

  if (!html) {
    html = `<div style="padding:1.5rem; text-align:center; color:var(--gray-500); font-size:0.85rem;">Aucun résultat trouvé pour « ${escapeHtml(query)} ».</div>`;
  }

  listEl.innerHTML = html;
}

// ==========================================
// PV MIROIR OFFICIEL & EXPORT DE FIN D'AG
// ==========================================

function openPvMiroirModal() {
  const container = document.getElementById('pvMiroirPrintContent');
  if (!container) return;

  const totalCopro = Number(appData.config.totalTantiemes) || 97478;
  const copros = appData.coproprietaires || [];
  const presents = copros.filter(c => c.statut === 'PRESENT');
  const pouvoirs = copros.filter(c => c.statut === 'POUVOIR');
  const partis = copros.filter(c => c.statut === 'PARTI');

  const presTant = presents.reduce((s, c) => s + (Number(c.tantiemes)||0), 0);
  const pouvTant = pouvoirs.reduce((s, c) => s + (Number(c.tantiemes)||0), 0);
  const totalSalle = presTant + pouvTant;

  const resolutions = appData.resolutions || [];
  const votees = resolutions.filter(r => r.majorite !== 'article sans vote');
  const adoptees = votees.filter(r => r.status === 'ADOPTEE').length;
  const rejetees = votees.filter(r => r.status === 'REJETEE').length;

  container.innerHTML = `
    <div class="pv-header-box">
      <div style="display:flex; justify-content:space-between; align-items:flex-start;">
        <div>
          <h1 style="font-size:1.4rem; font-weight:800; color:#1e3a8a; margin-bottom:0.2rem;">${escapeHtml(appData.config.coproName || 'RÉSIDENCE LE FLORÉAL')}</h1>
          <p style="font-size:0.9rem; color:#475569; font-weight:600;">Assemblée Générale Ordinaire du ${formatDate(appData.config.agDate || '2026-11-25')}</p>
          <p style="font-size:0.8rem; color:#64748b;">Syndic : ${escapeHtml(appData.config.syndic || 'Citya Agence Henry')} • Lieu : ${escapeHtml(appData.config.agLocation || 'Salle Jacques Prévert')}</p>
        </div>
        <div style="text-align:right; border-left:3px solid #1e3a8a; padding-left:0.8rem;">
          <div style="font-size:0.75rem; text-transform:uppercase; font-weight:700; color:#64748b;">Document Officiel</div>
          <strong style="color:#1e3a8a; font-size:1rem;">Relevé Miroir du CS</strong>
          <div style="font-size:0.72rem; color:#64748b; margin-top:0.2rem;">Contrôle anti-fraude & conformité légale</div>
        </div>
      </div>
    </div>

    <!-- Feuille de Quorum & Présence -->
    <div style="background:#f1f5f9; padding:0.9rem 1rem; border-radius:6px; margin-bottom:1.2rem; font-size:0.84rem; display:grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap:0.6rem;">
      <div>Total Copropriété : <strong>${totalCopro} tantièmes</strong></div>
      <div>Présents & Représentés : <strong>${totalSalle} tantièmes (${((totalSalle/totalCopro)*100).toFixed(1)}%)</strong></div>
      <div>Présents physiques : <strong>${presents.length} copropriétaires (${presTant} t.)</strong></div>
      <div>Pouvoirs enregistrés : <strong>${pouvoirs.length} mandats (${pouvTant} t.)</strong></div>
      <div>Départs en séance : <strong>${partis.length} consigné(s)</strong></div>
      <div>Bilan des votes : <strong>${adoptees} adoptée(s), ${rejetees} rejetée(s)</strong></div>
    </div>

    <!-- Tableau détaillé des décisions -->
    <h3 style="font-size:1.05rem; font-weight:700; color:#1e3a8a; margin-bottom:0.6rem;">Relevé des Délibérations & Scrutins</h3>
    <table style="width:100%; border-collapse:collapse; font-size:0.8rem; margin-bottom:1.5rem;">
      <thead>
        <tr style="background:#e2e8f0; border-bottom:2px solid #cbd5e1; text-align:left;">
          <th style="padding:0.4rem 0.6rem;">N°</th>
          <th style="padding:0.4rem 0.6rem;">Intitulé Résolution</th>
          <th style="padding:0.4rem 0.6rem;">Majorité</th>
          <th style="padding:0.4rem 0.6rem;">Décision CS</th>
          <th style="padding:0.4rem 0.6rem;">Pour</th>
          <th style="padding:0.4rem 0.6rem;">Contre</th>
          <th style="padding:0.4rem 0.6rem;">Opposants consignés</th>
          <th style="padding:0.4rem 0.6rem;">Heure</th>
        </tr>
      </thead>
      <tbody>
        ${resolutions.map(r => `
          <tr style="border-bottom:1px solid #e2e8f0;">
            <td style="padding:0.45rem 0.6rem; font-weight:700;">${escapeHtml(r.number)}</td>
            <td style="padding:0.45rem 0.6rem;">
              <strong>${escapeHtml(r.title)}</strong>
              ${r.eluNom ? `<div style="font-size:0.75rem; color:#15803d; font-weight:700; margin-top:2px;">👑 Élu(e) : ${escapeHtml(r.eluNom)}</div>` : ''}
            </td>
            <td style="padding:0.45rem 0.6rem; font-size:0.75rem; color:#64748b;">${escapeHtml(r.majorite)}</td>
            <td style="padding:0.45rem 0.6rem;"><span class="pv-badge-status ${r.status}">${r.status}</span></td>
            <td style="padding:0.45rem 0.6rem; color:#15803d; font-weight:700;">${r.tantiemesPour || '-'}</td>
            <td style="padding:0.45rem 0.6rem; color:#dc2626; font-weight:700;">${r.tantiemesContre || '-'}</td>
            <td style="padding:0.45rem 0.6rem; font-size:0.75rem;">${escapeHtml(r.opponentsText || (r.opponentsList ? r.opponentsList.join(', ') : '-'))}</td>
            <td style="padding:0.45rem 0.6rem; font-size:0.75rem; color:#64748b;">${r.heureVote || '-'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    ${partis.length > 0 ? `
      <div style="background:#fee2e2; border-left:4px solid #ef4444; padding:0.6rem 0.9rem; font-size:0.8rem; margin-bottom:1.5rem;">
        <strong>🚪 Départs anticipés consignés à la feuille de présence (Art. 14 et 17 du décret de 1967) :</strong><br>
        ${partis.map(p => `• ${escapeHtml(p.nom)} (${p.tantiemes} tantièmes) — Départ officiel consigné à ${p.heureDepart || 'en cours d\'AG'}`).join('<br>')}
      </div>
    ` : ''}

    <div style="margin-top:2rem; padding-top:1rem; border-top:1px solid #cbd5e1; display:flex; justify-content:space-between; font-size:0.8rem; color:#64748b;">
      <div>Établi en séance par le Conseil Syndical • Résidence Le Floréal</div>
      <div style="text-align:right;">Signatures du Président de séance et Scrutateurs :</div>
    </div>
  `;

  openModal('pvMiroirModal');
}

function imprimerPvMiroir() {
  const content = document.getElementById('pvMiroirPrintContent')?.innerHTML;
  if (!content) return;

  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Relevé Officiel AG 2026 - Le Floréal</title>
      <style>
        body { font-family: system-ui, -apple-system, sans-serif; padding: 20px; color: #0f172a; line-height: 1.4; font-size: 11pt; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #cbd5e1; padding: 6px 8px; text-align: left; }
        th { background: #f1f5f9; }
        .pv-badge-status { font-weight: bold; }
        .ADOPTEE { color: #15803d; }
        .REJETEE { color: #b91c1c; }
        @media print { button { display: none; } }
      </style>
    </head>
    <body>
      ${content}
      <script>window.onload = function() { window.print(); };</script>
    </body>
    </html>
  `);
  printWindow.document.close();
}

// =======================================================
// FICHE D'OUVERTURE DE SÉANCE & DISCOURS AG (18h00)
// =======================================================

function openOuvertureModal() {
  renderFicheOuverture();
  openModal('ouvertureModal');
}

function renderFicheOuverture() {
  const container = document.getElementById('ouverturePrintZone');
  if (!container) return;

  const totalCopro = Number(appData.config.totalTantiemes) || 97478;
  const copros = appData.coproprietaires || [];
  const nbTotal = copros.length || 259;

  const presents = copros.filter(c => c.statut === 'PRESENT');
  const tantPresents = presents.reduce((acc, c) => acc + (Number(c.tantiemes) || 0), 0);

  const pouvoirs = copros.filter(c => c.statut === 'POUVOIR');
  const tantPouvoirs = pouvoirs.reduce((acc, c) => acc + (Number(c.tantiemes) || 0), 0);

  const pouvoirsCS = pouvoirs.filter(c => c.mandataireMemberId && c.mandataireMemberId !== 'BLANC' && c.mandataireMemberId !== 'AUTRE');
  const tantPouvoirsCS = pouvoirsCS.reduce((acc, c) => acc + (Number(c.tantiemes) || 0), 0);

  const vpc = copros.filter(c => c.statut === 'VPC');
  const tantVpc = vpc.reduce((acc, c) => acc + (Number(c.tantiemes) || 0), 0);

  const activeMembersCS = (appData.members || []).filter(m => m.statut !== 'DEMISSIONNAIRE');
  const tantPersoCS = activeMembersCS.reduce((acc, m) => acc + (Number(m.tantiemes) || 0), 0);
  const totalForceCS = tantPersoCS + tantPouvoirsCS;

  const totalRepresentes = tantPresents + tantPouvoirs + tantVpc;
  const nbRepresentes = presents.length + pouvoirs.length + vpc.length;
  const pctRepresentes = totalCopro > 0 ? ((totalRepresentes / totalCopro) * 100).toFixed(1) : 0;
  const seuil25 = Math.floor(totalCopro / 2) + 1; // 48 740
  const seuilPasserelle = Math.ceil(totalCopro / 3); // 32 493

  const isQuorum25 = totalRepresentes >= seuil25;
  const isQuorumPasserelle = totalRepresentes >= seuilPasserelle;

  container.innerHTML = `
    <div class="fiche-ouverture-card">
      <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1rem; border-bottom:2px solid #e2e8f0; padding-bottom:0.75rem;">
        <div>
          <h2 style="margin:0; font-size:1.25rem; color:#0f172a;">🏢 Résidence Le Floréal — Assemblée Générale Ordinaire</h2>
          <div style="font-size:0.85rem; color:#64748b; margin-top:0.2rem;">
            Séance du <strong>25 Novembre 2026 à 18h00</strong> • Salle Jacques Prévert, Noisy-le-Grand
          </div>
        </div>
        <div style="text-align:right;">
          <span style="background:#e0e7ff; color:#3730a3; padding:4px 10px; border-radius:6px; font-weight:700; font-size:0.82rem;">
            Syndic : ${escapeHtml(appData.config.syndic || 'Citya Agence Henry')}
          </span>
        </div>
      </div>

      <!-- GRILLE STATISTIQUES ÉMARGEMENT -->
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(170px, 1fr)); gap:0.75rem; margin-bottom:1.25rem;">
        <div style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:8px; padding:0.75rem; text-align:center;">
          <div style="font-size:0.72rem; text-transform:uppercase; color:#64748b; font-weight:700;">Présents Physiques</div>
          <div style="font-size:1.25rem; font-weight:800; color:#0f172a;">${tantPresents.toLocaleString('fr-FR')} <span style="font-size:0.75rem; font-weight:500;">voix</span></div>
          <div style="font-size:0.75rem; color:#64748b;">${presents.length} copropriétaires (${((tantPresents/totalCopro)*100).toFixed(1)}%)</div>
        </div>

        <div style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:8px; padding:0.75rem; text-align:center;">
          <div style="font-size:0.72rem; text-transform:uppercase; color:#64748b; font-weight:700;">Pouvoirs Recueillis</div>
          <div style="font-size:1.25rem; font-weight:800; color:#3b82f6;">${tantPouvoirs.toLocaleString('fr-FR')} <span style="font-size:0.75rem; font-weight:500;">voix</span></div>
          <div style="font-size:0.75rem; color:#64748b;">${pouvoirs.length} mandats (${((tantPouvoirs/totalCopro)*100).toFixed(1)}%)</div>
        </div>

        <div style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:8px; padding:0.75rem; text-align:center;">
          <div style="font-size:0.72rem; text-transform:uppercase; color:#1d4ed8; font-weight:700;">Force de Frappe CS</div>
          <div style="font-size:1.25rem; font-weight:800; color:#1e40af;">${totalForceCS.toLocaleString('fr-FR')} <span style="font-size:0.75rem; font-weight:500;">voix</span></div>
          <div style="font-size:0.75rem; color:#1e40af;">${activeMembersCS.length} membres actifs (${((totalForceCS/totalCopro)*100).toFixed(1)}%)</div>
        </div>

        <div style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:8px; padding:0.75rem; text-align:center;">
          <div style="font-size:0.72rem; text-transform:uppercase; color:#64748b; font-weight:700;">Votes Correspondance (VPC)</div>
          <div style="font-size:1.25rem; font-weight:800; color:#8b5cf6;">${tantVpc.toLocaleString('fr-FR')} <span style="font-size:0.75rem; font-weight:500;">voix</span></div>
          <div style="font-size:0.75rem; color:#64748b;">${vpc.length} formulaires (${((tantVpc/totalCopro)*100).toFixed(1)}%)</div>
        </div>

        <div style="background:#ecfdf5; border:1px solid #a7f3d0; border-radius:8px; padding:0.75rem; text-align:center;">
          <div style="font-size:0.72rem; text-transform:uppercase; color:#065f46; font-weight:700;">Total Représenté</div>
          <div style="font-size:1.25rem; font-weight:800; color:#047857;">${totalRepresentes.toLocaleString('fr-FR')} <span style="font-size:0.75rem; font-weight:500;">/ ${totalCopro.toLocaleString('fr-FR')}</span></div>
          <div style="font-size:0.75rem; font-weight:700; color:#047857;">${pctRepresentes}% de l'immeuble (${nbRepresentes} / ${nbTotal})</div>
        </div>
      </div>

      <!-- ANALYSE JURIDIQUE DE SÉANCE -->
      <div style="background:#f1f5f9; border-radius:6px; padding:0.6rem 0.9rem; font-size:0.83rem; margin-bottom:1.25rem; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <strong>⚖️ État juridique des seuils :</strong>
          ${isQuorum25
            ? `<span style="color:#15803d; font-weight:700; margin-left:0.3rem;">✅ Majorité absolue Art. 25 atteignable en 1er vote (${totalRepresentes.toLocaleString('fr-FR')} >= ${seuil25.toLocaleString('fr-FR')})</span>`
            : (isQuorumPasserelle
                ? `<span style="color:#b45309; font-weight:700; margin-left:0.3rem;">⚠️ Art. 25 strict impossible sans 100% de Pour — Passerelle Art. 25-1 immédiatement disponible (${totalRepresentes.toLocaleString('fr-FR')} >= 32 493 voix)</span>`
                : `<span style="color:#dc2626; font-weight:700; margin-left:0.3rem;">❌ Représentation < 1/3 (${totalRepresentes.toLocaleString('fr-FR')} < 32 493). Mobilisation obligatoire !</span>`
              )
          }
        </div>
      </div>

      <!-- DISCOURS OFFICIEL D'OUVERTURE PRÊT À LIRE -->
      <div style="margin-bottom:1rem;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.4rem;">
          <span style="font-weight:700; font-size:0.88rem; color:#0f172a;">🎙️ Discours officiel d'ouverture (Conseil Syndical — Prêt à lire au micro) :</span>
          <button class="btn btn-sm btn-outline-primary" onclick="copierDiscoursOuverture()">📋 Copier le texte</button>
        </div>
        <div class="speech-box" id="discoursOuvertureTexte">
« Mesdames, Messieurs les copropriétaires, chers voisins,<br><br>

Au nom de l'ensemble du Conseil Syndical de la Résidence Le Floréal, nous vous remercions très chaleureusement pour votre présence massive ce soir à notre Assemblée Générale annuelle.<br><br>

À l'ouverture officielle de notre séance, nous constatons un taux de mobilisation exceptionnel : <strong>${totalRepresentes.toLocaleString('fr-FR')} tantièmes</strong> sont représentés ce soir, soit <strong>${pctRepresentes}%</strong> des voix de notre copropriété (répartis entre ${presents.length} copropriétaires présents en salle, ${pouvoirs.length} pouvoirs réguliers et ${vpc.length} votes par correspondance).<br><br>

Le Conseil Syndical détient à lui seul un mandat de confiance de <strong>${totalForceCS.toLocaleString('fr-FR')} tantièmes</strong> (${((totalForceCS/totalCopro)*100).toFixed(1)}% de la copropriété), que nous exercerons avec la plus stricte rigueur dans l'intérêt exclusif de notre patrimoine commun et de la maîtrise de nos charges.<br><br>

Nous rappelons au cabinet Citya et au futur bureau de séance nos exigences démocratiques fondamentales pour cette soirée :<br>
1. La tenue scrupuleuse de la feuille de présence et l'enregistrement officiel de chaque vote nominatif contre et abstention au procès-verbal, conformément à l'article 17 du décret de 1967 ;<br>
2. Le respect absolu de la passerelle de l'article 25-1 : dès qu'une résolution recueille au moins un tiers des voix de la copropriété (32 493 tantièmes), le second vote immédiat à la majorité simple de l'article 24 est obligatoire de plein droit ;<br>
3. Des débats loyaux, transparents et respectueux du temps de parole de chaque copropriétaire.<br><br>

Nous vous invitons à suivre attentivement les consignes de vote affichées et argumentées par le Conseil Syndical. Déclarons maintenant la séance ouverte ! »
        </div>
      </div>

      <div style="font-size:0.78rem; color:#64748b; text-align:center; padding-top:0.5rem; border-top:1px solid #e2e8f0;">
        Fiche générée en temps réel par l'application Anti-Fraude AG 2026 • Conseil Syndical Le Floréal
      </div>
    </div>
  `;
}

function copierDiscoursOuverture() {
  const el = document.getElementById('discoursOuvertureTexte');
  if (!el) return;
  const rawText = el.innerText || el.textContent;
  navigator.clipboard.writeText(rawText).then(() => {
    showToast("📋 Discours d'ouverture copié dans le presse-papier !", "success");
  }).catch(() => {
    showToast("Impossible de copier automatiquement.", "error");
  });
}

function imprimerFicheOuverture() {
  const content = document.getElementById('ouverturePrintZone')?.innerHTML;
  if (!content) return;

  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Fiche d'Ouverture de Séance - AG 2026 Le Floréal</title>
      <style>
        body { font-family: system-ui, -apple-system, sans-serif; padding: 25px; color: #0f172a; line-height: 1.5; font-size: 11pt; }
        .fiche-ouverture-card { border: none !important; box-shadow: none !important; }
        .speech-box { background: #f8fafc !important; border: 1px solid #cbd5e1 !important; color: #0f172a !important; font-size: 10.5pt !important; line-height: 1.6 !important; }
        .btn { display: none !important; }
        @media print { button { display: none !important; } }
      </style>
    </head>
    <body>
      ${content}
      <script>window.onload = function() { window.print(); };</script>
    </body>
    </html>
  `);
  printWindow.document.close();
}

// =======================================================
// GÉNÉRATEUR DE RÉSERVES FORMELLES AU PV (ART. 17 DÉCRET 1967)
// =======================================================

function openReserveModal(resId) {
  const select = document.getElementById('reserveResolutionSelect');
  if (select) {
    select.innerHTML = (appData.resolutions || []).map(r => `
      <option value="${r.id}" ${r.id === resId ? 'selected' : ''}>
        N° ${r.number} — ${escapeHtml(r.title)} (${r.majorite})
      </option>
    `).join('');
  }

  onReserveTypeChange();
  openModal('reserveModal');
}

function onReserveTypeChange() {
  genererTexteReserve();
}

function genererTexteReserve() {
  const type = document.getElementById('reserveTypeSelect')?.value || 'PASSERELLE';
  const resId = document.getElementById('reserveResolutionSelect')?.value;
  const res = appData.resolutions.find(r => r.id === resId) || { number: 'XX', title: 'Résolution', majorite: 'Art. 25' };
  const details = document.getElementById('reserveDetailsInput')?.value.trim();
  const textarea = document.getElementById('reserveTexteGenere');
  if (!textarea) return;

  let text = '';
  const prefix = `[RÉSERVE FORMELLE AU PROCÈS-VERBAL — Art. 17 Décret n° 67-223 du 17 mars 1967]\n\nSur la Résolution n° ${res.number} (« ${res.title} ») :\n`;

  if (type === 'PASSERELLE') {
    text = `${prefix}Le Conseil Syndical et les copropriétaires soussignés constatent que cette décision relève de l'Article 25 de la Loi du 10 juillet 1965 et a recueilli au moins le tiers des voix de tous les copropriétaires (seuil légal de 32 493 tantièmes).\n\nEn conséquence, nous exigeons expressément et de plein droit l'application immédiate de la passerelle de vote prévue à l'Article 25-1 de la Loi du 10 juillet 1965 (mise aux voix immédiate à la majorité simple de l'Article 24 au cours de la même séance).\n\nTout refus, clôture unilatérale ou passage à la résolution suivante sans ce second vote entache la décision d'un vice de forme substantiel entraînant sa nullité absolue au titre de l'Article 42 de la Loi de 1965.${details ? `\n\nPrécisions constatées : ${details}` : ''}`;
  } else if (type === 'COMPTE_VOIX') {
    text = `${prefix}Le Conseil Syndical et les copropriétaires soussignés contestent formellement le décompte et le résultat proclamé par le syndic / le président de séance.\n\nLe pointage contradictoire contradictoirement établi en salle démontre une discordance flagrante entre les votes exprimés à main levée et l'annonce verbale faite à la tribune.\n\nNous exigeons la consignation nominative intégrale au présent procès-verbal de chaque copropriétaire opposant et abstentionniste avec mention exacte de ses tantièmes, ainsi que le recompte formel avant toute adoption.${details ? `\n\nConstat d'écart : ${details}` : ''}`;
  } else if (type === 'POUVOIR_REJET') {
    text = `${prefix}Nous formulons une réserve solennelle contre le refus d'enregistrement ou le rejet arbitraire de pouvoirs / mandats régulièrement délivrés conformément à l'Article 22 de la Loi du 10 juillet 1965.\n\nCette privation irrégulière du droit de vote fausse la sincérité du scrutin et fait l'objet d'une réserve expresse pour tout recours judiciaire ultérieur.${details ? `\n\nMandats contestés : ${details}` : ''}`;
  } else if (type === 'REFUS_PAROLE') {
    text = `${prefix}Constat formel d'un refus d'accorder la parole, d'un rejet de question préalable ou d'une interruption délibérée des représentants du Conseil Syndical lors des débats préalables au vote de la présente résolution, en violation de la loyauté des délibérations.${details ? `\n\nFaits constatés : ${details}` : ''}`;
  } else if (type === 'ORDRE_JOUR') {
    text = `${prefix}Contestation formelle d'une modification unilatérale du texte de la résolution ou de son champ d'application par le syndic en séance, sans rapport avec le projet notifié aux copropriétaires avec l'ordre du jour officiel (Art. 13 du Décret du 17 mars 1967).${details ? `\n\nModification contestée : ${details}` : ''}`;
  } else {
    text = `${prefix}Déclaration solennelle demandée à être consignée mot pour mot au procès-verbal de la présente assemblée générale en application de l'Article 17 du Décret du 17 mars 1967 :\n\n${details || 'Irrégularité constatée lors du vote.'}`;
  }

  textarea.value = text;
}

function copierTexteReserve() {
  const textarea = document.getElementById('reserveTexteGenere');
  if (!textarea) return;
  navigator.clipboard.writeText(textarea.value).then(() => {
    showToast("📋 Réserve copiée ! Prête à être remise ou dictée au secrétaire.", "success");
  }).catch(() => {
    showToast("Impossible de copier automatiquement.", "error");
  });
}

function enregistrerReserveResolution() {
  const resId = document.getElementById('reserveResolutionSelect')?.value;
  const res = appData.resolutions.find(r => r.id === resId);
  const text = document.getElementById('reserveTexteGenere')?.value.trim();

  if (!res || !text) {
    alert("Veuillez sélectionner une résolution et générer un texte de réserve.");
    return;
  }

  res.reservesPV = res.reservesPV || [];
  const heure = getHeureParis();
  res.reservesPV.push({
    heure,
    texte: text,
    type: document.getElementById('reserveTypeSelect')?.value || 'PASSERELLE'
  });

  res.hasReserve = true;
  res.opponentsText = (res.opponentsText ? res.opponentsText + ' | ' : '') + `[RÉSERVE PV déposée à ${heure}]`;

  persistData();
  closeModal('reserveModal');
  showToast(`⚖️ Réserve officielle consignée sur la Résolution n° ${res.number} !`, "warning");
}

// =======================================================
// RACCOURCIS CLAVIER "MODE TURBO" & AUTO-BACKUP
// =======================================================

function openShortcutsModal() {
  openModal('shortcutsModal');
}

// Auto-Backup cyclique (toutes les 60 secondes en arrière-plan)
function initAutoBackup() {
  setInterval(() => {
    try {
      const snap = {
        timestamp: new Date().toISOString(),
        presentTantiemes: appData.config.presentTantiemes,
        resolutionsVotes: appData.resolutions.map(r => ({ id: r.id, status: r.status, pour: r.tantiemesPour, contre: r.tantiemesContre, elu: r.eluNom })),
        coproPresentsCount: (appData.coproprietaires || []).filter(c => c.statut === 'PRESENT').length,
        pouvoirsCount: (appData.coproprietaires || []).filter(c => c.statut === 'POUVOIR').length
      };
      const historyRaw = localStorage.getItem('AG_SNAPSHOT_HISTORY');
      let history = historyRaw ? JSON.parse(historyRaw) : [];
      if (!Array.isArray(history)) history = [];
      history.push(snap);
      if (history.length > 30) history = history.slice(-30);
      localStorage.setItem('AG_SNAPSHOT_HISTORY', JSON.stringify(history));
    } catch (e) {
      console.warn("Auto-backup failed", e);
    }
  }, 60000);
}

// Dropdown moderne Header (Documents & PV)
function toggleHeaderDropdown(menuId) {
  const menu = document.getElementById(menuId);
  if (!menu) return;
  const parentDropdown = menu.closest('.header-dropdown');
  const wasActive = menu.classList.contains('active');
  closeHeaderDropdowns();
  if (!wasActive) {
    menu.classList.add('active');
    if (parentDropdown) parentDropdown.classList.add('active');
  }
}

function closeHeaderDropdowns() {
  document.querySelectorAll('.dropdown-menu-pro.active').forEach(m => m.classList.remove('active'));
  document.querySelectorAll('.header-dropdown.active').forEach(d => d.classList.remove('active'));
}

document.addEventListener('click', (e) => {
  if (!e.target.closest('.header-dropdown')) {
    closeHeaderDropdowns();
  }
});

// Raccourcis clavier (Mode AG Turbo)
window.addEventListener('keydown', (e) => {
  const tag = document.activeElement?.tagName;
  const isTyping = ['INPUT', 'TEXTAREA', 'SELECT'].includes(tag);

  if (e.key === 'Escape') {
    closeHeaderDropdowns();
    ['scrutinModal', 'ouvertureModal', 'reserveModal', 'shortcutsModal', 'spotlightModal', 'coproModal', 'pouvoirModal', 'transfertModal', 'resolutionModal', 'pvMiroirModal', 'mouvementSeanceModal', 'exportModal', 'clotureModal', 'flashInfoModal'].forEach(id => closeModal(id));
    return;
  }

  // Ctrl+K ou Cmd+K pour Spotlight même si un champ est actif
  if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
    e.preventDefault();
    openSpotlightModal();
    return;
  }

  if (isTyping) return;

  if (e.key === '/') {
    e.preventDefault();
    openSpotlightModal();
  } else if (e.key === '?' || e.key === 'k') {
    e.preventDefault();
    openShortcutsModal();
  } else if (e.key === 'o' || e.key === 'O') {
    e.preventDefault();
    openOuvertureModal();
  } else if (e.key === 's' || e.key === 'S') {
    e.preventDefault();
    toggleModeSeance();
  } else if (e.key === 'ArrowRight' && isModeSeanceActive) {
    e.preventDefault();
    naviguerSeance(1);
  } else if (e.key === 'ArrowLeft' && isModeSeanceActive) {
    e.preventDefault();
    naviguerSeance(-1);
  } else if ((e.key === 'u' || e.key === 'U') && isModeSeanceActive) {
    e.preventDefault();
    setSeanceUnanimite();
  } else if ((e.key === 'a' || e.key === 'A') && isModeSeanceActive) {
    e.preventDefault();
    setSeanceVote('ADOPTEE');
  } else if ((e.key === 'r' || e.key === 'R') && isModeSeanceActive) {
    e.preventDefault();
    setSeanceVote('REJETEE');
  } else if ((e.key === 'd' || e.key === 'D') && isModeSeanceActive && activeSeanceResId) {
    e.preventDefault();
    openScrutinModal(activeSeanceResId);
  }
});

// =======================================================
// CHRONOMÈTRE DE SÉANCE & DÉBATS (MODE FOCUS)
// =======================================================

let seanceGlobalSeconds = 0;
let seanceResSeconds = 0;
let isResTimerPaused = false;
let seanceTimerInterval = null;

function initSeanceTimers() {
  if (seanceTimerInterval) clearInterval(seanceTimerInterval);
  seanceTimerInterval = setInterval(() => {
    if (typeof isModeSeanceActive !== 'undefined' && isModeSeanceActive) {
      seanceGlobalSeconds++;
      if (!isResTimerPaused) {
        seanceResSeconds++;
      }
      updateTimerDisplays();
    }
  }, 1000);
}

function updateTimerDisplays() {
  const resEl = document.getElementById('seanceResTimerText');
  const globEl = document.getElementById('seanceGlobalTimerText');

  if (resEl) {
    const m = Math.floor(seanceResSeconds / 60);
    const s = seanceResSeconds % 60;
    resEl.innerText = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  if (globEl) {
    const h = Math.floor(seanceGlobalSeconds / 3600);
    const m = Math.floor((seanceGlobalSeconds % 3600) / 60);
    const s = seanceGlobalSeconds % 60;
    globEl.innerText = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
}

function toggleResTimer() {
  isResTimerPaused = !isResTimerPaused;
  const badge = document.getElementById('seanceResTimerBadge');
  if (badge) {
    badge.style.opacity = isResTimerPaused ? '0.45' : '1';
  }
  showToast(isResTimerPaused ? "⏱️ Chrono débat mis en pause" : "⏱️ Chrono débat relancé", "info");
}

// =======================================================
// SIMULATEUR DE CHARGES & QUOTE-PART (« COMBIEN ÇA COÛTE AU VOISIN ? »)
// =======================================================

let isCostSimOpen = false;

function toggleCostSimulator() {
  isCostSimOpen = !isCostSimOpen;
  const content = document.getElementById('costSimContent');
  const icon = document.getElementById('costSimToggleIcon');
  if (content) content.style.display = isCostSimOpen ? 'block' : 'none';
  if (icon) icon.innerText = isCostSimOpen ? '[ ▲ Masquer le simulateur ]' : '[ + Ouvrir le simulateur ]';
  if (isCostSimOpen) {
    calculerImpactCharges();
  }
}

function calculerImpactCharges() {
  const budgetInput = document.getElementById('costSimBudgetInput');
  const grid = document.getElementById('costSimResultsGrid');
  if (!grid) return;

  let totalBudget = Number(budgetInput?.value) || 0;
  if (totalBudget <= 0 && activeSeanceResId) {
    const res = appData.resolutions.find(r => r.id === activeSeanceResId);
    if (res) {
      const match = (res.title + ' ' + (res.description || '')).match(/(\d+[\s\d]*)\s*€/);
      if (match) {
        totalBudget = Number(match[1].replace(/\s/g, '')) || 0;
        if (budgetInput && totalBudget > 0) budgetInput.value = totalBudget;
      }
    }
  }

  if (totalBudget <= 0) totalBudget = 25000;

  const totalCopro = Number(appData.config.totalTantiemes) || 97478;

  const types = [
    { label: "🅿️ Parking", tantiemes: 5, desc: "Place extérieure" },
    { label: "🚗 Box / Garage", tantiemes: 44, desc: "Box sous-sol" },
    { label: "🏠 Appart. T4", tantiemes: 350, desc: "Grand 4 pièces" },
    { label: "🏠 Appart. T5", tantiemes: 430, desc: "Grand 5 pièces" },
  ];

  grid.innerHTML = types.map(t => {
    const part = (totalBudget * t.tantiemes / totalCopro);
    const parMois = part / 12;
    return `
      <div class="quote-part-pill">
        <div style="font-weight:700; font-size:0.82rem; color:#fde047;">${t.label}</div>
        <div style="font-size:0.7rem; color:#cbd5e1;">${t.tantiemes} tant. • ${t.desc}</div>
        <div style="font-size:1.1rem; font-weight:800; color:white; margin-top:3px;">
          ${part.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
        </div>
        <div style="font-size:0.72rem; color:#a7f3d0;">
          (~${parMois.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €/mois sur 1 an)
        </div>
      </div>
    `;
  }).join('');

  calculerQuotePartVoisin();
}

function calculerQuotePartVoisin() {
  const query = (document.getElementById('costSimNeighborInput')?.value || '').trim();
  const resEl = document.getElementById('costSimNeighborResult');
  const budgetInput = document.getElementById('costSimBudgetInput');
  if (!resEl) return;

  if (!query) {
    resEl.innerHTML = '';
    return;
  }

  const budget = Number(budgetInput?.value) || 25000;
  const totalCopro = Number(appData.config.totalTantiemes) || 97478;

  const found = (appData.coproprietaires || []).find(c =>
    fuzzyMatch(query, `${c.nom} ${c.lots || ''}`)
  );

  if (found) {
    const part = (budget * (found.tantiemes || 0) / totalCopro);
    const mois = part / 12;
    resEl.innerHTML = `
      👉 <strong>${escapeHtml(found.nom)}</strong> (${found.tantiemes} t.) : 
      <strong>${part.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</strong> 
      <span style="font-size:0.75rem; color:#cbd5e1;">(~${mois.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €/mois)</span>
    `;
  } else {
    resEl.innerHTML = `<span style="color:#f87171; font-size:0.75rem;">Copropriétaire non trouvé</span>`;
  }
}

// =======================================================
// FICHE DE CLÔTURE & ATTESTATION CONTRADICTOIRE SCRUTATEURS
// =======================================================

// Détection intelligente du syndic désigné pour le mandat 2027
function getSyndicEluInfo(resolutions) {
  const list = resolutions || appData.resolutions || [];
  // Candidatures syndic : r06a (Citya), r06b (Trenta) ou titres équivalents
  const candidatures = list.filter(r => 
    (r.number && r.number.startsWith('06') && r.number !== '06') || 
    (r.title && /candidature.*syndic|d[ée]signation.*syndic/i.test(r.title) && r.majorite !== 'article sans vote')
  );

  const elu = candidatures.find(r => r.status === 'ADOPTEE');

  if (elu) {
    const isTrenta = /trenta/i.test(elu.title) || (elu.eluNom && /trenta/i.test(elu.eluNom));
    const isCitya = /citya/i.test(elu.title) || (elu.eluNom && /citya/i.test(elu.eluNom));

    if (isTrenta) {
      return {
        status: 'NOUVEAU',
        nom: 'Cabinet TRENTA IMMOBILIER',
        nomCourt: 'cabinet Trenta Immobilier',
        resNum: elu.number,
        badgeHtml: '<span style="background:#ecfdf5; color:#065f46; border:1px solid #a7f3d0; padding:3px 9px; border-radius:999px; font-weight:800; font-size:0.75rem;">🎉 NOUVEAU SYNDIC ÉLU</span>',
        titreBloc: '🎉 Élection d\'un nouveau syndic : Cabinet TRENTA IMMOBILIER',
        descBloc: 'L\'Assemblée Générale a voté pour le renouvellement de la gestion en élisant le <strong>cabinet Trenta Immobilier</strong> pour gérer la copropriété. Le Conseil Syndical veillera scrupuleusement à une passation exemplaire et ordonnée de l\'ensemble des dossiers, archives et comptes bancaires avec le cabinet sortant Citya.',
        phraseCS: 'Ont été élus pour vous représenter, piloter la transition et contrôler la gestion du nouveau cabinet Trenta Immobilier :',
        footerPV: 'Le procès-verbal officiel vous sera notifié par le nouveau syndic (cabinet Trenta Immobilier). En attendant, vos conseillers syndicaux restent à votre entière disposition dans vos montées pour toute précision.'
      };
    } else if (isCitya) {
      return {
        status: 'RECONDUIT',
        nom: 'Cabinet CITYA Agence Henry',
        nomCourt: 'cabinet Citya',
        resNum: elu.number,
        badgeHtml: '<span style="background:#eff6ff; color:#1e40af; border:1px solid #bfdbfe; padding:3px 9px; border-radius:999px; font-weight:800; font-size:0.75rem;">🏢 SYNDIC RECONDUIT</span>',
        titreBloc: '🏢 Reconduction du syndic sortant : Cabinet CITYA Agence Henry',
        descBloc: 'Le mandat du <strong>cabinet Citya Agence Henry</strong> a été renouvelé par l\'Assemblée Générale. Le Conseil Syndical maintiendra une vigilance absolue et un contrôle scrupuleux de sa gestion administrative, comptable et technique.',
        phraseCS: 'Ont été élus pour vous représenter et contrôler scrupuleusement la gestion du cabinet Citya :',
        footerPV: 'Le procès-verbal officiel vous sera envoyé par le cabinet Citya. En attendant, vos conseillers syndicaux restent à votre disposition dans vos montées pour toute précision.'
      };
    } else {
      const nomAutre = elu.eluNom || elu.title.replace(/^.*:\s*/, '').trim();
      return {
        status: 'ELU',
        nom: `Cabinet ${nomAutre}`,
        nomCourt: `cabinet ${nomAutre}`,
        resNum: elu.number,
        badgeHtml: '<span style="background:#ecfdf5; color:#065f46; border:1px solid #a7f3d0; padding:3px 9px; border-radius:999px; font-weight:800; font-size:0.75rem;">🏢 SYNDIC DÉSIGNÉ</span>',
        titreBloc: `🏢 Désignation du syndic : Cabinet ${nomAutre}`,
        descBloc: `La gestion de la résidence a été confiée au <strong>cabinet ${nomAutre}</strong>. Le Conseil Syndical supervisera l'exécution de ses missions.`,
        phraseCS: `Ont été élus pour vous représenter et contrôler la gestion du cabinet ${nomAutre} :`,
        footerPV: `Le procès-verbal officiel vous sera adressé par le syndic désigné (${nomAutre}). En attendant, vos conseillers syndicaux restent à votre disposition.`
      };
    }
  }

  // Vérifier si toutes les candidatures ont été rejetées
  const rejets = candidatures.filter(r => r.status === 'REJETEE');
  if (candidatures.length > 0 && rejets.length === candidatures.length) {
    return {
      status: 'REJET_TOTAL',
      nom: 'Aucun syndic élu (Rejet)',
      nomCourt: 'futur syndic / administrateur',
      badgeHtml: '<span style="background:#fef2f2; color:#991b1b; border:1px solid #fecaca; padding:3px 9px; border-radius:999px; font-weight:800; font-size:0.75rem;">⚠️ REJET DES CANDIDATURES</span>',
      titreBloc: '⚠️ Situation de la gérance : Aucun syndic élu en séance',
      descBloc: 'Aucun cabinet candidat n\'a recueilli la majorité légale requise. Le Conseil Syndical engage immédiatement les démarches d\'urgence pour assurer la continuité de la gestion (désignation d\'un administrateur judiciaire ou convocation d\'une nouvelle assemblée).',
      phraseCS: 'Ont été élus pour représenter la copropriété et piloter cette situation d\'urgence :',
      footerPV: 'Le Conseil Syndical vous tiendra informés sans délai des démarches de désignation du gestionnaire légal de la résidence.'
    };
  }

  // Si pas encore voté ou en attente
  return {
    status: 'EN_ATTENTE',
    nom: 'En cours de désignation (Vote en attente)',
    nomCourt: 'le syndic de la copropriété',
    badgeHtml: '<span style="background:#fffbeb; color:#92400e; border:1px solid #fde68a; padding:3px 9px; border-radius:999px; font-weight:800; font-size:0.75rem;">⏳ VOTE SYNDIC EN ATTENTE</span>',
    titreBloc: '🏢 Désignation du syndic pour l\'exercice 2027',
    descBloc: 'Les candidatures des cabinets Citya Agence Henry et Trenta Immobilier sont soumises à la décision souveraine de l\'Assemblée Générale.',
    phraseCS: 'Ont été élus pour vous représenter et contrôler scrupuleusement la gestion de la copropriété :',
    footerPV: 'Le procès-verbal officiel vous sera notifié par le syndic conformément aux dispositions légales. Vos conseillers syndicaux restent à votre disposition dans vos montées.'
  };
}

// Détection intelligente des membres du CS élus lors des résolutions 08
function getConseillersElusInfo(resolutions) {
  const list = resolutions || appData.resolutions || [];
  const csRes = list.filter(r => 
    r.number && r.number.startsWith('08') && 
    r.number !== '08' && 
    r.majorite !== 'article sans vote'
  );

  const adoptes = csRes.filter(r => r.status === 'ADOPTEE');
  
  if (adoptes.length > 0) {
    return adoptes.map(r => {
      let nom = r.eluNom;
      if (!nom) {
        nom = r.title
          .replace(/Élection au Conseil Syndical\s*:\s*/i, '')
          .replace(/Election au Conseil Syndical\s*:\s*/i, '')
          .trim();
      }
      return {
        name: nom,
        isEluDirect: true,
        resNumber: r.number
      };
    });
  }

  // Fallback si scrutin non encore tenu
  return (appData.members || [])
    .filter(m => m.statut !== 'DEMISSIONNAIRE')
    .map(m => ({
      name: m.name,
      isEluDirect: false
    }));
}

function openClotureModal() {
  renderFicheCloture();
  openModal('clotureModal');
}

function renderFicheCloture() {
  const container = document.getElementById('cloturePrintZone');
  if (!container) return;

  const totalCopro = Number(appData.config.totalTantiemes) || 97478;
  const resolutions = appData.resolutions || [];
  const voteRes = resolutions.filter(r => r.majorite !== 'article sans vote');
  const adopted = voteRes.filter(r => r.status === 'ADOPTEE');
  const rejected = voteRes.filter(r => r.status === 'REJETEE');
  const postponed = voteRes.filter(r => r.status === 'REPORTEE');

  const heureCloture = getHeureParis();
  const copros = appData.coproprietaires || [];
  const partis = copros.filter(c => c.statut === 'PARTI');
  const totalEnSalleFin = appData.config.presentTantiemes || 0;
  const syndicInfo = getSyndicEluInfo(resolutions);

  const allReserves = [];
  resolutions.forEach(r => {
    if (r.reservesPV && Array.isArray(r.reservesPV) && r.reservesPV.length > 0) {
      r.reservesPV.forEach(rv => {
        allReserves.push({
          resNum: r.number,
          resTitle: r.title,
          heure: rv.heure,
          texte: rv.texte,
          type: rv.type
        });
      });
    }
  });

  container.innerHTML = `
    <div class="cloture-card">
      <div style="display:flex; justify-content:space-between; align-items:flex-start; border-bottom:2px solid #0f172a; padding-bottom:0.75rem; margin-bottom:1rem;">
        <div>
          <h2 style="margin:0; font-size:1.3rem; color:#0f172a; text-transform:uppercase; letter-spacing:0.5px;">
            📑 Attestation Officielle de Clôture de Séance & Relevé Contradictoire
          </h2>
          <div style="font-size:0.85rem; color:#475569; margin-top:0.25rem;">
            Assemblée Générale Ordinaire du <strong>25 novembre 2026</strong> • Résidence Le Floréal (Noisy-le-Grand)
          </div>
        </div>
        <div style="text-align:right;">
          <span style="background:#0f172a; color:white; padding:4px 10px; border-radius:4px; font-weight:800; font-size:0.8rem;">
            CONSEIL SYNDICAL
          </span>
        </div>
      </div>

      <!-- HORODATAGE & QUORUM DE SÉANCE -->
      <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:0.6rem; margin-bottom:0.75rem; background:#f1f5f9; padding:0.75rem; border-radius:6px; font-size:0.83rem;">
        <div><strong>Ouverture de séance :</strong> 18h00</div>
        <div><strong>Clôture officielle :</strong> ${heureCloture}</div>
        <div><strong>Quorum final en salle :</strong> ${totalEnSalleFin.toLocaleString('fr-FR')} t. (${((totalEnSalleFin/totalCopro)*100).toFixed(1)}%)</div>
        <div><strong>Syndic en séance :</strong> ${escapeHtml(appData.config.syndic || 'Citya Agence Henry')}</div>
      </div>

      <!-- SYNDIC DÉSIGNÉ POUR LE MANDAT 2027 -->
      <div style="background:${syndicInfo.status === 'NOUVEAU' ? '#ecfdf5' : '#f8fafc'}; border:1px solid ${syndicInfo.status === 'NOUVEAU' ? '#10b981' : '#cbd5e1'}; border-radius:6px; padding:0.55rem 0.85rem; font-size:0.83rem; margin-bottom:1rem; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <strong>🏢 Mandat de syndic pour l'exercice 2027 :</strong>
          <span style="font-weight:800; color:${syndicInfo.status === 'NOUVEAU' ? '#15803d' : '#1e3a8a'}; margin-left:0.3rem;">
            ${syndicInfo.nom}
          </span>
          <span style="color:#64748b; font-size:0.78rem; margin-left:0.4rem;">(${syndicInfo.status === 'NOUVEAU' ? 'Nouveau syndic élu par l\'AG' : (syndicInfo.status === 'RECONDUIT' ? 'Cabinet reconduit' : 'Statut séance')})</span>
        </div>
        ${syndicInfo.badgeHtml}
      </div>

      <!-- SYNTHÈSE DES SCRUTINS -->
      <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:0.75rem; margin-bottom:1.25rem; text-align:center;">
        <div style="background:#ecfdf5; border:1px solid #10b981; border-radius:6px; padding:0.6rem;">
          <div style="font-size:0.72rem; text-transform:uppercase; color:#065f46; font-weight:700;">Résolutions Adoptées</div>
          <div style="font-size:1.4rem; font-weight:800; color:#15803d;">${adopted.length}</div>
        </div>
        <div style="background:#fef2f2; border:1px solid #ef4444; border-radius:6px; padding:0.6rem;">
          <div style="font-size:0.72rem; text-transform:uppercase; color:#991b1b; font-weight:700;">Résolutions Rejetées</div>
          <div style="font-size:1.4rem; font-weight:800; color:#dc2626;">${rejected.length}</div>
        </div>
        <div style="background:#fffbeb; border:1px solid #f59e0b; border-radius:6px; padding:0.6rem;">
          <div style="font-size:0.72rem; text-transform:uppercase; color:#92400e; font-weight:700;">Reportées / Retirées</div>
          <div style="font-size:1.4rem; font-weight:800; color:#d97706;">${postponed.length}</div>
        </div>
      </div>

      <!-- TABLEAU CONTRADICTOIRE DES SCRUTINS -->
      <div style="margin-bottom:1.25rem;">
        <div style="font-weight:700; font-size:0.88rem; margin-bottom:0.4rem; color:#0f172a;">
          Détail des votes certifiés conformes aux pointages de séance :
        </div>
        <table style="width:100%; border-collapse:collapse; font-size:0.78rem;">
          <thead>
            <tr style="background:#e2e8f0; border-bottom:1px solid #cbd5e1;">
              <th style="padding:4px 6px; text-align:left;">N°</th>
              <th style="padding:4px 6px; text-align:left;">Objet</th>
              <th style="padding:4px 6px; text-align:center;">Règle</th>
              <th style="padding:4px 6px; text-align:center;">Décision</th>
              <th style="padding:4px 6px; text-align:right;">Pour</th>
              <th style="padding:4px 6px; text-align:right;">Contre</th>
              <th style="padding:4px 6px; text-align:right;">Abs.</th>
              <th style="padding:4px 6px; text-align:left;">Élu(e) / Opposants</th>
            </tr>
          </thead>
          <tbody>
            ${resolutions.map(r => `
              <tr style="border-bottom:1px solid #f1f5f9;">
                <td style="padding:4px 6px; font-weight:700;">${r.number}</td>
                <td style="padding:4px 6px;">${escapeHtml(r.title)}</td>
                <td style="padding:4px 6px; text-align:center; color:#64748b;">${r.majorite}</td>
                <td style="padding:4px 6px; text-align:center; font-weight:700; color:${r.status === 'ADOPTEE' ? '#15803d' : (r.status === 'REJETEE' ? '#dc2626' : '#d97706')};">${r.status}</td>
                <td style="padding:4px 6px; text-align:right; font-weight:700; color:#15803d;">${r.tantiemesPour || '-'}</td>
                <td style="padding:4px 6px; text-align:right; font-weight:700; color:#dc2626;">${r.tantiemesContre || '-'}</td>
                <td style="padding:4px 6px; text-align:right; color:#d97706;">${r.tantiemesAbs || '-'}</td>
                <td style="padding:4px 6px; font-size:0.72rem;">${escapeHtml(r.eluNom ? `👑 ${r.eluNom}` : (r.opponentsText || '-'))}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <!-- DÉPARTS CONSIGNÉS SUR FEUILLE DE PRÉSENCE -->
      ${partis.length > 0 ? `
        <div style="background:#fef2f2; border-left:4px solid #ef4444; padding:0.6rem 0.85rem; font-size:0.8rem; margin-bottom:1rem;">
          <strong>🚪 Départs officiellement consignés en cours de séance (Art. 14 décret 1967) :</strong><br>
          ${partis.map(p => `• <strong>${escapeHtml(p.nom)}</strong> (${p.tantiemes} t.) — Départ consigné à <strong>${p.heureDepart || 'en cours d\'AG'}</strong>`).join('<br>')}
        </div>
      ` : ''}

      <!-- RÉSERVES FORMELLES DÉPOSÉES AU PV -->
      ${allReserves.length > 0 ? `
        <div style="background:#fffbeb; border-left:4px solid #f59e0b; padding:0.6rem 0.85rem; font-size:0.8rem; margin-bottom:1.25rem;">
          <strong style="color:#92400e;">⚠️ Réserves formelles au Procès-Verbal consignées contradictoirement (Art. 17 décret 1967) :</strong><br>
          ${allReserves.map(rv => `
            <div style="margin-top:0.4rem; padding-top:0.3rem; border-top:1px dashed #fde68a;">
              <strong>Résolution n° ${rv.resNum}</strong> (${rv.heure}) : <em>${escapeHtml(rv.texte.replace(/\n/g, ' '))}</em>
            </div>
          `).join('')}
        </div>
      ` : `
        <div style="background:#f8fafc; border:1px solid #e2e8f0; padding:0.5rem 0.8rem; font-size:0.8rem; color:#64748b; margin-bottom:1.25rem;">
          ✓ Aucune réserve formelle n'a été déposée en séance (déroulement régulier).
        </div>
      `}

      <!-- DÉCLARATION SOLENNELLE ET SIGNATURES -->
      <div style="font-size:0.8rem; color:#334155; line-height:1.45; margin-bottom:1rem; font-style:italic; border-top:1px solid #cbd5e1; padding-top:0.75rem;">
        « Les soussignés, membres du bureau de l'assemblée générale et scrutateurs désignés du Conseil Syndical, certifient sur l'honneur que le présent relevé contradictoire est conforme aux résultats proclamés et aux déclarations exprimées en séance ce 25 novembre 2026 à Noisy-le-Grand. »
      </div>

      <div class="signatures-grid">
        <div class="signature-box">
          <div style="font-weight:700; font-size:0.8rem; color:#0f172a;">Président(e) de séance :</div>
          <div style="font-size:0.72rem; color:#64748b;">Signature :</div>
        </div>
        <div class="signature-box">
          <div style="font-weight:700; font-size:0.8rem; color:#0f172a;">Scrutateur n° 1 (Conseil Syndical) :</div>
          <div style="font-size:0.72rem; color:#64748b;">Signature :</div>
        </div>
        <div class="signature-box">
          <div style="font-weight:700; font-size:0.8rem; color:#0f172a;">Scrutateur n° 2 (Conseil Syndical) :</div>
          <div style="font-size:0.72rem; color:#64748b;">Signature :</div>
        </div>
      </div>
    </div>
  `;
}

function copierResumeCloture() {
  const el = document.getElementById('cloturePrintZone');
  if (!el) return;
  const rawText = el.innerText || el.textContent;
  navigator.clipboard.writeText(rawText).then(() => {
    showToast("📋 Relevé de clôture copié dans le presse-papier !", "success");
  }).catch(() => {
    showToast("Impossible de copier automatiquement.", "error");
  });
}

function imprimerAttestationCloture() {
  const content = document.getElementById('cloturePrintZone')?.innerHTML;
  if (!content) return;

  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Attestation de Clôture Contradictoire AG 2026 - Le Floréal</title>
      <style>
        body { font-family: system-ui, -apple-system, sans-serif; padding: 20px; color: #0f172a; line-height: 1.4; font-size: 10pt; }
        .cloture-card { border: none !important; padding: 0 !important; }
        table { width: 100%; border-collapse: collapse; margin-top: 6px; }
        th, td { border: 1px solid #cbd5e1; padding: 4px 6px; text-align: left; }
        th { background: #f1f5f9; }
        .signatures-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-top: 25px; border-top: 2px dashed #0f172a; padding-top: 10px; }
        .signature-box { border: 1px solid #94a3b8; height: 90px; padding: 8px; }
        @media print { button { display: none !important; } }
      </style>
    </head>
    <body>
      ${content}
      <script>window.onload = function() { window.print(); };</script>
    </body>
    </html>
  `);
  printWindow.document.close();
}

// =======================================================
// FLASH-INFO RÉSIDENTS POUR HALLS D'IMMEUBLES (LENDEMAIN MATIN)
// =======================================================

function openFlashInfoModal() {
  renderFlashInfo();
  openModal('flashInfoModal');
}

function renderFlashInfo() {
  const container = document.getElementById('flashInfoPrintZone');
  if (!container) return;

  const totalCopro = Number(appData.config.totalTantiemes) || 97478;
  const resolutions = appData.resolutions || [];
  const voteRes = resolutions.filter(r => r.majorite !== 'article sans vote');
  const adopted = voteRes.filter(r => r.status === 'ADOPTEE');
  const rejected = voteRes.filter(r => r.status === 'REJETEE');

  const totalEnSalle = appData.config.presentTantiemes || 0;
  const pctRepresente = totalCopro > 0 ? ((totalEnSalle / totalCopro) * 100).toFixed(1) : 0;

  const syndicInfo = getSyndicEluInfo(resolutions);
  const conseillersElus = getConseillersElusInfo(resolutions);

  container.innerHTML = `
    <div class="flash-info-card" id="flashInfoFlyerContent">
      <div style="background:#1e3a8a; color:white; border-radius:8px; padding:1.25rem; text-align:center; margin-bottom:1.25rem;">
        <div style="font-size:0.8rem; letter-spacing:1px; text-transform:uppercase; font-weight:700; color:#93c5fd;">
          Conseil Syndical • Résidence Le Floréal
        </div>
        <h1 style="margin:0.4rem 0 0.2rem; font-size:1.4rem; font-weight:800; color:white;">
          📢 FLASH-INFO : RÉSULTATS DE L'ASSEMBLÉE GÉNÉRALE 2026
        </h1>
        <div style="font-size:0.85rem; color:#bfdbfe;">
          Séance du 25 novembre 2026 • Salle Jacques Prévert, Noisy-le-Grand
        </div>
      </div>

      <div style="background:#ecfdf5; border-left:4px solid #10b981; padding:0.85rem 1rem; border-radius:4px; font-size:0.92rem; color:#065f46; margin-bottom:1.2rem; line-height:1.5;">
        <strong>Chers voisins, chers copropriétaires,</strong><br>
        Le Conseil Syndical vous remercie très chaleureusement pour votre mobilisation record lors de notre Assemblée Générale annuelle. Avec plus de <strong>${pctRepresente}% des tantièmes de la résidence représentés</strong>, notre communauté a fait entendre sa voix pour la défense de notre cadre de vie et la maîtrise stricte de nos charges !
      </div>

      <!-- BLOC INTELLIGENT DE DÉSIGNATION DU SYNDIC -->
      <div style="background:${syndicInfo.status === 'NOUVEAU' ? '#ecfdf5' : '#f8fafc'}; border:1px solid ${syndicInfo.status === 'NOUVEAU' ? '#a7f3d0' : '#cbd5e1'}; border-radius:6px; padding:0.85rem 1rem; margin-bottom:1.25rem;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.4rem; flex-wrap:wrap; gap:0.5rem;">
          <h3 style="margin:0; font-size:0.95rem; color:${syndicInfo.status === 'NOUVEAU' ? '#065f46' : '#1e3a8a'}; font-weight:800; display:flex; align-items:center; gap:0.4rem;">
            ${syndicInfo.titreBloc}
          </h3>
          ${syndicInfo.badgeHtml}
        </div>
        <div style="font-size:0.84rem; color:#334155; line-height:1.5;">
          ${syndicInfo.descBloc}
        </div>
      </div>

      <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:1rem; margin-bottom:1.25rem;">
        <div style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:6px; padding:0.85rem;">
          <h3 style="margin:0 0 0.5rem; font-size:0.95rem; color:#15803d; display:flex; align-items:center; gap:0.4rem;">
            ✅ Les Décisions Majeures Adoptées (${adopted.length})
          </h3>
          <ul style="margin:0; padding-left:1.1rem; font-size:0.83rem; color:#334155; line-height:1.5;">
            ${adopted.slice(0, 6).map(r => `<li><strong>N° ${r.number}</strong> : ${escapeHtml(r.title)}</li>`).join('')}
            ${adopted.length > 6 ? `<li style="color:#64748b; font-style:italic;">... et ${adopted.length - 6} autres résolutions approuvées.</li>` : ''}
          </ul>
        </div>

        <div style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:6px; padding:0.85rem;">
          <h3 style="margin:0 0 0.5rem; font-size:0.95rem; color:#dc2626; display:flex; align-items:center; gap:0.4rem;">
            ❌ Projets Rejetés ou Ajournés (${rejected.length})
          </h3>
          ${rejected.length > 0 ? `
            <ul style="margin:0; padding-left:1.1rem; font-size:0.83rem; color:#334155; line-height:1.5;">
              ${rejected.map(r => `<li><strong>N° ${r.number}</strong> : ${escapeHtml(r.title)}</li>`).join('')}
            </ul>
          ` : `
            <div style="font-size:0.83rem; color:#64748b;">Aucun rejet bloquant constaté lors de cette séance.</div>
          `}
        </div>
      </div>

      <div style="background:#f1f5f9; border-radius:6px; padding:0.85rem; margin-bottom:1.25rem; font-size:0.86rem; color:#1e293b;">
        <strong style="color:#1e3a8a;">👥 Votre Conseil Syndical pour l'année 2026-2027 :</strong><br>
        ${syndicInfo.phraseCS}<br>
        <div style="margin-top:0.4rem; display:flex; gap:0.5rem; flex-wrap:wrap;">
          ${conseillersElus.map(m => `
            <span style="background:white; border:1px solid #cbd5e1; padding:3px 8px; border-radius:4px; font-weight:700; font-size:0.8rem; color:#1e3a8a;">
              👤 ${escapeHtml(m.name)}
            </span>
          `).join('')}
        </div>
      </div>

      <div style="border-top:1px solid #e2e8f0; padding-top:0.75rem; text-align:center; font-size:0.78rem; color:#64748b; line-height:1.5;">
        ${syndicInfo.footerPV}<br>
        <strong>Bien cordialement, Votre Conseil Syndical • Résidence Le Floréal</strong>
      </div>
    </div>
  `;
}

function copierFlashInfoTexte() {
  const el = document.getElementById('flashInfoFlyerContent');
  if (!el) return;
  const rawText = el.innerText || el.textContent;
  navigator.clipboard.writeText(rawText).then(() => {
    showToast("📋 Texte du Flash-Info copié ! Prêt pour email ou WhatsApp.", "success");
  }).catch(() => {
    showToast("Impossible de copier automatiquement.", "error");
  });
}

function imprimerFlashInfoFlyer() {
  const content = document.getElementById('flashInfoPrintZone')?.innerHTML;
  if (!content) return;

  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Flash-Info AG 2026 - Conseil Syndical Le Floréal</title>
      <style>
        body { font-family: system-ui, -apple-system, sans-serif; padding: 25px; color: #0f172a; line-height: 1.5; font-size: 11pt; }
        .flash-info-card { border: none !important; box-shadow: none !important; }
        @media print { button { display: none !important; } }
      </style>
    </head>
    <body>
      ${content}
      <script>window.onload = function() { window.print(); };</script>
    </body>
    </html>
  `);
  printWindow.document.close();
}

// Formatting helpers
function formatDate(dStr) {
  if (!dStr) return '';
  const parts = dStr.split('-');
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
  return dStr;
}

function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

document.addEventListener('DOMContentLoaded', () => {
  initDarkMode();
  initAutoBackup();
  initSeanceTimers();
  updateUI();
});
