"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors: Record<string, string> = {};

    if (!password) {
      validationErrors.password = "New password is required";
    } else if (password.length < 8) {
      validationErrors.password = "Password must be at least 8 characters long";
    }

    if (password !== confirmPassword) {
      validationErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setSuccess(false);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSuccess(true);
    } catch (err) {
      setErrors({ global: "Failed to reset password. Please try again." });
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
            <CardTitle className="text-xl font-extrabold tracking-tight">RESET PASSWORD</CardTitle>
            <CardDescription>Establish a new secure password for your operator account</CardDescription>
          </CardHeader>

          <CardContent className="px-6 pb-8">
            {success ? (
              <div className="space-y-4">
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold rounded text-center">
                  Password has been successfully updated.
                </div>
                <div className="text-center">
                  <Link
                    href="/login"
                    className="text-xs font-bold text-[#FFCD00] hover:underline"
                  >
                    Proceed to Login
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {errors.global && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold rounded text-center">
                    {errors.global}
                  </div>
                )}

                <Input
                  label="New Password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={errors.password}
                  disabled={loading}
                />

                <Input
                  label="Confirm New Password"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  error={errors.confirmPassword}
                  disabled={loading}
                />

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
                      Updating Password...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </Button>
              </form>
            )}
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
