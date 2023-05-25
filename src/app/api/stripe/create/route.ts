import { currentUser } from "@clerk/nextjs/app-beta";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../prisma";
import { stripe } from "../stripe";

export async function GET(request: NextRequest) {
  const user = await currentUser();
  const tokenStr = request.nextUrl.searchParams.get("tokens");

  let tokens = 10000;

  if (tokenStr) {
    tokens = parseInt(tokenStr, 10);

    if (isNaN(tokens)) {
      return NextResponse.json(
        { error: "Token quantity must be a number" },
        { status: 400 }
      );
    }

    if (tokens < 10000) {
      return NextResponse.json(
        { error: "Token quantity must be at least 10,000" },
        { status: 400 }
      );
    }

    if (tokens % 10000 !== 0) {
      return NextResponse.json(
        { error: "Token quantity must be a multiple of 10,000" },
        { status: 400 }
      );
    }
  }

  if (user) {
    const { id } = await prisma.pLink.create({
      data: {
        batches: tokens / 10000,
        ownerId: user.id,
      },
    });

    const paymentLink = await stripe.paymentLinks.create({
      line_items: [
        {
          quantity: tokens / 10000,
          adjustable_quantity: {
            minimum: 1,
            enabled: true,
          },
          price: "price_1NB7gzLuPHvxExXg8QNW64UN",
        },
      ],
      after_completion: {
        type: "redirect",
        redirect: {
          url: `${
            process.env.NODE_ENV === "development"
              ? "http://localhost:3000"
              : "https://symptoai-ten.vercel.app"
          }/api/stripe/callback?id=${id}`,
        },
      },
    });

    return NextResponse.json(paymentLink);
  } else {
    return NextResponse.json({ error: "User not logged in" }, { status: 401 });
  }
}
