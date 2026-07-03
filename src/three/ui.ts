import { fmtScore, UPGRADE_TRACKS, LEVELS } from '../config/GameConfig';
import { ProgressionSystem } from '../systems/ProgressionSystem';
import { SoundManager } from '../systems/SoundManager';
import type { HudState, LevelResult } from './RestaurantGame';

// ── DOM UI: HUD, overlays, coin flight ────────────────────────────────────────

let cssDone = false;
function css() {
  if (cssDone) return; cssDone = true;
  const s = document.createElement('style'); s.textContent = `
  .ui-pill{position:absolute;display:flex;align-items:center;gap:8px;background:rgba(74,42,20,.92);
    border:2px solid rgba(244,194,90,.6);border-radius:18px;padding:8px 15px;color:#fff;
    font-family:'Arial Black',Arial,sans-serif;box-shadow:0 6px 14px rgba(120,60,10,.35),inset 0 2px 0 rgba(255,255,255,.12)}
  #hud{position:fixed;inset:0;z-index:5;pointer-events:none}
  #hud .pointerable{pointer-events:auto}
  #h-score{top:14px;left:14px;font-size:22px}
  #h-score .ic{width:26px;height:26px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#FFE680,#FFC21E 60%,#C98A0E);box-shadow:inset 0 0 0 2px #C98A0E;display:grid;place-items:center;color:#9A6500;font-size:13px}
  #h-score .v{color:#FFE27A}
  #h-guests{top:14px;right:66px;font-size:19px}
  #h-chain{top:64px;left:50%;transform:translateX(-50%);font-size:17px;color:#fff;background:rgba(94,175,74,.95);transition:transform .12s}
  #h-pause{top:14px;right:14px;width:42px;height:42px;padding:0;justify-content:center;font-size:17px;cursor:pointer}
  #h-goal{position:fixed;left:50%;transform:translateX(-50%);bottom:12px;width:min(78vw,420px);z-index:5;pointer-events:none}
  #h-goal .bar{height:16px;background:rgba(74,42,20,.85);border:2px solid rgba(244,194,90,.6);border-radius:10px;overflow:hidden;position:relative}
  #h-goal .fill{height:100%;width:0;background:linear-gradient(90deg,#FF8A3D,#FFC21E);transition:width .3s}
  #h-goal .mark{position:absolute;top:-3px;bottom:-3px;width:3px;background:#FFF3D8;border-radius:2px}
  #h-goal .lbl{display:flex;justify-content:space-between;font-family:Arial;font-weight:bold;font-size:11px;color:#7a4516;margin-top:3px;
    text-shadow:0 1px 0 rgba(255,255,255,.6)}
  #h-vignette{position:fixed;inset:0;z-index:4;pointer-events:none;opacity:0;transition:opacity .4s;
    box-shadow:inset 0 0 90px 30px rgba(232,68,44,.55)}
  #h-flash{position:fixed;inset:0;z-index:4;pointer-events:none;opacity:0;
    background:radial-gradient(120% 80% at 50% 45%,rgba(255,215,90,.0),rgba(255,200,60,.55));transition:opacity .4s ease}
  #h-announce{position:fixed;top:30%;left:50%;transform:translate(-50%,-50%) scale(0);z-index:6;
    font-family:'Arial Black';font-weight:900;font-size:38px;color:#FFE27A;text-align:center;max-width:92vw;
    -webkit-text-stroke:6px #7a3a0a;paint-order:stroke fill;pointer-events:none;text-shadow:0 6px 16px rgba(0,0,0,.3)}
  #h-tut{position:fixed;bottom:44px;left:50%;transform:translateX(-50%);z-index:6;max-width:88vw;text-align:center;
    background:rgba(40,22,8,.92);color:#FFE9C6;font-family:Arial;font-weight:bold;font-size:16px;padding:13px 22px;border-radius:16px;border:2px solid rgba(244,194,90,.5)}
  @keyframes annPop{0%{transform:translate(-50%,-50%) scale(0)}60%{transform:translate(-50%,-50%) scale(1.18)}100%{transform:translate(-50%,-50%) scale(1)}}
  .fly-coin{position:fixed;z-index:7;width:22px;height:22px;border-radius:50%;pointer-events:none;
    background:radial-gradient(circle at 35% 30%,#FFE680,#FFC21E 60%,#C98A0E);box-shadow:inset 0 0 0 2px #C98A0E,0 2px 6px rgba(120,60,10,.4)}

  .ov{position:fixed;inset:0;z-index:30;display:flex;align-items:center;justify-content:center;font-family:'Arial Black',Arial,sans-serif;
    background:radial-gradient(120% 90% at 50% 18%,rgba(255,243,221,.96),rgba(239,168,94,.96));transition:opacity .3s;}
  .ov.hide{opacity:0;pointer-events:none}
  .card{width:min(86vw,380px);background:#FFF7EC;border:3px solid #FF8A3D;border-radius:26px;padding:26px 22px;text-align:center;
    box-shadow:0 18px 40px rgba(150,80,20,.35)}
  .card h1{color:#E8442C;font-size:30px;-webkit-text-stroke:1px #fff;margin-bottom:4px}
  .stars{font-size:46px;letter-spacing:6px;margin:6px 0 2px;color:#F08A1E}
  .stars span{display:inline-block;transform:scale(0)}
  .stars span.pop{animation:starPop .4s cubic-bezier(.3,1.6,.6,1) forwards}
  @keyframes starPop{0%{transform:scale(0) rotate(-40deg)}100%{transform:scale(1) rotate(0)}}
  .big{font-size:46px;color:#F08A1E;margin:6px 0}
  .sub{font-family:Arial;color:#9A551F;font-size:14px;font-weight:bold}
  .row2{display:flex;gap:12px;justify-content:center;margin:14px 0}
  .stat{background:rgba(255,210,122,.35);border-radius:14px;padding:8px 14px;color:#7a4516;font-size:13px}
  .stat b{display:block;font-size:20px;color:#5A3A1E}
  .unlockbox{background:linear-gradient(90deg,rgba(255,210,122,.5),rgba(255,170,80,.35));border:2px solid rgba(244,160,60,.6);
    border-radius:14px;padding:10px 14px;margin:10px 0 2px;color:#7a4516;font-family:Arial;font-weight:bold;font-size:13px}
  .btn{display:block;width:100%;height:56px;margin-top:12px;border:none;border-radius:18px;cursor:pointer;
    font-family:'Arial Black';font-size:20px;color:#fff;letter-spacing:1px}
  .btn-p{background:linear-gradient(180deg,#FF8A3D,#F4671E);box-shadow:0 6px 0 #C24A12}
  .btn-s{background:linear-gradient(180deg,#5BBF4A,#3E9E33);box-shadow:0 6px 0 #2C7A24}
  .btn:active{transform:translateY(4px);box-shadow:none}
  .credits-list{font-family:Arial;color:#7a4516;font-size:15px;line-height:2;margin:14px 0}
  .wallet{display:inline-flex;align-items:center;gap:6px;background:rgba(255,210,122,.4);border:2px solid rgba(244,160,60,.5);
    border-radius:999px;padding:6px 16px;color:#7a4516;font-size:16px;margin-bottom:8px}
  .shoprow{display:flex;align-items:center;gap:10px;background:rgba(255,210,122,.28);border-radius:16px;padding:12px 14px;margin:10px 0;text-align:left}
  .shoprow .ic2{font-size:28px}
  .shoprow .info{flex:1;min-width:0}
  .shoprow .nm{color:#5A3A1E;font-size:15px}
  .shoprow .ds{font-family:Arial;color:#9A551F;font-size:11.5px;font-weight:bold;margin-top:2px}
  .shoprow .pips{font-size:11px;letter-spacing:2px;color:#F08A1E;margin-top:3px}
  .buybtn{border:none;border-radius:12px;padding:10px 12px;min-width:78px;cursor:pointer;font-family:'Arial Black';font-size:13px;color:#fff;
    background:linear-gradient(180deg,#FF8A3D,#F4671E);box-shadow:0 4px 0 #C24A12}
  .buybtn:active{transform:translateY(3px);box-shadow:0 1px 0 #C24A12}
  .buybtn:disabled{background:#C9B49A;box-shadow:0 4px 0 #A8937A;cursor:default;color:#F5EDE0}
  .buybtn.max{background:linear-gradient(180deg,#5BBF4A,#3E9E33);box-shadow:0 4px 0 #2C7A24}
  .toggle{display:flex;align-items:center;justify-content:space-between;background:rgba(255,210,122,.3);border-radius:14px;padding:14px 18px;margin:10px 0;color:#5A3A1E;font-size:16px}
  .sw{width:54px;height:30px;border-radius:16px;background:#C9A36A;position:relative;cursor:pointer;transition:background .2s}
  .sw.on{background:#5BBF4A}.sw i{position:absolute;top:3px;left:3px;width:24px;height:24px;border-radius:50%;background:#fff;transition:left .2s}.sw.on i{left:27px}
  `;
  document.head.appendChild(s);
}

