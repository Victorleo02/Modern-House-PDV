import POSLayout from "@/components/POSLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Plus, FileText, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface InvoiceItem {
  productId: number;
  productName: string;
  quantity: number;
  unitCost: string;
}

export default function Invoices() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("1");
  const [unitCost, setUnitCost] = useState<string>("");

  const utils = trpc.useUtils();

  const { data: invoices, isLoading } = trpc.invoices.getAll.useQuery();
  const { data: suppliers } = trpc.suppliers.getAll.useQuery();
  const { data: products } = trpc.products.getAll.useQuery();

  const createInvoiceMutation = trpc.invoices.create.useMutation({
    onSuccess: () => {
      toast.success("Nota fiscal registrada com sucesso!");
      utils.invoices.getAll.invalidate();
      utils.products.getAll.invalidate();
      setIsDialogOpen(false);
      setItems([]);
    },
    onError: (error) => {
      toast.error(`Erro ao registrar nota: ${error.message}`);
    },
  });

  const handleAddItem = () => {
    if (!selectedProduct || !quantity || !unitCost) {
      toast.error("Preencha todos os campos do item");
      return;
    }

    const product = products?.find((p) => p.id === parseInt(selectedProduct));
    if (!product) return;

    setItems([
      ...items,
      {
        productId: product.id,
        productName: product.name,
        quantity: parseInt(quantity),
        unitCost,
      },
    ]);

    setSelectedProduct("");
    setQuantity("1");
    setUnitCost("");
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (items.length === 0) {
      toast.error("Adicione pelo menos um item à nota fiscal");
      return;
    }

    const formData = new FormData(e.currentTarget);

    createInvoiceMutation.mutate({
      invoiceNumber: formData.get("invoiceNumber") as string,
      supplierId: parseInt(formData.get("supplierId") as string),
      entryDate: new Date(formData.get("entryDate") as string),
      items: items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitCost: item.unitCost,
      })),
    });
  };

  const totalValue = items.reduce(
    (sum, item) => sum + parseFloat(item.unitCost) * item.quantity,
    0
  );

  return (
    <POSLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">Notas Fiscais</h1>
            <p className="text-muted-foreground">
              Registre entradas de mercadorias
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="shadow-nordic">
                <Plus className="w-5 h-5 mr-2" />
                Nova Nota Fiscal
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Registrar Nota Fiscal de Entrada</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="invoiceNumber">Número da Nota *</Label>
                    <Input
                      id="invoiceNumber"
                      name="invoiceNumber"
                      required
                      placeholder="Ex: NF-12345"
                    />
                  </div>

                  <div>
                    <Label htmlFor="supplierId">Fornecedor *</Label>
                    <Select name="supplierId" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o fornecedor" />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers?.map((supplier) => (
                          <SelectItem key={supplier.id} value={supplier.id.toString()}>
                            {supplier.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="entryDate">Data de Entrada *</Label>
                    <Input
                      id="entryDate"
                      name="entryDate"
                      type="date"
                      required
                      defaultValue={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="font-semibold mb-4">Itens da Nota</h3>

                  <div className="grid grid-cols-12 gap-3 mb-4">
                    <div className="col-span-5">
                      <Label>Produto</Label>
                      <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o produto" />
                        </SelectTrigger>
                        <SelectContent>
                          {products?.map((product) => (
                            <SelectItem key={product.id} value={product.id.toString()}>
                              {product.name} ({product.barcode})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="col-span-2">
                      <Label>Quantidade</Label>
                      <Input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        min="1"
                      />
                    </div>

                    <div className="col-span-3">
                      <Label>Custo Unitário (R$)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={unitCost}
                        onChange={(e) => setUnitCost(e.target.value)}
                        placeholder="0.00"
                      />
                    </div>

                    <div className="col-span-2 flex items-end">
                      <Button type="button" onClick={handleAddItem} className="w-full">
                        Adicionar
                      </Button>
                    </div>
                  </div>

                  {items.length > 0 && (
                    <div className="space-y-2 mb-4">
                      {items.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                        >
                          <div className="flex-1">
                            <p className="font-semibold">{item.productName}</p>
                            <p className="text-sm text-muted-foreground">
                              {item.quantity} un. × R$ {parseFloat(item.unitCost).toFixed(2)} = R${" "}
                              {(parseFloat(item.unitCost) * item.quantity).toFixed(2)}
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveItem(index)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-between items-center p-4 bg-primary/10 rounded-lg">
                    <span className="font-semibold text-lg">Valor Total:</span>
                    <span className="text-2xl font-bold">R$ {totalValue.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false);
                      setItems([]);
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createInvoiceMutation.isPending}>
                    {createInvoiceMutation.isPending ? "Registrando..." : "Registrar Nota"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="shadow-nordic">
          <CardHeader>
            <CardTitle>Histórico de Notas Fiscais</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-muted-foreground">Carregando notas...</p>
              </div>
            ) : invoices && invoices.length > 0 ? (
              <div className="space-y-3">
                {invoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between p-4 bg-muted/30 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <FileText className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-lg">{invoice.invoiceNumber}</p>
                        <p className="text-sm text-muted-foreground">
                          Fornecedor: {invoice.supplierName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Data: {new Date(invoice.entryDate).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">R$ {parseFloat(invoice.totalValue).toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">
                        Por: {invoice.createdByName}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhuma nota fiscal registrada</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </POSLayout>
  );
}
