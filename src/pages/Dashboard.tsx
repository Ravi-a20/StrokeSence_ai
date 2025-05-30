
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-blue-800">Stroke Sense</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={() => navigate('/profile')}>
              <User className="h-4 w-4 mr-2" />
              Patient Profile
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="bg-blue-50 rounded-lg p-6 mb-8 animate-fade-in">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {user.name}!
          </h2>
          <p className="text-gray-600">
            Regular stroke detection assessments help monitor your neurological health effectively.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Detection Modules */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Stroke Detection Modules</h3>
              <p className="text-gray-600">Advanced AI-powered tests to detect early stroke symptoms</p>
            </div>
            
            <div className="grid grid-cols-2 gap-6 mb-8">
              <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer text-center hover-scale" onClick={() => navigate('/balance-test')}>
                <CardContent className="p-8">
                  <Activity className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold mb-2">Balance Detection</h4>
                  <p className="text-sm text-gray-600">Analyze gait and balance patterns</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer text-center hover-scale" onClick={() => navigate('/eye-tracking-test')}>
                <CardContent className="p-8">
                  <Eye className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold mb-2">Eye Tracking</h4>
                  <p className="text-sm text-gray-600">Monitor eye movement patterns</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer text-center hover-scale" onClick={() => navigate('/speech-test')}>
                <CardContent className="p-8">
                  <Mic className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold mb-2">Speech Analysis</h4>
                  <p className="text-sm text-gray-600">Detect speech abnormalities</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer text-center bg-red-50 border-red-200 hover-scale" onClick={() => navigate('/emergency')}>
                <CardContent className="p-8">
                  <Phone className="h-12 w-12 text-red-600 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold mb-2 text-red-600">Emergency</h4>
                  <p className="text-sm text-red-600">Immediate assistance</p>
                </CardContent>
              </Card>
            </div>

            {/* Comprehensive Analysis Button */}
            <Button 
              onClick={handleComprehensiveAnalysis}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 py-6 text-lg animate-scale-in"
            >
              <Brain className="h-6 w-6 mr-3" />
              Start Comprehensive Stroke Analysis
              <span className="ml-2 text-sm opacity-90">(All Tests)</span>
            </Button>
          </div>

          {/* Quick Information Sidebar */}
          <div>
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Stroke Education</h3>
              <p className="text-gray-600">Essential information about stroke recognition and prevention</p>
            </div>
            
            <div className="space-y-4">
              <Card 
                className="hover:shadow-md transition-all duration-300 cursor-pointer hover-scale"
                onClick={() => setActiveInfo('symptoms')}
              >
                <CardContent className="p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">🧠 Recognizing Stroke Symptoms</h4>
                  <p className="text-sm text-gray-600">Learn the F.A.S.T method and warning signs</p>
                </CardContent>
              </Card>

              <Card 
                className="hover:shadow-md transition-all duration-300 cursor-pointer hover-scale"
                onClick={() => setActiveInfo('firstaid')}
              >
                <CardContent className="p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">🚑 First Aid for Stroke</h4>
                  <p className="text-sm text-gray-600">Critical emergency response steps</p>
                </CardContent>
              </Card>

              <Card 
                className="hover:shadow-md transition-all duration-300 cursor-pointer hover-scale"
                onClick={() => setActiveInfo('prevention')}
              >
                <CardContent className="p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">🛡️ Stroke Prevention</h4>
                  <p className="text-sm text-gray-600">Lifestyle changes and risk management</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="mt-12">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Recent Detection Results</h3>
            <p className="text-gray-600">Your recent stroke detection test results and progress</p>
          </div>
          
          <Card>
            <CardContent className="p-6">
              <p className="text-gray-500 text-center">No recent activity to display</p>
              <p className="text-gray-400 text-center text-sm mt-2">
                Complete your first assessment to see results here
              </p>
            </CardContent>
          </Card>
        </div>
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
