/**
 * Hook para gerenciamento de empresas
 */

import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
export interface Endereco {
  id: string;
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
}

export interface Empresa {
  id: string;
  razaoSocial: string;
  nomeFantasia?: string;
  cnpj: string;
  inscricaoEstadual?: string;
  inscricaoMunicipal?: string;
  regimeTributario?: string;
  email?: string;
  telefone?: string;
  enderecoId?: string | null;
  endereco?: Endereco | null;
  criadoEm: string;
  atualizadoEm: string;
  deletadoEm?: string | null;
}

export interface CriarEmpresaInput {
  razaoSocial: string;
  nomeFantasia?: string;
  cnpj: string;
  inscricaoEstadual?: string;
  inscricaoMunicipal?: string;
  regimeTributario?: string;
  email?: string;
  telefone?: string;
  enderecoId?: string;
}

export interface AtualizarEmpresaInput extends Partial<CriarEmpresaInput> {}

export function useEmpresas() {
  const utils = trpc.useUtils();

  const {
    data: empresas,
    isLoading,
    error,
    refetch,
  } = trpc.empresas.listar.useQuery(undefined, {
    retry: 1,
    staleTime: 30000,
  });

  const buscarEmpresaMutation = trpc.empresas.buscar.useQuery;

  const criarEmpresaMutation = trpc.empresas.criar.useMutation({
    onSuccess: () => {
      toast.success("Empresa criada com sucesso!");
      utils.empresas.listar.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao criar empresa");
    },
  });

  const atualizarEmpresaMutation = trpc.empresas.atualizar.useMutation({
    onSuccess: () => {
      toast.success("Empresa atualizada com sucesso!");
      utils.empresas.listar.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar empresa");
    },
  });

  const deletarEmpresaMutation = trpc.empresas.deletar.useMutation({
    onSuccess: () => {
      toast.success("Empresa deletada com sucesso!");
      utils.empresas.listar.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao deletar empresa");
    },
  });

  return {
    empresas: empresas || [],
    isLoading,
    error,

    refetch,
    buscarEmpresa: (id: string) => buscarEmpresaMutation({ id }, { enabled: false }),
    criarEmpresa: (dados: CriarEmpresaInput) => criarEmpresaMutation.mutateAsync(dados),
    atualizarEmpresa: (id: string, dados: AtualizarEmpresaInput) =>
      atualizarEmpresaMutation.mutateAsync({ id, dados }),
    deletarEmpresa: (id: string) => deletarEmpresaMutation.mutateAsync({ id }),

    isCriando: criarEmpresaMutation.isPending,
    isAtualizando: atualizarEmpresaMutation.isPending,
    isDeletando: deletarEmpresaMutation.isPending,
  };
}
