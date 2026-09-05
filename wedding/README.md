# Wedding Website

A static wedding website (plain HTML/CSS/JS, no build step). Lives in this
`wedding/` subfolder so it doesn't interfere with the Maleta app at the repo
root.

## Customize

- **Names, date, location, event details, hotel:** edit the text directly in
  `index.html`.
- **Countdown date:** update `WEDDING_DATE` at the top of `js/app.js` to your
  real ceremony date/time.
- **Colors/fonts:** edit the CSS variables at the top of `css/styles.css`.
- **Photos:** the Gallery section (`#gallery` in `index.html`) uses real
  photos from `images/`, each inside a `<div class="gallery-photo"><img …>`.
  To add more, drop a file in `images/` and add another `.gallery-photo`
  block; to swap one out, just change its `src`.

## RSVP form

The RSVP form submits to Formspree (`js/app.js`, `initRsvpForm`), which
emails each response to `cristinaandjoewedding@outlook.ie`. The endpoint is
set on the form's `action` attribute in `index.html`.

The free Formspree tier caps at 50 submissions/month — check that against
your expected guest count, and upgrade on formspree.io if you need more.

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
