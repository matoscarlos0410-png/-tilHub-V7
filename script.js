/* =====================================================
   ÚTILHUB V7
   JAVASCRIPT PRINCIPAL
===================================================== */

"use strict";


/* =====================================================
   ELEMENTOS GENERALES
===================================================== */

const modal = document.getElementById("toolModal");
const modalBody = document.getElementById("modalBody");
const modalClose = document.getElementById("modalClose");

const mainSearch = document.getElementById("mainSearch");
const searchButton = document.getElementById("searchButton");

const toolsGrid = document.getElementById("toolsGrid");
const noResults = document.getElementById("noResults");

const categoryFilter = document.getElementById("categoryFilter");

const yearElement = document.getElementById("year");

if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}


/* =====================================================
   MENÚ MÓVIL
===================================================== */

const menuButton = document.getElementById("menuButton");
const nav = document.getElementById("nav");

if (menuButton) {
  menuButton.addEventListener("click", () => {
    nav.classList.toggle("show");
  });
}

document.querySelectorAll(".nav a").forEach(link => {
  link.addEventListener("click", () => {
    nav.classList.remove("show");
  });
});


/* =====================================================
   MODAL
===================================================== */

function openModal(content) {
  modalBody.innerHTML = content;
  modal.classList.add("show");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  modal.classList.remove("show");
  modalBody.innerHTML = "";
  document.body.style.overflow = "";
}

modalClose.addEventListener("click", closeModal);

modal.addEventListener("click", event => {
  if (event.target === modal) {
    closeModal();
  }
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    closeModal();
  }
});


/* =====================================================
   UTILIDADES GENERALES
===================================================== */

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function copyText(text) {
  if (!navigator.clipboard) {
    alert("Tu navegador no permite copiar automáticamente.");
    return;
  }

  navigator.clipboard.writeText(text)
    .then(() => alert("Copiado correctamente."))
    .catch(() => alert("No se pudo copiar."));
}

function formatNumber(value) {
  return Number(value).toLocaleString("es-PE", {
    maximumFractionDigits: 8
  });
}


/* =====================================================
   HISTORIAL
===================================================== */

function addHistory(toolId, name) {

  let history = JSON.parse(
    localStorage.getItem("utilhub_history") || "[]"
  );

  history = history.filter(item => item.id !== toolId);

  history.unshift({
    id: toolId,
    name: name
  });

  history = history.slice(0, 8);

  localStorage.setItem(
    "utilhub_history",
    JSON.stringify(history)
  );

  renderHistory();
}

function renderHistory() {

  const container = document.getElementById("historyList");

  if (!container) return;

  const history = JSON.parse(
    localStorage.getItem("utilhub_history") || "[]"
  );

  if (!history.length) {
    container.innerHTML = "<p>Aún no hay historial.</p>";
    return;
  }

  container.innerHTML = history.map(item => `
    <button class="saved-item" data-open-tool="${escapeHTML(item.id)}">
      ${escapeHTML(item.name)}
    </button>
  `).join("");

  container.querySelectorAll("[data-open-tool]").forEach(button => {
    button.addEventListener("click", () => {
      openTool(button.dataset.openTool);
    });
  });
}


/* =====================================================
   FAVORITOS
===================================================== */

function getFavorites() {
  return JSON.parse(
    localStorage.getItem("utilhub_favorites") || "[]"
  );
}

function saveFavorites(list) {
  localStorage.setItem(
    "utilhub_favorites",
    JSON.stringify(list)
  );
}

function toggleFavorite(id) {

  let favorites = getFavorites();

  if (favorites.includes(id)) {
    favorites = favorites.filter(item => item !== id);
  } else {
    favorites.push(id);
  }

  saveFavorites(favorites);

  updateFavoriteButtons();
  renderFavorites();
}

function updateFavoriteButtons() {

  const favorites = getFavorites();

  document.querySelectorAll(".favorite-btn").forEach(button => {

    const id = button.dataset.favorite;

    if (favorites.includes(id)) {
      button.classList.add("active");
      button.textContent = "★";
    } else {
      button.classList.remove("active");
      button.textContent = "☆";
    }

  });
}

function renderFavorites() {

  const container = document.getElementById("favoritesList");

  if (!container) return;

  const favorites = getFavorites();

  if (!favorites.length) {
    container.innerHTML = "<p>Aún no tienes favoritos.</p>";
    return;
  }

  const names = {
    calculator: "Calculadora",
    percentage: "Porcentajes",
    discount: "Descuentos",
    ruleOfThree: "Regla de tres",
    average: "Promedio",
    expenses: "Gastos",
    converter: "Conversor",
    temperature: "Temperatura",
    currency: "Monedas",
    timer: "Temporizador",
    stopwatch: "Cronómetro",
    notes: "Notas",
    tasks: "Tareas",
    shoppingList: "Lista de compras",
    password: "Contraseñas",
    qr: "Código QR",
    random: "Número aleatorio",
    dictionary: "Diccionario",
    study: "Estudio",
    dateCounter: "Contador de días"
  };

  container.innerHTML = favorites.map(id => `
    <button
      class="saved-item"
      data-favorite-open="${escapeHTML(id)}"
    >
      ⭐ ${escapeHTML(names[id] || id)}
    </button>
  `).join("");

  container.querySelectorAll("[data-favorite-open]")
    .forEach(button => {
      button.addEventListener("click", () => {
        openTool(button.dataset.favoriteOpen);
      });
    });
}

document.querySelectorAll(".favorite-btn").forEach(button => {
  button.addEventListener("click", event => {
    event.stopPropagation();
    toggleFavorite(button.dataset.favorite);
  });
});


/* =====================================================
   BÚSQUEDA
===================================================== */

function searchTools(query) {

  const text = query.toLowerCase().trim();

  let visible = 0;

  document.querySelectorAll(".tool-card").forEach(card => {

    const name = card.dataset.name.toLowerCase();
    const category = card.dataset.category;

    const selectedCategory =
      categoryFilter.value;

    const categoryOK =
      selectedCategory === "all" ||
      category === selectedCategory;

    const searchOK =
      !text || name.includes(text);

    if (categoryOK && searchOK) {
      card.style.display = "";
      visible++;
    } else {
      card.style.display = "none";
    }
  });

  noResults.style.display =
    visible === 0 ? "block" : "none";
}

