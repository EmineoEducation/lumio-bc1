// ══════════════════════════════════════════════════════════════
//  NOTEPAD — Student's personal notes (persists in localStorage)
//  FINDER — File browser, opens docs into their right apps
//  CALENDAR — Shows the CODIR deadline countdown
//  TRASH — Empty
// ══════════════════════════════════════════════════════════════

function NotepadApp() {
  const STORAGE_KEY = 'lumio_notepad';
  const [text, setText] = React.useState(() => localStorage.getItem(STORAGE_KEY) || '');
  React.useEffect(() => { localStorage.setItem(STORAGE_KEY, text); }, [text]);
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fffbef', overflow: 'hidden' }}>
      <div style={{ padding: '14px 22px 8px', borderBottom: '1px solid rgba(20,24,36,0.08)', background: 'rgba(245,232,196,0.5)' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, color: 'var(--ink)' }}>Mes notes — mission Lumio</div>
        <div style={{ fontSize: 11, color: 'var(--ink-mute)', marginTop: 2 }}>Bloc-notes personnel · sauvegardé automatiquement</div>
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Tes pensées au fil de l'eau pendant que tu lis le dossier.

▸ Ce qui te frappe en lisant Sonia
▸ Les contradictions entre Sonia et Théo
▸ Ce que dit Camille (et que les autres ne disent pas)
▸ Les questions que tu te poses
▸ Ton hypothèse de positionnement…"
        style={{
          flex: 1,
          width: '100%',
          padding: '20px 26px',
          border: 'none',
          outline: 'none',
          background: 'transparent',
          fontFamily: 'var(--font-display)',
          fontSize: 15,
          lineHeight: 1.75,
          color: 'var(--ink)',
          resize: 'none',
          backgroundImage: 'repeating-linear-gradient(transparent, transparent 30px, rgba(20,24,36,0.06) 30px, rgba(20,24,36,0.06) 31px)'
        }}
      />
      <div style={{ padding: '8px 22px', borderTop: '1px solid rgba(20,24,36,0.08)', display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--ink-mute)', fontFamily: 'var(--font-mono)' }}>
        <span>{wordCount} mots</span>
        <span>auto-saved · ⌘S</span>
      </div>
    </div>
  );
}
window.LUMIO_APPS = window.LUMIO_APPS || {};
window.LUMIO_APPS.notepad = NotepadApp;

