import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "./routers";
import { createContext } from "./_core/context";
import axios from "axios";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // tRPC API routes
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  // Proxy endpoint para download de nota fiscal
  app.get("/api/notas/:vendaId", async (req, res) => {
    try {
      const { vendaId } = req.params;
      console.log(`📥 [Proxy] Requisição para nota fiscal: ${vendaId}`);
      
      const response = await axios.get(
        `http://ms-financeiro:3001/pagamento/notas/${vendaId}`
      );
      
      console.log(`✅ [Proxy] Nota fiscal gerada para: ${vendaId}`);
      res.json(response.data);
    } catch (error: any) {
      console.error(`❌ [Proxy] Erro ao gerar nota fiscal:`, error.message);
      res.status(error.response?.status || 500).json({
        error: error.response?.data || error.message,
      });
    }
  });

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  // Health check endpoint
  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // Handle client-side routing - serve index.html for all routes
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
