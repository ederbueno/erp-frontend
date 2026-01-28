/**
 * Empresas - Página de gestão de empresas emissoras
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
import { Building2, Edit, MoreHorizontal, Plus, RefreshCw, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { useEmpresas, Empresa } from "@/hooks/useEmpresas";

export default function Empresas() {
  const [, setLocation] = useLocation();
  const [busca, setBusca] = useState("");

  const { empresas, isLoading, error, refetch, deletarEmpresa } = useEmpresas();

  const empresasFiltradas = useMemo(() => {
    if (!busca) return empresas;
    const termo = busca.toLowerCase();
    return empresas.filter((empresa: Empresa) =>
      [empresa.razaoSocial, empresa.nomeFantasia, empresa.cnpj]
        .filter(Boolean)
        .some((campo) => campo.toLowerCase().includes(termo))
    );
  }, [busca, empresas]);

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Empresas</h1>
            <p className="text-muted-foreground">Empresas emissoras de NFe</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
            <Link href="/empresas/nova">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova empresa
              </Button>
            </Link>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Lista de empresas
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Input
              placeholder="Buscar por razão social, nome fantasia ou CNPJ"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />

            {isLoading && <p>Carregando empresas...</p>}
            {error && (
              <p className="text-destructive">
                Erro ao carregar empresas. Verifique se o serviço está rodando.
              </p>
            )}

            {!isLoading && !error && (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Razão Social</TableHead>
                      <TableHead>CNPJ</TableHead>
                      <TableHead>Regime</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {empresasFiltradas.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                          Nenhuma empresa encontrada.
                        </TableCell>
                      </TableRow>
                    )}
                    {empresasFiltradas.map((empresa) => (
                      <TableRow key={empresa.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{empresa.razaoSocial}</span>
                            {empresa.nomeFantasia && (
                              <span className="text-xs text-muted-foreground">{empresa.nomeFantasia}</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{empresa.cnpj}</TableCell>
                        <TableCell>{empresa.regimeTributario || "-"}</TableCell>
                        <TableCell>
                          <Badge variant="outline">Ativa</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setLocation(`/empresas/${empresa.id}/editar`)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => {
                                  const ok = window.confirm(
                                    `Deseja remover a empresa ${empresa.razaoSocial}?`
                                  );
                                  if (ok) deletarEmpresa(empresa.id);
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
