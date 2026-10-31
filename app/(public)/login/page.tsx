"use client";

import React, { useState } from "react";
import Link from "next/link";
import { signInAction, demoSignInAction, type ActionResult } from "@/app/auth/actions";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { TextInput } from "@/components/ui/Inputs";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState<string | null>(null);
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

  async function handleDemoLogin(role: "admin" | "staff" | "customer") {
    setDemoLoading(role);
    setErrorMsg(null);
    try {
      await demoSignInAction(role);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to sign in demo user";
      if (!msg.includes("NEXT_REDIRECT")) {
        setErrorMsg(msg);
        setDemoLoading(null);
      }
    }
  }

  return (
    <main className="min-h-screen bg-paper flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-[420px] bg-sheet border border-ink rounded-sm p-8 flex flex-col gap-6">
        <div className="flex flex-col gap-1 border-b border-rule pb-4">
          <div className="flex items-center justify-between">
            <h1 className="text-[18px] font-sans font-semibold text-ink uppercase tracking-tight">
              Brightloop SMS
            </h1>
            <Link
              href="/"
              className="text-[11px] font-mono uppercase text-ink-2 underline hover:text-ink"
            >
              Overview & Story
            </Link>
          </div>
          <p className="text-[13px] font-sans text-ink-2">
            Ledger-Grade Subscription & Invoicing Automation
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

        {/* Quick Demo 1-Click Access for Evaluators & Teammates */}
        <div className="p-3 bg-paper border border-rule rounded-sm flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-ink-2 font-semibold">
              Fast Demo Access (1-Click)
            </span>
            <span className="text-[10px] font-mono text-ok">Pre-configured</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              disabled={Boolean(demoLoading || loading)}
              onClick={() => handleDemoLogin("admin")}
              className="px-2 py-1.5 border border-ink text-ink text-[12px] font-sans rounded-sm hover:bg-hover active:bg-selected font-medium disabled:opacity-50"
            >
              {demoLoading === "admin" ? "..." : "Admin"}
            </button>
            <button
              type="button"
              disabled={Boolean(demoLoading || loading)}
              onClick={() => handleDemoLogin("staff")}
              className="px-2 py-1.5 border border-ink text-ink text-[12px] font-sans rounded-sm hover:bg-hover active:bg-selected font-medium disabled:opacity-50"
            >
              {demoLoading === "staff" ? "..." : "Staff"}
            </button>
            <button
              type="button"
              disabled={Boolean(demoLoading || loading)}
              onClick={() => handleDemoLogin("customer")}
              className="px-2 py-1.5 border border-ink text-ink text-[12px] font-sans rounded-sm hover:bg-hover active:bg-selected font-medium disabled:opacity-50"
            >
              {demoLoading === "customer" ? "..." : "Customer"}
            </button>
          </div>
          <p className="text-[11px] font-mono text-ink-2">
            Password: <span className="font-semibold text-ink">Brightloop1!</span> (Customer: <span className="font-semibold text-ink">Customer1!</span>)
          </p>
        </div>

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

