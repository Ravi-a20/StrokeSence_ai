
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from 'react-router-dom';
import { Brain, Heart, Shield, Users } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Brain className="h-8 w-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-blue-800">Stroke Sense</h1>
        </div>
        <div className="space-x-4">
          <Button variant="outline" onClick={() => navigate('/login')}>
            Login
          </Button>
          <Button onClick={() => navigate('/register')}>
            Sign Up
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Early Stroke Detection
            <span className="text-blue-600"> Made Simple</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Use your mobile device to perform quick balance and speech tests that can help detect early signs of stroke. Get immediate results and emergency assistance when needed.
          </p>
          <Button size="lg" onClick={() => navigate('/register')} className="px-8 py-4 text-lg">
            Get Started Today
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="text-center">
            <CardHeader>
              <Brain className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle className="text-lg">Balance Testing</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Use motion sensors to detect balance irregularities that may indicate stroke symptoms.</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Heart className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <CardTitle className="text-lg">Speech Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Advanced speech pattern analysis to identify potential speech impairments.</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Shield className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <CardTitle className="text-lg">Emergency Support</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Instant access to emergency contacts and medical assistance when abnormalities are detected.</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Users className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <CardTitle className="text-lg">Family Connect</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Keep your loved ones informed with automatic emergency contact notifications.</p>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-white rounded-lg shadow-lg p-8">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Take Control of Your Health?
          </h3>
          <p className="text-lg text-gray-600 mb-6">
            Join thousands of users who trust Stroke Sense for early detection and peace of mind.
          </p>
          <div className="space-x-4">
            <Button size="lg" onClick={() => navigate('/register')}>
              Create Account
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate('/login')}>
              Sign In
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">
            © 2024 Stroke Sense. Early detection saves lives.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
