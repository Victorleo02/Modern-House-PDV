import POSLayout from "@/components/POSLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Package, ShoppingCart, TrendingUp, AlertCircle } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";

export default function Dashboard() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const { data: products } = trpc.products.getAll.useQuery();
  const { data: lowStockProducts } = trpc.products.getLowStock.useQuery(undefined, {
    enabled: isAdmin,
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const { data: todaySales } = trpc.sales.getAll.useQuery({
    startDate: today,
    endDate: tomorrow,
  });

  const totalProducts = products?.length || 0;
  const lowStock = lowStockProducts?.length || 0;
  const todaySalesCount = todaySales?.length || 0;
  const todayRevenue = todaySales?.reduce((sum, sale) => sum + parseFloat(sale.totalAmount), 0) || 0;

  return (
    <POSLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Bem-vindo ao sistema de gestão Modern House
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="shadow-nordic">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Produtos Cadastrados
              </CardTitle>
              <Package className="w-5 h-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalProducts}</div>
            </CardContent>
          </Card>

          <Card className="shadow-nordic">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Vendas Hoje
              </CardTitle>
              <ShoppingCart className="w-5 h-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{todaySalesCount}</div>
            </CardContent>
          </Card>

          <Card className="shadow-nordic">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Receita Hoje
              </CardTitle>
              <TrendingUp className="w-5 h-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                R$ {todayRevenue.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          {isAdmin && (
            <Card className="shadow-nordic border-destructive/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Estoque Baixo
                </CardTitle>
                <AlertCircle className="w-5 h-5 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-destructive">{lowStock}</div>
              </CardContent>
            </Card>
          )}
        </div>

        {isAdmin && lowStockProducts && lowStockProducts.length > 0 && (
          <Card className="shadow-nordic">
            <CardHeader>
              <CardTitle>Produtos com Estoque Baixo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {lowStockProducts.slice(0, 5).map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div>
                      <p className="font-semibold">{product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Código: {product.barcode}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Estoque</p>
                      <p className="text-lg font-bold text-destructive">
                        {product.stockQuantity} un.
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {todaySales && todaySales.length > 0 && (
          <Card className="shadow-nordic">
            <CardHeader>
              <CardTitle>Últimas Vendas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {todaySales.slice(0, 5).map((sale) => (
                  <div
                    key={sale.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div>
                      <p className="font-semibold">{sale.saleCode}</p>
                      <p className="text-sm text-muted-foreground">
                        Vendedor: {sale.sellerName || "N/A"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">R$ {sale.totalAmount}</p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {sale.paymentMethod === "cash" ? "Espécie" : 
                         sale.paymentMethod === "debit" ? "Débito" : "Crédito"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </POSLayout>
  );
}
