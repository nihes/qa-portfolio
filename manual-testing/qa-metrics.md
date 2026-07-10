# QA Metrics & Concepts — A Practical Guide

Every QA engineer eventually gets asked "what does the dashboard say?" This doc
covers the concepts and metrics that actually come up in day-to-day
e-commerce QA work: how bugs are classified and tracked (severity/priority,
defect lifecycle), and the numbers people quote in retros, sprint reviews and
release go/no-go meetings — what each one really tells you, and where it lies
to you if you're not careful.

None of this is theoretical. The examples below are the kind of bugs you'd
actually log against a storefront + checkout + admin stack (product pages,
cart, payment, pricing, order management).

---

## 1. Severity vs Priority

These two get confused constantly, including by people who should know
better. They answer **different questions**:

- **Severity** — *How badly is the system broken?* Technical/functional impact.
  Set by QA, based on what the bug actually does.
- **Priority** — *How soon do we need to fix it?* Business/scheduling impact.
  Set by the product owner / triage, based on who's affected and when.

A bug can be high severity but low priority (crashes an admin tool nobody
uses on a Friday afternoon before a deprecation), or low severity but high
priority (a typo in the hero banner of a Black Friday campaign that goes live
in 2 hours).

### Severity levels (typical scale)

| Severity | Meaning | E-commerce example |
|---|---|---|
| **Critical (S1)** | System down, data loss, security breach, no workaround | Checkout throws 500 on payment submission for all users; gift card balance mutated to negative; customer PII returned in wrong account's API response |
| **High (S2)** | Major feature broken, no reasonable workaround | Coupon code doesn't apply discount at all; "Add to cart" fails for one whole store (e.g. all of DE); price shown excl. VAT when it must be incl. |
| **Medium (S3)** | Feature partially broken, workaround exists, limited scope | Product image gallery arrows don't work but thumbnails still let you switch images; wishlist doesn't persist after logout/login for guest→customer merge |
| **Low (S4)** | Cosmetic, minor, edge-case, doesn't block the task | Button hover color slightly off-brand; tooltip text overflows on very long product names; misaligned badge on a rarely-visited legacy page |

### Priority levels (typical scale)

| Priority | Meaning | Typical trigger |
|---|---|---|
| **P1 (Immediate)** | Fix now, possibly hotfix to prod | Blocks checkout, blocks a live campaign, security/compliance issue |
| **P2 (High)** | Fix in current sprint / next release | Affects real users but has a workaround or limited store scope |
| **P3 (Medium)** | Fix when convenient, scheduled | Affects a minority of users, non-blocking |
| **P4 (Low)** | Backlog, fix if time allows | Cosmetic, rare edge case, low traffic page |

### The Severity × Priority matrix

This is the actual triage tool — severity alone or priority alone isn't
enough to decide what happens next:

```
                     PRIORITY
              P1        P2         P3         P4
         ┌─────────┬──────────┬──────────┬──────────┐
   S1    │ Hotfix   │ Hotfix   │ Fix this │ Unlikely │
Critical │ NOW      │ today    │ release  │ combo    │
         ├─────────┼──────────┼──────────┼──────────┤
   S2    │ Fix      │ Fix this │ Fix next │ Backlog, │
  High   │ today    │ release  │ release  │ revisit  │
         ├─────────┼──────────┼──────────┼──────────┤
   S3    │ Unusual  │ Fix next │ Backlog  │ Backlog  │
 Medium  │ combo    │ release  │          │          │
         ├─────────┼──────────┼──────────┼──────────┤
   S4    │ Unusual  │ Backlog  │ Backlog  │ Won't    │
  Low    │ combo    │          │          │ fix      │
         └─────────┴──────────┴──────────┴──────────┘
```

Real examples that show why the two axes are independent:

| Bug | Severity | Priority | Why |
|---|---|---|---|
| Checkout 500s on payment for all SK customers | Critical | P1 | Breaks core revenue path for everyone, right now |
| Admin CSV export tool (used twice a year) throws an error | Critical (the feature is 100% broken) | P4 | Nobody needs it until Q4 |
| "Free Shipping" banner shows wrong threshold on homepage during live campaign | Low (nothing crashes) | P1 | Costs money / customer trust every minute it's live |
| Product label icon (vegan/gluten-free) renders 2px too low on PDP | Low | P4 | Cosmetic, no functional impact |
| Wrong customer's saved address shown in checkout autofill | Critical (data leak, GDPR) | P1 | Legal/security exposure, even if it happens rarely |

**Rule of thumb:** if you find yourself arguing severity when you mean
urgency, or vice versa, stop and separate the two questions first. It saves
every triage meeting from going in circles.

---

## 2. The Defect Lifecycle

A bug isn't just "open" or "closed" — it moves through states, and knowing
the states (and who owns each transition) is what lets a QA team actually
measure things like Mean Time To Resolve later in this doc.

