# kalenday-e2e

End-to-end and smoke tests for [kalenday.com](https://kalenday.com), run with
[Playwright](https://playwright.dev) against the deployed site.

Kalenday is an AI communication platform — agents that answer, qualify and book
customers across WhatsApp, Instagram, email and SMS. It is a client-rendered
single-page app, which shapes what is worth testing here.

## Running

```bash
npm install
npx playwright install chromium webkit
npm test
```

Point the suite at another deployment with `BASE_URL`:

```bash
BASE_URL=https://staging.kalenday.com npm test
```

Useful during development:

```bash
npm run test:ui       # watch mode with a time-travel debugger
npm run test:headed   # see the browser
npm run codegen       # record selectors against the live site
```

## What is covered

| Spec | What it protects |
|---|---|
| `smoke.spec.ts` | The document serves, the bundle mounts into `#root`, an `h1` renders, the favicon resolves, and nothing errors in the console or fails a request on load. |
| `seo.spec.ts` | The crawler-visible layer: parseable JSON-LD, the `<noscript>` fallback, and metadata that survives with JavaScript disabled. A client-rendered app loses all of this silently. |
| `routing.spec.ts` | Unknown-route behaviour. See the known issue below. |
| `responsive.spec.ts` | No horizontal overflow at 375, 390 and 768 px, and a viewport meta that allows scaling. |
| `auth.spec.ts` | Sign-in flows. Currently `fixme` — selectors are not recorded yet, and the suite skips entirely without credentials. |

Specs run on Chromium, WebKit and an emulated iPhone 13.

## Known issue: unknown routes answer 200

The app is served through a catch-all, so every path returns `index.html` with
status 200 — `/this-page-does-not-exist` included. Two consequences:

- Search engines can index URLs that have no content.
- Uptime and error monitoring watching for 404s never fires.

`routing.spec.ts` asserts the **current** behaviour rather than the correct
one, with a `known issue` annotation, so that fixing it fails the test loudly
instead of passing unnoticed. The fix is a 404 status for unmatched routes, or
a not-found view carrying `<meta name="robots" content="noindex">`.

## Credentials

Authenticated tests read `KALENDAY_EMAIL` and `KALENDAY_PASSWORD` from the
environment and skip when they are absent. Nothing is committed, and these
should point at a throwaway account, never a customer's.

## Conventions

- No `waitForTimeout`. Every wait is a web-first assertion (`expect(locator)`),
  which retries until the condition holds or the timeout expires.
- Role- and label-based locators over CSS selectors, so a class rename does not
  break a test.
- Traces on first retry only — enough to debug a CI failure without slowing
  the normal run.

## Running WebKit locally

`npx playwright install --with-deps` assumes a Debian/Ubuntu host. On Arch and
other non-apt distributions WebKit needs `icu`, `libxml2` and `flite` installed
through the system package manager; without them the `webkit` and `mobile`
projects fail to launch while `chromium` runs normally:

```bash
npx playwright test --project=chromium
```

CI installs the dependencies itself and runs the full matrix.
