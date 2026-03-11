// ═══════════════════════════════════════════════════════════════
// AST Type Constructors
// Block kinds: heading | paragraph | listItem | table | hr
// AstNode kinds: root | section | content
// ═══════════════════════════════════════════════════════════════

function heading(level, text, html) {
  return { kind: "heading", level, text, html: html || null };
}

function paragraph(text, html) {
  return { kind: "paragraph", text, html: html || null };
}

function listItem(text, html) {
  return { kind: "listItem", text, html: html || null };
}

function table(grid, html, meta) {
  return { kind: "table", grid, html: html || null, meta: meta || null };
}

function hr() {
  return { kind: "hr" };
}

function rootNode(children) {
  return { kind: "root", children: children || [] };
}

function sectionNode(level, title, children) {
  return { kind: "section", level, title, children: children || [] };
}

function contentNode(block) {
  return { kind: "content", block };
}

module.exports = {
  heading, paragraph, listItem, table, hr,
  rootNode, sectionNode, contentNode,
};
