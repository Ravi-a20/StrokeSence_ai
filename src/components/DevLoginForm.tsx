
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Code, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { devAuthService } from '@/services/devAuthService';
import { toast } from 'sonner';

interface DevLoginFormProps {
  onDevLogin: () => void;
  onBackToNormal: () => void;
}

const DevLoginForm: React.FC<DevLoginFormProps> = ({ onDevLogin, onBackToNormal }) => {
  const [email, setEmail] = useState('dev@strokesense.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const result = await devAuthService.mockLogin(email, password);
    if (result.success) {
      toast.success('Developer mode activated!');
      onDevLogin();
    } else {
      toast.error('Invalid developer credentials. Use password: dev123');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-4 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Code className="h-8 w-8 text-purple-600" />
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              DEV MODE
            </Badge>
          </div>
          <CardTitle className="text-2xl font-bold text-purple-800">
            Developer Login
          </CardTitle>
          <CardDescription>
            Access the application in development mode
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6">
            <div className="flex items-center gap-2 text-amber-800">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">Development Mode</span>
            </div>
            <p className="text-xs text-amber-700 mt-1">
              This bypasses authentication and uses mock data. Password: dev123
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="dev@strokesense.com"
              />
            </div>
            
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-auto p-1"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-purple-600 hover:bg-purple-700"
              disabled={loading}
            >
              {loading ? 'Activating Dev Mode...' : 'Enter Dev Mode'}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={onBackToNormal}
            >
              Back to Normal Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default DevLoginForm;
