// ══════════════════════════════════════════════════════════════
//  DATA — Mission Lumio Health BC1
// ══════════════════════════════════════════════════════════════

window.LUMIO_DATA = {
  student: {
    name: "",
    role: "Consultant·e externe — Brand Audit",
    email: "",
    company: "Indépendant·e",
    initial: "?"
  },
  ceoEmail: {
    from: "Théo Marczak <theo@lumio-health.com>",
    to: "Sonia Ferracci <sonia@lumio-health.com>",
    cc: "Camille Ott <camille.ott@lumio-health.com>",
    subject: "Re : Proposition repositionnement — mes réserves",
    date: "14 juin 2026, 23h12",
    body: `Sonia,

J'ai lu la note. Il y a des choses avec lesquelles je suis d'accord. Il y en a d'autres qui m'inquiètent.

Ce qui m'inquiète : le territoire « expert de la santé invisible » est exactement ce qu'on nous reprochera si on ne l'assume pas à 100 %. Et pour l'assumer, il faut la certification MDR. Je ne suis pas en mesure de te donner un calendrier MDR ce soir. La procédure est plus longue que prévu — l'organisme notifié nous a fait trois retours. On parle de fin Q2 2027 dans le meilleur scénario.

L'autre chose, et je préfère qu'on s'en parle clairement : les 230 entreprises clientes — on confond « contacts actifs » et « clients facturés ». Nos 180 références actives, c'est le bon chiffre. Le reste, c'est du pipe ou des comptes dormants. Si on construit la plateforme de marque sur 230, on va se faire reprendre par les commerciaux dans six mois.

Sur le budget : 380 000 € cette année, ce n'est pas possible. J'ai besoin que tu présentes une version à 200 000 € au board, pas plus. Si on dépasse, je devrai demander au fonds de revoter et tu sais ce que ça veut dire.

Je ne dis pas non à la direction "santé invisible". Je dis qu'on ne peut pas la lancer sans avoir résolu le problème MDR. Si on se positionne « expert santé » sans certification, on va se faire attaquer. Biostream n'attend que ça — Marc Léger m'a appelé la semaine dernière, il prépare une campagne comparative.

Reparlons-nous demain matin. 8h30 dans mon bureau ?

T.`
  },
  briefEmail: {
    from: "Sonia Ferracci <sonia@lumio-health.com>",
    to: "{{EMAIL_ETUDIANT}}",
    subject: "Mission de diagnostic de marque — confidentiel",
    date: "3 septembre 2026, 07h42",
    body: `{{PRENOM}},

Je vous confie une mission dont j'ai besoin qu'elle soit terminée avant notre réunion de direction du 30 septembre. Je vais être directe sur le contexte, parce que vous ne pourrez pas travailler correctement sans le connaître.

Lumio Health traverse ce que j'appellerais une crise d'identité stratégique. Pas une crise de communication — une crise plus profonde. Nous ne savons plus ce que nous sommes, ni à qui nous parlons, ni ce qui nous distingue vraiment de ce qui arrive sur notre marché.

Pendant huit ans, Théo a construit une marque B2B solide, discrète, crédible auprès des DRH. Ça fonctionnait. Et puis le fonds est entré, et tout s'est accéléré. On nous demande maintenant de devenir une marque grand public en 36 mois, sans perdre les institutionnels. Je ne dis pas que c'est impossible. Je dis que personne dans cette maison n'a formulé clairement ce que ça implique pour notre identité.

Ce qui me préoccupe le plus en ce moment, c'est la pression réglementaire. Deux de nos concurrents directs viennent d'obtenir leur certification MDR classe IIa et ils en font leur argument commercial numéro un. Nos clients DRH commencent à poser des questions. En face, Apple et Samsung occupent le grand public avec des wearables santé massivement distribués. Lumio est quelque part entre les deux — et ce « entre les deux » est un problème.

Ce que je vous demande :

1. Une note de synthèse de veille stratégique — les tendances de l'environnement qui pèsent sur nous, avec votre évaluation de leur potentiel d'opportunité ou de risque pour Lumio.

2. Une plateforme de marque — notre territoire, notre proposition de valeur, notre personnalité, nos engagements. Un document que Théo peut tenir entre les mains, défendre au board, et que mes équipes peuvent utiliser comme boussole.

J'ai déposé sur votre espace les documents internes que j'ai pu rassembler. Ils sont fragmentaires — c'est tout ce que j'ai pu obtenir sans alarmer le reste de la direction. Vous trouverez la note de cadrage que j'ai présentée au CODIR en juin (et que Théo a contestée), un rapport de veille de notre stagiaire (non relu, à prendre avec des pincettes), trois articles de presse, et un entretien avec Camille Ott — notre commerciale historique.

Quand vous aurez fait un premier tour, écrivez-moi sur Slack. Je veux savoir ce que vous voyez avant le 12 septembre.

Bonne lecture.

Sonia
Directrice Marketing — Lumio Health
+33 6 ▒▒ ▒▒ ▒▒ ▒▒`
  },
  pressArticles: [
    {
      url: "lesechos.fr/industrie-services/sante/wearable-mdr-fracture",
      source: "Les Échos",
      date: "18 avril 2026",
      author: "par Émilie Vasseur",
      headline: "Le wearable santé entre dans l'ère de la certification — et le marché se fracture",
      lede: "La mise en application pleine du règlement européen MDR crée une ligne de fracture nette dans le secteur des objets connectés de santé.",
      body: `D'un côté, les acteurs certifiés IIa qui peuvent légalement revendiquer une fonction médicale. De l'autre, ceux qui restent dans la catégorie « bien-être » — avec une crédibilité institutionnelle fragilisée. Plusieurs acheteurs hospitaliers indiquent ne plus référencer que des solutions certifiées.

« La certification, c'est devenu le ticket d'entrée. Sans elle, vous existez sur le marché grand public, mais vous disparaissez du circuit prescripteur », analyse Florence Daubray, consultante healthtech chez Roland Berger.

Pour les acteurs intermédiaires — ceux qui ont construit une légitimité B2B sans certification médicale — le piège est clair : rester dans le wellness les expose à la concurrence d'Apple et Samsung ; basculer dans le médical sans MDR les expose juridiquement.

Biostream, qui a obtenu sa classe IIa en janvier, a immédiatement augmenté ses tarifs B2B de 22 % et signé trois contrats hospitaliers en deux mois. Neuroflow a suivi en mars. La fenêtre se ferme pour les retardataires.`
    },
    {
      url: "hbrfrance.fr/strategie/donnees-stress-arme-marques-b2b",
      source: "Harvard Business Review France",
      date: "mai 2026",
      author: "par Jean-Pierre Mas",
      headline: "Stress au travail : la donnée devient l'arme des marques B2B",
      lede: "Les acteurs qui ont accumulé des historiques de mesure sur plusieurs années disposent d'un avantage concurrentiel difficile à répliquer.",
      body: `« Une base de données de stress salarié sur cinq ans, c'est un actif de R&D que vous ne pouvez pas acheter. Vous pouvez acheter le hardware, vous pouvez acheter l'algorithme. Vous ne pouvez pas acheter le temps », explique un ancien DG d'une medtech française.

La question devient : comment monétiser cet actif autrement que par l'abonnement ? Trois pistes émergent.

D'abord, le benchmark sectoriel anonymisé : vendre aux DRH non plus une mesure de leurs équipes, mais une comparaison à leur secteur. Ensuite, l'API recherche : ouvrir l'accès à des laboratoires académiques contre du co-branding scientifique. Enfin, le conseil stratégique aux assureurs santé, qui cherchent désespérément à modéliser le risque psychosocial.

Les trois modèles supposent un actif rare : la durée. Et un cadre éthique sans faille — la moindre brèche RGPD anéantit la valeur.`
    },
    {
      url: "20minutes.fr/sante/apple-watch-stress-confiance",
      source: "20 Minutes",
      date: "2 juin 2026",
      author: "par Léa Toussaint",
      headline: "« Mon Apple Watch me dit que je suis stressé — mais est-ce que ça compte vraiment ? »",
      lede: "67 % des porteurs de wearables déclarent ne pas « faire vraiment confiance » aux données santé produites par leur montre pour des décisions médicales.",
      body: `« C'est marrant comme info, mais je vais pas voir mon médecin avec ça », résume Marion, 34 ans, utilisatrice depuis trois ans. Cette méfiance de confort ouvre paradoxalement un espace pour les acteurs qui peuvent revendiquer une rigueur médicale prouvée.

L'enquête, menée par OpinionWay pour la Fédération Française des Diabétiques, révèle aussi que 41 % des porteurs aimeraient une alternative « plus sérieuse » sans pour autant renoncer au confort grand public.

Pour les acteurs medtech français, la fenêtre est étroite : prouver la rigueur sans tomber dans l'austérité, démocratiser sans banaliser. L'équation reste à inventer.`
    }
  ],
  yanisReport: {
    title: "Rapport de veille concurrentielle wearables santé",
    author: "Yassine Morel, Content Manager",
    date: "12 mai 2026",
    pages: 4,
    note: "Document rédigé en autonomie — non relu par la direction avant transmission",
    body: `INTRODUCTION

Le marché mondial des wearables santé dépasse 95 Md$ en 2025 et croît à un rythme de +18 %/an (source : Statista, IDC, March 2026). Trois forces structurent désormais le secteur :

  • La pression réglementaire (MDR en Europe, FDA aux US)
  • L'intégration verticale par les géants tech (Apple, Samsung, Google/Fitbit)
  • L'émergence de spécialistes verticaux sur des indications précises (sommeil, stress, glycémie continue)

Lumio Health se positionne historiquement sur le créneau du stress chronique mesuré en milieu professionnel, avec une approche B2B-DRH. Le présent rapport recense les acteurs concurrents directs et indirects, et propose une cartographie de la pression concurrentielle.

I. CARTOGRAPHIE CONCURRENTIELLE

[TABLEAU PRINCIPAL]

II. ANALYSE DES SIGNAUX FAIBLES

a) Salon Préventica 2026 (Lyon, 20-22 mars)

Les DRH et préventeurs interrogés citent la certification MDR comme critère de décision n°1 dans 73 % des cas (n=42 entretiens informels sur stand). Citation récurrente : « Sans certif, je peux pas justifier l'achat à mon comité d'éthique. »

b) Étude Kantar Health Monitor 2026

La certification réglementaire devient un signal de crédibilité — pas seulement une obligation légale. 58 % des DRH déclarent l'utiliser comme proxy de qualité scientifique, même quand ils ne comprennent pas le détail du règlement.

c) Mouvement des prix

Les acteurs certifiés ont tous augmenté leurs tarifs B2B de 15 à 25 % dans les six mois suivant l'obtention. Les non-certifiés sont sous pression à la baisse.

III. LACUNES NON COUVERTES

— Statut exact de la certification chez Withings (information contradictoire entre site institutionnel et discours commercial)
— Calendrier MDR de Lumio (Théo a refusé de me communiquer l'information malgré relances)
— Résultats de l'étude qualitative clients B2B menée par Camille Ott en mars 2026 (jamais reçus)
— Position d'Apple Health sur le marché entreprise français (rumeurs de partenariat avec Malakoff Humanis non confirmées)

IV. RECOMMANDATIONS

À ce stade, et sous toutes réserves liées à mon niveau d'expérience, j'identifie trois mouvements urgents :

1. Clarifier en interne le calendrier MDR de Lumio
2. Cartographier précisément les 230 clients (ou 180 ?) pour distinguer comptes actifs et dormants
3. Anticiper l'arrivée d'Apple Health sur le segment entreprise via un positionnement de niche défendable

— FIN —`,
    competitors: [
      { name: "Biostream", product: "Flow Patch Pro", mdr: "Classe IIa — janv. 2026", priceB2B: "4 200 €/an/10 ut.", funding: "Série C — 80 M$" },
      { name: "Neuroflow", product: "Calm Band", mdr: "Classe IIa — mars 2026", priceB2B: "890 €/an/10 ut.", funding: "Série B — 35 M€" },
      { name: "Withings", product: "ScanWatch 2", mdr: "Non communiqué", priceB2B: "299 €/unité", funding: "Privé — Éric Carreel" },
      { name: "Apple Health", product: "Apple Watch S10", mdr: "Hors scope MDR", priceB2B: "499 €/unité", funding: "Apple Inc." },
      { name: "Lumio Health", product: "Lumio Patch", mdr: "En cours — délai non communiqué", priceB2B: "3 800 €/an/10 ut.", funding: "Série B — 22 M$ (2025)" }
    ]
  },
  soniaNote: {
    title: "Note de cadrage — Repositionnement Lumio",
    subtitle: "« Ce que nous voulons devenir »",
    author: "Sonia Ferracci, Directrice Marketing",
    date: "12 juin 2026",
    audience: "Comité de direction — confidentiel",
    body: `CONTEXTE

Lumio Health dispose d'un actif sous-exploité : 8 ans de données propriétaires sur le stress au travail, collectées auprès de 230 entreprises clientes. Aucun concurrent direct ne possède cet historique. C'est notre vraie différence — pas le patch lui-même, qui sera répliqué d'ici 18 mois.

PROPOSITION

Repositionner Lumio comme « l'expert de la santé invisible » — le stress chronique que les gens ressentent mais ne voient pas, que les médecins ne diagnostiquent pas faute d'outil, et que les DRH n'arrivent pas à objectiver pour leurs comités sociaux.

PLATEFORME PROPOSÉE

  Territoire     : « La santé que les chiffres ne montrent pas encore »
  Promesse       : Lumio révèle ce que le corps sait mais que la médecine
                   ne capte pas
  Cibles B2B     : DRH des ETI et grands comptes (>500 salariés),
                   prescripteurs (médecine du travail, mutuelles)
  Cibles B2C     : actifs 30-50 ans, urbains, en charge mentale élevée
  Personnalité   : scientifique sans être froide
                   rassurante sans être condescendante
                   précise sans être technique
  Engagements    : 100 % des données anonymisées
                   jamais revendues à des tiers
                   open data scientifique sur 5 ans

CONDITIONS DE RÉUSSITE

Ce repositionnement suppose impérativement que la certification MDR classe IIa soit obtenue avant le lancement grand public. Sans certification, le territoire « expert santé » est intenable et nous expose à des attaques juridiques de la part des concurrents certifiés.

J'ai besoin d'un engagement de Théo sur le calendrier MDR avant fin juin pour pouvoir lancer les travaux créatifs.

BUDGET

Déploiement 12 mois : 380 000 € (créa, prod, médias B2B, événementiel)
Phase B2C ultérieure : à chiffrer en fonction de la date MDR

Cette note est un point de départ, pas un livrable. J'attends vos retours en CODIR du 18 juin.

Sonia`
  },
  camilleVerbatims: [
    {
      duration: "01:42",
      title: "Sur la rupture dans les conversations clients",
      transcript: `Ce que je vis depuis six mois, c'est une vraie rupture dans les conversations avec nos clients. Avant, on nous achetait sur la confiance — sur huit ans de relation, sur des cas d'usage, sur la qualité de la data. Aujourd'hui, les DRH arrivent en réunion avec des questions sur la certification. Pas agressivement — embarrassés, comme si c'était indiscret de demander. Mais ils demandent quand même. Et c'est récent. C'est de cette année. C'est pas encore un dealbreaker, mais c'est une horloge. Je le sens à la façon dont ils tournent autour du sujet en début de rendez-vous, comme s'ils voulaient cocher la case avant de passer à la vraie discussion.`
    },
    {
      duration: "00:58",
      title: "Sur la pression Biostream",
      transcript: `Nos clients actuels nous font encore confiance. Mais si Biostream se pointe chez eux avec sa certification IIa et un prix légèrement inférieur, la conversation va changer très vite. Moi je peux défendre Lumio sur la qualité des données, sur l'historique, sur la relation. Je ne peux pas défendre une absence de certification indéfiniment. Au bout d'un moment, le client va dire « j'ai un comité d'éthique, je peux pas continuer avec un fournisseur non certifié ». Et là j'aurai plus d'arguments.`
    },
    {
      duration: "01:15",
      title: "La question que personne ne pose",
      transcript: `La question que Sonia ne se pose peut-être pas assez, et que Théo refuse de se poser : nos clients B2B historiques, est-ce qu'ils nous voient toujours comme une solution professionnelle de référence, ou est-ce qu'ils commencent à nous voir comme « le truc d'avant que les vrais certifiés sont arrivés » ? Parce que si c'est ça, aucune plateforme de marque ne résoudra le problème. C'est trop tard, l'image est cuite. Moi je pense qu'on est à six mois, peut-être neuf, du basculement. Après, ce sera un travail de reconquête. Beaucoup plus cher.`
    }
  ],
  slackMessages: {
    initial: [
      { from: "Sonia Ferracci", time: "07:48", text: "Salut {{PRENOM}} — bien reçu mon mail ? J'ai déposé tous les docs sur ton espace partagé.", read: true },
      { from: "Sonia Ferracci", time: "07:48", text: "Prends ta matinée pour digérer, et écris-moi quand tu as une première lecture.", read: true },
    ],
    delayed: [
      { from: "Camille Ott", time: "+8min", text: "Hello 👋 j'ai vu que Sonia t'avait briefé. Si tu veux qu'on se parle dans la semaine, dis-moi. Je travaille pas dans la même réalité que la direction sur ce dossier 🙃", channel: "DM" },
      { from: "Sonia Ferracci", time: "+15min", text: "Au fait — n'oublie pas que Théo ne sait pas que tu as accès à son mail du 14 juin. À toi de juger comment l'utiliser.", channel: "DM" },
    ]
  }
,
  finder: {
    folders: {
      guide: {
        title: 'Guide de mission',
        sidebar: '⌘ Guide',
        icon: '📕',
        items: [
          { kind: 'mail', name: 'Brief de mission', app: 'mail', props: { openId: 'brief' } }
        ]
      },
      espace: {
        title: 'Espace de travail',
        sidebar: 'Espace de travail',
        icon: '📁',
        items: [
          { kind: 'mail', name: 'Boîte mail', app: 'mail', props: {} },
          { kind: 'note', name: 'Notes', app: 'notes', props: {} },
          { kind: 'audio', name: 'Mémos vocaux', app: 'voice', props: {} }
        ]
      }
    },
    order: ['guide', 'espace']
  }
};

