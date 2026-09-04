import { NextRequest, NextResponse } from "next/server";
import { setBookmark } from "@/lib/bookmarks";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { lemma?: unknown; on?: unknown };
    if (typeof body.lemma !== "string" || body.lemma.length === 0) {
      return NextResponse.json({ error: "lemma required" }, { status: 400 });
    }
    const on = body.on === true;
    setBookmark(body.lemma.toLowerCase(), on);
    return NextResponse.json({ ok: true, on });
  } catch (err) {
    console.error("bookmark toggle failed:", err);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}