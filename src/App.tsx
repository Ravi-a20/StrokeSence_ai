
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import BalanceTestPage from "./pages/BalanceTestPage";
import SpeechTestPage from "./pages/SpeechTestPage";
import EyeTrackingTestPage from "./pages/EyeTrackingTestPage";
import EmergencyAssistance from "./pages/EmergencyAssistance";
import NotFound from "./pages/NotFound";
import ComprehensiveAnalysisPage from "./pages/ComprehensiveAnalysisPage";
import PatientProfileCompletion from "./components/PatientProfileCompletion";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/complete-profile" element={<PatientProfileCompletion />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/balance-test" element={<BalanceTestPage />} />
            <Route path="/speech-test" element={<SpeechTestPage />} />
            <Route path="/eye-tracking-test" element={<EyeTrackingTestPage />} />
            <Route path="/comprehensive-analysis" element={<ComprehensiveAnalysisPage />} />
            <Route path="/emergency" element={<EmergencyAssistance />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
