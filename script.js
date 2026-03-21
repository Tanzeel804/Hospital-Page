/* script.js
   All JS: theme toggle, auth (signup/login), navbar update,
   scroll progress, back-to-top, counters, AOS init, doctor filter, contact validation.
*/

/* ---------------------------
   Helpers: Toast/Alert
   --------------------------- */
function showToast(message, type = "success", timeout = 3000) {
  const id = "toast-" + Date.now();
  const bgClass = type === "success" ? "bg-success" : type === "danger" ? "bg-danger" : "bg-info";
  const container = document.createElement("div");
  container.className = "position-fixed bottom-0 end-0 p-3";
  container.style.zIndex = "11000";
  container.innerHTML = `
    <div id="${id}" class="toast show align-items-center ${bgClass} text-white" role="alert">
      <div class="d-flex">
        <div class="toast-body">
          ${message}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>
    </div>`;
  document.body.appendChild(container);
  setTimeout(() => {
    const el = document.getElementById(id);
    if (el) el.classList.remove("show");
    setTimeout(() => container.remove(), 500);
  }, timeout);
}

/* ---------------------------
   THEME: apply on load, toggle, persist
   --------------------------- */
function initTheme() {
  const root = document.documentElement;
  const stored = localStorage.getItem("site-theme") || "dark";
  root.setAttribute("data-theme", stored);
  const tgl = document.getElementById("themeToggleBtn");
  if (tgl)
    tgl.innerHTML = stored === "light"
      ? '<i class="fa-solid fa-moon"></i>'
      : '<i class="fa-solid fa-sun"></i>';
}

function toggleTheme() {
  const root = document.documentElement;
  const current = root.getAttribute("data-theme") || "dark";
  const next = current === "light" ? "dark" : "light";
  root.setAttribute("data-theme", next);
  localStorage.setItem("site-theme", next);
  const tgl = document.getElementById("themeToggleBtn");
  if (tgl)
    tgl.innerHTML = next === "light"
      ? '<i class="fa-solid fa-moon"></i>'
      : '<i class="fa-solid fa-sun"></i>';
}

/* ---------------------------
   AUTH: signup/login/logout using localStorage
   users: array of {name,email,password}
   currentUser stored under 'currentUser'
   --------------------------- */
function loadUsers() {
  return JSON.parse(localStorage.getItem("users") || "[]");
}
function saveUsers(u) {
  localStorage.setItem("users", JSON.stringify(u));
}

function signupHandler(e) {
  e && e.preventDefault();
  const nameEl = document.getElementById("signupName");
  const emailEl = document.getElementById("signupEmail");
  const passEl = document.getElementById("signupPassword");
  const pass2El = document.getElementById("signupPassword2");
  if (!nameEl || !emailEl || !passEl) return;

  const name = nameEl.value.trim();
  const email = emailEl.value.trim().toLowerCase();
  const pass = passEl.value;
  const pass2 = pass2El ? pass2El.value : pass;

  if (!name || !email || !pass || !pass2) {
    showToast("Please fill all fields", "danger");
    return;
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    showToast("Please enter a valid email", "danger");
    return;
  }
  if (pass !== pass2) {
    showToast("Passwords do not match", "danger");
    return;
  }

  const users = loadUsers();
  if (users.find((u) => u.email === email)) {
    showToast("Email already registered", "danger");
    return;
  }

  users.push({ name, email, password: pass });
  saveUsers(users);
  showToast("Signup successful! You can now login", "success");
  const modalEl = document.getElementById("signupModal");
  if (modalEl) bootstrap.Modal.getInstance(modalEl)?.hide();
  document.getElementById("signupForm").reset();
}

function loginHandler(e) {
  e && e.preventDefault();
  const email = document.getElementById("loginEmail").value.trim().toLowerCase();
  const pass = document.getElementById("loginPassword").value;
  if (!email || !pass) {
    showToast("Please fill all fields", "danger");
    return;
  }

  const users = loadUsers();
  const user = users.find((u) => u.email === email && u.password === pass);
  if (!user) {
    showToast("Invalid credentials", "danger");
    return;
  }
  localStorage.setItem("currentUser", JSON.stringify(user));
  showToast(`Welcome, ${user.name}`, "success");
  const modalEl = document.getElementById("loginModal");
  if (modalEl) bootstrap.Modal.getInstance(modalEl)?.hide();
  updateAuthArea();
  document.getElementById("loginForm").reset();
}

function logoutHandler() {
  localStorage.removeItem("currentUser");
  updateAuthArea();
  showToast("Logged out", "success");
}

