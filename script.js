"use strict";

const PDA_DEFINITIONS = {
  anbn: {
    name:        "{ aⁿbⁿ | n ≥ 1 }",
    badge:       "L₁",
    description: "The language of all strings with an equal number of a's followed by an equal number of b's, with at least one pair. This is the canonical example of a context-free language that is not regular.",
    formal:      "L = { aⁿbⁿ | n ≥ 1 } = { ab, aabb, aaabbb, … }",
    Q: ["q0", "q1", "q2", "q_dead"],
    Sigma:       ["a", "b"],
    Gamma:       ["Z", "A"],
    q0:          "q0",
    Z0:          "Z",
    F:           ["q2"],
    examples:    ["ab", "aabb", "aaabbb", "aaaabbbb"],
    // State labels for display
    stateLabels: {
      q0: "Start / Push",
      q1: "Pop phase",
      q2: "Accept",
      q_dead: "Dead / Reject"
    },
    // Transition table rows (for display)
    transitionRows: [
      { state:"q0", input:"a",   stack:"Z", newState:"q0", op:"Push A, keep Z" },
      { state:"q0", input:"a",   stack:"A", newState:"q0", op:"Push A"          },
      { state:"q0", input:"b",   stack:"A", newState:"q1", op:"Pop A"           },
      { state:"q1", input:"b",   stack:"A", newState:"q1", op:"Pop A"           },
      { state:"q1", input:"ε",   stack:"Z", newState:"q2", op:"Keep Z"          },
    ],
    // Core transition logic
    // Returns: { newState, stackOp, desc } or null if no transition
    transition(state, symbol, stackTop) {
      // DEAD STATE: once entered, always stay there
      if (state === "q_dead") {
        return {
          newState: "q_dead",
          op: "none",
          transStr: `δ(q_dead, ${symbol ?? 'ε'}, ${stackTop}) → (q_dead, ${stackTop})`,
          desc: `Already in dead state. String is rejected.`
        };
      }

      // q0: reading a's
      if (state === "q0" && symbol === "a" && stackTop === "Z")
        return {
          newState:"q0", op:"push", pushSymbol:"A", keepBottom:true,
          transStr: `δ(q0, a, Z) → (q0, AZ)`,
          desc: `Read 'a'. Push A.`
        };

      if (state === "q0" && symbol === "a" && stackTop === "A")
        return {
          newState:"q0", op:"push", pushSymbol:"A",
          transStr: `δ(q0, a, A) → (q0, AA)`,
          desc: `Read 'a'. Push A.`
        };

      // first b → switch to q1
      if (state === "q0" && symbol === "b" && stackTop === "A")
        return {
          newState:"q1", op:"pop",
          transStr: `δ(q0, b, A) → (q1, ε)`,
          desc: `First 'b'. Pop A and switch to q1.`
        };

      // q1: pop phase
      if (state === "q1" && symbol === "b" && stackTop === "A")
        return {
          newState:"q1", op:"pop",
          transStr: `δ(q1, b, A) → (q1, ε)`,
          desc: `Read 'b'. Pop A.`
        };

      // ε transition to accept
      if (state === "q1" && symbol === null && stackTop === "Z")
        return {
          newState:"q2", op:"none",
          transStr: `δ(q1, ε, Z) → (q2, Z)`,
          desc: `Stack empty → Accept.`
        };

      // ❌ INVALID CASES → GO TO DEAD STATE
      // b before any a
      if (state === "q0" && symbol === "b" && stackTop === "Z")
        return {
          newState: "q_dead",
          op: "none",
          transStr: `δ(q0, b, Z) → (q_dead, Z)`,
          desc: `Invalid: 'b' cannot appear before 'a'.`
        };
      // a after entering q1
      if (state === "q1" && symbol === "a")
        return {
          newState: "q_dead",
          op: "none",
          transStr: `δ(q1, a, ${stackTop}) → (q_dead, ${stackTop})`,
          desc: `Invalid: 'a' after 'b' phase.`
        };
      // extra b (stack empty)
      if (state === "q1" && symbol === "b" && stackTop === "Z")
        return {
          newState: "q_dead",
          op: "none",
          transStr: `δ(q1, b, Z) → (q_dead, Z)`,
          desc: `Invalid: more 'b's than 'a's.`
        };
      // catch-all → dead state
      return {
        newState: "q_dead",
        op: "none",
        transStr: `δ(${state}, ${symbol ?? 'ε'}, ${stackTop}) → (q_dead, ${stackTop})`,
        desc: `No valid transition. Move to dead state.`
      };
    }
  },

  balanced: {
    name:        "Balanced Parentheses",
    badge:       "L₂",
    description: "The language of all strings of parentheses that are properly balanced. A string is balanced if every opening parenthesis has a corresponding closing one and they are properly nested.",
    formal:      "L = { w ∈ {(, )}* | w is properly balanced } = { ε, (), (()), ()(), … }",
    Q:           ["q0", "q1", "q_dead"],
    Sigma:       ["(", ")"],
    Gamma:       ["Z", "P"],
    q0:          "q0",
    Z0:          "Z",
    F:           ["q1"],
    examples:    ["()", "(())", "()()", "((()))"],
    stateLabels: {
      q0: "Matching",
      q1: "Accept",
      q_dead: "Dead / Reject"
    },
    transitionRows: [
      { state:"q0", input:"(",   stack:"Z", newState:"q0", op:"Push P, keep Z" },
      { state:"q0", input:"(",   stack:"P", newState:"q0", op:"Push P"          },
      { state:"q0", input:")",   stack:"P", newState:"q0", op:"Pop P"           },
      { state:"q0", input:"ε",   stack:"Z", newState:"q1", op:"Keep Z"          },
    ],
    transition(state, symbol, stackTop) {
      // DEAD STATE: once entered, stay there
      if (state === "q_dead") {
        return {
          newState: "q_dead",
          op: "none",
          transStr: `δ(q_dead, ${symbol ?? 'ε'}, ${stackTop}) → (q_dead, ${stackTop})`,
          desc: `Already in dead state. String is rejected.`
        };
      }
      // q0: reading '(' → push
      if (state === "q0" && symbol === "(" && stackTop === "Z")
        return {
          newState:"q0", op:"push", pushSymbol:"P", keepBottom:true,
          transStr: `δ(q0, (, Z) → (q0, PZ)`,
          desc: `Read '('. Push P onto stack.`
        };

      if (state === "q0" && symbol === "(" && stackTop === "P")
        return {
          newState:"q0", op:"push", pushSymbol:"P",
          transStr: `δ(q0, (, P) → (q0, PP)`,
          desc: `Read '('. Push P. Increase nesting depth.`
        };

      // q0: reading ')' → pop
      if (state === "q0" && symbol === ")" && stackTop === "P")
        return {
          newState:"q0", op:"pop",
          transStr: `δ(q0, ), P) → (q0, ε)`,
          desc: `Read ')'. Pop P — matches last '('.`
        };

      // ε-transition to accept
      if (state === "q0" && symbol === null && stackTop === "Z")
        return {
          newState:"q1", op:"none",
          transStr: `δ(q0, ε, Z) → (q1, Z)`,
          desc: `All parentheses matched. Move to accept state.`
        };

      // ❌ INVALID CASES → DEAD STATE
      // closing bracket without opening
      if (state === "q0" && symbol === ")" && stackTop === "Z")
        return {
          newState: "q_dead",
          op: "none",
          transStr: `δ(q0, ), Z) → (q_dead, Z)`,
          desc: `Invalid: closing parenthesis without matching opening.`
        };

      // any symbol in accept state → reject
      if (state === "q1" && symbol !== null)
        return {
          newState: "q_dead",
          op: "none",
          transStr: `δ(q1, ${symbol}, ${stackTop}) → (q_dead, ${stackTop})`,
          desc: `Invalid: input after acceptance.`
        };

      // catch-all → dead state
      return {
        newState: "q_dead",
        op: "none",
        transStr: `δ(${state}, ${symbol ?? 'ε'}, ${stackTop}) → (q_dead, ${stackTop})`,
        desc: `Invalid transition. Move to dead state.`
      };
    }
  },


  wcwr: {
    name:        "{ wcwᴿ | w ∈ {a,b}* }",
    badge:       "L₃",
    description: "The language of strings of the form wcwᴿ where w is any string over {a,b} and wᴿ is its reverse, separated by the center marker 'c'. This demonstrates that PDAs can handle palindrome-like structures.",
    formal:      "L = { wcwᴿ | w ∈ {a,b}* } = { c, aca, bcb, abcba, aabcbaa, … }",
    Q:           ["q0", "q1", "q2", "q_dead"],
    Sigma:       ["a", "b", "c"],
    Gamma:       ["Z", "A", "B"],
    q0:          "q0",
    Z0:          "Z",
    F:           ["q2"],
    examples:    ["c", "aca", "bcb", "abcba", "aabcbaa"],
    stateLabels: {
      q0: "Push w",
      q1: "Match wᴿ",
      q2: "Accept",
      q_dead: "Dead / Reject"
    },
    transitionRows: [
      { state:"q0", input:"a",   stack:"Z", newState:"q0", op:"Push A, keep Z" },
      { state:"q0", input:"a",   stack:"A", newState:"q0", op:"Push A"          },
      { state:"q0", input:"a",   stack:"B", newState:"q0", op:"Push A"          },
      { state:"q0", input:"b",   stack:"Z", newState:"q0", op:"Push B, keep Z" },
      { state:"q0", input:"b",   stack:"A", newState:"q0", op:"Push B"          },
      { state:"q0", input:"b",   stack:"B", newState:"q0", op:"Push B"          },
      { state:"q0", input:"c",   stack:"*", newState:"q1", op:"No change"       },
      { state:"q1", input:"a",   stack:"A", newState:"q1", op:"Pop A"           },
      { state:"q1", input:"b",   stack:"B", newState:"q1", op:"Pop B"           },
      { state:"q1", input:"ε",   stack:"Z", newState:"q2", op:"Keep Z"          },
    ],
    transition(state, symbol, stackTop) {
      // 🚨 DEAD STATE: trap state
      if (state === "q_dead") {
        return {
          newState: "q_dead",
          op: "none",
          transStr: `δ(q_dead, ${symbol ?? 'ε'}, ${stackTop}) → (q_dead, ${stackTop})`,
          desc: `Already in dead state. String rejected.`
        };
      }

      // q0: Building w (push phase)
      if (state === "q0" && symbol === "a")
        return {
          newState:"q0", op:"push", pushSymbol:"A",
          transStr: `δ(q0, a, ${stackTop}) → (q0, A${stackTop})`,
          desc: `Read 'a'. Push A to stack.`
        };

      if (state === "q0" && symbol === "b")
        return {
          newState:"q0", op:"push", pushSymbol:"B",
          transStr: `δ(q0, b, ${stackTop}) → (q0, B${stackTop})`,
          desc: `Read 'b'. Push B to stack.`
        };

      // move to matching phase
      if (state === "q0" && symbol === "c")
        return {
          newState:"q1", op:"none",
          transStr: `δ(q0, c, ${stackTop}) → (q1, ${stackTop})`,
          desc: `Read 'c'. Switch to matching phase (q1).`
        };

      // q1: Matching wᴿ
      if (state === "q1" && symbol === "a" && stackTop === "A")
        return {
          newState:"q1", op:"pop",
          transStr: `δ(q1, a, A) → (q1, ε)`,
          desc: `Match 'a' with stack top A. Pop.`
        };

      if (state === "q1" && symbol === "b" && stackTop === "B")
        return {
          newState:"q1", op:"pop",
          transStr: `δ(q1, b, B) → (q1, ε)`,
          desc: `Match 'b' with stack top B. Pop.`
        };

      // ε-transition to accept
      if (state === "q1" && symbol === null && stackTop === "Z")
        return {
          newState:"q2", op:"none",
          transStr: `δ(q1, ε, Z) → (q2, Z)`,
          desc: `All symbols matched. Move to accept state.`
        };

      // ❌ INVALID CASES → DEAD STATE

      // no 'c' found before matching
      if (state === "q0" && symbol === null)
        return {
          newState: "q_dead",
          op: "none",
          transStr: `δ(q0, ε, ${stackTop}) → (q_dead, ${stackTop})`,
          desc: `Invalid: missing center marker 'c'.`
        };

      // mismatch during matching
      if (state === "q1" && symbol === "a" && stackTop !== "A")
        return {
          newState: "q_dead",
          op: "none",
          transStr: `δ(q1, a, ${stackTop}) → (q_dead, ${stackTop})`,
          desc: `Mismatch: expected A on stack.`
        };

      if (state === "q1" && symbol === "b" && stackTop !== "B")
        return {
          newState: "q_dead",
          op: "none",
          transStr: `δ(q1, b, ${stackTop}) → (q_dead, ${stackTop})`,
          desc: `Mismatch: expected B on stack.`
        };

      // extra symbols after stack empty
      if (state === "q1" && stackTop === "Z" && symbol !== null)
        return {
          newState: "q_dead",
          op: "none",
          transStr: `δ(q1, ${symbol}, Z) → (q_dead, Z)`,
          desc: `Invalid: extra symbols after matching completed.`
        };

      // any input after accept
      if (state === "q2" && symbol !== null)
        return {
          newState: "q_dead",
          op: "none",
          transStr: `δ(q2, ${symbol}, ${stackTop}) → (q_dead, ${stackTop})`,
          desc: `Invalid: input after acceptance.`
        };

      // fallback
      return {
        newState: "q_dead",
        op: "none",
        transStr: `δ(${state}, ${symbol ?? 'ε'}, ${stackTop}) → (q_dead, ${stackTop})`,
        desc: `No valid transition. Move to dead state.`
      };
    }
  }
};

