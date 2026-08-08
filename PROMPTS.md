# AI Usage Log (Vibe-Coding Prompts)

This document serves as the AI-usage log and prompt history for the creation of **PROJECT: ADA (Advanced Defense Agent)**, demonstrating how the project was built entirely through agentic "vibe-coding".

## Phase 1: Conceptualization and Scaffolding
- **Initial Prompt**: "Create a Next.js/Vite React application for an autonomous AI security agent. I want it to have a dark-mode cyber aesthetic, glassmorphism, and a masonry layout for the feed."
- **AI Action**: Scaffolded the initial React (Vite) frontend with Tailwind CSS and Framer Motion. Set up the Express.js backend for Server-Sent Events (SSE).
- **Prompt**: "The agent needs to operate in a continuous loop. Create a backend simulation engine that scans academic papers, scores them using a confidence algorithm (CVSS, citations, tier-1 venues), and broadcasts the results."
- **AI Action**: Wrote the internal cognitive loop in `server.js` using `setInterval`, `broadcastUpdate` for SSE, and an algorithmic scoring matrix.

## Phase 2: UI/UX Refinement
- **Prompt**: "The UI looks a bit plain. Add a 'Belief Ledger' sidebar that tracks the agent's internal worldview, and a 'Near-Miss Log' for intelligence that didn't meet the threshold."
- **AI Action**: Generated `BeliefLedger.jsx` and `NearMissLog.jsx`. Implemented dynamic progress bars and radar chart concepts.
- **Prompt**: "The background is too static. Make it feel alive. Add a looping cyberpunk or neural network background video with a dark overlay so the text is still readable."
- **AI Action**: Added a fixed `video` element to the root layout, fixed absolute positioning bugs, and implemented a CSS-based opacity fade-in to prevent flashing.
- **Prompt**: "The layout breaks on mobile. Make the masonry grid responsive and hide the sidebars on small screens."
- **AI Action**: Updated Tailwind grid classes (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`) and added `hidden xl:block` to the sidebars.

## Phase 3: Deployment & Infrastructure Debugging
- **Prompt**: "Deploy the frontend to Vercel and the backend to Railway. The backend keeps failing with a 'cd not found' error during the Nixpacks build."
- **AI Action**: Investigated the Railway builder logs. Diagnosed a conflict with an old `render.yaml` start command. Removed `render.yaml` and implemented a zero-config root `package.json` with a custom `postinstall` script to seamlessly build the monorepo on Railway without manual dashboard configuration.
- **Prompt**: "The frontend deployed on Vercel is trying to fetch from a relative URL instead of the Railway backend."
- **AI Action**: Instructed the user to inject the `VITE_API_URL` environment variable in the Vercel dashboard and prepend `https://` to ensure correct cross-origin requests.

## Phase 4: Final Polish
- **Prompt**: "Remove gif thats not good add somthin better and professional may be about what we made larp as much as u can"
- **AI Action**: Used AI image generation tools to render an ultra-modern 4K cyber-security dashboard banner. Rewrote the `README.md` using extensive roleplay/LARP terminology ("weaponized cognitive entity", "zero-latency SSE pipeline", "synaptic updates") and added a Mermaid architecture diagram.

---
*This project was built iteratively using an advanced AI coding assistant, verifying the 'vibe-coded' methodology required for submission.*
