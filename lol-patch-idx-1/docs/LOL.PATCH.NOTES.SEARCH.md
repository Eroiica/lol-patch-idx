Below is a practical architecture that works **against Riot’s official patch notes pages** and reliably extracts **Champions → (Base Stats / Abilities)** plus **Items** and **Systems** (and any other top-level sections that appear).

```
Activity
· 37s
Thinking
Thinking longer for a better answer

Thinking longer for a better answer
Browsing League of Legends patch notes structure
Opening official patch 26.5 notes page
Looking at parsing structure for official content

We need to fetch a patch list and get individual page sections, then parse headings and sub-sections. I want to stick to official sources for citations, using web scraping tools like Cheerio or BeautifulSoup, unless I find structured data in the raw HTML. I'll focus on marker headings like "## Items" for interpretation.
Designing Robust HTML Parsing Heuristic for Site Structure
Designing a patch note parser

The extracted text isn't full HTML, just the rendered version. I’ll design the parser based on heading levels, like H2 sections ("Champions", "Items") and H3 sub-sections for individual champions (e.g., "### Akali"). I'll create a JSON output with changes and use tokenization for "A ⇒ B". I’ll also search for the patch notes URL.
Designing parser for patch notes and champion changes
Finding patch note URLs

I need to parse the page where patch notes are listed. Once I open the page, I'll look for the relevant URLs for the patch notes to continue gathering the data. This will help me locate the information needed for later steps
Parsing tag page for patch note URLs
Exploring options for patch notes crawler

Looking at the "show more" feature, it seems like it likely loads data via an API. To handle this, I might try simulating the paging with query parameters like "?page=2" or "?start=x". There might be an easier way if I explore the site's sitemap or RSS, or use the public content API from Riot.
Looking for RSS and pagination URLs

The tool seems restricted to previous search results, so I’ll need to search specifically for RSS URLs and pagination URLs. This will help me find the right paths to explore for getting the patch notes and other relevant data. I’ll move forward with those searches.
Searching for RSS and pagination URLs
Proposing parsing pipeline for patch notes

Here’s my plan:

    Find patch URLs through the tag page, and handle the "show more" feature with an API call (if available). If not, fallback to crawling by the year/patch pattern in the sitemap and referencing the Riot support patch schedule.

    For each patch page, I’ll extract metadata (version, date, and authors) and parse content hierarchically using headings.

Outlining the article parsing pipeline

I’ll convert the HTML content to a markdown-like format. For the Champions section, I’ll find the H2 heading and loop through the H3 champion names,
Thought for 37s

Done
Sources · 67

    League of Legends
    League of Legends Patch 26.5 Notes
    League of Legends
    Patch Notes
    League of Legends Support
    Patch Schedule - League of Legends
    December 8, 2025 — League of Legends periodically releases patches that include fixes, improvements, and new content. Below is our planned patch schedule...
    League of Legends
    Patch 26.1 Notes - League of Legends
    January 6, 2026 — Demacia rises in Patch 26.1 🛡️ 1/9/2026 Mid-Patch Updates We have a few changes to 26.1 that we wanted to get out before the weekend. We have a few early balance changes, some quick fixes to ARAM Mayhem, and some bugfixes that we have ready to go. Appreciate all your reports and your early feedback on the new season!
    League of Legends
    Patch 25.19 Notes
    GitHub
    Parse League of Legends patch notes into a marchine-readable format
    Parse League of Legends patch notes from leagueoflegends.com into JSON. Currently supporting patches 8.13 to 8.22.

    leagueoflegends.com
    League of Legends Patch 26.5 Notes
    March 2, 2026 — Welcome to the official patch of First Stand, the first major international tournament of the year!
    leagueoflegends.com
    News - League of Legends
    March 2, 2026 — League of Legends Patch 26.5 Notes Welcome to the official patch of First Stand, the first major international tournament of the year!
    leagueoflegends.com
    League of Legends Patch 26.5 Notes
    March 2, 2026 — Welcome to the official patch of First Stand, the first major international tournament of the year! This patch we’re making some pro-focused changes, but not as many as we would for a larger tournamen...
    leagueoflegends.com
    Game Updates - League of Legends
    March 2, 2026 — Discover the latest updates, champion changes, and game modes in League of Legends to enhance your gaming experience.
    u.gg
    Patch 26.5 Notes – League of Legends - U.GG
    March 2, 2026 — Patch 26.5 Notes – League of Legends Patch 26.5 has arrived, bringing buffs to champions like Mel, Garen, and Lilia, and nerfing champions like Taliyah, Azir, and Varus.
    mobalytics.gg
    League of Legends Patch Notes Breakdown - Mobalytics
    March 2, 2026 — Here are all the latest changes to League of Legends in this Mobalytics Patch Notes Breakdown.
    leagueoflegends.com
    Patch Notes - League of Legends
    March 1, 2026 — League of Legends Patch 26.5 Notes Welcome to the official patch of First Stand, the first major international tournament of the year!
    feedspot.com
    Top 25 League of Legends RSS Feeds - RSS Reader
    February 20, 2026 — The best League Of Legends rss feed list curated from thousands of rss feeds on the web and ranked by relevancy, authority, social media followers & freshness. Export the full list with RSS Feeds in a...
    leagueoflegends.com
    Game Updates - League of Legends
    February 17, 2026 — The definitive source on all updates coming to the game.
    leagueoflegends.com
    League of Legends Patch 26.4 Notes
    February 17, 2026 — ARAM Mayhem In this week's patch notes we've got a mix of changes that went live in 26.3 included here for posterity plus some additional changes coming in 26.4.
    leagueoflegends.com
    Game Updates - League of Legends
    February 17, 2026 — Discover the latest updates, changes, and news about League of Legends, including champions, items, and gameplay adjustments.
    leagueoflegends.com
    Patch 26.2 Notes - League of Legends
    January 20, 2026 — It’s our first patch after the 26.1 changes have hit the Rift so we’re following up in this patch by bringing the big winners down a notch while helping out some champions that have had trouble findin...
    riotgrove.com
    Patch 26.1 Notes - League of Legends | Riot Grove
    January 11, 2026 — Patch 26.1 marks the Season 2026 Start! Demacia Rises with new Role Quests, Faelights vision system, 200% crit changes, and the return of Hextech Gunblade.
    leagueoflegends.com
    Patch Notes - League of Legends
    January 6, 2026 — League of Legends Patch 26.5 Notes Welcome to the official patch of First Stand, the first major international tournament of the year!
    leagueoflegends.com
    Patch Notes - Teamfight Tactics
    January 6, 2026 — Teamfight Tactics patch 15.8 notes A light balance patch for our Tactician’s Crown competitors and a larger one for Uncharted Realms.
    leagueoflegends.com
    Patch Notes - League of Legends
    January 6, 2026 — Patch 26.3 Notes Celebrate the new year and revel in Patch 26.3 🎊 Game Updates 21/01/2026
    u.gg
    Patch 25.24 Notes - League of Legends - U.GG
    December 2, 2025 — League of Legends Patch 25.24 notes are here, and its Riot's last patch for the year.
    leagueoflegends.com
    Patch 25.24 Notes - League of Legends
    December 1, 2025 — Champion Select After a successful pilot and positive player feedback following the introduction of disallowing champions allies hover from being banned as well as faster champion select timings, we'r...
    leagueoflegends.com
    Patch 25.23 Notes - League of Legends
    November 17, 2025 — Patch 25.23 has ascended 🙏 Our live balance portion of the patch once again seeks to add about ten new junglers into play and you can read more context on each one below in the champion section. Beyon...
    leagueoflegends.com
    Patch 25.22 Notes - League of Legends
    November 3, 2025 — Take a look at the newly-buffed options and see if there’s something new for your favorite champion! Looking for more information on all things League of Legends? Check out our community-run wiki here...
    leagueoflegends.com
    Patch 25.21 Notes - League of Legends
    October 20, 2025 — Create the snowball build of your dreams, or your enemies' nightmares. We've also got an update to the Practice Tool that will allow you to try out champions before you buy them, some updates to some...
    leagueoflegends.com
    Patch 25.20 Notes - League of Legends
    October 6, 2025 — World's Patch Welcome to the official patch of the 2025 League of Legends World Championship! As most of our pro-focused changes came in the last patch, we're taking great care to ensure this patch's...
    leagueoflegends.com
    Patch 25.19 Notes - League of Legends
    September 22, 2025 — In Patch 25.19 we're shipping some item adjustments and a handful of champion updates. First up, Briar. We’ve noticed she’s become a bit frustrating to play against, especially with the combination of...
    leagueoflegends.com
    Patch 25.18 Notes - League of Legends
    September 8, 2025 — Celebrate patch 25.18 with our ‘24 World’s Winners, T1!
    leagueoflegends.com
    Patch 25.17 Notes - League of Legends
    August 25, 2025 — Welcome to Season 3! This patch we've got a lot of updates across the game such as the return to the regular Summoner's Rift map for season 3, Doom Bots comes out of retirement, Xin Zhao gets a major...
    leagueoflegends.com
    Patch 25.16 Notes - League of Legends
    August 11, 2025 — Patch 25.16 ready for takeoff! Battle Pass Changes We have some changes incoming for the Battle Pass starting with Season 3. Alongside some visual updates, we've adjusted the total number of core mile...
    leagueoflegends.com
    Patch 25.15 Notes - League of Legends
    July 28, 2025 — Patch 25.15 is unbothered. moisturized. happy. in its lane. focused. flourishing.
    leagueoflegends.com
    Patch 25.12 Notes - League of Legends
    June 9, 2025 — As for your regularly scheduled patch content, we’re getting things ready for MSI, so expect to see more pro-skewed balance changes than usual. We’ve got over 20 changes this patch ranging from gentle...
    leagueoflegends.com
    Patch 25.11 Notes - League of Legends
    May 26, 2025 — We’ve got a gameplay update to Garen in this patch that’s aimed at making his fighter builds functional and performant, pushing him away from high burst crit builds. We’ve also got the normal array of...
    gameriv.com
    League of Legends Patch 14.1 Notes – The Start of A New Season
    January 13, 2024 — A new season of League of Legends is upon us, as Patch 14.1 will be releasing soon. As with the start of a new season for League of Legends, players are treated to a bunch of changes. This time around...
    repeat.gg
    League of Legends 14.1 Patch Notes: Biggest Takeaways - Repeat.gg
    January 11, 2024 — Now that League of Legends 14.1 Patch notes are here, we have the biggest takeaways from Season 14 on Summoner's Rift.
    upcomer.com
    League of Legends 14.1 patch notes: All buffs, nerfs, and changes
    January 11, 2024 — League of Legends’ 14.1 patch has landed. It arrives just in time for 2024 Season Split 1 with lots of gameplay updates, new items, map updates, and more. Read on to dig into all the latest changes, b...
    gfinityesports.com
    League of Legends 14.1 patch notes - Gfinity Esports
    January 8, 2024 — Find the full League of Legends 14.1 patch notes in our guide packed with everything you need to know.
    elitesmurfs.com
    League of Legends 14.1 Patch Notes Overview - EliteSmurfs
    January 8, 2024 — Discover the major updates in LoL's 14.1 patch notes, featuring new Ranked Season, terrain changes, and a significant item overhaul.
    ggrecon.com
    LoL update 14.1 patch notes, new Void monsters, map changes ... - GGRecon
    January 8, 2024 — So let's take a look at everything that's changing below, courtesy of Riot Games. Or if you want to view previous or upcoming patches for League of Legends, here's the patch notes schedule. LoL update...
    rivalry.com
    LoL Patch Notes 14.1: Dawn of a New Season - Rivalry
    January 3, 2024 — League of Legends patch 14.1 goes live on January 10. Here are the changes coming in Season 14, including the items system overhaul and new skins.
    hextechdocs.dev
    Hextechdocs
    January 24, 2022 — League of LegendsThis document will provide you with a basic understanding of the League of Legends developer resources. It is designed to help you begin exploring and developing your own tools and pr...
    leagueoflegends.com
    League of Legends
    ["16.5.1","16.4.1","16.3.1","16.2.1","16.1.1","15.24.1","15.23.1","15.22.1","15.21.1","15.20.1","15.19.1","15.18.1","15.17.1","15.16.1","15.15.1","15.14.1","15.13.1 ...
    leagueoflegends.com
    Patch 26.3 Notes - League of Legends
    This patch adds 45 new Augments, with some unlockable through the progression track as you play. We've heard your feedback around augment diversity and underserved classes, so we focused on expanding...
    leagueoflegends.com
    League of Legends Homepage
    League of Legends is a free team-based game featuring over 140 champions for epic plays. Join now and experience the excitement!
    leagueoflegends.com
    League of Legends Download | North America
    Download League of Legends, a free team-based game with over 140 champions to create epic plays and enjoy thrilling gameplay.
    leagueoflegends.com
    Game Updates - League of Legends
    The definitive source on all updates coming to the game.
    dotesports.com
    LoL Patch 26.4 notes: All buffs, nerfs, and more - Dot Esports
    Home > League of Legends > LoL Patch 26.4 notes: All buffs, nerfs, and more Image via Riot Games League of Legends
    dotesports.com
    League Patch 14.1 patch notes | All buffs, nerfs, and changes in LoL ...
    Here are the LoL Patch 14.1 patch notes An entirely new era of League is arriving with the launch of the 2024 season.
    dotesports.com
    LoL Patch 25.24 notes: All buffs, nerfs, and more - Dot Esports
    When does LoL Patch 25.24 release? Pirates and glory. Image via Riot Games League updates are released on Wednesdays, and this schedule has remained the same for every patch this year.
    riotgames.com
    Riot Developer Portal
    Whether you're combining the Riot Games API and League Client API, or doing something by only using the League Client endpoints, we need to know about it. Either create a new application or leave a no...
    riotgames.com
    Riot Developer Portal
    With this site we hope to provide the League of Legends developer community with access to game data in a secure and reliable way. This is just part of our ongoing effort to respond to players' and de...
    patchbot.io
    Patch Notes for League of Legends
    Patch 26.1 Notes Welcome to a brand new season of League of Legends! We've got a plethora of far-reaching changes in this patch so if you don't want to read thousands of words, here's a brief overview...
    liquipedia.net
    Patch 14.1 - Liquipedia League of Legends Wiki
    We’ve got Voidgrubs, Voidmites, Voidborn Monsters, three Baron Nashor forms each with their own Baron Pit, map changes to every lane and jungle, over 100 item changes (including new items), a Hwei buf...
    communitydragon.org
    CommunityDragon
    raw.communitydragon.org The RAW service provides all data directly scraped from both the game client and the LCU (League Client Update), up until patch 7.1. Although providing all data available in bo...
    lolnow.gg
    League of Legends Patch Notes ⇒ Latest LoL Patch Notes
    League of Legends Patch Notes League of Legends patch notes can look intimidating at first glance. They’re packed with numbers, edge cases, and small lines that somehow decide whether your main feels...
    lolnow.gg
    League of Legends Updates ⇒ LoL Patch Notes, Leaks & News
    League of Legends Updates LoL Patch 25.24 notes (December 2025): mid-patch updates, buffs, nerfs, Arena & ARAM Mayhem Patch Notes LoL Patch 25.24 is the final patch of 2025. It’s not a full meta reset...
    fandom.com
    Portal:Patch Notes - Leaguepedia | League of Legends Esports Wiki - Fandom
    Looking for more information on all things League of Legends? Check out our community-run wiki here! Wrong patch notes? You can find the TFT patch notes here!
    fandom.com
    Category:Patch notes | League of Legends Wiki | Fandom
    Official game patch notes reproduced and reformatted on the League of Legends Wiki.
    riot-api-libraries.readthedocs.io
    Data Dragon — Riot API Libraries documentation
    The League Wikia is your best resource. If a new patch came out but ddragon hasn’t updated, wait a little while. Sometimes it takes two days after a patch for the new version of ddragon to be released...
    github.com
    LeaguePatchNotes/README.md at master - GitHub
    Parse League of Legends patch notes from leagueoflegends.com into JSON. Currently supporting patches 8.13 to 8.22. Python 3.6 is required.
    github.com
    LeaguePatchNotes/leaguepatchnotes at master · CommunityDragon ... - GitHub
    Parse League of Legends patch notes into a marchine-readable format - CommunityDragon/LeaguePatchNotes
    github.com
    GitHub - Pupix/lol-json-parser: A parser for .json files from League of ...
    A parser for .json files from League of Legends. Contribute to Pupix/lol-json-parser development by creating an account on GitHub.
    github.com
    Releases · CommunityDragon/LeaguePatchNotes · GitHub
    Parse League of Legends patch notes into a marchine-readable format - CommunityDragon/LeaguePatchNotes
    github.com
    League of Legends Patch Notes Web Scraper - GitHub
    Web Scraper that emails you relevant League of Legends information from the most recent patch notes. Utilizes Beautiful Soup to parse through the LoL patch notes, and sends an email with smtplib to wh...
    publicapis.io
    Riot Games API — Free Public API | Public APIs Directory
    ACTIVE GAMES, MATCH HISTORY, RANKED STATISTICS, AND MUCH MORE AT YOUR FINGERTIPS. Get API details, 
```

