// ── PDA Simulator Core ──

// Language definitions
const LANGUAGES = {
  anbn: {
    name: "L = { aⁿbⁿ | n ≥ 1 }",
    description: `<strong>Language:</strong> All strings with equal numbers of 'a's followed by 'b's.<br>
<strong>Formal:</strong> L = { aⁿbⁿ | n ≥ 1 }<br>
<strong>Transition Rules:</strong><br>
<span class="rule">δ(q0, a, Z₀) → (q0, aZ₀)  — Push 'a', stay in q0</span>
<span class="rule">δ(q0, a, a)  → (q0, aa)    — Push 'a', stay in q0</span>
<span class="rule">δ(q0, b, a)  → (q1, ε)     — Pop 'a', move to q1</span>
<span class="rule">δ(q1, b, a)  → (q1, ε)     — Pop 'a', stay in q1</span>
<span class="rule">δ(q1, ε, Z₀) → (qfinal, Z₀)   — Accept when stack has only Z₀</span>`,
    simulate: simulateAnBn
  },
  palindrome: {
    name: "L = { wcwᴿ | w ∈ {a,b}* }",
    description: `<strong>Language:</strong> Strings of the form wcwᴿ where w is any word over {a,b} and wᴿ is its reverse.<br>
<strong>Formal:</strong> L = { wcwᴿ | w ∈ {a,b}* }<br>
<strong>Transition Rules:</strong><br>
<span class="rule">δ(q0, a, Z₀) → (q0, aZ₀)  — Push 'a'</span>
<span class="rule">δ(q0, b, Z₀) → (q0, bZ₀)  — Push 'b'</span>
<span class="rule">δ(q0, a, a)  → (q0, aa)    — Push 'a'</span>
<span class="rule">δ(q0, b, b)  → (q0, bb)    — Push 'b'</span>
<span class="rule">δ(q0, c, ·)  → (q1, ·)     — Read 'c', switch to match mode</span>
<span class="rule">δ(q1, a, a)  → (q1, ε)     — Pop matching 'a'</span>
<span class="rule">δ(q1, b, b)  → (q1, ε)     — Pop matching 'b'</span>
<span class="rule">δ(q1, ε, Z₀) → (qfinal, Z₀)   — Accept</span>`,
    simulate: simulatePalindrome
  },
  anbncn: {
    name: "L = { aⁿbⁿcⁿ | n ≥ 1 }",
    description: `<strong>Language:</strong> Equal numbers of a's, b's and c's in order.<br>
<strong>Note:</strong> This language is NOT context-free and cannot be accepted by a standard PDA.<br>
<strong>This simulation uses a 2-stack PDA (approximated) for educational purposes.</strong><br>
<span class="rule">Phase 1: Push all a's onto stack</span>
<span class="rule">Phase 2: Pop a's for each b (simultaneously push count)</span>
<span class="rule">Phase 3: Pop count for each c</span>`,
    simulate: simulateAnBnCn
  },
  brackets: {
    name: "L = Balanced Parentheses / Brackets",
    description: `<strong>Language:</strong> All strings with balanced parentheses and square brackets over Σ = { (, ), [, ] }.<br>
<strong>Formal:</strong> L = { w ∈ Σ* | w is properly nested and matched }<br>
<strong>Examples:</strong> <code>()[](())</code> ✔ &nbsp; <code>([)]</code> ✘ &nbsp; <code>(([])</code> ✘<br>
<strong>Transition Rules:</strong><br>
<span class="rule">δ(q0, (, ·)  → (q0, (·)   — Push '('</span>
<span class="rule">δ(q0, [, ·)  → (q0, [·)   — Push '['</span>
<span class="rule">δ(q0, ), ()  → (q0, ε)    — Pop matching '('</span>
<span class="rule">δ(q0, ], [)  → (q0, ε)    — Pop matching '['</span>
<span class="rule">δ(q0, ε, Z₀) → (qfinal, Z₀) — Accept when stack empty</span>`,
    simulate: simulateBrackets
  }
};

