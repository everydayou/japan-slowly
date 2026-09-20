# Japan Slowly

A spoiler-light, installable web experience for a 3-person Japan trip (25 Sep – 4 Oct 2026). One traveller plans; the other two should discover each day progressively instead of reading the full itinerary up front.

**Live app (all 10 days, Explorer Mode + Guide Mode):**
https://everydayou.github.io/japan-slowly/

This repo exists so a fresh chat (Claude, ChatGPT, whichever) can pick up this project with full context, per the product concept's own preferred workflow: *Planner → chat → GitHub → published trip data → travellers' phones.*

## Start here in a new chat

**Read `PROJECT-CONTEXT.txt` first, every time** (it is short and current; the long design contract and old per-round detail moved to `DESIGN-CONTRACT.txt` in Round 43). It's a short, always-current snapshot — quick status, the fixed design/interaction decisions you shouldn't casually redo, current scope, and a prioritized list of known gaps — kept up to date every round specifically so a new chat doesn't need this README or the full history to get moving. `CHANGELOG.txt` is the detailed round-by-round archive behind it; read it only when you need the "why" behind something older than the last round or two. This split (snapshot vs. archive) mirrors the workflow already used on the user's other project ("leve") — keep using it going forward: update PROJECT-CONTEXT.txt's status/gaps every round, and append a new dated round to CHANGELOG.txt rather than editing history.

The rest of this README is the slower, human-facing version of the same information, for anyone who wants the fuller picture without diving into PROJECT-CONTEXT.txt's terser format.

> We're building **Japan Slowly**, a lightweight PWA for a 3-person Japan trip (25 Sep–4 Oct 2026). One traveller is the planner; his father and brother should experience the itinerary progressively and be surprised by what comes next. It should feel like a cinematic travel guide — not a checklist, dashboard, or game.
>
> **Core principle:** reveal the requirements before revealing the experience. A day can say how early it starts, energy/walking level, outdoor time, weather, what to wear/bring, and wake-up/leave time — without naming the destination.
>
> **Two modes:** Explorer Mode (father/brother — future days locked, progressive chapter reveals, optional "About this place" context after arrival) and Guide Mode (planner — full itinerary, exact logistics, manual reveal/skip/undo controls; not primarily a CMS, still unbuilt).
>
> **Status (2026-09-20):** Explorer Mode is built end to end: all 10 days as swipeable chapter cards, a hidden Day 11 "copenhagen" card, 4 stays, real date/time locks (a day opens at 00:00 Japan time), live weather (Open-Meteo, cached for offline), and an installable offline PWA. Guide Mode exists as a personal override (triple-tap the date line or a day title): it opens days one at a time and shows guide-only notes. The Trains tab and location-based unlocking were dropped. The content-publishing pipeline is still unbuilt. **`PROJECT-CONTEXT.txt` (its CURRENT STATE block) is the source of truth; the sections below are older background.**

Full product concept: `docs/Japan Slowly - Product Concept v2.docx` (includes an even more detailed zero-context brief in its Appendix A). Trip logistics/content source: `docs/Japan Day-by-Day Itinerary (Current).docx`.

## What's built

