# Beyond the Prompt

Three interactive slides for a five-minute talk:

1. **What an agent is:** the original chatbot versus agent room-finding demonstration, with its Observe → Plan → Act → Check diagram and action log.
2. **Scorers and rewards:** the original two-choice delivery simulation. Run 20 rounds to compare actually delivering the package with merely marking it delivered; switch between rewarding the status and verifying delivery.
3. **The Hugging Face incident:** step through the challenge, unauthorized message board, internet-connected cloud app, intrusion, evaluation gaming, and response.

## Run

```bash
npm run dev
```

Open **http://127.0.0.1:5173**. Python 3 serves the site; no dependencies or API keys are needed. Opening `docs/index.html` directly also works.

## Present

Slides fill the screen without branding, enclosing borders, or a footer. Use the edge arrows or **left/right arrow keys** to switch slides. Each slide has its own interactive controls. **Space** plays or pauses the agent/incident demonstration, or runs 20 training rounds, when a button or form control does not have focus. **F** toggles fullscreen. **S** opens sources. **N** opens speaker notes with timings and demo cues. Notes appear on the same screen and can be downloaded as text.

The training visualization uses a small policy update based on reward minus effort. It is an educational simulation, not real OpenAI training or performance data. The incident sources and differing interpretations are available with **S**.

## Check

```bash
npm run check
```

The implementation is self-contained in `docs/`. GitHub Pages publishes this directory from the `main` branch; `.nojekyll` serves the files as plain HTML, CSS, and JavaScript. Visual storytelling is inspired by arXivisual; no application code or assets were copied.
