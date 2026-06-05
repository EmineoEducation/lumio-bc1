// ══════════════════════════════════════════════════════════════
//  ICONS — vector icons for desktop, dock, finder
// ══════════════════════════════════════════════════════════════

window.MailIcon = ({ size = 56 }) => (
  <svg width={size} height={size} viewBox="0 0 56 56">
    <defs>
      <linearGradient id="mailG" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#7fc6ff"/>
        <stop offset="1" stopColor="#1f7ad9"/>
      </linearGradient>
    </defs>
    <rect x="3" y="10" width="50" height="36" rx="8" fill="url(#mailG)"/>
    <path d="M5 14 L28 32 L51 14" fill="none" stroke="white" strokeWidth="2.5" strokeLinejoin="round" opacity="0.95"/>
  </svg>
);

window.BrowserIcon = ({ size = 56 }) => (
  <svg width={size} height={size} viewBox="0 0 56 56">
    <circle cx="28" cy="28" r="23" fill="#1c89e8"/>
    <path d="M5 28 H51 M28 5 C36 12 36 44 28 51 M28 5 C20 12 20 44 28 51" stroke="white" strokeWidth="1.5" fill="none" opacity="0.85"/>
    <circle cx="28" cy="28" r="23" fill="none" stroke="white" strokeWidth="1.5" opacity="0.6"/>
    <path d="M14 16 L36 22 L30 38 L18 30 Z" fill="#ff5b3a" opacity="0.92"/>
    <path d="M30 38 L36 22 L40 30 Z" fill="white" opacity="0.85"/>
  </svg>
);

window.PdfIcon = ({ size = 56 }) => (
  <svg width={size} height={size} viewBox="0 0 56 56">
    <rect x="10" y="6" width="36" height="44" rx="3" fill="white" stroke="#1a2436" strokeWidth="1.5"/>
    <path d="M40 6 V14 H46" fill="none" stroke="#1a2436" strokeWidth="1.5"/>
    <path d="M14 22 H38 M14 28 H38 M14 34 H30" stroke="#9a9ea8" strokeWidth="1.2"/>
    <rect x="22" y="38" width="22" height="10" rx="2" fill="#c4420f"/>
    <text x="33" y="46" textAnchor="middle" fill="white" fontSize="7" fontWeight="700" fontFamily="sans-serif">PDF</text>
  </svg>
);

window.VoiceIcon = ({ size = 56 }) => (
  <svg width={size} height={size} viewBox="0 0 56 56">
    <rect x="4" y="4" width="48" height="48" rx="11" fill="#1a2436"/>
    <rect x="22" y="14" width="12" height="20" rx="6" fill="#c4420f"/>
    <path d="M18 28 V32 C18 38 22 42 28 42 C34 42 38 38 38 32 V28" stroke="#c4420f" strokeWidth="2" fill="none" strokeLinecap="round"/>
    <line x1="28" y1="42" x2="28" y2="48" stroke="#c4420f" strokeWidth="2"/>
  </svg>
);

window.NotesIcon = ({ size = 56 }) => (
  <svg width={size} height={size} viewBox="0 0 56 56">
    <rect x="6" y="6" width="44" height="44" rx="6" fill="#fff6c8"/>
    <rect x="6" y="6" width="44" height="9" fill="#e0b53a"/>
    <line x1="12" y1="22" x2="44" y2="22" stroke="#c89e2c" strokeWidth="0.8"/>
    <line x1="12" y1="28" x2="44" y2="28" stroke="#c89e2c" strokeWidth="0.8"/>
    <line x1="12" y1="34" x2="44" y2="34" stroke="#c89e2c" strokeWidth="0.8"/>
    <line x1="12" y1="40" x2="38" y2="40" stroke="#c89e2c" strokeWidth="0.8"/>
  </svg>
);

