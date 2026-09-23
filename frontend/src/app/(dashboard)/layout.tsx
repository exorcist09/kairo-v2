import Sidebar from "@/shared/Sidebar";
import KaiAssistant from "@/shared/KaiAssistant";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-white relative">
      <Sidebar />
      <main className="flex-1 flex flex-col p-8 overflow-hidden relative">
        {children}
      </main>
      {/* Floating AI Assistant Kai */}
      <KaiAssistant />
    </div>
  );
}
