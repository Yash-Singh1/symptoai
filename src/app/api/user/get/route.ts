import { currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { prisma } from "../../prisma";

export async function GET() {
  const user = await currentUser();

  if (!user) {
    return NextResponse.json(null);
  } else {
    const userFound = await prisma.user.findUnique({
      where: { id: user.id },
    });

    return NextResponse.json(userFound);
  }
}
