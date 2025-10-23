export type Crumb = { label: string; href?: string };


type RouteConfig = {
  pattern: string;
  crumbs: (params: Record<string, string>) => Crumb[] | Promise<Crumb[]>;
};

export const ROUTES: RouteConfig[] = [
  {
    pattern: "/dashboard",
    crumbs: () => [{ label: "แดชบอร์ด" }],
  },
  {
    pattern: "/reports",
    crumbs: () => [{ label: "รายงาน" }],
  },
  {
    pattern: "/warehouse/[id]",
    crumbs: (params) => [
      { label: "คลังสินค้า" },
      { label: params.id },
    ],
  },
  {
    pattern: "/staff",
    crumbs: () => [{ label: "เจ้าหน้าที่" }],
  },
  {
    pattern: "/order",
    crumbs: () => [{ label: "ออเดอร์", href: "/order" }],
  },
  {
    pattern: "/staff/warehouse_management",
    crumbs: () => [
      { label: "เจ้าหน้าที่", href: "/warehouse_management" },
      { label: "เพิ่มรายการ" },
    ],
  },
  {
    pattern: "/staff/product-outbound",
    crumbs: () => [
      { label: "เจ้าหน้าที่", href: "/product-outbound" },
      { label: "สินค้าออก" },
    ],
  },
  {
    pattern: "/order",
    crumbs: () => [{ label: "ออเดอร์", href: "/order" }],
  },
  {
    pattern: "/user_management",
    crumbs: () => [{ label: "จัดการผู้ใช้", href: "/user_management" }],
  },
  {
    pattern: "/user_management/add_user",
    crumbs: () => [
      { label: "จัดการผู้ใช้", href: "/user_management" },
      { label: "เพิ่มผู้ใช้" },
    ],
  },
  {
    pattern: "/product_management/add_product",
    crumbs: () => [
      { label: "จัดการสินค้า", href: "/product_management" },
      { label: "เพิ่มสินค้า" },
    ],
  },
    {
    pattern: "/product_management",
    crumbs: () => [{ label: "จัดการสินค้า", href: "/product_management" }],
  },
  {
    pattern: "/product_management/edit_product/[id]",
    crumbs: (params) => [
      { label: "จัดการสินค้า", href: "/product_management" },
      { label: "เเก้ไขสินค้า",href: "/product_management"},
      { label: params.id },
    ],
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
