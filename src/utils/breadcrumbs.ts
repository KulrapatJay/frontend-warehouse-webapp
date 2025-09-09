export type Crumb = { label: string; href?: string };


type RouteConfig = {
  pattern: string;
  crumbs: (params: Record<string, string>) => Crumb[] | Promise<Crumb[]>;
};

export const ROUTES: RouteConfig[] = [
  {
    pattern: "/dashboard",
    crumbs: () => [{ label: "Dashboard" }],
  },
  {
    pattern: "/reports",
    crumbs: () => [{ label: "Reports" }],
  },
  {
    pattern: "/warehouse/[id]",
    crumbs: (params) => [
      { label: "Warehouse" },
      { label: params.id },
    ],
  },
  {
    pattern: "/user_management",
    crumbs: () => [{ label: "User management", href: "/user_management" }],
  },
  {
    pattern: "/user_management/add_user",
    crumbs: () => [
      { label: "User management", href: "/user_management" },
      { label: "Add user" },
    ],
  },
    {
    pattern: "/product_management",
    crumbs: () => [{ label: "Product management", href: "/product_management" }],
  },
];

/** แตก path เป็น segment และดึงพารามิเตอร์ตาม pattern */
function matchPattern(
  pattern: string,
  pathname: string
): null | { params: Record<string, string> } {
  const pSeg = pattern.split("/").filter(Boolean);
  const aSeg = pathname.split("/").filter(Boolean);
  if (pSeg.length !== aSeg.length) return null;

  const params: Record<string, string> = {};
  for (let i = 0; i < pSeg.length; i++) {
    const p = pSeg[i];
    const a = aSeg[i];
    if (p.startsWith("[") && p.endsWith("]")) {
      const key = p.slice(1, -1);
      params[key] = decodeURIComponent(a);
    } else if (p !== a) {
      return null;
    }
  }
  return { params };
}

/** คืน breadcrumb ตาม ROUTES ที่ match pathname แรกที่เจอ */
export async function generateBreadcrumbs(pathname: string): Promise<Crumb[]> {
  for (const route of ROUTES) {
    const matched = matchPattern(route.pattern, pathname);
    if (matched) {
      const out = await route.crumbs(matched.params);
      return out;
    }
  }
  // ถ้าไม่ match อะไรเลย: สร้างจาก path แบบ generic
  const segs = pathname.split("/").filter(Boolean);
  const crumbs: Crumb[] = [];
  let acc = "";
  for (let i = 0; i < segs.length; i++) {
    acc += `/${segs[i]}`;
    const isLast = i === segs.length - 1;
    const label = segs[i].replace(/[-_]/g, " ");
    if (!isLast) crumbs.push({ label, href: acc });
    else crumbs.push({ label });
  }
  return crumbs;
}
