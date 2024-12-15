import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/lib/db";

import ForwardEmail from "next-auth/providers/forwardemail";
import Google from "next-auth/providers/google";
import Apple from "next-auth/providers/apple";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db),
  providers: [
    ForwardEmail({
      name: "SaveYourWish",
      from: "SaveYourWish <jakob@saveyourwish.com>",
    }),
    Google({
      allowDangerousEmailAccountLinking: true,
    }),
    Apple({
      clientId: process.env.APPLE_ID,
      clientSecret: process.env.APPLE_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
});
