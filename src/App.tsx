import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import PermissionsHandler from "@/components/mobile/PermissionsHandler";
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

const queryClient = new QueryClient();

const App = () => {
  const [permissionsGranted, setPermissionsGranted] = useState(false);

  useEffect(() => {
    // On web platform, skip permissions check
    if (!Capacitor.isNativePlatform()) {
      setPermissionsGranted(true);
    }
  }, []);

  const handlePermissionsGranted = () => {
    setPermissionsGranted(true);
  };

  if (!permissionsGranted && Capacitor.isNativePlatform()) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <PermissionsHandler onPermissionsGranted={handlePermissionsGranted} />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

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
