/**
 * Certificados - Página de gestão de certificados digitais
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
import { FileKey2, Edit, MoreHorizontal, Plus, RefreshCw, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { useCertificados, CertificadoDigital } from "@/hooks/useCertificados";

export default function Certificados() {
  const [, setLocation] = useLocation();
  const [busca, setBusca] = useState("");

  const { certificados, isLoading, error, refetch, deletarCertificado } = useCertificados();

  const certificadosFiltrados = useMemo(() => {
    if (!busca) return certificados;
    const termo = busca.toLowerCase();
    return certificados.filter((certificado: CertificadoDigital) =>
      [certificado.nome].filter(Boolean).some((campo) => campo.toLowerCase().includes(termo))
    );
  }, [busca, certificados]);

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Certificados</h1>
            <p className="text-muted-foreground">Certificados digitais para emissão de NFe</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
            <Link href="/certificados/novo">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo certificado
              </Button>
            </Link>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileKey2 className="h-5 w-5" />
              Lista de certificados
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Input
              placeholder="Buscar por nome"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />

            {isLoading && <p>Carregando certificados...</p>}
            {error && (
              <p className="text-destructive">
                Erro ao carregar certificados. Verifique se o serviço está rodando.
              </p>
            )}

            {!isLoading && !error && (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Validade</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {certificadosFiltrados.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-sm text-muted-foreground">
                          Nenhum certificado encontrado.
                        </TableCell>
                      </TableRow>
                    )}
                    {certificadosFiltrados.map((certificado) => (
                      <TableRow key={certificado.id}>
                        <TableCell className="font-medium">{certificado.nome}</TableCell>
                        <TableCell>
                          {certificado.validoAte ? new Date(certificado.validoAte).toLocaleDateString() : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setLocation(`/certificados/${certificado.id}/editar`)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => {
                                  const ok = window.confirm(
                                    `Deseja remover o certificado ${certificado.nome}?`
                                  );
                                  if (ok) deletarCertificado(certificado.id);
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
