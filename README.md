# Future / Lab

Based on **https://emergingtrends.netlify.app/**, published at **https://hiooooopji.github.io/open-day/**.

The original site was copied on October 30, 2026. The Cybersecurity topic is now **Cybersecurity in Agentic AI**, and its lab opens our earlier Hugging Face incident simulation. The other four dedicated labs retain their original code and artwork.

## Pages

- `docs/index.html` — original glass carousel, topic details, and simulation hub
- `docs/simulations/agentic.html` — Agentic AI
- `docs/simulations/generative.html` — Generative AI
- `docs/simulations/cyber.html` — redirects to the Hugging Face incident demo
- `docs/simulations/quantum.html` — Quantum Computing
- `docs/simulations/robotics.html` — Robotics

The carousel opens topic details. Both its lab button and the simulation hub open the selected lab in a new tab. The cybersecurity route opens `simulations.html?topic=incident#incident`, showing only the incident timeline. Use Play, Step, Reset, or the left/right keys to explore it; Topics or Escape returns to the renamed card. The site requires no dependencies or API keys.

## Run and check

```bash
npm run dev
npm run check
```

Open **http://127.0.0.1:5173**. The check validates inline JavaScript syntax in the six entry pages and the shared simulation controller. GitHub Pages publishes `docs/` from `main`.

The full earlier custom presentation remains available at `docs/simulations.html`; the cybersecurity route uses its incident-only view. Its existing checks are available with `npm run check:legacy`.
