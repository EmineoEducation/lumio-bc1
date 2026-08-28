// ══════════════════════════════════════════════════════════════
// SLACK APP — v4 (VERSION CORRIGÉE — fixes F20→F22)
// Fixes v4 :
//  · F20 — __onSoniaLivrableReaction plantait (TypeError: veille.substring
//    is not a function) : desktop.jsx transmet un OBJET answers, et le
//    .substring était évalué HORS du try/catch → « Sonia est en train
//    d'écrire… » restait affiché indéfiniment après remise du livrable.
//    → Normalisation des arguments + prompt construit DANS le try +
//    setSending(false) garanti par finally.
//  · F21 — Les messages étaient horodatés en HEURE RÉELLE (new Date())
//    alors que la barre de menu affiche le temps FICTIF → deux horloges
//    contradictoires à l'écran. → horodatage fictif via __getFictifTime.
// Fixes v3 (conservés) :
//  · Badges auto : unreads initialisés à 0
//  · "Lou Bertrand" hardcodé → window.LUMIO_DATA?.student?.name
//  · API guards (resp.ok, Array.isArray)
//  · Easter egg WhatsApp : numéro cliquable dans signature Sonia
// ══════════════════════════════════════════════════════════════
const { useState: useSlackState, useEffect: useSlackEffect, useRef: useSlackRef } = React;

// ══════════════════════════════════════════════════════════════
// F39 · RÉSEAU INSTABLE
// Les étudiants travaillent sur leurs propres machines, en partage de
// connexion mobile. Sur un réseau qui tombe une seconde, `fetch` échoue
// franchement : la requête n'atteint jamais le serveur, elle n'apparaît
// donc dans aucun journal côté Vercel, et le personnage se taisait — ce
// qui, du poste de l'encadrant sur une connexion stable, était
// impossible à reproduire.
// Correctif : trois tentatives espacées avant d'abandonner. Une coupure
// d'une ou deux secondes devient invisible pour l'étudiant·e.
// Bloc générique et idempotent.
// ══════════════════════════════════════════════════════════════
if (!window.PAC_FETCH) {
  window.PAC_FETCH = async function (url, options, essais) {
    const max = essais == null ? 3 : essais;
    let derniere = null;
    for (let i = 0; i < max; i++) {
      try {
        return await fetch(url, options);
      } catch (e) {
        derniere = e;
        console.warn('PAC_FETCH — tentative ' + (i + 1) + '/' + max + ' échouée', e);
        if (i < max - 1) await new Promise(r => setTimeout(r, 800 * (i + 1)));
      }
    }
    throw derniere;
  };
}


// ══════════════════════════════════════════════════════════════
// F33 · PAC_PERSIST — sauvegarde incrémentale de l'état applicatif
// ──────────────────────────────────────────────────────────────
// Avant F33, seuls l'identité et le timerStart survivaient à un reload :
// la conversation Slack et la saisie du livrable vivaient uniquement en
// state React et disparaissaient au moindre rechargement.
// Ce helper écrit des tranches nommées dans la session Redis existante.
// api/session.js FUSIONNE l'objet reçu avec l'existant : envoyer une
// tranche seule n'écrase donc jamais studentName / timerStart / phase.
// Bloc générique et idempotent — défini par le premier fichier chargé
// (app-slack.jsx), réutilisé tel quel par app-livrable.jsx.
// ══════════════════════════════════════════════════════════════
if (!window.PAC_PERSIST) {
  window.PAC_PERSIST = (function () {
    var timers = {};
    var pending = null;
    var state = { ok: null, lastSaved: null, lastError: null };
    var listeners = [];

    var sid = function () {
      try { return localStorage.getItem('lumio_sid') || null; } catch (e) { return null; }
    };
    var notify = function () { listeners.forEach(function (f) { try { f(state); } catch (e) {} }); };

    // Appel réseau direct plutôt que window.LUMIO_SESSION : le helper de
    // main.jsx avale les erreurs dans un console.warn et renvoie null quoi
    // qu'il arrive. Or un échec de sauvegarde silencieux est exactement le
    // scénario qui coûte des heures de travail — il doit être visible.
    var write = function (slot, value) {
      var id = sid();
      if (!id) return Promise.resolve(false);
      var payload = {}; payload[slot] = value;
      return window.PAC_FETCH('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: id, session: payload })
      }).then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        state.ok = true; state.lastSaved = Date.now(); state.lastError = null;
        notify(); return true;
      }).catch(function (e) {
        state.ok = false; state.lastError = String(e && e.message || e);
        console.warn('PAC_PERSIST — échec de sauvegarde (' + slot + ') :', e);
        notify(); return false;
      });
    };

    return {
      sid: sid,
      status: function () { return state; },
      onChange: function (f) {
        listeners.push(f);
        return function () { listeners = listeners.filter(function (x) { return x !== f; }); };
      },
      // Écriture différée : une seule requête après 1,2 s sans frappe.
      save: function (slot, value, delay) {
        if (!sid()) return;
        clearTimeout(timers[slot]);
        timers[slot] = setTimeout(function () { write(slot, value); }, delay == null ? 1200 : delay);
      },
      // Écriture immédiate : fermeture d'onglet, remise du livrable.
      flush: function (slot, value) {
        clearTimeout(timers[slot]);
        return write(slot, value);
      },
      // Lecture : un seul GET partagé par toutes les apps au montage.
      load: function () {
        var id = sid();
        if (!id) return Promise.resolve(null);
        if (!pending) {
          pending = window.PAC_FETCH('/api/session?id=' + encodeURIComponent(id))
            .then(function (r) { return r.status === 404 ? null : r.json(); })
            .then(function (j) { return (j && j.session) || null; })
            .catch(function () { return null; });
        }
        return pending;
      }
    };
  })();
}

