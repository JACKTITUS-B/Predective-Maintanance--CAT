"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [authError, setAuthError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    const validationErrors: Record<string, string> = {};

    if (!email.trim()) {
      validationErrors.email = "Email address is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      validationErrors.email = "Please input a valid email address";
    }

    if (!password) {
      validationErrors.password = "Password is required";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      await login(email, password);
    } catch (err: any) {
      setAuthError(err.message || "Authentication failed. Please verify your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between relative">
      {/* Brand Top Warning Strip */}
      <div className="h-2 bg-repeating-linear bg-[linear-gradient(45deg,#FFCD00_25%,#000000_25%,#000000_50%,#FFCD00_50%,#FFCD00_75%,#000000_75%,#000000)] bg-[length:24px_24px] border-b border-black/10" />

      {/* Main card center container */}
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border border-stone-200 dark:border-stone-800 shadow-xl overflow-hidden relative">
          
          {/* Subtle CAT brand accents inside card */}
          <div className="h-1 bg-[#FFCD00]" />
          
          <CardHeader className="text-center pt-8">
            <div className="flex justify-center mb-4">
              <div className="bg-[#FFCD00] text-black font-extrabold px-4 py-2 rounded text-2xl tracking-tighter shadow-sm w-fit">
                CAT
              </div>
            </div>
            <CardTitle className="text-xl font-extrabold tracking-tight">PREDICTIVE OPERATIONS</CardTitle>
            <CardDescription>Sign in to monitor fleet telemetry and failure forecasts</CardDescription>
          </CardHeader>

          <CardContent className="px-6 pb-8">
            <form onSubmit={handleLogin} className="space-y-4">
              {authError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold rounded text-center animate-pulse">
                  {authError}
                </div>
              )}

              <Input
                label="Email Address"
                type="email"
                placeholder="operator@caterpillar.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
                disabled={loading}
              />

              <div>
                <Input
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={errors.password}
                  disabled={loading}
                />
                <div className="flex justify-end mt-1.5">
                  <Link
                    href="/forgot-password"
                    className="text-[11px] font-bold text-stone-500 hover:text-[#FFCD00] transition-colors"
                  >
                    Forgot Password?
                  </Link>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full py-2.5 mt-2 flex items-center justify-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-black" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Validating Credentials...
                  </>
                ) : (
                  "Authenticate Sign In"
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-stone-200 dark:border-stone-800 text-center">
              <span className="text-[11px] text-stone-500">Need immediate account provisioning?</span>
              <span className="text-[11px] font-bold text-[#FFCD00] block mt-1 hover:underline cursor-pointer">
                Contact Facility Supervisor
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Brand Bottom strip */}
      <footer className="bg-stone-900 border-t border-stone-800 py-3 px-6 text-center text-[9px] text-stone-500 font-bold tracking-widest uppercase">
        © 2026 CATERPILLAR INC. AUTHORIZED ACCESS ONLY.
      </footer>
    </div>
  );
}
