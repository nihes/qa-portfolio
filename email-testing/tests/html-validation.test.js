'use strict';

/**
 * html-validation.test.js
 * ------------------------
 * OFFLINE checks on the order-confirmation HTML template.
 *
 * These tests do not need Mailpit, network access, or any running service —
 * they just read templates/order-confirmation.html from disk and validate it
 * against a set of baseline "HTML email hygiene" rules that matter for
 * deliverability and cross-client rendering:
 *
 *  - valid doctype / title / charset so the email renders predictably
 *  - a hidden preheader so inbox preview text is controlled, not garbage
 *  - every link has a real, non-empty href (no dead CTAs)
 *  - every image has alt text (images are frequently blocked by default in
 *    email clients, so alt text is the only thing many recipients ever see)
 *  - no leftover localhost/placeholder links that would embarrass us in prod
 *  - a table-based layout, since HTML email still relies on tables for
 *    layout consistency across clients (divs + flex/grid are unreliable)
 */

const fs = require('fs');
const path = require('path');
const { expect } = require('chai');
const cheerio = require('cheerio');

const TEMPLATE_PATH = path.join(__dirname, '..', 'templates', 'order-confirmation.html');

describe('order-confirmation.html — offline HTML email validation', () => {
  let rawHtml;
  let $;

  before(() => {
    rawHtml = fs.readFileSync(TEMPLATE_PATH, 'utf8');
    $ = cheerio.load(rawHtml);
  });

  it('starts with a DOCTYPE declaration', () => {
    const startsWithDoctype = /^\s*<!DOCTYPE/i.test(rawHtml);
    expect(startsWithDoctype).to.equal(true);
  });

  it('has a non-empty <title>', () => {
    const title = $('title').text().trim();
    expect(title).to.not.equal('');
  });

  it('declares a charset via <meta charset>', () => {
    const charsetAttr = $('meta[charset]').attr('charset');
    expect(charsetAttr).to.be.a('string');
    expect(charsetAttr.trim()).to.not.equal('');
  });

  it('has a hidden preheader element for the inbox preview line', () => {
    // Preheader is the first visually-hidden block of text right after <body>,
    // conventionally implemented as a <span> with display:none / max-height:0.
    const preheader = $('body > span').first();
    expect(preheader.length, 'expected a preheader <span> as the first child of <body>').to.equal(1);

    const style = preheader.attr('style') || '';
    expect(style).to.match(/display\s*:\s*none/i);

    const text = preheader.text().trim();
    expect(text).to.not.equal('');
  });

  it('has at least one <table> (table-based layout)', () => {
    expect($('table').length).to.be.greaterThan(0);
  });

  it('every <a> has a non-empty href', () => {
    const links = $('a').toArray();
    expect(links.length, 'expected at least one link in the template').to.be.greaterThan(0);

    links.forEach((el) => {
      const href = $(el).attr('href');
      expect(href, `<a> with text "${$(el).text().trim()}" is missing href`).to.be.a('string');
      expect(href.trim(), `<a> with text "${$(el).text().trim()}" has an empty href`).to.not.equal('');
    });
  });

  it('every <img> has a non-empty alt attribute', () => {
    const images = $('img').toArray();
    expect(images.length, 'expected at least one image in the template').to.be.greaterThan(0);

    images.forEach((el) => {
      const alt = $(el).attr('alt');
      const src = $(el).attr('src');
      expect(alt, `<img src="${src}"> is missing alt`).to.be.a('string');
      expect(alt.trim(), `<img src="${src}"> has an empty alt`).to.not.equal('');
    });
  });

  it('no href points to localhost or a placeholder example.com URL', () => {
    $('a').each((_, el) => {
      const href = ($(el).attr('href') || '').toLowerCase();
      expect(href).to.not.include('localhost');
      expect(href).to.not.include('example.com/placeholder');
    });
  });

  it('the CTA link uses a real https:// URL', () => {
    const ctaCandidates = $('a').filter((_, el) => /track your order/i.test($(el).text()));
    expect(ctaCandidates.length, 'expected a "Track your order" CTA link').to.be.greaterThan(0);

    ctaCandidates.each((_, el) => {
      const href = $(el).attr('href') || '';
      expect(href).to.match(/^https:\/\//);
    });
  });
});
