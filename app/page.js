"use client";
import { useState, useEffect, useCallback } from "react";

const ASSETS = [
  { symbol: "XAUUSD", name: "Gold", icon: "\u{1F947}", category: "Commodity" },
  { symbol: "BTCUSD", name: "Bitcoin", icon: "\u20BF", category: "Crypto" },
  { symbol: "EURUSD", name: "EUR/USD", icon: "\u20AC", category: "Forex" },
  { symbol: "USDJPY", name: "USD/JPY", icon: "\u00A5", category: "Forex" },
  { symbol: "AAPL", name: "Apple", icon: "\u{1F34E}", category: "Stock" },
  { symbol: "TSLA", name: "Tesla", icon: "\u26A1", category: "Stock" },
];

const SS = {
  Bullish: { bg: "linear-gradient(135deg, #0a2e1a 0%, #0d3320 100%)", border: "#00e676", text: "#00e676", badge: "#00e676", badgeText: "#000", glow: "0 0 30px rgba(0,230,118,0.12)" },
  Bearish: { bg: "linear-gradient(135deg, #2e0a0a 0%, #3a0f0f 100%)", border: "#ff5252", text: "#ff5252", badge: "#ff5252", badgeText: "#fff", glow: "0 0 30px rgba(255,82,82,0.12)" },
  Neutral: { bg: "linear-gradient(135deg, #1a1a2e 0%, #1f1f35 100%)", border: "#78909c", text: "#90a4ae", badge: "#546e7a", badgeText: "#fff", glow: "none" },
};
const IC = { Bullish: "#00e676", Bearish: "#ff5252", Neutral: "#78909c" };

function ConfidenceBar({ value, color }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height: 6, background: "#1a1a2e", borderRadius: 3, overflow: "hidden" }}>
        <div style={{ width: value + "%", height: "100%", background: color, borderRadius: 3, transition: "width 0.8s ease" }} />
      </div>
      <span style={{ color, fontFamily: "'Space Mono', monospace", fontSize: 13, fontWeight: 700, minWidth: 38 }}>{value}%</span>
    </div>
  );
}

function StrengthArrow({ strength }) {
  const arrows = { rising: { s: "\u2191\u2191", c: "#00e676", l: "Strengthening" }, stable: { s: "\u2192", c: "#ffd740", l: "Holding" }, fading: { s: "\u2193", c: "#ff5252", l: "Weakening" } };
  const a = arrows[strength] || arrows.stable;
  return <span style={{ color: a.c, fontFamily: "'Space Mono', monospace", fontSize: 11, display: "flex", alignItems: "center", gap: 4 }}><span style={{ fontSize: 14 }}>{a.s}</span> {a.l}</span>;
}

