export default function ProblemSolution() {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <span className="h-px w-8 bg-neutral-300" />
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
            Customer Experience
          </span>
        </div>

        <div className="mt-8 max-w-2xl">
          <h2 className="text-4xl font-semibold tracking-tight text-neutral-900 sm:text-5xl">
            Why a website without a chatbot loses customers.
          </h2>
          <p className="mt-6 text-base leading-7 text-neutral-500">
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
            <p className="mt-3 text-sm leading-7 text-neutral-500">
              Without a conversational chatbot, customers cannot quickly find
              product details, pricing options, or support guidance. They bounce
              away and lose confidence in your brand.
            </p>
          </div>

          <div className="hidden md:block pt-8">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-neutral-300">
              <path d="M5 12h14m0 0-4-4m4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <div className="relative">
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-blue-400">
              Solution
            </span>
            <p className="mt-3 text-sm leading-7 text-neutral-500">
              Our RAG-powered chatbot gives your site a smart assistant that
              answers questions instantly, provides context-aware information,
              and references your knowledge base with confidence.
            </p>
          </div>

          <div className="hidden md:block pt-8">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-neutral-300">
              <path d="M5 12h14m0 0-4-4m4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <div className="relative">
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-neutral-400">
              Dashboard
            </span>
            <p className="mt-3 text-sm leading-7 text-neutral-500">
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
