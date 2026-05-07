# Lumio Health — Clinique BEC · BC1

Expérience immersive de cas d'examen — MSMC RNCP 38504.

## Structure

```
├── index.html          # Chargeur — ne pas modifier sauf pour ajouter des fichiers
├── data.js             # Toutes les données Lumio (emails, docs, verbatims)
├── api-interceptor.js  # Injecte la clé API Anthropic sur tous les fetch
├── styles.css          # CSS global (variables, scrollbars, animations)
├── icons.jsx           # Icônes SVG du dock + LivrableIcon
├── app-mail.jsx        # App Mail (boîte de réception)
├── app-browser.jsx     # App Safari (articles de presse + site Lumio)
├── app-pdf.jsx         # App Aperçu (rapport Yanis)
├── app-voice.jsx       # App Mémos vocaux (verbatims Camille)
├── app-notes.jsx       # App Notes (note de cadrage Sonia)
├── app-slack.jsx       # App Slack (conversation Sonia IA)
├── app-extras.jsx      # Bloc-notes, Finder, Calendrier, Corbeille
├── app-livrable.jsx    # App Livrable (remise + évaluation jury IA)
├── desktop.jsx         # Window manager, Dock, MenuBar, Desktop
└── main.jsx            # NameScreen, LoginScreen, WelcomeBrief, Root
```

## Déploiement Vercel

1. Créer un repo GitHub et pousser ce dossier
2. Connecter le repo à Vercel (import project)
3. Framework Preset : **Other** (pas de build)
4. Output directory : laisser vide (`.`)
5. Deploy

## Développement local

Ouvrir `index.html` directement dans le navigateur **ne fonctionne pas** à cause du chargement des fichiers JSX via `fetch`. Utiliser un serveur local :

```bash
npx serve .
# ou
python3 -m http.server 8080
```

## Clé API

La clé API Anthropic est saisie par l'étudiant sur l'écran d'entrée (champ optionnel "Clé API Anthropic"). Elle est stockée en `sessionStorage` et injectée automatiquement sur tous les appels vers `api.anthropic.com`.

Pour pré-configurer une clé (usage en salle) : ajouter dans `data.js` :
```js
window.__ANTHROPIC_KEY = 'sk-ant-...';
```

## Modifier le contenu

- **Données narratives** (emails, verbatims, articles) → `data.js`
- **Personnages** (nom étudiant par défaut, rôles) → `data.js` section `student`
- **Prompt Sonia** → `app-slack.jsx` constante `SONIA_PROMPT`
- **Prompt jury** → `app-livrable.jsx` constante `JURY_PROMPT`
- **Notifications automatiques** → `desktop.jsx` section `Notification scheduler`
- **Documents bonus déclenchés** → `desktop.jsx` fonction `__onSlackExchange`
