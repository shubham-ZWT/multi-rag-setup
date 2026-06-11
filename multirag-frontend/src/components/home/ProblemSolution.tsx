"use client";
import { useHomeTheme } from "../providers/HomeThemeProvider";

export default function ProblemSolution() {
  const { theme } = useHomeTheme();
  const isLight = theme === "light";

  return (
    <section className={`${isLight ? "bg-white" : "bg-neutral-950"} py-24`}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <span className={`h-px w-8 ${isLight ? "bg-neutral-300" : "bg-neutral-700"}`} />
          <span className={`text-xs font-semibold uppercase tracking-[0.2em] ${isLight ? "text-neutral-400" : "text-neutral-500"}`}>
            Customer Experience
          </span>
        </div>

        <div className="mt-8 max-w-2xl">
          <h2 className={`text-4xl font-semibold tracking-tight sm:text-5xl ${isLight ? "text-neutral-900" : "text-white"}`}>
            Why a website without a chatbot loses customers.
          </h2>
          <p className={`mt-6 text-base leading-7 ${isLight ? "text-neutral-500" : "text-neutral-400"}`}>
            Visitors expect instant answers. Without an on-site assistant, your
            audience is forced to hunt through pages, wait for support, or leave
            confused. That delay kills engagement, reduces conversions, and
            erodes trust.
          </p>
        </div>

        <div className="mt-16 grid gap-0 md:grid-cols-[1fr_auto_1fr_auto_1fr] items-start">
          <div className="relative">
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-red-400">
              Problem
            </span>
            <p className={`mt-3 text-sm leading-7 ${isLight ? "text-neutral-500" : "text-neutral-400"}`}>
              Without a conversational chatbot, customers cannot quickly find
              product details, pricing options, or support guidance. They bounce
              away and lose confidence in your brand.
            </p>
          </div>

          <div className="hidden md:block pt-8">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className={isLight ? "text-neutral-300" : "text-neutral-600"}>
              <path d="M5 12h14m0 0-4-4m4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <div className="relative">
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-blue-400">
              Solution
            </span>
            <p className={`mt-3 text-sm leading-7 ${isLight ? "text-neutral-500" : "text-neutral-400"}`}>
              Our RAG-powered chatbot gives your site a smart assistant that
              answers questions instantly, provides context-aware information,
              and references your knowledge base with confidence.
            </p>
          </div>

          <div className="hidden md:block pt-8">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className={isLight ? "text-neutral-300" : "text-neutral-600"}>
              <path d="M5 12h14m0 0-4-4m4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <div className="relative">
            <span className={`text-xs font-semibold uppercase tracking-[0.15em] ${isLight ? "text-neutral-400" : "text-neutral-500"}`}>
              Dashboard
            </span>
            <p className={`mt-3 text-sm leading-7 ${isLight ? "text-neutral-500" : "text-neutral-400"}`}>
              The dashboard gives you control over bot behavior, analytics,
              conversation history, and content sources. You can optimize
              responses and monitor performance from one place.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
