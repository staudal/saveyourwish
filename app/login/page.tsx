import { Button } from "@/components/ui/server-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { auth, signIn } from "@/lib/auth";
import { redirect } from "next/navigation";
import { z } from "zod";
import Google from "@/public/google.png";
import Image from "next/image";

// Define the schema using Zod
const emailSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address")
    .nonempty("Email is required"),
});

export default async function LoginPage() {
  const session = await auth();

  // If the user is already authenticated, redirect them to the dashboard
  if (session) {
    return redirect("/dashboard");
  }

  // Handle form submission on the server side
  const handleLoginWithEmail = async (formData: FormData) => {
    "use server";

    // Extract the email from form data
    const email = formData.get("email");

    // Server-side validation with Zod
    try {
      emailSchema.parse({ email }); // This will throw if the email is invalid
    } catch (error) {
      // Handle validation error (you can customize this)
      if (error instanceof z.ZodError) {
        throw new Error(error.errors[0].message); // Return the first error message
      }
    }

    // If the email is valid, proceed with sign-in
    await signIn("forwardemail", { email });

    // Get the "redirect" query parameter (if any)
    const searchParams = new URLSearchParams(window.location.search);
    const redirectUrl = searchParams.get("redirect") || "/dashboard";

    // Redirect after login
    redirect(redirectUrl);
  };

  const handleLoginWithGoogle = async () => {
    "use server";

    // If the email is valid, proceed with sign-in
    await signIn("google");

    // Get the "redirect" query parameter (if any)
    const searchParams = new URLSearchParams(window.location.search);
    const redirectUrl = searchParams.get("redirect") || "/dashboard";

    // Redirect after login
    redirect(redirectUrl);
  };

  return (
    <div className="flex h-screen w-full items-center justify-center px-4 bg-sidebar">
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <form action={handleLoginWithEmail} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Login
              </Button>
            </form>
            <form action={handleLoginWithGoogle} className="grid gap-4">
              <Button type="submit" className="w-full" variant={"outline"}>
                <Image height={20} src={Google} alt="Google logo" /> Login with
                Google
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
