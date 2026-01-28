/**
 * Funcionarios - Página de gestão de funcionários
 * Integrada com ms-cadastro via tRPC
 */

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Badge } from "@/components/ui/badge";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Plus,
  RefreshCw,
  Trash2,
  Edit,
  UserCheck,
  UserX,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { useFuncionarios, Funcionario } from "@/hooks/useFuncionarios";

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

export default function Funcionarios() {
  const [, setLocation] = useLocation();
  const [busca, setBusca] = useState("");

  const {
    funcionarios,
    isLoading,
    error,
    refetch,
    atualizarStatus,
    deletarFuncionario,
  } = useFuncionarios();

  const funcionariosFiltrados = useMemo(() => {
    if (!busca) return funcionarios;
    const termo = busca.toLowerCase();
    return funcionarios.filter((funcionario: Funcionario) =>
      [funcionario.nome, funcionario.documento, funcionario.email]
        .filter(Boolean)
        .some((campo) => campo.toLowerCase().includes(termo))
    );
  }, [busca, funcionarios]);

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Funcionários</h1>
            <p className="text-muted-foreground">
              Gerencie os colaboradores cadastrados
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
            <Link href="/funcionarios/novo">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo funcionário
              </Button>
            </Link>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Lista de funcionários
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Buscar por nome, CPF ou email"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>

            {isLoading && <p>Carregando funcionários...</p>}
            {error && (
              <p className="text-destructive">
                Erro ao carregar funcionários. Verifique se o serviço está rodando.
              </p>
            )}

            {!isLoading && !error && (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>CPF</TableHead>
                      <TableHead>Cargo</TableHead>
                      <TableHead>Departamento</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {funcionariosFiltrados.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                          Nenhum funcionário encontrado.
                        </TableCell>
                      </TableRow>
                    )}
                    {funcionariosFiltrados.map((funcionario) => (
                      <TableRow key={funcionario.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{funcionario.nome}</span>
                            <span className="text-xs text-muted-foreground">
                              {funcionario.email}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{funcionario.documento}</TableCell>
                        <TableCell>{funcionario.cargo || "-"}</TableCell>
                        <TableCell>{funcionario.departamento || "-"}</TableCell>
                        <TableCell>
                          <StatusBadge status={funcionario.status} />
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
                                  setLocation(`/funcionarios/${funcionario.id}/editar`)
                                }
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() =>
                                  atualizarStatus(
                                    funcionario.id,
                                    funcionario.status === "ATIVO" ? "INATIVO" : "ATIVO"
                                  )
                                }
                              >
                                {funcionario.status === "ATIVO" ? "Desativar" : "Ativar"}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => {
                                  const ok = window.confirm(
                                    `Deseja remover o funcionário ${funcionario.nome}?`
                                  );
                                  if (ok) deletarFuncionario(funcionario.id);
                                }}
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
      </div>
    </DashboardLayout>
  );
}
