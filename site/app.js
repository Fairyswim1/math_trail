const TOTAL = 12;
const STORAGE_KEY = "maths-trail-2026-2-3-run";
const CORRECT_CYCLE = [1, 2, 8, 5, 11, 10, 6, 3, 7, 9, 4, 12];

const state = {
  view: "trail",
  start: 1,
  current: 1,
  path: loadPath(),
  submitted: false,
  correct: null,
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
    const used = new Set();
    const clean = parsed
      .map(Number)
      .filter((n) => {
        const ok = Number.isInteger(n) && n >= 1 && n <= TOTAL && !used.has(n);
        if (ok) used.add(n);
        return ok;
      });
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

function expectedPath(start) {
  const index = CORRECT_CYCLE.indexOf(start);
  return [...CORRECT_CYCLE.slice(index), ...CORRECT_CYCLE.slice(0, index)];
}

function isCorrectPath(path) {
  if (path.length !== TOTAL) return false;
  return expectedPath(path[0]).every((n, index) => n === path[index]);
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
  state.submitted = false;
  state.correct = null;
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
  state.submitted = false;
  state.correct = null;
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
  state.submitted = false;
  state.correct = null;
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
  renderResult();
  renderAllCards();
}

function renderStatus() {
  const box = $("#status-box");
  const remaining = TOTAL - state.path.length;
  box.className = "status-box";
  if (remaining === 0) {
    box.classList.add("good");
    box.innerHTML = "12개 circle number를 모두 기록했습니다. 제출 버튼을 눌러 정답 여부를 확인하세요.";
    return;
  }
  box.innerHTML = `현재 <strong>${state.current}번</strong> 문제입니다. 선택하면 기록지에 들어가고, 그 번호의 문제가 다음에 표시됩니다. 남은 번호: <strong>${remaining}</strong>`;
}

function renderResult() {
  const box = $("#result-box");
  if (!state.submitted) {
    box.hidden = true;
    box.textContent = "";
    box.className = "result-box";
    return;
  }

  box.hidden = false;
  box.className = `result-box ${state.correct ? "correct" : "incorrect"}`;
  box.innerHTML = state.correct
    ? "<strong>현진쌤의 특급 칭찬!</strong><span>정답입니다. 완벽하게 순환을 완성했어요.</span>"
    : "<strong>다시 확인하세요.</strong><span>잘못 고른 번호가 있으면 기록지의 번호를 눌러 되돌릴 수 있습니다.</span>";
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

function playCelebrationSound() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  const ctx = new AudioContext();
  const notes = [523.25, 659.25, 783.99, 1046.5];
  notes.forEach((frequency, index) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.value = frequency;
    gain.gain.setValueAtTime(0.001, ctx.currentTime + index * 0.12);
    gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + index * 0.12 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + index * 0.12 + 0.26);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime + index * 0.12);
    osc.stop(ctx.currentTime + index * 0.12 + 0.28);
  });
}

function launchConfetti() {
  const layer = document.createElement("div");
  layer.className = "confetti-layer";
  document.body.append(layer);
  for (let i = 0; i < 90; i += 1) {
    const piece = document.createElement("span");
    piece.className = "confetti-piece";
    piece.style.setProperty("--x", `${Math.random() * 100}vw`);
    piece.style.setProperty("--delay", `${Math.random() * 0.35}s`);
    piece.style.setProperty("--spin", `${Math.random() * 720 - 360}deg`);
    piece.style.background = ["#1d4ed8", "#e11d48", "#f59e0b", "#10b981", "#7c3aed"][i % 5];
    layer.append(piece);
  }
  setTimeout(() => layer.remove(), 2600);
}

function submitRun() {
  if (state.path.length !== TOTAL) {
    alert("12개 칸을 모두 채운 뒤 제출하세요.");
    return;
  }
  if (!confirm("제출하고 정답 여부를 확인할까요?")) return;
  state.submitted = true;
  state.correct = isCorrectPath(state.path);
  renderTrail();
  if (state.correct) {
    playCelebrationSound();
    launchConfetti();
  }
}

function bindEvents() {
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => setView(tab.dataset.view));
  });

  $("#submit-run").addEventListener("click", submitRun);

  $("#restart-run").addEventListener("click", () => {
    if (state.path.length > 1 && !confirm("처음부터 다시 시작할까요?")) return;
    setStart(state.start);
  });

  $("#undo-run").addEventListener("click", () => {
    if (state.path.length <= 1) return;
    const removed = state.path.at(-1);
    if (!confirm(`${removed}번 기록을 삭제할까요?`)) return;
    state.path.pop();
    state.submitted = false;
    state.correct = null;
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
