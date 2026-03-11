import { useState, useMemo } from "react";

const PATCH_DATA = {
  patch: "26.5",
  date: "2026-03-03",
  title: "League of Legends Patch 26.5 Notes",
  summary: "Official patch of First Stand — pro-focused mid lane retuning, bot lane adjustment, roster-wide outlier buffs/nerfs, Brawl return, ARAM: Mayhem updates, Arena bugfixes, last hit indicators, and severe chat penalty escalation.",
  champions: [
    {
      name: "Akali",
      role: "Mid / Top",
      verdict: "ADJUSTED",
      icon: "https://am-a.akamaihd.net/image?f=https://ddragon.leagueoflegends.com/cdn/16.4.1/img/champion/Akali.png",
      context: "Restealth timer now scales with champion level instead of game time for multi-mode flexibility.",
      changes: [
        {
          type: "ability",
          ability: "W - Twilight Shroud",
          stats: [
            { stat: "Restealth Timer", before: "1s/.9s/.825s/.725s/.625s (at game times 0:00/8:00/11:00/20:00/30:00)", after: "1s/.9s/.825s/.725s/.625s (at levels 1/7/10/13/16)" }
          ]
        }
      ]
    },
    {
      name: "Azir",
      role: "Mid",
      verdict: "NERF",
      icon: "https://am-a.akamaihd.net/image?f=https://ddragon.leagueoflegends.com/cdn/16.4.1/img/champion/Azir.png",
      context: "Late-game health reduced to give assassins counterplay against the emperor.",
      changes: [
        {
          type: "base_stats",
          ability: "Base Stats",
          stats: [
            { stat: "Health Growth", before: "119", after: "108", delta: -11 }
          ]
        }
      ]
    },
    {
      name: "Garen",
      role: "Top",
      verdict: "BUFF",
      icon: "https://am-a.akamaihd.net/image?f=https://ddragon.leagueoflegends.com/cdn/16.4.1/img/champion/Garen.png",
      context: "Better early trading power and fighter item parity with crit builds.",
      changes: [
        {
          type: "ability",
          ability: "Q - Decisive Strike",
          stats: [
            { stat: "Move Speed Duration", before: "1/1.65/2.3/2.95/3.6", after: "1.4/1.95/2.5/3.05/3.6" }
          ]
        },
        {
          type: "ability",
          ability: "E - Judgment",
          stats: [
            { stat: "Damage per Spin (AD ratio)", before: "38/41/44/47/50% AD", after: "40/43/46/49/52% AD" }
          ]
        }
      ]
    },
    {
      name: "Kha'Zix",
      role: "Jungle",
      verdict: "NERF",
      icon: "https://am-a.akamaihd.net/image?f=https://ddragon.leagueoflegends.com/cdn/16.4.1/img/champion/Khazix.png",
      context: "Top solo queue jungler — clear speed, isolation damage, and movement speed all reduced.",
      changes: [
        {
          type: "base_stats",
          ability: "Base Stats",
          stats: [
            { stat: "Move Speed", before: "350", after: "345", delta: -5 }
          ]
        },
        {
          type: "ability",
          ability: "Q - Taste Their Fear",
          stats: [
            { stat: "Bonus AD Ratio", before: "+110% (231% isolated)", after: "+105% (220.5% isolated)" }
          ]
        }
      ]
    },
    {
      name: "Lee Sin",
      role: "Jungle",
      verdict: "BUFF",
      icon: "https://am-a.akamaihd.net/image?f=https://ddragon.leagueoflegends.com/cdn/16.4.1/img/champion/LeeSin.png",
      context: "Q damage increased to reward skillful play and restore his flair.",
      changes: [
        {
          type: "ability",
          ability: "Q - Sonic Wave / Resonating Strike",
          stats: [
            { stat: "Base Damage", before: "60/90/120/150/180", after: "65/95/125/155/185", delta: "+5 all ranks" }
          ]
        }
      ]
    },
    {
      name: "Lillia",
      role: "Jungle",
      verdict: "BUFF",
      icon: "https://am-a.akamaihd.net/image?f=https://ddragon.leagueoflegends.com/cdn/16.4.1/img/champion/Lillia.png",
      context: "Reverting prior Q nerfs and R buffs — net buff to restore sustained fight fantasy.",
      changes: [
        {
          type: "ability",
          ability: "Passive - Dream-Laden Bough",
          stats: [
            { stat: "Monster Heal Bonus AP Ratio", before: "9%", after: "15%" }
          ]
        },
        {
          type: "ability",
          ability: "Q - Blooming Blows",
          stats: [
            { stat: "Bonus AP Ratio", before: "30%", after: "35%" }
          ]
        },
        {
          type: "ability",
          ability: "R - Lilting Lullaby",
          stats: [
            { stat: "Base Damage", before: "100/150/200", after: "150/200/250" },
            { stat: "AP Ratio", before: "45%", after: "40%" },
            { stat: "Cooldown", before: "150/130/110", after: "140/120/100" }
          ]
        }
      ]
    },
    {
      name: "Mel",
      role: "Mid",
      verdict: "BUFF",
      icon: "https://am-a.akamaihd.net/image?f=https://ddragon.leagueoflegends.com/cdn/16.4.1/img/champion/Mel.png",
      context: "Post-rework power-up — proactive damage scaling with level, skewing toward mid lane.",
      changes: [
        {
          type: "ability",
          ability: "Passive - Searing Brilliance",
          stats: [
            { stat: "Minion Damage Modifier", before: "0.6x", after: "0.5x" }
          ]
        },
        {
          type: "ability",
          ability: "Q - Radiant Volley",
          stats: [
            { stat: "Base Damage per Bolt", before: "5/6/7/8/9", after: "5/7/9/11/13" },
            { stat: "Total Q Base Damage", before: "90/132/176/222/270", after: "90/145/200/255/310" }
          ]
        },
        {
          type: "ability",
          ability: "R - Golden Eclipse",
          stats: [
            { stat: "Initial Base Damage", before: "100/150/200", after: "125/200/275" }
          ]
        }
      ]
    },
    {
      name: "Neeko",
      role: "Mid / Support",
      verdict: "NERF",
      icon: "https://am-a.akamaihd.net/image?f=https://ddragon.leagueoflegends.com/cdn/16.4.1/img/champion/Neeko.png",
      context: "Clone vision control reduced — cooldown starts on expiration, Ctrl+5 clone trick removed.",
      changes: [
        {
          type: "ability",
          ability: "W - Shapeshifter",
          stats: [
            { stat: "Cooldown Start", before: "On cast", after: "On clone expiration" },
            { stat: "Ctrl+5 Clone Joke", before: "Available", after: "Removed" }
          ]
        }
      ]
    },
    {
      name: "Nocturne",
      role: "Jungle",
      verdict: "BUFF",
      icon: "https://am-a.akamaihd.net/image?f=https://ddragon.leagueoflegends.com/cdn/16.4.1/img/champion/Nocturne.png",
      context: "Passive cooldown and Q move speed buffed for better stick and run-down potential.",
      changes: [
        {
          type: "ability",
          ability: "Passive - Umbra Blades",
          stats: [
            { stat: "Cooldown", before: "13s", after: "12s", delta: -1 }
          ]
        },
        {
          type: "ability",
          ability: "Q - Duskbringer",
          stats: [
            { stat: "Bonus Move Speed", before: "15/20/25/30/35%", after: "20/25/30/35/40%" }
          ]
        }
      ]
    },
    {
      name: "Orianna",
      role: "Mid",
      verdict: "NERF",
      icon: "https://am-a.akamaihd.net/image?f=https://ddragon.leagueoflegends.com/cdn/16.4.1/img/champion/Orianna.png",
      context: "Strongest mid laner — early Q cooldown increased to create laning weaknesses.",
      changes: [
        {
          type: "ability",
          ability: "Q - Command: Attack",
          stats: [
            { stat: "Cooldown", before: "6/5.25/4.5/3.75/3", after: "7/6/5/4/3" }
          ]
        }
      ]
    },
    {
      name: "Samira",
      role: "Bot",
      verdict: "ADJUSTED",
      icon: "https://am-a.akamaihd.net/image?f=https://ddragon.leagueoflegends.com/cdn/16.4.1/img/champion/Samira.png",
      context: "Q QoL improvements — better Sword vs Gun decision logic and passive interaction bugfixes.",
      changes: [
        {
          type: "ability",
          ability: "Q - Flair",
          stats: [
            { stat: "Unit Detection", before: "Basic check", after: "Multi-check left/right + distance logic for Sword/Gun" },
            { stat: "Passive Interaction", before: "Q could go on CD during passive animation", after: "Q properly sealed during passive" },
            { stat: "Edge-of-Range Walk-Away", before: "Sword Q could whiff on slow walkers", after: "Gun Q if target walking away at Sword max range" }
          ]
        }
      ]
    },
    {
      name: "Taliyah",
      role: "Mid / Jungle",
      verdict: "ADJUSTED",
      icon: "https://am-a.akamaihd.net/image?f=https://ddragon.leagueoflegends.com/cdn/16.4.1/img/champion/Taliyah.png",
      context: "Early push power reduced for mid; jungle compensated with more monster damage.",
      changes: [
        {
          type: "ability",
          ability: "Q - Threaded Volley",
          stats: [
            { stat: "Base Damage", before: "55/72.5/90/107.5/125", after: "50/67.5/85/102.5/120", delta: "-5 all ranks" },
            { stat: "Bonus Monster Damage", before: "20/25/30/35/40", after: "23/28/33/38/43", delta: "+3 all ranks" }
          ]
        }
      ]
    },
    {
      name: "Varus",
      role: "Bot",
      verdict: "ADJUSTED",
      icon: "https://am-a.akamaihd.net/image?f=https://ddragon.leagueoflegends.com/cdn/16.4.1/img/champion/Varus.png",
      context: "Lethality build nerfed (pro dominant), on-hit build compensated with bonus AD scaling.",
      changes: [
        {
          type: "ability",
          ability: "Q - Piercing Arrow",
          stats: [
            { stat: "Maximum Damage", before: "80/160/240/320/400 (+130/140/150/160/170% bAD)", after: "80/150/220/290/360 (+150% bAD)" }
          ]
        },
        {
          type: "ability",
          ability: "W - Blighted Quiver",
          stats: [
            { stat: "On-Hit Damage", before: "8/17/26/35/44 (+25% AP)", after: "8/17/26/35/44 (+25% AP +15% bAD)" }
          ]
        }
      ]
    },
    {
      name: "Volibear",
      role: "Top / Jungle",
      verdict: "BUFF",
      icon: "https://am-a.akamaihd.net/image?f=https://ddragon.leagueoflegends.com/cdn/16.4.1/img/champion/Volibear.png",
      context: "Top lane mana relief and bruiser build buffs to reduce wizard bear dominance.",
      changes: [
        {
          type: "ability",
          ability: "Q - Thundering Smash",
          stats: [
            { stat: "Bonus Physical Damage", before: "+140%", after: "+160%" }
          ]
        },
        {
          type: "ability",
          ability: "W - Frenzied Maul",
          stats: [
            { stat: "Mana Cost", before: "30/35/40/45/50", after: "20/25/30/35/40", delta: "-10 all ranks" },
            { stat: "Wounded Bonus (per 100 bAD)", before: "+15%", after: "+25%" }
          ]
        },
        {
          type: "ability",
          ability: "E - Sky Splitter",
          stats: [
            { stat: "Mana Cost", before: "60", after: "50", delta: -10 }
          ]
        }
      ]
    }
  ],
  items: [
    {
      name: "Hubris",
      icon: "https://cmsassets.rgpub.io/sanity/images/dsfx7636/news_live/a34df90c23ef9bf88f76d0f4f96960a0f02b0794-512x512.png",
      category: "AD Assassin",
      verdict: "BUFF",
      context: "Weakest AD assassin item — cheaper build path to spike earlier and snowball.",
      changes: [
        { stat: "Combine Cost", before: "950g", after: "750g", delta: "-200g" },
        { stat: "Total Price", before: "3000g", after: "2800g", delta: "-200g" }
      ]
    },
    {
      name: "Locket of the Iron Solari",
      icon: "https://cmsassets.rgpub.io/sanity/images/dsfx7636/news_live/81022daf147a6658c27f1432268570795d6c07a2-512x512.png",
      category: "Support Tank",
      verdict: "BUFF",
      context: "Front-loaded shield power so it competes with Bandlepipes as first-slot support purchase.",
      changes: [
        { stat: "Shield", before: "200-360, scaling after level 1", after: "290-360, scaling after level 8" },
        { stat: "Shield Level 8-18", before: "265-360", after: "290-360" }
      ]
    }
  ],
  systems: [
    {
      name: "Ranked: Aegis of Valor",
      category: "Ranked",
      summary: "Rewards voided for players reported and validated for disruptive behaviors."
    },
    {
      name: "Autofill/Secondary Matchmaking",
      category: "Matchmaking",
      summary: "Improved positional matchups (autofill vs autofill). Rolling out starting with EUW."
    },
    {
      name: "Last Hit Indicators",
      category: "Gameplay",
      summary: "Visual indicators for last-hittable minions. Available in Co-op vs. AI, Tutorials, Swiftplay, Custom, Practice Tool, and RGM SR queues. On by default for new accounts."
    },
    {
      name: "Severe Chat Penalties",
      category: "Behavioral",
      summary: "Gameplay bans (not just chat bans) now issued for severely disruptive comms: hate speech, threats of violence, severe aggression."
    },
    {
      name: "Brawl Returns",
      category: "Modes",
      summary: "Brawl live from March 4 through April 28, 2026."
    }
  ],
  aram: {
    augments_buffed: ["Upgrade Immolate", "Slow Cooker", "Celestial Body", "Guilty Pleasure", "Perseverance", "Courage of the Colossus", "Adamant", "Stuck In Here With Me", "Dropkick", "Dropybara", "Golden Snowball", "Poro King", "Void Rift", "Critical Missile"],
    augments_nerfed: ["Impassable", "Escape Plan"],
    augments_new: ["Upgrade Sword of Blossoming Dawn", "Wee Woo Wee Woo (Set Bonus rework)"],
    structures: "Nexus HP 5500→3000, Nexus Tower HP 1800→3000",
    item_notes: ["Moonstone Renewer: chain healing skips Vampirism targets", "Diadem of Songs: healing missile skips Vampirism targets"]
  }
};

