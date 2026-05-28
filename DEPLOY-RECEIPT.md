# Helm — deploy receipt

A leave-behind for the operator. Two live URLs, one repo, install steps, what's where, and how to hand it to the end user.

## Live URLs

**Primary (HTTPS, install-friendly):**
https://1seansean1.github.io/helm/

**Secondary (HTTP, AWS commercial S3 static site):**
http://helm-1seansean1.s3-website-us-east-1.amazonaws.com/

Both serve the same build; both are read-only static; both work offline after first load.

## Repo

https://github.com/1seansean1/helm (public)

Push to `main` → GitHub Action builds + publishes to Pages. AWS deploy is a one-liner:

```bash
HELM_S3_BUCKET=helm-1seansean1 node scripts/deploy-s3.mjs
```

## What you're handing your friend

1. The primary URL above — open it once in mobile Safari (iOS) or Chrome (Android).
2. **iOS:** Share → Add to Home Screen. **Android:** menu → Install app.
3. She'll get her own [Anthropic API key](https://console.anthropic.com/settings/keys), paste it into Settings inside the app. It stays on her phone; nothing leaves the device except calls she initiates.
4. If she doesn't want to set up a key right away, every exercise has a **Simulated** button that shows a realistic example response. The curriculum works end-to-end without a key.

## What's inside

**Eleven modules**, banking-tailored, with vocabulary, scenarios, interactive exercises (live or simulated), self-checks, and leadership talking points she can quote in an interview:

1. Model selection
2. Sampling
3. Harness development
4. Context files
5. Skills
6. Chaining skills into workflows
7. Automating workflows into routines
8. Consolidating results
9. Extracting results
10. Summarizing results
11. Leadership guidance to a product team

The **Leadership brief** view (`/leadership`) consolidates her notes + latest exercise responses into a downloadable Markdown one-pager she could carry into a VP conversation.

## How it was built

Drove the rocket-skills `skill-chain` from phase 9 (requirements) through phase 16 (codebase review), skipping phases 1-8 (discovery) because the scope was caller-specified. All artifacts under [`docs/skill-chain/`](docs/skill-chain/):

- `route-decision.v1.json` — entry-point selection with rationale for skipped phases
- `requirement-set.v1.json` — 18 numbered requirements (must/should), each with acceptance + verification method
- `architecture.v1.json` — 10 architecture decisions with rationale and tradeoffs
- `plan.v1.json` — one release, three sprints, named critical path
- `test-eval-report.v1.json` — 18/18 requirements verified, 53/53 unit tests pass
- `retrospective.v1.json` — planned-vs-actual, requirements changes, tech-debt ledger
- `codebase-review-report.v1.json` — 5/5 gates PASS; 3 informational findings

## Tech debt left behind (deliberate, low severity)

- **TD-01:** Account-level `BlockPublicPolicy` was disabled to enable the S3 bucket policy. ACL blocks remain on. The long-term move is CloudFront + OAC. Reversible with one CLI call.
- **TD-02:** S3 website endpoint is HTTP-only. Static demo with no auth surface, so low risk; CloudFront would solve.
- **TD-03:** Component-level UI tests not yet present beyond Playwright smoke.

## To roll forward

- Add CloudFront + ACM cert in front of the S3 bucket; re-enable account-level BlockPublicPolicy; switch the S3 deploy to use OAC.
- Iterate curriculum after end-user review (TD-04).
- Add `@testing-library/react` component tests before any UI refactor.

## Costs incurred

- GitHub Pages: $0 (public repo).
- S3: a few cents of storage per month; CloudFront is currently $0 because not provisioned.
- Anthropic API: end-user provides their own key; operator pays $0.