const CHAIN_EMOJI: Record<string, string> = { seat: '🪑', order: '✍️', pickup: '🫱', deliver: '🍽️', collect: '💵', clean: '✨' };

export interface Hud {
  update: (h: HudState) => void;
  announce: (t: string, k: string) => void;
  flash: (kind: string) => void;
  coinFly: (x: number, y: number, n: number) => void;
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
    <div id="h-goal"><div class="bar"><div class="fill" id="hg-fill"></div><div class="mark" id="hg-goal"></div><div class="mark" id="hg-expert" style="opacity:.6"></div></div>
      <div class="lbl"><span id="hg-l1">⭐ GOAL</span><span id="hg-l3">⭐⭐⭐</span></div></div>
    <div id="h-announce"></div>
    <div id="h-tut" style="display:none"></div>`;
  document.body.appendChild(el);
  const flashEl = el.querySelector('#h-flash') as HTMLElement;
  const vignette = el.querySelector('#h-vignette') as HTMLElement;
  const scorePill = el.querySelector('#h-score') as HTMLElement;
  const scoreV = el.querySelector('#h-score .v') as HTMLElement;
  const chainEl = el.querySelector('#h-chain') as HTMLElement;
  const guests = el.querySelector('#h-guests') as HTMLElement;
  const ann = el.querySelector('#h-announce') as HTMLElement;
  const tut = el.querySelector('#h-tut') as HTMLElement;
  const fill = el.querySelector('#hg-fill') as HTMLElement;
  const markGoal = el.querySelector('#hg-goal') as HTMLElement;
  const markExpert = el.querySelector('#hg-expert') as HTMLElement;
  const lblGoal = el.querySelector('#hg-l1') as HTMLElement;
  const pauseBtn = el.querySelector('#h-pause') as HTMLElement;
  pauseBtn.onclick = () => { try { SoundManager.uiClick(); } catch { /* */ } onPause(); };

  let lastScore = -1, lastChain = -1, tutTimer = 0, goalHit = false;
  return {
    update: (h) => {
      if (h.score !== lastScore) {
        scoreV.textContent = fmtScore(h.score);
        scoreV.style.transform = 'scale(1.3)';
        setTimeout(() => scoreV.style.transform = 'scale(1)', 110);
        lastScore = h.score;
      }
      guests.textContent = `👥 ${h.guestsLeft}`;
      vignette.style.opacity = h.urgent ? '1' : '0';
      // goal progress (scaled to the expert score)
      const span = Math.max(1, h.expert);
      fill.style.width = Math.min(100, (h.score / span) * 100) + '%';
      markGoal.style.left = Math.min(99, (h.goal / span) * 100) + '%';
      markExpert.style.left = '99%';
      lblGoal.textContent = `⭐ $${fmtScore(h.goal)}`;
      if (!goalHit && h.score >= h.goal) {
        goalHit = true;
        fill.style.background = 'linear-gradient(90deg,#5BBF4A,#8AE07A)';
      }
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
      ann.style.color = k === 'chain' ? '#8AE07A' : k === 'level' ? '#FFE27A' : '#FFE27A';
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
    destroy: () => el.remove(),
  };
}

function overlay(html: string): HTMLDivElement { css(); const d = document.createElement('div'); d.className = 'ov'; d.innerHTML = html; document.body.appendChild(d); return d; }
function close(d: HTMLDivElement) { d.classList.add('hide'); setTimeout(() => d.remove(), 320); }

export function showPause(cbs: { onResume: () => void; onQuit: () => void }) {
  const sfx = () => localStorage.getItem('tablerush_sfx') !== 'off';
  const mus = () => localStorage.getItem('tablerush_music') !== 'off';
  const d = overlay(`<div class="card">
    <h1>PAUSED</h1>
    <div class="toggle">Sound Effects <div class="sw ${sfx() ? 'on' : ''}" id="pw-sfx"><i></i></div></div>
    <div class="toggle">Music <div class="sw ${mus() ? 'on' : ''}" id="pw-mus"><i></i></div></div>
    <button class="btn btn-p" id="p-resume">▶ RESUME</button>
    <button class="btn btn-s" id="p-quit">QUIT LEVEL</button>
  </div>`);
  const swS = d.querySelector('#pw-sfx') as HTMLElement, swM = d.querySelector('#pw-mus') as HTMLElement;
  swS.onclick = () => { const nv = sfx() ? 'off' : 'on'; localStorage.setItem('tablerush_sfx', nv); swS.classList.toggle('on', nv === 'on'); };
  swM.onclick = () => {
    const nv = mus() ? 'off' : 'on'; localStorage.setItem('tablerush_music', nv); swM.classList.toggle('on', nv === 'on');
    try { if (nv === 'on') SoundManager.startMusic(); else SoundManager.stopMusic(); } catch { /* */ }
  };
  (d.querySelector('#p-resume') as HTMLButtonElement).onclick = () => { try { SoundManager.uiClick(); } catch { /* */ } close(d); cbs.onResume(); };
  (d.querySelector('#p-quit') as HTMLButtonElement).onclick = () => { try { SoundManager.uiClick(); } catch { /* */ } close(d); cbs.onQuit(); };
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
    <button class="btn btn-s" id="le-menu">MENU</button>
  </div>`);
  d.querySelectorAll('.stars span').forEach((el2, i) => {
    setTimeout(() => {
      el2.classList.add('pop');
      if (i < r.stars) { try { SoundManager.starReveal(i + 1); } catch { /* */ } }
    }, 250 + i * 320);
  });
  const next = d.querySelector('#le-next') as HTMLButtonElement | null;
  if (next) next.onclick = () => { try { SoundManager.uiClick(); } catch { /* */ } close(d); cbs.onNext(); };
  (d.querySelector('#le-retry') as HTMLButtonElement).onclick = () => { try { SoundManager.uiClick(); } catch { /* */ } close(d); cbs.onRetry(); };
  (d.querySelector('#le-menu') as HTMLButtonElement).onclick = () => { try { SoundManager.uiClick(); } catch { /* */ } close(d); cbs.onMenu(); };
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
        const res = ProgressionSystem.buyUpgrade((b as HTMLElement).dataset.buy as 'shoes' | 'stove' | 'decor');
        if (res.ok) { try { SoundManager.unlockEarned(); } catch { /* */ } render(); }
      };
    });
  };
  render();
  (d.querySelector('#shop-back') as HTMLButtonElement).onclick = () => { try { SoundManager.uiClick(); } catch { /* */ } close(d); onBack(); };
}

