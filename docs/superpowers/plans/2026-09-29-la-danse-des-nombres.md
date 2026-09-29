# La danse des nombres Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Livrer un jeu React indépendant avec cinq coloriages par additions et une grotte de peintures sauvegardées.
**Architecture:** React + Vite, moteur de jeu pur, catalogue SVG original de cinq dessins et persistance locale versionnée. Deux vues principales, atelier et grotte, avec un sélecteur de dessins préservant les parties en cours.
**Tech Stack:** React, Vite, JavaScript, CSS, SVG, node:test.
**Spec:** `docs/superpowers/specs/2026-09-29-la-danse-des-nombres-design.md`

## Global Constraints

- Application indépendante en français, React, destinée à Elisabeth.
- Sommes de 1 à 18 ; une bonne réponse = une seule zone ; erreur = aucun coloriage.
- Sirène, licorne, château, princesse et dragon, tous jouables et sauvegardables.
- Trésors stockés dans le navigateur ; aucun compte enfant ni service externe de calcul.
- Toucher, clavier, petits écrans et mouvement réduit.

## Review Focus

1. Double validation ou double clic : pas de crédit ni de trésor en double (tâche 1).
2. Entrée vide, décimale, négative ou supérieure à 18 : pas de validation correcte (tâche 1).
3. Stockage corrompu, interdit ou plein : jeu toujours utilisable, message honnête (tâche 2).
4. Changement de dessin ou visite de la grotte avec pinceau chargé : conserver le bon état par dessin (tâche 3).
5. Fin de dessin et rechargement : tableau complet affichable avec ses couleurs originales (tâches 2 et 3).

### Task 1: Catalogue et moteur

**Files:** `package.json`, `src/artworks.js`, `src/game.js`, `tests/game.test.js`.
**Interfaces:** `createGame(artwork, rng)`, `submitAnswer(state, text)`, `paintZone(state, zoneId, rng)`, `ARTWORKS`, `PALETTE`.

- [x] Écrire les tests : mauvais résultat garde zéro zone ; bon résultat active le pinceau ; mauvais numéro ne le consomme pas ; un clic correct colore exactement une zone ; deuxième clic sans addition reste sans effet ; finir chacun des cinq dessins ne bloque jamais.
- [x] Lancer `npm test`, constater les échecs attendus avant implémentation.
- [x] Implémenter le moteur à états answer/paint/complete ; choisir uniquement les sommes présentes parmi les zones restantes. Définir cinq dessins SVG à zones fermées, numéros et détails décoratifs distincts.
- [x] Lancer `npm test`, obtenir tous les tests verts.

### Task 2: Grotte persistante

**Files:** `src/treasures.js`, `tests/treasures.test.js`.
**Interfaces:** `makeTreasure(game)`, `loadTreasures(storage)`, `saveTreasure(items, treasure, storage)` -> `{items, error}`.

- [x] Écrire les tests : refuser un tableau inachevé ; garder les couleurs et la version ; dédupliquer par partie ; préserver plusieurs peintures ; survivre aux données malformées, à l'accès refusé et au quota.
- [x] Constater les échecs, puis implémenter une clé dédiée, une validation du contenu et la sauvegarde tolérante aux erreurs.
- [x] Relancer l'ensemble des tests.

### Task 3: Atelier React et galerie

**Files:** `index.html`, `src/main.jsx`, `src/App.jsx`, `src/Painting.jsx`, `src/styles.css`, `public/favicon.svg`, `START-DANSE.cmd`, `README.md`.

- [x] Construire l'atelier : navigation Atelier/Grotte, choix de dessin, peinture, calcul, pavé numérique, indice avec points, pinceau à usage unique, progression et célébration.
- [x] Ouvrir la première vue cohérente dans le navigateur dès qu'elle fonctionne.
- [x] Brancher les cinq parties, les trésors persistants et la consultation en grand. Confirmer la remise à zéro seulement si une partie inachevée serait perdue.
- [x] Vérifier réellement une erreur puis un coloriage, la navigation, une partie complète, la grotte après rechargement, le clavier et une largeur mobile.
- [x] Ajouter la documentation, le lanceur local et l'icône. Exécuter `npm test` et `npm run build`.
- [x] Effectuer une revue du code, corriger tout défaut important, puis livrer la version jouable et le projet React.

## Execution record

Approbation utilisateur reçue ; réalisation dans ce nouveau répertoire, sans modification des autres projets. Publication privée via Sites si disponible, aperçu local maintenu pour l'accès sur ce PC.


### Résultats
- 12 tests passent, compilation Vite réussie.
- Revue indépendante : moteur et sauvegarde sans anomalie importante. Numéro 14 des cheveux de la princesse masqué par une manche : corrigé, contrôle visuel effectué.
- Vérifications navigateur : réponse fausse = zéro zone déverrouillée ; réponse correcte = un coloriage ; partie de 20 zones achevée ; trésor unique présent après rechargement et ouvrable en grand.
- Tests de sauvegarde effectués sur 127.0.0.1 pour laisser la collection localhost vierge.
- Affichages 1280 et 390 pixels inspectés ; aucune largeur de page débordante à 390 pixels.
- Outil WebMCP de lecture validé avec entrée valide et entrée refusée, sans mutation du jeu.
- Source React livrée localement. Site privé enregistré (identité dans .openai/hosting.json), mais non publié : le plugin Sites et son script site-workflow.mjs ont disparu du cache pendant la session. Aucune URL de production annoncée.
