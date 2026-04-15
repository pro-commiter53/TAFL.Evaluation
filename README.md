# 🧠 Pushdown Automaton Simulator

## 📘 Introduction

Pushdown Automata (PDA) are a fundamental concept in the Theory of Automata and Formal Languages, used to recognize a class of languages known as Context-Free Languages (CFLs). Unlike finite automata, a PDA is equipped with an additional memory structure called a *stack*, which enables it to process patterns that require memory, such as balanced parentheses and matched symbols.

Due to their abstract and mathematical nature, PDAs can be difficult to understand, especially when trying to visualize how stack operations and state transitions occur during computation. This project addresses that challenge by providing an interactive, web-based simulator that demonstrates the working of a generalized Pushdown Automaton in a clear and step-by-step manner.

---

## 🎯 Objective

The objective of this project is to design and develop a visualization-based simulator for Pushdown Automata that helps in understanding how context-free languages are recognized using stack-based computation.

---

## ⚙️ Features

* 🔹 Step-by-step simulation of PDA execution
* 🔹 Stack visualization (push and pop operations)
* 🔹 Multiple context-free languages supported
* 🔹 Real-time state transition display
* 🔹 Input string validation
* 🔹 Accept/Reject result with clear output

---

## 🧩 Supported Languages

This simulator demonstrates different types of context-free languages:

* **L = { aⁿbⁿ | n ≥ 1 }**
  Recognizes strings with equal number of `a`s followed by `b`s.

* **L = { wcwᴿ | w ∈ {a, b}* }**
  Recognizes palindromes separated by a special symbol `c`.

* **L = { aⁿbⁿcⁿ | n ≥ 1 } (Conceptual Demonstration)**
  Included for theoretical understanding (not fully implementable using a single PDA).

---

## 🧠 Theory Background

A Pushdown Automaton is formally defined as:

**M = (Q, Σ, Γ, δ, q₀, Z₀, F)**

Where:

* **Q** → Set of states
* **Σ** → Input alphabet
* **Γ** → Stack alphabet
* **δ** → Transition function
* **q₀** → Initial state
* **Z₀** → Initial stack symbol
* **F** → Set of final states

A PDA processes input strings by performing operations such as **push**, **pop**, and **replace** on the stack, based on the current state and input symbol.

---

## 🔄 Working of the Simulator

1. The user selects a language and enters an input string.
2. The simulator initializes the PDA with a starting state and stack symbol.
3. The input string is processed symbol by symbol.
4. At each step:

   * The current state is updated
   * Stack operations (push/pop) are performed
   * The transition is logged
5. The process continues until the input is fully consumed.
6. The string is either **accepted** or **rejected** based on the PDA rules.

---

## 🖥️ Technologies Used

* **HTML** – Structure of the web application
* **CSS** – Styling and layout
* **JavaScript** – Logic and simulation of PDA

---

## ▶️ How to Run the Project

1. Clone or download this repository
2. Open the project folder
3. Run the `index.html` file in any web browser

No additional setup or dependencies are required.

---

## 🚀 Future Scope

* Support for user-defined PDA inputs
* Visualization of transition diagrams dynamically
* Support for more context-free languages
* Improved UI/UX and animations
* Integration with learning modules for students

---

## 👨‍💻 Author

**HARSH**
ROLL NO- 2024UCS1550
CSE-1

---

## 📌 Conclusion

This project successfully demonstrates how Pushdown Automata operate using stack-based computation to recognize context-free languages. By converting theoretical concepts into an interactive visualization, it enhances understanding and provides an effective learning tool for students studying automata theory.

