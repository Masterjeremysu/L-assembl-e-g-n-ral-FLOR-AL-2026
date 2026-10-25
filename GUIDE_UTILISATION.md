# 🏢 Guide d'Utilisation : Application Suivi AG & Votes CS 2026

## 1. 📄 Démarrage à blanc & Importation facile

L'application démarre désormais **entièrement vierge**, prête pour votre propre copropriété :

### Comment importer votre ordre du jour en 10 secondes ?
1. Ouvrez votre convocation d'AG reçue du syndic (fichier PDF ou Word).
2. Sélectionnez et copiez le texte de l'ordre du jour (ex: `1. Approbation des comptes... 2. Quitus...`).
3. Dans l'application, cliquez sur le bouton en haut **📥 Importer l'ordre du jour**.
4. Collez votre texte et cliquez sur **« Créer les résolutions »**.
5. L'application découpe automatiquement chaque résolution et pré-remplit les majorités légales correspondantes (Article 24, 25, 26).

*(Si vous souhaitez voir une démonstration complète avant de saisir vos données, vous pouvez cliquer sur « Charger des résolutions types d'exemple »).*

---

## 2. 💾 Persistance des données (Sécurité & Sauvegardes)

- **Sauvegarde automatique locale** : Chaque clic (vote, modification, ajout de membre) est instantanément mémorisé dans le stockage permanent de votre navigateur (`localStorage`). Même si vous fermez la page ou redémarrez votre ordinateur, **rien n'est perdu**.
- **Sauvegarde de secours (Bouton Exporter)** : En un clic sur **💾 Exporter**, vous téléchargez un fichier `.json` que vous pouvez conserver sur une clé USB ou vous envoyer par email.

---

## 3. 📱 Comment l'utiliser GRATUITEMENT à plusieurs (PC, tablettes, smartphones) ?

Il existe deux manières très simples et 100% gratuites :

### Méthode A : Synchronisation en direct par QR Code (WebRTC / Peer-to-Peer) — Le plus moderne ⚡
L'application intègre désormais la technologie **WebRTC PeerJS** (100% gratuite, sans inscription, sans carte bancaire) :

1. Sur l'ordinateur principal (ex: le président du CS), cliquez sur le bouton vert en haut : **« Direct Multi-écrans (Gratuit) »**.
2. Cliquez sur **« Démarrer la session en direct »**.
3. Un **QR Code** et un **Code de session** s'affichent sur votre écran.
4. Les autres membres du CS sortent leur smartphone ou tablette :
   - Ils ouvrent l'application et saisissent le code de session (ou scannent le QR code).
5. **Résultat en direct** : Dès qu'une résolution est votée ou modifiée sur un appareil, **tous les écrans des membres du CS se mettent à jour instantanément en temps réel** !

### Méthode B : Héberger l'application en ligne gratuitement (En 2 minutes)
Si vous voulez que chacun y accède depuis n'importe où via une adresse Internet simple (ex: `https://notre-copro-2026.netlify.app`) :
- Déposez simplement le fichier `index.html` sur **[Netlify Drop](https://app.netlify.com/drop)** (glisser-déposer gratuit sans ligne de code) ou **GitHub Pages**.
- Vous obtenez un lien web sécurisé (HTTPS) accessible sur tous les téléphones et ordinateurs.

### Méthode C : Mode Déconnecté / Clé USB
Si la salle de réunion n'a pas de réseau Internet :
- Copiez le fichier `index.html` sur une clé USB et donnez-le aux membres du CS.
- Chacun peut l'ouvrir sur son PC/tablette sans connexion Internet.
