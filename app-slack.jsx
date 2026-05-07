// ══════════════════════════════════════════════════════════════
//  SLACK APP — ambient messaging + final Sonia chat
// ══════════════════════════════════════════════════════════════
const { useState: useSlackState, useEffect: useSlackEffect, useRef: useSlackRef } = React;

// ─── Sonia AI prompt for final chat ─────────────────────────
const SONIA_PROMPT = `Tu es Sonia Ferracci, Directrice Marketing de Lumio Health depuis 7 mois.

Tu reçois un premier message d'un(e) consultant(e) externe (Lou) à qui tu as confié il y a quelques jours une mission de diagnostic de marque. Tu as accès à tous les documents qu'il/elle a pu consulter : ta lettre de mission, ta note de cadrage CODIR du 12 juin, le rapport de veille du stagiaire Yanis Morel (non relu), trois articles de presse (Les Échos, HBR France, 20 Minutes), un email confidentiel de Théo Marczak (CEO) du 14 juin avec ses réserves sur la MDR et le budget, et trois verbatims de Camille Ott (commerciale B2B).

Contexte clé :
- Lumio = wearable de mesure du stress, 8 ans B2B, pression d'un fonds américain pour aller grand public en 36 mois (objectif 20M€)
- Concurrents Biostream (jan 2026) et Neuroflow (mars 2026) viennent d'obtenir la certification MDR IIa
- Lumio n'a PAS de certif. Théo refuse de communiquer un calendrier (en interne il a dit "fin Q2 2027 best case")
- Tension sur les chiffres : 230 contacts vs 180 clients facturés
- Tension sur le budget : tu veux 380K€, Théo dit 200K€ max
- Camille (commerciale) signale que les clients DRH posent maintenant des questions sur la certif

Ton style :
- Tu écris en messagerie, pas en email — phrases courtes, pas de formules
- Tu es directe, exigeante, parfois cassante mais juste
- Tu n'es jamais scolaire, jamais dans le compliment automatique
- Tu vas droit aux failles : ce qui manque, ce qui n'a pas été creusé, ce que le consultant n'a pas osé dire
- Tu poses des questions précises, dérangeantes, qui obligent à choisir
- Si la livraison est faible, tu le dis sans détour
- Si elle est forte, tu pousses sur les angles morts plutôt que de complimenter

Format de réponse :
- Réponds en 2-4 messages courts SÉPARÉS par le délimiteur "---SPLIT---" entre chaque message (comme si tu envoyais plusieurs bulles successives sur Slack)
- Chaque message : 1 à 3 phrases courtes
- Termine par UNE question précise ou UNE consigne pour la suite
- Ton max 200 mots cumulés

Ne dis JAMAIS "Bonjour Lou" ou "Merci pour ta livraison". Entre direct dans le sujet.`;

