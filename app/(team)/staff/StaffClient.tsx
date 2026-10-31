"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { DateText } from "@/components/ui/DateText";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { Field } from "@/components/ui/Field";
import { TextInput } from "@/components/ui/Inputs";
import { Dialog } from "@/components/ui/Dialog";
import { useToast } from "@/components/ui/Toast";

export interface StaffProfile {
  id: string;
  full_name: string;
  role: string;
  created_at: string;
}

export function StaffClient({ initialStaff }: { initialStaff: StaffProfile[] }) {
  const router = useRouter();
  const { success, error } = useToast();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [tempPassword, setTempPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [revokingName, setRevokingName] = useState("");
  const [revokingLoading, setRevokingLoading] = useState(false);

  async function handleAddStaff(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          temporaryPassword: tempPassword,
        }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        success("Staff member created successfully.");
        setDrawerOpen(false);
        setFullName("");
        setEmail("");
        setTempPassword("");
        router.refresh();
      } else {
        error(data.message || "Failed to create staff member.");
      }
    } catch (err: unknown) {
      error(err instanceof Error ? err.message : "An error occurred.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRevokeConfirm() {
    if (!revokingId) return;
    setRevokingLoading(true);
    try {
      const res = await fetch("/api/admin/staff", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: revokingId }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        success("Staff role revoked.");
        setRevokingId(null);
        router.refresh();
      } else {
        error(data.message || "Failed to revoke staff role.");
      }
    } catch (err: unknown) {
      error(err instanceof Error ? err.message : "An error occurred.");
    } finally {
      setRevokingLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-rule pb-4">
        <div>
          <h1 className="text-[20px] font-sans font-semibold text-ink">
            Staff & Roles
          </h1>
          <p className="text-[13px] font-sans text-ink-2 mt-1">
            Manage team members authorized to manage subscriptions, catalog, and billing.
          </p>
        </div>
        <div>
          <Button variant="primary" onClick={() => setDrawerOpen(true)}>
            Add Staff Member
          </Button>
        </div>
      </div>

      <div className="border border-rule bg-sheet overflow-x-auto">
        <table className="w-full border-collapse text-left text-[13px] font-sans">
          <thead>
            <tr className="border-b border-rule bg-paper text-[11px] font-mono uppercase tracking-wider text-ink-2">
              <th className="py-2.5 px-4 font-semibold">Full Name</th>
              <th className="py-2.5 px-4 font-semibold">System Role</th>
              <th className="py-2.5 px-4 font-semibold">Member Since</th>
              <th className="py-2.5 px-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-rule">
            {initialStaff.map((member) => (
              <tr key={member.id} className="hover:bg-hover">
                <td className="py-3 px-4 font-medium text-ink">
                  {member.full_name || "Unnamed Staff"}
                </td>
                <td className="py-3 px-4">
                  <Badge status={member.role} />
                </td>
                <td className="py-3 px-4">
                  <DateText value={member.created_at} />
                </td>
                <td className="py-3 px-4 text-right">
                  {member.role === "staff" ? (
                    <button
                      type="button"
                      onClick={() => {
                        setRevokingId(member.id);
                        setRevokingName(member.full_name);
                      }}
                      className="px-2.5 py-1 text-[12px] font-sans border border-bad text-bad rounded-sm hover:bg-hover"
                    >
                      Revoke Role
                    </button>
                  ) : (
                    <span className="text-[12px] font-mono text-ink-2">System Admin</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Staff Drawer */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Add Staff Member"
      >
        <form onSubmit={handleAddStaff} className="p-6 space-y-4">
          <p className="text-[13px] font-sans text-ink-2">
            Staff members can create subscriptions, confirm draft invoices, and manage catalog data. They cannot delete invoices or modify admin settings.
          </p>

          <Field label="Full Name" required>
            <TextInput
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Maya Sharma"
              required
            />
          </Field>

          <Field label="Work Email" required>
            <TextInput
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. maya@brightloop.local"
              required
            />
          </Field>

          <Field
            label="Temporary Password"
            help="Minimum 9 characters with upper, lower, number, and symbol."
            required
          >
            <TextInput
              type="password"
              value={tempPassword}
              onChange={(e) => setTempPassword(e.target.value)}
              placeholder="BrightloopStaff1!"
              required
            />
          </Field>

          <div className="pt-4 flex justify-end gap-3">
            <Button
              type="button"
              variant="quiet"
              onClick={() => setDrawerOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              Create Staff Account
            </Button>
          </div>
        </form>
      </Drawer>

      {/* Revoke Dialog */}
      <Dialog
        open={!!revokingId}
        title="Revoke Staff Access"
        body={
          <p className="text-[13px] font-sans text-ink">
            Are you sure you want to revoke staff privileges for{" "}
            <span className="font-semibold">{revokingName}</span>? They will be demoted to customer role and will lose access to team routes.
          </p>
        }
        confirmLabel="Revoke Role"
        cancelLabel="Keep Staff Role"
        variant="danger"
        loading={revokingLoading}
        onConfirm={handleRevokeConfirm}
        onCancel={() => setRevokingId(null)}
      />
    </div>
  );
}
