// script.js – calculator logic + keyboard support

// === get display element and all buttons ===
const display = document.getElementById('display');
let currentInput = '0';        // what's shown / current operand
let previousInput = '';        // stored for operation
let operator = null;           // '+', '-', '*', '/'
let resetOnNextDigit = false;  // flag to start new number after operator/equals

// === helper to update display (trim long decimals) ===
function updateDisplay(value) {
  // avoid showing too many decimals
  if (typeof value === 'number' || !isNaN(parseFloat(value))) {
    let num = parseFloat(value);
    if (Number.isInteger(num)) {
      display.value = num.toString();
    } else {
      // limit to 10 characters to avoid overflow, but keep precision if smaller
      let str = num.toString();
      if (str.length > 12) {
        display.value = num.toExponential(6);
      } else {
        display.value = str;
      }
    }
  } else {
    display.value = value.toString().slice(0, 14);
  }
  currentInput = display.value;  // keep string representation
}

// === initial display ===
updateDisplay('0');

// === arithmetic operation function ===
function operate(op, a, b) {
  const x = parseFloat(a);
  const y = parseFloat(b);
  if (isNaN(x) || isNaN(y)) return b || a; // fallback
  switch (op) {
    case '+': return x + y;
    case '-': return x - y;
    case '*': return x * y;
    case '/': return y === 0 ? 'Error' : x / y;   // division by zero
    default: return y;
  }
}

// === main evaluation (when = or Enter pressed) ===
function evaluate() {
  if (operator && previousInput !== '' && currentInput !== '' && currentInput !== 'Error') {
    const result = operate(operator, previousInput, currentInput);
    if (result === 'Error') {
      display.value = 'Error';
      currentInput = 'Error';
      operator = null;
      previousInput = '';
      resetOnNextDigit = true;
      return;
    }
    // format result
    let resultStr = result.toString();
    if (resultStr.length > 14) {
      resultStr = parseFloat(result).toExponential(8);
    }
    display.value = resultStr;
    currentInput = resultStr;
    previousInput = '';   // after equals, previous is cleared
    operator = null;
    resetOnNextDigit = true;   // next digit starts fresh
  }
}

// === number / digit handler ===
function handleNumber(num) {
  if (display.value === 'Error') {
    currentInput = '0';
    resetOnNextDigit = false;
  }
  if (resetOnNextDigit) {
    currentInput = num;
    resetOnNextDigit = false;
  } else {
    // avoid multiple leading zeros / too many digits
    if (currentInput.replace(/[.-]/g,'').length >= 14) return;  // length limit
    if (currentInput === '0' && num === '0') return; // keep single zero
    if (currentInput === '0' && num !== '.') {
      currentInput = num;
    } else {
      currentInput += num;
    }
  }
  updateDisplay(currentInput);
}

// === decimal point handler ===
function handleDecimal() {
  if (display.value === 'Error') {
    currentInput = '0.';
    resetOnNextDigit = false;
    updateDisplay(currentInput);
    return;
  }
  if (resetOnNextDigit) {
    currentInput = '0.';
    resetOnNextDigit = false;
    updateDisplay(currentInput);
    return;
  }
  if (!currentInput.includes('.')) {
    currentInput += '.';
    updateDisplay(currentInput);
  }
}

// === operator handler (+, -, *, /) ===
function handleOperator(op) {
  if (display.value === 'Error') {
    // reset on error before new operation
    currentInput = '0';
    previousInput = '';
    operator = null;
    resetOnNextDigit = true;
  }

  const cur = currentInput;

  // if there's already an operator and we're not in reset mode, evaluate first
  if (operator && !resetOnNextDigit && previousInput !== '' && cur !== 'Error') {
    const result = operate(operator, previousInput, cur);
    if (result === 'Error') {
      display.value = 'Error';
      currentInput = 'Error';
      operator = null;
      previousInput = '';
      resetOnNextDigit = true;
      return;
    }
    previousInput = result.toString();
    display.value = previousInput;
    currentInput = previousInput;
  } else if (previousInput === '' || resetOnNextDigit) {
    // if no previous operation, store current as previous
    previousInput = currentInput;
  }

  // set new operator and prepare for next number
  operator = op;
  resetOnNextDigit = true;
}

