import { fmtScore, UPGRADE_TRACKS, LEVELS } from '../config/GameConfig';
import { ProgressionSystem } from '../systems/ProgressionSystem';
import { SoundManager } from '../systems/SoundManager';
import { Prefs } from '../systems/Prefs';
import type { HudState, LevelResult } from './RestaurantGame';

// ── DOM UI: HUD, overlays, tap feedback, coin flight ──────────────────────────
// One design language: Baloo 2 display font, warm cream/brown palette, soft
// gold borders, chunky pill shapes. Every fixed element respects safe areas.

let cssDone = false;
function css() {
  if (cssDone) return; cssDone = true;
  const s = document.createElement('style'); s.textContent = `
  :root{
    --ui-ink:#5A3A2E; --ui-cream:#FFF8EC; --ui-gold:#FFC838; --ui-orange:#FF8A3D;
    --ui-red:#F2505A; --ui-green:#58C96B; --ui-combo:#9B6FE8;
  }
  .ui-pill{position:absolute;display:flex;align-items:center;gap:8px;background:var(--ui-cream);
    border:3px solid #fff;border-radius:20px;padding:8px 15px;color:var(--ui-ink);
    font-family:var(--font-display);font-weight:800;box-shadow:0 5px 0 rgba(90,58,46,.14),0 10px 20px rgba(90,58,46,.16)}
  #hud{position:fixed;inset:0;z-index:5;pointer-events:none}
  #hud .pointerable{pointer-events:auto}
  #h-score{top:calc(14px + var(--safe-top));left:calc(14px + var(--safe-left));font-size:22px}
  #h-score .ic{width:26px;height:26px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#FFE680,#FFC838 60%,#D89A12);box-shadow:inset 0 0 0 2px #D89A12;display:grid;place-items:center;color:#9A6500;font-size:13px}
  #h-score .v{color:#E8632A}
  #h-guests{top:calc(14px + var(--safe-top));right:calc(70px + var(--safe-right));font-size:19px}
  #h-chain{top:calc(66px + var(--safe-top));left:50%;transform:translateX(-50%);font-size:17px;color:#fff;background:var(--ui-combo);border-color:#E2D4FF;transition:transform .12s}
  #h-pause{top:calc(14px + var(--safe-top));right:calc(14px + var(--safe-right));width:46px;height:46px;padding:0;justify-content:center;font-size:17px;cursor:pointer}
  #h-goal{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(14px + var(--safe-bottom));width:min(78vw,420px);z-index:5;pointer-events:none}
  #h-goal .bar{height:18px;background:var(--ui-cream);border:3px solid #fff;border-radius:12px;position:relative;
    box-shadow:0 4px 0 rgba(90,58,46,.12),0 8px 16px rgba(90,58,46,.14)}
  #h-goal .fill{height:100%;width:0;border-radius:9px;background:linear-gradient(90deg,#FF8A3D,#FFC838);transition:width .3s}
  #h-goal .node{position:absolute;top:50%;transform:translate(-50%,-50%);width:30px;height:30px;border-radius:50%;
    background:#fff;border:3px solid #EADFCE;display:grid;place-items:center;font-size:14px;filter:grayscale(1) opacity(.75);transition:filter .3s,transform .2s}
  #h-goal .node.hit{filter:none;border-color:var(--ui-gold);animation:nodePop .45s cubic-bezier(.3,1.6,.6,1)}
  @keyframes nodePop{0%{transform:translate(-50%,-50%) scale(1)}55%{transform:translate(-50%,-50%) scale(1.5)}100%{transform:translate(-50%,-50%) scale(1)}}
  #h-goal .lbl{display:flex;justify-content:space-between;font-family:var(--font-display);font-weight:700;font-size:12px;color:var(--ui-ink);margin-top:5px;
    text-shadow:0 1px 0 rgba(255,255,255,.8)}
  #h-vignette{position:fixed;inset:0;z-index:4;pointer-events:none;opacity:0;transition:opacity .4s;
    box-shadow:inset 0 0 90px 30px rgba(242,80,90,.5)}
  #h-flash{position:fixed;inset:0;z-index:4;pointer-events:none;opacity:0;
    background:radial-gradient(120% 80% at 50% 45%,rgba(255,215,90,.0),rgba(255,200,60,.55));transition:opacity .4s ease}
  #h-announce{position:fixed;top:30%;left:50%;transform:translate(-50%,-50%) scale(0);z-index:6;
    font-family:var(--font-display);font-weight:800;font-size:38px;color:#FFC838;text-align:center;max-width:92vw;
    -webkit-text-stroke:6px #5A3A2E;paint-order:stroke fill;pointer-events:none;text-shadow:0 6px 16px rgba(90,58,46,.35)}
  #h-tut{position:fixed;bottom:calc(52px + var(--safe-bottom));left:50%;transform:translateX(-50%);z-index:6;max-width:88vw;text-align:center;
    background:var(--ui-cream);color:var(--ui-ink);font-family:var(--font-display);font-weight:700;font-size:16px;padding:13px 22px;border-radius:18px;border:3px solid #fff;
    box-shadow:0 5px 0 rgba(90,58,46,.14),0 10px 20px rgba(90,58,46,.18)}
  #h-hint{position:fixed;z-index:6;pointer-events:none;font-size:38px;transform:translate(-14px,6px);opacity:0;transition:opacity .25s,left .45s cubic-bezier(.35,1.2,.5,1),top .45s cubic-bezier(.35,1.2,.5,1);
    filter:drop-shadow(0 4px 6px rgba(0,0,0,.35));animation:hintBob 1s ease-in-out infinite}
  @keyframes hintBob{0%,100%{margin-top:0}50%{margin-top:10px}}
  @keyframes annPop{0%{transform:translate(-50%,-50%) scale(0)}60%{transform:translate(-50%,-50%) scale(1.18)}100%{transform:translate(-50%,-50%) scale(1)}}
  .fly-coin{position:fixed;z-index:7;width:22px;height:22px;border-radius:50%;pointer-events:none;
    background:radial-gradient(circle at 35% 30%,#FFE680,#FFC21E 60%,#C98A0E);box-shadow:inset 0 0 0 2px #C98A0E,0 2px 6px rgba(120,60,10,.4)}
  .tap-ripple{position:fixed;z-index:8;pointer-events:none;border-radius:50%;border:3px solid rgba(255,214,90,.9);
    width:14px;height:14px;transform:translate(-50%,-50%);animation:tapRip .38s ease-out forwards}
  .tap-ripple.miss{border-color:rgba(150,140,120,.55)}
  @keyframes tapRip{0%{opacity:.95;scale:.6}100%{opacity:0;scale:3.4}}

  .ov{position:fixed;inset:0;z-index:30;display:flex;align-items:center;justify-content:center;font-family:var(--font-display);
    padding:calc(10px + var(--safe-top)) 10px calc(10px + var(--safe-bottom));
    background:linear-gradient(180deg,rgba(143,220,200,.96),rgba(255,243,216,.97));transition:opacity .3s;}
  .ov.hide{opacity:0;pointer-events:none}
  .card{width:min(86vw,380px);max-height:100%;overflow-y:auto;background:var(--ui-cream);border:4px solid #fff;border-radius:30px;padding:26px 22px;text-align:center;
    box-shadow:0 10px 0 rgba(90,58,46,.12),0 26px 48px rgba(90,58,46,.28);position:relative}
  .card h1{color:#F2505A;font-size:30px;font-weight:800;-webkit-text-stroke:1px #fff;margin-bottom:4px}
  .stars{font-size:46px;letter-spacing:6px;margin:6px 0 2px;color:#FFC838}
  .stars span{display:inline-block;transform:scale(0)}
  .stars span.pop{animation:starPop .4s cubic-bezier(.3,1.6,.6,1) forwards}
  @keyframes starPop{0%{transform:scale(0) rotate(-40deg)}100%{transform:scale(1) rotate(0)}}
  .big{font-size:46px;font-weight:800;color:#F08A1E;margin:6px 0}
  .sub{color:#9A551F;font-size:14px;font-weight:700}
  .row2{display:flex;gap:12px;justify-content:center;margin:14px 0}
  .stat{background:rgba(255,210,122,.35);border-radius:14px;padding:8px 14px;color:#7a4516;font-size:13px;font-weight:700}
  .stat b{display:block;font-size:20px;color:#5A3A1E}
  .unlockbox{background:linear-gradient(90deg,rgba(255,210,122,.5),rgba(255,170,80,.35));border:2px solid rgba(244,160,60,.6);
    border-radius:14px;padding:10px 14px;margin:10px 0 2px;color:#7a4516;font-weight:700;font-size:13px}
  .btn{display:block;width:100%;height:56px;margin-top:12px;border:none;border-radius:18px;cursor:pointer;
    font-family:var(--font-display);font-weight:800;font-size:20px;color:#fff;letter-spacing:1px}
  .btn-p{background:linear-gradient(180deg,#FF8A3D,#F4671E);box-shadow:0 6px 0 #C24A12}
  .btn-s{background:linear-gradient(180deg,#5BBF4A,#3E9E33);box-shadow:0 6px 0 #2C7A24}
  .btn-g{background:linear-gradient(180deg,#C9A36A,#B08A50);box-shadow:0 6px 0 #8A6A3A}
  .btn:active{transform:translateY(4px);box-shadow:none}
  .credits-list{color:#7a4516;font-size:15px;font-weight:600;line-height:2;margin:14px 0}
  .wallet{display:inline-flex;align-items:center;gap:6px;background:rgba(255,210,122,.4);border:2px solid rgba(244,160,60,.5);
    border-radius:999px;padding:6px 16px;color:#7a4516;font-weight:700;font-size:16px;margin-bottom:8px}
  .shoprow{display:flex;align-items:center;gap:10px;background:rgba(255,210,122,.28);border-radius:16px;padding:12px 14px;margin:10px 0;text-align:left}
  .shoprow .ic2{font-size:28px}
  .shoprow .info{flex:1;min-width:0}
  .shoprow .nm{color:#5A3A1E;font-weight:800;font-size:15px}
  .shoprow .ds{color:#9A551F;font-size:11.5px;font-weight:700;margin-top:2px}
  .shoprow .pips{font-size:11px;letter-spacing:2px;color:#F08A1E;margin-top:3px}
  .buybtn{border:none;border-radius:12px;padding:10px 12px;min-width:78px;cursor:pointer;font-family:var(--font-display);font-weight:800;font-size:13px;color:#fff;
    background:linear-gradient(180deg,#FF8A3D,#F4671E);box-shadow:0 4px 0 #C24A12}
  .buybtn:active{transform:translateY(3px);box-shadow:0 1px 0 #C24A12}
  .buybtn:disabled{background:#C9B49A;box-shadow:0 4px 0 #A8937A;cursor:default;color:#F5EDE0}
  .buybtn.max{background:linear-gradient(180deg,#5BBF4A,#3E9E33);box-shadow:0 4px 0 #2C7A24}
  .toggle{display:flex;align-items:center;justify-content:space-between;background:rgba(255,210,122,.3);border-radius:14px;padding:13px 18px;margin:9px 0;color:#5A3A1E;font-weight:700;font-size:15px}
  .sw{width:54px;height:30px;border-radius:16px;background:#C9A36A;position:relative;cursor:pointer;transition:background .2s;flex:none}
  .sw.on{background:#5BBF4A}.sw i{position:absolute;top:3px;left:3px;width:24px;height:24px;border-radius:50%;background:#fff;transition:left .2s}.sw.on i{left:27px}
  .confetti{position:absolute;top:-6px;width:10px;height:14px;border-radius:3px;pointer-events:none;animation:confFall linear forwards}
  @keyframes confFall{0%{transform:translateY(0) rotate(0);opacity:1}100%{transform:translateY(480px) rotate(680deg);opacity:0}}
  `;
  document.head.appendChild(s);
}

