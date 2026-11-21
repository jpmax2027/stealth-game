// Night Ledger — deterministic screenshot scenes behind ?shot=cover|patrol|
// alarm|exit. Each scene builds a real game state (the same objects the live
// game uses) and places the player, the guards and the detection meters so
// the frame shows that moment of play.
import { SCREEN_PLAY } from './render.js';
import { GUARD_ALARM, GUARD_SUSPICIOUS, makeGuard } from './guards.js';
import { makePlayer } from './player.js';
import { LEVELS } from './levels.js';

function freshState(levelIndex) {
  const level = LEVELS[levelIndex];
  // Deep-copy the level so staging never mutates the shared definitions.
  const copy = JSON.parse(JSON.stringify(level));
  copy.docs = level.docs.map((d) => ({ ...d }));
  const player = makePlayer(copy.playerStart);
  const guards = copy.guards.map((def) => makeGuard(def));
  return { level: copy, player, guards, levelIndex };
}

/** Place a guard at a tile centre, facing a direction in radians. */
function placeGuard(guards, index, col, row, facing) {
  const guard = guards[index];
  guard.x = col * 48 + 24;
  guard.y = row * 48 + 24;
  guard.facing = facing;
  guard.pauseLeft = 0;
}

/**
 * Set `state` to the named scene and return the screen to draw. Unknown names
 * fall back to the cover scene.
 */
export function stageShot(name, state) {
  if (name === 'patrol') {
    const s = freshState(0);
    Object.assign(state, s);
    // Player mid-room, one guard on patrol ahead, another crossing below.
    state.player.x = 8 * 48 + 24;
    state.player.y = 8 * 48 + 24;
    placeGuard(state.guards, 0, 6, 5, Math.PI / 2);
    placeGuard(state.guards, 1, 18, 8, -Math.PI / 2);
    return { screen: SCREEN_PLAY };
  }
  if (name === 'alarm') {
    const s = freshState(1);
    Object.assign(state, s);
    // Player spotted in the open: one guard in full alarm (red cone, meter
    // full), a second guard suspicious and turning toward the player.
    state.player.x = 12 * 48 + 24;
    state.player.y = 6 * 48 + 24;
    state.player.moving = true;
    placeGuard(state.guards, 0, 10, 6, 0);
    state.guards[0].meter = 100;
    state.guards[0].state = GUARD_ALARM;
    state.guards[0].lastSeenX = state.player.x;
    state.guards[0].lastSeenY = state.player.y;
    placeGuard(state.guards, 1, 16, 3, Math.PI / 2);
    state.guards[1].meter = 62;
    state.guards[1].state = GUARD_SUSPICIOUS;
    state.guards[1].lastSeenX = state.player.x;
    state.guards[1].lastSeenY = state.player.y;
    return { screen: SCREEN_PLAY };
  }
  if (name === 'exit') {
    const s = freshState(0);
    Object.assign(state, s);
    // Every document collected: the exit glows green and the player is one
    // step away from it, a guard's cone sweeping the corridor behind.
    for (const doc of state.level.docs) doc.taken = true;
    state.player.docs = state.level.docs.length;
    state.player.x = 22 * 48 + 24;
    state.player.y = 7 * 48 + 24;
    placeGuard(state.guards, 0, 6, 9, -Math.PI / 2);
    placeGuard(state.guards, 1, 18, 4, Math.PI);
    return { screen: SCREEN_PLAY };
  }
  // Default: cover. The player crouches behind a crate while a guard's cone
  // sweeps past; the exit is visible at the far right of the level.
  const s = freshState(0);
  Object.assign(state, s);
  state.player.x = 3 * 48 + 24;
  state.player.y = 4 * 48 + 24;
  state.player.sneaking = true;
  placeGuard(state.guards, 0, 6, 3, Math.PI / 2);
  state.guards[0].meter = 18;
  placeGuard(state.guards, 1, 19, 9, Math.PI);
  return { screen: SCREEN_PLAY };
}
