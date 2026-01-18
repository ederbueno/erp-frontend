/**
 * Proxy Service para comunicação com os microserviços do ERP
 * Centraliza todas as chamadas HTTP para os backends
 */

import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { MICROSERVICES } from './microservices.config';

// Configuração do cliente HTTP com timeout e retry
const httpClient = axios.create({
  timeout: 30000, // 30 segundos
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para logging de erros
httpClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    console.error(`[Proxy Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}:`, error.message);
    throw error;
  }
);

// ==================== VENDAS ====================

export interface ItemVenda {
  produtoId: string;
  quantidade: number;
  precoUnitario: number;
}

export interface CriarVendaDTO {
  clienteId: string;
  clienteNome?: string;
  clienteEmail?: string;
  cep?: string;
  metodoPagamento: 'PIX' | 'BOLETO' | 'LINK_MAQUININHA';
  itens: ItemVenda[];
}

export interface Venda {
  id: string;
  clienteId: string;
  valorTotal: number;
  status: string;
  metodoPagamento?: string;
  motivo?: string;
  criadoEm: string;
  itens: ItemVenda[];
}

export async function listarVendas(): Promise<Venda[]> {
  try {
    const response = await httpClient.get(`${MICROSERVICES.vendas.baseUrl}${MICROSERVICES.vendas.endpoints.listar}`);
    return response.data;
  } catch (error) {
    console.error('[Proxy] Erro ao listar vendas:', error);
    throw error;
  }
}

export async function criarVenda(dados: CriarVendaDTO): Promise<Venda> {
  try {
    const response = await httpClient.post(
      `${MICROSERVICES.vendas.baseUrl}${MICROSERVICES.vendas.endpoints.criar}`,
      dados
    );
    return response.data;
  } catch (error) {
    console.error('[Proxy] Erro ao criar venda:', error);
    throw error;
  }
}

export async function buscarVenda(id: string): Promise<Venda> {
  try {
    const response = await httpClient.get(
      `${MICROSERVICES.vendas.baseUrl}${MICROSERVICES.vendas.endpoints.buscar(id)}`
    );
    return response.data;
  } catch (error) {
    console.error('[Proxy] Erro ao buscar venda:', error);
    throw error;
  }
}

export async function atualizarStatusVenda(id: string, status: string, motivo?: string): Promise<Venda> {
  try {
    const response = await httpClient.patch(
      `${MICROSERVICES.vendas.baseUrl}${MICROSERVICES.vendas.endpoints.atualizarStatus(id)}`,
      { status, motivo }
    );
    return response.data;
  } catch (error) {
    console.error('[Proxy] Erro ao atualizar status da venda:', error);
    throw error;
  }
}

export async function deletarVenda(id: string): Promise<void> {
  try {
    await httpClient.delete(
      `${MICROSERVICES.vendas.baseUrl}${MICROSERVICES.vendas.endpoints.deletar(id)}`
    );
  } catch (error) {
    console.error('[Proxy] Erro ao deletar venda:', error);
    throw error;
  }
}

// ==================== PRODUTOS/ESTOQUE ====================

export interface Produto {
  id: string;
  codigo?: string;
  nome: string;
  categoria?: string;
  quantidade: number;
  preco?: number;
  status?: string;
  updatedAt: string;
}

export interface CriarProdutoDTO {
  codigo?: string;
  nome: string;
  categoria?: string;
  quantidade: number;
  preco?: number;
}

export async function listarProdutos(): Promise<Produto[]> {
  try {
    const response = await httpClient.get(
      `${MICROSERVICES.estoque.baseUrl}${MICROSERVICES.estoque.endpoints.listarProdutos}`
    );
    return response.data;
  } catch (error) {
    console.error('[Proxy] Erro ao listar produtos:', error);
    throw error;
  }
}

export async function criarProduto(dados: CriarProdutoDTO): Promise<Produto> {
  try {
    const response = await httpClient.post(
      `${MICROSERVICES.estoque.baseUrl}${MICROSERVICES.estoque.endpoints.criarProduto}`,
      dados
    );
    return response.data;
  } catch (error) {
    console.error('[Proxy] Erro ao criar produto:', error);
    throw error;
  }
}

export async function buscarProduto(id: string): Promise<Produto> {
  try {
    const response = await httpClient.get(
      `${MICROSERVICES.estoque.baseUrl}${MICROSERVICES.estoque.endpoints.buscarProduto(id)}`
    );
    return response.data;
  } catch (error) {
    console.error('[Proxy] Erro ao buscar produto:', error);
    throw error;
  }
}

export async function atualizarProduto(id: string, dados: Partial<CriarProdutoDTO>): Promise<Produto> {
  try {
    const response = await httpClient.patch(
      `${MICROSERVICES.estoque.baseUrl}${MICROSERVICES.estoque.endpoints.atualizarProduto(id)}`,
      dados
    );
    return response.data;
  } catch (error) {
    console.error('[Proxy] Erro ao atualizar produto:', error);
    throw error;
  }
}

export async function deletarProduto(id: string): Promise<void> {
  try {
    await httpClient.delete(
      `${MICROSERVICES.estoque.baseUrl}${MICROSERVICES.estoque.endpoints.deletarProduto(id)}`
    );
  } catch (error) {
    console.error('[Proxy] Erro ao deletar produto:', error);
    throw error;
  }
}

// ==================== FINANCEIRO ====================

export interface StatusPagamento {
  vendaId: string;
  valor: number;
  metodo: string;
  status: string;
  pagoEm?: string;
  fatura?: {
    id: string;
    valor: number;
    createdAt: string;
    notaFiscal?: {
      id: string;
      chaveAcesso: string;
      xmlSimulado: string;
    };
  };
}

export async function confirmarPagamento(vendaId: string): Promise<StatusPagamento> {
  try {
    const response = await httpClient.patch(
      `${MICROSERVICES.financeiro.baseUrl}${MICROSERVICES.financeiro.endpoints.confirmarPagamento(vendaId)}`
    );
    return response.data;
  } catch (error) {
    console.error('[Proxy] Erro ao confirmar pagamento:', error);
    throw error;
  }
}

export async function buscarStatusPagamento(vendaId: string): Promise<StatusPagamento> {
  try {
    const response = await httpClient.get(
      `${MICROSERVICES.financeiro.baseUrl}${MICROSERVICES.financeiro.endpoints.statusPagamento(vendaId)}`
    );
    return response.data;
  } catch (error) {
    console.error('[Proxy] Erro ao buscar status do pagamento:', error);
    throw error;
  }
}

export async function downloadNotaFiscal(vendaId: string) {
  try {
    const response = await httpClient.get(
      `${MICROSERVICES.financeiro.baseUrl}/notas/${vendaId}`
    );
    return response.data;
  } catch (error) {
    console.error('[Proxy] Erro ao gerar nota fiscal:', error);
    throw error;
  }
}
