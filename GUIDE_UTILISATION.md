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

---

## 4. ✉️ Administration des Pouvoirs & Mandats au dernier moment

### Pourquoi ce module est indispensable ?
À l'approche de l'AG ou le jour J à l'entrée de la salle, vous recevez des procurations (par email, SMS, courrier ou remises en main propre).
L'application intègre un **module complet d'administration des pouvoirs** conforme à l'**Article 22 de la loi du 10 juillet 1965** :

1. **Bouton doré rapide en haut `✉️ + Enregistrer un Pouvoir` :**
   - Accessible partout en 1 clic.
   - Sélectionnez le copropriétaire mandant dans la liste prédictive (ses lots et tantièmes s'affichent automatiquement).
   - Choisissez à qui confier le pouvoir :
     - **Membre du Conseil Syndical** : le bouton magique `✨ Suggérer automatiquement` choisit le membre CS le plus disponible ayant le moins de mandats.
     - **Pouvoir en blanc** : enregistré sans nom de mandataire pour être réparti plus tard.
     - **Autre mandataire externe**.
   - Notez d'éventuelles consignes de vote spécifiques (ex: *"POUR clim, CONTRE clôture"*).
   - Cliquez sur **« Enregistrer le pouvoir »** : les tantièmes en salle, la présence et les cumuls de voix du CS sont instantanément actualisés.

2. **Règle légale stricte (Art. 22) contrôlée en temps réel :**
   - Un mandataire ne peut détenir plus de **3 délégations de vote**, *SAUF SI* le cumul de ses voix personnelles et de ses mandats ne dépasse pas **10% des voix du syndicat** (soit max **9 747 tantièmes** sur 97 478).
   - Chaque membre du CS dispose d'une jauge visuelle (🟢 Conforme / 🔴 Risque de dépassement) pour vous garantir **zéro risque d'annulation de l'AG**.

3. **Actions directes dans l'onglet `🚪 Émargement & Départs` :**
   - Sur chaque ligne de copropriétaire, le bouton **`✉️ Pouvoir`** permet d'attribuer ou de modifier le mandat en 2 secondes.
   - **Arrivée surprise d'un copropriétaire en salle :** Si un copropriétaire ayant donné pouvoir arrive finalement en personne, cliquez sur `Présent` : l'application vous alerte et révoque automatiquement le pouvoir conformément à la loi, sans créer de doublon de voix !

4. **Onglet dédié `✉️ Pouvoirs & Mandats` :**
   - Vue en cartes de tous les membres du CS avec la liste des mandats reçus sous forme de badges cliquables.
   - Bouton **`🔄 Transférer`** sur chaque mandat pour réassigner un pouvoir d'un membre à un autre en 1 clic en cas d'absence ou pour rééquilibrer les voix.
   - Bouton **`✨ Répartir automatiquement les pouvoirs en blanc`** pour distribuer équitablement les pouvoirs reçus sans nom sur les membres disponibles.

---

## 5. 🎯 Mode Séance Focus en direct (Spécial Smartphone & AG)

En assemblée, faire défiler 28 résolutions sur un petit écran de smartphone est fastidieux. Cliquez sur le bouton bleu **`▶ Mode Séance`** :
1. **Affichage épuré grand écran** : seule la résolution en débat est mise en avant.
2. **Consigne géante du CS** : badge bien visible (`✅ POUR`, `❌ CONTRE`, `⚠️ ABSTENTION`, `ℹ️ LIBRE`) et arguments chocs rédigés par le CS.
3. **Synchronisation automatique** : dès que l'ordinateur principal avance à la résolution suivante (`Suivante ➡`), **tous les smartphones des membres connectés basculent automatiquement sur la même résolution** !
4. **Navigation au clavier** : utilisez les touches `Flèche Gauche` et `Flèche Droite` de votre PC portable pour passer d'une résolution à l'autre en un éclair.

---

## 6. ⚖️ Simulateur Tactique de Majorité & Alerte Passerelle Art. 25-1

Sur chaque résolution, une **jauge visuelle animée** calcule en temps réel :
- **Pour l'Article 24 (Majorité simple) :** Compare la force du CS avec les voix exprimées en salle, et vous indique si la résolution est déjà acquise ou combien de voix extérieures il vous manque.
- **Pour l'Article 25 (Majorité absolue - 48 740 voix) :** Vous montre l'avancement vers les 50% de l'immeuble.
- **Alerte Passerelle Art. 25-1 automatique :** Si une résolution soumise à l'Art. 25 recueille au moins 1/3 des voix (32 493 tantièmes), un bandeau clignotant vous alerte :  
  *« 🚨 PASSERELLE ART. 25-1 DE DROIT : Le syndic DOIT organiser un 2nd vote immédiat à l'Art. 24 ! »*
- **Horodatage officiel :** Dès qu'un vote est enregistré, l'heure exacte est horodatée (`⏱️ Votée à 18h42`) pour prouver l'ordre des délibérations.

---

## 7. 🔍 Recherche Universelle Rapide (Spotlight)

- Cliquez sur le bouton **`🔍 Chercher`** ou appuyez simplement sur la touche **`/`** de votre clavier.
- Tapez un nom de copropriétaire, un numéro de lot, un nom de membre CS ou un numéro de résolution : accédez au dossier complet en une fraction de seconde !

---

## 8. 🌙 Mode Sombre & 📄 Relevé Officiel PV Miroir de fin d'AG

- **Mode Sombre (Bouton `🌙` dans l'en-tête) :** Économise la batterie de vos smartphones OLED pendant les 3-4 heures de l'assemblée et reste discret dans la salle.
- **Relevé Officiel PV Miroir (Bouton `📄 Relevé PV CS`) :** À la fin de l'AG, générez en 1 clic le rapport complet officiel du Conseil Syndical (synthèse de quorum, départs horodatés, résultats exacts de chaque scrutin, opposants consignés) imprimable ou enregistrable en PDF pour cadrer le syndic dès le lendemain !


