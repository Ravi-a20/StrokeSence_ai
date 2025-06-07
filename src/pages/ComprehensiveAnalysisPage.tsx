
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Brain, Activity, Eye, Mic, Phone, AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import BalanceTest from '../components/detection/BalanceTest';
import EyeTrackingTest from '../components/detection/EyeTrackingTest';
import SpeechTest from '../components/detection/SpeechTest';
import { authService } from '../services/authService';

interface TestResult {
  test: string;
  status: 'pending' | 'running' | 'pass' | 'fail';
  anomalyDetected: boolean;
  score?: number;
  timestamp?: number;
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
  const [isTestingComplete, setIsTestingComplete] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const testComponents = [
    { 
      component: BalanceTest, 
      name: 'Balance Test', 
      icon: Activity,
      description: 'Analyzing postural stability and movement patterns'
    },
    { 
      component: EyeTrackingTest, 
      name: 'Eye Tracking Test', 
      icon: Eye,
      description: 'Monitoring eye movement and coordination'
    },
    { 
      component: SpeechTest, 
      name: 'Speech Test', 
      icon: Mic,
      description: 'Detecting speech pattern irregularities'
    }
  ];

  useEffect(() => {
    if (currentTest < testComponents.length) {
      setTestResults(prev => prev.map((test, index) => 
        index === currentTest 
          ? { ...test, status: 'running' }
          : test
      ));
    }
  }, [currentTest]);