const CHAIN_EMOJI: Record<string, string> = { seat: '🪑', order: '✍️', pickup: '🫱', deliver: '🍽️', collect: '💵', clean: '✨' };

export interface Hud {
  update: (h: HudState) => void;
  announce: (t: string, k: string) => void;
  flash: (kind: string) => void;
  coinFly: (x: number, y: number, n: number) => void;
  tapRipple: (x: number, y: number, hit: boolean) => void;
  hint: (x: number, y: number, visible: boolean) => void;
  destroy: () => void;
}

export function createHud(onPause: () => void): Hud {
  css();
  const el = document.createElement('div'); el.id = 'hud';
  el.innerHTML = `
    <div id="h-flash"></div>
    <div id="h-vignette"></div>
    <div class="ui-pill" id="h-score"><div class="ic">$</div><div class="v">0</div></div>
    <div class="ui-pill" id="h-chain" style="display:none"></div>
    <div class="ui-pill" id="h-guests">👥 0</div>
    <div class="ui-pill pointerable" id="h-pause">⏸</div>
    <div id="h-goal"><div class="bar"><div class="fill" id="hg-fill"></div><div class="node" id="hg-goal">⭐</div><div class="node" id="hg-expert">🌟</div></div>
      <div class="lbl"><span id="hg-l1">⭐ GOAL</span><span id="hg-l3">⭐⭐⭐</span></div></div>
    <div id="h-announce"></div>
    <div id="h-tut" style="display:none"></div>
    <div id="h-hint">👆</div>`;
  document.body.appendChild(el);
  const flashEl = el.querySelector('#h-flash') as HTMLElement;
  const vignette = el.querySelector('#h-vignette') as HTMLElement;
  const scorePill = el.querySelector('#h-score') as HTMLElement;
  const scoreV = el.querySelector('#h-score .v') as HTMLElement;
  const chainEl = el.querySelector('#h-chain') as HTMLElement;
  const guests = el.querySelector('#h-guests') as HTMLElement;
  const ann = el.querySelector('#h-announce') as HTMLElement;
  const tut = el.querySelector('#h-tut') as HTMLElement;
  const hintEl = el.querySelector('#h-hint') as HTMLElement;
  const fill = el.querySelector('#hg-fill') as HTMLElement;
  const markGoal = el.querySelector('#hg-goal') as HTMLElement;
  const markExpert = el.querySelector('#hg-expert') as HTMLElement;
  const lblGoal = el.querySelector('#hg-l1') as HTMLElement;
  const pauseBtn = el.querySelector('#h-pause') as HTMLElement;
  pauseBtn.onclick = () => { try { SoundManager.uiClick(); } catch { /* */ } onPause(); };

  let lastScore = -1, lastChain = -1, lastGuests = -1, lastUrgent = false, tutTimer = 0, goalHit = false, expertHit = false;
  const motion = () => Prefs.motion;
  return {
    update: (h) => {
      if (h.score !== lastScore) {
        scoreV.textContent = fmtScore(h.score);
        scoreV.style.transform = 'scale(1.3)';
        setTimeout(() => scoreV.style.transform = 'scale(1)', 110);
        lastScore = h.score;
        // goal progress (scaled to the expert score)
        const span = Math.max(1, h.expert);
        fill.style.width = Math.min(100, (h.score / span) * 100) + '%';
        markGoal.style.left = Math.min(96, (h.goal / span) * 100) + '%';
        markExpert.style.left = '97%';
        lblGoal.textContent = `⭐ $${fmtScore(h.goal)}`;
        if (!goalHit && h.score >= h.goal) {
          goalHit = true;
          markGoal.classList.add('hit');
          fill.style.background = 'linear-gradient(90deg,#58C96B,#9BE39B)';
        }
        if (!expertHit && h.score >= h.expert) {
          expertHit = true;
          markExpert.classList.add('hit');
        }
      }
      if (h.guestsLeft !== lastGuests) { guests.textContent = `👥 ${h.guestsLeft}`; lastGuests = h.guestsLeft; }
      if (h.urgent !== lastUrgent) { vignette.style.opacity = h.urgent ? '1' : '0'; lastUrgent = h.urgent; }
      if (h.chain !== lastChain) {
        if (h.chain >= 2) {
          chainEl.style.display = '';
          chainEl.textContent = `${CHAIN_EMOJI[h.chainKind] ?? '🔗'} CHAIN ×${h.chain}`;
          chainEl.style.transform = 'translateX(-50%) scale(1.25)';
          setTimeout(() => chainEl.style.transform = 'translateX(-50%) scale(1)', 130);
        } else chainEl.style.display = 'none';
        lastChain = h.chain;
      }
    },
    flash: (kind) => {
      if (!motion()) return;
      flashEl.style.background = kind === 'chain'
        ? 'radial-gradient(120% 80% at 50% 45%,rgba(120,220,90,0),rgba(90,190,70,.5))'
        : kind === 'red'
          ? 'radial-gradient(120% 80% at 50% 45%,rgba(232,68,44,0),rgba(210,50,30,.4))'
          : 'radial-gradient(120% 80% at 50% 45%,rgba(255,215,90,0),rgba(255,200,60,.55))';
      flashEl.style.transition = 'opacity .05s'; flashEl.style.opacity = '1';
      requestAnimationFrame(() => { flashEl.style.transition = 'opacity .45s ease'; flashEl.style.opacity = '0'; });
    },
    announce: (t, k) => {
      if (k === 'tut') {
        tut.style.display = ''; tut.textContent = t;
        clearTimeout(tutTimer);
        tutTimer = window.setTimeout(() => tut.style.display = 'none', 4600);
        return;
      }
      ann.textContent = t;
      ann.style.color = k === 'chain' ? '#8AE07A' : '#FFE27A';
      ann.style.animation = 'none'; void ann.offsetWidth;
      ann.style.animation = 'annPop .35s ease forwards';
      setTimeout(() => { if (ann.textContent === t) { ann.style.animation = ''; ann.style.transform = 'translate(-50%,-50%) scale(0)'; } }, k === 'level' ? 1600 : 900);
    },
    coinFly: (x, y, n) => {
      const r = scorePill.getBoundingClientRect();
      const tx = r.left + r.height / 2, ty = r.top + r.height / 2;
      for (let i = 0; i < n; i++) {
        const c = document.createElement('div');
        c.className = 'fly-coin';
        const sx = x + (Math.random() - 0.5) * 60, sy = y + (Math.random() - 0.5) * 40;
        c.style.left = sx + 'px'; c.style.top = sy + 'px';
        document.body.appendChild(c);
        const delay = i * 40;
        setTimeout(() => {
          c.style.transition = 'left .5s cubic-bezier(.35,-0.2,.7,1), top .5s cubic-bezier(.3,.6,.6,1), opacity .12s .42s';
          c.style.left = tx + 'px'; c.style.top = ty + 'px'; c.style.opacity = '0';
        }, delay);
        setTimeout(() => c.remove(), delay + 620);
      }
    },
    tapRipple: (x, y, hit) => {
      const r = document.createElement('div');
      r.className = 'tap-ripple' + (hit ? '' : ' miss');
      r.style.left = x + 'px'; r.style.top = y + 'px';
      document.body.appendChild(r);
      setTimeout(() => r.remove(), 420);
    },
    hint: (x, y, visible) => {
      if (!visible) { hintEl.style.opacity = '0'; return; }
      hintEl.style.opacity = '1';
      hintEl.style.left = x + 'px';
      hintEl.style.top = (y + 8) + 'px';
    },
    destroy: () => { clearTimeout(tutTimer); el.remove(); },
  };
}