- **Home screen ("the reel"):** a draggable card stack of all 10 days. Cards fan out at a slight, deterministic per-card tilt (1–3°); dragging browses between days; tapping the front card opens it.
- **Open/close transition:** tapping a card flips it in place while it grows to fill the screen (a combined 3D flip + FLIP-technique box-morph, not a CSS `scale`, so text/photo proportions stay correct). Closing is the true reverse: unflip while shrinking back into the exact deck slot it came from. While one card is open, the rest of the deck visibly gathers into a tidy, square, untilted stack, then spreads back into its natural fan as the card lands — this masks the fact that a rotated card can't gracefully unrotate into a tilted slot on its own.
- **Day 1** and **Day 2 ("Lost in Translation")** full detail screens: weather-informed prep card (energy/walking/outdoor/dress/bring/first-move), progressive chapter reveal (hidden → on the way → revealed) with a manual "We're here" location-check trigger, an expandable "About this place" per chapter, and a "Tomorrow" wake-up/leave teaser that doesn't name the destination. Day 2's card carries a real photo (user-supplied, embedded as a base64 JPEG); other days use a generated gradient placeholder.
- **Locked-day treatment:** grayscale + blur + darkened hero image, hidden title, visible date + teaser.
- **PWA basics:** `manifest.json` + `icon-512.png` + the meta/link tags needed to "Add to Home Screen" and launch full-screen like an installed app. The outer "gallery" chrome (title/description header, decorative side dots, phone-bezel mockup) has been stripped so the page is just the app, edge to edge — it used to simulate a phone for demo purposes, which no longer made sense once it could be installed as one.
- **All content and state is hardcoded/in-memory in `index.html`** — there is no backend, no real weather API, and no persistence across page reloads. This is a click-through prototype, not the production build.

### Known-fixed animation bugs (for context, not action)
Three real bugs were found and fixed during prototyping, in case similar symptoms resurface:
1. A locked card's corner radius wasn't clipping correctly — a Chromium quirk where `overflow:hidden` + `border-radius` doesn't reliably clip a `filter`-bearing descendant inside a `preserve-3d` (flip) ancestor. Fixed with `clip-path` instead of `overflow:hidden`.
2. The closing card's transient animation element didn't carry the `active` status class, so its "in progress" pill stayed dim for the whole close animation and only snapped to its real color the instant the animation finished — reading as a jump/pop.
3. The close animation ended by destroying the just-landed card and rebuilding the whole screen from scratch (`render()`), which replaced a continuously-animated element with a freshly-laid-out one at (very slightly) different subpixel rounding — a one-frame "shimmer" across the whole card. Fixed by folding the animated element directly into the deck as the permanent card instead of discarding and recreating it.

**Note:** a "jump" that appeared to persist after all three fixes turned out to be a rendering quirk specific to Safari inside the claude.ai chat's in-app preview webview — confirmed fine in real Chrome and in standalone Safari. Not a real bug; don't chase it again without reproducing it in an actual browser first.

## What's not built yet

Everything else in the product concept, notably:
- Guide Mode (the planner's private operational view) — not started at all.
- Days 3–10 — only Day 1 and Day 2 are prototyped, deliberately (they test the two most different patterns: operational arrival/setup vs. cinematic nightlife progression). Once these two feel right, the plan is to scale the same content model to the rest.
- A real weather API (currently static demo data).
- The GitHub-based content-publishing pipeline itself (this repo is step one of that).
- Any persistence of chapter-reveal state (currently resets on reload).
- Everything under "Open questions" below.

## Open questions (from the product concept, still unresolved)

Final day titles · teaser tone (cryptic vs. descriptive) · exact daily unlock time · which unlock rule (date/time/sequence/location/manual) per chapter · weather provider · exact publishing workflow and whether an AI assistant gets write access · Guide Mode access protection (PIN? gesture?) · external maps vs. an in-app route view · local-only vs. synced reveal-state across the three devices · whether the journal (past days) later supports photos/notes · what happens if a device is offline through a plan change.

## Files

```
index.html    the entire prototype -- HTML/CSS/JS, no build step, no dependencies
manifest.json PWA manifest (name, icons, theme color, standalone display)
icon-512.png  home-screen icon
docs/         the source product concept + current itinerary (.docx)
```

## Running it

There's no build step. Either:
- Open `index.html` directly in a browser, or
- Serve the folder locally (e.g. `npx serve .`) if you want to test the "Add to Home Screen" / PWA install flow, which generally needs `http://` or `https://`, not `file://`.

To publish updates as a shareable link (what's currently live at the Claude Artifact URL above), this has been done via Claude's Artifact tool rather than real hosting — GitHub Pages against this repo would be a natural next step if a persistent public URL independent of Claude is wanted.
