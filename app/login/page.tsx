// app/login/page.tsx (Server Component)

import { auth, signIn } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const session = await auth();

  // If the user is already authenticated, redirect them to the dashboard
  if (session) {
    return redirect("/dashboard");
  }

  // Handle form submission on the server side
  const handleLogin = async (formData: FormData) => {
    "use server";
    // Sign the user in with the provided email
    await signIn("forwardemail", formData);

    // Get the "redirect" query parameter (if any)
    const searchParams = new URLSearchParams(window.location.search);
    const redirectUrl = searchParams.get("redirect") || "/dashboard";

    // Perform the redirect after the login
    redirect(redirectUrl);
  };

  return (
    <form
      method="POST"
      action={async (formData) => {
        "use server";
        await handleLogin(formData);
      }}
    >
      <input type="text" name="email" placeholder="Email" />
      <button type="submit">Sign in</button>
    </form>
  );
}
