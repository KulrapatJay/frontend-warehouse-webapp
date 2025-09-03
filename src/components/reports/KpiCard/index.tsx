import React from "react";

function KpiCard({
  title,
  value,
  subtitle,
  change,
  down = false,
}: {
  title: string;
  value: string;
  subtitle: string;
  change?: string;
  down?: boolean;
}) {
  return (
    <div className="card bg-base-100 shadow">
      <div className="card-body p-5">
        {/* ✅ ปรับแก้สีหัวข้อที่นี่ */}
        <h3 className="text-sm text-gray-400">{title}</h3>
        <div className="flex items-end justify-between mt-1">
          <p className="text-2xl font-bold">{value}</p>
          {change && (
            <span className={`text-xs font-medium ${down ? "text-error" : "text-success"}`}>
              {change}
            </span>
          )}
        </div>
        {/* ✅ ปรับแก้สีวันที่ที่นี่ */}
        <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
      </div>
    </div>
  );
}

export default KpiCard;