// ══════════════════════════════════════════════════════════════
//  LIVRABLE APP — Note de synthèse + Plateforme de marque + Jury IA
// ══════════════════════════════════════════════════════════════

const JURY_PROMPT = `Tu es un jury d'évaluation certifiant pour le Master MSMC (RNCP 38504), bloc de compétences BC1. Tu évalues le livrable complet produit par un étudiant : une note de synthèse de veille stratégique et une plateforme de marque pour Lumio Health.

Contexte Lumio Health :
- Medtech parisienne, 8 ans, wearable stress (Lumio Patch), historiquement B2B (DRH)
- Pression d'un fonds américain : grand public en 36 mois, objectif 20M€ CA
- Deux concurrents certifiés MDR IIa (Biostream jan. 2026, Neuroflow mars 2026). Lumio pas certifiée, fin Q2 2027 au mieux selon Théo
- Tension Sonia (230 clients, budget 380K€, territoire "expert santé invisible") vs Théo (180 références, 200K€ max, bloque sur MDR)
- Camille Ott : les DRH posent des questions sur la certif — "c'est une horloge", 6-9 mois avant basculement
- Information terrain Camille : certification MDR = 22 mois et ~400K€ minimum

Grille d'évaluation — 6 compétences RNCP :
C.1 : Veille organisée · sources identifiées · couverture réglementaire/concurrentielle/sociocomportementale
C.2 : Qualification opportunité/risque argumentée · hiérarchisation
C.3 : Exploitation des données disponibles · verbatims mobilisés · contradictions traitées
C.4 : Diagnostic fondé · matrices mobilisées · interprétation pas description
C.5 : Écart identifié entre identité déclarée et perception réelle · tension B2B/B2C nommée
C.6 : Plateforme cohérente · proposition de valeur opérationnelle · engagements RSE · cohérence avec contraintes (budget, MDR)

Format STRICT de ton retour :
## Ce qui est solide
2-3 points précis avec les compétences couvertes nommées. Cite les mots de l'étudiant.

## Ce qui manque ou est insuffisant
2-3 points précis avec les compétences RNCP non couvertes nommées.

## Niveau de conformité
Une seule ligne : Non conforme / Partiellement conforme / Conforme / Conforme avec distinction

## Question de jury
Une seule question qu'un jury poserait à l'oral — précise, dérangeante, sans réponse évidente.

Règles absolues : ne rédige pas de plateforme alternative. Ne complète pas les lacunes. Cite les mots de l'étudiant. Si une partie est absente, nomme-le d'emblée.`;

