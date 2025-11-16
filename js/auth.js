/* ======================================================
   AUTH.JS — Login + Register + Tabs
   With session save (localStorage)
   ====================================================== */

// Tabs
const tabLogin = document.getElementById("tabLogin");
const tabRegister = document.getElementById("tabRegister");

// Forms
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

// API base
const API = "http://localhost:5000/api";

// Switch to Register
tabRegister.addEventListener("click", () => {
  tabLogin.classList.remove("active");
  tabRegister.classList.add("active");

  loginForm.classList.add("hidden");
  registerForm.classList.remove("hidden");
});

// Switch to Login
tabLogin.addEventListener("click", () => {
  tabRegister.classList.remove("active");
  tabLogin.classList.add("active");

  registerForm.classList.add("hidden");
  loginForm.classList.remove("hidden");
});

/* =============================
   REGISTER
   ============================= */
registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = regUsername.value.trim();
  const email = regEmail.value.trim();
  const password = regPassword.value.trim();

  const res = await fetch(`${API}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password })
  });

  const data = await res.json();

  if (!res.ok) {
    regMsg.textContent = data.error || "Register failed!";
    regMsg.style.color = "red";
    return;
  }

  regMsg.style.color = "green";
  regMsg.textContent = "🎉 Account created successfully! Please login.";
});


/* =============================
   LOGIN (Saves Session)
   ============================= */
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = loginEmail.value.trim();
  const password = loginPassword.value.trim();

  const res = await fetch(`${API}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();

  if (!res.ok) {
    loginMsg.style.color = "red";
    loginMsg.textContent = data.error || "Wrong email or password!";
    return;
  }

  // Save user into browser
  localStorage.setItem("user", JSON.stringify({
    id: data.user.id,
    username: data.user.username,
    email: data.user.email
  }));

  loginMsg.style.color = "green";
  loginMsg.textContent = "Login success! Going home...";

  setTimeout(() => {
    window.location.href = "index.html";
  }, 1000);
});
