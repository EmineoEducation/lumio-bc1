// ══════════════════════════════════════════════════════════════
// SLACK APP — ambient messaging + final Sonia chat
// ══════════════════════════════════════════════════════════════

const { useState: useSlackState, useEffect: useSlackEffect, useRef: useSlackRef } = React;

// ─── Sonia AI prompt for final chat ─────────────────────────
const SONIA_PROMPT = `Tu es Sonia Ferracci, Directrice Marketing de Lumio Health depuis 7 mois.

Tu reçois un premier message d'un(e) consultant(e) externe (Lou) à qui tu as confié il y a quelques jours une mission de diagnostic de marque.

Tu as accès à tous les documents qu'il/elle a pu consulter : ta lettre de mission, ta note de cadrage CODIR du 12 juin, le rapport de veille du stagiaire Yanis Morel (non relu), trois articles de presse (Les Échos, HBR France, 20 Minutes), un email confidentiel de Théo Marczak (CEO) du 14 juin avec ses réserves sur la MDR et le budget, et trois verbatims de Camille Ott (commerciale B2B).

Contexte clé :
- Lumio = wearable de mesure du stress, 8 ans B2B, pression d'un fonds américain pour aller grand public en 36 mois (objectif 20M€)
- Concurrents Biostream (jan 2026) et Neuroflow (mars 2026) viennent d'obtenir la certification MDR IIa
- Lumio n'a PAS de certif
- Théo refuse de communiquer un calendrier (en interne il a dit "fin Q2 2027 best case")
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

Ne dis JAMAIS "Bonjour Lou" ou "Merci pour ta livraison". Entre direct dans le sujet.`;

async function callClaude(payload) {
  const resp = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await resp.json().catch(() => ({}));

  if (!resp.ok) {
    throw new Error(data.error || data.message || `HTTP ${resp.status}`);
  }

  return data;
}

function nowTime() {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
}

