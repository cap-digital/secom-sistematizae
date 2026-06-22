import { NextRequest } from "next/server";

const DRIVE = "https://drive.usercontent.google.com/download";

// Streaming de vídeo grande — não pode ser cacheado nem pré-renderizado.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Proxy de streaming para um arquivo público do Google Drive.
 * Repassa o header Range para suportar busca/seek e reproduz o vídeo
 * em um <video> nativo same-origin (sem a UI/iframe do Drive).
 */
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id || !/^[\w-]+$/.test(id)) {
    return new Response("missing or invalid id", { status: 400 });
  }

  const range = req.headers.get("range");
  let upstream: Response;
  try {
    upstream = await fetch(`${DRIVE}?id=${encodeURIComponent(id)}&export=download`, {
      headers: range ? { Range: range } : {},
      cache: "no-store",
      signal: AbortSignal.timeout(60_000),
    });
  } catch {
    return new Response("upstream fetch failed", { status: 502 });
  }

  if (upstream.status !== 200 && upstream.status !== 206) {
    return new Response(`upstream ${upstream.status}`, { status: 502 });
  }

  // Drive entrega uma página HTML de confirmação quando o arquivo é muito
  // grande para download direto — nesse caso não há vídeo a transmitir.
  const ctype = upstream.headers.get("content-type") ?? "";
  if (ctype.includes("text/html")) {
    return new Response("video indisponível para streaming direto", { status: 502 });
  }

  const headers = new Headers();
  for (const h of ["content-type", "content-length", "content-range", "accept-ranges", "etag"]) {
    const v = upstream.headers.get(h);
    if (v) headers.set(h, v);
  }
  if (!headers.has("content-type")) headers.set("content-type", "video/mp4");
  if (!headers.has("accept-ranges")) headers.set("accept-ranges", "bytes");
  headers.set("cache-control", "private, max-age=3600");

  return new Response(upstream.body, { status: upstream.status, headers });
}
