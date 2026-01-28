import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as proxy from "./proxy";

// Schemas de validação
const itemVendaSchema = z.object({
  produtoId: z.string(),
  quantidade: z.number().int().positive(),
  precoUnitario: z.number().positive(),
});

const criarVendaSchema = z.object({
  clienteId: z.string(),
  clienteNome: z.string().optional(),
  clienteEmail: z.string().email().optional(),
  cep: z.string().optional(),
  metodoPagamento: z.enum(['PIX', 'BOLETO', 'LINK_MAQUININHA']),
  itens: z.array(itemVendaSchema).min(1),
});

const criarProdutoSchema = z.object({
  codigo: z.string().optional(),
  nome: z.string().min(1),
  categoria: z.string().optional(),
  quantidade: z.number().int().nonnegative(),
  preco: z.number().positive().optional(),
});

const atualizarProdutoSchema = criarProdutoSchema.partial();

// Schemas para Clientes
const criarClienteSchema = z.object({
  tipo: z.enum(['FISICA', 'JURIDICA']),
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  nomeFantasia: z.string().optional(),
  documento: z.string().regex(/^\d{11}$|^\d{14}$/, 'Documento deve ser CPF (11 dígitos) ou CNPJ (14 dígitos)'),
  email: z.string().email('Email inválido'),
  telefone: z.string().regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, 'Telefone inválido').optional(),
  telefoneComercial: z.string().regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, 'Telefone comercial inválido').optional(),
  cep: z.string().regex(/^\d{5}-\d{3}$/, 'CEP inválido').optional(),
  logradouro: z.string().optional(),
  numero: z.string().optional(),
  complemento: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().regex(/^[A-Z]{2}$/, 'Estado deve ser a sigla (ex: SP)').optional(),
  observacoes: z.string().optional(),
});

const atualizarClienteSchema = criarClienteSchema.partial().extend({
  status: z.enum(['ATIVO', 'INATIVO']).optional(),
});

// Schemas para Funcionários
const criarFuncionarioSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  documento: z.string().regex(/^\d{11}$/, 'CPF deve ter 11 dígitos'),
  email: z.string().email('Email inválido'),
  telefone: z.string().regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, 'Telefone inválido').optional(),
  cargo: z.string().optional(),
  departamento: z.string().optional(),
  salario: z.number().optional(),
  observacoes: z.string().optional(),
});

const atualizarFuncionarioSchema = criarFuncionarioSchema.partial().extend({
  status: z.enum(['ATIVO', 'INATIVO']).optional(),
});

// Schemas para Empresas/Endereços/Certificados/NFe
const criarEnderecoSchema = z.object({
  cep: z.string().regex(/^\d{5}-\d{3}$/, 'CEP inválido').optional(),
  logradouro: z.string().optional(),
  numero: z.string().optional(),
  complemento: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().regex(/^[A-Z]{2}$/, 'Estado deve ser a sigla (ex: SP)').optional(),
});

const atualizarEnderecoSchema = criarEnderecoSchema.partial();

const criarEmpresaSchema = z.object({
  razaoSocial: z.string().min(3, 'Razão social é obrigatória'),
  nomeFantasia: z.string().optional(),
  cnpj: z.string().regex(/^\d{14}$/, 'CNPJ deve ter 14 dígitos'),
  inscricaoEstadual: z.string().optional(),
  inscricaoMunicipal: z.string().optional(),
  regimeTributario: z.string().optional(),
  email: z.string().email('Email inválido').optional(),
  telefone: z.string().regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, 'Telefone inválido').optional(),
  enderecoId: z.string().optional(),
});

const atualizarEmpresaSchema = criarEmpresaSchema.partial();

const criarCertificadoSchema = z.object({
  nome: z.string().min(2, 'Nome é obrigatório'),
  senha: z.string().min(1, 'Senha é obrigatória'),
  arquivoBase64: z.string().min(1, 'Arquivo Base64 é obrigatório'),
  validoAte: z.string().optional(),
});

const atualizarCertificadoSchema = criarCertificadoSchema.partial();

