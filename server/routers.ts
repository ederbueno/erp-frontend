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
});

export type AppRouter = typeof appRouter;
