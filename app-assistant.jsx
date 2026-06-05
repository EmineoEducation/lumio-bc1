// ══════════════════════════════════════════════════════════════
//  JEFFERSON — Guide procédural PAC · Compagnon permanent
//  Charte Éminéo : #0B2B2D #5DE298 #E3FFF0 #E89B77
//  Posture : dit quoi faire, quand, avec quel outil
// ══════════════════════════════════════════════════════════════
const { useState: useJState, useEffect: useJEffect, useRef: useJRef } = React;

// ─── Prompt Jefferson — guide procédural ────────────────────
function buildJeffersonPrompt(studentName, elapsedMin) {
  const prenom = (studentName || '').split(' ')[0] || 'vous';
  const timeLeft = Math.max(0, 210 - elapsedMin);

  let phase, objectifPhase, toolsPhase, nextAction;
  if (elapsedMin < 20) {
    phase = 'Acte 1 — Ancrage terrain (0–20 min)';
    objectifPhase = 'Lire et observer. Pas de production encore. Identifier les acteurs, comprendre le contexte Lumio Health.';
    toolsPhase = 'Mail (lettre de mission de Sonia), Finder > dossier Portraits (fiches équipe), Finder > dossier Mission (documents de contexte)';
    nextAction = 'Ouvrir Mail en premier. Lire la lettre de mission de Sonia Ferracci. Puis aller dans Finder > Portraits pour connaître les personnages.';
  } else if (elapsedMin < 50) {
    phase = 'Acte 2 — Entrée dans l\'affaire (20–50 min)';
    objectifPhase = 'Le problème se précise. Lire les documents secondaires, construire une première hypothèse sur la tension identité de marque.';
    toolsPhase = 'Aperçu PDF (rapport veille Yanis), Safari (articles presse healthtech), Mémos vocaux (verbatims Camille Ott)';
    nextAction = 'Ouvrir Aperçu pour lire le rapport de veille. Repérer les contradictions dans les chiffres. Écouter les mémos vocaux de Camille si pas encore fait.';
  } else if (elapsedMin < 95) {
    phase = 'Acte 3 — Diagnostic (50–95 min)';
    objectifPhase = 'Produire un raisonnement structuré sur Slack avec Sonia. C\'est le premier feedback IA — Sonia évalue votre diagnostic, pas encore le livrable.';
    toolsPhase = 'Slack (DM Sonia Ferracci) — envoyer minimum 2 échanges pour débloquer l\'app Livrable';
    nextAction = 'Ouvrir Slack. Écrire à Sonia votre diagnostic de la tension B2B/B2C. Soyez direct — elle attend une position, pas une liste de faits.';
  } else if (elapsedMin < 175) {
    phase = 'Acte 4 — Production (95–175 min)';
    objectifPhase = 'Rédiger le livrable certifiant. Format exact de l\'épreuve de rattrapage RNCP. Évaluation sur critères officiels.';
    toolsPhase = 'App Livrable (débloquée après 2 échanges Slack) — formulaire structuré par compétence';
    nextAction = 'Ouvrir l\'app Livrable dans le dock. Remplir les sections dans l\'ordre. Chaque champ correspond à une compétence RNCP évaluée.';
  } else {
    phase = 'Acte 5 — Réflexion (175–210 min)';
    objectifPhase = 'Relire votre livrable. Vérifier la cohérence. Soumettre avant la fin des 3h30.';
    toolsPhase = 'App Livrable (bouton Soumettre), Notes (relecture de vos prises de notes)';
    nextAction = 'Retourner dans Livrable. Relire vos réponses. Appuyer sur Soumettre quand vous êtes prêt.';
  }

  return `Tu es Jefferson — le compagnon guide du PAC (Parcours d'Activation des Compétences) d'Éminéo.

Tu es un lapin avec une montre. Tu sais toujours où on en est. Tu dis exactement quoi faire, avec quel outil, dans quel ordre. Tu ne poses pas de questions philosophiques. Tu guides.

CONTEXTE SESSION :
- Étudiant·e : ${prenom}
- Temps écoulé : ${elapsedMin} min sur 210 min
- Temps restant : ${timeLeft} min
- Phase actuelle : ${phase}

OBJECTIF DE CETTE PHASE :
${objectifPhase}

OUTILS À UTILISER MAINTENANT :
${toolsPhase}

PROCHAINE ACTION CONCRÈTE :
${nextAction}

TON RÔLE :
- Dire quoi faire maintenant, avec quel outil, dans quel ordre
- Signaler le temps restant si < 45 min
- Orienter vers le bon outil quand l'étudiant est bloqué
- Reformuler l'attendu en termes concrets de mission
- Si l'étudiant demande la "bonne réponse" : lui dire que ce n'est pas ton rôle, mais lui donner la prochaine action concrète

CE QUE TU NE FERAS PAS :
- Rédiger le diagnostic ou le livrable à sa place
- Jouer un personnage de l'univers Lumio (tu n'es pas Sonia)
- Donner un cours théorique sur le marketing

STYLE :
- 2 à 4 phrases max par réponse
- Commence toujours par l'action ("Ouvre X", "Va dans Y", "Envoie Z")
- Ton direct, chaleureux, légèrement pressé (tu as une montre)
- Si < 30 min restantes : mentionner l'urgence dans chaque réponse`;
}

