// ═══════════════════════════════════════════════════════════════
// PatchData Schema — Type Definitions
//
// These are JSDoc-style type definitions. Use with @type annotations
// or convert to TypeScript .d.ts as needed.
// ═══════════════════════════════════════════════════════════════

/**
 * @typedef {"heading" | "paragraph" | "listItem" | "table" | "hr"} BlockKind
 *
 * @typedef {Object} Block
 * @property {BlockKind} kind
 * @property {number} [level] - heading level (2-4)
 * @property {string} [text] - cleaned text content
 * @property {string[][]} [grid] - table rows/cells
 *
 * @typedef {"root" | "section" | "content"} AstNodeKind
 *
 * @typedef {Object} AstNode
 * @property {AstNodeKind} kind
 * @property {number} [level] - section heading level
 * @property {string} [title] - section title
 * @property {AstNode[]} [children]
 * @property {Block} [block] - for content nodes
 */

/**
 * @typedef {"aligned_series" | "scalar" | "text"} StatType
 * @typedef {"spell_rank" | "champion_level" | "game_time" | "item_level"} BreakpointType
 *
 * @typedef {Object} AlignedSeriesSide
 * @property {string[]} values - e.g. ["60", "90", "120"]
 * @property {BreakpointType} breakpoint_type
 * @property {string[]} breakpoints - e.g. ["1", "2", "3"]
 *
 * @typedef {Object} StatChange
 * @property {string} stat - stat label e.g. "Base Damage"
 * @property {StatType} type
 * @property {string} [unit] - e.g. "s", "% AD", "%"
 * @property {AlignedSeriesSide | {value: string}} before
 * @property {AlignedSeriesSide | {value: string}} after
 * @property {string} [delta] - e.g. "+5", "-10s" (scalar only)
 * @property {string} [note]
 *
 * @typedef {Object} AbilityGroup
 * @property {string} ability - e.g. "Q - Decisive Strike", "Base Stats"
 * @property {StatChange[]} stats
 *
 * @typedef {"BUFF" | "NERF" | "ADJUSTED"} Verdict
 *
 * @typedef {Object} ChampionEntry
 * @property {string} name
 * @property {string} role
 * @property {Verdict} verdict
 * @property {string} icon - URL
 * @property {string} context - designer note excerpt
 * @property {AbilityGroup[]} changes
 *
 * @typedef {Object} ItemEntry
 * @property {string} name
 * @property {string} category
 * @property {Verdict} verdict
 * @property {string} context
 * @property {StatChange[]} changes
 *
 * @typedef {Object} SystemEntry
 * @property {string} name
 * @property {string} category
 * @property {string} summary
 *
 * @typedef {Object} PatchData
 * @property {string} patch - e.g. "26.5"
 * @property {string} date - ISO date
 * @property {string} title
 * @property {string} summary
 * @property {ChampionEntry[]} champions
 * @property {ItemEntry[]} items
 * @property {SystemEntry[]} systems
 * @property {Object[]} [other] - unhandled sections
 * @property {string[]} warnings
 */

// JSON Schema (for external validation tools)
const PATCH_JSON_SCHEMA = {
  $schema: "http://json-schema.org/draft-07/schema#",
  title: "PatchData",
  type: "object",
  required: ["patch", "date", "title", "summary", "champions", "items", "systems"],
  properties: {
    patch: { type: "string", pattern: "^\\d+\\.\\d+$" },
    date: { type: "string", format: "date" },
    title: { type: "string" },
    summary: { type: "string" },
    champions: {
      type: "array",
      items: {
        type: "object",
        required: ["name", "verdict", "changes"],
        properties: {
          name: { type: "string" },
          role: { type: "string" },
          verdict: { type: "string", enum: ["BUFF", "NERF", "ADJUSTED"] },
          icon: { type: "string" },
          context: { type: "string" },
          changes: {
            type: "array",
            items: {
              type: "object",
              required: ["ability", "stats"],
              properties: {
                ability: { type: "string" },
                stats: { type: "array" },
              },
            },
          },
        },
      },
    },
    items: { type: "array" },
    systems: { type: "array" },
    warnings: { type: "array", items: { type: "string" } },
  },
};

module.exports = { PATCH_JSON_SCHEMA };