searchButton.addEventListener("click", () => {
  searchTools(mainSearch.value);

  document.getElementById("herramientas")
    .scrollIntoView({ behavior: "smooth" });
});

mainSearch.addEventListener("input", () => {
  searchTools(mainSearch.value);
});

mainSearch.addEventListener("keydown", event => {
  if (event.key === "Enter") {
    searchButton.click();
  }
});

categoryFilter.addEventListener("change", () => {
  searchTools(mainSearch.value);
});


/* =====================================================
   ABRIR HERRAMIENTAS
===================================================== */

document.querySelectorAll("[data-open-tool]").forEach(button => {

  button.addEventListener("click", () => {
    openTool(button.dataset.openTool);
  });

});


function openTool(id) {

  const names = {
    calculator: "Calculadora",
    percentage: "Porcentajes",
    discount: "Descuentos",
    ruleOfThree: "Regla de tres",
    average: "Promedio",
    expenses: "Gastos",
    converter: "Conversor",
    temperature: "Temperatura",
    currency: "Conversor de monedas",
    timer: "Temporizador",
    stopwatch: "Cronómetro",
    notes: "Notas",
    tasks: "Tareas",
    shoppingList: "Lista de compras",
    password: "Generador de contraseñas",
    qr: "Generador de código QR",
    random: "Número aleatorio",
    dictionary: "Diccionario",
    study: "Organizador de estudio",
    dateCounter: "Contador de días"
  };

  if (names[id]) {
    addHistory(id, names[id]);
  }

  const functions = {
    calculator: showCalculator,
    percentage: showPercentage,
    discount: showDiscount,
    ruleOfThree: showRuleOfThree,
    average: showAverage,
    expenses: showExpenses,
    converter: showConverter,
    temperature: showTemperature,
    currency: showCurrency,
    timer: showTimer,
    stopwatch: showStopwatch,
    notes: showNotes,
    tasks: showTasks,
    shoppingList: showShoppingList,
    password: showPassword,
    qr: showQR,
    random: showRandom,
    dictionary: showDictionary,
    study: showStudy,
    dateCounter: showDateCounter
  };

  if (functions[id]) {
    functions[id]();
  }
}


/* =====================================================
   1. CALCULADORA
===================================================== */

function showCalculator() {

  openModal(`
    <h2 class="modal-title">🧮 Calculadora</h2>

    <div class="form-group">
      <label>Operación</label>
      <input
        id="calcInput"
        placeholder="Ejemplo: 25 + 10 × 2"
        inputmode="decimal"
      >
    </div>

    <div class="modal-actions">
      <button class="primary-btn" id="calcButton">
        Calcular
      </button>

      <button class="secondary-btn" id="calcClear">
        Limpiar
      </button>
    </div>

    <div class="result-box" id="calcResult">
      Escribe una operación.
    </div>
  `);

  const input = document.getElementById("calcInput");
  const result = document.getElementById("calcResult");

  function calculate() {

    try {

      const value = input.value.trim();

      if (!value) {
        result.textContent = "Escribe una operación.";
        return;
      }

      const answer = safeCalculate(value);

      result.innerHTML = `
        Resultado:
        <div class="big-result">
          ${formatNumber(answer)}
        </div>
      `;

    } catch {
      result.textContent =
        "Operación no válida. Usa números y + - × ÷ ( ).";
    }
  }

  document.getElementById("calcButton")
    .addEventListener("click", calculate);

  input.addEventListener("keydown", event => {
    if (event.key === "Enter") {
      calculate();
    }
  });

  document.getElementById("calcClear")
    .addEventListener("click", () => {
      input.value = "";
      result.textContent = "Escribe una operación.";
      input.focus();
    });

  input.focus();
}


/* Calculadora segura */
function safeCalculate(expression) {

  let exp = expression
    .replaceAll("×", "*")
    .replaceAll("÷", "/")
    .replaceAll(",", ".")
    .replace(/\s+/g, "");

  if (!/^[0-9+\-*/().%]+$/.test(exp)) {
    throw new Error("Caracteres inválidos");
  }

  const tokens = tokenize(exp);

  const parser = new ExpressionParser(tokens);

  const value = parser.parseExpression();

  if (!Number.isFinite(value)) {
    throw new Error("Resultado inválido");
  }

  if (parser.position !== tokens.length) {
    throw new Error("Operación inválida");
  }

  return value;
}

function tokenize(expression) {

  const tokens = [];

  let number = "";

  for (let i = 0; i < expression.length; i++) {

    const char = expression[i];

    if (
      /[0-9.]/.test(char)
    ) {
      number += char;
      continue;
    }

    if (number) {
      tokens.push(Number(number));
      number = "";
    }

    if ("+-*/()%".includes(char)) {
      tokens.push(char);
    } else {
      throw new Error("Token inválido");
    }
  }

  if (number) {
    tokens.push(Number(number));
  }

  return tokens;
}

class ExpressionParser {

  constructor(tokens) {
    this.tokens = tokens;
    this.position = 0;
  }

  current() {
    return this.tokens[this.position];
  }

  parseExpression() {

    let value = this.parseTerm();

    while (
      this.current() === "+" ||
      this.current() === "-"
    ) {

      const operator = this.current();

      this.position++;

      const right = this.parseTerm();

      if (operator === "+") {
        value += right;
      } else {
        value -= right;
      }
    }

    return value;
  }

  parseTerm() {

    let value = this.parseFactor();

    while (
      this.current() === "*" ||
      this.current() === "/"
    ) {

      const operator = this.current();

      this.position++;

      const right = this.parseFactor();

      if (operator === "*") {
        value *= right;
      } else {

        if (right === 0) {
          throw new Error("No se puede dividir entre cero");
        }

        value /= right;
      }
    }

    return value;
  }

  parseFactor() {

    if (this.current() === "+") {
      this.position++;
      return this.parseFactor();
    }

    if (this.current() === "-") {
      this.position++;
      return -this.parseFactor();
    }

    if (this.current() === "(") {

      this.position++;

      const value = this.parseExpression();

      if (this.current() !== ")") {
        throw new Error("Falta cerrar paréntesis");
      }

      this.position++;

      return this.applyPercent(value);
    }

    const value = this.current();

    if (
      typeof value !== "number" ||
      Number.isNaN(value)
    ) {
      throw new Error("Número esperado");
    }

    this.position++;

    return this.applyPercent(value);
  }

