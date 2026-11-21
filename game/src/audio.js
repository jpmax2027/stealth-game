// Night Ledger — all sound is synthesised with WebAudio: footsteps, the
// alarm siren, pickups and the win jingle. No audio files are loaded.
export function makeAudio() {
  return {
    ctx: null,
    alarmOn: false,
    alarmOsc: null,
    alarmGain: null,
    lastStepAt: 0,
  };
}

function ensureContext(audio) {
  if (audio.ctx) return audio.ctx;
  const Ctor = window.AudioContext ?? window.webkitAudioContext;
  if (!Ctor) return null;
  audio.ctx = new Ctor();
  return audio.ctx;
}

/** Call from a user gesture (click / key) so the browser allows sound. */
export function unlockAudio(audio) {
  const ctx = ensureContext(audio);
  if (ctx && ctx.state === 'suspended') ctx.resume();
}

/** A soft thud each time the player's step phase crosses a full stride. */
export function playFootstep(audio, sneaking) {
  const ctx = ensureContext(audio);
  if (!ctx || ctx.state !== 'running') return;
  const now = ctx.currentTime;
  if (now - audio.lastStepAt < 0.18) return;
  audio.lastStepAt = now;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(sneaking ? 70 : 95, now);
  osc.frequency.exponentialRampToValueAtTime(48, now + 0.09);
  gain.gain.setValueAtTime(sneaking ? 0.05 : 0.11, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
  osc.connect(gain).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.11);
}

/** Short blip when a document is collected. */
export function playPickup(audio) {
  const ctx = ensureContext(audio);
  if (!ctx || ctx.state !== 'running') return;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(660, now);
  osc.frequency.setValueAtTime(990, now + 0.08);
  gain.gain.setValueAtTime(0.14, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
  osc.connect(gain).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.24);
}

/** Two-tone siren while any guard is in alarm; call every frame. */
export function setAlarm(audio, on) {
  if (on === audio.alarmOn) return;
  audio.alarmOn = on;
  const ctx = ensureContext(audio);
  if (!ctx) return;
  if (!on) {
    if (audio.alarmOsc) {
      try { audio.alarmOsc.stop(); } catch { /* already stopped */ }
      audio.alarmOsc = null;
    }
    return;
  }
  if (ctx.state !== 'running') return;
  const osc = ctx.createOscillator();
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  const gain = ctx.createGain();
  osc.type = 'square';
  osc.frequency.value = 620;
  lfo.type = 'sine';
  lfo.frequency.value = 2.2;
  lfoGain.gain.value = 160;
  gain.gain.value = 0.045;
  lfo.connect(lfoGain).connect(osc.frequency);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  lfo.start();
  audio.alarmOsc = osc;
}

/** Rising three-note jingle when a level (or the game) is cleared. */
export function playWin(audio) {
  const ctx = ensureContext(audio);
  if (!ctx || ctx.state !== 'running') return;
  const now = ctx.currentTime;
  [523, 659, 784].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = freq;
    const t = now + i * 0.14;
    gain.gain.setValueAtTime(0.16, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.32);
  });
}

/** Low buzz when the player is caught. */
export function playCaught(audio) {
  const ctx = ensureContext(audio);
  if (!ctx || ctx.state !== 'running') return;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(180, now);
  osc.frequency.exponentialRampToValueAtTime(60, now + 0.5);
  gain.gain.setValueAtTime(0.12, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
  osc.connect(gain).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.56);
}