let sim = {
  pda:         null,    // Current PDA definition object
  input:       [],      // Input symbols array
  pos:         0,       // Current position in input
  stack:       [],      // Stack array (index 0 = top)
  state:       null,    // Current state
  stepNum:     0,       // Step counter
  running:     false,   // Is simulation active?
  done:        false,   // Has simulation ended?
  autoTimer:   null,    // Auto-play interval timer
  autoPlaying: false,   // Is auto-play active?
};


/** initializePDA — Set up simulator state for a new run */
function initializePDA() {
  const lang = document.getElementById('languageSelect').value;
  const rawInput = document.getElementById('inputString').value.trim();

  if (!lang) {
    showError("Please select a language.");
    return false;
  }
  if (rawInput === "" && lang !== "balanced") {
    // balanced allows empty string ε
    if (lang !== "balanced") {
      showError("Please enter an input string.");
      return false;
    }
  }

  const pda = PDA_DEFINITIONS[lang];
  sim.pda      = pda;
  sim.input    = rawInput === "" ? [] : rawInput.split('');
  sim.pos      = 0;
  sim.stack    = [pda.Z0];  // Initialize stack with bottom-of-stack symbol
  sim.state    = pda.q0;
  sim.stepNum  = 0;
  sim.running  = true;
  sim.done     = false;
  sim.autoPlaying = false;

  return true;
}

