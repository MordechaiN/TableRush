// Web Audio API synthesis — no external audio files required.
// All sounds are procedurally generated via oscillators and envelope shaping.
let ctx: AudioContext | null = null;
let musicLoopTimer: ReturnType<typeof setTimeout> | null = null;
let musicPlaying = false;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    try { ctx = new (window.AudioContext || (window as any).webkitAudioContext)(); } catch { return null; }
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

function gain(ac: AudioContext, value: number, time?: number): GainNode {
  const g = ac.createGain();
  g.gain.setValueAtTime(value, time ?? ac.currentTime);
  return g;
}

function tone(
  ac: AudioContext, dest: AudioNode,
  type: OscillatorType, freq: number, vol: number,
  startAt: number, duration: number,
  freqEnd?: number,
) {
  const osc = ac.createOscillator();
  const g = gain(ac, 0);
  osc.type = type;
  osc.frequency.setValueAtTime(freq, startAt);
  if (freqEnd !== undefined) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(freqEnd, 0.01), startAt + duration);
  }
  g.gain.setValueAtTime(0, startAt);
  g.gain.linearRampToValueAtTime(vol, startAt + 0.01);
  g.gain.exponentialRampToValueAtTime(0.001, startAt + duration);
  osc.connect(g);
  g.connect(dest);
  osc.start(startAt);
  osc.stop(startAt + duration + 0.05);
}

function noise(ac: AudioContext, dest: AudioNode, vol: number, startAt: number, duration: number) {
  const bufSize = ac.sampleRate * duration;
  const buf = ac.createBuffer(1, bufSize, ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1);
  const src = ac.createBufferSource();
  src.buffer = buf;
  const g = gain(ac, 0);
  g.gain.setValueAtTime(vol, startAt);
  g.gain.exponentialRampToValueAtTime(0.001, startAt + duration);
  src.connect(g);
  g.connect(dest);
  src.start(startAt);
}

function isMusicEnabled(): boolean {
  return localStorage.getItem('tablerush_music') !== 'off';
}

function playMusicBar(ac: AudioContext, barIdx: number, startT: number) {
  const bpm = 108;
  const beat = 60 / bpm;
  const bar = beat * 4;

  // 4-chord loop: Cmaj7 | Am7 | Fmaj7 | G7
  const bassRoots  = [130.81, 110.00, 174.61, 196.00];
  const bassOctave = [261.63, 220.00, 349.23, 392.00];
  // Chord tones (upper structure) per bar — two per beat
  const chordTones: number[][] = [
    [329.63, 392.00, 493.88, 392.00, 329.63, 392.00, 493.88, 523.25],  // Cmaj7
    [220.00, 261.63, 329.63, 392.00, 329.63, 261.63, 220.00, 246.94],  // Am7
    [261.63, 349.23, 440.00, 349.23, 261.63, 392.00, 349.23, 261.63],  // Fmaj7
    [392.00, 493.88, 587.33, 493.88, 392.00, 349.23, 392.00, 440.00],  // G7
  ];
  const b = barIdx % 4;

  const m = ac.createGain();
  m.gain.value = 0.13;
  m.connect(ac.destination);

  // Bass: root on beat 1, octave on beat 3
  tone(ac, m, 'sine', bassRoots[b], 0.9, startT,              beat * 0.7);
  tone(ac, m, 'sine', bassOctave[b], 0.6, startT + 2 * beat,  beat * 0.6);

  // Chord stabs: 8 even subdivisions per bar (8th notes)
  const tones = chordTones[b];
  tones.forEach((freq, i) => {
    const st = startT + i * (bar / 8);
    // Soft muted attack — triangle oscillator for warm piano-like timbre
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.type = 'triangle';
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0, st);
    g.gain.linearRampToValueAtTime(0.28, st + 0.015);
    g.gain.exponentialRampToValueAtTime(0.001, st + beat * 0.55);
    osc.connect(g); g.connect(m);
    osc.start(st); osc.stop(st + beat * 0.6);
  });

  return bar; // return bar duration in seconds
}

