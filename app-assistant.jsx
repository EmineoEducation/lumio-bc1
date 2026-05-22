// ══════════════════════════════════════════════════════════════
//  PASS ASSISTANT — Guidance pédagogique hors fiction
//  Oriente sans donner les réponses · Connaît l'acte en cours
// ══════════════════════════════════════════════════════════════
const { useState: useAssistState, useEffect: useAssistEffect, useRef: useAssistRef } = React;

// ─── Prompt système ──────────────────────────────────────────
function buildAssistantPrompt(studentName, currentAct, elapsedMin) {
  const prenom = (studentName || 'l\'étudiant').split(' ')[0];
  const acts = [
    { n: 1, label: 'Ancrage terrain', desc: 'lecture des premiers documents, identification des acteurs, pas de production encore', duration: '20 min' },
    { n: 2, label: 'Entrée dans l\'affaire', desc: 'analyse approfondie des documents, construction de l\'hypothèse, pas encore de production formelle', duration: '30 min' },
    { n: 3, label: 'Diagnostic', desc: 'production du raisonnement structuré dans Slack avec Sonia, premier feedback IA attendu', duration: '45 min' },
    { n: 4, label: 'Production', desc: 'rédaction du livrable certifiant dans l\'app Livrable, évaluation sur critères RNCP', duration: '1h20' },
    { n: 5, label: 'Réflexion', desc: 'note réflexive individuelle, recul sur les choix produits', duration: '35 min' },
  ];
  const act = acts[Math.min(currentAct - 1, 4)];
  const timeLeft = Math.max(0, 210 - elapsedMin);

  return `Tu es le PASS Assistant — un assistant de guidance pédagogique pour le dispositif PASS (Parcours d'Activation et de Synthèse des Savoirs) d'Éminéo, formation MSMC RNCP 38504.

Tu es HORS FICTION. Tu ne joues aucun personnage de l'univers Lumio Health. Tu n'es ni Sonia, ni Théo, ni Camille. Tu es un guide pédagogique neutre et bienveillant.

CONTEXTE DE LA SESSION EN COURS :
- Étudiant·e : ${prenom}
- Acte actuel : Acte ${act.n} — ${act.label} (${act.duration})
- Ce que l'étudiant doit faire dans cet acte : ${act.desc}
- Temps écoulé : ${elapsedMin} min sur 210 min (3h30 total)
- Temps restant estimé : ~${timeLeft} min

LES 5 ACTES DU PASS (pour référence) :
1. Ancrage terrain (20 min) — lire, observer, identifier les acteurs. Pas de production.
2. Entrée dans l'affaire (30 min) — approfondir l'analyse, construire une hypothèse.
3. Diagnostic (45 min) — produire son raisonnement dans Slack avec Sonia. Premier feedback IA.
4. Production (1h20) — rédiger le livrable certifiant dans l'app Livrable. Évaluation RNCP.
5. Réflexion (35 min) — note réflexive sur ses choix.

LES OUTILS DISPONIBLES DANS L'INTERFACE (bureau macOS fictif) :
- Mail : lettre de mission de Sonia + email confidentiel de Théo Marczak (CEO)
- Finder : dossier Mission (documents), dossier Portraits (fiches personnages), Guide de mission
- Aperçu (PDF) : rapport de veille de Yanis Morel (stagiaire, incomplet)
- Safari (navigateur) : articles de presse sur Lumio et le marché healthtech
- Mémos vocaux : verbatims terrain de Camille Ott (commerciale B2B) — 3 enregistrements
- Bloc-notes : notes libres personnelles
- Slack : DM avec Sonia Ferracci (IA), Camille Ott, Yanis Morel + canaux
- Livrable : formulaire certifiant — déverrouillé après 2 échanges Slack avec Sonia
- Calendrier : deadline CODIR du 30 septembre

TON RÔLE :
- Orienter sans donner les réponses
- Aider à débloquer une situation de blocage (ne sait pas par où commencer, se sent perdu)
- Reformuler ce qui est attendu en langage de mission concret
- Renvoyer vers le bon outil au bon moment
- Rappeler le temps et l'acte en cours quand c'est utile
- Refuser poliment mais fermement toute demande de réponse directe au cas Lumio

CE QUE TU NE FERAS JAMAIS :
- Donner la "bonne réponse" à un exercice (plateforme de marque, diagnostic, recommandation)
- Interpréter les documents à la place de l'étudiant
- Jouer un personnage de la fiction Lumio
- Inventer des informations sur Lumio Health

TON STYLE :
- Phrases courtes, ton direct et chaleureux
- Pas de listes à rallonge — une idée à la fois
- Reformule les questions en questions — "Qu'est-ce que tu as déjà noté sur ce point ?"
- Maximum 120 mots par réponse
- Termine souvent par une question ou une suggestion d'action concrète`;
}

