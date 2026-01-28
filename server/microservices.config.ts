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
  },

  // ms-cadastro - Cadastro de clientes e funcionários
  clientes: {
    baseUrl: process.env.MS_CLIENTES_URL || 'http://ms-cadastro:3004',
    endpoints: {
      listar: '/clientes',
      criar: '/clientes',
      buscar: (id: string) => `/clientes/${id}`,
      atualizar: (id: string) => `/clientes/${id}`,
      atualizarStatus: (id: string) => `/clientes/${id}/status`,
      deletar: (id: string) => `/clientes/${id}`,
    }
  },
  funcionarios: {
    baseUrl: process.env.MS_CLIENTES_URL || 'http://ms-cadastro:3004',
    endpoints: {
      listar: '/funcionarios',
      criar: '/funcionarios',
      buscar: (id: string) => `/funcionarios/${id}`,
      atualizar: (id: string) => `/funcionarios/${id}`,
      atualizarStatus: (id: string) => `/funcionarios/${id}/status`,
      deletar: (id: string) => `/funcionarios/${id}`,
    }
  },
  empresas: {
    baseUrl: process.env.MS_CLIENTES_URL || 'http://ms-cadastro:3004',
    endpoints: {
      listar: '/empresas',
      criar: '/empresas',
      buscar: (id: string) => `/empresas/${id}`,
      atualizar: (id: string) => `/empresas/${id}`,
      deletar: (id: string) => `/empresas/${id}`,
    }
  },
  enderecos: {
    baseUrl: process.env.MS_CLIENTES_URL || 'http://ms-cadastro:3004',
    endpoints: {
      listar: '/enderecos',
      criar: '/enderecos',
      buscar: (id: string) => `/enderecos/${id}`,
      atualizar: (id: string) => `/enderecos/${id}`,
      deletar: (id: string) => `/enderecos/${id}`,
    }
  },
  certificados: {
    baseUrl: process.env.MS_CLIENTES_URL || 'http://ms-cadastro:3004',
    endpoints: {
      listar: '/certificados',
      criar: '/certificados',
      buscar: (id: string) => `/certificados/${id}`,
      atualizar: (id: string) => `/certificados/${id}`,
      deletar: (id: string) => `/certificados/${id}`,
    }
  },
  nfeConfig: {
    baseUrl: process.env.MS_CLIENTES_URL || 'http://ms-cadastro:3004',
    endpoints: {
      listar: '/nfe-config',
      criar: '/nfe-config',
      buscar: (id: string) => `/nfe-config/${id}`,
      atualizar: (id: string) => `/nfe-config/${id}`,
      deletar: (id: string) => `/nfe-config/${id}`,
    }
  }
};

export type MicroserviceConfig = typeof MICROSERVICES;
