# ZeubiCardGames: Rift Brawl

Beat'em up 2D Android/Web basé sur l'univers **ZeubiCardGames**.

## Contenu de cette version

- Campagne en 4 chapitres : **L'Ombre des Ninjas**, **Volonté Émeraude**, **Roubaix la Street**, **Rift des Factions**.
- 3 PLAYER jouables avec progression : **Zaim Sinja → Rubinobi → Roobkage**, **Bafolight → Bafolantern**, **Ouai Roubaix → Wesh la Street → Ca dit Wak**.
- Ennemis et boss issus des cartes : SinANBU, RoobANBU, Roobkatsuki, Sinnchūriki, Roobgan, Bafo Sentinel, Bafo Sinestro, Jacolossus, Baforallax, United Man, Fang, Kayo, Capitaine Stonard et Zarion.
- Combat : combo léger 4 coups, coup lourd, dash invulnérable, saut + attaque aérienne, grab/projection, spécial, évolution en combat.
- Mode Survie, Cartodex, sauvegarde locale, scores et rangs.
- Contrôles tactiles, clavier et manette.
- Musique et effets sonores procéduraux, vibrations Android.
- APK hors-ligne : le jeu Web est embarqué dans un WebView Android et ne nécessite pas Internet.

## Contrôles clavier

- Déplacement : WASD / ZQSD / flèches
- A / attaque légère : `J`
- B / attaque lourde : `K`
- Spécial : `L`
- Dash : `Espace`
- Saut : `I`
- Évolution : `E`
- Pause : `P` ou `Échap`

## APK

GitHub Actions compile automatiquement un APK debug à chaque modification du projet. Dans GitHub : **Actions → Build Zeubi Rift Brawl APK → Artifacts → Zeubi-Rift-Brawl-debug-apk**.

## Web

Le dossier `web/` est autonome et peut être servi par GitHub Pages. Dans ce dépôt Pages, l'URL est :

`https://managementtrika-pixel.github.io/zeubicardgames-beatemup/web/`

## Structure

- `web/` : moteur Canvas 2D, UI, données et assets intégrés.
- `app/` : wrapper Android natif.
- `.github/workflows/build-zeubi-apk.yml` : compilation APK.

Les illustrations ZeubiCardGames restent la propriété de leur auteur / propriétaire. Aucun asset n'est fourni sous licence open source.
