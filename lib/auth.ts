import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import ForwardEmail from "next-auth/providers/forwardemail";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    ForwardEmail({
      name: "SaveYourWish",
      from: "SaveYourWish <jakob@saveyourwish.com>",
    }),
  ],
});