  const handleTestComplete = (testIndex: number, result: any) => {
    const anomalyDetected = result.stroke_detected || result.abnormality_detected || result.status === 'anomaly';
    
    setTestResults(prev => prev.map((test, index) => 
      index === testIndex 
        ? { 
            ...test, 
            status: anomalyDetected ? 'fail' : 'pass', 
            anomalyDetected,
            score: result.confidence_score || result.overallScore,
            timestamp: Date.now()
          }
        : test
    ));

    if (anomalyDetected) {
      const newAnomalyCount = anomalyCount + 1;
      setAnomalyCount(newAnomalyCount);
      
      // If 2 or more tests show anomaly, trigger emergency immediately
      if (newAnomalyCount >= 2) {
        setShowEmergency(true);
        toast({
          title: "STROKE DETECTED",
          description: "Multiple abnormalities detected. Emergency assistance activated.",
          variant: "destructive",
        });
        return;
      }
    }

    // Move to next test or complete
    if (testIndex < testComponents.length - 1) {
      setTimeout(() => {
        setCurrentTest(testIndex + 1);
        toast({
          title: `${testComponents[testIndex].name} Complete`,
          description: `Starting ${testComponents[testIndex + 1].name}...`,
        });
      }, 2000);
    } else {
      // All tests complete
      setIsTestingComplete(true);
      toast({
        title: "Analysis Complete",
        description: anomalyCount >= 2 ? "Stroke symptoms detected" : "No significant abnormalities detected",
        variant: anomalyCount >= 2 ? "destructive" : "default",
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

  const getStatusIcon = (status: string, anomaly: boolean) => {
    switch (status) {
      case 'running':
        return <Clock className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'pass':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'fail':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <div className="h-5 w-5 border-2 border-gray-300 rounded-full" />;
    }
  };

  if (showEmergency) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 p-4 flex items-center justify-center animate-fade-in">
        <Card className="w-full max-w-md border-red-200 bg-red-50 animate-scale-in">
          <CardHeader className="text-center">
            <AlertTriangle className="h-16 w-16 text-red-600 mx-auto mb-4 animate-pulse" />
            <CardTitle className="text-red-800 text-2xl animate-fade-in">🚨 STROKE DETECTED</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-red-100 p-4 rounded-lg border border-red-300 animate-fade-in">
              <p className="text-red-700 text-center font-semibold mb-2">
                EMERGENCY ALERT
              </p>
              <p className="text-red-600 text-sm text-center">
                {anomalyCount} out of {testResults.length} tests show abnormalities indicating potential stroke
              </p>
            </div>
            
            <Button 
              onClick={callEmergencyServices}
              variant="destructive" 
              size="lg" 
              className="w-full text-lg py-4 animate-pulse hover-scale"
            >
              <Phone className="h-6 w-6 mr-2" />
              Call 911 Emergency Services
            </Button>
            
            <Button 
              onClick={callEmergencyContact}
              variant="outline" 
              size="lg" 
              className="w-full border-red-300 text-red-700 hover-scale"
            >
              <Phone className="h-5 w-5 mr-2" />
              Call Emergency Contact
            </Button>
            
            <Button 
              onClick={() => navigate('/emergency')}
              variant="outline" 
              className="w-full hover-scale"
            >
              Go to Emergency Page
            </Button>

            {/* Test Results Summary */}
            <div className="bg-white p-4 rounded-lg border border-red-200 animate-fade-in">
              <h4 className="font-semibold text-red-800 mb-2">Test Results:</h4>
              {testResults.map((result, index) => (
                <div key={index} className="flex justify-between items-center py-1">
                  <span className="text-sm">{result.test}</span>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(result.status, result.anomalyDetected)}
                    <span className={`text-xs font-medium ${
                      result.anomalyDetected ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {result.anomalyDetected ? 'ABNORMAL' : 'NORMAL'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const CurrentTestComponent = testComponents[currentTest]?.component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b animate-slide-in-right">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={() => navigate('/dashboard')} className="hover-scale">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-blue-600 animate-pulse" />
              <h1 className="text-2xl font-bold text-blue-800">Comprehensive Analysis</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Indicator */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-center space-x-8 mb-8">
          {testComponents.map((test, index) => {
            const Icon = test.icon;
            const result = testResults[index];
            const isActive = index === currentTest;
            const isCompleted = result.status === 'pass' || result.status === 'fail';
            
            return (
              <div key={index} className={`flex flex-col items-center space-y-3 transition-all duration-500 ${
                isActive ? 'animate-scale-in' : ''
              }`}>
                <div className={`relative p-6 rounded-full border-3 transition-all duration-500 ${
                  isActive 
                    ? 'border-blue-500 bg-blue-100 shadow-lg scale-110' 
                    : result.status === 'pass' 
                    ? 'border-green-500 bg-green-100'
                    : result.status === 'fail'
                    ? 'border-red-500 bg-red-100'
                    : 'border-gray-300 bg-gray-100'
                } hover-scale`}>
                  {isActive && (
                    <div className="absolute inset-0 rounded-full border-3 border-blue-400 animate-ping"></div>
                  )}
                  <Icon className={`h-8 w-8 transition-colors duration-300 ${
                    isActive 
                      ? 'text-blue-600' 
                      : result.status === 'pass' 
                      ? 'text-green-600'
                      : result.status === 'fail'
                      ? 'text-red-600'
                      : 'text-gray-400'
                  }`} />
                  {isActive && result.status === 'running' && (
                    <div className="absolute -top-1 -right-1">
                      <Clock className="h-4 w-4 text-blue-500 animate-spin" />
                    </div>
                  )}
                  {isCompleted && (
                    <div className="absolute -top-1 -right-1">
                      {getStatusIcon(result.status, result.anomalyDetected)}
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <p className={`font-medium transition-colors duration-300 ${
                    isActive ? 'text-blue-700' : 'text-gray-700'
                  }`}>{test.name}</p>
                  <p className={`text-xs mt-1 transition-colors duration-300 ${
                    isActive ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {isActive ? test.description : result.status.charAt(0).toUpperCase() + result.status.slice(1)}
                  </p>
                  {result.timestamp && (
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(result.timestamp).toLocaleTimeString()}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Progress Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${((currentTest + (testResults[currentTest]?.status === 'pass' || testResults[currentTest]?.status === 'fail' ? 1 : 0)) / testComponents.length) * 100}%` }}
            ></div>
          </div>
          <p className="text-center text-sm text-gray-600 mt-2">
            Test {currentTest + 1} of {testComponents.length}
          </p>
        </div>

        {/* Current Test */}
        <div className="max-w-2xl mx-auto">
          {CurrentTestComponent && !isTestingComplete && (
            <div className="animate-fade-in">
              <CurrentTestComponent 
                onComplete={(result: any) => handleTestComplete(currentTest, result)}
              />
            </div>
          )}

          {/* Final Results */}
          {isTestingComplete && (
            <Card className="animate-scale-in">
              <CardHeader className="text-center">
                <CardTitle className={`text-2xl ${
                  anomalyCount >= 2 ? 'text-red-800' : anomalyCount === 1 ? 'text-yellow-800' : 'text-green-800'
                }`}>
                  {anomalyCount >= 2 ? '⚠️ Abnormalities Detected' : 
                   anomalyCount === 1 ? '⚡ Minor Concerns' : 
                   '✅ All Tests Normal'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className={`p-4 rounded-lg ${
                  anomalyCount >= 2 ? 'bg-red-50 border border-red-200' :
                  anomalyCount === 1 ? 'bg-yellow-50 border border-yellow-200' :
                  'bg-green-50 border border-green-200'
                }`}>
                  <p className={`text-center ${
                    anomalyCount >= 2 ? 'text-red-700' :
                    anomalyCount === 1 ? 'text-yellow-700' :
                    'text-green-700'
                  }`}>
                    {anomalyCount >= 2 ? 
                      'Multiple tests indicate potential stroke symptoms. Please seek immediate medical attention.' :
                      anomalyCount === 1 ?
                      'One test showed irregularities. Consider consulting with a healthcare professional.' :
                      'All tests completed successfully with no significant abnormalities detected.'
                    }
                  </p>
                </div>

                {/* Detailed Results */}
                <div className="space-y-2">
                  {testResults.map((result, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-white rounded-lg border">
                      <span className="font-medium">{result.test}</span>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(result.status, result.anomalyDetected)}
                        <span className={`text-sm font-medium ${
                          result.anomalyDetected ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {result.anomalyDetected ? 'ABNORMAL' : 'NORMAL'}
                        </span>
                        {result.score && (
                          <span className="text-xs text-gray-500">
                            Score: {result.score.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex space-x-4">
                  <Button 
                    onClick={() => window.location.reload()}
                    variant="outline" 
                    className="flex-1 hover-scale"
                  >
                    Restart Analysis
                  </Button>
                  <Button 
                    onClick={() => navigate('/dashboard')}
                    className="flex-1 hover-scale"
                  >
                    Back to Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComprehensiveAnalysisPage;
