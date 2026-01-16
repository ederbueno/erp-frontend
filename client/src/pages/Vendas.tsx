/**
 * Vendas - Página de gestão de vendas
 * Integrada com ms-vendas via tRPC
 */

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  DollarSign,
  Eye,
  Filter,
  Loader2,
  Minus,
  Plus,
  RefreshCw,
  Search,
  ShoppingCart,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useVendas, CriarVendaInput } from "@/hooks/useVendas";
import { useProdutos } from "@/hooks/useProdutos";

const statusConfig = {
  PENDENTE: {
    label: "Pendente",
    icon: Clock,
    className: "badge-pending",
  },
  CONCLUIDO: {
    label: "Concluído",
    icon: CheckCircle2,
    className: "badge-success",
  },
  CONCLUIDA: {
    label: "Concluído",
    icon: CheckCircle2,
    className: "badge-success",
  },
  CANCELADO: {
    label: "Cancelado",
    icon: XCircle,
    className: "badge-danger",
  },
};

function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDENTE;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
}

export default function Vendas() {
  const { vendas, isLoading, error, refetch, criarVenda, isCriando } = useVendas();
  const { produtos } = useProdutos();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [isNewSaleOpen, setIsNewSaleOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<any | null>(null);

  // Form state for new sale
  const [newSale, setNewSale] = useState({
    clienteNome: "",
    clienteEmail: "",
    cep: "",
    metodoPagamento: "PIX" as 'PIX' | 'BOLETO' | 'LINK_MAQUININHA',
    itens: [] as { produtoId: string; nome: string; quantidade: number; precoUnitario: number }[],
  });

  // Produtos disponíveis do backend ou fallback
  const availableProducts = produtos.length > 0 
    ? produtos.map(p => ({
        id: p.id,
        nome: p.nome,
        preco: p.preco || 0,
        estoque: p.quantidade,
      }))
    : [
        { id: "BISNAGA-50ML", nome: "Bisnaga Alpha 50ml", preco: 2.5, estoque: 150 },
        { id: "FRASCO-30ML", nome: "Frasco Âmbar 30ml", preco: 3.8, estoque: 85 },
        { id: "POTE-100G", nome: "Pote Cristal 100g", preco: 4.2, estoque: 220 },
        { id: "VIDRO-18MM", nome: "Vidro Âmbar 18mm", preco: 5.9, estoque: 45 },
        { id: "VALVULA-PUMP", nome: "Válvula Pump Elegance", preco: 8.5, estoque: 180 },
      ];

  // Garantir que vendas seja um array
  const vendasArray = Array.isArray(vendas) ? vendas : [];

  const filteredSales = vendasArray.filter((sale: any) => {
    const matchesSearch =
      sale.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.clienteId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.clienteNome?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "Todos" || sale.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddItem = () => {
    setNewSale({
      ...newSale,
      itens: [...newSale.itens, { produtoId: "", nome: "", quantidade: 1, precoUnitario: 0 }],
    });
  };

  const handleRemoveItem = (index: number) => {
    setNewSale({
      ...newSale,
      itens: newSale.itens.filter((_, i) => i !== index),
    });
  };

  const handleItemChange = (index: number, field: string, value: string | number) => {
    const updatedItens = [...newSale.itens];
    if (field === "produtoId") {
      const product = availableProducts.find((p) => p.id === value);
      if (product) {
        updatedItens[index] = {
          ...updatedItens[index],
          produtoId: product.id,
          nome: product.nome,
          precoUnitario: product.preco,
        };
      }
    } else {
      updatedItens[index] = { ...updatedItens[index], [field]: value };
    }
    setNewSale({ ...newSale, itens: updatedItens });
  };

  const calculateTotal = () => {
    return newSale.itens.reduce((acc, item) => acc + item.quantidade * item.precoUnitario, 0);
  };

  const handleCreateSale = async () => {
    if (!newSale.clienteNome || newSale.itens.length === 0) {
      toast.error("Preencha o nome do cliente e adicione pelo menos um item");
      return;
    }

    const invalidItems = newSale.itens.filter((item) => !item.produtoId || item.quantidade <= 0);
    if (invalidItems.length > 0) {
      toast.error("Verifique os itens da venda");
      return;
    }

    try {
      const vendaData: CriarVendaInput = {
        clienteId: `CLI-${Date.now()}`,
        clienteNome: newSale.clienteNome,
        clienteEmail: newSale.clienteEmail || undefined,
        cep: newSale.cep || undefined,
        metodoPagamento: newSale.metodoPagamento,
        itens: newSale.itens.map(item => ({
          produtoId: item.produtoId,
          quantidade: item.quantidade,
          precoUnitario: item.precoUnitario,
        })),
      };

      await criarVenda(vendaData);
      setIsNewSaleOpen(false);
      setNewSale({
        clienteNome: "",
        clienteEmail: "",
        cep: "",
        metodoPagamento: "PIX",
        itens: [],
      });
    } catch (err) {
      // Erro já tratado no hook
    }
  };

  const handleViewDetail = (sale: any) => {
    setSelectedSale(sale);
    setIsDetailOpen(true);
  };

  const totalVendas = vendasArray
    .filter((s: any) => s.status === "CONCLUIDO" || s.status === "CONCLUIDA")
    .reduce((acc: number, s: any) => acc + (Number(s.valorTotal) || 0), 0);
  const vendasPendentes = vendasArray.filter((s: any) => s.status === "PENDENTE").length;

  // Loading state
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
            <p className="text-muted-foreground">Carregando vendas...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 mx-auto text-destructive mb-4" />
            <h2 className="text-lg font-semibold mb-2">Erro ao carregar vendas</h2>
            <p className="text-muted-foreground mb-4">
              Verifique se o microserviço ms-vendas está rodando em localhost:3000
            </p>
            <Button onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar novamente
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Vendas</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie seus pedidos e vendas
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Dialog open={isNewSaleOpen} onOpenChange={setIsNewSaleOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova Venda
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Nova Venda</DialogTitle>
                <DialogDescription>
                  Preencha os dados para registrar uma nova venda
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {/* Cliente Info */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="clienteNome">Nome do Cliente *</Label>
                    <Input
                      id="clienteNome"
                      placeholder="Ex: Farmácia Central"
                      value={newSale.clienteNome}
                      onChange={(e) => setNewSale({ ...newSale, clienteNome: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="clienteEmail">E-mail</Label>
                    <Input
                      id="clienteEmail"
                      type="email"
                      placeholder="cliente@email.com"
                      value={newSale.clienteEmail}
                      onChange={(e) => setNewSale({ ...newSale, clienteEmail: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="cep">CEP</Label>
                    <Input
                      id="cep"
                      placeholder="00000-000"
                      value={newSale.cep}
                      onChange={(e) => setNewSale({ ...newSale, cep: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="metodoPagamento">Método de Pagamento</Label>
                    <Select
                      value={newSale.metodoPagamento}
                      onValueChange={(value: 'PIX' | 'BOLETO' | 'LINK_MAQUININHA') => 
                        setNewSale({ ...newSale, metodoPagamento: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PIX">PIX</SelectItem>
                        <SelectItem value="BOLETO">Boleto</SelectItem>
                        <SelectItem value="LINK_MAQUININHA">Link/Maquininha</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                {/* Items */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Itens da Venda *</Label>
                    <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
                      <Plus className="h-4 w-4 mr-1" />
                      Adicionar Item
                    </Button>
                  </div>

                  {newSale.itens.length === 0 ? (
                    <div className="text-center py-6 border border-dashed rounded-lg">
                      <ShoppingCart className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Nenhum item adicionado
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {newSale.itens.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-end gap-2 p-3 bg-muted/50 rounded-lg"
                        >
                          <div className="flex-1 grid gap-2">
                            <Label className="text-xs">Produto</Label>
                            <Select
                              value={item.produtoId}
                              onValueChange={(value) => handleItemChange(index, "produtoId", value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione..." />
                              </SelectTrigger>
                              <SelectContent>
                                {availableProducts.map((product) => (
                                  <SelectItem key={product.id} value={product.id}>
                                    {product.nome} - R$ {product.preco.toFixed(2)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="w-24 grid gap-2">
                            <Label className="text-xs">Qtd</Label>
                            <Input
                              type="number"
                              min="1"
                              value={item.quantidade}
                              onChange={(e) =>
                                handleItemChange(index, "quantidade", parseInt(e.target.value) || 1)
                              }
                            />
                          </div>
                          <div className="w-28 grid gap-2">
                            <Label className="text-xs">Subtotal</Label>
                            <div className="h-9 px-3 flex items-center bg-background rounded-md border text-sm font-medium">
                              R$ {(item.quantidade * item.precoUnitario).toFixed(2)}
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleRemoveItem(index)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {newSale.itens.length > 0 && (
                    <div className="flex justify-end pt-2 border-t">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Total</p>
                        <p className="text-2xl font-bold text-primary">
                          {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(calculateTotal())}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsNewSaleOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateSale} disabled={isCriando}>
                  {isCriando ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    "Criar Venda"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total de Vendas</p>
                <p className="text-2xl font-bold">{vendasArray.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-[oklch(0.65_0.18_155/0.1)] flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-[oklch(0.50_0.15_155)]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Faturamento</p>
                <p className="text-2xl font-bold">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(totalVendas)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-[oklch(0.80_0.15_85/0.1)] flex items-center justify-center">
                <Clock className="h-6 w-6 text-[oklch(0.55_0.12_85)]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold">{vendasPendentes}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por ID ou cliente..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todos">Todos</SelectItem>
                <SelectItem value="PENDENTE">Pendente</SelectItem>
                <SelectItem value="CONCLUIDO">Concluído</SelectItem>
                <SelectItem value="CANCELADO">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Sales Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Lista de Vendas ({filteredSales.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filteredSales.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <ShoppingCart className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">Nenhuma venda encontrada</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setIsNewSaleOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Criar Venda
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Pagamento</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSales.map((sale: any) => (
                    <TableRow key={sale.id}>
                      <TableCell className="font-mono text-sm">
                        {sale.id?.substring(0, 8) || 'N/A'}
                      </TableCell>
                      <TableCell className="font-medium">
                        {sale.clienteNome || sale.clienteId || 'N/A'}
                      </TableCell>
                      <TableCell>
                        {sale.criadoEm 
                          ? new Date(sale.criadoEm).toLocaleDateString("pt-BR")
                          : 'N/A'
                        }
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-normal">
                          {sale.metodoPagamento === "LINK_MAQUININHA"
                            ? "Link/Maquininha"
                            : sale.metodoPagamento || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(Number(sale.valorTotal) || 0)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={sale.status || 'PENDENTE'} />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewDetail(sale)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sale Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Detalhes da Venda</DialogTitle>
            <DialogDescription>
              {selectedSale?.id}
            </DialogDescription>
          </DialogHeader>
          {selectedSale && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Cliente</p>
                  <p className="font-medium">{selectedSale.clienteNome || selectedSale.clienteId}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <StatusBadge status={selectedSale.status} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pagamento</p>
                  <p className="font-medium">{selectedSale.metodoPagamento}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Data</p>
                  <p className="font-medium">
                    {selectedSale.criadoEm 
                      ? new Date(selectedSale.criadoEm).toLocaleString("pt-BR")
                      : 'N/A'
                    }
                  </p>
                </div>
              </div>

              {selectedSale.motivo && (
                <div className="p-3 bg-destructive/10 rounded-lg">
                  <p className="text-sm text-destructive font-medium">
                    Motivo: {selectedSale.motivo}
                  </p>
                </div>
              )}

              <Separator />

              <div>
                <p className="text-sm text-muted-foreground mb-2">Itens</p>
                <div className="space-y-2">
                  {selectedSale.itens?.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between text-sm p-2 bg-muted/50 rounded">
                      <span>{item.nome || item.produtoId} x{item.quantidade}</span>
                      <span className="font-medium">
                        R$ {((item.quantidade || 0) * (item.precoUnitario || 0)).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center pt-2 border-t">
                <span className="font-semibold">Total</span>
                <span className="text-xl font-bold text-primary">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(Number(selectedSale.valorTotal) || 0)}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
