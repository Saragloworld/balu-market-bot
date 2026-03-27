import { NextResponse } from "next/server";

export async function POST(request) {
  const { action, message } = await request.json();
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return NextResponse.json({ error: "Telegram not configured" }, { status: 400 });
  }

  if (action === "test") {
    try {
      const tgUrl = "https://api.telegram.org/bot" + token + "/sendMessage";
      const res = await fetch(tgUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: "\u{1F916} <b>BALU is online!</b>\n\nMonitoring:\n\u{1F947} XAUUSD \u00B7 \u20BF BTCUSD \u00B7 \u20AC EURUSD\n\u00A5 USDJPY \u00B7 \u{1F34E} AAPL \u00B7 \u26A1 TSLA\n\n\u{1F4CA} Polymarket odds tracking active\n\n<i>Session scans every 2 min | Off-hours every 5 min</i>",
          parse_mode: "HTML",
        }),
      });
      const result = await res.json();
      if (result.ok) return NextResponse.json({ success: true });
      else return NextResponse.json({ error: result.description }, { status: 400 });
    } catch (err) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  if (action === "send" && message) {
    try {
      const tgUrl = "https://api.telegram.org/bot" + token + "/sendMessage";
      const res = await fetch(tgUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: "HTML", disable_web_page_preview: true }),
      });
      const result = await res.json();
      return NextResponse.json({ success: result.ok });
    } catch (err) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}