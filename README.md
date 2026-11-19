[![bounty](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/rivan122/makefun-gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/rivan122/makefun-gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

# The Leonida Ledger — a GTA VI trophy guide & tracker

An offline guide and tracker for the 55 PlayStation 5 trophies of Grand Theft Auto VI, built as an entry for the make.fun bounty [Build the best GTA 6 trophy guide](https://make.fun/bounty/gta6-trophy-guide-01) on [make.fun](https://make.fun).

## What it does

The app is a case file on the whole trophy list. Every one of the 55 trophies appears with its official name, description and grade exactly as PlayStation publishes them, and beside each one:

- **A guide in our own words** — what the official description actually asks for, how to approach it, when it unlocks, and anything countable in the description (250 stunts, 42 Shooting Range challenges, 100 WAiNK locations, $250,000 of laundered Marked Bills, and the rest).
- **Cited sources for every trophy** — the PlayStation trophy list (official descriptions) is the primary source for each guide; PSNProfiles and Exophase corroborate the list and its counts, and GTA Wiki is cited for world context. No guide text is copied from anywhere.
- **A roadmap to the platinum in ten stages**, built from the official descriptions: the chapters and named missions first, then the stranger strands, the collectible sets, the activities, the free-roam feats, and finally 100% completion and the platinum itself.
- **Missable flags, reasoned from the descriptions alone** — a trophy is flagged only when its description names a single event, a beginning-of-game moment or a one-off set-piece. Three of the 55 qualify, and the Missables view explains why each one can be missed and when to catch it.

## The tracker

- Tick trophies off as you earn them; progress is saved in the browser (localStorage) and shown as an earned count, a percentage, trophy points and a platinum meter (progress through the other 54).
- **Export** your progress to a JSON file and **import** it back on any machine.
- **Filters** for kind (story, missable, collectibles, activities, online — the official list names no online trophies, and the filter says so), for grade, and a text search across names, descriptions and guides.
- A **spoiler setting** that seals story trophies — name, description and guide hidden — until you earn them.

The look is an original dark "Leonida case file" design: type, rules and colour only. No Rockstar logos, artwork or game screenshots anywhere.

## Run it

The app is plain static files under `app/` with no build step, and it works with the network off — it loads nothing from outside its own files.

```sh
node serve.ts
```

then open http://localhost:8080 (any static file server with `app/` at its root works just as well).

## Hand it in

`main.ts` (Node 22, standard library only) validates `app/data/trophies.json` — all 55 trophies, each with a non-blank guide — then copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the kit's vendored library in `vendor/makefun-frontend.ts`, which is left unchanged:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Layout

- `app/index.html`, `app/casefile.css` — the page and its case-file styling
- `app/js/` — `trophy-data.js` (the list, points, roadmap stages), `tracker-state.js` (saved progress, export/import), `render-views.js` (checklist, detail panel, roadmap, missables), `guide-app.js` (wiring and controls)
- `app/data/trophies.json` — the 55 trophies: official name, description and grade, plus each guide, kind, missable flag, roadmap stage and sources
- `screenshots/` — four captures of the running app: the checklist with a guide open, the roadmap, the missables file, and a collectible guide
- `shots.json` — what each screenshot shows

MIT licensed — see `LICENSE`.
