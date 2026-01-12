// /core/desktop.js
console.log("DESKTOP MODULE LOADED");

import { FILESYSTEM } from "../data/filesystemData.js";
import { getDesktopNode } from "./filesystem.js";
import { renderIconList, deselectAllIcons } from "./iconRenderer.js";

/* =========================
   INIT
========================= */

export function initDesktop() {
  const desktopNode = findDesktopNode(FILESYSTEM);
  if (!desktopNode) {
    console.error("Brak pulpitu w filesystemData");
    return;
  }

  renderIcons(desktopNode.children);
  setupDesktopInteractions();
}

/* =========================
   SNAKE UNLOCK EASTER EGG
========================= */

window.addEventListener("snake:unlock", e => {
  unlockSnakeFile(e.detail.score);
});

function unlockSnakeFile(score) {
  const desktop = getDesktopNode();

  const exists = desktop.children.some(
    n => n.name === "Odblokowany_plik.txt"
  );
  if (exists) return;

  desktop.children.push({
    type: "txt",
    name: "Odblokowany_plik.txt",
    readOnly: true,
    content: `WYNIK: ${score}

To nie była zwykła gra.
Jeśli to czytasz, znaczy że system Ci zaufał.`
  });

  refreshDesktop();
  alert("Nowy plik został odblokowany na pulpicie.");
}



/* =========================
   RUN COMMANDS
========================= */

function handleRunCommand(cmd) {
  if (cmd === "bubunio") {
    unlockRunFile();
  } else {
    alert("Nie można odnaleźć pliku lub polecenia.");
  }
}

function unlockRunFile() {
  const desktop = getDesktopNode();

  const exists = desktop.children.some(
    n => n.name === "akturodzenia.html"
  );
  if (exists) return;

  desktop.children.push({
    type: "txt",
    name: "akturodzenia.html",
    readOnly: true,
    src: "assets/texts/akt_pochodzenia.html"
  });

  refreshDesktop();
  alert("Na pulpicie pojawił się nowy plik.");
}

/* =========================
   FIND DESKTOP
========================= */

function findDesktopNode(root) {
  if (root.type === "desktop") return root;
  if (!root.children) return null;

  for (const child of root.children) {
    const found = findDesktopNode(child);
    if (found) return found;
  }
  return null;
}

/* =========================
   RENDER ICONS
========================= */

function renderIcons(nodes) {
  const container = document.getElementById("icons");

  // Używamy uniwersalnego rendera
  renderIconList(nodes, container, {
    className: "icon",
    imageClass: "icon-image",
    labelClass: "icon-label",
    context: "desktop",
    emptyMessage: "Pulpit jest pusty"
  });
}

/* =========================
   DESKTOP INTERACTIONS
========================= */

function setupDesktopInteractions() {
  const desktop = document.getElementById("desktop");

  // Kliknięcie w pusty obszar odznacza ikony
  desktop.addEventListener("click", (e) => {
    if (e.target === desktop || e.target.id === "icons") {
      const iconsContainer = document.getElementById("icons");
      deselectAllIcons(iconsContainer);
    }
  });
}

/* =========================
   RUN DIALOG
========================= */

window.openRunDialog = function () {
  const dialog = document.createElement("div");
  dialog.className = "run-dialog";

  dialog.innerHTML = `
    <div class="run-title">Uruchom</div>
    <input id="run-input" type="text" placeholder="Wpisz polecenie">
    <div class="run-actions">
      <button id="run-ok">OK</button>
      <button id="run-cancel">Anuluj</button>
    </div>
  `;

  document.body.appendChild(dialog);

  document.getElementById("run-ok").onclick = () => {
    const value = document.getElementById("run-input").value.trim();
    handleRunCommand(value);
    dialog.remove();
  };

  document.getElementById("run-cancel").onclick = () => {
    dialog.remove();
  };
};


/* =========================
   PUBLIC API
========================= */

export function refreshDesktop() {
  const desktopNode = findDesktopNode(FILESYSTEM);
  if (desktopNode) {
    renderIcons(desktopNode.children);
  }

}
