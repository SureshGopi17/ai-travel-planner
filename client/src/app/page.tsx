"use client";

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { Plane, Compass, Sparkles, Shield, Briefcase, TrendingUp, Check, Hotel } from 'lucide-react';

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="flex-1 bg-slate-950 text-white flex flex-col justify-center">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8 border-b border-white/5">
        {/* Background glowing blobs */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-indigo-500/10 blur-[150px] pointer-events-none" />

        <div className="mx-auto max-w-5xl text-center space-y-8 relative z-10">
          <div className="inline-flex items-center space-x-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3.5 py-1 text-xs font-semibold text-blue-400">
            <Sparkles className="h-3.5 w-3.5 text-yellow-400" />
            <span>Next Generation AI Travel Companion</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            Plan your next adventure <br />
            <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              powered by AI
            </span>
          </h1>

          <p className="mx-auto max-w-2xl text-base sm:text-lg text-slate-400 leading-relaxed">
            Get structured day-by-day travel itineraries, cost estimates, hotel recommendations, packing checklists, and track your actual trip spending—all in one secure dashboard.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {user ? (
              <Link
                href="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 rounded-xl bg-blue-600 px-6 py-3.5 text-base font-semibold text-white hover:bg-blue-500 transition-all duration-200 cursor-pointer shadow-lg shadow-blue-600/20"
              >
                <span>Go to Dashboard</span>
                <Compass className="h-5 w-5 rotate-45 text-blue-200" />
              </Link>
            ) : (
              <>
                <Link
                  href="/register"
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 rounded-xl bg-blue-600 px-6 py-3.5 text-base font-semibold text-white hover:bg-blue-500 transition-all duration-200 cursor-pointer shadow-lg shadow-blue-600/20"
                >
                  <span>Get Started (Free)</span>
                  <Plane className="h-5 w-5 rotate-45 text-blue-200" />
                </Link>
                <Link
                  href="/login"
                  className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl border border-white/10 bg-slate-900/50 backdrop-blur-md px-6 py-3.5 text-base font-semibold text-slate-300 hover:text-white hover:border-white/20 transition-all duration-200 cursor-pointer"
                >
                  <span>Sign In</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-950">
        <div className="mx-auto max-w-6xl space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Engineered For Modern Travelers
            </h2>
            <p className="mx-auto max-w-xl text-sm text-slate-400">
              Everything you need to plan, pack, and budget for your next dream trip.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            
            {/* Feature 1 */}
            <div className="border border-white/5 rounded-2xl bg-slate-900/20 p-6 space-y-4 hover:border-blue-500/20 transition-colors">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-white">AI Itinerary Generator</h3>
              <p className="text-sm text-slate-400">
                Input your destination, duration, budget tier, and interests, and watch the AI assemble a detailed daily plan.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="border border-white/5 rounded-2xl bg-slate-900/20 p-6 space-y-4 hover:border-blue-500/20 transition-colors">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <Compass className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Dynamic Editing</h3>
              <p className="text-sm text-slate-400">
                Add your own custom activities, delete plans, or ask the AI to completely regenerate a specific day with custom guidelines.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="border border-white/5 rounded-2xl bg-slate-900/20 p-6 space-y-4 hover:border-blue-500/20 transition-colors">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <Hotel className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Hotel Suggestions</h3>
              <p className="text-sm text-slate-400">
                Discover curated hotel recommendations grouped by price classes (Budget, Mid Range, Luxury) matching your preferences.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="border border-white/5 rounded-2xl bg-slate-900/20 p-6 space-y-4 hover:border-blue-500/20 transition-colors">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <Briefcase className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Interactive Packing List</h3>
              <p className="text-sm text-slate-400">
                Automatically generate customized item check-off sheets based on destination weather parameters and interests.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="border border-white/5 rounded-2xl bg-slate-900/20 p-6 space-y-4 hover:border-blue-500/20 transition-colors">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <TrendingUp className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Expense Tracking</h3>
              <p className="text-sm text-slate-400">
                Log actual spent purchases in real time and monitor visual comparison bars side-by-side with your estimate.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="border border-white/5 rounded-2xl bg-slate-900/20 p-6 space-y-4 hover:border-blue-500/20 transition-colors">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <Shield className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Strict Isolation & Security</h3>
              <p className="text-sm text-slate-400">
                Enforced authentication. Your travel data, packing checklists, and expenses are isolated and accessible only to you.
              </p>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