/** processStep — Execute one PDA step. Returns step result object. */
function processStep() {
  if (!sim.running || sim.done) return null;

  const pda      = sim.pda;
  const state    = sim.state;
  const stackTop = sim.stack.length > 0 ? sim.stack[0] : null;
  const symbol   = sim.pos < sim.input.length ? sim.input[sim.pos] : null;

  const isInputDone = (symbol === null);
  const isStackValid = (stackTop === "Z");

  // 🚨 ACCEPT EARLY (before trying transitions)
  if (isInputDone && pda.F.includes(state) && isStackValid) {
    sim.done = true;
    return finalizeResult(true, "Input consumed and stack empty. String accepted.");
  }
  // 🚨 STOP IMMEDIATELY IF DEAD STATE
  if (state === "q_dead") {
    sim.done = true;
    return finalizeResult(false, "Entered dead state. String rejected.");
  }

  let result = null;
  let usedEpsilon = false;

  // Try normal transition first
  if (symbol !== null) {
    result = pda.transition(state, symbol, stackTop);
  }

  // If no transition, try ε-transition
  if (!result) {
    result = pda.transition(state, null, stackTop);
    usedEpsilon = true;
  }

  // ❌ If still no transition → reject
  if (!result) {
    sim.done = true;
    return finalizeResult(
      false,
      `No valid transition from state <strong>${state}</strong> with input <strong>${symbol ?? 'ε'}</strong> and stack top <strong>${stackTop}</strong>.`
    );
  }

  // --- APPLY TRANSITION ---
  sim.state = result.newState;
  sim.stepNum++;
  if (sim.pos >= sim.input.length &&
    sim.stack.length === 1 &&
    sim.stack[0] === pda.Z0 &&
    pda.F.includes(sim.state)) {

    sim.done = true;
    return finalizeResult(true, "All input processed and stack returned to initial state.");
  }

  // 🚨 STOP IF WE JUST ENTERED DEAD STATE
  if (sim.state === "q_dead") {
    addLogEntry(sim.stepNum, result.transStr, result.desc, "No stack change");
    sim.done = true;
    return finalizeResult(false, "Transition led to dead state. String rejected.");
  }

  let stackOpDesc = "";

  // Consume input only if NOT epsilon
  if (!usedEpsilon && symbol !== null) {
    sim.pos++;
  }

  // Stack operations
  if (result.op === "push") {
    sim.stack.unshift(result.pushSymbol);
    stackOpDesc = `Pushed <strong>${result.pushSymbol}</strong>`;
  } 
  else if (result.op === "pop") {
    sim.stack.shift();
    stackOpDesc = `Popped <strong>${stackTop}</strong>`;
  } 
  else {
    stackOpDesc = "No stack change";
  }

  // Log step
  addLogEntry(sim.stepNum, result.transStr, result.desc, stackOpDesc);

  // --- FINAL ACCEPTANCE CHECK ---
  const nextSymbol = sim.pos < sim.input.length ? sim.input[sim.pos] : null;
  const newTop     = sim.stack.length > 0 ? sim.stack[0] : null;

  return result;
}

