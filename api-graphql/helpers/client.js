'use strict';

/**
 * Minimal GraphQL client for the public Countries API.
 *
 * GraphQL has a single endpoint hit with POST; the query (and optional
 * variables) go in the JSON body, and — unlike REST — a request can return
 * HTTP 200 while still carrying an `errors` array in the body for invalid
 * queries. Tests therefore assert on the response body (`data` / `errors`),
 * not only on the HTTP status.
 */

const axios = require('axios');

const ENDPOINT = 'https://countries.trevorblades.com/graphql';

/**
 * Executes a GraphQL query/mutation.
 * @param {string} query - the GraphQL document.
 * @param {object} [variables] - GraphQL variables.
 * @returns {Promise<import('axios').AxiosResponse>}
 */
async function gql(query, variables = {}) {
  return axios.post(
    ENDPOINT,
    { query, variables },
    {
      headers: { 'Content-Type': 'application/json' },
      // Don't throw on 4xx/5xx — GraphQL error handling is done via the body.
      validateStatus: () => true,
    }
  );
}

module.exports = { gql, ENDPOINT };
