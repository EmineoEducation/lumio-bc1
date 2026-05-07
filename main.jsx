// ══════════════════════════════════════════════════════════════
//  LOGIN SCREEN + ROOT APP
// ══════════════════════════════════════════════════════════════
const { useState: useRootState, useEffect: useRootEffect } = React;

// ─── Saisie du nom (avant le login) ─────────────────────────
function NameScreen({ onConfirm }) {
  const [prenom, setPrenom] = useRootState('');
  const [nom, setNom] = useRootState('');
  const [apiKey, setApiKey] = useRootState('');
  const [showKey, setShowKey] = useRootState(false);
  const [shake, setShake] = useRootState(false);

  const confirm = () => {
    if (!prenom.trim()) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    const full = `${prenom.trim()}${nom.trim() ? ' ' + nom.trim() : ''}`;
    window.LUMIO_DATA.student.name = full;
    window.LUMIO_DATA.student.email = `${prenom.trim().toLowerCase()}.${(nom.trim() || 'consultant').toLowerCase()}@consult.fr`;
    window.LUMIO_DATA.student.initial = prenom.trim()[0].toUpperCase();
    // Stocker la clé API si fournie
    if (apiKey.trim()) {
      window.__ANTHROPIC_KEY = apiKey.trim();
      sessionStorage.setItem('lumio_api_key', apiKey.trim());
    }
    onConfirm(full);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: `
        radial-gradient(ellipse at 30% 20%, #f5d5b8 0%, transparent 50%),
        radial-gradient(ellipse at 75% 80%, #98a8c8 0%, transparent 60%),
        linear-gradient(160deg, #d8a098 0%, #5878a8 100%)
      `,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      color: 'white', padding: '2rem'
    }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase', opacity: 0.7, marginBottom: 8 }}>Clinique BEC · MSMC · BC1</div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 48, fontWeight: 200, letterSpacing: '-0.02em', marginBottom: 8, textShadow: '0 2px 12px rgba(0,0,0,0.2)' }}>Lumio Health</div>
      <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 18, opacity: 0.7, marginBottom: 48 }}>Une affaire à résoudre</div>

      <div style={{
        background: 'rgba(255,255,255,0.12)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.25)',
        borderRadius: 16,
        padding: '32px 36px',
        width: '100%', maxWidth: 420,
        textAlign: 'center',
        animation: shake ? 'shake 0.4s ease' : 'none'
      }}>
        <div style={{ fontSize: 13, opacity: 0.85, marginBottom: 24, lineHeight: 1.6 }}>
          Tu vas entrer dans ce dossier en tant que consultant·e externe.<br/>
          <span style={{ opacity: 0.7 }}>Comment t'appelles-tu ?</span>
        </div>
        <div style={{ display: 'flex', gap: 10, marginBottom: 12, width: '100%' }}>
          <input
            value={prenom}
            onChange={e => setPrenom(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') confirm(); }}
            placeholder="Prénom *"
            autoFocus
            style={{
              flex: 1, minWidth: 0, padding: '10px 14px',
              border: prenom.trim() ? '1.5px solid rgba(255,255,255,0.5)' : '1.5px solid rgba(255,255,255,0.2)',
              borderRadius: 10,
              background: 'rgba(255,255,255,0.15)',
              color: 'white', fontSize: 14,
              outline: 'none', transition: 'border-color .2s'
            }}
          />
          <input
            value={nom}
            onChange={e => setNom(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') confirm(); }}
            placeholder="Nom"
            style={{
              flex: 1, minWidth: 0, padding: '10px 14px',
              border: '1.5px solid rgba(255,255,255,0.2)',
              borderRadius: 10,
              background: 'rgba(255,255,255,0.15)',
              color: 'white', fontSize: 14,
              outline: 'none'
            }}
          />
        </div>

        {/* Clé API — section repliable */}
        <div style={{ marginBottom: 16 }}>
          <div
            onClick={() => setShowKey(v => !v)}
            style={{ fontSize: 11, opacity: 0.55, cursor: 'pointer', marginBottom: showKey ? 8 : 0, letterSpacing: '0.06em' }}>
            {showKey ? '▾' : '▸'} Clé API Anthropic (requise pour l'IA)
          </div>
          {showKey && (
            <input
              type="password"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="sk-ant-..."
              style={{
                width: '100%', padding: '9px 14px',
                border: apiKey.trim() ? '1.5px solid rgba(255,255,255,0.5)' : '1.5px solid rgba(255,255,255,0.2)',
                borderRadius: 10,
                background: 'rgba(255,255,255,0.1)',
                color: 'white', fontSize: 13,
                outline: 'none', fontFamily: 'var(--font-mono)'
              }}
            />
          )}
          {showKey && <div style={{ fontSize: 10, opacity: 0.4, marginTop: 5, lineHeight: 1.5 }}>
            Utilisée uniquement en local pour les échanges avec Sonia et l'évaluation finale. Non transmise.
          </div>}
        </div>

        <button
          onClick={confirm}
          style={{
            width: '100%', padding: '11px',
            background: prenom.trim() ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)',
            color: prenom.trim() ? '#1a2436' : 'rgba(255,255,255,0.5)',
            border: 'none', borderRadius: 10,
            fontSize: 13, fontWeight: 600, cursor: prenom.trim() ? 'pointer' : 'default',
            transition: 'all .2s', fontFamily: 'inherit'
          }}
        >
          Entrer dans l'affaire →
        </button>
        {!prenom.trim() && <div style={{ fontSize: 11, opacity: 0.5, marginTop: 10 }}>Le prénom est requis</div>}
      </div>

      <style>{`
        @keyframes shake {
          0%,100%{transform:translateX(0)}
          20%{transform:translateX(-8px)}
          40%{transform:translateX(8px)}
          60%{transform:translateX(-5px)}
          80%{transform:translateX(5px)}
        }
        ::placeholder { color: rgba(255,255,255,0.45) !important; }
      `}</style>
    </div>
  );
}

function LoginScreen({ onLogin, studentName }) {
  const [stage, setStage] = useRootState('idle');
  const [pwd, setPwd] = useRootState('');
  const initial = window.LUMIO_DATA?.student?.initial || studentName?.[0]?.toUpperCase() || '?';

  const onUnlock = () => {
    if (stage === 'unlocking') return;
    setStage('unlocking');
    setTimeout(() => onLogin(), 1200);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: `
        radial-gradient(ellipse at 30% 20%, #f5d5b8 0%, transparent 50%),
        radial-gradient(ellipse at 75% 80%, #98a8c8 0%, transparent 60%),
        linear-gradient(160deg, #d8a098 0%, #5878a8 100%)
      `,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      color: 'white',
      animation: stage === 'unlocking' ? 'fadeOutLogin 1.1s forwards' : 'none'
    }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase', opacity: 0.8, marginBottom: 8 }}>samedi 12 septembre 2026</div>
        <div style={{ fontSize: 96, fontWeight: 200, fontFamily: 'var(--font-display)', letterSpacing: '-0.02em', lineHeight: 1, textShadow: '0 2px 12px rgba(0,0,0,0.2)' }}>08:14</div>
      </div>

      <div style={{
        width: 130, height: 130, borderRadius: '50%',
        background: 'linear-gradient(135deg, #c4420f 0%, #8a2d05 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 56, fontWeight: 200, fontFamily: 'var(--font-display)',
        color: 'white', marginBottom: 14,
        boxShadow: '0 12px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.3)'
      }}>{initial}</div>
      <div style={{ fontSize: 22, fontWeight: 500, marginBottom: 28, fontFamily: 'var(--font-display)' }}>{studentName}</div>

      <div style={{ position: 'relative', marginBottom: 16 }}>
        <input
          type="password"
          value={pwd}
          onChange={(e) => setPwd(e.target.value)}
          onFocus={() => setStage('typing')}
          onKeyDown={(e) => { if (e.key === 'Enter') onUnlock(); }}
          placeholder="Mot de passe"
          autoFocus
          style={{
            width: 280, padding: '10px 16px',
            border: 'none', borderRadius: 22,
            background: 'rgba(255,255,255,0.18)',
            backdropFilter: 'blur(12px)',
            color: 'white', fontSize: 14, textAlign: 'center',
            outline: '1.5px solid rgba(255,255,255,0.3)'
          }}
        />
        <button onClick={onUnlock} style={{
          position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)',
          width: 28, height: 28, borderRadius: '50%',
          background: 'rgba(255,255,255,0.3)', color: 'white',
          border: 'none', cursor: 'pointer', fontSize: 14
        }}>↑</button>
      </div>
      <div style={{ fontSize: 11, opacity: 0.7, fontStyle: 'italic' }}>Touch ID ou mot de passe pour déverrouiller</div>
      <div style={{ position: 'absolute', bottom: 32, left: 0, right: 0, textAlign: 'center', fontSize: 11, opacity: 0.7, letterSpacing: '0.1em' }}>
        ⏏ Annuler · ⏻ Éteindre · ⟲ Redémarrer
      </div>
      {stage === 'unlocking' && (
        <div style={{ position: 'absolute', bottom: 80, fontFamily: 'var(--font-mono)', fontSize: 11, opacity: 0.85, letterSpacing: '0.12em' }}>
          Déverrouillage en cours…
        </div>
      )}
    </div>
  );
}

