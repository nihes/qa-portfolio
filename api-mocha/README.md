# api-mocha

Code-based REST API tests with **Mocha + Chai + axios**, run against the public
[DummyJSON](https://dummyjson.com) API ([docs](https://dummyjson.com/docs)).

This complements the collection-based [`api-postman-newman/`](../api-postman-newman/)
suite by showing the same discipline (auth, pagination, search, CRUD,
response-body assertions, negative cases) expressed as plain JavaScript test
code instead of a Postman collection — useful when tests need to live alongside
application code, be parameterized programmatically, or be reviewed as regular
diffs in a PR.

## What's covered

| File | Covers |
|---|---|
| `tests/health.test.js` | `GET /test` — service-up smoke check |
| `tests/auth.test.js` | JWT login (`POST /auth/login`), protected profile (`GET /auth/me` with bearer), invalid credentials → 400, missing token blocked |
| `tests/products-crud.test.js` | Pagination (`GET /products?limit`), search, get-by-id, 404 handling, add (`POST`), full update (`PUT`), partial update (`PATCH`), delete |

`helpers/client.js` exports a shared `axios` instance (`validateStatus: () => true`,
so tests assert on `response.status` instead of catching HTTP errors) plus a
`warmUp()` helper that pings `/test` before the assertions run.

> **Note on simulated writes:** DummyJSON does not persist mutations —
> `add` / `update` / `delete` return the resulting resource (new id, changed
> fields, or an `isDeleted` flag) without storing it. The tests assert on that
> request/response **contract**, which is deterministic and CI-friendly.

## Run

```bash
npm install
npm test
```