function overlay(html: string): HTMLDivElement { css(); const d = document.createElement('div'); d.className = 'ov'; d.innerHTML = html; document.body.appendChild(d); return d; }
function close(d: HTMLDivElement) { d.classList.add('hide'); setTimeout(() => d.remove(), 320); }
function click(d: HTMLDivElement, sel: string, fn: () => void) {
  const b = d.querySelector(sel) as HTMLButtonElement | null;
  if (b) b.onclick = () => { try { SoundManager.uiClick(); } catch { /* */ } fn(); };
}
function toggleRow(d: HTMLDivElement, sel: string, get: () => boolean, set: (v: boolean) => void) {
  const sw = d.querySelector(sel) as HTMLElement;
  sw.onclick = () => { const nv = !get(); set(nv); sw.classList.toggle('on', nv); };
}

export function showPause(cbs: { onResume: () => void; onQuit: () => void }) {
  const d = overlay(`<div class="card">
    <h1>PAUSED</h1>
    <div class="toggle">🔔 Sound Effects <div class="sw ${Prefs.sfx ? 'on' : ''}" id="pw-sfx"><i></i></div></div>
    <div class="toggle">🎵 Music <div class="sw ${Prefs.music ? 'on' : ''}" id="pw-mus"><i></i></div></div>
    <button class="btn btn-p" id="p-resume">▶ RESUME</button>
    <button class="btn btn-g" id="p-quit">QUIT LEVEL</button>
  </div>`);
  toggleRow(d, '#pw-sfx', () => Prefs.sfx, v => { Prefs.sfx = v; });
  toggleRow(d, '#pw-mus', () => Prefs.music, v => {
    Prefs.music = v;
    try { if (v) SoundManager.startMusic(); else SoundManager.stopMusic(); } catch { /* */ }
  });
  click(d, '#p-resume', () => { close(d); cbs.onResume(); });
  click(d, '#p-quit', () => { close(d); cbs.onQuit(); });
}

