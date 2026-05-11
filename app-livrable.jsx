// ══════════════════════════════════════════════════════════════
//  LIVRABLE APP — Tableau structuré BC1 · 2 colonnes · jury IA → Slack
// ══════════════════════════════════════════════════════════════

const COMPETENCES = [
  {
    code: 'C.1',
    label: 'Organiser une veille stratégique',
    rncp: 'Identifier et mobiliser des sources pertinentes (réglementaires, concurrentielles, sociocomportementales). Structurer la collecte et en assurer la traçabilité.',
    placeholder: 'Quelles sources as-tu mobilisées ? Comment as-tu organisé ta veille sur l\'environnement Lumio ?',
    min: 80
  },
  {
    code: 'C.2',
    label: 'Qualifier les signaux : opportunité ou risque',
    rncp: 'Pour chaque tendance identifiée, argumenter en quoi elle constitue une opportunité ou un risque pour la marque. Hiérarchiser selon l\'impact potentiel.',
    placeholder: 'Pour chaque tendance repérée, justifie ton évaluation : opportunité ou risque pour Lumio, et pourquoi ?',
    min: 100
  },
  {
    code: 'C.3',
    label: 'Exploiter les données disponibles',
    rncp: 'Mobiliser les verbatims, benchmarks et données documentaires fournis. Traiter les contradictions entre sources plutôt que les ignorer.',
    placeholder: 'Quelles données as-tu exploitées ? Comment as-tu traité les éléments contradictoires entre les documents ?',
    min: 80
  },
  {
    code: 'C.4',
    label: 'Construire un diagnostic fondé',
    rncp: 'Produire une interprétation, pas une liste d\'observations. Mobiliser des outils d\'analyse (SWOT, PESTEL, etc.) et en tirer des conclusions actionnables.',
    placeholder: 'Quel est ton diagnostic de la situation de Lumio ? Sur quels outils ou raisonnements t\'appuies-tu ?',
    min: 100
  },
  {
    code: 'C.5',
    label: 'Analyser le positionnement et l\'identité de marque',
    rncp: 'Identifier l\'écart entre ce que Lumio dit être et ce que ses interlocuteurs perçoivent réellement. Nommer la tension B2B / B2C.',
    placeholder: 'Comment perçois-tu l\'écart entre l\'identité déclarée de Lumio et la réalité de ses marchés ? Quelle tension identifies-tu ?',
    min: 80
  },
  {
    code: 'C.6',
    label: 'Formaliser la plateforme de marque',
    rncp: 'Proposer un territoire, une proposition de valeur, une personnalité et des engagements cohérents avec le diagnostic — et défendables au regard des contraintes (MDR, budget, cibles).',
    placeholder: 'Formule ta plateforme de marque pour Lumio : territoire, proposition de valeur, personnalité, engagements. Justifie chaque choix.',
    min: 120
  }
];

