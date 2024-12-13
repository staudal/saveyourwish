import { NextResponse } from "next/server";
import { db, wishes } from "@/lib/db";
import { eq } from "drizzle-orm";
import { getUrlPrice } from "@/actions/wish";

export const runtime = "edge";

const MAX_FAILURES = 3; // After 3 failed attempts, disable auto-update

export async function GET(request: Request) {
  try {
    // Verify the request is from Vercel Cron
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get all wishes with autoUpdatePrice enabled
    const autoUpdateWishes = await db
      .select()
      .from(wishes)
      .where(eq(wishes.autoUpdatePrice, true));

    // Update prices
    const updates = await Promise.allSettled(
      autoUpdateWishes.map(async (wish) => {
        if (!wish.destinationUrl) return;

        try {
          const priceData = await getUrlPrice(wish.destinationUrl);

          if (priceData.success && priceData.data) {
            // Reset failures count on success
            await db
              .update(wishes)
              .set({
                price: priceData.data.price,
                currency: priceData.data.currency || wish.currency,
                priceUpdateFailures: 0, // Reset counter on success
                lastPriceUpdateAttempt: new Date(),
              })
              .where(eq(wishes.id, wish.id));

            return {
              id: wish.id,
              success: true,
              oldPrice: wish.price,
              newPrice: priceData.data.price,
              currency: priceData.data.currency || wish.currency,
            };
          }

          // Handle failure
          const newFailureCount = (wish.priceUpdateFailures || 0) + 1;
          await db
            .update(wishes)
            .set({
              priceUpdateFailures: newFailureCount,
              lastPriceUpdateAttempt: new Date(),
              // Disable auto-update if max failures reached
              autoUpdatePrice: newFailureCount < MAX_FAILURES,
            })
            .where(eq(wishes.id, wish.id));

          return {
            id: wish.id,
            success: false,
            error: "No price data found",
            failureCount: newFailureCount,
            autoUpdateDisabled: newFailureCount >= MAX_FAILURES,
          };
        } catch (error) {
          // Handle error case similarly
          const newFailureCount = (wish.priceUpdateFailures || 0) + 1;
          await db
            .update(wishes)
            .set({
              priceUpdateFailures: newFailureCount,
              lastPriceUpdateAttempt: new Date(),
              autoUpdatePrice: newFailureCount < MAX_FAILURES,
            })
            .where(eq(wishes.id, wish.id));

          return {
            id: wish.id,
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
            failureCount: newFailureCount,
            autoUpdateDisabled: newFailureCount >= MAX_FAILURES,
          };
        }
      })
    );

    const successCount = updates.filter(
      (result) => result.status === "fulfilled" && result.value?.success
    ).length;

    const disabledCount = updates.filter(
      (result) =>
        result.status === "fulfilled" && result.value?.autoUpdateDisabled
    ).length;

    return NextResponse.json({
      success: true,
      total: autoUpdateWishes.length,
      updated: successCount,
      disabled: disabledCount,
      results: updates,
    });
  } catch (error) {
    console.error("Price update cron job failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
