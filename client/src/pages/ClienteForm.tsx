/**
 * ClienteForm - Formulário de cadastro/edição de cliente
 * Com validação, máscaras e busca de CEP via ViaCEP
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
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Building2, Loader2, MapPin, Save, User } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "wouter";
import { toast } from "sonner";
import {
  CriarClienteInput,
  useClientes,
} from "@/hooks/useClientes";
import { trpc } from "@/lib/trpc";

// Utilitários de máscara
const maskCPF = (value: string) => {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
    .substring(0, 14);
};

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

// Validações
const validarCPF = (cpf: string): boolean => {
  const num = unmask(cpf);
  if (num.length !== 11) return false;
  // Validação simplificada
  if (/^(\d)\1+$/.test(num)) return false;
  return true;
};

const validarCNPJ = (cnpj: string): boolean => {
  const num = unmask(cnpj);
  if (num.length !== 14) return false;
  // Validação simplificada
  if (/^(\d)\1+$/.test(num)) return false;
  return true;
};

export default function ClienteForm() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { criarCliente, atualizarCliente, isCriando, isAtualizando } =
    useClientes();

  const isEditing = !!params.id;
  const clienteId = params.id as string | undefined;

  // Buscar cliente se estiver editando
  const { data: clienteExistente, isLoading: isLoadingCliente } =
    trpc.clientes.buscar.useQuery(
      { id: clienteId! },
      { enabled: isEditing && !!clienteId }
    );

  const [isLoadingCEP, setIsLoadingCEP] = useState(false);
  const [formData, setFormData] = useState<CriarClienteInput>({
    tipo: "FISICA",
    nome: "",
    nomeFantasia: "",
    documento: "",
    email: "",
    telefone: "",
    telefoneComercial: "",
    cep: "",
    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
    observacoes: "",
  });

  // Carregar dados do cliente ao editar
  useEffect(() => {
    if (clienteExistente) {
      setFormData({
        tipo: clienteExistente.tipo,
        nome: clienteExistente.nome || "",
        nomeFantasia: clienteExistente.nomeFantasia || "",
        documento: clienteExistente.documento || "",
        email: clienteExistente.email || "",
        telefone: clienteExistente.telefone || "",
        telefoneComercial: clienteExistente.telefoneComercial || "",
        cep: clienteExistente.cep || "",
        logradouro: clienteExistente.logradouro || "",
        numero: clienteExistente.numero || "",
        complemento: clienteExistente.complemento || "",
        bairro: clienteExistente.bairro || "",
        cidade: clienteExistente.cidade || "",
        estado: clienteExistente.estado || "",
        observacoes: clienteExistente.observacoes || "",
      });
    }
  }, [clienteExistente]);

  const handleBuscarCEP = async (cep: string) => {
    const cepLimpo = unmask(cep);
    if (cepLimpo.length !== 8) return;

    setIsLoadingCEP(true);
    try {
      const response = await fetch(
        `https://viacep.com.br/ws/${cepLimpo}/json/`
      );
      const data = await response.json();

      if (data.erro) {
        toast.error("CEP não encontrado");
        return;
      }

      setFormData((prev) => ({
        ...prev,
        logradouro: data.logradouro || "",
        bairro: data.bairro || "",
        cidade: data.localidade || "",
        estado: data.uf || "",
      }));

      toast.success("Endereço encontrado!");
    } catch (error) {
      toast.error("Erro ao buscar CEP");
    } finally {
      setIsLoadingCEP(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validações
    if (!formData.nome.trim()) {
      toast.error("Nome/Razão Social é obrigatório");
      return;
    }

    if (!formData.documento) {
      toast.error("CPF/CNPJ é obrigatório");
      return;
    }

    const documentoLimpo = unmask(formData.documento);
    if (formData.tipo === "FISICA") {
      if (!validarCPF(formData.documento)) {
        toast.error("CPF inválido");
        return;
      }
    } else {
      if (!validarCNPJ(formData.documento)) {
        toast.error("CNPJ inválido");
        return;
      }
    }

    if (!formData.email || !formData.email.includes("@")) {
      toast.error("Email inválido");
      return;
    }

    // Preparar dados para envio (sem máscaras)
    const dados = {
      ...formData,
      documento: documentoLimpo,
      telefone: formData.telefone ? maskPhone(formData.telefone) : undefined,
      telefoneComercial: formData.telefoneComercial
        ? maskPhone(formData.telefoneComercial)
        : undefined,
      cep: formData.cep ? maskCEP(formData.cep) : undefined,
    };

    try {
      if (isEditing && clienteId) {
        await atualizarCliente(clienteId, dados);
      } else {
        await criarCliente(dados);
      }
      setLocation("/clientes");
    } catch (error) {
      // Erro já tratado no hook
    }
  };

  if (isLoadingCliente) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
            <p className="text-muted-foreground">Carregando cliente...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/clientes">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {isEditing ? "Editar Cliente" : "Novo Cliente"}
            </h1>
            <p className="text-muted-foreground">
              {isEditing
                ? "Atualize os dados do cliente"
                : "Preencha os dados para cadastrar um novo cliente"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tipo de Cliente */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {formData.tipo === "FISICA" ? (
                  <User className="h-5 w-5" />
                ) : (
                  <Building2 className="h-5 w-5" />
                )}
                Tipo de Cliente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={formData.tipo}
                onValueChange={(value: "FISICA" | "JURIDICA") =>
                  setFormData((prev) => ({ ...prev, tipo: value }))
                }
                disabled={isEditing}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FISICA">Pessoa Física (CPF)</SelectItem>
                  <SelectItem value="JURIDICA">
                    Pessoa Jurídica (CNPJ)
                  </SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Dados Básicos */}
          <Card>
            <CardHeader>
              <CardTitle>Dados Básicos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nome">
                    {formData.tipo === "FISICA"
                      ? "Nome Completo *"
                      : "Razão Social *"}
                  </Label>
                  <Input
                    id="nome"
                    placeholder={
                      formData.tipo === "FISICA"
                        ? "João Silva Santos"
                        : "Empresa LTDA"
                    }
                    value={formData.nome}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, nome: e.target.value }))
                    }
                    required
                  />
                </div>

                {formData.tipo === "JURIDICA" && (
                  <div className="space-y-2">
                    <Label htmlFor="nomeFantasia">Nome Fantasia</Label>
                    <Input
                      id="nomeFantasia"
                      placeholder="Nome do estabelecimento"
                      value={formData.nomeFantasia}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          nomeFantasia: e.target.value,
                        }))
                      }
                    />
                  </div>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="documento">
                    {formData.tipo === "FISICA" ? "CPF *" : "CNPJ *"}
                  </Label>
                  <Input
                    id="documento"
                    placeholder={
                      formData.tipo === "FISICA"
                        ? "000.000.000-00"
                        : "00.000.000/0000-00"
                    }
                    value={
                      formData.tipo === "FISICA"
                        ? maskCPF(formData.documento)
                        : maskCNPJ(formData.documento)
                    }
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        documento: e.target.value,
                      }))
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, email: e.target.value }))
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    placeholder="(00) 00000-0000"
                    value={maskPhone(formData.telefone || "")}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        telefone: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefoneComercial">Telefone Comercial</Label>
                  <Input
                    id="telefoneComercial"
                    placeholder="(00) 0000-0000"
                    value={maskPhone(formData.telefoneComercial || "")}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        telefoneComercial: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Endereço */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Endereço
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="cep">CEP</Label>
                  <div className="flex gap-2">
                    <Input
                      id="cep"
                      placeholder="00000-000"
                      value={maskCEP(formData.cep || "")}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, cep: e.target.value }))
                      }
                      onBlur={(e) => handleBuscarCEP(e.target.value)}
                    />
                    {isLoadingCEP && <Loader2 className="h-5 w-5 animate-spin" />}
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="logradouro">Logradouro</Label>
                  <Input
                    id="logradouro"
                    placeholder="Rua, Avenida..."
                    value={formData.logradouro}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        logradouro: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="numero">Número</Label>
                  <Input
                    id="numero"
                    placeholder="123"
                    value={formData.numero}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, numero: e.target.value }))
                    }
                  />
                </div>

                <div className="space-y-2 md:col-span-3">
                  <Label htmlFor="complemento">Complemento</Label>
                  <Input
                    id="complemento"
                    placeholder="Apto, Sala, Bloco..."
                    value={formData.complemento}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        complemento: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="bairro">Bairro</Label>
                  <Input
                    id="bairro"
                    placeholder="Centro"
                    value={formData.bairro}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, bairro: e.target.value }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input
                    id="cidade"
                    placeholder="São Paulo"
                    value={formData.cidade}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, cidade: e.target.value }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estado">Estado (UF)</Label>
                  <Input
                    id="estado"
                    placeholder="SP"
                    maxLength={2}
                    value={formData.estado}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        estado: e.target.value.toUpperCase(),
                      }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Observações */}
          <Card>
            <CardHeader>
              <CardTitle>Observações</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Informações adicionais sobre o cliente..."
                value={formData.observacoes}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    observacoes: e.target.value,
                  }))
                }
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Ações */}
          <div className="flex items-center gap-4">
            <Button
              type="submit"
              size="lg"
              disabled={isCriando || isAtualizando}
            >
              {isCriando || isAtualizando ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2" />
                  {isEditing ? "Atualizar" : "Cadastrar"}
                </>
              )}
            </Button>
            <Link href="/clientes">
              <Button type="button" variant="outline" size="lg">
                Cancelar
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
