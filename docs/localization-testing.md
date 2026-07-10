# Localization (L10n) & Internationalization (I18n) Testing for E-commerce

A senior-level playbook for testing an e-commerce storefront across many
country markets. This is domain knowledge from working on a multistore
platform (20+ country storefronts), not something this portfolio's current
suites exercise today — **saucedemo.com**, **automationexercise.com**, and
**dummyjson.com** are all single-locale, single-currency, English-only demo
targets. §4 below is explicit about that gap and shows how the patterns
already in this repo (`mobile-web-playwright/`'s multi-project config,
`visual-regression/`'s screenshot diffing, `test-data/`'s factories) are the
right shape to extend into locale coverage, in the same
"documented, deliberate trade-off" spirit as
[`architecture.md`](./architecture.md).

## 1. i18n vs l10n

| | Internationalization (i18n) | Localization (l10n) |
|---|---|---|
| **What it is** | Engineering the product so it *can* be adapted to any locale without touching code | Adapting the already-i18n'd product to *one specific* market |
| **When it happens** | Once, as an architecture decision | Repeatedly, once per market/language |
| **Looks like** | Externalized strings, `Intl.NumberFormat`/`Intl.DateTimeFormat`, no hardcoded currency symbol/date order, layout that survives text-length changes | Translated copy, local currency/date/number formats, local VAT rules, local payment methods, region-specific legal text |
| **QA finds** | Bugs that break for *any* locale (a hardcoded string, a string built by concatenation whose word order assumption doesn't hold everywhere) | Bugs that are wrong for *this* locale only (a mistranslation, a wrong VAT rate, a date rendered US-style to a European shopper) |

In short: i18n is "did we build it so it can flex," l10n is "did we flex it
correctly for Slovakia / Germany / Japan / ...". Both need dedicated test
passes — a product can be perfectly i18n'd and still ship a badly l10n'd
market, or vice versa (hardcoded strings that happen to look fine in the
one language someone tested).

## 2. What to test

### Translation completeness & no hardcoded strings
Every user-facing string should come from a translation resource, not be
built by string concatenation (`"Add " + qty + " to cart"` breaks the
moment a language's word order differs). Check for: raw translation keys
leaking into the UI (`checkout.error.missing_field` shown verbatim instead
of translated text), silent fallback to the default locale for missing
keys, and unescaped `{{placeholder}}` tokens rendered literally.

### Currency formatting & symbols
Symbol position (`$10.00` vs `10,00 €`), symbol vs. ISO code (some legal
contexts require `EUR`, not `€`), decimal vs. thousands separator
(`1,234.56` en-US vs `1 234,56` sk-SK/fr-FR vs `1.234,56` de-DE), and — for
stores with a currency switcher — that switching currency actually
recalculates the displayed price rather than just swapping the symbol.

### Number, date, address & phone formats
- **Numbers:** decimal separator, grouping separator, and grouping size
  (Western thousands vs. the Indian lakh/crore pattern).
- **Dates:** field order (`MM/DD/YYYY` US vs `DD.MM.YYYY` most of Europe vs
  ISO `YYYY-MM-DD`) and first day of week (affects date pickers and
  delivery-estimate widgets).
- **Addresses:** field shape varies by country — US (street/city/state/ZIP)
  vs. most EU countries (street/postal code+city, no "state") vs. Japan
  (largest-to-smallest, reversed order). A checkout form shaped for one
  country's address format will mis-map or reject perfectly valid
  addresses from another.
- **Phone numbers:** country-code prefix, national vs. international
  format, variable length — a validation regex tuned for one country
  rejects valid numbers from the rest.

### VAT/tax and price display
Whether the displayed price is **tax-inclusive** (typical EU B2C) or
**tax-exclusive** (US, tax added at checkout) — mixing the two conventions
on the same product page is a classic, high-visibility e-commerce bug.
Also check the correct rate per country *and* per product category
(reduced VAT on food/books in many EU countries), and B2B reverse-charge/
VAT-exempt flows where a VAT ID field should (or shouldn't) appear.

### Timezones
Order timestamps, "delivery by" promises, flash-sale countdown timers, and
cron-driven price/stock changes need testing against the *customer's*
timezone, not just the server's. A sale that "ends at midnight" needs an
explicit timezone anchor, or it silently ends at the wrong local moment for
shoppers in a different offset or DST state.

### Pluralization
Not just "1 item" vs "2 items" in English. Slavic languages (Slovak, Czech,
Polish, Russian) have singular/few/many plural categories; Arabic has six.
A naive `count === 1 ? singular : plural` check is an English-only
assumption baked into code — pluralization needs to be driven by a rules
engine (ICU MessageFormat, i18next) and tested at the actual boundary
counts for each locale's plural rule (e.g. 0, 1, 2, 5, 21 — not just 1 and
"everything else").

### Text expansion/truncation in UI
Translated strings run 30–200% longer than English in German or Finnish,
and shorter in Chinese or Japanese. A button or price badge sized for
English text will truncate, wrap badly, or overflow once translated — this
is a layout bug that reading the translation file alone won't catch (see
§4 on per-locale visual snapshots).

### RTL languages
Arabic/Hebrew storefronts need the *whole layout mirrored* — nav order,
which side the cart icon sits on, form field order, and the direction
"back/next" arrow icons imply — not just right-aligned text. Test that
`dir="rtl"` cascades correctly, and that bidirectional text (a Latin SKU or
price sitting inside an RTL sentence) renders in the correct visual order.

### Character encoding / UTF-8
Diacritics (á, ř, ß, ł), non-Latin scripts, and emoji must survive the full
round trip: form input → API payload → DB storage → search index → back out
to the UI — including in URLs (accented product slugs) and exports
(CSV/PDF invoices). A missing `utf8mb4` column or a wrong `Content-Type`
header mangles anything outside basic Latin, and often only reproduces at
the *far* end of the pipeline (a generated PDF invoice), not on the input
page where it's easy to spot.

### Sorting/collation
Alphabetical order isn't universal: Slovak/Czech sort `ch` as a single
letter placed after `h`; German dictionary order treats `ä/ö/ü` differently
from phonebook order; Nordic languages place `å/ä/ö` after `z`. A
brand/product list sorted with a raw byte comparator instead of a
locale-aware collator (`Intl.Collator`) will look obviously wrong to a
native speaker, even though the sort is internally consistent.

### Legal/compliance per market
Cookie consent (GDPR opt-in EU vs. looser US defaults), right-of-withdrawal
text (14-day distance-selling window in the EU), mandatory legal footer
content (company registration number, `Impressum` in Germany/Austria),
age-restriction gating that varies by both product category and country,
and locale-specific required checkout fields (a national ID/tax ID field
required in some markets, absent in others).

## 3. Pseudo-localization

**Pseudo-localization** runs the app through a fake "locale" that:
transforms Latin letters into accented look-alikes (`a → ȧ`, `e → ĕ`), pads
every string by ~30–50% to simulate translation expansion, and optionally
wraps the whole string in bracket markers
(`[!!! Ȧȧƴȧƴ Ŧő Ċȧřŧ !!!]`) — all without waiting for a single real
translation to exist.

**Why it's useful:** it catches *engineering* i18n bugs continuously in CI,
long before any real translator is involved:
- A hardcoded string shows up **untouched** (no accents, no padding) —
  instant, unmissable signal that it bypassed the translation pipeline.
- Layout that can't survive text expansion **breaks visibly** (truncation,
  overflow, wrapped buttons) using one fake locale, instead of needing 20
  real locales on hand to notice the same class of bug 20 separate times.

