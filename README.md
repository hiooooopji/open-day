# Future / Lab

A glass-style 3D topic carousel based on the supplied `computer project.html`. Each card opens a full-screen simulation directly. Published at **https://hiooooopji.github.io/open-day/**.

1. **What an agent is:** the original chatbot versus agent room-finding demonstration, with its Observe → Plan → Act → Check diagram and action log.
2. **Scorers and rewards:** the original two-choice delivery simulation. Run 20 rounds to compare actually delivering the package with merely marking it delivered; switch between rewarding the status and verifying delivery.
3. **The Hugging Face incident:** step through the challenge, unauthorized message board, internet-connected cloud app, intrusion, evaluation gaming, and response.
4. **Quantum computing:** apply H, X, and Z gates to a qubit, compare interference circuits, collapse its state with a measurement, or sample 100 identical preparations.
5. **Robotics:** edit a grid world, set a destination, and watch a robot sense local obstacles and replan its route. Blocked robots stop safely.

## Run

```bash
npm run dev
```

Open **http://127.0.0.1:5173**. Python 3 serves the site; no dependencies or API keys are needed. Opening `docs/index.html` directly also works.

## Present

Use the carousel arrows, topic dots, or **left/right arrow keys** to choose a card. Click the active card to open its simulation. Touch users can swipe between cards. The **Topics** link or **Escape** returns to the selected card.

Inside a simulation, edge arrows and **left/right arrow keys** navigate between the five topics. Each has its own controls. **Space** runs the current demo (or measures the qubit) when a button or form control does not have focus. Arrow keys inside the robot grid move between cells; Enter edits a cell. **F** toggles fullscreen, **S** opens sources, and **N** opens speaker notes. Notes appear on the same screen and can be downloaded. The original three-topic talk is about five minutes; quantum and robotics have separate extension notes.

The training visualization uses a small policy update based on reward minus effort. It is an educational simulation, not real OpenAI training or performance data. The incident sources and differing interpretations are available with **S**.

The quantum model calculates an ideal single qubit using real amplitudes and H/X/Z gates. Its vector diagram is an amplitude-space view, not a physical orbit or full Bloch sphere. “Sample 100 copies” measures independently prepared states without collapsing the displayed preparation; “Measure once” collapses it. The robotics model uses a two-cell Manhattan sensing radius and breadth-first shortest-path planning over known obstacles; it deliberately simplifies real sensing and motor control.

## Check

```bash
npm run check
```

The checks cover syntax and quantum/robotics behavior: interference, normalization, measurement, independent samples, obstacle avoidance, replanning, blocked routes, and local sensing.

The implementation is self-contained in `docs/`. `index.html` and `carousel.js` implement the supplied carousel design; `simulations.html` contains the five labs. The pure models in `lab-models.js` are shared by the browser and automated checks. GitHub Pages publishes `docs/` from `main`; `.nojekyll` serves plain HTML, CSS, and JavaScript. The original AI diagrams were inspired by arXivisual.
