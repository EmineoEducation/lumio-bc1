// ══════════════════════════════════════════════════════════════
//  PASS ASSISTANT — Guidance pédagogique hors fiction V2
//  · Conscient des 3 temps de séance
//  · Conscient des compétences RNCP en cours
//  · Suggestions rapides contextuelles selon le temps
// ══════════════════════════════════════════════════════════════
const { useState: useAssistState, useEffect: useAssistEffect, useRef: useAssistRef } = React;

function buildAssistantPrompt(studentName, elapsedMin) {
  const prenom = (studentName || '').split(' ')[0] || 'vous';
  const cfg = window.PASS_CONFIG;
  const timeLeft = Math.max(0, 210 - elapsedMin);

  // Déterminer le temps actuel (T1/T2/T3)
  let tempsActuel, todoActuel;
  if (cfg) {
    const t = cfg.temps.find(t => elapsedMin >= t.debut && elapsedMin < t.fin) || cfg.temps[cfg.temps.length - 1];
    tempsActuel = `T${t.n} — ${t.label} (${t.debut}–${t.fin} min) : ${t.objectif}`;
    todoActuel = t.todoSuggere?.join('\n- ') || '';
  } else {
    tempsActuel = elapsedMin < 75 ? 'T1 — Exploration' : elapsedMin < 150 ? 'T2 — Structuration' : 'T3 — Production';
    todoActuel = '';
  }

  const competencesList = cfg?.competences?.map(c => `${c.code} (${c.libelle}) — min. ${c.min} mots`).join('\n') || 'C.1 à C.6';

  return `Tu es le PASS Assistant — un assistant de guidance pédagogique pour le dispositif PASS d'Éminéo, formation MSMC RNCP 38504.

Tu es HORS FICTION. Tu ne joues aucun personnage de l'univers Lumio Health. Tu es un guide pédagogique neutre et bienveillant.

CONTEXTE SESSION :
- Étudiant·e : ${prenom}
- Temps écoulé : ${elapsedMin} min sur 210 min
- Temps restant : ~${timeLeft} min
- Temps actuel : ${tempsActuel}
${todoActuel ? `- À faire dans ce temps :\n  - ${todoActuel}` : ''}

LES 3 TEMPS DE LA SÉANCE :
T1 (0–75 min) : Exploration guidée — lire tous les documents, comprendre le contexte, identifier les acteurs
T2 (75–150 min) : Structuration — analyser, prendre position, remplir C.1 à C.4
T3 (150–210 min) : Production — finaliser C.5 et C.6, soumettre le livrable avant la deadline

LES 6 COMPÉTENCES RNCP À COUVRIR DANS LE LIVRABLE :
${competencesList}

OUTILS DISPONIBLES SUR LE BUREAU :
- Mail : lettre de mission Sonia + email confidentiel Théo (CEO)
- Finder : dossier Mission (documents), dossier Portraits (personnages), Guide
- Aperçu (PDF) : rapport de veille Yanis (stagiaire, incomplet)
- Safari : articles de presse healthtech
- Mémos vocaux : 3 verbatims terrain Camille Ott (commerciale B2B) — déverrouillés en T2
- Slack : DM avec Sonia Ferracci (IA) — envoyer une hypothèse débloque le Livrable
- Livrable : formulaire 6 compétences — déverrouillé après 2 échanges Slack
- PASS Assistant (ici) : guide hors fiction, permanent

CONTRADICTIONS CLÉS DANS LES DOCUMENTS (à traiter dans C.3) :
- 230 "entreprises clientes" (Sonia) vs 180 "références actives" (Théo)
- Budget demandé 380K€ (Sonia) vs plafond 200K€ (Théo)
- Certification MDR : "en cours" (Yanis) vs "fin Q2 2027 au mieux" (email Théo)

TON RÔLE :
- Orienter sans donner les réponses
- Débloquer une situation de blocage
- Reformuler ce qui est attendu en langage de mission
- Renvoyer vers le bon outil au bon moment
- Signaler le temps restant quand pertinent
- Refuser poliment mais fermement les demandes de réponse directe

CE QUE TU NE FERAS JAMAIS :
- Rédiger ou suggérer un diagnostic pour l'étudiant
- Révéler la "bonne" plateforme de marque
- Jouer un personnage Lumio
- Répondre "oui c'est juste" ou "non c'est faux" sur une analyse

STYLE :
- Phrases courtes, ton direct et chaleureux
- Reformule en questions — "Qu'est-ce que vous avez déjà noté ?"
- Maximum 120 mots par réponse
- Termine souvent par une action concrète ou une question`;
}