const VERDICT_COLORS = {
  BUFF: { bg: "rgba(34,197,94,0.12)", border: "#22c55e", text: "#4ade80", glow: "0 0 12px rgba(34,197,94,0.3)" },
  NERF: { bg: "rgba(239,68,68,0.12)", border: "#ef4444", text: "#f87171", glow: "0 0 12px rgba(239,68,68,0.3)" },
  ADJUSTED: { bg: "rgba(234,179,8,0.12)", border: "#eab308", text: "#facc15", glow: "0 0 12px rgba(234,179,8,0.3)" },
};

const TabButton = ({ active, onClick, children, count }) => (
  <button
    onClick={onClick}
    style={{
      padding: "10px 22px",
      background: active ? "rgba(200,170,110,0.15)" : "transparent",
      border: active ? "1px solid rgba(200,170,110,0.5)" : "1px solid rgba(200,170,110,0.1)",
      color: active ? "#C8AA6E" : "#8B7A5E",
      fontFamily: "'Cinzel', serif",
      fontSize: 13,
      fontWeight: 700,
      letterSpacing: "0.1em",
      cursor: "pointer",
      transition: "all 0.2s",
      textTransform: "uppercase",
      position: "relative",
    }}
  >
    {children}
    {count !== undefined && (
      <span style={{
        marginLeft: 8,
        background: active ? "rgba(200,170,110,0.3)" : "rgba(200,170,110,0.08)",
        padding: "2px 7px",
        borderRadius: 3,
        fontSize: 11,
        fontFamily: "'JetBrains Mono', monospace",
      }}>{count}</span>
    )}
  </button>
);