It's a cheap, build-time substitute for "do we actually have real
translations for every market yet" — run it early, run it often, and treat
any failure as an i18n *engineering* bug, not a translation bug.

## 4. Mapping to automation — and to this repo

### Locale-parameterized tests
Run the *same* spec once per locale via a data table, rather than
hand-copying one spec per country:

```ts
const locales = [
  { code: 'sk-SK', currency: 'EUR', addressShape: 'street+postal+city' },
  { code: 'de-DE', currency: 'EUR', addressShape: 'street+postal+city' },
  { code: 'en-US', currency: 'USD', addressShape: 'street+city+state+zip' },
];

for (const locale of locales) {
  test(`checkout renders correctly for ${locale.code}`, async ({ page }) => {
    // same spec body; assertions read from `locale`
  });
}
```

### Snapshot per locale
`visual-regression/`'s `toHaveScreenshot` pattern (see
[`visual-regression/README.md`](../visual-regression/README.md)) is the
natural mechanism for catching text-expansion and RTL layout breakage: one
baseline screenshot **per locale**, the same way this repo already keeps
one baseline per platform — a German checkout button overflowing where the
English one fit shows up as a pixel diff, not a manual reading of a
translation file.

### How this maps onto suites already in this repo
- **`mobile-web-playwright/`'s multi-project pattern** (`devices[...]`
  project per device profile) is exactly the mechanism to reuse for
  locales: add a Playwright project per locale
  (`use: { locale: 'de-DE', timezoneId: 'Europe/Berlin' }`) so the *same*
  spec file runs unmodified against every configured locale/timezone, the
  same way it already runs unmodified against iPhone 13/WebKit and
  Pixel 5/Chromium today.