  applyPercent(value) {

    if (this.current() === "%") {
      this.position++;
      return value / 100;
    }

    return value;
  }
}


/* =====================================================
   2. PORCENTAJES
===================================================== */

function showPercentage() {

  openModal(`
    <h2 class="modal-title">％ Porcentaje</h2>

    <div class="form-group">
      <label>¿Qué porcentaje?</label>
      <input id="percentValue" type="number" placeholder="Ejemplo: 20">
    </div>

    <div class="form-group">
      <label>De qué cantidad</label>
      <input id="percentTotal" type="number" placeholder="Ejemplo: 500">
    </div>

    <button class="primary-btn" id="percentButton">
      Calcular
    </button>

    <div class="result-box" id="percentResult">
      Resultado.
    </div>
  `);

  document.getElementById("percentButton")
    .addEventListener("click", () => {

      const p = Number(
        document.getElementById("percentValue").value
      );

      const total = Number(
        document.getElementById("percentTotal").value
      );

      if (!Number.isFinite(p) || !Number.isFinite(total)) {
        document.getElementById("percentResult").textContent =
          "Completa los campos.";
        return;
      }

      const answer = total * p / 100;

      document.getElementById("percentResult").innerHTML = `
        Resultado:
        <div class="big-result">${formatNumber(answer)}</div>
      `;
    });
}


/* =====================================================
   3. DESCUENTO
===================================================== */

function showDiscount() {

  openModal(`
    <h2 class="modal-title">🏷️ Descuento</h2>

    <div class="form-group">
      <label>Precio original</label>
      <input id="discountPrice" type="number" step="0.01">
    </div>

    <div class="form-group">
      <label>Descuento (%)</label>
      <input id="discountPercent" type="number" step="0.01">
    </div>

    <button class="primary-btn" id="discountButton">
      Calcular
    </button>

    <div class="result-box" id="discountResult">
      Resultado.
    </div>
  `);

  document.getElementById("discountButton")
    .addEventListener("click", () => {

      const price = Number(
        document.getElementById("discountPrice").value
      );

      const discount = Number(
        document.getElementById("discountPercent").value
      );

      if (
        !Number.isFinite(price) ||
        !Number.isFinite(discount) ||
        price < 0 ||
        discount < 0 ||
        discount > 100
      ) {
        document.getElementById("discountResult").textContent =
          "Introduce valores válidos.";
        return;
      }

      const saved = price * discount / 100;
      const finalPrice = price - saved;

      document.getElementById("discountResult").innerHTML = `
        Ahorras: <strong>${formatNumber(saved)}</strong><br><br>
        Precio final:
        <div class="big-result">
          ${formatNumber(finalPrice)}
        </div>
      `;
    });
}


/* =====================================================
   4. REGLA DE TRES
===================================================== */

function showRuleOfThree() {

  openModal(`
    <h2 class="modal-title">📐 Regla de tres</h2>

    <p style="color:#9ba6c2;margin-bottom:20px;">
      Si A corresponde a B, ¿cuánto corresponde a C?
    </p>

    <div class="form-group">
      <label>A</label>
      <input id="r3a" type="number">
    </div>

    <div class="form-group">
      <label>B</label>
      <input id="r3b" type="number">
    </div>

    <div class="form-group">
      <label>C</label>
      <input id="r3c" type="number">
    </div>

    <button class="primary-btn" id="r3Button">
      Resolver
    </button>

    <div class="result-box" id="r3Result">
      Resultado.
    </div>
  `);

  document.getElementById("r3Button")
    .addEventListener("click", () => {

      const a = Number(document.getElementById("r3a").value);
      const b = Number(document.getElementById("r3b").value);
      const c = Number(document.getElementById("r3c").value);

      if (!a || !Number.isFinite(b) || !Number.isFinite(c)) {
        document.getElementById("r3Result").textContent =
          "Introduce valores válidos.";
        return;
      }

      const result = (b * c) / a;

      document.getElementById("r3Result").innerHTML = `
        Resultado:
        <div class="big-result">${formatNumber(result)}</div>
      `;
    });
}


/* =====================================================
   5. PROMEDIO
===================================================== */

function showAverage() {

  openModal(`
    <h2 class="modal-title">📊 Promedio</h2>

    <div class="form-group">
      <label>Números separados por comas</label>
      <input
        id="averageInput"
        placeholder="Ejemplo: 15, 17, 18, 14"
      >
    </div>

    <button class="primary-btn" id="averageButton">
      Calcular promedio
    </button>

    <div class="result-box" id="averageResult">
      Resultado.
    </div>
  `);

  document.getElementById("averageButton")
    .addEventListener("click", () => {

      const values = document.getElementById("averageInput")
        .value
        .split(",")
        .map(value => Number(value.trim()))
        .filter(value => Number.isFinite(value));

      if (!values.length) {
        document.getElementById("averageResult").textContent =
          "Introduce números separados por comas.";
        return;
      }

      const total = values.reduce(
        (sum, value) => sum + value,
        0
      );

      const average = total / values.length;

      document.getElementById("averageResult").innerHTML = `
        Cantidad de valores: ${values.length}<br>
        Promedio:
        <div class="big-result">
          ${formatNumber(average)}
        </div>
      `;
    });
}


/* =====================================================
   6. GASTOS
===================================================== */

function showExpenses() {

  openModal(`
    <h2 class="modal-title">💰 Calculadora de gastos</h2>

    <div class="form-group">
      <label>Presupuesto disponible</label>
      <input id="budgetInput" type="number" step="0.01">
    </div>

    <div class="form-group">
      <label>Gastos separados por comas</label>
      <input
        id="expensesInput"
        placeholder="Ejemplo: 20, 15.50, 30"
      >
    </div>

    <button class="primary-btn" id="expensesButton">
      Calcular
    </button>

    <div class="result-box" id="expensesResult">
      Resultado.
    </div>
  `);

  document.getElementById("expensesButton")
    .addEventListener("click", () => {

      const budget = Number(
        document.getElementById("budgetInput").value
      );

      const expenses = document.getElementById("expensesInput")
        .value
        .split(",")
        .map(Number)
        .filter(Number.isFinite);

      const total = expenses.reduce(
        (sum, value) => sum + value,
        0
      );

      const remaining = budget - total;

      document.getElementById("expensesResult").innerHTML = `
        Total gastado:
        <strong>${formatNumber(total)}</strong><br><br>
        Saldo:
        <div class="big-result">
          ${formatNumber(remaining)}
        </div>
      `;
    });
}


