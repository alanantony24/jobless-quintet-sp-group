// ─── Palette ──────────────────────────────────────────────────────────────────
export const COLORS = {
  // Brand
  primary:       '#005596',
  primaryDark:   '#003F6E',
  primaryMid:    '#1565C0',
  primaryLight:  'rgba(0, 85, 150, 0.12)',

  // GreenPoints
  green:         '#4CAF50',
  greenDark:     '#2E7D32',
  greenMid:      '#66BB6A',
  greenLight:    '#E8F5E9',
  greenPale:     '#F1F8E9',

  // Backgrounds
  background:    '#F5F7FA',
  card:          '#FFFFFF',
  cardAlt:       '#FAFBFD',

  // Text
  text:          '#1A1A2E',
  textSub:       '#4B5563',
  textMuted:     '#9CA3AF',
  white:         '#FFFFFF',

  // Semantic
  warning:       '#FFF9C4',
  warningBorder: '#F9A825',
  warningText:   '#E65100',
  error:         '#EF4444',
  errorLight:    '#FFEBEE',
  success:       '#4CAF50',
  successLight:  '#E8F5E9',

  // Accent
  orange:        '#FF7043',
  orangeLight:   '#FFF3E0',
  gold:          '#FFB300',
  goldLight:     '#FFF8E1',
  purple:        '#7C3AED',
  purpleLight:   '#EDE9FE',
  teal:          '#009688',
  tealLight:     '#E0F2F1',

  // Utility
  border:        '#E5E7EB',
  borderLight:   '#F3F4F6',
  overlay:       'rgba(0, 0, 0, 0.50)',
  overlayLight:  'rgba(0, 0, 0, 0.15)',
};

// ─── Border Radius ────────────────────────────────────────────────────────────
export const RADIUS = {
  xs:   6,
  sm:   10,
  md:   12,
  lg:   15,   // ← primary card radius per spec
  xl:   20,
  xxl:  28,
  full: 999,
};

// ─── Elevation / Shadows ──────────────────────────────────────────────────────
export const SHADOWS = {
  xs: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.09,
    shadowRadius: 10,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.13,
    shadowRadius: 16,
    elevation: 8,
  },
};

// ─── Spacing Scale ────────────────────────────────────────────────────────────
export const SPACING = {
  xs:   4,
  sm:   8,
  md:   12,
  base: 16,
  lg:   20,
  xl:   24,
  xxl:  32,
  xxxl: 48,
};

// ─── Typography ───────────────────────────────────────────────────────────────
export const TYPOGRAPHY = {
  h1:          { fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
  h2:          { fontSize: 20, fontWeight: '700', letterSpacing: -0.3 },
  h3:          { fontSize: 17, fontWeight: '700' },
  h4:          { fontSize: 15, fontWeight: '600' },
  body:        { fontSize: 14, fontWeight: '400', lineHeight: 20 },
  bodyMd:      { fontSize: 14, fontWeight: '500' },
  bodySm:      { fontSize: 13, fontWeight: '400', lineHeight: 18 },
  caption:     { fontSize: 12, fontWeight: '400' },
  captionBold: { fontSize: 12, fontWeight: '600' },
  micro:       { fontSize: 10, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase' },
};

// ─── Gamification Levels ──────────────────────────────────────────────────────
export const GP_LEVELS = [
  { level: 1, title: 'Energy Seedling',   min: 0,    max: 200,  color: '#8BC34A', icon: '🌱' },
  { level: 2, title: 'Energy Apprentice', min: 200,  max: 500,  color: '#4CAF50', icon: '🌿' },
  { level: 3, title: 'Energy Guardian',   min: 500,  max: 1000, color: '#009688', icon: '🌳' },
  { level: 4, title: 'Eco Champion',      min: 1000, max: 2000, color: '#005596', icon: '⚡' },
  { level: 5, title: 'Green Master',      min: 2000, max: 2000, color: '#FFB300', icon: '🌍' },
];

export const getLevel = (gp) => {
  for (const l of GP_LEVELS) {
    if (gp < l.max || l.level === 5) return l;
  }
  return GP_LEVELS[0];
};

export const getLevelProgress = (gp) => {
  const lvl = getLevel(gp);
  if (lvl.level === 5) return 1;
  return (gp - lvl.min) / (lvl.max - lvl.min);
};