// === clear all ===
function clearAll() {
  currentInput = '0';
  previousInput = '';
  operator = null;
  resetOnNextDigit = false;
  updateDisplay('0');
}

// === backspace / delete last char ===
function backspace() {
  if (display.value === 'Error') {
    clearAll();
    return;
  }
  if (resetOnNextDigit) return; // nothing to delete when fresh start

  if (currentInput.length > 1) {
    currentInput = currentInput.slice(0, -1);
  } else {
    currentInput = '0';
  }
  updateDisplay(currentInput);
}

// === sign change (±) ===
function toggleSign() {
  if (display.value === 'Error') {
    currentInput = '0';
    updateDisplay('0');
    return;
  }
  if (currentInput !== '0' && currentInput !== '') {
    if (currentInput.startsWith('-')) {
      currentInput = currentInput.slice(1);
    } else {
      currentInput = '-' + currentInput;
    }
    updateDisplay(currentInput);
  }
}

// === BUTTON EVENT LISTENERS ===
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const target = e.currentTarget;

    // visual feedback for click (like keypress)
    target.classList.add('key-press');
    setTimeout(() => target.classList.remove('key-press'), 120);

    // handle different data attributes
    if (target.hasAttribute('data-value')) {
      const val = target.getAttribute('data-value');
      handleNumber(val);
    }
    else if (target.hasAttribute('data-action')) {
      const action = target.getAttribute('data-action');
      switch (action) {
        case 'clear': clearAll(); break;
        case 'back': backspace(); break;
        case 'decimal': handleDecimal(); break;
        case 'sign': toggleSign(); break;
        case '/':
        case '*':
        case '-':
        case '+':
          handleOperator(action); break;
        case '=': evaluate(); break;
        default: break;
      }
    }
  });
});

// === KEYBOARD SUPPORT (bonus) ===
document.addEventListener('keydown', (e) => {
  const key = e.key;
  // avoid triggering if inside input (though display readonly prevents edits)
  // but we want global control anyway
  const activeBtn = findButtonForKeyboard(key);
  if (activeBtn) {
    e.preventDefault();  // prevent any page scrolling etc.
    activeBtn.classList.add('key-press');
    setTimeout(() => activeBtn.classList.remove('key-press'), 120);
    // simulate click (reusing logic)
    activeBtn.click();
  } else {
    // special cases not directly mapped to one button
    if (key === 'Enter' || key === '=') {
      e.preventDefault();
      const equalsBtn = document.querySelector('.equals');
      equalsBtn?.classList.add('key-press');
      setTimeout(() => equalsBtn?.classList.remove('key-press'), 120);
      evaluate();
    }
    if (key === 'Escape' || key === 'c' || key === 'C') {
      e.preventDefault();
      const clearBtn = document.querySelector('.clear');
      clearBtn?.classList.add('key-press');
      setTimeout(() => clearBtn?.classList.remove('key-press'), 120);
      clearAll();
    }
    if (key === 'Backspace') {
      e.preventDefault();
      const backBtn = document.querySelector('.back');
      backBtn?.classList.add('key-press');
      setTimeout(() => backBtn?.classList.remove('key-press'), 120);
      backspace();
    }
    if (key === '.') {
      e.preventDefault();
      const decimalBtn = document.querySelector('.decimal');
      decimalBtn?.classList.add('key-press');
      setTimeout(() => decimalBtn?.classList.remove('key-press'), 120);
      handleDecimal();
    }
  }
});

// helper to find button based on keyboard key
function findButtonForKeyboard(key) {
  // numbers
  if (/^[0-9]$/.test(key)) {
    return document.querySelector(`.btn.number[data-value="${key}"]`);
  }
  // operators mapping:  / * -
  if (key === '/') return document.querySelector('.btn.operator[data-action="/"]');
  if (key === '*') return document.querySelector('.btn.operator[data-action="*"]');
  if (key === '-') return document.querySelector('.btn.operator[data-action="-"]');
  if (key === '+') return document.querySelector('.btn.operator[data-action="+"]');
  // sign toggle (key "`" or "~"? not standard, but we can use 's' for sign)
  if (key === 's' || key === 'S') {
    return document.querySelector('.btn.sign');
  }
  return null;
}