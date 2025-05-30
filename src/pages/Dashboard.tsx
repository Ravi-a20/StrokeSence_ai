
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from 'react-router-dom';
import { authService, AuthUser } from '../services/authService';
import { Brain, Activity, Eye, Mic, Phone, LogOut, User } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import StrokeSymptoms from '../components/stroke-info/StrokeSymptoms';
import FirstAid from '../components/stroke-info/FirstAid';
import StrokePrevention from '../components/stroke-info/StrokePrevention';

const Dashboard = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [activeInfo, setActiveInfo] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setUser(currentUser);
  }, [navigate]);

  const handleLogout = () => {
    authService.logout();
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    navigate('/');
  };

  const handleComprehensiveAnalysis = () => {
    navigate('/comprehensive-analysis');
    toast({
      title: "Starting Comprehensive Analysis",
      description: "You will complete balance, eye tracking, and speech tests sequentially.",
    });
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile Header */}
      <header className="bg-white p-4 flex justify-between items-center border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <Brain className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-xl font-bold text-blue-600">Stroke</h1>
            <h1 className="text-xl font-bold text-blue-600 -mt-1">Sense</h1>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/profile')} className="text-xs px-3 py-2">
            Patient Profile
          </Button>
          <Button variant="outline" size="sm" onClick={handleLogout} className="text-xs px-3 py-1">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 space-y-6">
        {/* Welcome Section */}
        <Card className="bg-blue-50 border-blue-100">
          <CardContent className="p-4">
            <h2 className="text-lg font-bold text-gray-900 mb-1">
              Welcome back, !
            </h2>
            <p className="text-sm text-gray-600">
              Your regular assessment helps us monitor your health more effectively.
            </p>
          </CardContent>
        </Card>

        {/* Detection Modules */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-1">Detection Modules</h3>
          <p className="text-sm text-gray-600 mb-4">Select a module to perform detection</p>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Card 
              className="hover:shadow-md transition-all duration-300 cursor-pointer text-center border-gray-200" 
              onClick={() => navigate('/balance-test')}
            >
              <CardContent className="p-6">
                <Activity className="h-8 w-8 text-gray-700 mx-auto mb-3" />
                <h4 className="text-base font-medium text-gray-900">Balance</h4>
              </CardContent>
            </Card>

            <Card 
              className="hover:shadow-md transition-all duration-300 cursor-pointer text-center border-gray-200" 
              onClick={() => navigate('/eye-tracking-test')}
            >
              <CardContent className="p-6">
                <Eye className="h-8 w-8 text-gray-700 mx-auto mb-3" />
                <h4 className="text-base font-medium text-gray-900">Eye Tracking</h4>
              </CardContent>
            </Card>

            <Card 
              className="hover:shadow-md transition-all duration-300 cursor-pointer text-center border-gray-200" 
              onClick={() => navigate('/speech-test')}
            >
              <CardContent className="p-6">
                <Mic className="h-8 w-8 text-gray-700 mx-auto mb-3" />
                <h4 className="text-base font-medium text-gray-900">Speech</h4>
              </CardContent>
            </Card>

            <Card 
              className="hover:shadow-md transition-all duration-300 cursor-pointer text-center bg-red-50 border-red-200" 
              onClick={() => navigate('/emergency')}
            >
              <CardContent className="p-6">
                <Phone className="h-8 w-8 text-red-600 mx-auto mb-3" />
                <h4 className="text-base font-medium text-red-600">Emergency</h4>
              </CardContent>
            </Card>
          </div>

          {/* Comprehensive Analysis Button */}
          <Button 
            onClick={handleComprehensiveAnalysis}
            className="w-full bg-blue-600 hover:bg-blue-700 py-4 text-base font-medium"
          >
            <Brain className="h-5 w-5 mr-3" />
            Comprehensive Analysis
          </Button>
        </div>

        {/* Quick Information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-gray-900">Quick Information</CardTitle>
            <p className="text-sm text-gray-600">Education about stroke</p>
          </CardHeader>
          <CardContent className="space-y-3">
            <div 
              className="p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setActiveInfo('symptoms')}
            >
              <h4 className="font-medium text-gray-900">Recognizing Stroke Symptoms</h4>
            </div>

            <div 
              className="p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setActiveInfo('firstaid')}
            >
              <h4 className="font-medium text-gray-900">First Aid for Stroke</h4>
            </div>

            <div 
              className="p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setActiveInfo('prevention')}
            >
              <h4 className="font-medium text-gray-900">Stroke Prevention</h4>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Information Modals */}
      {activeInfo === 'symptoms' && (
        <StrokeSymptoms onClose={() => setActiveInfo(null)} />
      )}
      {activeInfo === 'firstaid' && (
        <FirstAid onClose={() => setActiveInfo(null)} />
      )}
      {activeInfo === 'prevention' && (
        <StrokePrevention onClose={() => setActiveInfo(null)} />
      )}
    </div>
  );
};

export default Dashboard;