// ══════════════════════════════════════════════════════════════
//  PAC_CONFIG — Configuration du Parcours d'Activation BC1
//  Remplace window.PASS_CONFIG dans app-livrable et app-assistant
// ══════════════════════════════════════════════════════════════
window.PASS_CONFIG = {
  bloc: 'bc1',
  epreuve: 'MSMC RNCP 38504 · Bloc 1',
  deadline: '30 septembre 2026 · CODIR 09h00',
  dureeMin: 210,
  competences: [
    {
      code: 'C.1',
      label: 'Veille stratégique — tendances de l\'environnement',
      rncp: 'Identifier et hiérarchiser les tendances de l\'environnement marketing et médiatique susceptibles d\'impacter la stratégie de marque.',
      min: 120,
      motsCles: ['MDR', 'certification', 'concurrence', 'tendance'],
      conseil: 'Citez des faits issus des documents (données chiffrées, citations). Ne listez pas — hiérarchisez.',
      placeholder: 'Identifiez les 3-4 tendances majeures qui pèsent sur Lumio Health. Pour chacune : faits + impact potentiel (opportunité ou risque).'
    },
    {
      code: 'C.2',
      label: 'Diagnostic — forces, faiblesses, opportunités, menaces',
      rncp: 'Conduire un diagnostic stratégique interne et externe de la marque en s\'appuyant sur des sources documentées.',
      min: 150,
      motsCles: ['B2B', 'B2C', 'actif', 'risque', 'Biostream'],
      conseil: 'Appuyez-vous sur les contradictions entre les documents (230 vs 180 clients, 380K vs 200K€, calendrier MDR).',
      placeholder: 'Diagnostic de Lumio Health : forces (actifs réels), faiblesses (points de fragilité), opportunités (ce qui est à saisir), menaces (ce qui peut tuer la marque).'
    },
    {
      code: 'C.3',
      label: 'Identification des tensions et contradictions',
      rncp: 'Repérer et analyser les tensions stratégiques internes susceptibles de bloquer la cohérence de la plateforme de marque.',
      min: 100,
      motsCles: ['tension', 'contradiction', 'MDR', 'budget', 'clients'],
      conseil: 'Les documents se contredisent : 230 vs 180 clients, budget 380K vs 200K€, MDR "en cours" vs "fin Q2 2027". Ce sont des matériaux, pas des bugs.',
      placeholder: 'Quelles contradictions avez-vous identifiées dans les documents ? Quelle est leur impact sur la cohérence de la marque ?'
    },
    {
      code: 'C.4',
      label: 'Recommandation stratégique',
      rncp: 'Formuler une recommandation de positionnement argumentée, réaliste et hiérarchisée, adaptée aux contraintes internes et à la pression concurrentielle.',
      min: 150,
      motsCles: ['positionnement', 'recommandation', 'priorité', 'arbitrage'],
      conseil: 'Votre recommandation doit être défendable face à Théo ET face à Sonia. Elle doit tenir compte du calendrier MDR réel.',
      placeholder: 'Votre recommandation : quel positionnement, pour quelle cible prioritaire, avec quelles conditions de réussite ?',
      gabarits: null
    },
    {
      code: 'C.5',
      label: 'Plateforme de marque — territoire et promesse',
      rncp: 'Co-construire une plateforme de marque cohérente : territoire, promesse, personnalité, engagements.',
      min: 150,
      motsCles: ['territoire', 'promesse', 'personnalité', 'engagement'],
      conseil: 'La plateforme doit être utilisable comme boussole par les équipes. Évitez le jargon — chaque mot doit être défendable en CODIR.',
      placeholder: 'Territoire · Promesse · Personnalité · Engagements. Soyez précis — ce document sera soumis au board.'
    },
    {
      code: 'C.6',
      label: 'Prise de position — arbitrage et limites',
      rncp: 'Identifier les limites de la plateforme proposée et formuler les conditions de sa mise en œuvre.',
      min: 100,
      motsCles: ['limite', 'condition', 'risque', 'arbitrage', 'MDR'],
      conseil: 'Une bonne plateforme de marque sait ce qu\'elle ne peut pas promettre. Nommez explicitement les conditions qui doivent être remplies.',
      placeholder: 'Quelles sont les limites de votre recommandation ? Quelles conditions doivent être remplies pour qu\'elle tienne ?'
    }
  ],
  // Fiche identitaire — aide-mémoire latéral C.5/C.6
  // Remappée verbatim depuis soniaNote.body (PLATEFORME PROPOSÉE) — aucun contenu inventé.
  ficheIdentitaire: {
    source: 'D\'après la note de cadrage de Sonia Ferracci (12 juin 2026) — proposition à challenger, pas à recopier.',
    territoirePropose: '« La santé que les chiffres ne montrent pas encore »',
    promesse: 'Lumio révèle ce que le corps sait mais que la médecine ne capte pas.',
    ciblesB2B: 'DRH des ETI et grands comptes (>500 salariés), prescripteurs (médecine du travail, mutuelles).',
    ciblesB2C: 'Actifs 30-50 ans, urbains, en charge mentale élevée.',
    personnalite: 'Scientifique sans être froide · rassurante sans être condescendante · précise sans être technique.',
    engagements: '100 % des données anonymisées · jamais revendues à des tiers · open data scientifique sur 5 ans.',
    tension: 'Cette plateforme suppose la certification MDR classe IIa avant le lancement grand public. Or Théo ne s\'engage sur aucun calendrier (fin Q2 2027 au mieux en interne). Sans certification, le territoire « expert santé » est intenable et expose Lumio à des attaques juridiques des concurrents certifiés.'
  },
  // Grille d'évaluation pour le portfolio — niveaux RNCP
  grilleEvaluation: {
    niveaux: ['Maximale', 'Haute', 'Moyenne', 'Insuffisante'],
    acquis: ['Maximale', 'Haute', 'Moyenne'] // tout sauf Insuffisante = acquis
  }
};
// Alias pour compatibilité
window.PAC_CONFIG = window.PASS_CONFIG;