/* =====================================================
   7. CONVERSOR
===================================================== */

function showConverter() {

  openModal(`
    <h2 class="modal-title">📏 Conversor</h2>

    <div class="form-group">
      <label>Cantidad</label>
      <input id="convValue" type="number">
    </div>

    <div class="form-group">
      <label>De</label>

      <select id="convFrom">
        <option value="m">Metros</option>
        <option value="km">Kilómetros</option>
        <option value="cm">Centímetros</option>
        <option value="kg">Kilogramos</option>
        <option value="g">Gramos</option>
        <option value="l">Litros</option>
        <option value="ml">Mililitros</option>
      </select>
    </div>

    <div class="form-group">
      <label>A</label>

      <select id="convTo">
        <option value="m">Metros</option>
        <option value="km">Kilómetros</option>
        <option value="cm">Centímetros</option>
        <option value="kg">Kilogramos</option>
        <option value="g">Gramos</option>
        <option value="l">Litros</option>
        <option value="ml">Mililitros</option>
      </select>
    </div>

    <button class="primary-btn" id="convButton">
      Convertir
    </button>

    <div class="result-box" id="convResult">
      Resultado.
    </div>
  `);

  document.getElementById("convButton")
    .addEventListener("click", () => {

      const value = Number(
        document.getElementById("convValue").value
      );

      const from =
        document.getElementById("convFrom").value;

      const to =
        document.getElementById("convTo").value;

      const groups = {

        length: ["m", "km", "cm"],
        weight: ["kg", "g"],
        volume: ["l", "ml"]

      };

      let group = null;

      for (const key of Object.keys(groups)) {

        if (
          groups[key].includes(from) &&
          groups[key].includes(to)
        ) {
          group = key;
          break;
        }
      }

      if (!group) {
        document.getElementById("convResult").textContent =
          "Esas unidades no se pueden convertir entre sí.";
        return;
      }

      const factors = {

        m: 1,
        km: 1000,
        cm: 0.01,

        kg: 1,
        g: 0.001,

        l: 1,
        ml: 0.001

      };

      const base = value * factors[from];

      const result = base / factors[to];

      document.getElementById("convResult").innerHTML = `
        Resultado:
        <div class="big-result">
          ${formatNumber(result)}
        </div>
      `;
    });
}


/* =====================================================
   8. TEMPERATURA
===================================================== */

function showTemperature() {

  openModal(`
    <h2 class="modal-title">🌡️ Temperatura</h2>

    <div class="form-group">
      <label>Temperatura</label>
      <input id="tempValue" type="number">
    </div>

    <div class="form-group">
      <label>Unidad</label>

      <select id="tempUnit">
        <option value="C">Celsius</option>
        <option value="F">Fahrenheit</option>
        <option value="K">Kelvin</option>
      </select>
    </div>

    <button class="primary-btn" id="tempButton">
      Convertir
    </button>

    <div class="result-box" id="tempResult">
      Resultado.
    </div>
  `);

  document.getElementById("tempButton")
    .addEventListener("click", () => {

      const value = Number(
        document.getElementById("tempValue").value
      );

      const unit =
        document.getElementById("tempUnit").value;

      if (!Number.isFinite(value)) return;

      let celsius;

      if (unit === "C") celsius = value;
      if (unit === "F") celsius = (value - 32) * 5 / 9;
      if (unit === "K") celsius = value - 273.15;

      const fahrenheit = celsius * 9 / 5 + 32;
      const kelvin = celsius + 273.15;

      document.getElementById("tempResult").innerHTML = `
        Celsius: <strong>${formatNumber(celsius)} °C</strong><br>
        Fahrenheit: <strong>${formatNumber(fahrenheit)} °F</strong><br>
        Kelvin: <strong>${formatNumber(kelvin)} K</strong>
      `;
    });
}


/* =====================================================
   9. MONEDAS
===================================================== */