I’m basing the structure on how the official pages are actually laid out right now (e.g., Patch 26.5 has `## Champions` then `### ChampionName`, then `#### Base Stats` / `#### Spell - Name` blocks, and `## Items`, etc.). ([League of Legends][1])

---

## 1) Crawler: how to find patch note URLs

### Primary source: “Patch Notes” tag page

Riot maintains a tag landing page that lists patch note articles with timestamps and links. ([League of Legends][2])

**Gotcha:** the “SHOW MORE” is usually client-driven pagination, so don’t assume you can get *all history* from one static HTML response.

### Robust fallback: Patch schedule + URL discovery

Riot Support posts the **planned patch schedule**, which gives you the canonical patch identifiers for a year (e.g., 26.05, 26.06…). ([League of Legends Support][3])

Use that schedule to generate candidate URLs and verify which exist:

* Common URL patterns observed:

  * `/en-us/news/game-updates/patch-26-1-notes/` ([League of Legends][4])
  * `/en-us/news/game-updates/league-of-legends-patch-26-5-notes/` ([League of Legends][1])

So a good discovery strategy is:

1. Scrape the tag page for the newest N links. ([League of Legends][2])
2. For backfill, for each patch number in the schedule, try a small set of URL templates and accept those that return 200 + correct title. ([League of Legends Support][3])

