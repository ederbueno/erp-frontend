/**
 * Produtos - Página de gestão de produtos/estoque
 * Integrada com ms-estoque via tRPC
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
  Box,
  Edit,
  Loader2,
  MoreHorizontal,
  Package,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useProdutos, CriarProdutoInput } from "@/hooks/useProdutos";

const categories = ["Todos", "Bisnagas", "Frascos", "Potes", "Vidros", "Válvulas", "Armazenamento", "Memória", "GPU", "Outros"];

function StockBadge({ quantidade }: { quantidade: number }) {
  if (quantidade <= 10) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium badge-danger">
        <AlertTriangle className="h-3 w-3" />
        Crítico
      </span>
    );
  }
  if (quantidade <= 30) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium badge-warning">
        Baixo
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium badge-success">
      Normal
    </span>
  );
}

export default function Produtos() {
  const { 
    produtos, 
    isLoading, 
    error, 
    estatisticas,
    refetch, 
    criarProduto, 
    atualizarProduto, 
    deletarProduto,
    isCriando,
    isAtualizando,
    isDeletando,
  } = useProdutos();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Todos");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    codigo: "",
    nome: "",
    quantidade: "",
    preco: "",
    categoria: "",
  });

  // Garantir que produtos seja um array
  const produtosArray = Array.isArray(produtos) ? produtos : [];

  const filteredProducts = produtosArray.filter((product: any) => {
    const matchesSearch =
      product.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.codigo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "Todos" || product.categoria === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleOpenDialog = (product?: any) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        codigo: product.codigo || product.id || "",
        nome: product.nome || "",
        quantidade: product.quantidade?.toString() || "0",
        preco: product.preco?.toString() || "0",
        categoria: product.categoria || "Outros",
      });
    } else {
      setEditingProduct(null);
      setFormData({
        codigo: "",
        nome: "",
        quantidade: "",
        preco: "",
        categoria: "",
      });
    }
    setIsDialogOpen(true);
  };

  const handleSaveProduct = async () => {
    if (!formData.nome || !formData.quantidade) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      const productData: CriarProdutoInput = {
        codigo: formData.codigo || undefined,
        nome: formData.nome,
        quantidade: parseInt(formData.quantidade) || 0,
        preco: parseFloat(formData.preco) || undefined,
        categoria: formData.categoria || undefined,
      };

      if (editingProduct) {
        await atualizarProduto(editingProduct.id, productData);
      } else {
        await criarProduto(productData);
      }

      setIsDialogOpen(false);
    } catch (err) {
      // Erro já tratado no hook
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await deletarProduto(id);
    } catch (err) {
      // Erro já tratado no hook
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
            <p className="text-muted-foreground">Carregando produtos...</p>
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
            <h2 className="text-lg font-semibold mb-2">Erro ao carregar produtos</h2>
            <p className="text-muted-foreground mb-4">
              Verifique se o microserviço ms-estoque está rodando
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
          <h1 className="text-2xl font-bold tracking-tight">Produtos</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie seu catálogo e estoque
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Produto
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>
                  {editingProduct ? "Editar Produto" : "Novo Produto"}
                </DialogTitle>
                <DialogDescription>
                  {editingProduct
                    ? "Atualize as informações do produto"
                    : "Preencha os dados para cadastrar um novo produto"}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="codigo">Código (SKU)</Label>
                  <Input
                    id="codigo"
                    placeholder="Ex: PROD-001"
                    value={formData.codigo}
                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                    disabled={!!editingProduct}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="nome">Nome do Produto *</Label>
                  <Input
                    id="nome"
                    placeholder="Ex: Bisnaga Alpha 50ml"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="quantidade">Quantidade *</Label>
                    <Input
                      id="quantidade"
                      type="number"
                      placeholder="0"
                      value={formData.quantidade}
                      onChange={(e) => setFormData({ ...formData, quantidade: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="preco">Preço (R$)</Label>
                    <Input
                      id="preco"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.preco}
                      onChange={(e) => setFormData({ ...formData, preco: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="categoria">Categoria</Label>
                  <Select
                    value={formData.categoria}
                    onValueChange={(value) => setFormData({ ...formData, categoria: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.filter((c) => c !== "Todos").map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveProduct} disabled={isCriando || isAtualizando}>
                  {(isCriando || isAtualizando) ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    editingProduct ? "Salvar Alterações" : "Cadastrar"
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
                <Package className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total de Produtos</p>
                <p className="text-2xl font-bold">{estatisticas.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-[oklch(0.65_0.18_155/0.1)] flex items-center justify-center">
                <Box className="h-6 w-6 text-[oklch(0.50_0.15_155)]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Valor em Estoque</p>
                <p className="text-2xl font-bold">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(estatisticas.valorEmEstoque)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-[oklch(0.80_0.15_85/0.1)] flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-[oklch(0.55_0.12_85)]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Estoque Baixo</p>
                <p className="text-2xl font-bold">{estatisticas.estoqueBaixo}</p>
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
                placeholder="Buscar por nome ou código..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Lista de Produtos ({filteredProducts.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Package className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">Nenhum produto encontrado</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => handleOpenDialog()}
              >
                <Plus className="h-4 w-4 mr-2" />
                Cadastrar Produto
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead className="text-center">Quantidade</TableHead>
                    <TableHead className="text-right">Preço</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product: any) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-mono text-sm">
                        {product.codigo || product.id?.substring(0, 8) || 'N/A'}
                      </TableCell>
                      <TableCell className="font-medium">
                        {product.nome || 'N/A'}
                      </TableCell>
                      <TableCell>{product.categoria || 'Outros'}</TableCell>
                      <TableCell className="text-center">
                        {product.quantidade || 0}
                      </TableCell>
                      <TableCell className="text-right">
                        {product.preco 
                          ? new Intl.NumberFormat("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            }).format(product.preco)
                          : 'N/A'
                        }
                      </TableCell>
                      <TableCell>
                        <StockBadge quantidade={product.quantidade || 0} />
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleOpenDialog(product)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDeleteProduct(product.id)}
                              disabled={isDeletando}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
