/**
 * Dashboard - Página principal do ERP
 * Integrada com ms-vendas e ms-estoque via tRPC
 */

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowDownRight,
  ArrowUpRight,
  Box,
  DollarSign,
  Loader2,
  Package,
  Plus,
  RefreshCw,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";
import { Link } from "wouter";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useVendas } from "@/hooks/useVendas";
import { useProdutos } from "@/hooks/useProdutos";

// Dados mockados para gráficos (serão substituídos por dados reais quando houver histórico)
const salesData = [
  { name: "Jan", vendas: 4000, meta: 4500 },
  { name: "Fev", vendas: 3000, meta: 4500 },
  { name: "Mar", vendas: 5000, meta: 4500 },
  { name: "Abr", vendas: 4500, meta: 4500 },
  { name: "Mai", vendas: 6000, meta: 5000 },
  { name: "Jun", vendas: 5500, meta: 5000 },
];

function StatCard({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  loading,
}: {
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  icon: React.ElementType;
  loading?: boolean;
}) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin mt-2 text-muted-foreground" />
            ) : (
              <>
                <p className="text-2xl font-bold mt-1">{value}</p>
                <div
                  className={`flex items-center gap-1 mt-2 text-xs font-medium ${
                    changeType === "positive" 
                      ? "text-[oklch(0.50_0.15_155)]" 
                      : changeType === "negative" 
                        ? "text-destructive"
                        : "text-muted-foreground"
                  }`}
                >
                  {changeType === "positive" ? (
                    <ArrowUpRight className="h-3 w-3" />
                  ) : changeType === "negative" ? (
                    <ArrowDownRight className="h-3 w-3" />
                  ) : null}
                  <span>{change}</span>
                </div>
              </>
            )}
          </div>
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    CONCLUIDO: "badge-success",
    CONCLUIDA: "badge-success",
    PENDENTE: "badge-pending",
    CANCELADO: "badge-danger",
  };

  const labels: Record<string, string> = {
    CONCLUIDO: "Concluído",
    CONCLUIDA: "Concluído",
    PENDENTE: "Pendente",
    CANCELADO: "Cancelado",
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
        styles[status] || "badge-pending"
      }`}
    >
      {labels[status] || status}
    </span>
  );
}

export default function Dashboard() {
  const { vendas, isLoading: vendasLoading, refetch: refetchVendas } = useVendas();
  const { produtos, isLoading: produtosLoading, estatisticas, refetch: refetchProdutos } = useProdutos();

  const isLoading = vendasLoading || produtosLoading;

  // Garantir que vendas e produtos sejam arrays
  const vendasArray = Array.isArray(vendas) ? vendas : [];
  const produtosArray = Array.isArray(produtos) ? produtos : [];

  // Calcular métricas a partir dos dados reais
  const vendasConcluidas = vendasArray.filter((v: any) => 
    v.status === 'CONCLUIDO' || v.status === 'CONCLUIDA'
  );
  const totalVendasMes = vendasConcluidas.reduce(
    (acc: number, v: any) => acc + (Number(v.valorTotal) || 0), 
    0
  );
  const totalPedidos = vendasArray.length;
  const ticketMedio = totalPedidos > 0 ? totalVendasMes / vendasConcluidas.length : 0;

  // Produtos com estoque baixo (menos de 20 unidades)
  const lowStockProducts = produtosArray
    .filter((p: any) => p.quantidade < 20)
    .slice(0, 3)
    .map((p: any) => ({
      nome: p.nome,
      quantidade: p.quantidade,
      minimo: 20,
    }));

  // Vendas recentes
  const recentSales = vendasArray.slice(0, 4).map((v: any) => ({
    id: v.id?.substring(0, 12) || 'N/A',
    cliente: v.clienteNome || v.clienteId || 'N/A',
    valor: Number(v.valorTotal) || 0,
    status: v.status || 'PENDENTE',
  }));

  // Dados para gráfico de produtos mais vendidos (baseado em quantidade em estoque)
  const productData = produtosArray.slice(0, 5).map((p: any) => ({
    name: p.nome?.substring(0, 15) || 'Produto',
    quantidade: p.quantidade || 0,
  }));

  const handleRefresh = () => {
    refetchVendas();
    refetchProdutos();
  };

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Visão geral do seu negócio
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={handleRefresh}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Button asChild>
            <Link href="/vendas">
              <Plus className="h-4 w-4 mr-2" />
              Nova Venda
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="Vendas Totais"
          value={new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(totalVendasMes)}
          change="Vendas concluídas"
          changeType="neutral"
          icon={DollarSign}
          loading={vendasLoading}
        />
        <StatCard
          title="Pedidos"
          value={totalPedidos.toString()}
          change={`${vendasConcluidas.length} concluídos`}
          changeType="positive"
          icon={ShoppingCart}
          loading={vendasLoading}
        />
        <StatCard
          title="Produtos Ativos"
          value={estatisticas.total.toString()}
          change={`${estatisticas.estoqueBaixo} com estoque baixo`}
          changeType={estatisticas.estoqueBaixo > 0 ? "negative" : "positive"}
          icon={Package}
          loading={produtosLoading}
        />
        <StatCard
          title="Ticket Médio"
          value={new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(ticketMedio || 0)}
          change="Por venda concluída"
          changeType="neutral"
          icon={TrendingUp}
          loading={vendasLoading}
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-7 mb-8">
        {/* Sales Chart */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Vendas vs Meta (Demonstração)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesData}>
                  <defs>
                    <linearGradient id="colorVendas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="oklch(0.42 0.15 10)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="oklch(0.42 0.15 10)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `${value / 1000}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) =>
                      new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(value)
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="vendas"
                    stroke="oklch(0.42 0.15 10)"
                    strokeWidth={2}
                    fill="url(#colorVendas)"
                    name="Vendas"
                  />
                  <Area
                    type="monotone"
                    dataKey="meta"
                    stroke="oklch(0.65 0.18 155)"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    fill="transparent"
                    name="Meta"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Products Chart */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Estoque por Produto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {produtosLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : productData.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Nenhum produto cadastrado
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={productData} layout="vertical">
                    <XAxis type="number" axisLine={false} tickLine={false} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12 }}
                      width={100}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar
                      dataKey="quantidade"
                      fill="oklch(0.42 0.15 10)"
                      radius={[0, 4, 4, 0]}
                      name="Quantidade"
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Recent Sales */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold">
              Vendas Recentes
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/vendas">Ver todas</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {vendasLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : recentSales.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma venda registrada
              </div>
            ) : (
              <div className="space-y-4">
                {recentSales.map((sale: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 border-b border-border last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center">
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{sale.cliente}</p>
                        <p className="text-xs text-muted-foreground font-mono">{sale.id}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(sale.valor)}
                      </p>
                      <StatusBadge status={sale.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold">
              Estoque Baixo
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/produtos">Ver produtos</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {produtosLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : lowStockProducts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Todos os produtos com estoque adequado
              </div>
            ) : (
              <div className="space-y-4">
                {lowStockProducts.map((product: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 border-b border-border last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-destructive/10 flex items-center justify-center">
                        <Box className="h-4 w-4 text-destructive" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{product.nome}</p>
                        <p className="text-xs text-muted-foreground">
                          Mínimo: {product.minimo} unidades
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-destructive">
                        {product.quantidade}
                      </p>
                      <p className="text-xs text-muted-foreground">em estoque</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
