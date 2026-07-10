# Skills & Competencies Matrix

A per-suite map of what each folder in this portfolio demonstrates: the testing
layer/type it exercises, the tools/stack behind it, and the concrete QA skills it
proves. See the [root README](../README.md) for the "what's inside" overview and
[`architecture.md`](./architecture.md) for how the pieces fit together.

| Suite / Folder | Layer / Type | Tools | Skills demonstrated |
|---|---|---|---|
| [`manual-testing/`](../manual-testing/) | Manual QA — strategy, planning, design, exploratory, defects | Markdown QA docs | Test strategy authorship; feature-level test planning (entry/exit criteria, risk, schedule); test case design (functional / negative / boundary) across checkout, cart & search, account & auth (27 cases); risk-based prioritisation (likelihood × impact register); requirements traceability (RTM linking requirements → manual cases → automated suites, with explicit Covered/Partial/Gap status); session-based exploratory testing (charters with time-boxes and risk focus); structured, reproducible bug reporting (4 filed reports) |
| [`api-postman-newman/`](../api-postman-newman/) | API — collection-based, positive + negative | Postman (Collection v2.1) + Newman + newman-reporter-htmlextra | Designing a Postman collection with inline test scripts; recognising and testing around an API anti-pattern (HTTP 200 on logical errors — asserting on a body-level `responseCode` instead of trusting transport status); environment/variable management; CLI-driven collection runs with HTML reporting; negative-case design (missing params, invalid credentials) |
| [`api-mocha/`](../api-mocha/) | API — code-based, contract testing | Mocha + Chai + axios + ajv + mochawesome | JWT auth flows (login, bearer-protected routes, missing/invalid token); full CRUD (create/read/update/patch/delete) with pagination and search; JSON-Schema (draft-07) contract validation via ajv; designing tests around an API that doesn't persist writes (asserting on request/response contract rather than storage state); shared HTTP client / test-helper design (`helpers/client.js`) |
| [`api-graphql/`](../api-graphql/) | API — GraphQL | Mocha + Chai + axios | Writing GraphQL queries with variables against a live schema; distinguishing GraphQL error semantics (partial `data` + `errors` array vs. transport-level failure) from REST status-code checking; nested-query assertions (multi-level object graphs in a single request); schema/type-level validation; testing a second API paradigm with the same code-based tooling used for REST, showing paradigm-agnostic API-testing fluency |
| [`playwright/`](../playwright/) | UI E2E | Playwright Test + TypeScript, Page Object Model | POM design (one class per page); web-first assertions and auto-waiting (no fixed sleeps); happy-path + negative + boundary UI coverage (login, checkout, checkout validation, sorting, cart, product detail); trace/screenshot-on-failure debugging setup; HTML reporting |
| [`cypress/`](../cypress/) | UI E2E | Cypress + TypeScript, custom commands | Custom command design (`cy.login()`); idiomatic Cypress retry-ability (`should`, no `cy.wait(<ms>)`); same functional/negative coverage as Playwright (login, cart, checkout, sorting, checkout validation, product detail) expressed in a different tool, showing tool-agnostic test design |
| [`selenium-mocha/`](../selenium-mocha/) | UI E2E — classic WebDriver | Selenium WebDriver v4 + Mocha + Chai, headless Chrome | Building a Page Object Model from scratch on raw WebDriver (no framework-provided auto-waiting); explicit-wait discipline (`driver.wait(until....)`); diagnosing and engineering around React-SPA flakiness under headless Chrome (JS-click-with-retry, React-aware `sendKeys` fallback) instead of masking it with sleeps; CI-safe browser configuration; per-test session isolation |
| [`cucumber-bdd/`](../cucumber-bdd/) | BDD | Cucumber.js (Gherkin) + Playwright driver | Writing stakeholder-readable Gherkin (`Feature`/`Scenario`/`Scenario Outline`/`Examples`); clean separation of feature files, step definitions, and a custom `World`; tagging strategy for selective runs (`@smoke`/`@regression`/area tags); data-driven scenarios (sorting, multi-product cart) via `Examples` tables |
| [`mobile-web-playwright/`](../mobile-web-playwright/) | Mobile — device emulation | Playwright device emulation (`devices[...]`) | Multi-project/multi-device test configuration (iPhone 13/WebKit, Pixel 5/Chromium); writing device/engine-agnostic specs that run unchanged across projects; testing observable mobile characteristics (viewport, touch, UA) via standard web APIs rather than engine-specific internals; explicitly documenting the limits of emulation vs. real hardware |
| [`appium-mobile/`](../appium-mobile/) | Mobile — real device / emulator | Appium + WebdriverIO (`@wdio/cli`), Android emulator or BrowserStack Automate | Native mobile test-automation stack (Appium server, device capabilities, UiAutomator2 driver); dual local-emulator / cloud-device-farm configuration sharing one spec; understanding of the mobile-web-vs-native-app testing boundary; secure credential handling (env vars, never committed) for a cloud device-farm integration *(run locally / BrowserStack — not in CI)* |
| [`email-testing/`](../email-testing/) | Email QA | nodemailer + Mailpit (SMTP) + cheerio + Mocha + Chai | Splitting email QA into deterministic offline template checks (DOCTYPE, charset, alt text, links, preheader) vs. live SMTP-integration checks; running a real send → capture → assert loop against a local Mailpit instance; graceful self-skipping (`this.skip()`) when an external dependency is unavailable, instead of a false failure; scoping out of what needs a dedicated paid rendering service (Litmus/Email on Acid) rather than pretending to cover it |
| [`accessibility/`](../accessibility/) | Non-functional — accessibility | Playwright + `@axe-core/playwright` | Automated WCAG 2.0/2.1 A+AA scanning integrated into a UI test run; attaching machine-readable violation data to test reports; a deliberate pass/fail policy (fail only on *new* critical violations, allow-list known third-party defects) that avoids both false confidence and CI noise; understanding the boundary between automatable a11y checks and manual audit judgement calls |
| [`performance/`](../performance/) | Non-functional — performance/load | k6 | Load-profile design (ramp-up/hold/ramp-down virtual users); threshold-based pass/fail (p95 latency, HTTP error rate, a custom business-logic error metric) instead of eyeballing a report; recognising when a tool needs its own runner/binary and deliberately keeping it out of an npm-based CI pipeline rather than forcing a bad fit *(run locally — not in CI)* |
| [`visual-regression/`](../visual-regression/) | Non-functional — visual regression | Playwright `toHaveScreenshot` | Screenshot-baseline diffing with pixel-tolerance tuning (`maxDiffPixelRatio`) and animation-disabling to avoid false positives; understanding and documenting why OS/browser-specific baselines make a suite CI-unsafe without a containerised baseline strategy *(run locally — not in CI)* |
| [`security/`](../security/) | Non-functional — security | Mocha + Chai + axios | Security-header audit (HSTS, `X-Content-Type-Options`, clickjacking protection, `Referrer-Policy`) against a live API, with a deliberate hard-assert (HTTPS, transport reachability) vs. informational-only (header presence) split so third-party header hygiene doesn't add CI noise; access-control testing via the "negative then positive" pattern (unauthenticated request must be rejected, then the same resource must open for a properly authenticated caller) — a real-world slice of OWASP A01 (Broken Access Control) and A07 (Identification & Authentication Failures) |
| [`test-data/`](../test-data/) | Test-data management | @faker-js/faker + Mocha | Synthetic test-data factory design (users, addresses, products, orders) decoupled from any single suite; deterministic seeding for reproducible runs vs. randomised generation for boundary/fuzz-style coverage; data-driven test design that avoids hard-coded fixtures and the privacy/maintenance risk of real-looking PII |