// === [PAC v2 complétion] juryPrompt + dispositif + accroche — auto-ajout ===
(function() {
  var cfg = window.PAC_CONFIG || window.PASS_CONFIG;
  if (!cfg) return;
  if (!cfg.juryPrompt) cfg.juryPrompt = "Tu es le jury certifiant du bloc 1 (Manager Stratégie Marketing & Communication — MSMC, RNCP 38504).\nContexte : Lumio Health — Sonia Ferracci, nouvelle Directrice Marketing, doit construire la plateforme de marque dans un contexte de tensions entre B2B installé (180 clients pros) et pression de pivot B2C portée par Northgate Capital. Calendrier MDR classe IIa incertain (au mieux fin Q2 2027). Septembre 2026, CODIR du 30 septembre 09h00.\nTu évalues une production étudiante aux critères RNCP stricts. Sois exigeant mais juste.\nCritères éliminatoires :\n- L'absence de toute hiérarchisation des tendances de l'environnement (4 tendances listées au minimum, avec sources documentées et impacts différenciés) invalide la compétence C.1.\n- Le diagnostic se contente d'une liste FFOM sans s'appuyer sur les contradictions documentées entre les sources (230 vs 180 clients B2B, 380K vs 200K€ de budget, calendrier MDR fluctuant) : la compétence C.2 est non validée.\n- Les tensions internes nommées dans C.3 ne désignent ni acteurs (Théo / Sonia / Jakob), ni mécanismes concrets de blocage : la compétence reste descriptive et non analytique.\n- La recommandation stratégique (C.4) ne peut être défendue à la fois face à Théo et à Sonia, ou ignore le calendrier MDR réel : elle est invalidée pour défaut de réalisme.\n- La plateforme de marque (C.5) ne couvre pas les quatre dimensions attendues (territoire / promesse / personnalité / engagements) ou se limite à du vocabulaire générique non défendable en CODIR.\n- Aucune condition de mise en œuvre n'est nommée (C.6) — la plateforme prétend tenir sans la MDR ou sans arbitrage budgétaire : invalidation immédiate.\n\nRéponds EXACTEMENT dans ce format :\n### C.1 — [Satisfaisant / Insuffisant / Absent]\nUne phrase de retour précise et exigeante.\n\n### C.2 — [Satisfaisant / Insuffisant / Absent]\nUne phrase de retour précise et exigeante.\n\n### C.3 — [Satisfaisant / Insuffisant / Absent]\nUne phrase de retour précise et exigeante.\n\n### C.4 — [Satisfaisant / Insuffisant / Absent]\nUne phrase de retour précise et exigeante.\n\n### C.5 — [Satisfaisant / Insuffisant / Absent]\nUne phrase de retour précise et exigeante.\n\n### C.6 — [Satisfaisant / Insuffisant / Absent]\nUne phrase de retour précise et exigeante.\n\n## Niveau global\n**[Non conforme / Partiellement conforme / Conforme / Conforme avec distinction]**\n\n## Question de jury\nUne question dérangeante que tu poserais à l'oral.";
  if (!cfg.dispositif) cfg.dispositif = "PAC";
  if (!cfg.commanditaire) cfg.commanditaire = "Sonia Ferracci";
  if (!cfg.accroche_namescreen) cfg.accroche_namescreen = {"intro":"Tu es {{STUDENT}}, consultant·e externe missionné·e par Sonia Ferracci, nouvelle Directrice Marketing de Lumio Health. Tu disposes d'un poste de mission dédié pour construire la plateforme de marque.","ratio_label":"18 jours dans l'univers Lumio","regles":[{"ico":"📄","txt":"Tout ce que tu sais, c'est dans les documents du poste de mission."},{"ico":"🤐","txt":"Le jury teste chaque hypothèse. Il ne cherche pas à t'aider — il évalue."},{"ico":"💬","txt":"Quand tu as une hypothèse solide → Slack → ton commanditaire. Sa réaction débloque la suite."}]};
  window.PAC_CONFIG = cfg;
  window.PASS_CONFIG = cfg;
})();
// === [PAC v2 complétion] fin ===