/** finalizeResult — Mark simulation as done with accept/reject */
function finalizeResult(accepted, detail) {
  sim.done    = true;
  sim.running = false;
  stopAutoPlay();
  showResult(accepted, detail);
  updateExplanation(
    accepted ? `<strong>Accepted!</strong> ${detail}` : `<strong>Rejected.</strong> ${detail}`,
    accepted ? 'success' : 'error'
  );
  return { done: true, accepted };
}


function startSimulation() {
  if (!initializePDA()) return;

  clearLog();
  hideResult();
  updateButtonStates(true);
  renderStatesDiagram();
  renderTransitionTable();
  updateLangDescription();
  updatePDADefinition();
  renderInputTape();

  // Initial UI state
  updateStackDisplay([sim.pda.Z0]);
  updateStatesDiagramActive(sim.state);
  updateTransitionBox(null);
  updateExplanation(`Simulation started. PDA is in initial state <strong>${sim.state}</strong>. Stack initialized with bottom symbol <strong>${sim.pda.Z0}</strong>. Press <strong>Next Step</strong> or <strong>Auto Play</strong>.`);
  document.getElementById('stepCounter').textContent = `Step 0`;

  addLogEntry(0, "—", `PDA initialized. State: <strong>${sim.state}</strong>. Stack: [${sim.stack.join(', ')}].`, "");
}

