/**
 * App.tsx - Configuração principal do ERP Lanus
 * Design: Industrial Efficiency com Toques Orgânicos
 * Cores: Bordô (#861D34) primária, Verde (#39B776) secundária
 */

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Dashboard from "./pages/Dashboard";
import Produtos from "./pages/Produtos";
import Vendas from "./pages/Vendas";
import Financeiro from "./pages/Financeiro";
import Relatorios from "./pages/Relatorios";
import Clientes from "./pages/Clientes";
import ClienteForm from "./pages/ClienteForm";
import Cadastros from "./pages/Cadastros";
import Funcionarios from "./pages/Funcionarios";
import FuncionarioForm from "./pages/FuncionarioForm";
import Empresas from "./pages/Empresas";
import EmpresaForm from "./pages/EmpresaForm";
import Certificados from "./pages/Certificados";
import CertificadoForm from "./pages/CertificadoForm";
import NFeConfigPage from "./pages/NFeConfig";
import NFeConfigForm from "./pages/NFeConfigForm";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/cadastros" component={Cadastros} />
      <Route path="/clientes" component={Clientes} />
      <Route path="/clientes/novo" component={ClienteForm} />
      <Route path="/clientes/:id/editar" component={ClienteForm} />
      <Route path="/funcionarios" component={Funcionarios} />
      <Route path="/funcionarios/novo" component={FuncionarioForm} />
      <Route path="/funcionarios/:id/editar" component={FuncionarioForm} />
      <Route path="/empresas" component={Empresas} />
      <Route path="/empresas/nova" component={EmpresaForm} />
      <Route path="/empresas/:id/editar" component={EmpresaForm} />
      <Route path="/certificados" component={Certificados} />
      <Route path="/certificados/novo" component={CertificadoForm} />
      <Route path="/certificados/:id/editar" component={CertificadoForm} />
      <Route path="/nfe-config" component={NFeConfigPage} />
      <Route path="/nfe-config/novo" component={NFeConfigForm} />
      <Route path="/nfe-config/:id/editar" component={NFeConfigForm} />
      <Route path="/produtos" component={Produtos} />
      <Route path="/vendas" component={Vendas} />
      <Route path="/vendas/nova" component={Vendas} />
      <Route path="/financeiro" component={Financeiro} />
      <Route path="/relatorios" component={Relatorios} />
      <Route path="/404" component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster 
            position="top-right"
            toastOptions={{
              style: {
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                color: "hsl(var(--foreground))",
              },
            }}
          />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
