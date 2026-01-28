/**
 * Clientes - Página de gestão de clientes
 * Integrada com ms-cadastro via tRPC
 */

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  Building2,
  Edit,
  Loader2,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  User,
  UserCheck,
  UserX,
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useClientes, Cliente } from "@/hooks/useClientes";
import { Badge } from "@/components/ui/badge";

function StatusBadge({ status }: { status: string }) {
  if (status === "ATIVO") {
    return (
      <Badge variant="default" className="badge-success">
        <UserCheck className="h-3 w-3 mr-1" />
        Ativo
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="badge-danger">
      <UserX className="h-3 w-3 mr-1" />
      Inativo
    </Badge>
  );
}

function TipoBadge({ tipo }: { tipo: string }) {
  if (tipo === "FISICA") {
    return (
      <Badge variant="outline">
        <User className="h-3 w-3 mr-1" />
        PF
      </Badge>
    );
  }
  return (
    <Badge variant="outline">
      <Building2 className="h-3 w-3 mr-1" />
      PJ
    </Badge>
  );
}

export default function Clientes() {
  const [, setLocation] = useLocation();
  const {
    clientes,
    isLoading,
    error,
    refetch,
    deletarCliente,
    atualizarStatus,
    isDeletando,
  } = useClientes();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"TODOS" | "ATIVO" | "INATIVO">("TODOS");

  // Garantir que clientes seja um array
  const clientesArray = Array.isArray(clientes) ? clientes : [];

  const filteredClientes = clientesArray.filter((cliente: Cliente) => {
    const matchesSearch =
      cliente.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.documento?.includes(searchTerm) ||
      cliente.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "TODOS" || cliente.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (id: string) => {
    if (window.confirm("Tem certeza que deseja deletar este cliente?")) {
      try {
        await deletarCliente(id);
      } catch (err) {
        // Erro já tratado no hook
      }
    }
  };

  const handleToggleStatus = async (cliente: Cliente) => {
    const novoStatus = cliente.status === "ATIVO" ? "INATIVO" : "ATIVO";
    try {
      await atualizarStatus(cliente.id, novoStatus);
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
            <p className="text-muted-foreground">Carregando clientes...</p>
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
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Erro ao carregar clientes</h3>
            <p className="text-muted-foreground mb-4">
              {error.message || "Verifique se o microserviço está rodando"}
            </p>
            <Button onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
            <p className="text-muted-foreground">
              Gerencie sua base de clientes
            </p>
          </div>
          <Link href="/clientes/novo">
            <Button size="lg">
              <Plus className="h-5 w-5 mr-2" />
              Novo Cliente
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Clientes
              </CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{clientesArray.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Clientes Ativos
              </CardTitle>
              <UserCheck className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {clientesArray.filter((c) => c.status === "ATIVO").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pessoa Jurídica
              </CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {clientesArray.filter((c) => c.tipo === "JURIDICA").length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, documento ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="TODOS">Todos os Status</option>
                  <option value="ATIVO">Apenas Ativos</option>
                  <option value="INATIVO">Apenas Inativos</option>
                </select>
                <Button variant="outline" onClick={() => refetch()}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Atualizar
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredClientes.length === 0 ? (
              <div className="text-center py-12">
                <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Nenhum cliente encontrado
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm
                    ? "Tente ajustar sua busca"
                    : "Comece cadastrando seu primeiro cliente"}
                </p>
                <Link href="/clientes/novo">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Cadastrar Cliente
                  </Button>
                </Link>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Nome/Razão Social</TableHead>
                    <TableHead>Documento</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Cidade/UF</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClientes.map((cliente) => (
                    <TableRow key={cliente.id}>
                      <TableCell>
                        <TipoBadge tipo={cliente.tipo} />
                      </TableCell>
                      <TableCell className="font-medium">
                        <div>
                          <div>{cliente.nome}</div>
                          {cliente.nomeFantasia && (
                            <div className="text-xs text-muted-foreground">
                              {cliente.nomeFantasia}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {cliente.documento}
                      </TableCell>
                      <TableCell className="text-sm">
                        {cliente.email}
                      </TableCell>
                      <TableCell className="text-sm">
                        {cliente.telefone || "-"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {cliente.cidade && cliente.estado
                          ? `${cliente.cidade}/${cliente.estado}`
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={cliente.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                setLocation(`/clientes/${cliente.id}/editar`)
                              }
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleToggleStatus(cliente)}
                            >
                              {cliente.status === "ATIVO" ? (
                                <>
                                  <UserX className="h-4 w-4 mr-2" />
                                  Inativar
                                </>
                              ) : (
                                <>
                                  <UserCheck className="h-4 w-4 mr-2" />
                                  Ativar
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(cliente.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Deletar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
