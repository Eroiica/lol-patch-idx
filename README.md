# lol-patch-idx

League of Legends Patch Notes Parser — DOM→Block→AST→Interpret pipeline

## Pipeline

```
Markdown/HTML → markdownToBlocks/domToBlocks → blocksToAst → interpretPatch → PatchData JSON
```

## Read

[LOL.PATCH.NOTES.READ.md](LOL.PATCH.NOTES.READ.md)

## Search

[LOL.PATCH.NOTES.SEARCH.md](LOL.PATCH.NOTES.SEARCH.md)

## Display

| Curated Snapshots | Patch Descriptions | Explicit Permissions | Priority |
| --- | --- | --- | --- |
| Curated Snapshots (yearly) | Patch ('id','year') | Set By Patch(id,year) to External Host | 0 |

Slash breaking — Any value with / separators splits into individual columns, each with a small level index (1, 2, 3…) above it so you can scan rank-by-rank. Expand any champion like Lillia R or Garen Q to see it in action.

Here’s a concrete **PROJECT PLAN** to refactor your League patch notes parser into a **DOM → AST → Interpreter** architecture *and* add the dedicated **Alignment Parser** (the Akali-style “BEFORE/AFTER grid” bug).

(Quick note: the uploaded `patch-parser.jsx` appears expired on my side right now, so this plan is implementation-ready but not yet mapped to your exact codebase. If you re-upload the file later, I’ll convert this plan into a step-by-step migration PR.)

---

## 0) Goals and non-goals

### Goals

* Parse Riot patch notes into structured JSON:

  * Champions → base stats + abilities + deltas
  * Items → deltas
  * Systems/modes → deltas
  * Preserve “raw” text for fidelity/debugging
* Robust to markup changes (new sections, reordering, formatting changes)
* Fix/handle **aligned series tables** (BEFORE/AFTER grids with breakpoints)

### Non-goals (for phase 1)

* Perfect “buff/nerf” semantic classification for every stat (optional later)
* Full historical scraping backfill (optional phase 4)

---

## 1) Deliverables

1. **Refactored parser pipeline**

   * `fetchHtml()` (static + headless fallback)
   * `domToBlocks()` normalizer
   * `blocksToAst()` heading tree builder
   * `interpretPatch()` with pluggable interpreters

2. **Alignment Parser**

   * Extract grid-based before/after series + breakpoints + units
   * Handles `.9s` formatting, strike-through, missing columns

3. **Schema**

   * `PatchData` JSON schema (typed TS interfaces or JSON schema file)
   * Includes `raw` fields and `warnings[]`

4. **Test suite**

   * Fixtures for:

     * Simple delta bullets
     * Champion base stats
     * Ability section parsing
     * Alignment grid case (Akali)
   * Snapshot tests for whole-patch parsing

5. **CLI / runner**

   * `node cli/parsePatch.js <url>`
   * Writes `patch-xx-yy.json`

---

## 2) Work breakdown structure (WBS)

### Phase 1 — Foundations (DOM → Blocks → AST)

**Objective:** build stable intermediate representations so extraction isn’t brittle.

**Tasks**

* Define types: `Block`, `AstNode`, `PatchData`
* Implement `domToBlocks()`:

  * `h2/h3/h4` headings
  * `p`, `li` content
  * `<table>` as `table` block
  * “pseudo table” detection (div-grid)
  * normalize text, keep `html` for debug
* Implement `blocksToAst()` stack-based heading tree
* Implement `validatePage()` sanity checks

**Acceptance criteria**

* For a given patch URL, output an AST with correct nesting
* No League-specific assumptions in this phase

---

### Phase 2 — Interpreters (Champions, Items, Systems)

**Objective:** convert AST into structured patch data.

**Tasks**

* Implement `findSection(ast, /Champions/i)` etc.
* Champions interpreter:

  * H3 = champion
  * H4 blocks = “Base Stats”, “Q/W/E/R - Name”, etc.
  * Within each block:

    * parse list-item deltas (`A ⇒ B`)
    * capture paragraphs as “notes/summary”
* Items interpreter:

  * H3 = item name
  * list items = deltas
* Systems interpreter:

  * configurable allowlist for system sections (ARAM, Arena, Ranked, etc.)
  * fallback to generic section interpreter

**Acceptance criteria**

* Produces `PatchData` with champions/items/systems populated for at least 2 patches
* Unrecognized sections are preserved under `other[]`

---

### Phase 3 — Alignment Parser (Additional Bug Fix)

**Objective:** reliably parse BEFORE/AFTER grids like your Akali screenshot.

**Tasks**

* Detection heuristic:

  * block contains BEFORE + AFTER labels
  * contains a sequence of numeric tokens in rows
* Parse series values:

  * allow `.9s` → `0.9`
  * unit extraction
  * preserve `values_raw`
* Parse breakpoints from footnotes:

  * `at game times 0:00 8:00 …`
  * `at levels 1 7 10 13 16`
* Attach to correct context:

  * label comes from nearest preceding heading/paragraph (“Restealth Timer”)
  * ability context comes from current H4 ability section
* Add warnings on mismatch counts

**Acceptance criteria**

* Alignment grids become:

  * `type: aligned_series`
  * `before/after.values[]`
  * `breakpoints` typed correctly
* No data loss of decimals or missing leading zeros

---

### Phase 4 — Performance + Robustness

