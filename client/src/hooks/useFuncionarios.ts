/**
 * Hook para gerenciamento de funcionários
 * Conecta com o microserviço ms-cadastro via tRPC
 */

import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export interface Funcionario {
  id: string;
  nome: string;
  documento: string;
  email: string;
  telefone?: string;
  cargo?: string;
  departamento?: string;
  salario?: number;
  status: "ATIVO" | "INATIVO";
  observacoes?: string;
  criadoEm: string;
  atualizadoEm: string;
  deletadoEm?: string | null;
}

export interface CriarFuncionarioInput {
  nome: string;
  documento: string;
  email: string;
  telefone?: string;
  cargo?: string;
  departamento?: string;
  salario?: number;
  observacoes?: string;
}

export interface AtualizarFuncionarioInput extends Partial<CriarFuncionarioInput> {
  status?: "ATIVO" | "INATIVO";
}

export function useFuncionarios() {
  const utils = trpc.useUtils();

  const {
    data: funcionarios,
    isLoading,
    error,
    refetch,
  } = trpc.funcionarios.listar.useQuery(undefined, {
    retry: 1,
    staleTime: 30000,
  });

  const buscarFuncionarioMutation = trpc.funcionarios.buscar.useQuery;

  const criarFuncionarioMutation = trpc.funcionarios.criar.useMutation({
    onSuccess: () => {
      toast.success("Funcionário criado com sucesso!");
      utils.funcionarios.listar.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao criar funcionário");
    },
  });

  const atualizarFuncionarioMutation = trpc.funcionarios.atualizar.useMutation({
    onSuccess: () => {
      toast.success("Funcionário atualizado com sucesso!");
      utils.funcionarios.listar.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar funcionário");
    },
  });

  const atualizarStatusMutation = trpc.funcionarios.atualizarStatus.useMutation({
    onSuccess: () => {
      toast.success("Status atualizado com sucesso!");
      utils.funcionarios.listar.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar status");
    },
  });

  const deletarFuncionarioMutation = trpc.funcionarios.deletar.useMutation({
    onSuccess: () => {
      toast.success("Funcionário deletado com sucesso!");
      utils.funcionarios.listar.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao deletar funcionário");
    },
  });

  return {
    funcionarios: funcionarios || [],
    isLoading,
    error,

    refetch,
    buscarFuncionario: (id: string) =>
      buscarFuncionarioMutation({ id }, { enabled: false }),
    criarFuncionario: (dados: CriarFuncionarioInput) =>
      criarFuncionarioMutation.mutateAsync(dados),
    atualizarFuncionario: (id: string, dados: AtualizarFuncionarioInput) =>
      atualizarFuncionarioMutation.mutateAsync({ id, dados }),
    atualizarStatus: (id: string, status: "ATIVO" | "INATIVO") =>
      atualizarStatusMutation.mutateAsync({ id, status }),
    deletarFuncionario: (id: string) =>
      deletarFuncionarioMutation.mutateAsync({ id }),

    isCriando: criarFuncionarioMutation.isPending,
    isAtualizando: atualizarFuncionarioMutation.isPending,
    isDeletando: deletarFuncionarioMutation.isPending,
  };
}
