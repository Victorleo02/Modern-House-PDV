import POSLayout from "@/components/POSLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Users, Save } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Sellers() {
  const utils = trpc.useUtils();
  const { data: sellers, isLoading } = trpc.users.getAll.useQuery();

  const updateSellerCodeMutation = trpc.users.updateSellerCode.useMutation({
    onSuccess: () => {
      toast.success("Código do vendedor atualizado!");
      utils.users.getAll.invalidate();
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const updateRoleMutation = trpc.users.updateRole.useMutation({
    onSuccess: () => {
      toast.success("Função atualizada!");
      utils.users.getAll.invalidate();
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const handleUpdateSellerCode = (userId: number, sellerCode: string) => {
    if (!sellerCode.trim()) {
      toast.error("Código do vendedor não pode estar vazio");
      return;
    }
    updateSellerCodeMutation.mutate({ userId, sellerCode: sellerCode.trim() });
  };

  const handleUpdateRole = (userId: number, role: "user" | "admin") => {
    updateRoleMutation.mutate({ userId, role });
  };

  return (
    <POSLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Vendedores</h1>
          <p className="text-muted-foreground">
            Gerencie vendedores e suas permissões
          </p>
        </div>

        <Card className="shadow-nordic">
          <CardHeader>
            <CardTitle>Lista de Vendedores</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-muted-foreground">Carregando vendedores...</p>
              </div>
            ) : sellers && sellers.length > 0 ? (
              <div className="space-y-4">
                {sellers.map((seller) => (
                  <SellerCard
                    key={seller.id}
                    seller={seller}
                    onUpdateCode={handleUpdateSellerCode}
                    onUpdateRole={handleUpdateRole}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhum vendedor cadastrado</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </POSLayout>
  );
}

interface SellerCardProps {
  seller: any;
  onUpdateCode: (userId: number, code: string) => void;
  onUpdateRole: (userId: number, role: "user" | "admin") => void;
}

function SellerCard({ seller, onUpdateCode, onUpdateRole }: SellerCardProps) {
  const [sellerCode, setSellerCode] = useState(seller.sellerCode || "");
  const [role, setRole] = useState<"user" | "admin">(seller.role);

  return (
    <div className="p-6 bg-muted/30 rounded-lg space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-lg font-semibold">{seller.name || "Sem nome"}</p>
          <p className="text-sm text-muted-foreground">{seller.email || "Sem email"}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Users className="w-6 h-6 text-primary" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <Label htmlFor={`code-${seller.id}`}>Código do Vendedor</Label>
          <div className="flex gap-2">
            <Input
              id={`code-${seller.id}`}
              value={sellerCode}
              onChange={(e) => setSellerCode(e.target.value)}
              placeholder="Ex: V001"
            />
            <Button
              onClick={() => onUpdateCode(seller.id, sellerCode)}
              disabled={sellerCode === seller.sellerCode}
            >
              <Save className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div>
          <Label htmlFor={`role-${seller.id}`}>Função</Label>
          <Select
            value={role}
            onValueChange={(value: "user" | "admin") => {
              setRole(value);
              onUpdateRole(seller.id, value);
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user">Vendedor</SelectItem>
              <SelectItem value="admin">Administrador</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
