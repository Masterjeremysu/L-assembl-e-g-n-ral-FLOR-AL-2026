/**
 * Application principale - Suivi AG & Votes Conseil Syndical
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
  if (confirm("Réinitialiser avec toutes les résolutions de votre convocation du 25 novembre 2026 ?")) {
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
  document.getElementById('headerSubtitle').innerText = `${appData.config.coproName} - AG du ${formatDate(appData.config.agDate)}`;
  document.getElementById('printAgTitle').innerText = `${appData.config.coproName} - Assemblée Générale Annuelle`;
  document.getElementById('printAgMeta').innerText = `Mercredi 25 novembre 2026 à 18h00 - Sassenage - Relevé de décisions & Votes du CS`;

  // Stats calculation
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

  // CS Weight
  const csPerso = appData.members.reduce((acc, m) => acc + (Number(m.tantiemes) || 0), 0);
  const csMandats = appData.members.reduce((acc, m) => acc + (Number(m.mandatTantiemes) || 0), 0);
  const csTotal = csPerso + csMandats;
  const totalTant = Number(appData.config.totalTantiemes) || 10000;
  const csPct = totalTant > 0 ? ((csTotal / totalTant) * 100).toFixed(1) : '0';

  document.getElementById('statCsWeight').innerText = `${csTotal} / ${totalTant}`;
  document.getElementById('statCsPercent').innerText = `${csPct}% des tantièmes totaux`;

  // Badges
  document.getElementById('badgeVotesCount').innerText = `${voted}/${total}`;
  document.getElementById('badgePresenceCount').innerText = appData.coproprietaires ? appData.coproprietaires.length : 0;
  document.getElementById('badgeMembersCount').innerText = appData.members.length;

  renderResolutions();
  renderCoproprietaires(totalTant);
  renderMembers(csPerso, csMandats, csTotal, totalTant);

  // Settings
  document.getElementById('cfgCoproname').value = appData.config.coproName || '';
  document.getElementById('cfgAgDate').value = appData.config.agDate || '';
  document.getElementById('cfgTotalTantiemes').value = appData.config.totalTantiemes || 10000;
  document.getElementById('cfgPresentTantiemes').value = appData.config.presentTantiemes || '';
}

// Render Resolutions
function renderResolutions() {
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
            </div>
          </div>
          <div class="no-print" style="display:flex; gap:0.4rem;">
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
            <strong>📝 Séance :</strong> ${escapeHtml(r.notesSeance)}
          </div>
        ` : ''}

        ${!isSansVote ? `
          <div class="resolution-vote-zone">
            <div class="vote-quick-actions no-print">
              <span style="font-size:0.82rem; font-weight:600; color:var(--gray-500); margin-right:0.3rem;">Vote réel :</span>
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

            <div style="font-size:0.82rem; color:var(--gray-500); display:flex; gap:0.8rem;">
              ${r.tantiemesPour ? `<span>👍 Pour : <strong>${escapeHtml(r.tantiemesPour)}</strong></span>` : ''}
              ${r.tantiemesContre ? `<span>👎 Contre : <strong>${escapeHtml(r.tantiemesContre)}</strong></span>` : ''}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }).join('');
}

// Render Copropriétaires (Présences & Pouvoirs)
function renderCoproprietaires(totalTant) {
  const tbody = document.getElementById('coproTableBody');
  if (!tbody) return;

  const list = appData.coproprietaires || [];
  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:1.5rem; color:var(--gray-500);">
      Aucun copropriétaire renseigné pour le moment.<br>
      <button class="btn btn-sm btn-primary" style="margin-top:0.6rem;" onclick="openImportCoproModal()">📥 Importer la liste des copropriétaires & tantièmes</button>
    </td></tr>`;
    document.getElementById('footPresentTantiemes').innerText = "0";
    return;
  }

  let totalPresents = 0;
  let countPresents = 0;

  tbody.innerHTML = list.map(c => {
    const isPresent = (c.statut === 'PRESENT' || c.statut === 'POUVOIR' || c.statut === 'VPC');
    if (isPresent) {
      totalPresents += Number(c.tantiemes) || 0;
      countPresents++;
    }

    const badgeMap = {
      'PRESENT': '<span class="badge-present">Présent</span>',
      'POUVOIR': `<span class="badge-pouvoir">Pouvoir à : ${escapeHtml(c.mandataire || '?')}</span>`,
      'VPC': '<span class="badge-vpc">Vote Corresp.</span>',
      'ABSENT': '<span class="badge-absent">Absent</span>'
    };

    return `
      <tr>
        <td><strong>${escapeHtml(c.nom)}</strong></td>
        <td>${escapeHtml(c.lots || '-')}</td>
        <td><span class="tantieme-pill">${c.tantiemes || 0}</span></td>
        <td>${badgeMap[c.statut] || c.statut}</td>
        <td>${escapeHtml(c.notes || '-')}</td>
        <td class="no-print" style="text-align:right;">
          <button class="btn btn-secondary btn-sm" onclick="editCopro('${c.id}')">✏️</button>
          <button class="btn btn-secondary btn-sm" onclick="deleteCopro('${c.id}')" style="color:var(--danger)">🗑️</button>
        </td>
      </tr>
    `;
  }).join('');

  document.getElementById('footPresentTantiemes').innerText = `${totalPresents} / ${totalTant} (${((totalPresents / totalTant) * 100).toFixed(1)}%) - ${countPresents} présents/représentés`;
  // Auto-sync into config if 0
  if (!appData.config.presentTantiemes || appData.config.presentTantiemes === 0) {
    appData.config.presentTantiemes = totalPresents;
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
  }
}

// Modal management
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

function openImportCoproModal() {
  document.getElementById('coproImportRaw').value = '';
  openModal('coproImportModal');
}

function processCoproImport() {
  const text = document.getElementById('coproImportRaw').value.trim();
  if (!text) {
    alert("Veuillez coller la liste des copropriétaires.");
    return;
  }

  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  let countAdded = 0;
  if (!appData.coproprietaires) appData.coproprietaires = [];

  lines.forEach(line => {
    // Detect formats: "Nom;Lot;Tantiemes" or "Nom \t Lot \t Tantiemes" or "Nom, 120 tantièmes"
    let parts = line.split(/[;\t]/);
    let nom = parts[0]?.trim() || line;
    let lots = parts[1]?.trim() || "";
    let tantiemes = Number(parts[2]?.trim()) || 0;

    // Regex check for tantiemes in text if not tab-separated
    if (parts.length === 1) {
      const matchTant = line.match(/(\d+)\s*(tanti[eè]mes|milli[eè]mes|[\/]\d+)/i);
      if (matchTant) {
        tantiemes = Number(matchTant[1]);
        nom = line.replace(matchTant[0], '').trim();
      }
    }

    appData.coproprietaires.push({
      id: 'copro_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      nom: nom,
      lots: lots,
      tantiemes: tantiemes,
      statut: 'PRESENT',
      mandataire: '',
      notes: ''
    });
    countAdded++;
  });

  closeModal('coproImportModal');
  persistData();
  alert(`${countAdded} copropriétaire(s) importé(s) avec succès !`);
}

// Config Save
function saveConfig() {
  appData.config.coproName = document.getElementById('cfgCoproname').value.trim();
  appData.config.agDate = document.getElementById('cfgAgDate').value;
  appData.config.totalTantiemes = Number(document.getElementById('cfgTotalTantiemes').value) || 10000;
  appData.config.presentTantiemes = Number(document.getElementById('cfgPresentTantiemes').value) || 0;
  persistData();
}

function resetFilters() {
  document.getElementById('searchInput').value = '';
  document.getElementById('filterStatus').value = 'ALL';
  document.getElementById('filterCsConsigne').value = 'ALL';
  renderResolutions();
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

// Initialization
document.addEventListener('DOMContentLoaded', () => {
  updateUI();
});
