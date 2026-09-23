# War atlas A/B: Claude Opus 5.5 vs GPT-6 Sol

On the night of 22–23 September 2026 I gave two coding agents the same one-line prompt and the same brief. Each was asked to build an interactive atlas of the Mongol conquests and deploy it to my site. This repo holds both results, with their full commit histories, the original repo and data they started from, and the story of how the evening went.

- **Entry A (Claude Opus 5.5):** [qingsworkshop.com/war-atlas-a](https://www.qingsworkshop.com/war-atlas-a)
- **Entry B (GPT-6 Sol):** [qingsworkshop.com/war-atlas-b](https://www.qingsworkshop.com/war-atlas-b)
- **Videos of both:** [my Twitter thread](https://x.com/YanqingCheng/status/2102566466121797767)

| | Entry A | Entry B |
|---|---|---|
| Model | Claude Opus 5.5 | GPT-6 Sol, medium reasoning effort |
| Harness | Claude Code | Codex 0.156 |
| Code | [`a-claude/`](a-claude/) | [`b-codex/`](b-codex/) |

Both agents ran in [T3 Code](https://github.com/pingdotgg/t3code) on my workstation, side by side, each in its own checkout.

## The setup

The brief is [`INTENT.md`](original-repo/INTENT.md). It came out of a chat with Lupe, my Grok bot. In short, it asks for a beautiful, fluid map or globe with selectable wars, a draggable timeline, a play button, rich graphics for changes and clickable pins. It asks for one war only (the Mongols), with "full data for that war … all Instinct include rows".

"Instinct include rows" refers to a research pack, now in [`data/`](data/mongol/). It lists 109 candidate events, each marked *include* (103 of them) or *merge*, with primary-source locators and strict rules on what may be drawn (for example, no invented army routes). That pack was supposed to be in the repo when the agents started. It wasn't: my bot had written the brief but never added the data, which sat in a private Google Drive tarball. When the agents started, the repo contained only `INTENT.md`.

## My messages

These are all the messages I sent, word for word, with the time each one arrived (UK time, BST).

| Time | To | Message |
|---|---|---|
| 00:19 | Claude | hey, make a fork of https://github.com/yanqingcheng/multi-war-atlas and implement it - just really make it super impressive and gorgeous and slick and performant and just absolutely NAIL it. deploy it to a qingsworkshop link when you're done. it's going to be a competition between models but please don't peek at the other guy's work |
| 00:20 | Codex | *(the same prompt)* |
| 00:35 | Claude | oh jesus why would you not ask for the dataset |
| 00:39 | Claude | it's been added now. my bots mistake. feel free to validate and improve it if necessary *(answering Claude's question about the dataset)* |
| 00:39 | Codex | *(the same answer)* |
| 01:15 | Codex | can you resolve the source issues yourself? |
| 01:23 | Claude | looks amazing! can you do me a video recording for twitter? |
| 01:24 | Codex | when you're happy pop it on qingsworkshop.com/war-atlas-b please |
| 01:29 | Codex | and can you do me a video recording for twitter please? |
| 01:51 | Claude | I don't want to wait 90 minutes for this! |
| 01:51 | Claude | it does NOT need 1080p |
| 01:51 | Claude | it's for twitter |
| 01:53 | Claude | the other thread recorded the video really fast |
| 01:56 | Claude | hey, sorry, you weren't responding so I had to hit abort on you |

Between Claude's question and my answers, I got Lupe to upload the dataset to the source repo as PR #1, merged at 00:38.

## What happened

| Time | Claude (A) | Codex (B) |
|---|---|---|
| 00:19–00:20 | Prompt arrives. | Prompt arrives. |
| 00:21 | Finds the brief references a dataset that isn't in the repo, and doesn't ask me about it. | Same finding. **Asks me straight away** where the data is, with the options "I'll provide the data/location" or "Use a researched public timeline for now". Then it ploughs on without waiting for an answer. |
| 00:23–00:26 | Tracks the dataset to the private Drive tarball, fails to reach it, and decides to write its own sourced Mongol dataset. | Map engine working; a research subagent writes 36 sourced events covering 1206–1368. |
| 00:28 | Spawns three research subagents, one per period, while it builds 13th-century regions out of Natural Earth province shapes. | Checks desktop and mobile in headless Chromium and fixes polygon winding bugs. |
| 00:34 | | GitHub Pages is refused on the private fork under my org's plan, so it publishes the built site to a separate public repo. |
| 00:35 | **I message it:** *"oh jesus why would you not ask for the dataset"* | |
| 00:36 | Asks me how to get the dataset, and waits for the answer. That's a minute after my nudge, and 15 minutes and three research subagents into the run. | |
| 00:37–00:38 | **I get Lupe, my Grok bot, to upload the dataset.** PR #1 is opened at 00:37 and merged at 00:38. | |
| 00:39 | | **Finishes** at [qingsworkshop.github.io/atlas-of-empires](https://qingsworkshop.github.io/atlas-of-empires/) with its own 36 events. Flags the missing dataset, and flags that this is a github.io link rather than qingsworkshop.com. |
| 00:39–00:40 | **I tell both the data is in.** | |
| 00:40–00:44 | Pulls the pack and rewrites its validator so the build fails unless every include row appears exactly once. Redirects its three research agents onto the 103 canonical rows. | |
| 00:43 | A response is cut off mid-stream and resumes. | |
| 00:45–00:59 | Writes dated control histories for 103 regions, then builds a MapLibre 3D globe with terrain relief and the app UI. | Audit and enrichment subagents check the pack. It wires in all 103 include rows, fixes 5 contradictory date labels for display and removes its drawn campaign routes because the pack forbids them. **Finishes at 00:59**, flagging a merge row whose target doesn't exist. |
| 01:00–01:12 | Debugs a globe that renders at zero height in headless Chromium (a CSS specificity clash with MapLibre), then adds label decluttering, a mobile layout and playback checks. | Idle. |
| 01:13–01:22 | Deploys its own Vercel project, opens and merges a routing PR on my homepage repo, and checks the real domain. **Finishes at 01:22** at qingsworkshop.com/war-atlas-a. | |
| 01:15–01:24 | | After I ask it to resolve the source issues, it writes a new round of the pack (R72) rather than editing R71: 5 date fixes in the data itself, and the broken merge replaced with separate Gurganj, Nishapur, Herat 1221 and Herat 1222 events, for 107 include rows. The validator now rejects orphan merges. |
| 01:24–01:36 | *(video; see below)* | After I ask for qingsworkshop.com, it adds a static route on my homepage repo. **Finishes at 01:36** at qingsworkshop.com/war-atlas-b. |

### Summary

| | Claude (A) | Codex (B) |
|---|---|---|
| Time from prompt to live on qingsworkshop.com | 63 min in one run, including a 3-minute wait for my answer | 76 min elapsed: about an hour of agent work across three runs, plus a 16-minute gap while I was away |
| My messages before the video request | 2: "why would you not ask for the dataset", then the dataset answer | 3: the dataset answer, "resolve the source issues", "pop it on qingsworkshop.com" |
| Events on the map | 103 (all R71 include rows) | 107 (R72, its own amendment of the pack) |
| What happened to the pack's errors | Listed in [`r71-review.md`](a-claude/data/mongol/r71-review.md); the pack itself is left alone | Fixed in a new, validated R72 round, with an [audit](b-codex/data/mongol/r72/mongol-round72-audit.md) |
| Map | MapLibre 3D globe with shaded relief; 103 historical regions with dated control; dashed rings for events the sources only place within a region | Flat SVG map (Mercator projection) drawn from `world-atlas` coastlines, with generalised interpretive territory overlays and 38 locality markers |
| Subagents | 3 (event research by period) | 4 (early research, pack audit, enrichment, merge research) |

### Cost

These figures are what the tokens logged by each session would cost at list API prices, not what I was actually billed. They include subagents.

| Price per 1M tokens | Input | Cached input | Cache write | Output |
|---|---|---|---|---|
| Claude Opus 5.5 | $4 | $0.20 | $5 (5 min) / $8 (1 h) | $20 |
| GPT-6 Sol | $2 | $0.20 | $2.50 (none logged) | $10 |

No Codex request exceeded the 272k-token threshold that doubles GPT-6 Sol prices.

The cost is split into the real build and two kinds of work that turned out to be superfluous.

| Phase | Claude (A) | Codex (B) |
|---|---|---|
| **Before the data arrived** (until 00:39) | **$8.26.** Hunting for the Drive tarball, plus $5.13 for three subagents writing their own event dataset. These subagents were redirected onto the pack's rows, so some of their research carried over. The region scaffolding built in this phase was kept. | **$2.82.** A complete first version with 36 self-researched events, published to github.io. The app shell and map were kept; the events and campaign routes were later replaced. |
| **The build proper**, from the data arriving to live on qingsworkshop.com | **$17.73** | **$6.25**, including the R72 amendment and the homepage deploy |
| **Video attempts** | **$3.53**, and no video came out | **$0.44** |
| **Total** | **$29.52** | **$9.51** |

In output tokens, Claude produced 593k (391k of them from its research subagents) and Codex 144k. Claude read 54.4M cached input tokens and Codex 32.9M.

## The video wild goose chase

At 01:23 and 01:29 I asked each agent for a video for Twitter.

**Claude** decided that screen-recording headless Chromium would look choppy because WebGL renders in software at a few frames a second. It built a deterministic frame renderer instead: it steps the clock and camera one frame at a time and screenshots each one, 1,290 frames in total for a 43-second 1080p video. Test frames looked sharp, but each took 6–8 seconds. It ran four headless browsers in parallel; one died when the container hit its 512-process limit. With about 90 minutes to go, it sat in a blocking wait. Between 01:51 and 01:53 I told it I didn't want to wait 90 minutes, that it didn't need 1080p, that it was for Twitter, and that the other thread had recorded its video really fast. None of these reached it. Claude Code passes a mid-run message to the model only when a tool call returns, and Claude was inside a single polling command that could run for up to 10 minutes. I aborted it at 01:56, which killed that command, and the four queued messages were dropped. T3 recorded them, but Claude's own log has no trace of them. It then hit its session limit, which didn't reset until 04:50. The render kept going in the background until about 03:20, but the frames were never stitched into a video.

**Codex** recorded a 24-second 1280×720 walkthrough in about two and a half minutes and published it as a [release asset](https://github.com/qingsworkshop/atlas-of-empires/releases/download/war-atlas-b-r72/war-atlas-b-twitter.mp4).

In the end I took screen recordings of both on my phone, because it was simple and consistent. They're in the [Twitter thread](https://x.com/YanqingCheng/status/2102566466121797767).

## Reproducing the run

- [`original-repo/`](original-repo/) is the source repo exactly as the agents first saw it: only `INTENT.md`.
- [`data/`](data/) is the Mongol research pack exactly as PR #1 added it at 00:38. It contains the original tarball, the unpacked R71 files, the checksum manifest and the pack's own validators. Run `cd data/mongol/r71 && sha256sum -c mongol-round71-manifest.sha256` to check it.

To rerun the comparison:

1. Put `original-repo/` in a fresh repo of your own.
2. Give each agent the prompt above, with your repo's URL and your own deploy target.
3. Decide whether to add `data/` up front or partway through. Adding it up front gives a fair clean run. Adding it after about 20 minutes replays my evening.

## Running either entry

Each folder is a standalone Vite + React app with its own README:

```sh
cd a-claude   # or b-codex
npm ci
npm run dev
```

Entry A's built geography is committed under `public/geo/`, and its README explains how to rebuild it from Natural Earth. The deployment sections in each README describe my own hosting and are kept as the agents wrote them.

## After the competition: more wars

[`atlas/`](atlas/) is a later version of entry A with two more wars: the Napoleonic Wars (1792–1815) and the First World War (1914–1918). It opens on a start screen where you choose a war. It was built after the competition, so `a-claude/` and `b-codex/` are left exactly as they were entered. Its README explains how the new data was made.

## About this repo

- `a-claude/` and `b-codex/` are imported with their full git histories, so `git log -- a-claude` shows how A was built, commit by commit.
- Code is MIT-licensed (see [LICENSE](LICENSE)). The research pack cites translations whose copyright is unresolved; it contains citations only, not quotations.

This README was drafted by Claude Opus 5.5, which is also entry A, working from both agents' session logs at my request. The times, prompts and token counts come directly from those logs and from T3's message history. T3's history is how we found the messages above that never reached Claude.
