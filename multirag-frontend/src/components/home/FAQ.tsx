"use client";

import { useState } from "react";
import { HiMinus, HiPlus } from "react-icons/hi";
import { useHomeTheme } from "../providers/HomeThemeProvider";

const faqs = [
  {
    question: "What is the best way to add the chatbot to my website?",
    answer:
      "Add our widget script or use the embed API to place the chatbot on any page. The integration is lightweight and works with both static and dynamic websites.",
  },
  {
    question: "How does the chatbot learn from my content?",
    answer:
      "The RAG assistant indexes your documents, FAQs, and knowledge base so it can answer questions using your own brand content with accuracy and context.",
  },
  {
    question: "Can I customize the chatbot's tone and behavior?",
    answer:
      "Yes. Use the dashboard to adjust the bot prompt, response style, and knowledge sources so the chatbot matches your brand voice and customer needs.",
  },
  {
    question: "What analytics are available in the dashboard?",
    answer:
      "Track conversation volume, top user questions, and bot performance so you can improve answers, reduce friction, and measure impact over time.",
  },
];

export default function FAQ() {
  const [activeIndex, setActiveIndex] = useState<number | null>(0);
  const { theme } = useHomeTheme();
  const isLight = theme === "light";

  return (
    <section className={`${isLight ? "bg-slate-50" : "bg-neutral-950"} py-24`}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div className="space-y-6">
            <span className={`inline-flex rounded-full px-4 py-1 text-sm font-semibold ${isLight ? "bg-blue-100 text-blue-700" : "bg-blue-900/30 text-blue-300"}`}>
              Frequently asked questions
            </span>
            <h2 className={`text-4xl font-semibold tracking-tight sm:text-5xl ${isLight ? "text-slate-950" : "text-white"}`}>
              Get clarity fast with answers built right into your experience.
            </h2>
            <p className={`max-w-xl text-lg leading-8 ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
              Customers want instant help. A website without a smart assistant
              creates confusion and slows decision-making. Our FAQ section and
              chatbot solution reduce friction by offering dynamic answers and
              helpful guidance instantly.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isActive = activeIndex === index;
              return (
                <button
                  key={faq.question}
                  type="button"
                  onClick={() => setActiveIndex(isActive ? null : index)}
                  className={`w-full rounded-3xl border p-6 text-left shadow-sm transition ${
                    isLight
                      ? "border-slate-200 bg-white hover:border-blue-300"
                      : "border-neutral-800 bg-neutral-900 hover:border-blue-600"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className={`text-base font-semibold ${isLight ? "text-slate-950" : "text-white"}`}>
                        {faq.question}
                      </p>
                    </div>
                    <span className={`mt-1 flex h-10 w-10 items-center justify-center rounded-full ${
                      isLight ? "bg-blue-100 text-blue-700" : "bg-blue-900/30 text-blue-300"
                    }`}>
                      {isActive ? <HiMinus size={20} /> : <HiPlus size={20} />}
                    </span>
                  </div>
                  {isActive ? (
                    <p className={`mt-4 text-sm leading-7 ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
                      {faq.answer}
                    </p>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
