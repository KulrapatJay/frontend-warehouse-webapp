"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Crumb, generateBreadcrumbs } from "@/utils/breadcrumbs";

export function useBreadcrumbs() {
  const pathname = usePathname();
  const [crumbs, setCrumbs] = useState<Crumb[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const c = await generateBreadcrumbs(pathname || "/");
      if (!cancelled) setCrumbs(c);
    })();
    return () => { cancelled = true; };
  }, [pathname]);

  return crumbs;
}
