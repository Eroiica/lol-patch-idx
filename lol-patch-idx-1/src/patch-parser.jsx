import { useState, useMemo } from "react";

// ═══════════════════════════════════════════════════════════════
// ALIGNMENT PARSER — Schema from architecture doc
// Types: aligned_series | scalar | text
// Breakpoint types: spell_rank | champion_level | game_time | item_level
// ═══════════════════════════════════════════════════════════════

function normalizeValueToken(t) {
  const raw = t.trim();
  const m = raw.match(/^([+-]?\.?\d+(?:\.\d+)?)\s*([a-z%]*)$/i);
  if (!m) return { value: null, unit: null, raw };
  let num = m[1];
  if (num.startsWith(".")) num = "0" + num;
  if (num.startsWith("+.")) num = "+0" + num.slice(1);
  return { value: parseFloat(num), unit: m[2] || null, raw };
}

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

// ═══════════════════════════════════════════════════════════════
// PATCH DATA — 26.5 with aligned_series schema
// ═══════════════════════════════════════════════════════════════

const PATCH_DATA = {
  patch: "26.5",
  date: "2026-03-03",
  title: "League of Legends Patch 26.5 Notes",
  summary: "Official patch of First Stand — pro-focused mid lane retuning, bot lane adjustment, roster-wide outlier buffs/nerfs, Brawl return, ARAM: Mayhem updates, Arena bugfixes, last hit indicators, and severe chat penalty escalation.",
  champions: [
    {
      name: "Akali", role: "Mid / Top", verdict: "ADJUSTED",
      icon: "https://am-a.akamaihd.net/image?f=https://ddragon.leagueoflegends.com/cdn/16.4.1/img/champion/Akali.png",
      context: "Restealth timer now scales with champion level instead of game time for multi-mode flexibility.",
      changes: [{
        ability: "W - Twilight Shroud",
        stats: [{
          stat: "Restealth Timer", type: "aligned_series", unit: "s",
          before: { values: ["1","0.9","0.825","0.725","0.625"], breakpoint_type: "game_time", breakpoints: ["0:00","8:00","11:00","20:00","30:00"] },
          after:  { values: ["1","0.9","0.825","0.725","0.625"], breakpoint_type: "champion_level", breakpoints: ["1","7","10","13","16"] },
        }]
      }]
    },
    {
      name: "Azir", role: "Mid", verdict: "NERF",
      icon: "https://am-a.akamaihd.net/image?f=https://ddragon.leagueoflegends.com/cdn/16.4.1/img/champion/Azir.png",
      context: "Late-game health reduced to give assassins counterplay against the emperor.",
      changes: [{
        ability: "Base Stats",
        stats: [{
          stat: "Health Growth", type: "scalar",
          before: { value: "119" }, after: { value: "108" }, delta: "-11"
        }]
      }]
    },
    {
      name: "Garen", role: "Top", verdict: "BUFF",
      icon: "https://am-a.akamaihd.net/image?f=https://ddragon.leagueoflegends.com/cdn/16.4.1/img/champion/Garen.png",
      context: "Better early trading power and fighter item parity with crit builds.",
      changes: [
        { ability: "Q - Decisive Strike", stats: [{
          stat: "Move Speed Duration", type: "aligned_series", unit: "s",
          before: { values: ["1","1.65","2.3","2.95","3.6"], breakpoint_type: "spell_rank", breakpoints: ["1","2","3","4","5"] },
          after:  { values: ["1.4","1.95","2.5","3.05","3.6"], breakpoint_type: "spell_rank", breakpoints: ["1","2","3","4","5"] },
        }]},
        { ability: "E - Judgment", stats: [{
          stat: "Damage per Spin", type: "aligned_series", unit: "% AD",
          before: { values: ["38","41","44","47","50"], breakpoint_type: "spell_rank", breakpoints: ["1","2","3","4","5"] },
          after:  { values: ["40","43","46","49","52"], breakpoint_type: "spell_rank", breakpoints: ["1","2","3","4","5"] },
          note: "Base damage unchanged at 4/7/10/13/16"
        }]}
      ]
    },
    {
      name: "Kha'Zix", role: "Jungle", verdict: "NERF",
      icon: "https://am-a.akamaihd.net/image?f=https://ddragon.leagueoflegends.com/cdn/16.4.1/img/champion/Khazix.png",
      context: "Top solo queue jungler — clear speed, isolation damage, and movement speed all reduced.",
      changes: [
        { ability: "Base Stats", stats: [{
          stat: "Move Speed", type: "scalar",
          before: { value: "350" }, after: { value: "345" }, delta: "-5"
        }]},
        { ability: "Q - Taste Their Fear", stats: [{
          stat: "Bonus AD Ratio", type: "scalar",
          before: { value: "+110% (231% isolated)" }, after: { value: "+105% (220.5% isolated)" }, delta: "-5% / -10.5%"
        }]}
      ]
    },
    {
      name: "Lee Sin", role: "Jungle", verdict: "BUFF",
      icon: "https://am-a.akamaihd.net/image?f=https://ddragon.leagueoflegends.com/cdn/16.4.1/img/champion/LeeSin.png",
      context: "Q damage increased to reward skillful play and restore his flair.",
      changes: [{
        ability: "Q - Sonic Wave / Resonating Strike",
        stats: [{
          stat: "Base Damage", type: "aligned_series",
          before: { values: ["60","90","120","150","180"], breakpoint_type: "spell_rank", breakpoints: ["1","2","3","4","5"] },
          after:  { values: ["65","95","125","155","185"], breakpoint_type: "spell_rank", breakpoints: ["1","2","3","4","5"] },
        }]
      }]
    },
    {
      name: "Lillia", role: "Jungle", verdict: "BUFF",
      icon: "https://am-a.akamaihd.net/image?f=https://ddragon.leagueoflegends.com/cdn/16.4.1/img/champion/Lillia.png",
      context: "Reverting prior Q nerfs and R buffs — net buff to restore sustained fight fantasy.",
      changes: [
        { ability: "Passive - Dream-Laden Bough", stats: [{
          stat: "Monster Heal Bonus AP Ratio", type: "scalar", unit: "%",
          before: { value: "9%" }, after: { value: "15%" }, delta: "+6%"
        }]},
        { ability: "Q - Blooming Blows", stats: [{
          stat: "Bonus AP Ratio", type: "scalar", unit: "%",
          before: { value: "30%" }, after: { value: "35%" }, delta: "+5%"
        }]},
        { ability: "R - Lilting Lullaby", stats: [
          {
            stat: "Base Damage", type: "aligned_series",
            before: { values: ["100","150","200"], breakpoint_type: "spell_rank", breakpoints: ["1","2","3"] },
            after:  { values: ["150","200","250"], breakpoint_type: "spell_rank", breakpoints: ["1","2","3"] },
          },
          {
            stat: "AP Ratio", type: "scalar", unit: "%",
            before: { value: "45%" }, after: { value: "40%" }, delta: "-5%"
          },
          {
            stat: "Cooldown", type: "aligned_series", unit: "s",
            before: { values: ["150","130","110"], breakpoint_type: "spell_rank", breakpoints: ["1","2","3"] },
            after:  { values: ["140","120","100"], breakpoint_type: "spell_rank", breakpoints: ["1","2","3"] },
          }
        ]}
      ]
    },
    {
      name: "Mel", role: "Mid", verdict: "BUFF",
      icon: "https://am-a.akamaihd.net/image?f=https://ddragon.leagueoflegends.com/cdn/16.4.1/img/champion/Mel.png",
      context: "Post-rework power-up — proactive damage scaling with level, skewing toward mid lane.",
      changes: [
        { ability: "Passive - Searing Brilliance", stats: [{
          stat: "Minion Damage Modifier", type: "scalar",
          before: { value: "0.6x" }, after: { value: "0.5x" }, delta: "-0.1x"
        }]},
        { ability: "Q - Radiant Volley", stats: [
          {
            stat: "Base Damage per Bolt", type: "aligned_series",
            before: { values: ["5","6","7","8","9"], breakpoint_type: "spell_rank", breakpoints: ["1","2","3","4","5"] },
            after:  { values: ["5","7","9","11","13"], breakpoint_type: "spell_rank", breakpoints: ["1","2","3","4","5"] },
          },
          {
            stat: "Total Q Base Damage", type: "aligned_series",
            before: { values: ["90","132","176","222","270"], breakpoint_type: "spell_rank", breakpoints: ["1","2","3","4","5"] },
            after:  { values: ["90","145","200","255","310"], breakpoint_type: "spell_rank", breakpoints: ["1","2","3","4","5"] },
          }
        ]},
        { ability: "R - Golden Eclipse", stats: [{
          stat: "Initial Base Damage", type: "aligned_series",
          before: { values: ["100","150","200"], breakpoint_type: "spell_rank", breakpoints: ["1","2","3"] },
          after:  { values: ["125","200","275"], breakpoint_type: "spell_rank", breakpoints: ["1","2","3"] },
        }]}
      ]
    },
    {
      name: "Neeko", role: "Mid / Support", verdict: "NERF",
      icon: "https://am-a.akamaihd.net/image?f=https://ddragon.leagueoflegends.com/cdn/16.4.1/img/champion/Neeko.png",
      context: "Clone vision control reduced — cooldown starts on expiration, Ctrl+5 clone trick removed.",
      changes: [{
        ability: "W - Shapeshifter",
        stats: [
          { stat: "Cooldown Start", type: "text", before: { value: "On cast" }, after: { value: "On clone expiration" } },
          { stat: "Ctrl+5 Clone Joke", type: "text", before: { value: "Available" }, after: { value: "Removed" } }
        ]
      }]
    },
    {
      name: "Nocturne", role: "Jungle", verdict: "BUFF",
      icon: "https://am-a.akamaihd.net/image?f=https://ddragon.leagueoflegends.com/cdn/16.4.1/img/champion/Nocturne.png",
      context: "Passive cooldown and Q move speed buffed for better stick and run-down potential.",
      changes: [
        { ability: "Passive - Umbra Blades", stats: [{
          stat: "Cooldown", type: "scalar", unit: "s",
          before: { value: "13" }, after: { value: "12" }, delta: "-1"
        }]},
        { ability: "Q - Duskbringer", stats: [{
          stat: "Bonus Move Speed", type: "aligned_series", unit: "%",
          before: { values: ["15","20","25","30","35"], breakpoint_type: "spell_rank", breakpoints: ["1","2","3","4","5"] },
          after:  { values: ["20","25","30","35","40"], breakpoint_type: "spell_rank", breakpoints: ["1","2","3","4","5"] },
        }]}
      ]
    },
    {
      name: "Orianna", role: "Mid", verdict: "NERF",
      icon: "https://am-a.akamaihd.net/image?f=https://ddragon.leagueoflegends.com/cdn/16.4.1/img/champion/Orianna.png",
      context: "Strongest mid laner — early Q cooldown increased to create laning weaknesses.",
      changes: [{
        ability: "Q - Command: Attack",
        stats: [{
          stat: "Cooldown", type: "aligned_series", unit: "s",
          before: { values: ["6","5.25","4.5","3.75","3"], breakpoint_type: "spell_rank", breakpoints: ["1","2","3","4","5"] },
          after:  { values: ["7","6","5","4","3"], breakpoint_type: "spell_rank", breakpoints: ["1","2","3","4","5"] },
        }]
      }]
    },
    {
      name: "Samira", role: "Bot", verdict: "ADJUSTED",
      icon: "https://am-a.akamaihd.net/image?f=https://ddragon.leagueoflegends.com/cdn/16.4.1/img/champion/Samira.png",
      context: "Q QoL improvements — better Sword vs Gun decision logic and passive interaction bugfixes.",
      changes: [{
        ability: "Q - Flair",
        stats: [
          { stat: "Unit Detection", type: "text", before: { value: "Basic check" }, after: { value: "Multi-check left/right + distance logic for Sword/Gun" } },
          { stat: "Passive Interaction", type: "text", before: { value: "Q could go on CD during passive anim" }, after: { value: "Q properly sealed during passive" } },
          { stat: "Edge-of-Range", type: "text", before: { value: "Sword Q whiffs on slow walkers" }, after: { value: "Gun Q if target walking away at max range" } }
        ]
      }]
    },
    {
      name: "Taliyah", role: "Mid / Jungle", verdict: "ADJUSTED",
      icon: "https://am-a.akamaihd.net/image?f=https://ddragon.leagueoflegends.com/cdn/16.4.1/img/champion/Taliyah.png",
      context: "Early push power reduced for mid; jungle compensated with more monster damage.",
      changes: [{
        ability: "Q - Threaded Volley",
        stats: [
          {
            stat: "Base Damage", type: "aligned_series",
            before: { values: ["55","72.5","90","107.5","125"], breakpoint_type: "spell_rank", breakpoints: ["1","2","3","4","5"] },
            after:  { values: ["50","67.5","85","102.5","120"], breakpoint_type: "spell_rank", breakpoints: ["1","2","3","4","5"] },
          },
          {
            stat: "Bonus Monster Damage", type: "aligned_series",
            before: { values: ["20","25","30","35","40"], breakpoint_type: "spell_rank", breakpoints: ["1","2","3","4","5"] },
            after:  { values: ["23","28","33","38","43"], breakpoint_type: "spell_rank", breakpoints: ["1","2","3","4","5"] },
          }
        ]
      }]
    },
    {
      name: "Varus", role: "Bot", verdict: "ADJUSTED",
      icon: "https://am-a.akamaihd.net/image?f=https://ddragon.leagueoflegends.com/cdn/16.4.1/img/champion/Varus.png",
      context: "Lethality build nerfed (pro dominant), on-hit build compensated with bonus AD scaling.",
      changes: [
        { ability: "Q - Piercing Arrow", stats: [
          {
            stat: "Max Damage (base)", type: "aligned_series",
            before: { values: ["80","160","240","320","400"], breakpoint_type: "spell_rank", breakpoints: ["1","2","3","4","5"] },
            after:  { values: ["80","150","220","290","360"], breakpoint_type: "spell_rank", breakpoints: ["1","2","3","4","5"] },
          },
          {
            stat: "Max Damage (bAD ratio)", type: "aligned_series", unit: "% bAD",
            before: { values: ["130","140","150","160","170"], breakpoint_type: "spell_rank", breakpoints: ["1","2","3","4","5"] },
            after:  { values: ["150","150","150","150","150"], breakpoint_type: "spell_rank", breakpoints: ["1","2","3","4","5"] },
            note: "Flattened to 150% all ranks"
          }
        ]},
        { ability: "W - Blighted Quiver", stats: [{
          stat: "On-Hit Damage", type: "text",
          before: { value: "8-44 (+25% AP)" },
          after:  { value: "8-44 (+25% AP +15% bAD)" },
          note: "New bonus AD ratio added"
        }]}
      ]
    },
    {
      name: "Volibear", role: "Top / Jungle", verdict: "BUFF",
      icon: "https://am-a.akamaihd.net/image?f=https://ddragon.leagueoflegends.com/cdn/16.4.1/img/champion/Volibear.png",
      context: "Top lane mana relief and bruiser build buffs to reduce wizard bear dominance.",
      changes: [
        { ability: "Q - Thundering Smash", stats: [{
          stat: "Bonus Physical Damage", type: "scalar", unit: "%",
          before: { value: "+140%" }, after: { value: "+160%" }, delta: "+20%"
        }]},
        { ability: "W - Frenzied Maul", stats: [
          {
            stat: "Mana Cost", type: "aligned_series",
            before: { values: ["30","35","40","45","50"], breakpoint_type: "spell_rank", breakpoints: ["1","2","3","4","5"] },
            after:  { values: ["20","25","30","35","40"], breakpoint_type: "spell_rank", breakpoints: ["1","2","3","4","5"] },
          },
          {
            stat: "Wounded Bonus (per 100 bAD)", type: "scalar", unit: "%",
            before: { value: "+15%" }, after: { value: "+25%" }, delta: "+10%"
          }
        ]},
        { ability: "E - Sky Splitter", stats: [{
          stat: "Mana Cost", type: "scalar",
          before: { value: "60" }, after: { value: "50" }, delta: "-10"
        }]}
      ]
    }
  ],
  items: [
    {
      name: "Hubris",
      icon: "https://cmsassets.rgpub.io/sanity/images/dsfx7636/news_live/a34df90c23ef9bf88f76d0f4f96960a0f02b0794-512x512.png",
      category: "AD Assassin", verdict: "BUFF",
      context: "Weakest AD assassin item — cheaper build path to spike earlier and snowball.",
      changes: [
        { stat: "Combine Cost", type: "scalar", before: { value: "950g" }, after: { value: "750g" }, delta: "-200g" },
        { stat: "Total Price", type: "scalar", before: { value: "3000g" }, after: { value: "2800g" }, delta: "-200g" }
      ]
    },
    {
      name: "Locket of the Iron Solari",
      icon: "https://cmsassets.rgpub.io/sanity/images/dsfx7636/news_live/81022daf147a6658c27f1432268570795d6c07a2-512x512.png",
      category: "Support Tank", verdict: "BUFF",
      context: "Front-loaded shield power so it competes with Bandlepipes as first-slot support purchase.",
      changes: [
        { stat: "Shield", type: "text", before: { value: "200-360, scaling after level 1" }, after: { value: "290-360, scaling after level 8" } },
        { stat: "Shield Lv8-18", type: "text", before: { value: "265-360" }, after: { value: "290-360" } }
      ]
    }
  ],
  systems: [
    { name: "Ranked: Aegis of Valor", category: "Ranked", summary: "Rewards voided for players reported and validated for disruptive behaviors." },
    { name: "Autofill/Secondary Matchmaking", category: "Matchmaking", summary: "Improved positional matchups (autofill vs autofill). Rolling out starting with EUW." },
    { name: "Last Hit Indicators", category: "Gameplay", summary: "Visual indicators for last-hittable minions. Available in Co-op vs. AI, Tutorials, Swiftplay, Custom, Practice Tool, and RGM SR queues. On by default for new accounts." },
    { name: "Severe Chat Penalties", category: "Behavioral", summary: "Gameplay bans (not just chat bans) now issued for severely disruptive comms: hate speech, threats of violence, severe aggression." },
    { name: "Brawl Returns", category: "Modes", summary: "Brawl live from March 4 through April 28, 2026." }
  ],
  aram: {
    augments_buffed: ["Upgrade Immolate", "Slow Cooker", "Celestial Body", "Guilty Pleasure", "Perseverance", "Courage of the Colossus", "Adamant", "Stuck In Here With Me", "Dropkick", "Dropybara", "Golden Snowball", "Poro King", "Void Rift", "Critical Missile"],
    augments_nerfed: ["Impassable", "Escape Plan"],
    augments_new: ["Upgrade Sword of Blossoming Dawn", "Wee Woo Wee Woo (Set Bonus rework)"],
    structures: "Nexus HP 5500→3000, Nexus Tower HP 1800→3000",
    item_notes: ["Moonstone Renewer: chain healing skips Vampirism targets", "Diadem of Songs: healing missile skips Vampirism targets"]
  }
};

