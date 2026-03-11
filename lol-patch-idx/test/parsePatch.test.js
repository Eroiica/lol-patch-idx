const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");

// --- Module imports ---
const { cleanText, splitBeforeAfter, normalizeValueToken, splitSlashValues, parseBreakpoints, extractParenNotes } = require("../src/normalize/cleanText");
const { markdownToBlocks } = require("../src/normalize/domToBlocks");
const { blocksToAst, findSection, getContentBlocks, getChildSections } = require("../src/ast/blocksToAst");
const { parseStatLine, computeDeltas } = require("../src/interpret/alignment");
const { interpretPatch } = require("../src/interpret/index");
const { parseMarkdown } = require("../cli/parsePatch");

// ═══════════════════════════════════════════════════════════════
// Stage 1: cleanText utilities
// ═══════════════════════════════════════════════════════════════

describe("cleanText", () => {
  it("strips markdown bold/italic and collapses whitespace", () => {
    assert.equal(cleanText("**Bold**  *italic*  text"), "Bold italic text");
  });

  it("handles null/empty", () => {
    assert.equal(cleanText(null), "");
    assert.equal(cleanText(""), "");
  });
});

describe("splitBeforeAfter", () => {
  it("splits on ⇒ arrow", () => {
    const r = splitBeforeAfter("119 ⇒ 108");
    assert.deepEqual(r, { before: "119", after: "108" });
  });

  it("splits on => arrow", () => {
    const r = splitBeforeAfter("3s => 2s");
    assert.deepEqual(r, { before: "3s", after: "2s" });
  });

  it("returns null for no arrow", () => {
    assert.equal(splitBeforeAfter("just text"), null);
  });
});

describe("normalizeValueToken", () => {
  it("normalizes .9s to 0.9 with unit s", () => {
    const r = normalizeValueToken(".9s");
    assert.equal(r.value, 0.9);
    assert.equal(r.unit, "s");
  });

  it("handles plain integers", () => {
    const r = normalizeValueToken("119");
    assert.equal(r.value, 119);
    assert.equal(r.unit, null);
  });

  it("handles percentage", () => {
    const r = normalizeValueToken("38%");
    assert.equal(r.value, 38);
    assert.equal(r.unit, "%");
  });

  it("returns null value for non-numeric", () => {
    const r = normalizeValueToken("hello");
    assert.equal(r.value, null);
  });
});

describe("splitSlashValues", () => {
  it("splits slash-separated values", () => {
    const r = splitSlashValues("60 / 90 / 120 / 150 / 180");
    assert.deepEqual(r, ["60", "90", "120", "150", "180"]);
  });

  it("strips trailing text from last value", () => {
    const r = splitSlashValues(".9s / .825s / .725s / .625s after your last attack");
    assert.equal(r.length, 4);
    assert.equal(r[3], ".625s");
  });

  it("returns null for non-slash text", () => {
    assert.equal(splitSlashValues("just a single value"), null);
  });
});

describe("parseBreakpoints", () => {
  it("detects game time breakpoints", () => {
    const r = parseBreakpoints("at game times 0:00 8:00 11:00 20:00 30:00");
    assert.equal(r.type, "game_time");
    assert.deepEqual(r.values, ["0:00", "8:00", "11:00", "20:00", "30:00"]);
  });

  it("detects champion level breakpoints", () => {
    const r = parseBreakpoints("at levels 1 7 10 13 16");
    assert.equal(r.type, "champion_level");
    assert.deepEqual(r.values, [1, 7, 10, 13, 16]);
  });

  it("returns null for non-breakpoint text", () => {
    assert.equal(parseBreakpoints("just some text"), null);
  });
});

describe("extractParenNotes", () => {
  it("extracts parenthetical expressions", () => {
    const r = extractParenNotes("4 / 7 / 10 (+38% AD) foo (+10% AP)");
    assert.deepEqual(r, ["+38% AD", "+10% AP"]);
  });
});

// ═══════════════════════════════════════════════════════════════
// Stage 2: markdownToBlocks
// ═══════════════════════════════════════════════════════════════