function AssetCard({ data, asset, expanded, onToggle }) {
  const s = SS[data?.sentiment || "Neutral"];
  if (!data) return (
    <div style={{ background: "#0d0d18", border: "1px solid #1e1e35", borderRadius: 14, padding: "18px 20px", opacity: 0.5 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 28 }}>{asset.icon}</span>
        <div><div style={{ color: "#fff", fontFamily: "'Space Mono', monospace", fontSize: 16, fontWeight: 700 }}>{asset.symbol}</div>
        <div style={{ color: "#37474f", fontFamily: "'Space Mono', monospace", fontSize: 11 }}>Waiting for scan...</div></div>
      </div>
    </div>
  );
  return (
    <div onClick={onToggle} style={{ background: s.bg, border: "1px solid " + s.border + "33", borderRadius: 14, padding: "18px 20px", cursor: "pointer", transition: "all 0.3s ease", boxShadow: s.glow, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: s.border, opacity: 0.6 }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 28 }}>{asset.icon}</span>
          <div><div style={{ color: "#fff", fontFamily: "'Space Mono', monospace", fontSize: 16, fontWeight: 700 }}>{asset.symbol}</div>
          <div style={{ color: "#546e7a", fontFamily: "'Space Mono', monospace", fontSize: 11 }}>{asset.name} \u00B7 {asset.category}</div></div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
          <span style={{ background: s.badge, color: s.badgeText, padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 800, fontFamily: "'Space Mono', monospace", letterSpacing: 0.5 }}>{data.sentiment?.toUpperCase()}</span>
          <StrengthArrow strength={data.strength} />
        </div>
      </div>
      <ConfidenceBar value={data.confidence} color={s.border} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
        <span style={{ color: "#546e7a", fontFamily: "'Space Mono', monospace", fontSize: 11 }}>Duration</span>
        <span style={{ color: "#90a4ae", fontFamily: "'Space Mono', monospace", fontSize: 12, fontWeight: 600 }}>{data.duration}</span>
      </div>
      <div style={{ marginTop: 12, padding: "10px 12px", background: "rgba(0,0,0,0.25)", borderRadius: 8, borderLeft: "3px solid " + s.border + "44" }}>
        <div style={{ color: "#546e7a", fontFamily: "'Space Mono', monospace", fontSize: 10, marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>Why</div>
        <div style={{ color: "#b0bec5", fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 12.5, lineHeight: 1.5 }}>{data.drivers}</div>
      </div>
      {expanded && data.news && (
        <div style={{ marginTop: 14, borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 14 }}>
          <div style={{ color: "#546e7a", fontFamily: "'Space Mono', monospace", fontSize: 10, marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>Latest News</div>
          {data.news.map((n, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 10 }}>
              <div style={{ width: 4, height: 4, borderRadius: 2, background: IC[n.impact], marginTop: 7, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ color: "#cfd8dc", fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 12.5, lineHeight: 1.4 }}>{n.headline}</div>
                <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                  <span style={{ color: "#546e7a", fontFamily: "'Space Mono', monospace", fontSize: 10 }}>{n.source}</span>
                  <span style={{ color: IC[n.impact], fontFamily: "'Space Mono', monospace", fontSize: 10, fontWeight: 600 }}>{n.impact}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <div style={{ textAlign: "center", marginTop: 8 }}><span style={{ color: "#37474f", fontSize: 11, fontFamily: "'Space Mono', monospace" }}>{expanded ? "\u25B2 collapse" : "\u25BC tap for news"}</span></div>
    </div>
  );
}

function PolymarketPanel({ markets }) {
  return (
    <div style={{ background: "linear-gradient(135deg, #0d0d18 0%, #12121f 100%)", border: "1px solid #1e1e35", borderRadius: 14, padding: "18px 20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <span style={{ fontSize: 18 }}>\u{1F4CA}</span>
        <span style={{ color: "#fff", fontFamily: "'Space Mono', monospace", fontSize: 14, fontWeight: 700 }}>Polymarket Odds</span>
        <span style={{ color: "#37474f", fontFamily: "'Space Mono', monospace", fontSize: 10, marginLeft: "auto" }}>LIVE</span>
        <span style={{ width: 6, height: 6, borderRadius: 3, background: "#00e676", animation: "pulse 2s infinite" }} />
      </div>
      {markets.length === 0 && <div style={{ color: "#37474f", fontFamily: "'Space Mono', monospace", fontSize: 12, textAlign: "center", padding: 20 }}>Loading odds...</div>}
      {markets.map((m, i) => (
        <div key={m.id || i} style={{ padding: "12px 0", borderBottom: i < markets.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
          <div style={{ color: "#cfd8dc", fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{m.name}</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "#ffd740", fontFamily: "'Space Mono', monospace", fontSize: 12, fontWeight: 600 }}>{m.topOutcome}</span>
            {m.volume && <span style={{ color: "#37474f", fontFamily: "'Space Mono', monospace", fontSize: 10 }}>Vol: {m.volume}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

function AlertLog({ alerts }) {
  if (!alerts.length) return null;
  return (
    <div style={{ background: "linear-gradient(135deg, #0d0d18 0%, #12121f 100%)", border: "1px solid #1e1e35", borderRadius: 14, padding: "18px 20px" }}>
      <div style={{ color: "#fff", fontFamily: "'Space Mono', monospace", fontSize: 14, fontWeight: 700, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}><span>\u{1F514}</span> Recent Alerts</div>
      {alerts.slice(0, 10).map((a, i) => (
        <div key={a.id || i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < Math.min(alerts.length, 10) - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
          <span style={{ fontSize: 16 }}>{a.sentiment === "Bullish" ? "\u{1F7E2}" : a.sentiment === "Bearish" ? "\u{1F534}" : "\u26AA"}</span>
          <div style={{ flex: 1 }}>
            <span style={{ color: "#cfd8dc", fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 12.5 }}><b>{a.symbol}</b> \u2014 {a.reason || a.alertReason}</span>
            <div style={{ color: "#37474f", fontFamily: "'Space Mono', monospace", fontSize: 10, marginTop: 2 }}>{a.timestamp ? new Date(a.timestamp).toLocaleTimeString("en-SG", { timeZone: "Asia/Singapore" }) : ""} \u00B7 Sent to Telegram</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function BaluDashboard() {
  const [results, setResults] = useState({});
  const [polymarkets, setPolymarkets] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [expandedAsset, setExpandedAsset] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [lastScan, setLastScan] = useState(null);
  const [session, setSession] = useState(null);
  const [telegramStatus, setTelegramStatus] = useState("unknown");
  const [currentTime, setCurrentTime] = useState(new Date());

  const fetchResults = useCallback(async () => {
    try {
      const res = await fetch("/api/scan?action=results");
      const data = await res.json();
      if (data.results) {
        const { _lastScan, ...ar } = data.results;
        setResults(ar); setLastScan(_lastScan); setSession(data.session);
      }
    } catch (err) { console.error("Fetch failed:", err); }
  }, []);

  const fetchPolymarket = useCallback(async () => {
    try {
      const res = await fetch("/api/polymarket");
      const data = await res.json();
      if (data.markets) setPolymarkets(data.markets);
    } catch (err) { console.error("Polymarket failed:", err); }
  }, []);

  const fetchAlerts = useCallback(async () => {
    try {
      const res = await fetch("/api/alerts");
      const data = await res.json();
      if (data.alerts) setAlerts(data.alerts);
    } catch (err) { console.error("Alerts failed:", err); }
  }, []);

  const triggerScan = async () => {
    setScanning(true);
    try { await fetch("/api/scan"); await fetchResults(); await fetchAlerts(); } catch (err) { console.error("Scan failed:", err); }
    setScanning(false);
  };

  const testTelegram = async () => {
    try {
      const res = await fetch("/api/telegram", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "test" }) });
      const data = await res.json();
      setTelegramStatus(data.success ? "connected" : "error");
    } catch { setTelegramStatus("error"); }
  };

  useEffect(() => {
    fetchResults(); fetchPolymarket(); fetchAlerts();
    const r = setInterval(fetchResults, 30000);
    const p = setInterval(fetchPolymarket, 300000);
    const a = setInterval(fetchAlerts, 30000);
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => { clearInterval(r); clearInterval(p); clearInterval(a); clearInterval(t); };
  }, [fetchResults, fetchPolymarket, fetchAlerts]);

  const getSessionLabel = () => {
    if (session?.sessionName) return session.sessionName;
    const h = currentTime.getUTCHours();
    if (h >= 7 && h < 12) return "\u{1F1EC}\u{1F1E7} London";
    if (h >= 12 && h < 17) return "\u{1F1FA}\u{1F1F8} NY + London";
    if (h >= 17 && h < 21) return "\u{1F1FA}\u{1F1F8} NY PM";
    if (h >= 0 && h < 7) return "\u{1F30F} Asia";
    return "\u{1F319} Off-Hours";
  };

  const formatLastScan = () => {
    if (!lastScan) return "Not yet scanned";
    const diff = Math.floor((Date.now() - new Date(lastScan).getTime()) / 1000);
    if (diff < 60) return diff + "s ago";
    if (diff < 3600) return Math.floor(diff / 60) + "m ago";
    return Math.floor(diff / 3600) + "h ago";
  };

  const sc = {
    Bullish: Object.values(results).filter(d => d?.sentiment === "Bullish").length,
    Bearish: Object.values(results).filter(d => d?.sentiment === "Bearish").length,
    Neutral: Object.values(results).filter(d => d?.sentiment === "Neutral").length,
  };

  return (
    <div style={{ minHeight: "100vh", background: "#09090f", padding: "20px 16px 40px", maxWidth: 560, margin: "0 auto" }}>
      <style>{`@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } } * { box-sizing: border-box; }`}</style>
      <div style={{ marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div><h1 style={{ color: "#fff", fontFamily: "'Space Mono', monospace", fontSize: 26, fontWeight: 700, margin: 0 }}><span style={{ background: "linear-gradient(135deg, #00e676, #00b0ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>BALU</span></h1>
        <p style={{ color: "#37474f", fontFamily: "'Space Mono', monospace", fontSize: 11, marginTop: 4 }}>Market Intelligence Bot</p></div>
        <div style={{ textAlign: "right" }}><div style={{ color: "#546e7a", fontFamily: "'Space Mono', monospace", fontSize: 11 }}>{currentTime.toLocaleTimeString("en-SG", { timeZone: "Asia/Singapore", hour: "2-digit", minute: "2-digit" })} SGT</div>
        <div style={{ color: "#37474f", fontFamily: "'Space Mono', monospace", fontSize: 10 }}>{getSessionLabel()}</div></div>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#0d0d18", border: "1px solid #1e1e35", borderRadius: 20, padding: "6px 14px" }}>
          <span style={{ width: 6, height: 6, borderRadius: 3, background: scanning ? "#ffd740" : "#00e676", animation: scanning ? "pulse 1s infinite" : "none" }} />
          <span style={{ color: "#78909c", fontFamily: "'Space Mono', monospace", fontSize: 10 }}>{scanning ? "SCANNING..." : formatLastScan()}</span>
        </div>
        <button onClick={triggerScan} disabled={scanning} style={{ display: "flex", alignItems: "center", gap: 6, background: "#0d0d18", border: "1px solid #1e1e35", borderRadius: 20, padding: "6px 14px", cursor: scanning ? "not-allowed" : "pointer", opacity: scanning ? 0.5 : 1 }}>
          <span style={{ fontSize: 12 }}>\u{1F504}</span><span style={{ color: "#78909c", fontFamily: "'Space Mono', monospace", fontSize: 10 }}>SCAN NOW</span>
        </button>
        <button onClick={testTelegram} style={{ display: "flex", alignItems: "center", gap: 6, background: telegramStatus === "connected" ? "#0d2818" : "#0d0d18", border: "1px solid " + (telegramStatus === "connected" ? "#00e67633" : "#1e1e35"), borderRadius: 20, padding: "6px 14px", cursor: "pointer" }}>
          <span style={{ fontSize: 12 }}>\u2708\uFE0F</span><span style={{ color: telegramStatus === "connected" ? "#00e676" : "#78909c", fontFamily: "'Space Mono', monospace", fontSize: 10 }}>{telegramStatus === "connected" ? "TELEGRAM OK" : telegramStatus === "error" ? "TG ERROR" : "TEST TELEGRAM"}</span>
        </button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 20 }}>
        {[{ l: "Bullish", c: sc.Bullish, cl: "#00e676" }, { l: "Bearish", c: sc.Bearish, cl: "#ff5252" }, { l: "Neutral", c: sc.Neutral, cl: "#78909c" }].map(s => (
          <div key={s.l} style={{ background: "#0d0d18", border: "1px solid #1e1e35", borderRadius: 10, padding: "10px 12px", textAlign: "center" }}>
            <div style={{ color: s.cl, fontFamily: "'Space Mono', monospace", fontSize: 22, fontWeight: 700 }}>{s.c}</div>
            <div style={{ color: "#37474f", fontFamily: "'Space Mono', monospace", fontSize: 10 }}>{s.l}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
        {ASSETS.map(asset => <AssetCard key={asset.symbol} asset={asset} data={results[asset.symbol]} expanded={expandedAsset === asset.symbol} onToggle={() => setExpandedAsset(expandedAsset === asset.symbol ? null : asset.symbol)} />)}
      </div>
      <div style={{ marginBottom: 20 }}><PolymarketPanel markets={polymarkets} /></div>
      <AlertLog alerts={alerts} />
      <div style={{ marginTop: 20, padding: "14px 16px", background: "#0d0d18", border: "1px solid #1e1e35", borderRadius: 10 }}>
        <div style={{ color: "#546e7a", fontFamily: "'Space Mono', monospace", fontSize: 10, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Scan Schedule</div>
        <div style={{ color: "#78909c", fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 12, lineHeight: 1.6 }}>London + NY sessions \u2192 every 2 min<br/>Off-hours \u2192 every 5 min<br/>Stocks (AAPL, TSLA) \u2192 market hours only<br/>Crypto (BTC) \u2192 24/7</div>
      </div>
      <div style={{ textAlign: "center", marginTop: 24 }}><span style={{ color: "#1e1e35", fontFamily: "'Space Mono', monospace", fontSize: 10 }}>BALU v1.0</span></div>
    </div>
  );
}
