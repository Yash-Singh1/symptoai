import { currentUser } from "@clerk/nextjs";
import { NextApiRequest } from "next";
import { prisma } from "../../prisma";
import { NextResponse } from "next/server";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function Page({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const user = await currentUser();
  if (!user) {
    notFound();
  }

  if (!searchParams.id) {
    notFound();
  }

  if (Array.isArray(searchParams.id)) {
    searchParams.id = searchParams.id.join(",");
  }

  const plink = await prisma.pLink.findUnique({
    where: {
      id: searchParams.id,
    },
  });

  if (!plink) {
    notFound();
  }
  if (plink.ownerId !== user.id) {
    notFound();
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

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      tokens: userFound.tokens + plink.batches * 10000,
    },
  });

  await prisma.pLink.delete({
    where: {
      id: searchParams.id,
    },
  });

  return (
    <main className="min-h-screen w-full flex flex-wrap flex-col gap-y-4 justify-center items-center">
      <div
        className="w-16 h-16 p-2 border-green-500 border-4 rounded-full"
        dangerouslySetInnerHTML={{
          __html: `<svg xmlns="http://www.w3.org/2000/svg" fill="rgb(34,197,94)" viewBox="0 0 448 512"><!--! Font Awesome Pro 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"/></svg>`,
        }}
      ></div>
      <p className="text-green-500 font-semibold">
        Successfully purchased tokens! Go back to{" "}
        <Link href="/" className="underline text-blue-400">
          application
        </Link>
        .
      </p>
    </main>
  );
}