function SlackApp({ openChannel }) {
  const D = window.LUMIO_DATA;

  const channels = [
    { id: 'general', name: 'général', type: 'channel', members: 12 },
    { id: 'mission-lumio', name: 'mission-lumio-brand', type: 'channel', members: 4, special: true },
    { id: 'random', name: 'random', type: 'channel', members: 11 },
    { id: 'design-feed', name: 'design-feed', type: 'channel', members: 8 }
  ];

  const dms = [
    { id: 'sonia', name: 'Sonia Ferracci', avatar: 'SF', color: '#c4420f', status: 'online' },
    { id: 'camille', name: 'Camille Ott', avatar: 'CO', color: '#0a7a6e', status: 'online' },
    { id: 'yanis', name: 'Yanis Morel', avatar: 'YM', color: '#5b6b85', status: 'away' }
  ];

  const [unreads, setUnreads] = useSlackState({
    'mission-lumio': 1,
    camille: 2
  });

  const [activeId, setActiveId] = useSlackState(openChannel || 'sonia');
  const activeIdRef = useSlackRef(openChannel || 'sonia');

  const setActive = (id) => {
    activeIdRef.current = id;
    setActiveId(id);
  };

  const [chatHistory, setChatHistory] = useSlackState({});
  const [draft, setDraft] = useSlackState('');
  const [sending, setSending] = useSlackState(false);
  const [exchangeCount, setExchangeCountLocal] = useSlackState(0);
  const scrollRef = useSlackRef(null);

  const seed = {
    sonia: [
      {
        from: 'Sonia Ferracci',
        avatar: 'SF',
        color: '#c4420f',
        time: '07:48',
        text: 'Salut Lou — bien reçu mon mail ?'
      },
      {
        from: 'Sonia Ferracci',
        avatar: 'SF',
        color: '#c4420f',
        time: '07:48',
        text: 'J\'ai déposé tous les docs sur ton espace partagé. Prends ta matinée pour digérer, et écris-moi quand tu as une première lecture.'
      },
      {
        from: 'Sonia Ferracci',
        avatar: 'SF',
        color: '#c4420f',
        time: '07:49',
        text: 'Au fait — n\'oublie pas que Théo ne sait pas que tu as accès à son mail du 14 juin. À toi de juger comment l\'utiliser.'
      }
    ],
    camille: [
      {
        from: 'Camille Ott',
        avatar: 'CO',
        color: '#0a7a6e',
        time: 'il y a 8 min',
        text: 'Hello 👋 j\'ai vu que Sonia t\'avait briefé.'
      },
      {
        from: 'Camille Ott',
        avatar: 'CO',
        color: '#0a7a6e',
        time: 'il y a 8 min',
        text: 'Si tu veux qu\'on se parle dans la semaine, dis-moi. Je ne travaille pas dans la même réalité que la direction sur ce dossier 🙃'
      }
    ],
    'mission-lumio': [
      {
        from: 'Sonia Ferracci',
        avatar: 'SF',
        color: '#c4420f',
        time: 'lun. 18:42',
        text: 'On va recevoir une consultante externe pour faire un audit de marque avant le CODIR du 30. @theo @camille merci de jouer le jeu.'
      },
      {
        from: 'Théo Marczak',
        avatar: 'TM',
        color: '#5c2d8f',
        time: 'lun. 19:14',
        text: 'Pas convaincu mais ok. Tant qu\'on parle pas de MDR sans moi.'
      },
      {
        from: 'Camille Ott',
        avatar: 'CO',
        color: '#0a7a6e',
        time: 'lun. 21:02',
        text: 'Tant mieux qu\'on en parle franchement. ça commence à être tendu sur le terrain.'
      }
    ],
    yanis: [
      {
        from: 'Yanis Morel',
        avatar: 'YM',
        color: '#5b6b85',
        time: '11 mai',
        text: 'Salut, je termine mon rapport demain. C\'est pas parfait, j\'ai pas pu boucler la partie certif Lumio (Théo n\'a pas répondu), désolé.'
      }
    ],
    general: [
      {
        from: 'lumio-bot',
        avatar: '🤖',
        color: '#9a9ea8',
        time: '08:00',
        text: '☀️ Bonjour à tous · 23 personnes connectées ce matin'
      }
    ],
    random: [
      {
        from: 'Marc Dubreuil',
        avatar: 'MD',
        color: '#3a7bd5',
        time: 'lun.',
        text: 'Quelqu\'un a déjà testé le café new-yorkais derrière la rue de Charonne ? Avis ?'
      }
    ],
    'design-feed': [
      {
        from: 'Élodie Park',
        avatar: 'EP',
        color: '#d18a3c',
        time: '08:12',
        text: 'Nouveau projet de Pentagram pour Headspace ↘ https://… super travail typographique 🔥'
      }
    ]
  };

  useSlackEffect(() => {
    if (Object.keys(chatHistory).length === 0) {
      setChatHistory(seed);
    }
  }, []);

  useSlackEffect(() => {
    if (openChannel) {
      setActive(openChannel);
      setUnreads((u) => ({ ...u, [openChannel]: 0 }));
    }
  }, [openChannel]);

  useSlackEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, activeId, sending]);

  useSlackEffect(() => {
    window.__onSoniaLivrableReaction = async (veille, plateforme) => {
      setActive('sonia');
      setSending(true);

      const time = nowTime();

      const prompt = `Tu es Sonia Ferracci, Directrice Marketing de Lumio Health.

Le/la consultant·e vient de te remettre son livrable final : une note de synthèse de veille stratégique et une plateforme de marque.

Tu l'as lu rapidement. Tu réagis en message Slack — direct, professionnel, honnête. Ni enthousiaste pour rien, ni froid.

Tu pointes ce qui te convainc, ce qui te questionne encore, et tu conclus par ce que tu vas faire avec ce document avant le CODIR.

100-150 mots maximum.

Livrable reçu :
VEILLE : ${(veille || '').substring(0, 600)}...
PLATEFORME : ${(plateforme || '').substring(0, 600)}...`;

      try {
        const data = await callClaude({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 400,
          messages: [{ role: 'user', content: prompt }]
        });

        const reply = data.content?.map((b) => b.text || '').join('') || '…';

        setChatHistory((h) => ({
          ...h,
          sonia: [
            ...(h.sonia || []),
            {
              from: 'Sonia Ferracci',
              avatar: 'SF',
              color: '#c4420f',
              time,
              text: reply
            }
          ]
        }));

        if (activeIdRef.current !== 'sonia') {
          setUnreads((u) => ({ ...u, sonia: (u.sonia || 0) + 1 }));
        }
      } catch (e) {
        console.error('Slack livrable reaction failed:', e);

        setChatHistory((h) => ({
          ...h,
          sonia: [
            ...(h.sonia || []),
            {
              from: 'Sonia Ferracci',
              avatar: 'SF',
              color: '#c4420f',
              time,
              text: 'Je ne peux pas lire ton envoi tout de suite. Réessaie dans une minute.'
            }
          ]
        }));

        if (activeIdRef.current !== 'sonia') {
          setUnreads((u) => ({ ...u, sonia: (u.sonia || 0) + 1 }));
        }
      } finally {
        setSending(false);
      }
    };

    return () => {
      window.__onSoniaLivrableReaction = null;
    };
  }, []);

  const isSonia = activeId === 'sonia';
  const messages = chatHistory[activeId] || [];

  const sendMessage = async () => {
    if (!draft.trim() || sending) return;

    const text = draft.trim();
    setDraft('');

    const time = nowTime();

    const userMsg = {
      from: window.LUMIO_DATA?.student?.name || 'Lou Bertrand',
      avatar: window.LUMIO_DATA?.student?.initial || 'LB',
      color: '#1a2436',
      time,
      text,
      isMe: true
    };

    setChatHistory((h) => ({
      ...h,
      [activeId]: [...(h[activeId] || []), userMsg]
    }));

    if (!isSonia) return;

    const newCount = exchangeCount + 1;
    setExchangeCountLocal(newCount);

    if (window.__onSlackExchange) window.__onSlackExchange(newCount);
    if (window.__onSlackSent) window.__onSlackSent();

    setSending(true);

    setTimeout(async () => {
      try {
        const currentHistory = [
          ...(chatHistory.sonia || []),
          userMsg
        ];

        const history = currentHistory
          .filter((m) => !m.typing)
          .map((m) => `${m.isMe ? 'Lou' : 'Sonia'}: ${m.text}`)
          .join('\n');

        const userPrompt = `${history}\n\nRéponds maintenant en tant que Sonia (2-4 messages courts séparés par ---SPLIT---).`;

        const data = await callClaude({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 400,
          system: SONIA_PROMPT,
          messages: [{ role: 'user', content: userPrompt }]
        });

        const raw = data.content?.map((b) => b.text || '').join('') || '';
        const replies = raw
          .split('---SPLIT---')
          .map((s) => s.trim())
          .filter(Boolean);

        let delay = 800;

        for (const reply of replies) {
          await new Promise((r) => setTimeout(r, delay));

          const tt = nowTime();

          setChatHistory((h) => ({
            ...h,
            sonia: [
              ...(h.sonia || []),
              {
                from: 'Sonia Ferracci',
                avatar: 'SF',
                color: '#c4420f',
                time: tt,
                text: reply
              }
            ]
          }));

          if (activeIdRef.current !== 'sonia') {
            setUnreads((u) => ({ ...u, sonia: (u.sonia || 0) + 1 }));
          }

          delay = 1400 + reply.length * 8;
        }
      } catch (e) {
        console.error('Slack Sonia chat failed:', e);

        setChatHistory((h) => ({
          ...h,
          sonia: [
            ...(h.sonia || []),
            {
              from: 'Sonia Ferracci',
              avatar: 'SF',
              color: '#c4420f',
              time: 'maintenant',
              text: 'Je n’ai pas ta réponse côté serveur. Vérifie la connexion ou l’API.'
            }
          ]
        }));

        if (activeIdRef.current !== 'sonia') {
          setUnreads((u) => ({ ...u, sonia: (u.sonia || 0) + 1 }));
        }
      } finally {
        setSending(false);
      }
    }, 600);
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const activeMeta = [...channels, ...dms].find((x) => x.id === activeId);

  return (
    <div className="slack-shell" style={{ height: '100%', display: 'flex', background: '#1a1d21', color: '#fff' }}>
      <aside style={{ width: 260, background: '#3f0e40', color: '#fff', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
          <div style={{ fontWeight: 700, fontSize: 16 }}>Lumio Health</div>
          <div style={{ fontSize: 12, opacity: 0.75 }}>Workspace</div>
        </div>

        <div style={{ padding: '14px 10px 8px', fontSize: 11, textTransform: 'uppercase', opacity: 0.65 }}>
          Canaux
        </div>
        <div>
          {channels.map((ch) => (
            <button
              key={ch.id}
              onClick={() => {
                setActive(ch.id);
                setUnreads((u) => ({ ...u, [ch.id]: 0 }));
              }}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '8px 14px',
                background: activeId === ch.id ? 'rgba(255,255,255,.14)' : 'transparent',
                color: '#fff',
                border: 'none',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer'
              }}
            >
              <span>#{ch.name}</span>
              {!!unreads[ch.id] && (
                <span style={{ fontSize: 11, background: '#fff', color: '#3f0e40', borderRadius: 999, padding: '1px 7px' }}>
                  {unreads[ch.id]}
                </span>
              )}
            </button>
          ))}
        </div>

        <div style={{ padding: '14px 10px 8px', fontSize: 11, textTransform: 'uppercase', opacity: 0.65 }}>
          Messages directs
        </div>
        <div>
          {dms.map((dm) => (
            <button
              key={dm.id}
              onClick={() => {
                setActive(dm.id);
                setUnreads((u) => ({ ...u, [dm.id]: 0 }));
              }}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '8px 14px',
                background: activeId === dm.id ? 'rgba(255,255,255,.14)' : 'transparent',
                color: '#fff',
                border: 'none',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer'
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 999,
                    background: dm.status === 'online' ? '#2eb67d' : '#b7b7b7',
                    display: 'inline-block'
                  }}
                />
                {dm.name}
              </span>
              {!!unreads[dm.id] && (
                <span style={{ fontSize: 11, background: '#fff', color: '#3f0e40', borderRadius: 999, padding: '1px 7px' }}>
                  {unreads[dm.id]}
                </span>
              )}
            </button>
          ))}
        </div>
      </aside>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff', color: '#1d1c1d' }}>
        <header style={{ padding: '14px 18px', borderBottom: '1px solid #e6e6e6', background: '#fff' }}>
          <div style={{ fontWeight: 700, fontSize: 18 }}>
            {activeMeta?.type === 'channel' ? `# ${activeMeta.name}` : activeMeta?.name}
          </div>
          <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
            {activeMeta?.type === 'channel'
              ? `${activeMeta.members} membres`
              : activeMeta?.status === 'online'
                ? 'En ligne'
                : 'Absent'}
          </div>
        </header>

        <div
          ref={scrollRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '18px',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            background: '#fff'
          }}
        >
          {messages.map((m, i) => (
            <div key={`${m.time}-${i}`} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: m.color || '#ddd',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: 13,
                  flexShrink: 0
                }}
              >
                {m.avatar}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 2 }}>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>{m.from}</span>
                  <span style={{ fontSize: 12, color: '#777' }}>{m.time}</span>
                </div>
                <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.45, fontSize: 14, color: '#1d1c1d' }}>
                  {m.text}
                </div>
              </div>
            </div>
          ))}

          {sending && isSonia && (
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', opacity: 0.8 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: '#c4420f',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: 13,
                  flexShrink: 0
                }}
              >
                SF
              </div>
              <div style={{ paddingTop: 8, fontSize: 14, color: '#666' }}>Sonia est en train d’écrire…</div>
            </div>
          )}
        </div>

        <div style={{ padding: 16, borderTop: '1px solid #e6e6e6', background: '#fff' }}>
          <div
            style={{
              border: '1px solid #d1d1d1',
              borderRadius: 10,
              overflow: 'hidden',
              background: '#fff'
            }}
          >
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder={
                activeMeta?.type === 'channel'
                  ? `Écrire dans #${activeMeta.name}`
                  : `Message à ${activeMeta?.name || '…'}`
              }
              rows={3}
              style={{
                width: '100%',
                border: 'none',
                outline: 'none',
                resize: 'none',
                padding: 12,
                fontSize: 14,
                fontFamily: 'inherit',
                color: '#1d1c1d'
              }}
            />
            <div style={{ padding: '0 12px 12px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={sendMessage}
                disabled={!draft.trim() || sending}
                style={{
                  background: !draft.trim() || sending ? '#c8c8c8' : '#007a5a',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '9px 14px',
                  fontWeight: 600,
                  cursor: !draft.trim() || sending ? 'default' : 'pointer'
                }}
              >
                Envoyer
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

window.LUMIO_APPS = window.LUMIO_APPS || {};
window.LUMIO_APPS.slack = SlackApp;