// ── State ──
let steps = [];
let currentStep = 0;
let simRunning = false;

// ── DOM ──
const langSelect   = document.getElementById('language-select');
const inputStr     = document.getElementById('input-string');
const btnStart     = document.getElementById('btn-start');
const btnNext      = document.getElementById('btn-next');
const btnReset     = document.getElementById('btn-reset');
const stateEl      = document.getElementById('current-state');
const stackEl      = document.getElementById('stack-display');
const actionEl     = document.getElementById('last-action');
const tapeEl       = document.getElementById('tape-display');
const logEl        = document.getElementById('steps-log');
const resultBanner = document.getElementById('result-banner');
const resultText   = document.getElementById('result-text');
const langDesc     = document.getElementById('lang-description');

// ── Init ──
langSelect.addEventListener('change', updateLangDesc);
btnStart.addEventListener('click', startSimulation);
btnNext.addEventListener('click', nextStep);
btnReset.addEventListener('click', resetAll);
updateLangDesc();

function updateLangDesc() {
  const lang = LANGUAGES[langSelect.value];
  langDesc.innerHTML = lang.description;
}

// ── Simulation Controllers ──
function startSimulation() {
  const input = inputStr.value.trim();
  if (!input) { inputStr.focus(); shake(inputStr); return; }

  const lang = LANGUAGES[langSelect.value];
  steps = lang.simulate(input);
  currentStep = 0;
  simRunning = true;

  btnStart.disabled = true;
  btnNext.disabled = false;

  logEl.innerHTML = '';
  setResult('—', '');
  renderStep(steps[0]);
}

function nextStep() {
  if (currentStep >= steps.length - 1) {
    finishSimulation();
    return;
  }
  currentStep++;
  renderStep(steps[currentStep]);

  if (currentStep === steps.length - 1) {
    finishSimulation();
  }
}

function finishSimulation() {
  const last = steps[steps.length - 1];
  const accepted = last.accepted;
  setResult(
    accepted ? '✔ ACCEPT' : '✘ REJECT',
    accepted ? 'accept' : 'reject'
  );
  btnNext.disabled = true;
}

function resetAll() {
  steps = [];
  currentStep = 0;
  simRunning = false;

  btnStart.disabled = false;
  btnNext.disabled = true;
  inputStr.value = '';

  stateEl.textContent = 'q0';
  stackEl.innerHTML = '<div class="stack-cell bottom-cell">Z₀</div>';
  actionEl.textContent = '—';
  tapeEl.innerHTML = '—';
  logEl.innerHTML = '<div class="log-placeholder">Run a simulation to see step-by-step execution...</div>';
  setResult('—', '');
  drawStateDiagram(langSelect.value, 'q0');
}

// ── Render a step ──
function renderStep(step) {
  stateEl.textContent = step.state;
  actionEl.textContent = step.action;

  // Vertical Stack
  stackEl.innerHTML = '';
  if (step.stack.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'stack-cell';
    empty.style.color = 'var(--red)';
    empty.textContent = 'EMPTY';
    stackEl.appendChild(empty);
  } else {
    step.stack.forEach((sym, i) => {
      const el = document.createElement('div');
      el.className = 'stack-cell' + (sym === 'Z₀' ? ' bottom-cell' : (i === 0 ? ' new-cell' : ''));
      el.textContent = sym;
      stackEl.appendChild(el);
    });
  }

  // Tape
  renderTape(step.input, step.head);

  // Log entry
  addLogEntry(step);

  // State diagram
  drawStateDiagram(langSelect.value, step.state);
}

