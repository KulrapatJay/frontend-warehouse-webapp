"use client";

export default function KpiCards() {
  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const formatDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const todayFormatted = formatDate(today);
  const dateRange = `${formatDate(thirtyDaysAgo)} - ${todayFormatted}`;

  const kpiData = [
    {
      title: "ยอดขายรวม",
      subtitle: dateRange,
      value: "$12,450.54",
      change: "+29.7%",
    },
    {
      title: "ยอดคำสั่งซื้อวันนี้",
      subtitle: todayFormatted,
      value: "650",
      change: "+30.1%",
    },
    {
      title: "ยอดขายวันนี้",
      subtitle: todayFormatted,
      value: "95",
      change: "+25.3%",
    },
    {
      title: "สต๊อกทั้งหมด",
      subtitle: dateRange,
      value: "10",
      change: "-10.2%",
      down: true,
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
      {kpiData.map((kpi) => (
        <div
          key={kpi.title}
          className="card bg-base-100 border border-base-300"
        >
          <div className="card-body p-5">
            <h3 className="text-sm opacity-70">{kpi.title}</h3>
            <div className="flex items-end justify-between">
              <p className="text-2xl font-bold">{kpi.value}</p>
              <span
                className={`text-xs ${
                  kpi.down ? "text-error" : "text-success"
                }`}
              >
                {kpi.change}
              </span>
            </div>
            <p className="text-xs opacity-50 mt-1">{kpi.subtitle}</p>
          </div>
        </div>
      ))}
    </div>
  );
}