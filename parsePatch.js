#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// League Patch Notes Parser — CLI
//
// Usage:
//   node parsePatch.js <markdown-file>    Parse from saved markdown
//   node parsePatch.js --url <url>        Parse from URL (requires fetch)
//   node parsePatch.js --stdin            Parse from stdin
//
// Pipeline: Content → Blocks → AST → Interpret → PatchData JSON
// ═══════════════════════════════════════════════════════════════

const fs = require("fs");
const path = require("path");
const { markdownToBlocks } = require("./src/normalize/domToBlocks");
const { blocksToAst } = require("./src/ast/blocksToAst");
const { interpretPatch } = require("./src/interpret/index");

function parseMarkdown(content, sourceUrl) {
  // Stage 2: Content → Blocks
  const blocks = markdownToBlocks(content);

  // Stage 3: Blocks → AST
  const ast = blocksToAst(blocks);

  // Stage 4: AST → PatchData
  const patchData = interpretPatch(ast, sourceUrl);

  return { blocks, ast, patchData };
}

// --- CLI ---
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error("Usage: node parsePatch.js <markdown-file> [--debug]");
    console.error("       node parsePatch.js --stdin [--debug]");
    process.exit(1);
  }

  const debug = args.includes("--debug");
  const debugBlocks = args.includes("--debug-blocks");
  const debugAst = args.includes("--debug-ast");

  let content = "";
  let sourceUrl = "";

  if (args[0] === "--stdin") {
    content = fs.readFileSync(0, "utf-8");
  } else {
    const filePath = args[0];
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      process.exit(1);
    }
    content = fs.readFileSync(filePath, "utf-8");

    // Try to extract URL from content
    const urlMatch = content.match(/https:\/\/.*leagueoflegends\.com[^\s)]+/);
    if (urlMatch) sourceUrl = urlMatch[0];
  }

  const { blocks, ast, patchData } = parseMarkdown(content, sourceUrl);

  if (debugBlocks) {
    console.error("=== BLOCKS ===");
    console.error(JSON.stringify(blocks.slice(0, 30), null, 2));
    console.error(`... (${blocks.length} total blocks)`);
    console.error("");
  }

  if (debugAst) {
    console.error("=== AST (first 3 sections) ===");
    const preview = { ...ast, children: ast.children.slice(0, 3) };
    console.error(JSON.stringify(preview, null, 2));
    console.error("");
  }

  if (debug) {
    console.error("=== PARSE SUMMARY ===");
    console.error(`Blocks: ${blocks.length}`);
    console.error(`Champions: ${patchData.champions.length}`);
    console.error(`Items: ${patchData.items.length}`);
    console.error(`Systems: ${patchData.systems.length}`);
    console.error(`Total stats: ${patchData.champions.reduce((n, c) => n + c.changes.reduce((m, ch) => m + ch.stats.length, 0), 0)}`);
    console.error("");
  }

  // Output final JSON
  console.log(JSON.stringify(patchData, null, 2));
}

main().catch(err => {
  console.error("Error:", err.message);
  process.exit(1);
});

module.exports = { parseMarkdown };
