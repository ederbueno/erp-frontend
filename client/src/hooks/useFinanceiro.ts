/**
 * Hook para gerenciamento financeiro
 * Conecta com o microserviço ms-financeiro via tRPC
 */

import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export function useFinanceiro() {
  const utils = trpc.useUtils();

  // Mutation para confirmar pagamento
  const confirmarPagamentoMutation = trpc.financeiro.confirmarPagamento.useMutation({
    onSuccess: () => {
      toast.success('Pagamento confirmado com sucesso!');
      // Invalida também as vendas pois o status pode ter mudado
      utils.vendas.listar.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || 'Erro ao confirmar pagamento');
    },
  });

  return {
    // Ações
    confirmarPagamento: (vendaId: string) => 
      confirmarPagamentoMutation.mutateAsync({ vendaId }),
    
    // Estados
    isConfirmando: confirmarPagamentoMutation.isPending,
  };
}

// Hook para buscar status de pagamento de uma venda
export function useStatusPagamento(vendaId: string) {
  const { data, isLoading, error, refetch } = trpc.financeiro.statusPagamento.useQuery(
    { vendaId },
    { 
      enabled: !!vendaId,
      retry: 1,
    }
  );

  return { 
    statusPagamento: data, 
    isLoading, 
    error,
    refetch,
  };
}
