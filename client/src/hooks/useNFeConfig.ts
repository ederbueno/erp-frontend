/**
 * Hook para gerenciamento de configurações NFe
 */

import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export interface NFeConfig {
  id: string;
  ambiente: "HOMOLOGACAO" | "PRODUCAO";
  serie?: string;
  numeroAtual: number;
  naturezaOperacao?: string;
  cscToken?: string;
  cscId?: string;
  empresaId: string;
  certificadoId?: string | null;
  criadoEm: string;
  atualizadoEm: string;
}

export interface CriarNFeConfigInput {
  ambiente?: "HOMOLOGACAO" | "PRODUCAO";
  serie?: string;
  numeroAtual?: number;
  naturezaOperacao?: string;
  cscToken?: string;
  cscId?: string;
  empresaId: string;
  certificadoId?: string;
}

export interface AtualizarNFeConfigInput extends Partial<CriarNFeConfigInput> {}

export function useNFeConfig() {
  const utils = trpc.useUtils();

  const {
    data: configs,
    isLoading,
    error,
    refetch,
  } = trpc.nfeConfig.listar.useQuery(undefined, {
    retry: 1,
    staleTime: 30000,
  });

  const buscarConfigMutation = trpc.nfeConfig.buscar.useQuery;

  const criarConfigMutation = trpc.nfeConfig.criar.useMutation({
    onSuccess: () => {
      toast.success("Configuração NFe criada com sucesso!");
      utils.nfeConfig.listar.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao criar configuração NFe");
    },
  });

  const atualizarConfigMutation = trpc.nfeConfig.atualizar.useMutation({
    onSuccess: () => {
      toast.success("Configuração NFe atualizada com sucesso!");
      utils.nfeConfig.listar.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar configuração NFe");
    },
  });

  const deletarConfigMutation = trpc.nfeConfig.deletar.useMutation({
    onSuccess: () => {
      toast.success("Configuração NFe deletada com sucesso!");
      utils.nfeConfig.listar.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao deletar configuração NFe");
    },
  });

  return {
    configs: configs || [],
    isLoading,
    error,

    refetch,
    buscarConfig: (id: string) => buscarConfigMutation({ id }, { enabled: false }),
    criarConfig: (dados: CriarNFeConfigInput) => criarConfigMutation.mutateAsync(dados),
    atualizarConfig: (id: string, dados: AtualizarNFeConfigInput) =>
      atualizarConfigMutation.mutateAsync({ id, dados }),
    deletarConfig: (id: string) => deletarConfigMutation.mutateAsync({ id }),

    isCriando: criarConfigMutation.isPending,
    isAtualizando: atualizarConfigMutation.isPending,
    isDeletando: deletarConfigMutation.isPending,
  };
}
