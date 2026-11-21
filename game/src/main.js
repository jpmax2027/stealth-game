// Night Ledger — game loop and screen state machine. Owns the canvas, the
// per-level state and the transitions between title, play, pause, caught,
// level-clear and win.
import { VIEW_W, VIEW_H, HUD_H, STEP } from './config.js';
import { LEVELS, levelCount } from './levels.js';
import { makeGuard, updateGuard, anyAlarm } from './guards.js';
import { makePlayer, movePlayer, tryPickup, atOpenExit, atLockedExit } from './player.js';
import { makeAudio, unlockAudio, playFootstep, playPickup, setAlarm, playWin, playCaught } from './audio.js';
import { makeInput, attachInput, moveDirection, isSneaking, consumeClick } from './input.js';
import {
  render,
  SCREEN_TITLE,
  SCREEN_PLAY,
  SCREEN_PAUSE,
  SCREEN_CAUGHT,
  SCREEN_LEVEL_CLEAR,
  SCREEN_WIN,
} from './render.js';
import { stageShot } from './shots.js';
import { sightBlockers } from './vision.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

function fitCanvas() {
  const scale = Math.min(window.innerWidth / VIEW_W, window.innerHeight / VIEW_H);
  canvas.width = VIEW_W;
  canvas.height = VIEW_H;
  canvas.style.width = `${Math.floor(VIEW_W * scale)}px`;
  canvas.style.height = `${Math.floor(VIEW_H * scale)}px`;
}
window.addEventListener('resize', fitCanvas);
fitCanvas();

const input = makeInput();
const audio = makeAudio();
const state = {
  screen: SCREEN_TITLE,
  levelIndex: 0,
  level: null,
  player: null,
  guards: [],
  blockers: [],
  lockedHintUntil: 0,
};

function loadLevel(index) {
  const def = LEVELS[index];
  // Fresh copies so a replay starts clean (documents untaken, meters zero).
  state.level = JSON.parse(JSON.stringify(def));
  state.level.docs = def.docs.map((d) => ({ ...d }));
  state.player = makePlayer(state.level.playerStart);
  state.guards = def.guards.map((g) => makeGuard(g));
  state.blockers = sightBlockers(state.level);
  state.levelIndex = index;
}

function startGame() {
  loadLevel(0);
  state.screen = SCREEN_PLAY;
}

function nextLevel() {
  if (state.levelIndex + 1 >= levelCount()) {
    state.screen = SCREEN_WIN;
    return;
  }
  loadLevel(state.levelIndex + 1);
  state.screen = SCREEN_PLAY;
}

function buttonAt(x, y, w, h) {
  return input.mouseX >= x && input.mouseX <= x + w && input.mouseY >= y && input.mouseY <= y + h;
}

function step(dt) {
  if (state.screen !== SCREEN_PLAY) return;
  const dir = moveDirection(input);
  const sneaking = isSneaking(input);
  const before = state.player.stepPhase;
  movePlayer(state.player, dir.dx, dir.dy, sneaking, state.level, dt);
  if (state.player.stepPhase - before > 26) playFootstep(audio, sneaking);
  if (tryPickup(state.player, state.level)) playPickup(audio);
  if (atOpenExit(state.player, state.level)) {
    playWin(audio);
    if (state.levelIndex + 1 >= levelCount()) state.screen = SCREEN_WIN;
    else state.screen = SCREEN_LEVEL_CLEAR;
    return;
  }
  if (atLockedExit(state.player, state.level)) {
    state.lockedHintUntil = performance.now() + 1200;
  }
  let caught = false;
  for (const guard of state.guards) {
    if (updateGuard(guard, state.player, state.level, state.blockers, dt) === 'caught') {
      caught = true;
    }
  }
  setAlarm(audio, anyAlarm(state.guards));
  if (caught) {
    playCaught(audio);
    setAlarm(audio, false);
    state.screen = SCREEN_CAUGHT;
  }
}

function onKey(key) {
  unlockAudio(audio);
  if (key === 'm') {
    input.muted = !input.muted;
    if (input.muted) setAlarm(audio, false);
    return;
  }
  if (state.screen === SCREEN_TITLE && (key === 'enter' || key === ' ')) startGame();
  else if (state.screen === SCREEN_PLAY && (key === 'p' || key === 'escape')) state.screen = SCREEN_PAUSE;
  else if (state.screen === SCREEN_PAUSE && (key === 'p' || key === 'escape' || key === 'enter')) state.screen = SCREEN_PLAY;
  else if (state.screen === SCREEN_CAUGHT && key === 'r') {
    loadLevel(state.levelIndex);
    state.screen = SCREEN_PLAY;
  } else if (state.screen === SCREEN_LEVEL_CLEAR && (key === 'enter' || key === ' ')) nextLevel();
  else if (state.screen === SCREEN_WIN && (key === 'enter' || key === ' ')) startGame();
  else if (state.screen === SCREEN_PLAY && key === 'e') {
    if (tryPickup(state.player, state.level)) playPickup(audio);
  }
}

attachInput(input, canvas, onKey);

function handleClicks() {
  if (!consumeClick(input)) return;
  unlockAudio(audio);
  const bx = VIEW_W / 2 - 110;
  if (state.screen === SCREEN_TITLE && buttonAt(bx, 430, 220, 52)) startGame();
  else if (state.screen === SCREEN_PAUSE && buttonAt(bx, 400, 220, 52)) state.screen = SCREEN_PLAY;
  else if (state.screen === SCREEN_CAUGHT && buttonAt(bx, 400, 220, 52)) {
    loadLevel(state.levelIndex);
    state.screen = SCREEN_PLAY;
  } else if (state.screen === SCREEN_LEVEL_CLEAR && buttonAt(bx, 400, 220, 52)) nextLevel();
  else if (state.screen === SCREEN_WIN && buttonAt(bx, 400, 220, 52)) startGame();
}

// Screenshot mode: ?shot=cover|patrol|alarm|exit stages a fixed scene and
// draws it once, so the frame is a real render of the game's own code.
// It re-renders on every animation frame (and after resizes, which clear a
// canvas) so the staged frame survives layout changes.
const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
if (shot) {
  loadLevel(0);
  const staged = stageShot(shot, state);
  state.screen = staged.screen;
  const drawShot = () => {
    render(ctx, state, input);
    requestAnimationFrame(drawShot);
  };
  requestAnimationFrame(drawShot);
} else {
  loadLevel(0);
  let last = performance.now();
  let accumulator = 0;
  function frame(now) {
    accumulator += Math.min(0.1, (now - last) / 1000);
    last = now;
    handleClicks();
    while (accumulator >= STEP) {
      step(STEP);
      accumulator -= STEP;
    }
    render(ctx, state, input);
    // Locked-exit hint, drawn over the HUD for a moment.
    if (state.screen === SCREEN_PLAY && performance.now() < state.lockedHintUntil) {
      ctx.fillStyle = '#ffcc44';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Pintu terkunci — kumpulkan semua dokumen dulu!', VIEW_W / 2, HUD_H + 24);
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
