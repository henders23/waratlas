# Atlas of Wars: the Mongol conquests, 1206–1294

This is the Mongol conquests on an interactive globe. You can drag the timeline or press play to watch the empire spread and split, and click any marker to read the event behind it.

It is a Workshop museum exhibit, live at [qingsworkshop.com/war-atlas-a](https://www.qingsworkshop.com/war-atlas-a). The product brief is in [INTENT.md](INTENT.md).

## What's on the map

- **Events.** There are 103 events, one for each `include` row in the Instinct R71 research pack (`data/mongol/r71/`). The pack decides how precisely an event may be drawn:
  - a solid pin marks a named city or battle locality;
  - a dashed ring marks a region the sources support without supporting a point.
  
  The text is the atlas's own synthesis. Each event cites the pack's primary locators first. Problems found in the pack are listed in [data/mongol/r71-review.md](data/mongol/r71-review.md).
- **Territory.** 103 historical regions are built from Natural Earth provinces, and each has a dated history of who controlled it (`src/data/mongol/territory.json`). This layer is the atlas's context, not a claim made by the pack. It is labelled as approximate in the app.
- **Deliberately absent: army routes.** The pack refuses inferred route lines, so the atlas draws none.

## Working on it

```sh
npm ci
npm run dev        # http://localhost:5173
npm run validate   # every pack include row has one event; territory is consistent
npm run build      # validate, typecheck, bundle
```

`npm run geo -- <dir>` rebuilds `public/geo/` from the Natural Earth GeoJSON files in `<dir>`. It needs `ne_10m_admin_1_states_provinces`, `ne_50m_rivers_lake_centerlines` and `ne_50m_lakes`. The region definitions are in `scripts/region-spec.mjs`.

## Deployment

The atlas is its own Vercel project, `war-atlas-a`, built with `ATLAS_BASE=/war-atlas-a/`. The workshop homepage proxies `/war-atlas-a` to it. `vercel deploy --prod` publishes.

Relief imagery comes from AWS Terrain Tiles; coastlines, rivers and provinces from Natural Earth. The map is rendered with MapLibre GL.
