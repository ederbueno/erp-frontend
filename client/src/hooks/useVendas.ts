/**
 * Hook para gerenciamento de vendas
 * Conecta com o microserviço ms-vendas via tRPC
 */

import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export interface ItemVenda {
  produtoId: string;
  quantidade: number;
  precoUnitario: number;
}

export interface CriarVendaInput {
  clienteId: string;
  clienteNome?: string;
  clienteEmail?: string;
  cep?: string;
  metodoPagamento: 'PIX' | 'BOLETO' | 'LINK_MAQUININHA';
  itens: ItemVenda[];
}

export function useVendas() {
  const utils = trpc.useUtils();

  // Query para listar vendas
  const { 
    data: vendas, 
    isLoading, 
    error,
    refetch 
  } = trpc.vendas.listar.useQuery(undefined, {
    retry: 1,
    staleTime: 30000, // 30 segundos
  });

  // Mutation para criar venda
  const criarVendaMutation = trpc.vendas.criar.useMutation({
    onSuccess: () => {
      toast.success('Venda criada com sucesso!');
      utils.vendas.listar.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || 'Erro ao criar venda');
    },
  });

  // Mutation para atualizar status
  const atualizarStatusMutation = trpc.vendas.atualizarStatus.useMutation({
    onSuccess: () => {
      toast.success('Status atualizado com sucesso!');
      utils.vendas.listar.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || 'Erro ao atualizar status');
    },
  });

  // Mutation para deletar venda
  const deletarVendaMutation = trpc.vendas.deletar.useMutation({
    onSuccess: () => {
      toast.success('Venda deletada com sucesso!');
      utils.vendas.listar.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || 'Erro ao deletar venda');
    },
  });

  return {
    // Dados
    vendas: vendas || [],
    isLoading,
    error,
    
    // Ações
    refetch,
    criarVenda: (dados: CriarVendaInput) => criarVendaMutation.mutateAsync(dados),
    atualizarStatus: (id: string, status: string, motivo?: string) => 
      atualizarStatusMutation.mutateAsync({ id, status, motivo }),
    deletarVenda: (id: string) => deletarVendaMutation.mutateAsync({ id }),
    
    // Estados das mutations
    isCriando: criarVendaMutation.isPending,
    isAtualizando: atualizarStatusMutation.isPending,
    isDeletando: deletarVendaMutation.isPending,
  };
}

// Hook para buscar uma venda específica
export function useVenda(id: string) {
  const { data, isLoading, error } = trpc.vendas.buscar.useQuery(
    { id },
    { enabled: !!id }
  );

  return { venda: data, isLoading, error };
}
