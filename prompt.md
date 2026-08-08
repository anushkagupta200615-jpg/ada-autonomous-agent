# ADA Implementation Prompts

The following prompts were used to construct and harden the ADA Autonomous Agent system.

## Prompt 1: Enhance the Existing ADA README.md

```markdown
# Prompt for Antigravity — Enhance the Existing ADA README.md

Paste into Antigravity, pointed at the repo. This is an enhancement pass on the CURRENT README.md — keep the existing "Classified/Cognitive Entity" voice, banner image, emoji-section style, and Mermaid diagram exactly as they are. Do not rewrite the tone. Only ADD the missing sections below and fix the specific gaps listed, in the same voice as the existing copy.

---

You're editing the existing README.md for PROJECT: ADA. The current README already has: a banner image, live Vercel/Railway badges, an Overview section, a Classified Core Subsystems feature list, a Tactical Tech Stack table, a Mermaid architecture diagram, and Local Terminal Initiation instructions. Preserve all of this. Add the following, matching the existing "classified/cognitive entity" voice and emoji-heading style:

## 1. Add a hero demo GIF immediately after the banner image, before "OVERVIEW"

Record a 10-15 second screen capture showing: landing page -> "Initialize Core" -> wait for one autonomous topic to appear in the feed -> click the topic to expand its rationale. Save it as `demo.gif` in the root folder, and embed it right below the banner image.

## 2. Add an "? ARCHITECTURE (COGNITIVE ENGINE)" section above the Tech Stack

Create a bulleted list breaking down the internal logic loop (this must map 1:1 to the actual logic in `server.js`):
- Signal Discovery (Simulated RSS/Social scraping)
- Multi-Hop Triangulation (Cross-referencing papers/APIs)
- Editorial Self-Critique (Voice/Consistency checks)
- Publish vs. Hold/Reject Decision Gate

## 3. Add a "? COMPLIANCE MATRIX" table below the Core Subsystems

Create a two-column markdown table checking off the hackathon rubric requirements. Use exact phrases from the rubric and map them to ADA's features:
- Autonomy -> cite the continuous loop (No human-in-the-loop)
- State/Memory -> cite the SQLite `beliefs` and `history` tables
- Consistent Persona -> cite the belief ledger
- Memory -> cite Breeth MCP long-term memory
- Autonomous Publishing -> cite the autonomous loop engine + cadence
- Publishing Rationale -> show one REAL sample JSON response from the live `/api/agent/feed` endpoint (pull an actual response, don't fabricate)

## 4. Add a "? API TRANSMISSION PROTOCOL" section with real request/response examples

After the architecture diagram, add the actual `POST /api/agent/init` and `GET /api/agent/feed` request/response shapes as code blocks, pulled from the real deployed API (fetch the live Railway endpoint and copy actual output), not placeholder JSON. List any bonus endpoints (rejections/memory/near-miss logs) here too if they're queryable.

## 5. Add a short "? SELF-DIAGNOSTIC / KNOWN LIMITATIONS" section near the end, before the closing quote

2-3 honest, in-voice bullets about current scope limits (e.g. source coverage, refresh cadence, anything not yet implemented). This is intentional — a project that shows awareness of its own edges reads as more credible to evaluators than one claiming total completeness.

## 6. Clean up repo root before judges browse files

Root currently has loose one-off scripts (`fix.js`, `fix_newsfeed.js`, `fix_newsfeed2.js`, `fix_video_loop.js`, `update_client.py`, `update_server.py`) sitting next to README/Dockerfile/package.json. Move these into a `/scripts/` or `/dev-tools/` folder (or delete if obsolete) — a judge browsing the file tree seeing five "fix_" scripts at root reads as unpolished, regardless of README quality.

## Style rules for all additions
- Match existing voice exactly (e.g. "Cognitive Core," "Synaptic," "Neural," "Classified") — don't shift into generic corporate README tone
- Every new claim must be backed by something concrete pulled from the actual deployed system, not invented
- Keep new sections as tight as the existing ones — short paragraphs, tables, code blocks over prose walls
```

