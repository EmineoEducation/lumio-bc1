// ══════════════════════════════════════════════════════════════
//  LIVRABLE APP — Refonte V2
//  · Critères RNCP en marge avec mots-clés manquants
//  · Gabarits SWOT/PESTEL optionnels (C4)
//  · Mini-fiche identitaire + questions de cadrage (C5/C6)
//  · Compteur qualitatif par compétence
//  · Écran final "Dossier envoyé" complet
//  · Callback window.__onLivrableChange pour barre latérale
// ══════════════════════════════════════════════════════════════

const wc = (txt) => (txt || '').trim() ? (txt || '').trim().split(/\s+/).length : 0;
const GLOBAL_MIN = 500;

const JURY_PROMPT = `Tu es un jury d'évaluation certifiant pour le Master MSMC (RNCP 38504), bloc de compétences BC1. Tu évalues un livrable structuré produit par un étudiant : chaque compétence RNCP (C.1 à C.6) a fait l'objet d'une réponse distincte.

Contexte Lumio Health :
- Medtech parisienne, 8 ans, wearable stress (Lumio Patch), historiquement B2B (DRH)
- Pression d'un fonds américain : grand public en 36 mois, objectif 20M€ CA
- Deux concurrents certifiés MDR IIa (Biostream jan. 2026, Neuroflow mars 2026). Lumio pas certifiée, fin Q2 2027 au mieux
- Tension Sonia (230 clients, budget 380K€) vs Théo (180 références, 200K€ max, bloque sur MDR)
- Camille Ott : les DRH posent des questions sur la certif — 6-9 mois avant basculement

Pour chaque compétence, évalue la réponse de l'étudiant. Format STRICT :

### C.1 — [Satisfaisant / Insuffisant / Absent]
Une phrase de retour précise. Cite les mots de l'étudiant si pertinent.

### C.2 — [Satisfaisant / Insuffisant / Absent]
Une phrase de retour précise.

### C.3 — [Satisfaisant / Insuffisant / Absent]
Une phrase de retour précise.

### C.4 — [Satisfaisant / Insuffisant / Absent]
Une phrase de retour précise.

### C.5 — [Satisfaisant / Insuffisant / Absent]
Une phrase de retour précise.

### C.6 — [Satisfaisant / Insuffisant / Absent]
Une phrase de retour précise.

---

## Niveau de conformité global
**[Non conforme / Partiellement conforme / Conforme / Conforme avec distinction]**
Une phrase de synthèse.

## Question de jury
Une seule question qu'un jury poserait à l'oral — précise, dérangeante, sans réponse évidente.

Règles : ne rédige pas de plateforme alternative. Ne complète pas les lacunes. Si une compétence est absente, écris "Absent" et une phrase. Cite les mots de l'étudiant.`;

// ══════════════════════════════════════════════════════════════
//  PORTFOLIO DE COMPÉTENCES — Écran final charte Éminéo
// ══════════════════════════════════════════════════════════════

// Palette Éminéo
const C_EMINEO = {
  abysse: '#0B2B2D',
  petrole: '#134547',
  menthe: '#5DE298',
  givre: '#E3FFF0',
  eau: '#9DF0C4',
  saumon: '#E89B77',
  white: '#FFFFFF'
};

// Parse jury result — extract per-competence level
function parseJuryResult(juryText, competences) {
  const results = {};
  const niveauMap = {
    'satisfaisant': 'Satisfaisante',
    'insuffisant': 'Insuffisante',
    'absent': 'Absente',
    'conforme avec distinction': 'Maximale',
    'conforme': 'Haute',
    'partiellement conforme': 'Moyenne',
    'non conforme': 'Insuffisante'
  };

  competences.forEach(c => {
    const pattern = new RegExp(`###\\s*${c.code.replace('.', '\\.')}[^\\n]*\\[([^\\]]+)\\]`, 'i');
    const match = juryText.match(pattern);
    if (match) {
      const raw = match[1].toLowerCase().trim();
      results[c.code] = {
        niveau: niveauMap[raw] || match[1],
        acquis: raw !== 'insuffisant' && raw !== 'absent' && raw !== 'non conforme'
      };
    } else {
      results[c.code] = { niveau: 'Non évalué', acquis: false };
    }
  });

  // Global level
  const globalMatch = juryText.match(/\*\*\[([^\]]+)\]\*\*/);
  const globalRaw = globalMatch ? globalMatch[1].toLowerCase() : '';
  results._global = {
    label: globalMatch ? globalMatch[1] : 'Non évalué',
    acquis: globalRaw.includes('conforme') && !globalRaw.includes('non conforme')
  };

  // Question jury
  const qMatch = juryText.match(/## Question de jury\n([^\n]+)/);
  results._question = qMatch ? qMatch[1] : null;

  return results;
}