// ═══════════════════════════════════════════════════════════════
// BREAKPOINT LABEL FORMATTERS
// ═══════════════════════════════════════════════════════════════

const BP_LABELS = {
  spell_rank: (bp) => `R${bp}`,
  champion_level: (bp) => `Lv${bp}`,
  game_time: (bp) => bp,
  item_level: (bp) => `T${bp}`,
};

const BP_TYPE_NAMES = {
  spell_rank: "RANK",
  champion_level: "LEVEL",
  game_time: "TIME",
  item_level: "TIER",
};

// ═══════════════════════════════════════════════════════════════
// STYLE CONSTANTS
// ═══════════════════════════════════════════════════════════════

const VERDICT_COLORS = {
  BUFF:     { bg: "rgba(34,197,94,0.12)", border: "#22c55e", text: "#4ade80", glow: "0 0 12px rgba(34,197,94,0.3)" },
  NERF:     { bg: "rgba(239,68,68,0.12)", border: "#ef4444", text: "#f87171", glow: "0 0 12px rgba(239,68,68,0.3)" },
  ADJUSTED: { bg: "rgba(234,179,8,0.12)", border: "#eab308", text: "#facc15", glow: "0 0 12px rgba(234,179,8,0.3)" },
};

const MONO = "'JetBrains Mono', monospace";
const SERIF = "'Cinzel', serif";
const SANS = "'IBM Plex Sans', sans-serif";

