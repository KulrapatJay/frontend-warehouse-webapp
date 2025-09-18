import React from "react";

const tileBase = "rounded-xl bg-base-100 shadow";

function ChartCard({
  title,
  amount,
  badge,
  children,
  change,
  down = false,
  subtitle,
}: {
  title: string;
  amount: string;
  badge: "เดือน" | "สัปดาห์";
  children: React.ReactNode;
  change?: string;
  down?: boolean;
  subtitle?: string;
}) {
  return (
    <div className={`${tileBase} p-4`}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-base-content/90">{title}</h3>
        <span className="badge badge-ghost">{badge}</span>
      </div>
      <div className="flex items-end justify-between mt-2">
        <div className="flex items-center gap-2">
          <p className="text-2xl font-bold">{amount}</p>
          {change && (
             <span className={`flex items-center text-sm font-medium ${down ? "text-error" : "text-success"}`}>
               {down ? '↓' : '↑'} {change}
            </span>
          )}
        </div>
        {subtitle && <p className="text-xs text-base-content/50">{subtitle}</p>}
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

export default ChartCard;