import POSLayout from "@/components/POSLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Printer, Download, ArrowLeft } from "lucide-react";
import { useRoute, useLocation } from "wouter";
import { useRef } from "react";

export default function Receipt() {
  const [, params] = useRoute("/receipt/:saleCode");
  const [, setLocation] = useLocation();
  const receiptRef = useRef<HTMLDivElement>(null);

  const { data: sale, isLoading } = trpc.sales.getBySaleCode.useQuery(
    { saleCode: params?.saleCode || "" },
    { enabled: !!params?.saleCode }
  );

  const { data: storeSettings } = trpc.store.getSettings.useQuery();

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    // For now, use browser print to PDF
    // In production, implement server-side PDF generation
    window.print();
  };

  if (isLoading) {
    return (
      <POSLayout>
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando cupom...</p>
        </div>
      </POSLayout>
    );
  }

  if (!sale) {
    return (
      <POSLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Cupom não encontrado</p>
          <Button onClick={() => setLocation("/pos")}>Voltar ao PDV</Button>
        </div>
      </POSLayout>
    );
  }

  const saleDate = new Date(sale.saleDate);

  return (
    <POSLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between print:hidden">
          <Button variant="outline" onClick={() => setLocation("/pos")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao PDV
          </Button>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleDownloadPDF}>
              <Download className="w-4 h-4 mr-2" />
              Baixar PDF
            </Button>
            <Button onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" />
              Imprimir
            </Button>
          </div>
        </div>

        <Card className="max-w-2xl mx-auto shadow-nordic-lg">
          <CardContent className="p-8" ref={receiptRef}>
            {/* Receipt Content */}
            <div className="space-y-6 font-mono text-sm">
              {/* Header */}
              <div className="text-center border-b-2 border-dashed pb-4">
                <h1 className="text-2xl font-bold mb-2">
                  {storeSettings?.companyName || "MODERN HOUSE"}
                </h1>
                <p className="text-xs">
                  {storeSettings?.cnpjCpf || "CNPJ: 00.000.000/0000-00"}
                </p>
                <p className="text-xs">
                  {storeSettings?.address || "Endereço não cadastrado"}
                </p>
                {storeSettings?.phone && (
                  <p className="text-xs">Tel: {storeSettings.phone}</p>
                )}
              </div>

              {/* Sale Info */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>CUPOM NÃO FISCAL</span>
                </div>
                <div className="flex justify-between">
                  <span>Código da Venda:</span>
                  <span className="font-bold">{sale.saleCode}</span>
                </div>
                <div className="flex justify-between">
                  <span>Data/Hora:</span>
                  <span>
                    {saleDate.toLocaleDateString("pt-BR")} {saleDate.toLocaleTimeString("pt-BR")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Vendedor:</span>
                  <span>{sale.sellerId}</span>
                </div>
              </div>

              {/* Items */}
              <div className="border-t-2 border-b-2 border-dashed py-4">
                <div className="mb-2 font-bold">
                  <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-6">PRODUTO</div>
                    <div className="col-span-2 text-right">QTD</div>
                    <div className="col-span-2 text-right">UNIT</div>
                    <div className="col-span-2 text-right">TOTAL</div>
                  </div>
                </div>
                {sale.items.map((item, index) => (
                  <div key={index} className="mb-2">
                    <div className="grid grid-cols-12 gap-2">
                      <div className="col-span-6 truncate">{item.productName}</div>
                      <div className="col-span-2 text-right">{item.quantity}</div>
                      <div className="col-span-2 text-right">
                        {parseFloat(item.unitPrice).toFixed(2)}
                      </div>
                      <div className="col-span-2 text-right">
                        {parseFloat(item.totalPrice).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-2">
                <div className="flex justify-between text-lg font-bold">
                  <span>TOTAL:</span>
                  <span>R$ {parseFloat(sale.totalAmount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Forma de Pagamento:</span>
                  <span className="capitalize">
                    {sale.paymentMethod === "cash"
                      ? "Espécie"
                      : sale.paymentMethod === "pix"
                      ? "Pix"
                      : sale.paymentMethod === "debit"
                      ? "Débito"
                      : "Crédito"}
                  </span>
                </div>
                {sale.paymentMethod === "cash" && sale.amountPaid && (
                  <>
                    <div className="flex justify-between">
                      <span>Valor Recebido:</span>
                      <span>R$ {parseFloat(sale.amountPaid).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Troco:</span>
                      <span>R$ {parseFloat(sale.changeAmount || "0").toFixed(2)}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="text-center border-t-2 border-dashed pt-4 text-xs">
                <p>OBRIGADO PELA PREFERÊNCIA!</p>
                <p className="mt-2">Modern House - Sistema de Vendas</p>
                <p className="mt-1">Este não é um documento fiscal</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:hidden {
            display: none !important;
          }
          ${receiptRef.current ? `
            #root, #root * {
              visibility: visible;
            }
            ${receiptRef.current.outerHTML} {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
          ` : ''}
        }
      `}</style>
    </POSLayout>
  );
}
