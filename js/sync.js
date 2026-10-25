/**
 * Module de synchronisation temps réel robuste (WebRTC PeerJS & QR Code)
 * Assure la communication bidirectionnelle Hôte <-> Membres avec relai
 */

let peer = null;
let peerConnections = [];
let isLiveActive = false;
let isHost = false;

const PEER_CONFIG = {
  debug: 1,
  config: {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:global.stun.twilio.com:3478' }
    ]
  }
};

function openLiveSyncModal() {
  openModal('liveSyncModal');
}

// Démarrer en tant qu'Hôte (Ordinateur principal)
function startHostingLive() {
  if (typeof Peer === 'undefined') {
    alert("La bibliothèque de synchronisation PeerJS n'a pas pu être chargée. Vérifiez votre connexion Internet.");
    return;
  }

  const randomId = 'floreal-' + Math.random().toString(36).substr(2, 6);
  peer = new Peer(randomId, PEER_CONFIG);

  peer.on('open', (id) => {
    isLiveActive = true;
    isHost = true;
    document.getElementById('liveSetupZone').style.display = 'none';
    document.getElementById('liveActiveZone').style.display = 'block';
    document.getElementById('liveSessionCodeDisplay').innerText = id;
    document.getElementById('liveStatusBar').classList.add('active');
    document.getElementById('liveStatusText').innerText = `Session en direct active (Hôte : ${id})`;

    const isLocalFile = (window.location.protocol === 'file:');
    const warningEl = document.getElementById('fileProtocolWarning');
    if (warningEl) {
      warningEl.style.display = isLocalFile ? 'block' : 'none';
    }

    const qrcodeContainer = document.getElementById('qrcodeContainer');
    qrcodeContainer.innerHTML = '';
    const currentUrl = window.location.href.split('?')[0] + '?room=' + id;
    
    document.getElementById('liveUrlDisplay').innerText = isLocalFile 
      ? "⚠️ Fichier local : Utilisez le lien GitHub Pages ou LANCER_SERVEUR.bat pour les mobiles"
      : currentUrl;

    new QRCode(qrcodeContainer, {
      text: currentUrl,
      width: 160,
      height: 160,
      colorDark: "#1e3a8a",
      colorLight: "#ffffff"
    });

    showToast(`Session hôte démarrée : ${id}`, "success");
  });

  // Réception de connexions entrantes des membres (smartphones / tablettes)
  peer.on('connection', (conn) => {
    setupConnectionHandlers(conn, true);
  });

  peer.on('error', (err) => {
    console.error("Erreur PeerJS Hôte :", err);
    showToast("Erreur de connexion : " + err.type, "danger");
  });
}

// Rejoindre une session existante (Membre sur smartphone ou autre PC)
function joinLiveSession(roomId) {
  const code = roomId || document.getElementById('joinRoomCode').value.trim();
  if (!code) {
    alert("Veuillez saisir un code de session.");
    return;
  }

  peer = new Peer(PEER_CONFIG);

  peer.on('open', (myId) => {
    console.log("Mon ID client PeerJS :", myId, "Connexion vers l'hôte :", code);
    const conn = peer.connect(code, { reliable: true });
    isHost = false;

    setupConnectionHandlers(conn, false);

    document.getElementById('liveSetupZone').style.display = 'none';
    document.getElementById('liveActiveZone').style.display = 'block';
    document.getElementById('liveSessionCodeDisplay').innerText = "Connecté à l'hôte : " + code;
    document.getElementById('liveStatusBar').classList.add('active');
    document.getElementById('liveStatusText').innerText = `Connecté en direct à l'AG (${code})`;
    closeModal('liveSyncModal');
  });

  peer.on('error', (err) => {
    console.error("Erreur PeerJS Client :", err);
    showToast("Impossible de se connecter à la session " + code, "danger");
  });
}