**Objective:** scale and reduce brittleness.

**Tasks**

* Two-pass parsing:

  * lightweight scan to locate article content root
  * parse only within that subtree
* Avoid expensive `innerText` on huge nodes; limit extraction scope
* Cache:

  * HTML by URL
  * parsed blocks/ast by URL
* Add headless fallback only if validation fails

**Acceptance criteria**

* Parses a patch page quickly and consistently
* Doesn’t require headless for normal pages

---

## 3) Proposed module structure

```
src/
  fetch/
    fetchHtml.js
    validatePage.js
  normalize/
    domToBlocks.js
    cleanText.js
    detectPseudoTables.js
  ast/
    blocksToAst.js
    types.js
  interpret/
    index.js
    champions.js
    items.js
    systems.js
    generic.js
    alignment.js
  schema/
    patchTypes.d.ts (or patch.schema.json)
  cli/
    parsePatch.js
test/
  fixtures/
  parsePatch.test.js
```

---

## 4) Risk log + mitigations

* **Riot markup changes** → mitigated by:

  * block-based normalization and heading-tree AST
  * generic interpreter fallback
* **Pseudo-table variety** → mitigated by:

  * detection based on semantic tokens (BEFORE/AFTER), not CSS classes
* **Decimals / formatting** → mitigated by:

  * permissive numeric regex that supports `.9`
  * preserving `raw` always
* **Dynamic content** → mitigated by:

  * headless fallback only on validation failure

---

## 5) Timeline (dependency order)

(Sequence, not time estimate)

1. Types + schema
2. DOM→Blocks
3. Blocks→AST
4. Champions interpreter
5. Items interpreter
6. Systems + generic interpreter
7. Alignment parser
8. Tests + fixtures
9. Perf + caching + headless fallback

---

## 6) What I need to produce the actual refactor PR

Re-upload:

* `patch-parser.jsx` (current)
  Optionally:
* any helper files it imports
* a sample HTML snippet / saved patch HTML for fixtures

Once I have those, I’ll return:

* a refactored codebase (same language/tooling you’re using)
* a clear migration mapping from existing functions to the new pipeline
* tests including the Akali alignment case


### Stages
1. **normalize/** — `cleanText.js` (value normalization, breakpoint parsing, slash splitting) + `domToBlocks.js` (markdown→Block[])
2. **ast/** — `blocksToAst.js` (heading-stack → tree) + `astTypes.js` (type constructors)
3. **interpret/** — `champions.js`, `items.js`, `systems.js` (section interpreters) + `alignment.js` (stat line parser)

### Schema Types
- `aligned_series` — multi-rank values with breakpoint metadata (`spell_rank`, `champion_level`, `game_time`)
- `scalar` — single numeric value with delta
- `text` — qualitative/behavioral change

## Usage

```bash
node parsePatch.js fixtures/26.5.md --debug
node parsePatch.js fixtures/26.5.md > output.json
```

## Bugfixes (v2)
- `splitSlashValues` strips trailing text from last value (Akali `.625s after your last...`)
- Compound expressions decomposed: base values + parenthetical ratios as separate stats (Garen E, Varus W)
- Verdict detection: cooldowns/costs lower=buff, higher=nerf
- Role detection regex improved for junglers, mid laners

# Full codebase uploaded. 

Let me assemble the project, wire the pipeline, test it against 26.5, and integrate with the display.Now let me save the 26.5 markdown content and run the parser pipeline against it.Pipeline runs. 14 champions, 2 items, 12 systems, 32 stats extracted. Let me capture the bugs and fix them.Six bugs found. Let me fix the critical ones in the pipeline.Now update champion interpreter to handle array returns from parseStatLine:Now fix role detection and verdict logic:Compound decomposition working — Garen E now has `Damage per spin` (base, identical) + `Damage per spin (ratio)` (the actual change). Pipeline is solid. Let me save the output and package.Assembled, tested, and bugfixed the full pipeline. Here's what happened:

**Pipeline validated** against 26.5 markdown → 14 champions, 35 stats, 2 items, 12 systems extracted. The `aligned_series` schema from the SEARCH doc architecture is fully operational — breakpoint types (`spell_rank`, `champion_level`, `game_time`) detected correctly, Akali's `TIME ⇒ LEVEL` transition preserved.

**6 bugs fixed** across 4 files:

| File | Bug | Fix |
|---|---|---|
| `cleanText.js` | `splitSlashValues` — Akali's last value contaminated with trailing text (`".625s after your last attack or ability"`) | Regex strips non-numeric trailing text from final slash value |
| `alignment.js` | Compound expressions (Garen E `4/7/10/13/16 (+38/41/44/47/50% AD)`) — base values identical, ratio change lost | Detects identical base values, decomposes parenthetical into separate `(ratio)` stat entry |
| `champions.js` | Verdict logic — Orianna CD increase read as BUFF, Nocturne CD decrease read as ADJUSTED | `lowerIsBetter` regex inverts direction for cooldown/cost/mana stats |
| `items.js` | Hubris cost reduction read as NERF + missing closing brace | Same `lowerIsBetter` pattern + syntax fix |

**Remaining known issues** (minor): Akali/Lee Sin/Lillia role detection returns "Unknown" — their context text doesn't contain explicit lane keywords. Solvable with a champion→role lookup table rather than context heuristics.