function confetti(card: HTMLElement) {
  if (!Prefs.motion) return;
  const colors = ['#FF8A3D', '#FFC21E', '#5BBF4A', '#E8442C', '#5FB8D8', '#F7A8C4'];
  for (let i = 0; i < 26; i++) {
    const c = document.createElement('div');
    c.className = 'confetti';
    c.style.left = (6 + Math.random() * 88) + '%';
    c.style.background = colors[i % colors.length];
    c.style.animationDuration = (1.3 + Math.random() * 1.2) + 's';
    c.style.animationDelay = (Math.random() * 0.5) + 's';
    card.appendChild(c);
    setTimeout(() => c.remove(), 3200);
  }
}

export function showLevelEnd(r: LevelResult, cbs: { onNext: () => void; onRetry: () => void; onMenu: () => void }) {
  const outcome = ProgressionSystem.recordLevel(r.levelId, r.stars, r.score);
  const starsHtml = [0, 1, 2].map(i => `<span>${i < r.stars ? '★' : '☆'}</span>`).join('');
  const hasNext = r.levelId < LEVELS.length;
  const d = overlay(`<div class="card">
    <h1>${r.won ? (r.stars >= 3 ? 'PERFECT SERVICE!' : `LEVEL ${r.levelId} CLEAR!`) : 'SHIFT FAILED'}</h1>
    <div class="stars">${starsHtml}</div>
    <div class="big">$${fmtScore(r.score)}</div>
    <div class="sub">${r.won ? '' : `Goal was $${fmtScore(r.goal)}${r.score >= r.goal * 0.6 ? ' — so close!' : ''}`}</div>
    ${outcome.isNewHighScore ? '<div class="sub" style="color:#E8442C">★ NEW BEST SCORE!</div>' : ''}
    <div class="sub">💰 +$${fmtScore(outcome.coinsEarned)} banked · wallet $${fmtScore(outcome.coinsAfter)}</div>
    <div class="row2">
      <div class="stat"><b>${r.served}</b>served</div>
      <div class="stat"><b>${r.walkouts}</b>walkouts</div>
      <div class="stat"><b>$${fmtScore(r.expert)}</b>3★ score</div>
    </div>
    ${outcome.unlockedNext ? `<div class="unlockbox">🔓 LEVEL ${r.levelId + 1} UNLOCKED!</div>` : ''}
    ${r.won && hasNext ? '<button class="btn btn-p" id="le-next">▶ NEXT LEVEL</button>' : ''}
    ${r.won && !hasNext ? '<div class="unlockbox">🏆 ALL LEVELS CLEAR — you run this town!</div>' : ''}
    <button class="btn ${r.won ? 'btn-s' : 'btn-p'}" id="le-retry">↻ ${r.won ? 'REPLAY' : 'TRY AGAIN'}</button>
    <button class="btn btn-g" id="le-menu">MENU</button>
  </div>`);
  if (r.won) confetti(d.querySelector('.card') as HTMLElement);
  d.querySelectorAll('.stars span').forEach((el2, i) => {
    setTimeout(() => {
      el2.classList.add('pop');
      if (i < r.stars) { try { SoundManager.starReveal(i + 1); } catch { /* */ } }
    }, 250 + i * 320);
  });
  click(d, '#le-next', () => { close(d); cbs.onNext(); });
  click(d, '#le-retry', () => { close(d); cbs.onRetry(); });
  click(d, '#le-menu', () => { close(d); cbs.onMenu(); });
}