// ─── Welcome overlay ─────────────────────────────────────────
function WelcomeBriefCard({ onClose, studentName }) {
  const prenom = studentName.split(' ')[0];
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 12000,
      background: 'rgba(20,24,36,0.55)',
      backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: 'fadeIn 400ms ease-out'
    }}>
      <div style={{
        width: 540, background: 'white', borderRadius: 14,
        padding: '32px 36px', boxShadow: '0 30px 80px rgba(0,0,0,0.4)'
      }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.25em', color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 12 }}>Clinique BEC · MSMC RNCP 38504 · Bloc 1</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.15, marginBottom: 16 }}>
          Bienvenue, {prenom}.
        </h1>
        <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--ink-soft)', marginBottom: 14 }}>
          Tu es <strong>{studentName}</strong>, consultant·e en stratégie de marque. Sonia Ferracci, Directrice Marketing de Lumio Health, t'a confié hier un audit de marque à livrer en CODIR dans 18 jours.
        </p>
        <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--ink-soft)', marginBottom: 14 }}>
          Tu accèdes à <strong>l'ordinateur de mission</strong> mis à ta disposition : la lettre de mission de Sonia, la note de cadrage, la veille concurrentielle du stagiaire, la revue de presse, des verbatims commerciaux, et — par discrétion de Sonia — un email confidentiel du CEO qui contredit la version officielle.
        </p>
        <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--ink-soft)', marginBottom: 22 }}>
          Tout est cohérent. Tout n'est pas honnête. <em>À toi de trier.</em>
        </p>
        <div style={{ background: '#f4f2ee', padding: '14px 18px', borderRadius: 8, fontSize: 12, color: 'var(--ink-soft)', lineHeight: 1.6, marginBottom: 22, fontFamily: 'var(--font-mono)' }}>
          <strong style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink)' }}>Consigne pratique</strong><br/>
          Tu disposes de toutes les apps d'un poste de travail réel. Quand tu as construit ton hypothèse, ouvre <strong>Slack → Sonia Ferracci</strong>. Sonia te répondra en direct.
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{
            padding: '10px 22px', background: 'var(--ink)', color: 'white',
            border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit'
          }}>Commencer</button>
        </div>
      </div>
    </div>
  );
}