function SlackApp({ openChannel }) {
  const D = window.LUMIO_DATA;

  const channels = [
    { id: 'general', name: 'général', type: 'channel', members: 12 },
    { id: 'mission-lumio', name: 'mission-lumio-brand', type: 'channel', members: 4, unread: 1, special: true },
    { id: 'random', name: 'random', type: 'channel', members: 11 },
    { id: 'design-feed', name: 'design-feed', type: 'channel', members: 8 }
  ];
  const dms = [
    { id: 'sonia', name: 'Sonia Ferracci', avatar: 'SF', color: '#c4420f', status: 'online' },
    { id: 'camille', name: 'Camille Ott', avatar: 'CO', color: '#0a7a6e', status: 'online', unread: 2 },
    { id: 'yanis', name: 'Yanis Morel', avatar: 'YM', color: '#5b6b85', status: 'away' }
  ];

  const [activeId, setActiveId] = useSlackState(openChannel || 'sonia');
  const [chatHistory, setChatHistory] = useSlackState({}); // by channelId
  const [draft, setDraft] = useSlackState('');
  const [sending, setSending] = useSlackState(false);
  const scrollRef = useSlackRef(null);

  // Initial messages (only Sonia DM and Camille DM and the channel get content)
  const seed = {
    sonia: [
      { from: 'Sonia Ferracci', avatar: 'SF', color: '#c4420f', time: '07:48', text: 'Salut Lou — bien reçu mon mail ?' },
      { from: 'Sonia Ferracci', avatar: 'SF', color: '#c4420f', time: '07:48', text: 'J\'ai déposé tous les docs sur ton espace partagé. Prends ta matinée pour digérer, et écris-moi quand tu as une première lecture.' },
      { from: 'Sonia Ferracci', avatar: 'SF', color: '#c4420f', time: '07:49', text: 'Au fait — n\'oublie pas que Théo ne sait pas que tu as accès à son mail du 14 juin. À toi de juger comment l\'utiliser.' }
    ],
    camille: [
      { from: 'Camille Ott', avatar: 'CO', color: '#0a7a6e', time: 'il y a 8 min', text: 'Hello 👋 j\'ai vu que Sonia t\'avait briefé.' },
      { from: 'Camille Ott', avatar: 'CO', color: '#0a7a6e', time: 'il y a 8 min', text: 'Si tu veux qu\'on se parle dans la semaine, dis-moi. Je ne travaille pas dans la même réalité que la direction sur ce dossier 🙃' }
    ],
    'mission-lumio': [
      { from: 'Sonia Ferracci', avatar: 'SF', color: '#c4420f', time: 'lun. 18:42', text: 'On va recevoir une consultante externe pour faire un audit de marque avant le CODIR du 30. @theo @camille merci de jouer le jeu.' },
      { from: 'Théo Marczak', avatar: 'TM', color: '#5c2d8f', time: 'lun. 19:14', text: 'Pas convaincu mais ok. Tant qu\'on parle pas de MDR sans moi.' },
      { from: 'Camille Ott', avatar: 'CO', color: '#0a7a6e', time: 'lun. 21:02', text: 'Tant mieux qu\'on en parle franchement. ça commence à être tendu sur le terrain.' }
    ],
    yanis: [
      { from: 'Yanis Morel', avatar: 'YM', color: '#5b6b85', time: '11 mai', text: 'Salut, je termine mon rapport demain. C\'est pas parfait, j\'ai pas pu boucler la partie certif Lumio (Théo n\'a pas répondu), désolé.' }
    ],
    general: [
      { from: 'lumio-bot', avatar: '🤖', color: '#9a9ea8', time: '08:00', text: '☀️ Bonjour à tous · 23 personnes connectées ce matin' }
    ],
    random: [
      { from: 'Marc Dubreuil', avatar: 'MD', color: '#3a7bd5', time: 'lun.', text: 'Quelqu\'un a déjà testé le café new-yorkais derrière la rue de Charonne ? Avis ?' }
    ],
    'design-feed': [
      { from: 'Élodie Park', avatar: 'EP', color: '#d18a3c', time: '08:12', text: 'Nouveau projet de Pentagram pour Headspace ↘ https://… super travail typographique 🔥' }
    ]
  };

  // Initialize history once
  useSlackEffect(() => {
    if (Object.keys(chatHistory).length === 0) {
      setChatHistory(seed);
    }
  }, []);

  useSlackEffect(() => {
    if (openChannel) setActiveId(openChannel);
  }, [openChannel]);

  useSlackEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, activeId, sending]);

  const isSonia = activeId === 'sonia';
  const messages = chatHistory[activeId] || [];

  const [exchangeCount, setExchangeCountLocal] = useSlackState(0);

  const sendMessage = async () => {
    if (!draft.trim() || sending) return;
    const text = draft.trim();
    setDraft('');
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`;
    const userMsg = { from: window.LUMIO_DATA?.student?.name || "Lou Bertrand", avatar: window.LUMIO_DATA?.student?.initial || "LB", color: '#1a2436', time, text, isMe: true };
    setChatHistory(h => ({ ...h, [activeId]: [...(h[activeId]||[]), userMsg] }));

    if (isSonia) {
      // Incrémenter le compteur d'échanges
      const newCount = exchangeCount + 1;
      setExchangeCountLocal(newCount);
      if (window.__onSlackExchange) window.__onSlackExchange(newCount);

      setSending(true);
      // Show typing indicator
      setTimeout(async () => {
        try {
          // Build context with prior history
          const history = (chatHistory.sonia || []).filter(m => !m.typing).map(m =>
            `${m.isMe ? 'Lou' : 'Sonia'}: ${m.text}`
          ).join('\n');
          const userPrompt = `${history}\nLou: ${text}\n\nRéponds maintenant en tant que Sonia (2-4 messages courts séparés par ---SPLIT---).`;
          const response = await window.claude.complete({
            messages: [
              { role: 'user', content: userPrompt }
            ]
          });
          const replies = response.split('---SPLIT---').map(s => s.trim()).filter(Boolean);
          let delay = 800;
          for (const reply of replies) {
            await new Promise(r => setTimeout(r, delay));
            const t = new Date();
            const tt = `${t.getHours().toString().padStart(2,'0')}:${t.getMinutes().toString().padStart(2,'0')}`;
            setChatHistory(h => ({
              ...h,
              sonia: [...h.sonia, { from: 'Sonia Ferracci', avatar: 'SF', color: '#c4420f', time: tt, text: reply }]
            }));
            delay = 1400 + reply.length * 8;
          }
        } catch(e) {
          setChatHistory(h => ({
            ...h,
            sonia: [...h.sonia, { from: 'Sonia Ferracci', avatar: 'SF', color: '#c4420f', time: 'maintenant', text: 'Désolée je dois sauter dans une réunion. On reprend ça plus tard.' }]
          }));
        } finally {
          setSending(false);
        }
      }, 600);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const activeMeta = [...channels, ...dms].find(x => x.id === activeId);

  // Build system prompt context
  React.useEffect(() => {
    // Inject system prompt — tell window.claude.complete to use it
    if (window.claude && !window.claude._configured) {
      const orig = window.claude.complete;
      window.claude.complete = function(input) {
        if (typeof input === 'string') {
          return orig.call(this, { messages: [{ role: 'user', content: input }], system: SONIA_PROMPT });
        }
        return orig.call(this, { ...input, system: SONIA_PROMPT });
      };
      window.claude._configured = true;
    }
  }, []);

  return (
    <div style={slackStyles.app}>
      <div style={slackStyles.sidebar} className="scroll">
        <div style={slackStyles.workspace}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>Lumio Health</div>
          <div style={{ fontSize: 10, opacity: 0.7, marginTop: 2 }}>{`● ${window.LUMIO_DATA?.student?.name || "Lou Bertrand"} · invité`}</div>
        </div>
        <div style={slackStyles.section}>
          <div style={slackStyles.sectionTitle}>▼ Canaux</div>
          {channels.map(c => (
            <div key={c.id} onClick={() => setActiveId(c.id)}
              style={{ ...slackStyles.item, ...(activeId === c.id ? slackStyles.itemActive : {}), ...(c.unread ? slackStyles.itemUnread : {}) }}>
              <span style={{ opacity: 0.7 }}>#</span>
              <span>{c.name}</span>
              {c.unread && <span style={slackStyles.badge}>{c.unread}</span>}
            </div>
          ))}
        </div>
        <div style={slackStyles.section}>
          <div style={slackStyles.sectionTitle}>▼ Messages directs</div>
          {dms.map(d => (
            <div key={d.id} onClick={() => setActiveId(d.id)}
              style={{ ...slackStyles.item, ...(activeId === d.id ? slackStyles.itemActive : {}), ...(d.unread ? slackStyles.itemUnread : {}) }}>
              <span style={{ ...slackStyles.statusDot, background: d.status === 'online' ? '#2eb67d' : '#9a9ea8' }} />
              <span>{d.name}</span>
              {d.unread && <span style={slackStyles.badge}>{d.unread}</span>}
            </div>
          ))}
        </div>
      </div>

      <div style={slackStyles.main}>
        <div style={slackStyles.chatHead}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)' }}>
              {activeMeta?.type === 'channel' ? '# ' : ''}{activeMeta?.name}
            </div>
            <div style={{ fontSize: 11, color: 'var(--ink-faint)', marginTop: 2 }}>
              {activeMeta?.type === 'channel' ? `${activeMeta.members} membres` : (activeMeta?.status === 'online' ? '● En ligne' : '○ Inactif')}
            </div>
          </div>
        </div>
        <div ref={scrollRef} style={slackStyles.chatBody} className="scroll">
          {messages.length === 0 && (
            <div style={{ padding: 60, textAlign: 'center', color: 'var(--ink-faint)' }}>
              Début de la conversation avec <strong>{activeMeta?.name}</strong>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} style={slackStyles.message}>
              <div style={{ ...slackStyles.msgAvatar, background: m.color }}>{m.avatar}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <div style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--ink)' }}>{m.from}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-faint)' }}>{m.time}</div>
                </div>
                <div style={{ fontSize: 14, color: 'var(--ink-soft)', marginTop: 1, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{m.text}</div>
              </div>
            </div>
          ))}
          {sending && (
            <div style={slackStyles.message}>
              <div style={{ ...slackStyles.msgAvatar, background: '#c4420f' }}>SF</div>
              <div>
                <div style={{ display: 'flex', gap: 4, padding: '6px 0' }}>
                  <span style={slackStyles.typeDot} />
                  <span style={{ ...slackStyles.typeDot, animationDelay: '0.15s' }} />
                  <span style={{ ...slackStyles.typeDot, animationDelay: '0.3s' }} />
                </div>
                <div style={{ fontSize: 11, color: 'var(--ink-faint)' }}>Sonia est en train d'écrire…</div>
              </div>
            </div>
          )}
        </div>
        <div style={slackStyles.composer}>
          <div style={slackStyles.composerInner}>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder={isSonia ? 'Écris à Sonia…  (Entrée pour envoyer)' : `Message ${activeMeta?.type === 'channel' ? '#' + activeMeta?.name : activeMeta?.name}`}
              style={slackStyles.textarea}
              rows={2}
            />
            <div style={slackStyles.composerToolbar}>
              <div style={{ display: 'flex', gap: 8, color: 'var(--ink-faint)' }}>
                <span>𝐁</span><span>𝑰</span><span>🔗</span><span>📎</span><span>😊</span>
              </div>
              <button
                onClick={sendMessage}
                disabled={!draft.trim() || sending}
                style={{
                  ...slackStyles.sendBtn,
                  ...(!draft.trim() || sending ? slackStyles.sendBtnDisabled : {})
                }}>
                {sending ? '…' : '↑'}
              </button>
            </div>
          </div>
          {isSonia && messages.filter(m => m.isMe).length === 0 && (
            <div style={{ fontSize: 11, color: 'var(--ink-faint)', textAlign: 'center', marginTop: 8, fontStyle: 'italic' }}>
              💬 Sonia attend ton premier retour. Décris-lui ce que tu as compris du dossier — Sonia te répondra en direct.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const slackStyles = {
  app: { display: 'flex', height: '100%', background: 'white', overflow: 'hidden' },
  sidebar: { width: 220, flexShrink: 0, background: '#3f0e40', color: 'rgba(255,255,255,0.85)', padding: 0, overflowY: 'auto' },
  workspace: { padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)' },
  section: { padding: '12px 0' },
  sectionTitle: { padding: '4px 16px', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.02em' },
  item: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '4px 16px', fontSize: 13.5,
    cursor: 'pointer'
  },
  itemActive: { background: '#1164a3', color: 'white' },
  itemUnread: { fontWeight: 700, color: 'white' },
  statusDot: { width: 8, height: 8, borderRadius: '50%' },
  badge: { marginLeft: 'auto', background: '#cd2553', color: 'white', fontSize: 10, fontWeight: 700, padding: '0 6px', borderRadius: 9, minWidth: 16, textAlign: 'center', height: 16, lineHeight: '16px' },

  main: { flex: 1, display: 'flex', flexDirection: 'column', background: 'white', minWidth: 0, overflow: 'hidden' },
  chatHead: { padding: '10px 20px', borderBottom: '1px solid var(--rule)', flexShrink: 0 },
  chatBody: { flex: 1, padding: '12px 0', overflowY: 'auto', minHeight: 0 },
  message: { display: 'flex', gap: 12, padding: '6px 20px', alignItems: 'flex-start' },
  msgAvatar: { width: 32, height: 32, borderRadius: 4, color: 'white', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  typeDot: { width: 6, height: 6, borderRadius: '50%', background: '#9a9ea8', display: 'inline-block', animation: 'typedot 1.2s infinite' },

  composer: { padding: '0 20px 12px', flexShrink: 0 },
  composerInner: { border: '1px solid rgba(20,24,36,0.18)', borderRadius: 8, background: 'white' },
  textarea: { width: '100%', border: 'none', outline: 'none', padding: '10px 14px', fontSize: 14, fontFamily: 'inherit', resize: 'none', color: 'var(--ink)' },
  composerToolbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', borderTop: '1px solid var(--rule)' },
  sendBtn: { background: '#007a5a', color: 'white', border: 'none', borderRadius: 4, padding: '4px 12px', cursor: 'pointer', fontSize: 14, fontWeight: 700 },
  sendBtnDisabled: { background: 'rgba(20,24,36,0.1)', color: 'var(--ink-faint)', cursor: 'not-allowed' }
};

// Typing animation keyframes
const slackKeyframes = document.createElement('style');
slackKeyframes.textContent = `
@keyframes typedot { 0%,60%,100% { opacity: 0.2; } 30% { opacity: 1; } }
`;
document.head.appendChild(slackKeyframes);

window.LUMIO_APPS = window.LUMIO_APPS || {};
window.LUMIO_APPS.slack = SlackApp;