function stepSimulation() {
  if (!sim.running) return;

  const result = processStep();
  if (!result) return;

  renderUI(result);

  if (result.done) {
    updateButtonStates(false, true);
    return;
  }

  if (result.finalAccept) {
    finalizeResult(true, "All input consumed and PDA is in an accept state.");
    renderUI({ finalAccept: true, accepted: true });
    updateButtonStates(false, true);
  }
}

function toggleAutoPlay() {
  if (sim.autoPlaying) {
    pauseSimulation();
  } else {
    startAutoPlay();
  }
}

function startAutoPlay() {
  if (!sim.running || sim.done) return;
  sim.autoPlaying = true;

  const speed = parseInt(document.getElementById('speedSlider').value);
  document.getElementById('btnAuto').style.display  = 'none';
  document.getElementById('btnPause').style.display = 'inline-flex';
  document.getElementById('btnStep').disabled       = true;

  sim.autoTimer = setInterval(() => {
    if (!sim.running || sim.done) {
      stopAutoPlay();
      return;
    }
    const result = processStep();
    if (!result) { stopAutoPlay(); return; }
    renderUI(result);
    if (result.done || result.finalAccept) {
      stopAutoPlay();
      if (result.finalAccept) {
        finalizeResult(true, "All input consumed and PDA is in an accept state.");
      }
      updateButtonStates(false, true);
    }
  }, speed);
}

function pauseSimulation() {
  stopAutoPlay();
}

function stopAutoPlay() {
  if (sim.autoTimer) { clearInterval(sim.autoTimer); sim.autoTimer = null; }
  sim.autoPlaying = false;
  document.getElementById('btnAuto').style.display  = 'inline-flex';
  document.getElementById('btnPause').style.display = 'none';
  if (sim.running && !sim.done) {
    document.getElementById('btnStep').disabled = false;
  }
}

