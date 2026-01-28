/**
 * Hook para gerenciamento de certificados digitais
 */

import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export interface CertificadoDigital {
  id: string;
  nome: string;
  senha: string;
  arquivoBase64: string;
  validoAte?: string | null;
  criadoEm: string;
  atualizadoEm: string;
}

export interface CriarCertificadoInput {
  nome: string;
  senha: string;
  arquivoBase64: string;
  validoAte?: string;
}

export interface AtualizarCertificadoInput extends Partial<CriarCertificadoInput> {}

export function useCertificados() {
  const utils = trpc.useUtils();

  const {
    data: certificados,
    isLoading,
    error,
    refetch,
  } = trpc.certificados.listar.useQuery(undefined, {
    retry: 1,
    staleTime: 30000,
  });

  const buscarCertificadoMutation = trpc.certificados.buscar.useQuery;

  const criarCertificadoMutation = trpc.certificados.criar.useMutation({
    onSuccess: () => {
      toast.success("Certificado criado com sucesso!");
      utils.certificados.listar.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao criar certificado");
    },
  });

  const atualizarCertificadoMutation = trpc.certificados.atualizar.useMutation({
    onSuccess: () => {
      toast.success("Certificado atualizado com sucesso!");
      utils.certificados.listar.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar certificado");
    },
  });

  const deletarCertificadoMutation = trpc.certificados.deletar.useMutation({
    onSuccess: () => {
      toast.success("Certificado deletado com sucesso!");
      utils.certificados.listar.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao deletar certificado");
    },
  });

  return {
    certificados: certificados || [],
    isLoading,
    error,

    refetch,
    buscarCertificado: (id: string) => buscarCertificadoMutation({ id }, { enabled: false }),
    criarCertificado: (dados: CriarCertificadoInput) => criarCertificadoMutation.mutateAsync(dados),
    atualizarCertificado: (id: string, dados: AtualizarCertificadoInput) =>
      atualizarCertificadoMutation.mutateAsync({ id, dados }),
    deletarCertificado: (id: string) => deletarCertificadoMutation.mutateAsync({ id }),

    isCriando: criarCertificadoMutation.isPending,
    isAtualizando: atualizarCertificadoMutation.isPending,
    isDeletando: deletarCertificadoMutation.isPending,
  };
}
