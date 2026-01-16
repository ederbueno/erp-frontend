/**
 * Relatórios - Página de relatórios e análises
 * Exibe gráficos e métricas do negócio
 */

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Download,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";

// Dados mockados
const salesByMonth = [
  { name: "Jan", vendas: 42000, meta: 45000 },
  { name: "Fev", vendas: 38000, meta: 45000 },
  { name: "Mar", vendas: 51000, meta: 45000 },
  { name: "Abr", vendas: 47000, meta: 50000 },
  { name: "Mai", vendas: 62000, meta: 50000 },
  { name: "Jun", vendas: 58000, meta: 55000 },
];

const salesByCategory = [
  { name: "Bisnagas", value: 35, color: "oklch(0.42 0.15 10)" },
  { name: "Frascos", value: 25, color: "oklch(0.65 0.18 155)" },
  { name: "Potes", value: 20, color: "oklch(0.55 0.12 85)" },
  { name: "Vidros", value: 12, color: "oklch(0.52 0.12 10)" },
  { name: "Válvulas", value: 8, color: "oklch(0.75 0.15 155)" },
];

const topProducts = [
  { nome: "Bisnaga Alpha 50ml", vendas: 2500, receita: 6250 },
  { nome: "Frasco Âmbar 30ml", vendas: 1800, receita: 6840 },
  { nome: "Pote Cristal 100g", vendas: 1500, receita: 6300 },
  { nome: "Válvula Pump Elegance", vendas: 1200, receita: 10200 },
  { nome: "Vidro Âmbar 18mm", vendas: 900, receita: 5310 },
];

const topClients = [
  { nome: "Farmácia Central", compras: 15, valor: 45000 },
  { nome: "Cosméticos Bella", compras: 12, valor: 38000 },
  { nome: "Lab Natureza", compras: 10, valor: 32000 },
  { nome: "Drogaria Saúde", compras: 8, valor: 24000 },
  { nome: "Perfumaria Essência", compras: 6, valor: 18000 },
];

const paymentMethods = [
  { name: "PIX", value: 55, color: "oklch(0.65 0.18 155)" },
  { name: "Boleto", value: 30, color: "oklch(0.42 0.15 10)" },
  { name: "Link/Maquininha", value: 15, color: "oklch(0.55 0.12 85)" },
];

export default function Relatorios() {
  const [period, setPeriod] = useState("6m");

  const handleExport = () => {
    toast.info("Funcionalidade de exportação em desenvolvimento");
  };

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Relatórios</h1>
          <p className="text-muted-foreground mt-1">
            Análises e métricas do seu negócio
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[150px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
              <SelectItem value="3m">Últimos 3 meses</SelectItem>
              <SelectItem value="6m">Últimos 6 meses</SelectItem>
              <SelectItem value="1y">Último ano</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Faturamento Total</p>
            <p className="text-2xl font-bold mt-1">R$ 298.000,00</p>
            <div className="flex items-center gap-1 mt-2 text-xs font-medium text-[oklch(0.50_0.15_155)]">
              <TrendingUp className="h-3 w-3" />
              <span>+18.5% vs. período anterior</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Ticket Médio</p>
            <p className="text-2xl font-bold mt-1">R$ 1.245,00</p>
            <div className="flex items-center gap-1 mt-2 text-xs font-medium text-[oklch(0.50_0.15_155)]">
              <TrendingUp className="h-3 w-3" />
              <span>+5.2% vs. período anterior</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Total de Pedidos</p>
            <p className="text-2xl font-bold mt-1">239</p>
            <div className="flex items-center gap-1 mt-2 text-xs font-medium text-[oklch(0.50_0.15_155)]">
              <TrendingUp className="h-3 w-3" />
              <span>+12.8% vs. período anterior</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Taxa de Conversão</p>
            <p className="text-2xl font-bold mt-1">94.2%</p>
            <div className="flex items-center gap-1 mt-2 text-xs font-medium text-destructive">
              <TrendingDown className="h-3 w-3" />
              <span>-1.3% vs. período anterior</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-4 lg:grid-cols-7 mb-8">
        {/* Sales Evolution */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Evolução de Vendas vs Meta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesByMonth}>
                  <defs>
                    <linearGradient id="colorVendasReport" x1="0" y1="0" x2="0" y2="1">
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
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="vendas"
                    stroke="oklch(0.42 0.15 10)"
                    strokeWidth={2}
                    fill="url(#colorVendasReport)"
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

        {/* Sales by Category */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Vendas por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={salesByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                    labelLine={false}
                  >
                    {salesByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => `${value}%`}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-4 lg:grid-cols-2 mb-8">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Produtos Mais Vendidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts} layout="vertical">
                  <XAxis type="number" axisLine={false} tickLine={false} />
                  <YAxis
                    type="category"
                    dataKey="nome"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11 }}
                    width={130}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar
                    dataKey="vendas"
                    fill="oklch(0.42 0.15 10)"
                    radius={[0, 4, 4, 0]}
                    name="Unidades Vendidas"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Métodos de Pagamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] flex items-center">
              <ResponsiveContainer width="50%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentMethods}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {paymentMethods.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => `${value}%`}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-3">
                {paymentMethods.map((method, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: method.color }}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{method.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {method.value}% das vendas
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Clients Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Top 5 Clientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topClients.map((client, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-3 border-b last:border-0"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{client.nome}</p>
                    <p className="text-sm text-muted-foreground">
                      {client.compras} compras no período
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(client.valor)}
                  </p>
                  <p className="text-xs text-muted-foreground">faturamento</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
