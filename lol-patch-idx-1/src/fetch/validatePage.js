// ═══════════════════════════════════════════════════════════════
// Page Validation
//
// Sanity checks to determine if fetched content is a valid
// patch notes page (vs. empty JS shell, error page, etc.)
// ═══════════════════════════════════════════════════════════════

function validatePage(html) {
  const warnings = [];

  if (!html || html.length < 500) {
    warnings.push("Page content too short — may be empty or error page");
    return { valid: false, warnings };
  }

  // Check for patch-note indicators
  const hasPatchKeywords = /patch\s*\d+\.\d+|champion|item|bugfix/i.test(html);
  if (!hasPatchKeywords) {
    warnings.push("No patch note keywords found — may not be a patch page");
  }

  // Check for article content
  const hasArticle = /<article/i.test(html) || /class=".*patch.*"/i.test(html);
  if (!hasArticle) {
    warnings.push("No <article> or patch-notes container found");
  }

  // Check for excessive script-only content (JS-rendered page)
  const scriptRatio = (html.match(/<script/gi) || []).length / (html.length / 1000);
  if (scriptRatio > 2) {
    warnings.push("High script density — content may require JS rendering");
  }

  return {
    valid: warnings.length === 0 || hasPatchKeywords,
    warnings,
  };
}

function validateBlocks(blocks) {
  const warnings = [];

  if (blocks.length < 10) {
    warnings.push(`Only ${blocks.length} blocks extracted — expected 50+`);
  }

  const headings = blocks.filter(b => b.kind === "heading");
  if (headings.length < 3) {
    warnings.push(`Only ${headings.length} headings — expected 5+`);
  }

  const hasChampions = headings.some(h => /champions/i.test(h.text));
  if (!hasChampions) {
    warnings.push("No 'Champions' heading found");
  }

  return { valid: warnings.length <= 1, warnings };
}

function validatePatchData(data) {
  const warnings = [];

  if (data.patch === "unknown") {
    warnings.push("Could not extract patch version");
  }
  if (data.champions.length === 0) {
    warnings.push("No champions extracted");
  }
  if (data.items.length === 0) {
    warnings.push("No items extracted — may be missing or in different section");
  }

  return { valid: warnings.length <= 1, warnings };
}

module.exports = { validatePage, validateBlocks, validatePatchData };
