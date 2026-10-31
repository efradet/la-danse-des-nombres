# La danse des nombres

Jeu React indépendant pour Elisabeth : trois activités, quinze dessins et une grotte au trésor des nombres. Les illustrations SVG de sirène, licorne, château, princesse et dragon sont originales et interactives.

## Les deux jeux de nombres entendus

- **J’écoute et je choisis** : écouter puis reconnaître le nombre parmi quatre grandes cartes différentes.
- **J’écoute et j’écris** : écouter puis composer le nombre avec le pavé numérique ou le clavier, et valider.
- Huit nombres par dessin. Chaque réponse correcte révèle une partie du tableau ; les erreurs ne retirent rien et ne font pas avancer. Un bouton « Le nombre suivant » permet de garder son rythme.
- Le bouton d'écoute peut être utilisé autant de fois que nécessaire ; une écoute plus lente est disponible. Les réponses deviennent actives après une écoute réussie. Un problème audio affiche un message et autorise un nouvel essai.
- Une fois le dessin terminé, **Mettre dans ma grotte** l'enregistre dans la même collection que les additions. Aucun doublon n'est créé pour la même partie.
- Les paliers sont 0–19, 0–29, 0–49, 0–69 et 0–100. Deux tableaux avec au moins six réponses sur huit trouvées du premier coup permettent de proposer le palier suivant, séparément pour chaque jeu. Réécouter ne retire pas ce crédit. Cette proposition reste facultative ; aucun compte à rebours ni verrouillage des niveaux.
- « Réglages avec un adulte » permet de revenir à un palier plus facile ou d'en choisir un autre. La prononciation par défaut est septante/huitante/nonante ; les variantes avec quatre-vingts ou soixante-dix/quatre-vingt-dix sont disponibles. Ce choix est enregistré dans le navigateur quand son stockage fonctionne.
- Les parties sont conservées pendant les changements de dessin, d'activité et les visites de la grotte. Seuls les tableaux déposés dans la grotte sont conservés après fermeture ou rechargement ; la progression conseillée est calculée à partir de ces trésors.
- 161 enregistrements de nombres sont livrés avec le jeu (voix synthétique française suisse Ariane). Aucun micro ni synthèse vocale en ligne pendant le jeu. Voir `public/audio/numbers/README.md` pour la régénération.

## Jouer sur ce PC

Double-cliquer sur `START-DANSE.cmd`, ou exécuter :

```sh
npm install
npm run dev
```

Ouvrir http://localhost:5183/ et garder le serveur ouvert. Node.js 22.12+ (ou 20.19+) est requis par Vite. `npm run build` prépare `dist` pour un hébergement statique ; `npm run preview` permet de vérifier ce résultat sur le même port après arrêt du serveur de développement.

## Règles

- Choisir librement l'un des cinq thèmes. Les parties en cours restent disponibles quand on change de dessin ou visite la grotte.
- Saisir la somme (de 1 à 18) au clavier ou avec les boutons, puis valider. Un indice facultatif montre des points à compter.
- Une erreur n'autorise aucun coloriage. On peut réessayer sans pénalité ni chronomètre.
- Une bonne réponse donne exactement un pinceau pour une zone blanche portant ce nombre. Les autres zones ne consomment pas le pinceau. La palette est une légende, pas un moyen de contourner les additions.
- Le tableau entièrement peint rejoint automatiquement « Ma grotte », une seule fois par partie. On peut le consulter en grand, puis gagner d'autres tableaux, y compris en rejouant le même dessin.
- Les zones sont utilisables à la souris, au toucher ou au clavier (Tab puis Entrée/Espace). Le bouton d'agrandissement facilite la lecture du dessin.

## Sauvegarde

Seuls les tableaux terminés sont enregistrés dans localStorage, sous une clé dédiée à ce jeu. Les peintures restent dans ce navigateur, sur cet appareil et pour cette adresse ; il n'y a pas de synchronisation entre le PC, le téléphone, l'adresse locale et le site hébergé. Effacer les données du navigateur supprime cette collection. Les tableaux inachevés sont conservés uniquement pendant l'ouverture de la page.

Si le stockage est bloqué, corrompu ou plein, un message le signale ; le jeu reste utilisable en mémoire. Aucun résultat n'est envoyé à un serveur. La police Nunito vient de Google Fonts, avec Segoe UI en repli. Les dessins et icônes sont servis avec l'application. Aucun fichier du Jardin des sons n'est modifié.

## Structure et vérification

`src/game.js` contient le moteur à états ; `src/artworks.js` les cinq dessins originaux versionnés ; `src/variants.js` les dix variantes et leur tirage ; `src/palette.js` les couleurs ; `src/treasures.js` la sauvegarde validée ; `src/Painting.jsx` le rendu SVG ; `src/App.jsx` l'atelier et la grotte.

```sh
npm test
npm run build
```

Les tests couvrent le verrouillage, les saisies invalides, les doubles actions, les sommes jusqu'à 18, la fin des cinq tableaux, les doublons de trésors, les couleurs conservées et les erreurs de stockage. Les jeux d'écoute ajoutent des tests du tirage 0–100, des quatre choix, des variantes de prononciation, des fichiers MP3, de la progression et des événements audio périmés. Des tests React isolés avec jsdom vérifient le pavé, les erreurs, une partie complète, l'ajout à la grotte, la conservation après remontage, la navigation et le focus clavier. Ils simulent la fin de lecture audio ; ils ne certifient pas le rendu sonore ou visuel d'un navigateur réel.

## Dessins surprises

Chaque thème propose trois dessins différents, soit quinze tableaux dans les trois jeux. Un dessin est tiré au hasard au début de chaque partie. Rejouer propose une autre variante du même thème, sans répétition immédiate. Naviguer conserve le dessin et la progression en cours. La grotte retrouve la version exacte, y compris les anciens tableaux.

## Publier sur GitHub Pages

`.github/workflows/pages.yml` installe les dépendances, lance `npm test`, construit le site et publie le dossier `dist` à chaque envoi sur `main`. Une seule fois dans le dépôt : **Settings > Pages > Source : GitHub Actions**. Le jeu est ensuite disponible sur `https://efradet.github.io/la-danse-des-nombres/`. Le site utilise des chemins relatifs (`base: './'`) et les enregistrements des nombres passent par `assetUrl()` : il fonctionne aussi en local.
