// ── Player preferences (persisted, all default ON) ───────────────────────────
// One tiny read-through store so the game, UI and audio agree on settings.

type PrefKey = 'sfx' | 'music' | 'haptics' | 'motion';

function get(key: PrefKey): boolean {
  try { return localStorage.getItem(`tablerush_${key}`) !== 'off'; } catch { return true; }
}
function set(key: PrefKey, on: boolean): void {
  try { localStorage.setItem(`tablerush_${key}`, on ? 'on' : 'off'); } catch { /* ignore */ }
}

export const Prefs = {
  get sfx() { return get('sfx'); },
  set sfx(v: boolean) { set('sfx', v); },
  get music() { return get('music'); },
  set music(v: boolean) { set('music', v); },
  get haptics() { return get('haptics'); },
  set haptics(v: boolean) { set('haptics', v); },
  /** false = the player asked for reduced motion (no camera sway / screen flashes). */
  get motion() { return get('motion'); },
  set motion(v: boolean) { set('motion', v); },
};
