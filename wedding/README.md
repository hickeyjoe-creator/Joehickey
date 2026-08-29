# Wedding Website

A static wedding website (plain HTML/CSS/JS, no build step). Lives in this
`wedding/` subfolder so it doesn't interfere with the Maleta app at the repo
root.

## Customize

- **Names, date, location, story, event details, hotel, registry links:**
  edit the text directly in `index.html`.
- **Countdown date:** update `WEDDING_DATE` at the top of `js/app.js` to your
  real ceremony date/time.
- **Colors/fonts:** edit the CSS variables at the top of `css/styles.css`.
- **Photos:** replace the placeholder `<div class="placeholder-photo">`
  blocks in `index.html` with `<img>` tags pointing at files you add to
  `images/`.

## RSVP form

The RSVP form currently only saves responses to the visitor's own browser
(`localStorage`) — it does **not** send you anything. To actually collect
responses, pick one:

- **Formspree** (easiest): create a free form at formspree.io, then set the
  form's `action` attribute in `index.html` to your Formspree endpoint and
  remove the `event.preventDefault()` handling in `js/app.js` (or follow
  Formspree's fetch-based AJAX example).
- **Google Forms:** build the RSVP as a Google Form and either embed it with
  an `<iframe>` or link out to it, replacing the form in `index.html`.
- **Custom backend:** point the form at your own API endpoint.

## Viewing locally

Open `index.html` directly in a browser, or serve the folder:

```
cd wedding
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Deployment note

This repo's GitHub Pages workflow (`.github/workflows/deploy.yml`) deploys
the entire repository root, which currently serves the Maleta app at `/`.
Since this site lives in `wedding/`, once pushed it will be reachable at
`https://<your-pages-domain>/wedding/` rather than at the root domain. If you
want it at the root instead, it would need its own repo or Pages site.