// F21 · Horodatage cohérent avec l'horloge fictive de la barre de menu.
const slackNowTime = () => {
  try {
    if (window.__getFictifTime) {
      const label = window.__getFictifTime().label; // ex. "lun. 14 sept. 09:42"
      const m = label.match(/(\d{2}:\d{2})\s*$/);
      if (m) return m[1];
    }
  } catch (e) {}
  const now = new Date();
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
};

const SONIA_PROMPT = `Tu es Sonia Ferracci, Directrice Marketing de Lumio Health depuis 7 mois.

Tu reçois un premier message d'un(e) consultant(e) externe à qui tu as confié une mission de diagnostic de marque. Tu as accès à tous les documents consultables : ta lettre de mission, ta note de cadrage CODIR du 12 juin, le rapport de veille de Yassine Morel (non relu par la direction), trois articles de presse (Les Échos, HBR France, 20 Minutes), un email confidentiel de Théo Marczak (CEO) du 14 juin avec ses réserves sur la MDR et le budget, et trois verbatims de Camille Ott (commerciale B2B).

Contexte clé :
- Lumio = wearable de mesure du stress, 8 ans B2B, pression d'un fonds américain pour aller grand public en 36 mois (objectif 20M€)
- Concurrents Biostream (jan 2026) et Neuroflow (mars 2026) viennent d'obtenir la certification MDR IIa
- Lumio n'a PAS de certif. Théo refuse de communiquer un calendrier (en interne il a dit "fin Q2 2027 best case")
- Tension sur les chiffres : 230 contacts vs 180 clients facturés
- Tension sur le budget : tu veux 380K€, Théo dit 200K€ max
- Camille (commerciale) signale que les clients DRH posent maintenant des questions sur la certif

Ton style :
- Tu écris en messagerie, pas en email — phrases courtes, pas de formules
- Tu es directe, exigeante, parfois cassante mais juste
- Tu n'es jamais scolaire, jamais dans le compliment automatique
- Tu vas droit aux failles : ce qui manque, ce qui n'a pas été creusé, ce que le consultant n'a pas osé dire
- Tu poses des questions précises, dérangeantes, qui obligent à choisir
- Si la livraison est faible, tu le dis sans détour
- Si elle est forte, tu pousses sur les angles morts plutôt que de complimenter

Format de réponse :
- Réponds en 2-4 messages courts SÉPARÉS par le délimiteur "---SPLIT---" entre chaque message
- Chaque message : 1 à 3 phrases courtes
- Termine par UNE question précise ou UNE consigne pour la suite
- Ton max 200 mots cumulés

Ne dis JAMAIS "Bonjour" ou "Merci pour ta livraison". Entre direct dans le sujet.`;

// ══════════════════════════════════════════════════════════════
// F32 · FICHIER FANTÔME — carte des documents
// Symptôme : le commanditaire évoquait des documents (« mon espace
// partagé », « le rapport de Yassine ») sans savoir où ils se trouvent
// dans l'interface. Quand l'étudiant·e répondait « je ne le trouve pas »,
// le modèle improvisait un Drive, une pièce jointe ou un « je te le
// renvoie » — trois impasses. Toute la promo bloquait au même endroit.
// Correctif : la localisation réelle est injectée dans le prompt depuis
// window.LUMIO_DATA.docIndex (source de vérité, définie dans data.js),
// assortie de règles strictes. Générique — aucun contenu de bloc ici.
// ══════════════════════════════════════════════════════════════
const buildDocMapBlock = () => {
  const idx = (window.LUMIO_DATA && window.LUMIO_DATA.docIndex) || [];
  const lignes = idx.length
    ? idx.map(d => `- ${d.nom} → ${d.ou}`).join('\n')
    : "- (aucun index fourni : ne cite alors AUCUN document par son emplacement)";
  return `

═══ LOCALISATION DES DOCUMENTS — RÈGLE ABSOLUE ═══

Tous les documents sont DÉJÀ installés sur le poste de mission de la personne. Rien ne reste à envoyer.

${lignes}

Règles non négociables :
1. Si on te demande où trouver un document, tu donnes sa localisation exacte telle qu'écrite ci-dessus, en UNE phrase, puis tu relances immédiatement sur le fond ("et une fois que tu l'as lu, dis-moi ce que tu en tires").
2. Tu ne proposes JAMAIS d'envoyer, de renvoyer, de transférer, de partager, de joindre ou de déposer un fichier. Tu n'en as pas la possibilité — tout est déjà là.
3. Tu ne mentionnes JAMAIS de Drive, Dropbox, Notion, SharePoint, WeTransfer, pièce jointe, lien de téléchargement, ni aucun outil qui n'existe pas sur ce poste.
4. Tu ne cites JAMAIS un document absent de la liste ci-dessus. Si la personne réclame une pièce qui n'existe pas (chiffres détaillés, étude client complète, calendrier MDR écrit), tu le dis franchement : cette pièce n'existe pas, et c'est précisément le problème — à elle de faire avec, ou de nommer ce manque dans son livrable.
5. Tu ne fais jamais allusion à une conversation privée ou à un document confidentiel qui ne figure pas dans la liste.
6. Tu ne décris pas le contenu d'un document à la place de la personne. Tu dis où il est ; elle le lit.`;
};

const buildSoniaSystemPrompt = () => SONIA_PROMPT + buildDocMapBlock();

