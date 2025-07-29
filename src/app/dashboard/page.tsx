import Sidebar from "@/components/common/Sidebar"; 

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 p-8 overflow-y-auto">
            {children}
            Dashboard
        </main>
    </div>
  );
}