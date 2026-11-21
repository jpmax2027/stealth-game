// Night Ledger — the three levels. Each level is a grid of tiles plus lists of
// cover, documents, guards and the exit. Tile legend in the grid strings:
//   '#' wall   '.' floor   'C' crate (solid cover, blocks sight)
//   'B' bush (hides the player, blocks sight)   'D' document
//   'E' exit   'P' player start   'G' guard waypoint marker (see guards list)
import { COLS, ROWS } from './config.js';

function parseLevel(def) {
  const walls = [];
  const crates = [];
  const bushes = [];
  const docs = [];
  let exit = null;
  let playerStart = { x: 72, y: 72 };
  const grid = def.grid;
  for (let row = 0; row < ROWS; row += 1) {
    for (let col = 0; col < COLS; col += 1) {
      const ch = grid[row][col];
      const x = col * 48;
      const y = row * 48;
      if (ch === '#') walls.push({ x, y, w: 48, h: 48 });
      else if (ch === 'C') crates.push({ x, y, w: 48, h: 48 });
      else if (ch === 'B') bushes.push({ x, y, w: 48, h: 48 });
      else if (ch === 'D') docs.push({ x: x + 24, y: y + 24, taken: false });
      else if (ch === 'E') exit = { x, y, w: 48, h: 48 };
      else if (ch === 'P') playerStart = { x: x + 24, y: y + 24 };
    }
  }
  return {
    name: def.name,
    briefing: def.briefing,
    walls,
    crates,
    bushes,
    docs,
    exit,
    playerStart,
    guards: def.guards,
  };
}

// Guard waypoints are tile centres (col, row) the guard walks between.
export const LEVELS = [
  parseLevel({
    name: 'Level 1 — Arsip Malam',
    briefing: 'Ambil 3 dokumen, lalu keluar lewat pintu hijau. Jangan masuk kerucut kuning.',
    grid: [
      '##########################',
      '#P.......#.......#.......#',
      '#........#...D...#...C...#',
      '#..C.....#.......#.......#',
      '#........#...C...#...B...#',
      '#..B.....###.#####...#...#',
      '#........#.......#...#...#',
      '#...D....#...C...#...#..E#',
      '#........#.......#...#...#',
      '#..C.....#...B...#...#...#',
      '#........#.......#.......#',
      '#....D...#...C...#...C...#',
      '#........#.......#.......#',
      '##########################',
    ],
    guards: [
      { waypoints: [[6, 2], [6, 11], [11, 11], [11, 2]], speed: 1.0 },
      { waypoints: [[16, 11], [16, 2], [22, 2], [22, 11]], speed: 1.0 },
    ],
  }),
  parseLevel({
    name: 'Level 2 — Lorong Sunyi',
    briefing: 'Dua penjaga lagi, patroli lebih rapat. Semak menutupi langkahmu.',
    grid: [
      '##########################',
      '#P...#.......#....D......#',
      '#....#...C...#.....#.....#',
      '#.B..#.......#.C...#..C..#',
      '#....###.#####.....#.....#',
      '#....#.......#..B..#.....#',
      '#.D..#...C...#.....###.###',
      '#....#.......#.....#.....#',
      '#.C..#.B.....#.C...#..D..#',
      '#....#.......#.....#.....#',
      '#....###.#####..B..#..C..#',
      '#....#.......#.....#.....#',
      '#..D.#...C...#..D..#....E#',
      '##########################',
    ],
    guards: [
      { waypoints: [[4, 1], [4, 12], [8, 12], [8, 1]], speed: 1.15 },
      { waypoints: [[12, 2], [12, 11], [18, 11], [18, 2]], speed: 1.15 },
      { waypoints: [[22, 12], [22, 1], [24, 1], [24, 11]], speed: 1.05 },
    ],
  }),
  parseLevel({
    name: 'Level 3 — Ruang Brankas',
    briefing: 'Empat penjaga, penglihatan tajam. Sabar adalah kunci.',
    grid: [
      '##########################',
      '#P..#....D....#....C.....#',
      '#...#.........#..........#',
      '#.C.#....C....#.B...#..D.#',
      '#...###.#######.....#....#',
      '#...#.........#..C..#....#',
      '#.B.#....C....#.....###.##',
      '#...#.........#.....#....#',
      '#.D.#....B....#.C...#..C.#',
      '#...###.#######.....#....#',
      '#...#.........#..B..#....#',
      '#.C.#....C....#.D...#..D.#',
      '#...#.........#.........E#',
      '##########################',
    ],
    guards: [
      { waypoints: [[3, 1], [3, 12], [10, 12], [10, 1]], speed: 1.3 },
      { waypoints: [[12, 1], [12, 6], [16, 6], [16, 1]], speed: 1.3 },
      { waypoints: [[12, 12], [12, 7], [16, 7], [16, 12]], speed: 1.3 },
      { waypoints: [[20, 1], [20, 12], [23, 12], [23, 1]], speed: 1.2 },
    ],
  }),
];

export function levelCount() {
  return LEVELS.length;
}
