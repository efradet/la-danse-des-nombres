# Voix des nombres

161 fichiers MP3 couvrent les nombres de 0 à 100 et trois variantes : septante/huitante/nonante ; septante/quatre-vingts/nonante ; soixante-dix/quatre-vingts/quatre-vingt-dix. Les fichiers communs couvrent 0–69 et 100.

Voix synthétique française suisse Microsoft `fr-CH-ArianeNeural`, vitesse -15 %, générée à la préparation du jeu avec edge-tts. Aucun appel de synthèse, aucun micro, aucune donnée enfant n'est transmis pendant les jeux. Le bouton d'écoute lente lit les mêmes fichiers à 82 % de leur vitesse.

Régénération : `node scripts/prepare-number-audio.mjs`, puis `python scripts/generate-number-audio.py`. Seuls les noms génériques des nombres sont transmis lors de cette génération. Aucun enregistrement personnel n'est utilisé.
