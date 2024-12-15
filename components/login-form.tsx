"use client";

import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import Google from "@/public/google.png";
import { toast } from "sonner";
import { handleLoginWithEmail, handleLoginWithGoogle } from "@/actions/auth";
import { SubmitButton } from "@/components/ui/submit-button";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const handleEmailSubmit = async (formData: FormData) => {
    try {
      const result = await handleLoginWithEmail(formData);

      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome to SaveYourWish</CardTitle>
          <CardDescription>
            Enter your email to sign in or create an account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <form action={handleLoginWithGoogle}>
              <SubmitButton variant="outline" className="w-full">
                <Image
                  src={Google}
                  alt="Google logo"
                  className="mr-2 h-5 w-5"
                  height={20}
                  width={20}
                />
                Login with Google
              </SubmitButton>
            </form>
            <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
              <span className="relative z-10 bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
            <form action={handleEmailSubmit} className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                required
              />
              <SubmitButton className="w-full">
                Continue with Email
              </SubmitButton>
            </form>
          </div>
        </CardContent>
      </Card>
      <div className="text-balance text-center text-xs text-muted-foreground">
        By clicking continue, you agree to our{" "}
        <a
          className="underline underline-offset-4 hover:text-primary"
          href="/terms"
        >
          Terms of Service
        </a>{" "}
        and{" "}
        <a
          className="underline underline-offset-4 hover:text-primary"
          href="/privacy"
        >
          Privacy Policy
        </a>
        .
      </div>
    </div>
  );
}
