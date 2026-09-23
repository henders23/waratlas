# Atlas of Empires · The Mongol Empire

An interactive museum atlas following the Mongol Empire and its successor realms from 1206 to 1294. Explore all 107 included source-reviewed moments, scrub or play the timeline, select map pins, and zoom or pan the geographic view.

## Run locally

```bash
npm ci
npm run dev
npm run build
```

## Historical method and R72 coverage

The atlas displays **all 107 `include` rows** in the [R72 Mongol denominator](data/mongol/r72/mongol_denominator_round72.csv) from 1206 through its 1294 module boundary. Five `merge` rows and one superseded discovery aggregate are not duplicated as independent events. The [R71 source pack](data/mongol/r71/mongol_denominator_round71.csv) remains immutable. The import script `scripts/prepare_atlas_data.py` preserves each canonical ID, source citation, date wording, review reason, and geometry restriction in `src/data/denominator.json`. `src/data/enrichment.ts` supplies reviewed display titles and 38 locality markers.

The source pack has no coordinates or atlas-ready titles. Locality markers are shown only for supportable named places; no pin claims a reconstructed battle position. The changing map overlays are generalized interpretive graphics, not borders derived from the pack. Coastal geometry comes from Natural Earth via `world-atlas`.

Five conflicting source date labels were corrected in R72 using their existing reconciliation notes: Wulahai (1209), Champa (1282–1284), the second Đại Việt invasion (1285), Sambyeolcho (1270–1273), and Dali (1253–1254). The long Qaidu–Qubilai label is shortened for display without narrowing its scope.

The R71 `urgench-nishapur-herat` merge target did not exist. R72 retains that combined candidate as superseded and adds Gurganj, Nishapur, Herat’s first capture, and Herat’s separate 1222 recapture. The [R72 audit](data/mongol/r72/mongol-round72-audit.md) gives primary locators, evidence limits, and the relation to R71. The R72 validator rejects orphan merge targets.

To regenerate the projection after a source-pack update:

```bash
cd data/mongol/r72 && sha256sum -c mongol-round72-manifest.sha256 && python3 validate_mongol_round72.py
cd ../../.. && python3 scripts/prepare_atlas_data.py && npm run build
```

## Deployment

The source lives in the private GitHub fork `qingsworkshop/multi-war-atlas-b`. The public static build lives in `qingsworkshop/atlas-of-empires` and is served by GitHub Pages at `https://qingsworkshop.github.io/atlas-of-empires/`.

To publish an update, run `GITHUB_PAGES=true npm run build`, then copy `dist/` to the public site's `main` branch. The Pages repository contains only built static assets; it is separate because the organization’s current plan rejected GitHub Pages on the private source fork.
