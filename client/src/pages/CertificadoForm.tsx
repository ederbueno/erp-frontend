/**
 * CertificadoForm - Cadastro/edição de certificado digital
 */

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, FileKey2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "wouter";
import { toast } from "sonner";
import { CriarCertificadoInput, useCertificados } from "@/hooks/useCertificados";
import { trpc } from "@/lib/trpc";

export default function CertificadoForm() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { criarCertificado, atualizarCertificado, isCriando, isAtualizando } = useCertificados();

  const isEditing = !!params.id;
  const certificadoId = params.id as string | undefined;

  const { data: certificadoExistente, isLoading: isLoadingCertificado } =
    trpc.certificados.buscar.useQuery(
      { id: certificadoId! },
      { enabled: isEditing && !!certificadoId }
    );

  const [formData, setFormData] = useState<CriarCertificadoInput>({
    nome: "",
    senha: "",
    arquivoBase64: "",
    validoAte: "",
  });

  useEffect(() => {
    if (certificadoExistente) {
      setFormData({
        nome: certificadoExistente.nome || "",
        senha: certificadoExistente.senha || "",
        arquivoBase64: certificadoExistente.arquivoBase64 || "",
        validoAte: certificadoExistente.validoAte
          ? new Date(certificadoExistente.validoAte).toISOString().slice(0, 10)
          : "",
      });
    }
  }, [certificadoExistente]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nome) {
      toast.error("Nome é obrigatório");
      return;
    }

    if (!formData.senha) {
      toast.error("Senha é obrigatória");
      return;
    }

    if (!formData.arquivoBase64) {
      toast.error("Arquivo Base64 é obrigatório");
      return;
    }

    try {
      if (isEditing && certificadoId) {
        await atualizarCertificado(certificadoId, formData);
      } else {
        await criarCertificado(formData);
      }
      setLocation("/certificados");
    } catch (error) {
      // erros já tratados no hook
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <Link href="/certificados">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {isEditing ? "Editar certificado" : "Novo certificado"}
            </h1>
            <p className="text-muted-foreground">Cadastro de certificado digital</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileKey2 className="h-5 w-5" />
              Dados do certificado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid grid-cols-1 gap-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Nome do certificado"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Senha</Label>
                <Input
                  type="password"
                  value={formData.senha}
                  onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                  placeholder="Senha do certificado"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Validade</Label>
                <Input
                  type="date"
                  value={formData.validoAte || ""}
                  onChange={(e) => setFormData({ ...formData, validoAte: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Arquivo Base64 (PFX)</Label>
                <Textarea
                  value={formData.arquivoBase64}
                  onChange={(e) => setFormData({ ...formData, arquivoBase64: e.target.value })}
                  placeholder="Cole o conteúdo Base64 do PFX"
                  rows={6}
                />
              </div>

              <div className="flex items-center justify-end gap-2">
                <Link href="/certificados">
                  <Button variant="outline" type="button">
                    Cancelar
                  </Button>
                </Link>
                <Button type="submit" disabled={isCriando || isAtualizando || isLoadingCertificado}>
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