---

## Prompt 2: Final Depth & Reliability Pass on ADA

```markdown
# Prompt for Antigravity — Final Depth & Reliability Pass on ADA

Paste into Antigravity, pointed at the `ada-autonomous-agent` repo (Node/Express + React/Vite/Tailwind/Framer Motion, Railway backend, Vercel frontend, Breeth MCP memory). This is the final hardening pass before hackathon submission — implement everything below without breaking existing functionality, UI, or the retro "cognitive entity" branding already in place.

---

You are finishing PROJECT: ADA for hackathon evaluation. The judges will call `POST /api/agent/init` once, then poll `GET /api/agent/feed` repeatedly over ~48 hours with zero further human input. Every item below exists to make the system survive that window convincingly and to make its internal reasoning provably real, not just narrated. Implement in the order given.

## SECTION A — Reliability for the unattended 48-hour window

1. Add a `/api/agent/status` endpoint returning `{ uptime, lastCycleAt, nextCycleAt, cycleCount, lastError }` — this turns "trust me it's running" into something machine-checkable.
2. Add structured error logging around every discovery/scoring/publish step (try/catch with a persisted `error_log` table: timestamp, stage, message). If a cycle fails, it should be visible in status, not silent.
3. Ensure the scheduler survives process restarts — on boot, check `lastCycleAt` from the DB and resume the loop instead of resetting cadence from zero.
4. Add lightweight rate limiting on public GET endpoints (e.g. 1 req/sec per IP) so repeated evaluator polling — or anyone else — can't exhaust discovery API quotas or crash the process.
5. Add a `/api/health` lightweight endpoint (just `{ ok: true }`) suitable for an external uptime pinger (UptimeRobot / cron-job.org) to hit every 10-15 minutes, specifically to prevent Railway free-tier sleep during the evaluation window. Document this setup step in the README under a new "◇ OPERATIONAL READINESS" section.
6. Add graceful degradation: if one discovery source fails or rate-limits, log it, skip that source for the current cycle only, and continue — never let one bad source halt the whole loop.

## SECTION B — Prove the reasoning is real, not narrated

7. Write unit tests (Jest or similar, put in `/server/tests/`) for the scoring rubric covering: (a) single-source low-tier topic -> held, not published; (b) duplicate/near-duplicate of a recently published topic -> rejected; (c) stale event with high recency-decay -> scored below threshold; (d) high-tier multi-source topic -> published. Add an npm script (`npm test`) and reference it in the README.
8. Persist and expose the full scoring breakdown (not just final verdict) for every candidate topic each cycle — recency score, specificity score, source-tier score, novelty score, final weighted score — via the existing `/rejections` or `/memory` endpoint. This is the single highest-leverage addition for "quality of editorial decision-making" since it lets judges audit the math, not just read a claim.
9. For every published post, persist and expose the 1-2 runner-up candidates from that same cycle that scored lower, with their scores and rejection reason — directly satisfies the brief's "why chosen over other candidates" language in the rationale requirement.

## SECTION C — Content quality guardrails

10. Add a topic-relevance filter: reject/hold any candidate whose extracted entities don't map to the AI-security domain (LLM, model, prompt, exploit, CVE, agent, RAG, etc. — build a simple keyword/embedding relevance check), so a noisy source feed can't drag the persona into generic tech news.
11. Cap publish frequency (e.g. max N posts/hour) so a burst of similar stories from one source can't flood the feed and make editorial judgment look indiscriminate.
12. Add contradiction handling: if two sources disagree on a technical detail for the same topic, either resolve with a stated reason in the rationale or explicitly flag the uncertainty rather than silently picking one — persist which case occurred per post for audit purposes.

## SECTION D — Depth additions that read as "worked on this a lot"

13. Add a retraction/correction flow: if a later cycle finds information contradicting an earlier published post, generate an explicit follow-up post that references and corrects the original (`correctsPostId` field), rather than silently updating history.
14. Add topic lineage: when a post follows up on an earlier one, store `continuesFrom: postId` and expose it via the API; surface it in the UI as a visible thread link (this may already partially exist per prior screenshots — confirm it's wired to real data, not just a UI label).
15. Add a discovery funnel snapshot per cycle (scanned/held/rejected/published counts) persisted historically, not just live — enables a simple trend chart over the 48-hour window showing editorial activity over time.

## SECTION E — Final submission checklist (verify, don't just implement)

16. Confirm `createdAt` on every post is genuine ISO 8601 UTC format.
17. Do one full clean end-to-end test: call `/api/agent/init` with a fresh persona, let it run untouched, confirm posts appear autonomously with correct ordering (reverse chronological), persistence across polls, and no duplicate ids.
18. Confirm mobile responsiveness of the dashboard/feed pages at common breakpoints (390px, 768px, 1024px+).
19. Update the README's "◇ COMPLIANCE MATRIX" / feature sections to reference these new capabilities (status endpoint, scoring transparency, runner-up exposure, retraction flow, tests) so the depth of work is visible to a judge skimming the repo, not just discoverable by digging into code.

## Style rules
- Preserve all existing branding, UI layout, and voice — this pass is backend depth + reliability + a few justified new API fields/endpoints, not a redesign.
- Every new feature must be backed by real persisted data and a real API field — no cosmetic-only additions in this pass.
```

