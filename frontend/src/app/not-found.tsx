"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between relative">
      {/* Brand Top Warning Strip */}
      <div className="h-2 bg-repeating-linear bg-[linear-gradient(45deg,#FFCD00_25%,#000000_25%,#000000_50%,#FFCD00_50%,#FFCD00_75%,#000000_75%,#000000)] bg-[length:24px_24px] border-b border-black/10" />

      {/* Main card center container */}
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border border-stone-200 dark:border-stone-800 shadow-xl overflow-hidden relative text-center">
          
          {/* Subtle CAT brand accents inside card */}
          <div className="h-1 bg-red-500" />
          
          <CardHeader className="pt-8">
            <div className="flex justify-center mb-4">
              <div className="bg-red-500/10 text-red-500 p-4 rounded-full border border-red-500/20">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
            <CardTitle className="text-xl font-extrabold tracking-tight">ERROR CODE: 404</CardTitle>
            <CardDescription>Asset Path Disconnect / Unrecognized Segment</CardDescription>
          </CardHeader>

          <CardContent className="px-6 pb-8 space-y-4">
            <p className="text-sm text-stone-600 dark:text-stone-400 leading-6">
              The operational node or dashboard route you requested is unavailable. This could be due to telemetry sync delays, facility reconfigurations, or expired user authentication privileges.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/" className="flex-1">
                <Button variant="primary" className="w-full">
                  Operational cockpit
                </Button>
              </Link>
              <Link href="/login" className="flex-1">
                <Button variant="outline" className="w-full">
                  Sign In Portal
                </Button>
              </Link>
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
