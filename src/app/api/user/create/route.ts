import { currentUser } from "@clerk/nextjs";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../prisma";

export async function GET(request: NextRequest) {
  const user = await currentUser();

  if (!user) {
    return NextResponse.json(
      {
        error: "You must be logged in to create a user on the DB",
      },
      { status: 400 }
    );
  }

  const userFound = await prisma.user.findUnique({
    where: { id: user.id },
  });

  if (userFound) {
    if (userFound.lastFree) {
      const now = new Date();
      const diff = now.getTime() - userFound.lastFree.getTime();

      if (604_800_000 <= diff) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            lastFree: now,
            freeTokens: 10000,
          },
        });
      }
    }
    return NextResponse.json(
      {
        error: "User already exists",
      },
      { status: 400 }
    );
  }

  await prisma.user.create({
    data: {
      id: user.id,
    },
  });

  return NextResponse.json({ success: true });
}
