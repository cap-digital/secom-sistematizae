import { NextResponse } from "next/server";
import { RawResponse } from "@/app/lib/types";
import { normalize } from "@/app/lib/normalize";

const ENDPOINT =
  "https://cqrpbiepyeypbkizwacu.supabase.co/functions/v1/Secom-Sistematizae";
const KEY = "sb_publishable_YN9YKLw6sludrgf9T2i_1g_Dcm8dIiK";

// Revalidate the upstream data every 5 minutes.
export const revalidate = 300;

export async function GET() {
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${KEY}`,
        apikey: KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: "Functions" }),
      next: { revalidate },
      // evita que a função serverless fique pendurada se o upstream travar
      signal: AbortSignal.timeout(40_000),
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Upstream ${res.status}` },
        { status: 502 },
      );
    }

    const raw = (await res.json()) as RawResponse;
    return NextResponse.json(normalize(raw));
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message ?? "fetch failed" },
      { status: 500 },
    );
  }
}
