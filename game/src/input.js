// Night Ledger — keyboard and mouse input. WASD / arrows move, Shift sneaks,
// E interacts, P or Escape pauses, Enter confirms, R restarts, M mutes.
export function makeInput() {
  return {
    keys: new Set(),
    mouseX: 0,
    mouseY: 0,
    mouseClicked: false,
    muted: false,
  };
}

export function attachInput(input, canvas, onKey) {
  window.addEventListener('keydown', (event) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(event.key)) {
      event.preventDefault();
    }
    if (!event.repeat) {
      input.keys.add(event.key.toLowerCase());
      if (onKey) onKey(event.key.toLowerCase());
    }
  });
  window.addEventListener('keyup', (event) => {
    input.keys.delete(event.key.toLowerCase());
  });
  window.addEventListener('blur', () => input.keys.clear());
  canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    input.mouseX = ((event.clientX - rect.left) / rect.width) * 1280;
    input.mouseY = ((event.clientY - rect.top) / rect.height) * 720;
  });
  canvas.addEventListener('mousedown', (event) => {
    const rect = canvas.getBoundingClientRect();
    input.mouseX = ((event.clientX - rect.left) / rect.width) * 1280;
    input.mouseY = ((event.clientY - rect.top) / rect.height) * 720;
    input.mouseClicked = true;
  });
}

/** Movement direction from the held keys, as a unit-ish vector. */
export function moveDirection(input) {
  let dx = 0;
  let dy = 0;
  if (input.keys.has('a') || input.keys.has('arrowleft')) dx -= 1;
  if (input.keys.has('d') || input.keys.has('arrowright')) dx += 1;
  if (input.keys.has('w') || input.keys.has('arrowup')) dy -= 1;
  if (input.keys.has('s') || input.keys.has('arrowdown')) dy += 1;
  return { dx, dy };
}

export function isSneaking(input) {
  return input.keys.has('shift');
}

export function consumeClick(input) {
  const clicked = input.mouseClicked;
  input.mouseClicked = false;
  return clicked;
}
