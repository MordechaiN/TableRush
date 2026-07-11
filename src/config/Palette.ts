// ── Table Rush · "Candy Diner" color system ──────────────────────────────────
// One documented palette drives the 3D materials, the canvas textures and the
// DOM UI. High-key, saturated, family-friendly: mint sky, cream rooms, coral
// and strawberry accents, chocolate line-work. If a color isn't in here, it
// doesn't belong in the game.
//
// Numbers are for Three.js materials; matching strings for canvas/CSS.

export const P = {
  // World
  skyTop: 0x8FDCC8,        skyTopCss: '#8FDCC8',        // mint sky
  skyBottom: 0xFFF3D8,     skyBottomCss: '#FFF3D8',     // cream horizon
  platformSide: 0xE8955C,  platformSideCss: '#E8955C',  // caramel diorama edge
  platformRim: 0xFFE2AE,   platformRimCss: '#FFE2AE',   // rim highlight

  // Floors (zones read by color)
  woodLight: 0xF9D79A,     woodLightCss: '#F9D79A',     // dining planks
  woodSeam: 0xD9A15E,      woodSeamCss: '#D9A15E',
  tileA: 0xE4F6EF,         tileACss: '#E4F6EF',         // kitchen checker
  tileB: 0xFFFFFF,         tileBCss: '#FFFFFF',
  pathStone: 0xFFEFD2,     pathStoneCss: '#FFEFD2',     // entrance path

  // Architecture
  wallCream: 0xFFF6E4,     wallCreamCss: '#FFF6E4',
  wallCoral: 0xFF8B75,     wallCoralCss: '#FF8B75',     // base/wainscot band
  woodDark: 0xB4713C,      woodDarkCss: '#B4713C',      // frames, furniture legs
  awningRed: 0xF2505A,     awningRedCss: '#F2505A',     // scalloped awning stripe
  awningCream: 0xFFF8EC,   awningCreamCss: '#FFF8EC',

  // Brand / UI
  primary: 0xFF8A3D,       primaryCss: '#FF8A3D',       // main buttons, energy
  primaryDeep: 0xE8632A,   primaryDeepCss: '#E8632A',
  secondary: 0x58C96B,     secondaryCss: '#58C96B',     // success, go, seat-here
  secondaryDeep: 0x3AA34E, secondaryDeepCss: '#3AA34E',
  accentGold: 0xFFC838,    accentGoldCss: '#FFC838',    // coins, stars, check
  danger: 0xF2505A,        dangerCss: '#F2505A',        // urgency, walkouts
  combo: 0x9B6FE8,         comboCss: '#9B6FE8',         // chain celebrations
  tutorial: 0x4EB8D5,      tutorialCss: '#4EB8D5',      // hints, dirty-table ring
  ink: 0x5A3A2E,           inkCss: '#5A3A2E',           // chocolate text/lines
  inkSoft: 0x8A6A52,       inkSoftCss: '#8A6A52',
  cardCream: 0xFFF8EC,     cardCreamCss: '#FFF8EC',     // UI cards

  // Characters
  skinTones: [0xFFD9B8, 0xF2BE94, 0xE8A876, 0xFFCDA8, 0xF7C9A2, 0xD99A66, 0xFFDCC0],
  blush: 0xFF9E9E,         hairBrown: 0x6E4A2E, hairDark: 0x3A2A22,
} as const;
