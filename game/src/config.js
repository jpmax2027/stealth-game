// Night Ledger — shared tuning constants. One place holds every number the
// rest of the game reads, so balancing is a single-file job.
export const TILE = 48;
export const COLS = 26;
export const ROWS = 14;
export const HUD_H = 48;
export const WORLD_W = COLS * TILE;
export const WORLD_H = ROWS * TILE;
export const VIEW_W = 1280;
export const VIEW_H = HUD_H + WORLD_H;

export const STEP = 1 / 60;

// Player movement (pixels per second).
export const PLAYER = {
  radius: 15,
  walkSpeed: 150,
  sneakSpeed: 78,
  runSpeed: 205,
};

// Guard vision and movement.
export const GUARD = {
  radius: 15,
  patrolSpeed: 68,
  chaseSpeed: 148,
  viewRange: 235,
  halfAngle: 0.61, // ~35 degrees each side of the facing direction
  pauseAtWaypoint: 1.3, // seconds a guard waits at each waypoint
  catchRadius: 26,
  alertMemory: 3.0, // seconds of lost sight before an alert guard gives up
};

// Detection meter 0..100. Rates are per second while the player is seen.
export const DETECTION = {
  baseRate: 42, // at mid range, walking
  closeBonus: 55, // extra rate when the player is very close
  sneakFactor: 0.45, // sneaking fills the meter much slower
  runFactor: 1.5, // running fills it faster
  decayRate: 26, // meter falls per second while unseen
  suspiciousAt: 40, // guard turns toward the player and creeps closer
  alarmAt: 100,
};

export const COLOURS = {
  floor: '#1c2431',
  floorAlt: '#202938',
  wall: '#3a4356',
  wallTop: '#4b576e',
  crate: '#7a5a33',
  crateEdge: '#a07d4a',
  bush: '#2e5d33',
  bushLeaf: '#3f7d46',
  exitLocked: '#5a3a3a',
  exitOpen: '#2fae5f',
  player: '#e8c33c',
  guard: '#d84a4a',
  coneCalm: 'rgba(232, 195, 60, 0.20)',
  coneSuspicious: 'rgba(232, 140, 40, 0.32)',
  coneAlarm: 'rgba(216, 60, 60, 0.38)',
  doc: '#7fd4ff',
  hud: '#0e1420',
  text: '#e8ecf2',
  muted: '#9aa7b8',
};
