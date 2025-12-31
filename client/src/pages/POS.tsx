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
import { ShoppingCart, Trash2, Barcode, Search, DollarSign } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";

interface CartItem {
  productId: number;
  productName: string;
  unitPrice: string;
  quantity: number;
}

export default function POS() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sellerCode, setSellerCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "debit" | "credit" | "pix">("cash");
  const [amountPaid, setAmountPaid] = useState("");
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  const utils = trpc.useUtils();
  const { data: products } = trpc.products.getAll.useQuery();
  const { data: seller } = trpc.users.getBySellerCode.useQuery(
    { sellerCode },
    { enabled: sellerCode.length > 0 }
  );

  const createSaleMutation = trpc.sales.create.useMutation({
    onSuccess: (data) => {
      toast.success("Venda finalizada com sucesso!");
      utils.products.getAll.invalidate();
      setCart([]);
      setSellerCode("");
      setAmountPaid("");
      setLocation(`/receipt/${data.saleCode}`);
    },
    onError: (error) => {
      toast.error(`Erro ao finalizar venda: ${error.message}`);
    },
  });

  // Focus barcode input on mount
  useEffect(() => {
    barcodeInputRef.current?.focus();
  }, []);

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    const product = products?.find((p) => p.barcode === barcodeInput.trim());
    if (!product) {
      toast.error("Produto não encontrado");
      setBarcodeInput("");
      return;
    }

    addToCart(product);
    setBarcodeInput("");
  };

  const handleSearchSelect = (productId: string) => {
    const product = products?.find((p) => p.id === parseInt(productId));
    if (product) {
      addToCart(product);
      setSearchTerm("");
    }
  };

  const addToCart = (product: any) => {
    if (product.stockQuantity <= 0) {
      toast.error("Produto sem estoque disponível");
      return;
    }

    const existingItem = cart.find((item) => item.productId === product.id);
    
    if (existingItem) {
      if (existingItem.quantity >= product.stockQuantity) {
        toast.error("Quantidade máxima em estoque atingida");
        return;
      }
      setCart(
        cart.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          productId: product.id,
          productName: product.name,
          unitPrice: product.unitPrice,
          quantity: 1,
        },
      ]);
    }

    toast.success(`${product.name} adicionado ao carrinho`);
  };

  const removeFromCart = (productId: number) => {
    setCart(cart.filter((item) => item.productId !== productId));
  };

  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const product = products?.find((p) => p.id === productId);
    if (product && newQuantity > product.stockQuantity) {
      toast.error("Quantidade maior que o estoque disponível");
      return;
    }

    setCart(
      cart.map((item) =>
        item.productId === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const totalAmount = cart.reduce(
    (sum, item) => sum + parseFloat(item.unitPrice) * item.quantity,
    0
  );

  const changeAmount =
    paymentMethod === "cash" && amountPaid
      ? parseFloat(amountPaid) - totalAmount
      : 0;

  const handleFinalizeSale = () => {
    if (cart.length === 0) {
      toast.error("Adicione produtos ao carrinho");
      return;
    }

    if (!sellerCode) {
      toast.error("Informe o código do vendedor");
      return;
    }

    if (!seller) {
      toast.error("Vendedor não encontrado");
      return;
    }

    if (paymentMethod === "cash") {
      if (!amountPaid || parseFloat(amountPaid) < totalAmount) {
        toast.error("Valor pago insuficiente");
        return;
      }
    }

    if (paymentMethod === "pix") {
      toast.info("Gerando QR Code para Pix...");
    }

    createSaleMutation.mutate({
      sellerId: seller.id,
      items: cart.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
      paymentMethod: paymentMethod as any,
      amountPaid: paymentMethod === "cash" ? amountPaid : undefined,
    });
  };

  const filteredProducts = products?.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.barcode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <POSLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Ponto de Venda</h1>
          <p className="text-muted-foreground">Sistema de vendas Modern House</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Product Selection */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-nordic">
              <CardHeader>
                <CardTitle>Adicionar Produtos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Barcode Scanner */}
                <form onSubmit={handleBarcodeSubmit}>
                  <Label htmlFor="barcode">Código de Barras</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Barcode className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="barcode"
                        ref={barcodeInputRef}
                        value={barcodeInput}
                        onChange={(e) => setBarcodeInput(e.target.value)}
                        placeholder="Escaneie ou digite o código de barras"
                        className="pl-10"
                      />
                    </div>
                    <Button type="submit">Adicionar</Button>
                  </div>
                </form>

                {/* Product Search */}
                <div>
                  <Label htmlFor="search">Buscar Produto</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="search"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Digite o nome ou código do produto"
                      className="pl-10"
                    />
                  </div>
                  {searchTerm && filteredProducts && filteredProducts.length > 0 && (
                    <div className="mt-2 max-h-48 overflow-y-auto border rounded-lg">
                      {filteredProducts.slice(0, 5).map((product) => (
                        <button
                          key={product.id}
                          onClick={() => handleSearchSelect(product.id.toString())}
                          className="w-full text-left p-3 hover:bg-muted transition-colors border-b last:border-b-0"
                        >
                          <p className="font-semibold">{product.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {product.barcode} • R$ {parseFloat(product.unitPrice).toFixed(2)} • Estoque: {product.stockQuantity}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Cart Items */}
            <Card className="shadow-nordic">
              <CardHeader>
                <CardTitle>Carrinho de Compras</CardTitle>
              </CardHeader>
              <CardContent>
                {cart.length > 0 ? (
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div
                        key={item.productId}
                        className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="font-semibold">{item.productName}</p>
                          <p className="text-sm text-muted-foreground">
                            R$ {parseFloat(item.unitPrice).toFixed(2)} × {item.quantity}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            >
                              -
                            </Button>
                            <span className="w-12 text-center font-semibold">
                              {item.quantity}
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            >
                              +
                            </Button>
                          </div>
                          <p className="text-lg font-bold w-24 text-right">
                            R$ {(parseFloat(item.unitPrice) * item.quantity).toFixed(2)}
                          </p>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeFromCart(item.productId)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Carrinho vazio</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right: Payment */}
          <div className="space-y-6">
            <Card className="shadow-nordic-lg">
              <CardHeader>
                <CardTitle>Finalizar Venda</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="sellerCode">Código do Vendedor *</Label>
                  <Input
                    id="sellerCode"
                    value={sellerCode}
                    onChange={(e) => setSellerCode(e.target.value)}
                    placeholder="Digite seu código"
                  />
                  {seller && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Vendedor: {seller.name}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="paymentMethod">Forma de Pagamento *</Label>
                  <Select
                    value={paymentMethod}
                    onValueChange={(value: any) => setPaymentMethod(value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Espécie</SelectItem>
                      <SelectItem value="pix">Pix</SelectItem>
                      <SelectItem value="debit">Débito</SelectItem>
                      <SelectItem value="credit">Crédito</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {paymentMethod === "cash" && (
                  <div>
                    <Label htmlFor="amountPaid">Valor Recebido (R$) *</Label>
                    <Input
                      id="amountPaid"
                      type="number"
                      step="0.01"
                      value={amountPaid}
                      onChange={(e) => setAmountPaid(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                )}

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-lg">
                    <span>Total:</span>
                    <span className="font-bold">R$ {totalAmount.toFixed(2)}</span>
                  </div>

                  {paymentMethod === "cash" && amountPaid && (
                    <>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Recebido:</span>
                        <span>R$ {parseFloat(amountPaid).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold text-primary">
                        <span>Troco:</span>
                        <span>R$ {changeAmount >= 0 ? changeAmount.toFixed(2) : "0.00"}</span>
                      </div>
                    </>
                  )}
                </div>

                <Button
                  className="w-full h-14 text-lg"
                  onClick={handleFinalizeSale}
                  disabled={createSaleMutation.isPending || cart.length === 0}
                >
                  <DollarSign className="w-5 h-5 mr-2" />
                  {createSaleMutation.isPending ? "Processando..." : "Finalizar Venda"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </POSLayout>
  );
}
