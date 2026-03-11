// ═══════════════════════════════════════════════════════════════
// Champions Interpreter
//
// Finds the "Champions" H2 section in the AST.
// Each H3 child = champion. H4 children = ability groups.
// List items under abilities = stat change lines.
// ═══════════════════════════════════════════════════════════════

const { findSection, getChildSections, getContentBlocks } = require("../ast/blocksToAst");
const { parseStatLine } = require("./alignment");

// Known champion icon URL pattern
const ICON_URL = (name) => {
  const clean = name.replace(/['\s]/g, "");
  return `https://am-a.akamaihd.net/image?f=https://ddragon.leagueoflegends.com/cdn/16.4.1/img/champion/${clean}.png`;
};

// Role detection heuristics from context text
const ROLE_KEYWORDS = {
  "top": /\btop\s*lane\b|\bjuggernaut\b|\bbruiser\b|\btop\b/i,
  "jungle": /\bjungle\b|\bjungler\b|\bclear\b.*\bcamp\b/i,
  "mid": /\bmid\s*lane\b|\bmid\b.*\blaner\b|\bmage\b|\bassassin\b/i,
  "bot": /\bbot\s*lane\b|\bbot\b|\badc\b|\bmarksman\b/i,
  "support": /\bsupport\b|\butility\b/i,
};

function detectRole(context) {
  const roles = [];
  for (const [role, re] of Object.entries(ROLE_KEYWORDS)) {
    if (re.test(context)) roles.push(role.charAt(0).toUpperCase() + role.slice(1));
  }
  return roles.length ? roles.join(" / ") : "Unknown";
}

function detectVerdict(stats) {
  let buffs = 0, nerfs = 0, text = 0;
  for (const s of stats) {
    if (s.type === "text") { text++; continue; }
    if (s.type === "scalar") {
      if (s.delta && s.delta.startsWith("+")) buffs++;
      else if (s.delta && s.delta.startsWith("-")) nerfs++;
      continue;
    }
    if (s.type === "aligned_series") {
      // Check first value delta direction
      const bv = parseFloat(s.before.values[0]);
      const av = parseFloat(s.after.values[0]);
      if (!isNaN(bv) && !isNaN(av)) {
        if (av > bv) buffs++;
        else if (av < bv) nerfs++;
      }
    }
  }
  if (buffs > 0 && nerfs > 0) return "ADJUSTED";
  if (buffs > 0) return "BUFF";
  if (nerfs > 0) return "NERF";
  if (text > 0) return "ADJUSTED";
  return "ADJUSTED";
}

function interpretChampions(ast) {
  const champSections = findSection(ast, "Champions");
  if (!champSections.length) return [];

  const champRoot = champSections[0];
  const champions = [];

  for (const champNode of getChildSections(champRoot)) {
    const name = champNode.title;
    const contextBlocks = [];
    const abilityGroups = [];

    // Walk champion's children
    for (const child of champNode.children) {
      if (child.kind === "content") {
        // Paragraph = design context (the blockquote explanation)
        if (child.block.kind === "paragraph") {
          contextBlocks.push(child.block.text);
        }
        // List items at champion level = base stat changes or misc
        if (child.block.kind === "listItem") {
          const parsed = parseStatLine(child.block.text);
          if (parsed) {
            // Attach to a "Base Stats" or "Misc" ability group
            let baseGroup = abilityGroups.find(g => g.ability === "Base Stats");
            if (!baseGroup) {
              baseGroup = { ability: "Base Stats", stats: [] };
              abilityGroups.push(baseGroup);
            }
            baseGroup.stats.push(parsed);
          }
        }
      }

      if (child.kind === "section") {
        // H4 section = ability group
        const abilityName = child.title;
        const stats = [];

        for (const abilityChild of (child.children || [])) {
          if (abilityChild.kind === "content" && abilityChild.block.kind === "listItem") {
            const parsed = parseStatLine(abilityChild.block.text);
            if (parsed) stats.push(parsed);
          }
        }

        if (stats.length) {
          abilityGroups.push({ ability: abilityName, stats });
        }
      }
    }

    const context = contextBlocks.join(" ").slice(0, 200);
    const allStats = abilityGroups.flatMap(g => g.stats);

    champions.push({
      name,
      role: detectRole(context),
      verdict: detectVerdict(allStats),
      icon: ICON_URL(name),
      context,
      changes: abilityGroups,
    });
  }

  return champions;
}

module.exports = { interpretChampions };