const VerdictBadge = ({ verdict }) => {
  const c = VERDICT_COLORS[verdict] || VERDICT_COLORS.ADJUSTED;
  return (
    <span style={{
      padding: "3px 10px",
      background: c.bg,
      border: `1px solid ${c.border}`,
      color: c.text,
      fontSize: 10,
      fontWeight: 800,
      letterSpacing: "0.15em",
      fontFamily: "'JetBrains Mono', monospace",
      textTransform: "uppercase",
    }}>{verdict}</span>
  );
};

const LevelValues = ({ values, color, strikethrough }) => {
  const parts = values.split("/").map(v => v.trim());
  if (parts.length <= 1) {
    return <span style={{ color, textDecoration: strikethrough ? "line-through" : "none", opacity: strikethrough ? 0.55 : 1 }}>{values}</span>;
  }
  return (
    <div style={{ display: "flex", gap: 0 }}>
      {parts.map((v, i) => (
        <div key={i} style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          minWidth: 44,
          padding: "0 2px",
          borderRight: i < parts.length - 1 ? "1px solid rgba(200,170,110,0.06)" : "none",
        }}>
          <span style={{
            fontSize: 9,
            color: "#3D3628",
            fontWeight: 600,
            letterSpacing: "0.05em",
            marginBottom: 2,
          }}>{i + 1}</span>
          <span style={{
            color,
            fontSize: 12,
            fontWeight: 600,
            textDecoration: strikethrough ? "line-through" : "none",
            opacity: strikethrough ? 0.55 : 1,
          }}>{v}</span>
        </div>
      ))}
    </div>
  );
};

