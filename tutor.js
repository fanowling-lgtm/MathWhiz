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
function send(){
  const text=input.value.trim();
  if(!text) return;
  print("> " + text);
  input.value="";

  if(text.includes("graph")) {
    const match=text.match(/graph\s+(.+)/i);
    if(match) plotGraphWithTangent(match[1]);
    else print("Specify expression to graph.");
    return;
  }
  if(text.includes("derivative")||text.includes("d/dx")) solveDerivativeSteps(text);
  else if(text.includes("integrate")||text.includes("∫")) solveIntegralSteps(text);
  else if(text.includes("limit")) {
    const m=text.match(/limit\s+(.+)\s+as\s+x→([0-9\.]+)/i);
    if(m) limitTable(m[1], Number(m[2]));
    else print("Specify expression and point.");
  }
  else if(text.includes("=")) solveLinearSteps(text);
  else solveArithmeticSteps(text);

  saveHistory(text,"solved");
}


// --- SOLVERS ---

function solveArithmeticSteps(expr) {
  try {
    print(`Solving: ${expr}`);
    // parse simple + - * /
    let result = math.evaluate(expr);
    print(`Result: ${result}`);
    print(`Step-by-step:`);

    // Use math.js simplify
    const steps = expr.split(/([\+\-\*\/])/);
    let current = Number(steps[0]);
    for (let i=1; i<steps.length; i+=2) {
      const op = steps[i];
      const val = Number(steps[i+1]);
      if(op==="+") current += val;
      if(op==="-") current -= val;
      if(op==="*") current *= val;
      if(op==="/") current /= val;
      print(`${steps.slice(0,i+2).join(' ')} = ${current}`);
    }
  } catch {
    print("Cannot solve arithmetic problem.");
  }
}


function solveDerivativeSteps(expr) {
  try {
    const deriv = math.derivative(expr, "x");
    print(`Derivative of ${expr}: ${deriv}`);
    print(`Step-by-step:`);
    // naive explanation using power rule
    expr.split("+").forEach(term=>{
      const m = term.match(/(\d*)x\^?(\d*)/);
      if(m){
        const coef = Number(m[1]||1);
        const pow = Number(m[2]||1);
        const newCoef = coef*pow;
        const newPow = pow-1;
        print(`d/dx(${term}) = ${newCoef}x^${newPow}`);
      }
    });
  } catch {
    print("Cannot differentiate.");
  }
}


function solveIntegralSteps(expr) {
  try {
    const integral = math.integral(expr, "x").toString();
    print(`Integral of ${expr}: ${integral} + C`);
    print(`Step-by-step (power rule):`);
    expr.split("+").forEach(term=>{
      const m = term.match(/(\d*)x\^?(\d*)/);
      if(m){
        const coef = Number(m[1]||1);
        const pow = Number(m[2]||0);
        const newPow = pow+1;
        const newCoef = coef/newPow;
        print(`∫${term} dx = ${newCoef}x^${newPow}`);
      }
    });
  } catch {
    print("Cannot integrate.");
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
function solveLinearSteps(expr) {
  // only simple linear: ax+b=c
  const m = expr.match(/([\d\-]+)x\s*\+\s*([\d\-]+)\s*=\s*([\d\-]+)/);
  if (!m) { print("Cannot solve algebra problem."); return; }
  const a = Number(m[1]), b = Number(m[2]), c = Number(m[3]);

  print(`Problem: ${expr}`);
  print(`Step 1: Subtract ${b} from both sides: ${a}x = ${c - b}`);
  print(`Step 2: Divide both sides by ${a}: x = ${(c-b)/a}`);
}
function limitTable(expr, point) {
  print(`Estimating limit of ${expr} as x→${point}`);
  const f = x => math.evaluate(expr,{x});
  const deltas = [0.1,0.01,0.001,0.0001];
  deltas.forEach(d=>{
    const left = f(point - d);
    const right = f(point + d);
    print(`x=${point - d} → ${left}, x=${point + d} → ${right}`);
  });
}

// --- GRAPHING ---

function plotGraphWithTangent(expr, tangentAt=null) {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.beginPath();
  for(let px=0; px<=canvas.width; px++){
    const x = (px-200)/20;
    let y;
    try{ y=math.evaluate(expr,{x}); } catch{ y=NaN; }
    if(isNaN(y)) continue;
    const py=200 - y*20;
    if(px===0) ctx.moveTo(px,py);
    else ctx.lineTo(px,py);
  }
  ctx.strokeStyle="#00ff00";
  ctx.stroke();

  if(tangentAt!==null){
    const slope = math.derivative(expr,'x').evaluate({x:tangentAt});
    const y0 = math.evaluate(expr,{x:tangentAt});
    ctx.beginPath();
    for(let dx=-200; dx<=200; dx++){
      const x = dx/20 + tangentAt;
      const y = slope*(x-tangentAt)+y0;
      const py=200 - y*20;
      const px=dx+200;
      if(dx===-200) ctx.moveTo(px,py);
      else ctx.lineTo(px,py);
    }
    ctx.strokeStyle="#ff0000";
    ctx.stroke();
  }
}