// ── State Diagram ──
const DIAGRAMS = {
  anbn: {
    states: [
      { id: 'q0',     label: 'q0',     x: 90,  y: 110, start: true,  accept: false },
      { id: 'q1',     label: 'q1',     x: 290, y: 110, start: false, accept: false },
      { id: 'qfinal', label: 'qfinal', x: 500, y: 110, start: false, accept: true  }
    ],
    transitions: [
      { from: 'q0', to: 'q0',     lines: ['a,Z₀/aZ₀', 'a,a/aa'],  self: true },
      { from: 'q0', to: 'q1',     lines: ['b,a/ε'] },
      { from: 'q1', to: 'q1',     lines: ['b,a/ε'],                self: true },
      { from: 'q1', to: 'qfinal', lines: ['ε,Z₀/Z₀'] }
    ]
  },
  palindrome: {
    states: [
      { id: 'q0',     label: 'q0',     x: 80,  y: 110, start: true,  accept: false },
      { id: 'q1',     label: 'q1',     x: 310, y: 110, start: false, accept: false },
      { id: 'qfinal', label: 'qfinal', x: 540, y: 110, start: false, accept: true  }
    ],
    transitions: [
      { from: 'q0', to: 'q0',     lines: ['a,·/a·', 'b,·/b·'], self: true },
      { from: 'q0', to: 'q1',     lines: ['c,·/·'] },
      { from: 'q1', to: 'q1',     lines: ['a,a/ε', 'b,b/ε'],   self: true },
      { from: 'q1', to: 'qfinal', lines: ['ε,Z₀/Z₀'] }
    ]
  },
  anbncn: {
    states: [
      { id: 'q0',     label: 'q0',     x: 65,  y: 110, start: true,  accept: false },
      { id: 'q1',     label: 'q1',     x: 225, y: 110, start: false, accept: false },
      { id: 'q2',     label: 'q2',     x: 395, y: 110, start: false, accept: false },
      { id: 'qfinal', label: 'qfinal', x: 580, y: 110, start: false, accept: true  }
    ],
    transitions: [
      { from: 'q0', to: 'q0',     lines: ['a,·/a·'],   self: true },
      { from: 'q0', to: 'q1',     lines: ['b,a/ε'] },
      { from: 'q1', to: 'q1',     lines: ['b,a/ε'],   self: true },
      { from: 'q1', to: 'q2',     lines: ['c,·/·'] },
      { from: 'q2', to: 'q2',     lines: ['c,·/·'],   self: true },
      { from: 'q2', to: 'qfinal', lines: ['ε,Z₀/Z₀'] }
    ]
  },
  brackets: {
    states: [
      { id: 'q0',     label: 'q0',     x: 100, y: 110, start: true,  accept: false },
      { id: 'qfinal', label: 'qfinal', x: 380, y: 110, start: false, accept: true  }
    ],
    transitions: [
      { from: 'q0', to: 'q0',     lines: ['(,·/(·', '[,·/[·', '),(/ε', '],[ /ε'], self: true },
      { from: 'q0', to: 'qfinal', lines: ['ε,Z₀/Z₀'] }
    ]
  }
};