export function showSettings(onBack: () => void) {
  const sfx = () => localStorage.getItem('tablerush_sfx') !== 'off';
  const mus = () => localStorage.getItem('tablerush_music') !== 'off';
  const d = overlay(`<div class="card">
    <h1>SETTINGS</h1>
    <div class="toggle">Sound Effects <div class="sw ${sfx() ? 'on' : ''}" id="sw-sfx"><i></i></div></div>
    <div class="toggle">Music <div class="sw ${mus() ? 'on' : ''}" id="sw-mus"><i></i></div></div>
    <div class="sub" style="margin-top:10px">Best score: $${fmtScore(ProgressionSystem.getData().highScore)}</div>
    <button class="btn btn-p" id="set-back">← BACK</button>
  </div>`);
  const swS = d.querySelector('#sw-sfx') as HTMLElement, swM = d.querySelector('#sw-mus') as HTMLElement;
  swS.onclick = () => { const nv = sfx() ? 'off' : 'on'; localStorage.setItem('tablerush_sfx', nv); swS.classList.toggle('on', nv === 'on'); };
  swM.onclick = () => {
    const nv = mus() ? 'off' : 'on'; localStorage.setItem('tablerush_music', nv); swM.classList.toggle('on', nv === 'on');
    try { if (nv === 'on') SoundManager.startMusic(); else SoundManager.stopMusic(); } catch { /* */ }
  };
  (d.querySelector('#set-back') as HTMLButtonElement).onclick = () => { try { SoundManager.uiClick(); } catch { /* */ } close(d); onBack(); };
}

export function showCredits(onBack: () => void) {
  const d = overlay(`<div class="card">
    <h1>TABLE RUSH</h1>
    <div class="credits-list">Seat · Serve · Sparkle.<br>Built with Three.js 🍽️<br><br>Concept &amp; Product · Mordechai<br>Made with Claude</div>
    <button class="btn btn-p" id="cr-back">← BACK</button>
  </div>`);
  (d.querySelector('#cr-back') as HTMLButtonElement).onclick = () => { try { SoundManager.uiClick(); } catch { /* */ } close(d); onBack(); };
}