const JURY_PROMPT = `Tu es un jury d'évaluation certifiant pour le Master MSMC (RNCP 38504), bloc de compétences BC1. Tu évalues un livrable structuré produit par un étudiant : chaque compétence RNCP (C.1 à C.6) a fait l'objet d'une réponse distincte.

Contexte Lumio Health :
- Medtech parisienne, 8 ans, wearable stress (Lumio Patch), historiquement B2B (DRH)
- Pression d'un fonds américain : grand public en 36 mois, objectif 20M€ CA
- Deux concurrents certifiés MDR IIa (Biostream jan. 2026, Neuroflow mars 2026). Lumio pas certifiée, fin Q2 2027 au mieux
- Tension Sonia (230 clients, budget 380K€) vs Théo (180 références, 200K€ max, bloque sur MDR)
- Camille Ott : les DRH posent des questions sur la certif — 6-9 mois avant basculement
- Certification MDR = 22 mois et ~400K€ minimum

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

const wc = (txt) => txt.trim() ? txt.trim().split(/\s+/).length : 0;
const GLOBAL_MIN = 500;

function LivrableApp() {
  const [answers, setAnswers] = React.useState(() =>
    Object.fromEntries(COMPETENCES.map(c => [c.code, '']))
  );
  const [phase, setPhase] = React.useState('edit'); // edit | submitting | done
  const [submitted, setSubmitted] = React.useState(false);

  const wordCounts = Object.fromEntries(
    COMPETENCES.map(c => [c.code, wc(answers[c.code])])
  );
  const globalWords = Object.values(wordCounts).reduce((a, b) => a + b, 0);

  const missingMin = COMPETENCES.filter(c => wordCounts[c.code] < c.min);
  const canSubmit = missingMin.length === 0 && globalWords >= GLOBAL_MIN && !submitted;

  const setAnswer = (code, val) =>
    setAnswers(prev => ({ ...prev, [code]: val }));

  const submit = async () => {
    if (!canSubmit) return;
    setPhase('submitting');

    const livrableText = COMPETENCES.map(c =>
      `## ${c.code} — ${c.label}\n\n${answers[c.code]}`
    ).join('\n\n---\n\n');

    try {
      const resp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1200,
          system: JURY_PROMPT,
          messages: [{ role: 'user', content: livrableText }]
        })
      });
      const data = await resp.json();
      const juryResult = data.content?.map(b => b.text || '').join('') || 'Erreur de connexion.';

      setPhase('done');
      setSubmitted(true);

      // Envoyer le retour jury dans Slack via Sonia
      setTimeout(() => {
        if (window.__onLivrableSubmitted) {
          window.__onLivrableSubmitted(livrableText, '', juryResult);
        }
      }, 1200);

    } catch(e) {
      setPhase('edit');
      alert('Erreur de connexion. Réessaie.');
    }
  };

  if (phase === 'submitting') return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, background: '#f9f8f5' }}>
      <div style={{ width: 44, height: 44, border: '3px solid rgba(26,102,65,0.2)', borderTopColor: '#1a6641', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <div style={{ fontSize: 14, color: 'var(--ink-mute)', fontStyle: 'italic', fontFamily: 'var(--font-display)' }}>Le jury évalue ton livrable…</div>
      <div style={{ fontSize: 11, color: 'var(--ink-faint)', fontFamily: 'var(--font-mono)' }}>Le retour arrivera dans Slack</div>
    </div>
  );

  if (phase === 'done') return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, background: '#f9f8f5', padding: '0 40px', textAlign: 'center' }}>
      <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#1a6641', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 400, color: 'var(--ink)' }}>Livrable remis à Sonia</div>
      <div style={{ fontSize: 13, color: 'var(--ink-mute)', lineHeight: 1.7, maxWidth: 420 }}>
        L'évaluation du jury a été envoyée dans Slack.<br/>
        Ouvre Slack pour lire le retour certifiant.
      </div>
      <div style={{ marginTop: 8, padding: '10px 22px', background: 'rgba(26,102,65,0.1)', borderRadius: 6, border: '1px solid rgba(26,102,65,0.2)', fontSize: 12, color: '#1a6641', fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}>
        {globalWords} mots · 6 compétences couvertes
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#f9f8f5', fontFamily: 'var(--font-sans)', overflow: 'hidden' }}>

      {/* Header */}
      <div style={{ padding: '14px 24px 12px', borderBottom: '1px solid var(--rule)', background: 'white', flexShrink: 0, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)', marginBottom: 2 }}>Livrable — BC1 · Lumio Health</div>
          <div style={{ fontSize: 11, color: 'var(--ink-faint)', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}>RNCP 38504 · À remettre à Sonia Ferracci avant le 30 septembre · CODIR 09h00</div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: globalWords >= GLOBAL_MIN ? '#1a6641' : 'var(--ink-mute)', fontFamily: 'var(--font-mono)', lineHeight: 1 }}>{globalWords}</div>
          <div style={{ fontSize: 10, color: 'var(--ink-faint)', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 2 }}>mots / {GLOBAL_MIN} min.</div>
        </div>
      </div>

      {/* Tableau */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px 24px', minHeight: 0 }}>

        {/* En-têtes colonnes */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 0, marginBottom: 0 }}>
          <div style={{ padding: '8px 14px', background: 'var(--ink)', borderRadius: '6px 0 0 0' }}>
            <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,.5)' }}>Expression libre</div>
          </div>
          <div style={{ padding: '8px 14px', background: '#2a3142', borderRadius: '0 6px 0 0' }}>
            <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,.5)' }}>Compétence RNCP 38504</div>
          </div>
        </div>

        {/* Lignes par compétence */}
        {COMPETENCES.map((c, i) => {
          const words = wordCounts[c.code];
          const ok = words >= c.min;
          const isLast = i === COMPETENCES.length - 1;
          return (
            <div key={c.code} style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 0, borderBottom: isLast ? 'none' : '1px solid var(--rule)' }}>

              {/* Colonne gauche — saisie */}
              <div style={{ borderRight: '1px solid var(--rule)', background: 'white', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '10px 14px 6px', borderBottom: '1px solid rgba(20,24,36,0.06)', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.04em' }}>{c.code}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)', flex: 1 }}>{c.label}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: ok ? '#1a6641' : words > 0 ? '#b85c00' : 'var(--ink-faint)', fontWeight: ok ? 700 : 400, flexShrink: 0 }}>
                    {words} / {c.min} mots {ok ? '✓' : ''}
                  </span>
                </div>
                <textarea
                  value={answers[c.code]}
                  onChange={e => setAnswer(c.code, e.target.value)}
                  placeholder={c.placeholder}
                  style={{
                    flex: 1,
                    width: '100%',
                    minHeight: 140,
                    border: 'none',
                    outline: 'none',
                    padding: '12px 14px',
                    fontSize: 13.5,
                    fontFamily: 'var(--font-display)',
                    lineHeight: 1.7,
                    color: 'var(--ink)',
                    resize: 'none',
                    background: 'transparent'
                  }}
                />
              </div>

              {/* Colonne droite — référentiel */}
              <div style={{ background: '#f4f2ee', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 700 }}>{c.code} · Attendu</div>
                <div style={{ fontSize: 12, color: 'var(--ink-soft)', lineHeight: 1.65 }}>{c.rncp}</div>
                <div style={{ marginTop: 'auto', paddingTop: 8, borderTop: '1px solid var(--rule)', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-faint)', letterSpacing: '0.06em' }}>
                  minimum {c.min} mots
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Footer — soumettre */}
      <div style={{ padding: '12px 24px', borderTop: '1px solid var(--rule)', background: 'white', display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
        <div style={{ flex: 1 }}>
          {missingMin.length > 0 ? (
            <div style={{ fontSize: 11, color: '#b85c00' }}>
              Minimum non atteint : {missingMin.map(c => c.code).join(', ')}
            </div>
          ) : globalWords < GLOBAL_MIN ? (
            <div style={{ fontSize: 11, color: '#b85c00' }}>
              Total minimum {GLOBAL_MIN} mots requis ({GLOBAL_MIN - globalWords} restants)
            </div>
          ) : (
            <div style={{ fontSize: 11, color: '#1a6641' }}>
              ✓ Livrable complet — prêt à soumettre
            </div>
          )}
        </div>
        <button
          onClick={canSubmit ? submit : undefined}
          style={{
            background: canSubmit ? '#1a6641' : 'rgba(20,24,36,0.1)',
            color: canSubmit ? 'white' : 'var(--ink-faint)',
            border: 'none', borderRadius: 6,
            padding: '9px 24px', fontSize: 13, fontWeight: 600,
            cursor: canSubmit ? 'pointer' : 'not-allowed',
            transition: 'background .15s'
          }}
        >
          Envoyer à Sonia →
        </button>
      </div>
    </div>
  );
}

window.LUMIO_APPS = window.LUMIO_APPS || {};
window.LUMIO_APPS.livrable = LivrableApp;
