"use client";

import React, { useState } from "react";
import Link from "next/link";
import { signUpAction, type ActionResult } from "@/app/auth/actions";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { TextInput } from "@/components/ui/Inputs";
import { PasswordChecklist } from "@/components/auth/PasswordChecklist";

export default function SignUpPage() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ActionResult | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    const formData = new FormData(e.currentTarget);
    const res = await signUpAction(null, formData);
    setResult(res);
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-paper flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-[440px] bg-sheet border border-ink rounded-sm p-8 flex flex-col gap-6">
        <div className="flex flex-col gap-1 border-b border-rule pb-4">
          <h1 className="text-[18px] font-sans font-semibold text-ink uppercase tracking-tight">
            Brightloop SMS
          </h1>
          <p className="text-[13px] font-sans text-ink-2">
            Create a new customer account
          </p>
        </div>

        {result && (
          <div
            role="alert"
            className={`p-3 bg-sheet border text-[13px] font-sans rounded-sm ${
              result.ok ? "border-ok text-ok" : "border-bad text-bad"
            }`}
          >
            {result.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field
            label="Full Name"
            name="fullName"
            error={result?.fieldErrors?.fullName}
          >
            <TextInput
              id="fullName"
              name="fullName"
              autoComplete="name"
              required
              hasError={Boolean(result?.fieldErrors?.fullName)}
            />
          </Field>

          <Field
            label="Email"
            name="email"
            error={result?.fieldErrors?.email}
          >
            <TextInput
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              hasError={Boolean(result?.fieldErrors?.email)}
            />
          </Field>

          <Field
            label="Password"
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
            label="Confirm Password"
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
              Sign up
            </Button>
          </div>
        </form>

        <div className="flex items-center justify-center text-[13px] font-sans pt-2 border-t border-rule">
          <span className="text-ink-2 mr-2">Already have an account?</span>
          <Link
            href="/login"
            className="text-ink underline decoration-1 decoration-rule hover:text-ink-2"
          >
            Sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
