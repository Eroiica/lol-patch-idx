# lol-patch-idx

League of Legends Patch Notes Parser — **DOM → Block → AST → Interpret** pipeline.

Parses Riot patch notes (markdown or HTML) into structured JSON with typed stat changes, champion/item/system groupings, and automatic buff/nerf/adjusted classification.

## Pipeline

```
Markdown/HTML → markdownToBlocks / domToBlocks → blocksToAst → interpretPatch → PatchData JSON
```

### Stages

1. **normalize/** — `cleanText.js` (value normalization, breakpoint parsing, slash splitting) + `domToBlocks.js` (markdown/HTML → Block[])
2. **ast/** — `blocksToAst.js` (heading-stack → tree) + `types.js` (type constructors)
3. **interpret/** — `champions.js`, `items.js`, `systems.js` (section interpreters) + `alignment.js` (stat line parser) + `generic.js` (fallback)
4. **fetch/** — `fetchHtml.js` (HTTP fetch) + `validatePage.js` (sanity checks)
5. **schema/** — `patchTypes.js` (JSDoc types + JSON Schema)

## Schema Types

| Type | Description | Example |
|------|-------------|---------|
| `aligned_series` | Multi-rank values with breakpoint metadata | `35 / 65 / 95 ⇒ 45 / 72 / 99` (spell_rank) |
| `scalar` | Single numeric value with delta | `119 ⇒ 108` (delta: -11) |
| `text` | Qualitative/behavioral change | `Old behavior ⇒ New behavior` |

### Breakpoint Types

- `spell_rank` — values per ability rank (1–5)
- `champion_level` — values at specific champion levels
- `game_time` — values at game timestamps (0:00, 8:00, etc.)
- `item_level` — values per item upgrade tier

## Usage

### Parse from markdown file

```bash
node cli/parsePatch.js test/fixtures/26.5.md
node cli/parsePatch.js test/fixtures/26.5.md --debug
node cli/parsePatch.js test/fixtures/26.5.md -o output/26.5.json
```

### Parse from stdin

```bash
cat saved-patch.md | node cli/parsePatch.js --stdin
```

### Parse from URL (requires `npm install cheerio`)

```bash
node cli/parsePatch.js --url https://www.leagueoflegends.com/en-us/news/game-updates/league-of-legends-patch-26-5-notes/
```

### CLI Flags

| Flag | Description |
|------|-------------|
| `--debug` | Print parse summary to stderr |
| `--debug-blocks` | Print first 30 blocks to stderr |
| `--debug-ast` | Print first 3 AST sections to stderr |
| `--validate` | Run validation checks and show warnings |
| `-o <file>` | Write JSON output to file |

## Run Tests

```bash
npm test
npm run test:verbose
```

## Project Structure

```
lol-patch-idx/
  cli/
    parsePatch.js          # CLI entry point
  src/
    fetch/
      fetchHtml.js         # HTTP fetch with timeout
      validatePage.js      # Content sanity checks
    normalize/
      cleanText.js         # Text normalization, value parsing
      domToBlocks.js       # HTML/markdown → Block[]
    ast/
      blocksToAst.js       # Block[] → heading tree
      types.js             # Block/AST node constructors
    interpret/
      index.js             # Dispatcher — assembles PatchData
      alignment.js         # Stat line parser (aligned_series, scalar, text)
      champions.js         # Champions section interpreter
      items.js             # Items section interpreter
      systems.js           # Systems section interpreter
      generic.js           # Fallback for unrecognized sections
    schema/
      patchTypes.js        # JSDoc types + JSON Schema
  test/
    fixtures/
      26.5.md              # Sample patch notes fixture
    parsePatch.test.js     # Test suite (node:test)
  docs/                    # Architecture & research docs
```

## Key Bugfixes (v2)

- `splitSlashValues` strips trailing text from last value (Akali `.625s after your last...`)
- Compound expressions decomposed: base values + parenthetical ratios as separate stats (Garen E, Varus W)
- Verdict detection: cooldowns/costs lower = buff, higher = nerf (inverted semantics)
- Role detection: static champion→role lookup table fallback when context text lacks lane keywords
- Alignment parser: `.9s` → `0.9` normalization, breakpoint type detection from parenthetical notes

## Output Example (abridged)

```json
{
  "patch": "26.5",
  "title": "League of Legends Patch 26.5 Notes",
  "summary": "14 champion changes (4 buffs, 3 nerfs, 7 adjusted), 2 item changes, 12 system changes.",
  "champions": [
    {
      "name": "Akali",
      "role": "Mid / Top",
      "verdict": "ADJUSTED",
      "changes": [{
        "ability": "W - Twilight Shroud",
        "stats": [{
          "stat": "Restealth Timer",
          "type": "aligned_series",
          "unit": "s",
          "before": { "values": ["1s",".9s",".825s",".725s",".625s"], "breakpoint_type": "game_time" },
          "after":  { "values": ["1s",".9s",".825s",".725s",".625s"], "breakpoint_type": "champion_level" }
        }]
      }]
    }
  ]
}
```
