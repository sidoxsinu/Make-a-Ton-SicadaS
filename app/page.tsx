import { redirect } from "next/navigation";
import { getSession } from "@/lib/data/session";
import { homeFor } from "@/lib/roles";

export default async function HomePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  redirect(homeFor(session.role));
}