// ══════════════════════════════════════════════════════════════
// F35 · INTERLOCUTEURS MUETS
// Symptôme : seule Sonia était branchée sur l'IA. Écrire à Camille ou
// à Yassine ajoutait le message de l'étudiant·e… et rien d'autre, pour
// toujours. Or le DM d'accueil de Camille invite explicitement à la
// contacter (« si tu veux qu'on se parle, dis-moi ») : une promotion
// entière pouvait attendre une réponse qui ne pouvait pas venir.
// Correctif : chaque interlocuteur a désormais son propre prompt, et
// répond avec la même mécanique que Sonia.
// ══════════════════════════════════════════════════════════════
const CAMILLE_PROMPT = `Tu es Camille Ott, commerciale B2B historique de Lumio Health. Huit ans dans l'entreprise, tu connais les clients un par un.

Tu échanges en messagerie avec un·e consultant·e externe missionné·e par Sonia pour un diagnostic de marque. Tu as proposé toi-même cet échange. Tu réponds volontiers, franchement, sans détour.

Ce que tu sais et que la direction minimise :
- Depuis six mois, les DRH posent des questions sur la certification. Pas agressivement, plutôt gênés — mais ils la posent. C'est nouveau, c'est de cette année.
- Ce n'est pas encore rédhibitoire, mais c'est une horloge qui tourne.
- Si Biostream arrive chez un client avec sa certification IIa et un prix un peu plus bas, tu ne pourras plus défendre longtemps une absence de certification. Un client avec un comité d'éthique finira par ne plus pouvoir signer.
- Ta vraie inquiétude, celle que Sonia ne se pose pas assez et que Théo refuse de se poser : est-ce que les clients historiques nous voient encore comme une référence, ou déjà comme « le truc d'avant » ? Tu estimes qu'il reste six à neuf mois avant le basculement.
- Les chiffres : 180 clients réellement facturés, pas 230 contacts. Tu le sais parce que tu factures.
- Tu as mené une étude qualitative clients en mars 2026. Personne ne t'a jamais demandé les résultats.

Ton style :
- Messagerie, phrases courtes, ton direct et chaleureux
- Tu parles du terrain, avec des exemples concrets de rendez-vous clients
- Tu es loyale à Lumio mais lucide ; tu ne charges personne gratuitement
- Tu réponds TOUJOURS à la question posée. Tu ne renvoies jamais vers quelqu'un d'autre sans donner d'abord ta propre réponse.
- Si on te demande ton avis, tu le donnes. Tu ne dis jamais « je ne peux pas t'aider là-dessus ».
- Tu peux poser une question en retour, mais seulement après avoir répondu.

Format :
- 2 à 3 messages courts séparés par "---SPLIT---"
- Chaque message : 1 à 3 phrases
- 150 mots cumulés maximum

Ne commence jamais par « Bonjour ». Entre directement dans le sujet.`;

const YASSINE_PROMPT = `Tu es Yassine Morel, content manager junior chez Lumio Health, deux ans d'ancienneté.

Tu échanges en messagerie avec un·e consultant·e externe qui a lu ton rapport de veille. Ce rapport n'a pas été relu par la direction et tu le sais imparfait — tu es un peu gêné qu'il circule.

Ce que tu sais :
- Tu as bouclé ton rapport dans l'urgence, seul, sans validation
- Tu n'as pas pu conclure la partie certification de Lumio : Théo n'a jamais répondu à tes relances
- Le statut de la certification chez Withings, tu ne l'as pas tranché — les sources se contredisent
- Tu es honnête sur les limites de ton travail, tu ne les défends pas

Ton style :
- Poli, un peu hésitant, mais coopératif et précis quand on te pose une question factuelle
- Tu réponds TOUJOURS à la question. Si tu ne sais pas, tu dis franchement que tu ne sais pas et pourquoi.
- Tu ne renvoies jamais quelqu'un vers une autre personne sans donner d'abord ce que tu sais

Format :
- 2 à 3 messages courts séparés par "---SPLIT---"
- Chaque message : 1 à 3 phrases
- 130 mots cumulés maximum

Ne commence jamais par « Bonjour ».`;

// Chaque interlocuteur : son prompt, son identité d'affichage.
const INTERLOCUTEURS = {
  sonia:   { prompt: SONIA_PROMPT,   nom: 'Sonia Ferracci', avatar: 'SF', color: '#c4420f',
             secours: "Je suis en réunion deux minutes — redis-moi ça, je te réponds juste après." },
  camille: { prompt: CAMILLE_PROMPT, nom: 'Camille Ott',    avatar: 'CO', color: '#0a7a6e',
             secours: "Attends, mon Slack rame. Repose-moi ta question, je suis là." },
  yassine: { prompt: YASSINE_PROMPT, nom: 'Yassine Morel',  avatar: 'YM', color: '#5b6b85',
             secours: "Désolé, message parti de travers. Tu peux répéter ?" }
};

// La carte des documents s'applique à tout le monde : personne ne doit
// pouvoir proposer d'envoyer un fichier ou d'inventer un outil externe.
const buildPromptFor = (id) => (INTERLOCUTEURS[id] ? INTERLOCUTEURS[id].prompt : SONIA_PROMPT) + buildDocMapBlock();

