import { signIn } from "@/lib/auth";

export default function LoginPage() {
  return (
    <form
      action={async (formData) => {
        "use server";
        await signIn("forwardemail", formData);
      }}
    >
      <input type="text" name="email" placeholder="Email" />
      <button type="submit">Sign in</button>
    </form>
  );
}
