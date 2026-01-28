/**
 * Hook para gerenciamento de clientes
 * Conecta com o microserviço ms-clientes via tRPC
 */

import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export interface Cliente {
  id: string;
  tipo: "FISICA" | "JURIDICA";
  nome: string;
  nomeFantasia?: string;
  documento: string;
  email: string;
  telefone?: string;
  telefoneComercial?: string;
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  status: "ATIVO" | "INATIVO";
  observacoes?: string;
  criadoEm: string;
  atualizadoEm: string;
  deletadoEm?: string | null;
}

export interface CriarClienteInput {
  tipo: "FISICA" | "JURIDICA";
  nome: string;
  nomeFantasia?: string;
  documento: string;
  email: string;
  telefone?: string;
  telefoneComercial?: string;
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  observacoes?: string;
}

export interface AtualizarClienteInput extends Partial<CriarClienteInput> {
  status?: "ATIVO" | "INATIVO";
}

export function useClientes() {
  const utils = trpc.useUtils();

  // Query para listar clientes
  const {
    data: clientes,
    isLoading,
    error,
    refetch,
  } = trpc.clientes.listar.useQuery(undefined, {
    retry: 1,
    staleTime: 30000, // 30 segundos
  });

  // Query para buscar cliente específico
  const buscarClienteMutation = trpc.clientes.buscar.useQuery;

  // Mutation para criar cliente
  const criarClienteMutation = trpc.clientes.criar.useMutation({
    onSuccess: () => {
      toast.success("Cliente criado com sucesso!");
      utils.clientes.listar.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao criar cliente");
    },
  });

  // Mutation para atualizar cliente
  const atualizarClienteMutation = trpc.clientes.atualizar.useMutation({
    onSuccess: () => {
      toast.success("Cliente atualizado com sucesso!");
      utils.clientes.listar.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar cliente");
    },
  });

  // Mutation para atualizar status
  const atualizarStatusMutation = trpc.clientes.atualizarStatus.useMutation({
    onSuccess: () => {
      toast.success("Status atualizado com sucesso!");
      utils.clientes.listar.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar status");
    },
  });

  // Mutation para deletar cliente
  const deletarClienteMutation = trpc.clientes.deletar.useMutation({
    onSuccess: () => {
      toast.success("Cliente deletado com sucesso!");
      utils.clientes.listar.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao deletar cliente");
    },
  });

  return {
    // Dados
    clientes: clientes || [],
    isLoading,
    error,

    // Ações
    refetch,
    buscarCliente: (id: string) =>
      buscarClienteMutation({ id }, { enabled: false }),
    criarCliente: (dados: CriarClienteInput) =>
      criarClienteMutation.mutateAsync(dados),
    atualizarCliente: (id: string, dados: AtualizarClienteInput) =>
      atualizarClienteMutation.mutateAsync({ id, dados }),
    atualizarStatus: (id: string, status: "ATIVO" | "INATIVO") =>
      atualizarStatusMutation.mutateAsync({ id, status }),
    deletarCliente: (id: string) =>
      deletarClienteMutation.mutateAsync({ id }),

    // Loading states
    isCriando: criarClienteMutation.isPending,
    isAtualizando: atualizarClienteMutation.isPending,
    isDeletando: deletarClienteMutation.isPending,
  };
}