window.NotepadIcon = ({ size = 56 }) => (
  <svg width={size} height={size} viewBox="0 0 56 56">
    <rect x="6" y="8" width="44" height="44" rx="3" fill="#fffbef" stroke="#1a2436" strokeWidth="1.5"/>
    <line x1="6" y1="20" x2="50" y2="20" stroke="#c4420f" strokeWidth="1.5"/>
    <line x1="14" y1="8" x2="14" y2="52" stroke="#c4420f" strokeWidth="0.5" opacity="0.5"/>
    <line x1="12" y1="28" x2="44" y2="28" stroke="#9a9ea8" strokeWidth="0.6"/>
    <line x1="12" y1="34" x2="44" y2="34" stroke="#9a9ea8" strokeWidth="0.6"/>
    <line x1="12" y1="40" x2="36" y2="40" stroke="#9a9ea8" strokeWidth="0.6"/>
  </svg>
);

window.SlackIcon = ({ size = 56 }) => (
  <svg width={size} height={size} viewBox="0 0 56 56">
    <rect x="4" y="4" width="48" height="48" rx="11" fill="white"/>
    <rect x="14" y="22" width="6" height="14" rx="3" fill="#e01e5a"/>
    <rect x="14" y="22" width="14" height="6" rx="3" fill="#36c5f0"/>
    <rect x="22" y="14" width="6" height="14" rx="3" fill="#2eb67d"/>
    <rect x="22" y="22" width="14" height="6" rx="3" fill="#ecb22e" transform="rotate(90 29 25)"/>
    <rect x="36" y="20" width="6" height="14" rx="3" fill="#36c5f0"/>
    <rect x="28" y="28" width="14" height="6" rx="3" fill="#e01e5a"/>
    <rect x="28" y="36" width="6" height="14" rx="3" fill="#ecb22e"/>
    <rect x="20" y="36" width="14" height="6" rx="3" fill="#2eb67d"/>
  </svg>
);

window.FinderIcon = ({ size = 56 }) => (
  <svg width={size} height={size} viewBox="0 0 56 56">
    <rect x="4" y="4" width="48" height="48" rx="11" fill="url(#finderG)"/>
    <defs>
      <linearGradient id="finderG" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#7fbef0"/>
        <stop offset="1" stopColor="#3a7bd5"/>
      </linearGradient>
    </defs>
    <ellipse cx="22" cy="26" rx="3" ry="6" fill="white"/>
    <ellipse cx="34" cy="26" rx="3" ry="6" fill="white"/>
    <path d="M20 36 Q28 42 36 36" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/>
  </svg>
);

window.CalendarIcon = ({ size = 56 }) => (
  <svg width={size} height={size} viewBox="0 0 56 56">
    <rect x="4" y="6" width="48" height="46" rx="6" fill="white" stroke="#1a2436" strokeWidth="1.5"/>
    <rect x="4" y="6" width="48" height="14" rx="6" fill="#c4420f"/>
    <rect x="4" y="14" width="48" height="6" fill="#c4420f"/>
    <text x="28" y="40" textAnchor="middle" fill="#1a2436" fontSize="20" fontWeight="700" fontFamily="sans-serif">30</text>
    <text x="28" y="48" textAnchor="middle" fill="#c4420f" fontSize="6" fontWeight="600" fontFamily="sans-serif" letterSpacing="0.1em">SEPT</text>
  </svg>
);

window.TrashIcon = ({ size = 56 }) => (
  <svg width={size} height={size} viewBox="0 0 56 56">
    <rect x="14" y="20" width="28" height="28" rx="3" fill="#e8eaee" stroke="#9a9ea8" strokeWidth="1.5"/>
    <rect x="10" y="16" width="36" height="6" rx="2" fill="#e8eaee" stroke="#9a9ea8" strokeWidth="1.5"/>
    <rect x="22" y="12" width="12" height="6" rx="2" fill="white" stroke="#9a9ea8" strokeWidth="1.5"/>
    <line x1="22" y1="28" x2="22" y2="42" stroke="#9a9ea8" strokeWidth="1.5"/>
    <line x1="28" y1="28" x2="28" y2="42" stroke="#9a9ea8" strokeWidth="1.5"/>
    <line x1="34" y1="28" x2="34" y2="42" stroke="#9a9ea8" strokeWidth="1.5"/>
  </svg>
);

