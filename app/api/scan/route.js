import { NextResponse } from "next/server";

const ASSETS = [
  { symbol: "XAUUSD", name: "Gold XAU/USD", category: "commodity", alwaysScan: true },
  { symbol: "BTCUSD", name: "Bitcoin BTC/USD", category: "crypto", alwaysScan: true },
  { symbol: "EURUSD", name: "EUR/USD", category: "forex", alwaysScan: true },
  { symbol: "USDJPY", name: "USD/JPY", category: "forex", alwaysScan: true },
  { symbol: "AAPL", name: "Apple stock AAPL", category: "stock", alwaysScan: false },
  { symbol: "TSLA", name: "Tesla stock TSLA", category: "stock", alwaysScan: false },
];

function getSessionInfo() {
  const now = new Date();
  const utcHour = now.getUTCHours();
  const isLondon = utcHour >= 7 && utcHour < 16;
  const isNY = utcHour >= 13 && utcHour < 21;
  const isSession = isLondon || isNY;
  const isStockHours = utcHour >= 13 && utcHour < 20;
  let sessionName = "Off-Hours";
  if (isLondon && isNY) sessionName = "London + NY Overlap";
  else if (isLondon) sessionName = "London Session";
  else if (isNY) sessionName = "NY Session";
  return { isSession, isStockHours, sessionName, utcHour };
}

async function sendTelegramAlert(message) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;
  try {
    const tgUrl = "https://api.telegram.org/bot" + token + "/sendMessage";
    await fetch(tgUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: "HTML", disable_web_page_preview: true }),
    });
  } catch (err) {
    console.error("Telegram send failed:", err);
  }
}

async function scanAsset(asset) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set");

  const prompt = "You are Balu, a market intelligence bot. Search for the latest breaking news about " + asset.name + " (" + asset.symbol + ") from the last 30 minutes to 2 hours.\n\nSearch for recent news, then analyze and respond ONLY with this exact JSON format (no markdown, no backticks, no explanation):\n\n{\n  \"symbol\": \"" + asset.symbol + "\",\n  \"sentiment\": \"Bullish\" or \"Bearish\" or \"Neutral\",\n  \"confidence\": 50-95,\n  \"duration\": \"Very Short (<6h)\" or \"Short (6-24h)\" or \"Medium (1-3 days)\" or \"Long (>3 days)\",\n  \"strength\": \"rising\" or \"stable\" or \"fading\",\n  \"drivers\": \"One clear sentence explaining why\",\n  \"news\": [\n    { \"headline\": \"headline text\", \"source\": \"source name\", \"impact\": \"Bullish\" or \"Bearish\" or \"Neutral\" }\n  ],\n  \"alert\": true or false,\n  \"alertReason\": \"Only if alert is true - what changed\"\n}\n\nSet alert=true ONLY if there is genuinely market-moving news. Routine news = alert:false.\nRespond with ONLY the JSON. No other text.";

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      tools: [{ type: "web_search_20250305", name: "web_search" }],
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const data = await response.json();
  const textContent = data.content
    ? data.content.filter(function(b) { return b.type === "text"; }).map(function(b) { return b.text; }).join("")
    : "";
  if (!textContent) throw new Error("No text response for " + asset.symbol);
  var cleaned = textContent.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned);
}

let latestResults = {};

export async function GET(request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get("mode");
  const action = url.searchParams.get("action");

  if (action === "results") {
    return NextResponse.json({ results: latestResults, lastScan: latestResults._lastScan || null, session: getSessionInfo() });
  }

  const session = getSessionInfo();

  if (mode === "session" && !session.isSession) {
    return NextResponse.json({ skipped: true, reason: "Not in trading session" });
  }
  if (mode === "offhours" && session.isSession) {
    return NextResponse.json({ skipped: true, reason: "In trading session" });
  }

  const assetsToScan = ASSETS.filter(function(asset) {
    if (asset.alwaysScan) return true;
    if (asset.category === "stock") return session.isStockHours;
    return true;
  });

  console.log("[Balu] Scanning " + assetsToScan.length + " assets | " + session.sessionName);

  const results = {};
  const alerts = [];

  const scanPromises = assetsToScan.map(async function(asset) {
    try {
      const result = await scanAsset(asset);
      results[asset.symbol] = Object.assign({}, result, { scannedAt: new Date().toISOString() });
      if (result.alert && result.alertReason) {
        alerts.push({ symbol: asset.symbol, sentiment: result.sentiment, reason: result.alertReason, confidence: result.confidence });
      }
    } catch (err) {
      console.error("[Balu] Error scanning " + asset.symbol + ":", err.message);
      if (latestResults[asset.symbol]) results[asset.symbol] = latestResults[asset.symbol];
    }
  });

  await Promise.all(scanPromises);
  latestResults = Object.assign({}, results, { _lastScan: new Date().toISOString() });

  for (var i = 0; i < alerts.length; i++) {
    var a = alerts[i];
    var emoji = a.sentiment === "Bullish" ? "\u{1F7E2}" : a.sentiment === "Bearish" ? "\u{1F534}" : "\u26AA";
    var msg = emoji + " <b>BALU ALERT \u2014 " + a.symbol + "</b>\n\nSentiment: <b>" + a.sentiment + "</b>\nConfidence: " + a.confidence + "%\n\n" + a.reason + "\n\n<i>" + session.sessionName + " \u00B7 " + new Date().toLocaleTimeString("en-SG", { timeZone: "Asia/Singapore" }) + "</i>";
    await sendTelegramAlert(msg);
  }

  return NextResponse.json({ scanned: Object.keys(results).length, alerts: alerts.length, session: session.sessionName, results: results });
}