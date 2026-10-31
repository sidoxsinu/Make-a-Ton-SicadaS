import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Brightloop SMS",
  description: "Brightloop Subscription Management System",
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