const StatRow = ({ stat, before, after, delta }) => {
  const hasSlash = before.includes("/") || after.includes("/");
  return (
    <div style={{
      padding: "8px 0",
      borderBottom: "1px solid rgba(200,170,110,0.05)",
      fontFamily: "'JetBrains Mono', monospace",
    }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: hasSlash ? 6 : 0,
      }}>
        <span style={{ color: "#A09070", fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 12, flex: hasSlash ? "none" : "0 0 40%" }}>{stat}</span>
        {delta && <span style={{ color: "#facc15", fontSize: 10, fontWeight: 700, background: "rgba(234,179,8,0.08)", padding: "1px 6px", border: "1px solid rgba(234,179,8,0.15)" }}>{typeof delta === 'number' ? (delta > 0 ? `+${delta}` : delta) : delta}</span>}
        {!hasSlash && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{ color: "#ef4444", textDecoration: "line-through", opacity: 0.55, fontSize: 12 }}>{before}</span>
            <span style={{ color: "#4ade80", fontSize: 12, fontWeight: 600 }}>{after}</span>
          </div>
        )}
      </div>
      {hasSlash && (
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: 4,
          padding: "4px 0 2px 8px",
          borderLeft: "2px solid rgba(200,170,110,0.08)",
          marginLeft: 4,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 9, color: "#5A4F3C", width: 42, textTransform: "uppercase", letterSpacing: "0.1em", flexShrink: 0 }}>Before</span>
            <LevelValues values={before} color="#ef4444" strikethrough />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 9, color: "#5A4F3C", width: 42, textTransform: "uppercase", letterSpacing: "0.1em", flexShrink: 0 }}>After</span>
            <LevelValues values={after} color="#4ade80" strikethrough={false} />
          </div>
        </div>
      )}
    </div>
  );
};

