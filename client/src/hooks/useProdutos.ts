/**
 * Hook para gerenciamento de produtos/estoque
 * Conecta com o microserviço ms-estoque via tRPC
 */

import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export interface CriarProdutoInput {
  codigo?: string;
  nome: string;
  categoria?: string;
  quantidade: number;
  preco?: number;
}

export interface AtualizarProdutoInput {
  codigo?: string;
  nome?: string;
  categoria?: string;
  quantidade?: number;
  preco?: number;
}

export function useProdutos() {
  const utils = trpc.useUtils();

  // Query para listar produtos
  const { 
    data: produtos, 
    isLoading, 
    error,
    refetch 
  } = trpc.produtos.listar.useQuery(undefined, {
    retry: 1,
    staleTime: 30000, // 30 segundos
  });

  // Mutation para criar produto
  const criarProdutoMutation = trpc.produtos.criar.useMutation({
    onSuccess: () => {
      toast.success('Produto criado com sucesso!');
      utils.produtos.listar.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || 'Erro ao criar produto');
    },
  });

  // Mutation para atualizar produto
  const atualizarProdutoMutation = trpc.produtos.atualizar.useMutation({
    onSuccess: () => {
      toast.success('Produto atualizado com sucesso!');
      utils.produtos.listar.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || 'Erro ao atualizar produto');
    },
  });

  // Mutation para deletar produto
  const deletarProdutoMutation = trpc.produtos.deletar.useMutation({
    onSuccess: () => {
      toast.success('Produto deletado com sucesso!');
      utils.produtos.listar.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || 'Erro ao deletar produto');
    },
  });

  // Calcular estatísticas
  const estatisticas = {
    total: produtos?.length || 0,
    valorEmEstoque: produtos?.reduce((acc, p) => acc + ((p.preco || 0) * p.quantidade), 0) || 0,
    estoqueBaixo: produtos?.filter(p => p.quantidade < 20).length || 0,
  };

  return {
    // Dados
    produtos: produtos || [],
    isLoading,
    error,
    estatisticas,
    
    // Ações
    refetch,
    criarProduto: (dados: CriarProdutoInput) => criarProdutoMutation.mutateAsync(dados),
    atualizarProduto: (id: string, dados: AtualizarProdutoInput) => 
      atualizarProdutoMutation.mutateAsync({ id, dados }),
    deletarProduto: (id: string) => deletarProdutoMutation.mutateAsync({ id }),
    
    // Estados das mutations
    isCriando: criarProdutoMutation.isPending,
    isAtualizando: atualizarProdutoMutation.isPending,
    isDeletando: deletarProdutoMutation.isPending,
  };
}

// Hook para buscar um produto específico
export function useProduto(id: string) {
  const { data, isLoading, error } = trpc.produtos.buscar.useQuery(
    { id },
    { enabled: !!id }
  );

  return { produto: data, isLoading, error };
}
