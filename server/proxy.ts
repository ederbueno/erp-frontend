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

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function listarVendas(
  page: number = 1,
  limit: number = 20,
  status?: string,
  search?: string
): Promise<PaginatedResponse<Venda>> {
  try {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (status && status !== 'Todos') params.append('status', status);
    if (search) params.append('search', search);

    const response = await httpClient.get(
      `${MICROSERVICES.vendas.baseUrl}${MICROSERVICES.vendas.endpoints.listar}?${params.toString()}`
    );
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
// ==================== CLIENTES ====================

export interface Cliente {
  id: string;
  tipo: 'FISICA' | 'JURIDICA';
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
  status: 'ATIVO' | 'INATIVO';
  observacoes?: string;
  criadoEm: string;
  atualizadoEm: string;
  deletadoEm?: string | null;
}

export interface CriarClienteDTO {
  tipo: 'FISICA' | 'JURIDICA';
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

export interface AtualizarClienteDTO extends Partial<CriarClienteDTO> {
  status?: 'ATIVO' | 'INATIVO';
}

export async function listarClientes(): Promise<Cliente[]> {
  try {
    const response = await httpClient.get(
      `${MICROSERVICES.clientes.baseUrl}${MICROSERVICES.clientes.endpoints.listar}`
    );
    return response.data;
  } catch (error) {
    console.error('[Proxy] Erro ao listar clientes:', error);
    throw error;
  }
}

export async function buscarCliente(id: string): Promise<Cliente> {
  try {
    const response = await httpClient.get(
      `${MICROSERVICES.clientes.baseUrl}${MICROSERVICES.clientes.endpoints.buscar(id)}`
    );
    return response.data;
  } catch (error) {
    console.error('[Proxy] Erro ao buscar cliente:', error);
    throw error;
  }
}

export async function criarCliente(dados: CriarClienteDTO): Promise<Cliente> {
  try {
    const response = await httpClient.post(
      `${MICROSERVICES.clientes.baseUrl}${MICROSERVICES.clientes.endpoints.criar}`,
      dados
    );
    return response.data;
  } catch (error) {
    console.error('[Proxy] Erro ao criar cliente:', error);
    throw error;
  }
}

export async function atualizarCliente(id: string, dados: AtualizarClienteDTO): Promise<Cliente> {
  try {
    const response = await httpClient.patch(
      `${MICROSERVICES.clientes.baseUrl}${MICROSERVICES.clientes.endpoints.atualizar(id)}`,
      dados
    );
    return response.data;
  } catch (error) {
    console.error('[Proxy] Erro ao atualizar cliente:', error);
    throw error;
  }
}

export async function atualizarStatusCliente(id: string, status: 'ATIVO' | 'INATIVO'): Promise<Cliente> {
  try {
    const response = await httpClient.patch(
      `${MICROSERVICES.clientes.baseUrl}${MICROSERVICES.clientes.endpoints.atualizarStatus(id)}`,
      { status }
    );
    return response.data;
  } catch (error) {
    console.error('[Proxy] Erro ao atualizar status do cliente:', error);
    throw error;
  }
}

export async function deletarCliente(id: string): Promise<{ success: boolean }> {
  try {
    await httpClient.delete(
      `${MICROSERVICES.clientes.baseUrl}${MICROSERVICES.clientes.endpoints.deletar(id)}`
    );
    return { success: true };
  } catch (error) {
    console.error('[Proxy] Erro ao deletar cliente:', error);
    throw error;
  }
}

// ==================== FUNCIONARIOS ====================

export interface Funcionario {
  id: string;
  nome: string;
  documento: string;
  email: string;
  telefone?: string;
  cargo?: string;
  departamento?: string;
  salario?: number;
  status: 'ATIVO' | 'INATIVO';
  observacoes?: string;
  criadoEm: string;
  atualizadoEm: string;
  deletadoEm?: string | null;
}

export interface CriarFuncionarioDTO {
  nome: string;
  documento: string;
  email: string;
  telefone?: string;
  cargo?: string;
  departamento?: string;
  salario?: number;
  observacoes?: string;
}

export interface AtualizarFuncionarioDTO extends Partial<CriarFuncionarioDTO> {
  status?: 'ATIVO' | 'INATIVO';
}

export async function listarFuncionarios(): Promise<Funcionario[]> {
  try {
    const response = await httpClient.get(
      `${MICROSERVICES.funcionarios.baseUrl}${MICROSERVICES.funcionarios.endpoints.listar}`
    );
    return response.data;
  } catch (error) {
    console.error('[Proxy] Erro ao listar funcionários:', error);
    throw error;
  }
}

export async function buscarFuncionario(id: string): Promise<Funcionario> {
  try {
    const response = await httpClient.get(
      `${MICROSERVICES.funcionarios.baseUrl}${MICROSERVICES.funcionarios.endpoints.buscar(id)}`
    );
    return response.data;
  } catch (error) {
    console.error('[Proxy] Erro ao buscar funcionário:', error);
    throw error;
  }
}

export async function criarFuncionario(dados: CriarFuncionarioDTO): Promise<Funcionario> {
  try {
    const response = await httpClient.post(
      `${MICROSERVICES.funcionarios.baseUrl}${MICROSERVICES.funcionarios.endpoints.criar}`,
      dados
    );
    return response.data;
  } catch (error) {
    console.error('[Proxy] Erro ao criar funcionário:', error);
    throw error;
  }
}

export async function atualizarFuncionario(id: string, dados: AtualizarFuncionarioDTO): Promise<Funcionario> {
  try {
    const response = await httpClient.patch(
      `${MICROSERVICES.funcionarios.baseUrl}${MICROSERVICES.funcionarios.endpoints.atualizar(id)}`,
      dados
    );
    return response.data;
  } catch (error) {
    console.error('[Proxy] Erro ao atualizar funcionário:', error);
    throw error;
  }
}

export async function atualizarStatusFuncionario(id: string, status: 'ATIVO' | 'INATIVO'): Promise<Funcionario> {
  try {
    const response = await httpClient.patch(
      `${MICROSERVICES.funcionarios.baseUrl}${MICROSERVICES.funcionarios.endpoints.atualizarStatus(id)}`,
      { status }
    );
    return response.data;
  } catch (error) {
    console.error('[Proxy] Erro ao atualizar status do funcionário:', error);
    throw error;
  }
}

export async function deletarFuncionario(id: string): Promise<{ success: boolean }> {
  try {
    await httpClient.delete(
      `${MICROSERVICES.funcionarios.baseUrl}${MICROSERVICES.funcionarios.endpoints.deletar(id)}`
    );
    return { success: true };
  } catch (error) {
    console.error('[Proxy] Erro ao deletar funcionário:', error);
    throw error;
  }
}

// ==================== EMPRESAS ====================

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

export interface CriarEnderecoDTO {
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
}

export interface AtualizarEnderecoDTO extends Partial<CriarEnderecoDTO> {}

export interface CriarEmpresaDTO {
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

export interface AtualizarEmpresaDTO extends Partial<CriarEmpresaDTO> {}

export async function listarEmpresas(): Promise<Empresa[]> {
  try {
    const response = await httpClient.get(
      `${MICROSERVICES.empresas.baseUrl}${MICROSERVICES.empresas.endpoints.listar}`
    );
    return response.data;
  } catch (error) {
    console.error('[Proxy] Erro ao listar empresas:', error);
    throw error;
  }
}

export async function buscarEmpresa(id: string): Promise<Empresa> {
  try {
    const response = await httpClient.get(
      `${MICROSERVICES.empresas.baseUrl}${MICROSERVICES.empresas.endpoints.buscar(id)}`
    );
    return response.data;
  } catch (error) {
    console.error('[Proxy] Erro ao buscar empresa:', error);
    throw error;
  }
}

export async function criarEmpresa(dados: CriarEmpresaDTO): Promise<Empresa> {
  try {
    const response = await httpClient.post(
      `${MICROSERVICES.empresas.baseUrl}${MICROSERVICES.empresas.endpoints.criar}`,
      dados
    );
    return response.data;
  } catch (error) {
    console.error('[Proxy] Erro ao criar empresa:', error);
    throw error;
  }
}

export async function atualizarEmpresa(id: string, dados: AtualizarEmpresaDTO): Promise<Empresa> {
  try {
    const response = await httpClient.patch(
      `${MICROSERVICES.empresas.baseUrl}${MICROSERVICES.empresas.endpoints.atualizar(id)}`,
      dados
    );
    return response.data;
  } catch (error) {
    console.error('[Proxy] Erro ao atualizar empresa:', error);
    throw error;
  }
}

export async function deletarEmpresa(id: string): Promise<{ success: boolean }> {
  try {
    await httpClient.delete(
      `${MICROSERVICES.empresas.baseUrl}${MICROSERVICES.empresas.endpoints.deletar(id)}`
    );
    return { success: true };
  } catch (error) {
    console.error('[Proxy] Erro ao deletar empresa:', error);
    throw error;
  }
}

export async function criarEndereco(dados: CriarEnderecoDTO): Promise<Endereco> {
  try {
    const response = await httpClient.post(
      `${MICROSERVICES.enderecos.baseUrl}${MICROSERVICES.enderecos.endpoints.criar}`,
      dados
    );
    return response.data;
  } catch (error) {
    console.error('[Proxy] Erro ao criar endereço:', error);
    throw error;
  }
}

export async function atualizarEndereco(id: string, dados: AtualizarEnderecoDTO): Promise<Endereco> {
  try {
    const response = await httpClient.patch(
      `${MICROSERVICES.enderecos.baseUrl}${MICROSERVICES.enderecos.endpoints.atualizar(id)}`,
      dados
    );
    return response.data;
  } catch (error) {
    console.error('[Proxy] Erro ao atualizar endereço:', error);
    throw error;
  }
}

export async function buscarEndereco(id: string): Promise<Endereco> {
  try {
    const response = await httpClient.get(
      `${MICROSERVICES.enderecos.baseUrl}${MICROSERVICES.enderecos.endpoints.buscar(id)}`
    );
    return response.data;
  } catch (error) {
    console.error('[Proxy] Erro ao buscar endereço:', error);
    throw error;
  }
}

export async function listarEnderecos(): Promise<Endereco[]> {
  try {
    const response = await httpClient.get(
      `${MICROSERVICES.enderecos.baseUrl}${MICROSERVICES.enderecos.endpoints.listar}`
    );
    return response.data;
  } catch (error) {
    console.error('[Proxy] Erro ao listar endereços:', error);
    throw error;
  }
}

export async function deletarEndereco(id: string): Promise<{ success: boolean }> {
  try {
    await httpClient.delete(
      `${MICROSERVICES.enderecos.baseUrl}${MICROSERVICES.enderecos.endpoints.deletar(id)}`
    );
    return { success: true };
  } catch (error) {
    console.error('[Proxy] Erro ao deletar endereço:', error);
    throw error;
  }
}

// ==================== CERTIFICADOS ====================

export interface CertificadoDigital {
  id: string;
  nome: string;
  senha: string;
  arquivoBase64: string;
  validoAte?: string | null;
  criadoEm: string;
  atualizadoEm: string;
}

export interface CriarCertificadoDTO {
  nome: string;
  senha: string;
  arquivoBase64: string;
  validoAte?: string;
}

export interface AtualizarCertificadoDTO extends Partial<CriarCertificadoDTO> {}

export async function listarCertificados(): Promise<CertificadoDigital[]> {
  try {
    const response = await httpClient.get(
      `${MICROSERVICES.certificados.baseUrl}${MICROSERVICES.certificados.endpoints.listar}`
    );
    return response.data;
  } catch (error) {
    console.error('[Proxy] Erro ao listar certificados:', error);
    throw error;
  }
}

export async function buscarCertificado(id: string): Promise<CertificadoDigital> {
  try {
    const response = await httpClient.get(
      `${MICROSERVICES.certificados.baseUrl}${MICROSERVICES.certificados.endpoints.buscar(id)}`
    );
    return response.data;
  } catch (error) {
    console.error('[Proxy] Erro ao buscar certificado:', error);
    throw error;
  }
}

export async function criarCertificado(dados: CriarCertificadoDTO): Promise<CertificadoDigital> {
  try {
    const response = await httpClient.post(
      `${MICROSERVICES.certificados.baseUrl}${MICROSERVICES.certificados.endpoints.criar}`,
      dados
    );
    return response.data;
  } catch (error) {
    console.error('[Proxy] Erro ao criar certificado:', error);
    throw error;
  }
}

export async function atualizarCertificado(id: string, dados: AtualizarCertificadoDTO): Promise<CertificadoDigital> {
  try {
    const response = await httpClient.patch(
      `${MICROSERVICES.certificados.baseUrl}${MICROSERVICES.certificados.endpoints.atualizar(id)}`,
      dados
    );
    return response.data;
  } catch (error) {
    console.error('[Proxy] Erro ao atualizar certificado:', error);
    throw error;
  }
}

export async function deletarCertificado(id: string): Promise<{ success: boolean }> {
  try {
    await httpClient.delete(
      `${MICROSERVICES.certificados.baseUrl}${MICROSERVICES.certificados.endpoints.deletar(id)}`
    );
    return { success: true };
  } catch (error) {
    console.error('[Proxy] Erro ao deletar certificado:', error);
    throw error;
  }
}

// ==================== NFE CONFIG ====================

export interface NFeConfig {
  id: string;
  ambiente: 'HOMOLOGACAO' | 'PRODUCAO';
  serie?: string;
  numeroAtual: number;
  naturezaOperacao?: string;
  cscToken?: string;
  cscId?: string;
  empresaId: string;
  certificadoId?: string | null;
  empresa?: Empresa | null;
  certificado?: CertificadoDigital | null;
  criadoEm: string;
  atualizadoEm: string;
}

export interface CriarNFeConfigDTO {
  ambiente?: 'HOMOLOGACAO' | 'PRODUCAO';
  serie?: string;
  numeroAtual?: number;
  naturezaOperacao?: string;
  cscToken?: string;
  cscId?: string;
  empresaId: string;
  certificadoId?: string;
}

export interface AtualizarNFeConfigDTO extends Partial<CriarNFeConfigDTO> {}

export async function listarNFeConfigs(): Promise<NFeConfig[]> {
  try {
    const response = await httpClient.get(
      `${MICROSERVICES.nfeConfig.baseUrl}${MICROSERVICES.nfeConfig.endpoints.listar}`
    );
    return response.data;
  } catch (error) {
    console.error('[Proxy] Erro ao listar configuração NFe:', error);
    throw error;
  }
}

export async function buscarNFeConfig(id: string): Promise<NFeConfig> {
  try {
    const response = await httpClient.get(
      `${MICROSERVICES.nfeConfig.baseUrl}${MICROSERVICES.nfeConfig.endpoints.buscar(id)}`
    );
    return response.data;
  } catch (error) {
    console.error('[Proxy] Erro ao buscar configuração NFe:', error);
    throw error;
  }
}

export async function criarNFeConfig(dados: CriarNFeConfigDTO): Promise<NFeConfig> {
  try {
    const response = await httpClient.post(
      `${MICROSERVICES.nfeConfig.baseUrl}${MICROSERVICES.nfeConfig.endpoints.criar}`,
      dados
    );
    return response.data;
  } catch (error) {
    console.error('[Proxy] Erro ao criar configuração NFe:', error);
    throw error;
  }
}

export async function atualizarNFeConfig(id: string, dados: AtualizarNFeConfigDTO): Promise<NFeConfig> {
  try {
    const response = await httpClient.patch(
      `${MICROSERVICES.nfeConfig.baseUrl}${MICROSERVICES.nfeConfig.endpoints.atualizar(id)}`,
      dados
    );
    return response.data;
  } catch (error) {
    console.error('[Proxy] Erro ao atualizar configuração NFe:', error);
    throw error;
  }
}

export async function deletarNFeConfig(id: string): Promise<{ success: boolean }> {
  try {
    await httpClient.delete(
      `${MICROSERVICES.nfeConfig.baseUrl}${MICROSERVICES.nfeConfig.endpoints.deletar(id)}`
    );
    return { success: true };
  } catch (error) {
    console.error('[Proxy] Erro ao deletar configuração NFe:', error);
    throw error;
  }
}