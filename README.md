# Helm — Frontier AI for product leaders

A coaching companion that takes a product designer or PM in banking / fintech from "I've tried Claude" to "here is our AI product strategy, here are the won'ts, here is who we hire, here is what we buy."

Installable PWA. Bring your own Anthropic API key — everything runs in your browser. No backend, no telemetry, no cost to the publisher.

## The curriculum

Eleven banking-anchored modules:

1. **Model selection** — choosing the right model, not the loudest one.
2. **Sampling** — temperature, top-p, max tokens, and why your compliance team should care.
3. **Harness development** — the runtime that wraps the model, and is most of the product.
4. **Context files** — CLAUDE.md, system prompts, the persistent project knowledge that travels with the model.
5. **Skills** — named, callable procedural knowledge — the unit of reuse.
6. **Chaining skills into workflows** — sequenced, gated, observable.
7. **Automating workflows into routines** — cron, hooks, triggers.
8. **Consolidating results** — many AI runs rolled into one trustworthy artifact.
9. **Extracting results** — structured data out of unstructured outputs.
10. **Summarizing results** — length tiers, faithfulness, drift detection.
11. **Leadership guidance to a product team** — the artifact is the job.

Every module has banking-tailored vocabulary, a worked banking scenario, an interactive exercise (live or simulated), self-check questions, and the leadership talking points you would carry into a product-team readout.

## Use it on your phone

**iOS.** Open the deployed URL in Safari → Share → Add to Home Screen.

**Android.** Open in Chrome → menu → Install app.

After first load it works offline; only the "Run live" and "Refine with Claude" buttons require connectivity.

## Bring your own key

Helm has no backend. To run exercises live against Claude, paste your [Anthropic API key](https://console.anthropic.com/settings/keys) into Settings. The key:

- Is stored only in your browser's `localStorage` under the key `helm.v1.state`.
- Is sent only to `https://api.anthropic.com/v1/messages` on requests you initiate, in the `x-api-key` header, with `anthropic-dangerous-direct-browser-access: true` (the header that authorizes direct browser → Anthropic calls).
- Is deletable in one click from Settings → "Forget key".

If you don't want to set a key yet, every exercise has a **Simulated** button that shows a realistic example response so you can work through all eleven modules end to end.

## Run locally

```bash
npm install
npm run dev         # http://localhost:5173
npm test            # 53 unit tests
npm run build       # static bundle in dist/
npm run preview     # serve dist/ on http://localhost:4173
```

## Deploy

Two deploy targets ship in this repo.

**GitHub Pages (custom Action).** Pushes to `main` build the static bundle with `VITE_BASE=/helm/` and publish to the `gh-pages` branch via `.github/workflows/pages.yml`. After the first push, enable Pages in repo Settings → Pages → "Deploy from branch" → `gh-pages`.

**AWS commercial S3 static site.** Run `node scripts/deploy-s3.mjs` with `AWS_PROFILE` pointed at your commercial account and `HELM_S3_BUCKET` set to the target bucket. The script syncs `dist/` to the bucket with appropriate cache-control headers.

## Project methodology

This app was built via the [Rocket Skills](https://github.com/) skill-chain — a multi-phase product lifecycle that drives requirements → architecture → test design → plan → build → verify → deploy. The artifacts that drove the build live under [`docs/skill-chain/`](docs/skill-chain/) — including the `route-decision.v1`, `requirement-set.v1` (18 numbered requirements), `architecture.v1` (10 architecture decisions), and `plan.v1` (one release, three sprints).

## FAQ

**Why this name?**
At the helm of a ship, you don't have to be the engine — you have to know where you're going and how to use the engine you have.

**Why banking-tailored?**
Generic AI-product content is everywhere. The thing nobody is teaching is how to lead AI inside a regulated, risk-averse, fiduciary institution. That's where the senior roles are; that's where the language matters.

**Why a PWA and not a native app?**
PWAs install once, work offline, update silently, run on iOS and Android, and require zero app-store gatekeeping. For a personal learning companion that respects your privacy, this is the right shape.

**Is there a server?**
No. There is no server. Read the source — `src/lib/anthropic.ts` is the only network surface, and it only ever talks to `api.anthropic.com`.

## License

MIT.
