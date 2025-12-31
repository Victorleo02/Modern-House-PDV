import POSLayout from "@/components/POSLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { TrendingUp, Calendar, DollarSign, ShoppingCart } from "lucide-react";
import { useState } from "react";

type PeriodType = "today" | "week" | "month" | "year" | "custom";

export default function Reports() {
  const [periodType, setPeriodType] = useState<PeriodType>("today");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const getDateRange = () => {
    const now = new Date();
    let start = new Date();
    let end = new Date();

    switch (periodType) {
      case "today":
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case "week":
        start.setDate(now.getDate() - 7);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case "month":
        start.setMonth(now.getMonth() - 1);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case "year":
        start.setFullYear(now.getFullYear() - 1);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case "custom":
        if (startDate && endDate) {
          start = new Date(startDate);
          end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
        }
        break;
    }

    return { startDate: start, endDate: end };
  };

  const { startDate: queryStart, endDate: queryEnd } = getDateRange();

  const { data: sales, isLoading } = trpc.sales.getAll.useQuery({
    startDate: queryStart,
    endDate: queryEnd,
  });

  const totalSales = sales?.length || 0;
  const totalRevenue = sales?.reduce((sum, sale) => sum + parseFloat(sale.totalAmount), 0) || 0;

  const salesByPaymentMethod = sales?.reduce((acc, sale) => {
    const method = sale.paymentMethod;
    if (!acc[method]) {
      acc[method] = { count: 0, total: 0 };
    }
    acc[method].count++;
    acc[method].total += parseFloat(sale.totalAmount);
    return acc;
  }, {} as Record<string, { count: number; total: number }>);

  const salesBySeller = sales?.reduce((acc, sale) => {
    const sellerName = sale.sellerName || "Desconhecido";
    if (!acc[sellerName]) {
      acc[sellerName] = { count: 0, total: 0 };
    }
    acc[sellerName].count++;
    acc[sellerName].total += parseFloat(sale.totalAmount);
    return acc;
  }, {} as Record<string, { count: number; total: number }>);

  const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0;

  return (
    <POSLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Relatórios de Vendas</h1>
          <p className="text-muted-foreground">
            Análise detalhada de desempenho de vendas
          </p>
        </div>

        <Card className="shadow-nordic">
          <CardHeader>
            <CardTitle>Período de Análise</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="periodType">Tipo de Período</Label>
                <Select
                  value={periodType}
                  onValueChange={(value: PeriodType) => setPeriodType(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Hoje</SelectItem>
                    <SelectItem value="week">Últimos 7 dias</SelectItem>
                    <SelectItem value="month">Último mês</SelectItem>
                    <SelectItem value="year">Último ano</SelectItem>
                    <SelectItem value="custom">Personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {periodType === "custom" && (
                <>
                  <div>
                    <Label htmlFor="startDate">Data Inicial</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">Data Final</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando relatórios...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="shadow-nordic">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total de Vendas
                  </CardTitle>
                  <ShoppingCart className="w-5 h-5 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{totalSales}</div>
                </CardContent>
              </Card>

              <Card className="shadow-nordic">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Receita Total
                  </CardTitle>
                  <DollarSign className="w-5 h-5 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">R$ {totalRevenue.toFixed(2)}</div>
                </CardContent>
              </Card>

              <Card className="shadow-nordic">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Ticket Médio
                  </CardTitle>
                  <TrendingUp className="w-5 h-5 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">R$ {averageTicket.toFixed(2)}</div>
                </CardContent>
              </Card>

              <Card className="shadow-nordic">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Período
                  </CardTitle>
                  <Calendar className="w-5 h-5 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-sm font-semibold">
                    {periodType === "today"
                      ? "Hoje"
                      : periodType === "week"
                      ? "7 dias"
                      : periodType === "month"
                      ? "30 dias"
                      : periodType === "year"
                      ? "1 ano"
                      : "Personalizado"}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-nordic">
                <CardHeader>
                  <CardTitle>Vendas por Forma de Pagamento</CardTitle>
                </CardHeader>
                <CardContent>
                  {salesByPaymentMethod && Object.keys(salesByPaymentMethod).length > 0 ? (
                    <div className="space-y-4">
                      {Object.entries(salesByPaymentMethod).map(([method, data]) => (
                        <div
                          key={method}
                          className="flex items-center justify-between p-4 bg-muted/30 rounded-lg"
                        >
                          <div>
                            <p className="text-sm text-muted-foreground">
                          {method === "cash" ? "Espécie" : method === "pix" ? "Pix" : method === "debit" ? "Débito" : "Crédito"}                            </p>
                            <p className="text-sm text-muted-foreground">
                              {data.count} vendas
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold">R$ {data.total.toFixed(2)}</p>
                            <p className="text-sm text-muted-foreground">
                              {((data.total / totalRevenue) * 100).toFixed(1)}%
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      Nenhuma venda no período
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-nordic">
                <CardHeader>
                  <CardTitle>Desempenho por Vendedor</CardTitle>
                </CardHeader>
                <CardContent>
                  {salesBySeller && Object.keys(salesBySeller).length > 0 ? (
                    <div className="space-y-4">
                      {Object.entries(salesBySeller)
                        .sort((a, b) => b[1].total - a[1].total)
                        .map(([seller, data]) => (
                          <div
                            key={seller}
                            className="flex items-center justify-between p-4 bg-muted/30 rounded-lg"
                          >
                            <div>
                              <p className="font-semibold">{seller}</p>
                              <p className="text-sm text-muted-foreground">
                                {data.count} vendas
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold">R$ {data.total.toFixed(2)}</p>
                              <p className="text-sm text-muted-foreground">
                                {((data.total / totalRevenue) * 100).toFixed(1)}%
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      Nenhuma venda no período
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card className="shadow-nordic">
              <CardHeader>
                <CardTitle>Histórico de Vendas</CardTitle>
              </CardHeader>
              <CardContent>
                {sales && sales.length > 0 ? (
                  <div className="space-y-3">
                    {sales.slice(0, 20).map((sale) => (
                      <div
                        key={sale.id}
                        className="flex items-center justify-between p-4 bg-muted/30 rounded-lg"
                      >
                        <div>
                          <p className="font-semibold">{sale.saleCode}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(sale.saleDate).toLocaleString("pt-BR")}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Vendedor: {sale.sellerName || "N/A"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold">R$ {sale.totalAmount}</p>
                          <p className="text-sm text-muted-foreground capitalize">
                            {sale.paymentMethod === "cash"
                              ? "Espécie"
                              : sale.paymentMethod === "debit"
                              ? "Débito"
                              : "Crédito"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhuma venda no período selecionado
                  </p>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </POSLayout>
  );
}