Store:

* `patch_version`, `published_at`, `url`, `title`, `authors[]`

---

## 2) Fetching: HTML acquisition strategy

### Prefer “static HTML parse” first

The official pages are readable server-side (at least enough to parse headings + lists). ([League of Legends][1])

### Add a “headless render” fallback

Some Riot pages can shift markup or load parts dynamically. Your fetcher should support:

* **Mode A:** `GET` HTML → parse DOM
* **Mode B:** Playwright/Puppeteer render → grab `document.body.innerHTML`

Only use Mode B if Mode A fails validation (e.g., no `## Champions` but title matches).

---

## 3) Parsing model: treat patch notes as a heading tree

On current pages, you can treat the article as a simple hierarchy:

* **H2 (`##`)** = major sections (Champions, Items, Ranked and Matchmaking, ARAM, Arena, etc.) ([League of Legends][1])
* **H3 (`###`)** under Champions/Items = entity (Champion name, Item name) ([League of Legends][1])
* **H4 (`####`)** under entity = sub-block (Base Stats, Ability line, etc.) ([League of Legends][1])
* Bullets and paragraphs under those headings contain the actual changes.

### Core approach

1. Convert the article DOM into an ordered list of “blocks”:

   * `{type: 'h2'|'h3'|'h4'|'p'|'li', text, rawNode}`
