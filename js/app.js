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
  else if (tabId === 'members') buttons[2]?.classList.add('active');
  else if (tabId === 'settings') buttons[3]?.classList.add('active');
}

// UI Updates
function updateUI() {
  const totalTant = Number(appData.config.totalTantiemes) || 97478;

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
              ${r.opponentsList && r.opponentsList.length > 0 ? `<span class="badge-anti-fraude">🚨 ${r.opponentsList.length} opposant(s) consigné(s)</span>` : ''}
            </div>
          </div>
          <div class="no-print" style="display:flex; gap:0.4rem;">
            ${!isSansVote ? `
              <button class="btn btn-purple btn-sm" onclick="openScrutinModal('${r.id}')" title="Contrôle des opposants et abstentions">
                🎯 Dépouillement Miroir
              </button>
            ` : ''}
            <button class="btn btn-secondary btn-sm" onclick="editResolution('${r.id}')" title="Modifier">✏️</button>
            <button class="btn btn-secondary btn-sm" onclick="deleteResolution('${r.id}')" title="Supprimer" style="color:var(--danger)">🗑️</button>
          </div>
        </div>

        ${r.description ? `<div class="resolution-desc">${escapeHtml(r.description)}</div>` : ''}

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

        ${hasNumbers ? `
          <div class="depouillement-box">
            <div class="depouillement-header">
              <span>📊 Contrôle des voix (Feuille de vote CS)</span>
              <span style="font-size:0.75rem; color:var(--gray-500);">En salle au moment du vote : ${totalEnSalle} tantièmes</span>
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
              <button class="btn btn-sm btn-success" onclick="setCoproStatut('${c.id}', 'PRESENT')" title="Pointer comme Présent en personne">
                Présent
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
    persistData();
    if (isLiveActive) {
      broadcastLiveUpdate({ type: 'QUICK_VOTE', id: id, status: newStatus });
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
    <div style="max-height:160px; overflow-y:auto; border:1px solid #e2e8f0; border-radius:6px; padding:0.5rem; background:#fff;">
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

  // Détermination automatique du statut
  const totalCopro = Number(appData.config.totalTantiemes) || 97478;
  if (res.majorite === 'Article 24') {
    res.status = (res.tantiemesPour > res.tantiemesContre) ? 'ADOPTEE' : 'REJETEE';
  } else if (res.majorite.includes('Article 25')) {
    const seuil25 = Math.floor(totalCopro / 2) + 1;
    res.status = (res.tantiemesPour >= seuil25) ? 'ADOPTEE' : 'REJETEE';
  }

  closeModal('scrutinModal');
  persistData();
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
    notesSeance: document.getElementById('resFormNotes').value.trim()
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
  updateUI();
});
