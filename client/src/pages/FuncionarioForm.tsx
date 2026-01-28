/**
 * FuncionarioForm - Formulário de cadastro/edição de funcionário
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
import { ArrowLeft, Save, User } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "wouter";
import { toast } from "sonner";
import { CriarFuncionarioInput, useFuncionarios } from "@/hooks/useFuncionarios";
import { trpc } from "@/lib/trpc";

const maskCPF = (value: string) => {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
    .substring(0, 14);
};

const maskPhone = (value: string) => {
  return value
    .replace(/\D/g, "")
    .replace(/^(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{4,5})(\d{4})$/, "$1-$2")
    .substring(0, 15);
};

const unmask = (value: string) => value.replace(/\D/g, "");

export default function FuncionarioForm() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { criarFuncionario, atualizarFuncionario, isCriando, isAtualizando } =
    useFuncionarios();

  const isEditing = !!params.id;
  const funcionarioId = params.id as string | undefined;

  const { data: funcionarioExistente, isLoading: isLoadingFuncionario } =
    trpc.funcionarios.buscar.useQuery(
      { id: funcionarioId! },
      { enabled: isEditing && !!funcionarioId }
    );

  const [formData, setFormData] = useState<CriarFuncionarioInput>({
    nome: "",
    documento: "",
    email: "",
    telefone: "",
    cargo: "",
    departamento: "",
    salario: undefined,
    observacoes: "",
  });

  const [status, setStatus] = useState<"ATIVO" | "INATIVO">("ATIVO");

  useEffect(() => {
    if (funcionarioExistente) {
      setFormData({
        nome: funcionarioExistente.nome || "",
        documento: funcionarioExistente.documento || "",
        email: funcionarioExistente.email || "",
        telefone: funcionarioExistente.telefone || "",
        cargo: funcionarioExistente.cargo || "",
        departamento: funcionarioExistente.departamento || "",
        salario: funcionarioExistente.salario || undefined,
        observacoes: funcionarioExistente.observacoes || "",
      });
      setStatus(funcionarioExistente.status || "ATIVO");
    }
  }, [funcionarioExistente]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nome || formData.nome.length < 3) {
      toast.error("Nome deve ter pelo menos 3 caracteres");
      return;
    }

    const cpf = unmask(formData.documento || "");
    if (cpf.length !== 11) {
      toast.error("CPF deve ter 11 dígitos");
      return;
    }

    if (!formData.email) {
      toast.error("Email é obrigatório");
      return;
    }

    const payload: CriarFuncionarioInput = {
      ...formData,
      documento: cpf,
      telefone: formData.telefone ? maskPhone(formData.telefone) : undefined,
      salario: formData.salario ? Number(formData.salario) : undefined,
    };

    try {
      if (isEditing && funcionarioId) {
        await atualizarFuncionario(funcionarioId, {
          ...payload,
          status,
        });
      } else {
        await criarFuncionario(payload);
      }
      setLocation("/funcionarios");
    } catch (error) {
      // erro já tratado no hook
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <Link href="/funcionarios">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {isEditing ? "Editar funcionário" : "Novo funcionário"}
            </h1>
            <p className="text-muted-foreground">
              Preencha os dados do funcionário
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Dados do funcionário
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Nome completo"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>CPF</Label>
                <Input
                  value={maskCPF(formData.documento || "")}
                  onChange={(e) => setFormData({ ...formData, documento: e.target.value })}
                  placeholder="000.000.000-00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@empresa.com"
                  required
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

              <div className="space-y-2">
                <Label>Cargo</Label>
                <Input
                  value={formData.cargo || ""}
                  onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                  placeholder="Cargo"
                />
              </div>

              <div className="space-y-2">
                <Label>Departamento</Label>
                <Input
                  value={formData.departamento || ""}
                  onChange={(e) => setFormData({ ...formData, departamento: e.target.value })}
                  placeholder="Departamento"
                />
              </div>

              <div className="space-y-2">
                <Label>Salário</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.salario ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      salario: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  placeholder="0,00"
                />
              </div>

              {isEditing && (
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={status} onValueChange={(value) => setStatus(value as "ATIVO" | "INATIVO")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ATIVO">Ativo</SelectItem>
                      <SelectItem value="INATIVO">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2 md:col-span-2">
                <Label>Observações</Label>
                <Textarea
                  value={formData.observacoes || ""}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  placeholder="Observações adicionais"
                  rows={4}
                />
              </div>

              <div className="md:col-span-2 flex items-center justify-end gap-2">
                <Link href="/funcionarios">
                  <Button variant="outline" type="button">
                    Cancelar
                  </Button>
                </Link>
                <Button type="submit" disabled={isCriando || isAtualizando || isLoadingFuncionario}>
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