// ─── ROOT ────────────────────────────────────────────────────
function Root() {
  const [phase, setPhase] = useRootState('name'); // name | login | brief | desktop
  const [studentName, setStudentName] = useRootState('');
  const [showLogin, setShowLogin] = useRootState(false);

  const handleNameConfirm = (name) => {
    setStudentName(name);
    // Patcher les données avec le vrai nom
    window.LUMIO_DATA.student.name = name;
    window.LUMIO_DATA.briefEmail.body = window.LUMIO_DATA.briefEmail.body.replace(/^Lou,/m, `${name.split(' ')[0]},`);
    window.LUMIO_DATA.slackMessages.initial[0].text = `Salut ${name.split(' ')[0]} — bien reçu mon mail ?`;
    setShowLogin(true);
    setPhase('login');
  };

  const handleLogin = () => {
    setShowLogin(false);
    setTimeout(() => setPhase('brief'), 200);
  };

  const dismissBrief = () => setPhase('desktop');
  // Logout : retour au login macOS uniquement, pas au NameScreen
  const logout = () => { setPhase('login'); setShowLogin(true); };

  return (
    <>
      {phase === 'name' && <NameScreen onConfirm={handleNameConfirm} />}
      {phase === 'desktop' && <window.LumioDesktop onLogout={logout} studentName={studentName} />}
      {phase === 'brief' && <WelcomeBriefCard onClose={dismissBrief} studentName={studentName} />}
      {showLogin && phase !== 'name' && <LoginScreen onLogin={handleLogin} studentName={studentName} />}
    </>
  );
}

// Mount
ReactDOM.createRoot(document.getElementById('root')).render(<Root />);