function showCurrency() {

  openModal(`
    <h2 class="modal-title">💱 Conversor de monedas</h2>

    <div class="form-group">
      <label>Cantidad</label>
      <input id="currencyAmount" type="number" value="1">
    </div>

    <div class="form-group">
      <label>Desde</label>

      <select id="currencyFrom">
        <option value="USD">USD - Dólar</option>
        <option value="PEN">PEN - Sol peruano</option>
        <option value="EUR">EUR - Euro</option>
        <option value="GBP">GBP - Libra</option>
        <option value="JPY">JPY - Yen</option>
      </select>
    </div>

    <div class="form-group">
      <label>Hacia</label>

      <select id="currencyTo">
        <option value="PEN">PEN - Sol peruano</option>
        <option value="USD">USD - Dólar</option>
        <option value="EUR">EUR - Euro</option>
        <option value="GBP">GBP - Libra</option>
        <option value="JPY">JPY - Yen</option>
      </select>
    </div>

    <button class="primary-btn" id="currencyButton">
      Consultar conversión
    </button>

    <div class="result-box" id="currencyResult">
      La tasa se consultará en línea.
    </div>
  `);

  document.getElementById("currencyButton")
    .addEventListener("click", async () => {

      const amount = Number(
        document.getElementById("currencyAmount").value
      );

      const from =
        document.getElementById("currencyFrom").value;

      const to =
        document.getElementById("currencyTo").value;

      const resultBox =
        document.getElementById("currencyResult");

      if (!Number.isFinite(amount)) {
        resultBox.textContent =
          "Introduce una cantidad válida.";
        return;
      }

      if (from === to) {
        resultBox.innerHTML = `
          <div class="big-result">
            ${formatNumber(amount)} ${to}
          </div>
        `;
        return;
      }

      resultBox.textContent =
        "Consultando tasa...";

      try {

        const response = await fetch(
          `https://api.frankfurter.app/latest?amount=${encodeURIComponent(amount)}&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
        );

        if (!response.ok) {
          throw new Error("API");
        }

        const data = await response.json();

        const converted = data.rates[to];

        resultBox.innerHTML = `
          Resultado:
          <div class="big-result">
            ${formatNumber(converted)} ${escapeHTML(to)}
          </div>

          <small>
            Tasa consultada en línea. Puede variar.
          </small>
        `;

      } catch {

        resultBox.innerHTML = `
          No se pudo consultar la tasa en este momento.
          <br><br>
          Puedes volver a intentarlo más tarde.
        `;
      }
    });
}


/* =====================================================
   10. TEMPORIZADOR
===================================================== */

let timerInterval = null;
let timerEnd = 0;
let timerRemaining = 0;

function showTimer() {

  openModal(`
    <h2 class="modal-title">⏱️ Temporizador</h2>

    <div class="form-group">
      <label>Minutos</label>
      <input id="timerMinutes" type="number" min="0" value="5">
    </div>

    <div class="form-group">
      <label>Segundos</label>
      <input id="timerSeconds" type="number" min="0" value="0">
    </div>

    <div class="result-box" style="text-align:center;">
      <div class="big-result" id="timerDisplay">
        05:00
      </div>
    </div>

    <div class="modal-actions">

      <button class="primary-btn" id="timerStart">
        Iniciar
      </button>

      <button class="secondary-btn" id="timerPause">
        Pausar
      </button>

      <button class="secondary-btn" id="timerReset">
        Reiniciar
      </button>

    </div>
  `);

  clearInterval(timerInterval);

  const display =
    document.getElementById("timerDisplay");

  function updateDisplay(seconds) {

    seconds = Math.max(0, Math.floor(seconds));

    const minutes =
      Math.floor(seconds / 60);

    const secs =
      seconds % 60;

    display.textContent =
      `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }

  function startTimer() {

    if (timerRemaining <= 0) {

      const minutes = Number(
        document.getElementById("timerMinutes").value
      );

      const seconds = Number(
        document.getElementById("timerSeconds").value
      );

      timerRemaining =
        Math.max(0, minutes * 60 + seconds);
    }

    if (timerRemaining <= 0) return;

    timerEnd = Date.now() + timerRemaining * 1000;

    clearInterval(timerInterval);

    timerInterval = setInterval(() => {

      timerRemaining =
        Math.ceil((timerEnd - Date.now()) / 1000);

      updateDisplay(timerRemaining);

      if (timerRemaining <= 0) {

        clearInterval(timerInterval);

        alert("⏰ ¡El temporizador terminó!");

        timerRemaining = 0;
      }

    }, 200);

  }

  document.getElementById("timerStart")
    .addEventListener("click", startTimer);

  document.getElementById("timerPause")
    .addEventListener("click", () => {

      timerRemaining =
        Math.max(
          0,
          Math.ceil(
            (timerEnd - Date.now()) / 1000
          )
        );

      clearInterval(timerInterval);

      updateDisplay(timerRemaining);
    });

  document.getElementById("timerReset")
    .addEventListener("click", () => {

      clearInterval(timerInterval);

      timerRemaining = 0;

      const minutes = Number(
        document.getElementById("timerMinutes").value
      );

      const seconds = Number(
        document.getElementById("timerSeconds").value
      );

      updateDisplay(
        Math.max(0, minutes * 60 + seconds)
      );
    });
}


/* =====================================================
   11. CRONÓMETRO
===================================================== */

let stopwatchInterval = null;
let stopwatchStart = 0;
let stopwatchElapsed = 0;

function showStopwatch() {

  openModal(`
    <h2 class="modal-title">⏲️ Cronómetro</h2>

    <div class="result-box" style="text-align:center;">
      <div class="big-result" id="stopwatchDisplay">
        00:00:00
      </div>
    </div>

    <div class="modal-actions">

      <button class="primary-btn" id="stopwatchStart">
        Iniciar
      </button>

      <button class="secondary-btn" id="stopwatchPause">
        Pausar
      </button>

      <button class="secondary-btn" id="stopwatchReset">
        Reiniciar
      </button>

    </div>
  `);

  clearInterval(stopwatchInterval);

  stopwatchElapsed = 0;

  const display =
    document.getElementById("stopwatchDisplay");

  function update() {

    let elapsed = stopwatchElapsed;

    if (stopwatchStart) {
      elapsed += Date.now() - stopwatchStart;
    }

    const totalSeconds =
      Math.floor(elapsed / 1000);

    const hours =
      Math.floor(totalSeconds / 3600);

    const minutes =
      Math.floor((totalSeconds % 3600) / 60);

    const seconds =
      totalSeconds % 60;

    display.textContent =
      `${String(hours).padStart(2, "0")}:` +
      `${String(minutes).padStart(2, "0")}:` +
      `${String(seconds).padStart(2, "0")}`;
  }

  document.getElementById("stopwatchStart")
    .addEventListener("click", () => {

      if (!stopwatchStart) {
        stopwatchStart = Date.now();

        stopwatchInterval =
          setInterval(update, 200);
      }

    });

  document.getElementById("stopwatchPause")
    .addEventListener("click", () => {

      if (stopwatchStart) {

        stopwatchElapsed +=
          Date.now() - stopwatchStart;

        stopwatchStart = 0;

        clearInterval(stopwatchInterval);

        update();
      }

    });

  document.getElementById("stopwatchReset")
    .addEventListener("click", () => {

      clearInterval(stopwatchInterval);

      stopwatchStart = 0;
      stopwatchElapsed = 0;

      update();
    });

}


/* =====================================================
   12. NOTAS
===================================================== */

function showNotes() {

  const saved =
    localStorage.getItem("utilhub_notes") || "";

  openModal(`
    <h2 class="modal-title">📝 Mis notas</h2>

    <div class="form-group">
      <label>Escribe tu nota</label>

      <textarea
        id="notesText"
        placeholder="Escribe aquí..."
      >${escapeHTML(saved)}</textarea>
    </div>

    <div class="modal-actions">

      <button class="primary-btn" id="saveNotes">
        Guardar
      </button>

      <button class="secondary-btn" id="copyNotes">
        Copiar
      </button>

      <button class="danger-btn" id="clearNotes">
        Borrar
      </button>

    </div>
  `);

  document.getElementById("saveNotes")
    .addEventListener("click", () => {

      const text =
        document.getElementById("notesText").value;

      localStorage.setItem(
        "utilhub_notes",
        text
      );

      alert("Nota guardada en este dispositivo.");
    });

  document.getElementById("copyNotes")
    .addEventListener("click", () => {

      copyText(
        document.getElementById("notesText").value
      );
    });

  document.getElementById("clearNotes")
    .addEventListener("click", () => {

      if (confirm("¿Borrar la nota?")) {

        localStorage.removeItem("utilhub_notes");

        document.getElementById("notesText").value = "";
      }
    });
}


/* =====================================================
   13. TAREAS
===================================================== */

function getTasks() {
  return JSON.parse(
    localStorage.getItem("utilhub_tasks") || "[]"
  );
}

function saveTasks(tasks) {
  localStorage.setItem(
    "utilhub_tasks",
    JSON.stringify(tasks)
  );
}

function showTasks() {

  openModal(`
    <h2 class="modal-title">✅ Mis tareas</h2>

    <div class="form-group">
      <input
        id="taskInput"
        placeholder="Nueva tarea..."
      >
    </div>

    <button class="primary-btn" id="addTask">
      Agregar tarea
    </button>

    <div class="list-container" id="taskList"></div>
  `);

  renderTasks();

  document.getElementById("addTask")
    .addEventListener("click", addTask);

  document.getElementById("taskInput")
    .addEventListener("keydown", event => {

      if (event.key === "Enter") {
        addTask();
      }

    });
}

function addTask() {

  const input =
    document.getElementById("taskInput");

  const text = input.value.trim();

  if (!text) return;

  const tasks = getTasks();

  tasks.push({
    id: Date.now(),
    text,
    done: false
  });

  saveTasks(tasks);

  input.value = "";

  renderTasks();
}

function renderTasks() {

  const container =
    document.getElementById("taskList");

  if (!container) return;

  const tasks = getTasks();

  if (!tasks.length) {
    container.innerHTML =
      `<p style="color:#9ba6c2;">No hay tareas.</p>`;
    return;
  }

  container.innerHTML =
    tasks.map(task => `

      <div class="list-row ${task.done ? "done" : ""}">

        <span>
          ${escapeHTML(task.text)}
        </span>

        <div>

          <button
            class="secondary-btn task-done"
            data-id="${task.id}"
          >
            ${task.done ? "↩" : "✓"}
          </button>

          <button
            class="danger-btn task-delete"
            data-id="${task.id}"
          >
            ×
          </button>

        </div>

      </div>

    `).join("");

  container.querySelectorAll(".task-done")
    .forEach(button => {

      button.addEventListener("click", () => {

        const tasks = getTasks();

        const task = tasks.find(
          item => item.id === Number(button.dataset.id)
        );

        if (task) {
          task.done = !task.done;
        }

        saveTasks(tasks);

        renderTasks();
      });

    });

  container.querySelectorAll(".task-delete")
    .forEach(button => {

      button.addEventListener("click", () => {

        const tasks = getTasks()
          .filter(
            item => item.id !== Number(button.dataset.id)
          );

        saveTasks(tasks);

        renderTasks();
      });

    });
}


/* =====================================================
   14. LISTA DE COMPRAS
===================================================== */

function getShoppingList() {

  return JSON.parse(
    localStorage.getItem("utilhub_shopping") || "[]"
  );
}

function saveShoppingList(list) {

  localStorage.setItem(
    "utilhub_shopping",
    JSON.stringify(list)
  );
}

function showShoppingList() {

  openModal(`
    <h2 class="modal-title">🛒 Lista de compras</h2>

    <div class="form-group">
      <input
        id="shoppingInput"
        placeholder="Ejemplo: arroz, leche..."
      >
    </div>

    <button class="primary-btn" id="addShopping">
      Agregar
    </button>

    <div class="list-container" id="shoppingItems"></div>
  `);

  renderShoppingList();

  document.getElementById("addShopping")
    .addEventListener("click", addShoppingItem);

  document.getElementById("shoppingInput")
    .addEventListener("keydown", event => {

      if (event.key === "Enter") {
        addShoppingItem();
      }

    });
}

function addShoppingItem() {

  const input =
    document.getElementById("shoppingInput");

  const text = input.value.trim();

  if (!text) return;

  const list = getShoppingList();

  list.push({
    id: Date.now(),
    text,
    done: false
  });

  saveShoppingList(list);

  input.value = "";

  renderShoppingList();
}

function renderShoppingList() {

  const container =
    document.getElementById("shoppingItems");

  if (!container) return;

  const list = getShoppingList();

  if (!list.length) {

    container.innerHTML =
      `<p style="color:#9ba6c2;">Lista vacía.</p>`;

    return;
  }

  container.innerHTML =
    list.map(item => `

      <div class="list-row ${item.done ? "done" : ""}">

        <span>${escapeHTML(item.text)}</span>

        <div>

          <button
            class="secondary-btn shopping-done"
            data-id="${item.id}"
          >
            ${item.done ? "↩" : "✓"}
          </button>

          <button
            class="danger-btn shopping-delete"
            data-id="${item.id}"
          >
            ×
          </button>

        </div>

      </div>

    `).join("");

  container.querySelectorAll(".shopping-done")
    .forEach(button => {

      button.addEventListener("click", () => {

        const list = getShoppingList();

        const item = list.find(
          x => x.id === Number(button.dataset.id)
        );

        if (item) {
          item.done = !item.done;
        }

        saveShoppingList(list);

        renderShoppingList();
      });

    });

  container.querySelectorAll(".shopping-delete")
    .forEach(button => {

      button.addEventListener("click", () => {

        const list = getShoppingList()
          .filter(
            x => x.id !== Number(button.dataset.id)
          );

        saveShoppingList(list);

        renderShoppingList();
      });

    });
}


/* =====================================================
   15. CONTRASEÑAS
===================================================== */

function showPassword() {

  openModal(`
    <h2 class="modal-title">🔐 Generador de contraseñas</h2>

    <div class="form-group">
      <label>Longitud</label>

      <input
        id="passwordLength"
        type="number"
        min="6"
        max="64"
        value="16"
      >
    </div>

    <div class="form-group">
      <label>
        <input id="passUpper" type="checkbox" checked>
        Mayúsculas
      </label>

      <label>
        <input id="passNumbers" type="checkbox" checked>
        Números
      </label>

      <label>
        <input id="passSymbols" type="checkbox" checked>
        Símbolos
      </label>
    </div>

    <button class="primary-btn" id="generatePassword">
      Generar
    </button>

    <div class="result-box password-result" id="passwordResult">
      Pulsa generar.
    </div>

    <button class="secondary-btn" id="copyPassword">
      Copiar contraseña
    </button>
  `);

  document.getElementById("generatePassword")
    .addEventListener("click", generatePassword);

  document.getElementById("copyPassword")
    .addEventListener("click", () => {

      copyText(
        document.getElementById("passwordResult")
          .textContent
      );

    });
}

function randomSecure(max) {

  if (
    window.crypto &&
    window.crypto.getRandomValues
  ) {

    const array = new Uint32Array(1);

    window.crypto.getRandomValues(array);

    return array[0] % max;
  }

  return Math.floor(Math.random() * max);
}

function generatePassword() {

  let length = Number(
    document.getElementById("passwordLength").value
  );

  length = Math.min(64, Math.max(6, length));

  let chars =
    "abcdefghijklmnopqrstuvwxyz";

  if (
    document.getElementById("passUpper").checked
  ) {
    chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  }

  if (
    document.getElementById("passNumbers").checked
  ) {
    chars += "0123456789";
  }

  if (
    document.getElementById("passSymbols").checked
  ) {
    chars += "!@#$%^&*()-_=+";
  }

  let password = "";

  for (let i = 0; i < length; i++) {

    password +=
      chars[randomSecure(chars.length)];
  }

  document.getElementById("passwordResult")
    .textContent = password;
}


/* =====================================================
   16. QR
===================================================== */

function showQR() {

  openModal(`
    <h2 class="modal-title">▦ Código QR</h2>

    <div class="form-group">
      <label>Texto o enlace</label>

      <input
        id="qrText"
        placeholder="https://ejemplo.com"
      >
    </div>

    <button class="primary-btn" id="qrButton">
      Crear QR
    </button>

    <div id="qrResult"></div>
  `);

  document.getElementById("qrButton")
    .addEventListener("click", () => {

      const text =
        document.getElementById("qrText").value.trim();

      const result =
        document.getElementById("qrResult");

      if (!text) {

        result.innerHTML =
          `<div class="result-box">
            Escribe un texto o enlace.
          </div>`;

        return;
      }

      const url =
        "https://api.qrserver.com/v1/create-qr-code/" +
        `?size=250x250&data=${encodeURIComponent(text)}`;

      result.innerHTML = `

        <img
          class="qr-image"
          src="${url}"
          alt="Código QR generado"
        >

        <div class="modal-actions">

          <a
            class="primary-btn"
            href="${url}"
            target="_blank"
            rel="noopener"
          >
            Abrir QR
          </a>

        </div>
      `;
    });
}


/* =====================================================
   17. NÚMERO ALEATORIO
===================================================== */

function showRandom() {

  openModal(`
    <h2 class="modal-title">🎲 Número aleatorio</h2>

    <div class="form-group">
      <label>Mínimo</label>
      <input id="randomMin" type="number" value="1">
    </div>

    <div class="form-group">
      <label>Máximo</label>
      <input id="randomMax" type="number" value="100">
    </div>

    <button class="primary-btn" id="randomButton">
      Generar
    </button>

    <div class="result-box" style="text-align:center;">
      <div class="big-result" id="randomResult">
        ?
      </div>
    </div>
  `);

  document.getElementById("randomButton")
    .addEventListener("click", () => {

      let min = Number(
        document.getElementById("randomMin").value
      );

      let max = Number(
        document.getElementById("randomMax").value
      );

      if (min > max) {
        [min, max] = [max, min];
      }

      const result =
        Math.floor(
          Math.random() * (max - min + 1)
        ) + min;

      document.getElementById("randomResult")
        .textContent = result;
    });
}


/* =====================================================
   18. DICCIONARIO
===================================================== */

function showDictionary() {

  openModal(`
    <h2 class="modal-title">📖 Diccionario</h2>

    <div class="form-group">
      <label>Palabra en español</label>

      <input
        id="dictionaryWord"
        placeholder="Ejemplo: perseverancia"
      >
    </div>

    <button class="primary-btn" id="dictionaryButton">
      Buscar
    </button>

    <div class="result-box" id="dictionaryResult">
      Escribe una palabra.
    </div>
  `);

  document.getElementById("dictionaryButton")
    .addEventListener("click", async () => {

      const word =
        document.getElementById("dictionaryWord")
          .value.trim();

      const result =
        document.getElementById("dictionaryResult");

      if (!word) return;

      result.textContent =
        "Buscando definición...";

      try {

        const response =
          await fetch(
            `https://api.dictionaryapi.dev/api/v2/entries/es/${encodeURIComponent(word)}`
          );

        if (!response.ok) {
          throw new Error("No encontrada");
        }

        const data = await response.json();

        const entry = data[0];

        let html = `
          <strong>${escapeHTML(entry.word)}</strong>
        `;

        const meanings =
          entry.meanings || [];

        meanings.slice(0, 3).forEach(meaning => {

          html += `
            <br><br>
            <strong>
              ${escapeHTML(meaning.partOfSpeech || "")}
            </strong>
          `;

          (meaning.definitions || [])
            .slice(0, 2)
            .forEach(def => {

              html += `
                <br>
                • ${escapeHTML(def.definition)}
              `;

            });

        });

        result.innerHTML = html;

      } catch {

        result.innerHTML =
          `No encontramos esa palabra.
           Puedes comprobar la escritura e intentarlo nuevamente.`;
      }
    });
}


/* =====================================================
   19. ORGANIZADOR DE ESTUDIO
===================================================== */

function showStudy() {

  const saved =
    JSON.parse(
      localStorage.getItem("utilhub_study") || "{}"
    );

  openModal(`
    <h2 class="modal-title">🎓 Organizador de estudio</h2>

    <div class="form-group">
      <label>Curso o materia</label>

      <input
        id="studySubject"
        value="${escapeHTML(saved.subject || "")}"
        placeholder="Ejemplo: Ciencias Sociales"
      >
    </div>

    <div class="form-group">
      <label>Tema</label>

      <input
        id="studyTopic"
        value="${escapeHTML(saved.topic || "")}"
        placeholder="Tema que estudiarás"
      >
    </div>

    <div class="form-group">
      <label>Objetivo</label>

      <textarea
        id="studyGoal"
        placeholder="¿Qué quieres lograr?"
      >${escapeHTML(saved.goal || "")}</textarea>
    </div>

    <button class="primary-btn" id="saveStudy">
      Guardar organización
    </button>

    <div class="result-box" id="studyResult">
      ${saved.subject
        ? `Última organización guardada: <strong>${escapeHTML(saved.subject)}</strong>`
        : "Aún no hay una organización guardada."}
    </div>
  `);

  document.getElementById("saveStudy")
    .addEventListener("click", () => {

      const data = {

        subject:
          document.getElementById("studySubject").value,

        topic:
          document.getElementById("studyTopic").value,

        goal:
          document.getElementById("studyGoal").value

      };

      localStorage.setItem(
        "utilhub_study",
        JSON.stringify(data)
      );

      document.getElementById("studyResult").innerHTML =
        "✓ Organización guardada en este dispositivo.";
    });
}


/* =====================================================
   20. CONTADOR DE DÍAS
===================================================== */

function showDateCounter() {

  openModal(`
    <h2 class="modal-title">📅 Contador de días</h2>

    <div class="form-group">
      <label>Fecha inicial</label>
      <input id="dateOne" type="date">
    </div>

    <div class="form-group">
      <label>Fecha final</label>
      <input id="dateTwo" type="date">
    </div>

    <button class="primary-btn" id="dateButton">
      Calcular
    </button>

    <div class="result-box" id="dateResult">
      Resultado.
    </div>
  `);

  const today =
    new Date().toISOString().split("T")[0];

  document.getElementById("dateOne").value =
    today;

  document.getElementById("dateTwo").value =
    today;

  document.getElementById("dateButton")
    .addEventListener("click", () => {

      const one =
        document.getElementById("dateOne").value;

      const two =
        document.getElementById("dateTwo").value;

      if (!one || !two) return;

      const date1 =
        new Date(`${one}T00:00:00`);

      const date2 =
        new Date(`${two}T00:00:00`);

      const difference =
        Math.round(
          Math.abs(date2 - date1) /
          (1000 * 60 * 60 * 24)
        );

      document.getElementById("dateResult").innerHTML = `
        Hay:
        <div class="big-result">
          ${difference}
        </div>
        días de diferencia.
      `;
    });
}


/* =====================================================
   COMIDA
===================================================== */

const foodSearch =
  document.getElementById("foodSearch");

const foodButton =
  document.getElementById("foodButton");

function searchFood(query) {

  query = query.trim();

  if (!query) {
    query = "restaurantes";
  }

  const url =
    "https://www.google.com/maps/search/" +
    encodeURIComponent(query);

  window.open(
    url,
    "_blank",
    "noopener,noreferrer"
  );
}

foodButton.addEventListener("click", () => {
  searchFood(foodSearch.value);
});

foodSearch.addEventListener("keydown", event => {

  if (event.key === "Enter") {
    searchFood(foodSearch.value);
  }

});

document.querySelectorAll("[data-food]")
  .forEach(button => {

    button.addEventListener("click", () => {

      const food = button.dataset.food;

      foodSearch.value = food;

      searchFood(food);
    });

  });


/* =====================================================
   COMPRAS
===================================================== */

const shopSearch =
  document.getElementById("shopSearch");

const shopButton =
  document.getElementById("shopButton");

function searchShopping(query) {

  query = query.trim();

  if (!query) {
    query = "tiendas";
  }

  const url =
    "https://www.google.com/search?q=" +
    encodeURIComponent(query + " comprar");

  window.open(
    url,
    "_blank",
    "noopener,noreferrer"
  );
}

shopButton.addEventListener("click", () => {
  searchShopping(shopSearch.value);
});

shopSearch.addEventListener("keydown", event => {

  if (event.key === "Enter") {
    searchShopping(shopSearch.value);
  }

});

document.querySelectorAll("[data-shop]")
  .forEach(button => {

    button.addEventListener("click", () => {

      const shop = button.dataset.shop;

      shopSearch.value = shop;

      searchShopping(shop);
    });

  });


/* =====================================================
   CERCA DE MÍ
===================================================== */

let userCoordinates = null;

document.querySelectorAll("[data-place]")
  .forEach(button => {

    button.addEventListener("click", () => {

      const place =
        button.dataset.place;

      if (userCoordinates) {

        const url =
          "https://www.google.com/maps/search/" +
          `${encodeURIComponent(place)}/@` +
          `${userCoordinates.lat},` +
          `${userCoordinates.lng},14z`;

        window.open(
          url,
          "_blank",
          "noopener,noreferrer"
        );

      } else {

        const url =
          "https://www.google.com/maps/search/" +
          encodeURIComponent(place);

        window.open(
          url,
          "_blank",
          "noopener,noreferrer"
        );
      }

    });

  });


/* =====================================================
   UBICACIÓN
===================================================== */

const locationButton =
  document.getElementById("locationButton");

const locationStatus =
  document.getElementById("locationStatus");

locationButton.addEventListener("click", () => {

  if (!navigator.geolocation) {

    locationStatus.textContent =
      "Tu navegador no permite obtener ubicación.";

    return;
  }

  locationStatus.textContent =
    "Solicitando permiso de ubicación...";

  navigator.geolocation.getCurrentPosition(

    position => {

      userCoordinates = {

        lat: position.coords.latitude,

        lng: position.coords.longitude

      };

      locationStatus.textContent =
        "✓ Ubicación disponible. Ahora puedes buscar lugares cercanos.";

    },

    error => {

      let message =
        "No se pudo obtener tu ubicación.";

      if (error.code === 1) {
        message =
          "Permiso de ubicación rechazado.";
      }

      locationStatus.textContent = message;
    },

    {
      enableHighAccuracy: false,
      timeout: 10000,
      maximumAge: 300000
    }

  );

});


/* =====================================================
   INICIALIZAR
===================================================== */

updateFavoriteButtons();
renderFavorites();
renderHistory();

console.log(
  "ÚtilHub V7 cargado correctamente."
);