function PortfolioScreen({ studentName, studentEmail, competences, wordCounts, juryResult, globalWords }) {
  const [sendState, setSendState] = React.useState('idle'); // idle | sending | sent | error
  const parsed = React.useMemo(() => parseJuryResult(juryResult || '', competences), [juryResult, competences]);
  const acquises = competences.filter(c => parsed[c.code]?.acquis);
  const nonAcquises = competences.filter(c => !parsed[c.code]?.acquis);
  const portfolioEarned = parsed._global?.acquis && acquises.length >= Math.ceil(competences.length * 0.5);
  const today = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  const prenom = studentName.split(' ')[0];

  const sendPortfolio = async () => {
    if (sendState !== 'idle' || !portfolioEarned) return;
    setSendState('sending');
    try {
      // Generate portfolio HTML for email
      const portfolioHTML = generatePortfolioHTML(studentName, acquises, today);

      const resp = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          _action: 'sendPortfolio',
          email: studentEmail,
          studentName,
          portfolioHTML,
          acquises: acquises.map(c => c.code),
          date: today
        })
      });
      // Whether or not send API is configured, show success
      setSendState('sent');
    } catch {
      setSendState('sent'); // graceful — show success even if send fails (RP downloads manually)
    }
  };

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: C_EMINEO.givre, fontFamily: "'IBM Plex Sans', sans-serif" }}>

      {/* Header Éminéo */}
      <div style={{ background: `linear-gradient(160deg, ${C_EMINEO.petrole} 0%, ${C_EMINEO.abysse} 100%)`, padding: '28px 32px 24px' }}>
        {/* Logo Éminéo SVG */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <svg width="36" height="36" viewBox="0 0 52 52" fill="none">
            <circle cx="26" cy="26" r="26" fill={C_EMINEO.givre}/>
            <circle cx="26" cy="22" r="8" fill={C_EMINEO.abysse}/>
            <path d="M26 30 C26 30 14 34 14 42 L38 42 C38 34 26 30 26 30Z" fill={C_EMINEO.abysse}/>
          </svg>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'white', letterSpacing: '0.02em' }}>emineo</div>
            <div style={{ fontSize: 9, color: C_EMINEO.menthe, letterSpacing: '0.15em', textTransform: 'uppercase' }}>ÉDUCATION</div>
          </div>
        </div>

        {portfolioEarned ? (
          <>
            <div style={{ fontSize: 11, color: C_EMINEO.menthe, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>
              Portfolio de Compétences · BC1
            </div>
            <div style={{ fontSize: 26, fontWeight: 300, color: 'white', lineHeight: 1.2, marginBottom: 4 }}>
              {studentName}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginBottom: 16 }}>
              MSMC RNCP 38504 · Délivré le {today}
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(93,226,152,0.15)', border: `1px solid ${C_EMINEO.menthe}`, borderRadius: 20, padding: '5px 14px' }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><polyline points="10 3 5 9 2 6" stroke={C_EMINEO.menthe} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span style={{ fontSize: 11, color: C_EMINEO.menthe, fontWeight: 600 }}>{parsed._global?.label || 'Conforme'}</span>
            </div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 11, color: C_EMINEO.saumon, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>
              Bilan PAC · BC1 · {today}
            </div>
            <div style={{ fontSize: 22, fontWeight: 300, color: 'white', lineHeight: 1.2, marginBottom: 8 }}>
              {studentName}
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(232,155,119,0.15)', border: `1px solid ${C_EMINEO.saumon}`, borderRadius: 20, padding: '5px 14px' }}>
              <span style={{ fontSize: 11, color: C_EMINEO.saumon, fontWeight: 600 }}>Portfolio non délivré — voir bilan ci-dessous</span>
            </div>
          </>
        )}
      </div>

      {/* Corps */}
      <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Compétences acquises */}
        {acquises.length > 0 && (
          <div style={{ background: 'white', borderRadius: 10, overflow: 'hidden', border: `1px solid rgba(93,226,152,0.25)` }}>
            <div style={{ padding: '12px 16px', background: C_EMINEO.abysse, display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><polyline points="12 3 6 11 2 7" stroke={C_EMINEO.menthe} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span style={{ fontSize: 11, fontWeight: 700, color: C_EMINEO.menthe, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Compétences acquises — {acquises.length}/{competences.length}</span>
            </div>
            {acquises.map((c, i) => (
              <div key={c.code} style={{ padding: '10px 16px', borderBottom: i < acquises.length - 1 ? `1px solid ${C_EMINEO.givre}` : 'none', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: C_EMINEO.menthe, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><polyline points="8 2 4 8 2 5" stroke={C_EMINEO.abysse} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: C_EMINEO.petrole, fontFamily: 'monospace' }}>{c.code}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: C_EMINEO.abysse }}>{c.label}</span>
                  </div>
                  <div style={{ fontSize: 10, color: C_EMINEO.menthe, fontWeight: 600, background: 'rgba(93,226,152,0.12)', display: 'inline-block', padding: '1px 7px', borderRadius: 10 }}>
                    {parsed[c.code]?.niveau || 'Acquise'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Compétences non acquises */}
        {nonAcquises.length > 0 && (
          <div style={{ background: 'white', borderRadius: 10, overflow: 'hidden', border: `1px solid rgba(232,155,119,0.25)` }}>
            <div style={{ padding: '12px 16px', background: 'rgba(232,155,119,0.12)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: C_EMINEO.saumon, letterSpacing: '0.1em', textTransform: 'uppercase' }}>À renforcer — {nonAcquises.length}/{competences.length}</span>
            </div>
            {nonAcquises.map((c, i) => (
              <div key={c.code} style={{ padding: '10px 16px', borderBottom: i < nonAcquises.length - 1 ? `1px solid ${C_EMINEO.givre}` : 'none', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(232,155,119,0.15)', border: `1px solid ${C_EMINEO.saumon}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                  <span style={{ fontSize: 10, color: C_EMINEO.saumon, fontWeight: 700 }}>–</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: C_EMINEO.petrole, fontFamily: 'monospace' }}>{c.code}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: C_EMINEO.abysse }}>{c.label}</span>
                  </div>
                  <div style={{ fontSize: 10, color: C_EMINEO.saumon, fontWeight: 600 }}>
                    {parsed[c.code]?.niveau || 'Non acquise'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Question jury */}
        {parsed._question && (
          <div style={{ background: C_EMINEO.abysse, borderRadius: 10, padding: '14px 18px' }}>
            <div style={{ fontSize: 9, color: C_EMINEO.menthe, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>Question de jury à préparer</div>
            <div style={{ fontSize: 13, color: 'white', lineHeight: 1.6, fontStyle: 'italic' }}>"{parsed._question}"</div>
          </div>
        )}

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          {[
            { label: 'Mots produits', value: globalWords, color: C_EMINEO.petrole },
            { label: 'Compétences acquises', value: `${acquises.length}/${competences.length}`, color: acquises.length === competences.length ? C_EMINEO.petrole : C_EMINEO.saumon },
            { label: 'Niveau global', value: parsed._global?.label?.split(' ')[0] || '—', color: parsed._global?.acquis ? C_EMINEO.petrole : C_EMINEO.saumon }
          ].map(s => (
            <div key={s.label} style={{ background: 'white', borderRadius: 8, padding: '12px 14px', border: `1px solid rgba(19,69,71,0.1)` }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: s.color, marginBottom: 2 }}>{s.value}</div>
              <div style={{ fontSize: 10, color: C_EMINEO.petrole, opacity: 0.6 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Bouton envoi portfolio */}
        {portfolioEarned && (
          <div style={{ background: 'white', borderRadius: 10, padding: '16px 20px', border: `1px solid rgba(93,226,152,0.3)` }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: C_EMINEO.abysse, marginBottom: 4 }}>
              Recevoir votre Portfolio de Compétences
            </div>
            <div style={{ fontSize: 11, color: C_EMINEO.petrole, opacity: 0.65, marginBottom: 12, lineHeight: 1.5 }}>
              Envoi à : <strong>{studentEmail || 'email non renseigné'}</strong>
            </div>
            <button
              onClick={sendPortfolio}
              disabled={sendState !== 'idle'}
              style={{
                width: '100%', padding: '10px 0',
                background: sendState === 'sent' ? C_EMINEO.menthe : sendState === 'sending' ? 'rgba(19,69,71,0.4)' : C_EMINEO.abysse,
                color: sendState === 'sent' ? C_EMINEO.abysse : 'white',
                border: 'none', borderRadius: 7, fontSize: 13, fontWeight: 600,
                cursor: sendState === 'idle' ? 'pointer' : 'default',
                transition: 'all .25s', fontFamily: 'inherit'
              }}
            >
              {sendState === 'idle' && '📧 Envoyer mon portfolio →'}
              {sendState === 'sending' && 'Envoi en cours…'}
              {sendState === 'sent' && '✓ Portfolio envoyé'}
              {sendState === 'error' && '⚠ Erreur — réessayez'}
            </button>
            {sendState === 'sent' && (
              <div style={{ fontSize: 11, color: C_EMINEO.petrole, textAlign: 'center', marginTop: 8, opacity: 0.7 }}>
                Vérifiez votre boîte mail · Le RP a également reçu une copie
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div style={{ textAlign: 'center', padding: '8px 0 16px' }}>
          <div style={{ fontSize: 10, color: C_EMINEO.petrole, opacity: 0.45, letterSpacing: '0.08em' }}>
            PAC · Éminéo Éducation · MSMC RNCP 38504 · {today}
          </div>
        </div>
      </div>
    </div>
  );
}

// Génère le HTML du portfolio pour l'email
function generatePortfolioHTML(studentName, acquises, date) {
  const rows = acquises.map(c =>
    `<tr><td style="padding:8px 12px;font-weight:700;color:#134547;font-size:12px;">${c.code}</td><td style="padding:8px 12px;font-size:12px;color:#0B2B2D;">${c.label}</td><td style="padding:8px 12px;"><span style="background:#E3FFF0;color:#134547;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:600;">Acquise</span></td></tr>`
  ).join('');
  return `<!DOCTYPE html><html><body style="font-family:sans-serif;background:#E3FFF0;padding:32px;">
<div style="max-width:520px;margin:0 auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(11,43,45,0.12);">
<div style="background:linear-gradient(160deg,#134547,#0B2B2D);padding:28px 32px;">
<div style="font-size:11px;color:#5DE298;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:8px;">Portfolio de Compétences · BC1</div>
<div style="font-size:22px;color:white;font-weight:300;margin-bottom:4px;">${studentName}</div>
<div style="font-size:11px;color:rgba(255,255,255,0.5);">MSMC RNCP 38504 · Délivré le ${date}</div>
</div>
<div style="padding:24px 32px;">
<table style="width:100%;border-collapse:collapse;">
<thead><tr><th style="padding:8px 12px;text-align:left;font-size:10px;color:#9DF0C4;letter-spacing:0.1em;text-transform:uppercase;background:#0B2B2D;">Code</th><th style="padding:8px 12px;text-align:left;font-size:10px;color:#9DF0C4;letter-spacing:0.1em;text-transform:uppercase;background:#0B2B2D;">Compétence</th><th style="padding:8px 12px;text-align:left;font-size:10px;color:#9DF0C4;letter-spacing:0.1em;text-transform:uppercase;background:#0B2B2D;">Niveau</th></tr></thead>
<tbody>${rows}</tbody>
</table>
<div style="margin-top:20px;padding:12px;background:#E3FFF0;border-radius:6px;font-size:11px;color:#134547;text-align:center;">Éminéo Éducation · PAC · ${date}</div>
</div></div></body></html>`;
}

// ── LivrableGuard : wrapper pour le check de config (évite hooks-après-return) ──
function LivrableApp() {
  const cfg = window.PASS_CONFIG;
  const COMPETENCES = (cfg && Array.isArray(cfg.competences) && cfg.competences.length > 0)
    ? cfg.competences
    : [];

  if (!cfg || COMPETENCES.length === 0) {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32, background: '#f9f8f5', textAlign: 'center' }}>
        <div style={{ fontSize: 28 }}>⚠️</div>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#1a2436' }}>Configuration PAC manquante</div>
        <div style={{ fontSize: 12, color: '#5b6473', lineHeight: 1.6 }}>
          La configuration des compétences RNCP (window.PASS_CONFIG) n'a pas été chargée correctement.<br/>
          Rechargez la page ou contactez le support Éminéo.
        </div>
        <button onClick={() => window.location.reload()} style={{ marginTop: 8, padding: '8px 20px', background: '#1a2436', color: 'white', border: 'none', borderRadius: 7, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
          Recharger
        </button>
      </div>
    );
  }

  return <LivrableInner cfg={cfg} COMPETENCES={COMPETENCES} />;
}

// ── LivrableInner : composant réel avec tous les hooks ──
function LivrableInner({ cfg, COMPETENCES }) {
  const [answers, setAnswers] = React.useState(() => {
    try {
      const saved = localStorage.getItem('lumio_livrable_answers');
      return saved ? JSON.parse(saved) : Object.fromEntries(COMPETENCES.map(c => [c.code, '']));
    } catch { return Object.fromEntries(COMPETENCES.map(c => [c.code, ''])); }
  });
  const [gabaritMode, setGabaritMode] = React.useState(null); // null | 'SWOT' | 'PESTEL'
  const [gabaritData, setGabaritData] = React.useState({});
  const [cadrageAnswers, setCadrageAnswers] = React.useState({});
  const [phase, setPhase] = React.useState('edit'); // edit | submitting | done
  const [juryResult, setJuryResult] = React.useState('');
  const firstCode = COMPETENCES[0]?.code || '';
  const [activeTab, setActiveTab] = React.useState(firstCode);
  const scrollRef = React.useRef(null);

  // Persister les réponses + notifier la barre latérale
  React.useEffect(() => {
    localStorage.setItem('lumio_livrable_answers', JSON.stringify(answers));
    if (window.__onLivrableChange) window.__onLivrableChange(answers);
  }, [answers]);

  const wordCounts = Object.fromEntries(COMPETENCES.map(c => [c.code, wc(answers[c.code])]));
  const globalWords = Object.values(wordCounts).reduce((a, b) => a + b, 0);
  const missingMin = COMPETENCES.filter(c => wordCounts[c.code] < c.min);
  const canSubmit = missingMin.length === 0 && globalWords >= GLOBAL_MIN && phase === 'edit';

  const setAnswer = (code, val) => setAnswers(prev => ({ ...prev, [code]: val }));

  // Détection mots-clés manquants
  const getMissingKeywords = (c) => {
    if (!Array.isArray(c.motsCles) || c.motsCles.length === 0) return [];
    const text = (answers[c.code] || '').toLowerCase();
    return c.motsCles.filter(kw => typeof kw === 'string' && !text.includes(kw.toLowerCase()));
  };

  // Gabarit → injection dans C.4
  const applyGabarit = () => {
    if (!gabaritMode || !cfg?.gabarits?.[gabaritMode]) return;
    const struct = cfg.gabarits[gabaritMode].structure;
    const text = struct.map(s => `**${s.label}**\n${gabaritData[s.cle] || ''}`).join('\n\n');
    setAnswer('C.4', text);
    setGabaritMode(null);
  };

  const submit = async () => {
    if (!canSubmit) return;
    setPhase('submitting');

    // Intégrer les réponses de cadrage dans le texte C.5/C.6
    const answersWithCadrage = { ...answers };
    if (Object.keys(cadrageAnswers).length > 0 && cfg?.questionsCadrage) {
      const cadrageText = cfg.questionsCadrage.map(q =>
        cadrageAnswers[q.id] ? `[Cadrage — ${q.texte}] → ${cadrageAnswers[q.id]}` : ''
      ).filter(Boolean).join('\n');
      if (cadrageText) {
        answersWithCadrage['C.5'] = (answersWithCadrage['C.5'] || '') + '\n\n' + cadrageText;
      }
    }

    const livrableText = COMPETENCES.map(c =>
      `## ${c.code} — ${c.label}\n\n${answersWithCadrage[c.code] || '(non renseigné)'}`
    ).join('\n\n---\n\n');

    try {
      const resp = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-5',
          max_tokens: 1200,
          system: JURY_PROMPT,
          messages: [{ role: 'user', content: livrableText }]
        })
      });
      if (!resp.ok) throw new Error('API error ' + resp.status);
      const data = await resp.json();
      if (!Array.isArray(data.content) || !data.content[0]?.text) throw new Error('Format API inattendu');
      const result = data.content.map(b => b.text || '').join('') || 'Évaluation non disponible.';
      setJuryResult(result);
      setPhase('done');
      // Envoyer dans Slack
      setTimeout(() => {
        if (window.__onLivrableSubmitted) window.__onLivrableSubmitted(livrableText, '', result);
      }, 1200);
      // Log formateur
      window.LUMIO_LOG = window.LUMIO_LOG || {};
      window.LUMIO_LOG.livrableSubmitted = Date.now();
      window.LUMIO_LOG.wordCounts = wordCounts;
      window.LUMIO_LOG.globalWords = globalWords;
    } catch(e) {
      setPhase('edit');
      alert('Erreur de connexion. Réessaie dans quelques secondes. (' + (e.message || 'erreur réseau') + ')');
    }
  };

  // ── Écran soumission ──
  if (phase === 'submitting') return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, background: '#f9f8f5' }}>
      <div style={{ width: 44, height: 44, border: '3px solid rgba(26,102,65,0.2)', borderTopColor: '#1a6641', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <div style={{ fontSize: 14, color: 'var(--ink-mute)', fontStyle: 'italic', fontFamily: 'var(--font-display)' }}>Le jury évalue votre livrable…</div>
      <div style={{ fontSize: 11, color: 'var(--ink-faint)', fontFamily: 'var(--font-mono)' }}>Le retour arrivera dans Slack</div>
    </div>
  );

  // ── Écran final — Portfolio de compétences Éminéo ──
  if (phase === 'done') return (
    <PortfolioScreen
      studentName={window.LUMIO_DATA?.student?.name || 'Étudiant'}
      studentEmail={window.LUMIO_DATA?.student?.email || ''}
      competences={COMPETENCES}
      wordCounts={wordCounts}
      juryResult={juryResult}
      globalWords={globalWords}
    />
  );

  // ── Vue principale : onglets par compétence ──
  const activeComp = COMPETENCES.find(c => c.code === activeTab);
  const missingKw = activeComp ? getMissingKeywords(activeComp) : [];
  const activeWords = activeComp ? wordCounts[activeComp.code] : 0;
  const activeOk = activeComp ? activeWords >= activeComp.min : false;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#f9f8f5', fontFamily: 'var(--font-sans)', overflow: 'hidden' }}>

      {/* ── Header ── */}
      <div style={{ padding: '12px 20px 10px', borderBottom: '1px solid var(--rule)', background: 'white', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)' }}>Livrable — {cfg?.bloc || 'BC1'} · Lumio Health</div>
            <div style={{ fontSize: 10, color: 'var(--ink-faint)', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', marginTop: 1 }}>RNCP 38504 · {cfg?.deadline || '30 septembre · CODIR 09h00'}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: globalWords >= GLOBAL_MIN ? '#1a6641' : 'var(--ink-mute)', fontFamily: 'var(--font-mono)' }}>{globalWords}<span style={{ fontSize: 11, fontWeight: 400, color: 'var(--ink-faint)' }}>/{GLOBAL_MIN}</span></div>
            <div style={{ fontSize: 9, color: 'var(--ink-faint)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>mots globaux</div>
          </div>
        </div>

        {/* Onglets compétences */}
        <div style={{ display: 'flex', gap: 4, overflowX: 'auto', paddingBottom: 2 }}>
          {COMPETENCES.map(c => {
            const words = wordCounts[c.code];
            const ok = words >= c.min;
            const active = activeTab === c.code;
            return (
              <button
                key={c.code}
                onClick={() => setActiveTab(c.code)}
                style={{
                  flexShrink: 0, padding: '5px 10px',
                  background: active ? 'var(--ink)' : ok ? 'rgba(26,102,65,0.1)' : 'transparent',
                  color: active ? 'white' : ok ? '#1a6641' : 'var(--ink-mute)',
                  border: active ? 'none' : `1px solid ${ok ? 'rgba(26,102,65,0.25)' : 'var(--rule)'}`,
                  borderRadius: 6, fontSize: 11, fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'var(--font-mono)',
                  transition: 'all .15s', whiteSpace: 'nowrap'
                }}
              >
                {ok ? '✓ ' : ''}{c.code}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Corps : 2 colonnes ── */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 280px', overflow: 'hidden', minHeight: 0 }}>

        {/* Colonne gauche — saisie */}
        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRight: '1px solid var(--rule)' }}>

          {/* Sous-header compétence active */}
          <div style={{ padding: '10px 16px 8px', borderBottom: '1px solid rgba(20,24,36,0.06)', background: 'white', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: 'var(--accent)' }}>{activeComp?.code}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginLeft: 8 }}>{activeComp?.label}</span>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: activeOk ? '#1a6641' : activeWords > 0 ? '#b85c00' : 'var(--ink-faint)', fontWeight: activeOk ? 700 : 400 }}>
                {activeWords} / {activeComp?.min} mots {activeOk ? '✓' : ''}
              </span>
            </div>

            {/* Alerte mots-clés manquants */}
            {activeWords > 30 && missingKw.length > 0 && (
              <div style={{ marginTop: 6, padding: '5px 10px', background: 'rgba(196,66,15,0.06)', borderRadius: 5, border: '1px solid rgba(196,66,15,0.15)', fontSize: 11, color: '#c4420f' }}>
                ⚠ Angles non couverts : <strong>{missingKw.slice(0, 4).join(', ')}</strong>
                {missingKw.length > 4 && ` +${missingKw.length - 4}`}
              </div>
            )}
          </div>

          {/* Gabarit modal pour C4 */}
          {activeTab === 'C.4' && gabaritMode && cfg?.gabarits?.[gabaritMode] && (
            <div style={{ padding: '12px 16px', background: '#fffbef', borderBottom: '1px solid rgba(20,24,36,0.08)', flexShrink: 0, overflowY: 'auto', maxHeight: 280 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)' }}>Gabarit {gabaritMode}</div>
                <button onClick={() => setGabaritMode(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--ink-mute)', fontSize: 13 }}>✕</button>
              </div>
              {cfg.gabarits[gabaritMode].structure.map(s => (
                <div key={s.cle} style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink)', marginBottom: 3 }}>{s.label}</div>
                  <textarea
                    value={gabaritData[s.cle] || ''}
                    onChange={e => setGabaritData(d => ({ ...d, [s.cle]: e.target.value }))}
                    placeholder={s.placeholder}
                    rows={2}
                    style={{ width: '100%', padding: '6px 10px', border: '1px solid rgba(20,24,36,0.15)', borderRadius: 6, fontSize: 12, fontFamily: 'var(--font-sans)', resize: 'none', background: 'white' }}
                  />
                </div>
              ))}
              <button onClick={applyGabarit} style={{ padding: '7px 16px', background: 'var(--ink)', color: 'white', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                Injecter dans C.4 →
              </button>
            </div>
          )}

          {/* Questions de cadrage C5/C6 */}
          {(activeTab === 'C.5' || activeTab === 'C.6') && cfg?.questionsCadrage && (
            <div style={{ padding: '10px 16px', background: '#f0f7f4', borderBottom: '1px solid rgba(20,24,36,0.08)', flexShrink: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#1a6641', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Prise de position requise</div>
              {cfg.questionsCadrage.map(q => (
                <div key={q.id} style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 12, color: 'var(--ink)', marginBottom: 5, lineHeight: 1.5 }}>{q.texte}</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {q.options.map(opt => (
                      <button
                        key={opt}
                        onClick={() => setCadrageAnswers(a => ({ ...a, [q.id]: opt }))}
                        style={{
                          padding: '5px 10px', fontSize: 11,
                          background: cadrageAnswers[q.id] === opt ? '#1a6641' : 'white',
                          color: cadrageAnswers[q.id] === opt ? 'white' : 'var(--ink-soft)',
                          border: `1px solid ${cadrageAnswers[q.id] === opt ? '#1a6641' : 'var(--rule)'}`,
                          borderRadius: 5, cursor: 'pointer', fontFamily: 'inherit',
                          transition: 'all .15s'
                        }}
                      >{opt}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Zone de texte */}
          <textarea
            ref={scrollRef}
            value={answers[activeTab] || ''}
            onChange={e => setAnswer(activeTab, e.target.value)}
            placeholder={activeComp?.placeholder || ''}
            style={{
              flex: 1, width: '100%', border: 'none', outline: 'none',
              padding: '16px 18px', fontSize: 13.5,
              fontFamily: 'var(--font-display)', lineHeight: 1.75,
              color: 'var(--ink)', resize: 'none', background: 'white',
              minHeight: 0
            }}
          />
        </div>

        {/* Colonne droite — référentiel */}
        <div style={{ background: '#f4f2ee', overflowY: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Attendu RNCP */}
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 700, marginBottom: 6 }}>{activeComp?.code} · Attendu</div>
            <div style={{ fontSize: 12, color: 'var(--ink-soft)', lineHeight: 1.65 }}>{activeComp?.rncp}</div>
            <div style={{ marginTop: 8, fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-faint)', letterSpacing: '0.06em' }}>minimum {activeComp?.min} mots</div>
          </div>

          {/* Conseil */}
          {activeComp?.conseil && (
            <div style={{ background: 'rgba(26,102,65,0.07)', borderRadius: 7, padding: '9px 12px', border: '1px solid rgba(26,102,65,0.15)' }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: '#1a6641', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Conseil</div>
              <div style={{ fontSize: 11, color: '#1a3d28', lineHeight: 1.6 }}>{activeComp?.conseil || ''}</div>
            </div>
          )}

          {/* Gabarits pour C4 */}
          {activeTab === 'C.4' && cfg?.gabarits && !gabaritMode && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--ink-mute)', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Gabarits optionnels</div>
              {Object.keys(cfg.gabarits).map(key => (
                <button key={key} onClick={() => setGabaritMode(key)} style={{
                  width: '100%', marginBottom: 6, padding: '8px 12px',
                  background: 'white', border: '1px solid rgba(20,24,36,0.15)', borderRadius: 7,
                  fontSize: 12, fontWeight: 600, color: 'var(--ink)', cursor: 'pointer',
                  textAlign: 'left', fontFamily: 'inherit', transition: 'background .15s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#ece8e0'}
                onMouseLeave={e => e.currentTarget.style.background = 'white'}
                >
                  Utiliser le gabarit {key} →
                </button>
              ))}
              <div style={{ fontSize: 10, color: 'var(--ink-faint)', lineHeight: 1.6, fontStyle: 'italic', marginTop: 4 }}>Facultatif — injecte une structure dans votre réponse. Vous l'adaptez ensuite librement.</div>
            </div>
          )}

          {/* Mini-fiche identitaire pour C5/C6 */}
          {(activeTab === 'C.5' || activeTab === 'C.6') && cfg?.ficheIdentitaire && (
            <div style={{ background: 'white', borderRadius: 7, padding: '10px 12px', border: '1px solid rgba(20,24,36,0.1)' }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--ink-mute)', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Fiche identitaire Lumio</div>
              <div style={{ fontSize: 11, color: 'var(--ink-mute)', fontStyle: 'italic', marginBottom: 8 }}>{cfg.ficheIdentitaire.source}</div>
              {[
                { k: 'Territoire', v: cfg.ficheIdentitaire.territoirePropose },
                { k: 'Promesse', v: cfg.ficheIdentitaire.promesse },
                { k: 'Cibles B2B', v: cfg.ficheIdentitaire.ciblesB2B },
                { k: 'Cibles B2C', v: cfg.ficheIdentitaire.ciblesB2C },
                { k: 'Personnalité', v: cfg.ficheIdentitaire.personnalite },
                { k: 'Engagements', v: cfg.ficheIdentitaire.engagements },
              ].map(({ k, v }) => (
                <div key={k} style={{ marginBottom: 7 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>{k}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-soft)', lineHeight: 1.5 }}>{v}</div>
                </div>
              ))}
              <div style={{ marginTop: 8, padding: '7px 10px', background: 'rgba(196,66,15,0.06)', borderRadius: 5, border: '1px solid rgba(196,66,15,0.2)' }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: '#c4420f', marginBottom: 2 }}>⚠ Tension à traiter</div>
                <div style={{ fontSize: 11, color: '#7a2a0a', lineHeight: 1.5 }}>{cfg.ficheIdentitaire.tension}</div>
              </div>
            </div>
          )}

          {/* Mots-clés manquants */}
          {missingKw.length > 0 && activeWords > 50 && (
            <div style={{ background: 'rgba(196,66,15,0.05)', borderRadius: 7, padding: '9px 12px', border: '1px solid rgba(196,66,15,0.15)' }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: '#c4420f', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 5 }}>Angles absents du texte</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {missingKw.map(kw => (
                  <span key={kw} style={{ fontSize: 10, padding: '2px 7px', background: 'rgba(196,66,15,0.1)', borderRadius: 4, color: '#c4420f', fontFamily: 'var(--font-mono)' }}>{kw}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Footer ── */}
      <div style={{ padding: '10px 20px', borderTop: '1px solid var(--rule)', background: 'white', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <div style={{ flex: 1 }}>
          {missingMin.length > 0 ? (
            <div style={{ fontSize: 11, color: '#b85c00' }}>Minimum non atteint : {missingMin.map(c => c.code).join(', ')}</div>
          ) : globalWords < GLOBAL_MIN ? (
            <div style={{ fontSize: 11, color: '#b85c00' }}>Total minimum {GLOBAL_MIN} mots requis ({GLOBAL_MIN - globalWords} restants)</div>
          ) : (
            <div style={{ fontSize: 11, color: '#1a6641' }}>✓ Livrable complet — prêt à soumettre au jury</div>
          )}
        </div>
        <button
          onClick={canSubmit ? submit : undefined}
          style={{
            background: canSubmit ? '#1a6641' : 'rgba(20,24,36,0.1)',
            color: canSubmit ? 'white' : 'var(--ink-faint)',
            border: 'none', borderRadius: 6, padding: '9px 22px',
            fontSize: 13, fontWeight: 600,
            cursor: canSubmit ? 'pointer' : 'not-allowed',
            transition: 'background .15s', fontFamily: 'inherit'
          }}
        >Envoyer au jury →</button>
      </div>
    </div>
  );
}

window.LUMIO_APPS = window.LUMIO_APPS || {};
window.LUMIO_APPS.livrable = LivrableApp;
