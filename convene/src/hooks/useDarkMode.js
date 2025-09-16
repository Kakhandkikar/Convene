import { useEffect, useState } from "react";

export default function useDarkMode() {
  // Detect initial theme before rendering
  const getInitialTheme = () => {
    if (typeof window === "undefined") return "light";
    const stored = localStorage.getItem("theme");
    if (stored) return stored;
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    return prefersDark ? "dark" : "light";
  };

  const [theme, setTheme] = useState(getInitialTheme);

  // Apply theme to <html> and save
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Watch for system changes (only if user hasn’t manually chosen)
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => {
      if (!localStorage.getItem("theme")) {
        setTheme(e.matches ? "dark" : "light");
      }
    };
    if (mq.addEventListener) {
      mq.addEventListener("change", handler);
    } else {
      mq.addListener(handler); // fallback for Safari/Firefox
    }
    return () => {
      if (mq.removeEventListener) {
        mq.removeEventListener("change", handler);
      } else {
        mq.removeListener(handler);
      }
    };
  }, []);

  const toggle = () => {
    // Clear storage if user wants to "follow system"
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  };

  return { theme, setTheme, toggle };
}
