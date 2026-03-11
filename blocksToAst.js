// ═══════════════════════════════════════════════════════════════
// Stage 3: Block[] → AST (heading tree)
//
// Pure structural pass. No League-specific logic.
// Uses stack-based algorithm: headings open sections,
// content blocks are leaves under the current section.
// ═══════════════════════════════════════════════════════════════

function blocksToAst(blocks) {
  const root = { kind: "root", children: [] };
  const stack = [root];

  for (const block of blocks) {
    if (block.kind === "heading") {
      const node = {
        kind: "section",
        level: block.level,
        title: block.text,
        children: [],
      };

      // Pop stack until we find a parent with a lower level
      while (stack.length > 1) {
        const top = stack[stack.length - 1];
        if (top.kind === "section" && top.level >= block.level) {
          stack.pop();
        } else {
          break;
        }
      }

      stack[stack.length - 1].children.push(node);
      stack.push(node);
    } else if (block.kind === "hr") {
      // HRs don't create nodes but can serve as implicit section breaks
      // We keep them as content for interpreters to use
      stack[stack.length - 1].children.push({ kind: "content", block });
    } else {
      stack[stack.length - 1].children.push({ kind: "content", block });
    }
  }

  return root;
}

// Find a section by title pattern
function findSection(ast, titlePattern) {
  const results = [];
  function walk(node) {
    if (node.kind === "section") {
      if (typeof titlePattern === "string"
        ? node.title.toLowerCase().includes(titlePattern.toLowerCase())
        : titlePattern.test(node.title)) {
        results.push(node);
      }
    }
    if (node.children) {
      for (const child of node.children) walk(child);
    }
  }
  walk(ast);
  return results;
}

// Get all content blocks under a section
function getContentBlocks(section) {
  const blocks = [];
  function walk(node) {
    if (node.kind === "content") {
      blocks.push(node.block);
    }
    if (node.children) {
      for (const child of node.children) walk(child);
    }
  }
  walk(section);
  return blocks;
}

// Get direct child sections
function getChildSections(section) {
  return (section.children || []).filter(c => c.kind === "section");
}

module.exports = { blocksToAst, findSection, getContentBlocks, getChildSections };
