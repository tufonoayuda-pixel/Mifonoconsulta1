import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import Patients from "./pages/Patients"; // Import the new Patients page
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Index />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="patients" element={<Patients />} /> {/* Use the Patients page */}
            <Route path="sessions" element={<div>Sessions Page</div>} /> {/* Placeholder */}
            <Route path="records" element={<div>Records Page</div>} /> {/* Placeholder */}
            <Route path="notifications" element={<div>Notifications Page</div>} /> {/* Placeholder */}
            <Route path="protocols" element={<div>Protocols Page</div>} /> {/* Placeholder */}
            <Route path="settings" element={<div>Settings Page</div>} /> {/* Placeholder */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;