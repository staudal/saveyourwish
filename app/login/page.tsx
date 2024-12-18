import { LoginForm } from "@/components/login-form";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function LoginPage() {
  const session = await auth();

  // If the user is already authenticated, redirect them to the dashboard
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link
          href="/"
          className="flex items-center gap-2 self-center font-medium"
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Image
              src="/logo_white.svg"
              alt="SaveYourWish"
              width={24}
              height={24}
              className="size-4"
            />
          </div>
          SaveYourWish
        </Link>
        <LoginForm />
      </div>
    </div>
  );
}