### Typical states

| State | Meaning | Owner |
|---|---|---|
| **New** | Just logged, not yet triaged | QA / reporter |
| **Assigned** | Triaged, has an owner and (usually) a priority | Dev lead / triage |
| **In Progress** | Developer actively working the fix | Developer |
| **Fixed / Resolved** | Code changed, awaiting verification | Developer → QA |
| **In QA / Ready for Retest** | QA verifying the fix | QA |
| **Reopened** | Fix didn't work, or regressed something else | QA |
| **Closed** | Verified fixed and deployed (or accepted as won't-fix, duplicate, cannot-reproduce) | QA / reporter |
| **Deferred / Won't Fix** | Deliberately not fixing (accepted risk, low priority, by design) | Product owner |

### Flow diagram

```
                ┌────────────────────────────────────────────┐
                │                                              │
                ▼                                              │
   ┌─────┐   triage   ┌──────────┐  dev picks up  ┌────────────┐
   │ New │ ─────────► │ Assigned │ ─────────────► │ In Progress │
   └─────┘            └──────────┘                └────────────┘
      │                    │                             │
      │ duplicate /        │ can't repro /               │ code fix
      │ not a bug          │ won't fix                   │ committed
      ▼                    ▼                             ▼
   ┌────────┐         ┌───────────┐              ┌─────────────┐
   │ Closed │ ◄────── │ Deferred / │              │   Fixed /    │
   │(no fix)│         │ Won't Fix  │              │  Resolved    │
   └────────┘         └───────────┘              └─────────────┘
                                                          │
                                              QA verifies fix
                                                          ▼
                                                   ┌──────────────┐
                                        ┌───────── │ In QA / Retest│
                                        │          └──────────────┘
                                 fix confirmed             │
                                        │            fix fails /
                                        ▼            regression found
                                  ┌────────┐               │
                                  │ Closed │               ▼
                                  └────────┘         ┌──────────┐
                                        ▲             │ Reopened │
                                        │             └──────────┘
                                        │                   │
                                        └── (loops back to Assigned/In Progress)
```

Every arrow in that diagram is a transition someone should timestamp in the
tracker (Jira does this automatically via status-change history) — that
history is the raw material for lifecycle-based metrics like MTTR and reopen
rate.

**Practical notes from real trackers:**
- "Reopened" rate is itself a mini quality signal — a team with a high
  reopen rate either has weak fix verification or an unstable environment.
- "Cannot Reproduce" should require the reporter to attach enough evidence
  (env, steps, store, screenshots/HAR) before it's used as an excuse to
  close — otherwise it becomes a way to make backlog numbers look better
  without fixing anything.
- Distinguish **Closed (Fixed)** from **Closed (Won't Fix)** from **Closed
  (Duplicate)** in your data — lumping them together destroys the accuracy
  of Defect Density and DRE calculations later.

---

## 3. Metrics

A metric is only useful if you know what decision it's supposed to inform.
For each one below: the formula, what it tells you, and — just as
important — how it lies to you if misused.

### 3.1 Defect Density

**Formula:**
```
Defect Density = Number of Defects / Size of the module
                  (size = KLOC, function points, or story points / feature count)
```

**What it tells you:** Which modules/areas are relatively buggier than
others, normalized for size — useful for deciding where to focus test effort
or refactor. E.g. "the pricing/tax calculation module has 12 defects per 100
story points vs. 2 for the footer CMS blocks" tells you where the risk lives.

**Caveats:**
- Size measures (LOC, story points) are inconsistent across teams and time —
  comparing density across teams that estimate differently is meaningless.
- A low-density module might just be under-tested, not well-built.
- Doesn't distinguish a module with 1 catastrophic bug from one with 10
  trivial ones — pair it with severity breakdown.

---

### 3.2 Defect Leakage / Escape Rate

**Formula:**
```
Defect Leakage % = (Defects found in Production / Total defects found [Test + Prod]) × 100
```

**What it tells you:** How much is slipping past your test process into
customers' hands. If you found 45 bugs in test and 5 more surfaced in
production after release, leakage = 5 / 50 = 10%. This is one of the most
honest "is QA actually working" numbers, because production defects are the
ones that hurt customers, revenue, and NPS.

**Caveats:**
- Denominator matters — some teams count only *this release's* defects, some
  count a trailing window. Be explicit, or teams will game the comparison
  period.
- A "zero leakage" release might mean nothing shipped, or the release was
  trivial — always look at it next to release scope/size.
- Not all escaped defects are equal — 1 critical payment bug in prod is
  worse than 10 low-severity CSS glitches; a raw percentage hides that.
  Segment by severity.

---

### 3.3 Defect Removal Efficiency (DRE)

**Formula:**
```
DRE % = Defects found before release / (Defects found before release + Defects found after release) × 100
```

**What it tells you:** Same underlying idea as leakage, framed the other way
— "of all the defects that existed, what % did we actually catch before the
customer did?" A DRE of 95% for a release means testing caught 19 out of
every 20 bugs before it reached prod. Industry-cited "good" targets are often
90%+, but that's context-dependent — a payments team should hold itself to a
tighter bar than an internal admin tool team.

**Caveats:**
- It's retrospective by definition — you only know your DRE for release N
  once enough time has passed for release-N bugs to surface in production
  (typically a few weeks). Don't compute DRE the day after a release and
  call it final.
- Same denominator ambiguity issue as leakage — agree on a fixed
  observation window (e.g. "prod defects found within 30 days of release").
- High DRE with very few total defects found isn't necessarily "great
  quality" — it can mean shallow testing found few of anything, before *or*
  after release. Cross-check against test coverage and test case count.

---

### 3.4 Test Case Pass Rate

**Formula:**
```
Pass Rate % = (Test cases passed / Total test cases executed) × 100
```

**What it tells you:** A snapshot of how much of the executed test suite is
currently green. Useful as a release-readiness gate ("we don't ship below
98% pass rate on the regression suite") and to spot a sudden drop after a
merge.

**Caveats:**
- This is the single most "gameable" metric on this list. Pass rate goes up
  if you: delete/skip flaky or hard tests, write shallow tests that always
  pass, or simply write fewer tests. A 100% pass rate on 10 trivial checks
  means nothing next to 85% on 500 meaningful ones.
- Doesn't account for tests that were never written — pair with coverage.
- "Not Run / Blocked" test cases should be tracked separately, not silently
  excluded from the denominator (that inflates pass rate for free).

---

### 3.5 Requirements / Test Coverage

**Formula:**
```
Requirement Coverage % = (Requirements with ≥1 linked test case / Total requirements) × 100
Test Coverage %         = (Lines/branches/functions executed by tests / Total lines/branches/functions) × 100
```
(Two different things sharing the name "coverage" — requirements coverage is
a traceability/planning metric, code coverage is an engineering/automation
metric. Say which one you mean.)

**What it tells you:** Whether there are known gaps — a requirement with zero
test cases mapped to it is a documented blind spot, not a guess. See also
`requirements-traceability-matrix.md` in this repo for how the mapping is
actually built and maintained.

**Caveats:**
- 100% requirement coverage means every requirement has *at least one* test
  case — it says nothing about whether that test case is any good, or
  whether edge cases within the requirement are covered.
- 100% code coverage is not the same as "well tested" — code coverage
  tracks whether a line *executed*, not whether the assertion checked
  anything meaningful. A test with no assertions can still light up 100%
  coverage on the line it calls.
- E-commerce-specific trap: "requirement" coverage often gets measured only
  against the happy path store (e.g. SK) and silently assumed to hold for
  the other 19+ store views — currency, VAT, and shipping-method
  requirements diverge per store/website and need their own coverage
  tracking, not an inherited checkbox.

---

### 3.6 Mean Time To Detect (MTTD) / Mean Time To Resolve (MTTR)

**Formula:**
```
MTTD = Average(time defect was introduced → time defect was found)
MTTR = Average(time defect was reported → time defect was verified fixed & closed)
```

**What it tells you:** MTTD tells you how fast your testing (or monitoring,
for production issues) catches problems — a large MTTD on a critical bug
means it lived in the codebase or in prod for a long time undetected, which
is its own risk signal independent of severity. MTTR tells you how fast the
team responds once something is known — critical for incident response and
for SLA commitments (e.g. "P1 production bugs get an MTTR target of 4
hours").

**Caveats:**
- MTTD for "time introduced" is often an estimate (you frequently don't know
  exactly when a bug was introduced, only when it was found) — be honest
  that it's an approximation, usually anchored to a deploy/commit range.
  This is also why blameless postmortems don't obsess over exact MTTD.
- MTTR averages hide bimodal reality: most bugs get fixed in a day, but a
  few gnarly ones sit for three weeks — report median *and* the outliers,
  not just the mean, or leadership will think everything is fast.
- MTTR that excludes weekends/holidays vs. one that doesn't will disagree
  wildly — state your clock convention.

---

### 3.7 Flakiness Rate

**Formula:**
```
Flakiness Rate % = (Test runs with inconsistent pass/fail on unchanged code / Total test runs) × 100
```
(commonly tracked per-test: a test is "flaky" if it produces different
results across repeated runs against the same code/environment)

**What it tells you:** How much you can trust a red or green result at all.
A suite with high flakiness trains the team to ignore failures ("oh that one
always fails, just rerun it"), which is exactly how real regressions start
slipping through — the boy-who-cried-wolf problem, but for CI.

**Caveats:**
- Flakiness is frequently a symptom, not a root cause — timing/waits, shared
  test data, environment instability (looking at you, shared QA DB that's a
  read replica of prod and changes under you), and test-order dependency all
  masquerade as "flaky tests" when the real bug is in the test design or the
  environment.
- A team under deadline pressure will quietly quarantine/skip flaky tests
  instead of fixing them — quarantining should be visible and time-boxed,
  never a silent permanent fix (see also: "delete broken tests, don't skip
  them" as a house rule for genuinely obsolete tests — flaky-but-valid tests
  should be *fixed*, not skipped indefinitely).
- Rate alone doesn't tell you *which* tests are flaky or *why* — track it
  per test/suite, not just as one aggregate number, or you can't act on it.

---

### 3.8 Automation Coverage %

**Formula:**
```
Automation Coverage % = (Test cases automated / Total test cases that could be automated) × 100
```

**What it tells you:** How much of the regression burden is off human
hands. Rising automation coverage over time is a decent proxy for
sustainable test velocity as a product grows (20+ store views and a
headless frontend do not get cheaper to regression-test by hand).

**Caveats:**
- The denominator ("could be automated") is a judgment call — teams that
  want to look good pick a small denominator (excluding anything hard,
  like payment redirects or 3rd-party carrier integrations) and inflate the
  percentage for free.
- Automated ≠ maintained. A suite that's 80% "automated" but half of it is
  skipped, flaky, or testing a feature that no longer exists is a liability
  dressed up as an asset.
- Automation coverage says nothing about *quality* of the automated checks
  — 1 well-designed data-driven test across 20 store/currency/VAT
  combinations is worth more than 20 shallow copy-pasted single-store tests,
  even though the second counts as "more automated tests."

---

## 4. Vanity Metrics vs. Actionable Metrics

Not every number that goes into a slide is worth optimizing for. The
distinction that matters:

- **Vanity metric** — goes up and looks good, but doesn't tell you what to
  *do* differently, and is usually easy to inflate without improving
  anything real. "Number of test cases written." "Number of bugs found this
  sprint" (in isolation — more bugs found could mean better testing *or* a
  worse release). "Automation coverage %" reported alone, with no mention of
  suite health.
- **Actionable metric** — tied to a decision, trend, or threshold that
  changes behavior. "Defect leakage went from 5% to 18% after we cut
  regression test time in half" tells you to reconsider that trade-off.
  "MTTR for P1 bugs breached SLA 3 times this quarter, all three during the
  same on-call rotation" tells you exactly where to look.

Quick smell test before you put a metric in a report: *if this number
doubled next sprint, would anyone know what to actually change?* If the
honest answer is "we'd just feel good/bad about it," it's vanity. Push
metrics until they're paired with a denominator, a trend, and a segment
(by severity, by store, by module) — that's usually what turns a vanity
number into an actionable one.

Also watch for metrics that reward the wrong behavior on their own:
pass rate rewards deleting hard tests, bug-count-closed rewards closing bugs
as duplicate/won't-fix, automation-% rewards automating easy things instead
of risky things. Always look at *pairs* of metrics that check each other
(e.g. pass rate *and* total test count; automation % *and* flakiness rate;
bugs closed *and* reopen rate) rather than trusting any single number in
isolation.

---

## 5. Summary Table

| Metric | Formula (short) | Tells you | Watch out for |
|---|---|---|---|
| Defect Density | Defects / Size | Relative buggy-ness of modules | Size measures aren't comparable across teams |
| Defect Leakage | Prod defects / All defects | % of bugs that reached customers | Segment by severity; agree on time window |
| DRE | Pre-release defects / (Pre + Post) | % of bugs caught before release | Retrospective only; needs a fixed observation window |
| Test Case Pass Rate | Passed / Executed | Suite health snapshot | Easily inflated by skipping hard/flaky tests |
| Requirement Coverage | Requirements with tests / Total requirements | Known gaps in test planning | Says nothing about test *quality*; per-store gaps hide behind one checkbox |
| Code Coverage | Lines/branches executed / Total | Which code paths run during tests | Executed ≠ verified; assertion-free tests still count |
| MTTD | Time to find a defect | Detection speed | "Time introduced" is often an estimate |
| MTTR | Time to resolve a defect | Response/fix speed | Report median + outliers, not just mean |
| Flakiness Rate | Inconsistent runs / Total runs | Trustworthiness of test results | Root cause is often env/data, not the test itself |
| Automation Coverage % | Automated / Automatable | Regression burden off manual hands | Denominator is a judgment call; automated ≠ maintained |

**Bottom line:** every metric above is a proxy, not the truth. The value of
this doc isn't "hit these formulas" — it's knowing what each number can and
can't tell you, so you can defend (or challenge) a number in a release
meeting instead of just reading it off a dashboard.
