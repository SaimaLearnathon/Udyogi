import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-base-200 text-base-content">
      <div className="mx-auto flex min-h-screen max-w-7xl">
        <Sidebar />
        <main className="min-w-0 flex-1 p-4 pb-24 md:p-8">{children}</main>
      </div>
      <MobileNav />
    </div>
  );
}
