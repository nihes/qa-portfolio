# QA Portfolio — Ivan Andrijko

**Senior QA Engineer · E-commerce · Manual + AI-Assisted Automation**

A hands-on portfolio showing how I test e-commerce applications end to end — from
structured **manual** artifacts (test plans, test cases, bug reports, exploratory
charters) to **automated** checks across the tools I use day to day: **Playwright**,
**Cypress**, **Cucumber (BDD)** and **Newman/Postman** for API testing.

Everything here runs against **public demo e-shops** so anyone can clone and execute it:

- **[SauceDemo](https://www.saucedemo.com/)** — UI flows (login → cart → checkout).
- **[Automation Exercise](https://automationexercise.com/)** — a real e-commerce **REST API** (products, search, brands, auth).

---

## What's inside

| Folder | Demonstrates | Stack | Target |
|---|---|---|---|
| [`manual-testing/`](./manual-testing/) | Test plan, 27 test cases, bug reports, exploratory charters | Markdown QA docs | Generic e-shop |
| [`playwright/`](./playwright/) | E2E UI automation with the Page Object Model | Playwright + TypeScript | saucedemo.com |
| [`cypress/`](./cypress/) | E2E UI automation with custom commands | Cypress + TypeScript | saucedemo.com |
| [`cucumber-bdd/`](./cucumber-bdd/) | Behaviour-Driven testing (Gherkin) driving Playwright | Cucumber.js + Playwright | saucedemo.com |
| [`api-postman-newman/`](./api-postman-newman/) | REST API tests run headless in CI | Postman collection + Newman | automationexercise.com API |

---

## Quick start

Each folder is a self-contained project with its own `README.md` and `package.json`.

```bash
# API tests (Newman)
cd api-postman-newman && npm install && npm test

# Playwright
cd playwright && npm install && npx playwright install chromium && npm test

# Cypress
cd cypress && npm install && npm test

# Cucumber (BDD)
cd cucumber-bdd && npm install && npx playwright install chromium && npm test
```

The manual-testing folder needs no tooling — open the Markdown files.

---

## Skills demonstrated

- **Manual QA:** test planning, test case design (functional / negative / boundary),
  exploratory (session-based) testing, clear reproducible bug reporting.
- **UI automation:** Playwright & Cypress, Page Object Model, custom commands,
  web-first assertions, no arbitrary waits.
- **BDD:** Gherkin feature files with a clean step-definition layer.
- **API testing:** REST assertions with Postman/Newman, positive + negative cases,
  handling real-world API quirks (logical status inside the response body).
- **CI:** every suite runs in GitHub Actions — see [`.github/workflows/ci.yml`](./.github/workflows/ci.yml).
- **E-commerce domain:** cart, checkout, coupons, totals, payment failure, orders,
  product search / filter / sort, account & auth.

> Automation here is delivered pragmatically with **AI-assisted tooling** — the value
> is reliable, readable coverage of real e-commerce journeys.

---

## About

Ivan Andrijko — Senior QA Engineer (e-commerce, Magento 2 & Salesforce Commerce),
4+ years, C2 English, fully remote.
· [LinkedIn](https://linkedin.com/in/ivanandrijko) · [GitHub](https://github.com/nihes)
