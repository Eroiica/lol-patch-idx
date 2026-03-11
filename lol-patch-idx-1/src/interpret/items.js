// ═══════════════════════════════════════════════════════════════
// Items Interpreter
// Finds "Items" H2, H3 children = individual items
// ═══════════════════════════════════════════════════════════════

const { findSection, getChildSections } = require("../ast/blocksToAst");
const { parseStatLine } = require("./alignment");

function interpretItems(ast) {
  const itemSections = findSection(ast, "Items");
  if (!itemSections.length) return [];

  const itemRoot = itemSections[0];
  const items = [];

  for (const itemNode of getChildSections(itemRoot)) {
    const name = itemNode.title;
    const contextBlocks = [];
    const changes = [];

    for (const child of (itemNode.children || [])) {
      if (child.kind === "content") {
        if (child.block.kind === "paragraph") {
          contextBlocks.push(child.block.text);
        }
        if (child.block.kind === "listItem") {
          const parsed = parseStatLine(child.block.text);
          if (parsed) {
            const results = Array.isArray(parsed) ? parsed : [parsed];
            changes.push(...results);
          }
        }
      }
    }

    const context = contextBlocks.join(" ").slice(0, 200);

    // Detect verdict (cost/price lower = buff)
    const lowerIsBetter = /\bcost\b|\bprice\b|\bcooldown\b|\bmana\b/i;
    let verdict = "ADJUSTED";
    const dirs = changes.map(c => {
      const inverted = lowerIsBetter.test(c.stat);
      if (c.delta) {
        if (String(c.delta).startsWith("+")) return inverted ? -1 : 1;
        if (String(c.delta).startsWith("-")) return inverted ? 1 : -1;
      }
      return 0;
    });
    const up = dirs.filter(d => d > 0).length;
    const down = dirs.filter(d => d < 0).length;
    if (up > 0 && down === 0) verdict = "BUFF";
    else if (down > 0 && up === 0) verdict = "NERF";

    items.push({
      name,
      category: detectItemCategory(name, context),
      verdict,
      context,
      changes,
    });
  }

  return items;
}

function detectItemCategory(name, context) {
  const text = `${name} ${context}`.toLowerCase();
  if (text.includes("assassin") || text.includes("lethality")) return "AD Assassin";
  if (text.includes("mage") || text.includes("ap")) return "AP Mage";
  if (text.includes("tank") || text.includes("armor") || text.includes("solari") || text.includes("locket")) return "Support Tank";
  if (text.includes("fighter") || text.includes("bruiser")) return "Fighter";
  if (text.includes("marksman") || text.includes("crit") || text.includes("attack speed")) return "Marksman";
  if (text.includes("support") || text.includes("heal") || text.includes("shield")) return "Support";
  return "General";
}

module.exports = { interpretItems };
