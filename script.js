"use strict";

const rsa = { p: 61, q: 53, e: 17 };
rsa.n = rsa.p * rsa.q;
rsa.phi = (rsa.p - 1) * (rsa.q - 1);

function gcd(a, b) {
  while (b !== 0) {
    [a, b] = [b, a % b];
  }
  return a;
}

function modInverse(value, modulus) {
  for (let candidate = 1; candidate < modulus; candidate += 1) {
    if ((value * candidate) % modulus === 1) return candidate;
  }
  throw new Error("No modular inverse exists for these RSA values.");
}

rsa.d = modInverse(rsa.e, rsa.phi);

function modPow(base, exponent, modulus) {
  let result = 1;
  base %= modulus;
  while (exponent > 0) {
    if (exponent % 2 === 1) result = (result * base) % modulus;
    base = (base * base) % modulus;
    exponent = Math.floor(exponent / 2);
  }
  return result;
}

function encryptMessage(message) {
  return Array.from(message, (digit) => modPow(Number(digit), rsa.e, rsa.n)).join(" ");
}

function decryptMessage(ciphertext, privateExponent, modulus = rsa.n) {
  return ciphertext.split(" ").map((value) => modPow(Number(value), privateExponent, modulus)).join("");
}

function findFactors(value) {
  for (let factor = 2; factor * factor <= value; factor += 1) {
    if (value % factor === 0) return [factor, value / factor];
  }
  return null;
}

const messages = { sender: "", quantumSender: "" };

function initializeSender(element, messageKey) {
  const form = element.querySelector(".demo-form");
  const input = form.querySelector("input");
  const status = element.querySelector(".demo-message");
  const output = element.querySelector(".ciphertext");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    messages[messageKey] = "";
    output.textContent = "Waiting for a mock number.";
    const message = input.value;
    if (!/^\d{1,10}$/.test(message)) {
      status.textContent = "Enter a mock number with 1 to 10 digits.";
      input.focus();
      return;
    }

    messages[messageKey] = encryptMessage(message);
    output.textContent = messages[messageKey];
    status.textContent = "";
  });
}

function initializeReceiver(element, messageKey) {
  element.querySelector(".decrypt-button").addEventListener("click", () => {
    const ciphertext = messages[messageKey];
    const status = element.querySelector(".demo-message");
    if (!ciphertext) {
      status.textContent = "Send a mock number first.";
      return;
    }

    element.querySelector(".decrypted-message").textContent = decryptMessage(ciphertext, rsa.d);
    status.textContent = "";
  });
}

function initializeModules() {
  document.querySelectorAll("[data-module]").forEach((element) => {
    switch (element.dataset.module) {
      case "sender":
        initializeSender(element, "sender");
        break;
      case "quantum-sender":
        initializeSender(element, "quantumSender");
        break;
      case "receiver":
        initializeReceiver(element, "sender");
        break;
      case "quantum-receiver":
        initializeReceiver(element, "quantumSender");
        break;
      case "key-details":
        element.querySelector(".prime-p").textContent = rsa.p;
        element.querySelector(".prime-q").textContent = rsa.q;
        element.querySelector(".modulus").textContent = rsa.n;
        element.querySelector(".public-exponent").textContent = rsa.e;
        element.querySelector(".public-modulus").textContent = rsa.n;
        element.querySelector(".totient").textContent = rsa.phi;
        element.querySelector(".private-exponent").textContent = rsa.d;
        break;
      case "classical-decrypt":
        element.querySelector(".classical-attack-button").addEventListener("click", () => {
          const status = element.querySelector(".demo-message");
          const ciphertext = messages.sender;
          const factors = findFactors(rsa.n);
          if (!ciphertext) {
            status.textContent = "Intercept a mock message first.";
            return;
          }
          if (!factors) {
            status.textContent = "Could not factor this modulus.";
            return;
          }

          const phi = (factors[0] - 1) * (factors[1] - 1);
          const privateExponent = modInverse(rsa.e, phi);
          const plaintext = decryptMessage(ciphertext, privateExponent);
          element.querySelector(".classical-result").textContent =
            `${factors[0]} × ${factors[1]} = ${rsa.n}; recovered mock number: ${plaintext}`;
          status.textContent = "";
        });
        break;
      case "quantum-attacker":
        element.querySelector(".shor-button").addEventListener("click", () => {
          const status = element.querySelector(".demo-message");
          const output = element.querySelector(".shor-output");
          const ciphertext = messages.quantumSender;
          const factors = findFactors(rsa.n);
          if (!ciphertext) {
            status.textContent = "Intercept a mock message first.";
            output.hidden = true;
            return;
          }
          if (!factors) {
            status.textContent = "Could not find factors for this modulus.";
            output.hidden = true;
            return;
          }

          const phi = (factors[0] - 1) * (factors[1] - 1);
          const privateExponent = modInverse(rsa.e, phi);
          const plaintext = decryptMessage(ciphertext, privateExponent);
          element.querySelector(".shor-result").textContent =
            `${factors[0]} × ${factors[1]} = ${rsa.n}; recovered mock number: ${plaintext}`;
          output.hidden = false;
          status.textContent = "";
        });
        break;
    }
  });
}

document.addEventListener("DOMContentLoaded", initializeModules);