/* Update navbar auth area: called on load and after auth changes */
function updateAuthArea() {
  const area = document.getElementById("authArea");
  const current = JSON.parse(localStorage.getItem("currentUser") || "null");
  if (!area) return;
  if (current) {
    area.innerHTML = `
      <div class="d-flex align-items-center gap-2">
        <span class="kicker me-2">Welcome, <strong>${current.name.split(" ")[0]}</strong></span>
        <button class="btn btn-sm btn-outline-primary" id="logoutBtn">Logout</button>
      </div>`;
    document.getElementById("logoutBtn")?.addEventListener("click", logoutHandler);
  } else {
    area.innerHTML = `
      <div class="d-flex gap-2">
        <button class="btn btn-sm btn-secondary" data-bs-toggle="modal" data-bs-target="#signupModal">Sign Up</button>
        <button class="btn btn-sm btn-primary" data-bs-toggle="modal" data-bs-target="#loginModal">Login</button>
      </div>`;
  }
}

/* ---------------------------
   SCROLL PROGRESS
   --------------------------- */
function updateScrollProgress() {
  const el = document.getElementById("scrollProgress");
  if (!el) return;
  const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
  const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  const pct = height > 0 ? (scrollTop / height) * 100 : 0;
  el.style.width = Math.min(100, Math.max(0, pct)) + "%";
}

/* ---------------------------
   BACK TO TOP
   --------------------------- */
function initBackToTop() {
  const btn = document.getElementById("backToTop") || document.getElementById("backToTopBtn");
  if (!btn) return;
  window.addEventListener("scroll", () => {
    btn.style.display = window.scrollY > 500 ? "flex" : "none";
  });
  btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

/* ---------------------------
   DOCTOR FILTER
   --------------------------- */
function initDoctorFilter() {
  const input = document.getElementById("doctorSearch");
  if (!input) return;
  input.addEventListener("input", () => {
    const q = input.value.trim().toLowerCase();
    document.querySelectorAll(".doctor-card").forEach((card) => {
      const visible = card.innerText.toLowerCase().includes(q);
      const col = card.closest(".col-md-4, .col-lg-4, .col-sm-6, .col-12");
      if (col) {
        col.style.display = visible ? "" : "none";
      } else {
        card.style.display = visible ? "" : "none";
      }
    });
  });
}

/* ---------------------------
   COUNTERS (IntersectionObserver)
   --------------------------- */
function animateCounters() {
  const counters = document.querySelectorAll(".js-counter");
  if (counters.length === 0) return;
  
  if (!("IntersectionObserver" in window)) {
    counters.forEach(runCounter);
    return;
  }
  
  const obs = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        runCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  
  counters.forEach((c) => obs.observe(c));
}

function runCounter(container) {
  const el = container.querySelector("[data-target]");
  if (!el) return;
  const target = parseInt(el.dataset.target, 10) || 0;
  let cur = 0;
  const step = Math.max(1, Math.floor(target / 120));
  const tick = () => {
    cur += step;
    if (cur >= target) {
      el.innerText = target.toLocaleString();
    } else {
      el.innerText = cur.toLocaleString();
      requestAnimationFrame(tick);
    }
  };
  tick();
}

/* ---------------------------
   CONTACT FORM VALIDATION
   --------------------------- */
function initContactValidation() {
  const form = document.getElementById("contactForm");
  if (!form) return;

  const fields = Array.from(form.querySelectorAll("input[name], textarea[name]"));
  const validators = {
    name: (v) => v.trim().length > 1,
    email: (v) => /^\S+@\S+\.\S+$/.test(v.trim()),
    subject: (v) => v.trim().length > 2,
    message: (v) => v.trim().length > 10,
  };

  const validateField = (field) => {
    const name = field.getAttribute("name");
    const rule = validators[name];
    if (!rule) return true;
    const valid = rule(field.value || "");
    field.classList.toggle("is-invalid", !valid);
    field.classList.toggle("is-valid", valid);
    return valid;
  };

  fields.forEach((field) => {
    field.addEventListener("input", () => validateField(field));
    field.addEventListener("blur", () => validateField(field));
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const allValid = fields.every((field) => validateField(field));
    if (!allValid) {
      showToast("Please fix form errors before submitting", "danger");
      return;
    }
    showToast("Message sent successfully!", "success");
    const successModal = document.getElementById("contactSuccessModal");
    if (successModal) new bootstrap.Modal(successModal).show();
    form.reset();
  });
}

/* ---------------------------
   INIT on DOMContentLoaded
   --------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  updateAuthArea();
  updateScrollProgress();
  initBackToTop();
  initDoctorFilter();
  animateCounters();
  initContactValidation();

  if (window.AOS) AOS.init({ duration: 1000, once: true, offset: 100 });

  document.getElementById("themeToggleBtn")?.addEventListener("click", toggleTheme);
  document.getElementById("signupForm")?.addEventListener("submit", signupHandler);
  document.getElementById("loginForm")?.addEventListener("submit", loginHandler);
  window.addEventListener("scroll", updateScrollProgress);
});

window.addEventListener("storage", () => updateAuthArea());