// ═══════════════════════════════════════════════════════════════
// COMPONENTS — Atoms
// ═══════════════════════════════════════════════════════════════

const VerdictBadge = ({ verdict }) => {
  const c = VERDICT_COLORS[verdict] || VERDICT_COLORS.ADJUSTED;
  return (
    <span style={{ padding: "3px 10px", background: c.bg, border: `1px solid ${c.border}`, color: c.text, fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", fontFamily: MONO, textTransform: "uppercase" }}>
      {verdict}
    </span>
  );
};

const UnitBadge = ({ unit }) => {
  if (!unit) return null;
  return (
    <span style={{ padding: "1px 5px", background: "rgba(200,170,110,0.06)", border: "1px solid rgba(200,170,110,0.1)", color: "#6B5D48", fontSize: 9, fontWeight: 600, fontFamily: MONO, marginLeft: 4 }}>
      {unit}
    </span>
  );
};

const DeltaBadge = ({ delta }) => {
  if (!delta && delta !== 0) return null;
  const s = String(delta);
  const isUp = s.startsWith("+");
  const isDown = s.startsWith("-");
  const color = isUp ? "#4ade80" : isDown ? "#f87171" : "#facc15";
  const bg = isUp ? "rgba(34,197,94,0.08)" : isDown ? "rgba(239,68,68,0.08)" : "rgba(234,179,8,0.08)";
  const bdr = isUp ? "rgba(34,197,94,0.2)" : isDown ? "rgba(239,68,68,0.2)" : "rgba(234,179,8,0.2)";
  return (
    <span style={{ padding: "1px 6px", background: bg, border: `1px solid ${bdr}`, color, fontSize: 10, fontWeight: 700, fontFamily: MONO }}>
      {s}
    </span>
  );
};

const TabButton = ({ active, onClick, children, count }) => (
  <button onClick={onClick} style={{ padding: "10px 22px", background: active ? "rgba(200,170,110,0.15)" : "transparent", border: active ? "1px solid rgba(200,170,110,0.5)" : "1px solid rgba(200,170,110,0.1)", color: active ? "#C8AA6E" : "#8B7A5E", fontFamily: SERIF, fontSize: 13, fontWeight: 700, letterSpacing: "0.1em", cursor: "pointer", transition: "all 0.2s", textTransform: "uppercase" }}>
    {children}
    {count !== undefined && <span style={{ marginLeft: 8, background: active ? "rgba(200,170,110,0.3)" : "rgba(200,170,110,0.08)", padding: "2px 7px", borderRadius: 3, fontSize: 11, fontFamily: MONO }}>{count}</span>}
  </button>
);

// ═══════════════════════════════════════════════════════════════
// ALIGNMENT GRID — Renders aligned_series with breakpoint headers
// Per-cell: breakpoint label → before (struck) → after → delta
// ═══════════════════════════════════════════════════════════════

const AlignmentGrid = ({ s }) => {
  const bVals = s.before.values;
  const aVals = s.after.values;
  const deltas = computeDeltas(bVals, aVals);
  const bBP = s.before.breakpoints || bVals.map((_, i) => `${i + 1}`);
  const aBP = s.after.breakpoints || aVals.map((_, i) => `${i + 1}`);
  const bType = s.before.breakpoint_type || "spell_rank";
  const aType = s.after.breakpoint_type || "spell_rank";
  const sameType = bType === aType;
  const bpMismatch = !sameType;
  const bFmt = BP_LABELS[bType] || ((x) => x);
  const aFmt = BP_LABELS[aType] || ((x) => x);

  const colW = bVals.length <= 3 ? 80 : 56;

  return (
    <div style={{ padding: "6px 0 4px 10px", borderLeft: "2px solid rgba(200,170,110,0.1)", marginLeft: 4, overflowX: "auto" }}>
      {/* Breakpoint type mismatch indicator */}
      {bpMismatch && (
        <div style={{ display: "flex", gap: 6, marginBottom: 6, alignItems: "center" }}>
          <span style={{ fontSize: 9, color: "#ef4444", fontFamily: MONO, opacity: 0.7, background: "rgba(239,68,68,0.06)", padding: "1px 5px", border: "1px solid rgba(239,68,68,0.1)" }}>{BP_TYPE_NAMES[bType]}</span>
          <span style={{ fontSize: 11, color: "#5A4F3C" }}>⇒</span>
          <span style={{ fontSize: 9, color: "#4ade80", fontFamily: MONO, background: "rgba(34,197,94,0.06)", padding: "1px 5px", border: "1px solid rgba(34,197,94,0.1)" }}>{BP_TYPE_NAMES[aType]}</span>
        </div>
      )}

      {/* Column-aligned grid */}
      <div style={{ display: "inline-grid", gridTemplateColumns: `48px repeat(${bVals.length}, ${colW}px)`, rowGap: 0, columnGap: 0 }}>

        {/* Breakpoint header row (before) */}
        <div style={{ display: "flex", alignItems: "flex-end", paddingBottom: 3 }}>
          <span style={{ fontSize: 9, color: "#3D3628", fontFamily: MONO, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            {bpMismatch ? BP_TYPE_NAMES[bType] : ""}
          </span>
        </div>
        {bBP.map((bp, i) => (
          <div key={`bph-${i}`} style={{ textAlign: "center", paddingBottom: 3, borderRight: i < bVals.length - 1 ? "1px solid rgba(200,170,110,0.04)" : "none" }}>
            <span style={{ fontSize: 9, color: "#4A4030", fontWeight: 700, fontFamily: MONO }}>{bFmt(bp)}</span>
          </div>
        ))}

        {/* Before values row */}
        <div style={{ display: "flex", alignItems: "center", padding: "3px 0" }}>
          <span style={{ fontSize: 9, color: "#5A4F3C", fontFamily: MONO, textTransform: "uppercase", letterSpacing: "0.1em" }}>Before</span>
        </div>
        {bVals.map((v, i) => (
          <div key={`bv-${i}`} style={{ textAlign: "center", padding: "3px 2px", borderRight: i < bVals.length - 1 ? "1px solid rgba(200,170,110,0.04)" : "none", background: "rgba(239,68,68,0.02)" }}>
            <span style={{ fontSize: 12, color: "#ef4444", fontWeight: 600, fontFamily: MONO, textDecoration: "line-through", opacity: 0.55 }}>{v}</span>
          </div>
        ))}

        {/* After breakpoint header row (only if mismatch) */}
        {bpMismatch && (
          <>
            <div style={{ display: "flex", alignItems: "flex-end", paddingBottom: 2, paddingTop: 4 }}>
              <span style={{ fontSize: 9, color: "#3D3628", fontFamily: MONO, textTransform: "uppercase", letterSpacing: "0.08em" }}>{BP_TYPE_NAMES[aType]}</span>
            </div>
            {aBP.map((bp, i) => (
              <div key={`aph-${i}`} style={{ textAlign: "center", paddingBottom: 2, paddingTop: 4, borderRight: i < aVals.length - 1 ? "1px solid rgba(200,170,110,0.04)" : "none" }}>
                <span style={{ fontSize: 9, color: "#4A4030", fontWeight: 700, fontFamily: MONO }}>{aFmt(bp)}</span>
              </div>
            ))}
          </>
        )}

        {/* After values row */}
        <div style={{ display: "flex", alignItems: "center", padding: "3px 0" }}>
          <span style={{ fontSize: 9, color: "#5A4F3C", fontFamily: MONO, textTransform: "uppercase", letterSpacing: "0.1em" }}>After</span>
        </div>
        {aVals.map((v, i) => (
          <div key={`av-${i}`} style={{ textAlign: "center", padding: "3px 2px", borderRight: i < aVals.length - 1 ? "1px solid rgba(200,170,110,0.04)" : "none", background: "rgba(34,197,94,0.02)" }}>
            <span style={{ fontSize: 12, color: "#4ade80", fontWeight: 600, fontFamily: MONO }}>{v}</span>
          </div>
        ))}

        {/* Delta row */}
        {deltas && sameType && (
          <>
            <div style={{ display: "flex", alignItems: "center", padding: "3px 0", borderTop: "1px solid rgba(200,170,110,0.06)" }}>
              <span style={{ fontSize: 9, color: "#3D3628", fontFamily: MONO, textTransform: "uppercase", letterSpacing: "0.1em" }}>Delta</span>
            </div>
            {deltas.map((d, i) => {
              const isUp = d && d !== "=" && String(d).startsWith("+");
              const isDown = d && d !== "=" && String(d).startsWith("-");
              return (
                <div key={`d-${i}`} style={{ textAlign: "center", padding: "3px 2px", borderRight: i < deltas.length - 1 ? "1px solid rgba(200,170,110,0.04)" : "none", borderTop: "1px solid rgba(200,170,110,0.06)" }}>
                  <span style={{ fontSize: 10, fontWeight: 700, fontFamily: MONO, color: d === "=" ? "#2A2418" : isUp ? "#4ade80" : isDown ? "#f87171" : "#5A4F3C" }}>
                    {d === "=" ? "—" : d || "?"}
                  </span>
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* Note */}
      {s.note && (
        <div style={{ marginTop: 6, fontSize: 10, color: "#5A4F3C", fontFamily: SANS, fontStyle: "italic", paddingLeft: 48 }}>
          {s.note}
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// STAT ROW — Routes to correct renderer by type
// ═══════════════════════════════════════════════════════════════

const StatRow = ({ s }) => {
  const isAligned = s.type === "aligned_series";

  return (
    <div style={{ padding: "8px 0", borderBottom: "1px solid rgba(200,170,110,0.05)", fontFamily: MONO }}>
      {/* Stat label row */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: isAligned ? 6 : 0 }}>
        <span style={{ color: "#A09070", fontFamily: SANS, fontSize: 12 }}>{s.stat}</span>
        <UnitBadge unit={s.unit} />
        {!isAligned && s.delta && <DeltaBadge delta={s.delta} />}
      </div>

      {isAligned ? (
        <AlignmentGrid s={s} />
      ) : (
        /* Scalar / Text: vertical stack */
        <div style={{ display: "flex", flexDirection: "column", gap: 2, paddingLeft: 10, borderLeft: "2px solid rgba(200,170,110,0.06)", marginLeft: 4, marginTop: 4 }}>
          <span style={{ color: "#ef4444", textDecoration: "line-through", opacity: 0.55, fontSize: 12, fontFamily: MONO }}>{s.before.value}</span>
          <span style={{ color: "#4ade80", fontSize: 12, fontWeight: 600, fontFamily: MONO }}>{s.after.value}</span>
          {s.note && <span style={{ fontSize: 10, color: "#5A4F3C", fontFamily: SANS, fontStyle: "italic" }}>{s.note}</span>}
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// CARDS
// ═══════════════════════════════════════════════════════════════

const ChampionCard = ({ champ }) => {
  const [open, setOpen] = useState(false);
  const c = VERDICT_COLORS[champ.verdict] || VERDICT_COLORS.ADJUSTED;
  const statCount = champ.changes.reduce((n, ch) => n + ch.stats.length, 0);
  return (
    <div style={{ background: "rgba(10,10,15,0.7)", border: `1px solid ${open ? c.border : "rgba(200,170,110,0.1)"}`, transition: "all 0.3s", boxShadow: open ? c.glow : "none", cursor: "pointer" }} onClick={() => setOpen(!open)}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px" }}>
        <img src={champ.icon} alt={champ.name} style={{ width: 40, height: 40, borderRadius: 4, border: `1px solid ${c.border}` }} onError={(e) => { e.target.style.display = 'none'; }} />
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span style={{ color: "#E8DCC8", fontFamily: SERIF, fontSize: 15, fontWeight: 700 }}>{champ.name}</span>
            <VerdictBadge verdict={champ.verdict} />
            <span style={{ color: "#5A4F3C", fontSize: 11, fontFamily: MONO }}>{champ.role}</span>
            <span style={{ color: "#3D3628", fontSize: 10, fontFamily: MONO }}>{statCount} stat{statCount !== 1 ? "s" : ""}</span>
          </div>
          <div style={{ color: "#7A6E58", fontSize: 12, marginTop: 4, fontFamily: SANS, lineHeight: 1.4 }}>{champ.context}</div>
        </div>
        <span style={{ color: "#5A4F3C", fontSize: 18, transform: open ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s", flexShrink: 0 }}>▸</span>
      </div>
      {open && (
        <div style={{ padding: "0 18px 16px", borderTop: "1px solid rgba(200,170,110,0.06)" }} onClick={e => e.stopPropagation()}>
          {champ.changes.map((change, i) => (
            <div key={i} style={{ marginTop: 12 }}>
              <div style={{ color: "#C8AA6E", fontSize: 12, fontWeight: 700, fontFamily: SANS, marginBottom: 6, letterSpacing: "0.03em" }}>{change.ability}</div>
              {change.stats.map((s, j) => <StatRow key={j} s={s} />)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ItemCard = ({ item }) => {
  const [open, setOpen] = useState(false);
  const c = VERDICT_COLORS[item.verdict] || VERDICT_COLORS.ADJUSTED;
  return (
    <div style={{ background: "rgba(10,10,15,0.7)", border: `1px solid ${open ? c.border : "rgba(200,170,110,0.1)"}`, transition: "all 0.3s", boxShadow: open ? c.glow : "none", cursor: "pointer" }} onClick={() => setOpen(!open)}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px" }}>
        <img src={item.icon} alt={item.name} style={{ width: 36, height: 36, borderRadius: 4, border: `1px solid ${c.border}` }} onError={(e) => { e.target.style.display = 'none'; }} />
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ color: "#E8DCC8", fontFamily: SERIF, fontSize: 14, fontWeight: 700 }}>{item.name}</span>
            <VerdictBadge verdict={item.verdict} />
            <span style={{ color: "#5A4F3C", fontSize: 11, fontFamily: MONO }}>{item.category}</span>
          </div>
          <div style={{ color: "#7A6E58", fontSize: 12, marginTop: 3, fontFamily: SANS }}>{item.context}</div>
        </div>
        <span style={{ color: "#5A4F3C", fontSize: 18, transform: open ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>▸</span>
      </div>
      {open && (
        <div style={{ padding: "0 18px 16px", borderTop: "1px solid rgba(200,170,110,0.06)" }} onClick={e => e.stopPropagation()}>
          {item.changes.map((s, j) => <StatRow key={j} s={s} />)}
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════

export default function PatchParser() {
  const [tab, setTab] = useState("champions");
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const filteredChamps = useMemo(() => {
    return PATCH_DATA.champions.filter(c => {
      const matchVerdict = filter === "ALL" || c.verdict === filter;
      const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.role.toLowerCase().includes(search.toLowerCase());
      return matchVerdict && matchSearch;
    });
  }, [filter, search]);

  const counts = useMemo(() => ({
    buff: PATCH_DATA.champions.filter(c => c.verdict === "BUFF").length,
    nerf: PATCH_DATA.champions.filter(c => c.verdict === "NERF").length,
    adjusted: PATCH_DATA.champions.filter(c => c.verdict === "ADJUSTED").length,
  }), []);

  const totalStats = useMemo(() => {
    let s = 0;
    PATCH_DATA.champions.forEach(c => c.changes.forEach(ch => { s += ch.stats.length; }));
    return s;
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(170deg, #0A0A0F 0%, #0D0D14 40%, #0F0E16 100%)", color: "#E8DCC8", fontFamily: SANS, padding: 0 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=JetBrains+Mono:wght@400;600;700&family=IBM+Plex+Sans:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(200,170,110,0.2); border-radius: 2px; }
      `}</style>

      {/* Header */}
      <div style={{ padding: "32px 32px 20px", borderBottom: "1px solid rgba(200,170,110,0.1)", background: "linear-gradient(180deg, rgba(200,170,110,0.04) 0%, transparent 100%)" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 4, flexWrap: "wrap" }}>
          <span style={{ fontFamily: SERIF, fontSize: 28, fontWeight: 900, letterSpacing: "0.04em", color: "#C8AA6E" }}>PATCH {PATCH_DATA.patch}</span>
          <span style={{ fontFamily: MONO, fontSize: 12, color: "#5A4F3C" }}>{PATCH_DATA.date}</span>
          <span style={{ fontFamily: MONO, fontSize: 9, color: "#3D3628", padding: "2px 6px", border: "1px solid rgba(200,170,110,0.08)", letterSpacing: "0.05em" }}>aligned_series v2</span>
        </div>
        <div style={{ color: "#7A6E58", fontSize: 13, lineHeight: 1.5, maxWidth: 700, marginTop: 8 }}>{PATCH_DATA.summary}</div>

        {/* Stats bar */}
        <div style={{ display: "flex", gap: 24, marginTop: 18, padding: "10px 16px", background: "rgba(200,170,110,0.04)", border: "1px solid rgba(200,170,110,0.06)", width: "fit-content", flexWrap: "wrap" }}>
          {[
            { label: "Champions", val: PATCH_DATA.champions.length },
            { label: "Items", val: PATCH_DATA.items.length },
            { label: "Systems", val: PATCH_DATA.systems.length },
            { label: "Stat Changes", val: totalStats },
            { label: "Buffs", val: counts.buff, color: "#4ade80" },
            { label: "Nerfs", val: counts.nerf, color: "#f87171" },
            { label: "Adjusted", val: counts.adjusted, color: "#facc15" },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: MONO, fontSize: 18, fontWeight: 700, color: s.color || "#C8AA6E" }}>{s.val}</div>
              <div style={{ fontSize: 10, color: "#5A4F3C", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 0, padding: "0 32px", borderBottom: "1px solid rgba(200,170,110,0.06)", background: "rgba(0,0,0,0.2)", flexWrap: "wrap" }}>
        <TabButton active={tab === "champions"} onClick={() => setTab("champions")} count={PATCH_DATA.champions.length}>Champions</TabButton>
        <TabButton active={tab === "items"} onClick={() => setTab("items")} count={PATCH_DATA.items.length}>Items</TabButton>
        <TabButton active={tab === "systems"} onClick={() => setTab("systems")} count={PATCH_DATA.systems.length}>Systems</TabButton>
        <TabButton active={tab === "aram"} onClick={() => setTab("aram")}>ARAM</TabButton>
        <TabButton active={tab === "json"} onClick={() => setTab("json")}>Raw JSON</TabButton>
      </div>

      {/* Content */}
      <div style={{ padding: "20px 32px 40px" }}>
        {tab === "champions" && (
          <>
            <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
              {["ALL", "BUFF", "NERF", "ADJUSTED"].map(f => (
                <button key={f} onClick={() => setFilter(f)} style={{
                  padding: "5px 14px",
                  background: filter === f ? (f === "ALL" ? "rgba(200,170,110,0.15)" : VERDICT_COLORS[f]?.bg) : "transparent",
                  border: `1px solid ${filter === f ? (f === "ALL" ? "rgba(200,170,110,0.4)" : VERDICT_COLORS[f]?.border) : "rgba(200,170,110,0.08)"}`,
                  color: filter === f ? (f === "ALL" ? "#C8AA6E" : VERDICT_COLORS[f]?.text) : "#5A4F3C",
                  fontSize: 11, fontWeight: 700, fontFamily: MONO, cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.1em",
                }}>{f}</button>
              ))}
              <input type="text" placeholder="Search champion..." value={search} onChange={e => setSearch(e.target.value)} style={{ padding: "5px 14px", background: "rgba(200,170,110,0.04)", border: "1px solid rgba(200,170,110,0.1)", color: "#E8DCC8", fontSize: 12, fontFamily: MONO, outline: "none", width: 180 }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {filteredChamps.map(c => <ChampionCard key={c.name} champ={c} />)}
              {filteredChamps.length === 0 && <div style={{ color: "#5A4F3C", padding: 40, textAlign: "center", fontFamily: MONO }}>No champions match filter.</div>}
            </div>
          </>
        )}

        {tab === "items" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {PATCH_DATA.items.map(item => <ItemCard key={item.name} item={item} />)}
          </div>
        )}

        {tab === "systems" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {PATCH_DATA.systems.map((sys, i) => (
              <div key={i} style={{ background: "rgba(10,10,15,0.7)", border: "1px solid rgba(200,170,110,0.1)", padding: "16px 20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <span style={{ color: "#E8DCC8", fontFamily: SERIF, fontSize: 14, fontWeight: 700 }}>{sys.name}</span>
                  <span style={{ padding: "2px 8px", background: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.3)", color: "#60a5fa", fontSize: 10, fontWeight: 700, fontFamily: MONO, textTransform: "uppercase", letterSpacing: "0.1em" }}>{sys.category}</span>
                </div>
                <div style={{ color: "#7A6E58", fontSize: 13, lineHeight: 1.5 }}>{sys.summary}</div>
              </div>
            ))}
          </div>
        )}

        {tab === "aram" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              { title: "Augments Buffed", data: PATCH_DATA.aram.augments_buffed, bg: "rgba(34,197,94,0.08)", bdr: "rgba(34,197,94,0.2)", color: "#4ade80" },
              { title: "Augments Nerfed", data: PATCH_DATA.aram.augments_nerfed, bg: "rgba(239,68,68,0.08)", bdr: "rgba(239,68,68,0.2)", color: "#f87171" },
              { title: "New Augments", data: PATCH_DATA.aram.augments_new, bg: "rgba(168,85,247,0.08)", bdr: "rgba(168,85,247,0.2)", color: "#c084fc" },
            ].map(({ title, data, bg, bdr, color }) => (
              <div key={title} style={{ background: "rgba(10,10,15,0.7)", border: "1px solid rgba(200,170,110,0.1)", padding: "16px 20px" }}>
                <div style={{ color: "#C8AA6E", fontFamily: SERIF, fontSize: 14, fontWeight: 700, marginBottom: 10 }}>{title} ({data.length})</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {data.map(a => <span key={a} style={{ padding: "4px 10px", background: bg, border: `1px solid ${bdr}`, color, fontSize: 12, fontFamily: MONO }}>{a}</span>)}
                </div>
              </div>
            ))}
            <div style={{ background: "rgba(10,10,15,0.7)", border: "1px solid rgba(200,170,110,0.1)", padding: "16px 20px" }}>
              <div style={{ color: "#C8AA6E", fontFamily: SERIF, fontSize: 14, fontWeight: 700, marginBottom: 8 }}>Structures</div>
              <div style={{ color: "#7A6E58", fontSize: 13, fontFamily: MONO }}>{PATCH_DATA.aram.structures}</div>
            </div>
            <div style={{ background: "rgba(10,10,15,0.7)", border: "1px solid rgba(200,170,110,0.1)", padding: "16px 20px" }}>
              <div style={{ color: "#C8AA6E", fontFamily: SERIF, fontSize: 14, fontWeight: 700, marginBottom: 8 }}>Item Interactions</div>
              {PATCH_DATA.aram.item_notes.map((n, i) => <div key={i} style={{ color: "#7A6E58", fontSize: 12, fontFamily: MONO, marginBottom: 4 }}>• {n}</div>)}
            </div>
          </div>
        )}

        {tab === "json" && (
          <div style={{ background: "rgba(10,10,15,0.9)", border: "1px solid rgba(200,170,110,0.1)", padding: 20, maxHeight: "70vh", overflow: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ color: "#C8AA6E", fontFamily: SERIF, fontSize: 14, fontWeight: 700 }}>Structured Output — aligned_series v2</span>
              <button onClick={() => navigator.clipboard.writeText(JSON.stringify(PATCH_DATA, null, 2))} style={{ padding: "4px 12px", background: "rgba(200,170,110,0.1)", border: "1px solid rgba(200,170,110,0.3)", color: "#C8AA6E", fontSize: 11, fontFamily: MONO, cursor: "pointer" }}>Copy JSON</button>
            </div>
            <pre style={{ color: "#7A6E58", fontSize: 11, fontFamily: MONO, lineHeight: 1.6, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{JSON.stringify(PATCH_DATA, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
