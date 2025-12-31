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
import { Plus, Building2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Suppliers() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const utils = trpc.useUtils();

  const { data: suppliers, isLoading } = trpc.suppliers.getAll.useQuery();

  const createSupplierMutation = trpc.suppliers.create.useMutation({
    onSuccess: () => {
      toast.success("Fornecedor cadastrado com sucesso!");
      utils.suppliers.getAll.invalidate();
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`Erro ao cadastrar fornecedor: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    createSupplierMutation.mutate({
      name: formData.get("name") as string,
      cnpjCpf: formData.get("cnpjCpf") as string,
      phone: formData.get("phone") as string,
      email: formData.get("email") as string,
      address: formData.get("address") as string,
    });
  };

  return (
    <POSLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">Fornecedores</h1>
            <p className="text-muted-foreground">
              Gerencie o cadastro de fornecedores
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="shadow-nordic">
                <Plus className="w-5 h-5 mr-2" />
                Novo Fornecedor
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Cadastrar Novo Fornecedor</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="name">Nome do Fornecedor *</Label>
                    <Input
                      id="name"
                      name="name"
                      required
                      placeholder="Ex: Distribuidora ABC"
                    />
                  </div>

                  <div>
                    <Label htmlFor="cnpjCpf">CNPJ ou CPF</Label>
                    <Input
                      id="cnpjCpf"
                      name="cnpjCpf"
                      placeholder="00.000.000/0000-00"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Telefone</Label>
                      <Input
                        id="phone"
                        name="phone"
                        placeholder="(00) 0000-0000"
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">E-mail</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="contato@fornecedor.com"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address">Endereço</Label>
                    <Textarea
                      id="address"
                      name="address"
                      placeholder="Endereço completo"
                      rows={3}
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
                  <Button type="submit" disabled={createSupplierMutation.isPending}>
                    {createSupplierMutation.isPending ? "Cadastrando..." : "Cadastrar"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="shadow-nordic">
          <CardHeader>
            <CardTitle>Lista de Fornecedores</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-muted-foreground">Carregando fornecedores...</p>
              </div>
            ) : suppliers && suppliers.length > 0 ? (
              <div className="space-y-3">
                {suppliers.map((supplier) => (
                  <div
                    key={supplier.id}
                    className="flex items-center justify-between p-4 bg-muted/30 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-lg">{supplier.name}</p>
                        {supplier.cnpjCpf && (
                          <p className="text-sm text-muted-foreground">
                            CNPJ/CPF: {supplier.cnpjCpf}
                          </p>
                        )}
                        {supplier.phone && (
                          <p className="text-xs text-muted-foreground">
                            Tel: {supplier.phone}
                          </p>
                        )}
                      </div>
                    </div>
                    {supplier.email && (
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">{supplier.email}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhum fornecedor cadastrado</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </POSLayout>
  );
}