// ══════════════════════════════════════════════════════════════
// F40 · LE COMMANDITAIRE INVENTAIT LE LIVRABLE
// Observé en séance : à une étudiante qui signalait un bouton grisé,
// Sonia a répondu « ton livrable c'est la note en trois paragraphes
// qu'on a finalisée ensemble », puis lui a demandé de l'envoyer par mail.
// Rien de tout cela n'existe : le livrable de ce bloc est composé de
// compétences numérotées, saisies dans l'application Livrable, et aucun
// autre canal de remise n'est valable. Le prompt ne disait nulle part
// en quoi consiste le livrable — le modèle comblait le vide.
// Correctif : les faits sont injectés depuis PAC_CONFIG, avec interdiction
// d'improviser un format ou un canal de remise.
// ══════════════════════════════════════════════════════════════
const buildLivrableFactsBlock = () => {
  const cfg = window.PAC_CONFIG || window.PASS_CONFIG || {};
  const comps = cfg.competences || [];
  const lignes = comps.length
    ? comps.map(c => `- ${c.code} : ${c.label}${c.min ? ' (' + c.min + ' mots minimum)' : ''}`).join('\n')
    : '- (structure non fournie : ne décris alors JAMAIS le contenu du livrable)';
  return `

═══ LE LIVRABLE — FAITS, RÈGLE ABSOLUE ═══

Le livrable attendu se remplit dans l'application « Livrable » du poste de la personne. Il est composé des rubriques suivantes :

${lignes}

Les nombres de mots indiqués sont des REPÈRES, pas des conditions : depuis F42, une copie plus courte peut être soumise après confirmation. Le bouton n'est grisé que si une rubrique est vide ou quasi vide (moins de quinze mots). Un bouton grisé ne signale jamais une panne.

Règles non négociables :
1. Tu ne décris JAMAIS le livrable autrement que par les rubriques ci-dessus. Tu n'inventes ni format, ni nombre de paragraphes, ni nombre de sources.
2. Tu ne dis JAMAIS avoir validé, relu ou finalisé quoi que ce soit « ensemble ». Tu n'as rien reçu tant que le livrable n'a pas été soumis.
3. Tu ne proposes JAMAIS un autre canal de remise : ni mail, ni copier-coller, ni pièce jointe, ni message. La remise se fait uniquement par l'application Livrable. Aucune autre voie ne sera évaluée.
4. Si on te signale un problème technique (bouton grisé, page qui ne répond pas, message d'erreur), tu réponds en une phrase que ce n'est pas de ton ressort et qu'il faut voir avec le référent de campus, puis tu reviens au fond. Tu ne proposes aucun contournement.
5. Si on te demande de confirmer qu'un travail est « bon » alors qu'il ne t'a pas été soumis, tu dis que tu ne l'as pas encore reçu.`;
};

