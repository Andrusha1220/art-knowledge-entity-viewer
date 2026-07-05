# Em Cartaz

A field guide to art exhibitions worth the airfare — browsed like a curated Instagram profile, not a database.

Built as a static single-page app: a hardcoded exhibitions dataset, an editorial photo grid, and a dark map of the venues. No backend, no login, no build-time data fetching.

## Features

- **Grid view** — an asymmetric, Instagram-like feed of exhibition cards. Tap a card to open its detail as a full post overlay.
- **Map view** — a dark, minimal map with a pin per venue; tap a pin to see what's on there and jump into its post.
- **Filters** — `All`, `Upcoming` (exhibitions that haven't opened yet), and `Saved`, all in the header.
- **Save** — bookmark exhibitions with a tap; saved state persists in `localStorage`, no account needed.

## Getting started

```bash
npm install
npm run dev       # start the dev server with HMR
```

Other scripts:

```bash
npm run build      # production build to dist/
npm run preview    # serve the production build locally
npm run lint       # oxlint
```

## Data

Exhibitions live in [`src/exhibitions.geojson`](src/exhibitions.geojson) — a GeoJSON `FeatureCollection` where each feature's `properties.exhibition` holds the title, dates, venue, organizer, and images, and `geometry` holds the venue's coordinates (or `null` if unknown). [`src/data.js`](src/data.js) reads this file once at load and normalizes it into the flat shape every view consumes.

To use your own dataset, replace `src/exhibitions.geojson` with a file in the same shape — see an existing entry for the exact fields expected.

## Stack

React 19 + Vite, [Leaflet](https://leafletjs.com/) for the map (dark CARTO tiles), no router, no CSS framework — a single stylesheet in `src/index.css`.

See [`CLAUDE.md`](CLAUDE.md) for a deeper look at how the pieces fit together.
