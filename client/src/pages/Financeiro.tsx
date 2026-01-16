/**
 * Financeiro - Página de gestão financeira
 * Integrada com ms-financeiro via tRPC
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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  DollarSign,
  FileText,
  Filter,
  Loader2,
  RefreshCw,
  Search,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useVendas } from "@/hooks/useVendas";
import { useFinanceiro } from "@/hooks/useFinanceiro";

// Dados mockados para o gráfico de fluxo de caixa
const cashFlowData = [
  { name: "Seg", entrada: 4200, saida: 1200 },
  { name: "Ter", entrada: 3800, saida: 800 },
  { name: "Qua", entrada: 5100, saida: 1500 },
  { name: "Qui", entrada: 2900, saida: 900 },
  { name: "Sex", entrada: 6200, saida: 2100 },
  { name: "Sáb", entrada: 1800, saida: 400 },
  { name: "Dom", entrada: 800, saida: 200 },
];

const statusConfig = {
  PENDENTE: {
    label: "Pendente",
    icon: Clock,
    className: "badge-pending",
  },
  PAGO: {
    label: "Pago",
    icon: CheckCircle2,
    className: "badge-success",
  },
  CONCLUIDO: {
    label: "Pago",
    icon: CheckCircle2,
    className: "badge-success",
  },
  CONCLUIDA: {
    label: "Pago",
    icon: CheckCircle2,
    className: "badge-success",
  },
  CANCELADO: {
    label: "Cancelado",
    icon: XCircle,
    className: "badge-danger",
  },
  EXPIRADO: {
    label: "Expirado",
    icon: Clock,
    className: "badge-warning",
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

export default function Financeiro() {
  const { vendas, isLoading, error, refetch } = useVendas();
  const { confirmarPagamento, isConfirmando } = useFinanceiro();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [selectedPayment, setSelectedPayment] = useState<any | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Garantir que vendas seja um array
  const vendasArray = Array.isArray(vendas) ? vendas : [];

  // Converter vendas em pagamentos
  const payments = vendasArray.map((venda: any) => ({
    id: `PAG-${venda.id?.substring(0, 6) || 'N/A'}`,
    vendaId: venda.id,
    clienteNome: venda.clienteNome || venda.clienteId || 'N/A',
    valor: Number(venda.valorTotal) || 0,
    metodo: venda.metodoPagamento || 'N/A',
    status: venda.status === 'CONCLUIDO' || venda.status === 'CONCLUIDA' ? 'PAGO' : venda.status,
    pagoEm: venda.status === 'CONCLUIDO' || venda.status === 'CONCLUIDA' ? venda.criadoEm : null,
    faturaId: `FAT-${venda.id?.substring(0, 6) || 'N/A'}`,
  }));

  const filteredPayments = payments.filter((payment: any) => {
    const matchesSearch =
      payment.vendaId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.clienteNome?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "Todos" || payment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleConfirmPayment = (payment: any) => {
    setSelectedPayment(payment);
    setIsConfirmOpen(true);
  };

  const handleConfirm = async () => {
    if (!selectedPayment) return;

    try {
      await confirmarPagamento(selectedPayment.vendaId);
      setIsConfirmOpen(false);
      refetch();
    } catch (err) {
      // Erro já tratado no hook
    }
  };

  const totalRecebido = payments
    .filter((p: any) => p.status === "PAGO")
    .reduce((acc: number, p: any) => acc + p.valor, 0);
  const totalPendente = payments
    .filter((p: any) => p.status === "PENDENTE")
    .reduce((acc: number, p: any) => acc + p.valor, 0);
  const totalCancelado = payments
    .filter((p: any) => p.status === "CANCELADO" || p.status === "EXPIRADO")
    .reduce((acc: number, p: any) => acc + p.valor, 0);

  // Loading state
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
            <p className="text-muted-foreground">Carregando dados financeiros...</p>
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
          <h1 className="text-2xl font-bold tracking-tight">Financeiro</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie pagamentos e faturas
          </p>
        </div>
        <Button variant="outline" size="icon" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Recebido</p>
                <p className="text-2xl font-bold mt-1 text-[oklch(0.50_0.15_155)]">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(totalRecebido)}
                </p>
                <div className="flex items-center gap-1 mt-2 text-xs font-medium text-[oklch(0.50_0.15_155)]">
                  <ArrowUpRight className="h-3 w-3" />
                  <span>Vendas concluídas</span>
                </div>
              </div>
              <div className="h-10 w-10 rounded-lg bg-[oklch(0.65_0.18_155/0.1)] flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-[oklch(0.50_0.15_155)]" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">A Receber</p>
                <p className="text-2xl font-bold mt-1 text-[oklch(0.55_0.12_85)]">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(totalPendente)}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {payments.filter((p: any) => p.status === "PENDENTE").length} pagamentos pendentes
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-[oklch(0.80_0.15_85/0.1)] flex items-center justify-center">
                <Clock className="h-5 w-5 text-[oklch(0.55_0.12_85)]" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cancelado</p>
                <p className="text-2xl font-bold mt-1 text-destructive">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(totalCancelado)}
                </p>
                <div className="flex items-center gap-1 mt-2 text-xs font-medium text-destructive">
                  <ArrowDownRight className="h-3 w-3" />
                  <span>Vendas canceladas</span>
                </div>
              </div>
              <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <XCircle className="h-5 w-5 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Notas Fiscais</p>
                <p className="text-2xl font-bold mt-1">
                  {payments.filter((p: any) => p.status === "PAGO").length}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Simuladas (MVP)
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cash Flow Chart */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Fluxo de Caixa (Demonstração)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cashFlowData}>
                <defs>
                  <linearGradient id="colorEntrada" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.65 0.18 155)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="oklch(0.65 0.18 155)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorSaida" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.55 0.18 25)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="oklch(0.55 0.18 25)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  tickFormatter={(value) => `R$${value / 1000}k`}
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
                  dataKey="entrada"
                  stroke="oklch(0.50 0.15 155)"
                  fill="url(#colorEntrada)"
                  strokeWidth={2}
                  name="Entradas"
                />
                <Area
                  type="monotone"
                  dataKey="saida"
                  stroke="oklch(0.55 0.18 25)"
                  fill="url(#colorSaida)"
                  strokeWidth={2}
                  name="Saídas"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por venda ou cliente..."
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
                <SelectItem value="PAGO">Pago</SelectItem>
                <SelectItem value="CANCELADO">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Pagamentos ({filteredPayments.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filteredPayments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <DollarSign className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">Nenhum pagamento encontrado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Venda</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Método</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[100px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment: any) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-mono text-sm">
                        {payment.id}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {payment.vendaId?.substring(0, 8) || 'N/A'}
                      </TableCell>
                      <TableCell className="font-medium">
                        {payment.clienteNome}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-normal">
                          {payment.metodo === "LINK_MAQUININHA"
                            ? "Link/Maquininha"
                            : payment.metodo}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(payment.valor)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={payment.status} />
                      </TableCell>
                      <TableCell>
                        {payment.status === "PENDENTE" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleConfirmPayment(payment)}
                          >
                            Confirmar
                          </Button>
                        )}
                        {payment.status === "PAGO" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toast.info("Nota fiscal simulada - MVP")}
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            NF-e
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirm Payment Dialog */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Confirmar Pagamento</DialogTitle>
            <DialogDescription>
              Deseja confirmar o recebimento deste pagamento?
            </DialogDescription>
          </DialogHeader>
          {selectedPayment && (
            <div className="py-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Venda:</span>
                <span className="font-mono">{selectedPayment.vendaId?.substring(0, 8)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cliente:</span>
                <span className="font-medium">{selectedPayment.clienteNome}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Método:</span>
                <span>{selectedPayment.metodo}</span>
              </div>
              <div className="flex justify-between border-t pt-3">
                <span className="font-semibold">Valor:</span>
                <span className="text-lg font-bold text-primary">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(selectedPayment.valor)}
                </span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleConfirm} disabled={isConfirmando}>
              {isConfirmando ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Confirmando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Confirmar Pagamento
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
