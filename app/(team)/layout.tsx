import { TeamShell } from "@/components/shell/TeamShell";

export default function TeamPagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <TeamShell title="Subscription Management">{children}</TeamShell>;
}
