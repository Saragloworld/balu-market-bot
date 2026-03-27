import { NextResponse } from "next/server";

async function fetchPolymarketData() {
  const results = [];
  const queries = ["federal+reserve", "crude+oil", "bitcoin", "recession"];

  for (const query of queries) {
    try {
      const url = "https://gamma-api.polymarket.com/markets?closed=false&limit=2&order=volume&ascending=false&tag_label=" + query;
      const res = await fetch(url, { next: { revalidate: 300 } });
      if (res.ok) {
        const markets = await res.json();
        for (const market of markets) {
          if (market && market.question) {
            let topOutcome = "\u2014";
            try {
              if (market.outcomePrices) {
                const prices = JSON.parse(market.outcomePrices);
                const outcomes = JSON.parse(market.outcomes);
                if (prices.length > 0 && outcomes.length > 0) {
                  const maxPrice = Math.max(...prices.map(Number));
                  const topIdx = prices.indexOf(maxPrice.toString());
                  const idx = topIdx > -1 ? topIdx : 0;
                  topOutcome = outcomes[idx] + " \u2014 " + (Number(prices[idx]) * 100).toFixed(0) + "%";
                }
              }
            } catch (e) {}
            results.push({
              id: market.id || market.conditionId,
              name: market.question.substring(0, 60),
              topOutcome: topOutcome,
              volume: market.volume ? "$" + (market.volume / 1e6).toFixed(1) + "M" : "\u2014",
              url: market.slug ? "https://polymarket.com/event/" + market.slug : null,
            });
          }
        }
      }
    } catch (e) {
      console.error("[Balu] Polymarket query failed:", e.message);
    }
  }

  if (results.length === 0) {
    return [
      { id: "fed", name: "Fed Rate Cuts 2026", topOutcome: "0 cuts \u2014 38%", volume: "$13.8M", relevance: "XAUUSD, EURUSD" },
      { id: "oil", name: "Crude Oil > $100 by Oct 2026", topOutcome: "Yes \u2014 31%", volume: "$8M", relevance: "XAUUSD, USDJPY" },
      { id: "recession", name: "US Recession by Dec 2026", topOutcome: "Yes \u2014 22%", volume: "$5.2M", relevance: "All assets" },
    ];
  }
  return results;
}

export async function GET() {
  const data = await fetchPolymarketData();
  return NextResponse.json({ markets: data, fetchedAt: new Date().toISOString() });
}