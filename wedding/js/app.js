// Set this to your actual ceremony date/time. Used by the countdown below.
const WEDDING_DATE = new Date("2027-08-21T19:00:00+02:00");

// Used by the "Add to Calendar" menu. Times are UTC (Madrid is UTC+2 in
// August/CEST), spanning arrival through the end of the reception.
const CALENDAR_EVENT = {
  title: "Cristina & Joe's Wedding",
  startUtc: "20270821T160000Z",
  endUtc: "20270822T020000Z",
  location: "El Invernadero, Club de Tiro Madrid, Ctra. Madrid-El Pardo M-605, Km 1.2, 28035 Madrid, Spain",
  description: "Join us as we celebrate the wedding of Cristina and Joe! Arrival from 6:00 PM, ceremony at 7:00 PM. More info: https://cristinaandjoewedding.com",
};

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
  const note = document.getElementById("formNote");
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) submitButton.disabled = true;
    if (note) {
      note.textContent = "";
      note.classList.remove("form-note-error");
    }

    try {
      const response = await fetch(form.action, {
        method: form.method,
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });

      if (!response.ok) throw new Error("RSVP submission failed");

      form.classList.add("hidden");
      if (success) success.classList.remove("hidden");
    } catch (err) {
      if (note) {
        note.textContent = "Something went wrong sending your RSVP. Please try again in a moment.";
        note.classList.add("form-note-error");
      }
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  });
}

function icsToIso(basicUtc) {
  // "20270821T160000Z" -> "2027-08-21T16:00:00Z"
  return basicUtc.replace(
    /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/,
    "$1-$2-$3T$4:$5:$6Z"
  );
}

function escapeIcsText(text) {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

function buildIcsFile(event) {
  const dtstamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Cristina and Joe//Wedding//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    "UID:cristina-joe-wedding-2027@cristinaandjoewedding.com",
    "DTSTAMP:" + dtstamp,
    "DTSTART:" + event.startUtc,
    "DTEND:" + event.endUtc,
    "SUMMARY:" + escapeIcsText(event.title),
    "LOCATION:" + escapeIcsText(event.location),
    "DESCRIPTION:" + escapeIcsText(event.description),
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.join("\r\n");
}

function initCalendarAdd() {
  const toggle = document.getElementById("calendarToggle");
  const menu = document.getElementById("calendarMenu");
  const googleLink = document.getElementById("calendarGoogle");
  const outlookLink = document.getElementById("calendarOutlook");
  const icsLink = document.getElementById("calendarIcs");
  if (!toggle || !menu) return;

  const event = CALENDAR_EVENT;

  googleLink.href =
    "https://calendar.google.com/calendar/render?action=TEMPLATE" +
    "&text=" + encodeURIComponent(event.title) +
    "&dates=" + event.startUtc + "/" + event.endUtc +
    "&details=" + encodeURIComponent(event.description) +
    "&location=" + encodeURIComponent(event.location);

  outlookLink.href =
    "https://outlook.live.com/calendar/0/deeplink/compose" +
    "?path=/calendar/action/compose&rru=addevent" +
    "&subject=" + encodeURIComponent(event.title) +
    "&startdt=" + icsToIso(event.startUtc) +
    "&enddt=" + icsToIso(event.endUtc) +
    "&body=" + encodeURIComponent(event.description) +
    "&location=" + encodeURIComponent(event.location);

  icsLink.addEventListener("click", (e) => {
    e.preventDefault();
    const blob = new Blob([buildIcsFile(event)], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cristina-and-joe-wedding.ics";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    closeMenu();
  });

  function openMenu() {
    menu.hidden = false;
    toggle.setAttribute("aria-expanded", "true");
  }

  function closeMenu() {
    menu.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
  }

  toggle.addEventListener("click", () => {
    if (menu.hidden) openMenu();
    else closeMenu();
  });

  document.addEventListener("click", (e) => {
    if (!menu.hidden && !menu.contains(e.target) && e.target !== toggle) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !menu.hidden) {
      closeMenu();
      toggle.focus();
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initNav();
  initCountdown();
  initRsvpForm();
  initCalendarAdd();
});
