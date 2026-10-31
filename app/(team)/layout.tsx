import { TeamShell } from "@/components/shell/TeamShell";
import { getSession } from "@/lib/data/session";
import { isTeam } from "@/lib/roles";
import { redirect } from "next/navigation";

export default async function TeamPagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isTeam(session.role)) redirect("/portal");
  return (
    <TeamShell
      title="Subscription Management"
      userEmail={session.email}
      role={session.role}
    >
      {children}
    </TeamShell>
  );
}