## QA competencies covered

**Manual QA**
Test strategy and feature-level test planning · test case design (functional, negative, boundary) · risk-based test prioritisation · requirements traceability · session-based exploratory testing · structured defect reporting

**UI automation**
Page Object Model (framework-assisted and from-scratch on raw WebDriver) · web-first/explicit waits, zero fixed sleeps · cross-tool functional parity (Playwright / Cypress / Selenium) · flaky-SPA mitigation techniques · HTML/trace reporting and failure artifacts

**API testing**
Collection-based (Postman/Newman) and code-based (Mocha/Chai/axios) approaches across both **REST and GraphQL** · JWT auth · pagination, search, full CRUD · positive + negative cases · JSON-Schema contract validation (ajv) · testing around non-standard API error conventions · GraphQL-specific concerns (queries with variables, `data`/`errors` semantics, null-vs-error distinction, nested/filtered queries, schema validation)

**BDD**
Gherkin feature authorship · step-definition and custom-World design · tag-based selective execution · data-driven `Scenario Outline`s

**Mobile**
Responsive/device emulation (viewport, UA, touch) · real-device and cloud-device-farm automation (Appium/WebdriverIO, BrowserStack) · clear scoping of emulation vs. real-hardware coverage

**Non-functional (accessibility / performance / visual / security)**
Automated WCAG scanning with a deliberate triage/allow-list policy (axe-core) · threshold-based load testing (k6) · visual regression with tolerance tuning (Playwright screenshots) · HTTP security-header auditing with a hard-assert vs. informational-only split · authentication/access-control testing (negative-then-positive pattern) mapped to the OWASP Top 10

**Email QA**
SMTP delivery integration testing (Mailpit) · offline HTML-email structural validation · graceful degradation when an external dependency is absent

**Test-data management**
Composable, overridable data-factory design (@faker-js/faker) · isolation via fresh records per test · deterministic seeding for reproducible failures vs. randomised generation for boundary/fuzz coverage · PII-safe synthetic data as a substitute for hand-typed fixtures or scrubbed production exports

**CI / DevOps**
Multi-job GitHub Actions pipeline — 12 independent suite jobs plus a TypeScript `tsc --noEmit` static-analysis gate (13 total) · per-suite dependency isolation (each folder is its own npm project) · service containers in CI (Mailpit) · browser-binary provisioning in CI (`playwright install --with-deps`) · retry wrapper so transient third-party API outages don't red the pipeline · deliberate, documented exclusion of environment-dependent suites from CI

**Test design / strategy**
Mapping test levels (component/integration/system/E2E) and test types to concrete suites · entry/exit criteria definition · defect management workflow · reconciling "CI is green" with "the requirement is verified" via an RTM · picking public, self-contained demo targets so the whole portfolio is reproducible by anyone
