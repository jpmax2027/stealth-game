// Night Ledger — the player: movement, sneaking, hiding in bushes, picking
// up documents and reaching the exit.
import { PLAYER, TILE, COLS, ROWS } from './config.js';

export function makePlayer(start) {
  return {
    x: start.x,
    y: start.y,
    radius: PLAYER.radius,
    moving: false,
    sneaking: false,
    hidden: false,
    stepPhase: 0, // advances with distance walked; drives footstep sounds
    docs: 0,
  };
}

function pointInRect(x, y, r) {
  return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
}

function blockedAt(x, y, level) {
  if (x < PLAYER.radius || x > COLS * TILE - PLAYER.radius) return true;
  if (y < PLAYER.radius || y > ROWS * TILE - PLAYER.radius) return true;
  for (const wall of level.walls) {
    if (x + PLAYER.radius > wall.x && x - PLAYER.radius < wall.x + wall.w &&
        y + PLAYER.radius > wall.y && y - PLAYER.radius < wall.y + wall.h) return true;
  }
  for (const crate of level.crates) {
    if (x + PLAYER.radius > crate.x && x - PLAYER.radius < crate.x + crate.w &&
        y + PLAYER.radius > crate.y && y - PLAYER.radius < crate.y + crate.h) return true;
  }
  return false;
}

/** Move the player by the input direction; returns the distance actually walked. */
export function movePlayer(player, dx, dy, sneaking, level, dt) {
  player.sneaking = sneaking;
  const speed = sneaking ? PLAYER.sneakSpeed : PLAYER.walkSpeed;
  const len = Math.hypot(dx, dy);
  if (len < 0.01) {
    player.moving = false;
    return 0;
  }
  const nx = player.x + (dx / len) * speed * dt;
  const ny = player.y + (dy / len) * speed * dt;
  let walked = 0;
  if (!blockedAt(nx, player.y, level)) {
    walked += Math.abs(nx - player.x);
    player.x = nx;
  }
  if (!blockedAt(player.x, ny, level)) {
    walked += Math.abs(ny - player.y);
    player.y = ny;
  }
  player.moving = walked > 0;
  player.stepPhase += walked;
  // Standing inside a bush hides the player from every guard.
  player.hidden = level.bushes.some((bush) => pointInRect(player.x, player.y, bush));
  return walked;
}

/** Pick up a document the player stands on; returns true when one was taken. */
export function tryPickup(player, level) {
  for (const doc of level.docs) {
    if (!doc.taken && Math.hypot(doc.x - player.x, doc.y - player.y) < 34) {
      doc.taken = true;
      player.docs += 1;
      return true;
    }
  }
  return false;
}

/** True when the player stands on the exit with every document collected. */
export function atOpenExit(player, level) {
  if (!level.exit || player.docs < level.docs.length) return false;
  return pointInRect(player.x, player.y, level.exit);
}

/** True when the player stands on the exit but documents are still missing. */
export function atLockedExit(player, level) {
  if (!level.exit || player.docs >= level.docs.length) return false;
  return pointInRect(player.x, player.y, level.exit);
}
