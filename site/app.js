const TOTAL = 12;
const STORAGE_KEY = "maths-trail-2026-2-3-run";

const state = {
  view: "trail",
  start: 1,
  current: 1,
  path: loadPath(),
};

const problemSrc = (n) => `./assets/problems/problem-${String(n).padStart(2, "0")}.jpg`;
const answerSrc = (n) => `./assets/answers/answer-${String(n).padStart(2, "0")}.png`;
const $ = (selector) => document.querySelector(selector);

const slotPositions = [
  { x: 7, y: 5, w: 17, h: 14 },
  { x: 28, y: 5, w: 17, h: 14 },
  { x: 49, y: 5, w: 17, h: 14 },
  { x: 70, y: 5, w: 17, h: 14 },
  { x: 82, y: 29, w: 15, h: 14 },
  { x: 82, y: 56, w: 15, h: 14 },
  { x: 70, y: 81, w: 17, h: 14 },
  { x: 49, y: 81, w: 17, h: 14 },
  { x: 28, y: 81, w: 17, h: 14 },
  { x: 7, y: 81, w: 17, h: 14 },
  { x: 1, y: 56, w: 15, h: 14 },
  { x: 1, y: 29, w: 15, h: 14 },
];

const arrows = [
  { x: 23.2, y: 11.5, w: 5.8, dir: "right" },
  { x: 44.2, y: 11.5, w: 5.8, dir: "right" },
  { x: 65.2, y: 11.5, w: 5.8, dir: "right" },
  { x: 88.6, y: 22.5, w: 6.2, dir: "down" },
  { x: 89.4, y: 47.5, w: 6.2, dir: "down" },
  { x: 65.2, y: 86.9, w: 5.8, dir: "left" },
  { x: 44.2, y: 86.9, w: 5.8, dir: "left" },
  { x: 23.2, y: 86.9, w: 5.8, dir: "left" },
  { x: 5.7, y: 73.5, w: 6.2, dir: "up" },
  { x: 5.7, y: 47.5, w: 6.2, dir: "up" },
  { x: 6.3, y: 22.5, w: 6.2, dir: "up" },
];

function loadPath() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    const clean = parsed
      .map(Number)
      .filter((n, index, arr) => Number.isInteger(n) && n >= 1 && n <= TOTAL && arr.indexOf(n) === index);
    return clean.length ? clean : [1];
  } catch {
    return [1];
  }
}

function savePath() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.path));
}

function syncCurrentFromPath() {
  state.start = state.path[0] || 1;
  state.current = state.path[state.path.length - 1] || state.start;
}

function setView(view) {
  state.view = view;
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.classList.toggle("is-active", tab.dataset.view === view);
  });
  document.querySelectorAll(".view").forEach((section) => {
    section.classList.toggle("is-active", section.id === `${view}-view`);
  });
}

function setStart(n) {
  state.start = n;
  state.current = n;
  state.path = [n];
  savePath();
  renderTrail();
}

function renderCirclePicker() {
  const picker = $("#start-picker");
  picker.innerHTML = "";
  for (let n = 1; n <= TOTAL; n += 1) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "circle-button";
    button.textContent = n;
    button.setAttribute("aria-label", `${n}번에서 시작`);
    button.addEventListener("click", () => {
      if (state.path.length > 1 && !confirm(`${n}번에서 새로 시작할까요? 지금 기록은 지워집니다.`)) return;
      setStart(n);
    });
    picker.append(button);
  }
}

function renderTrailDiagram() {
  const diagram = $("#trail-diagram");
  diagram.innerHTML = "";

  slotPositions.forEach((position, index) => {
    const slot = document.createElement("button");
    const value = state.path[index];
    slot.type = "button";
    slot.className = "trail-slot";
    slot.style.setProperty("--x", `${position.x}%`);
    slot.style.setProperty("--y", `${position.y}%`);
    slot.style.setProperty("--w", `${position.w}%`);
    slot.style.setProperty("--h", `${position.h}%`);
    slot.textContent = value || "";
    slot.disabled = !value;
    slot.setAttribute("aria-label", value ? `${value}번부터 삭제` : "빈 기록칸");
    slot.addEventListener("click", () => deleteFromSlot(index));
    diagram.append(slot);
  });

  arrows.forEach((arrow) => {
    const el = document.createElement("span");
    el.className = `trail-arrow ${arrow.dir}`;
    el.style.setProperty("--x", `${arrow.x}%`);
    el.style.setProperty("--y", `${arrow.y}%`);
    el.style.setProperty("--w", `${arrow.w}%`);
    diagram.append(el);
  });

  const center = document.createElement("div");
  center.className = "trail-center";
  center.innerHTML = "<strong>&lt;Maths Trail&gt;</strong><span>Circle Number만 쓰세요</span>";
  diagram.append(center);
}