2. Build a tree by stacking headings.
3. Apply **section-specific interpreters** only where it matters.

This keeps your parser resilient if Riot adds new sections: you’ll still capture them as generic sections even if you don’t have a specialized interpreter yet.

---

## 4) Extractors you asked for

### A) Champions extractor

**Locate** H2 == “Champions”. ([League of Legends][1])

Inside:

* Each **H3** is a champion name (often linked). ([League of Legends][1])
* Within a champion block:

  * H4 “Base Stats” (optional) ([League of Legends][5])
  * H4 like `Q - Phosphorus Bomb`, `W - Twilight Shroud`, etc. ([League of Legends][1])
  * Bullets include the `A ⇒ B` deltas.

**Output shape (suggested):**

```json
{
  "champion": "Akali",
  "summary": "Currently, Akali’s re-stealth timer...",
  "changes": [
    {
      "group": "W - Twilight Shroud",
      "entries": [
        {
          "label": "Restealth Timer",
          "before": "1s / .9s / ... (at game times ...)",
          "after": "1s / .9s / ... (at levels ...)",
          "raw": "Restealth Timer: ... ⇒ ..."
        }
      ]
    }
  ]
}
```

### B) Items extractor

**Locate** H2 == “Items”. ([League of Legends][1])
Then treat H3 as item names, parse bullets the same way.

### C) Systems extractor

Systems changes can appear as their own H2 (“Ranked and Matchmaking”, “Arena”, etc.) and also as H4 subsections labeled “Systems” under mode-specific sections (e.g., ARAM: Mayhem). ([League of Legends][1])

