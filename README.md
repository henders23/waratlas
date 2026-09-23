# War atlas A/B: Claude Opus 5.5 vs GPT-6 Sol

On the night of 22–23 September 2026 I gave two coding agents the same one-line prompt and the same brief. Each was asked to build an interactive atlas of the Mongol conquests and deploy it to my site. This repo holds both results, with their full commit histories, and the story of how the evening went.

| | Entry A | Entry B |
|---|---|---|
| Model | Claude Opus 5.5 | GPT-6 Sol, medium reasoning effort |
| Harness | Claude Code | Codex 0.156 |
| Live | [qingsworkshop.com/war-atlas-a](https://www.qingsworkshop.com/war-atlas-a) | [qingsworkshop.com/war-atlas-b](https://www.qingsworkshop.com/war-atlas-b) |
| Code | [`a-claude/`](a-claude/) | [`b-codex/`](b-codex/) |

Both agents ran in [T3 Code](https://github.com/pingdotgg/t3code) on my workstation, side by side, each in its own checkout.

## The setup

The brief is [`INTENT.md`](a-claude/INTENT.md) (the same file sits in both folders). It came out of a chat with Lupe, my Grok bot. In short, it asks for a beautiful, fluid map or globe with selectable wars, a draggable timeline, a play button, rich graphics for changes and clickable pins. It asks for one war only (the Mongols), with "full data for that war … all Instinct include rows".

"Instinct include rows" refers to a research pack. It lists 109 candidate events, each marked *include* (103 of them) or *merge*, with primary-source locators and strict rules on what may be drawn (for example, no invented army routes). That pack was supposed to be in the repo when the agents started. It wasn't: my bot had written the brief but never added the data, which sat in a private Google Drive tarball.

I pasted the same prompt into both agents within a minute of each other:

> hey, make a fork of https://github.com/yanqingcheng/multi-war-atlas and implement it - just really make it super impressive and gorgeous and slick and performant and just absolutely NAIL it. deploy it to a qingsworkshop link when you're done. it's going to be a competition between models but please don't peek at the other guy's work

## What happened

All times are UK time (BST).

| Time | Claude (A) | Codex (B) |
|---|---|---|
| 00:19–00:20 | Prompt sent. | Prompt sent. |
| 00:21 | Finds the brief references a dataset that isn't in the repo. | Same finding. Notes that it has "asked where that dataset lives" and carries on building anyway. |
| 00:23–00:26 | Tracks the dataset to the private Drive tarball, fails to reach it, and decides to write its own sourced Mongol dataset. | Map engine working; a research subagent writes 36 sourced events covering 1206–1368. |
| 00:28 | Spawns three research subagents, one per period, while it builds 13th-century regions out of Natural Earth province shapes. | Checks desktop and mobile in headless Chromium and fixes polygon winding bugs. |
| 00:34 | | GitHub Pages is refused on the private fork under my org's plan, so it publishes the built site to a separate public repo. |
| 00:36 | Stops and asks me how to get the dataset. | |
| 00:39 | | **Finishes** at [qingsworkshop.github.io/atlas-of-empires](https://qingsworkshop.github.io/atlas-of-empires/) with its own 36 events. Flags the missing dataset, and flags that this is a github.io link rather than qingsworkshop.com. |
| 00:38–00:40 | **I intervene.** The pack is merged into the source repo (PR #1). I answer both agents with the same words: *"it's been added now. my bots mistake. feel free to validate and improve it if necessary"* | Same message. |
| 00:40–00:44 | Pulls the pack and rewrites its validator so the build fails unless every include row appears exactly once. Redirects its three research agents onto the 103 canonical rows. | |
| 00:43 | A response is cut off mid-stream and resumes. | |
| 00:45–00:59 | Writes dated control histories for 103 regions, then builds a MapLibre 3D globe with terrain relief and the app UI. | Audit and enrichment subagents check the pack. It wires in all 103 include rows, fixes 5 contradictory date labels for display and removes its drawn campaign routes because the pack forbids them. **Finishes at 00:59**, flagging a merge row whose target doesn't exist. |
| 01:00–01:12 | Debugs a globe that renders at zero height in headless Chromium (a CSS specificity clash with MapLibre), then adds label decluttering, a mobile layout and playback checks. | Idle. |
| 01:13–01:22 | Deploys its own Vercel project, opens and merges a routing PR on my homepage repo, and checks the real domain. **Finishes at 01:22** at qingsworkshop.com/war-atlas-a. | |
| 01:15 | | **Follow-up from me:** *"can you resolve the source issues yourself?"* It writes a new round of the pack (R72) rather than editing R71: 5 date fixes in the data itself, and the broken merge replaced with separate Gurganj, Nishapur, Herat 1221 and Herat 1222 events, for 107 include rows. The validator now rejects orphan merges. |
| 01:24 | | **Follow-up from me:** *"when you're happy pop it on qingsworkshop.com/war-atlas-b please"*. It adds a static route on my homepage repo. |
| 01:23 / 01:29 | I ask for a video (see below). | I ask for a video (see below). |
| 01:36 | | **Finishes** at qingsworkshop.com/war-atlas-b. |

### Summary

| | Claude (A) | Codex (B) |
|---|---|---|
| Time from prompt to live on qingsworkshop.com | 63 min in one run, including a 3-minute wait for my answer | 76 min elapsed: about an hour of agent work across three runs, plus a 16-minute gap while I was away |
| My messages before the video request | 1: the dataset answer | 3: the dataset answer, "resolve the source issues", "pop it on qingsworkshop.com" |
| Events on the map | 103 (all R71 include rows) | 107 (R72, its own amendment of the pack) |
| What happened to the pack's errors | Listed in [`r71-review.md`](a-claude/data/mongol/r71-review.md); the pack itself is left alone | Fixed in a new, validated R72 round, with an [audit](b-codex/data/mongol/r72/mongol-round72-audit.md) |
| Map | MapLibre 3D globe with shaded relief; 103 historical regions with dated control; dashed rings for events the sources only place within a region | Flat SVG map (Mercator projection) drawn from `world-atlas` coastlines, with generalised interpretive territory overlays and 38 locality markers |
| Subagents | 3 (event research by period) | 4 (early research, pack audit, enrichment, merge research) |

### Cost

Both agents ran on subscription plans, so I didn't pay per token. These figures are what the tokens logged by each session would cost at list API prices. They cover everything up to the video request, including subagents.

| | Claude Opus 5.5 | GPT-6 Sol |
|---|---|---|
| Price per 1M tokens (input / cached / output) | $4 / $0.20 / $20; cache writes $5 (5 min) or $8 (1 h) | $2 / $0.20 / $10 |
| Output tokens | 572k (391k of them from the three research subagents) | 131k |
| Input tokens | 37.8M cache reads, 1.19M cache writes | 28.5M, of which 27.8M cached |
| **Estimated cost** | **≈ $26** | **≈ $8.30** |

About half of A's cost came from its three research subagents, which wrote the long event records. No Codex request exceeded the 272k-token threshold that doubles GPT-6 Sol prices.

## The video wild goose chase

Then I asked each for a video for Twitter.

**Claude** decided that screen-recording headless Chromium would look choppy because WebGL renders in software at a few frames a second. It built a deterministic frame renderer instead: it steps the clock and camera one frame at a time and screenshots each one, 1,290 frames in total for a 43-second 1080p video. Test frames looked sharp, but each took 6–8 seconds. It ran four headless browsers in parallel; one died when the container hit its 512-process limit. With about 90 minutes to go, it sat in a blocking wait and stopped answering me, so I aborted it at 01:56. It then hit its session limit, which didn't reset until 04:50. The render kept going in the background until about 03:20, but the frames were never stitched into a video. The attempt cost about $3.50 more.

**Codex** recorded a 24-second 1280×720 walkthrough in about two and a half minutes and published it as a [release asset](https://github.com/qingsworkshop/atlas-of-empires/releases/download/war-atlas-b-r72/war-atlas-b-twitter.mp4).

In the end I just took screen recordings on my phone.

## Running either entry

Each folder is a standalone Vite + React app with its own README:

```sh
cd a-claude   # or b-codex
npm ci
npm run dev
```

Entry A's globe needs extra geography files, and its README explains how to rebuild them. The deployment sections in each README describe my own hosting and are kept as the agents wrote them.

## About this repo

- `a-claude/` and `b-codex/` are imported with their full git histories, so `git log -- a-claude` shows how A was built, commit by commit.
- The Mongol research pack is included in both folders under `data/mongol/`.
- Code is MIT-licensed (see [LICENSE](LICENSE)). The pack cites translations whose copyright is unresolved; it contains citations only, not quotations.

This README was drafted by Claude Opus 5.5, which is also entry A, working from both agents' session logs at my request. The times, prompts and token counts come directly from those logs.
