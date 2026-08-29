// Set this to your actual ceremony date/time. Used by the countdown below.
const WEDDING_DATE = new Date("2027-08-21T16:00:00-07:00");

function initNav() {
  const toggle = document.getElementById("navToggle");
  const menu = document.getElementById("navMenu");
  if (!toggle || !menu) return;

  toggle.addEventListener("click", () => {
    const isOpen = menu.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      menu.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
}

function initCountdown() {
  const daysEl = document.getElementById("cd-days");
  const hoursEl = document.getElementById("cd-hours");
  const minsEl = document.getElementById("cd-mins");
  const secsEl = document.getElementById("cd-secs");
  if (!daysEl) return;

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function tick() {
    const diff = WEDDING_DATE.getTime() - Date.now();
    if (diff <= 0) {
      daysEl.textContent = "00";
      hoursEl.textContent = "00";
      minsEl.textContent = "00";
      secsEl.textContent = "00";
      return;
    }
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diff / (1000 * 60)) % 60);
    const secs = Math.floor((diff / 1000) % 60);

    daysEl.textContent = pad(days);
    hoursEl.textContent = pad(hours);
    minsEl.textContent = pad(mins);
    secsEl.textContent = pad(secs);
  }

  tick();
  setInterval(tick, 1000);
}

function initRsvpForm() {
  const form = document.getElementById("rsvpForm");
  const success = document.getElementById("rsvpSuccess");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    // Placeholder behavior only: no backend is wired up yet.
    // See README.md in this folder for how to connect a real submission
    // endpoint (Formspree, Google Forms, a custom API, etc.).
    const data = Object.fromEntries(new FormData(form).entries());
    try {
      const existing = JSON.parse(localStorage.getItem("rsvp-responses") || "[]");
      existing.push({ ...data, submittedAt: new Date().toISOString() });
      localStorage.setItem("rsvp-responses", JSON.stringify(existing));
    } catch (err) {
      // localStorage may be unavailable; submission still "succeeds" visually.
    }

    form.classList.add("hidden");
    if (success) success.classList.remove("hidden");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initNav();
  initCountdown();
  initRsvpForm();
});
