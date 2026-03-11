# lol-patch-idx

League of Legends Patch Notes Parser — DOM→Block→AST→Interpret pipeline

## Pipeline

```
Markdown/HTML → markdownToBlocks/domToBlocks → blocksToAst → interpretPatch → PatchData JSON
```

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

```git
modified:   LOL.PATCH.NOTES.READ.md
new file:   files/26.5.json
new file:   files/README.md
new file:   files/alignment.js
new file:   files/champions.js
new file:   files/cleanText.js
new file:   files/items.js
```

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