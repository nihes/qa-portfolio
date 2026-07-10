# Performance — load testing (k6)

A small **load / performance** test written for [k6](https://k6.io) — Grafana's
open-source load-testing tool — targeting the DummyJSON product-listing API.

It demonstrates the performance-testing side of QA: ramping virtual users,
measuring latency distributions, and **failing on thresholds** (p95 latency and
error rate) rather than eyeballing numbers.

## What it does

`k6-load-test.js`:

- Ramps to **10 virtual users** over 15s, holds for 30s, ramps down over 15s.
- Hits `GET /products?limit=10` and checks the status and payload each iteration.
- Enforces thresholds — the run **fails** if any breach:
  - `http_req_duration p(95) < 800ms`
  - `http_req_failed rate < 1%`
  - `business_errors rate < 1%` (custom metric: status 200 **and** 10 products)

## Prerequisites

k6 is a standalone binary, **not** an npm package:

```bash
# macOS
brew install k6
# Windows
choco install k6
# Linux (Debian/Ubuntu) — see https://k6.io/docs/get-started/installation/
```

## Run

```bash
k6 run k6-load-test.js
# point it at another host:
k6 run -e BASE_URL=https://your-api.example.com k6-load-test.js
```

## Why it's not in CI

The GitHub Actions pipeline here is Node/npm-based; k6 needs its own binary and a
dedicated runner (or the official `grafana/k6-action`). It's kept as a
run-locally artifact to keep the main CI fast and dependency-light. Wiring it into
CI is a one-line action step when a performance gate is wanted.
