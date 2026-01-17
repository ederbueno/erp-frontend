/**
 * Configuração dos microserviços do ERP
 * URLs podem ser sobrescritas via variáveis de ambiente
 */

export const MICROSERVICES = {
  // ms-vendas - Gerenciamento de vendas
  vendas: {
    baseUrl: process.env.MS_VENDAS_URL || 'http://ms-vendas:3000',
    endpoints: {
      listar: '/vendas',
      criar: '/vendas',
      buscar: (id: string) => `/vendas/${id}`,
      atualizarStatus: (id: string) => `/vendas/${id}/status`,
      deletar: (id: string) => `/vendas/${id}`,
    }
  },
  
  // ms-estoque - Gerenciamento de estoque/produtos
  estoque: {
    baseUrl: process.env.MS_ESTOQUE_URL || 'http://ms-estoque:3002',
    endpoints: {
      listarProdutos: '/produtos',
      criarProduto: '/produtos',
      buscarProduto: (id: string) => `/produtos/${id}`,
      atualizarProduto: (id: string) => `/produtos/${id}`,
      deletarProduto: (id: string) => `/produtos/${id}`,
    }
  },
  
  // ms-financeiro - Gerenciamento financeiro
  financeiro: {
    baseUrl: process.env.MS_FINANCEIRO_URL || 'http://ms-financeiro:3001',
    endpoints: {
      confirmarPagamento: (vendaId: string) => `/pagamento/confirmar/${vendaId}`,
      statusPagamento: (vendaId: string) => `/pagamento/status/${vendaId}`,
    }
  }
};

export type MicroserviceConfig = typeof MICROSERVICES;