export function showShop(onBack: () => void) {
  const d = overlay(`<div class="card">
    <h1>UPGRADES</h1>
    <div class="wallet">💰 <b id="shop-coins">$${fmtScore(ProgressionSystem.getData().coins)}</b></div>
    <div id="shop-rows"></div>
    <button class="btn btn-p" id="shop-back">← BACK</button>
  </div>`);
  const rows = d.querySelector('#shop-rows') as HTMLElement;
  const coinsEl = d.querySelector('#shop-coins') as HTMLElement;
  const render = () => {
    const data = ProgressionSystem.getData();
    coinsEl.textContent = '$' + fmtScore(data.coins);
    rows.innerHTML = UPGRADE_TRACKS.map(t => {
      const tier = data.upgrades[t.id];
      const maxed = tier >= t.costs.length;
      const pips = '●'.repeat(tier) + '○'.repeat(t.costs.length - tier);
      const btn = maxed
        ? '<button class="buybtn max" disabled>MAX</button>'
        : `<button class="buybtn" data-buy="${t.id}" ${data.coins < t.costs[tier] ? 'disabled' : ''}>$${fmtScore(t.costs[tier])}</button>`;
      return `<div class="shoprow"><div class="ic2">${t.emoji}</div>
        <div class="info"><div class="nm">${t.name}</div><div class="ds">${t.desc}</div><div class="pips">${pips}</div></div>
        ${btn}</div>`;
    }).join('');
    rows.querySelectorAll('[data-buy]').forEach(b => {
      (b as HTMLButtonElement).onclick = () => {
        const res = ProgressionSystem.buyUpgrade((b as HTMLElement).dataset.buy as 'shoes' | 'stove' | 'decor' | 'charm');
        if (res.ok) { try { SoundManager.unlockEarned(); } catch { /* */ } render(); }
      };
    });
  };
  render();
  click(d, '#shop-back', () => { close(d); onBack(); });
}

