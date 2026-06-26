import Sidebar from "@/shared/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <Sidebar />
      <main className="flex-1 flex flex-col p-8 overflow-hidden">
        {children}
      </main>
    </div>
  );
}
