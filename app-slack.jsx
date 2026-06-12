// ══════════════════════════════════════════════════════════════
//  SLACK APP — v3
//  Fixes :
//  · Badges auto : unreads initialisés à 0, incrémentés uniquement
//    quand un message ARRIVE pendant la session (pas les seeds)
//  · "Lou Bertrand" hardcodé → window.LUMIO_DATA?.student?.name
//  · API guards (resp.ok, Array.isArray)
//  · Easter egg WhatsApp : numéro cliquable dans signature Sonia
// ══════════════════════════════════════════════════════════════
const { useState: useSlackState, useEffect: useSlackEffect, useRef: useSlackRef } = React;

const SONIA_PROMPT = `Tu es Sonia Ferracci, Directrice Marketing de Lumio Health depuis 7 mois.

Tu reçois un premier message d'un(e) consultant(e) externe à qui tu as confié une mission de diagnostic de marque. Tu as accès à tous les documents consultables : ta lettre de mission, ta note de cadrage CODIR du 12 juin, le rapport de veille du stagiaire Yanis Morel (non relu), trois articles de presse (Les Échos, HBR France, 20 Minutes), un email confidentiel de Théo Marczak (CEO) du 14 juin avec ses réserves sur la MDR et le budget, et trois verbatims de Camille Ott (commerciale B2B).

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
- Réponds en 2-4 messages courts SÉPARÉS par le délimiteur "---SPLIT---" entre chaque message
- Chaque message : 1 à 3 phrases courtes
- Termine par UNE question précise ou UNE consigne pour la suite
- Ton max 200 mots cumulés

Ne dis JAMAIS "Bonjour" ou "Merci pour ta livraison". Entre direct dans le sujet.`;

