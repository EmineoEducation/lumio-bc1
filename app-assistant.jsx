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
  const scrollRef = useJRef(null);
  const inputRef = useJRef(null);
  const welcomeShown = useJRef(false);

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
    if (messages.length === 0 && !welcomeShown.current) {
      welcomeShown.current = true;
      const prenom = (window.LUMIO_DATA?.student?.name || '').split(' ')[0] || 'toi';
      const elapsed = getElapsedMin();

      // Timer non démarré : expliquer à l'étudiant
      if (!window.LUMIO_TIMER_START) {
        setMessages([{ role: 'assistant', text: `Bonjour. Je suis Jefferson — votre guide PAC.\n\nLe timer n'a pas encore démarré. Cliquez sur "Commencer l'affaire" dans le brief pour lancer la session. Je serai là dès que vous entrez sur le bureau.`, time: now() }]);
        return;
      }

      const phase = getPhaseIndex(elapsed);
      const welcomeTexts = [
        `Bonjour ${prenom}. Je suis Jefferson — votre guide.\n\nCommencez par ouvrir Mail. La lettre de mission de Sonia Ferracci est là. Lisez-la entièrement avant de faire quoi que ce soit d'autre.`,
        `Vous êtes en Acte 2. Avez-vous lu le rapport de veille dans Aperçu PDF ? Et les mémos vocaux de Camille Ott ?\n\nSi oui : construisez votre hypothèse sur la tension B2B/B2C. Si non : faites-le maintenant.`,
        `Acte 3 — il faut envoyer votre diagnostic à Sonia sur Slack.\n\nOuvrez Slack. Écrivez-lui votre position sur l'identité de marque Lumio. Soyez direct, même si ce n'est pas parfait.`,
        `Acte 4 — le livrable vous attend.\n\nOuvrez l'app Livrable dans le dock. Remplissez les sections dans l'ordre. Chaque champ = une compétence RNCP évaluée.`,
        `Acte 5 — relecture et soumission.\n\nRetournez dans Livrable. Relisez vos réponses. Appuyez sur Soumettre.`
      ];
      setMessages([{ role: 'assistant', text: welcomeTexts[phase], time: now() }]);
    }
  }, []);

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

  // Couleurs Éminéo
  const C = {
    abysse: '#0B2B2D',
    petrole: '#134547',
    menthe: '#5DE298',
    givre: '#E3FFF0',
    eau: '#9DF0C4',
    saumon: '#E89B77',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: C.givre, overflow: 'hidden', fontFamily: "'IBM Plex Sans', -apple-system, sans-serif" }}>

      {/* Header Éminéo */}
      <div style={{ padding: '14px 16px 12px', background: C.abysse, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          {/* Avatar Jefferson */}
          <div style={{ width: 38, height: 38, borderRadius: 10, background: '#E3FFF0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
            {window.JeffersonIcon
              ? React.createElement(window.JeffersonIcon, { size: 36, state: isUrgent ? 'alert' : 'idle' })
              : <span style={{ fontSize: 18 }}>🐰</span>
            }
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'white', letterSpacing: '0.01em' }}>Jefferson</div>
            <div style={{ fontSize: 10, color: C.menthe, letterSpacing: '0.04em', opacity: 0.85 }}>Guide PAC · Éminéo MSMC</div>
          </div>
          <button
            onClick={() => { if (window.confirm('Effacer l\'historique Jefferson ?')) { sessionStorage.removeItem('pac_jefferson_history'); setMessages([]); welcomeShown.current = false; } }}
            style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.2)', cursor: 'pointer', fontSize: 11, padding: '4px 8px', borderRadius: 5, fontFamily: 'inherit' }}
            onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.55)'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.2)'}
          >effacer</button>
        </div>

        {/* Bandeau phase + timer */}
        <div style={{ display: 'flex', gap: 7 }}>
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', gap: 7,
            background: phaseColors[phaseIdx], borderRadius: 7, padding: '6px 10px'
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: phaseTextColors[phaseIdx], opacity: 0.7 }} />
            <span style={{ fontSize: 10, fontWeight: 600, color: phaseTextColors[phaseIdx], letterSpacing: '0.04em' }}>
              {phaseLabels[phaseIdx].toUpperCase()}
            </span>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 5,
            background: isUrgent ? C.saumon : 'rgba(255,255,255,0.08)',
            borderRadius: 7, padding: '6px 10px',
            border: isUrgent ? 'none' : '1px solid rgba(255,255,255,0.1)'
          }}>
            <span style={{ fontSize: 11, color: isUrgent ? C.abysse : 'rgba(255,255,255,0.5)' }}>⏱</span>
            <span style={{ fontSize: 10, fontWeight: 600, color: isUrgent ? C.abysse : 'rgba(255,255,255,0.6)', fontFamily: 'var(--font-mono, monospace)' }}>
              {remaining} min
            </span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '14px 14px', display: 'flex', flexDirection: 'column', gap: 9 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: m.role === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-end', gap: 6 }}>
            {m.role === 'assistant' && (
              <div style={{ width: 24, height: 24, borderRadius: 6, background: C.abysse, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginBottom: 2, overflow: 'hidden' }}>
                {window.JeffersonIcon
                  ? React.createElement(window.JeffersonIcon, { size: 22, state: 'idle' })
                  : <span style={{ fontSize: 11 }}>🐰</span>
                }
              </div>
            )}
            <div style={{
              maxWidth: '80%',
              background: m.role === 'user' ? C.abysse : 'white',
              color: m.role === 'user' ? 'white' : C.abysse,
              borderRadius: m.role === 'user' ? '12px 12px 3px 12px' : '12px 12px 12px 3px',
              padding: '9px 12px', fontSize: 13, lineHeight: 1.6,
              boxShadow: '0 1px 4px rgba(11,43,45,0.08)',
              border: m.role === 'assistant' ? `1px solid rgba(93,226,152,0.2)` : 'none',
              whiteSpace: 'pre-wrap'
            }}>
              {m.text}
              <div style={{ fontSize: 9, marginTop: 3, textAlign: 'right', opacity: 0.35 }}>{m.time}</div>
            </div>
          </div>
        ))}
        {sending && (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6 }}>
            <div style={{ width: 24, height: 24, borderRadius: 6, background: C.abysse, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              {window.JeffersonIcon ? React.createElement(window.JeffersonIcon, { size: 22, state: 'talking' }) : <span style={{ fontSize: 11 }}>🐰</span>}
            </div>
            <div style={{ background: 'white', borderRadius: '12px 12px 12px 3px', padding: '10px 14px', border: `1px solid rgba(93,226,152,0.2)`, display: 'flex', gap: 4 }}>
              {[0,1,2].map(i => <div key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: C.petrole, animation: 'typedot 1.2s ease-in-out infinite', animationDelay: `${i*0.2}s` }} />)}
            </div>
          </div>
        )}
      </div>

      {/* Suggestions rapides */}
      {messages.length <= 2 && (
        <div style={{ padding: '0 14px 8px', display: 'flex', flexDirection: 'column', gap: 5 }}>
          <div style={{ fontSize: 9, color: C.petrole, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 2, opacity: 0.6 }}>Actions rapides</div>
          {suggestions.map((q, i) => (
            <button key={i} onClick={() => send(q)} style={{
              background: 'white', border: `1px solid rgba(93,226,152,0.3)`,
              borderRadius: 7, padding: '7px 11px', fontSize: 12,
              color: C.abysse, cursor: 'pointer', textAlign: 'left',
              fontFamily: 'inherit', transition: 'all .12s'
            }}
              onMouseEnter={e => { e.currentTarget.style.background = C.eau; e.currentTarget.style.borderColor = C.menthe; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = 'rgba(93,226,152,0.3)'; }}
            >{q}</button>
          ))}
        </div>
      )}

      {/* Zone saisie */}
      <div style={{ padding: '8px 12px 12px', borderTop: `1px solid rgba(93,226,152,0.2)`, background: 'white', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 7, alignItems: 'flex-end' }}>
          <textarea
            ref={inputRef} value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Demandez à Jefferson…"
            rows={2}
            style={{
              flex: 1, resize: 'none', border: `1px solid rgba(11,43,45,0.15)`,
              borderRadius: 8, padding: '8px 10px', fontSize: 13,
              color: C.abysse, background: C.givre, outline: 'none',
              fontFamily: 'inherit', lineHeight: 1.5
            }}
            onFocus={e => e.target.style.borderColor = C.menthe}
            onBlur={e => e.target.style.borderColor = 'rgba(11,43,45,0.15)'}
          />
          <button
            onClick={() => send()}
            disabled={!draft.trim() || sending}
            style={{
              width: 34, height: 34, borderRadius: 8, flexShrink: 0,
              background: draft.trim() && !sending ? C.abysse : 'rgba(11,43,45,0.08)',
              border: 'none',
              cursor: draft.trim() && !sending ? 'pointer' : 'default',
              color: draft.trim() && !sending ? 'white' : 'rgba(11,43,45,0.25)',
              fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all .15s', marginBottom: 1
            }}
          >↑</button>
        </div>
        <div style={{ fontSize: 9, color: C.petrole, marginTop: 4, paddingLeft: 2, opacity: 0.5 }}>
          Entrée pour envoyer · Jefferson dit quoi faire, pas quoi penser
        </div>
      </div>
    </div>
  );
}

// ─── Mise à jour APP_META icon + enregistrement ──────────────
window.LUMIO_APPS = window.LUMIO_APPS || {};
window.LUMIO_APPS['jefferson'] = JeffersonApp;
