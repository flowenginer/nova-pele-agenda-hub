
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Sidebar } from "./components/Sidebar";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import PublicScheduling from "./pages/PublicScheduling";
import PublicConsult from "./pages/PublicConsult";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Rotas públicas */}
          <Route path="/agendamento" element={<PublicScheduling />} />
          <Route path="/consultar" element={<PublicConsult />} />
          
          {/* Rotas do CRM com sidebar */}
          <Route path="/*" element={
            <SidebarProvider>
              <div className="min-h-screen flex w-full bg-gradient-nova">
                <Sidebar />
                <main className="flex-1 overflow-hidden">
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
              </div>
            </SidebarProvider>
          } />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