// ─── Icône AssistantIcon ─────────────────────────────────────
window.AssistantIcon = function AssistantIcon({ size = 50 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="52" height="52" rx="12" fill="#1a2436"/>
      <circle cx="26" cy="22" r="10" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="1.5"/>
      <circle cx="26" cy="22" r="3" fill="rgba(255,255,255,0.9)"/>
      <path d="M18 38 C18 32 34 32 34 38" stroke="rgba(255,255,255,0.9)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <circle cx="38" cy="14" r="7" fill="#c4420f"/>
      <text x="38" y="18" textAnchor="middle" fill="white" fontSize="9" fontWeight="700" fontFamily="sans-serif">?</text>
    </svg>
  );
};

// ─── App principale ──────────────────────────────────────────
function AssistantApp() {
  const [messages, setMessages] = useAssistState(() => {
    try { return JSON.parse(localStorage.getItem('lumio_assistant_history') || '[]'); } catch { return []; }
  });
  const [draft, setDraft] = useAssistState('');
  const [sending, setSending] = useAssistState(false);
  const scrollRef = useAssistRef(null);
  const inputRef = useAssistRef(null);

  // Message d'accueil si première ouverture
  const welcomeShown = useAssistRef(false);
  useAssistEffect(() => {
    if (messages.length === 0 && !welcomeShown.current) {
      welcomeShown.current = true;
      const prenom = (window.LUMIO_DATA?.student?.name || '').split(' ')[0] || 'vous';
      setMessages([{
        role: 'assistant',
        text: `Bonjour ${prenom}. Je suis le PASS Assistant — je suis là pour vous aider à naviguer dans l'affaire, pas pour vous donner les réponses.\n\nSi vous êtes bloqué·e, ne savez pas par où commencer, ou avez une question sur le dispositif : posez-la ici. Je ne joue aucun personnage Lumio — je suis hors fiction.`,
        time: now()
      }]);
    }
  }, []);

  // Persist history
  useAssistEffect(() => {
    localStorage.setItem('lumio_assistant_history', JSON.stringify(messages));
  }, [messages]);

  // Auto-scroll
  useAssistEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, sending]);

  function now() {
    const d = new Date();
    return `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
  }

  function getElapsedMin() {
    if (!window.LUMIO_TIMER_START) return 0;
    return Math.floor((Date.now() - window.LUMIO_TIMER_START) / 60000);
  }

  function getCurrentAct() {
    const min = getElapsedMin();
    if (min < 20) return 1;
    if (min < 50) return 2;
    if (min < 95) return 3;
    if (min < 175) return 4;
    return 5;
  }

  const send = async () => {
    if (!draft.trim() || sending) return;
    const text = draft.trim();
    setDraft('');
    const userMsg = { role: 'user', text, time: now() };
    const next = [...messages, userMsg];
    setMessages(next);
    setSending(true);

    try {
      // Construire l'historique pour l'API
      const apiHistory = next.map(m => ({
        role: m.role,
        content: m.text
      }));

      const studentName = window.LUMIO_DATA?.student?.name || '';
      const act = getCurrentAct();
      const elapsed = getElapsedMin();

      const resp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 400,
          system: buildAssistantPrompt(studentName, act, elapsed),
          messages: apiHistory
        })
      });

      const data = await resp.json();
      const reply = data.content?.[0]?.text || 'Je ne peux pas répondre pour le moment. Réessayez.';
      setMessages(h => [...h, { role: 'assistant', text: reply, time: now() }]);
    } catch (e) {
      setMessages(h => [...h, { role: 'assistant', text: 'Connexion impossible. Vérifiez votre réseau et réessayez.', time: now() }]);
    } finally {
      setSending(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const clearHistory = () => {
    if (window.confirm('Effacer l\'historique de la conversation ?')) {
      localStorage.removeItem('lumio_assistant_history');
      setMessages([]);
      welcomeShown.current = false;
    }
  };

  const act = getCurrentAct();
  const actLabels = ['', 'Ancrage terrain', 'Entrée dans l\'affaire', 'Diagnostic ★', 'Production ★', 'Réflexion'];
  const actColors = ['', '#7a756c', '#1b4f8a', '#1a6641', '#c4420f', '#7a756c'];
  const elapsed = getElapsedMin();
  const remaining = Math.max(0, 210 - elapsed);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#f4f2ee', overflow: 'hidden' }}>

      {/* ── En-tête ── */}
      <div style={{
        padding: '14px 18px 12px',
        borderBottom: '1px solid rgba(20,24,36,0.1)',
        background: '#1a2436',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 9,
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16
            }}>🧭</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'white', lineHeight: 1.2 }}>PASS Assistant</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.04em' }}>Guide de mission · hors fiction</div>
            </div>
          </div>
          <button
            onClick={clearHistory}
            title="Effacer l'historique"
            style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: 13, padding: '4px 8px', borderRadius: 6 }}
            onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
          >effacer</button>
        </div>

        {/* ── Bandeau acte + timer ── */}
        <div style={{
          marginTop: 12,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'rgba(255,255,255,0.07)',
          borderRadius: 8, padding: '8px 12px',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: actColors[act],
              boxShadow: `0 0 6px ${actColors[act]}`
            }} />
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}>
              ACTE {act} — {actLabels[act].toUpperCase()}
            </div>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: remaining < 30 ? '#f5a623' : 'rgba(255,255,255,0.45)' }}>
            {remaining} min restantes
          </div>
        </div>
      </div>

      {/* ── Messages ── */}
      <div
        ref={scrollRef}
        style={{ flex: 1, overflowY: 'auto', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}
      >
        {messages.map((m, i) => (
          <div key={i} style={{
            display: 'flex',
            flexDirection: m.role === 'user' ? 'row-reverse' : 'row',
            alignItems: 'flex-end', gap: 8
          }}>
            {m.role === 'assistant' && (
              <div style={{
                width: 28, height: 28, borderRadius: 7, flexShrink: 0,
                background: '#1a2436',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, marginBottom: 2
              }}>🧭</div>
            )}
            <div style={{
              maxWidth: '78%',
              background: m.role === 'user' ? '#1a2436' : 'white',
              color: m.role === 'user' ? 'white' : 'var(--ink)',
              borderRadius: m.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
              padding: '10px 14px',
              fontSize: 13,
              lineHeight: 1.65,
              boxShadow: '0 1px 3px rgba(20,24,36,0.08)',
              border: m.role === 'assistant' ? '1px solid rgba(20,24,36,0.08)' : 'none',
              whiteSpace: 'pre-wrap'
            }}>
              {m.text}
              <div style={{
                fontSize: 10,
                color: m.role === 'user' ? 'rgba(255,255,255,0.35)' : 'rgba(20,24,36,0.3)',
                marginTop: 5, textAlign: 'right'
              }}>{m.time}</div>
            </div>
          </div>
        ))}

        {sending && (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: '#1a2436', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🧭</div>
            <div style={{
              background: 'white', borderRadius: '14px 14px 14px 4px',
              padding: '12px 16px', border: '1px solid rgba(20,24,36,0.08)',
              display: 'flex', gap: 5, alignItems: 'center'
            }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: 6, height: 6, borderRadius: '50%', background: '#9aa0ae',
                  animation: 'typedot 1.2s ease-in-out infinite',
                  animationDelay: `${i * 0.2}s`
                }} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Suggestions rapides (si peu de messages) ── */}
      {messages.length <= 2 && (
        <div style={{ padding: '0 18px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ fontSize: 11, color: 'var(--ink-faint)', marginBottom: 2, letterSpacing: '0.05em' }}>QUESTIONS FRÉQUENTES</div>
          {[
            'Je ne sais pas par où commencer',
            'Combien de temps me reste-t-il ?',
            'Qu\'est-ce qu\'on attend de moi exactement ?',
            'Comment utiliser Slack avec Sonia ?',
          ].map((q, i) => (
            <button
              key={i}
              onClick={() => { setDraft(q); setTimeout(() => inputRef.current?.focus(), 50); }}
              style={{
                background: 'white', border: '1px solid rgba(20,24,36,0.1)',
                borderRadius: 8, padding: '8px 12px',
                fontSize: 12, color: 'var(--ink-soft)', cursor: 'pointer',
                textAlign: 'left', transition: 'all .15s',
                fontFamily: 'var(--font-sans)'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#f0ece4'; e.currentTarget.style.borderColor = 'rgba(20,24,36,0.2)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = 'rgba(20,24,36,0.1)'; }}
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* ── Zone de saisie ── */}
      <div style={{
        padding: '10px 14px 14px',
        borderTop: '1px solid rgba(20,24,36,0.08)',
        background: 'white', flexShrink: 0
      }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
          <textarea
            ref={inputRef}
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Posez une question sur la navigation, les outils, le temps restant…"
            rows={2}
            style={{
              flex: 1, resize: 'none', border: '1px solid rgba(20,24,36,0.15)',
              borderRadius: 10, padding: '9px 12px',
              fontSize: 13, color: 'var(--ink)', background: '#f9f7f4',
              outline: 'none', fontFamily: 'var(--font-sans)', lineHeight: 1.5,
              transition: 'border-color .15s'
            }}
            onFocus={e => e.target.style.borderColor = '#1a2436'}
            onBlur={e => e.target.style.borderColor = 'rgba(20,24,36,0.15)'}
          />
          <button
            onClick={send}
            disabled={!draft.trim() || sending}
            style={{
              width: 36, height: 36, borderRadius: 9, flexShrink: 0,
              background: draft.trim() && !sending ? '#1a2436' : 'rgba(20,24,36,0.12)',
              border: 'none', cursor: draft.trim() && !sending ? 'pointer' : 'default',
              color: draft.trim() && !sending ? 'white' : 'rgba(20,24,36,0.35)',
              fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all .15s', marginBottom: 1
            }}
          >↑</button>
        </div>
        <div style={{ fontSize: 10, color: 'var(--ink-faint)', marginTop: 6, paddingLeft: 2 }}>
          Entrée pour envoyer · Shift+Entrée pour aller à la ligne · L'assistant ne donne pas les réponses
        </div>
      </div>
    </div>
  );
}

// ─── Enregistrement dans LUMIO_APPS ─────────────────────────
window.LUMIO_APPS = window.LUMIO_APPS || {};
window.LUMIO_APPS['assistant'] = AssistantApp;