function resetSimulation() {
  stopAutoPlay();
  sim = {
    pda: null, input: [], pos: 0, stack: [],
    state: null, stepNum: 0, running: false,
    done: false, autoTimer: null, autoPlaying: false
  };
  clearLog();
  hideResult();
  updateButtonStates(false);
  document.getElementById('stepCounter').textContent = 'Step 0';
  updateTransitionBox(null);
  updateExplanation("Simulation reset. Configure your language and input, then press Start.");
  updateStackDisplay([]);
  document.getElementById('inputDisplay').innerHTML =
    '<span style="font-size:0.78rem;color:var(--ink-muted);font-family:var(--font-mono);">— empty —</span>';
  resetStateDiagram();
}

/** renderUI — Update all visual components after a step */
function renderUI(result) {
  if (!result) return;

  document.getElementById('stepCounter').textContent = `Step ${sim.stepNum}`;
  updateStackDisplay(sim.stack);
  updateStatesDiagramActive(sim.state);
  renderInputTape();

  if (result.transStr) updateTransitionBox(result.transStr);
  if (result.desc)     updateExplanation(result.desc);
}

/** updateStack — Re-render the stack display */
function updateStackDisplay(stack) {
  const container = document.getElementById('stackItems');
  document.getElementById('stackSizeBadge').textContent =
    stack.length === 0 ? "0 items" : `${stack.length} item${stack.length !== 1 ? 's' : ''}`;

  if (stack.length === 0) {
    container.innerHTML = '<div class="stack-empty-msg">Stack is empty</div>';
    return;
  }

  container.innerHTML = stack.map((sym, i) => {
    const isTop    = i === 0;
    const isBottom = sym === (sim.pda ? sim.pda.Z0 : 'Z');
    const cls = isTop ? 'top-cell' : (isBottom && i === stack.length - 1 ? 'bottom-symbol' : '');
    return `<div class="stack-cell ${cls} push-anim">${sym}</div>`;
  }).join('');
}

/** renderInputTape — Show input string with char highlighting */
function renderInputTape() {
  const display = document.getElementById('inputDisplay');
  if (!sim.input || sim.input.length === 0) {
    display.innerHTML = '<span class="epsilon-marker">ε (empty string)</span>';
    return;
  }

  display.innerHTML = sim.input.map((ch, i) => {
    let cls = '';
    if (i < sim.pos)       cls = 'consumed';
    else if (i === sim.pos) cls = 'active';
    else                   cls = 'pending';
    return `<span class="input-char ${cls}">${escHtml(ch)}</span>`;
  }).join('');
}

/** renderStatesDiagram — Build state diagram for current PDA */
function renderStatesDiagram() {
  if (!sim.pda) return;
  const pda = sim.pda;
  const container = document.getElementById('statesDiagram');

  const stateOrder = pda.Q;
  let html = '<span class="start-arrow">→</span>';

  stateOrder.forEach((q, idx) => {
    const isAccept = pda.F.includes(q);
    const label    = pda.stateLabels ? (pda.stateLabels[q] || q) : q;
    html += `
      <div class="state-node">
        <div class="state-circle ${isAccept ? 'accept' : ''}" id="stateNode_${q}">${q}</div>
        <div class="state-label">${label}</div>
      </div>`;
    if (idx < stateOrder.length - 1) {
      html += `<div class="state-arrow-group">
        <div class="state-arrow">⟶</div>
      </div>`;
    }
  });

  container.innerHTML = html;
}

/** updateStatesDiagramActive — Highlight the current state node */
function updateStatesDiagramActive(currentState) {
  if (!sim.pda) return;
  sim.pda.Q.forEach(q => {
    const el = document.getElementById(`stateNode_${q}`);
    if (el) {
      el.classList.remove('active', 'rejected');
      if (q === currentState) el.classList.add('active');
    }
  });
}

function markStateRejected(state) {
  const el = document.getElementById(`stateNode_${state}`);
  if (el) { el.classList.remove('active'); el.classList.add('rejected'); }
}

