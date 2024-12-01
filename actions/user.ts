"use server";

import { signOut } from "@/lib/auth";
import { db } from "@/lib/db";
import { wishlists, wishes, users } from "@/lib/db";
import { sql } from "drizzle-orm";

export async function getStats() {
  const [wishlistCount, wishCount, userCount] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(wishlists)
      .then((res) => res[0].count),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(wishes)
      .then((res) => res[0].count),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(users)
      .then((res) => res[0].count),
  ]);

  return { wishlistCount, wishCount, userCount };
}

export async function signOutAction() {
  await signOut({ redirectTo: "/login" });
}
