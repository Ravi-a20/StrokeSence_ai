
import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Motion } from '@capacitor/motion';
import { useNavigate } from 'react-router-dom';
import { Phone, AlertTriangle, Activity } from 'lucide-react';

interface ShakeEvent {
  timestamp: number;
  intensity: number;
}

interface BalanceResult {
  shakeCount: number;
  avgShakeIntensity: number;
  maxShakeIntensity: number;
  isAbnormal: boolean;
  testDuration: number;
}

const BalanceTest = ({ onComplete }: { onComplete?: (result: any) => void }) => {
  const [isTestActive, setIsTestActive] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [testProgress, setTestProgress] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [testResult, setTestResult] = useState<BalanceResult | null>(null);
  const [showEmergency, setShowEmergency] = useState(false);
  const [shakeEvents, setShakeEvents] = useState<ShakeEvent[]>([]);
  const [currentShakeIntensity, setCurrentShakeIntensity] = useState(0);
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const motionListenerRef = useRef<any>(null);
  const lastAcceleration = useRef({ x: 0, y: 0, z: 0 });
  const testStartTime = useRef(0);

  // Shake detection thresholds
  const SHAKE_THRESHOLD = 2.5; // Acceleration threshold for detecting shakes
  const ABNORMAL_SHAKE_COUNT = 8; // More than 8 significant shakes in 15 seconds = abnormal
  const ABNORMAL_INTENSITY = 4.0; // Average shake intensity threshold

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (countdown === 0 && isTestActive) {
      startShakeDetection();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [countdown, isTestActive]);

  useEffect(() => {
    return () => {
      stopMotionListener();
    };
  }, []);

  const stopMotionListener = async () => {
    try {
      if (motionListenerRef.current) {
        await motionListenerRef.current.remove();
        motionListenerRef.current = null;
      }
    } catch (error) {
      console.error('Error stopping motion listener:', error);
    }
  };

  const startTest = async () => {
    setIsTestActive(true);
    setCountdown(3);
    setTestProgress(0);
    setShakeEvents([]);
    setCurrentShakeIntensity(0);
    setShowResults(false);
    setShowEmergency(false);
    setTestResult(null);
    
    toast({
      title: "Balance Test Starting",
      description: "Hold phone firmly against your chest and stand still",
    });
  };

  const startShakeDetection = async () => {
    try {
      console.log('Starting shake detection...');
      testStartTime.current = Date.now();
      setShakeEvents([]);

      // Start motion detection
      motionListenerRef.current = await Motion.addListener('accel', (event) => {
        const { x, y, z } = event.acceleration;
        
        // Calculate acceleration change (shake intensity)
        const deltaX = x - lastAcceleration.current.x;
        const deltaY = y - lastAcceleration.current.y;
        const deltaZ = z - lastAcceleration.current.z;
        
        const shakeIntensity = Math.sqrt(deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ);
        setCurrentShakeIntensity(shakeIntensity);
        
        // Detect significant shakes
        if (shakeIntensity > SHAKE_THRESHOLD) {
          const shakeEvent: ShakeEvent = {
            timestamp: Date.now(),
            intensity: shakeIntensity
          };
          
          setShakeEvents(prev => [...prev, shakeEvent]);
          console.log(`Shake detected! Intensity: ${shakeIntensity.toFixed(2)}`);
        }
        
        // Update last acceleration values
        lastAcceleration.current = { x, y, z };
      });

      toast({
        title: "Test Active",
        description: "Hold phone against chest and stand still for 15 seconds",
      });

      // Run test for 15 seconds
      const testDuration = 15000;
      const startTime = Date.now();
      
      const progressInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min((elapsed / testDuration) * 100, 100);
        setTestProgress(progress);
        
        if (elapsed >= testDuration) {
          clearInterval(progressInterval);
          stopShakeTest();
        }
      }, 100);

    } catch (error) {
      console.error('Failed to start motion detection:', error);
      toast({
        title: "Sensor Error",
        description: "Using simulated data for demonstration",
        variant: "destructive",
      });
      
      // Fallback simulation for demo
      simulateShakeDetection();
    }
  };

  const simulateShakeDetection = () => {
    console.log('Simulating shake detection for demo...');
    const testDuration = 15000;
    const startTime = Date.now();
    testStartTime.current = startTime;
    
    const simulationInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / testDuration) * 100, 100);
      setTestProgress(progress);
      
      // Randomly generate shake events for demo
      if (Math.random() < 0.1) { // 10% chance per interval
        const intensity = Math.random() * 3 + 1; // Random intensity 1-4
        const shakeEvent: ShakeEvent = {
          timestamp: Date.now(),
          intensity
        };
        setShakeEvents(prev => [...prev, shakeEvent]);
        setCurrentShakeIntensity(intensity);
        console.log(`Simulated shake: ${intensity.toFixed(2)}`);
      } else {
        setCurrentShakeIntensity(0);
      }
      
      if (elapsed >= testDuration) {
        clearInterval(simulationInterval);
        stopShakeTest();
      }
    }, 200);
  };

  const stopShakeTest = async () => {
    console.log('Stopping shake detection test...');
    try {
      await stopMotionListener();
      setIsAnalyzing(true);
      setCurrentShakeIntensity(0);
      
      // Analyze shake data
      const result = analyzeShakeData(shakeEvents);
      setTestResult(result);
      
      console.log('Shake analysis result:', result);
      
      if (result.isAbnormal) {
        setShowEmergency(true);
        toast({
          title: "Abnormal Movement Detected",
          description: "Excessive shaking detected - Emergency assistance activated",
          variant: "destructive",
        });
      } else {
        setShowResults(true);
        toast({
          title: "Balance Test Complete",
          description: "Normal stability detected",
        });
      }

      setIsAnalyzing(false);
      setIsTestActive(false);

      if (onComplete) {
        onComplete({
          stroke_detected: result.isAbnormal,
          abnormality_detected: result.isAbnormal,
          shake_analysis: result
        });
      }

    } catch (error) {
      console.error('Failed to stop shake detection:', error);
      setIsAnalyzing(false);
    }
  };

  const analyzeShakeData = (shakes: ShakeEvent[]): BalanceResult => {
    if (shakes.length === 0) {
      return {
        shakeCount: 0,
        avgShakeIntensity: 0,
        maxShakeIntensity: 0,
        isAbnormal: false,
        testDuration: 15
      };
    }

    const shakeCount = shakes.length;
    const totalIntensity = shakes.reduce((sum, shake) => sum + shake.intensity, 0);
    const avgShakeIntensity = totalIntensity / shakeCount;
    const maxShakeIntensity = Math.max(...shakes.map(shake => shake.intensity));

    // Determine if abnormal based on shake count and intensity
    const isAbnormal = shakeCount > ABNORMAL_SHAKE_COUNT || avgShakeIntensity > ABNORMAL_INTENSITY;

    console.log('Shake Analysis:', {
      shakeCount,
      avgShakeIntensity,
      maxShakeIntensity,
      isAbnormal,
      threshold: `Shakes: ${ABNORMAL_SHAKE_COUNT}, Intensity: ${ABNORMAL_INTENSITY}`
    });

    return {
      shakeCount,
      avgShakeIntensity,
      maxShakeIntensity,
      isAbnormal,
      testDuration: 15
    };
  };

  const callEmergencyServices = () => {
    window.open('tel:911');
    toast({
      title: "Emergency Call",
      description: "Calling emergency services...",
      variant: "destructive",
    });
  };

  const goToEmergencyPage = () => {
    navigate('/emergency');
  };

  if (showEmergency) {
    return (
      <div className="p-4 max-w-md mx-auto">
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="text-center">
            <AlertTriangle className="h-16 w-16 text-red-600 mx-auto mb-4" />
            <CardTitle className="text-red-800 text-2xl">Balance Issue Detected</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-red-700 text-center mb-6">
              Excessive movement detected while testing balance. This may indicate stability issues. 
              Please seek immediate medical attention.
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
              onClick={goToEmergencyPage}
              variant="outline" 
              className="w-full border-red-300 text-red-700"
            >
              <AlertTriangle className="h-5 w-5 mr-2" />
              Emergency Assistance Page
            </Button>
            
            {testResult && (
              <div className="bg-red-100 p-4 rounded-lg mt-4">
                <h4 className="font-semibold text-red-800 mb-2">Test Results:</h4>
                <div className="text-sm text-red-700 space-y-1">
                  <p>Shake Count: {testResult.shakeCount}</p>
                  <p>Avg Intensity: {testResult.avgShakeIntensity.toFixed(2)}</p>
                  <p>Max Intensity: {testResult.maxShakeIntensity.toFixed(2)}</p>
                  <p className="font-semibold">Status: Abnormal Movement</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-blue-800 flex items-center justify-center">
            <Activity className="h-6 w-6 mr-2" />
            Balance Stability Test
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {!isTestActive && !showResults && (
            <div className="text-center space-y-4">
              <p className="text-gray-600">
                This test detects balance issues by monitoring phone stability while held against your chest. 
                Stand still and hold the phone firmly for 15 seconds.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Instructions:</h4>
                <ol className="text-sm text-blue-700 space-y-2 text-left">
                  <li>1. Hold phone firmly against your chest</li>
                  <li>2. Stand still in one place</li>
                  <li>3. Try not to move or shake</li>
                  <li>4. Keep phone steady for 15 seconds</li>
                </ol>
              </div>
            </div>
          )}

          {countdown > 0 && (
            <div className="text-center">
              <div className="text-6xl font-bold text-blue-600 mb-2">{countdown}</div>
              <p className="text-gray-600">Get ready...</p>
              <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-700">
                  📱 Hold phone against chest firmly<br/>
                  🧍 Stand still and don't move
                </p>
              </div>
            </div>
          )}

          {isTestActive && countdown === 0 && (
            <div className="text-center space-y-4">
              <div className="text-2xl font-bold text-green-600">
                Balance Test Active
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                  style={{ width: `${testProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600">
                Hold steady: {Math.round(15 - (testProgress * 0.15))}s remaining
              </p>
              
              {/* Real-time shake indicator */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Stability:</span>
                  <span className={`text-sm font-medium ${currentShakeIntensity > SHAKE_THRESHOLD ? 'text-red-600' : 'text-green-600'}`}>
                    {currentShakeIntensity > SHAKE_THRESHOLD ? 'Movement Detected' : 'Stable'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${currentShakeIntensity > SHAKE_THRESHOLD ? 'bg-red-500' : 'bg-green-500'}`}
                    style={{ width: `${Math.min((currentShakeIntensity / 5) * 100, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Shakes detected: {shakeEvents.length}
                </p>
              </div>
            </div>
          )}

          {isAnalyzing && (
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600">Analyzing stability...</p>
              <p className="text-sm text-gray-500">Processing movement data...</p>
            </div>
          )}

          {showResults && testResult && (
            <div className="space-y-4">
              <h3 className="font-semibold text-center text-green-800">✅ Good Balance</h3>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-800 mb-2">Test Results:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Shake Count:</span>
                    <span className="font-medium">{testResult.shakeCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg Intensity:</span>
                    <span className="font-medium">{testResult.avgShakeIntensity.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-semibold">Status:</span>
                    <span className="font-bold text-green-600">Stable</span>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700">
                  Your balance appears stable with minimal unnecessary movement detected.
                </p>
              </div>
            </div>
          )}

          <Button 
            onClick={startTest}
            disabled={isTestActive || isAnalyzing}
            className="w-full"
          >
            {isTestActive ? 'Test in Progress...' : showResults ? 'Restart Test' : 'Start Balance Test'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default BalanceTest;
