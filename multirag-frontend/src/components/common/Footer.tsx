import { FaTwitter, FaLinkedin, FaGithub, FaYoutube } from "react-icons/fa";

const navLinks = [
  { label: "Products", href: "/products" },
  { label: "Pricing", href: "/pricing" },
  { label: "Docs", href: "/docs" },
  { label: "Blog", href: "/blog" },
];

const companyLinks = [
  { label: "About", href: "/about" },
  { label: "Careers", href: "/careers" },
  { label: "Contact", href: "/contact" },
  { label: "Privacy", href: "/privacy" },
];

const communityLinks = [
  { label: "Developers", href: "/developers" },
  { label: "Support", href: "/support" },
  { label: "FAQ", href: "/faq" },
  { label: "Resources", href: "/resources" },
];

export default function Footer() {
  return (
    <footer className="bg-primary text-secondary py-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-[1.5fr_1fr_1fr_1fr] items-start">
          <div>
            <p className="text-2xl font-semibold tracking-tight ">Botify</p>
            <p className="mt-4 text-sm leading-7 max-w-md">
              Build smarter customer experiences with our AI-powered RAG
              platform. Connect knowledge, automate workflows, and ship faster.
            </p>
            <div className="mt-8 flex items-center gap-4">
              <a
                href="https://twitter.com"
                aria-label="Twitter"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-primary transition hover:bg-slate-800"
              >
                <FaTwitter />
              </a>
              <a
                href="https://linkedin.com"
                aria-label="LinkedIn"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-primary transition hover:bg-slate-800"
              >
                <FaLinkedin />
              </a>
              <a
                href="https://github.com"
                aria-label="GitHub"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-primary transition hover:bg-slate-800"
              >
                <FaGithub />
              </a>
              <a
                href="https://youtube.com"
                aria-label="YouTube"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-primary transition hover:bg-slate-800"
              >
                <FaYoutube />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-secondary">
              Product
            </h3>
            <ul className="mt-6 space-y-3 text-sm">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="transition hover:text-white">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-secondary">
              Company
            </h3>
            <ul className="mt-6 space-y-3 text-sm">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="transition hover:text-white">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-secondary">
              Community
            </h3>
            <ul className="mt-6 space-y-3 text-sm">
              {communityLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="transition hover:text-white">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-800 pt-8 text-sm text-slate-500 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Botify. All rights reserved.</p>
          <p>Designed for modern AI teams and enterprise-grade deployments.</p>
        </div>
      </div>
    </footer>
  );
}