function SlackApp({ openChannel }) {
  const channels = [
    { id: 'general',      name: 'général',             type: 'channel', members: 12 },
    { id: 'mission-lumio',name: 'mission-lumio-brand', type: 'channel', members: 4, special: true },
    { id: 'random',       name: 'random',              type: 'channel', members: 11 },
    { id: 'design-feed',  name: 'design-feed',         type: 'channel', members: 8 }
  ];
  const dms = [
    { id: 'sonia',  name: 'Sonia Ferracci', avatar: 'SF', color: '#c4420f', status: 'online' },
    { id: 'camille',name: 'Camille Ott',    avatar: 'CO', color: '#0a7a6e', status: 'online' },
    { id: 'yassine', name: 'Yassine Morel', avatar: 'YM', color: '#5b6b85', status: 'away' }
  ];

  const getStudentName = () => window.LUMIO_DATA?.student?.name || 'Consultant·e';
  const getStudentInitial = () => window.LUMIO_DATA?.student?.initial || '?';

  // ── Bug fix : unreads initialisés à 0 — pas de badges sur les seeds ──
  const [unreads, setUnreads] = useSlackState({});

  const [activeId, setActiveId] = useSlackState(openChannel || 'sonia');
  const activeIdRef = useSlackRef(openChannel || 'sonia');
  const setActive = (id) => { activeIdRef.current = id; setActiveId(id); };

  const [chatHistory, setChatHistory] = useSlackState({});
  const [draft, setDraft] = useSlackState('');
  const [sending, setSending] = useSlackState(false);
  const [exchangeCount, setExchangeCountLocal] = useSlackState(0);
  const scrollRef = useSlackRef(null);

  // ── Seeds — lus d'emblée, aucun badge ──
  const buildSeed = () => ({
    sonia: [
      { from: 'Sonia Ferracci', avatar: 'SF', color: '#c4420f', time: '07:48',
        text: 'Bien reçu mon mail ?' },
      { from: 'Sonia Ferracci', avatar: 'SF', color: '#c4420f', time: '07:48',
        // F32 · « ton espace partagé » ne désignait aucun endroit de l'interface.
        // Le libellé vient désormais de data.js (D.docLocationHint) et nomme le
        // dossier Finder qui contient réellement les pièces.
        text: (window.LUMIO_DATA && window.LUMIO_DATA.docLocationHint)
          || "J'ai déposé tous les docs dans le Finder de ton poste — dossier « Espace de travail ». Prends ta matinée pour digérer, et écris-moi quand tu as une première lecture." },
      { from: 'Sonia Ferracci', avatar: 'SF', color: '#c4420f', time: '07:49',
        text: "Au fait — n'oublie pas que Théo ne sait pas que tu as accès à son mail du 14 juin. À toi de juger comment l'utiliser.",
        // Easter egg : signature avec numéro caché
        signature: '+33 6 12 34 56 78', easterEgg: 'whatsapp' }
    ],
    camille: [
      { from: 'Camille Ott', avatar: 'CO', color: '#0a7a6e', time: 'il y a 8 min',
        text: "Hello 👋 j'ai vu que Sonia t'avait briefé." },
      { from: 'Camille Ott', avatar: 'CO', color: '#0a7a6e', time: 'il y a 8 min',
        text: "Si tu veux qu'on se parle dans la semaine, dis-moi. Je ne travaille pas dans la même réalité que la direction sur ce dossier 🙃" }
    ],
    'mission-lumio': [
      { from: 'Sonia Ferracci', avatar: 'SF', color: '#c4420f', time: 'lun. 18:42',
        // F22 · « une consultante externe » → épicène, cohérent avec le reste du dispositif.
        text: 'On va recevoir un·e consultant·e externe pour faire un audit de marque avant le CODIR du 30. @theo @camille merci de jouer le jeu.' },
      { from: 'Théo Marczak', avatar: 'TM', color: '#5c2d8f', time: 'lun. 19:14',
        text: "Pas convaincu mais ok. Tant qu'on parle pas de MDR sans moi." },
      { from: 'Camille Ott', avatar: 'CO', color: '#0a7a6e', time: 'lun. 21:02',
        text: "Tant mieux qu'on en parle franchement. ça commence à être tendu sur le terrain." }
    ],
    yassine: [
      { from: 'Yassine Morel', avatar: 'YM', color: '#5b6b85', time: '11 mai',
        text: "Salut, je termine mon rapport demain. C'est pas parfait, j'ai pas pu boucler la partie certif Lumio (Théo n'a pas répondu), désolé." }
    ],
    general: [
      { from: 'lumio-bot', avatar: '🤖', color: '#9a9ea8', time: '08:00',
        text: '☀️ Bonjour à tous · 23 personnes connectées ce matin' }
    ],
    random: [
      { from: 'Marc Dubreuil', avatar: 'MD', color: '#3a7bd5', time: 'lun.',
        text: "Quelqu'un a déjà testé le café new-yorkais derrière la rue de Charonne ? Avis ?" }
    ],
    'design-feed': [
      { from: 'Élodie Park', avatar: 'EP', color: '#d18a3c', time: '08:12',
        text: 'Nouveau projet de Pentagram pour Headspace ↘ https://… super travail typographique 🔥' }
    ]
  });

  // ══ F33 · Restauration puis initialisation ══════════════════
  // L'ancien effet posait le seed dès le montage. On lit d'abord la
  // session : s'il existe une conversation sauvegardée, elle prime ;
  // sinon seulement, on pose le seed.
  // `hydrated` empêche toute écriture avant d'avoir lu la session :
  // sans ce garde-fou, le seed écraserait l'historique sauvegardé dans
  // la milliseconde suivant le montage.
  const [hydrated, setHydrated] = useSlackState(false);

  useSlackEffect(() => {
    let annule = false;
    window.PAC_PERSIST.load().then(session => {
      if (annule) return;
      const s = (session && session.slack) || null;
      if (s && s.history && Object.keys(s.history).length) {
        setChatHistory(s.history);
        if (s.unreads) setUnreads(s.unreads);
        const n = s.exchangeCount || 0;
        setExchangeCountLocal(n);
        // Rejoue le compteur pour que desktop.jsx redéverrouille le
        // livrable : l'état `livrableUnlocked` en dépend et n'est pas
        // persisté de son côté.
        if (n > 0 && window.__onSlackExchange) {
          try { window.__onSlackExchange(n); } catch (e) {}
        }
      } else {
        setChatHistory(buildSeed());
      }
      setHydrated(true);
    });
    return () => { annule = true; };
  }, []);

  // Sauvegarde différée à chaque évolution du fil.
  useSlackEffect(() => {
    if (!hydrated) return;
    window.PAC_PERSIST.save('slack', {
      history: chatHistory, unreads, exchangeCount, savedAt: Date.now()
    });
  }, [hydrated, chatHistory, unreads, exchangeCount]);

  // Filet : écriture immédiate si l'onglet se ferme.
  useSlackEffect(() => {
    const bye = () => {
      if (!hydrated) return;
      window.PAC_PERSIST.flush('slack', {
        history: chatHistory, unreads, exchangeCount, savedAt: Date.now()
      });
    };
    window.addEventListener('beforeunload', bye);
    return () => window.removeEventListener('beforeunload', bye);
  }, [hydrated, chatHistory, unreads, exchangeCount]);
  // ══ fin F33 ═════════════════════════════════════════════════

  useSlackEffect(() => {
    if (openChannel) {
      setActive(openChannel);
      setUnreads(u => ({ ...u, [openChannel]: 0 }));
    }
  }, [openChannel]);

  useSlackEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [chatHistory, activeId, sending]);

  // ── Helper : ajouter un message entrant + badge si channel pas actif ──
  const addIncoming = (channelId, msg) => {
    setChatHistory(h => ({
      ...h,
      [channelId]: [...(h[channelId] || []), msg]
    }));
    if (activeIdRef.current !== channelId) {
      setUnreads(u => ({ ...u, [channelId]: (u[channelId] || 0) + 1 }));
    }
  };

  // ── Réaction de Sonia quand le livrable est soumis ──
  // F20 · Version robuste : accepte indifféremment (veille, plateforme) en
  // chaînes OU l'objet answers complet transmis par desktop.jsx ; tout le
  // travail se fait dans le try ; setSending(false) est garanti.
  useSlackEffect(() => {
    window.__onSoniaLivrableReaction = async (veille, plateforme) => {
      setSending(true);
      const time = slackNowTime();
      try {
        const toText = (v) => {
          if (typeof v === 'string') return v;
          if (v && typeof v === 'object') {
            return Object.entries(v).map(([k, x]) => k + ' — ' + String(x || '')).join('\n\n');
          }
          return String(v == null ? '' : v);
        };
        // Si desktop.jsx a transmis l'objet answers en 1er argument,
        // on en extrait la veille (C.1) et la plateforme (C.5).
        let veilleTxt = toText(veille);
        let plateformeTxt = toText(plateforme);
        if (veille && typeof veille === 'object' && !plateforme) {
          veilleTxt = String(veille['C.1'] || toText(veille));
          plateformeTxt = String(veille['C.5'] || '');
        }
        const prompt = `Tu es Sonia Ferracci. Le/la consultant·e vient de te remettre son livrable final. Tu l'as lu rapidement. Tu réagis en Slack — direct, honnête, 100-150 mots maximum.

Livrable reçu :
${veilleTxt.substring(0, 600)}...
${plateformeTxt.substring(0, 600)}...`;
        const resp = await window.PAC_FETCH('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'claude-sonnet-4-6',
            max_tokens: 400,
            messages: [{ role: 'user', content: prompt }]
          })
        });
        if (!resp.ok) throw new Error('API ' + resp.status);
        const data = await resp.json();
        const reply = (Array.isArray(data.content) && data.content[0]?.text)
          ? data.content.map(b => b.text || '').join('')
          : 'Bien reçu. Je te reviens avant le board.';
        addIncoming('sonia', { from: 'Sonia Ferracci', avatar: 'SF', color: '#c4420f', time, text: reply });
      } catch {
        addIncoming('sonia', { from: 'Sonia Ferracci', avatar: 'SF', color: '#c4420f', time, text: 'Bien reçu. Je te reviens avant le board.' });
      } finally {
        setSending(false);
      }
    };
    return () => { window.__onSoniaLivrableReaction = null; };
  }, []);

  const isSonia = activeId === 'sonia';
  const messages = chatHistory[activeId] || [];

  const sendMessage = async () => {
    if (!draft.trim() || sending) return;
    const text = draft.trim();
    setDraft('');
    const time = slackNowTime();
    const userMsg = {
      from: getStudentName(),
      avatar: getStudentInitial(),
      color: '#1a2436',
      time, text, isMe: true
    };
    setChatHistory(h => ({ ...h, [activeId]: [...(h[activeId] || []), userMsg] }));

    const perso = INTERLOCUTEURS[activeId];
    if (perso) {
      // F35 · Le compteur d'échanges avance quel que soit l'interlocuteur.
      // Auparavant seul Sonia le faisait monter : un·e étudiant·e qui
      // commençait par Camille ne voyait jamais le livrable se signaler.
      const newCount = exchangeCount + 1;
      setExchangeCountLocal(newCount);
      if (window.__onSlackExchange) window.__onSlackExchange(newCount);
      if (window.__onSlackSent) window.__onSlackSent();
      setSending(true);

      setTimeout(async () => {
        try {
          // F36 · L'historique complet du fil partait dans le prompt à
          // chaque message. Au fil de la session il gonflait sans limite :
          // le temps de réponse dépassait la durée maximale de la fonction
          // Vercel et l'appel échouait — d'autant plus vite que l'échange
          // était avancé. On ne transmet plus que les 16 derniers messages,
          // largement assez pour la continuité.
          const history = (chatHistory[activeId] || []).filter(m => !m.typing).slice(-16).map(m =>
            `${m.isMe ? getStudentName() : perso.nom.split(' ')[0]}: ${m.text}`
          ).join('\n');
          const userPrompt = `${history}\n${getStudentName()}: ${text}\n\nRéponds maintenant en tant que ${perso.nom.split(' ')[0]} (2-4 messages courts séparés par ---SPLIT---).`;
          const resp = await window.PAC_FETCH('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: 'claude-sonnet-4-6',
              max_tokens: 600,
              system: buildPromptFor(activeId) + buildLivrableFactsBlock(),
              messages: [{ role: 'user', content: userPrompt }]
            })
          });
          if (!resp.ok) throw new Error('HTTP ' + resp.status);
          const data = await resp.json();
          if (!Array.isArray(data.content) || !data.content[0]?.text) throw new Error('Format inattendu');
          const raw = data.content.map(b => b.text || '').join('');
          const replies = raw.split('---SPLIT---').map(s => s.trim()).filter(Boolean);
          let delay = 800;
          for (const reply of replies) {
            await new Promise(r => setTimeout(r, delay));
            addIncoming(activeId, { from: perso.nom, avatar: perso.avatar, color: perso.color, time: slackNowTime(), text: reply });
            delay = 1400 + reply.length * 8;
          }
        } catch (e) {
          // F36 · L'erreur réelle est désormais tracée dans la console :
          // sans elle, une panne était indiscernable d'un choix de dialogue.
          console.error('Slack · échec de réponse (' + activeId + ')', e);
          // F35 · L'ancien message de secours (« je dois sauter dans une
          // réunion, on reprend plus tard ») clôturait la conversation :
          // en cas de coupure réseau passagère, l'étudiant·e croyait que
          // son interlocuteur l'avait quitté et n'osait plus relancer.
          // Le nouveau texte invite explicitement à réessayer.
          addIncoming(activeId, { from: perso.nom, avatar: perso.avatar, color: perso.color, time, text: perso.secours });
        } finally {
          setSending(false);
        }
      }, 600);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const activeMeta = [...channels, ...dms].find(x => x.id === activeId);

  // ── Easter egg WhatsApp ──
  const [showWhatsApp, setShowWhatsApp] = useSlackState(false);
  const openWhatsApp = (e) => {
    e.stopPropagation();
    setShowWhatsApp(true);
  };

  return (
    <div style={SS.app}>
      {/* Sidebar */}
      <div style={SS.sidebar}>
        <div style={SS.workspace}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>Lumio Health</div>
          <div style={{ fontSize: 10, opacity: 0.7, marginTop: 2 }}>● {getStudentName()} · invité</div>
        </div>
        <div style={SS.section}>
          <div style={SS.sectionTitle}>▼ Canaux</div>
          {channels.map(c => (
            <div key={c.id}
              onClick={() => { setActive(c.id); setUnreads(u => ({ ...u, [c.id]: 0 })); }}
              style={{ ...SS.item, ...(activeId === c.id ? SS.itemActive : {}), ...((unreads[c.id] || 0) > 0 ? SS.itemUnread : {}) }}>
              <span style={{ opacity: 0.7 }}>#</span>
              <span style={{ flex: 1 }}>{c.name}</span>
              {(unreads[c.id] || 0) > 0 && <span style={SS.badge}>{unreads[c.id]}</span>}
            </div>
          ))}
        </div>
        <div style={SS.section}>
          <div style={SS.sectionTitle}>▼ Messages directs</div>
          {dms.map(d => (
            <div key={d.id}
              onClick={() => { setActive(d.id); setUnreads(u => ({ ...u, [d.id]: 0 })); }}
              style={{ ...SS.item, ...(activeId === d.id ? SS.itemActive : {}), ...((unreads[d.id] || 0) > 0 ? SS.itemUnread : {}) }}>
              <span style={{ ...SS.statusDot, background: d.status === 'online' ? '#2eb67d' : '#9a9ea8' }} />
              <span style={{ flex: 1 }}>{d.name}</span>
              {(unreads[d.id] || 0) > 0 && <span style={SS.badge}>{unreads[d.id]}</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Main */}
      <div style={SS.main}>
        <div style={SS.chatHead}>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)' }}>
            {activeMeta?.type === 'channel' ? '# ' : ''}{activeMeta?.name}
          </div>
          <div style={{ fontSize: 11, color: 'var(--ink-faint)', marginTop: 2 }}>
            {activeMeta?.type === 'channel' ? `${activeMeta.members} membres` : (activeMeta?.status === 'online' ? '● En ligne' : '○ Inactif')}
          </div>
        </div>

        <div ref={scrollRef} style={SS.chatBody}>
          {messages.length === 0 && (
            <div style={{ padding: 60, textAlign: 'center', color: 'var(--ink-faint)' }}>
              Début de la conversation avec <strong>{activeMeta?.name}</strong>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} style={SS.message}>
              <div style={{ ...SS.msgAvatar, background: m.color }}>{m.avatar}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--ink)' }}>{m.from}</span>
                  <span style={{ fontSize: 11, color: 'var(--ink-faint)' }}>{m.time}</span>
                </div>
                <div style={{ fontSize: 14, color: 'var(--ink-soft)', marginTop: 1, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                  {m.text}
                </div>
                {/* Easter egg : numéro cliquable dans la signature du 3e message Sonia */}
                {m.easterEgg === 'whatsapp' && (
                  <div style={{ marginTop: 6, fontSize: 11, color: 'var(--ink-faint)' }}>
                    — Sonia F. ·{' '}
                    <span
                      onClick={openWhatsApp}
                      style={{ color: '#25D366', cursor: 'pointer', textDecoration: 'underline', fontWeight: 600 }}
                      title="WhatsApp"
                    >
                      {m.signature}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
          {sending && INTERLOCUTEURS[activeId] && (
            <div style={SS.message}>
              {/* F35 · L'indicateur affichait Sonia quel que soit l'interlocuteur. */}
              <div style={{ ...SS.msgAvatar, background: INTERLOCUTEURS[activeId].color }}>{INTERLOCUTEURS[activeId].avatar}</div>
              <div>
                <div style={{ display: 'flex', gap: 4, padding: '6px 0' }}>
                  {[0,1,2].map(i => <span key={i} style={{ ...SS.typeDot, animationDelay: `${i*0.15}s` }} />)}
                </div>
                <div style={{ fontSize: 11, color: 'var(--ink-faint)' }}>{INTERLOCUTEURS[activeId].nom.split(' ')[0]} est en train d'écrire…</div>
              </div>
            </div>
          )}
        </div>

        <div style={SS.composer}>
          <div style={SS.composerInner}>
            <textarea
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder={INTERLOCUTEURS[activeId] ? `Écris à ${INTERLOCUTEURS[activeId].nom.split(' ')[0]}…  (Entrée pour envoyer)` : `Message ${activeMeta?.type === 'channel' ? '#' + activeMeta?.name : activeMeta?.name}`}
              style={SS.textarea}
              rows={2}
            />
            <div style={SS.composerToolbar}>
              <div style={{ display: 'flex', gap: 8, color: 'var(--ink-faint)' }}>
                <span>𝐁</span><span>𝑰</span><span>🔗</span><span>📎</span><span>😊</span>
              </div>
              <button
                onClick={sendMessage}
                disabled={!draft.trim() || sending}
                style={{ ...SS.sendBtn, ...(!draft.trim() || sending ? SS.sendBtnDisabled : {}) }}>
                {sending ? '…' : '↑'}
              </button>
            </div>
          </div>
          {activeId === 'sonia' && messages.filter(m => m.isMe).length === 0 && (
            <div style={{ fontSize: 11, color: 'var(--ink-faint)', textAlign: 'center', marginTop: 8, fontStyle: 'italic' }}>
              💬 Sonia attend ton premier retour. Décris-lui ce que tu as compris du dossier.
            </div>
          )}
        </div>
      </div>

      {/* Easter egg — fenêtre WhatsApp fictive */}
      {showWhatsApp && (
        <WhatsAppModal onClose={() => setShowWhatsApp(false)} />
      )}
    </div>
  );
}

// ── WhatsApp Easter Egg ───────────────────────────────────────
function WhatsAppModal({ onClose }) {
  const waMessages = [
    { from: 'Sonia',   time: '06:51', text: "Théo a encore refusé de me donner le calendrier MDR ce matin. Je commence à penser qu'il n'a pas de calendrier." },
    { from: 'Camille', time: '06:53', text: "Je m'en doutais. Mon contact chez Biostream m'a dit que leur process a pris 22 mois." },
    { from: 'Camille', time: '06:54', text: "Si Lumio n'a pas commencé y'a plus d'un an on est pas certifiés avant 2028 au mieux." },
    { from: 'Sonia',   time: '06:55', text: "C'est ce que je craignais. On ne peut pas lancer la plateforme de marque sans cette réponse." },
    { from: 'Camille', time: '06:57', text: "Le consultant que tu as mandaté — il est au courant pour la certif ?" },
    { from: 'Sonia',   time: '06:58', text: "Il/elle a accès à l'email de Théo. À lui/elle de tirer les fils." },
    { from: 'Camille', time: '07:02', text: "J'espère. Parce que si la plateforme de marque sort avec 'expert santé certifié' sans la certif, on va se faire massacrer par Biostream." },
    { from: 'Sonia',   time: '07:03', text: "Je sais. C'est pour ça que j'ai besoin d'un diagnostic honnête, pas d'un document qui nous fait plaisir. 🙏" },
  ];

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 500,
      background: 'rgba(20,24,36,0.55)',
      backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }} onClick={onClose}>
      <div style={{
        width: 340, maxHeight: 520,
        background: '#ECE5DD',
        borderRadius: 12,
        boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden'
      }} onClick={e => e.stopPropagation()}>
        {/* Header WhatsApp */}
        <div style={{ background: '#075E54', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#128C7E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: 'white' }}>WA</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>Sonia + Camille</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)' }}>groupe privé · 2 membres</div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>×</button>
        </div>

        {/* Alerte contexte */}
        <div style={{ background: '#FFF3CD', padding: '7px 14px', fontSize: 11, color: '#856404', borderBottom: '1px solid rgba(0,0,0,0.06)', textAlign: 'center' }}>
          🔒 Conversation privée — non accessible officiellement
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {waMessages.map((m, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: m.from === 'Sonia' ? 'row-reverse' : 'row', gap: 6, alignItems: 'flex-end' }}>
              <div style={{ fontSize: 9, color: '#999', marginBottom: 2, flexShrink: 0 }}>{m.from}</div>
              <div style={{
                maxWidth: '78%',
                background: m.from === 'Sonia' ? '#DCF8C6' : 'white',
                borderRadius: m.from === 'Sonia' ? '12px 12px 3px 12px' : '12px 12px 12px 3px',
                padding: '7px 10px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                fontSize: 13, lineHeight: 1.5, color: '#1a1a1a'
              }}>
                {m.text}
                <div style={{ fontSize: 9, color: '#999', textAlign: 'right', marginTop: 3 }}>{m.time} ✓✓</div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ padding: '8px 14px', background: '#F0F0F0', fontSize: 11, color: '#5b6473', textAlign: 'center', borderTop: '1px solid rgba(0,0,0,0.08)' }}>
          À utiliser avec discernement dans votre livrable.
        </div>
      </div>
    </div>
  );
}

const SS = {
  app: { display: 'flex', height: '100%', background: 'white', overflow: 'hidden', position: 'relative' },
  sidebar: { width: 220, flexShrink: 0, background: '#3f0e40', color: 'rgba(255,255,255,0.85)', overflowY: 'auto' },
  workspace: { padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)' },
  section: { padding: '12px 0' },
  sectionTitle: { padding: '4px 16px', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.02em' },
  item: { display: 'flex', alignItems: 'center', gap: 8, padding: '4px 16px', fontSize: 13.5, cursor: 'pointer' },
  itemActive: { background: '#1164a3', color: 'white' },
  itemUnread: { fontWeight: 700, color: 'white' },
  statusDot: { width: 8, height: 8, borderRadius: '50%', flexShrink: 0 },
  badge: { marginLeft: 'auto', background: '#cd2553', color: 'white', fontSize: 10, fontWeight: 700, padding: '0 6px', borderRadius: 9, minWidth: 16, textAlign: 'center', height: 16, lineHeight: '16px' },
  main: { flex: 1, display: 'flex', flexDirection: 'column', background: 'white', minWidth: 0, overflow: 'hidden' },
  chatHead: { padding: '10px 20px', borderBottom: '1px solid var(--rule)', flexShrink: 0 },
  chatBody: { flex: 1, padding: '12px 0', overflowY: 'auto', minHeight: 0 },
  message: { display: 'flex', gap: 12, padding: '6px 20px', alignItems: 'flex-start' },
  msgAvatar: { width: 32, height: 32, borderRadius: 4, color: 'white', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  typeDot: { width: 6, height: 6, borderRadius: '50%', background: '#9a9ea8', display: 'inline-block', animation: 'typedot 1.2s infinite' },
  composer: { padding: '0 20px 12px', flexShrink: 0 },
  composerInner:{ border: '1px solid rgba(20,24,36,0.18)', borderRadius: 8, background: 'white' },
  textarea: { width: '100%', border: 'none', outline: 'none', padding: '10px 14px', fontSize: 14, fontFamily: 'inherit', resize: 'none', color: 'var(--ink)' },
  composerToolbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', borderTop: '1px solid var(--rule)' },
  sendBtn: { background: '#007a5a', color: 'white', border: 'none', borderRadius: 4, padding: '4px 12px', cursor: 'pointer', fontSize: 14, fontWeight: 700 },
  sendBtnDisabled: { background: 'rgba(20,24,36,0.1)', color: 'var(--ink-faint)', cursor: 'not-allowed' }
};

// Inject keyframes once
if (!document.getElementById('slack-keyframes')) {
  const s = document.createElement('style');
  s.id = 'slack-keyframes';
  s.textContent = '@keyframes typedot { 0%,60%,100% { opacity: 0.2; } 30% { opacity: 1; } }';
  document.head.appendChild(s);
}

window.LUMIO_APPS = window.LUMIO_APPS || {};
window.LUMIO_APPS.slack = SlackApp;