So define “Systems” as:

* Any H2 in a configurable allowlist: `["Ranked and Matchmaking", "Systems", "Gameplay", ...]`
* Plus any H4 exactly “Systems” under any section, captured as a sub-bucket. ([League of Legends][1])

---

## 5) Delta parsing: turning bullet text into structured “before/after”

Most balance lines follow patterns like:

* `Stat: A ⇒ B` ([League of Legends][5])
* sometimes with multiple deltas per bullet (rare)
* sometimes with “NEW”, “REMOVED” tags (you should capture as operations). ([League of Legends][1])

### Suggested parsing rules

Given a bullet string `s`:

1. If it contains `⇒`:

   * Split on first `:` to get `label` vs `rest`
   * Split `rest` on `⇒` into `before`, `after`
2. Else if it starts with `NEW:` / `REMOVED:` / `BUGFIX:`:

   * store as `{op: "NEW"|"REMOVED"|..., raw: s}`
3. Else:

   * store as unstructured note `{raw: s}`

### Buff/nerf classification (optional)

Only do this when you can safely interpret numbers:

* Extract first numeric value from before/after.
* If label contains “Cooldown” or “Mana Cost”, higher is usually nerf (context-specific).
* Otherwise higher is often buff.
  Keep this as a heuristic flag, never replace the raw text.

---

## 6) Validation & resilience checklist

For each fetched page, run a fast “sanity validation”:

* Title contains `Patch` and a version string (e.g., “26.5”) ([League of Legends][1])
* At least one H2 section exists
* If you need champion extraction, verify “Champions” H2 exists (otherwise mark extraction as partial). ([League of Legends][1])

Store both:

* `raw_html` (or cleaned plaintext)
* `parsed_json`
  So you can re-run parsing if Riot changes markup.

---

## 7) Minimal implementation skeleton (Node.js style)

```js
// High-level pipeline
async function run(patchUrl) {
  const html = await fetchHtmlWithFallback(patchUrl); // requests -> optional playwright
  const blocks = domToBlocks(html);                   // h2/h3/h4/p/li in order
  const tree = blocksToHeadingTree(blocks);           // stack-based
  const meta = extractMeta(tree);                     // title/date/authors
  const champions = extractChampions(tree);           // section interpreter
  const items = extractItems(tree);
  const systems = extractSystems(tree);               // H2 allowlist + H4 "Systems"
  return { meta, champions, items, systems, other_sections: extractOther(tree) };
}
```

---

## 8) If you want an easier “data-first” alternative

If your real goal is “machine-readable patch diffs” more than “exact official prose”, community projects scrape and normalize patch notes into JSON (useful as a comparison oracle or fallback). ([GitHub][6])
I’d still keep the official parser as source-of-truth, but this helps detect missing champs/items when Riot’s markup shifts.

---

If you tell me your target runtime (**Python** vs **Node**) and where you want to run it (serverless, cron, local), I can turn the above into a concrete repo layout + working extractor module(s) and a JSON schema.

[1]: https://www.leagueoflegends.com/en-us/news/game-updates/league-of-legends-patch-26-5-notes/ "League of Legends Patch 26.5 Notes"
[2]: https://www.leagueoflegends.com/en-us/news/tags/patch-notes/ "Patch Notes"
[3]: https://support-leagueoflegends.riotgames.com/hc/en-us/articles/360018987893-Patch-Schedule-League-of-Legends?utm_source=chatgpt.com "Patch Schedule - League of Legends"
[4]: https://www.leagueoflegends.com/en-us/news/game-updates/patch-26-1-notes/?utm_source=chatgpt.com "Patch 26.1 Notes - League of Legends"
[5]: https://www.leagueoflegends.com/en-us/news/game-updates/patch-25-19-notes/ "Patch 25.19 Notes"
[6]: https://github.com/CommunityDragon/LeaguePatchNotes?utm_source=chatgpt.com "Parse League of Legends patch notes into a marchine-readable format"

It looks like some of the previously uploaded files have expired and are no longer accessible.

If you’d like me to review or reference them (e.g., the `LOL.PATCH.NOTES.*.md` files or any of the `patch-parser*.jsx` files), please re-upload the relevant files and I’ll pick up from there right away.

Once uploaded, let me know what you'd like:

* Code review?
* Parser refactor?
* Bug fix?
* Architectural redesign?
* Performance improvements?
* Converting to a cleaner AST-based parser?

Ready when you are.

---

Yep — I can do all of that. One catch: the earlier `.md` + `.jsx` uploads you mentioned are expired on my side, so I **can’t do a line-by-line code review/refactor** until you re-upload those files.

That said, I *can* immediately help with the big pain point you highlighted: **the “alignment table” / “Before vs After” grid** (like the Akali W restealth timer screenshot). Below is a concrete architectural redesign + a dedicated **Alignment Parser** that reliably turns that UI into structured data.

---

## What that screenshot implies (why parsers break)

That block is not a simple bullet like `Restealth Timer: 1s ⇒ 1s`.

It’s a **grid**:

* A *label* (“Restealth Timer”)
* Two *rows* (“BEFORE”, “AFTER”)
* A *sequence* of values across columns (1…9)
* A *footnote* that defines what the columns mean:

  * Before: “at game times 0:00 8:00 11:00 20:00 30:00”
  * After: “at levels 1 7 10 13 16”
* Values may have:

  * missing leading zero (`.9s`)
  * strike-through styling for removed values
  * shared suffixes like `s` (seconds)
  * mixed formatting / span wrappers

