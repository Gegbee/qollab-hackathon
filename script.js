"use strict";

/* ------------------------------------------------------------------
 * Qiskit bridge
 * Qiskit is a Python library, so it can't run directly in the browser.
 * Point this at a Python backend (Flask/FastAPI) that runs Qiskit and
 * returns JSON. Leave unused until you add functionality.
 * ------------------------------------------------------------------ */
const QISKIT_API_URL = "/api"; // change to your backend's address

async function runQiskit(endpoint, payload = {}) {
  const response = await fetch(`${QISKIT_API_URL}/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(`Qiskit backend error: ${response.status}`);
  return response.json();
}

/* ------------------------------------------------------------------
 * Module registry
 * Each key matches a data-module="..." attribute in index.html.
 * The function receives that element and builds its behavior.
 * ------------------------------------------------------------------ */
const modules = {
  "account-converter"(element) {
    const form = element.querySelector(".account-form");
    const input = element.querySelector("#mock-account-number");
    const message = element.querySelector(".conversion-message");
    const results = element.querySelector(".conversion-results");
    const integerResult = element.querySelector(".integer-result");

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      results.hidden = true;

      const accountNumber = input.value;
      if (!/^\d{1,10}$/.test(accountNumber)) {
        message.textContent = "Enter between 1 and 10 digits.";
        input.focus();
        return;
      }

      const storedAccountNumber = Number(accountNumber);
      if (!Number.isSafeInteger(storedAccountNumber)) {
        message.textContent = "Enter a number that can be represented safely.";
        input.focus();
        return;
      }

      integerResult.textContent = storedAccountNumber.toString();
      message.textContent = "";
      results.hidden = false;
    });
  },
};

function initModules() {
  document.querySelectorAll("[data-module]").forEach((element) => {
    const init = modules[element.dataset.module];
    if (init) {
      init(element);
    } else {
      console.warn(`No module registered for "${element.dataset.module}"`);
    }
  });
}

document.addEventListener("DOMContentLoaded", initModules);