// Configuration universelle des écouteurs de connexion
function setupConnectionHandlers(conn, isIncoming) {
  const onReady = () => {
    console.log("Connexion active avec le pair :", conn.peer);
    if (!peerConnections.some(c => c.peer === conn.peer)) {
      peerConnections.push(conn);
    }
    isLiveActive = true;
    updateConnectedPeersCount();
    showToast(isIncoming ? "📱 Nouvel appareil connecté !" : "✅ Connecté à l'ordinateur principal !", "success");

    // Si on est l'hôte, on transmet l'état actuel complet des votes
    if (isHost) {
      setTimeout(() => {
        if (conn.open) {
          conn.send({ type: 'SYNC_FULL_DATA', data: appData });
        }
      }, 300);
    }
  };

  if (conn.open) {
    onReady();
  } else {
    conn.on('open', onReady);
  }

  conn.on('data', (msg) => {
    console.log("Donnée reçue via le réseau :", msg);
    handleIncomingPeerMessage(msg, conn);
  });

  conn.on('close', () => {
    console.log("Déconnexion du pair :", conn.peer);
    peerConnections = peerConnections.filter(c => c.peer !== conn.peer);
    updateConnectedPeersCount();
    showToast("Un appareil s'est déconnecté.", "warning");
  });

  conn.on('error', (err) => {
    console.error("Erreur de connexion pair :", err);
  });
}

// Diffusion d'une mise à jour vers tous les pairs connectés
function broadcastLiveUpdate(msg) {
  let sentCount = 0;
  peerConnections.forEach(conn => {
    if (conn && conn.open) {
      try {
        conn.send(msg);
        sentCount++;
      } catch (e) {
        console.error("Erreur envoi message au pair", conn.peer, e);
      }
    }
  });
  console.log(`Message diffusé à ${sentCount} appareil(s) :`, msg.type);
}

// Traitement des données reçues en temps réel
function handleIncomingPeerMessage(msg, senderConn) {
  if (msg.type === 'SYNC_FULL_DATA') {
    appData = msg.data;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
    updateUI();
    showToast("Votes synchronisés en direct !", "info");

    // Si nous sommes l'hôte, on relaie aux autres téléphones/tablettes
    if (isHost) {
      peerConnections.forEach(c => {
        if (c.peer !== senderConn?.peer && c.open) {
          c.send(msg);
        }
      });
    }
  } else if (msg.type === 'QUICK_VOTE') {
    const res = appData.resolutions.find(r => r.id === msg.id);
    if (res) {
      res.status = msg.status;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
      updateUI();
      showToast(`Résolution ${res.number} : ${msg.status}`, "success");

      // Relai de l'Hôte vers tous les autres appareils
      if (isHost) {
        peerConnections.forEach(c => {
          if (c.peer !== senderConn?.peer && c.open) {
            c.send(msg);
          }
        });
      }
    }
  }
}

function updateConnectedPeersCount() {
  const count = peerConnections.length + 1;
  const countEl = document.getElementById('livePeerCount');
  if (countEl) countEl.innerText = `Connecté(s) : ${count}`;
}

function stopLiveSync() {
  if (peer) peer.destroy();
  peer = null;
  peerConnections = [];
  isLiveActive = false;
  isHost = false;
  document.getElementById('liveStatusBar').classList.remove('active');
  document.getElementById('liveSetupZone').style.display = 'block';
  document.getElementById('liveActiveZone').style.display = 'none';
  showToast("Session en direct fermée.", "warning");
}

// Toast notification visuelle
function showToast(message, type = "info") {
  let toastContainer = document.getElementById('toastContainer');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toastContainer';
    toastContainer.style.cssText = "position:fixed; bottom:20px; right:20px; z-index:9999; display:flex; flex-direction:column; gap:8px;";
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  const bgColors = {
    success: "#16a34a",
    danger: "#dc2626",
    warning: "#d97706",
    info: "#1e3a8a"
  };

  toast.style.cssText = `
    background: ${bgColors[type] || '#1e3a8a'};
    color: white;
    padding: 10px 16px;
    border-radius: 8px;
    font-size: 0.85rem;
    font-weight: 600;
    box-shadow: 0 4px 12px rgba(0,0,0,0.25);
    opacity: 0;
    transform: translateY(10px);
    transition: all 0.25s ease-out;
  `;
  toast.innerText = message;
  toastContainer.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  });

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => { toast.remove(); }, 300);
  }, 3500);
}

// Détection automatique du paramètre ?room= dans l'URL
window.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const roomParam = urlParams.get('room');
  if (roomParam) {
    setTimeout(() => { joinLiveSession(roomParam); }, 600);
  }
});
