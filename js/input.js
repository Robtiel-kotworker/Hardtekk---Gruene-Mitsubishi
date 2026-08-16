// ============================================================================
// INPUT – Tastatur & On-Screen-Steuerung (D-Pad, A/B, Start/Select)
// ============================================================================

const KEY_MAP = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  w: "up",
  s: "down",
  a: "left",
  d: "right",
  Enter: "a",
  " ": "a",
  x: "b",
  Backspace: "b",
  Escape: "start",
  Shift: "select",
};

export function initInput(onAction) {
  window.addEventListener("keydown", (e) => {
    const action = KEY_MAP[e.key];
    if (!action) return;
    e.preventDefault();
    onAction(action, "down");
  });
  window.addEventListener("keyup", (e) => {
    const action = KEY_MAP[e.key];
    if (!action) return;
    onAction(action, "up");
  });

  document.querySelectorAll("[data-gb-button]").forEach((btn) => {
    const action = btn.getAttribute("data-gb-button");
    const fire = (evt) => {
      evt.preventDefault();
      onAction(action, "down");
      setTimeout(() => onAction(action, "up"), 80);
    };
    btn.addEventListener("click", fire);
    btn.addEventListener("touchstart", fire, { passive: false });
  });
}