const criarNFeConfigSchema = z.object({
  ambiente: z.enum(['HOMOLOGACAO', 'PRODUCAO']).optional(),
  serie: z.string().optional(),
  numeroAtual: z.number().optional(),
  naturezaOperacao: z.string().optional(),
  cscToken: z.string().optional(),
  cscId: z.string().optional(),
  empresaId: z.string(),
  certificadoId: z.string().optional(),
});

const atualizarNFeConfigSchema = criarNFeConfigSchema.partial();

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ==================== VENDAS ====================
  vendas: router({
    listar: publicProcedure.query(async () => {
      try {
        return await proxy.listarVendas();
      } catch (error) {
        console.error('[tRPC] Erro ao listar vendas:', error);
        throw new Error('Não foi possível carregar as vendas. Verifique se o microserviço está rodando.');
      }
    }),

    criar: publicProcedure
      .input(criarVendaSchema)
      .mutation(async ({ input }) => {
        try {
          return await proxy.criarVenda(input);
        } catch (error) {
          console.error('[tRPC] Erro ao criar venda:', error);
          throw new Error('Não foi possível criar a venda. Verifique se o microserviço está rodando.');
        }
      }),

    buscar: publicProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        try {
          return await proxy.buscarVenda(input.id);
        } catch (error) {
          console.error('[tRPC] Erro ao buscar venda:', error);
          throw new Error('Não foi possível encontrar a venda.');
        }
      }),

    atualizarStatus: publicProcedure
      .input(z.object({
        id: z.string(),
        status: z.string(),
        motivo: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        try {
          return await proxy.atualizarStatusVenda(input.id, input.status, input.motivo);
        } catch (error) {
          console.error('[tRPC] Erro ao atualizar status:', error);
          throw new Error('Não foi possível atualizar o status da venda.');
        }
      }),

    deletar: publicProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        try {
          await proxy.deletarVenda(input.id);
          return { success: true };
        } catch (error) {
          console.error('[tRPC] Erro ao deletar venda:', error);
          throw new Error('Não foi possível deletar a venda.');
        }
      }),
  }),

  // ==================== PRODUTOS/ESTOQUE ====================
  produtos: router({
    listar: publicProcedure.query(async () => {
      try {
        return await proxy.listarProdutos();
      } catch (error) {
        console.error('[tRPC] Erro ao listar produtos:', error);
        throw new Error('Não foi possível carregar os produtos. Verifique se o microserviço está rodando.');
      }
    }),

    criar: publicProcedure
      .input(criarProdutoSchema)
      .mutation(async ({ input }) => {
        try {
          return await proxy.criarProduto(input);
        } catch (error) {
          console.error('[tRPC] Erro ao criar produto:', error);
          throw new Error('Não foi possível criar o produto.');
        }
      }),

    buscar: publicProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        try {
          return await proxy.buscarProduto(input.id);
        } catch (error) {
          console.error('[tRPC] Erro ao buscar produto:', error);
          throw new Error('Não foi possível encontrar o produto.');
        }
      }),

    atualizar: publicProcedure
      .input(z.object({
        id: z.string(),
        dados: atualizarProdutoSchema,
      }))
      .mutation(async ({ input }) => {
        try {
          return await proxy.atualizarProduto(input.id, input.dados);
        } catch (error) {
          console.error('[tRPC] Erro ao atualizar produto:', error);
          throw new Error('Não foi possível atualizar o produto.');
        }
      }),

    deletar: publicProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        try {
          await proxy.deletarProduto(input.id);
          return { success: true };
        } catch (error) {
          console.error('[tRPC] Erro ao deletar produto:', error);
          throw new Error('Não foi possível deletar o produto.');
        }
      }),
  }),

  // ==================== FINANCEIRO ====================
  financeiro: router({
    confirmarPagamento: publicProcedure
      .input(z.object({ vendaId: z.string() }))
      .mutation(async ({ input }) => {
        try {
          return await proxy.confirmarPagamento(input.vendaId);
        } catch (error) {
          console.error('[tRPC] Erro ao confirmar pagamento:', error);
          throw new Error('Não foi possível confirmar o pagamento.');
        }
      }),

    statusPagamento: publicProcedure
      .input(z.object({ vendaId: z.string() }))
      .query(async ({ input }) => {
        try {
          return await proxy.buscarStatusPagamento(input.vendaId);
        } catch (error) {
          console.error('[tRPC] Erro ao buscar status do pagamento:', error);
          throw new Error('Não foi possível buscar o status do pagamento.');
        }
      }),

    downloadNota: publicProcedure
      .input(z.object({ vendaId: z.string() }))
      .query(async ({ input }) => {
        try {
          return await proxy.downloadNotaFiscal(input.vendaId);
        } catch (error) {
          console.error('[tRPC] Erro ao gerar nota fiscal:', error);
          throw new Error('Não foi possível gerar a nota fiscal.');
        }
      }),
  }),

  // ==================== CLIENTES ====================
  clientes: router({
    listar: publicProcedure.query(async () => {
      try {
        return await proxy.listarClientes();
      } catch (error) {
        console.error('[tRPC] Erro ao listar clientes:', error);
        throw new Error('Não foi possível carregar os clientes. Verifique se o microserviço está rodando.');
      }
    }),

    buscar: publicProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        try {
          return await proxy.buscarCliente(input.id);
        } catch (error) {
          console.error('[tRPC] Erro ao buscar cliente:', error);
          throw new Error('Não foi possível encontrar o cliente.');
        }
      }),

    criar: publicProcedure
      .input(criarClienteSchema)
      .mutation(async ({ input }) => {
        try {
          return await proxy.criarCliente(input);
        } catch (error) {
          console.error('[tRPC] Erro ao criar cliente:', error);
          const mensagem = (error as any)?.response?.data?.message || 'Não foi possível criar o cliente.';
          throw new Error(mensagem);
        }
      }),

    atualizar: publicProcedure
      .input(z.object({
        id: z.string(),
        dados: atualizarClienteSchema,
      }))
      .mutation(async ({ input }) => {
        try {
          return await proxy.atualizarCliente(input.id, input.dados);
        } catch (error) {
          console.error('[tRPC] Erro ao atualizar cliente:', error);
          const mensagem = (error as any)?.response?.data?.message || 'Não foi possível atualizar o cliente.';
          throw new Error(mensagem);
        }
      }),

    atualizarStatus: publicProcedure
      .input(z.object({
        id: z.string(),
        status: z.enum(['ATIVO', 'INATIVO']),
      }))
      .mutation(async ({ input }) => {
        try {
          return await proxy.atualizarStatusCliente(input.id, input.status);
        } catch (error) {
          console.error('[tRPC] Erro ao atualizar status:', error);
          throw new Error('Não foi possível atualizar o status do cliente.');
        }
      }),

    deletar: publicProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        try {
          await proxy.deletarCliente(input.id);
          return { success: true };
        } catch (error) {
          console.error('[tRPC] Erro ao deletar cliente:', error);
          throw new Error('Não foi possível deletar o cliente.');
        }
      }),
  }),

  // ==================== FUNCIONARIOS ====================
  funcionarios: router({
    listar: publicProcedure.query(async () => {
      try {
        return await proxy.listarFuncionarios();
      } catch (error) {
        console.error('[tRPC] Erro ao listar funcionários:', error);
        throw new Error('Não foi possível carregar os funcionários. Verifique se o microserviço está rodando.');
      }
    }),

    buscar: publicProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        try {
          return await proxy.buscarFuncionario(input.id);
        } catch (error) {
          console.error('[tRPC] Erro ao buscar funcionário:', error);
          throw new Error('Não foi possível encontrar o funcionário.');
        }
      }),

    criar: publicProcedure
      .input(criarFuncionarioSchema)
      .mutation(async ({ input }) => {
        try {
          return await proxy.criarFuncionario(input);
        } catch (error) {
          console.error('[tRPC] Erro ao criar funcionário:', error);
          const mensagem = (error as any)?.response?.data?.message || 'Não foi possível criar o funcionário.';
          throw new Error(mensagem);
        }
      }),

    atualizar: publicProcedure
      .input(z.object({
        id: z.string(),
        dados: atualizarFuncionarioSchema,
      }))
      .mutation(async ({ input }) => {
        try {
          return await proxy.atualizarFuncionario(input.id, input.dados);
        } catch (error) {
          console.error('[tRPC] Erro ao atualizar funcionário:', error);
          const mensagem = (error as any)?.response?.data?.message || 'Não foi possível atualizar o funcionário.';
          throw new Error(mensagem);
        }
      }),

    atualizarStatus: publicProcedure
      .input(z.object({
        id: z.string(),
        status: z.enum(['ATIVO', 'INATIVO']),
      }))
      .mutation(async ({ input }) => {
        try {
          return await proxy.atualizarStatusFuncionario(input.id, input.status);
        } catch (error) {
          console.error('[tRPC] Erro ao atualizar status:', error);
          throw new Error('Não foi possível atualizar o status do funcionário.');
        }
      }),

    deletar: publicProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        try {
          await proxy.deletarFuncionario(input.id);
          return { success: true };
        } catch (error) {
          console.error('[tRPC] Erro ao deletar funcionário:', error);
          throw new Error('Não foi possível deletar o funcionário.');
        }
      }),
  }),

  // ==================== EMPRESAS ====================
  empresas: router({
    listar: publicProcedure.query(async () => {
      try {
        return await proxy.listarEmpresas();
      } catch (error) {
        console.error('[tRPC] Erro ao listar empresas:', error);
        throw new Error('Não foi possível carregar as empresas.');
      }
    }),

    buscar: publicProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        try {
          return await proxy.buscarEmpresa(input.id);
        } catch (error) {
          console.error('[tRPC] Erro ao buscar empresa:', error);
          throw new Error('Não foi possível encontrar a empresa.');
        }
      }),

    criar: publicProcedure
      .input(criarEmpresaSchema)
      .mutation(async ({ input }) => {
        try {
          return await proxy.criarEmpresa(input);
        } catch (error) {
          console.error('[tRPC] Erro ao criar empresa:', error);
          const mensagem = (error as any)?.response?.data?.message || 'Não foi possível criar a empresa.';
          throw new Error(mensagem);
        }
      }),

    atualizar: publicProcedure
      .input(z.object({ id: z.string(), dados: atualizarEmpresaSchema }))
      .mutation(async ({ input }) => {
        try {
          return await proxy.atualizarEmpresa(input.id, input.dados);
        } catch (error) {
          console.error('[tRPC] Erro ao atualizar empresa:', error);
          const mensagem = (error as any)?.response?.data?.message || 'Não foi possível atualizar a empresa.';
          throw new Error(mensagem);
        }
      }),

    deletar: publicProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        try {
          await proxy.deletarEmpresa(input.id);
          return { success: true };
        } catch (error) {
          console.error('[tRPC] Erro ao deletar empresa:', error);
          throw new Error('Não foi possível deletar a empresa.');
        }
      }),
  }),

  // ==================== ENDERECOS ====================
  enderecos: router({
    listar: publicProcedure.query(async () => {
      try {
        return await proxy.listarEnderecos();
      } catch (error) {
        console.error('[tRPC] Erro ao listar endereços:', error);
        throw new Error('Não foi possível carregar os endereços.');
      }
    }),

    buscar: publicProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        try {
          return await proxy.buscarEndereco(input.id);
        } catch (error) {
          console.error('[tRPC] Erro ao buscar endereço:', error);
          throw new Error('Não foi possível encontrar o endereço.');
        }
      }),

    criar: publicProcedure
      .input(criarEnderecoSchema)
      .mutation(async ({ input }) => {
        try {
          return await proxy.criarEndereco(input);
        } catch (error) {
          console.error('[tRPC] Erro ao criar endereço:', error);
          const mensagem = (error as any)?.response?.data?.message || 'Não foi possível criar o endereço.';
          throw new Error(mensagem);
        }
      }),

    atualizar: publicProcedure
      .input(z.object({ id: z.string(), dados: atualizarEnderecoSchema }))
      .mutation(async ({ input }) => {
        try {
          return await proxy.atualizarEndereco(input.id, input.dados);
        } catch (error) {
          console.error('[tRPC] Erro ao atualizar endereço:', error);
          const mensagem = (error as any)?.response?.data?.message || 'Não foi possível atualizar o endereço.';
          throw new Error(mensagem);
        }
      }),

    deletar: publicProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        try {
          await proxy.deletarEndereco(input.id);
          return { success: true };
        } catch (error) {
          console.error('[tRPC] Erro ao deletar endereço:', error);
          throw new Error('Não foi possível deletar o endereço.');
        }
      }),
  }),

  // ==================== CERTIFICADOS ====================
  certificados: router({
    listar: publicProcedure.query(async () => {
      try {
        return await proxy.listarCertificados();
      } catch (error) {
        console.error('[tRPC] Erro ao listar certificados:', error);
        throw new Error('Não foi possível carregar os certificados.');
      }
    }),

    buscar: publicProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        try {
          return await proxy.buscarCertificado(input.id);
        } catch (error) {
          console.error('[tRPC] Erro ao buscar certificado:', error);
          throw new Error('Não foi possível encontrar o certificado.');
        }
      }),

    criar: publicProcedure
      .input(criarCertificadoSchema)
      .mutation(async ({ input }) => {
        try {
          return await proxy.criarCertificado(input);
        } catch (error) {
          console.error('[tRPC] Erro ao criar certificado:', error);
          const mensagem = (error as any)?.response?.data?.message || 'Não foi possível criar o certificado.';
          throw new Error(mensagem);
        }
      }),

    atualizar: publicProcedure
      .input(z.object({ id: z.string(), dados: atualizarCertificadoSchema }))
      .mutation(async ({ input }) => {
        try {
          return await proxy.atualizarCertificado(input.id, input.dados);
        } catch (error) {
          console.error('[tRPC] Erro ao atualizar certificado:', error);
          const mensagem = (error as any)?.response?.data?.message || 'Não foi possível atualizar o certificado.';
          throw new Error(mensagem);
        }
      }),

    deletar: publicProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        try {
          await proxy.deletarCertificado(input.id);
          return { success: true };
        } catch (error) {
          console.error('[tRPC] Erro ao deletar certificado:', error);
          throw new Error('Não foi possível deletar o certificado.');
        }
      }),
  }),

  // ==================== NFE CONFIG ====================
  nfeConfig: router({
    listar: publicProcedure.query(async () => {
      try {
        return await proxy.listarNFeConfigs();
      } catch (error) {
        console.error('[tRPC] Erro ao listar NFe Config:', error);
        throw new Error('Não foi possível carregar as configurações de NFe.');
      }
    }),

    buscar: publicProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        try {
          return await proxy.buscarNFeConfig(input.id);
        } catch (error) {
          console.error('[tRPC] Erro ao buscar NFe Config:', error);
          throw new Error('Não foi possível encontrar a configuração de NFe.');
        }
      }),

    criar: publicProcedure
      .input(criarNFeConfigSchema)
      .mutation(async ({ input }) => {
        try {
          return await proxy.criarNFeConfig(input);
        } catch (error) {
          console.error('[tRPC] Erro ao criar NFe Config:', error);
          const mensagem = (error as any)?.response?.data?.message || 'Não foi possível criar a configuração de NFe.';
          throw new Error(mensagem);
        }
      }),

    atualizar: publicProcedure
      .input(z.object({ id: z.string(), dados: atualizarNFeConfigSchema }))
      .mutation(async ({ input }) => {
        try {
          return await proxy.atualizarNFeConfig(input.id, input.dados);
        } catch (error) {
          console.error('[tRPC] Erro ao atualizar NFe Config:', error);
          const mensagem = (error as any)?.response?.data?.message || 'Não foi possível atualizar a configuração de NFe.';
          throw new Error(mensagem);
        }
      }),

    deletar: publicProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        try {
          await proxy.deletarNFeConfig(input.id);
          return { success: true };
        } catch (error) {
          console.error('[tRPC] Erro ao deletar NFe Config:', error);
          throw new Error('Não foi possível deletar a configuração de NFe.');
        }
      }),
  }),
});
