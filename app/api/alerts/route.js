import { NextResponse } from "next/server";

let alertHistory = [];
const MAX_ALERTS = 50;

export async function GET() {
  return NextResponse.json({ alerts: alertHistory });
}

export async function POST(request) {
  const alert = await request.json();
  alertHistory.unshift({ ...alert, id: Date.now(), timestamp: new Date().toISOString() });
  if (alertHistory.length > MAX_ALERTS) alertHistory = alertHistory.slice(0, MAX_ALERTS);
  return NextResponse.json({ success: true, total: alertHistory.length });
}