function resetStateDiagram() {
  const container = document.getElementById('statesDiagram');
  container.innerHTML = '<div style="color:var(--ink-muted);font-size:0.82rem;font-family:var(--font-mono);">Select a language to see the state diagram</div>';
}

/** updateTransitionBox — Show formatted δ transition */
function updateTransitionBox(transStr) {
  const box = document.getElementById('transitionBox');
  if (!transStr) {
    box.className = 'transition-box empty';
    box.innerHTML = 'Waiting for simulation to start…';
    return;
  }
  box.className = 'transition-box';
  // Format the transition string with colored spans
  // δ(q, a, Z) → (q′, γ)
  box.innerHTML = formatTransition(transStr);
}

function formatTransition(str) {
  // Colorize parts: δ, states, symbols, arrow, results
  return str
    .replace(/^(δ)/, '<span class="t-delta">$1</span>')
    .replace(/→/g, '<span class="t-arrow"> → </span>')
    .replace(/(\(([^,)]+),\s*([^,)]+),\s*([^)]+)\))/,
      '(<span class="t-state">$1</span>, <span class="t-symbol">$2</span>, <span class="t-stack">$3</span>)')
    .replace(/→[^(]*\(([^,)]+),\s*([^)]+)\)/,
      '<span class="t-arrow"> → </span>(<span class="t-result">$1</span>, <span class="t-op">$2</span>)');
}

/** updateExplanation — Show explanation panel text */
function updateExplanation(html, type = '') {
  const box = document.getElementById('explanationBox');
  box.className = 'explanation-box ' + type;
  box.innerHTML = html;
}

/** renderTransitionTable — Populate the transition table */
function renderTransitionTable() {
  if (!sim.pda) return;
  const tbody = document.getElementById('transTableBody');
  tbody.innerHTML = sim.pda.transitionRows.map((row, i) =>
    `<tr id="transRow_${i}">
      <td class="t-func">${escHtml(row.state)}</td>
      <td class="t-func">${escHtml(row.input)}</td>
      <td>${escHtml(row.stack)}</td>
      <td class="t-res">${escHtml(row.newState)}</td>
      <td>${escHtml(row.op)}</td>
    </tr>`
  ).join('');
}

/** updateLangDescription — Populate language info panel */
function updateLangDescription() {
  if (!sim.pda) return;
  const pda = sim.pda;
  document.getElementById('langBadge').textContent   = pda.badge;
  document.getElementById('langDesc').textContent    = pda.description;
  document.getElementById('langFormal').textContent  = pda.formal;
}

/** updatePDADefinition — Show formal 7-tuple info */
function updatePDADefinition() {
  if (!sim.pda) return;
  const pda = sim.pda;
  document.getElementById('def-Q').textContent     = `{${pda.Q.join(', ')}}`;
  document.getElementById('def-Sigma').textContent = `{${pda.Sigma.join(', ')}}`;
  document.getElementById('def-Gamma').textContent = `{${pda.Gamma.join(', ')}}`;
  document.getElementById('def-q0').textContent    = pda.q0;
  document.getElementById('def-Z0').textContent    = pda.Z0;
  document.getElementById('def-F').textContent     = `{${pda.F.join(', ')}}`;
}


function addLogEntry(stepNum, transStr, desc, opDesc) {
  const container = document.getElementById('logContainer');
  // Remove empty message
  const empty = container.querySelector('.log-empty');
  if (empty) empty.remove();

  // Remove 'latest' from previous
  const prev = container.querySelector('.log-entry.latest');
  if (prev) prev.classList.remove('latest');

  const entry = document.createElement('div');
  entry.className = 'log-entry latest';
  entry.innerHTML = `
    <div class="log-step-num">${stepNum}</div>
    <div class="log-content">
      <div class="log-transition">${transStr || '—'}</div>
      <div class="log-desc">${desc}${opDesc ? ' · ' + opDesc : ''}</div>
    </div>
  `;
  container.appendChild(entry);
  container.scrollTop = container.scrollHeight;
}

function clearLog() {
  document.getElementById('logContainer').innerHTML =
    '<div class="log-empty">No steps yet. Start the simulation.</div>';
}

