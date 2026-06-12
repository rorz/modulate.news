import { NextRequest, NextResponse } from "next/server";

const rootHosts = new Set(["modulate.news", "www.modulate.news", "modulatenews.vercel.app"]);

export function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();
  const host = request.headers.get("host")?.split(":")[0] ?? "";

  if (!url.pathname.startsWith("/e/")) {
    return NextResponse.next();
  }

  const username = getUsernameFromHost(host);

  if (!username) {
    return NextResponse.next();
  }

  url.pathname = `/u/${username}${url.pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/e/:path*"],
};

function getUsernameFromHost(host: string) {
  if (!host || rootHosts.has(host) || host.endsWith(".vercel.app") || host === "localhost") {
    return null;
  }

  if (!host.endsWith(".modulate.news")) {
    return null;
  }

  const username = host.replace(".modulate.news", "");
  return /^[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])?$/.test(username) ? username : null;
}
