
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { authService } from '../services/authService';
import { devAuthService } from '../services/devAuthService';
import { UserLogin } from '../services/apiService';
import { useNavigate } from 'react-router-dom';
import { Brain, Code } from 'lucide-react';
import DevLoginForm from '../components/DevLoginForm';

const Login = () => {
  const [formData, setFormData] = useState<UserLogin>({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showDevMode, setShowDevMode] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    try {
      await authService.login(formData);
      toast({
        title: "Success",
        description: "Login successful!",
        variant: "default",
      });
      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Login failed",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDevLogin = () => {
    navigate('/dashboard');
  };

  const handleBackToNormal = () => {
    setShowDevMode(false);
  };

  if (showDevMode) {
    return <DevLoginForm onDevLogin={handleDevLogin} onBackToNormal={handleBackToNormal} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Brain className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <CardTitle className="text-2xl font-bold text-blue-800">
            Welcome Back to Stroke Sense
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="Enter your email"
              />
            </div>
            
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                placeholder="Enter your password"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>

            <div className="text-center text-sm">
              <span className="text-gray-600">Don't have an account? </span>
              <Button
                type="button"
                variant="link"
                className="p-0 h-auto"
                onClick={() => navigate('/register')}
              >
                Register here
              </Button>
            </div>

            <div className="border-t pt-4">
              <Button
                type="button"
                variant="outline"
                className="w-full text-purple-600 border-purple-300 hover:bg-purple-50"
                onClick={() => setShowDevMode(true)}
              >
                <Code className="h-4 w-4 mr-2" />
                Developer Mode
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