function showResult(accepted, detail) {
  document.getElementById('resultAccepted').style.display = 'none';
  document.getElementById('resultRejected').style.display = 'none';

  if (accepted) {
    document.getElementById('resultAccepted').style.display = 'flex';
    document.getElementById('resultAcceptedDetail').innerHTML =
      `The string <code style="font-family:var(--font-mono);background:#e8f5e9;padding:1px 5px;border-radius:3px;">"${sim.input.join('')}"</code> belongs to ${sim.pda.name}.`;
    // Also mark accept state in log
    const container = document.getElementById('logContainer');
    const prev = container.querySelector('.log-entry.latest');
    if (prev) { prev.classList.remove('latest'); prev.classList.add('accepted'); }
  } else {
    document.getElementById('resultRejected').style.display = 'flex';
    document.getElementById('resultRejectedDetail').innerHTML = detail;
    const container = document.getElementById('logContainer');
    const prev = container.querySelector('.log-entry.latest');
    if (prev) { prev.classList.remove('latest'); prev.classList.add('rejected'); }
    if (sim.state) markStateRejected(sim.state);
  }
}

function hideResult() {
  document.getElementById('resultAccepted').style.display = 'none';
  document.getElementById('resultRejected').style.display = 'none';
}


function updateButtonStates(active, done = false) {
  document.getElementById('btnStart').disabled = active;
  document.getElementById('btnStep').disabled  = !active || done;
  document.getElementById('btnAuto').disabled  = !active || done;
  document.getElementById('btnReset').disabled = !active && !done;
  if (!active || done) {
    document.getElementById('btnAuto').style.display  = 'inline-flex';
    document.getElementById('btnPause').style.display = 'none';
  }
}

// Language selection
document.getElementById('languageSelect').addEventListener('change', function() {
  const lang = this.value;
  resetSimulation();
  if (!lang) return;

  const pda = PDA_DEFINITIONS[lang];
  // Update example buttons
  const btnContainer = document.getElementById('exampleBtns');
  btnContainer.innerHTML = pda.examples.map(ex =>
    `<button class="btn-example" onclick="setExample('${ex}')">${escHtml(ex)}</button>`
  ).join('');

  // Update lang description immediately
  document.getElementById('langBadge').textContent   = pda.badge;
  document.getElementById('langDesc').textContent    = pda.description;
  document.getElementById('langFormal').textContent  = pda.formal;

  // Update PDA definition
  document.getElementById('def-Q').textContent     = `{${pda.Q.join(', ')}}`;
  document.getElementById('def-Sigma').textContent = `{${pda.Sigma.join(', ')}}`;
  document.getElementById('def-Gamma').textContent = `{${pda.Gamma.join(', ')}}`;
  document.getElementById('def-q0').textContent    = pda.q0;
  document.getElementById('def-Z0').textContent    = pda.Z0;
  document.getElementById('def-F').textContent     = `{${pda.F.join(', ')}}`;

  // Update transition table
  const tbody = document.getElementById('transTableBody');
  tbody.innerHTML = pda.transitionRows.map((row, i) =>
    `<tr id="transRow_${i}">
      <td class="t-func">${escHtml(row.state)}</td>
      <td class="t-func">${escHtml(row.input)}</td>
      <td>${escHtml(row.stack)}</td>
      <td class="t-res">${escHtml(row.newState)}</td>
      <td>${escHtml(row.op)}</td>
    </tr>`
  ).join('');

  // Draw state diagram
  sim.pda = pda;
  renderStatesDiagram();
  sim.pda = null;
});

// Input string preview
document.getElementById('inputString').addEventListener('input', function() {
  const val = this.value;
  const display = document.getElementById('inputDisplay');
  if (!val) {
    display.innerHTML = '<span style="font-size:0.78rem;color:var(--ink-muted);font-family:var(--font-mono);">— empty —</span>';
    return;
  }
  display.innerHTML = val.split('').map(ch =>
    `<span class="input-char">${escHtml(ch)}</span>`
  ).join('');
});

// Speed slider
document.getElementById('speedSlider').addEventListener('input', function() {
  document.getElementById('speedLabel').textContent = `${this.value}ms`;
  // If auto-playing, restart with new speed
  if (sim.autoPlaying) {
    stopAutoPlay();
    startAutoPlay();
  }
});

function setExample(str) {
  document.getElementById('inputString').value = str;
  document.getElementById('inputString').dispatchEvent(new Event('input'));
}

function showError(msg) {
  updateExplanation(`⚠️ ${msg}`, 'error');
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}