So you need an extractor that understands “**aligned series**”, not just “delta strings”.

---

## Architectural redesign: DOM → AST → Interpreters

### 1) DOM normalization layer

Convert the page DOM into a small, consistent set of node types:

* `Heading(level, text)`
* `Paragraph(text)`
* `ListItem(text)`
* `Table(rows)` (including pseudo-tables that are div-grids)
* `Callout(type, text)` (if present)

This is where you strip:

* weird whitespace
* decorative spans
* strike-through markers → a boolean `isStruck`
* “BEFORE/AFTER” labels

### 2) AST builder (heading tree)

Build a tree keyed by headings:

* `H2: Champions`

  * `H3: Akali`

    * `H4: W - Twilight Shroud`

      * `Block: AlignmentTable(...)`

### 3) Section interpreters

Only at this layer do you apply rules like:

* “Champions → H3 entities”
* “Items → H3 entities”
* “Systems → H2 buckets”
* “Abilities → H4 under champion/ability headings”

### 4) Specialized block parsers

This is where your **Alignment Parser** lives.

---

## Additional Bug Alignment Parser (the missing piece)

### Output schema (suggested)

This makes the data queryable:

```json
{
  "type": "aligned_series",
  "label": "Restealth Timer",
  "unit": "s",
  "columns": [1,2,3,4,5,6,7,8,9],
  "before": {
    "values": ["1","0.9","0.825","0.725","0.625"],
    "breakpoints": { "type": "game_time", "values": ["0:00","8:00","11:00","20:00","30:00"] }
  },
  "after": {
    "values": ["1","0.9","0.825","0.725","0.625"],
    "breakpoints": { "type": "champion_level", "values": [1,7,10,13,16] }
  },
  "notes_raw": [
    "at game times 0:00 8:00 11:00 20:00 30:00",
    "at levels 1 7 10 13 16"
  ]
}
```

### Core algorithm (works even if it’s a div-grid)

1. **Detect an “alignment block”**:

   * Has BOTH “BEFORE” and “AFTER” tokens near each other
   * Contains repeated numeric-ish tokens across the same horizontal area

2. **Extract row tokens**:

   * For BEFORE row: collect tokens after the “BEFORE” label until next row label
   * Same for AFTER

3. **Normalize values**:

   * `.9s` → `0.9` + unit `s`
   * `1s` → `1`
   * Keep raw token too for safety

4. **Extract breakpoints from the footnote text**:

   * Contains `at game times` → type `game_time`, parse `m:ss`
   * Contains `at levels` → type `champion_level`, parse ints
   * If it contains “ranks” / “skill rank” → type `spell_rank`

5. **Align counts**:

   * If values count != breakpoints count, **don’t guess silently**:

     * store both lists
     * add `alignment_warning`

---

## Implementation sketch (JS / TS)

```js
function normalizeValueToken(t) {
  // returns {value: "0.9", unit: "s", raw: ".9s"}
  const raw = t.trim();
  const m = raw.match(/^(\.?[0-9]+(?:\.[0-9]+)?)\s*([a-z%]*)$/i);
  if (!m) return { value: null, unit: null, raw };
  let num = m[1];
  if (num.startsWith(".")) num = "0" + num; // ".9" -> "0.9"
  return { value: num, unit: m[2] || null, raw };
}

function parseBreakpoints(noteText) {
  const s = noteText.toLowerCase();

  if (s.includes("at game times")) {
    const times = noteText.match(/\b\d+:\d{2}\b/g) || [];
    return { type: "game_time", values: times };
  }

  if (s.includes("at levels")) {
    const levels = (noteText.match(/\b\d+\b/g) || []).map(n => parseInt(n, 10));
    return { type: "champion_level", values: levels };
  }

  if (s.includes("at ranks") || s.includes("spell rank") || s.includes("ranks")) {
    const ranks = (noteText.match(/\b\d+\b/g) || []).map(n => parseInt(n, 10));
    return { type: "spell_rank", values: ranks };
  }

  return null;
}
```

**Key bug fix:** don’t lose `.9s` or `.825s` because of a “must start with digit” numeric regex. That’s a super common failure.

---

## Performance improvements that matter

* **Two-pass parsing**:

  1. cheap “block discovery” pass (headings + candidate tables)
  2. only run expensive interpreters on candidates
* **Avoid full innerText on huge nodes**; walk only relevant subtrees (article body)
* Cache per URL:

  * raw HTML
  * normalized block list
  * parsed AST
* If you use a headless fallback: only enable when validation fails (missing key headings)

---

## What I need from you to do the actual code review + refactor

Please re-upload (or paste) the current parser source you want reviewed:

* `patch-parser.jsx` (or whichever is the real one)
* any helper modules
* and if you have them, the “READ/SEARCH” markdown notes

Then I’ll:

* point out concrete bugs (especially around alignment parsing)
* refactor into the DOM→AST→Interpreter pipeline
* add the Alignment Parser as a reusable block extractor
* give you tests + fixtures for patches that include these grids

If you want, also tell me runtime target:

* Node (Cheerio / JSDOM / Playwright fallback), or
* Python (BeautifulSoup + Playwright fallback)

Upload the files and I’ll go straight into a proper PR-style review.

---

Got it. I can lay out the refactor toward **DOM → AST → Interpreter** right now (as a concrete structure + code skeleton you can drop into your repo), but I *still* can’t open your current `patch-parser*.jsx` because the uploaded files have expired on my side. If you want me to actually rewrite your existing code (not just provide the new architecture), please re-upload the parser file afterward and I’ll map your current functions into this structure.

