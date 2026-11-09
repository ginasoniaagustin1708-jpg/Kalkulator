const screen = document.getElementById("screen");
const history = document.getElementById("history");
const keys = document.querySelector(".keys");

let expression = "";
let justCalculated = false;

function updateScreen(value = expression) {
  screen.textContent = value || "0";
}

function appendValue(value) {
  if (justCalculated && /[0-9.]/.test(value)) {
    expression = "";
    history.textContent = "";
  }
  justCalculated = false;

  const last = expression.slice(-1);
  const isOperator = ["+", "-", "*", "/", "%"].includes(value);

  if (isOperator) {
    if (!expression && value !== "-") return;
    if (["+", "-", "*", "/", "%"].includes(last)) {
      expression = expression.slice(0, -1);
    }
  }

  if (value === ".") {
    const currentNumber = expression.split(/[+\-*/%]/).pop();
    if (currentNumber.includes(".")) return;
    if (!currentNumber) value = "0.";
  }

  expression += value;
  updateScreen(expression.replaceAll("*", "×").replaceAll("/", "÷"));
}

function calculate() {
  if (!expression) return;
  try {
    // Hanya karakter matematika yang diizinkan sebelum dievaluasi.
    if (!/^[0-9+\-*/%.() ]+$/.test(expression)) throw new Error("Input tidak valid");
    const result = Function('"use strict"; return (' + expression + ')')();
    if (!Number.isFinite(result)) throw new Error("Tidak dapat menghitung");
    history.textContent = expression.replaceAll("*", "×").replaceAll("/", "÷") + " =";
    expression = String(Number(result.toPrecision(12)));
    updateScreen(expression);
    justCalculated = true;
  } catch {
    updateScreen("Error");
    expression = "";
    justCalculated = true;
  }
}

function clearAll() {
  expression = "";
  history.textContent = "";
  justCalculated = false;
  updateScreen();
}

function deleteLast() {
  if (justCalculated) {
    clearAll();
    return;
  }
  expression = expression.slice(0, -1);
  updateScreen(expression.replaceAll("*", "×").replaceAll("/", "÷"));
}

keys.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  const action = button.dataset.action;
  if (action === "clear") clearAll();
  else if (action === "delete") deleteLast();
  else if (action === "calculate") calculate();
  else if (button.dataset.value) appendValue(button.dataset.value);
});

document.addEventListener("keydown", (event) => {
  if (/^[0-9.+\-*/%]$/.test(event.key)) appendValue(event.key);
  else if (event.key === "Enter" || event.key === "=") {
    event.preventDefault();
    calculate();
  } else if (event.key === "Backspace") deleteLast();
  else if (event.key === "Escape") clearAll();
});
