import { NextResponse } from "next/server";
import { db, wishes } from "@/lib/db";
import { eq } from "drizzle-orm";
import { getUrlPrice } from "@/actions/wish";

export const runtime = "edge";

const MAX_FAILURES = 3; // After 3 failed attempts, disable auto-update
const MIN_UPDATE_INTERVAL = 1000 * 60 * 60; // 1 hour in milliseconds

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

    console.log(`Starting price update for ${autoUpdateWishes.length} wishes`);

    // Update prices
    const updates = await Promise.allSettled(
      autoUpdateWishes.map(async (wish) => {
        if (!wish.destinationUrl) return;

        // Check update frequency
        if (wish.lastPriceUpdateAttempt) {
          const timeSinceLastUpdate =
            Date.now() - wish.lastPriceUpdateAttempt.getTime();
          if (timeSinceLastUpdate < MIN_UPDATE_INTERVAL) {
            return {
              id: wish.id,
              success: false,
              error: "Update too frequent",
            };
          }
        }

        try {
          const priceData = await getUrlPrice(wish.destinationUrl);

          if (priceData.success && priceData.data) {
            // Validate price data
            if (priceData.data.price <= 0) {
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
                error: "Invalid price",
                failureCount: newFailureCount,
                autoUpdateDisabled: newFailureCount >= MAX_FAILURES,
              };
            }

            // Reset failures count on success
            await db
              .update(wishes)
              .set({
                price: priceData.data.price,
                currency: priceData.data.currency || wish.currency,
                priceUpdateFailures: 0,
                lastPriceUpdateAttempt: new Date(),
              })
              .where(eq(wishes.id, wish.id));

            console.log(
              `Updated price for wish ${wish.id}: ${wish.price ?? "N/A"} -> ${
                priceData.data.price
              } ${priceData.data.currency || wish.currency}`
            );

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

          console.error(
            `Failed to update price for wish ${wish.id}: No price data found`
          );

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

          console.error(
            `Failed to update price for wish ${wish.id}: ${
              error instanceof Error ? error.message : "Unknown error"
            }`
          );

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

    console.log(
      `Price update complete. ${successCount}/${autoUpdateWishes.length} wishes updated successfully`
    );

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
