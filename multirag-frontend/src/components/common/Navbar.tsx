"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Button from "../ui/Button";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const navItems = [
    { name: "Home", href: "/" },
    { name: "Features", href: "/features" },
    { name: "Pricing", href: "/pricing" },
    { name: "Contact", href: "/contact" },
  ];

  const navText = scrolled ? "text-neutral-900" : "text-white";
  const navBg = scrolled
    ? "bg-white/80 backdrop-blur-2xl border-white/20 shadow-black/5"
    : "bg-neutral-900/60 backdrop-blur-2xl border-white/10 shadow-black/20";
  const mobileBg = scrolled
    ? "bg-white/95 backdrop-blur-2xl border-white/20"
    : "bg-neutral-900/90 backdrop-blur-2xl border-white/10";
  const mobileText = scrolled ? "text-neutral-900" : "text-white";
  const linkHover = scrolled ? "hover:text-blue-500" : "hover:text-blue-400";

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${navText}`}
    >
      <div
        className={`max-w-7xl mx-4 md:mx-auto mt-4 px-4 py-3 rounded-full flex justify-between items-center border shadow-lg transition-all duration-300 ${navBg}`}
      >
        <div className="text-xl font-bold">
          <Link href="/">Botify</Link>
        </div>

        <div className="hidden md:flex items-center space-x-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`transition-colors duration-200 ${linkHover}`}
            >
              {item.name}
            </Link>
          ))}
          <Button isprimary={true} onClick={() => alert("Get Started clicked")}>
            Get Started
          </Button>
        </div>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden flex flex-col gap-1.5 p-2"
          aria-label="Toggle menu"
        >
          <span
            className={`block h-0.5 w-5 rounded transition-all duration-300 ${scrolled ? "bg-neutral-900" : "bg-white"} ${menuOpen ? "translate-y-2 rotate-45" : ""}`}
          />
          <span
            className={`block h-0.5 w-5 rounded transition-all duration-300 ${scrolled ? "bg-neutral-900" : "bg-white"} ${menuOpen ? "opacity-0" : ""}`}
          />
          <span
            className={`block h-0.5 w-5 rounded transition-all duration-300 ${scrolled ? "bg-neutral-900" : "bg-white"} ${menuOpen ? "-translate-y-2 -rotate-45" : ""}`}
          />
        </button>
      </div>

      {menuOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setMenuOpen(false)}
          />
          <div
            className={`relative z-50 mx-auto mt-2 max-w-[calc(100vw-2rem)] rounded-2xl border p-6 shadow-lg transition-all duration-300 ${mobileBg} ${mobileText}`}
          >
            <div className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={`text-base font-medium transition-colors duration-200 ${linkHover}`}
                >
                  {item.name}
                </Link>
              ))}
              <Button
                isprimary={true}
                onClick={() => {
                  setMenuOpen(false);
                  alert("Get Started clicked");
                }}
              >
                Get Started
              </Button>
            </div>
          </div>
        </>
      )}
    </nav>
  );
}