function drawStateDiagram(langKey, activeState) {
  const canvas = document.getElementById('state-diagram');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const W = canvas.offsetWidth || 760;
  const H = 230;

  canvas.width  = W * dpr;
  canvas.height = H * dpr;
  canvas.style.height = H + 'px';
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, W, H);

  const diag = DIAGRAMS[langKey];
  const R = 30;

  // Theme-aware colors — read CSS variable or fall back
  const style = getComputedStyle(document.documentElement);
  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const C = {
    accent:     style.getPropertyValue('--accent').trim()   || '#2563eb',
    accent2:    style.getPropertyValue('--accent2').trim()  || '#7c3aed',
    green:      style.getPropertyValue('--green').trim()    || '#16a34a',
    red:        style.getPropertyValue('--red').trim()      || '#dc2626',
    text:       style.getPropertyValue('--text').trim()     || '#1e293b',
    muted:      style.getPropertyValue('--muted').trim()    || '#64748b',
    bg:         style.getPropertyValue('--bg').trim()       || '#f0f4f8',
    bg2:        style.getPropertyValue('--bg2').trim()      || '#ffffff',
    border:     style.getPropertyValue('--border').trim()   || '#cbd5e1',
  };

  const stateMap = {};
  diag.states.forEach(s => stateMap[s.id] = s);

  // ── Helper: draw a pill background behind text ──
  function drawLabel(lines, cx, cy, isActive) {
    const FONT_SIZE = 11.5;
    const LINE_H    = 15;
    const PAD_X     = 7;
    const PAD_Y     = 4;
    ctx.font = `600 ${FONT_SIZE}px IBM Plex Mono, monospace`;
    const maxW = Math.max(...lines.map(l => ctx.measureText(l).width));
    const bw = maxW + PAD_X * 2;
    const bh = lines.length * LINE_H + PAD_Y * 2;
    const bx = cx - bw / 2;
    const by = cy - bh / 2;

    // Pill background
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(bx, by, bw, bh, 4);
    ctx.fillStyle = C.bg2;
    ctx.shadowColor = 'rgba(0,0,0,0.15)';
    ctx.shadowBlur  = 4;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = isActive ? C.accent : C.border;
    ctx.lineWidth   = isActive ? 1.5 : 0.8;
    ctx.stroke();
    ctx.restore();

    // Text lines
    ctx.save();
    ctx.font = `600 ${FONT_SIZE}px IBM Plex Mono, monospace`;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle    = isActive ? C.accent : C.text;
    lines.forEach((line, i) => {
      const ty = cy - ((lines.length - 1) * LINE_H) / 2 + i * LINE_H;
      ctx.fillText(line, cx, ty);
    });
    ctx.restore();
  }

  // ── Draw transitions ──
  diag.transitions.forEach(t => {
    const from = stateMap[t.from];
    const to   = stateMap[t.to];
    if (!from || !to) return;

    const isActive = (from.id === activeState || to.id === activeState);
    ctx.save();
    ctx.strokeStyle = isActive ? C.accent : C.muted;
    ctx.fillStyle   = isActive ? C.accent : C.muted;
    ctx.lineWidth   = isActive ? 2.2 : 1.4;

    if (t.self) {
      // Self-loop: arc above node
      const loopR = 26;
      const lx = from.x, ly = from.y - R - 2;
      ctx.beginPath();
      ctx.arc(lx, ly - loopR + 4, loopR, 0.35, Math.PI - 0.35);
      ctx.stroke();
      // Arrowhead pointing down-right into state
      const ax = lx - 12, ay = ly - 4;
      const ax2 = lx - 2, ay2 = ly + 2;
      drawArrowHead(ctx, ax, ay, ax2, ay2);

      // Label above loop
      const labelCY = ly - loopR * 2 + 2;
      drawLabel(t.lines, lx, labelCY, isActive);
    } else {
      // Straight arrow between states
      const dx = to.x - from.x, dy = to.y - from.y;
      const len = Math.sqrt(dx*dx + dy*dy);
      const nx = dx/len, ny = dy/len;
      const sx = from.x + nx * R, sy = from.y + ny * R;
      const ex = to.x   - nx * (R + 2), ey = to.y - ny * (R + 2);

      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(ex, ey);
      ctx.stroke();
      drawArrowHead(ctx, sx + (ex-sx)*0.75, sy + (ey-sy)*0.75, ex, ey);

      // Label above midpoint
      const mx = (sx + ex) / 2;
      const my = (sy + ey) / 2 - 18;
      drawLabel(t.lines, mx, my, isActive);
    }
    ctx.restore();
  });

  // ── Draw states ──
  diag.states.forEach(s => {
    const isActive = s.id === activeState;
    ctx.save();

    if (isActive) {
      ctx.shadowColor = s.accept ? C.green : C.accent;
      ctx.shadowBlur  = 16;
    }

    // State circle fill
    ctx.beginPath();
    ctx.arc(s.x, s.y, R, 0, Math.PI*2);
    ctx.fillStyle = isActive
      ? (s.accept ? 'rgba(22,163,74,0.15)' : 'rgba(37,99,235,0.12)')
      : s.dead ? 'rgba(220,38,38,0.06)' : C.bg2;
    ctx.fill();

    // State circle border
    ctx.strokeStyle = isActive ? (s.accept ? C.green : C.accent)
      : s.dead ? C.red : C.border;
    ctx.lineWidth = isActive ? 2.5 : 1.5;
    ctx.stroke();

    // Double ring for accept state
    if (s.accept) {
      ctx.beginPath();
      ctx.arc(s.x, s.y, R - 5, 0, Math.PI*2);
      ctx.strokeStyle = isActive ? C.green : C.muted;
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }

    // State label inside circle
    ctx.shadowBlur = 0;
    ctx.font = `700 11px IBM Plex Sans, sans-serif`;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = isActive ? (s.accept ? C.green : C.accent)
      : s.dead ? C.red : C.text;
    ctx.fillText(s.label, s.x, s.y);

    // Start arrow (→ into q0)
    if (s.start) {
      ctx.strokeStyle = C.accent;
      ctx.fillStyle   = C.accent;
      ctx.lineWidth   = 1.8;
      ctx.beginPath();
      ctx.moveTo(s.x - R - 32, s.y);
      ctx.lineTo(s.x - R - 2, s.y);
      ctx.stroke();
      drawArrowHead(ctx, s.x - R - 14, s.y, s.x - R - 2, s.y);
    }

    ctx.restore();
  });
}