Below is the refactor plan + a working skeleton (JS/TS-flavored) that supports the “alignment table” cases and keeps the rest of the parser resilient.

---

# Target architecture

## Stage 1 — DOM Loader

Inputs: URL (or raw HTML)
Output: `Document` (Cheerio/JSDOM nodes)

Responsibilities:

* Fetch HTML (static first)
* Optional headless fallback only if validation fails
* Return `{ url, html, $ }`

## Stage 2 — DOM Normalizer → Linear “Blocks”

Input: DOM
Output: ordered `Block[]`

Blocks are small, stable primitives:

* `heading` (level 2–4+)
* `paragraph`
* `listItem`
* `table` (real `<table>` or div-grid “pseudo table”)
* `callout` (optional)
* `hr` (optional)

Each block carries:

* clean text
* raw html snapshot (optional)
* source location hints (css path / index) for debugging

## Stage 3 — Blocks → AST (Heading tree)

Input: `Block[]`
Output: `PatchAst`

AST nodes:

* `Root`
* `Section` (from headings; contains children)
* `ContentBlock` leaves (paragraph/list/table…)

This stage is *pure structure*; no League-specific logic.

## Stage 4 — Interpreters (League-specific)

Input: `PatchAst`
Output: `PatchData` (your JSON schema)

Interpreters are pluggable:

* `ChampionsInterpreter`
* `ItemsInterpreter`
* `SystemsInterpreter`
* `GenericSectionInterpreter` (fallback)
* `AlignmentTableInterpreter` (special leaf parser used by others)

---

# Folder layout

```
src/
  fetch/
    fetchHtml.ts
    validatePage.ts
  normalize/
    domToBlocks.ts
    cleanText.ts
    detectPseudoTables.ts
  ast/
    blocksToAst.ts
    astTypes.ts
  interpret/
    index.ts
    champions.ts
    items.ts
    systems.ts
    generic.ts
    alignment.ts
  schema/
    patchTypes.ts
  cli/
    parsePatch.ts
```

---

# Core types

```ts
// ast/astTypes.ts
export type Block =
  | { kind: "heading"; level: number; text: string; html?: string }
  | { kind: "paragraph"; text: string; html?: string }
  | { kind: "listItem"; text: string; html?: string }
  | { kind: "table"; grid: string[][]; html?: string; meta?: any };

export type AstNode =
  | { kind: "root"; children: AstNode[] }
  | { kind: "section"; level: number; title: string; children: AstNode[] }
  | { kind: "content"; block: Block };

export type PatchAst = AstNode; // root node
```

---

# Stage 2: DOM → Blocks (normalizer)

### Key rule: preserve reading order

Don’t try to “parse champions” here. Just emit blocks in the order they appear.

```ts
// normalize/domToBlocks.ts
import { cleanText } from "./cleanText";
import { detectPseudoTables } from "./detectPseudoTables";

export function domToBlocks($: any): Block[] {
  const blocks: Block[] = [];

  // 1) Narrow to the article body. Adjust selectors to Riot site:
  const $article = $("article").first().length ? $("article").first() : $("main");

  // 2) Walk elements in DOM order
  $article.find("h2,h3,h4,p,li,table,section,div").each((_, el) => {
    const tag = el.tagName?.toLowerCase?.() ?? el.name?.toLowerCase?.();

    if (tag === "h2" || tag === "h3" || tag === "h4") {
      blocks.push({
        kind: "heading",
        level: Number(tag.slice(1)),
        text: cleanText($(el).text()),
        html: $.html(el),
      });
      return;
    }

    if (tag === "p") {
      const text = cleanText($(el).text());
      if (text) blocks.push({ kind: "paragraph", text, html: $.html(el) });
      return;
    }

    if (tag === "li") {
      const text = cleanText($(el).text());
      if (text) blocks.push({ kind: "listItem", text, html: $.html(el) });
      return;
    }

    if (tag === "table") {
      const grid = $(el)
        .find("tr")
        .toArray()
        .map((tr: any) =>
          $(tr)
            .find("th,td")
            .toArray()
            .map((td: any) => cleanText($(td).text()))
        );
      blocks.push({ kind: "table", grid, html: $.html(el) });
      return;
    }

    // 3) Pseudo-table detection (div-grid used for BEFORE/AFTER alignment blocks)
    const pseudo = detectPseudoTables($, $(el));
    if (pseudo) {
      blocks.push(pseudo);
      return;
    }
  });

  return dedupeAdjacent(blocks);
}

function dedupeAdjacent(blocks: Block[]): Block[] {
  const out: Block[] = [];
  for (const b of blocks) {
    const prev = out[out.length - 1];
    if (prev?.kind === b.kind && "text" in prev && "text" in b && prev.text === b.text) continue;
    out.push(b);
  }
  return out;
}
```

---

# Stage 3: Blocks → AST (heading tree)

Classic stack-based builder:

```ts
// ast/blocksToAst.ts
import { Block, AstNode } from "./astTypes";

export function blocksToAst(blocks: Block[]): AstNode {
  const root: AstNode = { kind: "root", children: [] };
  const stack: AstNode[] = [root];

  for (const block of blocks) {
    if (block.kind === "heading") {
      const node: AstNode = { kind: "section", level: block.level, title: block.text, children: [] };

      while (stack.length > 1) {
        const top = stack[stack.length - 1];
        if (top.kind === "section" && top.level >= block.level) stack.pop();
        else break;
      }

      stack[stack.length - 1].children.push(node);
      stack.push(node);
    } else {
      stack[stack.length - 1].children.push({ kind: "content", block });
    }
  }

  return root;
}
```

