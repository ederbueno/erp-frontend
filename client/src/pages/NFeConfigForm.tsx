/**
 * NFeConfigForm - Cadastro/edição de configuração NFe
 */

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, FileText, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "wouter";
import { toast } from "sonner";
import { useNFeConfig, CriarNFeConfigInput } from "@/hooks/useNFeConfig";
import { useEmpresas } from "@/hooks/useEmpresas";
import { useCertificados } from "@/hooks/useCertificados";
import { trpc } from "@/lib/trpc";

export default function NFeConfigForm() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { criarConfig, atualizarConfig, isCriando, isAtualizando } = useNFeConfig();
  const { empresas } = useEmpresas();
  const { certificados } = useCertificados();

  const isEditing = !!params.id;
  const configId = params.id as string | undefined;

  const { data: configExistente, isLoading: isLoadingConfig } =
    trpc.nfeConfig.buscar.useQuery(
      { id: configId! },
      { enabled: isEditing && !!configId }
    );

  const [formData, setFormData] = useState<CriarNFeConfigInput>({
    ambiente: "HOMOLOGACAO",
    serie: "",
    numeroAtual: 0,
    naturezaOperacao: "",
    cscToken: "",
    cscId: "",
    empresaId: "",
    certificadoId: "",
  });

  useEffect(() => {
    if (configExistente) {
      setFormData({
        ambiente: configExistente.ambiente || "HOMOLOGACAO",
        serie: configExistente.serie || "",
        numeroAtual: configExistente.numeroAtual ?? 0,
        naturezaOperacao: configExistente.naturezaOperacao || "",
        cscToken: configExistente.cscToken || "",
        cscId: configExistente.cscId || "",
        empresaId: configExistente.empresaId,
        certificadoId: configExistente.certificadoId || "",
      });
    }
  }, [configExistente]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.empresaId) {
      toast.error("Selecione a empresa");
      return;
    }

    try {
      if (isEditing && configId) {
        await atualizarConfig(configId, {
          ...formData,
          numeroAtual: Number(formData.numeroAtual || 0),
          certificadoId: formData.certificadoId || undefined,
        });
      } else {
        await criarConfig({
          ...formData,
          numeroAtual: Number(formData.numeroAtual || 0),
          certificadoId: formData.certificadoId || undefined,
        });
      }
      setLocation("/nfe-config");
    } catch (error) {
      // erros já tratados no hook
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <Link href="/nfe-config">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {isEditing ? "Editar configuração NFe" : "Nova configuração NFe"}
            </h1>
            <p className="text-muted-foreground">Parâmetros fiscais da emissão</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Dados da configuração
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label>Empresa</Label>
                <Select
                  value={formData.empresaId}
                  onValueChange={(value) => setFormData({ ...formData, empresaId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a empresa" />
                  </SelectTrigger>
                  <SelectContent>
                    {empresas.map((empresa) => (
                      <SelectItem key={empresa.id} value={empresa.id}>
                        {empresa.razaoSocial}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Ambiente</Label>
                <Select
                  value={formData.ambiente || "HOMOLOGACAO"}
                  onValueChange={(value) => setFormData({ ...formData, ambiente: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o ambiente" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HOMOLOGACAO">Homologação</SelectItem>
                    <SelectItem value="PRODUCAO">Produção</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Série</Label>
                <Input
                  value={formData.serie || ""}
                  onChange={(e) => setFormData({ ...formData, serie: e.target.value })}
                  placeholder="Série"
                />
              </div>

              <div className="space-y-2">
                <Label>Número Atual</Label>
                <Input
                  type="number"
                  value={formData.numeroAtual ?? 0}
                  onChange={(e) => setFormData({ ...formData, numeroAtual: Number(e.target.value) })}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Natureza da Operação</Label>
                <Input
                  value={formData.naturezaOperacao || ""}
                  onChange={(e) => setFormData({ ...formData, naturezaOperacao: e.target.value })}
                  placeholder="Venda de mercadoria"
                />
              </div>

              <div className="space-y-2">
                <Label>CSC ID</Label>
                <Input
                  value={formData.cscId || ""}
                  onChange={(e) => setFormData({ ...formData, cscId: e.target.value })}
                  placeholder="CSC ID"
                />
              </div>

              <div className="space-y-2">
                <Label>CSC Token</Label>
                <Input
                  value={formData.cscToken || ""}
                  onChange={(e) => setFormData({ ...formData, cscToken: e.target.value })}
                  placeholder="CSC Token"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Certificado</Label>
                <Select
                  value={formData.certificadoId || ""}
                  onValueChange={(value) => setFormData({ ...formData, certificadoId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o certificado (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Sem certificado</SelectItem>
                    {certificados.map((certificado) => (
                      <SelectItem key={certificado.id} value={certificado.id}>
                        {certificado.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2 flex items-center justify-end gap-2">
                <Link href="/nfe-config">
                  <Button variant="outline" type="button">
                    Cancelar
                  </Button>
                </Link>
                <Button type="submit" disabled={isCriando || isAtualizando || isLoadingConfig}>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditing ? "Salvar alterações" : "Cadastrar"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
