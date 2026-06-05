"use client";
import Button from "../ui/Button";

export default function CTA() {
  return (
    <section className="py-24 bg-neutral-950">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-semibold text-white sm:text-4xl">
          Start your free trial today
        </h2>
        <p className="mt-4 mx-auto max-w-2xl text-lg text-white/50">
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
            className="px-6 py-3 rounded-full border border-white/20 text-sm text-white/70 hover:text-white hover:border-white/40 transition-all duration-200"
          >
            Contact Us
          </button>
        </div>
      </div>
    </section>
  );
}
