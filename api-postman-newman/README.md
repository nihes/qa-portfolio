# Postman / Newman — REST API tests (collection-based)

REST API tests for the public demo e-shop [automationexercise.com](https://automationexercise.com), run
headlessly with [Newman](https://github.com/postmanlabs/newman), the CLI companion to Postman.

## Why this suite exists

`automationexercise.com/api` has a well-known quirk that makes it a good API-testing case study:

> **The API returns HTTP 200 for almost every request, including logical errors.**
> The real result code lives inside the JSON response body, in the `responseCode` field
> (e.g. `400` for a bad request, `404` for "not found") — not in the HTTP status line.

Every test in this collection therefore asserts on `pm.response.json().responseCode` (and the
accompanying `message`), in addition to a sanity check on the transport-level HTTP status. Relying
on HTTP status alone would let real failures (missing params, unknown user, etc.) pass silently.

## Endpoints covered

| # | Request | Method | Endpoint | Type | Key assertions |
|---|---------|--------|----------|------|-----------------|
| 1 | Get All Products | GET | `/productsList` | Happy path | HTTP 200; `responseCode` 200; `products` is a non-empty array; first product has `id`/`name`/`price` |
| 2 | Search Product | POST (`x-www-form-urlencoded`, field `search_product`) | `/searchProduct` | Happy path | HTTP 200; `responseCode` 200; `products` non-empty; result count saved to collection variable `lastSearchResultCount` |
| 3 | Get All Brands | GET | `/brandsList` | Happy path | HTTP 200; `responseCode` 200; `brands` is a non-empty array |
| 4 | Verify Login - missing params | POST (empty body) | `/verifyLogin` | Negative | HTTP 200; `responseCode` 400; `message` contains "Bad request" |
| 5 | Verify Login - invalid user | POST (`email`, `password` fields with fake credentials) | `/verifyLogin` | Negative | HTTP 200; `responseCode` 404; `message` equals "User not found!" |

## Files

```
api-postman-newman/
├── collections/
│   └── automationexercise-api.postman_collection.json   Postman Collection v2.1 — 5 requests + inline test scripts
├── environments/
│   └── automationexercise.postman_environment.json      baseUrl, searchTerm, testEmail, testPassword
├── package.json                                          npm scripts + newman/newman-reporter-htmlextra deps
└── README.md                                             this file
```

## Environment variables

Defined in `environments/automationexercise.postman_environment.json`:

| Variable | Value | Purpose |
|---|---|---|
| `baseUrl` | `https://automationexercise.com/api` | API root, used by every request |
| `searchTerm` | `top` | Search term used by the "Search Product" request |
| `testEmail` | `notreal.qa.tester@example.com` | Deliberately non-existent account for the negative login test |
| `testPassword` | `WrongPass123` | Paired with `testEmail`, never a real account's password |

The collection also defines `baseUrl` as a collection variable with the same value, as a fallback
in case the environment file isn't selected when running from the Postman GUI.

## Running the suite

```bash
# 1. Install dependencies (newman + the HTML reporter)
npm install

# 2. Run the suite (CLI output + a self-contained HTML report)
npm test
```

`npm test` runs:

```bash
newman run collections/automationexercise-api.postman_collection.json \
  -e environments/automationexercise.postman_environment.json \
  -r cli,htmlextra \
  --reporter-htmlextra-export newman/report.html
```

The HTML report is written to `newman/report.html` (the `newman/` output folder is created
automatically by the htmlextra reporter on first run).

## Notes

- All requests target the **public** automationexercise.com demo API only — no authenticated or
  destructive endpoints are exercised.
- The "Verify Login" requests are intentionally negative tests: they exist to prove the suite
  correctly detects failure via `responseCode`/`message`, not to authenticate as a real user.
- No production or third-party credentials are used anywhere in this suite; `testEmail` /
  `testPassword` are throwaway values that are not expected to correspond to a real account.
