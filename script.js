const passwordInput = document.getElementById("password");
const strength = document.getElementById("strength");
const scoreText = document.getElementById("score");
const meterFill = document.getElementById("meterFill");
const feedback = document.getElementById("feedback");

const checks = {
  length: document.getElementById("length"),
  upper: document.getElementById("upper"),
  lower: document.getElementById("lower"),
  number: document.getElementById("number"),
  symbol: document.getElementById("symbol")
};

function checkPassword(password) {
  const results = {
    length: password.length >= 12,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    symbol: /[^A-Za-z0-9]/.test(password)
  };

  const commonPasswords = [
    "password", "password123", "12345678", "qwerty"
  ];

  let score = 0;

  if (password.length >= 8) score += 20;
  if (password.length >= 12) score += 15;
  if (password.length >= 16) score += 10;
  if (results.upper) score += 15;
  if (results.lower) score += 10;
  if (results.number) score += 15;
  if (results.symbol) score += 15;

  if (commonPasswords.includes(password.toLowerCase())) {
    score = Math.min(score, 15);
  }

  return { score, results };
}

passwordInput.addEventListener("input", () => {
  const password = passwordInput.value;

  if (!password) {
    strength.textContent = "Waiting for input";
    scoreText.textContent = "Score: 0/100";
    meterFill.style.width = "0%";
    feedback.textContent = "Enter a sample password to begin.";

    Object.values(checks).forEach(item => {
      item.textContent = "○ " + item.textContent.substring(2);
      item.style.color = "#bdc8da";
    });
    return;
  }

  const result = checkPassword(password);
  const score = result.score;

  scoreText.textContent = `Score: ${score}/100`;
  meterFill.style.width = `${score}%`;

  if (score < 30) {
    strength.textContent = "Weak";
    meterFill.style.background = "#ff6565";
  } else if (score < 55) {
    strength.textContent = "Fair";
    meterFill.style.background = "#ffc45c";
  } else if (score < 80) {
    strength.textContent = "Good";
    meterFill.style.background = "#66c7ff";
  } else {
    strength.textContent = "Strong";
    meterFill.style.background = "#a9f66b";
  }

  for (const key in checks) {
    const passed = result.results[key];
    const label = checks[key].textContent.substring(2);
    checks[key].textContent = (passed ? "✓ " : "○ ") + label;
    checks[key].style.color = passed ? "#a9f66b" : "#bdc8da";
  }

  if (password.length < 12) {
    feedback.textContent =
      "Try using at least 12 characters. Longer, unique passwords are generally safer.";
  } else if (score >= 80) {
    feedback.textContent =
      "Good characteristics! Use a unique password for each account and store it safely.";
  } else {
    feedback.textContent =
      "Add more variety and avoid common words, predictable sequences, or reused passwords.";
  }
});

document.getElementById("toggle").addEventListener("click", function () {
  const showing = passwordInput.type === "password";
  passwordInput.type = showing ? "text" : "password";
  this.textContent = showing ? "Hide" : "Show";
});

function secureRandomInt(max) {
  const limit = Math.floor(4294967296 / max) * max;
  const array = new Uint32Array(1);
  do {
    crypto.getRandomValues(array);
  } while (array[0] >= limit);
  return array[0] % max;
}

function generatePassword(length = 16) {
  const groups = [
    "ABCDEFGHJKLMNPQRSTUVWXYZ",
    "abcdefghijkmnopqrstuvwxyz",
    "23456789",
    "!@#$%^&*()-_=+?"
  ];

  const all = groups.join("");
  const chars = groups.map(group =>
    group[secureRandomInt(group.length)]
  );

  while (chars.length < length) {
    chars.push(all[secureRandomInt(all.length)]);
  }

  for (let i = chars.length - 1; i > 0; i--) {
    const j = secureRandomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  return chars.join("");
}

document.getElementById("generate").addEventListener("click", () => {
  document.getElementById("generated").textContent = generatePassword();
});

document.getElementById("copy").addEventListener("click", async () => {
  const generated = document.getElementById("generated").textContent;

  if (generated.startsWith("Click generate")) {
    feedback.textContent = "Generate a password first.";
    return;
  }

  try {
    await navigator.clipboard.writeText(generated);
    feedback.textContent = "Generated password copied to clipboard.";
  } catch {
    feedback.textContent =
      "Copy was blocked. Select the generated password and copy it manually.";
  }
});