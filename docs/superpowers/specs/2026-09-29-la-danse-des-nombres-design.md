# La danse des nombres — conception du premier jeu

## Objectif et règles confirmées

Créer un jeu de mathématiques indépendant pour Elisabeth, inspiré de la simplicité du Mind-Map de lecture. Le premier jeu est un coloriage par additions. Le résultat ne dépasse pas 18. Chaque bonne réponse donne le droit de colorier **une seule zone** portant ce résultat, avec la couleur associée au nombre. Une réponse fausse ne permet aucun coloriage. Chaque tableau terminé rejoint **la grotte au trésor des nombres**, une collection personnelle sur le principe des fleurs du Jardin des sons.

## Première version proposée

Une application web en français, utilisable sur ordinateur et écran tactile. L'écran ouvre directement le jeu : dessin à colorier, addition, pavé de réponse et progression. Le titre est « La danse des nombres » ; l'activité est « Les additions colorées ». Gros caractères, boutons espacés et ambiance joyeuse, sans chronomètre.

Cinq tableaux originaux représentent une sirène, une licorne, un château, une princesse et un dragon, conformément à la demande complémentaire. Elisabeth choisit son tableau. Leurs zones fermées portent des nombres de 1 à 18. Un même nombre peut apparaître plusieurs fois. Chaque nombre conserve sa couleur pendant la partie ; le numéro reste visible pour que le jeu ne repose pas uniquement sur la distinction des couleurs.

## Déroulement précis

1. Le jeu choisit un résultat parmi les nombres des zones encore blanches et génère une addition de deux entiers de 0 à 9, de somme comprise entre 1 et 18. Le zéro permet notamment de proposer le résultat 1.
2. Elisabeth saisit sa réponse avec le pavé à l'écran ou le clavier, puis valide.
3. Une erreur invite à réessayer et laisse le coloriage verrouillé. Aucun clic sur le dessin ne peut colorier une zone tant que la réponse à l'addition en cours n'est pas correcte. Une aide facultative représente les deux quantités avec des points ; elle ne donne aucun droit à colorier à elle seule.
4. Une réponse correcte charge le pinceau avec la couleur du résultat. Le jeu indique « Colorie une case [nombre] » et attend le coloriage avant de proposer une autre addition.
5. Elisabeth clique ou touche une zone blanche portant ce nombre. Elle est coloriée, le pinceau est consommé et une nouvelle addition apparaît.
6. Une zone portant un autre nombre, ou déjà coloriée, ne consomme pas le pinceau. Un double appui ne peut ni gagner ni colorier deux zones.
7. La dernière zone déclenche une courte célébration, respectueuse du réglage de mouvement réduit. Le tableau terminé rejoint automatiquement la grotte au trésor des nombres, une seule fois par partie. Elisabeth peut admirer son trésor ou commencer une nouvelle peinture.

## La grotte au trésor des nombres

Un accès permanent « Ma grotte » ouvre une galerie de peintures terminées, comme « Mon jardin » permet de retrouver les fleurs gagnées dans le jeu de lecture. Chaque trésor présente une miniature du tableau et peut être ouvert en grand. Un compteur indique le nombre de tableaux gagnés. Avant le premier tableau, la grotte explique simplement : « Termine une peinture pour déposer ton premier trésor ici. »

Seules les peintures entièrement terminées entrent dans la grotte. Rejouer le même dessin et le terminer crée un nouveau trésor ; rouvrir la grotte ou répéter un clic de fin ne crée pas de doublon. Chaque entrée conserve un identifiant de partie, la date, la version du dessin et ses couleurs pour restituer la peinture gagnée.

Les trésors sont conservés localement dans le navigateur, y compris après fermeture, avec une clé propre à La danse des nombres. Ils ne sont pas synchronisés entre appareils ou adresses du jeu. Si le stockage est indisponible ou plein, la peinture reste visible pour la session et un message indique que sa conservation après fermeture n'est pas assurée. Des données enregistrées invalides ne doivent pas empêcher de jouer.

## Organisation et limites

Projet React séparé dans `C:/projects/Github/LaDanseDesNombres`. Aucun fichier ni aucune sauvegarde du Jardin des sons n'est modifié. Première version centrée sur cette activité, les cinq tableaux demandés et la grotte ; pas de compte enfant, de classement, de publicité ni d'envoi de résultats à un serveur. La partie en cours reste en mémoire pendant l'ouverture du jeu, les visites de la grotte et les changements de dessin ; la reprise d'un tableau inachevé après fermeture n'est pas prévue dans cette version. Les tableaux terminés, eux, sont sauvegardés.

Interface React et dessin SVG interactif : les zones sont de vrais éléments sélectionnables au toucher, à la souris et au clavier. Le moteur de jeu est indépendant de l'affichage. Les données du tableau définissent chaque zone, son nombre, sa forme et la position de son étiquette. Une table associe les 18 résultats aux couleurs. Les messages annoncent les bonnes réponses, les erreurs et le passage au coloriage aux technologies d'assistance.

## Vérifications prévues

- Génération d'additions valides, jamais supérieures à 18, uniquement pour des zones restantes.
- Une bonne réponse donne exactement un coloriage ; réponses répétées et doubles appuis n'accordent aucun crédit supplémentaire.
- Mauvaises réponses et mauvaises zones ne modifient pas la peinture.
- Avant toute bonne réponse, les tentatives de coloriage restent sans effet, y compris après une erreur.
- Plusieurs zones portant le même nombre exigent plusieurs additions réussies.
- Une partie peut toujours se terminer, puis recommencer avec toutes les zones blanches.
- Un tableau terminé rejoint la grotte exactement une fois et reste consultable après rechargement ; une nouvelle partie terminée ajoute un autre trésor.
- Une visite de la grotte préserve la partie en cours et ne change pas le droit de colorier.
- Stockage bloqué, plein ou corrompu : le jeu reste utilisable et ne promet pas une sauvegarde inexistante.
- Contrôle visuel sur ordinateur et petit écran : zones et chiffres lisibles, clavier utilisable et absence de débordement.

## Statut

Conception approuvée par l'utilisateur (« Go », « Approved »), avec confirmation de React et ajout des cinq dessins : sirène, licorne, château, princesse et dragon.
