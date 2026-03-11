> LEAGUE CHAMP,STATS,ABILITIES,ITEMS,SYSTEMS PARSER 
Root: https://www.leagueoflegends.com/en-us/news/tags/patch-notes/
Individual: https://www.leagueoflegends.com/en-us/news/game-updates/league-of-legends-patch-26-5-notes/

## Architecting parser for League patch notes extraction

Architecting parser for League patch notes extraction
The user wants me to build a parser for League of Legends patch notes. Let me understand what they're asking for:

They want to parse League of Legends patch notes from the official website
They want to extract: Champions, Stats, Abilities, Items, and Systems changes
They've provided the root URL for patch notes and an example individual patch note URL
> Let me first check if there are any relevant skills, then fetch the patch notes page to understand the structure before building the parser.
> Let me start by fetching the actual patch notes page to understand the HTML structure.
> Let me grab the patch notes page first to understand the structure, then build the parser.

## Architected game-inspired parser for League patch data visualization
Architected game-inspired parser for League patch data visualization

```
League of Legends Patch 26.5 Notes
www.leagueoflegends.com
```

> I have the full patch notes content. Now I understand the structure well. Let me build a comprehensive parser that extracts Champions (with stats, abilities), Items, and Systems changes into structured JSON. Let me also check the frontend-design skill since this would make a great interactive artifact.

## Let me build a React artifact that:
- Fetches and parses patch notes from the provided data
- Categorizes into Champions, Items, Systems
- For champions: extracts base stats changes, ability changes

#### Makes it interactive and visually appealing
> Actually, the user said "PARSER" - they want a tool that can parse this data. Let me build a clean React app that displays the parsed patch 26.5 data in a structured, filterable way.

- Since Dante's interested in data systems and League, I should create a robust extraction tool that really leverages the frontend-design skill to make this both functional and polished.
- Read frontend design skill for building the parser UI
- Now let me build a comprehensive parser artifact. Given Dante's love for League and data systems, I'll create a visually striking React component that parses and displays patch note data in a structured, interactive way.
- The aesthetic direction: Dark, sharp, game-HUD inspired with gold/teal accents - echoing League's own UI language but with a data-science twist fitting Dante's background.
- Got the full structure mapped out. Building the parser now — dark HUD aesthetic, structured extraction of every champion/stat/ability/item/system change.

## Identified League of Legends patch notes parser requirements
> Identified League of Legends patch notes parser requirements

League of Legends Patch Notes Parser - Interactive React artifact with structured data extraction
> patch-parser.jsx
Let me present the file to the user.
> Presented file
Done. Let me give a concise summary.
> Done

Let me grab the patch notes page first to understand the structure, then build the parser.Got the full structure mapped out. Building the parser now — dark HUD aesthetic, structured extraction of every champion/stat/ability/item/system change.Full 26.5 parse extracted and rendered. Here's what's in the structured data:

**14 champions** parsed with every stat/ability change — before/after values, deltas, ability slots, Riot's design context. Filterable by BUFF (6) / NERF (4) / ADJUSTED (4) with search.

**2 items** (Hubris -200g, Locket shield front-loaded), **5 systems** (autofill matching, last hit indicators, severe chat bans, Aegis of Valor, Brawl return), and the full **ARAM: Mayhem** augment sweep (14 buffed, 2 nerfed, 2 new).

The Raw JSON tab gives you the complete structured object ready to pipe into any downstream system — click "Copy JSON" to grab it. Click any champion or item card to expand the stat diff table.

---

Restructured layout to stack stats vertically with indexed levels
Restructured layout to stack stats vertically with indexed levels
The user wants two changes:

Before/After values should be stacked vertically (top to bottom) instead of side by side in columns
Stats with '/' separators (like "60/90/120/150/180") should break at each '/' for readability
Let me update the StatRow component and the grid layout to accommodate this.


View the current StatRow and grid layout
Let me view the StatRow component and the header grid to update them.


View StatRow component and column headers
Now let me see the StatRow component specifically.


View StatRow and ChampionCard internals
The user wants:

Before/After stacked vertically (top to bottom) instead of side-by-side columns
Values with '/' should break at each '/' — so each level value gets its own line
Let me redesign the StatRow to have the stat name on top, then Before and After stacked below with level-indexed values breaking at '/'. I'll create a helper that splits values by '/' and renders them as aligned rows with level indices.

Done
Now I'll redesign the StatRow to stack Before/After vertically and break / values into level-indexed rows.

Reconsidered layout structure and eliminated redundant column headers
Reconsidered layout structure and eliminated redundant column headers

Replace StatRow with vertical layout and slash-breaking level index

patch-parser.jsx
+81
-18
Now I need to update the column headers in the ChampionCard that say "Stat / Before / After" since the layout is now vertical, not columnar. Let me remove those 3-column headers.

Done

Now remove the old 3-column headers in the champion and item expanded views since the layout is no longer columnar.Restructured layout to vertically stack comparisons and parse slash-separated valuesRestructured layout to vertically stack comparisons and parse slash-separated valuesRemove old 3-column header from champion cardpatch-parser.jsx+1-17Now let me also remove the 3-column header from the ItemCard.Find the item card column headersLet me find the item card's column headers.Find item card header gridRemove that grid header for item card too.Remove old 3-column header from item cardpatch-parser.jsx+2-8Done. Let me present the file.Presented fileDone. The changes:

Before/After now stack vertically — Before on top (red, strikethrough), After below (green)
Slash-separated values break into individual level-indexed columns with a small rank number (1, 2, 3...) above each value
Non-slash values (single values) display inline with the stat name in a compact vertical stack
Removed the old 3-column Stat/Before/After headers since the layout is now self-describing
DoneUpdated. Two changes:
Vertical stacking — Before (red, struck-through) sits on top, After (green) directly below it. Single-value stats stack inline next to the stat name; multi-level stats get a bordered sub-block.
Slash breaking — Any value with / separators splits into individual columns, each with a small level index (1, 2, 3…) above it so you can scan rank-by-rank. Expand any champion like Lillia R or Garen Q to see it in action.