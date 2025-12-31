import POSLayout from "@/components/POSLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { AlertCircle, Check } from "lucide-react";
import { toast } from "sonner";

export default function Alerts() {
  const utils = trpc.useUtils();
  const { data: alerts, isLoading } = trpc.alerts.getUnsent.useQuery();

  const markAsSentMutation = trpc.alerts.markAsSent.useMutation({
    onSuccess: () => {
      toast.success("Alerta marcado como enviado!");
      utils.alerts.getUnsent.invalidate();
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const handleMarkAsSent = (alertId: number) => {
    markAsSentMutation.mutate({ alertId });
  };

  return (
    <POSLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Alertas de Estoque</h1>
          <p className="text-muted-foreground">
            Produtos que atingiram o estoque mínimo
          </p>
        </div>

        <Card className="shadow-nordic">
          <CardHeader>
            <CardTitle>Alertas Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-muted-foreground">Carregando alertas...</p>
              </div>
            ) : alerts && alerts.length > 0 ? (
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-center justify-between p-4 bg-destructive/10 border border-destructive/30 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <AlertCircle className="w-8 h-8 text-destructive" />
                      <div>
                        <p className="font-semibold text-lg">{alert.productName}</p>
                        <p className="text-sm text-muted-foreground">
                          Estoque atual: {alert.stockQuantity} un. (Mínimo: {alert.minStockQuantity} un.)
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Alerta gerado em: {new Date(alert.alertDate).toLocaleString("pt-BR")}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => handleMarkAsSent(alert.id)}
                      disabled={markAsSentMutation.isPending}
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Marcar como Enviado
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhum alerta pendente</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </POSLayout>
  );
}