export function showSettings(onBack: () => void) {
  const d = overlay(`<div class="card">
    <h1>SETTINGS</h1>
    <div class="toggle">🔔 Sound Effects <div class="sw ${Prefs.sfx ? 'on' : ''}" id="sw-sfx"><i></i></div></div>
    <div class="toggle">🎵 Music <div class="sw ${Prefs.music ? 'on' : ''}" id="sw-mus"><i></i></div></div>
    <div class="toggle">📳 Haptics <div class="sw ${Prefs.haptics ? 'on' : ''}" id="sw-hap"><i></i></div></div>
    <div class="toggle">🎬 Camera Motion &amp; Flashes <div class="sw ${Prefs.motion ? 'on' : ''}" id="sw-mot"><i></i></div></div>
    <div class="sub" style="margin-top:10px">Best score: $${fmtScore(ProgressionSystem.getData().highScore)}</div>
    <button class="btn btn-p" id="set-back">← BACK</button>
  </div>`);
  toggleRow(d, '#sw-sfx', () => Prefs.sfx, v => { Prefs.sfx = v; });
  toggleRow(d, '#sw-mus', () => Prefs.music, v => {
    Prefs.music = v;
    try { if (v) SoundManager.startMusic(); else SoundManager.stopMusic(); } catch { /* */ }
  });
  toggleRow(d, '#sw-hap', () => Prefs.haptics, v => { Prefs.haptics = v; });
  toggleRow(d, '#sw-mot', () => Prefs.motion, v => { Prefs.motion = v; });
  click(d, '#set-back', () => { close(d); onBack(); });
}

export function showCredits(onBack: () => void) {
  const d = overlay(`<div class="card">
    <h1>TABLE RUSH</h1>
    <div class="credits-list">Seat · Serve · Sparkle.<br>Built with Three.js 🍽️<br><br>Concept &amp; Product · Mordechai<br>Made with Claude<br><br><span style="font-size:12px;color:#B0793C">Type: Baloo 2 (OFL) · All art &amp; audio procedural</span></div>
    <button class="btn btn-p" id="cr-back">← BACK</button>
  </div>`);
  click(d, '#cr-back', () => { close(d); onBack(); });
}
