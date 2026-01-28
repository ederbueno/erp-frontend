/**
 * NFeConfig - Página de configuração de NFe
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileText, Edit, MoreHorizontal, Plus, RefreshCw, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { useNFeConfig, NFeConfig } from "@/hooks/useNFeConfig";

export default function NFeConfigPage() {
  const [, setLocation] = useLocation();
  const [busca, setBusca] = useState("");

  const { configs, isLoading, error, refetch, deletarConfig } = useNFeConfig();

  const configsFiltradas = useMemo(() => {
    if (!busca) return configs;
    const termo = busca.toLowerCase();
    return configs.filter((config: NFeConfig) =>
      [config.empresaId, config.ambiente, config.serie]
        .filter(Boolean)
        .some((campo) => campo.toString().toLowerCase().includes(termo))
    );
  }, [busca, configs]);

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Configuração NFe</h1>
            <p className="text-muted-foreground">Parâmetros de emissão fiscal</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
            <Link href="/nfe-config/novo">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova configuração
              </Button>
            </Link>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Configurações cadastradas
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Input
              placeholder="Buscar por empresa, ambiente ou série"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />

            {isLoading && <p>Carregando configurações...</p>}
            {error && (
              <p className="text-destructive">
                Erro ao carregar configurações. Verifique se o serviço está rodando.
              </p>
            )}

            {!isLoading && !error && (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Empresa</TableHead>
                      <TableHead>Ambiente</TableHead>
                      <TableHead>Série</TableHead>
                      <TableHead>Número Atual</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {configsFiltradas.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                          Nenhuma configuração encontrada.
                        </TableCell>
                      </TableRow>
                    )}
                    {configsFiltradas.map((config) => (
                      <TableRow key={config.id}>
                        <TableCell>{config.empresaId}</TableCell>
                        <TableCell>{config.ambiente}</TableCell>
                        <TableCell>{config.serie || "-"}</TableCell>
                        <TableCell>{config.numeroAtual ?? 0}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setLocation(`/nfe-config/${config.id}/editar`)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => {
                                  const ok = window.confirm(
                                    `Deseja remover esta configuração?`
                                  );
                                  if (ok) deletarConfig(config.id);
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
