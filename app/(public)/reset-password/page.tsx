"use client";

import React, { useState } from "react";
import Link from "next/link";
import { setNewPasswordAction, type ActionResult } from "@/app/auth/actions";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { TextInput } from "@/components/ui/Inputs";
import { PasswordChecklist } from "@/components/auth/PasswordChecklist";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ActionResult | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    const formData = new FormData(e.currentTarget);
    const res = await setNewPasswordAction(null, formData);
    if (!res.ok) {
      setResult(res);
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-paper flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-[440px] bg-sheet border border-ink rounded-sm p-8 flex flex-col gap-6">
        <div className="flex flex-col gap-1 border-b border-rule pb-4">
          <h1 className="text-[18px] font-sans font-semibold text-ink uppercase tracking-tight">
            Brightloop SMS
          </h1>
          <p className="text-[13px] font-sans text-ink-2">
            Set your new password
          </p>
        </div>

        {result && (
          <div
            role="alert"
            className="p-3 bg-sheet border border-bad text-bad text-[13px] font-sans rounded-sm"
          >
            {result.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field
            label="New Password"
            name="password"
            error={result?.fieldErrors?.password}
          >
            <TextInput
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              hasError={Boolean(result?.fieldErrors?.password)}
            />
          </Field>

          {/* Live checklist under password */}
          <PasswordChecklist password={password} />

          <Field
            label="Confirm New Password"
            name="confirmPassword"
            error={result?.fieldErrors?.confirmPassword}
          >
            <TextInput
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              hasError={Boolean(result?.fieldErrors?.confirmPassword)}
            />
          </Field>

          <div className="pt-2 flex flex-col gap-3">
            <Button type="submit" variant="primary" loading={loading}>
              Save new password
            </Button>
          </div>
        </form>

        <div className="flex items-center justify-center text-[13px] font-sans pt-2 border-t border-rule">
          <Link
            href="/login"
            className="text-ink underline decoration-1 decoration-rule hover:text-ink-2"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
