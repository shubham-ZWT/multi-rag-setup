"use client";
import { FaCode, FaCog, FaCloudUploadAlt, FaChartLine } from "react-icons/fa";
import { useHomeTheme } from "../providers/HomeThemeProvider";

export default function HowToUse() {
  const { theme } = useHomeTheme();
  const isLight = theme === "light";

  const steps = [
    {
      icon: (
        <FaCloudUploadAlt
          size={37}
          className={`p-2 rounded-full ${isLight ? "text-red-500 bg-red-100" : "text-red-400 bg-red-900/30"}`}
        />
      ),
      title: "Upload your knowledge",
      description:
        "Drag and drop documents, PDFs, or connect your help center to create an instant knowledge base.",
    },
    {
      icon: (
        <FaCog
          size={37}
          className={`p-2 rounded-full ${isLight ? "text-green-700 bg-green-100" : "text-green-400 bg-green-900/30"}`}
        />
      ),
      title: "Configure your bot",
      description:
        "Set tone, customize responses, and define how your chatbot interacts with visitors.",
    },
    {
      icon: (
        <FaCode
          size={37}
          className={`p-2 rounded-full ${isLight ? "text-purple-500 bg-purple-100" : "text-purple-400 bg-purple-900/30"}`}
        />
      ),
      title: "Embed on your site",
      description:
        "Add a single script tag or use our API to place the chatbot anywhere on your website.",
    },
    {
      icon: (
        <FaChartLine
          size={37}
          className={`p-2 rounded-full ${isLight ? "text-blue-500 bg-blue-100" : "text-blue-400 bg-blue-900/30"}`}
        />
      ),
      title: "Monitor & optimize",
      description:
        "Track conversations, review analytics, and refine your bot's behavior over time.",
    },
  ];

  return (
    <section className={`${isLight ? "bg-white" : "bg-neutral-950"} py-24`}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className={`text-4xl font-semibold tracking-tight sm:text-5xl ${isLight ? "text-neutral-900" : "text-white"}`}>
            How it works
          </h2>
          <p className={`mt-4 text-base leading-7 ${isLight ? "text-neutral-500" : "text-neutral-400"}`}>
            Get your RAG chatbot up and running in minutes — no complex setup
            required.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-4">
          {steps.map((step) => (
            <div
              key={step.title}
              className={`rounded-2xl border p-6 ${isLight ? "border-neutral-200" : "border-neutral-800 bg-neutral-900"}`}
            >
              <div className="inline-flex">{step.icon}</div>
              <h3 className={`mt-4 text-base font-semibold ${isLight ? "text-neutral-900" : "text-white"}`}>
                {step.title}
              </h3>
              <p className={`mt-2 text-sm leading-6 ${isLight ? "text-neutral-500" : "text-neutral-400"}`}>
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