export const SoundManager = {
  isEnabled(): boolean {
    return localStorage.getItem('tablerush_sfx') !== 'off';
  },

  startMusic() {
    if (musicPlaying) return;
    if (!isMusicEnabled()) return;
    const ac = getCtx(); if (!ac) return;
    musicPlaying = true;
    let barIdx = 0;
    const bpm = 108;
    const barDuration = (60 / bpm) * 4 * 1000; // ms per bar

    const tick = () => {
      if (!musicPlaying) return;
      const a = getCtx(); if (!a) return;
      playMusicBar(a, barIdx, a.currentTime + 0.05);
      barIdx++;
      musicLoopTimer = setTimeout(tick, barDuration - 20);
    };
    tick();
  },

  stopMusic() {
    musicPlaying = false;
    if (musicLoopTimer) { clearTimeout(musicLoopTimer); musicLoopTimer = null; }
  },

  uiClick() {
    if (!this.isEnabled()) return;
    const ac = getCtx(); if (!ac) return;
    const t = ac.currentTime;
    const master = gain(ac, 0.25);
    master.connect(ac.destination);
    tone(ac, master, 'sine', 900, 1, t, 0.08);
    noise(ac, master, 0.08, t, 0.05);
  },

  seatCustomer() {
    if (!this.isEnabled()) return;
    const ac = getCtx(); if (!ac) return;
    const t = ac.currentTime;
    const master = gain(ac, 0.28);
    master.connect(ac.destination);
    // Soft chair scrape + settle
    noise(ac, master, 0.5, t, 0.07);
    tone(ac, master, 'sine', 320, 0.7, t + 0.06, 0.18);
    tone(ac, master, 'sine', 480, 0.5, t + 0.08, 0.14);
  },

  orderTaken() {
    if (!this.isEnabled()) return;
    const ac = getCtx(); if (!ac) return;
    const t = ac.currentTime;
    const master = gain(ac, 0.30);
    master.connect(ac.destination);
    // Rising two-note "got it"
    tone(ac, master, 'sine', 660, 1, t, 0.15);
    tone(ac, master, 'sine', 880, 0.9, t + 0.12, 0.20);
  },

  foodReady() {
    if (!this.isEnabled()) return;
    const ac = getCtx(); if (!ac) return;
    const t = ac.currentTime;
    const master = gain(ac, 0.28);
    master.connect(ac.destination);
    // Kitchen bell ding-ding
    tone(ac, master, 'sine', 1047, 1, t, 0.25);
    tone(ac, master, 'sine', 1047, 0.7, t + 0.28, 0.22);
    // Light harmonic overtone
    tone(ac, master, 'sine', 2094, 0.2, t, 0.2);
  },

  deliverFood() {
    if (!this.isEnabled()) return;
    const ac = getCtx(); if (!ac) return;
    const t = ac.currentTime;
    const master = gain(ac, 0.22);
    master.connect(ac.destination);
    // Plate set-down thud + positive note
    noise(ac, master, 0.6, t, 0.06);
    tone(ac, master, 'sine', 550, 0.8, t + 0.04, 0.22);
    tone(ac, master, 'sine', 660, 0.5, t + 0.10, 0.18);
  },

  paymentCollected() {
    if (!this.isEnabled()) return;
    const ac = getCtx(); if (!ac) return;
    const t = ac.currentTime;
    const master = gain(ac, 0.30);
    master.connect(ac.destination);
    // Coin arpeggio: C5, E5, G5, C6
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      tone(ac, master, 'sine', freq, 1 - i * 0.1, t + i * 0.075, 0.22 - i * 0.03);
    });
    noise(ac, master, 0.15, t, 0.08);
  },

  // tier: 1=×2, 2=×3, 3=×4, 4=×5
  comboUp(tier: number) {
    if (!this.isEnabled()) return;
    const ac = getCtx(); if (!ac) return;
    const t = ac.currentTime;
    const master = gain(ac, 0.25);
    master.connect(ac.destination);

    if (tier <= 1) {
      // ×2 — modest upward two-note
      tone(ac, master, 'sine', 523, 1, t, 0.18);
      tone(ac, master, 'sine', 659, 0.9, t + 0.15, 0.20);
    } else if (tier === 2) {
      // ×3 — three rising notes
      tone(ac, master, 'sine', 523, 1, t, 0.14);
      tone(ac, master, 'sine', 659, 0.9, t + 0.11, 0.14);
      tone(ac, master, 'sine', 784, 0.8, t + 0.22, 0.20);
    } else if (tier === 3) {
      // ×4 — energetic four-note run
      const run = [523, 659, 784, 1047];
      run.forEach((f, i) => tone(ac, master, 'triangle', f, 0.9, t + i * 0.09, 0.16));
    } else {
      // ×5 — fanfare sweep + sparkle
      const fanfare = [784, 988, 1175, 1319, 1568];
      fanfare.forEach((f, i) => tone(ac, master, 'sine', f, 0.85, t + i * 0.07, 0.22));
      tone(ac, master, 'sine', 2093, 0.2, t + 0.32, 0.30);
    }
  },

  comboLost() {
    if (!this.isEnabled()) return;
    const ac = getCtx(); if (!ac) return;
    const t = ac.currentTime;
    const master = gain(ac, 0.22);
    master.connect(ac.destination);
    // Descending whomp
    tone(ac, master, 'sawtooth', 440, 0.8, t, 0.35, 110);
    tone(ac, master, 'sine', 220, 0.5, t + 0.1, 0.28, 80);
  },

  customerAngry() {
    if (!this.isEnabled()) return;
    const ac = getCtx(); if (!ac) return;
    const t = ac.currentTime;
    const master = gain(ac, 0.28);
    master.connect(ac.destination);
    // Dissonant buzzer + thud
    tone(ac, master, 'square', 180, 0.6, t, 0.18, 90);
    tone(ac, master, 'sawtooth', 110, 0.5, t + 0.05, 0.22);
    noise(ac, master, 0.4, t, 0.12);
  },

  dishwasher() {
    if (!this.isEnabled()) return;
    const ac = getCtx(); if (!ac) return;
    const t = ac.currentTime;
    const master = gain(ac, 0.22);
    master.connect(ac.destination);
    // Mechanical clank + steam hiss
    noise(ac, master, 0.7, t, 0.08);
    tone(ac, master, 'square', 220, 0.4, t, 0.10, 120);
    // Steam hiss (filtered noise via volume envelope)
    noise(ac, master, 0.25, t + 0.10, 0.35);
    tone(ac, master, 'sine', 800, 0.15, t + 0.10, 0.35, 400);
  },

  rushHour() {
    if (!this.isEnabled()) return;
    const ac = getCtx(); if (!ac) return;
    const t = ac.currentTime;
    const master = gain(ac, 0.25);
    master.connect(ac.destination);
    // Quick siren up-down
    tone(ac, master, 'sawtooth', 440, 0.7, t, 0.25, 880);
    tone(ac, master, 'sawtooth', 880, 0.7, t + 0.28, 0.25, 440);
    tone(ac, master, 'sawtooth', 440, 0.5, t + 0.56, 0.20, 660);
  },

  roundEnd() {
    if (!this.isEnabled()) return;
    const ac = getCtx(); if (!ac) return;
    const t = ac.currentTime;
    const master = gain(ac, 0.28);
    master.connect(ac.destination);
    // End-of-shift fanfare: C major ascending arpeggio + held note
    const fanfare = [523, 659, 784, 1047, 1047];
    fanfare.forEach((f, i) => {
      const dur = i === fanfare.length - 1 ? 0.8 : 0.22;
      tone(ac, master, 'sine', f, 0.9 - i * 0.05, t + i * 0.14, dur);
    });
    // Bass note
    tone(ac, master, 'sine', 131, 0.5, t, 1.2);
  },

  timerWarning() {
    if (!this.isEnabled()) return;
    const ac = getCtx(); if (!ac) return;
    const t = ac.currentTime;
    const master = gain(ac, 0.22);
    master.connect(ac.destination);
    // Urgent tick-tock
    tone(ac, master, 'square', 880, 0.6, t, 0.08);
    tone(ac, master, 'square', 660, 0.5, t + 0.15, 0.08);
  },
};
