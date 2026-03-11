// ═══════════════════════════════════════════════════════════════
// Champions Interpreter
//
// Finds the "Champions" H2 section in the AST.
// Each H3 child = champion. H4 children = ability groups.
// List items under abilities = stat change lines.
// ═══════════════════════════════════════════════════════════════

const { findSection, getChildSections } = require("../ast/blocksToAst");
const { parseStatLine } = require("./alignment");

// Known champion icon URL pattern
const ICON_URL = (name) => {
  const clean = name.replace(/['\s]/g, "");
  return `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${clean}_0.jpg`;
};

// Role detection heuristics from context text
const ROLE_KEYWORDS = {
  "top": /\btop\s*lane\b|\bjuggernaut\b|\bbruiser\b|\btop\s+\w/i,
  "jungle": /\bjungle\b|\bjungler\w*\b|\bclear\b.*\bcamp\b|\bjgl\b/i,
  "mid": /\bmid\s*lane\b|\bmid\b.*\blaner\b|\bmid\s+lane\b|\bmage\b|\bin the mid\b/i,
  "bot": /\bbot\s*lane\b|\bbot\b|\badc\b|\bmarksman\b/i,
  "support": /\bsupport\b|\butility\b/i,
};

// Static fallback for champions whose context text rarely mentions lane
const CHAMPION_ROLES = {
  "Akali": "Mid / Top",
  "Lee Sin": "Jungle",
  "Lillia": "Jungle",
  "Nocturne": "Jungle",
  "Orianna": "Mid",
  "Azir": "Mid",
  "Garen": "Top",
  "Varus": "Bot",
};

function detectRole(name, context) {
  const roles = [];
  for (const [role, re] of Object.entries(ROLE_KEYWORDS)) {
    if (re.test(context)) roles.push(role.charAt(0).toUpperCase() + role.slice(1));
  }
  if (roles.length) return roles.join(" / ");
  if (CHAMPION_ROLES[name]) return CHAMPION_ROLES[name];
  return "Unknown";
}

function detectVerdict(stats) {
  let buffs = 0, nerfs = 0, text = 0;
  const lowerIsBetter = /\bcooldown\b|\bcost\b|\bprice\b|\bmana\b/i;

  for (const s of stats) {
    if (s.type === "text") { text++; continue; }
    const inverted = lowerIsBetter.test(s.stat);

    if (s.type === "scalar") {
      if (s.delta && s.delta.startsWith("+")) inverted ? nerfs++ : buffs++;
      else if (s.delta && s.delta.startsWith("-")) inverted ? buffs++ : nerfs++;
      continue;
    }
    if (s.type === "aligned_series") {
      const bv = parseFloat(s.before.values[0]);
      const av = parseFloat(s.after.values[0]);
      if (!isNaN(bv) && !isNaN(av)) {
        if (av > bv) inverted ? nerfs++ : buffs++;
        else if (av < bv) inverted ? buffs++ : nerfs++;
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

    for (const child of champNode.children) {
      if (child.kind === "content") {
        if (child.block.kind === "paragraph") {
          contextBlocks.push(child.block.text);
        }
        if (child.block.kind === "listItem") {
          const parsed = parseStatLine(child.block.text);
          if (parsed) {
            const results = Array.isArray(parsed) ? parsed : [parsed];
            let baseGroup = abilityGroups.find(g => g.ability === "Base Stats");
            if (!baseGroup) {
              baseGroup = { ability: "Base Stats", stats: [] };
              abilityGroups.push(baseGroup);
            }
            baseGroup.stats.push(...results);
          }
        }
      }

      if (child.kind === "section") {
        const abilityName = child.title;
        const stats = [];

        for (const abilityChild of (child.children || [])) {
          if (abilityChild.kind === "content" && abilityChild.block.kind === "listItem") {
            const parsed = parseStatLine(abilityChild.block.text);
            if (parsed) {
              const results = Array.isArray(parsed) ? parsed : [parsed];
              stats.push(...results);
            }
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
      role: detectRole(name, context),
      verdict: detectVerdict(allStats),
      icon: ICON_URL(name),
      context,
      changes: abilityGroups,
    });
  }

  return champions;
}

module.exports = { interpretChampions, detectRole, detectVerdict };