// ─── Composant Jefferson ─────────────────────────────────────
function JeffersonApp() {
  const [messages, setMessages] = useJState(() => {
    try { return JSON.parse(sessionStorage.getItem('pac_jefferson_history') || '[]'); } catch { return []; }
  });
  const [draft, setDraft] = useJState('');
  const [sending, setSending] = useJState(false);
  const [open, setOpen] = useJState(false);
  const [unread, setUnread] = useJState(0);
  const [, force] = useJState(0);
  const scrollRef = useJRef(null);
  const inputRef = useJRef(null);
  const welcomeShown = useJRef(false);

  // Tick (compte à rebours + apparition après démarrage)
  useJEffect(() => { const t = setInterval(() => force(n => n + 1), 2000); return () => clearInterval(t); }, []);

  const getElapsedMin = () => {
    if (!window.LUMIO_TIMER_START) return 0;
    return Math.floor((Date.now() - window.LUMIO_TIMER_START) / 60000);
  };

  const getPhaseIndex = (min) => {
    if (min < 20) return 0;
    if (min < 50) return 1;
    if (min < 95) return 2;
    if (min < 175) return 3;
    return 4;
  };

  const phaseLabels = ['Acte 1 · Ancrage', 'Acte 2 · Affaire', 'Acte 3 · Diagnostic', 'Acte 4 · Production', 'Acte 5 · Réflexion'];
  const phaseColors = ['#134547', '#0B2B2D', '#5DE298', '#E89B77', '#9DF0C4'];
  const phaseTextColors = ['#E3FFF0', '#E3FFF0', '#0B2B2D', '#0B2B2D', '#0B2B2D'];

  const now = () => {
    const d = new Date();
    return `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
  };

  // Message de bienvenue contextuel
  useJEffect(() => {
    if (!window.LUMIO_TIMER_START) return;
    if (messages.length === 0 && !welcomeShown.current) {
      welcomeShown.current = true;
      const prenom = (window.LUMIO_DATA?.student?.name || '').split(' ')[0] || 'toi';
      const elapsed = getElapsedMin();

      const phase = getPhaseIndex(elapsed);
      const welcomeTexts = [
        `Bonjour ${prenom}. Je suis Jefferson — votre guide.\n\nCommencez par ouvrir Mail. La lettre de mission de Sonia Ferracci est là. Lisez-la entièrement avant de faire quoi que ce soit d'autre.`,
        `Vous êtes en Acte 2. Avez-vous lu le rapport de veille dans Aperçu PDF ? Et les mémos vocaux de Camille Ott ?\n\nSi oui : construisez votre hypothèse sur la tension B2B/B2C. Si non : faites-le maintenant.`,
        `Acte 3 — il faut envoyer votre diagnostic à Sonia sur Slack.\n\nOuvrez Slack. Écrivez-lui votre position sur l'identité de marque Lumio. Soyez direct, même si ce n'est pas parfait.`,
        `Acte 4 — le livrable vous attend.\n\nOuvrez l'app Livrable dans le dock. Remplissez les sections dans l'ordre. Chaque champ = une compétence RNCP évaluée.`,
        `Acte 5 — relecture et soumission.\n\nRetournez dans Livrable. Relisez vos réponses. Appuyez sur Soumettre.`
      ];
      setMessages([{ role: 'assistant', text: welcomeTexts[phase], time: now() }]);
      if (!open) setUnread(u => u + 1);
    }
  }, [window.LUMIO_TIMER_START]);

  useJEffect(() => {
    try { sessionStorage.setItem('pac_jefferson_history', JSON.stringify(messages)); } catch {}
  }, [messages]);

  useJEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, sending]);

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

      const resp = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-5',
          max_tokens: 300,
          system: buildJeffersonPrompt(studentName, elapsed),
          messages: apiHistory
        })
      });
      if (!resp.ok) throw new Error('API error ' + resp.status);
      const data = await resp.json();
      const reply = (Array.isArray(data.content) && data.content[0]?.text)
        ? data.content[0].text
        : 'Jefferson ne peut pas répondre — l\'API est indisponible. Réessayez dans quelques secondes.';
      setMessages(h => [...h, { role: 'assistant', text: reply, time: now() }]);
      if (!open) setUnread(u => u + 1);
    } catch (err) {
      const errMsg = err?.message?.includes('API error')
        ? `Jefferson est temporairement indisponible (${err.message}). Réessayez.`
        : 'Connexion impossible. Vérifiez votre réseau et réessayez.';
      setMessages(h => [...h, { role: 'assistant', text: errMsg, time: now() }]);
    } finally {
      setSending(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } };

  const elapsed = getElapsedMin();
  const phaseIdx = getPhaseIndex(elapsed);
  const remaining = Math.max(0, 210 - elapsed);
  const isUrgent = remaining < 45;

  // Suggestions contextuelles par acte
  const suggestionsByPhase = [
    ['Par où commencer ?', 'C\'est quoi l\'objectif de la mission ?', 'Comment utiliser les outils ?'],
    ['J\'ai lu le brief, et maintenant ?', 'Comment analyser les documents ?', 'Que rechercher dans les mémos vocaux ?'],
    ['Comment écrire à Sonia sur Slack ?', 'Mon diagnostic est-il assez précis ?', 'Qu\'est-ce qu\'un bon diagnostic ?'],
    ['Comment remplir le livrable ?', 'Quelle compétence traiter en premier ?', 'Il me reste combien de temps ?'],
    ['Comment soumettre le livrable ?', 'Dois-je relire tout ?', 'Qu\'est-ce que le jury va regarder ?']
  ];
  const suggestions = suggestionsByPhase[phaseIdx] || suggestionsByPhase[0];

  // Gate : n'apparaître qu'une fois la session démarrée (bureau)
  if (!window.LUMIO_TIMER_START) return null;

  // ── Rendu chatbot flottant (bas-droite) ──────────────────────
  const elapsedR = getElapsedMin();
  const phaseIdxR = getPhaseIndex(elapsedR);
  const remainingR = Math.max(0, 210 - elapsedR);
  const isUrgentR = remainingR < 45;
  const jState = sending ? 'talking' : isUrgentR ? 'alert' : 'idle';
  const C = { abysse: '#0B2B2D', petrole: '#134547', menthe: '#5DE298', givre: '#E3FFF0', eau: '#9DF0C4', saumon: '#E89B77' };
  const Avatar = window.JeffersonAvatar || window.JeffersonIcon || (() => React.createElement('span', null, '🐰'));

  // injection unique de l'animation de pulsation + points
  useJEffect(() => {
    if (!document.getElementById('jeff-fab-style')) {
      const s = document.createElement('style');
      s.id = 'jeff-fab-style';
      s.textContent = `
        @keyframes jeff-pulse { 0%,100%{box-shadow:0 6px 22px rgba(11,43,45,.35),0 0 0 0 rgba(93,226,152,.5)} 50%{box-shadow:0 6px 22px rgba(11,43,45,.35),0 0 0 10px rgba(93,226,152,0)} }
        @keyframes jeff-in { from{opacity:0;transform:translateY(14px) scale(.96)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes jeff-dot { 0%,80%,100%{transform:translateY(0);opacity:.4} 40%{transform:translateY(-4px);opacity:1} }
        .jeff-panel{animation:jeff-in .22s cubic-bezier(.34,1.4,.64,1) both}
        .jeff-fab-attn{animation:jeff-pulse 2.4s ease-in-out infinite}
      `;
      document.head.appendChild(s);
    }
  }, []);

  return (
    <>
      {/* Lanceur flottant — la tête du lapin */}
      <button
        onClick={() => { setOpen(o => !o); setUnread(0); }}
        aria-label="Jefferson — Guide PAC"
        title="Jefferson — votre guide"
        className={!open && unread > 0 ? 'jeff-fab-attn' : ''}
        style={{
          position: 'fixed', bottom: 22, right: 22, zIndex: 100000,
          width: 60, height: 60, borderRadius: '50%', padding: 0,
          border: open ? `2px solid ${C.menthe}` : '2px solid rgba(255,255,255,0.7)',
          background: C.givre, cursor: 'pointer', overflow: 'hidden',
          boxShadow: '0 6px 22px rgba(11,43,45,0.35)',
          transition: 'transform .18s cubic-bezier(.34,1.56,.64,1)'
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        {React.createElement(Avatar, { size: 56, state: open ? 'idle' : jState })}
        {!open && unread > 0 && (
          <span style={{ position: 'absolute', top: 2, right: 2, minWidth: 18, height: 18, padding: '0 4px', borderRadius: 9, background: C.saumon, color: C.abysse, fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid white' }}>{unread}</span>
        )}
      </button>

      {/* Panneau de conversation */}
      {open && (
        <div className="jeff-panel" style={{
          position: 'fixed', bottom: 92, right: 22, zIndex: 100000,
          width: 360, maxWidth: 'calc(100vw - 44px)', height: 520, maxHeight: 'calc(100vh - 130px)',
          background: C.givre, borderRadius: 18, overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 18px 60px rgba(11,43,45,0.34)', border: '1px solid rgba(93,226,152,0.35)',
          fontFamily: "'IBM Plex Sans', -apple-system, sans-serif"
        }}>
          {/* Header */}
          <div style={{ padding: '12px 14px', background: `linear-gradient(135deg, ${C.petrole}, ${C.abysse})`, display: 'flex', alignItems: 'center', gap: 11, flexShrink: 0 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: C.givre, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
              {React.createElement(Avatar, { size: 38, state: jState })}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>Jefferson</div>
              <div style={{ fontSize: 10, color: C.menthe, letterSpacing: '0.04em', opacity: 0.9 }}>Guide PAC · {phaseLabels[phaseIdxR]}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: isUrgentR ? C.saumon : 'rgba(255,255,255,0.1)', borderRadius: 8, padding: '4px 9px', flexShrink: 0 }}>
              <span style={{ fontSize: 10 }}>⏱</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: isUrgentR ? C.abysse : 'rgba(255,255,255,0.85)', fontFamily: 'var(--font-mono, monospace)' }}>{remainingR}′</span>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Réduire" style={{ width: 26, height: 26, borderRadius: 8, background: 'rgba(255,255,255,0.12)', border: 'none', color: 'white', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>✕</button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '14px 12px', display: 'flex', flexDirection: 'column', gap: 9 }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: m.role === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-end', gap: 6 }}>
                {m.role === 'assistant' && (
                  <div style={{ width: 24, height: 24, borderRadius: 7, background: C.abysse, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0, marginBottom: 2 }}>
                    {React.createElement(Avatar, { size: 22, state: 'idle' })}
                  </div>
                )}
                <div style={{
                  maxWidth: '80%',
                  background: m.role === 'user' ? C.abysse : 'white',
                  color: m.role === 'user' ? 'white' : C.abysse,
                  borderRadius: m.role === 'user' ? '13px 13px 3px 13px' : '13px 13px 13px 3px',
                  padding: '9px 12px', fontSize: 13, lineHeight: 1.6,
                  boxShadow: '0 1px 4px rgba(11,43,45,0.08)',
                  border: m.role === 'assistant' ? '1px solid rgba(93,226,152,0.22)' : 'none',
                  whiteSpace: 'pre-wrap'
                }}>
                  {m.text}
                  {m.time && <div style={{ fontSize: 9, marginTop: 3, textAlign: 'right', opacity: 0.35 }}>{m.time}</div>}
                </div>
              </div>
            ))}
            {sending && (
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6 }}>
                <div style={{ width: 24, height: 24, borderRadius: 7, background: C.abysse, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {React.createElement(Avatar, { size: 22, state: 'talking' })}
                </div>
                <div style={{ background: 'white', borderRadius: '13px 13px 13px 3px', padding: '11px 14px', border: '1px solid rgba(93,226,152,0.22)', display: 'flex', gap: 4 }}>
                  {[0,1,2].map(i => <div key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: C.petrole, animation: 'jeff-dot 1.2s ease-in-out infinite', animationDelay: `${i*0.18}s` }} />)}
                </div>
              </div>
            )}
          </div>

          {/* Suggestions */}
          {messages.length <= 2 && (
            <div style={{ padding: '0 12px 8px', display: 'flex', flexDirection: 'column', gap: 5, flexShrink: 0 }}>
              {(suggestions || []).map((q, i) => (
                <button key={i} onClick={() => send(q)} style={{
                  background: 'white', border: '1px solid rgba(93,226,152,0.3)', borderRadius: 8,
                  padding: '7px 11px', fontSize: 12, color: C.abysse, cursor: 'pointer', textAlign: 'left',
                  fontFamily: 'inherit', transition: 'all .12s'
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = C.eau; e.currentTarget.style.borderColor = C.menthe; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = 'rgba(93,226,152,0.3)'; }}
                >{q}</button>
              ))}
            </div>
          )}

          {/* Saisie */}
          <div style={{ padding: '9px 12px 12px', borderTop: '1px solid rgba(93,226,152,0.22)', background: 'white', flexShrink: 0 }}>
            <div style={{ display: 'flex', gap: 7, alignItems: 'flex-end' }}>
              <textarea
                ref={inputRef} value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
                placeholder="Demandez à Jefferson…"
                rows={1}
                style={{ flex: 1, resize: 'none', border: '1px solid rgba(11,43,45,0.15)', borderRadius: 9, padding: '8px 10px', fontSize: 13, color: C.abysse, background: C.givre, outline: 'none', fontFamily: 'inherit', lineHeight: 1.5, maxHeight: 80 }}
                onFocus={e => e.target.style.borderColor = C.menthe}
                onBlur={e => e.target.style.borderColor = 'rgba(11,43,45,0.15)'}
              />
              <button onClick={() => send()} disabled={!draft.trim() || sending} style={{
                width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                background: draft.trim() && !sending ? C.abysse : 'rgba(11,43,45,0.08)', border: 'none',
                cursor: draft.trim() && !sending ? 'pointer' : 'default',
                color: draft.trim() && !sending ? 'white' : 'rgba(11,43,45,0.25)',
                fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s'
              }}>↑</button>
            </div>
            <div style={{ fontSize: 9, color: C.petrole, marginTop: 4, paddingLeft: 2, opacity: 0.5 }}>
              Jefferson dit quoi faire, pas quoi penser
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── Auto-montage du chatbot flottant (indépendant du dock) ──
(function mountJefferson(){
  function go(){
    if (document.getElementById('jefferson-fab-root')) return;
    var host = document.createElement('div');
    host.id = 'jefferson-fab-root';
    document.body.appendChild(host);
    try { ReactDOM.createRoot(host).render(React.createElement(JeffersonApp)); }
    catch(e){ try { ReactDOM.render(React.createElement(JeffersonApp), host); } catch(_){} }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go);
  else go();
})();
window.LUMIO_APPS = window.LUMIO_APPS || {};

