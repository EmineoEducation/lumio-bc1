// ─── Guide de mission ────────────────────────────────────────
function GuideApp() {
  const G = {
    app: { display: 'flex', flexDirection: 'column', height: '100%', background: '#1a2436', overflow: 'hidden' },
    header: { padding: '20px 28px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 },
    eyebrow: { fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(196,66,15,0.8)', marginBottom: 6 },
    title: { fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 300, color: 'rgba(255,255,255,0.92)', lineHeight: 1.2 },
    body: { flex: 1, overflowY: 'auto', padding: '20px 28px', display: 'flex', flexDirection: 'column', gap: 16, minHeight: 0 },
    section: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '16px 20px' },
    sectionDay: { fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(196,66,15,0.7)', marginBottom: 8 },
    sectionTitle: { fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.88)', marginBottom: 8 },
    tip: { fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.65, fontFamily: 'var(--font-display)', fontStyle: 'italic' },
    action: { marginTop: 10, padding: '8px 12px', background: 'rgba(255,255,255,0.06)', borderRadius: 5, fontSize: 12, color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-mono)' },
    divider: { height: 1, background: 'rgba(255,255,255,0.06)' },
    footer: { padding: '12px 28px', borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: 11, color: 'rgba(255,255,255,0.25)', fontFamily: 'var(--font-mono)', flexShrink: 0 }
  };

  const tips = [
    {
      day: 'J−18 · Entrée dans la mission',
      title: 'Par où commencer ?',
      body: 'Tu as accès à 8 apps sur ce desktop. Elles contiennent toutes quelque chose d\'utile. Commence par Mail — Sonia Ferracci t\'a écrit hier soir. Sa lettre de mission est là.',
      action: '→ Mail → Lettre de mission — Sonia Ferracci'
    },
    {
      day: 'J−12 · Après lecture des documents',
      title: 'Croiser les sources',
      body: 'Tu remarqueras des contradictions entre les documents. C\'est voulu — c\'est le cœur du travail. Sonia parle de 230 clients. Théo dit 180. La certification MDR est "en cours" depuis un moment. Camille Ott sait des choses que les autres ne disent pas.',
      action: '→ Mémos vocaux → 3 enregistrements de Camille Ott'
    },
    {
      day: 'J−7 · Passer à l\'action',
      title: 'Sonia attend une réaction',
      body: 'Tu n\'as pas besoin d\'avoir tout compris pour écrire à Sonia. Envoie-lui ta première impression — même imparfaite. C\'est comme ça que la mission avance. Elle répondra, et la réponse t\'apportera de nouveaux éléments.',
      action: '→ Slack → DM Sonia Ferracci'
    },
    {
      day: 'J−3 · Finaliser',
      title: 'Rédiger le livrable',
      body: 'L\'app Livrable t\'attend dans le dock (icône verte). Tu dois produire deux choses : une note de synthèse de veille stratégique et une plateforme de marque. Ce n\'est pas un résumé des documents — c\'est une prise de position professionnelle.',
      action: '→ Dock → Livrable (icône verte avec coche)'
    },
    {
      day: 'En cas de blocage',
      title: 'Ce que tu cherches est dans ces apps',
      body: 'Si tu tournes en rond, ouvre le Finder → Mission Lumio. Tous les documents sont là. Si tu ne sais pas quoi écrire à Sonia, commence par une phrase : "Après lecture du dossier, je pense que le vrai problème est…" et complète.',
      action: '→ Finder → Mission Lumio'
    }
  ];

  return (
    <div style={G.app}>
      <div style={G.header}>
        <div style={G.eyebrow}>Guide de mission · BC1 · PAC</div>
        <div style={G.title}>Lumio Health — aide au parcours</div>
      </div>
      <div style={G.body}>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', fontStyle: 'italic', fontFamily: 'var(--font-display)', padding: '0 0 4px' }}>
          Ce guide est là si tu te sens bloqué. Il ne donne pas les réponses — il indique où chercher.
        </div>
        {tips.map((t, i) => (
          <div key={i} style={G.section}>
            <div style={G.sectionDay}>{t.day}</div>
            <div style={G.sectionTitle}>{t.title}</div>
            <div style={G.tip}>{t.body}</div>
            <div style={G.action}>{t.action}</div>
          </div>
        ))}
        <div style={G.divider} />
        <div style={{ ...G.section, background: 'rgba(26,102,65,0.08)', borderColor: 'rgba(26,102,65,0.2)' }}>
          <div style={{ ...G.sectionDay, color: 'rgba(26,102,65,0.8)' }}>Rappel · Livrable final</div>
          <div style={G.sectionTitle}>Ce que tu dois produire</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
            {[
              ['C.1 / C.2', 'Note de synthèse veille — tendances réglementaires, concurrentielles, sociocomportementales. Chaque tendance qualifiée : opportunité ou risque pour Lumio.'],
              ['C.3 → C.6', 'Plateforme de marque — territoire, proposition de valeur, cibles B2B / B2C différenciées, personnalité, engagements RSE. Cohérente avec les vraies contraintes (MDR, budget, 180 références actives).']
            ].map(([badge, desc]) => (
              <div key={badge} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, padding: '2px 7px', background: 'rgba(26,102,65,0.2)', color: 'rgba(26,102,65,0.9)', borderRadius: 4, flexShrink: 0, marginTop: 2 }}>{badge}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={G.footer}>Ce guide est disponible à tout moment via le bouton ? en bas à gauche du desktop.</div>
    </div>
  );
}

// ─── PDF Viewer ───────────────────────────────────────────────
const { useState: usePdfState } = React;

function PdfApp({ openGuide }) {
  const D = window.LUMIO_DATA;
  const r = D.yanisReport;
  const [page, setPage] = usePdfState(1);

  // Si openGuide, afficher le guide de mission
  if (openGuide) return <GuideApp />;

  const totalPages = 4;

  return (
    <div style={pdfStyles.app}>
      <div style={pdfStyles.toolbar}>
        <div style={pdfStyles.tbGroup}>
          <button style={pdfStyles.tbBtn}>↩</button>
          <button style={pdfStyles.tbBtn}>↪</button>
        </div>
        <div style={pdfStyles.tbDivider} />
        <div style={pdfStyles.tbGroup}>
          <button style={pdfStyles.tbBtn} onClick={() => setPage(Math.max(1, page-1))}>‹</button>
          <span style={pdfStyles.pageInd}>{page} / {totalPages}</span>
          <button style={pdfStyles.tbBtn} onClick={() => setPage(Math.min(totalPages, page+1))}>›</button>
        </div>
        <div style={pdfStyles.tbDivider} />
        <div style={pdfStyles.tbGroup}>
          <button style={pdfStyles.tbBtn}>—</button>
          <span style={{ fontSize: 11, color: 'var(--ink-soft)', minWidth: 36, textAlign: 'center' }}>100 %</span>
          <button style={pdfStyles.tbBtn}>+</button>
        </div>
        <div style={{ flex: 1 }} />
        <button style={pdfStyles.tbBtn}>🔍</button>
        <button style={pdfStyles.tbBtn}>🖨</button>
        <button style={pdfStyles.tbBtn}>↗</button>
      </div>

      <div style={pdfStyles.body}>
        <div style={pdfStyles.thumbCol} className="scroll">
          {[1,2,3,4].map(p => (
            <div
              key={p}
              onClick={() => setPage(p)}
              style={{ ...pdfStyles.thumb, ...(page===p ? pdfStyles.thumbActive : {}) }}>
              <div style={pdfStyles.thumbPage}>
                <div style={{ height: 4, background: '#1a2436', width: '70%', margin: '4px auto' }} />
                <div style={{ height: 2, background: '#9a9ea8', width: '85%', margin: '3px auto' }} />
                <div style={{ height: 2, background: '#9a9ea8', width: '85%', margin: '2px auto' }} />
                <div style={{ height: 2, background: '#9a9ea8', width: '60%', margin: '2px auto' }} />
                <div style={{ height: 2, background: '#9a9ea8', width: '85%', margin: '6px auto 2px' }} />
                <div style={{ height: 2, background: '#9a9ea8', width: '85%', margin: '2px auto' }} />
                <div style={{ height: 2, background: '#9a9ea8', width: '50%', margin: '2px auto' }} />
              </div>
              <div style={pdfStyles.thumbLabel}>{p}</div>
            </div>
          ))}
        </div>

        <div style={pdfStyles.pageWrap} className="scroll">
          {page === 1 && <PdfPage1 r={r} />}
          {page === 2 && <PdfPage2 r={r} />}
          {page === 3 && <PdfPage3 r={r} />}
          {page === 4 && <PdfPage4 r={r} />}
        </div>
      </div>
    </div>
  );
}

const PdfPage1 = ({ r }) => (
  <div style={pdfStyles.page}>
    <div style={{ borderBottom: '2px solid #1a2436', paddingBottom: 14, marginBottom: 24 }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.18em', color: '#c4420f', textTransform: 'uppercase' }}>Note interne · Mai 2026 · Confidentiel</div>
    </div>
    <h1 style={pdfStyles.title}>{r.title}</h1>
    <div style={pdfStyles.byline}>{r.author} · {r.date}</div>
    <div style={pdfStyles.warningBox}>
      ⚠ <strong>Document non relu</strong> — finalisé la veille de la fin de stage. Les chiffres et conclusions n'ont pas été validés par la direction. À utiliser avec précaution.
    </div>
    <h2 style={pdfStyles.h2}>Introduction</h2>
    <p style={pdfStyles.p}>Le marché mondial des wearables santé dépasse <strong>95 Md$</strong> en 2025 et croît à un rythme de <strong>+18 %/an</strong> (source : Statista, IDC, mars 2026). Trois forces structurent désormais le secteur :</p>
    <ul style={pdfStyles.ul}>
      <li>La pression réglementaire (MDR en Europe, FDA aux US)</li>
      <li>L'intégration verticale par les géants tech (Apple, Samsung, Google/Fitbit)</li>
      <li>L'émergence de spécialistes verticaux sur des indications précises (sommeil, stress, glycémie continue)</li>
    </ul>
    <p style={pdfStyles.p}>Lumio Health se positionne historiquement sur le créneau du stress chronique mesuré en milieu professionnel, avec une approche B2B-DRH. Le présent rapport recense les acteurs concurrents directs et indirects, et propose une cartographie de la pression concurrentielle.</p>
    <div style={pdfStyles.pageNum}>— 1 —</div>
  </div>
);

const PdfPage2 = ({ r }) => (
  <div style={pdfStyles.page}>
    <h2 style={pdfStyles.h2}>I. Cartographie concurrentielle</h2>
    <table style={pdfStyles.table}>
      <thead>
        <tr>
          <th>Acteur</th><th>Produit</th><th>Certif. MDR</th><th>Prix B2B</th><th>Funding</th>
        </tr>
      </thead>
      <tbody>
        {r.competitors.map((c, i) => (
          <tr key={i} style={c.name === 'Lumio Health' ? { background: '#fff8d8' } : {}}>
            <td><strong>{c.name}</strong></td>
            <td>{c.product}</td>
            <td style={c.mdr.includes('IIa') ? { color: '#0a7a6e', fontWeight: 600 } : (c.mdr.includes('cours') ? { color: '#c4420f' } : {})}>{c.mdr}</td>
            <td style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{c.priceB2B}</td>
            <td style={{ fontSize: 11 }}>{c.funding}</td>
          </tr>
        ))}
      </tbody>
    </table>
    <div style={pdfStyles.handAnnotation}>
      <span style={{ background: '#fff8b0', padding: '2px 6px', display: 'inline-block', transform: 'rotate(-1deg)', fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 13, color: '#a02020', border: '1px dashed #c4420f' }}>
        ↑ Yanis : « 230 ou 180 ? À clarifier avec Camille »
      </span>
    </div>
    <h2 style={pdfStyles.h2}>II. Analyse des signaux faibles</h2>
    <h3 style={pdfStyles.h3}>a) Salon Préventica 2026 (Lyon, 20-22 mars)</h3>
    <p style={pdfStyles.p}>Les DRH et préventeurs interrogés citent la certification MDR comme critère de décision n°1 dans <strong>73 % des cas</strong> (n=42 entretiens informels sur stand). Citation récurrente : « Sans certif, je peux pas justifier l'achat à mon comité d'éthique. »</p>
    <h3 style={pdfStyles.h3}>b) Étude Kantar Health Monitor 2026</h3>
    <p style={pdfStyles.p}>La certification réglementaire devient un <em>signal de crédibilité</em> — pas seulement une obligation légale. <strong>58 % des DRH</strong> déclarent l'utiliser comme proxy de qualité scientifique, même quand ils ne comprennent pas le détail du règlement.</p>
    <div style={pdfStyles.pageNum}>— 2 —</div>
  </div>
);

const PdfPage3 = ({ r }) => (
  <div style={pdfStyles.page}>
    <h3 style={pdfStyles.h3}>c) Mouvement des prix</h3>
    <p style={pdfStyles.p}>Les acteurs certifiés ont tous augmenté leurs tarifs B2B de <strong>15 à 25 %</strong> dans les six mois suivant l'obtention. Les non-certifiés sont sous pression à la baisse.</p>

    <h2 style={pdfStyles.h2}>III. Lacunes non couvertes</h2>
    <ul style={pdfStyles.ul}>
      <li>Statut exact de la certification chez <strong>Withings</strong> — information contradictoire entre site institutionnel et discours commercial</li>
      <li>Calendrier MDR de Lumio — <em>Théo a refusé de me communiquer l'information malgré relances</em></li>
      <li>Résultats de l'étude qualitative clients B2B menée par <strong>Camille Ott</strong> en mars 2026 — jamais reçus</li>
      <li>Position d'Apple Health sur le marché entreprise français — rumeurs de partenariat avec Malakoff Humanis non confirmées</li>
    </ul>

    <div style={{ ...pdfStyles.warningBox, background: '#e8f0e0', borderColor: '#0a7a6e', color: '#1a3a30' }}>
      💡 <strong>Note Yanis</strong> : J'ai relancé Camille trois fois pour obtenir l'étude qualitative B2B. Réponse type : « j'envoie ce soir ». Jamais reçu. À creuser ?
    </div>
    <div style={pdfStyles.pageNum}>— 3 —</div>
  </div>
);

const PdfPage4 = ({ r }) => (
  <div style={pdfStyles.page}>
    <h2 style={pdfStyles.h2}>IV. Recommandations</h2>
    <p style={pdfStyles.p}>À ce stade, et sous toutes réserves liées à mon niveau d'expérience, j'identifie trois mouvements urgents :</p>
    <ol style={pdfStyles.ul}>
      <li><strong>Clarifier en interne le calendrier MDR de Lumio.</strong> Sans cette information, toute communication externe est risquée.</li>
      <li><strong>Cartographier précisément les 230 clients</strong> (ou 180 ?) pour distinguer comptes actifs et dormants. Le chiffre communiqué au board doit refléter la réalité commerciale, pas l'historique.</li>
      <li><strong>Anticiper l'arrivée d'Apple Health</strong> sur le segment entreprise via un positionnement de niche défendable. La concurrence frontale n'est pas tenable.</li>
    </ol>

    <div style={{ marginTop: 60, paddingTop: 20, borderTop: '1px solid #ccc', fontFamily: 'var(--font-display)', fontStyle: 'italic', color: '#6a6f7a', fontSize: 12 }}>
      <p>Je tiens à remercier l'ensemble de l'équipe marketing pour leur accueil pendant ces six mois. Cette mission a été passionnante mais je termine avec le sentiment de n'avoir vu qu'une partie du sujet — beaucoup de questions sont restées sans réponse, faute d'accès à l'information.</p>
      <p style={{ marginTop: 14 }}>Yanis Morel<br/>Stagiaire Marketing — Lumio Health<br/>Master 2 Sciences Po Strategic Communication<br/>12 mai 2026</p>
    </div>
    <div style={pdfStyles.pageNum}>— 4 —</div>
  </div>
);

const pdfStyles = {
  app: { display: 'flex', flexDirection: 'column', height: '100%', background: '#3a3f4a', overflow: 'hidden' },
  toolbar: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '6px 12px',
    background: 'linear-gradient(180deg, #f0eee8, #e0ded8)',
    borderBottom: '1px solid rgba(0,0,0,0.15)',
    flexShrink: 0
  },
  tbGroup: { display: 'flex', alignItems: 'center', gap: 2 },
  tbDivider: { width: 1, height: 18, background: 'rgba(0,0,0,0.15)', margin: '0 6px' },
  tbBtn: { background: 'transparent', border: 'none', padding: '5px 10px', fontSize: 13, color: 'var(--ink-soft)', cursor: 'pointer', borderRadius: 4 },
  pageInd: { fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--ink-soft)', minWidth: 50, textAlign: 'center' },

  body: { flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 },
  thumbCol: {
    width: 110, flexShrink: 0,
    background: '#2a2e36',
    padding: '12px 8px',
    display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center'
  },
  thumb: { cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 },
  thumbPage: { width: 80, height: 110, background: 'white', boxShadow: '0 2px 6px rgba(0,0,0,0.3)', padding: 8 },
  thumbActive: { },
  thumbLabel: { fontSize: 10, color: '#9a9ea8', fontFamily: 'var(--font-mono)' },

  pageWrap: {
    flex: 1, padding: '28px 40px', overflowY: 'auto',
    display: 'flex', justifyContent: 'center'
  },
  page: {
    width: '100%', maxWidth: 580,
    background: 'white', padding: '50px 56px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
    fontFamily: 'Georgia, var(--font-display), serif',
    minHeight: 720,
    position: 'relative'
  },
  title: { fontSize: 22, fontWeight: 700, color: '#1a2436', marginBottom: 8, lineHeight: 1.2 },
  byline: { fontSize: 12, color: '#6a6f7a', marginBottom: 24, fontStyle: 'italic' },
  h2: { fontSize: 16, fontWeight: 700, color: '#1a2436', marginTop: 24, marginBottom: 10, paddingBottom: 4, borderBottom: '1px solid #ccc' },
  h3: { fontSize: 13, fontWeight: 700, color: '#3a3f4a', marginTop: 14, marginBottom: 6 },
  p: { fontSize: 12.5, lineHeight: 1.7, color: '#1a2436', marginBottom: 10 },
  ul: { fontSize: 12.5, lineHeight: 1.7, color: '#1a2436', marginLeft: 20, marginBottom: 14 },
  table: { width: '100%', fontSize: 11, borderCollapse: 'collapse', marginBottom: 14, fontFamily: 'var(--font-sans)' },
  warningBox: { background: '#fff8d8', border: '1px solid #c4420f', padding: '10px 14px', fontSize: 12, lineHeight: 1.5, marginBottom: 16, fontFamily: 'var(--font-sans)', color: '#5a3010' },
  handAnnotation: { textAlign: 'right', margin: '4px 0 16px' },
  pageNum: { position: 'absolute', bottom: 20, left: 0, right: 0, textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 10, color: '#9a9ea8' }
};

// Add table cell styling
const pdfTableStyle = document.createElement('style');
pdfTableStyle.textContent = `
  .${'pdf-table-fix'} {}
  body table th { padding: 6px 8px; text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; color: #6a6f7a; border-bottom: 1.5px solid #1a2436; background: #f4f2ee; font-weight: 700; }
  body table td { padding: 6px 8px; border-bottom: 1px solid #e8e6e0; vertical-align: top; }
`;
document.head.appendChild(pdfTableStyle);

window.LUMIO_APPS = window.LUMIO_APPS || {};
window.LUMIO_APPS.pdf = PdfApp;
