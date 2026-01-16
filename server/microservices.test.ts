import { describe, expect, it } from "vitest";
import { MICROSERVICES } from "./microservices.config";

describe("Microservices Configuration", () => {
  it("should have correct configuration for vendas microservice", () => {
    expect(MICROSERVICES.vendas).toBeDefined();
    expect(MICROSERVICES.vendas.baseUrl).toBeDefined();
    expect(typeof MICROSERVICES.vendas.baseUrl).toBe("string");
    expect(MICROSERVICES.vendas.endpoints).toBeDefined();
  });

  it("should have correct configuration for estoque microservice", () => {
    expect(MICROSERVICES.estoque).toBeDefined();
    expect(MICROSERVICES.estoque.baseUrl).toBeDefined();
    expect(typeof MICROSERVICES.estoque.baseUrl).toBe("string");
    expect(MICROSERVICES.estoque.endpoints).toBeDefined();
  });

  it("should have correct configuration for financeiro microservice", () => {
    expect(MICROSERVICES.financeiro).toBeDefined();
    expect(MICROSERVICES.financeiro.baseUrl).toBeDefined();
    expect(typeof MICROSERVICES.financeiro.baseUrl).toBe("string");
    expect(MICROSERVICES.financeiro.endpoints).toBeDefined();
  });

  it("vendas endpoints should be correctly defined", () => {
    const { endpoints } = MICROSERVICES.vendas;
    expect(endpoints.listar).toBe("/vendas");
    expect(endpoints.criar).toBe("/vendas");
    expect(typeof endpoints.buscar).toBe("function");
    expect(endpoints.buscar("123")).toBe("/vendas/123");
    expect(typeof endpoints.atualizarStatus).toBe("function");
    expect(endpoints.atualizarStatus("456")).toBe("/vendas/456/status");
    expect(typeof endpoints.deletar).toBe("function");
    expect(endpoints.deletar("789")).toBe("/vendas/789");
  });

  it("estoque endpoints should be correctly defined", () => {
    const { endpoints } = MICROSERVICES.estoque;
    expect(endpoints.listarProdutos).toBe("/produtos");
    expect(endpoints.criarProduto).toBe("/produtos");
    expect(typeof endpoints.buscarProduto).toBe("function");
    expect(endpoints.buscarProduto("abc")).toBe("/produtos/abc");
    expect(typeof endpoints.atualizarProduto).toBe("function");
    expect(endpoints.atualizarProduto("def")).toBe("/produtos/def");
    expect(typeof endpoints.deletarProduto).toBe("function");
    expect(endpoints.deletarProduto("ghi")).toBe("/produtos/ghi");
  });

  it("financeiro endpoints should be correctly defined", () => {
    const { endpoints } = MICROSERVICES.financeiro;
    expect(typeof endpoints.confirmarPagamento).toBe("function");
    expect(endpoints.confirmarPagamento("venda-123")).toBe("/pagamento/confirmar/venda-123");
    expect(typeof endpoints.statusPagamento).toBe("function");
    expect(endpoints.statusPagamento("venda-456")).toBe("/pagamento/status/venda-456");
  });

  it("default URLs should use localhost", () => {
    // Without env vars, should default to localhost
    expect(MICROSERVICES.vendas.baseUrl).toContain("localhost");
    expect(MICROSERVICES.estoque.baseUrl).toContain("localhost");
    expect(MICROSERVICES.financeiro.baseUrl).toContain("localhost");
  });
});
