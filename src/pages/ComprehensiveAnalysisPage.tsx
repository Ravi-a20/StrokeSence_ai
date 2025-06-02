
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Brain, Activity, Eye, Mic, Phone, AlertTriangle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import BalanceTest from '../components/detection/BalanceTest';
import EyeTrackingTest from '../components/detection/EyeTrackingTest';
import SpeechTest from '../components/detection/SpeechTest';
import { authService } from '../services/authService';

interface TestResult {
  test: string;
  status: 'pass' | 'fail' | 'pending';
  anomalyDetected: boolean;
}

const ComprehensiveAnalysisPage = () => {
  const [currentTest, setCurrentTest] = useState(0);
  const [testResults, setTestResults] = useState<TestResult[]>([
    { test: 'Balance', status: 'pending', anomalyDetected: false },
    { test: 'Eye Tracking', status: 'pending', anomalyDetected: false },
    { test: 'Speech', status: 'pending', anomalyDetected: false }
  ]);
  const [anomalyCount, setAnomalyCount] = useState(0);
  const [showEmergency, setShowEmergency] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const testComponents = [
    { component: BalanceTest, name: 'Balance Test', icon: Activity },
    { component: EyeTrackingTest, name: 'Eye Tracking Test', icon: Eye },
    { component: SpeechTest, name: 'Speech Test', icon: Mic }
  ];

  const handleTestComplete = (testIndex: number, result: any) => {
    const anomalyDetected = result.stroke_detected || result.abnormality_detected || result.status === 'anomaly';
    
    setTestResults(prev => prev.map((test, index) => 
      index === testIndex 
        ? { ...test, status: anomalyDetected ? 'fail' : 'pass', anomalyDetected }
        : test
    ));

    if (anomalyDetected) {
      const newAnomalyCount = anomalyCount + 1;
      setAnomalyCount(newAnomalyCount);
      
      // If 2 or more tests show anomaly, trigger emergency
      if (newAnomalyCount >= 2) {
        setShowEmergency(true);
        toast({
          title: "Emergency Alert",
          description: "Multiple tests indicate potential stroke. Emergency assistance activated.",
          variant: "destructive",
        });
        return;
      }
    }

    // Move to next test
    if (testIndex < testComponents.length - 1) {
      setCurrentTest(testIndex + 1);
      toast({
        title: `${testComponents[testIndex].name} Complete`,
        description: `Moving to ${testComponents[testIndex + 1].name}`,
      });
    } else {
      // All tests complete
      toast({
        title: "Analysis Complete",
        description: "All tests have been completed successfully.",
      });
    }
  };

  const callEmergencyServices = () => {
    window.open('tel:911');
    toast({
      title: "Emergency Call",
      description: "Calling emergency services...",
      variant: "destructive",
    });
  };

  const callEmergencyContact = () => {
    const user = authService.getCurrentUser();
    if (user?.emergency_contacts && user.emergency_contacts.length > 0) {
      const contact = user.emergency_contacts[0];
      window.open(`tel:${contact.phone}`);
      toast({
        title: "Calling Emergency Contact",
        description: `Calling ${contact.name}...`,
      });
    }
  };

  if (showEmergency) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 p-4 flex items-center justify-center">
        <Card className="w-full max-w-md border-red-200 bg-red-50">
          <CardHeader className="text-center">
            <AlertTriangle className="h-16 w-16 text-red-600 mx-auto mb-4" />
            <CardTitle className="text-red-800 text-2xl">Emergency Alert</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-red-700 text-center mb-6">
              Multiple tests indicate potential stroke symptoms. Immediate medical attention required.
            </p>
            
            <Button 
              onClick={callEmergencyServices}
              variant="destructive" 
              size="lg" 
              className="w-full text-lg py-4"
            >
              <Phone className="h-6 w-6 mr-2" />
              Call 911 Emergency Services
            </Button>
            
            <Button 
              onClick={callEmergencyContact}
              variant="outline" 
              size="lg" 
              className="w-full border-red-300 text-red-700"
            >
              <Phone className="h-5 w-5 mr-2" />
              Call Emergency Contact
            </Button>
            
            <Button 
              onClick={() => navigate('/emergency')}
              variant="outline" 
              className="w-full"
            >
              Go to Emergency Page
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const CurrentTestComponent = testComponents[currentTest]?.component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-blue-800">Comprehensive Analysis</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Indicator */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-center space-x-4 mb-8">
          {testComponents.map((test, index) => {
            const Icon = test.icon;
            const result = testResults[index];
            return (
              <div key={index} className="flex flex-col items-center space-y-2">
                <div className={`p-4 rounded-full border-2 transition-all duration-300 ${
                  index === currentTest 
                    ? 'border-blue-500 bg-blue-100' 
                    : result.status === 'pass' 
                    ? 'border-green-500 bg-green-100'
                    : result.status === 'fail'
                    ? 'border-red-500 bg-red-100'
                    : 'border-gray-300 bg-gray-100'
                }`}>
                  <Icon className={`h-6 w-6 ${
                    index === currentTest 
                      ? 'text-blue-600' 
                      : result.status === 'pass' 
                      ? 'text-green-600'
                      : result.status === 'fail'
                      ? 'text-red-600'
                      : 'text-gray-400'
                  }`} />
                </div>
                <p className="text-sm font-medium text-center">{test.name}</p>
                <p className="text-xs text-gray-600 capitalize">{result.status}</p>
              </div>
            );
          })}
        </div>

        {/* Current Test */}
        <div className="max-w-2xl mx-auto">
          {CurrentTestComponent && (
            <CurrentTestComponent 
              onComplete={(result: any) => handleTestComplete(currentTest, result)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ComprehensiveAnalysisPage;
