"use client";

import React, { useState } from "react";
import Link from "next/link";
import { requestResetAction, type ActionResult } from "@/app/auth/actions";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { TextInput } from "@/components/ui/Inputs";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ActionResult | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    const formData = new FormData(e.currentTarget);
    const res = await requestResetAction(null, formData);
    setResult(res);
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-paper flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-[380px] bg-sheet border border-ink rounded-sm p-8 flex flex-col gap-6">
        <div className="flex flex-col gap-1 border-b border-rule pb-4">
          <h1 className="text-[18px] font-sans font-semibold text-ink uppercase tracking-tight">
            Brightloop SMS
          </h1>
          <p className="text-[13px] font-sans text-ink-2">
            Reset your password
          </p>
        </div>

        {result && (
          <div
            role="status"
            className="p-3 bg-sheet border border-ink text-ink text-[13px] font-sans rounded-sm"
          >
            {result.message}
          </div>
        )}

        {!result?.ok && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Field label="Registered Email" name="email">
              <TextInput
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
              />
            </Field>

            <div className="pt-2 flex flex-col gap-3">
              <Button type="submit" variant="primary" loading={loading}>
                Send reset link
              </Button>
            </div>
          </form>
        )}

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
