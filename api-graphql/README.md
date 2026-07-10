# GraphQL API — query & schema tests (Mocha + Chai + axios)

**GraphQL** API tests with **Mocha + Chai + axios** against the public
[Countries GraphQL API](https://countries.trevorblades.com) — a companion to the
REST suites (`api-postman-newman/`, `api-mocha/`) showing how GraphQL testing
differs from REST.

## What's different about testing GraphQL

- **One endpoint, many queries.** Everything is a `POST` to a single
  `/graphql` URL; the operation lives in the request body (`query` +
  `variables`), not in the path/verb.
- **Errors live in the body.** A syntactically-served request can return HTTP
  `200` while carrying an `errors` array for an invalid query — so assertions
  target `data` / `errors`, not just the status code.
- **Ask for exactly what you need.** Tests select specific fields and assert on
  that shape, which doubles as a lightweight contract check.

## What's covered

| Test | Demonstrates |
|---|---|
| List countries | Plain query, response shape, collection assertions |
| Country by code | **Parameterised query with `variables`** (`$code: ID!`) |
| Unknown code → `null` | Null-vs-error handling |
| Invalid field | **GraphQL schema validation** (`errors` array) |
| Countries by continent | Nested / filtered query |

## Run

```bash
npm install
npm test
```
