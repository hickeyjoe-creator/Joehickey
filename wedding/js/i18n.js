// Minimal i18n loader/applier. No build step, no framework — just
// fetch(locales/<lang>.json), resolve dotted keys, and swap text/attrs
// on elements marked with data-i18n / data-i18n-attr.
//
// Detection priority: localStorage > ?lang= URL param > navigator.language
// > English default. The chosen language is persisted to both localStorage
// and the URL so it survives reloads and shared links.
const I18N = (() => {
  const SUPPORTED = ["en", "es"];
  const STORAGE_KEY = "wedding-lang";
  const cache = {};
  let currentLang = "en";

  function detectLanguage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && SUPPORTED.includes(stored)) return stored;
    } catch (err) {
      /* localStorage unavailable (private mode etc.) — fall through */
    }

    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get("lang");
    if (fromUrl && SUPPORTED.includes(fromUrl)) return fromUrl;

    const browserLang = (navigator.language || "en").slice(0, 2).toLowerCase();
    return browserLang === "es" ? "es" : "en";
  }

  async function loadLocale(lang) {
    if (cache[lang]) return cache[lang];
    const response = await fetch(`locales/${lang}.json`);
    if (!response.ok) throw new Error(`Failed to load locale: ${lang}`);
    const data = await response.json();
    cache[lang] = data;
    return data;
  }

  function resolveKey(data, key) {
    return key.split(".").reduce((obj, part) => (obj && obj[part] !== undefined ? obj[part] : undefined), data);
  }

  function t(key, tokens) {
    let value = resolveKey(cache[currentLang], key);
    if (value === undefined) value = resolveKey(cache.en, key);
    if (value === undefined) return key;
    if (tokens) {
      Object.keys(tokens).forEach((token) => {
        value = value.replace(new RegExp(`\\{${token}\\}`, "g"), tokens[token]);
      });
    }
    return value;
  }

  function applyTranslations() {
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      el.textContent = t(el.getAttribute("data-i18n"));
    });

    document.querySelectorAll("[data-i18n-attr]").forEach((el) => {
      const spec = el.getAttribute("data-i18n-attr");
      spec.split(",").forEach((pair) => {
        const [attr, key] = pair.split(":").map((s) => s.trim());
        if (attr && key) el.setAttribute(attr, t(key));
      });
    });

    document.documentElement.lang = currentLang;
  }

  // Locale-aware date/time formatting. Single source of truth: the Date
  // objects passed in (defined once in app.js), never duplicated as
  // strings in the locale JSON. Always rendered in the venue's local time
  // (Madrid) so the time shown is correct regardless of the viewer's own
  // timezone. Both languages use 24-hour time per spec.
  const INTL_LOCALE = { en: "en-GB", es: "es-ES" };
  const TIME_ZONE = "Europe/Madrid";

  // Pull the individual date parts via Intl (so weekday/month names are
  // still locale-correct) but assemble them ourselves — browsers' ICU data
  // is inconsistent about whether en-GB includes a comma after the
  // weekday, so we don't rely on the locale's own separators.
  function dateParts(date) {
    const parts = new Intl.DateTimeFormat(INTL_LOCALE[currentLang], {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: TIME_ZONE,
    }).formatToParts(date);
    const get = (type) => parts.find((p) => p.type === type).value;
    return { weekday: get("weekday"), day: get("day"), month: get("month"), year: get("year") };
  }

  function formatFullDate(date) {
    const { weekday, day, month, year } = dateParts(date);
    return currentLang === "es" ? `${weekday}, ${day} de ${month} de ${year}` : `${weekday}, ${day} ${month} ${year}`;
  }

  function formatShortDate(date) {
    const { day, month, year } = dateParts(date);
    return currentLang === "es" ? `${day} de ${month} de ${year}` : `${day} ${month} ${year}`;
  }

  function formatTime(date) {
    return new Intl.DateTimeFormat(INTL_LOCALE[currentLang], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: TIME_ZONE,
    }).format(date);
  }

  const listeners = [];
  function onChange(fn) {
    listeners.push(fn);
  }

  async function setLanguage(lang) {
    if (!SUPPORTED.includes(lang)) lang = "en";
    await loadLocale(lang);
    currentLang = lang;

    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (err) {
      /* ignore — persistence is a nice-to-have, not a requirement */
    }

    const url = new URL(window.location.href);
    url.searchParams.set("lang", lang);
    window.history.replaceState({}, "", url);

    applyTranslations();
    document.querySelectorAll("[data-lang]").forEach((btn) => {
      btn.setAttribute("aria-pressed", String(btn.getAttribute("data-lang") === lang));
    });

    listeners.forEach((fn) => fn(lang));
  }

  async function init() {
    const lang = detectLanguage();
    await loadLocale("en");
    if (lang !== "en") await loadLocale(lang);
    await setLanguage(lang);

    document.querySelectorAll("[data-lang]").forEach((btn) => {
      btn.addEventListener("click", () => setLanguage(btn.getAttribute("data-lang")));
    });
  }

  return {
    init,
    t,
    onChange,
    setLanguage,
    getLang: () => currentLang,
    formatFullDate,
    formatShortDate,
    formatTime,
  };
})();
