"use server";

import { signIn } from "@/lib/auth";
import { z } from "zod";

const emailSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address")
    .nonempty("Email is required"),
});

export async function handleLoginWithEmail(formData: FormData) {
  const email = formData.get("email");

  try {
    emailSchema.parse({ email });

    await signIn("forwardemail", {
      email,
      redirect: false,
    });

    return {
      success: true,
      message: "Check your email for a login link!",
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: error.errors[0].message,
      };
    }
    return {
      success: false,
      message: "Something went wrong. Please try again.",
    };
  }
}

export async function handleLoginWithGoogle() {
  await signIn("google");
}

export async function handleLoginWithApple() {
  await signIn("apple");
}