---

# Stage 4: Interpreters

## Interpreter dispatcher

```ts
// interpret/index.ts
import { PatchAst } from "../ast/astTypes";
import { interpretChampions } from "./champions";
import { interpretItems } from "./items";
import { interpretSystems } from "./systems";
import { interpretGenericSections } from "./generic";

export function interpretPatch(ast: PatchAst) {
  return {
    meta: extractMeta(ast),
    champions: interpretChampions(ast),
    items: interpretItems(ast),
    systems: interpretSystems(ast),
    other: interpretGenericSections(ast),
  };
}

function extractMeta(ast: PatchAst) {
  // title/date extraction can be done either from DOM or first heading nodes
  return {};
}
```

---

# Alignment Table Interpreter (the “Additional Bug Alignment Parser”)

This is the critical leaf parser used by Champions/Items interpreters when they encounter a `table` block with BEFORE/AFTER.

```ts
// interpret/alignment.ts
export function parseAlignedSeries(block: { kind: "table"; grid: string[][]; html?: string }) {
  const flat = block.grid.flat().map(t => t.trim()).filter(Boolean);

  // heuristics: must contain BEFORE and AFTER
  const beforeIdx = flat.findIndex(t => /^before$/i.test(t));
  const afterIdx = flat.findIndex(t => /^after$/i.test(t));
  if (beforeIdx === -1 || afterIdx === -1) return null;

  // Split into segments near markers
  const beforeSeg = flat.slice(beforeIdx + 1, afterIdx);
  const afterSeg = flat.slice(afterIdx + 1);

  const before = extractSeries(beforeSeg);
  const after = extractSeries(afterSeg);

  const notes = extractNotes(flat);

  return {
    type: "aligned_series",
    label: inferLabelFromContext(flat), // usually provided by surrounding H4/paragraph
    unit: before.unit || after.unit || null,
    before,
    after,
    notes_raw: notes,
    alignment_warning:
      (before.breakpoints && before.values.length !== before.breakpoints.values.length) ||
      (after.breakpoints && after.values.length !== after.breakpoints.values.length)
        ? "values_count_mismatch"
        : undefined,
  };
}

function extractSeries(tokens: string[]) {
  // Separate value-ish tokens from note-ish tokens
  const valueTokens = tokens.filter(t => looksLikeValue(t));
  const noteTokens = tokens.filter(t => !looksLikeValue(t));

  const norm = valueTokens.map(normalizeValueToken);
  const unit = norm.find(n => n.unit)?.unit ?? null;

  // parse breakpoints from notes if present
  const breakpoint = noteTokens.map(parseBreakpoints).find(Boolean) ?? null;

  return {
    values: norm.map(n => n.value).filter(Boolean),
    values_raw: valueTokens,
    unit,
    breakpoints: breakpoint,
  };
}

function looksLikeValue(t: string) {
  // IMPORTANT: allow ".9s"
  return /^\.?\d+(\.\d+)?\s*[a-z%]*$/i.test(t);
}

function normalizeValueToken(t: string) {
  const raw = t.trim();
  const m = raw.match(/^(\.?[0-9]+(?:\.[0-9]+)?)\s*([a-z%]*)$/i);
  if (!m) return { value: null, unit: null, raw };
  let num = m[1];
  if (num.startsWith(".")) num = "0" + num;
  return { value: num, unit: m[2] || null, raw };
}

function parseBreakpoints(noteText: string) {
  const s = noteText.toLowerCase();
  if (s.includes("at game times")) {
    const times = noteText.match(/\b\d+:\d{2}\b/g) || [];
    return { type: "game_time", values: times };
  }
  if (s.includes("at levels")) {
    const levels = (noteText.match(/\b\d+\b/g) || []).map(n => parseInt(n, 10));
    return { type: "champion_level", values: levels };
  }
  if (s.includes("at ranks") || s.includes("spell rank") || s.includes("ranks")) {
    const ranks = (noteText.match(/\b\d+\b/g) || []).map(n => parseInt(n, 10));
    return { type: "spell_rank", values: ranks };
  }
  return null;
}

function extractNotes(allTokens: string[]) {
  // capture "at game times..." etc
  return allTokens.filter(t => /at (game times|levels|ranks)/i.test(t));
}

function inferLabelFromContext(_: string[]) {
  return null; // set by caller using heading context
}
```

**How to use it:** champions interpreter sees an H4 “Restealth Timer” then encounters a `table` block → call `parseAlignedSeries()` and attach `label="Restealth Timer"` + ability context.

---

# Champions interpreter (outline)

* Find section title matching `Champions`
* Each H3 child is champion node
* Within champion: H4 = ability group (or base stats), and leaf blocks parsed accordingly:

  * list items → delta parser (`A ⇒ B`)
  * tables → alignment parser

---

# Next step (so I can actually refactor your existing code)

Please re-upload (or paste) the current `patch-parser.jsx` you want rewritten into this architecture.

Once I have it, I’ll return:

* a PR-style review of what to delete/keep
* the refactored module structure above
* a concrete migration mapping: “old function X → new stage Y”
* test fixtures including the Akali alignment case