window.FolderIcon = ({ size = 56 }) => (
  <svg width={size} height={size} viewBox="0 0 56 56">
    <path d="M6 18 Q6 14 10 14 H22 L26 18 H46 Q50 18 50 22 V44 Q50 48 46 48 H10 Q6 48 6 44 Z" fill="#7fbbe8"/>
    <path d="M6 22 H50 V44 Q50 48 46 48 H10 Q6 48 6 44 Z" fill="#5a98d0"/>
  </svg>
);

window.FileIcon = ({ size = 56, kind = 'doc', label = '' }) => {
  const colors = {
    pdf: '#c4420f',
    mail: '#1f7ad9',
    audio: '#1a2436',
    doc: '#5b6b85'
  };
  return (
    <svg width={size} height={size} viewBox="0 0 56 56">
      <path d="M12 6 H38 L46 14 V48 Q46 50 44 50 H12 Q10 50 10 48 V8 Q10 6 12 6 Z" fill="white" stroke="#9a9ea8" strokeWidth="1"/>
      <path d="M38 6 V14 H46" fill="#e8eaee" stroke="#9a9ea8" strokeWidth="1"/>
      <rect x="14" y="34" width="24" height="10" rx="1.5" fill={colors[kind] || colors.doc}/>
      <text x="26" y="42" textAnchor="middle" fill="white" fontSize="6.5" fontWeight="700" fontFamily="sans-serif" letterSpacing="0.05em">{label}</text>
      {kind !== 'audio' && <>
        <line x1="14" y1="20" x2="34" y2="20" stroke="#cdd0d6" strokeWidth="1"/>
        <line x1="14" y1="24" x2="34" y2="24" stroke="#cdd0d6" strokeWidth="1"/>
        <line x1="14" y1="28" x2="28" y2="28" stroke="#cdd0d6" strokeWidth="1"/>
      </>}
      {kind === 'audio' && (
        <g transform="translate(20 16)">
          <rect x="4" y="2" width="6" height="10" rx="3" fill={colors.audio}/>
          <path d="M2 10 V12 C2 16 4 18 7 18 C10 18 12 16 12 12 V10" stroke={colors.audio} strokeWidth="1.5" fill="none"/>
        </g>
      )}
    </svg>
  );
};


// ── LivrableIcon ──
window.LivrableIcon = function LivrableIcon({ size = 50 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="52" height="52" rx="12" fill="url(#lg_liv)"/>
      <defs>
        <linearGradient id="lg_liv" x1="0" y1="0" x2="52" y2="52">
          <stop offset="0%" stopColor="#1a6641"/>
          <stop offset="100%" stopColor="#0e4a2e"/>
        </linearGradient>
      </defs>
      <rect x="12" y="10" width="28" height="34" rx="3" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.25)" strokeWidth="1"/>
      <line x1="17" y1="19" x2="35" y2="19" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5"/>
      <line x1="17" y1="24" x2="35" y2="24" stroke="rgba(255,255,255,0.35)" strokeWidth="1"/>
      <line x1="17" y1="29" x2="29" y2="29" stroke="rgba(255,255,255,0.35)" strokeWidth="1"/>
      <circle cx="36" cy="37" r="8" fill="#34c84a"/>
      <path d="M32 37 L35 40 L40 34" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
};


// ══════════════════════════════════════════════════════════════

