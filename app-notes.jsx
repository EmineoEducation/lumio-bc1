// ══════════════════════════════════════════════════════════════
//  NOTES APP — Sonia's framing note
// ══════════════════════════════════════════════════════════════

function NotesApp({ openNote }) {
  const D = window.LUMIO_DATA;
  const notes = [
    {
      id: 'cadrage',
      title: D.soniaNote.title,
      date: D.soniaNote.date,
      preview: 'Lumio Health dispose d\'un actif sous-exploité…',
      sonia: D.soniaNote
    },
    {
      id: 'd1', title: 'Idées vacances août', date: '12 août 2026',
      preview: 'Crète vs Pouilles · à comparer avant fin juin…',
      distractor: true,
      body: '— Crète vs Pouilles\n— Demander à Marc le contact de la villa\n— Ne pas oublier le passeport de Léa (renouv. mai)\n— Petit hôtel à Polignano a Mare ?'
    },
    {
      id: 'd2', title: 'Liste courses', date: '1 sept. 2026',
      preview: 'Comté, vinaigre balsamique, pommes…',
      distractor: true,
      body: 'Comté\nVinaigre balsamique\nPommes (3kg)\nPapier toilette\nLessive\nLait d\'amande'
    },
    {
      id: 'd3', title: 'À régler avec Théo', date: '4 juin 2026',
      preview: 'MDR · budget · ce que je peux promettre au board…',
      distractor: false,
      body: '— MDR : il faut qu\'il s\'engage. Pas un calendrier plâtré, juste une fenêtre.\n— Budget : 380K. S\'il refuse, j\'accepte 280 mais pas en dessous.\n— Le board : Athena attend une roadmap brand pour Q1 2027. Si on n\'y est pas, ils vont nous demander de prendre quelqu\'un de Boston.\n\n→ Le truc qu\'il ne comprend pas : la MDR n\'est pas un détail technique. C\'est notre seule défense possible contre Biostream. Sans elle, on est mort à 18 mois.'
    }
  ];

  const [selectedId, setSelectedId] = React.useState(openNote || 'cadrage');
  const note = notes.find(n => n.id === selectedId) || notes[0];

  return (
    <div style={notesStyles.app}>
      <div style={notesStyles.sidebar} className="scroll">
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--rule)' }}>
          <div style={{ fontSize: 11, color: 'var(--ink-faint)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Toutes les notes</div>
        </div>
        {notes.map(n => (
          <div
            key={n.id}
            onClick={() => setSelectedId(n.id)}
            style={{ ...notesStyles.row, ...(selectedId === n.id ? notesStyles.rowActive : {}) }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 2 }}>{n.title}</div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
              <span style={{ fontSize: 11, color: 'var(--ink-faint)', fontWeight: 500 }}>{n.date}</span>
              <span style={{ fontSize: 11, color: 'var(--ink-mute)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.preview}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={notesStyles.editor} className="scroll">
        <div style={{ padding: '8px 28px', borderBottom: '1px solid var(--rule)', display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: 'var(--ink-faint)' }}>
          <span>Aa</span><span>•</span><span>—</span><span>𝐁 𝑰 𝑈̲</span><span>· · ·</span>
          <div style={{ flex: 1 }} />
          <span>{note.date}</span>
        </div>
        {note.sonia ? <SoniaNoteRender data={note.sonia} /> : (
          <div style={{ padding: '24px 32px', fontFamily: 'var(--font-display)', fontSize: 14, lineHeight: 1.8, color: 'var(--ink)', whiteSpace: 'pre-wrap' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 22, marginBottom: 10 }}>{note.title}</h1>
            {note.body}
          </div>
        )}
      </div>
    </div>
  );
}

function SoniaNoteRender({ data }) {
  return (
    <div style={{ padding: '28px 36px', fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>
      <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.18em', color: '#c4420f', textTransform: 'uppercase', marginBottom: 12 }}>{data.audience}</div>
      <h1 style={{ fontSize: 30, fontWeight: 400, lineHeight: 1.15, letterSpacing: '-0.01em', marginBottom: 4 }}>{data.title}</h1>
      <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 17, color: 'var(--ink-mute)', marginBottom: 18 }}>« {data.subtitle} »</div>
      <div style={{ fontSize: 12, color: 'var(--ink-mute)', borderBottom: '1px solid var(--rule)', paddingBottom: 14, marginBottom: 20 }}>
        {data.author} · {data.date}
      </div>

      <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 8 }}>Contexte</h2>
      <p style={{ fontSize: 15, lineHeight: 1.75, marginBottom: 18, color: 'var(--ink-soft)' }}>
        Lumio Health dispose d'un actif sous-exploité : <strong style={{ color: 'var(--ink)' }}>8 ans de données propriétaires sur le stress au travail</strong>, collectées auprès de 230 entreprises clientes. Aucun concurrent direct ne possède cet historique. C'est notre vraie différence — pas le patch lui-même, qui sera répliqué d'ici 18 mois.
      </p>

      <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 8 }}>Proposition</h2>
      <p style={{ fontSize: 15, lineHeight: 1.75, marginBottom: 24, color: 'var(--ink-soft)' }}>
        Repositionner Lumio comme « <strong style={{ color: 'var(--ink)' }}>l'expert de la santé invisible</strong> » — le stress chronique que les gens ressentent mais ne voient pas, que les médecins ne diagnostiquent pas faute d'outil, et que les DRH n'arrivent pas à objectiver pour leurs comités sociaux.
      </p>

      <div style={{ background: '#f4f2ee', padding: '18px 22px', borderRadius: 6, marginBottom: 22, fontFamily: 'var(--font-mono)', fontSize: 12, lineHeight: 1.9 }}>
        <div style={{ marginBottom: 10, fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink)' }}>Plateforme proposée</div>
        <div><span style={{ color: 'var(--ink-mute)' }}>Territoire&nbsp;&nbsp;&nbsp;</span> « La santé que les chiffres ne montrent pas encore »</div>
        <div><span style={{ color: 'var(--ink-mute)' }}>Promesse&nbsp;&nbsp;&nbsp;&nbsp;</span> Lumio révèle ce que le corps sait mais que la médecine ne capte pas</div>
        <div><span style={{ color: 'var(--ink-mute)' }}>Cibles B2B&nbsp;</span> DRH des ETI/grands comptes, prescripteurs (méd. travail, mutuelles)</div>
        <div><span style={{ color: 'var(--ink-mute)' }}>Cibles B2C&nbsp;</span> actifs 30-50 ans, urbains, charge mentale élevée</div>
        <div><span style={{ color: 'var(--ink-mute)' }}>Personnalité</span> scientifique sans être froide · rassurante sans condescendance</div>
        <div><span style={{ color: 'var(--ink-mute)' }}>Engagements</span> 100 % données anonymisées · jamais revendues</div>
      </div>

      <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 8 }}>Conditions de réussite</h2>
      <p style={{ fontSize: 15, lineHeight: 1.75, marginBottom: 18, color: 'var(--ink-soft)' }}>
        Ce repositionnement suppose impérativement que la <strong>certification MDR classe IIa</strong> soit obtenue avant le lancement grand public. <em style={{ background: '#fff8d8', padding: '1px 4px' }}>Sans certification, le territoire « expert santé » est intenable</em> et nous expose à des attaques juridiques de la part des concurrents certifiés.
      </p>
      <p style={{ fontSize: 15, lineHeight: 1.75, marginBottom: 18, color: 'var(--ink-soft)' }}>
        J'ai besoin d'un engagement de Théo sur le calendrier MDR avant fin juin pour pouvoir lancer les travaux créatifs.
      </p>

      <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 8 }}>Budget</h2>
      <p style={{ fontSize: 15, lineHeight: 1.75, marginBottom: 24, color: 'var(--ink-soft)' }}>
        Déploiement 12 mois : <strong>380 000 €</strong> (créa, prod, médias B2B, événementiel). Phase B2C ultérieure : à chiffrer en fonction de la date MDR.
      </p>

      <div style={{ borderTop: '1px solid var(--rule)', paddingTop: 18, fontStyle: 'italic', color: 'var(--ink-mute)', fontSize: 14 }}>
        Cette note est un point de départ, pas un livrable. J'attends vos retours en CODIR du 18 juin.<br/><br/>
        <span style={{ fontFamily: 'var(--font-display)' }}>Sonia</span>
      </div>
    </div>
  );
}

const notesStyles = {
  app: { display: 'flex', height: '100%', background: 'white', overflow: 'hidden' },
  sidebar: { width: 240, flexShrink: 0, borderRight: '1px solid var(--rule)', background: '#fafaf8', overflowY: 'auto' },
  row: { padding: '10px 16px', borderBottom: '1px solid var(--rule)', cursor: 'pointer' },
  rowActive: { background: 'rgba(224,181,58,0.18)', borderLeft: '3px solid #e0b53a', paddingLeft: 13 },
  editor: { flex: 1, background: 'white', overflowY: 'auto', minHeight: 0 }
};

window.LUMIO_APPS = window.LUMIO_APPS || {};
window.LUMIO_APPS.notes = NotesApp;
