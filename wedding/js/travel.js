// Travel & Stay section: tab/accordion switching, data-driven hotel cards,
// and a Leaflet map. Same markup drives both the desktop tab bar and the
// mobile accordion — each sub-section has two triggers sharing a
// data-travel-tab id, and setActivePanel() keeps them in sync.
const Travel = (() => {
  // Fixed reference points for the map. These are best-effort public
  // coordinates, NOT verified against the actual venue contract — check
  // them (especially the venue) before relying on them for anything.
  const VENUE_COORDS = { lat: 40.515, lng: -3.78 }; // TODO VERIFY: Club de Tiro Madrid / El Invernadero, Ctra. Madrid-El Pardo M-605 Km 1.2, 28035 Madrid
  const AIRPORT_COORDS = { lat: 40.4983, lng: -3.5676 }; // TODO VERIFY: Adolfo Suárez Madrid–Barajas Airport
  const CENTRE_COORDS = { lat: 40.4169, lng: -3.7035 }; // TODO VERIFY: Puerta del Sol, Madrid city centre

  const PANEL_IDS = ["travel-madrid", "travel-stay", "travel-day", "travel-home"];
  let activePanel = PANEL_IDS[0];

  let hotelsData = null;
  let mapInstance = null;
  let mapMarkers = [];

  async function loadHotels() {
    if (hotelsData) return hotelsData;
    const response = await fetch("data/hotels.json");
    hotelsData = await response.json();
    return hotelsData;
  }

  function bilingual(field) {
    if (!field) return "";
    const lang = I18N.getLang();
    return field[lang] || field.en || "";
  }

  function appendRow(container, text, className) {
    if (!text) return;
    const p = document.createElement("p");
    if (className) p.className = className;
    p.textContent = text;
    container.appendChild(p);
  }

  function copyToClipboard(code, onDone) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(code).then(onDone, () => legacyCopy(code, onDone));
      return;
    }
    legacyCopy(code, onDone);
  }

  // Fallback for browsers/contexts without the async Clipboard API
  // (older mobile Safari in particular).
  function legacyCopy(code, onDone) {
    const textarea = document.createElement("textarea");
    textarea.value = code;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    try {
      document.execCommand("copy");
    } catch (err) {
      /* clipboard truly unavailable — the code is still visible on the card */
    }
    document.body.removeChild(textarea);
    onDone();
  }

  function buildBookingBlock(hotel) {
    const wrap = document.createElement("div");
    wrap.className = "hotel-booking";

    appendRow(wrap, bilingual(hotel.bookingInstructions), "hotel-booking-instructions");

    if (hotel.bookingMethod === "code" && hotel.promoCode) {
      const codeRow = document.createElement("div");
      codeRow.className = "hotel-code-row";

      const codeLabel = document.createElement("span");
      codeLabel.className = "hotel-code-label";
      codeLabel.textContent = I18N.t("travel.stay.promoCodeLabel");

      const code = document.createElement("code");
      code.className = "hotel-code";
      code.textContent = hotel.promoCode;

      const copyBtn = document.createElement("button");
      copyBtn.type = "button";
      copyBtn.className = "hotel-copy-btn";
      copyBtn.textContent = I18N.t("travel.stay.copyButton");
      copyBtn.addEventListener("click", () => {
        copyToClipboard(hotel.promoCode, () => {
          copyBtn.textContent = I18N.t("travel.stay.copiedConfirmation");
          copyBtn.classList.add("copied");
          setTimeout(() => {
            copyBtn.textContent = I18N.t("travel.stay.copyButton");
            copyBtn.classList.remove("copied");
          }, 2000);
        });
      });

      codeRow.appendChild(codeLabel);
      codeRow.appendChild(code);
      codeRow.appendChild(copyBtn);
      wrap.appendChild(codeRow);
    }

    return wrap;
  }

  function buildCard(hotel) {
    const card = document.createElement("article");
    card.className = "hotel-card";

    const heading = document.createElement("div");
    heading.className = "hotel-card-heading";
    const name = document.createElement("h3");
    name.textContent = hotel.name;
    heading.appendChild(name);
    if (hotel.badge === "family" || hotel.badge === "groups") {
      const badge = document.createElement("span");
      badge.className = "hotel-badge";
      badge.textContent = I18N.t(hotel.badge === "family" ? "travel.stay.badgeFamily" : "travel.stay.badgeGroups");
      heading.appendChild(badge);
    }
    card.appendChild(heading);

    appendRow(card, bilingual(hotel.tagline), "hotel-tagline");
    appendRow(card, hotel.address, "hotel-address");
    appendRow(card, bilingual(hotel.distanceToVenue), "hotel-distance");
    appendRow(card, bilingual(hotel.distanceToCentre), "hotel-distance");

    if (hotel.priceFrom) {
      const priceRow = document.createElement("p");
      priceRow.className = "hotel-price";
      priceRow.textContent = I18N.t("travel.stay.priceFromLabel") + " " + hotel.priceFrom;
      card.appendChild(priceRow);
      appendRow(card, bilingual(hotel.priceNote), "hotel-price-note");
    }

    card.appendChild(buildBookingBlock(hotel));

    const cancellationText = bilingual(hotel.cancellation);
    if (cancellationText) {
      const cancelRow = document.createElement("p");
      cancelRow.className = "hotel-cancellation";
      const label = document.createElement("strong");
      label.textContent = I18N.t("travel.stay.cancellationLabel") + ": ";
      cancelRow.appendChild(label);
      cancelRow.appendChild(document.createTextNode(cancellationText));
      card.appendChild(cancelRow);
    }

    const shuttleRow = document.createElement("p");
    shuttleRow.className = "hotel-shuttle hotel-shuttle--" + hotel.shuttle;
    const shuttleKey =
      hotel.shuttle === "yes" ? "travel.stay.shuttleYes" : hotel.shuttle === "no" ? "travel.stay.shuttleNo" : "travel.stay.shuttleTbc";
    shuttleRow.textContent = I18N.t(shuttleKey);
    card.appendChild(shuttleRow);
    appendRow(card, bilingual(hotel.shuttleNote), "hotel-shuttle-note");

    if (hotel.bookingUrl) {
      const bookLink = document.createElement("a");
      bookLink.className = "btn btn-primary hotel-book-btn";
      bookLink.href = hotel.bookingUrl;
      bookLink.target = "_blank";
      bookLink.rel = "noopener";
      bookLink.textContent = I18N.t("travel.stay.bookButton");
      card.appendChild(bookLink);
    }

    return card;
  }

  async function renderHotels() {
    const container = document.getElementById("hotelCards");
    const emptyMessage = document.getElementById("hotelsEmptyMessage");
    if (!container) return;

    const hotels = await loadHotels();
    const published = hotels.filter((h) => h.published);

    container.innerHTML = "";
    if (!published.length) {
      container.hidden = true;
      if (emptyMessage) {
        emptyMessage.hidden = false;
        emptyMessage.textContent = I18N.t("travel.stay.emptyMessage");
      }
      return;
    }

    container.hidden = false;
    if (emptyMessage) emptyMessage.hidden = true;
    published.forEach((hotel) => container.appendChild(buildCard(hotel)));
  }

  async function renderMap() {
    const el = document.getElementById("travelMap");
    if (!el || typeof L === "undefined") return;

    const hotels = await loadHotels();

    if (!mapInstance) {
      mapInstance = L.map(el, { scrollWheelZoom: false }).setView([VENUE_COORDS.lat, VENUE_COORDS.lng], 11);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(mapInstance);
    }

    mapMarkers.forEach((marker) => mapInstance.removeLayer(marker));
    mapMarkers = [];

    const venueIcon = L.divIcon({
      className: "map-pin map-pin--venue",
      html: "<span></span>",
      iconSize: [18, 18],
    });

    function addMarker(coords, labelKey, icon) {
      const marker = L.marker([coords.lat, coords.lng], icon ? { icon } : undefined)
        .addTo(mapInstance)
        .bindPopup(I18N.t(labelKey));
      mapMarkers.push(marker);
    }

    addMarker(VENUE_COORDS, "travel.stay.mapVenue", venueIcon);
    addMarker(AIRPORT_COORDS, "travel.stay.mapAirport");
    addMarker(CENTRE_COORDS, "travel.stay.mapCentre");

    hotels.forEach((hotel) => {
      if (hotel.published && typeof hotel.lat === "number" && typeof hotel.lng === "number") {
        const marker = L.marker([hotel.lat, hotel.lng]).addTo(mapInstance).bindPopup(hotel.name);
        mapMarkers.push(marker);
      }
    });

    setTimeout(() => mapInstance.invalidateSize(), 100);
  }

  function setActivePanel(id, updateHash) {
    if (!PANEL_IDS.includes(id)) id = PANEL_IDS[0];
    activePanel = id;

    PANEL_IDS.forEach((panelId) => {
      const panel = document.getElementById(panelId);
      const isActive = panelId === id;
      const body = panel && panel.querySelector(".travel-panel-body");
      if (body) body.hidden = !isActive;
      document.querySelectorAll('[data-travel-tab="' + panelId + '"]').forEach((trigger) => {
        trigger.setAttribute("aria-selected", String(isActive));
        trigger.setAttribute("aria-expanded", String(isActive));
      });
    });

    if (updateHash) {
      const url = new URL(window.location.href);
      url.hash = id;
      window.history.replaceState({}, "", url);
    }

    if (id === "travel-stay") renderMap();
  }

  function initTabs() {
    document.querySelectorAll("[data-travel-tab]").forEach((trigger) => {
      trigger.addEventListener("click", () => setActivePanel(trigger.getAttribute("data-travel-tab"), true));
    });

    const hash = window.location.hash.replace("#", "");
    setActivePanel(PANEL_IDS.includes(hash) ? hash : PANEL_IDS[0], false);
  }

  async function init() {
    initTabs();
    await renderHotels();
    if (activePanel === "travel-stay") await renderMap();
  }

  function refreshLocale() {
    renderHotels();
    if (activePanel === "travel-stay") renderMap();
  }

  return { init, refreshLocale };
})();
