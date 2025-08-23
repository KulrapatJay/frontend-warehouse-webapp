"use client";

import { Toaster } from "react-hot-toast";
import { useEffect, useState } from "react";

export default function CustomToaster() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const root = document.documentElement;

    const syncTheme = () => {
      const domTheme = root.getAttribute("data-theme") as "light" | "dark" | null;
      const stored = localStorage.getItem("theme") as "light" | "dark" | null;
      setTheme(domTheme || stored || "light");
    };

    syncTheme();
    const obs = new MutationObserver(syncTheme);
    obs.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    const onStorage = (e: StorageEvent) => { if (e.key === "theme") syncTheme(); };
    window.addEventListener("storage", onStorage);

    return () => { obs.disconnect(); window.removeEventListener("storage", onStorage); };
  }, []);

  return (
    <Toaster
      position="top-center"
      toastOptions={{
        style: {
          background: theme === "dark" ? "#1f2937" : "white", // dark = gray-800, light = white
          color: theme === "dark" ? "white" : "black",
          border: "1px solid #e5e7eb",
        },
        success: {
          iconTheme: {
            primary: "#22c55e",
            secondary: "#fff",
          },
        },
        error: {
          iconTheme: {
            primary: "#ef4444",
            secondary: "#fff",
          },
        },
      }}
    />
  );
}
