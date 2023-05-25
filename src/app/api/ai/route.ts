import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs";
import { prisma } from "../prisma";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  let input = await request.nextUrl.searchParams.get("json");

  if (!input) {
    return NextResponse.json({ error: "Provide input" }, { status: 400 });
  }

  const encoded = await fetch(
    `https://web-production-a42cd.up.railway.app/count?text=${input}`
  ).then((response) => response.json());

  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  let userFound = await prisma.user.findUnique({
    where: {
      id: user.id,
    },
  });

  if (!userFound) {
    userFound = await prisma.user.create({
      data: {
        id: user.id,
      },
    });
  }

  if (userFound.tokens + userFound.freeTokens < encoded) {
    return NextResponse.json({ error: "Not enough tokens" }, { status: 400 });
  }

  const answer = await fetch(
    "https://web-production-a42cd.up.railway.app/query?user_info=" + input,
    {
      headers: {
        Authorization: process.env.API_KEY!,
      },
    }
  ).then((res) => res.json());

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      freeTokens:
        userFound.freeTokens - Math.min(userFound.freeTokens, encoded),
      tokens:
        userFound.tokens - (encoded - Math.min(userFound.freeTokens, encoded)),
    },
  });

  return NextResponse.json(answer);
}
