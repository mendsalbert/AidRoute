import type { NextRequest } from "next/server";

export const revalidate = 0;

export async function GET(_req: NextRequest) {
  const upstream = "https://www.gdacs.org/xml/rss.xml";
  try {
    const res = await fetch(upstream, {
      // Avoid caching to keep it live
      cache: "no-store",
      headers: {
        "User-Agent": "AidRoute/1.0 (+https://aidroute.app)",
        Accept:
          "application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8",
      },
    });

    if (!res.ok) {
      return new Response(`Upstream error ${res.status}`, { status: 502 });
    }

    const body = await res.text();
    return new Response(body, {
      status: 200,
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (e: any) {
    return new Response(`Proxy error: ${e?.message || "unknown"}`, {
      status: 500,
    });
  }
}
