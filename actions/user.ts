"use server";

import { signOut } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function signOutAction() {
  await signOut({ redirectTo: "/login" });
}

export async function deleteAccount() {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    // Delete the user from the database
    await db.delete(users).where(eq(users.id, session.user.id));

    // Don't wait for signOut since the user might already be deleted
    // which could cause an error
    signOut().catch(() => {
      // Ignore sign out errors since the account is already deleted
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to delete account:", error);
    return { success: false, error: "Failed to delete account" };
  }
}
