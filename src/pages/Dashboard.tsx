
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from 'react-router-dom';
import { authService, AuthUser } from '../services/authService';
import { Brain, Activity, Mic, Shield, User, LogOut, Eye, Clock, TrendingUp } from 'lucide-react';
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
    <div className="min-h-screen bg-gray-50">
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
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.name}!
          </h2>
          <p className="text-gray-600">
            Monitor your health with our comprehensive stroke detection system
          </p>
        </div>

        {/* Detection Modules */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Detection Modules</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/balance-test')}>
              <CardHeader className="text-center pb-4">
                <Activity className="h-12 w-12 text-blue-600 mx-auto mb-2" />
                <CardTitle className="text-lg">Balance Test</CardTitle>
              </CardHeader>
              <CardContent className="text-center pt-0">
                <p className="text-gray-600 text-sm mb-4">
                  Test your balance and coordination
                </p>
                <Button className="w-full" size="sm">
                  Start Test
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/eye-tracking-test')}>
              <CardHeader className="text-center pb-4">
                <Eye className="h-12 w-12 text-purple-600 mx-auto mb-2" />
                <CardTitle className="text-lg">Eye Tracking</CardTitle>
              </CardHeader>
              <CardContent className="text-center pt-0">
                <p className="text-gray-600 text-sm mb-4">
                  Analyze eye movement patterns
                </p>
                <Button className="w-full" size="sm">
                  Start Test
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/speech-test')}>
              <CardHeader className="text-center pb-4">
                <Mic className="h-12 w-12 text-green-600 mx-auto mb-2" />
                <CardTitle className="text-lg">Speech Test</CardTitle>
              </CardHeader>
              <CardContent className="text-center pt-0">
                <p className="text-gray-600 text-sm mb-4">
                  Detect speech impairments
                </p>
                <Button className="w-full" size="sm">
                  Start Test
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/emergency')}>
              <CardHeader className="text-center pb-4">
                <Shield className="h-12 w-12 text-red-600 mx-auto mb-2" />
                <CardTitle className="text-lg">Emergency</CardTitle>
              </CardHeader>
              <CardContent className="text-center pt-0">
                <p className="text-gray-600 text-sm mb-4">
                  Get immediate assistance
                </p>
                <Button variant="destructive" className="w-full" size="sm">
                  Emergency
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Section with Quick Information and Recent Activity */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Quick Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-semibold text-sm">Recognize Stroke Signs</h4>
                    <p className="text-xs text-gray-600">Face drooping, arm weakness, speech difficulty - call emergency immediately</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-semibold text-sm">Regular Testing</h4>
                    <p className="text-xs text-gray-600">Take tests weekly to monitor changes in your condition</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-semibold text-sm">Stay Active</h4>
                    <p className="text-xs text-gray-600">Regular exercise improves balance and reduces stroke risk</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Last Balance Test</p>
                      <p className="text-xs text-gray-600">3 days ago</p>
                    </div>
                  </div>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Normal</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <TrendingUp className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Health Trend</p>
                      <p className="text-xs text-gray-600">Improving</p>
                    </div>
                  </div>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Stable</span>
                </div>

                <div className="text-center pt-4">
                  <Button variant="outline" size="sm" className="w-full">
                    View All Activity
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
