/**
 * Module de synchronisation temps réel (WebRTC PeerJS & QR Code)
 * Fonctionne 100% gratuitement sans serveur payant
 */

let peer = null;
let peerConnections = [];
let isLiveActive = false;
let isHost = false;

function openLiveSyncModal() {
  openModal('liveSyncModal');
}

function startHostingLive() {
  if (typeof Peer === 'undefined') {
    alert("La bibliothèque de synchronisation PeerJS n'a pas pu être chargée. Vérifiez votre connexion Internet.");
    return;
  }

  const randomId = 'floreal-' + Math.random().toString(36).substr(2, 6);
  peer = new Peer(randomId);

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
      ? "⚠️ URL locale (inaccessible aux autres appareils sans LANCER_SERVEUR.bat ou GitHub Pages)"
      : currentUrl;

    new QRCode(qrcodeContainer, {
      text: currentUrl,
      width: 160,
      height: 160,
      colorDark: "#1e3a8a",
      colorLight: "#ffffff"
    });
  });

  peer.on('connection', (conn) => {
    peerConnections.push(conn);
    updateConnectedPeersCount();

    // Envoi initial des données complètes au nouveau membre connecté
    conn.on('open', () => {
      conn.send({ type: 'SYNC_FULL_DATA', data: appData });
    });

    // Écoute des modifications transmises par les membres
    conn.on('data', (msg) => {
      handleIncomingPeerMessage(msg);
    });

    conn.on('close', () => {
      peerConnections = peerConnections.filter(c => c !== conn);
      updateConnectedPeersCount();
    });
  });

  peer.on('error', (err) => {
    console.error("PeerJS error:", err);
  });
}

function joinLiveSession(roomId) {
  const code = roomId || document.getElementById('joinRoomCode').value.trim();
  if (!code) {
    alert("Veuillez saisir un code de session.");
    return;
  }

  peer = new Peer();
  peer.on('open', () => {
    const conn = peer.connect(code);
    isLiveActive = true;
    isHost = false;

    conn.on('open', () => {
      peerConnections = [conn];
      document.getElementById('liveSetupZone').style.display = 'none';
      document.getElementById('liveActiveZone').style.display = 'block';
      document.getElementById('liveSessionCodeDisplay').innerText = "Connecté à l'hôte : " + code;
      document.getElementById('liveStatusBar').classList.add('active');
      document.getElementById('liveStatusText').innerText = `Connecté en direct à l'AG (${code})`;
      closeModal('liveSyncModal');
    });

    conn.on('data', (msg) => {
      handleIncomingPeerMessage(msg);
    });

    conn.on('close', () => {
      alert("La connexion à l'ordinateur principal a été perdue.");
      stopLiveSync();
    });
  });

  peer.on('error', (err) => {
    alert("Impossible de se connecter à la session " + code + ". Vérifiez le code saisi.");
  });
}

function broadcastLiveUpdate(msg) {
  peerConnections.forEach(conn => {
    if (conn && conn.open) conn.send(msg);
  });
}

function handleIncomingPeerMessage(msg) {
  if (msg.type === 'SYNC_FULL_DATA') {
    appData = msg.data;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
    updateUI();
  }
}

function updateConnectedPeersCount() {
  const count = peerConnections.length + 1;
  document.getElementById('livePeerCount').innerText = `Connecté(s) : ${count}`;
}

function stopLiveSync() {
  if (peer) peer.destroy();
  peer = null;
  peerConnections = [];
  isLiveActive = false;
  document.getElementById('liveStatusBar').classList.remove('active');
  document.getElementById('liveSetupZone').style.display = 'block';
  document.getElementById('liveActiveZone').style.display = 'none';
}

// Détection automatique du paramètre ?room= dans l'URL (scan de QR code)
window.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const roomParam = urlParams.get('room');
  if (roomParam) {
    setTimeout(() => { joinLiveSession(roomParam); }, 600);
  }
});
