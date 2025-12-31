import POSLayout from "@/components/POSLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { Plus, Search, Package } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { nanoid } from "nanoid";

export default function Products() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const utils = trpc.useUtils();

  const { data: products, isLoading } = trpc.products.getAll.useQuery();

  const createProductMutation = trpc.products.create.useMutation({
    onSuccess: () => {
      toast.success("Produto cadastrado com sucesso!");
      utils.products.getAll.invalidate();
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`Erro ao cadastrar produto: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const barcode = formData.get("barcode") as string || `MH${nanoid(10).toUpperCase()}`;

    createProductMutation.mutate({
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      barcode,
      unitPrice: formData.get("unitPrice") as string,
      stockQuantity: parseInt(formData.get("stockQuantity") as string),
      minStockQuantity: parseInt(formData.get("minStockQuantity") as string),
      brand: formData.get("brand") as string,
      category: formData.get("category") as string,
    });
  };

  const filteredProducts = products?.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.barcode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <POSLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">Produtos</h1>
            <p className="text-muted-foreground">
              Gerencie o cadastro de produtos
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="shadow-nordic">
                <Plus className="w-5 h-5 mr-2" />
                Novo Produto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Cadastrar Novo Produto</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="name">Nome do Produto *</Label>
                    <Input
                      id="name"
                      name="name"
                      required
                      placeholder="Ex: Cadeira Escritório"
                    />
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Descrição detalhada do produto"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="barcode">Código de Barras</Label>
                    <Input
                      id="barcode"
                      name="barcode"
                      placeholder="Deixe vazio para gerar automaticamente"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Se não informado, será gerado automaticamente
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="unitPrice">Preço Unitário (R$) *</Label>
                    <Input
                      id="unitPrice"
                      name="unitPrice"
                      type="number"
                      step="0.01"
                      required
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <Label htmlFor="stockQuantity">Quantidade em Estoque *</Label>
                    <Input
                      id="stockQuantity"
                      name="stockQuantity"
                      type="number"
                      required
                      defaultValue="0"
                    />
                  </div>

                  <div>
                    <Label htmlFor="minStockQuantity">Estoque Mínimo *</Label>
                    <Input
                      id="minStockQuantity"
                      name="minStockQuantity"
                      type="number"
                      required
                      defaultValue="10"
                    />
                  </div>

                  <div>
                    <Label htmlFor="brand">Marca</Label>
                    <Input
                      id="brand"
                      name="brand"
                      placeholder="Ex: Modern House"
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">Categoria</Label>
                    <Input
                      id="category"
                      name="category"
                      placeholder="Ex: Móveis"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createProductMutation.isPending}>
                    {createProductMutation.isPending ? "Cadastrando..." : "Cadastrar"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="shadow-nordic">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou código de barras..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-muted-foreground">Carregando produtos...</p>
              </div>
            ) : filteredProducts && filteredProducts.length > 0 ? (
              <div className="space-y-3">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Package className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-lg">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Código: {product.barcode}
                        </p>
                        {product.brand && (
                          <p className="text-xs text-muted-foreground">
                            Marca: {product.brand}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">R$ {parseFloat(product.unitPrice).toFixed(2)}</p>
                      <p className={`text-sm ${
                        product.stockQuantity <= product.minStockQuantity
                          ? "text-destructive font-semibold"
                          : "text-muted-foreground"
                      }`}>
                        Estoque: {product.stockQuantity} un.
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {searchTerm ? "Nenhum produto encontrado" : "Nenhum produto cadastrado"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </POSLayout>
  );
}
