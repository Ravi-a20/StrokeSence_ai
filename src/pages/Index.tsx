
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from 'react-router-dom';
import { Brain, Activity, Eye, Mic, Phone, CheckCircle } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-blue-600 text-white">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-white" />
            <h1 className="text-2xl font-bold">Stroke Sense</h1>
          </div>
          <div className="space-x-4">
            <Button variant="outline" className="text-blue-600 bg-white hover:bg-gray-100" onClick={() => navigate('/login')}>
              Login
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-20">
          <div className="mb-8">
            <Brain className="h-24 w-24 text-blue-600 mx-auto mb-6" />
          </div>
          <h2 className="text-6xl font-bold text-gray-900 mb-6">
            Early Stroke Detection
            <br />
            <span className="text-blue-600">Saves Lives</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            A comprehensive mobile application that helps detect early stroke symptoms, provides timely assistance, and offers educational resources.
          </p>
          <div className="space-x-4">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 px-8 py-4 text-lg" onClick={() => navigate('/register')}>
              Get Started Now
            </Button>
            <Button variant="outline" size="lg" className="px-8 py-4 text-lg">
              Learn More
            </Button>
          </div>
        </div>

        {/* Key Features Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">Key Features</h3>
            <p className="text-xl text-gray-600">
              Our comprehensive tools help detect and respond to stroke symptoms quickly
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center border-0 shadow-lg">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Activity className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Balance Detection</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-6">
                  Sophisticated sensors measure balance stability to detect potential stroke symptoms.
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  Try Now
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Eye className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Eye Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-6">
                  Advanced algorithms analyze eye movement patterns to identify neurological issues.
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  Try Now
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mic className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Speech Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-6">
                  Cutting-edge voice recognition evaluates speech clarity to identify potential slurring.
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  Try Now
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="h-8 w-8 text-red-600" />
                </div>
                <CardTitle className="text-xl">Emergency Assistance</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-6">
                  Quick access to emergency services when every second matters for stroke treatment.
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  Access
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h3>
            <p className="text-xl text-gray-600">
              Our simple 4-step process helps you monitor and respond to stroke symptoms
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="space-y-8">
              <div className="flex items-start space-x-6">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0">
                  1
                </div>
                <div className="flex-1">
                  <h4 className="text-2xl font-bold text-gray-900 mb-2">Register</h4>
                  <p className="text-gray-600 mb-4">
                    Create your profile with personal details, medical history, and emergency contacts for comprehensive care.
                  </p>
                  <Button variant="link" className="text-blue-600 p-0 h-auto">
                    Register Now <CheckCircle className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>

              <div className="flex items-start space-x-6">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0">
                  2
                </div>
                <div className="flex-1">
                  <h4 className="text-2xl font-bold text-gray-900 mb-2">Regular Testing</h4>
                  <p className="text-gray-600 mb-4">
                    Perform balance, eye tracking, and speech tests regularly to establish baseline data and monitor changes.
                  </p>
                  <Button variant="link" className="text-blue-600 p-0 h-auto">
                    View Tests <CheckCircle className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>

              <div className="flex items-start space-x-6">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0">
                  3
                </div>
                <div className="flex-1">
                  <h4 className="text-2xl font-bold text-gray-900 mb-2">Automated Analysis</h4>
                  <p className="text-gray-600 mb-4">
                    Our advanced AI algorithms analyze your results in real-time and detect potential stroke warning signs.
                  </p>
                  <Button variant="link" className="text-blue-600 p-0 h-auto">
                    See Analysis <CheckCircle className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>

              <div className="flex items-start space-x-6">
                <div className="w-12 h-12 bg-red-600 text-white rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0">
                  4
                </div>
                <div className="flex-1">
                  <h4 className="text-2xl font-bold text-gray-900 mb-2">Immediate Response</h4>
                  <p className="text-gray-600 mb-4">
                    If stroke signs are detected, instantly access emergency assistance and contact your pre-configured emergency contacts.
                  </p>
                  <Button variant="link" className="text-red-600 p-0 h-auto">
                    Emergency Access <CheckCircle className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