function drawArrowHead(ctx, x1, y1, x2, y2) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const size  = 8;
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - size * Math.cos(angle - 0.42), y2 - size * Math.sin(angle - 0.42));
  ctx.lineTo(x2 - size * Math.cos(angle + 0.42), y2 - size * Math.sin(angle + 0.42));
  ctx.closePath();
  ctx.fill();
}

// Draw diagram on load and language change
window.addEventListener('load', () => drawStateDiagram(langSelect.value, 'q0'));
langSelect.addEventListener('change', () => drawStateDiagram(langSelect.value, 'q0'));
window.addEventListener('resize', () => {
  const cur = simRunning && steps[currentStep] ? steps[currentStep].state : 'q0';
  drawStateDiagram(langSelect.value, cur);
});


function renderTape(input, head) {
  if (!input) { tapeEl.innerHTML = '—'; return; }
  tapeEl.innerHTML = input.split('').map((ch, i) => {
    if (i === head) return `<span class="tape-head">${ch}</span>`;
    return `<span style="color:var(--muted)">${ch}</span>`;
  }).join(' ');
}

function addLogEntry(step) {
  if (logEl.querySelector('.log-placeholder')) logEl.innerHTML = '';

  const el = document.createElement('div');
  el.className = `log-entry ${step.logType || ''}`;

  const stepNum = document.createElement('span');
  stepNum.className = 'log-step';
  stepNum.textContent = `Step ${step.stepNum}`;

  const detail = document.createElement('span');
  detail.className = 'log-detail';
  detail.textContent = step.logText;

  el.appendChild(stepNum);
  el.appendChild(detail);
  logEl.appendChild(el);
  logEl.scrollTop = logEl.scrollHeight;
}

function setResult(text, cls) {
  resultText.textContent = text;
  resultBanner.className = 'result-banner ' + cls;
}

function shake(el) {
  el.style.animation = 'none';
  el.offsetHeight;
  el.style.animation = 'shake 0.3s ease';
  setTimeout(() => { el.style.animation = ''; }, 300);
}

// ── PDA Simulations ──

