// Night Ledger — vision: line of sight and the vision cone test. Walls,
// crates and bushes all block a guard's sight; the player is only seen when
// inside the cone, within range, and with a clear line of sight.
import { GUARD } from './config.js';

/** True when segment (ax,ay)-(bx,by) crosses rectangle r. */
export function segmentHitsRect(ax, ay, bx, by, r) {
  const dx = bx - ax;
  const dy = by - ay;
  let tMin = 0;
  let tMax = 1;
  for (const [p, q] of [
    [-dx, ax - r.x],
    [dx, r.x + r.w - ax],
    [-dy, ay - r.y],
    [dy, r.y + r.h - ay],
  ]) {
    if (p === 0) {
      if (q < 0) return false;
    } else {
      const t = q / p;
      if (p < 0) {
        if (t > tMax) return false;
        if (t > tMin) tMin = t;
      } else {
        if (t < tMin) return false;
        if (t < tMax) tMax = t;
      }
    }
  }
  return true;
}

/** All solid shapes that block sight in this level. */
export function sightBlockers(level) {
  return level.walls.concat(level.crates, level.bushes);
}

/** True when nothing blocks the straight line from guard to target. */
export function hasLineOfSight(gx, gy, tx, ty, blockers) {
  for (let i = 0; i < blockers.length; i += 1) {
    if (segmentHitsRect(gx, gy, tx, ty, blockers[i])) return false;
  }
  return true;
}

/** Angle difference wrapped to [-PI, PI]. */
export function angleDiff(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

/**
 * Can this guard see the player right now? Returns { seen, distance }.
 * A player standing inside a bush is hidden even inside the cone.
 */
export function canSeePlayer(guard, player, level, blockers) {
  if (player.hidden) return { seen: false, distance: Infinity };
  const dx = player.x - guard.x;
  const dy = player.y - guard.y;
  const distance = Math.hypot(dx, dy);
  if (distance > GUARD.viewRange) return { seen: false, distance };
  const angleToPlayer = Math.atan2(dy, dx);
  if (Math.abs(angleDiff(angleToPlayer, guard.facing)) > GUARD.halfAngle) {
    return { seen: false, distance };
  }
  if (!hasLineOfSight(guard.x, guard.y, player.x, player.y, blockers)) {
    return { seen: false, distance };
  }
  return { seen: true, distance };
}

/** How fast the detection meter fills when the guard sees the player. */
export function detectionRate(distance, playerMoving, playerSneaking) {
  let rate = 42; // DETECTION.baseRate
  const closeness = Math.max(0, 1 - distance / GUARD.viewRange);
  rate += 55 * closeness * closeness; // DETECTION.closeBonus
  if (playerSneaking) rate *= 0.45;
  else if (playerMoving) rate *= 1.5;
  return rate;
}
