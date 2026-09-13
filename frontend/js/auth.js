// auth.js — handles registration, login, logout, and page protection.

// Redirects away if not logged in. Call this at the top of any protected page.
function requireAuth() {
  if (!getToken()) {
    window.location.href = "login.html";
  }
}

// Redirects away if the logged-in user is NOT an admin. Call on admin-* pages.
function requireAdmin() {
  requireAuth();
  const user = getCurrentUser();
  if (!user || user.role !== "admin") {
    window.location.href = "student-dashboard.html";
  }
}

// If already logged in, skip login/register page and jump to the right dashboard
function redirectIfLoggedIn() {
  const user = getCurrentUser();
  if (user) {
    window.location.href = user.role === "admin" ? "admin-dashboard.html" : "student-dashboard.html";
  }
}

function logout() {
  localStorage.removeItem("cc_token");
  localStorage.removeItem("cc_user");
  window.location.href = "login.html";
}

// ---------- Password visibility toggle (used on login/register) ----------
function setupPasswordToggle(toggleId, inputId) {
  const toggle = document.getElementById(toggleId);
  const input = document.getElementById(inputId);
  if (!toggle || !input) return;
  toggle.addEventListener("click", () => {
    const isPassword = input.type === "password";
    input.type = isPassword ? "text" : "password";
    toggle.innerHTML = isPassword ? '<i class="fa-solid fa-eye-slash"></i>' : '<i class="fa-solid fa-eye"></i>';
  });
}

// ---------- Password strength meter (used on register.html) ----------
function checkPasswordStrength(password) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score; // 0 to 4
}

function updateStrengthBar(password) {
  const bars = document.querySelectorAll(".strength-bar span");
  if (!bars.length) return;
  const score = checkPasswordStrength(password);
  const colors = ["#f04438", "#f79009", "#f79009", "#12b76a", "#12b76a"];
  bars.forEach((bar, i) => {
    bar.style.background = i < score ? colors[score] : "var(--border)";
  });
}

// ---------- LOGIN FORM ----------
function initLoginForm() {
  const form = document.getElementById("login-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;
    const submitBtn = form.querySelector("button[type=submit]");

    if (!email || !password) {
      showToast("Please enter your email and password.", "error");
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Logging in...';

    try {
      const data = await api.post("/auth/login", { email, password });
      localStorage.setItem("cc_token", data.token);
      localStorage.setItem("cc_user", JSON.stringify(data.user));
      showToast("Login successful! Redirecting...", "success");
      setTimeout(() => {
        window.location.href = data.user.role === "admin" ? "admin-dashboard.html" : "student-dashboard.html";
      }, 600);
    } catch (error) {
      showToast(error.message, "error");
      submitBtn.disabled = false;
      submitBtn.innerHTML = "Log In";
    }
  });
}

// ---------- REGISTER FORM ----------
function initRegisterForm() {
  const form = document.getElementById("register-form");
  if (!form) return;

  const passwordInput = document.getElementById("register-password");
  if (passwordInput) {
    passwordInput.addEventListener("input", (e) => updateStrengthBar(e.target.value));
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("register-name").value.trim();
    const studentId = document.getElementById("register-studentid").value.trim();
    const email = document.getElementById("register-email").value.trim();
    const department = document.getElementById("register-department").value;
    const year = document.getElementById("register-year").value;
    const password = document.getElementById("register-password").value;
    const confirmPassword = document.getElementById("register-confirm-password").value;
    const submitBtn = form.querySelector("button[type=submit]");

    if (!name || !studentId || !email || !department || !year || !password) {
      showToast("Please fill in all fields.", "error");
      return;
    }
    if (password !== confirmPassword) {
      showToast("Passwords do not match.", "error");
      return;
    }
    if (password.length < 6) {
      showToast("Password should be at least 6 characters.", "error");
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Creating account...';

    try {
      const data = await api.post("/auth/register", { name, studentId, email, department, year, password, confirmPassword });
      localStorage.setItem("cc_token", data.token);
      localStorage.setItem("cc_user", JSON.stringify(data.user));
      showToast("Account created successfully!", "success");
      setTimeout(() => { window.location.href = "student-dashboard.html"; }, 600);
    } catch (error) {
      showToast(error.message, "error");
      submitBtn.disabled = false;
      submitBtn.innerHTML = "Create Account";
    }
  });
}

// ---------- Populate sidebar user info + wire logout button (every protected page) ----------
function initUserChip() {
  const user = getCurrentUser();
  if (!user) return;

  const nameEls = document.querySelectorAll(".js-user-name");
  const roleEls = document.querySelectorAll(".js-user-role");
  const initialEls = document.querySelectorAll(".js-user-initials");
  const firstNameEls = document.querySelectorAll(".js-user-firstname");

  nameEls.forEach((el) => (el.textContent = user.name));
  roleEls.forEach((el) => (el.textContent = user.role));
  initialEls.forEach((el) => (el.textContent = getInitials(user.name)));
  firstNameEls.forEach((el) => (el.textContent = user.name.split(" ")[0]));

  const logoutBtns = document.querySelectorAll(".js-logout-btn");
  logoutBtns.forEach((btn) => btn.addEventListener("click", logout));
}

document.addEventListener("DOMContentLoaded", () => {
  initLoginForm();
  initRegisterForm();
  initUserChip();
  initSidebarToggle();
});