// 1. aⁿbⁿ
function simulateAnBn(input) {
  const steps = [];
  let stack = ['Z₀'];
  let state = 'q0';
  let head = 0;
  let stepNum = 1;
  let valid = true;
  const chars = input.split('');

  steps.push({
    stepNum: stepNum++,
    state, action: 'Initialized. Reading input...',
    stack: [...stack], input, head: 0,
    logText: `Start state q0, stack: [Z₀]`, logType: '',
    accepted: false
  });

  // Phase 1: read a's → push
  while (head < chars.length && chars[head] === 'a') {
    stack.unshift('a');
    steps.push({
      stepNum: stepNum++,
      state: 'q0',
      action: `Read 'a' → Push 'a' onto stack`,
      stack: [...stack], input, head,
      logText: `Read 'a' at pos ${head} → PUSH 'a'  | Stack top: a`,
      logType: 'push', accepted: false
    });
    head++;
  }

  if (head === 0) {
    steps.push({
      stepNum: stepNum++,
      state: 'q0', action: 'No a\'s found — REJECT',
      stack: [...stack], input, head,
      logText: `No 'a's read. String rejected.`, logType: '',
      accepted: false
    });
    steps[steps.length - 1].accepted = false;
    return steps;
  }

  // Transition to q1
  state = 'q1';
  steps.push({
    stepNum: stepNum++,
    state, action: `Switching to q1 — now matching b's`,
    stack: [...stack], input, head,
    logText: `Transition q0 → q1 on reading 'b'`, logType: 'match', accepted: false
  });

  // Phase 2: read b's → pop
  while (head < chars.length && chars[head] === 'b') {
    if (stack[0] === 'a') {
      stack.shift();
      steps.push({
        stepNum: stepNum++,
        state: 'q1',
        action: `Read 'b' → Pop 'a' from stack`,
        stack: [...stack], input, head,
        logText: `Read 'b' at pos ${head} → POP 'a'  | Stack: [${stack.join(', ')}]`,
        logType: 'pop', accepted: false
      });
      head++;
    } else {
      valid = false; break;
    }
  }

  // Check leftover
  if (head < chars.length) valid = false;
  if (stack[0] !== 'Z₀' || stack.length > 1) valid = false;

  if (valid && stack.length === 1 && stack[0] === 'Z₀') {
    state = 'qfinal';
    steps.push({
      stepNum: stepNum++,
      state,
      action: `Stack has only Z₀ → ACCEPT`,
      stack: [...stack], input, head: input.length,
      logText: `ε-transition on Z₀ → Accept state qfinal reached.`, logType: 'match',
      accepted: true
    });
  } else {
    steps.push({
      stepNum: stepNum++,
      state: 'q_dead',
      action: `Mismatch or leftover symbols → REJECT`,
      stack: [...stack], input, head,
      logText: `Stack or input mismatch. String rejected.`, logType: '',
      accepted: false
    });
  }

  return steps;
}

