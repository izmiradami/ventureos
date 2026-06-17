import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Creates a Stripe Checkout Session when STRIPE_SECRET_KEY is configured.
 * Falls back to a demo response so the UI works with zero setup.
 */
export async function POST(req: Request) {
  const { planName, price, interval } = await req.json();
  const secret = process.env.STRIPE_SECRET_KEY;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (!secret) {
    return NextResponse.json({
      demo: true,
      message:
        "Demo mode: add STRIPE_SECRET_KEY to create a real Checkout Session.",
      plan: planName,
    });
  }

  try {
    const { default: Stripe } = await import("stripe");
    const stripe = new Stripe(secret);
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: `${planName} plan` },
            unit_amount: Math.round((price || 0) * 100),
            recurring: { interval: interval === "year" ? "year" : "month" },
          },
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/dashboard?checkout=success`,
      cancel_url: `${appUrl}/dashboard?checkout=cancel`,
    });
    return NextResponse.json({ demo: false, url: session.url });
  } catch (err) {
    return NextResponse.json(
      { error: "Could not create a Stripe session.", detail: String(err) },
      { status: 500 }
    );
  }
}
