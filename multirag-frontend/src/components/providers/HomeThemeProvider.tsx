"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

type Theme = "dark" | "light";

interface HomeThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  isHomePage: boolean;
}

const HomeThemeContext = createContext<HomeThemeContextValue>({
  theme: "dark",
  toggleTheme: () => {},
  isHomePage: false,
});

export const useHomeTheme = () => useContext(HomeThemeContext);

export default function HomeThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("home_theme") as Theme | null;
      if (saved === "light" || saved === "dark") {
        setTheme(saved);
      }
    } catch {}
  }, []);

  useEffect(() => {
    const body = document.body;
    if (theme === "light") {
      body.classList.add("light-theme");
    } else {
      body.classList.remove("light-theme");
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      try {
        localStorage.setItem("home_theme", next);
      } catch {}
      return next;
    });
  };

  return (
    <HomeThemeContext.Provider value={{ theme, toggleTheme, isHomePage }}>
      {children}
    </HomeThemeContext.Provider>
  );
}
