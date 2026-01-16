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
function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
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