function deleteFromSlot(index) {
  if (index <= 0 || index >= state.path.length) return;
  const removed = state.path[index];
  if (!confirm(`${removed}번부터 뒤의 기록을 삭제할까요?`)) return;
  state.path = state.path.slice(0, index);
  syncCurrentFromPath();
  savePath();
  renderTrail();
}

function renderAnswers() {
  const grid = $("#answer-grid");
  const template = $("#answer-template");
  const used = new Set(state.path);
  grid.innerHTML = "";

  for (let n = 1; n <= TOTAL; n += 1) {
    if (used.has(n)) continue;
    const node = template.content.firstElementChild.cloneNode(true);
    node.dataset.answer = String(n);
    node.setAttribute("aria-label", `${n}번 previous answer 선택`);
    node.querySelector(".choice-number").textContent = n;
    node.querySelector("img").src = answerSrc(n);
    node.querySelector("img").alt = `${n}번 previous answer 이미지`;
    node.addEventListener("click", () => chooseAnswer(n));
    grid.append(node);
  }
}

function chooseAnswer(n) {
  if (!confirm(`${n}번 circle number를 정답으로 선택할까요?`)) return;
  state.path.push(n);
  state.current = n;
  savePath();
  renderTrail();
}

function renderTrail() {
  syncCurrentFromPath();
  $("#current-title").textContent = `Circle ${state.current}`;
  $("#current-problem").src = problemSrc(state.current);
  $("#current-problem").alt = `${state.current}번 문제 이미지`;

  document.querySelectorAll("#start-picker .circle-button").forEach((button, index) => {
    button.classList.toggle("is-active", index + 1 === state.start);
    button.disabled = state.path.length > 1 && index + 1 !== state.start;
  });

  renderTrailDiagram();
  renderAnswers();
  renderStatus();
  renderAllCards();
}

function renderStatus() {
  const box = $("#status-box");
  const remaining = TOTAL - state.path.length;
  box.className = "status-box";
  if (remaining === 0) {
    box.classList.add("good");
    box.innerHTML = "12개 circle number를 모두 기록했습니다. 잘못 고른 번호가 있으면 기록지의 번호를 눌러 삭제할 수 있습니다.";
    return;
  }
  box.innerHTML = `현재 <strong>${state.current}번</strong> 문제입니다. 선택하면 기록지에 들어가고, 그 번호의 문제가 다음에 표시됩니다. 남은 번호: <strong>${remaining}</strong>`;
}

function renderAllCards() {
  const grid = $("#all-cards");
  grid.innerHTML = "";
  const used = new Set(state.path);
  for (let n = 1; n <= TOTAL; n += 1) {
    const card = document.createElement("article");
    card.className = "all-card";
    const img = document.createElement("img");
    img.src = problemSrc(n);
    img.alt = `${n}번 문제 이미지`;
    const title = document.createElement("div");
    title.className = "all-card-title";
    title.innerHTML = `<span>Circle ${n}</span><span class="mapped-label">${used.has(n) ? "기록됨" : "남음"}</span>`;
    card.append(img, title);
    grid.append(card);
  }
}

function bindEvents() {
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => setView(tab.dataset.view));
  });

  $("#restart-run").addEventListener("click", () => {
    if (state.path.length > 1 && !confirm("처음부터 다시 시작할까요?")) return;
    setStart(state.start);
  });

  $("#undo-run").addEventListener("click", () => {
    if (state.path.length <= 1) return;
    const removed = state.path.at(-1);
    if (!confirm(`${removed}번 기록을 삭제할까요?`)) return;
    state.path.pop();
    syncCurrentFromPath();
    savePath();
    renderTrail();
  });

  $("#show-current-in-all").addEventListener("click", () => setView("all"));
}

function init() {
  syncCurrentFromPath();
  bindEvents();
  renderCirclePicker();
  renderTrail();
}

init();
