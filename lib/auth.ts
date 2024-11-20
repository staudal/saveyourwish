import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/lib/db";
import ForwardEmail from "next-auth/providers/forwardemail";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db),
  providers: [
    ForwardEmail({
      name: "SaveYourWish",
      from: "SaveYourWish <jakob@saveyourwish.com>",
    }),
  ],
});