// ── JeffersonIcon — lapin à montre, compagnon PAC ──
window.JeffersonIcon = function JeffersonIcon({ size = 50, state = 'idle' }) {
  const earColor = '#F4C0D1';
  const bodyFill = state === 'alert' ? '#FFF8F0' : state === 'talking' ? '#F0F8FF' : 'white';
  const eyeY = state === 'alert' ? 30 : 32;
  const browVisible = state === 'alert';
  return (
    React.createElement('svg', { width: size, height: size, viewBox: '0 0 52 52', fill: 'none', xmlns: 'http://www.w3.org/2000/svg' },
      React.createElement('rect', { width: 52, height: 52, rx: 12, fill: state === 'alert' ? '#FEF3E2' : state === 'talking' ? '#E8F5FF' : '#F5F3EF' }),
      React.createElement('ellipse', { cx: 17, cy: 14, rx: 5, ry: 13, fill: 'white', stroke: '#D3D1C7', strokeWidth: 0.8 }),
      React.createElement('ellipse', { cx: 17, cy: 15, rx: 3, ry: 9, fill: earColor }),
      React.createElement('ellipse', { cx: 35, cy: 14, rx: 5, ry: 13, fill: 'white', stroke: '#D3D1C7', strokeWidth: 0.8 }),
      React.createElement('ellipse', { cx: 35, cy: 15, rx: 3, ry: 9, fill: earColor }),
      React.createElement('ellipse', { cx: 26, cy: 34, rx: 15, ry: 13, fill: bodyFill, stroke: '#D3D1C7', strokeWidth: 0.8 }),
      browVisible && React.createElement('path', { d: 'M19 27 Q22 25 25 27', stroke: '#B4A090', strokeWidth: 1.2, strokeLinecap: 'round', fill: 'none' }),
      browVisible && React.createElement('path', { d: 'M27 27 Q30 25 33 27', stroke: '#B4A090', strokeWidth: 1.2, strokeLinecap: 'round', fill: 'none' }),
      React.createElement('ellipse', { cx: 21, cy: eyeY, rx: 3, ry: state === 'alert' ? 2.5 : 3, fill: 'white', stroke: '#D3D1C7', strokeWidth: 0.5 }),
      React.createElement('ellipse', { cx: 31, cy: eyeY, rx: 3, ry: state === 'alert' ? 2.5 : 3, fill: 'white', stroke: '#D3D1C7', strokeWidth: 0.5 }),
      React.createElement('circle', { cx: 22, cy: eyeY + 0.5, r: 2, fill: '#2C2C2A' }),
      React.createElement('circle', { cx: 32, cy: eyeY + 0.5, r: 2, fill: '#2C2C2A' }),
      React.createElement('circle', { cx: 23, cy: eyeY - 0.5, r: 0.7, fill: 'white' }),
      React.createElement('circle', { cx: 33, cy: eyeY - 0.5, r: 0.7, fill: 'white' }),
      React.createElement('ellipse', { cx: 26, cy: eyeY + 6, rx: 2.5, ry: 1.8, fill: '#F4C0D1' }),
      React.createElement('ellipse', { cx: 16, cy: eyeY + 5, rx: 3, ry: 2, fill: '#F4C0D1', opacity: 0.3 }),
      React.createElement('ellipse', { cx: 36, cy: eyeY + 5, rx: 3, ry: 2, fill: '#F4C0D1', opacity: 0.3 }),
      React.createElement('line', { x1: 10, y1: eyeY + 4, x2: 22, y2: eyeY + 5.5, stroke: '#D3D1C7', strokeWidth: 0.6 }),
      React.createElement('line', { x1: 10, y1: eyeY + 7, x2: 22, y2: eyeY + 7, stroke: '#D3D1C7', strokeWidth: 0.6 }),
      React.createElement('line', { x1: 30, y1: eyeY + 5.5, x2: 42, y2: eyeY + 4, stroke: '#D3D1C7', strokeWidth: 0.6 }),
      React.createElement('line', { x1: 30, y1: eyeY + 7, x2: 42, y2: eyeY + 7, stroke: '#D3D1C7', strokeWidth: 0.6 }),
      state === 'talking'
        ? React.createElement('ellipse', { cx: 26, cy: eyeY + 10, rx: 3, ry: 2, fill: 'none', stroke: '#B4B2A9', strokeWidth: 1 })
        : state === 'alert'
        ? React.createElement('ellipse', { cx: 26, cy: eyeY + 10, rx: 2, ry: 1.5, fill: 'none', stroke: '#B4B2A9', strokeWidth: 1 })
        : React.createElement('path', { d: `M22 ${eyeY + 10} Q26 ${eyeY + 13} 30 ${eyeY + 10}`, fill: 'none', stroke: '#B4B2A9', strokeWidth: 1, strokeLinecap: 'round' }),
      React.createElement('circle', { cx: 40, cy: 40, r: 7, fill: '#2C2C2A' }),
      React.createElement('circle', { cx: 40, cy: 40, r: 5, fill: 'white', stroke: '#D3D1C7', strokeWidth: 0.5 }),
      React.createElement('line', { x1: 40, y1: 40, x2: 40, y2: 36.5, stroke: '#2C2C2A', strokeWidth: 1.2, strokeLinecap: 'round' }),
      React.createElement('line', { x1: 40, y1: 40, x2: 43, y2: 41.5, stroke: state === 'alert' ? '#E24B4A' : '#2C2C2A', strokeWidth: 1.2, strokeLinecap: 'round' }),
      React.createElement('circle', { cx: 40, cy: 40, r: 0.8, fill: '#2C2C2A' }),
      React.createElement('path', { d: 'M40 33.5 Q42 31 44 30', fill: 'none', stroke: '#D3D1C7', strokeWidth: 0.8, strokeLinecap: 'round' })
    )
  );
};

