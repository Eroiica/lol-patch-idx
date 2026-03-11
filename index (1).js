// ═══════════════════════════════════════════════════════════════
// Stage 4: Interpreter Dispatcher
//
// Assembles full PatchData from AST using pluggable interpreters
// ═══════════════════════════════════════════════════════════════

const { interpretChampions } = require("./champions");
const { interpretItems } = require("./items");
const { interpretSystems } = require("./systems");

function extractMeta(ast, url) {
  let patch = null;
  let date = null;
  let title = null;

  // Walk all nodes for title/date
  function walk(node) {
    if (node.kind === "section") {
      if (!title) title = node.title;
      // Check H1 first — it has the patch title
      if (node.level === 1 && !patch) {
        const m = node.title.match(/(\d+\.\d+)/);
        if (m) patch = m[1];
        title = node.title;
      }
    }
    if (node.kind === "content" && node.block.kind === "paragraph") {
      const dateMatch = node.block.text.match(/\b(\d{4}-\d{2}-\d{2})\b/);
      if (dateMatch && !date) date = dateMatch[1];
    }
    if (node.children) for (const c of node.children) walk(c);
  }
  walk(ast);

  // Extract from URL
  if (url && !patch) {
    const patchMatch = url.match(/patch[- ]?(\d+)[- .](\d+)/i);
    if (patchMatch) patch = `${patchMatch[1]}.${patchMatch[2]}`;
  }

  // Fallback from title
  if (!patch && title) {
    const m = title.match(/(\d+\.\d+)/);
    if (m) patch = m[1];
  }

  return {
    patch: patch || "unknown",
    date: date || new Date().toISOString().split("T")[0],
    title: title || `Patch ${patch || "unknown"} Notes`,
  };
}

function interpretPatch(ast, url) {
  const meta = extractMeta(ast, url);
  const champions = interpretChampions(ast);
  const items = interpretItems(ast);
  const systems = interpretSystems(ast);

  // Compute summary
  const champCount = champions.length;
  const buffCount = champions.filter(c => c.verdict === "BUFF").length;
  const nerfCount = champions.filter(c => c.verdict === "NERF").length;
  const adjCount = champions.filter(c => c.verdict === "ADJUSTED").length;

  return {
    ...meta,
    summary: `${champCount} champion changes (${buffCount} buffs, ${nerfCount} nerfs, ${adjCount} adjusted), ${items.length} item changes, ${systems.length} system changes.`,
    champions,
    items,
    systems,
  };
}

module.exports = { interpretPatch, extractMeta };
