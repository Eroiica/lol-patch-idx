// ═══════════════════════════════════════════════════════════════
// Generic Section Interpreter
// Catches any section not handled by champions/items/systems
// ═══════════════════════════════════════════════════════════════

const { getContentBlocks } = require("../ast/blocksToAst");

function interpretGenericSection(section) {
  const blocks = getContentBlocks(section);
  const paragraphs = blocks.filter(b => b.kind === "paragraph").map(b => b.text);
  const listItems = blocks.filter(b => b.kind === "listItem").map(b => b.text);

  return {
    title: section.title,
    level: section.level,
    paragraphs,
    listItems,
    blockCount: blocks.length,
  };
}

module.exports = { interpretGenericSection };
