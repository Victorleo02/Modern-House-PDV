import POSLayout from "@/components/POSLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Settings as SettingsIcon, Save } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function Settings() {
  const utils = trpc.useUtils();
  const { data: settings, isLoading } = trpc.store.getSettings.useQuery();

  const [companyName, setCompanyName] = useState("");
  const [cnpjCpf, setCnpjCpf] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (settings) {
      setCompanyName(settings.companyName || "");
      setCnpjCpf(settings.cnpjCpf || "");
      setAddress(settings.address || "");
      setPhone(settings.phone || "");
      setEmail(settings.email || "");
    }
  }, [settings]);

  const updateSettingsMutation = trpc.store.updateSettings.useMutation({
    onSuccess: () => {
      toast.success("Configurações atualizadas com sucesso!");
      utils.store.getSettings.invalidate();
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!companyName || !cnpjCpf || !address) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    updateSettingsMutation.mutate({
      companyName,
      cnpjCpf,
      address,
      phone: phone || undefined,
      email: email || undefined,
    });
  };

  return (
    <POSLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Configurações</h1>
          <p className="text-muted-foreground">
            Configure as informações da loja para emissão de cupons
          </p>
        </div>

        <Card className="shadow-nordic max-w-3xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="w-5 h-5" />
              Informações da Loja
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-muted-foreground">Carregando configurações...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="companyName">Razão Social / Nome da Empresa *</Label>
                  <Input
                    id="companyName"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Ex: Modern House Comércio de Móveis Ltda"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="cnpjCpf">CNPJ ou CPF *</Label>
                  <Input
                    id="cnpjCpf"
                    value={cnpjCpf}
                    onChange={(e) => setCnpjCpf(e.target.value)}
                    placeholder="Ex: 00.000.000/0000-00"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="address">Endereço Completo *</Label>
                  <Textarea
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Rua, número, bairro, cidade, estado, CEP"
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(00) 0000-0000"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="contato@modernhouse.com"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    size="lg"
                    disabled={updateSettingsMutation.isPending}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {updateSettingsMutation.isPending ? "Salvando..." : "Salvar Configurações"}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-nordic max-w-3xl bg-muted/30">
          <CardHeader>
            <CardTitle>Informações do Sistema</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sistema:</span>
              <span className="font-semibold">Modern House PDV</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Versão:</span>
              <span className="font-semibold">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Banco de Dados:</span>
              <span className="font-semibold">MySQL/TiDB</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </POSLayout>
  );
}
