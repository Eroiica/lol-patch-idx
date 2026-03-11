// ═══════════════════════════════════════════════════════════════
// Stage 2: DOM → Linear Block[] (reading order preserved)
//
// No League-specific logic. Just structural primitives:
// heading, paragraph, listItem, table, hr
// ═══════════════════════════════════════════════════════════════

const { cleanText, splitBeforeAfter, ARROW_PATTERN } = require("./cleanText");

function domToBlocks($) {
  const blocks = [];
  const seen = new Set(); // dedup by text fingerprint

  // Narrow to article body — Riot uses various wrappers
  let $root = $("article").first();
  if (!$root.length) $root = $("[class*='patch-notes']").first();
  if (!$root.length) $root = $("main").first();
  if (!$root.length) $root = $("body");

  // Walk ALL descendant elements in DOM order
  $root.find("*").each((_, el) => {
    const tag = (el.tagName || el.name || "").toLowerCase();
    const $el = $(el);

    // Skip nested containers — we only want leaf content
    if (["div", "section", "article", "main", "nav", "header", "footer", "script", "style", "img", "a", "span", "em", "strong", "b", "i", "br", "svg", "picture", "source", "figure", "figcaption"].includes(tag)) {
      return; // skip structural wrappers and inline elements
    }

    if (/^h[2-4]$/.test(tag)) {
      const text = cleanText($el.text());
      if (!text) return;
      const fp = `h${tag.slice(1)}:${text}`;
      if (seen.has(fp)) return;
      seen.add(fp);
      blocks.push({ kind: "heading", level: parseInt(tag.slice(1)), text });
      return;
    }

    if (tag === "p") {
      const text = cleanText($el.text());
      if (!text || text.length < 2) return;
      const fp = `p:${text.slice(0, 80)}`;
      if (seen.has(fp)) return;
      seen.add(fp);
      blocks.push({ kind: "paragraph", text });
      return;
    }

    if (tag === "li") {
      const text = cleanText($el.text());
      if (!text) return;
      const fp = `li:${text.slice(0, 80)}`;
      if (seen.has(fp)) return;
      seen.add(fp);
      blocks.push({ kind: "listItem", text });
      return;
    }

    if (tag === "hr") {
      blocks.push({ kind: "hr" });
      return;
    }

    if (tag === "table") {
      const grid = [];
      $el.find("tr").each((_, tr) => {
        const row = [];
        $(tr).find("th, td").each((_, cell) => {
          row.push(cleanText($(cell).text()));
        });
        if (row.length) grid.push(row);
      });
      if (grid.length) {
        blocks.push({ kind: "table", grid });
      }
      return;
    }
  });

  return blocks;
}

// For markdown-extracted content (from web_fetch), parse structure from text
function markdownToBlocks(md) {
  const blocks = [];
  const lines = md.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Headings
    const hMatch = trimmed.match(/^(#{1,4})\s+(.+)/);
    if (hMatch) {
      blocks.push({ kind: "heading", level: hMatch[1].length, text: cleanText(hMatch[2]) });
      continue;
    }

    // Horizontal rules
    if (/^[-*_]{3,}$/.test(trimmed)) {
      blocks.push({ kind: "hr" });
      continue;
    }

    // List items (bullet or numbered)
    const liMatch = trimmed.match(/^[\*\-+]\s+(.+)/);
    if (liMatch) {
      blocks.push({ kind: "listItem", text: cleanText(liMatch[1]) });
      continue;
    }

    // Bold stat lines (Riot format): **Stat**: value ⇒ value
    const boldStatMatch = trimmed.match(/^\*\*(.+?)\*\*\s*:\s*(.+)/);
    if (boldStatMatch) {
      blocks.push({ kind: "listItem", text: cleanText(`${boldStatMatch[1]}: ${boldStatMatch[2]}`) });
      continue;
    }

    // Blockquote
    if (trimmed.startsWith(">")) {
      blocks.push({ kind: "paragraph", text: cleanText(trimmed.replace(/^>\s*/, "")) });
      continue;
    }

    // Image lines — skip
    if (trimmed.startsWith("![") || trimmed.startsWith("[![")) continue;

    // Link-only lines — skip
    if (/^\[.*\]\(.*\)$/.test(trimmed)) continue;

    // Everything else is paragraph
    if (trimmed.length > 2) {
      blocks.push({ kind: "paragraph", text: cleanText(trimmed) });
    }
  }

  return blocks;
}

module.exports = { domToBlocks, markdownToBlocks };
