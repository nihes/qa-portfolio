'use strict';

/**
 * GraphQL API tests against the public Countries API.
 * Demonstrates: plain queries, parameterised queries with variables, null vs
 * error handling, GraphQL schema validation (errors array), and nested/filtered
 * queries.
 */

const { expect } = require('chai');
const { gql } = require('../helpers/client');

describe('GraphQL API — countries.trevorblades.com', function () {
  it('returns a non-empty list of countries', async function () {
    const res = await gql('{ countries { code name } }');

    expect(res.status).to.equal(200);
    expect(res.data.data.countries).to.be.an('array').with.length.greaterThan(100);
    expect(res.data.data.countries[0]).to.include.keys(['code', 'name']);
  });

  it('resolves a single country by code using query variables', async function () {
    const query =
      'query GetCountry($code: ID!) { country(code: $code) { name capital currency continent { name } } }';
    const res = await gql(query, { code: 'SK' });

    expect(res.status).to.equal(200);
    const country = res.data.data.country;
    expect(country).to.include({ name: 'Slovakia', capital: 'Bratislava', currency: 'EUR' });
    expect(country.continent.name).to.equal('Europe');
  });

  it('returns null (not an error) for an unknown country code', async function () {
    const res = await gql('{ country(code: "ZZ") { name } }');

    expect(res.status).to.equal(200);
    expect(res.data.data.country).to.equal(null);
  });

  it('returns a GraphQL errors array when querying an invalid field', async function () {
    const res = await gql('{ country(code: "SK") { notARealField } }');

    // Invalid queries fail schema validation and come back with an `errors` array.
    expect(res.data).to.have.property('errors').that.is.an('array').that.is.not.empty;
    expect(res.data.errors[0]).to.have.property('message');
  });

  it('filters countries by continent (nested query)', async function () {
    const query = 'query($c: ID!) { continent(code: $c) { name countries { code } } }';
    const res = await gql(query, { c: 'EU' });

    expect(res.status).to.equal(200);
    expect(res.data.data.continent.name).to.equal('Europe');
    expect(res.data.data.continent.countries).to.be.an('array').that.is.not.empty;
  });
});
