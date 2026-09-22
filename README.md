# Atlas of Empires · The Mongol Empire

An interactive museum atlas following the Mongol Empire and its successor realms from 1206 to 1368. Explore 36 sourced moments, scrub or play the timeline, select map pins, and zoom or pan the geographic view.

## Run locally

```bash
npm ci
npm run dev
npm run build
```

## Historical method

Each event links to a source. Its pin marks the named place or, where the site is uncertain, an explicitly approximate area. The changing map overlays and campaign routes are generalized interpretive graphics. They should not be read as surveyed borders or as implying uniform control. After 1260, the colors represent distinct successor realms; the Ilkhanate overlay ends in 1335, and the Yuan overlay for China ends in 1368. Coastal geometry comes from Natural Earth via `world-atlas`.

The initial brief refers to “all Instinct include rows,” but that dataset was not present in the source repository. The current timeline is a researched public-source version pending reconciliation with those rows.

## Deployment

The source lives in the private GitHub fork `qingsworkshop/multi-war-atlas-b`. The public static build lives in `qingsworkshop/atlas-of-empires` and is served by GitHub Pages at `https://qingsworkshop.github.io/atlas-of-empires/`.

To publish an update, run `GITHUB_PAGES=true npm run build`, then copy `dist/` to the public site's `main` branch. The Pages repository contains only built static assets; it is separate because the organization’s current plan rejected GitHub Pages on the private source fork.
