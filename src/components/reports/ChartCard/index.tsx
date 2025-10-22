import React from "react";

const tileBase = "rounded-xl bg-base-100 shadow";

// START: ส่วนที่แก้ไข
function ChartCard({
  title,
  amount,
  headerRightContent, // เปลี่ยนจาก badge
  children,
  change,
  down = false,
  subtitle,
}: {
  title: string;
  amount: string;
  headerRightContent?: React.ReactNode; // เปลี่ยนจาก badge และกำหนด Type ให้ยืดหยุ่น
  children: React.ReactNode;
  change?: string;
  down?: boolean;
  subtitle?: string;
}) {
// END: ส่วนที่แก้ไข
  return (
    <div className={`${tileBase} p-4`}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-base-content/90">{title}</h3>
        {/* แสดงผล Component ที่ส่งเข้ามาแทนที่ badge เดิม */}
        {headerRightContent}
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