import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Page() {
  const session = await auth();

  if (!session || !session.user) {
    return redirect("/login?redirect=dashboard");
  } else {
    return redirect("/dashboard/wishlists");
  }
}