---

## Prompt 3: Enable Live RSS Intelligence, Multi-Agent Internal Debate, & Dynamic Knowledge Graph

```markdown
# Prompt for Antigravity — Upgrade ADA with Live Intelligence and Multi-Agent Debate

Paste into Antigravity, pointed at the `ada-autonomous-agent` repo. The goal of this prompt is to upgrade ADA from a hardcoded mock environment to a fully live, multi-agent intelligence system.

## 1. Implement Live RSS Feed Ingestion
Currently, ADA loops over a hardcoded `KEYWORD_MAP` of 5 topics. We need to replace this with a live, autonomous intelligence feed:
- Use the `rss-parser` package to fetch The Hacker News feed (`https://feeds.feedburner.com/TheHackersNews`).
- Update the backend so that when ADA boots, she immediately fetches the top 10 live headlines.
- In `scheduleNextTick`, she should autonomously pop one live headline off the list and evaluate it dynamically. If the list is empty, she should fetch fresh headlines again.

## 2. Multi-Agent Internal Debate (Ada vs. Zion)
Before publishing a threat, ADA must critically evaluate it. Introduce a second persona, "Zion" (a skeptical, conservative security analyst).
- Update the `calculateConfidenceScore` logic in `scoring.js` to simulate a debate log array `[{ agent: "Zion", text: "..." }, { agent: "Ada", text: "..." }]`.
- Zion should challenge the CVSS score or source reliability. Ada should defend her rationale.
- Persist this `debateLog` stringified in the SQLite `posts` table alongside the `auditTrail`.
- Update the `GET /api/internal/state` endpoint to parse and return the `debateLog`.

## 3. Frontend Audit UI & Graph Stability
- Update the `PostCard` UI in `NewsFeed.jsx` and `AgentDashboard.jsx` to render the "Internal Agent Debate" log cleanly using monospaced fonts and contrasting colors (emerald for Ada, rose for Zion).
- Add robust fallbacks for live-rss generated metadata (e.g., missing `authors`, `abstract`, `citations`) in the `ResearchPaperCard` so the frontend doesn't crash on live data.
- Fix the `react-force-graph-2d` component in `MemoryGraph.jsx` so it does not zoom to infinity while the physics engine is still initializing. Ensure the graph is highly visible, stable, and includes an overlaid legend.
```

