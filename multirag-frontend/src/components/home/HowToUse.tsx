import { FaCode, FaCog, FaCloudUploadAlt, FaChartLine } from "react-icons/fa";

export default function HowToUse() {
  const steps = [
    {
      icon: (
        <FaCloudUploadAlt
          size={37}
          className="text-red-500 p-2 bg-red-100 rounded-full"
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
          className="text-green-700 p-2 bg-green-100 rounded-full"
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
          className="text-purple-500 p-2 bg-purple-100 rounded-full"
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
          className="text-blue-500 p-2 bg-blue-100 rounded-full"
        />
      ),
      title: "Monitor & optimize",
      description:
        "Track conversations, review analytics, and refine your bot's behavior over time.",
    },
  ];

  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-semibold tracking-tight text-neutral-900 sm:text-5xl">
            How it works
          </h2>
          <p className="mt-4 text-base leading-7 text-neutral-500">
            Get your RAG chatbot up and running in minutes — no complex setup
            required.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-4">
          {steps.map((step) => (
            <div
              key={step.title}
              className="rounded-2xl border border-neutral-200 p-6"
            >
              <div className="inline-flex">{step.icon}</div>
              <h3 className="mt-4 text-base font-semibold text-neutral-900">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-neutral-500">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