describe("markdownToBlocks", () => {
  it("parses headings at correct levels", () => {
    const blocks = markdownToBlocks("# H1\n## H2\n### H3\n#### H4");
    assert.equal(blocks[0].level, 1);
    assert.equal(blocks[1].level, 2);
    assert.equal(blocks[2].level, 3);
    assert.equal(blocks[3].level, 4);
  });

  it("parses list items", () => {
    const blocks = markdownToBlocks("- Damage: 100 ⇒ 120\n- Cooldown: 10 ⇒ 8");
    assert.equal(blocks.length, 2);
    assert.equal(blocks[0].kind, "listItem");
    assert.equal(blocks[1].kind, "listItem");
  });

  it("parses bold stat lines as list items", () => {
    const blocks = markdownToBlocks("**Health Growth**: 119 ⇒ 108");
    assert.equal(blocks[0].kind, "listItem");
    assert.ok(blocks[0].text.includes("Health Growth"));
  });

  it("skips image and link-only lines", () => {
    const blocks = markdownToBlocks("![alt](img.png)\n[link](url)\nactual text");
    assert.equal(blocks.length, 1);
    assert.equal(blocks[0].text, "actual text");
  });
});

// ═══════════════════════════════════════════════════════════════
// Stage 3: blocksToAst
// ═══════════════════════════════════════════════════════════════

describe("blocksToAst", () => {
  it("builds nested sections from headings", () => {
    const blocks = [
      { kind: "heading", level: 2, text: "Champions" },
      { kind: "heading", level: 3, text: "Akali" },
      { kind: "paragraph", text: "Context" },
      { kind: "heading", level: 3, text: "Garen" },
      { kind: "paragraph", text: "Context 2" },
    ];
    const ast = blocksToAst(blocks);
    assert.equal(ast.kind, "root");
    assert.equal(ast.children[0].title, "Champions");
    const champs = getChildSections(ast.children[0]);
    assert.equal(champs.length, 2);
    assert.equal(champs[0].title, "Akali");
    assert.equal(champs[1].title, "Garen");
  });

  it("findSection works with string and regex", () => {
    const blocks = [
      { kind: "heading", level: 2, text: "Champions" },
      { kind: "heading", level: 2, text: "Items" },
    ];
    const ast = blocksToAst(blocks);
    assert.equal(findSection(ast, "Champions").length, 1);
    assert.equal(findSection(ast, /items/i).length, 1);
    assert.equal(findSection(ast, "nonexistent").length, 0);
  });
});

// ═══════════════════════════════════════════════════════════════
// Stage 4: Alignment Parser (stat lines)
// ═══════════════════════════════════════════════════════════════

describe("parseStatLine", () => {
  it("parses scalar change", () => {
    const r = parseStatLine("Health Growth: 119 ⇒ 108");
    assert.equal(r.stat, "Health Growth");
    assert.equal(r.type, "scalar");
    assert.equal(r.delta, "-11");
  });

  it("parses aligned series (spell rank)", () => {
    const r = parseStatLine("Base Damage: 35 / 65 / 95 / 125 / 155 ⇒ 45 / 72 / 99 / 126 / 153");
    assert.equal(r.type, "aligned_series");
    assert.equal(r.before.values.length, 5);
    assert.equal(r.after.values.length, 5);
    assert.equal(r.before.breakpoint_type, "spell_rank");
  });

  it("detects game_time → champion_level breakpoint change (Akali)", () => {
    const text = "Restealth Timer: 1s / .9s / .825s / .725s / .625s (at game times 0:00 8:00 11:00 20:00 30:00) ⇒ 1s / .9s / .825s / .725s / .625s (at levels 1 7 10 13 16)";
    const r = parseStatLine(text);
    // Returns array because base values are identical (compound decomposition)
    const series = Array.isArray(r) ? r[0] : r;
    assert.equal(series.type, "aligned_series");
    assert.equal(series.before.breakpoint_type, "game_time");
    assert.equal(series.after.breakpoint_type, "champion_level");
  });

  it("decomposes compound expressions (base + ratio)", () => {
    const text = "Damage per Spin: 4 / 7 / 10 / 13 / 16 (+38 / 41 / 44 / 47 / 50% AD) ⇒ 4 / 7 / 10 / 13 / 16 (+40 / 43 / 46 / 49 / 52% AD)";
    const r = parseStatLine(text);
    assert.ok(Array.isArray(r), "Should return array for compound expression");
    assert.equal(r.length, 2);
    assert.equal(r[0].stat, "Damage per Spin");
    assert.ok(r[1].stat.includes("(ratio)"));
  });

  it("parses text-only change (no arrow)", () => {
    const r = parseStatLine("New Effect: Grants bonus damage on hit");
    assert.equal(r.type, "text");
    assert.equal(r.after.value, "Grants bonus damage on hit");
  });

  it("returns null for non-stat lines", () => {
    assert.equal(parseStatLine("Just a sentence with no colon separator"), null);
  });
});

