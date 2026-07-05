# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start the Vite dev server (HMR)
- `npm run build` — production build
- `npm run preview` — serve the production build locally
- `npm run lint` — run oxlint (rules: `react/rules-of-hooks`, `react/only-export-components`; config in `.oxlintrc.json`)

No test runner is configured in this project.

## Architecture

Static single-page app (Vite + React 19, no router, no backend) that renders a hardcoded exhibitions dataset in two views: an Instagram-style photo grid and a Leaflet map. There is no client-side routing — `view` is just local state in `App.jsx` (`'grid' | 'map'`), and the "post" detail is an overlay rendered conditionally on top of whichever view is active, not a separate route.

**Data flow is one-directional and centralized in `src/data.js`:**
- The raw dataset lives in `src/exhibitions.geojson` (a GeoJSON `FeatureCollection` where each feature's `properties.exhibition` holds the actual exhibition/venue/organizer fields; `geometry` may be `null` when a venue has no known coordinates).
- `src/data.js` imports that file and maps it once, at module load, into the flat `exhibitions` array every component consumes — normalizing nullable fields (missing `end_date`, `city`, `address`, `geolocation`), computing derived fields (`status`: `'current' | 'upcoming' | 'closed'`, `daysLeft`, formatted `dates` string), and deriving two secondary collections: `venues` (exhibitions grouped/deduped by coordinate, since one venue can host several concurrent shows) and `onViewCount`/`unmappedCount`/`cities`.
- Components never touch the raw geojson or reach for `Date.now()`-style logic themselves — all date/status formatting funnels through `data.js` so the grid tags, post detail, and map popups stay consistent.

**Vite is configured to import `.geojson` like JSON:** `vite.config.js` adds a small inline plugin (`geojson-as-json`) that wraps `.geojson` file contents in `export default (...)`, since Vite doesn't do this for that extension out of the box. If the dataset is ever swapped for a `.json` file instead, that plugin becomes unnecessary but harmless.

**Components (`src/components/`):**
- `Grid.jsx` — renders the `exhibitions` array as cards; CSS alone (in `index.css`, via `:nth-child` selectors) creates the asymmetric Instagram-like rhythm (some cards span 2 columns/rows). A card with no `image` gets the `card--text` class for a text-only treatment. Tapping a card calls `onOpen(id)`, lifted to `App`.
- `MapView.jsx` — imperative Leaflet integration inside a `useEffect`; the map instance is created and torn down (`map.remove()`) on every effect run, so `focus`/`onOpen` changes fully rebuild it rather than diffing markers. Dark CARTO basemap tiles. When `focus` (a `[lat, lng]` pair) is passed in, the map centers there and opens that venue's popup instead of fitting bounds to all venues — this is how "View on map" from the post overlay works. Popups are built as raw HTML strings (`popupHtml`) with `data-id` attributes, and click listeners are wired up manually in the `popupopen` event handler since Leaflet popups live outside React's DOM.
- `Post.jsx` — the detail overlay for a single exhibition; closes on Escape or backdrop click. Conditionally renders the map button only if `ex.coords` exists, since some exhibitions in the dataset have no geolocation.

**Styling** is a single `src/index.css` with CSS custom properties for the black/white/deep-red palette and serif/sans font pairing — no CSS-in-JS or modules.

## Data assumptions worth knowing before editing

- Not every exhibition has coordinates, an end date, an address, or an image — `data.js` and the components are written defensively around this (see the null-coalescing throughout `data.js` and the conditional rendering in `Post.jsx`/`Grid.jsx`). Preserve that defensiveness if you extend the dataset shape.
- `venues` in `data.js` dedupes by exact coordinate match (`ex.coords.join(',')`), so multiple exhibitions at the same address collapse into one map marker with several shows listed in its popup.
