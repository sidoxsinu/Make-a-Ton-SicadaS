"use client";

import React, { useState } from "react";
import Link from "next/link";
import { signInAction, type ActionResult } from "@/app/auth/actions";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { TextInput } from "@/components/ui/Inputs";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const formData = new FormData(e.currentTarget);
    const res: ActionResult = await signInAction(null, formData);

    if (!res.ok) {
      setErrorMsg(res.message);
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-paper flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-[380px] bg-sheet border border-ink rounded-sm p-8 flex flex-col gap-6">
        <div className="flex flex-col gap-1 border-b border-rule pb-4">
          <h1 className="text-[18px] font-sans font-semibold text-ink uppercase tracking-tight">
            Brightloop SMS
          </h1>
          <p className="text-[13px] font-sans text-ink-2">
            Sign in to your account
          </p>
        </div>

        {errorMsg && (
          <div
            role="alert"
            className="p-3 bg-sheet border border-bad text-bad text-[13px] font-sans rounded-sm"
          >
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="Email" name="email">
            <TextInput
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              hasError={Boolean(errorMsg)}
            />
          </Field>

          <Field label="Password" name="password">
            <TextInput
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              hasError={Boolean(errorMsg)}
            />
          </Field>

          <div className="pt-2 flex flex-col gap-3">
            <Button type="submit" variant="primary" loading={loading}>
              Sign in
            </Button>
          </div>
        </form>

        <div className="flex items-center justify-between text-[13px] font-sans pt-2 border-t border-rule">
          <Link
            href="/forgot-password"
            className="text-ink underline decoration-1 decoration-rule hover:text-ink-2"
          >
            Forgot password
          </Link>
          <Link
            href="/signup"
            className="text-ink underline decoration-1 decoration-rule hover:text-ink-2"
          >
            Sign up
          </Link>
        </div>
      </div>
    </main>
  );
}
