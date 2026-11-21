// Night Ledger — all canvas drawing: the level, vision cones, guards, the
// player, the HUD, the minimap and the title / pause / win / caught screens.
import { TILE, COLS, ROWS, HUD_H, VIEW_W, VIEW_H, GUARD, COLOURS } from './config.js';
import { GUARD_ALARM, GUARD_SUSPICIOUS } from './guards.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSE = 'pause';
export const SCREEN_CAUGHT = 'caught';
export const SCREEN_LEVEL_CLEAR = 'level-clear';
export const SCREEN_WIN = 'win';

function drawCone(ctx, guard) {
  const range = GUARD.viewRange;
  const half = GUARD.halfAngle;
  let fill = COLOURS.coneCalm;
  if (guard.state === GUARD_ALARM) fill = COLOURS.coneAlarm;
  else if (guard.state === GUARD_SUSPICIOUS) fill = COLOURS.coneSuspicious;
  ctx.beginPath();
  ctx.moveTo(guard.x, guard.y);
  ctx.arc(guard.x, guard.y, range, guard.facing - half, guard.facing + half);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = guard.state === GUARD_ALARM ? 'rgba(255,90,90,0.7)' : 'rgba(232,195,60,0.45)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

function drawGuard(ctx, guard) {
  drawCone(ctx, guard);
  // Body: dark uniform with a red cap and a facing tick.
  ctx.beginPath();
  ctx.arc(guard.x, guard.y, GUARD.radius, 0, Math.PI * 2);
  ctx.fillStyle = '#2b2f3a';
  ctx.fill();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = COLOURS.guard;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(guard.x, guard.y, 7, 0, Math.PI * 2);
  ctx.fillStyle = COLOURS.guard;
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(guard.x, guard.y);
  ctx.lineTo(guard.x + Math.cos(guard.facing) * 22, guard.y + Math.sin(guard.facing) * 22);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.stroke();
  // Detection meter above the guard.
  if (guard.meter > 2) {
    const w = 36;
    const x = guard.x - w / 2;
    const y = guard.y - GUARD.radius - 14;
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(x - 1, y - 1, w + 2, 7);
    ctx.fillStyle = guard.meter >= 100 ? '#ff4444' : guard.meter >= 40 ? '#ffaa22' : '#e8c33c';
    ctx.fillRect(x, y, (w * guard.meter) / 100, 5);
  }
  if (guard.state === GUARD_ALARM) {
    ctx.fillStyle = '#ff5555';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('!', guard.x, guard.y - GUARD.radius - 20);
  } else if (guard.state === GUARD_SUSPICIOUS) {
    ctx.fillStyle = '#ffcc44';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('?', guard.x, guard.y - GUARD.radius - 20);
  }
}

function drawPlayer(ctx, player) {
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
  ctx.fillStyle = player.hidden ? '#5f7a3a' : COLOURS.player;
  ctx.fill();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = '#1a1a1a';
  ctx.stroke();
  // Hooded head: a darker centre dot.
  ctx.beginPath();
  ctx.arc(player.x, player.y, 6, 0, Math.PI * 2);
  ctx.fillStyle = '#3a2f10';
  ctx.fill();
  if (player.hidden) {
    ctx.fillStyle = '#cfe8a8';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('TERSEMBUNYI', player.x, player.y - player.radius - 8);
  }
}

function drawLevel(ctx, level, player, guards) {
  // Checkerboard floor.
  for (let row = 0; row < ROWS; row += 1) {
    for (let col = 0; col < COLS; col += 1) {
      ctx.fillStyle = (row + col) % 2 === 0 ? COLOURS.floor : COLOURS.floorAlt;
      ctx.fillRect(col * TILE, row * TILE, TILE, TILE);
    }
  }
  // Exit door (green and glowing once every document is collected).
  const exit = level.exit;
  const open = player.docs >= level.docs.length;
  ctx.fillStyle = open ? COLOURS.exitOpen : COLOURS.exitLocked;
  ctx.fillRect(exit.x + 4, exit.y + 4, exit.w - 8, exit.h - 8);
  ctx.strokeStyle = open ? '#a8f0c0' : '#8a5a5a';
  ctx.lineWidth = 2;
  ctx.strokeRect(exit.x + 4, exit.y + 4, exit.w - 8, exit.h - 8);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(open ? 'KELUAR' : 'TERKUNCI', exit.x + 24, exit.y + 28);
  // Documents.
  for (const doc of level.docs) {
    if (doc.taken) continue;
    ctx.fillStyle = COLOURS.doc;
    ctx.fillRect(doc.x - 8, doc.y - 11, 16, 22);
    ctx.fillStyle = '#0e1420';
    ctx.fillRect(doc.x - 5, doc.y - 7, 10, 2);
    ctx.fillRect(doc.x - 5, doc.y - 2, 10, 2);
    ctx.fillRect(doc.x - 5, doc.y + 3, 7, 2);
  }
  // Walls.
  for (const wall of level.walls) {
    ctx.fillStyle = COLOURS.wall;
    ctx.fillRect(wall.x, wall.y, wall.w, wall.h);
    ctx.fillStyle = COLOURS.wallTop;
    ctx.fillRect(wall.x, wall.y, wall.w, 5);
  }
  // Crates (solid cover).
  for (const crate of level.crates) {
    ctx.fillStyle = COLOURS.crate;
    ctx.fillRect(crate.x + 2, crate.y + 2, crate.w - 4, crate.h - 4);
    ctx.strokeStyle = COLOURS.crateEdge;
    ctx.lineWidth = 2;
    ctx.strokeRect(crate.x + 2, crate.y + 2, crate.w - 4, crate.h - 4);
    ctx.beginPath();
    ctx.moveTo(crate.x + 2, crate.y + 2);
    ctx.lineTo(crate.x + crate.w - 2, crate.y + crate.h - 2);
    ctx.moveTo(crate.x + crate.w - 2, crate.y + 2);
    ctx.lineTo(crate.x + 2, crate.y + crate.h - 2);
    ctx.stroke();
  }
  // Bushes (hiding cover).
  for (const bush of level.bushes) {
    ctx.fillStyle = COLOURS.bush;
    ctx.fillRect(bush.x + 1, bush.y + 1, bush.w - 2, bush.h - 2);
    ctx.fillStyle = COLOURS.bushLeaf;
    for (let i = 0; i < 5; i += 1) {
      const lx = bush.x + 10 + (i % 3) * 14;
      const ly = bush.y + 12 + Math.floor(i / 3) * 18;
      ctx.beginPath();
      ctx.arc(lx, ly, 9, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  for (const guard of guards) drawGuard(ctx, guard);
  drawPlayer(ctx, player);
}

function drawHud(ctx, state) {
  const { level, levelIndex, player, guards } = state;
  ctx.fillStyle = COLOURS.hud;
  ctx.fillRect(0, 0, VIEW_W, HUD_H);
  ctx.fillStyle = COLOURS.text;
  ctx.font = 'bold 17px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(level.name, 14, 30);
  ctx.font = '15px sans-serif';
  ctx.fillStyle = COLOURS.muted;
  ctx.fillText(level.briefing, 260, 30);
  // Documents.
  ctx.fillStyle = COLOURS.doc;
  ctx.font = 'bold 15px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(`Dokumen ${player.docs}/${level.docs.length}`, VIEW_W - 190, 30);
  // Detection status.
  let worst = 0;
  let alarm = false;
  for (const guard of guards) {
    worst = Math.max(worst, guard.meter);
    if (guard.state === GUARD_ALARM) alarm = true;
  }
  ctx.fillStyle = alarm ? '#ff5555' : worst >= 40 ? '#ffaa22' : '#7fd4a8';
  ctx.fillText(alarm ? 'ALARM!' : worst >= 40 ? 'CURIGA' : 'AMAN', VIEW_W - 60, 30);
  // Alarm bar under the HUD.
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.fillRect(14, HUD_H - 8, 200, 5);
  ctx.fillStyle = alarm ? '#ff4444' : worst >= 40 ? '#ffaa22' : '#e8c33c';
  ctx.fillRect(14, HUD_H - 8, (200 * worst) / 100, 5);
  void levelIndex;
}

function drawMinimap(ctx, level, player, guards) {
  const scale = 0.125;
  const w = COLS * TILE * scale;
  const h = ROWS * TILE * scale;
  const x0 = VIEW_W - w - 12;
  const y0 = HUD_H + 12;
  ctx.fillStyle = 'rgba(8,12,20,0.78)';
  ctx.fillRect(x0 - 4, y0 - 4, w + 8, h + 8);
  ctx.fillStyle = '#2a3345';
  ctx.fillRect(x0, y0, w, h);
  for (const wall of level.walls) {
    ctx.fillStyle = '#5a6a85';
    ctx.fillRect(x0 + wall.x * scale, y0 + wall.y * scale, wall.w * scale, wall.h * scale);
  }
  for (const crate of level.crates) {
    ctx.fillStyle = '#8a6a3a';
    ctx.fillRect(x0 + crate.x * scale, y0 + crate.y * scale, crate.w * scale, crate.h * scale);
  }
  if (level.exit) {
    ctx.fillStyle = player.docs >= level.docs.length ? '#2fae5f' : '#7a4a4a';
    ctx.fillRect(x0 + level.exit.x * scale, y0 + level.exit.y * scale, 8, 8);
  }
  for (const doc of level.docs) {
    if (doc.taken) continue;
    ctx.fillStyle = COLOURS.doc;
    ctx.fillRect(x0 + doc.x * scale - 2, y0 + doc.y * scale - 2, 4, 4);
  }
  for (const guard of guards) {
    ctx.fillStyle = '#ff5555';
    ctx.beginPath();
    ctx.arc(x0 + guard.x * scale, y0 + guard.y * scale, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = COLOURS.player;
  ctx.beginPath();
  ctx.arc(x0 + player.x * scale, y0 + player.y * scale, 3.5, 0, Math.PI * 2);
  ctx.fill();
}

function drawButton(ctx, x, y, w, h, label, hover) {
  ctx.fillStyle = hover ? '#e8c33c' : '#2a3345';
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = hover ? '#ffffff' : '#5a6a85';
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, w, h);
  ctx.fillStyle = hover ? '#1a1a1a' : COLOURS.text;
  ctx.font = 'bold 18px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(label, x + w / 2, y + h / 2 + 6);
}

function overlay(ctx, title, lines, button) {
  ctx.fillStyle = 'rgba(6,10,18,0.82)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  ctx.fillStyle = COLOURS.text;
  ctx.font = 'bold 44px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(title, VIEW_W / 2, 210);
  ctx.font = '18px sans-serif';
  ctx.fillStyle = COLOURS.muted;
  lines.forEach((line, i) => ctx.fillText(line, VIEW_W / 2, 260 + i * 30));
  if (button) drawButton(ctx, button.x, button.y, button.w, button.h, button.label, button.hover);
}

export function render(ctx, state, input) {
  ctx.clearRect(0, 0, VIEW_W, VIEW_H);
  ctx.save();
  ctx.translate(0, HUD_H);
  if (state.screen === SCREEN_TITLE) {
    drawLevel(ctx, state.level, state.player, state.guards);
    ctx.restore();
    overlay(ctx, 'NIGHT LEDGER', [
      'Menyelinap di malam hari. Ambil semua dokumen, lalu keluar tanpa terlihat.',
      'WASD / panah: bergerak   •   Shift: menyelinap pelan   •   E: ambil dokumen',
      'Peti menahan pandangan penjaga. Semak menyembunyikanmu. Kerucut kuning = terlihat.',
      'P / Esc: jeda   •   M: bisu   •   R: ulangi level',
    ], { x: VIEW_W / 2 - 110, y: 430, w: 220, h: 52, label: 'MULAI', hover: false });
    return;
  }
  drawLevel(ctx, state.level, state.player, state.guards);
  ctx.restore();
  drawHud(ctx, state);
  drawMinimap(ctx, state.level, state.player, state.guards);
  ctx.fillStyle = COLOURS.muted;
  ctx.font = '13px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('Shift = menyelinap  •  E = ambil dokumen  •  P = jeda', 14, VIEW_H - 12);

  if (state.screen === SCREEN_PAUSE) {
    overlay(ctx, 'JEDA', ['Istirahat sejenak. Penjaga tidak bergerak saat jeda.'], {
      x: VIEW_W / 2 - 110, y: 400, w: 220, h: 52, label: 'LANJUT', hover: false,
    });
  } else if (state.screen === SCREEN_CAUGHT) {
    overlay(ctx, 'TERTANGKAP!', ['Penjaga menemukanmu. Coba lagi — pelajari rute patrolinya.'], {
      x: VIEW_W / 2 - 110, y: 400, w: 220, h: 52, label: 'COBA LAGI', hover: false,
    });
  } else if (state.screen === SCREEN_LEVEL_CLEAR) {
    overlay(ctx, 'LEVEL SELESAI', ['Semua dokumen aman. Pintu terbuka — lanjut ke level berikutnya.'], {
      x: VIEW_W / 2 - 110, y: 400, w: 220, h: 52, label: 'LEVEL BERIKUTNYA', hover: false,
    });
  } else if (state.screen === SCREEN_WIN) {
    overlay(ctx, 'SEMUA DOKUMEN AMAN', ['Kau keluar tanpa terlihat. Night Ledger selesai — kau hantu yang tak terlihat.'], {
      x: VIEW_W / 2 - 110, y: 400, w: 220, h: 52, label: 'MAIN LAGI', hover: false,
    });
  }
  void input;
}
