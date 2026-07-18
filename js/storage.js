// Storage layer: localStorage with immediate write + read-back verification.
// Every write is synchronous and verified; failures surface via onError so the
// app can show a visible warning banner instead of silently losing state.
(function () {
  const KEY = "maleta_data_v1";

  const MaletaStorage = {
    onError: null, // set by app.js: function(message) {}
    onErrorCleared: null, // set by app.js: function() {}

    genId(prefix) {
      return (
        (prefix || "id") +
        "_" +
        Date.now().toString(36) +
        "_" +
        Math.random().toString(36).slice(2, 9)
      );
    },

    emptyData() {
      return { trips: [], templates: [], activeTripId: null };
    },

    // Builds the built-in template object (with real ids) from seed data.
    builtInTemplate() {
      const seed = window.MALETA_SEED_TEMPLATE;
      return {
        id: "template_builtin_spain",
        name: seed.name,
        builtIn: true,
        sections: seed.sections.map((s) => ({
          id: this.genId("sec"),
          title: s.title,
          items: s.items.map((it) => ({
            id: this.genId("item"),
            text: it.text,
            note: it.note || "",
          })),
        })),
      };
    },

    load() {
      let raw;
      try {
        raw = localStorage.getItem(KEY);
      } catch (e) {
        this._fail("Can't read saved data — storage may be unavailable.");
        return this._withBuiltIn(this.emptyData());
      }
      if (!raw) {
        const fresh = this._withBuiltIn(this.emptyData());
        this.save(fresh);
        return fresh;
      }
      try {
        const data = JSON.parse(raw);
        if (!data.trips) data.trips = [];
        if (!data.templates) data.templates = [];
        return this._withBuiltIn(data);
      } catch (e) {
        this._fail("Saved data was corrupted and could not be read.");
        return this._withBuiltIn(this.emptyData());
      }
    },

    _withBuiltIn(data) {
      const hasBuiltIn = data.templates.some((t) => t.id === "template_builtin_spain");
      if (!hasBuiltIn) {
        data.templates.unshift(this.builtInTemplate());
      }
      return data;
    },

    // Write, then read back and compare. Returns true on verified success.
    save(data) {
      let json;
      try {
        json = JSON.stringify(data);
      } catch (e) {
        this._fail("Could not prepare data for saving.");
        return false;
      }
      try {
        localStorage.setItem(KEY, json);
      } catch (e) {
        this._fail(
          e && e.name === "QuotaExceededError"
            ? "Storage is full — this change was NOT saved."
            : "Saving failed — this change was NOT saved."
        );
        return false;
      }
      let readback;
      try {
        readback = localStorage.getItem(KEY);
      } catch (e) {
        this._fail("Save could not be verified — please check your data.");
        return false;
      }
      if (readback !== json) {
        this._fail("Save could not be verified — this change may be lost.");
        return false;
      }
      if (this.onErrorCleared) this.onErrorCleared();
      return true;
    },

    _fail(message) {
      if (this.onError) this.onError(message);
    },

    // Deep-copies a template/trip's sections into a fresh trip with all items unticked.
    instantiateTripFromSections(sections) {
      return sections.map((s) => ({
        id: this.genId("sec"),
        title: s.title,
        items: s.items.map((it) => ({
          id: this.genId("item"),
          text: it.text,
          note: it.note || "",
          checked: false,
        })),
      }));
    },

    // Strips checked state to build a template from a trip's current structure.
    sectionsForTemplate(sections) {
      return sections.map((s) => ({
        id: this.genId("sec"),
        title: s.title,
        items: s.items.map((it) => ({
          id: this.genId("item"),
          text: it.text,
          note: it.note || "",
        })),
      }));
    },
  };

  window.MaletaStorage = MaletaStorage;
})();
