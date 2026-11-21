// Night Ledger — guard patrol and awareness AI. A guard walks a waypoint
// loop, grows suspicious when it glimpses the player, raises the alarm when
// the detection meter fills, chases, then calms down when the player is lost.
import { GUARD, DETECTION, STEP } from './config.js';
import { angleDiff, canSeePlayer, detectionRate } from './vision.js';

export const GUARD_PATROL = 'patrol';
export const GUARD_SUSPICIOUS = 'suspicious';
export const GUARD_ALARM = 'alarm';

export function makeGuard(def) {
  const points = def.waypoints.map(([col, row]) => ({
    x: col * 48 + 24,
    y: row * 48 + 24,
  }));
  const first = points[0];
  const second = points[1] ?? points[0];
  return {
    x: first.x,
    y: first.y,
    facing: Math.atan2(second.y - first.y, second.x - first.x),
    waypoints: points,
    waypointIndex: 1 % points.length,
    pauseLeft: 0,
    speedFactor: def.speed ?? 1,
    meter: 0,
    state: GUARD_PATROL,
    lostSightFor: 0,
    lastSeenX: null,
    lastSeenY: null,
  };
}

function moveToward(guard, tx, ty, speed, dt) {
  const dx = tx - guard.x;
  const dy = ty - guard.y;
  const dist = Math.hypot(dx, dy);
  if (dist < 1) return true;
  const step = Math.min(dist, speed * dt);
  guard.x += (dx / dist) * step;
  guard.y += (dy / dist) * step;
  guard.facing = Math.atan2(dy, dx);
  return dist - step < 1;
}

function turnToward(guard, targetAngle, rate, dt) {
  const diff = angleDiff(targetAngle, guard.facing);
  const turn = Math.max(-rate * dt, Math.min(rate * dt, diff));
  guard.facing += turn;
}

/** Advance one guard by dt seconds. Returns 'caught' when it grabs the player. */
export function updateGuard(guard, player, level, blockers, dt) {
  const seen = canSeePlayer(guard, player, level, blockers);
  if (seen.seen) {
    guard.meter += detectionRate(seen.distance, player.moving, player.sneaking) * dt;
    guard.lastSeenX = player.x;
    guard.lastSeenY = player.y;
    guard.lostSightFor = 0;
  } else {
    guard.meter -= DETECTION.decayRate * dt;
    guard.lostSightFor += dt;
  }
  guard.meter = Math.max(0, Math.min(100, guard.meter));

  if (guard.meter >= DETECTION.alarmAt) guard.state = GUARD_ALARM;
  else if (guard.meter >= DETECTION.suspiciousAt) guard.state = GUARD_SUSPICIOUS;
  else if (guard.state !== GUARD_ALARM) guard.state = GUARD_PATROL;
  if (guard.state === GUARD_ALARM && guard.lostSightFor > GUARD.alertMemory) {
    guard.state = GUARD_PATROL;
    guard.meter = DETECTION.suspiciousAt - 1;
    guard.lastSeenX = null;
    guard.lastSeenY = null;
  }

  if (guard.state === GUARD_ALARM && guard.lastSeenX !== null) {
    moveToward(guard, guard.lastSeenX, guard.lastSeenY, GUARD.chaseSpeed * guard.speedFactor, dt);
    if (Math.hypot(player.x - guard.x, player.y - guard.y) < GUARD.catchRadius) {
      return 'caught';
    }
    return null;
  }

  if (guard.state === GUARD_SUSPICIOUS && guard.lastSeenX !== null) {
    // Creep toward where the player was glimpsed, then look around.
    const arrived = moveToward(guard, guard.lastSeenX, guard.lastSeenY, GUARD.patrolSpeed * 0.6, dt);
    if (arrived) {
      turnToward(guard, guard.facing + Math.PI * 0.9, 1.6, dt);
    }
    return null;
  }

  // Patrol: walk the waypoint loop, pausing briefly at each stop.
  if (guard.pauseLeft > 0) {
    guard.pauseLeft -= dt;
    turnToward(guard, guard.facing + 0.35, 0.5, dt); // glance around while waiting
    return null;
  }
  const target = guard.waypoints[guard.waypointIndex];
  if (moveToward(guard, target.x, target.y, GUARD.patrolSpeed * guard.speedFactor, dt)) {
    guard.waypointIndex = (guard.waypointIndex + 1) % guard.waypoints.length;
    guard.pauseLeft = GUARD.pauseAtWaypoint;
  }
  return null;
}

/** The highest detection meter among the guards — the HUD's alarm level. */
export function worstMeter(guards) {
  let worst = 0;
  for (const guard of guards) worst = Math.max(worst, guard.meter);
  return worst;
}

export function anyAlarm(guards) {
  return guards.some((guard) => guard.state === GUARD_ALARM);
}
