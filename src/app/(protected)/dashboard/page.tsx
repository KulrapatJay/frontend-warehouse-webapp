"use client";

import KpiCards from "@/components/dashboard/KpiCards";
import TotalSalesChart from "@/components/dashboard/TotalSalesChart";
import TopProductsChart from "@/components/dashboard/TopProductsChart";

export default function DashboardPage() {
  
  const recentOrdersData = [
    {
      id: "#5678",
      customer: "Floyd Miles",
      product: "ครัวซอง",
      total: "$155.00",
      status: "เสร็จสิ้น",
    },
    {
      id: "#5679",
      customer: "Leslie Alexander",
      product: "คุกกี้",
      total: "$1,250.00",
      status: "กำลังดำเนินการ",
    },
    {
      id: "#5680",
      customer: "Darlene Robertson",
      product: "พาย",
      total: "$25.00",
      status: "ยกเลิก",
    },
    // --- 6 รายการที่เพิ่มเข้ามาใหม่ ---
    {
      id: "#5681",
      customer: "Jane Cooper",
      product: "คุกกี้",
      total: "$88.00",
      status: "เสร็จสิ้น",
    },
    {
      id: "#5682",
      customer: "Ronald Richards",
      product: "พาย",
      total: "$32.50",
      status: "เสร็จสิ้น",
    },
    {
      id: "#5683",
      customer: "Jacob Jones",
      product: "ครัวซอง",
      total: "$240.00",
      status: "กำลังดำเนินการ",
    },
    {
      id: "#5684",
      customer: "Esther Howard",
      product: "คุกกี้",
      total: "$1,500.00",
      status: "เสร็จสิ้น",
    },
    {
      id: "#5685",
      customer: "Robert Fox",
      product: "พาย",
      total: "$45.00",
      status: "ยกเลิก",
    },
    {
      id: "#5686",
      customer: "Jenny Wilson",
      product: "ครัวซอง",
      total: "$180.00",
      status: "กำลังดำเนินการ",
    },
  ];

  return (
    <div className="space-y-6">
      
      <section>
        <KpiCards />
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2">
          <TotalSalesChart />
        </div>
        <div>
          <TopProductsChart />
        </div>
      </section>

      <section className="card bg-base-100 border border-base-300">
        <div className="card-body p-5">
          <h3 className="card-title text-base">คำสั่งซื้อล่าสุด</h3>
          <div className="overflow-x-auto mt-3">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>รหัสสินค้า</th>
                  <th>ลูกค้า</th>
                  <th>สินค้า</th>
                  <th>ราคา</th>
                  <th>สถานะ</th>
                </tr>
              </thead>
              <tbody>
                {recentOrdersData.map((o) => (
                  <tr key={o.id}>
                    <td>{o.id}</td>
                    <td>{o.customer}</td>
                    <td>{o.product}</td>
                    <td>{o.total}</td>
                    <td>
                      <span
                        className={`badge w-32 justify-center ${
                          o.status === "เสร็จสิ้น"
                            ? "badge-success"
                            : o.status === "กำลังดำเนินการ"
                            ? "badge-warning"
                            : "badge-error"
                        }`}
                      >
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}