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

  // Voix du CS
  const csPerso = appData.members.reduce((acc, m) => acc + (Number(m.tantiemes) || 0), 0);
  const csMandats = appData.members.reduce((acc, m) => acc + (Number(m.mandatTantiemes) || 0), 0);
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

// Render Copropriétaires (Accueil / Émargement & Départs en séance)
function renderCoproprietaires(totalEnSalle, totalTant) {
  const tbody = document.getElementById('coproTableBody');
  if (!tbody) return;

  const list = appData.coproprietaires || [];
  const search = (document.getElementById('searchCoproInput')?.value || '').toLowerCase();
  const filterStatut = document.getElementById('filterCoproStatut')?.value || 'ALL';

  const filtered = list.filter(c => {
    const matchSearch = (c.nom + ' ' + (c.mandataire || '') + ' ' + (c.notes || '')).toLowerCase().includes(search);
    let matchStatut = true;
    if (filterStatut === 'TOP20') {
      matchStatut = (c.categorie && c.categorie.includes('Top 20%')) || (c.notes && c.notes.includes('Top 20%'));
    } else if (filterStatut !== 'ALL') {
      matchStatut = (c.statut === filterStatut);
    }
    return matchSearch && matchStatut;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:1.5rem; color:var(--gray-500);">Aucun copropriétaire trouvé.</td></tr>`;
  } else {
    tbody.innerHTML = filtered.map(c => {
      const isTop20 = (c.categorie && c.categorie.includes('Top 20%')) || (c.notes && c.notes.includes('Top 20%'));

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

// Pointage express à l'accueil
function setCoproStatut(id, newStatut) {
  const c = appData.coproprietaires.find(x => x.id === id);
  if (c) {
    c.statut = newStatut;
    if (newStatut === 'PRESENT') {
      const now = new Date();
      c.heureArrivee = `${String(now.getHours()).padStart(2, '0')}h${String(now.getMinutes()).padStart(2, '0')}`;
      delete c.heureDepart;
    }
    persistData();
    showToast(`${c.nom} pointé comme ${newStatut}`, "success");
  }
}

function promptDepartCopro(id) {
  const c = appData.coproprietaires.find(x => x.id === id);
  if (!c) return;

  const now = new Date();
  const defaultHour = `${String(now.getHours()).padStart(2, '0')}h${String(now.getMinutes()).padStart(2, '0')}`;
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
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:1.5rem; color:var(--gray-500);">Aucun membre du Conseil Syndical renseigné.</td></tr>`;
  } else {
    tbody.innerHTML = appData.members.map(m => {
      const perso = Number(m.tantiemes) || 0;
      const mand = Number(m.mandatTantiemes) || 0;
      const tot = perso + mand;
      const pct = totalTant > 0 ? ((tot / totalTant) * 100).toFixed(1) : 0;
      const isOverTenPct = totalTant > 0 && (tot / totalTant) > 0.10;

      return `
        <tr>
          <td><strong>${escapeHtml(m.name)}</strong></td>
          <td>${escapeHtml(m.lots || '-')}</td>
          <td><span class="tantieme-pill">${perso}</span></td>
          <td>${escapeHtml(m.mandats || 'Aucun')}</td>
          <td><span class="tantieme-pill">${mand}</span></td>
          <td>
            <strong>${tot}</strong> (${pct}%)
            ${isOverTenPct ? `<span title="Attention: dépasse 10% des voix totales de l'immeuble" style="color:var(--danger); font-size:0.75rem; font-weight:700;"> ⚠️ &gt;10%</span>` : ''}
          </td>
          <td class="no-print" style="text-align:right;">
            <button class="btn btn-warning-gold btn-sm" onclick="openNewPouvoirModal(null, '${m.id}')" title="Attribuer un pouvoir à ce membre du CS">✉️ + Pouvoir</button>
            <button class="btn btn-secondary btn-sm" onclick="editMember('${m.id}')">✏️ Saisir tantièmes</button>
            <button class="btn btn-secondary btn-sm" onclick="deleteMember('${m.id}')" style="color:var(--danger)">🗑️</button>
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
    if (newStatus !== 'EN_ATTENTE') {
      const now = new Date();
      res.heureVote = `${String(now.getHours()).padStart(2, '0')}h${String(now.getMinutes()).padStart(2, '0')}`;
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
  document.getElementById('scrutinOpponentsList').value = res.opponentsText || '';
  const eluInput = document.getElementById('scrutinEluNomInput');
  if (eluInput) eluInput.value = res.eluNom || '';

  // Calcul instantané des opposants cochés
  renderScrutinChecklist();
  computeScrutinTotals();
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
      Appel des opposants (Cochez les copropriétaires qui lèvent la main) :
    </div>
    <div class="scrutin-checklist-box">
      ${presents.map(c => `
        <div style="display:flex; justify-content:space-between; align-items:center; padding:0.25rem 0; border-bottom:1px solid #f1f5f9; font-size:0.82rem;">
          <label style="display:flex; align-items:center; gap:0.4rem; cursor:pointer;">
            <input type="checkbox" class="chk-contre" data-id="${c.id}" data-tant="${c.tantiemes}" ${activeOpponents.includes(c.id) ? 'checked' : ''} onchange="onScrutinCheckboxChange()">
            <span>${escapeHtml(c.nom)} (<strong>${c.tantiemes}</strong> tant.)</span>
          </label>
          <label style="display:flex; align-items:center; gap:0.3rem; font-size:0.75rem; color:var(--warning); cursor:pointer;">
            <input type="checkbox" class="chk-abs" data-id="${c.id}" data-tant="${c.tantiemes}" ${activeAbs.includes(c.id) ? 'checked' : ''} onchange="onScrutinCheckboxChange()">
            Abstention
          </label>
        </div>
      `).join('')}
    </div>
  `;
}

function onScrutinCheckboxChange() {
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
}

function saveScrutin(e) {
  e.preventDefault();
  const res = appData.resolutions.find(r => r.id === currentScrutinResId);
  if (!res) return;

  res.tantiemesPour = Number(document.getElementById('scrutinPourInput').value) || 0;
  res.tantiemesContre = Number(document.getElementById('scrutinContreInput').value) || 0;
  res.tantiemesAbs = Number(document.getElementById('scrutinAbsInput').value) || 0;
  res.syndicClaimStatus = document.getElementById('scrutinSyndicClaim').value;
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

  // Horodatage officiel du vote
  const now = new Date();
  res.heureVote = `${String(now.getHours()).padStart(2, '0')}h${String(now.getMinutes()).padStart(2, '0')}`;

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
    mandatTantiemes: Number(document.getElementById('memFormMandatTantiemes').value) || 0
  };

  if (id) {
    const index = appData.members.findIndex(m => m.id === id);
    if (index !== -1) appData.members[index] = { ...appData.members[index], ...memData };
  } else {
    appData.members.push({ id: 'mem_' + Date.now(), ...memData });
  }

  closeModal('memberModal');
  persistData();
}

function deleteMember(id) {
  const m = appData.members.find(x => x.id === id);
  if (!m) return;
  if (confirm(`Supprimer "${m.name}" ?`)) {
    appData.members = appData.members.filter(x => x.id !== id);
    persistData();
  }
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
function exportDataJson() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(appData, null, 2));
  const downloadAnchor = document.createElement('a');
  const filename = `Votes_AG_FLOREAL_25_NOV_2026.json`;
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", filename);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
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

  const csPerso = appData.members.reduce((sum, m) => sum + (Number(m.tantiemes) || 0), 0);
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

  // 1. Grille des Membres CS
  if (appData.members.length === 0) {
    pouvoirsGrid.innerHTML = `<div style="grid-column: 1/-1; padding:1.5rem; text-align:center; color:var(--gray-500); background:white; border-radius:8px;">Aucun membre du Conseil Syndical enregistré.</div>`;
  } else {
    pouvoirsGrid.innerHTML = appData.members.map(m => {
      const assigned = m._assignedCopros || [];
      const perso = Number(m.tantiemes) || 0;
      const mand = m.mandatTantiemes || 0;
      const tot = m._totalVoix || (perso + mand);
      const isSafe = m._isLegalSafe !== false;
      const cardClass = assigned.length === 0 ? 'no-mandat' : (isSafe ? 'legal-safe' : 'legal-warning');
      const badgeClass = assigned.length === 0 ? 'neutral' : (isSafe ? 'safe' : 'warning');
      const badgeText = assigned.length === 0 ? '0 mandat' : (isSafe ? `🟢 ${m._nbMandats} mandat(s) : Conforme` : `🔴 Alerte Art. 22`);

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

  select.innerHTML = appData.members.map(m => {
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
  const search = (document.getElementById('pouvoirMandantSearch')?.value || '').toLowerCase();
  const select = document.getElementById('pouvoirMandantSelect');
  const copros = (appData.coproprietaires || []).slice().sort((a, b) => a.nom.localeCompare(b.nom));

  const filtered = copros.filter(c => (c.nom + ' ' + (c.lots || '')).toLowerCase().includes(search));
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

  const sorted = appData.members.slice().sort((a, b) => {
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
  const otherMembers = appData.members.filter(m => m.id !== c.mandataireMemberId);

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

  const candidates = appData.members.filter(m => m.id !== c?.mandataireMemberId);
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
    const candidates = appData.members.slice().sort((a, b) => {
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
  let targetLabel = '';
  let passerelleSeuil = 0;
  let currentVal = hasNumbers ? pour : csTotalVoix;
  let percent = 0;
  let messageTactique = '';
  let alertPasserelleHtml = '';

  if (isArt24) {
    // Art 24 : Majorité des voix exprimées en salle
    const exprimesActuels = hasNumbers ? (pour + contre) : (totalEnSalle || 1);
    targetSeuil = Math.floor(exprimesActuels / 2) + 1;
    targetLabel = `Art. 24 (Majorité simple) : > 50% des exprimés en salle (~${targetSeuil} voix)`;
    percent = exprimesActuels > 0 ? Math.min(100, Math.round((currentVal / exprimesActuels) * 100)) : 0;

    if (csTotalVoix >= targetSeuil) {
      messageTactique = `<span class="badge-force-cs-ok">🟢 Force CS suffisante :</span> <span class="tactique-desc">Le CS détient <strong>${csTotalVoix}</strong> voix, soit plus que les <strong>${targetSeuil}</strong> nécessaires pour l'adopter !</span>`;
    } else {
      const besoin = Math.max(0, targetSeuil - csTotalVoix);
      messageTactique = `<span class="tactique-desc">Force CS : <strong>${csTotalVoix}</strong> voix. Il manque <strong>${besoin}</strong> voix parmi les présents pour l'emporter.</span>`;
    }
  } else if (isArt25) {
    // Art 25 : Majorité de tous les copropriétaires (50% de totalCopro)
    targetSeuil = Math.floor(totalCopro / 2) + 1; // 48 740
    passerelleSeuil = Math.ceil(totalCopro / 3); // 32 493
    targetLabel = `Art. 25 (Majorité absolue) : ${targetSeuil} voix requises (>50% de l'immeuble)`;
    percent = totalCopro > 0 ? Math.min(100, Math.round((currentVal / totalCopro) * 100)) : 0;
    const besoin25 = Math.max(0, targetSeuil - csTotalVoix);
    const besoinPasserelle = Math.max(0, passerelleSeuil - csTotalVoix);

    if (hasNumbers && pour >= passerelleSeuil && pour < targetSeuil) {
      alertPasserelleHtml = `
        <div class="passerelle-alert-badge">
          🚨 PASSERELLE ART. 25-1 DE DROIT : ${pour} voix >= ${passerelleSeuil} (1/3 atteint). Le syndic DOIT organiser un 2nd vote immédiat à l'Art. 24 !
        </div>
      `;
    }

    messageTactique = `
      <span class="tactique-desc">Force CS : <strong>${csTotalVoix}</strong> voix. Il manque <strong>${besoin25}</strong> voix pour l'Art. 25 (ou <strong>${besoinPasserelle}</strong> voix pour déclencher la passerelle 25-1).</span>
    `;
  } else if (isArt26) {
    targetSeuil = Math.ceil((totalCopro * 2) / 3); // 2/3
    targetLabel = `Art. 26 (Double majorité) : ~${targetSeuil} voix requises (2/3 de l'immeuble)`;
    percent = totalCopro > 0 ? Math.min(100, Math.round((currentVal / totalCopro) * 100)) : 0;
    const besoin26 = Math.max(0, targetSeuil - csTotalVoix);
    messageTactique = `<span class="tactique-desc">Force CS : <strong>${csTotalVoix}</strong> voix. Il manque <strong>${besoin26}</strong> voix pour atteindre les 2/3.</span>`;
  }

  const fillClass = percent >= 50 ? 'success' : (percent >= 33 ? 'warning' : '');

  return `
    <div class="majority-gauge-container">
      <div class="gauge-info-row">
        <span class="gauge-target-label">🎯 ${targetLabel}</span>
        <span class="gauge-force-label">${hasNumbers ? `Scrutin : ${pour} POUR` : `Force CS : ${csTotalVoix}`} (${percent}%)</span>
      </div>

      <div class="gauge-track">
        <div class="gauge-bar-fill ${fillClass}" style="width: ${percent}%;"></div>
        ${isArt25 ? `
          <div class="gauge-marker" style="left: 33.3%; background:#f59e0b;" title="Seuil 1/3 Passerelle Art. 25-1">
            <span class="gauge-marker-label passerelle-label">1/3 (Passerelle)</span>
          </div>
        ` : ''}
        <div class="gauge-marker" style="left: 50%;" title="Seuil d'adoption (50%)">
          <span class="gauge-marker-label">Seuil 50%</span>
        </div>
      </div>

      <div class="tactique-msg-row">
        ${messageTactique}
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
    (appData.members || []).forEach(m => {
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

  // Simulateur tactique
  const csTotalVoix = appData.members.reduce((acc, m) => acc + (Number(m.tantiemes) || 0) + (Number(m.mandatTantiemes) || 0), 0);
  const totalEnSalle = appData.config.presentTantiemes || 0;
  const totalCopro = Number(appData.config.totalTantiemes) || 97478;

  const zone = document.getElementById('seanceTactiqueZone');
  if (zone) {
    zone.innerHTML = renderTacticalMajorityGauge(res, totalEnSalle, totalCopro, csTotalVoix);
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
    (c.nom + ' ' + (c.lots || '') + ' ' + (c.mandataire || '')).toLowerCase().includes(query)
  ).slice(0, 6);

  const resMatches = (appData.resolutions || []).filter(r =>
    (r.number + ' ' + r.title + ' ' + (r.csNotes || '')).toLowerCase().includes(query)
  ).slice(0, 4);

  const memMatches = (appData.members || []).filter(m =>
    (m.name + ' ' + (m.lots || '') + ' ' + (m.mandats || '')).toLowerCase().includes(query)
  ).slice(0, 3);

  let html = '';

  if (copros.length > 0) {
    html += `<div style="font-size:0.75rem; font-weight:700; color:var(--primary); padding:0.4rem 0.6rem; text-transform:uppercase;">Copropriétaires & Pouvoirs (${copros.length})</div>`;
    html += copros.map(c => `
      <div class="spotlight-item" onclick="closeModal('spotlightModal'); switchTab('presence'); document.getElementById('searchCoproInput').value='${escapeHtml(c.nom)}'; renderCoproprietaires(appData.config.presentTantiemes, appData.config.totalTantiemes);">
        <div>
          <strong>${escapeHtml(c.nom)}</strong>
          <span style="font-size:0.75rem; color:var(--gray-500); margin-left:0.3rem;">[${escapeHtml(c.lots || 'Sans lot')}] • Statut : <strong>${c.statut}</strong> ${c.mandataire ? `(➔ ${escapeHtml(c.mandataire)})` : ''}</span>
        </div>
        <span class="tantieme-pill">${c.tantiemes} tantièmes</span>
      </div>
    `).join('');
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

// Raccourcis clavier (Spotlight & Navigation séance)
window.addEventListener('keydown', (e) => {
  if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
    e.preventDefault();
    openSpotlightModal();
  }
  if (e.key === 'ArrowRight' && isModeSeanceActive && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
    naviguerSeance(1);
  }
  if (e.key === 'ArrowLeft' && isModeSeanceActive && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
    naviguerSeance(-1);
  }
});

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
  updateUI();
});
