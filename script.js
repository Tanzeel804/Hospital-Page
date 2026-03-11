/* script.js
   All JS: theme toggle, auth (signup/login), navbar update,
   scroll progress, back-to-top, counters, AOS init, doctor filter, contact validation.
*/

/* ---------------------------
   Helpers: Toast (Bootstrap-ish)
   --------------------------- */
function showToast(message, type = "success", timeout = 3000) {
  // Create a simple toast element appended to body
  const id = "toast-" + Date.now();
  const container = document.createElement("div");
  container.innerHTML = `
    <div id="${id}" class="toast align-items-center show" role="alert" aria-live="assertive" aria-atomic="true" style="min-width:220px;">
      <div class="d-flex">
        <div class="toast-body">
          ${message}
        </div>
        <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
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
  // update toggle icon if exists
  const tgl = document.getElementById("themeToggleBtn");
  if (tgl)
    tgl.innerHTML =
      stored === "light"
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
    tgl.innerHTML =
      next === "light"
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
  const name = document.getElementById("signupName").value.trim();
  const email = document
    .getElementById("signupEmail")
    .value.trim()
    .toLowerCase();
  const pass = document.getElementById("signupPassword").value;
  const pass2 = document.getElementById("signupPassword2").value;

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
  // close modal
  const modalEl = document.getElementById("signupModal");
  if (modalEl) bootstrap.Modal.getInstance(modalEl).hide();
  // reset form
  document.getElementById("signupForm").reset();
}

function loginHandler(e) {
  e && e.preventDefault();
  const email = document
    .getElementById("loginEmail")
    .value.trim()
    .toLowerCase();
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
  // close modal
  const modalEl = document.getElementById("loginModal");
  if (modalEl) bootstrap.Modal.getInstance(modalEl).hide();
  updateAuthArea();
  // reset form
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
        <button class="btn btn-sm btn-outline-light" id="logoutBtn">Logout</button>
      </div>`;
    document
      .getElementById("logoutBtn")
      .addEventListener("click", logoutHandler);
  } else {
    area.innerHTML = `
      <div class="d-flex gap-2">
        <button class="btn btn-sm btn-success" data-bs-toggle="modal" data-bs-target="#signupModal">Sign Up</button>
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
  const scrollTop =
    document.documentElement.scrollTop || document.body.scrollTop;
  const height =
    document.documentElement.scrollHeight -
    document.documentElement.clientHeight;
  const pct = height > 0 ? (scrollTop / height) * 100 : 0;
  el.style.width = Math.min(100, Math.max(0, pct)) + "%";
}

/* ---------------------------
   BACK TO TOP
   --------------------------- */
function initBackToTop() {
  const btn = document.getElementById("backToTop");
  if (!btn) return;
  window.addEventListener("scroll", () => {
    if (window.scrollY > 500) btn.style.display = "flex";
    else btn.style.display = "none";
  });
  btn.addEventListener("click", () =>
    window.scrollTo({ top: 0, behavior: "smooth" }),
  );
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
      const text = card.innerText.toLowerCase();
      card.style.display = text.includes(q) ? "" : "none";
    });
  });
}

/* ---------------------------
   COUNTERS (IntersectionObserver)
   --------------------------- */
function animateCounters() {
  const counters = document.querySelectorAll(".js-counter");
  if (!("IntersectionObserver" in window) || counters.length === 0) {
    // Fall back: animate all
    counters.forEach(runCounter);
    return;
  }
  const obs = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          runCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 },
  );
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
      cur = target;
      el.innerText = target.toLocaleString();
    } else {
      el.innerText = cur.toLocaleString();
      requestAnimationFrame(tick);
    }
  };
  tick();
}

/* ---------------------------
   CONTACT FORM VALIDATION (simple)
   --------------------------- */
function initContactValidation() {
  const form = document.getElementById("contactForm");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = form.querySelector("[name='name']").value.trim();
    const email = form.querySelector("[name='email']").value.trim();
    const subject = form.querySelector("[name='subject']").value.trim();
    const message = form.querySelector("[name='message']").value.trim();
    if (!name || !email || !subject || !message) {
      showToast("Please fill all fields", "danger");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      showToast("Please enter a valid email", "danger");
      return;
    }
    // Simulate success
    showToast("Message sent! We will contact you soon.", "success");
    // show a bootstrap modal success (if exists)
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

  // Initialize AOS
  if (window.AOS) AOS.init({ once: true, duration: 800, offset: 80 });

  // Wire theme toggle button
  const tbtn = document.getElementById("themeToggleBtn");
  if (tbtn) tbtn.addEventListener("click", toggleTheme);

  // Signup / login handlers
  const signupForm = document.getElementById("signupForm");
  if (signupForm) signupForm.addEventListener("submit", signupHandler);
  const loginForm = document.getElementById("loginForm");
  if (loginForm) loginForm.addEventListener("submit", loginHandler);

  // Scroll progress update
  window.addEventListener("scroll", updateScrollProgress);

  // back-to-top setup
  initBackToTop();
});

/* ---------------------------
   Extra utility: update auth area after login on other pages
   (so logging in on index then going to contact shows welcome)
   --------------------------- */
window.addEventListener("storage", function (e) {
  if (e.key === "currentUser" || e.key === "users") updateAuthArea();
});