describe("computeDeltas", () => {
  it("computes per-cell deltas", () => {
    const d = computeDeltas(["35", "65", "95"], ["45", "72", "99"]);
    assert.deepEqual(d, ["+10", "+7", "+4"]);
  });

  it("shows = for unchanged values", () => {
    const d = computeDeltas(["100", "200"], ["100", "200"]);
    assert.deepEqual(d, ["=", "="]);
  });

  it("returns null for mismatched lengths", () => {
    assert.equal(computeDeltas(["1", "2"], ["1"]), null);
  });
});

// ═══════════════════════════════════════════════════════════════
// Integration: Full pipeline on 26.5 fixture
// ═══════════════════════════════════════════════════════════════

describe("Full pipeline — Patch 26.5", () => {
  const fixturePath = path.join(__dirname, "fixtures", "26.5.md");
  let patchData;
  let blocks;

  it("fixture file exists", () => {
    assert.ok(fs.existsSync(fixturePath), "26.5.md fixture should exist");
  });

  it("parses without errors", () => {
    const content = fs.readFileSync(fixturePath, "utf-8");
    const result = parseMarkdown(content, "https://www.leagueoflegends.com/en-us/news/game-updates/league-of-legends-patch-26-5-notes/");
    patchData = result.patchData;
    blocks = result.blocks;
    assert.ok(patchData);
  });

  it("extracts patch version", () => {
    assert.equal(patchData.patch, "26.5");
  });

  it("extracts champions", () => {
    assert.ok(patchData.champions.length >= 10, `Expected 10+ champions, got ${patchData.champions.length}`);
    const names = patchData.champions.map(c => c.name);
    assert.ok(names.includes("Akali"));
    assert.ok(names.includes("Garen"));
    assert.ok(names.includes("Azir"));
  });

  it("classifies Akali as ADJUSTED (breakpoint type change)", () => {
    const akali = patchData.champions.find(c => c.name === "Akali");
    assert.ok(akali);
    assert.equal(akali.verdict, "ADJUSTED");
  });

  it("classifies Azir as NERF (health growth reduced)", () => {
    const azir = patchData.champions.find(c => c.name === "Azir");
    assert.ok(azir);
    assert.equal(azir.verdict, "NERF");
  });

  it("classifies Garen as BUFF", () => {
    const garen = patchData.champions.find(c => c.name === "Garen");
    assert.ok(garen);
    assert.equal(garen.verdict, "BUFF");
  });

  it("classifies Nocturne R cooldown reduction as BUFF", () => {
    const noc = patchData.champions.find(c => c.name === "Nocturne");
    assert.ok(noc);
    assert.equal(noc.verdict, "BUFF");
  });

  it("classifies Orianna Q cooldown increase as NERF", () => {
    const ori = patchData.champions.find(c => c.name === "Orianna");
    assert.ok(ori);
    assert.equal(ori.verdict, "NERF");
  });

  it("extracts items", () => {
    assert.ok(patchData.items.length >= 2, `Expected 2+ items, got ${patchData.items.length}`);
    const hubris = patchData.items.find(i => i.name === "Hubris");
    assert.ok(hubris);
  });

  it("extracts systems", () => {
    assert.ok(patchData.systems.length >= 3, `Expected 3+ systems, got ${patchData.systems.length}`);
  });

  it("produces valid summary string", () => {
    assert.ok(patchData.summary.includes("champion changes"));
    assert.ok(patchData.summary.includes("item changes"));
  });

  it("Akali W has aligned_series with breakpoint transition", () => {
    const akali = patchData.champions.find(c => c.name === "Akali");
    const w = akali.changes.find(ch => ch.ability.includes("Twilight Shroud"));
    assert.ok(w, "Should have W - Twilight Shroud ability group");
    const stat = w.stats[0];
    assert.equal(stat.type, "aligned_series");
    assert.equal(stat.before.breakpoint_type, "game_time");
    assert.equal(stat.after.breakpoint_type, "champion_level");
  });

  it("Garen E decomposes into base + ratio stats", () => {
    const garen = patchData.champions.find(c => c.name === "Garen");
    const e = garen.changes.find(ch => ch.ability.includes("Judgment"));
    assert.ok(e, "Should have E - Judgment ability group");
    assert.ok(e.stats.length >= 2, "Should decompose into base + ratio");
    assert.ok(e.stats.some(s => s.stat.includes("(ratio)")));
  });
});
