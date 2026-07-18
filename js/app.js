(function () {
  "use strict";

  const State = {
    data: null,
    view: { screen: "home" },
    editMode: {}, // tripId -> bool
    collapsed: {}, // sectionId -> bool (true = collapsed)
    modal: null,
  };

  const $app = () => document.getElementById("app");
  const $modalRoot = () => document.getElementById("modal-root");
  const $banner = () => document.getElementById("storage-banner");

  function esc(str) {
    return String(str == null ? "" : str).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[c]));
  }

  function save() {
    return window.MaletaStorage.save(State.data);
  }

  MaletaStorage_bindBanner();
  function MaletaStorage_bindBanner() {
    window.MaletaStorage.onError = (msg) => {
      const b = $banner();
      b.textContent = "⚠ " + msg + " ";
      const dismiss = document.createElement("button");
      dismiss.textContent = "Dismiss";
      dismiss.className = "banner-dismiss";
      dismiss.addEventListener("click", () => b.classList.add("hidden"));
      b.appendChild(dismiss);
      b.classList.remove("hidden");
    };
    window.MaletaStorage.onErrorCleared = () => {
      $banner().classList.add("hidden");
    };
  }

  // ---------- helpers on data ----------
  function findTrip(id) {
    return State.data.trips.find((t) => t.id === id);
  }
  function findTemplate(id) {
    return State.data.templates.find((t) => t.id === id);
  }
  function tripProgress(trip) {
    let total = 0,
      checked = 0;
    trip.sections.forEach((s) =>
      s.items.forEach((it) => {
        total++;
        if (it.checked) checked++;
      })
    );
    return { total, checked };
  }
  function sectionProgress(section) {
    let total = section.items.length;
    let checked = section.items.filter((i) => i.checked).length;
    return { total, checked };
  }

  // ---------- render dispatch ----------
  function render(preserveScroll) {
    const scrollY = preserveScroll ? window.scrollY : 0;
    const v = State.view;
    let html = "";
    if (v.screen === "home") html = renderHome();
    else if (v.screen === "trip") html = renderTripScreen(v.tripId);
    else if (v.screen === "data") html = renderDataScreen();
    $app().innerHTML = html;
    renderModal();
    if (preserveScroll) {
      window.scrollTo(0, scrollY);
    } else {
      window.scrollTo(0, 0);
    }
  }

  // ---------- HOME ----------
  function renderHome() {
    const trips = State.data.trips;
    let rows = trips
      .map((t) => {
        const { total, checked } = tripProgress(t);
        const pct = total ? Math.round((checked / total) * 100) : 0;
        const done = total > 0 && checked === total;
        return `
        <div class="trip-card" data-action="open-trip" data-trip="${t.id}">
          <div class="trip-card-main">
            <div class="trip-card-title">${esc(t.name)} ${done ? '<span class="check-badge">✓</span>' : ""}</div>
            <div class="trip-progress-row">
              <div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div>
              <span class="trip-progress-count">${checked}/${total}</span>
            </div>
          </div>
          <button class="icon-btn trip-menu-btn" data-action="trip-menu" data-trip="${t.id}" aria-label="Trip options">⋯</button>
        </div>`;
      })
      .join("");
    if (!trips.length) {
      rows = `<div class="empty-state">No trips yet. Tap "New Trip" to start packing.</div>`;
    }
    return `
      <div class="topbar">
        <h1 class="app-title">🧳 Maleta</h1>
        <button class="icon-btn" data-action="open-data" aria-label="Templates and data">⚙️</button>
      </div>
      <div class="screen-pad">
        <button class="btn btn-primary btn-block" data-action="new-trip">+ New Trip</button>
        <div class="trip-list">${rows}</div>
      </div>
    `;
  }

  // ---------- TRIP SCREEN ----------
  function renderTripScreen(tripId) {
    const trip = findTrip(tripId);
    if (!trip) {
      State.view = { screen: "home" };
      return renderHome();
    }
    const editing = !!State.editMode[tripId];
    const { total, checked } = tripProgress(trip);
    const pct = total ? Math.round((checked / total) * 100) : 0;

    const sectionsHtml = trip.sections
      .map((s) => renderSection(trip, s, editing))
      .join("");

    return `
      <div class="topbar">
        <button class="icon-btn" data-action="go-home" aria-label="Back">←</button>
        <h1 class="app-title trip-title" data-action="rename-trip" data-trip="${trip.id}"><span class="trip-title-text">${esc(trip.name)}</span> <span class="trip-title-pencil">✎</span></h1>
        <button class="icon-btn" data-action="trip-menu" data-trip="${trip.id}" aria-label="Trip options">⋯</button>
      </div>
      <div class="screen-pad">
        <div class="overall-progress">
          <div class="progress-track big"><div class="progress-fill" style="width:${pct}%"></div></div>
          <div class="overall-progress-label">${checked} / ${total} packed (${pct}%)</div>
        </div>
        <div class="trip-actions-row">
          <button class="btn ${editing ? "btn-active" : ""}" data-action="toggle-edit" data-trip="${trip.id}">${editing ? "✓ Done Editing" : "✎ Edit"}</button>
          <button class="btn" data-action="reset-ticks" data-trip="${trip.id}">↺ Reset Ticks</button>
        </div>
        <div class="section-list">${sectionsHtml}</div>
        ${editing ? `<button class="btn btn-secondary btn-block" data-action="add-section" data-trip="${trip.id}">+ Add Section</button>` : ""}
      </div>
    `;
  }

  function renderSection(trip, section, editing) {
    const { total, checked } = sectionProgress(section);
    const done = total > 0 && checked === total;
    const isOpen = !State.collapsed[section.id];
    const itemsHtml = section.items
      .map((item) => renderItem(trip, section, item, editing))
      .join("");
    return `
      <details class="section" data-section="${section.id}" ${isOpen ? "open" : ""}>
        <summary class="section-summary">
          <span class="chevron">▶</span>
          <span class="section-title">${esc(section.title)}</span>
          ${done ? '<span class="check-badge">✓</span>' : ""}
          <span class="section-count">${checked}/${total}</span>
          ${
            editing
              ? `<span class="section-edit-btns">
                  <button class="icon-btn tiny" data-action="rename-section" data-trip="${trip.id}" data-section="${section.id}" aria-label="Rename section">✎</button>
                  <button class="icon-btn tiny danger" data-action="delete-section" data-trip="${trip.id}" data-section="${section.id}" aria-label="Delete section">🗑</button>
                </span>`
              : ""
          }
        </summary>
        <div class="item-list">
          ${itemsHtml || '<div class="empty-state small">No items yet.</div>'}
          ${
            editing
              ? `<button class="btn btn-add-item" data-action="add-item" data-trip="${trip.id}" data-section="${section.id}">+ Add item</button>`
              : ""
          }
        </div>
      </details>
    `;
  }

  function renderItem(trip, section, item, editing) {
    return `
      <div class="item-row ${item.checked ? "checked" : ""}">
        <label class="item-check-label">
          <input type="checkbox" class="item-checkbox" ${item.checked ? "checked" : ""}
            data-action="toggle-item" data-trip="${trip.id}" data-section="${section.id}" data-item="${item.id}" />
          <span class="item-check-box" aria-hidden="true"></span>
          <span class="item-text-wrap">
            <span class="item-text">${esc(item.text)}</span>
            ${item.note ? `<span class="item-note">${esc(item.note)}</span>` : ""}
          </span>
        </label>
        ${
          editing
            ? `<span class="item-edit-btns">
                <button class="icon-btn tiny" data-action="edit-item" data-trip="${trip.id}" data-section="${section.id}" data-item="${item.id}" aria-label="Edit item">✎</button>
                <button class="icon-btn tiny danger" data-action="delete-item" data-trip="${trip.id}" data-section="${section.id}" data-item="${item.id}" aria-label="Delete item">🗑</button>
              </span>`
            : ""
        }
      </div>
    `;
  }

  // ---------- DATA SCREEN ----------
  function renderDataScreen() {
    const customTemplates = State.data.templates.filter((t) => !t.builtIn);
    const builtIns = State.data.templates.filter((t) => t.builtIn);
    const tplRow = (t) => `
      <div class="trip-card">
        <div class="trip-card-main">
          <div class="trip-card-title">${esc(t.name)}${t.builtIn ? ' <span class="tag">built-in</span>' : ""}</div>
          <div class="trip-progress-row"><span class="trip-progress-count">${t.sections.reduce((n, s) => n + s.items.length, 0)} items</span></div>
        </div>
        ${
          t.builtIn
            ? ""
            : `<button class="icon-btn danger" data-action="delete-template" data-template="${t.id}" aria-label="Delete template">🗑</button>`
        }
      </div>`;

    return `
      <div class="topbar">
        <button class="icon-btn" data-action="go-home" aria-label="Back">←</button>
        <h1 class="app-title">Templates &amp; Data</h1>
        <span style="width:44px"></span>
      </div>
      <div class="screen-pad">
        <section class="data-section">
          <h2>Templates</h2>
          ${builtIns.map(tplRow).join("")}
          ${customTemplates.map(tplRow).join("") || '<div class="empty-state small">No custom templates yet — save one from a trip.</div>'}
        </section>

        <section class="data-section">
          <h2>Backup</h2>
          <button class="btn btn-block" data-action="export-all">⬇ Export all data (JSON)</button>
          <label class="btn btn-block btn-secondary file-label">
            ⬆ Import data (JSON)
            <input type="file" id="import-file-input" accept="application/json,.json" style="display:none" />
          </label>
          <p class="hint">Export regularly — this is your only backup, since Maleta has no cloud sync. Import can restore a full backup or add a single exported trip.</p>
        </section>
      </div>
    `;
  }

  // ---------- MODALS ----------
  function renderModal() {
    const root = $modalRoot();
    if (!State.modal) {
      root.innerHTML = "";
      return;
    }
    const m = State.modal;
    let inner = "";
    if (m.type === "newTrip") inner = modalNewTrip();
    else if (m.type === "renameTrip") inner = modalTextForm("Rename Trip", "Trip name", findTrip(m.tripId).name, "do-rename-trip", { trip: m.tripId });
    else if (m.type === "renameSection") inner = modalTextForm("Rename Section", "Section title", findSection(m.tripId, m.sectionId).title, "do-rename-section", { trip: m.tripId, section: m.sectionId });
    else if (m.type === "addSection") inner = modalTextForm("Add Section", "Section title", "", "do-add-section", { trip: m.tripId });
    else if (m.type === "editItem") inner = modalEditItem(m);
    else if (m.type === "saveTemplate") inner = modalTextForm("Save as Template", "Template name", findTrip(m.tripId).name, "do-save-template", { trip: m.tripId });
    else if (m.type === "confirm") inner = modalConfirm(m);
    else if (m.type === "tripActions") inner = modalTripActions(m);
    else if (m.type === "importConfirm") inner = modalImportConfirm(m);

    root.innerHTML = `<div class="modal-overlay" data-action="close-modal">
      <div class="modal-card">${inner}</div>
    </div>`;

    const firstInput = root.querySelector("input[type=text], textarea");
    if (firstInput) {
      firstInput.focus();
      firstInput.select();
    }
    const form = root.querySelector("form");
    if (form) form.addEventListener("submit", onModalFormSubmit);
  }

  function findSection(tripId, sectionId) {
    return findTrip(tripId).sections.find((s) => s.id === sectionId);
  }
  function findItem(tripId, sectionId, itemId) {
    return findSection(tripId, sectionId).items.find((i) => i.id === itemId);
  }

  function modalTextForm(title, label, value, action, extraData) {
    const dataAttrs = Object.entries(extraData || {})
      .map(([k, v]) => `data-${k}="${esc(v)}"`)
      .join(" ");
    return `
      <form data-form-action="${action}" ${dataAttrs}>
        <h2>${esc(title)}</h2>
        <label class="field-label">${esc(label)}
          <input type="text" name="value" value="${esc(value)}" maxlength="120" required />
        </label>
        <div class="modal-btn-row">
          <button type="button" class="btn" data-action="close-modal">Cancel</button>
          <button type="submit" class="btn btn-primary">Save</button>
        </div>
      </form>
    `;
  }

  function modalEditItem(m) {
    const isEdit = !!m.itemId;
    const item = isEdit ? findItem(m.tripId, m.sectionId, m.itemId) : { text: "", note: "" };
    return `
      <form data-form-action="do-save-item" data-trip="${m.tripId}" data-section="${m.sectionId}" data-item="${m.itemId || ""}">
        <h2>${isEdit ? "Edit Item" : "Add Item"}</h2>
        <label class="field-label">Item
          <input type="text" name="text" value="${esc(item.text)}" maxlength="120" required />
        </label>
        <label class="field-label">Note <span class="optional">(optional)</span>
          <input type="text" name="note" value="${esc(item.note)}" maxlength="120" placeholder="e.g. Fill after security" />
        </label>
        <div class="modal-btn-row">
          <button type="button" class="btn" data-action="close-modal">Cancel</button>
          <button type="submit" class="btn btn-primary">Save</button>
        </div>
      </form>
    `;
  }

  function modalNewTrip() {
    const templates = State.data.templates;
    const trips = State.data.trips;
    const tplOptions = templates
      .map(
        (t, i) =>
          `<label class="radio-row"><input type="radio" name="source" value="template:${t.id}" ${i === 0 ? "checked" : ""}/> ${esc(t.name)}${t.builtIn ? " (built-in)" : ""}</label>`
      )
      .join("");
    const tripOptions = trips
      .map((t) => `<label class="radio-row"><input type="radio" name="source" value="trip:${t.id}" /> Copy of "${esc(t.name)}"</label>`)
      .join("");
    return `
      <form data-form-action="do-create-trip">
        <h2>New Trip</h2>
        <label class="field-label">Trip name
          <input type="text" name="name" value="" maxlength="120" placeholder="e.g. Family Holiday — Spain" required />
        </label>
        <div class="field-label">Start from</div>
        <div class="radio-list">
          ${tplOptions}
          ${tripOptions ? `<div class="radio-divider">Copy a past trip</div>${tripOptions}` : ""}
        </div>
        <div class="modal-btn-row">
          <button type="button" class="btn" data-action="close-modal">Cancel</button>
          <button type="submit" class="btn btn-primary">Create</button>
        </div>
      </form>
    `;
  }

  function modalConfirm(m) {
    return `
      <h2>${esc(m.title)}</h2>
      <p>${esc(m.message)}</p>
      <div class="modal-btn-row">
        <button type="button" class="btn" data-action="close-modal">Cancel</button>
        <button type="button" class="btn btn-danger" data-action="run-confirm">${esc(m.confirmLabel || "Confirm")}</button>
      </div>
    `;
  }

  function modalTripActions(m) {
    const trip = findTrip(m.tripId);
    return `
      <h2>${esc(trip.name)}</h2>
      <div class="action-sheet">
        ${m.fromHome ? `<button class="btn btn-block" data-action="open-trip" data-trip="${trip.id}">Open</button>` : ""}
        <button class="btn btn-block" data-action="rename-trip" data-trip="${trip.id}">Rename</button>
        <button class="btn btn-block" data-action="duplicate-trip" data-trip="${trip.id}">Duplicate as New Trip</button>
        <button class="btn btn-block" data-action="save-template" data-trip="${trip.id}">Save as Template</button>
        <button class="btn btn-block" data-action="export-trip" data-trip="${trip.id}">Export This Trip (JSON)</button>
        <button class="btn btn-block btn-danger" data-action="delete-trip" data-trip="${trip.id}">Delete Trip</button>
      </div>
      <div class="modal-btn-row">
        <button type="button" class="btn btn-block" data-action="close-modal">Close</button>
      </div>
    `;
  }

  function modalImportConfirm(m) {
    return `
      <h2>Import Backup</h2>
      <p>This file is a full backup containing ${m.parsed.trips.length} trip(s) and ${m.parsed.templates.length} template(s). Importing it will <strong>replace all trips and templates currently on this device</strong>. This can't be undone.</p>
      <div class="modal-btn-row">
        <button type="button" class="btn" data-action="close-modal">Cancel</button>
        <button type="button" class="btn btn-danger" data-action="run-import-backup">Replace All Data</button>
      </div>
    `;
  }

  // ---------- form submit handling ----------
  function onModalFormSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const action = form.getAttribute("data-form-action");
    const fd = new FormData(form);
    const ds = form.dataset;

    if (action === "do-create-trip") {
      const name = (fd.get("name") || "").toString().trim();
      const source = (fd.get("source") || "").toString();
      if (!name || !source) return;
      const [kind, id] = source.split(":");
      let sections;
      if (kind === "template") sections = findTemplate(id).sections;
      else sections = findTrip(id).sections;
      const trip = {
        id: window.MaletaStorage.genId("trip"),
        name,
        createdAt: Date.now(),
        sections: window.MaletaStorage.instantiateTripFromSections(sections),
      };
      State.data.trips.unshift(trip);
      save();
      closeModal();
      State.view = { screen: "trip", tripId: trip.id };
      render(false);
      return;
    }

    if (action === "do-rename-trip") {
      const trip = findTrip(ds.trip);
      const val = (fd.get("value") || "").toString().trim();
      if (!val) return;
      trip.name = val;
      save();
      closeModal();
      render(true);
      return;
    }

    if (action === "do-rename-section") {
      const section = findSection(ds.trip, ds.section);
      const val = (fd.get("value") || "").toString().trim();
      if (!val) return;
      section.title = val;
      save();
      closeModal();
      render(true);
      return;
    }

    if (action === "do-add-section") {
      const trip = findTrip(ds.trip);
      const val = (fd.get("value") || "").toString().trim();
      if (!val) return;
      trip.sections.push({ id: window.MaletaStorage.genId("sec"), title: val, items: [] });
      save();
      closeModal();
      render(true);
      return;
    }

    if (action === "do-save-item") {
      const text = (fd.get("text") || "").toString().trim();
      const note = (fd.get("note") || "").toString().trim();
      if (!text) return;
      if (ds.item) {
        const item = findItem(ds.trip, ds.section, ds.item);
        item.text = text;
        item.note = note;
      } else {
        const section = findSection(ds.trip, ds.section);
        section.items.push({ id: window.MaletaStorage.genId("item"), text, note, checked: false });
      }
      save();
      closeModal();
      render(true);
      return;
    }

    if (action === "do-save-template") {
      const trip = findTrip(ds.trip);
      const val = (fd.get("value") || "").toString().trim();
      if (!val) return;
      State.data.templates.push({
        id: window.MaletaStorage.genId("template"),
        name: val,
        builtIn: false,
        sections: window.MaletaStorage.sectionsForTemplate(trip.sections),
      });
      save();
      closeModal();
      render(true);
      return;
    }
  }

  // ---------- action delegation ----------
  function closeModal() {
    State.modal = null;
    renderModal();
  }

  function downloadJson(obj, filename) {
    const blob = new Blob([JSON.stringify(obj, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  document.addEventListener("click", (e) => {
    const el = e.target.closest("[data-action]");
    if (!el) return;
    const action = el.getAttribute("data-action");
    const tripId = el.getAttribute("data-trip");
    const sectionId = el.getAttribute("data-section");
    const itemId = el.getAttribute("data-item");
    const templateId = el.getAttribute("data-template");

    switch (action) {
      case "close-modal":
        // el is resolved via closest(), so a click anywhere inside .modal-card with
        // no data-action of its own also resolves to the overlay's close-modal.
        // Only actually close when the overlay background itself was the click target.
        if (el.classList.contains("modal-overlay") && e.target !== el) break;
        closeModal();
        break;

      case "go-home":
        State.view = { screen: "home" };
        render(false);
        break;

      case "open-data":
        State.view = { screen: "data" };
        render(false);
        break;

      case "open-trip":
        closeModal();
        State.view = { screen: "trip", tripId };
        render(false);
        break;

      case "new-trip":
        State.modal = { type: "newTrip" };
        renderModal();
        break;

      case "trip-menu":
        State.modal = { type: "tripActions", tripId, fromHome: State.view.screen === "home" };
        renderModal();
        break;

      case "rename-trip":
        State.modal = { type: "renameTrip", tripId };
        renderModal();
        break;

      case "duplicate-trip": {
        const src = findTrip(tripId);
        const copy = {
          id: window.MaletaStorage.genId("trip"),
          name: src.name + " (copy)",
          createdAt: Date.now(),
          sections: window.MaletaStorage.instantiateTripFromSections(src.sections),
        };
        State.data.trips.unshift(copy);
        save();
        closeModal();
        render(false);
        break;
      }

      case "save-template":
        State.modal = { type: "saveTemplate", tripId };
        renderModal();
        break;

      case "export-trip": {
        const trip = findTrip(tripId);
        downloadJson(
          { type: "maleta-trip", version: 1, trip },
          `maleta-${trip.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.json`
        );
        closeModal();
        break;
      }

      case "export-all":
        downloadJson(
          { type: "maleta-backup", version: 1, trips: State.data.trips, templates: State.data.templates },
          `maleta-backup-${new Date().toISOString().slice(0, 10)}.json`
        );
        break;

      case "delete-trip":
        State.modal = {
          type: "confirm",
          title: "Delete Trip",
          message: `Delete "${findTrip(tripId).name}" and all its items? This can't be undone.`,
          confirmLabel: "Delete",
          onConfirm: () => {
            State.data.trips = State.data.trips.filter((t) => t.id !== tripId);
            save();
            State.view = { screen: "home" };
          },
        };
        renderModal();
        break;

      case "delete-template":
        State.modal = {
          type: "confirm",
          title: "Delete Template",
          message: `Delete template "${findTemplate(templateId).name}"? This can't be undone.`,
          confirmLabel: "Delete",
          onConfirm: () => {
            State.data.templates = State.data.templates.filter((t) => t.id !== templateId);
            save();
          },
        };
        renderModal();
        break;

      case "reset-ticks":
        State.modal = {
          type: "confirm",
          title: "Reset All Ticks",
          message: `Untick every item in "${findTrip(tripId).name}"? This can't be undone.`,
          confirmLabel: "Reset",
          onConfirm: () => {
            findTrip(tripId).sections.forEach((s) => s.items.forEach((i) => (i.checked = false)));
            save();
          },
        };
        renderModal();
        break;

      case "run-confirm": {
        const cb = State.modal && State.modal.onConfirm;
        const priorScreen = State.view.screen;
        closeModal();
        if (cb) cb();
        render(priorScreen === State.view.screen);
        break;
      }

      case "toggle-edit":
        State.editMode[tripId] = !State.editMode[tripId];
        render(true);
        break;

      case "toggle-item": {
        const item = findItem(tripId, sectionId, itemId);
        item.checked = !item.checked;
        save();
        render(true);
        break;
      }

      case "add-section":
        State.modal = { type: "addSection", tripId };
        renderModal();
        break;

      case "rename-section":
        State.modal = { type: "renameSection", tripId, sectionId };
        renderModal();
        break;

      case "delete-section":
        State.modal = {
          type: "confirm",
          title: "Delete Section",
          message: `Delete section "${findSection(tripId, sectionId).title}" and all its items?`,
          confirmLabel: "Delete",
          onConfirm: () => {
            const trip = findTrip(tripId);
            trip.sections = trip.sections.filter((s) => s.id !== sectionId);
            save();
          },
        };
        renderModal();
        break;

      case "add-item":
        State.modal = { type: "editItem", tripId, sectionId, itemId: null };
        renderModal();
        break;

      case "edit-item":
        State.modal = { type: "editItem", tripId, sectionId, itemId };
        renderModal();
        break;

      case "delete-item":
        State.modal = {
          type: "confirm",
          title: "Delete Item",
          message: `Delete "${findItem(tripId, sectionId, itemId).text}"?`,
          confirmLabel: "Delete",
          onConfirm: () => {
            const section = findSection(tripId, sectionId);
            section.items = section.items.filter((i) => i.id !== itemId);
            save();
          },
        };
        renderModal();
        break;

      case "run-import-backup": {
        const parsed = State.modal.parsed;
        State.data.trips = parsed.trips || [];
        State.data.templates = (parsed.templates || []).filter((t) => !t.builtIn);
        State.data = window.MaletaStorage._withBuiltIn(State.data);
        save();
        closeModal();
        State.view = { screen: "home" };
        render(false);
        break;
      }
    }
  });

  // Section native toggle -> keep collapsed-state in sync without losing DOM state
  document.addEventListener(
    "toggle",
    (e) => {
      const el = e.target;
      if (el.matches && el.matches("details.section")) {
        const sectionId = el.getAttribute("data-section");
        State.collapsed[sectionId] = !el.open;
      }
    },
    true
  );

  // Import file handling (delegated change listener since input is re-created on render)
  document.addEventListener("change", (e) => {
    if (e.target.id !== "import-file-input") return;
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      let parsed;
      try {
        parsed = JSON.parse(reader.result);
      } catch (err) {
        State.modal = { type: "confirm", title: "Import Failed", message: "That file isn't valid JSON.", confirmLabel: "OK", onConfirm: () => {} };
        renderModal();
        return;
      }
      if (parsed.type === "maleta-backup" && Array.isArray(parsed.trips)) {
        State.modal = { type: "importConfirm", parsed };
        renderModal();
      } else if (parsed.type === "maleta-trip" && parsed.trip) {
        const trip = parsed.trip;
        trip.id = window.MaletaStorage.genId("trip"); // avoid id collisions
        State.data.trips.unshift(trip);
        save();
        render(false);
      } else {
        State.modal = { type: "confirm", title: "Import Failed", message: "Unrecognized Maleta file format.", confirmLabel: "OK", onConfirm: () => {} };
        renderModal();
      }
    };
    reader.readAsText(file);
  });

  // ---------- boot ----------
  function boot() {
    State.data = window.MaletaStorage.load();
    render(false);

    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("./sw.js").catch(() => {
          /* offline-first still works from cache if already registered */
        });
      });
    }
  }

  document.addEventListener("DOMContentLoaded", boot);
})();
