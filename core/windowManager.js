// /core/windowManager.js

/* =========================
   STATE
========================= */
let windowIdCounter = 1;
let zIndexCounter = 100;
let dragTarget = null;
let dragOffsetX = 0;
let dragOffsetY = 0;

// Losowe pozycjonowanie okien
let lastWindowX = 100;
let lastWindowY = 60;

/* =========================
   PUBLIC API
========================= */

export function createWindow(title, contentHTML, width = 400, height = 300) {
  const windowId = windowIdCounter++;

  const win = document.createElement("div");
  win.className = "window";
  win.dataset.windowId = windowId;
  win.style.position = "absolute";
  win.style.width = width + "px";
  win.style.height = height + "px";

  // Losowe pozycjonowanie (z kaskadą)
  win.style.left = lastWindowX + "px";
  win.style.top = lastWindowY + "px";
  win.style.zIndex = ++zIndexCounter;

  // Aktualizuj pozycję dla następnego okna
  lastWindowX += 30;
  lastWindowY += 30;

  // Reset jeśli za daleko od ekranu
  if (lastWindowX > window.innerWidth - 250) {
    lastWindowX = 100;
  }
  if (lastWindowY > window.innerHeight - 250) {
    lastWindowY = 60;
  }

  win.innerHTML = `
    <div class="titlebar">
      <span class="title">${title}</span>
      <button class="close">✕</button>
    </div>
    <div class="content">
      ${contentHTML}
    </div>
  `;

  document.getElementById("desktop").appendChild(win);

  // Emit window:open event dla taskbar
  document.dispatchEvent(new CustomEvent("window:open", {
    detail: { id: windowId, title }
  }));

  // Focus przy kliknięciu
  win.addEventListener("mousedown", () => {
    bringToFront(win);

    // Emit window:focus event
    document.dispatchEvent(new CustomEvent("window:focus", {
      detail: { id: windowId }
    }));
  });

  // Close button
  const closeBtn = win.querySelector(".close");
  closeBtn.onclick = (e) => {
    e.stopPropagation(); // Nie triggeruj focus

    // Emit window:close event
    document.dispatchEvent(new CustomEvent("window:close", {
      detail: { id: windowId }
    }));

    win.remove();
  };

  // Drag functionality
  const titlebar = win.querySelector(".titlebar");
  titlebar.addEventListener("mousedown", e => {
    // Nie drag jeśli kliknięto close button
    if (e.target.classList.contains("close")) return;
    startDrag(e, win);
  });

  // Auto-focus nowego okna
  bringToFront(win);
  document.dispatchEvent(new CustomEvent("window:focus", {
    detail: { id: windowId }
  }));

  return win;
}

/* =========================
   INTERNALS
========================= */

function bringToFront(win) {
  win.style.zIndex = ++zIndexCounter;
}

function startDrag(e, win) {
  dragTarget = win;
  dragOffsetX = e.clientX - win.offsetLeft;
  dragOffsetY = e.clientY - win.offsetTop;

  bringToFront(win);

  // Dodaj klasę podczas przeciągania (opcjonalnie)
  win.classList.add("dragging");
}

/* =========================
   GLOBAL DRAG HANDLERS
========================= */

document.addEventListener("mousemove", e => {
  if (!dragTarget) return;

  let newX = e.clientX - dragOffsetX;
  let newY = e.clientY - dragOffsetY;

  // Opcjonalnie: ogranicz do obszaru ekranu
  const maxX = window.innerWidth - dragTarget.offsetWidth;
  const maxY = window.innerHeight - dragTarget.offsetHeight - 28; // 28px = taskbar

  newX = Math.max(0, Math.min(newX, maxX));
  newY = Math.max(0, Math.min(newY, maxY));

  dragTarget.style.left = newX + "px";
  dragTarget.style.top = newY + "px";
});

document.addEventListener("mouseup", () => {
  if (dragTarget) {
    dragTarget.classList.remove("dragging");
    dragTarget = null;
  }
});

/* =========================
   UTILITIES (opcjonalne)
========================= */

// Minimalizuj okno (dla przyszłych rozszerzeń)
export function minimizeWindow(windowId) {
  const win = document.querySelector(`.window[data-window-id="${windowId}"]`);
  if (win) {
    win.style.display = "none";
    document.dispatchEvent(new CustomEvent("window:minimize", {
      detail: { id: windowId }
    }));
  }
}

// Przywróć okno (dla przyszłych rozszerzeń)
export function restoreWindow(windowId) {
  const win = document.querySelector(`.window[data-window-id="${windowId}"]`);
  if (win) {
    win.style.display = "block";
    bringToFront(win);
    document.dispatchEvent(new CustomEvent("window:focus", {
      detail: { id: windowId }
    }));
  }
}

// Zamknij wszystkie okna (np. przy wylogowaniu)
export function closeAllWindows() {
  document.querySelectorAll(".window").forEach(win => {
    const id = win.dataset.windowId;
    document.dispatchEvent(new CustomEvent("window:close", {
      detail: { id: parseInt(id) }
    }));
    win.remove();
  });
}