- **`visual-regression/`** is where the per-locale screenshots from §3/§4
  above would live, with the same "baselines are platform-specific,
  regenerate per environment" caveat this repo already documents for
  OS/browser differences — just extended to "and per locale."
- **`test-data/src/factories.js`**'s `makeAddress()`/`makeCustomer()`
  currently use faker's default English/US-shaped generators. This
  project's installed `@faker-js/faker@9.9.0` ships **locale-specific
  instances** (`fakerDE`, `fakerSK`, `fakerFR`, `fakerHU`, `fakerRO`,
  `fakerPL`, `fakerIT`, `fakerNL`, `fakerES`, and more — confirmed present
  under `test-data/node_modules/@faker-js/faker/dist/locale/`) that
  generate real-shaped street names, postal codes, and phone numbers per
  country. Extending `makeAddress(overrides, locale)` to pick the matching
  `faker<LOCALE>` instance would let the same factory feed a German-shaped
  address into a `de-DE` checkout test and a Slovak-shaped one into an
  `sk-SK` test, without hand-maintaining a fixture file per country.

None of this is implemented in the current suites — it's documented here as
the deliberate next step, the same way `architecture.md` documents *why*
`appium-mobile/`, `performance/`, and `visual-regression/` aren't wired into
CI yet: a named, reasoned gap rather than a silent one.

## 5. Checklist

| Category | What to check | Example failure mode |
|---|---|---|
| Translation completeness | No raw i18n keys or `{{placeholders}}` rendered in the UI | Button shows `cart.checkout_cta` instead of "Checkout" |
| Currency | Symbol, position, decimal/thousands separators, price recalculated on currency switch | `10,00 €` shown as `€10.00` or price unchanged after switching currency |
| Numbers & dates | Correct separators, field order, first day of week | `03/04/2026` ambiguous between 3 April and 4 March |
| Addresses & phone | Field set matches country shape; phone validation accepts the country's real formats | Valid German postal code rejected by a US-shaped ZIP regex |
| VAT/tax display | Inclusive vs. exclusive matches market convention; correct rate per country/category | Tax-exclusive US-style price shown to an EU shopper expecting tax-inclusive |
| Timezones | Deadlines/countdowns anchored to customer locale, not server time | Flash sale "ends at midnight" ends at the wrong local hour |
| Pluralization | Correct plural form at real boundary counts per locale's rule (not just 1 vs. "other") | Slovak "2 produkty" rendered with the wrong (Russian-style) plural form |
| Text expansion | UI survives 30–200% longer strings without truncation/overflow | German button label clipped or wraps onto two lines |
| RTL | Full layout mirrors (nav, icons, form order), not just text alignment | "Back" arrow still points left in an Arabic RTL layout |
| Encoding/UTF-8 | Diacritics/non-Latin text survive input → storage → search → export | Accented name renders as `?` or mojibake in a generated PDF invoice |
| Sorting/collation | Locale-aware collator, not raw byte/ASCII sort | Slovak brand list sorts `Chľeba` before `Cyprus` (wrong alphabetical position) |
| Legal/compliance | Correct consent flow, footer legal text, age-gating per market | German store missing mandatory `Impressum` footer content |
