import Sidebar from "@/components/dashboard/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 min-w-0 lg:p-8 p-4 pt-20 lg:pt-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
