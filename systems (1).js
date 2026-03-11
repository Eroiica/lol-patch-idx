// ═══════════════════════════════════════════════════════════════
// Systems Interpreter
// Captures non-champion, non-item H2 sections as system changes
// ═══════════════════════════════════════════════════════════════

const { getContentBlocks, getChildSections } = require("../ast/blocksToAst");

// Sections that should be treated as "systems"
const SYSTEM_PATTERNS = [
  { pattern: /ranked/i, category: "Ranked" },
  { pattern: /matchmak/i, category: "Matchmaking" },
  { pattern: /gameplay|last hit|indicator/i, category: "Gameplay" },
  { pattern: /chat|penalt|ban|punish/i, category: "Behavioral" },
  { pattern: /brawl|mode|return/i, category: "Modes" },
  { pattern: /aram|mayhem/i, category: "ARAM" },
  { pattern: /arena/i, category: "Arena" },
  { pattern: /bugfix/i, category: "Bugfixes" },
  { pattern: /skin|chroma/i, category: "Cosmetics" },
  { pattern: /demacia|event/i, category: "Events" },
  { pattern: /battle\s*pass|act\s*\d/i, category: "Battle Pass" },
];

// Sections to skip (handled by other interpreters)
const SKIP_SECTIONS = [/^champions$/i, /^items$/i, /^patch highlights$/i, /^related/i, /^upcoming skins/i];

function interpretSystems(ast) {
  const systems = [];

  // Collect all level-2 sections from anywhere in the tree
  function findH2Sections(node) {
    const results = [];
    if (node.kind === "section" && node.level === 2) {
      results.push(node);
    }
    if (node.children) {
      for (const c of node.children) {
        results.push(...findH2Sections(c));
      }
    }
    return results;
  }

  const h2s = findH2Sections(ast);

  for (const child of h2s) {
    // Skip sections handled elsewhere
    if (SKIP_SECTIONS.some(re => re.test(child.title))) continue;

    const category = detectCategory(child.title);
    const content = getContentBlocks(child);
    const paragraphs = content
      .filter(b => b.kind === "paragraph")
      .map(b => b.text);

    const summary = paragraphs.join(" ").slice(0, 300) || child.title;

    // Check for subsections
    const subs = getChildSections(child);
    if (subs.length > 0) {
      for (const sub of subs) {
        const subContent = getContentBlocks(sub);
        const subParagraphs = subContent.filter(b => b.kind === "paragraph").map(b => b.text);
        const subSummary = subParagraphs.join(" ").slice(0, 200) || sub.title;

        systems.push({
          name: `${child.title}: ${sub.title}`,
          category: detectCategory(`${child.title} ${sub.title}`),
          summary: subSummary,
        });
      }

      if (paragraphs.length > 0) {
        systems.push({ name: child.title, category, summary });
      }
    } else {
      systems.push({ name: child.title, category, summary });
    }
  }

  return systems;
}

function detectCategory(title) {
  for (const { pattern, category } of SYSTEM_PATTERNS) {
    if (pattern.test(title)) return category;
  }
  return "General";
}

module.exports = { interpretSystems };
