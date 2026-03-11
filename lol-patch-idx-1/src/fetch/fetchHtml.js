// ═══════════════════════════════════════════════════════════════
// Stage 1: Fetch HTML
//
// Tries static fetch first, falls back to headless if validation
// fails (content requires JS rendering).
// ═══════════════════════════════════════════════════════════════

async function fetchHtml(url, options = {}) {
  const { timeout = 15000, userAgent = "lol-patch-idx/2.0" } = options;

  // Static fetch first
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": userAgent },
    });
    clearTimeout(timer);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("html") && !contentType.includes("text")) {
      throw new Error(`Unexpected content-type: ${contentType}`);
    }

    return await res.text();
  } catch (err) {
    clearTimeout(timer);
    throw new Error(`fetchHtml failed for ${url}: ${err.message}`);
  }
}

module.exports = { fetchHtml };