// === [Chantier PDF+Browser] dossiers/guide/portraits — 02/07/2026 (régénéré 01/07 après correction Yassine Morel) ===
// Restructuration de D.yanisReport (déjà écrit, nom/rôle corrigés) en D.dossiers[]. Guide laissé sans tips.
// Aucun contenu narratif nouveau : uniquement restructuration + câblage.
(function() {
  var D = window.LUMIO_DATA;
  if (!D) return;
  D.dossiers = [
  {
    "id": "rapport-veille",
    "title": "Rapport de veille concurrentielle wearables santé",
    "tab": "Veille concurrentielle",
    "accent": "#1b3a6b",
    "type": "rich",
    "pages": [
      {
        "kicker": "Yassine Morel, Content Manager",
        "title": "Rapport de veille concurrentielle wearables santé",
        "byline": "Yassine Morel, Content Manager · 12 mai 2026",
        "blocks": [
          {
            "type": "h3",
            "text": "INTRODUCTION"
          },
          {
            "type": "p",
            "text": "Le marché mondial des wearables santé dépasse 95 Md$ en 2025 et croît à un rythme de +18 %/an (source : Statista, IDC, March 2026). Trois forces structurent désormais le secteur :"
          },
          {
            "type": "ul",
            "items": [
              "La pression réglementaire (MDR en Europe, FDA aux US)",
              "L'intégration verticale par les géants tech (Apple, Samsung, Google/Fitbit)",
              "L'émergence de spécialistes verticaux sur des indications précises (sommeil, stress, glycémie continue)"
            ]
          },
          {
            "type": "p",
            "text": "Lumio Health se positionne historiquement sur le créneau du stress chronique mesuré en milieu professionnel, avec une approche B2B-DRH. Le présent rapport recense les acteurs concurrents directs et indirects, et propose une cartographie de la pression concurrentielle."
          },
          {
            "type": "h3",
            "text": "I. CARTOGRAPHIE CONCURRENTIELLE"
          },
          {
            "type": "h3",
            "text": "[TABLEAU PRINCIPAL]"
          },
          {
            "type": "h3",
            "text": "II. ANALYSE DES SIGNAUX FAIBLES"
          },
          {
            "type": "p",
            "text": "a) Salon Préventica 2026 (Lyon, 20-22 mars)"
          },
          {
            "type": "p",
            "text": "Les DRH et préventeurs interrogés citent la certification MDR comme critère de décision n°1 dans 73 % des cas (n=42 entretiens informels sur stand). Citation récurrente : « Sans certif, je peux pas justifier l'achat à mon comité d'éthique. »"
          },
          {
            "type": "p",
            "text": "b) Étude Kantar Health Monitor 2026"
          },
          {
            "type": "p",
            "text": "La certification réglementaire devient un signal de crédibilité — pas seulement une obligation légale. 58 % des DRH déclarent l'utiliser comme proxy de qualité scientifique, même quand ils ne comprennent pas le détail du règlement."
          },
          {
            "type": "p",
            "text": "c) Mouvement des prix"
          },
          {
            "type": "p",
            "text": "Les acteurs certifiés ont tous augmenté leurs tarifs B2B de 15 à 25 % dans les six mois suivant l'obtention. Les non-certifiés sont sous pression à la baisse."
          },
          {
            "type": "h3",
            "text": "III. LACUNES NON COUVERTES"
          },
          {
            "type": "p",
            "text": "— Statut exact de la certification chez Withings (information contradictoire entre site institutionnel et discours commercial)\n— Calendrier MDR de Lumio (Théo a refusé de me communiquer l'information malgré relances)\n— Résultats de l'étude qualitative clients B2B menée par Camille Ott en mars 2026 (jamais reçus)\n— Position d'Apple Health sur le marché entreprise français (rumeurs de partenariat avec Malakoff Humanis non confirmées)"
          },
          {
            "type": "h3",
            "text": "IV. RECOMMANDATIONS"
          },
          {
            "type": "p",
            "text": "À ce stade, et sous toutes réserves liées à mon niveau d'expérience, j'identifie trois mouvements urgents :"
          },
          {
            "type": "p",
            "text": "1. Clarifier en interne le calendrier MDR de Lumio\n2. Cartographier précisément les 230 clients (ou 180 ?) pour distinguer comptes actifs et dormants\n3. Anticiper l'arrivée d'Apple Health sur le segment entreprise via un positionnement de niche défendable"
          },
          {
            "type": "h3",
            "text": "— FIN —"
          }
        ]
      }
    ]
  }
];
  D.guide = {
  "tips": []
};
  D.portraits = [
  {
    "key": "theo_marczak",
    "title": "Théo Marczak",
    "file": "portraits/portrait_theo_marczak.html"
  },
  {
    "key": "sonia_ferracci",
    "title": "Sonia Ferracci",
    "file": "portraits/portrait_sonia_ferracci.html"
  },
  {
    "key": "camille_ott",
    "title": "Camille Ott",
    "file": "portraits/portrait_camille_ott.html"
  },
  {
    "key": "jakob_rein",
    "title": "Jakob Rein",
    "file": "portraits/portrait_jakob_rein.html"
  },
  {
    "key": "yassine_morel",
    "title": "Yassine Morel",
    "file": "portraits/portrait_yassine_morel.html"
  }
];
  D.finder = D.finder || { folders: {}, order: [] };
  D.finder.folders.portraits = {
  "title": "Portraits",
  "sidebar": "👥 Portraits",
  "icon": "👥",
  "items": [
    {
      "kind": "portrait",
      "name": "Théo Marczak",
      "app": "browser",
      "props": {
        "openPortrait": "theo_marczak"
      }
    },
    {
      "kind": "portrait",
      "name": "Sonia Ferracci",
      "app": "browser",
      "props": {
        "openPortrait": "sonia_ferracci"
      }
    },
    {
      "kind": "portrait",
      "name": "Camille Ott",
      "app": "browser",
      "props": {
        "openPortrait": "camille_ott"
      }
    },
    {
      "kind": "portrait",
      "name": "Jakob Rein",
      "app": "browser",
      "props": {
        "openPortrait": "jakob_rein"
      }
    },
    {
      "kind": "portrait",
      "name": "Yassine Morel",
      "app": "browser",
      "props": {
        "openPortrait": "yassine_morel"
      }
    }
  ]
};
  if (D.finder.order.indexOf('portraits') === -1) {
    var gIdx = D.finder.order.indexOf('guide');
    D.finder.order.splice(gIdx >= 0 ? gIdx + 1 : 0, 0, 'portraits');
  }
})();
// === [Chantier PDF+Browser] fin ===