// 2. wcwᴿ
function simulatePalindrome(input) {
  const steps = [];
  let stack = ['Z₀'];
  let state = 'q0';
  let head = 0;
  let stepNum = 1;
  const chars = input.split('');

  steps.push({
    stepNum: stepNum++,
    state, action: 'Initialized. Reading input...',
    stack: [...stack], input, head: 0,
    logText: `Start state q0, expecting wcwᴿ form`, logType: '',
    accepted: false
  });

  // Phase 1: push until 'c'
  while (head < chars.length && chars[head] !== 'c') {
    const ch = chars[head];
    if (ch !== 'a' && ch !== 'b') {
      steps.push({
        stepNum: stepNum++,
        state: 'q_dead', action: `Invalid symbol '${ch}' → REJECT`,
        stack: [...stack], input, head,
        logText: `Invalid character '${ch}' — rejected.`, logType: '', accepted: false
      });
      return steps;
    }
    stack.unshift(ch);
    steps.push({
      stepNum: stepNum++, state,
      action: `Read '${ch}' → Push '${ch}'`,
      stack: [...stack], input, head,
      logText: `Read '${ch}' at pos ${head} → PUSH '${ch}'`, logType: 'push', accepted: false
    });
    head++;
  }

  if (head >= chars.length) {
    steps.push({
      stepNum: stepNum++, state: 'q_dead',
      action: `No 'c' found → REJECT`,
      stack: [...stack], input, head,
      logText: `Missing center 'c'. Rejected.`, logType: '', accepted: false
    });
    return steps;
  }

  // Read 'c'
  state = 'q1';
  steps.push({
    stepNum: stepNum++, state,
    action: `Read 'c' → switch to match mode`,
    stack: [...stack], input, head,
    logText: `Center 'c' found at pos ${head} → q0 → q1`, logType: 'match', accepted: false
  });
  head++;

  // Phase 2: match & pop
  while (head < chars.length) {
    const ch = chars[head];
    if (stack[0] === ch) {
      stack.shift();
      steps.push({
        stepNum: stepNum++, state: 'q1',
        action: `Read '${ch}' → Pop '${ch}' (match)`,
        stack: [...stack], input, head,
        logText: `Match '${ch}' at pos ${head} → POP '${ch}'`, logType: 'pop', accepted: false
      });
      head++;
    } else {
      steps.push({
        stepNum: stepNum++, state: 'q_dead',
        action: `'${ch}' ≠ '${stack[0]}' → REJECT`,
        stack: [...stack], input, head,
        logText: `Mismatch: expected '${stack[0]}', got '${ch}'.`, logType: '', accepted: false
      });
      return steps;
    }
  }

  const accepted = stack.length === 1 && stack[0] === 'Z₀';
  steps.push({
    stepNum: stepNum++,
    state: accepted ? 'qfinal' : 'q_dead',
    action: accepted ? `Stack has Z₀ → ACCEPT` : `Stack not empty → REJECT`,
    stack: [...stack], input, head,
    logText: accepted ? `ε-transition → Accept qfinal` : `Leftover stack symbols — rejected.`,
    logType: accepted ? 'match' : '', accepted
  });

  return steps;
}

// 3. aⁿbⁿcⁿ (approximated 2-stack)
function simulateAnBnCn(input) {
  const steps = [];
  let stack = ['Z₀'];
  let state = 'q0';
  let head = 0;
  let stepNum = 1;
  const chars = input.split('');
  let aCount = 0;

  steps.push({
    stepNum: stepNum++,
    state, action: 'Initialized. Phase 1: count a\'s',
    stack: [...stack], input, head: 0,
    logText: `Start: aⁿbⁿcⁿ simulation`, logType: '', accepted: false
  });

  while (head < chars.length && chars[head] === 'a') {
    stack.unshift('a'); aCount++;
    steps.push({
      stepNum: stepNum++, state: 'q0',
      action: `Read 'a' → Push 'a'`,
      stack: [...stack], input, head,
      logText: `Read 'a' at pos ${head} → PUSH`, logType: 'push', accepted: false
    });
    head++;
  }

  state = 'q1';
  steps.push({
    stepNum: stepNum++, state,
    action: `Phase 2: matching b's — pop a's`,
    stack: [...stack], input, head,
    logText: `Transition to q1. Matching b's...`, logType: 'match', accepted: false
  });

  let bCount = 0;
  while (head < chars.length && chars[head] === 'b') {
    if (stack[0] === 'a') {
      stack.shift(); bCount++;
      steps.push({
        stepNum: stepNum++, state: 'q1',
        action: `Read 'b' → Pop 'a'`,
        stack: [...stack], input, head,
        logText: `Read 'b' at pos ${head} → POP 'a'`, logType: 'pop', accepted: false
      });
      head++;
    } else break;
  }

  state = 'q2';
  steps.push({
    stepNum: stepNum++, state,
    action: `Phase 3: matching c's`,
    stack: [...stack], input, head,
    logText: `Transition to q2. Matching c's...`, logType: 'match', accepted: false
  });

  let cCount = 0;
  while (head < chars.length && chars[head] === 'c') {
    cCount++;
    steps.push({
      stepNum: stepNum++, state: 'q2',
      action: `Read 'c' (count=${cCount})`,
      stack: [...stack], input, head,
      logText: `Read 'c' at pos ${head}`, logType: 'match', accepted: false
    });
    head++;
  }

  const accepted = (aCount === bCount && bCount === cCount && aCount > 0 && head === chars.length && stack.length === 1 && stack[0] === 'Z₀');

  steps.push({
    stepNum: stepNum++,
    state: accepted ? 'qfinal' : 'q_dead',
    action: accepted
      ? `Counts match (${aCount}=${bCount}=${cCount}) → ACCEPT`
      : `Count mismatch or leftover → REJECT`,
    stack: [...stack], input, head,
    logText: accepted
      ? `aCount=${aCount}, bCount=${bCount}, cCount=${cCount} — all equal → ACCEPT`
      : `aCount=${aCount}, bCount=${bCount}, cCount=${cCount} — mismatch → REJECT`,
    logType: accepted ? 'match' : '',
    accepted
  });

  return steps;
}

