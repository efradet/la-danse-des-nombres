# La danse des nombres

Jeu React indépendant pour Elisabeth : cinq coloriages par additions et une grotte au trésor des nombres. Les illustrations SVG de sirène, licorne, château, princesse et dragon sont originales et interactives.

## Jouer sur ce PC

Double-cliquer sur `START-DANSE.cmd`, ou exécuter :

```sh
npm install
npm run dev
```

Ouvrir http://localhost:5183/ et garder le serveur ouvert. Node.js 22.12+ (ou 20.19+) est requis par Vite. `npm run build` prépare `dist` pour un hébergement statique ; `npm run preview` permet de vérifier ce résultat sur le même port après arrêt du serveur de développement.

## Règles

- Choisir librement l'un des cinq dessins. Les parties en cours restent disponibles quand on change de dessin ou visite la grotte.
- Saisir la somme (de 1 à 18) au clavier ou avec les boutons, puis valider. Un indice facultatif montre des points à compter.
- Une erreur n'autorise aucun coloriage. On peut réessayer sans pénalité ni chronomètre.
- Une bonne réponse donne exactement un pinceau pour une zone blanche portant ce nombre. Les autres zones ne consomment pas le pinceau. La palette est une légende, pas un moyen de contourner les additions.
- Le tableau entièrement peint rejoint automatiquement « Ma grotte », une seule fois par partie. On peut le consulter en grand, puis gagner d'autres tableaux, y compris en rejouant le même dessin.
- Les zones sont utilisables à la souris, au toucher ou au clavier (Tab puis Entrée/Espace). Le bouton d'agrandissement facilite la lecture du dessin.

## Sauvegarde

Seuls les tableaux terminés sont enregistrés dans localStorage, sous une clé dédiée à ce jeu. Les peintures restent dans ce navigateur, sur cet appareil et pour cette adresse ; il n'y a pas de synchronisation entre le PC, le téléphone, l'adresse locale et le site hébergé. Effacer les données du navigateur supprime cette collection. Les tableaux inachevés sont conservés uniquement pendant l'ouverture de la page.

Si le stockage est bloqué, corrompu ou plein, un message le signale ; le jeu reste utilisable en mémoire. Aucun résultat n'est envoyé à un serveur. La police Nunito vient de Google Fonts, avec Segoe UI en repli. Les dessins et icônes sont servis avec l'application. Aucun fichier du Jardin des sons n'est modifié.

## Structure et vérification

`src/game.js` contient le moteur à états ; `src/artworks.js` les cinq dessins versionnés ; `src/palette.js` les couleurs ; `src/treasures.js` la sauvegarde validée ; `src/Painting.jsx` le rendu SVG ; `src/App.jsx` l'atelier et la grotte.

```sh
npm test
npm run build
```

Les tests couvrent le verrouillage, les saisies invalides, les doubles actions, les sommes jusqu'à 18, la fin des cinq tableaux, les doublons de trésors, les couleurs conservées et les erreurs de stockage.