function SlackApp({ openChannel }) {
  const channels = [
    { id: 'general',      name: 'général',              type: 'channel', members: 12 },
    { id: 'mission-lumio',name: 'mission-lumio-brand',  type: 'channel', members: 4, special: true },
    { id: 'random',       name: 'random',               type: 'channel', members: 11 },
    { id: 'design-feed',  name: 'design-feed',          type: 'channel', members: 8 }
  ];
  const dms = [
    { id: 'sonia',  name: 'Sonia Ferracci', avatar: 'SF', color: '#c4420f', status: 'online' },
    { id: 'camille',name: 'Camille Ott',    avatar: 'CO', color: '#0a7a6e', status: 'online' },
    { id: 'yanis',  name: 'Yanis Morel',    avatar: 'YM', color: '#5b6b85', status: 'away'   }
  ];

  const getStudentName = () => window.LUMIO_DATA?.student?.name || 'Consultant·e';
  const getStudentInitial = () => window.LUMIO_DATA?.student?.initial || '?';

  // ── Bug fix : unreads initialisés à 0 — pas de badges sur les seeds ──
  const [unreads, setUnreads] = useSlackState({});

  const [activeId, setActiveId] = useSlackState(openChannel || 'sonia');
  const activeIdRef = useSlackRef(openChannel || 'sonia');
  const setActive = (id) => { activeIdRef.current = id; setActiveId(id); };

  const [chatHistory, setChatHistory] = useSlackState({});
  const [draft, setDraft] = useSlackState('');
  const [sending, setSending] = useSlackState(false);
  const [exchangeCount, setExchangeCountLocal] = useSlackState(0);
  const scrollRef = useSlackRef(null);

  // ── Seeds — lus d'emblée, aucun badge ──
  const buildSeed = () => ({
    sonia: [
      { from: 'Sonia Ferracci', avatar: 'SF', color: '#c4420f', time: '07:48',
        // Easter egg : numéro cliquable dans le 3e message
        text: 'Bien reçu mon mail ?' },
      { from: 'Sonia Ferracci', avatar: 'SF', color: '#c4420f', time: '07:48',
        text: "J'ai déposé tous les docs sur ton espace partagé. Prends ta matinée pour digérer, et écris-moi quand tu as une première lecture." },
      { from: 'Sonia Ferracci', avatar: 'SF', color: '#c4420f', time: '07:49',
        text: "Au fait — n'oublie pas que Théo ne sait pas que tu as accès à son mail du 14 juin. À toi de juger comment l'utiliser.",
        // Easter egg : signature avec numéro caché
        signature: '+33 6 12 34 56 78', easterEgg: 'whatsapp' }
    ],
    camille: [
      { from: 'Camille Ott', avatar: 'CO', color: '#0a7a6e', time: 'il y a 8 min',
        text: "Hello 👋 j'ai vu que Sonia t'avait briefé." },
      { from: 'Camille Ott', avatar: 'CO', color: '#0a7a6e', time: 'il y a 8 min',
        text: "Si tu veux qu'on se parle dans la semaine, dis-moi. Je ne travaille pas dans la même réalité que la direction sur ce dossier 🙃" }
    ],
    'mission-lumio': [
      { from: 'Sonia Ferracci', avatar: 'SF', color: '#c4420f', time: 'lun. 18:42',
        text: 'On va recevoir une consultante externe pour faire un audit de marque avant le CODIR du 30. @theo @camille merci de jouer le jeu.' },
      { from: 'Théo Marczak',   avatar: 'TM', color: '#5c2d8f', time: 'lun. 19:14',
        text: "Pas convaincu mais ok. Tant qu'on parle pas de MDR sans moi." },
      { from: 'Camille Ott',    avatar: 'CO', color: '#0a7a6e', time: 'lun. 21:02',
        text: "Tant mieux qu'on en parle franchement. ça commence à être tendu sur le terrain." }
    ],
    yanis: [
      { from: 'Yanis Morel', avatar: 'YM', color: '#5b6b85', time: '11 mai',
        text: "Salut, je termine mon rapport demain. C'est pas parfait, j'ai pas pu boucler la partie certif Lumio (Théo n'a pas répondu), désolé." }
    ],
    general: [
      { from: 'lumio-bot', avatar: '🤖', color: '#9a9ea8', time: '08:00',
        text: '☀️ Bonjour à tous · 23 personnes connectées ce matin' }
    ],
    random: [
      { from: 'Marc Dubreuil', avatar: 'MD', color: '#3a7bd5', time: 'lun.',
        text: "Quelqu'un a déjà testé le café new-yorkais derrière la rue de Charonne ? Avis ?" }
    ],
    'design-feed': [
      { from: 'Élodie Park', avatar: 'EP', color: '#d18a3c', time: '08:12',
        text: 'Nouveau projet de Pentagram pour Headspace ↘ https://… super travail typographique 🔥' }
    ]
  });

  // Initialise history once
  useSlackEffect(() => {
    if (Object.keys(chatHistory).length === 0) {
      setChatHistory(buildSeed());
    }
  }, []);

  useSlackEffect(() => {
    if (openChannel) {
      setActive(openChannel);
      setUnreads(u => ({ ...u, [openChannel]: 0 }));
    }
  }, [openChannel]);

  useSlackEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [chatHistory, activeId, sending]);

  // ── Helper : ajouter un message entrant + badge si channel pas actif ──
  const addIncoming = (channelId, msg) => {
    setChatHistory(h => ({
      ...h,
      [channelId]: [...(h[channelId] || []), msg]
    }));
    if (activeIdRef.current !== channelId) {
      setUnreads(u => ({ ...u, [channelId]: (u[channelId] || 0) + 1 }));
    }
  };

  // ── Réaction de Sonia quand le livrable est soumis ──
  useSlackEffect(() => {
    window.__onSoniaLivrableReaction = async (veille, plateforme) => {
      setSending(true);
      const now = new Date();
      const time = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`;
      const prompt = `Tu es Sonia Ferracci. Le/la consultant·e vient de te remettre son livrable final. Tu l'as lu rapidement. Tu réagis en Slack — direct, honnête, 100-150 mots maximum.

Livrable reçu :
${veille.substring(0, 600)}...
${plateforme.substring(0, 600)}...`;
      try {
        const resp = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'claude-sonnet-4-6',
            max_tokens: 400,
            messages: [{ role: 'user', content: prompt }]
          })
        });
        if (!resp.ok) throw new Error('API ' + resp.status);
        const data = await resp.json();
        const reply = (Array.isArray(data.content) && data.content[0]?.text)
          ? data.content.map(b => b.text || '').join('')
          : 'Bien reçu. Je te reviens avant le board.';
        addIncoming('sonia', { from: 'Sonia Ferracci', avatar: 'SF', color: '#c4420f', time, text: reply });
      } catch {
        addIncoming('sonia', { from: 'Sonia Ferracci', avatar: 'SF', color: '#c4420f', time, text: 'Bien reçu. Je te reviens avant le board.' });
      } finally {
        setSending(false);
      }
    };
    return () => { window.__onSoniaLivrableReaction = null; };
  }, []);

  const isSonia = activeId === 'sonia';
  const messages = chatHistory[activeId] || [];

  const sendMessage = async () => {
    if (!draft.trim() || sending) return;
    const text = draft.trim();
    setDraft('');
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`;
    const userMsg = {
      from: getStudentName(),
      avatar: getStudentInitial(),
      color: '#1a2436',
      time, text, isMe: true
    };
    setChatHistory(h => ({ ...h, [activeId]: [...(h[activeId] || []), userMsg] }));

    if (isSonia) {
      const newCount = exchangeCount + 1;
      setExchangeCountLocal(newCount);
      if (window.__onSlackExchange) window.__onSlackExchange(newCount);
      if (window.__onSlackSent) window.__onSlackSent();
      setSending(true);

      setTimeout(async () => {
        try {
          const history = (chatHistory.sonia || []).filter(m => !m.typing).map(m =>
            `${m.isMe ? getStudentName() : 'Sonia'}: ${m.text}`
          ).join('\n');
          const userPrompt = `${history}\n${getStudentName()}: ${text}\n\nRéponds maintenant en tant que Sonia (2-4 messages courts séparés par ---SPLIT---).`;
          const resp = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: 'claude-sonnet-4-6',
              max_tokens: 600,
              system: SONIA_PROMPT,
              messages: [{ role: 'user', content: userPrompt }]
            })
          });
          if (!resp.ok) throw new Error('HTTP ' + resp.status);
          const data = await resp.json();
          if (!Array.isArray(data.content) || !data.content[0]?.text) throw new Error('Format inattendu');
          const raw = data.content.map(b => b.text || '').join('');
          const replies = raw.split('---SPLIT---').map(s => s.trim()).filter(Boolean);
          let delay = 800;
          for (const reply of replies) {
            await new Promise(r => setTimeout(r, delay));
            const t = new Date();
            const tt = `${t.getHours().toString().padStart(2,'0')}:${t.getMinutes().toString().padStart(2,'0')}`;
            addIncoming('sonia', { from: 'Sonia Ferracci', avatar: 'SF', color: '#c4420f', time: tt, text: reply });
            delay = 1400 + reply.length * 8;
          }
        } catch {
          addIncoming('sonia', { from: 'Sonia Ferracci', avatar: 'SF', color: '#c4420f', time, text: "Désolée je dois sauter dans une réunion. On reprend ça plus tard." });
        } finally {
          setSending(false);
        }
      }, 600);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const activeMeta = [...channels, ...dms].find(x => x.id === activeId);

  // ── Easter egg WhatsApp ──
  const [showWhatsApp, setShowWhatsApp] = useSlackState(false);
  const openWhatsApp = (e) => {
    e.stopPropagation();
    setShowWhatsApp(true);
  };

  return (
    <div style={SS.app}>
      {/* Sidebar */}
      <div style={SS.sidebar}>
        <div style={SS.workspace}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>Lumio Health</div>
          <div style={{ fontSize: 10, opacity: 0.7, marginTop: 2 }}>● {getStudentName()} · invité</div>
        </div>
        <div style={SS.section}>
          <div style={SS.sectionTitle}>▼ Canaux</div>
          {channels.map(c => (
            <div key={c.id}
              onClick={() => { setActive(c.id); setUnreads(u => ({ ...u, [c.id]: 0 })); }}
              style={{ ...SS.item, ...(activeId === c.id ? SS.itemActive : {}), ...((unreads[c.id] || 0) > 0 ? SS.itemUnread : {}) }}>
              <span style={{ opacity: 0.7 }}>#</span>
              <span style={{ flex: 1 }}>{c.name}</span>
              {(unreads[c.id] || 0) > 0 && <span style={SS.badge}>{unreads[c.id]}</span>}
            </div>
          ))}
        </div>
        <div style={SS.section}>
          <div style={SS.sectionTitle}>▼ Messages directs</div>
          {dms.map(d => (
            <div key={d.id}
              onClick={() => { setActive(d.id); setUnreads(u => ({ ...u, [d.id]: 0 })); }}
              style={{ ...SS.item, ...(activeId === d.id ? SS.itemActive : {}), ...((unreads[d.id] || 0) > 0 ? SS.itemUnread : {}) }}>
              <span style={{ ...SS.statusDot, background: d.status === 'online' ? '#2eb67d' : '#9a9ea8' }} />
              <span style={{ flex: 1 }}>{d.name}</span>
              {(unreads[d.id] || 0) > 0 && <span style={SS.badge}>{unreads[d.id]}</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Main */}
      <div style={SS.main}>
        <div style={SS.chatHead}>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)' }}>
            {activeMeta?.type === 'channel' ? '# ' : ''}{activeMeta?.name}
          </div>
          <div style={{ fontSize: 11, color: 'var(--ink-faint)', marginTop: 2 }}>
            {activeMeta?.type === 'channel' ? `${activeMeta.members} membres` : (activeMeta?.status === 'online' ? '● En ligne' : '○ Inactif')}
          </div>
        </div>

        <div ref={scrollRef} style={SS.chatBody}>
          {messages.length === 0 && (
            <div style={{ padding: 60, textAlign: 'center', color: 'var(--ink-faint)' }}>
              Début de la conversation avec <strong>{activeMeta?.name}</strong>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} style={SS.message}>
              <div style={{ ...SS.msgAvatar, background: m.color }}>{m.avatar}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--ink)' }}>{m.from}</span>
                  <span style={{ fontSize: 11, color: 'var(--ink-faint)' }}>{m.time}</span>
                </div>
                <div style={{ fontSize: 14, color: 'var(--ink-soft)', marginTop: 1, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                  {m.text}
                </div>
                {/* Easter egg : numéro cliquable dans la signature du 3e message Sonia */}
                {m.easterEgg === 'whatsapp' && (
                  <div style={{ marginTop: 6, fontSize: 11, color: 'var(--ink-faint)' }}>
                    — Sonia F. ·{' '}
                    <span
                      onClick={openWhatsApp}
                      style={{ color: '#25D366', cursor: 'pointer', textDecoration: 'underline', fontWeight: 600 }}
                      title="WhatsApp"
                    >
                      {m.signature}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
          {sending && (
            <div style={SS.message}>
              <div style={{ ...SS.msgAvatar, background: '#c4420f' }}>SF</div>
              <div>
                <div style={{ display: 'flex', gap: 4, padding: '6px 0' }}>
                  {[0,1,2].map(i => <span key={i} style={{ ...SS.typeDot, animationDelay: `${i*0.15}s` }} />)}
                </div>
                <div style={{ fontSize: 11, color: 'var(--ink-faint)' }}>Sonia est en train d'écrire…</div>
              </div>
            </div>
          )}
        </div>

        <div style={SS.composer}>
          <div style={SS.composerInner}>
            <textarea
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder={isSonia ? 'Écris à Sonia…  (Entrée pour envoyer)' : `Message ${activeMeta?.type === 'channel' ? '#' + activeMeta?.name : activeMeta?.name}`}
              style={SS.textarea}
              rows={2}
            />
            <div style={SS.composerToolbar}>
              <div style={{ display: 'flex', gap: 8, color: 'var(--ink-faint)' }}>
                <span>𝐁</span><span>𝑰</span><span>🔗</span><span>📎</span><span>😊</span>
              </div>
              <button
                onClick={sendMessage}
                disabled={!draft.trim() || sending}
                style={{ ...SS.sendBtn, ...(!draft.trim() || sending ? SS.sendBtnDisabled : {}) }}>
                {sending ? '…' : '↑'}
              </button>
            </div>
          </div>
          {isSonia && messages.filter(m => m.isMe).length === 0 && (
            <div style={{ fontSize: 11, color: 'var(--ink-faint)', textAlign: 'center', marginTop: 8, fontStyle: 'italic' }}>
              💬 Sonia attend ton premier retour. Décris-lui ce que tu as compris du dossier.
            </div>
          )}
        </div>
      </div>

      {/* Easter egg — fenêtre WhatsApp fictive */}
      {showWhatsApp && (
        <WhatsAppModal onClose={() => setShowWhatsApp(false)} />
      )}
    </div>
  );
}

// ── WhatsApp Easter Egg ───────────────────────────────────────
function WhatsAppModal({ onClose }) {
  const waMessages = [
    { from: 'Sonia', time: '06:51', text: "Théo a encore refusé de me donner le calendrier MDR ce matin. Je commence à penser qu'il n'a pas de calendrier." },
    { from: 'Camille', time: '06:53', text: "Je m'en doutais. Mon contact chez Biostream m'a dit que leur process a pris 22 mois." },
    { from: 'Camille', time: '06:54', text: "Si Lumio n'a pas commencé y'a plus d'un an on est pas certifiés avant 2028 au mieux." },
    { from: 'Sonia', time: '06:55', text: "C'est ce que je craignais. On ne peut pas lancer la plateforme de marque sans cette réponse." },
    { from: 'Camille', time: '06:57', text: "Le consultant que tu as mandaté — il est au courant pour la certif ?" },
    { from: 'Sonia', time: '06:58', text: "Il/elle a accès à l'email de Théo. À lui/elle de tirer les fils." },
    { from: 'Camille', time: '07:02', text: "J'espère. Parce que si la plateforme de marque sort avec 'expert santé certifié' sans la certif, on va se faire massacrer par Biostream." },
    { from: 'Sonia', time: '07:03', text: "Je sais. C'est pour ça que j'ai besoin d'un diagnostic honnête, pas d'un document qui nous fait plaisir. 🙏" },
  ];

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 500,
      background: 'rgba(20,24,36,0.55)',
      backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }} onClick={onClose}>
      <div style={{
        width: 340, maxHeight: 520,
        background: '#ECE5DD',
        borderRadius: 12,
        boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden'
      }} onClick={e => e.stopPropagation()}>
        {/* Header WhatsApp */}
        <div style={{ background: '#075E54', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#128C7E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: 'white' }}>WA</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>Sonia + Camille</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)' }}>groupe privé · 2 membres</div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>×</button>
        </div>

        {/* Alerte contexte */}
        <div style={{ background: '#FFF3CD', padding: '7px 14px', fontSize: 11, color: '#856404', borderBottom: '1px solid rgba(0,0,0,0.06)', textAlign: 'center' }}>
          🔒 Conversation privée — non accessible officiellement
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {waMessages.map((m, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: m.from === 'Sonia' ? 'row-reverse' : 'row', gap: 6, alignItems: 'flex-end' }}>
              <div style={{ fontSize: 9, color: '#999', marginBottom: 2, flexShrink: 0 }}>{m.from}</div>
              <div style={{
                maxWidth: '78%',
                background: m.from === 'Sonia' ? '#DCF8C6' : 'white',
                borderRadius: m.from === 'Sonia' ? '12px 12px 3px 12px' : '12px 12px 12px 3px',
                padding: '7px 10px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                fontSize: 13, lineHeight: 1.5, color: '#1a1a1a'
              }}>
                {m.text}
                <div style={{ fontSize: 9, color: '#999', textAlign: 'right', marginTop: 3 }}>{m.time} ✓✓</div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ padding: '8px 14px', background: '#F0F0F0', fontSize: 11, color: '#5b6473', textAlign: 'center', borderTop: '1px solid rgba(0,0,0,0.08)' }}>
          À utiliser avec discernement dans votre livrable.
        </div>
      </div>
    </div>
  );
}

const SS = {
  app:          { display: 'flex', height: '100%', background: 'white', overflow: 'hidden', position: 'relative' },
  sidebar:      { width: 220, flexShrink: 0, background: '#3f0e40', color: 'rgba(255,255,255,0.85)', overflowY: 'auto' },
  workspace:    { padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)' },
  section:      { padding: '12px 0' },
  sectionTitle: { padding: '4px 16px', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.02em' },
  item:         { display: 'flex', alignItems: 'center', gap: 8, padding: '4px 16px', fontSize: 13.5, cursor: 'pointer' },
  itemActive:   { background: '#1164a3', color: 'white' },
  itemUnread:   { fontWeight: 700, color: 'white' },
  statusDot:    { width: 8, height: 8, borderRadius: '50%', flexShrink: 0 },
  badge:        { marginLeft: 'auto', background: '#cd2553', color: 'white', fontSize: 10, fontWeight: 700, padding: '0 6px', borderRadius: 9, minWidth: 16, textAlign: 'center', height: 16, lineHeight: '16px' },
  main:         { flex: 1, display: 'flex', flexDirection: 'column', background: 'white', minWidth: 0, overflow: 'hidden' },
  chatHead:     { padding: '10px 20px', borderBottom: '1px solid var(--rule)', flexShrink: 0 },
  chatBody:     { flex: 1, padding: '12px 0', overflowY: 'auto', minHeight: 0 },
  message:      { display: 'flex', gap: 12, padding: '6px 20px', alignItems: 'flex-start' },
  msgAvatar:    { width: 32, height: 32, borderRadius: 4, color: 'white', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  typeDot:      { width: 6, height: 6, borderRadius: '50%', background: '#9a9ea8', display: 'inline-block', animation: 'typedot 1.2s infinite' },
  composer:     { padding: '0 20px 12px', flexShrink: 0 },
  composerInner:{ border: '1px solid rgba(20,24,36,0.18)', borderRadius: 8, background: 'white' },
  textarea:     { width: '100%', border: 'none', outline: 'none', padding: '10px 14px', fontSize: 14, fontFamily: 'inherit', resize: 'none', color: 'var(--ink)' },
  composerToolbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', borderTop: '1px solid var(--rule)' },
  sendBtn:      { background: '#007a5a', color: 'white', border: 'none', borderRadius: 4, padding: '4px 12px', cursor: 'pointer', fontSize: 14, fontWeight: 700 },
  sendBtnDisabled: { background: 'rgba(20,24,36,0.1)', color: 'var(--ink-faint)', cursor: 'not-allowed' }
};

// Inject keyframes once
if (!document.getElementById('slack-keyframes')) {
  const s = document.createElement('style');
  s.id = 'slack-keyframes';
  s.textContent = '@keyframes typedot { 0%,60%,100% { opacity: 0.2; } 30% { opacity: 1; } }';
  document.head.appendChild(s);
}

window.LUMIO_APPS = window.LUMIO_APPS || {};
window.LUMIO_APPS.slack = SlackApp;
