// ═══════════════════════════════════════════════════════════════
// Text Normalization Utilities
// ═══════════════════════════════════════════════════════════════

function cleanText(raw) {
  if (!raw) return "";
  return raw
    .replace(/\*\*/g, "")   // strip bold markers
    .replace(/\*/g, "")     // strip italic markers
    .replace(/\s+/g, " ")   // collapse whitespace
    .replace(/\u00a0/g, " ") // non-breaking spaces
    .trim();
}

// Detect the ⇒ arrow used in Riot patch notes for before→after
const ARROW_PATTERN = /\s*[⇒→=>]+\s*/;

function splitBeforeAfter(text) {
  const parts = text.split(ARROW_PATTERN);
  if (parts.length === 2) {
    return { before: parts[0].trim(), after: parts[1].trim() };
  }
  return null;
}

// Normalize value tokens like ".9s" → { value: 0.9, unit: "s", raw: ".9s" }
function normalizeValueToken(t) {
  const raw = t.trim();
  const m = raw.match(/^([+-]?\.?\d+(?:\.\d+)?)\s*([a-z%]*)$/i);
  if (!m) return { value: null, unit: null, raw };
  let num = m[1];
  if (num.startsWith(".")) num = "0" + num;
  if (num.startsWith("+.")) num = "+0" + num.slice(1);
  if (num.startsWith("-.")) num = "-0" + num.slice(1);
  return { value: parseFloat(num), unit: m[2] || null, raw };
}

// Parse breakpoint annotations
function parseBreakpoints(noteText) {
  const s = noteText.toLowerCase();
  if (s.includes("at game time")) {
    const times = noteText.match(/\b\d+:\d{2}\b/g) || [];
    return { type: "game_time", values: times };
  }
  if (s.includes("at level")) {
    const levels = (noteText.match(/\b\d+\b/g) || []).map(n => parseInt(n, 10));
    return { type: "champion_level", values: levels };
  }
  if (s.includes("at rank") || s.includes("spell rank") || s.includes("rank")) {
    const ranks = (noteText.match(/\b\d+\b/g) || []).map(n => parseInt(n, 10));
    return { type: "spell_rank", values: ranks };
  }
  return null;
}

// Split "60 / 90 / 120 / 150 / 180" into array
function splitSlashValues(text) {
  const stripped = text.replace(/\(.*?\)/g, "").trim();
  const parts = stripped.split(/\s*\/\s*/);
  if (parts.length > 1 && parts.every(p => p.trim().length > 0)) {
    return parts.map(p => p.trim());
  }
  return null;
}

// Extract parenthetical notes like "(+25% AP)"
function extractParenNotes(text) {
  const matches = [];
  const re = /\(([^)]+)\)/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    matches.push(m[1].trim());
  }
  return matches;
}

module.exports = {
  cleanText,
  splitBeforeAfter,
  normalizeValueToken,
  parseBreakpoints,
  splitSlashValues,
  extractParenNotes,
  ARROW_PATTERN,
};