// ── JeffersonAvatar — lapin universitaire (lunettes · nœud pap · toque · montre) ──
//    Inspiré de la charte visuelle PAC. 3 états : idle / talking / alert.
window.JeffersonAvatar = function JeffersonAvatar({ size = 50, state = 'idle' }) {
  const ear = '#F4C0D1';
  const fur = state === 'alert' ? '#FFFDF8' : 'white';
  const jacket = '#2F5D3A';      // tweed vert
  const jacketDk = '#244A2E';
  const bow = '#7A2E3B';         // nœud pap bordeaux
  const gold = '#C9A24B';        // montre / accents
  const eyeY = state === 'alert' ? 29 : 30;
  const C = React.createElement;
  return C('svg', { width: size, height: size, viewBox: '0 0 64 64', fill: 'none', xmlns: 'http://www.w3.org/2000/svg' },
    // halo de fond
    C('circle', { cx: 32, cy: 32, r: 32, fill: state === 'alert' ? '#FEF3E2' : state === 'talking' ? '#E8F7EE' : '#EAF6F0' }),
    C('circle', { cx: 32, cy: 32, r: 30, fill: 'none', stroke: 'rgba(93,226,152,0.35)', strokeWidth: 1 }),
    // oreilles
    C('ellipse', { cx: 22, cy: 13, rx: 4.5, ry: 12, fill: fur, stroke: '#E2D9CF', strokeWidth: 0.8, transform: 'rotate(-8 22 13)' }),
    C('ellipse', { cx: 22, cy: 14, rx: 2.2, ry: 8, fill: ear, transform: 'rotate(-8 22 14)' }),
    C('ellipse', { cx: 42, cy: 13, rx: 4.5, ry: 12, fill: fur, stroke: '#E2D9CF', strokeWidth: 0.8, transform: 'rotate(8 42 13)' }),
    C('ellipse', { cx: 42, cy: 14, rx: 2.2, ry: 8, fill: ear, transform: 'rotate(8 42 14)' }),
    // toque
    C('path', { d: 'M20 12 L32 7 L44 12 L32 17 Z', fill: jacketDk }),
    C('rect', { x: 28.5, y: 12.5, width: 7, height: 4, rx: 1, fill: jacketDk }),
    C('line', { x1: 44, y1: 12, x2: 47, y2: 20, stroke: gold, strokeWidth: 1, strokeLinecap: 'round' }),
    C('circle', { cx: 47, cy: 21, r: 1.4, fill: gold }),
    // tête
    C('ellipse', { cx: 32, cy: 30, rx: 14, ry: 12.5, fill: fur, stroke: '#E2D9CF', strokeWidth: 0.8 }),
    // lunettes
    C('circle', { cx: 26, cy: eyeY, r: 4.4, fill: 'rgba(255,255,255,0.5)', stroke: '#3A3A38', strokeWidth: 1.1 }),
    C('circle', { cx: 38, cy: eyeY, r: 4.4, fill: 'rgba(255,255,255,0.5)', stroke: '#3A3A38', strokeWidth: 1.1 }),
    C('line', { x1: 30.4, y1: eyeY, x2: 33.6, y2: eyeY, stroke: '#3A3A38', strokeWidth: 1.1 }),
    // yeux
    C('circle', { cx: 26, cy: eyeY + 0.3, r: 1.9, fill: '#2C2C2A' }),
    C('circle', { cx: 38, cy: eyeY + 0.3, r: 1.9, fill: '#2C2C2A' }),
    C('circle', { cx: 26.7, cy: eyeY - 0.4, r: 0.6, fill: 'white' }),
    C('circle', { cx: 38.7, cy: eyeY - 0.4, r: 0.6, fill: 'white' }),
    // sourcils alerte
    state === 'alert' && C('path', { d: 'M22 24 Q26 22 30 24', stroke: '#B4A090', strokeWidth: 1.2, strokeLinecap: 'round', fill: 'none' }),
    state === 'alert' && C('path', { d: 'M34 24 Q38 22 42 24', stroke: '#B4A090', strokeWidth: 1.2, strokeLinecap: 'round', fill: 'none' }),
    // museau + nez
    C('ellipse', { cx: 32, cy: eyeY + 6, rx: 2.6, ry: 1.9, fill: ear }),
    // bouche selon état
    state === 'talking'
      ? C('ellipse', { cx: 32, cy: eyeY + 10, rx: 2.4, ry: 1.8, fill: '#7A4A52' })
      : state === 'alert'
      ? C('ellipse', { cx: 32, cy: eyeY + 9.5, rx: 1.6, ry: 1.3, fill: 'none', stroke: '#9A6A72', strokeWidth: 1 })
      : C('path', { d: `M28 ${eyeY + 9} Q32 ${eyeY + 12} 36 ${eyeY + 9}`, fill: 'none', stroke: '#9A6A72', strokeWidth: 1.1, strokeLinecap: 'round' }),
    // moustaches
    C('line', { x1: 16, y1: eyeY + 5, x2: 28, y2: eyeY + 6.5, stroke: '#E2D9CF', strokeWidth: 0.6 }),
    C('line', { x1: 16, y1: eyeY + 8, x2: 28, y2: eyeY + 8, stroke: '#E2D9CF', strokeWidth: 0.6 }),
    C('line', { x1: 36, y1: eyeY + 6.5, x2: 48, y2: eyeY + 5, stroke: '#E2D9CF', strokeWidth: 0.6 }),
    C('line', { x1: 36, y1: eyeY + 8, x2: 48, y2: eyeY + 8, stroke: '#E2D9CF', strokeWidth: 0.6 }),
    // épaules / veste tweed
    C('path', { d: 'M18 64 Q18 48 32 47 Q46 48 46 64 Z', fill: jacket }),
    C('path', { d: 'M32 47 L27 64 L32 56 L37 64 Z', fill: '#EDE7D8' }),  // chemise / gilet
    C('path', { d: 'M32 47 L26 53 L32 51 L38 53 Z', fill: jacketDk }),   // revers
    // nœud papillon
    C('path', { d: 'M32 50 L27 47.5 L27 52.5 Z', fill: bow }),
    C('path', { d: 'M32 50 L37 47.5 L37 52.5 Z', fill: bow }),
    C('circle', { cx: 32, cy: 50, r: 1.3, fill: '#5C222C' }),
    // montre à gousset (chaîne dorée)
    C('path', { d: 'M37 53 Q42 56 41 61', stroke: gold, strokeWidth: 1, fill: 'none', strokeLinecap: 'round' }),
    C('circle', { cx: 41, cy: 61, r: 3, fill: '#FFFDF8', stroke: gold, strokeWidth: 1 }),
    C('line', { x1: 41, y1: 61, x2: 41, y2: 59.3, stroke: '#2C2C2A', strokeWidth: 0.9, strokeLinecap: 'round' }),
    C('line', { x1: 41, y1: 61, x2: 42.4, y2: 61.7, stroke: state === 'alert' ? '#E24B4A' : '#2C2C2A', strokeWidth: 0.9, strokeLinecap: 'round' })
  );
};

