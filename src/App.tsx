
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import PublicScheduling from "./pages/PublicScheduling";
import PublicConsult from "./pages/PublicConsult";

const queryClient = new QueryClient();

const App = () => {
  // Verificar se é uma rota para arquivo estático HTML
  const isStaticFile = window.location.pathname.endsWith('.html');
  
  // Se for arquivo estático, não renderizar o app React
  if (isStaticFile) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/app" element={<Index />} />
              <Route path="/login" element={<Index />} />
              <Route path="/agendamento" element={<PublicScheduling />} />
              <Route path="/consultar" element={<PublicConsult />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
