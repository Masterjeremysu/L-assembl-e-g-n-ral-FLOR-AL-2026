/**
 * Système UI Moderne & Ergonomique - AG Le Floréal 2026
 * Remplace confirm(), alert(), prompt() par des composants natifs App-Like
 * Toasts flottants animés + Dialogues asynchrones
 */

(function() {
  // Conteneur de Dialogues
  let dialogBackdrop = null;

  function ensureDialogDom() {
    if (dialogBackdrop) return dialogBackdrop;

    dialogBackdrop = document.createElement('div');
    dialogBackdrop.id = 'appDialogBackdrop';
    dialogBackdrop.className = 'app-dialog-backdrop';
    dialogBackdrop.innerHTML = `
      <div class="app-dialog-card" role="dialog" aria-modal="true">
        <div class="app-dialog-header">
          <div id="appDialogIconBadge" class="app-dialog-icon-badge info">ℹ️</div>
          <div class="app-dialog-title-group">
            <div id="appDialogMeta" class="app-dialog-meta">Assemblée Générale 2026</div>
            <h3 id="appDialogTitle" class="app-dialog-title">Titre du message</h3>
          </div>
        </div>
        <div id="appDialogBody" class="app-dialog-body">Contenu du message</div>
        <div id="appDialogInputWrap" class="app-dialog-input-wrap" style="display:none;">
          <input type="text" id="appDialogInput" class="app-dialog-input" />
        </div>
        <div id="appDialogActions" class="app-dialog-actions">
          <button type="button" id="appDialogBtnCancel" class="app-btn-dialog cancel">Annuler</button>
          <button type="button" id="appDialogBtnConfirm" class="app-btn-dialog confirm-primary">Confirmer</button>
        </div>
      </div>
    `;
    document.body.appendChild(dialogBackdrop);
    return dialogBackdrop;
  }

  /**
   * Boîte de confirmation moderne asynchrone (remplace confirm())
   */
  window.appConfirm = function({
    title = "Confirmation",
    message = "Voulez-vous confirmer cette action ?",
    confirmText = "Confirmer",
    cancelText = "Annuler",
    type = "warning", // 'warning' | 'danger' | 'info' | 'success'
    meta = "Assemblée Générale 2026"
  } = {}) {
    return new Promise((resolve) => {
      const backdrop = ensureDialogDom();
      const iconMap = {
        warning: '⚠️',
        danger: '🗑️',
        info: 'ℹ️',
        success: '✅'
      };

      const iconBadge = document.getElementById('appDialogIconBadge');
      iconBadge.className = `app-dialog-icon-badge ${type}`;
      iconBadge.textContent = iconMap[type] || '❓';

      document.getElementById('appDialogMeta').textContent = meta;
      document.getElementById('appDialogTitle').textContent = title;
      document.getElementById('appDialogBody').innerHTML = message;

      const inputWrap = document.getElementById('appDialogInputWrap');
      inputWrap.style.display = 'none';

      const btnCancel = document.getElementById('appDialogBtnCancel');
      const btnConfirm = document.getElementById('appDialogBtnConfirm');

      btnCancel.style.display = 'inline-flex';
      btnCancel.textContent = cancelText;

      btnConfirm.className = `app-btn-dialog confirm-${type === 'danger' ? 'danger' : (type === 'warning' ? 'warning' : 'primary')}`;
      btnConfirm.textContent = confirmText;

      function close(val) {
        backdrop.classList.remove('open');
        btnCancel.onclick = null;
        btnConfirm.onclick = null;
        setTimeout(() => resolve(val), 180);
      }

      btnCancel.onclick = () => close(false);
      btnConfirm.onclick = () => close(true);

      backdrop.classList.add('open');
      btnConfirm.focus();
    });
  };

  /**
   * Boîte d'alerte / information moderne (remplace alert())
   */
  window.appAlert = function({
    title = "Information",
    message = "",
    buttonText = "J'ai compris",
    type = "info",
    meta = "Assemblée Générale 2026"
  } = {}) {
    return new Promise((resolve) => {
      const backdrop = ensureDialogDom();
      const iconMap = {
        warning: '⚠️',
        danger: '❌',
        info: 'ℹ️',
        success: '✅'
      };

      const iconBadge = document.getElementById('appDialogIconBadge');
      iconBadge.className = `app-dialog-icon-badge ${type}`;
      iconBadge.textContent = iconMap[type] || 'ℹ️';

      document.getElementById('appDialogMeta').textContent = meta;
      document.getElementById('appDialogTitle').textContent = title;
      document.getElementById('appDialogBody').innerHTML = message;

      const inputWrap = document.getElementById('appDialogInputWrap');
      inputWrap.style.display = 'none';

      const btnCancel = document.getElementById('appDialogBtnCancel');
      btnCancel.style.display = 'none';

      const btnConfirm = document.getElementById('appDialogBtnConfirm');
      btnConfirm.className = `app-btn-dialog confirm-${type === 'danger' ? 'danger' : 'primary'}`;
      btnConfirm.textContent = buttonText;

      function close() {
        backdrop.classList.remove('open');
        btnConfirm.onclick = null;
        setTimeout(() => resolve(), 180);
      }

      btnConfirm.onclick = () => close();

      backdrop.classList.add('open');
      btnConfirm.focus();
    });
  };

  /**
   * Boîte de saisie moderne (remplace prompt())
   */
  window.appPrompt = function({
    title = "Saisie requise",
    message = "Veuillez renseigner cette information :",
    defaultValue = "",
    placeholder = "",
    confirmText = "Enregistrer",
    cancelText = "Annuler",
    type = "info",
    meta = "Assemblée Générale 2026"
  } = {}) {
    return new Promise((resolve) => {
      const backdrop = ensureDialogDom();
      const iconBadge = document.getElementById('appDialogIconBadge');
      iconBadge.className = `app-dialog-icon-badge ${type}`;
      iconBadge.textContent = '✏️';

      document.getElementById('appDialogMeta').textContent = meta;
      document.getElementById('appDialogTitle').textContent = title;
      document.getElementById('appDialogBody').innerHTML = message;

      const inputWrap = document.getElementById('appDialogInputWrap');
      const input = document.getElementById('appDialogInput');
      inputWrap.style.display = 'block';
      input.value = defaultValue;
      input.placeholder = placeholder;

      const btnCancel = document.getElementById('appDialogBtnCancel');
      const btnConfirm = document.getElementById('appDialogBtnConfirm');

      btnCancel.style.display = 'inline-flex';
      btnCancel.textContent = cancelText;

      btnConfirm.className = 'app-btn-dialog confirm-primary';
      btnConfirm.textContent = confirmText;

      function close(val) {
        backdrop.classList.remove('open');
        btnCancel.onclick = null;
        btnConfirm.onclick = null;
        input.onkeydown = null;
        setTimeout(() => resolve(val), 180);
      }

      btnCancel.onclick = () => close(null);
      btnConfirm.onclick = () => close(input.value.trim());

      input.onkeydown = (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          close(input.value.trim());
        } else if (e.key === 'Escape') {
          e.preventDefault();
          close(null);
        }
      };

      backdrop.classList.add('open');
      setTimeout(() => {
        input.focus();
        input.select();
      }, 50);
    });
  };

  /**
   * Système de Toasts Flottants Haute Qualité (remplace showToast)
   */
  window.appToast = function(message, type = "info", title = null, duration = 3800) {
    let container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      document.body.appendChild(container);
    }

    const iconMap = {
      success: '✅',
      warning: '⚠️',
      danger: '❌',
      error: '❌',
      info: '💡'
    };

    const titleMap = {
      success: 'Opération réussie',
      warning: 'Attention',
      danger: 'Erreur',
      error: 'Erreur',
      info: 'Information'
    };

    const toast = document.createElement('div');
    toast.className = `app-toast ${type}`;

    const icon = iconMap[type] || 'ℹ️';
    const finalTitle = title || titleMap[type] || 'Notification';

    toast.innerHTML = `
      <div class="app-toast-icon">${icon}</div>
      <div class="app-toast-content">
        <div class="app-toast-title">${finalTitle}</div>
        <div class="app-toast-message">${message}</div>
      </div>
      <button type="button" class="app-toast-close" title="Fermer">✕</button>
      <div class="app-toast-progress"></div>
    `;

    container.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    const closeBtn = toast.querySelector('.app-toast-close');
    let timer = null;

    function removeToast() {
      if (timer) clearTimeout(timer);
      toast.classList.remove('show');
      toast.classList.add('hide');
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 260);
    }

    closeBtn.onclick = removeToast;

    // Barre de progression
    const progress = toast.querySelector('.app-toast-progress');
    progress.style.transition = `transform ${duration}ms linear`;
    requestAnimationFrame(() => {
      progress.style.transform = 'scaleX(0)';
    });

    timer = setTimeout(removeToast, duration);
  };

  // Remplacement transparent de l'ancien showToast pour tout le code existant
  window.showToast = function(message, type = "info") {
    window.appToast(message, type);
  };

})();
