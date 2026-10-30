# Future / Lab

An exact copy of **https://emergingtrends.netlify.app/**, published at **https://hiooooopji.github.io/open-day/**.

The homepage and all five dedicated labs were downloaded from the original site on October 30, 2026. Their HTML, CSS, JavaScript, text, and inline artwork are preserved byte for byte. All links already use relative paths, so no hosting changes were needed.

## Pages

- `docs/index.html` — original glass carousel, topic details, and simulation hub
- `docs/simulations/agentic.html` — Agentic AI
- `docs/simulations/generative.html` — Generative AI
- `docs/simulations/cyber.html` — Cybersecurity
- `docs/simulations/quantum.html` — Quantum Computing
- `docs/simulations/robotics.html` — Robotics

The carousel opens topic details; the lab buttons and simulation hub open the original dedicated labs in new tabs. All six pages are self-contained and require no dependencies or API keys.

## Run and check

```bash
npm run dev
npm run check
```

Open **http://127.0.0.1:5173**. The check validates inline JavaScript syntax in the six copied pages. GitHub Pages publishes `docs/` from `main`.

The earlier custom presentation remains in `docs/simulations.html` and its supporting files for future work, but the copied site does not link to it. Its existing checks are available with `npm run check:legacy`.
