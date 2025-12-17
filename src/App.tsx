import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import Patients from "./pages/Patients";
import Sessions from "./pages/Sessions";
import ClinicalRecords from "./pages/ClinicalRecords";
import ProtocolsPage from "./pages/ProtocolsPage";
import NotificationsPage from "./pages/NotificationsPage";
import SettingsPage from "./pages/SettingsPage";
import WeeklyPlanner from "./pages/WeeklyPlanner";
import NotesPage from "./pages/NotesPage";
import TodoPage from "./pages/TodoPage";
import StudyMaterialsPage from "./pages/StudyMaterialsPage"; // Import the new StudyMaterialsPage
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
            <Route path="patients" element={<Patients />} />
            <Route path="sessions" element={<Sessions />} />
            <Route path="records" element={<ClinicalRecords />} />
            <Route path="protocols" element={<ProtocolsPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="weekly-planner" element={<WeeklyPlanner />} />
            <Route path="notes" element={<NotesPage />} />
            <Route path="todos" element={<TodoPage />} />
            <Route path="study-materials" element={<StudyMaterialsPage />} /> {/* New route for StudyMaterialsPage */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;