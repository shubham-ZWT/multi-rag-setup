"use client";
import Button from "../ui/Button";
import { useHomeTheme } from "../providers/HomeThemeProvider";

export default function CTA() {
  const { theme } = useHomeTheme();
  const isLight = theme === "light";

  return (
    <section className={`py-24 ${isLight ? "bg-gradient-to-r from-blue-600 to-blue-700" : "bg-neutral-950"}`}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-semibold text-white sm:text-4xl">
          Start your free trial today
        </h2>
        <p className={`mt-4 mx-auto max-w-2xl text-lg ${isLight ? "text-white/70" : "text-white/50"}`}>
          Unlock the full potential of your data with our comprehensive RAG
          chatbot platform — deploy fast and improve customer experiences.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
          <Button
            isprimary={true}
            onClick={() => alert("Get Started clicked")}
          >
            Get Started
          </Button>
          <button
            onClick={() => alert("Contact Us clicked")}
            className={`px-6 py-3 rounded-full border text-sm transition-all duration-200 ${
              isLight
                ? "border-white/30 text-white/80 hover:text-white hover:border-white/60"
                : "border-white/20 text-white/70 hover:text-white hover:border-white/40"
            }`}
          >
            Contact Us
          </button>
        </div>
      </div>
    </section>
  );
}
