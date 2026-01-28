/**
 * EmpresaForm - Cadastro/edição de empresa emissora
 */

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Building2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "wouter";
import { toast } from "sonner";
import { useEmpresas, CriarEmpresaInput } from "@/hooks/useEmpresas";
import { trpc } from "@/lib/trpc";

const maskCNPJ = (value: string) => {
  return value
    .replace(/\D/g, "")
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2")
    .substring(0, 18);
};

const maskPhone = (value: string) => {
  return value
    .replace(/\D/g, "")
    .replace(/^(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{4,5})(\d{4})$/, "$1-$2")
    .substring(0, 15);
};

const maskCEP = (value: string) => {
  return value
    .replace(/\D/g, "")
    .replace(/^(\d{5})(\d)/, "$1-$2")
    .substring(0, 9);
};

const unmask = (value: string) => value.replace(/\D/g, "");

export default function EmpresaForm() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { criarEmpresa, atualizarEmpresa, isCriando, isAtualizando } = useEmpresas();
  const criarEnderecoMutation = trpc.enderecos.criar.useMutation();
  const atualizarEnderecoMutation = trpc.enderecos.atualizar.useMutation();

  const isEditing = !!params.id;
  const empresaId = params.id as string | undefined;

  const { data: empresaExistente, isLoading: isLoadingEmpresa } =
    trpc.empresas.buscar.useQuery(
      { id: empresaId! },
      { enabled: isEditing && !!empresaId }
    );

  const [formData, setFormData] = useState<CriarEmpresaInput>({
    razaoSocial: "",
    nomeFantasia: "",
    cnpj: "",
    inscricaoEstadual: "",
    inscricaoMunicipal: "",
    regimeTributario: "",
    email: "",
    telefone: "",
    enderecoId: undefined,
  });

  const [endereco, setEndereco] = useState({
    cep: "",
    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
  });

  useEffect(() => {
    if (empresaExistente) {
      setFormData({
        razaoSocial: empresaExistente.razaoSocial || "",
        nomeFantasia: empresaExistente.nomeFantasia || "",
        cnpj: empresaExistente.cnpj || "",
        inscricaoEstadual: empresaExistente.inscricaoEstadual || "",
        inscricaoMunicipal: empresaExistente.inscricaoMunicipal || "",
        regimeTributario: empresaExistente.regimeTributario || "",
        email: empresaExistente.email || "",
        telefone: empresaExistente.telefone || "",
        enderecoId: empresaExistente.enderecoId || undefined,
      });

      if (empresaExistente.endereco) {
        setEndereco({
          cep: empresaExistente.endereco.cep || "",
          logradouro: empresaExistente.endereco.logradouro || "",
          numero: empresaExistente.endereco.numero || "",
          complemento: empresaExistente.endereco.complemento || "",
          bairro: empresaExistente.endereco.bairro || "",
          cidade: empresaExistente.endereco.cidade || "",
          estado: empresaExistente.endereco.estado || "",
        });
      }
    }
  }, [empresaExistente]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.razaoSocial || formData.razaoSocial.length < 3) {
      toast.error("Razão social é obrigatória");
      return;
    }

    const cnpj = unmask(formData.cnpj || "");
    if (cnpj.length !== 14) {
      toast.error("CNPJ deve ter 14 dígitos");
      return;
    }

    let enderecoId = formData.enderecoId;
    const enderecoPreenchido = Object.values(endereco).some((value) => value);

    try {
      if (enderecoPreenchido) {
        if (enderecoId) {
          await atualizarEnderecoMutation.mutateAsync({
            id: enderecoId,
            dados: {
              ...endereco,
              cep: endereco.cep ? maskCEP(endereco.cep) : undefined,
              estado: endereco.estado || undefined,
            },
          });
        } else {
          const created = await criarEnderecoMutation.mutateAsync({
            ...endereco,
            cep: endereco.cep ? maskCEP(endereco.cep) : undefined,
            estado: endereco.estado || undefined,
          });
          enderecoId = created.id;
        }
      }

      const payload: CriarEmpresaInput = {
        ...formData,
        cnpj,
        telefone: formData.telefone ? maskPhone(formData.telefone) : undefined,
        enderecoId,
      };

      if (isEditing && empresaId) {
        await atualizarEmpresa(empresaId, payload);
      } else {
        await criarEmpresa(payload);
      }

      setLocation("/empresas");
    } catch (error) {
      // erros já tratados no hook
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <Link href="/empresas">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {isEditing ? "Editar empresa" : "Nova empresa"}
            </h1>
            <p className="text-muted-foreground">Cadastro de empresa emissora</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Dados da empresa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSubmit}>
              <div className="space-y-2 md:col-span-2">
                <Label>Razão Social</Label>
                <Input
                  value={formData.razaoSocial}
                  onChange={(e) => setFormData({ ...formData, razaoSocial: e.target.value })}
                  placeholder="Razão Social"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Nome Fantasia</Label>
                <Input
                  value={formData.nomeFantasia || ""}
                  onChange={(e) => setFormData({ ...formData, nomeFantasia: e.target.value })}
                  placeholder="Nome Fantasia"
                />
              </div>

              <div className="space-y-2">
                <Label>CNPJ</Label>
                <Input
                  value={maskCNPJ(formData.cnpj || "")}
                  onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                  placeholder="00.000.000/0000-00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Inscrição Estadual</Label>
                <Input
                  value={formData.inscricaoEstadual || ""}
                  onChange={(e) => setFormData({ ...formData, inscricaoEstadual: e.target.value })}
                  placeholder="Inscrição Estadual"
                />
              </div>

              <div className="space-y-2">
                <Label>Inscrição Municipal</Label>
                <Input
                  value={formData.inscricaoMunicipal || ""}
                  onChange={(e) => setFormData({ ...formData, inscricaoMunicipal: e.target.value })}
                  placeholder="Inscrição Municipal"
                />
              </div>

              <div className="space-y-2">
                <Label>Regime Tributário</Label>
                <Input
                  value={formData.regimeTributario || ""}
                  onChange={(e) => setFormData({ ...formData, regimeTributario: e.target.value })}
                  placeholder="Simples, Lucro Presumido..."
                />
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@empresa.com"
                />
              </div>

              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input
                  value={maskPhone(formData.telefone || "")}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div className="md:col-span-2">
                <h3 className="text-sm font-medium text-muted-foreground">Endereço</h3>
              </div>

              <div className="space-y-2">
                <Label>CEP</Label>
                <Input
                  value={maskCEP(endereco.cep || "")}
                  onChange={(e) => setEndereco({ ...endereco, cep: e.target.value })}
                  placeholder="00000-000"
                />
              </div>

              <div className="space-y-2">
                <Label>Logradouro</Label>
                <Input
                  value={endereco.logradouro}
                  onChange={(e) => setEndereco({ ...endereco, logradouro: e.target.value })}
                  placeholder="Rua, Avenida..."
                />
              </div>

              <div className="space-y-2">
                <Label>Número</Label>
                <Input
                  value={endereco.numero}
                  onChange={(e) => setEndereco({ ...endereco, numero: e.target.value })}
                  placeholder="Número"
                />
              </div>

              <div className="space-y-2">
                <Label>Complemento</Label>
                <Input
                  value={endereco.complemento}
                  onChange={(e) => setEndereco({ ...endereco, complemento: e.target.value })}
                  placeholder="Complemento"
                />
              </div>

              <div className="space-y-2">
                <Label>Bairro</Label>
                <Input
                  value={endereco.bairro}
                  onChange={(e) => setEndereco({ ...endereco, bairro: e.target.value })}
                  placeholder="Bairro"
                />
              </div>

              <div className="space-y-2">
                <Label>Cidade</Label>
                <Input
                  value={endereco.cidade}
                  onChange={(e) => setEndereco({ ...endereco, cidade: e.target.value })}
                  placeholder="Cidade"
                />
              </div>

              <div className="space-y-2">
                <Label>Estado</Label>
                <Input
                  value={endereco.estado}
                  onChange={(e) => setEndereco({ ...endereco, estado: e.target.value.toUpperCase() })}
                  placeholder="UF"
                  maxLength={2}
                />
              </div>

              <div className="md:col-span-2 flex items-center justify-end gap-2">
                <Link href="/empresas">
                  <Button variant="outline" type="button">
                    Cancelar
                  </Button>
                </Link>
                <Button type="submit" disabled={isCriando || isAtualizando || isLoadingEmpresa}>
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