const ChampionCard = ({ champ }) => {
  const [open, setOpen] = useState(false);
  const c = VERDICT_COLORS[champ.verdict] || VERDICT_COLORS.ADJUSTED;
  return (
    <div
      style={{
        background: "rgba(10,10,15,0.7)",
        border: `1px solid ${open ? c.border : "rgba(200,170,110,0.1)"}`,
        transition: "all 0.3s",
        boxShadow: open ? c.glow : "none",
        cursor: "pointer",
      }}
      onClick={() => setOpen(!open)}
    >
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "14px 18px",
      }}>
        <img
          src={champ.icon}
          alt={champ.name}
          style={{ width: 40, height: 40, borderRadius: 4, border: `1px solid ${c.border}` }}
          onError={(e) => { e.target.style.display = 'none'; }}
        />
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{
              color: "#E8DCC8",
              fontFamily: "'Cinzel', serif",
              fontSize: 15,
              fontWeight: 700,
            }}>{champ.name}</span>
            <VerdictBadge verdict={champ.verdict} />
            <span style={{
              color: "#5A4F3C",
              fontSize: 11,
              fontFamily: "'JetBrains Mono', monospace",
            }}>{champ.role}</span>
          </div>
          <div style={{
            color: "#7A6E58",
            fontSize: 12,
            marginTop: 4,
            fontFamily: "'IBM Plex Sans', sans-serif",
            lineHeight: 1.4,
          }}>{champ.context}</div>
        </div>
        <span style={{
          color: "#5A4F3C",
          fontSize: 18,
          transform: open ? "rotate(90deg)" : "rotate(0deg)",
          transition: "transform 0.2s",
        }}>▸</span>
      </div>
      {open && (
        <div style={{ padding: "0 18px 16px", borderTop: "1px solid rgba(200,170,110,0.06)" }}>
          {champ.changes.map((change, i) => (
            <div key={i} style={{ marginTop: 12 }}>
              <div style={{
                color: "#C8AA6E",
                fontSize: 12,
                fontWeight: 700,
                fontFamily: "'IBM Plex Sans', sans-serif",
                marginBottom: 6,
                letterSpacing: "0.03em",
              }}>{change.ability}</div>
              {change.stats.map((s, j) => (
                <StatRow key={j} {...s} />
              ))}
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
    <div
      style={{
        background: "rgba(10,10,15,0.7)",
        border: `1px solid ${open ? c.border : "rgba(200,170,110,0.1)"}`,
        transition: "all 0.3s",
        boxShadow: open ? c.glow : "none",
        cursor: "pointer",
      }}
      onClick={() => setOpen(!open)}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px" }}>
        <img
          src={item.icon}
          alt={item.name}
          style={{ width: 36, height: 36, borderRadius: 4, border: `1px solid ${c.border}` }}
          onError={(e) => { e.target.style.display = 'none'; }}
        />
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ color: "#E8DCC8", fontFamily: "'Cinzel', serif", fontSize: 14, fontWeight: 700 }}>{item.name}</span>
            <VerdictBadge verdict={item.verdict} />
            <span style={{ color: "#5A4F3C", fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}>{item.category}</span>
          </div>
          <div style={{ color: "#7A6E58", fontSize: 12, marginTop: 3, fontFamily: "'IBM Plex Sans', sans-serif" }}>{item.context}</div>
        </div>
        <span style={{ color: "#5A4F3C", fontSize: 18, transform: open ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>▸</span>
      </div>
      {open && (
        <div style={{ padding: "0 18px 16px", borderTop: "1px solid rgba(200,170,110,0.06)" }}>
          {item.changes.map((s, j) => <StatRow key={j} {...s} />)}
        </div>
      )}
    </div>
  );
};

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
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(170deg, #0A0A0F 0%, #0D0D14 40%, #0F0E16 100%)",
      color: "#E8DCC8",
      fontFamily: "'IBM Plex Sans', sans-serif",
      padding: 0,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=JetBrains+Mono:wght@400;600;700&family=IBM+Plex+Sans:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(200,170,110,0.2); border-radius: 2px; }
      `}</style>

      {/* Header */}
      <div style={{
        padding: "32px 32px 20px",
        borderBottom: "1px solid rgba(200,170,110,0.1)",
        background: "linear-gradient(180deg, rgba(200,170,110,0.04) 0%, transparent 100%)",
      }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 4 }}>
          <span style={{
            fontFamily: "'Cinzel', serif",
            fontSize: 28,
            fontWeight: 900,
            letterSpacing: "0.04em",
            color: "#C8AA6E",
          }}>PATCH {PATCH_DATA.patch}</span>
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 12,
            color: "#5A4F3C",
          }}>{PATCH_DATA.date}</span>
        </div>
        <div style={{
          color: "#7A6E58",
          fontSize: 13,
          lineHeight: 1.5,
          maxWidth: 700,
          marginTop: 8,
        }}>{PATCH_DATA.summary}</div>

        {/* Stats bar */}
        <div style={{
          display: "flex",
          gap: 24,
          marginTop: 18,
          padding: "10px 16px",
          background: "rgba(200,170,110,0.04)",
          border: "1px solid rgba(200,170,110,0.06)",
          width: "fit-content",
        }}>
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
              <div style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 18,
                fontWeight: 700,
                color: s.color || "#C8AA6E",
              }}>{s.val}</div>
              <div style={{ fontSize: 10, color: "#5A4F3C", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: "flex",
        gap: 0,
        padding: "0 32px",
        borderBottom: "1px solid rgba(200,170,110,0.06)",
        background: "rgba(0,0,0,0.2)",
      }}>
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
            {/* Filters */}
            <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
              {["ALL", "BUFF", "NERF", "ADJUSTED"].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    padding: "5px 14px",
                    background: filter === f ? (f === "ALL" ? "rgba(200,170,110,0.15)" : VERDICT_COLORS[f]?.bg) : "transparent",
                    border: `1px solid ${filter === f ? (f === "ALL" ? "rgba(200,170,110,0.4)" : VERDICT_COLORS[f]?.border) : "rgba(200,170,110,0.08)"}`,
                    color: filter === f ? (f === "ALL" ? "#C8AA6E" : VERDICT_COLORS[f]?.text) : "#5A4F3C",
                    fontSize: 11,
                    fontWeight: 700,
                    fontFamily: "'JetBrains Mono', monospace",
                    cursor: "pointer",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                  }}
                >{f}</button>
              ))}
              <input
                type="text"
                placeholder="Search champion..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  padding: "5px 14px",
                  background: "rgba(200,170,110,0.04)",
                  border: "1px solid rgba(200,170,110,0.1)",
                  color: "#E8DCC8",
                  fontSize: 12,
                  fontFamily: "'JetBrains Mono', monospace",
                  outline: "none",
                  width: 180,
                }}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {filteredChamps.map(c => <ChampionCard key={c.name} champ={c} />)}
              {filteredChamps.length === 0 && (
                <div style={{ color: "#5A4F3C", padding: 40, textAlign: "center", fontFamily: "'JetBrains Mono', monospace" }}>
                  No champions match filter.
                </div>
              )}
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
              <div key={i} style={{
                background: "rgba(10,10,15,0.7)",
                border: "1px solid rgba(200,170,110,0.1)",
                padding: "16px 20px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <span style={{ color: "#E8DCC8", fontFamily: "'Cinzel', serif", fontSize: 14, fontWeight: 700 }}>{sys.name}</span>
                  <span style={{
                    padding: "2px 8px",
                    background: "rgba(96,165,250,0.1)",
                    border: "1px solid rgba(96,165,250,0.3)",
                    color: "#60a5fa",
                    fontSize: 10,
                    fontWeight: 700,
                    fontFamily: "'JetBrains Mono', monospace",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                  }}>{sys.category}</span>
                </div>
                <div style={{ color: "#7A6E58", fontSize: 13, lineHeight: 1.5 }}>{sys.summary}</div>
              </div>
            ))}
          </div>
        )}

        {tab === "aram" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ background: "rgba(10,10,15,0.7)", border: "1px solid rgba(200,170,110,0.1)", padding: "16px 20px" }}>
              <div style={{ color: "#C8AA6E", fontFamily: "'Cinzel', serif", fontSize: 14, fontWeight: 700, marginBottom: 10 }}>Augments Buffed ({PATCH_DATA.aram.augments_buffed.length})</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {PATCH_DATA.aram.augments_buffed.map(a => (
                  <span key={a} style={{
                    padding: "4px 10px", background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)",
                    color: "#4ade80", fontSize: 12, fontFamily: "'JetBrains Mono', monospace"
                  }}>{a}</span>
                ))}
              </div>
            </div>
            <div style={{ background: "rgba(10,10,15,0.7)", border: "1px solid rgba(200,170,110,0.1)", padding: "16px 20px" }}>
              <div style={{ color: "#C8AA6E", fontFamily: "'Cinzel', serif", fontSize: 14, fontWeight: 700, marginBottom: 10 }}>Augments Nerfed ({PATCH_DATA.aram.augments_nerfed.length})</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {PATCH_DATA.aram.augments_nerfed.map(a => (
                  <span key={a} style={{
                    padding: "4px 10px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
                    color: "#f87171", fontSize: 12, fontFamily: "'JetBrains Mono', monospace"
                  }}>{a}</span>
                ))}
              </div>
            </div>
            <div style={{ background: "rgba(10,10,15,0.7)", border: "1px solid rgba(200,170,110,0.1)", padding: "16px 20px" }}>
              <div style={{ color: "#C8AA6E", fontFamily: "'Cinzel', serif", fontSize: 14, fontWeight: 700, marginBottom: 10 }}>New Augments</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {PATCH_DATA.aram.augments_new.map(a => (
                  <span key={a} style={{
                    padding: "4px 10px", background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.2)",
                    color: "#c084fc", fontSize: 12, fontFamily: "'JetBrains Mono', monospace"
                  }}>{a}</span>
                ))}
              </div>
            </div>
            <div style={{ background: "rgba(10,10,15,0.7)", border: "1px solid rgba(200,170,110,0.1)", padding: "16px 20px" }}>
              <div style={{ color: "#C8AA6E", fontFamily: "'Cinzel', serif", fontSize: 14, fontWeight: 700, marginBottom: 8 }}>Structures</div>
              <div style={{ color: "#7A6E58", fontSize: 13, fontFamily: "'JetBrains Mono', monospace" }}>{PATCH_DATA.aram.structures}</div>
            </div>
            <div style={{ background: "rgba(10,10,15,0.7)", border: "1px solid rgba(200,170,110,0.1)", padding: "16px 20px" }}>
              <div style={{ color: "#C8AA6E", fontFamily: "'Cinzel', serif", fontSize: 14, fontWeight: 700, marginBottom: 8 }}>Item Interactions</div>
              {PATCH_DATA.aram.item_notes.map((n, i) => (
                <div key={i} style={{ color: "#7A6E58", fontSize: 12, fontFamily: "'JetBrains Mono', monospace", marginBottom: 4 }}>• {n}</div>
              ))}
            </div>
          </div>
        )}

        {tab === "json" && (
          <div style={{
            background: "rgba(10,10,15,0.9)",
            border: "1px solid rgba(200,170,110,0.1)",
            padding: 20,
            maxHeight: "70vh",
            overflow: "auto",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ color: "#C8AA6E", fontFamily: "'Cinzel', serif", fontSize: 14, fontWeight: 700 }}>Structured Output</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(PATCH_DATA, null, 2));
                }}
                style={{
                  padding: "4px 12px",
                  background: "rgba(200,170,110,0.1)",
                  border: "1px solid rgba(200,170,110,0.3)",
                  color: "#C8AA6E",
                  fontSize: 11,
                  fontFamily: "'JetBrains Mono', monospace",
                  cursor: "pointer",
                }}
              >Copy JSON</button>
            </div>
            <pre style={{
              color: "#7A6E58",
              fontSize: 11,
              fontFamily: "'JetBrains Mono', monospace",
              lineHeight: 1.6,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}>{JSON.stringify(PATCH_DATA, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
