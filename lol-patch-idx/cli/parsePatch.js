#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// League Patch Notes Parser — CLI
//
// Usage:
//   node cli/parsePatch.js <markdown-file>        Parse from saved markdown
//   node cli/parsePatch.js --url <url>             Parse from URL (requires cheerio)
//   node cli/parsePatch.js --stdin                 Parse from stdin
//
// Flags:
//   --debug          Show parse summary
//   --debug-blocks   Show first 30 blocks
//   --debug-ast      Show first 3 AST sections
//   --validate       Run validation checks
//   -o <file>        Write output to file instead of stdout
//
// Pipeline: Content → Blocks → AST → Interpret → PatchData JSON
// ═══════════════════════════════════════════════════════════════

const fs = require("fs");
const path = require("path");
const { markdownToBlocks } = require("../src/normalize/domToBlocks");
const { blocksToAst } = require("../src/ast/blocksToAst");
const { interpretPatch } = require("../src/interpret/index");
const { validateBlocks, validatePatchData } = require("../src/fetch/validatePage");

function parseMarkdown(content, sourceUrl) {
  const blocks = markdownToBlocks(content);
  const ast = blocksToAst(blocks);
  const patchData = interpretPatch(ast, sourceUrl);
  return { blocks, ast, patchData };
}

async function parseUrl(url) {
  let cheerio;
  try {
    cheerio = require("cheerio");
  } catch {
    console.error("Error: cheerio is required for URL parsing.");
    console.error("Install with: npm install cheerio");
    process.exit(1);
  }

  const { fetchHtml } = require("../src/fetch/fetchHtml");
  const { domToBlocks } = require("../src/normalize/domToBlocks");

  const html = await fetchHtml(url);
  const $ = cheerio.load(html);
  const blocks = domToBlocks($);
  const ast = blocksToAst(blocks);
  const patchData = interpretPatch(ast, url);
  return { blocks, ast, patchData };
}

// --- CLI ---
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error(`
lol-patch-idx — League of Legends Patch Notes Parser

Usage:
  node cli/parsePatch.js <markdown-file> [flags]
  node cli/parsePatch.js --url <url> [flags]
  node cli/parsePatch.js --stdin [flags]

Flags:
  --debug          Show parse summary on stderr
  --debug-blocks   Show first 30 blocks on stderr
  --debug-ast      Show first 3 AST sections on stderr
  --validate       Run validation and show warnings
  -o <file>        Write JSON to file instead of stdout

Examples:
  node cli/parsePatch.js test/fixtures/26.5.md --debug
  node cli/parsePatch.js test/fixtures/26.5.md -o output/26.5.json
  node cli/parsePatch.js --stdin < saved-page.md
`);
    process.exit(1);
  }

  const debug = args.includes("--debug");
  const debugBlocks = args.includes("--debug-blocks");
  const debugAst = args.includes("--debug-ast");
  const validate = args.includes("--validate");
  const outIdx = args.indexOf("-o");
  const outFile = outIdx !== -1 ? args[outIdx + 1] : null;

  let result;

  if (args[0] === "--url") {
    const url = args[1];
    if (!url) { console.error("Error: --url requires a URL argument"); process.exit(1); }
    result = await parseUrl(url);
  } else if (args[0] === "--stdin") {
    const content = fs.readFileSync(0, "utf-8");
    result = parseMarkdown(content, "");
  } else {
    const filePath = args[0];
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      process.exit(1);
    }
    const content = fs.readFileSync(filePath, "utf-8");
    const urlMatch = content.match(/https:\/\/.*leagueoflegends\.com[^\s)]+/);
    result = parseMarkdown(content, urlMatch ? urlMatch[0] : "");
  }

  const { blocks, ast, patchData } = result;

  if (debugBlocks) {
    console.error("=== BLOCKS ===");
    console.error(JSON.stringify(blocks.slice(0, 30), null, 2));
    console.error(`... (${blocks.length} total blocks)\n`);
  }

  if (debugAst) {
    console.error("=== AST (first 3 sections) ===");
    const preview = { ...ast, children: ast.children.slice(0, 3) };
    console.error(JSON.stringify(preview, null, 2));
    console.error("");
  }

  if (validate) {
    const bv = validateBlocks(blocks);
    const pv = validatePatchData(patchData);
    if (bv.warnings.length) console.error("[Block Warnings]", bv.warnings.join("; "));
    if (pv.warnings.length) console.error("[Data Warnings]", pv.warnings.join("; "));
  }

  if (debug) {
    const totalStats = patchData.champions.reduce(
      (n, c) => n + c.changes.reduce((m, ch) => m + ch.stats.length, 0), 0
    );
    console.error("=== PARSE SUMMARY ===");
    console.error(`Patch:      ${patchData.patch}`);
    console.error(`Blocks:     ${blocks.length}`);
    console.error(`Champions:  ${patchData.champions.length}`);
    console.error(`Items:      ${patchData.items.length}`);
    console.error(`Systems:    ${patchData.systems.length}`);
    console.error(`Stats:      ${totalStats}`);
    console.error(`Summary:    ${patchData.summary}`);
    console.error("");
  }

  const json = JSON.stringify(patchData, null, 2);

  if (outFile) {
    const dir = path.dirname(outFile);
    if (dir && !fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(outFile, json);
    console.error(`Written to ${outFile}`);
  } else {
    console.log(json);
  }
}

// Only run CLI when executed directly
if (require.main === module) {
  main().catch(err => {
    console.error("Error:", err.message);
    process.exit(1);
  });
}

module.exports = { parseMarkdown };
