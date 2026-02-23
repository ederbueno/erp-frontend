/**
 * Hook para gerenciamento de vendas
 * Conecta com o microserviço ms-vendas via tRPC
 */

import { useState, useCallback } from "react";
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

export function useVendas(initialPage = 1, initialLimit = 20, status?: string, search?: string) {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [currentStatus, setCurrentStatus] = useState(status);
  const [currentSearch, setCurrentSearch] = useState(search);

  const utils = trpc.useUtils();

  // Query para listar vendas com paginação
  const { 
    data: response, 
    isLoading, 
    error,
    refetch 
  } = trpc.vendas.listar.useQuery(
    { 
      page, 
      limit, 
      status: currentStatus,
      search: currentSearch 
    },
    {
      retry: 1,
      staleTime: 60000, // 60 segundos (aumentado de 30)
      gcTime: 300000,   // 5 minutos
    }
  );

  // Mutation para criar venda
  const criarVendaMutation = trpc.vendas.criar.useMutation({
    onSuccess: () => {
      toast.success('Venda criada com sucesso!');
      utils.vendas.listar.invalidate();
      setPage(1); // Volta para página 1
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

  // Handler para busca com debounce
  const handleSearch = useCallback((searchTerm: string) => {
    setCurrentSearch(searchTerm);
    setPage(1);
  }, []);

  // Handler para filtro de status
  const handleStatusFilter = useCallback((newStatus: string) => {
    setCurrentStatus(newStatus === 'Todos' ? undefined : newStatus);
    setPage(1);
  }, []);

  // Handler para mudança de página
  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  // Handler para mudança de limite
  const handleLimitChange = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  }, []);

  // Extrair dados e paginação da resposta
  const vendas = response?.data || [];
  const pagination = response?.pagination || {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  };

  return {
    // Dados
    vendas,
    pagination,
    isLoading,
    error,
    
    // Ações
    refetch,
    criarVenda: (dados: CriarVendaInput) => criarVendaMutation.mutateAsync(dados),
    atualizarStatus: (id: string, status: string, motivo?: string) => 
      atualizarStatusMutation.mutateAsync({ id, status, motivo }),
    deletarVenda: (id: string) => deletarVendaMutation.mutateAsync({ id }),
    
    // Filtros e busca
    handleSearch,
    handleStatusFilter,
    handlePageChange,
    handleLimitChange,
    
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
