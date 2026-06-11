"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Button from "../ui/Button";
import { useHomeTheme } from "../providers/HomeThemeProvider";
import { SunIcon, MoonIcon } from "../ui/ThemeIcons";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const pathname = usePathname();
  const { theme, toggleTheme, isHomePage } = useHomeTheme();

  const isDashboard = pathname.startsWith("/dashboard");

  useEffect(() => {
    setToken(localStorage.getItem("token"));
  }, []);

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

  const authNavItems = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Manage Bots", href: "/dashboard/manage-bots" },
  ];

  const publicNavItems = [
    { name: "Home", href: "/" },
    { name: "Features", href: "/features" },
    { name: "Pricing", href: "/pricing" },
    { name: "Contact", href: "/contact" },
  ];

  const navItems = token ? authNavItems : publicNavItems;

  const isHomeLight = isHomePage && theme === "light";

  const navText = isDashboard
    ? "text-white"
    : isHomeLight
      ? "text-neutral-900"
      : scrolled
        ? "text-neutral-900"
        : "text-white";

  const navBg = isDashboard
    ? "bg-neutral-900/80 backdrop-blur-2xl border-white/10 shadow-black/20"
    : isHomeLight || scrolled
      ? "bg-white/80 backdrop-blur-2xl border-white/20 shadow-black/5"
      : "bg-neutral-900/60 backdrop-blur-2xl border-white/10 shadow-black/20";

  const mobileBg = isDashboard
    ? "bg-neutral-900/95 backdrop-blur-2xl border-white/10"
    : isHomeLight || scrolled
      ? "bg-white/95 backdrop-blur-2xl border-white/20"
      : "bg-neutral-900/90 backdrop-blur-2xl border-white/10";

  const mobileText = isDashboard
    ? "text-white"
    : isHomeLight
      ? "text-neutral-900"
      : scrolled
        ? "text-neutral-900"
        : "text-white";

  const linkHover = token
    ? "hover:text-blue-400"
    : scrolled
      ? "hover:text-blue-500"
      : "hover:text-blue-400";

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setMenuOpen(false);
    window.location.href = "/";
  };

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${navText}`}
    >
      <div
        className={`max-w-7xl mx-4 md:mx-auto mt-4 px-4 py-3 rounded-full flex justify-between items-center border shadow-lg transition-all duration-300 ${navBg}`}
      >
        <div className="text-xl font-bold">
          <Link href={token ? "/dashboard" : "/"}>Botify</Link>
        </div>

        <div className="hidden md:flex items-center space-x-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`transition-colors duration-200 ${linkHover} ${isActive ? "text-blue-400" : ""}`}
              >
                {item.name}
              </Link>
            );
          })}
          {isHomePage && (
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors duration-200 ${theme === "light" ? "text-amber-500 hover:bg-amber-500/10" : "text-amber-400 hover:bg-amber-400/10"}`}
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
            >
              {theme === "dark" ? <SunIcon /> : <MoonIcon />}
            </button>
          )}
          {token ? (
            <button
              onClick={handleLogout}
              className={`transition-colors duration-200 ${linkHover}`}
            >
              Logout
            </button>
          ) : (
            <>
              <Link href="/login" className={`transition-colors duration-200 ${linkHover}`}>
                Login
              </Link>
              <Link href="/register">
                <Button isprimary={true}>Register</Button>
              </Link>
            </>
          )}
        </div>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden flex flex-col gap-1.5 p-2"
          aria-label="Toggle menu"
        >
          <span
            className={`block h-0.5 w-5 rounded transition-all duration-300 ${navText.includes("900") ? "bg-neutral-900" : "bg-white"} ${menuOpen ? "translate-y-2 rotate-45" : ""}`}
          />
          <span
            className={`block h-0.5 w-5 rounded transition-all duration-300 ${navText.includes("900") ? "bg-neutral-900" : "bg-white"} ${menuOpen ? "opacity-0" : ""}`}
          />
          <span
            className={`block h-0.5 w-5 rounded transition-all duration-300 ${navText.includes("900") ? "bg-neutral-900" : "bg-white"} ${menuOpen ? "-translate-y-2 -rotate-45" : ""}`}
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
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={`text-base font-medium transition-colors duration-200 ${linkHover} ${isActive ? "text-blue-400" : ""}`}
                  >
                    {item.name}
                  </Link>
                );
              })}
              {isHomePage && (
                <button
                  onClick={() => { toggleTheme(); setMenuOpen(false); }}
                  className={`text-base font-medium transition-colors duration-200 flex items-center gap-2 ${linkHover}`}
                >
                  {theme === "dark" ? <><SunIcon /> Light mode</> : <><MoonIcon /> Dark mode</>}
                </button>
              )}
              {token ? (
                <button
                  onClick={handleLogout}
                  className={`text-base font-medium transition-colors duration-200 ${linkHover} text-left`}
                >
                  Logout
                </button>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMenuOpen(false)}
                    className={`text-base font-medium transition-colors duration-200 ${linkHover}`}
                  >
                    Login
                  </Link>
                  <Link href="/register" onClick={() => setMenuOpen(false)}>
                    <Button isprimary={true}>Register</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </nav>
  );
}