// ─── FINDER ──────────────────────────────────────────────────
function FinderApp({ openFolder }) {
  const { open } = window.useWindows();
  const [folder, setFolder] = React.useState(openFolder || 'mission');

  const folders = {
    mission: {
      title: 'Mission Lumio',
      items: [
        { name: 'Lettre de mission — Sonia.eml', kind: 'mail', app: 'mail', props: { openId: 'brief' }, label: 'EML' },
        { name: 'Note de cadrage CODIR.rtf', kind: 'doc', app: 'notes', props: { openNote: 'cadrage' }, label: 'RTF' },
        { name: 'Veille concurrentielle — Yanis.pdf', kind: 'pdf', app: 'pdf', label: 'PDF' },
        { name: 'Réponse Théo (CONFIDENTIEL).eml', kind: 'mail', app: 'mail', props: { openId: 'theo' }, label: 'EML' },
        { name: 'Entretien Camille — 7 juill.m4a', kind: 'audio', app: 'voice', label: 'M4A' },
        { name: 'Revue de presse (3 articles)', kind: 'folder', folder: 'press' },
      ]
    },
    press: {
      title: 'Revue de presse',
      items: [
        { name: 'lesechos-mdr-fracture.html', kind: 'doc', app: 'browser', props: { openTab: 'press-0' }, label: 'WEB' },
        { name: 'hbr-stress-donnee-arme.html', kind: 'doc', app: 'browser', props: { openTab: 'press-1' }, label: 'WEB' },
        { name: '20mn-apple-watch-confiance.html', kind: 'doc', app: 'browser', props: { openTab: 'press-2' }, label: 'WEB' }
      ]
    }
  };

  const cur = folders[folder];

  const onItemClick = (item) => {
    if (item.kind === 'folder') {
      setFolder(item.folder);
    } else if (item.app) {
      open(item.app, item.props || {});
    }
  };

  return (
    <div style={{ display: 'flex', height: '100%', background: 'white' }}>
      <div style={{ width: 180, flexShrink: 0, background: '#e8eaee', padding: '16px 0', borderRight: '1px solid var(--rule)' }}>
        <div style={{ padding: '0 16px', fontSize: 11, color: 'var(--ink-faint)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Favoris</div>
        <div style={{ padding: '4px 16px', fontSize: 13, color: 'var(--ink-soft)' }}>📁 Bureau</div>
        <div style={{ padding: '4px 16px', fontSize: 13, color: 'var(--ink-soft)' }}>📁 Téléchargements</div>
        <div style={{ padding: '4px 16px', fontSize: 13, color: 'var(--ink-soft)' }}>📁 Documents</div>
        <div style={{ padding: '0 16px', fontSize: 11, color: 'var(--ink-faint)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 16, marginBottom: 8 }}>Espaces partagés</div>
        <div onClick={() => setFolder('mission')} style={{ padding: '4px 16px', fontSize: 13, color: folder === 'mission' ? 'white' : 'var(--ink-soft)', background: folder === 'mission' ? '#3a7bd5' : 'transparent', cursor: 'pointer' }}>📂 Mission Lumio</div>
        <div onClick={() => setFolder('press')} style={{ padding: '4px 16px 4px 28px', fontSize: 13, color: folder === 'press' ? 'white' : 'var(--ink-soft)', background: folder === 'press' ? '#3a7bd5' : 'transparent', cursor: 'pointer' }}>📂 Revue de presse</div>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--rule)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{cur.title}</div>
          <div style={{ flex: 1 }} />
          <div style={{ fontSize: 11, color: 'var(--ink-mute)' }}>{cur.items.length} éléments</div>
        </div>
        <div className="scroll" style={{ flex: 1, padding: 18, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 18, alignContent: 'start' }}>
          {cur.items.map((item, i) => (
            <div key={i} onDoubleClick={() => onItemClick(item)} onClick={() => onItemClick(item)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', padding: 6, borderRadius: 4 }}>
              {item.kind === 'folder' ? (
                <window.FolderIcon size={56} />
              ) : (
                <window.FileIcon size={56} kind={item.kind} label={item.label} />
              )}
              <div style={{ fontSize: 11.5, textAlign: 'center', marginTop: 6, color: 'var(--ink)', wordBreak: 'break-word', maxWidth: 110, lineHeight: 1.3 }}>{item.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
window.LUMIO_APPS.finder = FinderApp;

// ─── CALENDAR ─────────────────────────────────────────────────
function CalendarApp() {
  // Simulated date: 12 september. CODIR is on 30 september.
  const today = 12;
  const codirDay = 30;
  const days = Array.from({ length: 30 }, (_, i) => i + 1);
  // Sept 2026 starts on a Tuesday
  const startOffset = 2;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'white', overflow: 'hidden' }}>
      <div style={{ padding: '14px 22px', borderBottom: '1px solid var(--rule)', display: 'flex', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 600, color: 'var(--ink)' }}>Septembre 2026</div>
          <div style={{ fontSize: 11, color: 'var(--ink-faint)', marginTop: 2 }}>Aujourd'hui — samedi 12 sept.</div>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600, padding: '6px 12px', background: 'rgba(196,66,15,0.10)', borderRadius: 6 }}>
          ⚡ J−18 avant le CODIR
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', flex: 1, gap: 1, background: 'var(--rule)', padding: 1 }}>
        {['lun.','mar.','mer.','jeu.','ven.','sam.','dim.'].map(d => (
          <div key={d} style={{ background: '#f4f2ee', padding: '6px 8px', fontSize: 11, fontWeight: 600, color: 'var(--ink-mute)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{d}</div>
        ))}
        {Array.from({ length: startOffset }).map((_, i) => (
          <div key={'e'+i} style={{ background: '#fafaf8' }} />
        ))}
        {days.map(d => {
          const isToday = d === today;
          const isCodir = d === codirDay;
          const isPast = d < today;
          return (
            <div key={d} style={{
              background: 'white',
              padding: 8,
              minHeight: 70,
              opacity: isPast ? 0.5 : 1,
              borderTop: isToday ? '3px solid var(--accent)' : 'none',
              position: 'relative'
            }}>
              <div style={{
                fontSize: 13, fontWeight: isToday ? 700 : 400,
                color: isToday ? 'var(--accent)' : 'var(--ink)'
              }}>{d}</div>
              {isCodir && (
                <div style={{ marginTop: 4, padding: '3px 5px', background: 'var(--accent)', color: 'white', borderRadius: 3, fontSize: 9.5, fontWeight: 600, lineHeight: 1.3 }}>
                  09:00 — CODIR<br/><span style={{ fontWeight: 400 }}>livraison V1</span>
                </div>
              )}
              {d === 14 && (
                <div style={{ marginTop: 4, padding: '3px 5px', background: 'rgba(60,100,180,0.15)', color: '#2c5d99', borderRadius: 3, fontSize: 9.5, lineHeight: 1.3 }}>
                  16:00 — Athena Capital (call)
                </div>
              )}
              {d === 22 && (
                <div style={{ marginTop: 4, padding: '3px 5px', background: 'rgba(10,122,110,0.15)', color: '#0a7a6e', borderRadius: 3, fontSize: 9.5, lineHeight: 1.3 }}>
                  Préventica — Lyon
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
window.LUMIO_APPS.calendar = CalendarApp;

// ─── TRASH ────────────────────────────────────────────────────
function TrashApp() {
  return (
    <div style={{ padding: 40, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'white', color: 'var(--ink-mute)', textAlign: 'center' }}>
      <div style={{ opacity: 0.4, marginBottom: 20 }}>
        <window.TrashIcon size={80} />
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--ink)' }}>La corbeille est vide.</div>
      <div style={{ fontSize: 12, marginTop: 6 }}>Mais l'idée est bonne. La plupart des consultants commencent par jeter quelque chose.</div>
    </div>
  );
}
window.LUMIO_APPS.trash = TrashApp;