// 4. Balanced Parentheses / Brackets
function simulateBrackets(input) {
  const steps = [];
  let stack = ['Z₀'];
  let state = 'q0';
  let head = 0;
  let stepNum = 1;
  const chars = input.split('');
  const OPEN  = { '(': true, '[': true };
  const MATCH = { ')': '(', ']': '[' };

  steps.push({
    stepNum: stepNum++, state,
    action: 'Initialized. Checking balanced brackets...',
    stack: [...stack], input, head: 0,
    logText: `Start q0 — valid symbols: ( ) [ ]`, logType: '', accepted: false
  });

  while (head < chars.length) {
    const ch = chars[head];

    if (!['(', ')', '[', ']'].includes(ch)) {
      steps.push({
        stepNum: stepNum++, state: 'q_dead',
        action: `Invalid symbol '${ch}' → REJECT`,
        stack: [...stack], input, head,
        logText: `Symbol '${ch}' not in alphabet — rejected.`, logType: '', accepted: false
      });
      return steps;
    }

    if (OPEN[ch]) {
      stack.unshift(ch);
      steps.push({
        stepNum: stepNum++, state: 'q0',
        action: `Read '${ch}' → Push '${ch}' onto stack`,
        stack: [...stack], input, head,
        logText: `Read '${ch}' at pos ${head} → PUSH '${ch}'`, logType: 'push', accepted: false
      });
    } else {
      const expected = MATCH[ch];
      if (stack[0] === expected) {
        stack.shift();
        steps.push({
          stepNum: stepNum++, state: 'q0',
          action: `Read '${ch}' → Pop '${expected}' (matched)`,
          stack: [...stack], input, head,
          logText: `Read '${ch}' at pos ${head} → POP '${expected}' ✓`, logType: 'pop', accepted: false
        });
      } else {
        const top = stack[0] === 'Z₀' ? 'empty stack' : `'${stack[0]}'`;
        steps.push({
          stepNum: stepNum++, state: 'q_dead',
          action: `'${ch}' mismatches ${top} → REJECT`,
          stack: [...stack], input, head,
          logText: `Mismatch at pos ${head}: '${ch}' but top is ${top} — rejected.`, logType: '', accepted: false
        });
        return steps;
      }
    }
    head++;
  }

  const accepted = stack.length === 1 && stack[0] === 'Z₀';
  steps.push({
    stepNum: stepNum++,
    state: accepted ? 'qfinal' : 'q_dead',
    action: accepted ? 'Stack empty (Z₀ only) → ACCEPT' : 'Unmatched openers remain → REJECT',
    stack: [...stack], input, head,
    logText: accepted
      ? `All brackets matched. ε,Z₀/Z₀ → qfinal.`
      : `Stack still has ${stack.filter(s => s !== 'Z₀').length} unmatched opener(s) — rejected.`,
    logType: accepted ? 'match' : '', accepted
  });

  return steps;
}
