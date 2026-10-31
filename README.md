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

## Hugging Face 3D scene

The incident demo uses an interactive WebGL scene with an agent swarm, message tiles, packet routes, an isolation barrier, and a containment sequence. Select timeline stages or click a 3D station to explore the story in the network overview. Drag to orbit and use the camera reset button to restore the view. Play advances the six chapters. Pause motion freezes ambient animation independently of story playback. Reduced-motion preferences start the scene without continuous movement.

The Hidden messages stage animates a message passed through a shared directory: Agent A publishes it through the shared service, and Agent B reads it. A folder and moving note show the exchange directly in the scene.

Use the Fullscreen button in the top-right corner or press F to toggle fullscreen. Escape exits fullscreen before returning to Topics.

`docs/incident-3d.js` and `docs/incident-3d.css` contain this scene. The original SVG diagram remains available automatically when WebGL is unavailable. The scene is a conceptual reconstruction, not a literal infrastructure map. The other four labs retain their existing visuals.

Three.js 0.180.0 is served locally from `docs/vendor/three/`; its MIT license is included there. The 3D view has no runtime CDN requests. `npm run check` also checks the scene module's syntax.
