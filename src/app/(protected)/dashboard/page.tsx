"use client";

// 1. นำเข้า (import) Component ที่แยกออกไป
import KpiCards from "@/components/dashboard/KpiCards";
import TotalSalesChart from "@/components/dashboard/TotalSalesChart";
import TopProductsChart from "@/components/dashboard/TopProductsChart";

export default function DashboardPage() {
  
  // ✨ ส่วนที่มีการเปลี่ยนแปลง (เพิ่มข้อมูลอีก 6 รายการ)
  const recentOrdersData = [
    {
      id: "#5678",
      customer: "Floyd Miles",
      product: "ครัวซอง",
      total: "$155.00",
      status: "Completed",
    },
    {
      id: "#5679",
      customer: "Leslie Alexander",
      product: "คุกกี้",
      total: "$1,250.00",
      status: "Processing",
    },
    {
      id: "#5680",
      customer: "Darlene Robertson",
      product: "พาย",
      total: "$25.00",
      status: "Cancelled",
    },
    // --- 6 รายการที่เพิ่มเข้ามาใหม่ ---
    {
      id: "#5681",
      customer: "Jane Cooper",
      product: "คุกกี้",
      total: "$88.00",
      status: "Completed",
    },
    {
      id: "#5682",
      customer: "Ronald Richards",
      product: "พาย",
      total: "$32.50",
      status: "Completed",
    },
    {
      id: "#5683",
      customer: "Jacob Jones",
      product: "ครัวซอง",
      total: "$240.00",
      status: "Processing",
    },
    {
      id: "#5684",
      customer: "Esther Howard",
      product: "คุกกี้",
      total: "$1,500.00",
      status: "Completed",
    },
    {
      id: "#5685",
      customer: "Robert Fox",
      product: "พาย",
      total: "$45.00",
      status: "Cancelled",
    },
    {
      id: "#5686",
      customer: "Jenny Wilson",
      product: "ครัวซอง",
      total: "$180.00",
      status: "Processing",
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
          <h3 className="card-title text-base">Recent Orders</h3>
          <div className="overflow-x-auto mt-3">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Product</th>
                  <th>Total</th>
                  <th>Status</th>
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
                        className={`badge ${
                          o.status === "Completed"
                            ? "badge-success"
                            : o.status === "Processing"
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