window.AssistantIcon = function AssistantIcon({ size = 50 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="52" height="52" rx="12" fill="#1a2436"/>
      <circle cx="26" cy="21" r="9" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="1.5"/>
      <circle cx="26" cy="21" r="2.5" fill="rgba(255,255,255,0.85)"/>
      <path d="M19 38 C19 32.5 33 32.5 33 38" stroke="rgba(255,255,255,0.85)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <circle cx="37" cy="14" r="7" fill="#c4420f"/>
      <text x="37" y="18" textAnchor="middle" fill="white" fontSize="9" fontWeight="700" fontFamily="sans-serif">?</text>
    </svg>
  );
};

function AssistantApp() {
  const [messages, setMessages] = useAssistState(() => {
    try { return JSON.parse(localStorage.getItem('lumio_assistant_history') || '[]'); } catch { return []; }
  });
  const [draft, setDraft] = useAssistState('');
  const [sending, setSending] = useAssistState(false);
  const scrollRef = useAssistRef(null);
  const inputRef = useAssistRef(null);
  const welcomeShown = useAssistRef(false);

  const getElapsedMin = () => {
    if (!window.LUMIO_TIMER_START) return 0;
    return Math.floor((Date.now() - window.LUMIO_TIMER_START) / 60000);
  };

  const getCurrentTemps = () => {
    const min = getElapsedMin();
    if (min < 75) return 1;
    if (min < 150) return 2;
    return 3;
  };

  const getTodoSuggestions = () => {
    const cfg = window.PASS_CONFIG;
    const t = getCurrentTemps();
    const tempsObj = cfg?.temps?.[t - 1];
    return tempsObj?.todoSuggere || [];
  };

  useAssistEffect(() => {
    if (messages.length === 0 && !welcomeShown.current) {
      welcomeShown.current = true;
      const prenom = (window.LUMIO_DATA?.student?.name || '').split(' ')[0] || 'vous';
      setMessages([{
        role: 'assistant',
        text: `Bonjour ${prenom}. Je suis le PASS Assistant — votre guide hors fiction.\n\nJe peux vous aider à naviguer dans le dispositif, comprendre ce qu'on attend de vous à chaque étape, ou débloquer une situation. Je ne donne pas les réponses — je vous aide à les trouver.\n\nVous avez 3h30. Le temps tourne. Par où commencer ?`,
        time: now()
      }]);
    }
  }, []);

  useAssistEffect(() => {
    localStorage.setItem('lumio_assistant_history', JSON.stringify(messages));
  }, [messages]);

  useAssistEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, sending]);

  function now() {
    const d = new Date();
    return `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
  }

  const send = async (text) => {
    const msg = (text || draft).trim();
    if (!msg || sending) return;
    setDraft('');
    const userMsg = { role: 'user', text: msg, time: now() };
    const next = [...messages, userMsg];
    setMessages(next);
    setSending(true);

    try {
      const apiHistory = next.map(m => ({ role: m.role, content: m.text }));
      const studentName = window.LUMIO_DATA?.student?.name || '';
      const elapsed = getElapsedMin();

      const resp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 400,
          system: buildAssistantPrompt(studentName, elapsed),
          messages: apiHistory
        })
      });
      const data = await resp.json();
      const reply = data.content?.[0]?.text || 'Je ne peux pas répondre pour le moment.';
      setMessages(h => [...h, { role: 'assistant', text: reply, time: now() }]);
    } catch {
      setMessages(h => [...h, { role: 'assistant', text: 'Connexion impossible. Vérifiez votre réseau et réessayez.', time: now() }]);
    } finally {
      setSending(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } };

  const elapsed = getElapsedMin();
  const tempsN = getCurrentTemps();
  const remaining = Math.max(0, 210 - elapsed);
  const tempsLabels = ['', 'Exploration', 'Structuration', 'Production'];
  const tempsCouleurs = ['', '#1b4f8a', '#1a6641', '#c4420f'];
  const todos = getTodoSuggestions();

  // Suggestions contextuelles selon le temps
  const suggestions = tempsN === 1
    ? ['Je ne sais pas par où commencer', 'Que dois-je lire en premier ?', 'Comment utiliser Slack avec Sonia ?']
    : tempsN === 2
    ? ['Comment traiter les contradictions dans les documents ?', 'Par quelle compétence commencer le livrable ?', 'Combien de temps me reste-t-il ?']
    : ['Comment structurer la plateforme de marque ?', 'Qu\'est-ce que le jury va regarder ?', 'Puis-je encore consulter les documents en T3 ?'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#f4f2ee', overflow: 'hidden' }}>

      {/* Header */}
      <div style={{ padding: '14px 18px 12px', background: '#1a2436', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🧭</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>PASS Assistant</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.04em' }}>Guide hors fiction · toujours disponible</div>
            </div>
          </div>
          <button onClick={() => { if (window.confirm('Effacer l\'historique ?')) { localStorage.removeItem('lumio_assistant_history'); setMessages([]); welcomeShown.current = false; } }} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.25)', cursor: 'pointer', fontSize: 12, padding: '4px 8px', borderRadius: 5 }} onMouseEnter={e => e.currentTarget.style.color='rgba(255,255,255,0.6)'} onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.25)'}>effacer</button>
        </div>

        {/* Bandeau temps actuel */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.07)', borderRadius: 7, padding: '7px 12px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: tempsCouleurs[tempsN], boxShadow: `0 0 5px ${tempsCouleurs[tempsN]}` }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.05em' }}>T{tempsN} — {tempsLabels[tempsN].toUpperCase()}</span>
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: remaining < 30 ? '#f5a623' : 'rgba(255,255,255,0.4)' }}>{remaining} min</span>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: m.role === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-end', gap: 7 }}>
            {m.role === 'assistant' && (
              <div style={{ width: 26, height: 26, borderRadius: 7, background: '#1a2436', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0, marginBottom: 2 }}>🧭</div>
            )}
            <div style={{
              maxWidth: '78%',
              background: m.role === 'user' ? '#1a2436' : 'white',
              color: m.role === 'user' ? 'white' : 'var(--ink)',
              borderRadius: m.role === 'user' ? '13px 13px 4px 13px' : '13px 13px 13px 4px',
              padding: '9px 13px', fontSize: 13, lineHeight: 1.65,
              boxShadow: '0 1px 3px rgba(20,24,36,0.07)',
              border: m.role === 'assistant' ? '1px solid rgba(20,24,36,0.07)' : 'none',
              whiteSpace: 'pre-wrap'
            }}>
              {m.text}
              <div style={{ fontSize: 9, color: m.role === 'user' ? 'rgba(255,255,255,0.3)' : 'rgba(20,24,36,0.25)', marginTop: 4, textAlign: 'right' }}>{m.time}</div>
            </div>
          </div>
        ))}
        {sending && (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 7 }}>
            <div style={{ width: 26, height: 26, borderRadius: 7, background: '#1a2436', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>🧭</div>
            <div style={{ background: 'white', borderRadius: '13px 13px 13px 4px', padding: '11px 14px', border: '1px solid rgba(20,24,36,0.07)', display: 'flex', gap: 4 }}>
              {[0,1,2].map(i => <div key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: '#9aa0ae', animation: 'typedot 1.2s ease-in-out infinite', animationDelay: `${i*0.2}s` }} />)}
            </div>
          </div>
        )}
      </div>

      {/* Suggestions rapides */}
      {messages.length <= 2 && (
        <div style={{ padding: '0 16px 10px', display: 'flex', flexDirection: 'column', gap: 5 }}>
          <div style={{ fontSize: 10, color: 'var(--ink-faint)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 2 }}>Questions fréquentes — T{tempsN}</div>
          {suggestions.map((q, i) => (
            <button key={i} onClick={() => send(q)} style={{ background: 'white', border: '1px solid rgba(20,24,36,0.1)', borderRadius: 7, padding: '7px 11px', fontSize: 12, color: 'var(--ink-soft)', cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font-sans)', transition: 'all .12s' }} onMouseEnter={e => { e.currentTarget.style.background='#ece8e0'; e.currentTarget.style.borderColor='rgba(20,24,36,0.2)'; }} onMouseLeave={e => { e.currentTarget.style.background='white'; e.currentTarget.style.borderColor='rgba(20,24,36,0.1)'; }}>{q}</button>
          ))}
        </div>
      )}

      {/* Zone saisie */}
      <div style={{ padding: '8px 14px 13px', borderTop: '1px solid rgba(20,24,36,0.08)', background: 'white', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 7, alignItems: 'flex-end' }}>
          <textarea ref={inputRef} value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={handleKey} placeholder="Posez votre question…" rows={2} style={{ flex: 1, resize: 'none', border: '1px solid rgba(20,24,36,0.14)', borderRadius: 9, padding: '8px 11px', fontSize: 13, color: 'var(--ink)', background: '#f9f7f4', outline: 'none', fontFamily: 'var(--font-sans)', lineHeight: 1.5 }} onFocus={e => e.target.style.borderColor='#1a2436'} onBlur={e => e.target.style.borderColor='rgba(20,24,36,0.14)'} />
          <button onClick={() => send()} disabled={!draft.trim() || sending} style={{ width: 34, height: 34, borderRadius: 8, flexShrink: 0, background: draft.trim() && !sending ? '#1a2436' : 'rgba(20,24,36,0.1)', border: 'none', cursor: draft.trim() && !sending ? 'pointer' : 'default', color: draft.trim() && !sending ? 'white' : 'rgba(20,24,36,0.3)', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s', marginBottom: 1 }}>↑</button>
        </div>
        <div style={{ fontSize: 9, color: 'var(--ink-faint)', marginTop: 5, paddingLeft: 2 }}>Entrée pour envoyer · L'assistant ne donne pas les réponses</div>
      </div>
    </div>
  );
}

window.LUMIO_APPS = window.LUMIO_APPS || {};
window.LUMIO_APPS['assistant'] = AssistantApp;
