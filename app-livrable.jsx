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

function LivrableApp() {
  const cfg = window.PASS_CONFIG;
  const COMPETENCES = cfg ? cfg.competences : [];

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
  const [activeTab, setActiveTab] = React.useState(COMPETENCES[0]?.code || 'C.1');
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
    if (!c.motsCles) return [];
    const text = (answers[c.code] || '').toLowerCase();
    return c.motsCles.filter(kw => !text.includes(kw.toLowerCase()));
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
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1200,
          system: JURY_PROMPT,
          messages: [{ role: 'user', content: livrableText }]
        })
      });
      const data = await resp.json();
      const result = data.content?.map(b => b.text || '').join('') || 'Erreur de connexion.';
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
      alert('Erreur de connexion. Réessaie.');
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

  // ── Écran final ──
  if (phase === 'done') return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#f9f8f5', overflowY: 'auto' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 40px', textAlign: 'center', gap: 20 }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#1a6641', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 400, color: 'var(--ink)', marginBottom: 6 }}>Dossier remis à Sonia</div>
          <div style={{ fontSize: 13, color: 'var(--ink-mute)', lineHeight: 1.7 }}>
            {cfg?.epreuve || 'BC1'} · {cfg?.deadline || '30 septembre 2026'}
          </div>
        </div>

        {/* Récap compétences */}
        <div style={{ width: '100%', maxWidth: 480, background: 'white', borderRadius: 10, padding: '16px 20px', border: '1px solid var(--rule)' }}>
          <div style={{ fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-mono)', letterSpacing: '0.12em', color: 'var(--ink-mute)', textTransform: 'uppercase', marginBottom: 12 }}>Compétences soumises</div>
          {COMPETENCES.map(c => {
            const words = wordCounts[c.code];
            const ok = words >= c.min;
            return (
              <div key={c.code} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '5px 0', borderBottom: '1px solid rgba(20,24,36,0.05)' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: 'var(--accent)', minWidth: 28 }}>{c.code}</span>
                <span style={{ flex: 1, fontSize: 12, color: 'var(--ink)' }}>{c.label}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: ok ? '#1a6641' : '#c4420f', fontWeight: 700 }}>{words} mots {ok ? '✓' : '⚠'}</span>
              </div>
            );
          })}
          <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--rule)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: 'var(--ink-mute)' }}>Total</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700, color: '#1a6641' }}>{globalWords} mots</span>
          </div>
        </div>

        <div style={{ background: 'rgba(26,102,65,0.08)', borderRadius: 8, padding: '10px 20px', border: '1px solid rgba(26,102,65,0.2)', fontSize: 12, color: '#1a6641', lineHeight: 1.6 }}>
          🎓 L'évaluation du jury IA a été envoyée dans Slack.<br/>
          Ouvre le canal <strong>Sonia Ferracci</strong> pour lire le retour certifiant.
        </div>
      </div>
    </div>
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
              <div style={{ fontSize: 11, color: '#1a3d28', lineHeight: 1.6 }}>{activeComp.conseil}</div>
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
