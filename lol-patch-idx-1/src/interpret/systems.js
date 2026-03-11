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

function collectH2Sections(node) {
  const results = [];
  for (const child of node.children || []) {
    if (child.kind === "section" && child.level === 2) {
      results.push(child);
    } else if (child.kind === "section" && child.level < 2) {
      // Recurse into H1 wrappers
      results.push(...collectH2Sections(child));
    }
  }
  return results;
}

function interpretSystems(ast) {
  const systems = [];
  const h2Sections = collectH2Sections(ast);

  for (const child of h2Sections) {
    if (SKIP_SECTIONS.some(re => re.test(child.title))) continue;

    const category = detectCategory(child.title);
    const content = getContentBlocks(child);
    const paragraphs = content
      .filter(b => b.kind === "paragraph")
      .map(b => b.text);

    const summary = paragraphs.join(" ").slice(0, 300) || child.title;

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
        systems.push({
          name: child.title,
          category,
          summary,
        });
      }
    } else {
      systems.push({
        name: child.title,
        category,
        summary,
      });
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
