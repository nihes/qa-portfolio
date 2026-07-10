import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

/**
 * k6 load test for a product-listing API (DummyJSON).
 *
 * Ramps virtual users up, holds, then ramps down, and enforces performance
 * thresholds (p95 latency and error rate). k6 is a standalone Go binary — it is
 * NOT an npm package — so this runs locally / in a dedicated k6 CI runner, and
 * is intentionally left out of the Node-based GitHub Actions workflow.
 *
 * Run:  k6 run k6-load-test.js
 */

const errorRate = new Rate('business_errors');
const productListDuration = new Trend('product_list_duration', true);

const BASE_URL = __ENV.BASE_URL || 'https://dummyjson.com';

export const options = {
  stages: [
    { duration: '15s', target: 10 }, // ramp up to 10 virtual users
    { duration: '30s', target: 10 }, // hold
    { duration: '15s', target: 0 },  // ramp down
  ],
  thresholds: {
    // 95% of requests must complete under 800ms; <1% business errors.
    http_req_duration: ['p(95)<800'],
    http_req_failed: ['rate<0.01'],
    business_errors: ['rate<0.01'],
  },
};

export default function () {
  const res = http.get(`${BASE_URL}/products?limit=10`);
  productListDuration.add(res.timings.duration);

  const ok = check(res, {
    'status is 200': (r) => r.status === 200,
    'returns 10 products': (r) => {
      try {
        return r.json('products').length === 10;
      } catch (_e) {
        return false;
      }
    },
  });

  errorRate.add(!ok);
  sleep(1);
}
