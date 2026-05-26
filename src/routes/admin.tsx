import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useAuth } from "../hooks/use-auth";
import { 
  ShieldAlert,
  LayoutDashboard,
  FileWarning,
  Bell
} from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/admin")({
  beforeLoad: async ({ location }) => {
    // Client-side check for now
    if (typeof window !== 'undefined') {
      const auth = useAuth.getState();
      if (!auth.token || !auth.user?.is_admin) {
        throw redirect({
          to: '/auth/login',
          search: {
            redirect: location.href,
          },
        });
      }
    }
  },
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-muted/20">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-background hidden md:block">
        <div className="p-6 border-b flex items-center gap-3">
          <div className="bg-primary text-primary-foreground p-2 rounded-lg">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <span className="font-bold text-xl">Admin</span>
        </div>
        <nav className="p-4 space-y-2">
          <Link 
            to="/admin" 
            className="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-muted transition-colors text-sm font-medium"
            activeProps={{ className: 'bg-primary/10 text-primary' }}
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
          <Link 
            to="/admin/reports" 
            className="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-muted transition-colors text-sm font-medium"
            activeProps={{ className: 'bg-primary/10 text-primary' }}
          >
            <FileWarning className="h-4 w-4" />
            Drug Reports
          </Link>
          <Link 
            to="/admin/alerts" 
            className="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-muted transition-colors text-sm font-medium"
            activeProps={{ className: 'bg-primary/10 text-primary' }}
          >
            <Bell className="h-4 w-4" />
            Safety Alerts
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b bg-background flex items-center justify-between px-8 md:hidden">
            <div className="flex items-center gap-2">
               <ShieldAlert className="h-6 w-6 text-primary" />
               <span className="font-bold">Admin Panel</span>
            </div>
            {/* Mobile menu could go here */}
        </header>
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
