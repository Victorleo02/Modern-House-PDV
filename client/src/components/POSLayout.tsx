import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  FileText,
  Users,
  Settings,
  LogOut,
  TrendingUp,
  AlertCircle,
  Store,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useEffect } from "react";

interface POSLayoutProps {
  children: React.ReactNode;
}

export default function POSLayout({ children }: POSLayoutProps) {
  const { user, loading, isAuthenticated } = useAuth();
  const [location] = useLocation();
  const logoutMutation = trpc.auth.logout.useMutation();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.href = getLoginUrl();
    }
  }, [loading, isAuthenticated]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    window.location.href = getLoginUrl();
  };

  const isAdmin = user?.role === "admin";

  const navItems = [
    { href: "/", icon: LayoutDashboard, label: "Dashboard", admin: false },
    { href: "/pos", icon: ShoppingCart, label: "Ponto de Venda", admin: false },
    { href: "/products", icon: Package, label: "Produtos", admin: true },
    { href: "/suppliers", icon: Store, label: "Fornecedores", admin: true },
    { href: "/invoices", icon: FileText, label: "Notas Fiscais", admin: true },
    { href: "/reports", icon: TrendingUp, label: "Relatórios", admin: true },
    { href: "/sellers", icon: Users, label: "Vendedores", admin: true },
    { href: "/alerts", icon: AlertCircle, label: "Alertas", admin: true },
    { href: "/settings", icon: Settings, label: "Configurações", admin: true },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Geometric shapes for Scandinavian design */}
      <div className="geometric-shape shape-blue w-96 h-96 -top-48 -right-48"></div>
      <div className="geometric-shape shape-pink w-64 h-64 top-1/3 -left-32"></div>
      <div className="geometric-shape shape-blue w-80 h-80 bottom-0 right-1/4"></div>

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-card shadow-nordic-lg border-r border-border z-50">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Store className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Modern House</h1>
              <p className="text-xs text-muted-foreground">Sistema PDV</p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            if (item.admin && !isAdmin) return null;
            
            const isActive = location === item.href;
            const Icon = item.icon;

            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors cursor-pointer ${
                    isActive
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border bg-card">
          <div className="mb-3 px-2">
            <p className="text-sm font-semibold">{user?.name || "Usuário"}</p>
            <p className="text-xs text-muted-foreground">
              {isAdmin ? "Administrador" : "Vendedor"}
              {user?.sellerCode && ` • ${user.sellerCode}`}
            </p>
          </div>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-64 min-h-screen">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}

