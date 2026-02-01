const screen = document.getElementById("screen");
const input = document.getElementById("input");
const canvas = document.getElementById("graph");
const ctx = canvas.getContext("2d");

// Memory
let history = JSON.parse(localStorage.getItem("math_memory") || "[]");

function saveHistory(problem, solution) {
  history.push({ problem, solution });
  localStorage.setItem("math_memory", JSON.stringify(history));
}

// Utility to print to screen
function print(text) {
  screen.innerHTML += text + "<br>";
  screen.scrollTop = screen.scrollHeight;
}

// Main entry
function send() {
  const text = input.value.trim();
  if (!text) return;

  print("> " + text);
  input.value = "";

  // Decide what type
  if (text.includes("graph") || text.includes("plot")) {
    const exprMatch = text.match(/graph\s+(.+)/i);
    if (exprMatch) {
      plotGraph(exprMatch[1]);
      print(`Graphing ${exprMatch[1]}`);
      saveHistory(text, `Graph of ${exprMatch[1]}`);
    } else {
      print("Please specify an expression to graph, e.g., 'graph x^2'");
    }
    return;
  }

  if (text.includes("integrate") || text.includes("∫")) {
    solveIntegral(text);
    return;
  }

  if (text.includes("derivative") || text.includes("d/dx")) {
    solveDerivative(text);
    return;
  }

  if (text.includes("=")) {
    solveEquation(text);
    return;
  }

  solveArithmetic(text);
}

// --- SOLVERS ---

function solveArithmetic(expr) {
  try {
    const result = math.evaluate(expr);
    print(`Result: ${result}`);
    saveHistory(expr, result);
  } catch {
    print("I cannot solve this expression.");
  }
}

function solveDerivative(expr) {
  try {
    const match = expr.match(/d\/dx\s*(.+)/i);
    if (!match) throw "No expression found";
    const deriv = math.derivative(match[1], "x").toString();
    print(`Derivative of ${match[1]}: ${deriv}`);
    saveHistory(expr, deriv);
  } catch {
    print("Cannot compute derivative.");
  }
}

function solveIntegral(expr) {
  try {
    const match = expr.match(/integrate\s*(.+)/i);
    if (!match) throw "No expression found";
    const integral = math.integral(match[1], "x").toString();
    print(`Integral of ${match[1]}: ${integral} + C`);
    saveHistory(expr, integral);
  } catch {
    print("Cannot compute integral.");
  }
}

function solveEquation(expr) {
  try {
    const solutions = math.solve(expr, "x");
    print(`Solutions: ${solutions}`);
    saveHistory(expr, solutions);
  } catch {
    print("Cannot solve equation.");
  }
}

// --- GRAPHING ---

function plotGraph(expr) {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.beginPath();
  for (let px = 0; px <= canvas.width; px++) {
    const x = (px - canvas.width/2) / 20; // scale
    let y;
    try {
      y = math.evaluate(expr, {x});
    } catch {
      y = NaN;
    }
    if (isNaN(y)) continue;
    const py = canvas.height/2 - y*20;
    if (px === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.strokeStyle = "#00ff00";
  ctx.stroke();
}
