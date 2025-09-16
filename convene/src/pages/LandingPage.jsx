// src/pages/LandingPage.jsx
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import useDarkMode from "../hooks/useDarkMode";
import { Sun, Moon } from "lucide-react";

/**
 * LandingPage for Convene
 * - TailwindCSS classes used for styling
 * - Framer Motion for subtle animations
 * - Uses inline SVGs for icons/decorations (no external assets)
 */

const featureList = [
  {
    key: "ai-sched",
    title: "AI-powered scheduling",
    desc: "Automatically find the best times across calendars and constraints.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M12 2v6"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M20 12h-6"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    ),
  },
  {
    key: "tz",
    title: "Timezone-aware",
    desc: "Compare organizer & client timezones and propose friendly slots.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M12 2v4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          stroke="currentColor"
          strokeWidth="1.2"
        />
      </svg>
    ),
  },
  {
    key: "retro",
    title: "Anonymous sprint feedback",
    desc: "Collect candid retrospectives before/after meetings with easy editor.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M3 7h18"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M6 11h12"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M9 15h6"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

const containerVariants = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.08, duration: 0.5 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 8, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 120, damping: 14 },
  },
};

export default function LandingPage() {
  const { theme, toggle } = useDarkMode();
  return (
    <main className="min-h-screen bg-paper-50 dark:bg-night-900">
      {/* Decorative gradient blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <svg
          className="absolute -left-24 -top-24 opacity-30 blur-3xl"
          width="600"
          height="600"
          viewBox="0 0 600 600"
          fill="none"
        >
          <defs>
            <linearGradient id="g1" x1="0" x2="1">
              <stop offset="0%" stopColor="#7c3aed" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>
          <circle cx="300" cy="300" r="250" fill="url(#g1)" />
        </svg>
      </div>

      <div className="container mx-auto px-6 lg:px-12 py-20">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <img src="/convene-logo.svg" alt="Convene Logo" className="w-8 h-8" />
            <div className="text-sm font-semibold tracking-tight text-slate-800 dark:text-slate-100">Convene</div>
          </div>
          <button onClick={toggle} className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Toggle theme">
            {theme === 'dark' ? <Sun size={16} aria-hidden /> : <Moon size={16} aria-hidden />}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* HERO TEXT */}
          <motion.section
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
            aria-labelledby="hero-heading"
          >
            <h1
              id="hero-heading"
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight text-slate-900 dark:text-white"
            >
              Convene
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-brand-500 via-accent-500 to-pink-500 font-display">
                — Streamline meetings. Intelligent, efficient, global.
              </span>
            </h1>

            <p className="text-slate-600 dark:text-slate-300 max-w-xl text-lg">
              Convene helps distributed teams schedule smarter, manage
              timezones, and collect anonymous sprint feedback — all in one
              sleek workflow powered by intelligent helpers.
            </p>

            <div className="flex flex-wrap gap-3 items-center">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  to="/auth"
                  className="inline-flex items-center gap-3 px-5 py-3 rounded-full bg-gradient-to-r from-indigo-600 to-pink-500 text-white font-medium shadow-lg hover:brightness-105 focus:outline-none focus:ring-4 focus:ring-indigo-200"
                  aria-label="Get started with Convene"
                >
                  Get started
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden
                  >
                    <path
                      d="M5 12h14M12 5l7 7-7 7"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Link>
              </motion.div>

              <motion.a
                whileHover={{ scale: 1.02 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300"
                href="#features"
              >
                Explore features
              </motion.a>
            </div>

            {/* small trust row */}
            <div className="flex gap-4 items-center text-sm text-slate-600 dark:text-slate-400 mt-6">
              <span>Trusted by teams</span>
              <div className="h-6 border-l border-slate-200 dark:border-slate-700" />
              <span className="font-medium text-slate-700 dark:text-slate-200">
                Remote-first companies • Design teams • Agile teams
              </span>
            </div>
          </motion.section>

          {/* HERO ILLUSTRATION */}
          <motion.figure
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="relative"
            aria-hidden
          >
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 border border-transparent dark:border-slate-700">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-300">
                    Next Meeting
                  </div>
                  <div className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">
                    Client Sync
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    Mon • 10:00 AM • Google Meet
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <div className="text-xs text-slate-600 dark:text-slate-400">Timezone</div>
                  <div className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    Asia/Kolkata
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <div className="text-xs text-slate-600 dark:text-slate-400">Suggested slots</div>
                  <ul className="mt-2 space-y-2">
                    <li className="px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 text-sm flex justify-between items-center border border-slate-100 dark:border-slate-700">
                      <span>Mon • 10:00 — 10:30</span>
                      <button className="text-xs px-2 py-1 rounded-md bg-indigo-600 text-white">
                        Select
                      </button>
                    </li>
                    <li className="px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 text-sm flex justify-between items-center border border-slate-100 dark:border-slate-700">
                      <span>Tue • 4:00 — 4:30</span>
                      <button className="text-xs px-2 py-1 rounded-md bg-indigo-600 text-white">
                        Select
                      </button>
                    </li>
                  </ul>
                </div>

                <div className="col-span-1">
                  <div className="text-xs text-slate-600 dark:text-slate-400">Actions</div>
                  <div className="mt-2 flex flex-col gap-2">
                    <button className="px-3 py-2 rounded-md bg-emerald-500 text-white text-sm">
                      Start Meeting
                    </button>
                    <button className="px-3 py-2 rounded-md border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-200">
                      Add to Calendar
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* subtle badge */}
            <div className="absolute -bottom-4 left-6 transform -translate-y-1/2 bg-white/90 dark:bg-slate-800/80 backdrop-blur rounded-full px-3 py-1 shadow-md border border-slate-100 dark:border-slate-700 text-sm">
              AI-suggested • 98% match
            </div>
          </motion.figure>
        </div>

        {/* FEATURES */}
        <motion.section
          id="features"
          className="mt-14"
          initial="hidden"
          animate="show"
          variants={containerVariants}
        >
          <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">
            Core features
          </h2>
          <p className="text-slate-600 dark:text-slate-300 mt-2 max-w-2xl">
            Convene focuses on the few things that matter: smart scheduling,
            timezone intelligence, and honest retrospectives.
          </p>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featureList.map((f, i) => (
              <motion.article
                key={f.key}
                className="rounded-2xl p-5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-lg"
                variants={cardVariants}
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 200 }}
                role="article"
                aria-labelledby={`feature-${f.key}`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-tr from-indigo-100 to-pink-50 flex items-center justify-center text-indigo-600 dark:text-indigo-300">
                    {f.icon}
                  </div>
                  <div>
                    <h3
                      id={`feature-${f.key}`}
                      className="font-semibold text-slate-900 dark:text-white"
                    >
                      {f.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      {f.desc}
                    </p>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </motion.section>

        {/* FOOTER / small CTA */}
        <div className="mt-16 py-8 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-slate-600 dark:text-slate-400">
            © {new Date().getFullYear()} Convene — Built for intelligent
            teamwork
          </div>
          <div>
            <Link
              to="/auth"
              className="text-sm inline-flex items-center gap-2 font-medium text-indigo-600 dark:text-indigo-400"
            >
              Try Convene — it's free
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden
              >
                <path
                  d="M5 12h14M12 5l7 7-7 7"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
