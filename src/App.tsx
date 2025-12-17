import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
import StudyMaterialsPage from "./pages/StudyMaterialsPage";
import HomeTasksPage from "./pages/HomeTasksPage"; // Import the new page
import NotFound from "./pages/NotFound";
import Login from "./pages/Login"; // Import the new Login page
import { useSession } from "./components/SessionContextProvider"; // Import useSession

const queryClient = new QueryClient();

// ProtectedRoute component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session, isLoading } = useSession();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando autenticación...</div>;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Index />} />
            <Route path="patients" element={<Patients />} />
            <Route path="sessions" element={<Sessions />} />
            <Route path="records" element={<ClinicalRecords />} />
            <Route path="protocols" element={<ProtocolsPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="weekly-planner" element={<WeeklyPlanner />} />
            <Route path="home-tasks" element={<HomeTasksPage />} /> {/* New Route */}
            <Route path="notes" element={<NotesPage />} />
            <Route path="todos" element={<TodoPage />} />
            <Route path="study-materials" element={<StudyMaterialsPage />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;