function LivrableApp() {
  const [veille, setVeille] = React.useState('');
  const [plateforme, setPlateforme] = React.useState('');
  const [phase, setPhase] = React.useState('edit'); // edit | submitting | result
  const [result, setResult] = React.useState('');
  const [wordVeille, setWordVeille] = React.useState(0);
  const [wordPlat, setWordPlat] = React.useState(0);

  const count = (txt) => txt.trim() ? txt.trim().split(/\s+/).length : 0;

  const submit = async () => {
    if (!veille.trim() || !plateforme.trim()) return;
    setPhase('submitting');
    const content = `PARTIE 1 — NOTE DE SYNTHÈSE VEILLE STRATÉGIQUE\n\n${veille}\n\n---\n\nPARTIE 2 — PLATEFORME DE MARQUE LUMIO HEALTH\n\n${plateforme}`;
    try {
      const resp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: JURY_PROMPT,
          messages: [{ role: 'user', content }]
        })
      });
      const data = await resp.json();
      const juryResult = data.content?.map(b => b.text || '').join('') || 'Erreur.';
      setResult(juryResult);
      setPhase('result');

      // Sonia reçoit le livrable — notif Slack
      setTimeout(() => {
        if (window.__onLivrableSubmitted) {
          window.__onLivrableSubmitted(veille, plateforme, juryResult);
        }
      }, 1200);

    } catch(e) {
      setResult('Erreur de connexion. Réessaie.');
      setPhase('result');
    }
  };

  const S = {
    app: { display: 'flex', flexDirection: 'column', height: '100%', background: '#f9f8f5', fontFamily: 'var(--font-sans)', overflow: 'hidden' },
    header: { padding: '14px 22px 10px', borderBottom: '1px solid var(--rule)', background: 'white', flexShrink: 0 },
    title: { fontSize: 17, fontWeight: 700, color: 'var(--ink)', marginBottom: 2 },
    subtitle: { fontSize: 11, color: 'var(--ink-faint)', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' },
    body: { flex: 1, overflow: 'auto', padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 16, minHeight: 0 },
    section: { background: 'white', border: '1px solid var(--rule)', borderRadius: 8, overflow: 'hidden' },
    sectionHead: { padding: '10px 16px', borderBottom: '1px solid var(--rule)', background: '#f4f2ee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    sectionLabel: { fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--accent)' },
    wc: { fontSize: 11, color: 'var(--ink-faint)', fontFamily: 'var(--font-mono)' },
    textarea: { width: '100%', border: 'none', outline: 'none', padding: '14px 16px', fontSize: 13.5, fontFamily: 'var(--font-display)', lineHeight: 1.7, color: 'var(--ink)', resize: 'none', minHeight: 180, background: 'transparent' },
    footer: { padding: '12px 22px', borderTop: '1px solid var(--rule)', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 },
    hint: { fontSize: 12, color: 'var(--ink-mute)' },
    btn: { background: '#1a6641', color: 'white', border: 'none', borderRadius: 6, padding: '9px 22px', fontSize: 13, fontWeight: 600, cursor: 'pointer' },
    btnDis: { background: 'rgba(20,24,36,0.12)', color: 'var(--ink-faint)', cursor: 'not-allowed' },
    result: { flex: 1, overflow: 'auto', padding: '24px 28px' },
    resultTitle: { fontSize: 16, fontWeight: 700, color: 'var(--ink)', marginBottom: 16, fontFamily: 'var(--font-display)' },
    resultBody: { fontSize: 14, lineHeight: 1.75, color: 'var(--ink-soft)', whiteSpace: 'pre-wrap', fontFamily: 'var(--font-display)' },
    backBtn: { background: 'transparent', border: '1px solid var(--rule)', borderRadius: 6, padding: '7px 16px', fontSize: 12, color: 'var(--ink-soft)', cursor: 'pointer', marginTop: 20 }
  };

  if (phase === 'result') return (
    <div style={S.app}>
      <div style={S.header}>
        <div style={S.title}>Évaluation du jury</div>
        <div style={S.subtitle}>BC1 · RNCP 38504 · Mission Lumio Health</div>
      </div>
      <div style={S.result}>
        {/* Retour jury */}
        <div style={{ ...S.resultTitle }}>Retour certifiant — BC1</div>
        <div style={S.resultBody}>{result}</div>

        {/* Séparateur */}
        <div style={{ margin: '32px 0 24px', borderTop: '1px solid var(--rule)' }} />

        {/* Écran de clôture — Le Retour (Voyage du héros) */}
        <div style={{
          background: '#f4f2ee', borderRadius: 10,
          padding: '24px 28px', marginBottom: 24
        }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 12 }}>
            Ce que tu rapportes de cette mission
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.4, marginBottom: 16 }}>
            Tu as traversé le dossier Lumio Health de part en part.
          </div>
          <div style={{ fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.75, marginBottom: 20 }}>
            Tu as lu les documents dans le désordre du réel. Tu as repéré que Sonia et Théo ne parlent pas des mêmes 230 clients. Tu as compris que la certification MDR n'est pas un détail administratif — c'est l'obstacle central qui rend intenable n'importe quelle promesse de marque ambitieuse avant 2027. Tu as produit une analyse et une proposition.
          </div>

          {/* Compétences couvertes */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
            {['C.1 · Veille organisée','C.2 · Quali. opportunités/risques','C.3 · Exploitation données','C.4 · Diagnostic fondé','C.5 · Écart identité/perception','C.6 · Plateforme cohérente'].map(c => (
              <div key={c} style={{
                padding: '4px 10px', borderRadius: 4,
                background: 'white', border: '1px solid var(--rule)',
                fontSize: 11, color: 'var(--ink-soft)', fontFamily: 'var(--font-mono)'
              }}>{c}</div>
            ))}
          </div>

          {/* Phrase Compilatio */}
          <div style={{ background: 'white', border: '1px solid var(--rule)', borderLeft: '3px solid var(--accent)', borderRadius: '0 6px 6px 0', padding: '14px 18px' }}>
            <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ink-mute)', marginBottom: 8 }}>
              Phrase pour Compilatio · BC1
            </div>
            <div style={{ fontSize: 13, fontFamily: 'var(--font-display)', fontStyle: 'italic', color: 'var(--ink-soft)', lineHeight: 1.7 }}>
              "Dans le cadre de l'affaire Lumio Health (BC1), j'ai produit une note de synthèse de veille stratégique couvrant les dimensions réglementaires (MDR), concurrentielles et sociocomportementales, ainsi qu'une plateforme de marque cohérente avec les contraintes identifiées — certification en attente, tension B2B/B2C, budget contraint. J'ai mobilisé les données documentaires fournies et les échanges avec la Directrice Marketing pour construire un diagnostic fondé, pas une liste d'observations."
            </div>
          </div>
        </div>

        <button style={S.backBtn} onClick={() => setPhase('edit')}>← Modifier et soumettre à nouveau</button>
      </div>
    </div>
  );

  if (phase === 'submitting') return (
    <div style={{ ...S.app, alignItems: 'center', justifyContent: 'center', gap: 14 }}>
      <div style={{ width: 40, height: 40, border: '3px solid rgba(26,102,65,0.2)', borderTopColor: '#1a6641', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <div style={{ fontSize: 13, color: 'var(--ink-mute)', fontStyle: 'italic' }}>Le jury évalue ta livraison…</div>
    </div>
  );

  const canSubmit = veille.trim().length > 80 && plateforme.trim().length > 80;
  return (
    <div style={S.app}>
      <div style={S.header}>
        <div style={S.title}>Livrable — BC1 · Lumio Health</div>
        <div style={S.subtitle}>À remettre avant le 30 septembre · CODIR · Sonia Ferracci</div>
      </div>
      <div style={S.body}>
        <div style={{ fontSize: 12, color: 'var(--ink-mute)', padding: '4px 0', fontStyle: 'italic' }}>
          Rédige les deux parties ci-dessous. Quand tu es prêt(e), soumets au jury — tu recevras une évaluation certifiante.
        </div>
        <div style={S.section}>
          <div style={S.sectionHead}>
            <span style={S.sectionLabel}>Partie 1 · Note de synthèse veille stratégique (C.1 / C.2)</span>
            <span style={S.wc}>{wordVeille} mots</span>
          </div>
          <textarea
            style={S.textarea}
            value={veille}
            onChange={e => { setVeille(e.target.value); setWordVeille(count(e.target.value)); }}
            placeholder="Tendances de l'environnement Lumio (réglementaires, concurrentielles, sociocomportementales) · Qualification opportunité / risque pour chaque tendance · Sources identifiées…"
          />
        </div>
        <div style={S.section}>
          <div style={S.sectionHead}>
            <span style={S.sectionLabel}>Partie 2 · Plateforme de marque (C.3 à C.6)</span>
            <span style={S.wc}>{wordPlat} mots</span>
          </div>
          <textarea
            style={S.textarea}
            value={plateforme}
            onChange={e => { setPlateforme(e.target.value); setWordPlat(count(e.target.value)); }}
            placeholder="Territoire · Proposition de valeur · Cibles B2B / B2C · Personnalité · Engagements RSE · Justification au regard du diagnostic…"
          />
        </div>
      </div>
      <div style={S.footer}>
        <div style={S.hint}>Entrée libre · Formulation professionnelle attendue</div>
        <button
          style={{ ...S.btn, ...(canSubmit ? {} : S.btnDis) }}
          onClick={canSubmit ? submit : undefined}
        >
          Soumettre au jury →
        </button>
      </div>
    </div>
  );
}

window.LUMIO_APPS = window.LUMIO_APPS || {};
window.LUMIO_APPS.livrable = LivrableApp;
