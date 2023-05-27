import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.search;
  const pathName = request.nextUrl.searchParams.get("path");

  return new NextResponse(
    await fetch(
      `https://www.yelp.com/${pathName}${query.replace(
        /[&?]path=.*$/,
        ""
      )}`
    ).then((response) => response.text()),
    {
      headers: {
        "Referrer-Policy": "origin-when-cross-origin",
      },
    }
  );
}
