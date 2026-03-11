// ═══════════════════════════════════════════════════════════════
// Alignment Table Interpreter
//
// Parses stat change lines from Riot patch notes into typed schema:
//   aligned_series — multi-value (slash-separated per rank/level)
//   scalar — single value change
//   text — qualitative/behavioral change
//
// Handles: "Value: 60 / 90 / 120 ⇒ 65 / 95 / 125"
//          "Value: 350 ⇒ 345"
//          "Descriptive change: Old behavior ⇒ New behavior"
// ═══════════════════════════════════════════════════════════════

const {
  splitBeforeAfter,
  normalizeValueToken,
  splitSlashValues,
  parseBreakpoints,
  extractParenNotes,
} = require("../normalize/cleanText");

function parseStatLine(text) {
  // Extract stat label from "**Label**: value ⇒ value" or "Label: value ⇒ value"
  const labelMatch = text.match(/^(?:\*\*)?(.+?)(?:\*\*)?\s*:\s*(.+)/);
  if (!labelMatch) return null;

  const label = labelMatch[1].trim();
  const body = labelMatch[2].trim();

  const ba = splitBeforeAfter(body);
  if (!ba) {
    // No arrow — might be a note or new addition
    return { stat: label, type: "text", before: { value: "—" }, after: { value: body } };
  }

  const { before: beforeRaw, after: afterRaw } = ba;

  // Try slash-split for aligned series
  const beforeSlash = splitSlashValues(beforeRaw);
  const afterSlash = splitSlashValues(afterRaw);

  if (beforeSlash && afterSlash && beforeSlash.length === afterSlash.length) {
    return buildAlignedSeries(label, beforeRaw, afterRaw, beforeSlash, afterSlash);
  }

  // Check if both sides are numeric (scalar)
  const bNorm = normalizeValueToken(beforeRaw.replace(/[()]/g, "").trim());
  const aNorm = normalizeValueToken(afterRaw.replace(/[()]/g, "").trim());

  if (bNorm.value !== null && aNorm.value !== null) {
    const delta = Math.round((aNorm.value - bNorm.value) * 10000) / 10000;
    const unit = bNorm.unit || aNorm.unit || null;
    const deltaStr = delta === 0 ? "0" : (delta > 0 ? `+${delta}` : `${delta}`) + (unit || "");
    return {
      stat: label,
      type: "scalar",
      unit,
      before: { value: beforeRaw },
      after: { value: afterRaw },
      delta: deltaStr,
    };
  }

  // Fallback: text change
  return {
    stat: label,
    type: "text",
    before: { value: beforeRaw },
    after: { value: afterRaw },
  };
}

function buildAlignedSeries(label, beforeRaw, afterRaw, beforeVals, afterVals) {
  // Detect breakpoint info from parenthetical notes
  const beforeNotes = extractParenNotes(beforeRaw);
  const afterNotes = extractParenNotes(afterRaw);

  let beforeBP = null;
  let afterBP = null;

  for (const note of beforeNotes) {
    const bp = parseBreakpoints(note);
    if (bp) { beforeBP = bp; break; }
  }
  for (const note of afterNotes) {
    const bp = parseBreakpoints(note);
    if (bp) { afterBP = bp; break; }
  }

  // Default to spell_rank if no breakpoints detected
  const defaultBP = (n) => ({
    type: "spell_rank",
    values: Array.from({ length: n }, (_, i) => `${i + 1}`),
  });

  const bpBefore = beforeBP || defaultBP(beforeVals.length);
  const bpAfter = afterBP || defaultBP(afterVals.length);

  // Detect unit from values
  const allVals = [...beforeVals, ...afterVals];
  let unit = null;
  // Check if last value has a trailing unit
  for (const v of allVals) {
    const n = normalizeValueToken(v);
    if (n.unit) { unit = n.unit; break; }
  }

  // Also check label for common units
  if (!unit) {
    if (/\bAD\b/.test(label)) unit = "% AD";
    else if (/\bAP\b/.test(label)) unit = "% AP";
    else if (/\bcooldown\b/i.test(label)) unit = "s";
    else if (/\bmana\b/i.test(label)) unit = null;
  }

  return {
    stat: label,
    type: "aligned_series",
    unit,
    before: {
      values: beforeVals,
      breakpoint_type: bpBefore.type,
      breakpoints: bpBefore.values.map(String),
    },
    after: {
      values: afterVals,
      breakpoint_type: bpAfter.type,
      breakpoints: bpAfter.values.map(String),
    },
  };
}

// Compute per-cell deltas for an aligned series
function computeDeltas(beforeVals, afterVals) {
  if (beforeVals.length !== afterVals.length) return null;
  return beforeVals.map((b, i) => {
    const bv = normalizeValueToken(b);
    const av = normalizeValueToken(afterVals[i]);
    if (bv.value === null || av.value === null) return null;
    const d = Math.round((av.value - bv.value) * 10000) / 10000;
    if (d === 0) return "=";
    return d > 0 ? `+${d}` : `${d}`;
  });
}

module.exports = { parseStatLine, buildAlignedSeries, computeDeltas };
