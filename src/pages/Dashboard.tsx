import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from 'react-router-dom';
import { authService, AuthUser } from '../services/authService';
import { Brain, Activity, Mic, Shield, User, LogOut } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
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

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-blue-800">Stroke Sense</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={() => navigate('/profile')}>
              <User className="h-4 w-4 mr-2" />
              Profile
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.name}!
          </h2>
          <p className="text-gray-600">
            Choose a test below to monitor your health and detect early signs of stroke.
          </p>
        </div>

        {/* Test Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/balance-test')}>
            <CardHeader className="text-center">
              <Activity className="h-16 w-16 text-blue-600 mx-auto mb-4" />
              <CardTitle className="text-xl">Balance Test</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-4">
                Test your balance and coordination using your device's motion sensors.
              </p>
              <Button className="w-full">
                Start Balance Test
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/speech-test')}>
            <CardHeader className="text-center">
              <Mic className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <CardTitle className="text-xl">Speech Test</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-4">
                Analyze your speech patterns to detect potential speech impairments.
              </p>
              <Button className="w-full">
                Start Speech Test
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/emergency')}>
            <CardHeader className="text-center">
              <Shield className="h-16 w-16 text-red-600 mx-auto mb-4" />
              <CardTitle className="text-xl">Emergency Assistance</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-4">
                Get immediate help and contact emergency services if needed.
              </p>
              <Button variant="destructive" className="w-full">
                Emergency Help
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold mb-4">Quick Health Tips</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-800">Stay Active</h4>
              <p className="text-sm text-blue-600">Regular exercise improves balance and coordination</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-800">Monitor Regularly</h4>
              <p className="text-sm text-green-600">Regular testing helps detect changes early</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <h4 className="font-semibold text-red-800">Know the Signs</h4>
              <p className="text-sm text-red-600">Face drooping, arm weakness, speech difficulty</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
