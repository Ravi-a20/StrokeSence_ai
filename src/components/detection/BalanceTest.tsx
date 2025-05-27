
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Motion } from '@capacitor/motion';
import { apiService, SensorData } from '../../services/apiService';
import { authService } from '../../services/authService';

interface MotionData {
  x: number;
  y: number;
  z: number;
  timestamp: number;
}

const BalanceTest = () => {
  const [isTestActive, setIsTestActive] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [testProgress, setTestProgress] = useState(0);
  const [accelerometerData, setAccelerometerData] = useState<MotionData[]>([]);
  const [gyroscopeData, setGyroscopeData] = useState<MotionData[]>([]);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (countdown === 0 && isTestActive) {
      startMotionTracking();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [countdown, isTestActive]);

  const requestPermissions = async () => {
    try {
      const hasPermission = await Motion.requestPermissions();
      if (hasPermission.granted) {
        return true;
      } else {
        toast({
          title: "Permission Required",
          description: "Motion sensor access is required for balance testing",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('Permission request failed:', error);
      toast({
        title: "Error",
        description: "Failed to request motion sensor permissions",
        variant: "destructive",
      });
      return false;
    }
  };

  const startTest = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    setIsTestActive(true);
    setCountdown(3);
    setTestProgress(0);
    setAccelerometerData([]);
    setGyroscopeData([]);
    setTestResult(null);
    
    toast({
      title: "Get Ready",
      description: "Hold your phone against your chest with both hands and prepare to walk",
    });
  };

  const startMotionTracking = async () => {
    try {
      // Start accelerometer
      await Motion.addListener('accel', (event) => {
        const data: MotionData = {
          x: event.acceleration.x,
          y: event.acceleration.y,
          z: event.acceleration.z,
          timestamp: Date.now()
        };
        setAccelerometerData(prev => [...prev, data]);
      });

      // Start gyroscope
      await Motion.addListener('gyro', (event) => {
        const data: MotionData = {
          x: event.rotationRate.alpha,
          y: event.rotationRate.beta,
          z: event.rotationRate.gamma,
          timestamp: Date.now()
        };
        setGyroscopeData(prev => [...prev, data]);
      });

      toast({
        title: "Test Started",
        description: "Walk normally for 10 seconds while holding the phone",
      });

      // Run test for 10 seconds
      const testDuration = 10000; // 10 seconds
      const startTime = Date.now();
      
      const progressInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min((elapsed / testDuration) * 100, 100);
        setTestProgress(progress);
        
        if (elapsed >= testDuration) {
          clearInterval(progressInterval);
          stopTest();
        }
      }, 100);

    } catch (error) {
      console.error('Failed to start motion tracking:', error);
      toast({
        title: "Error",
        description: "Failed to start motion sensors",
        variant: "destructive",
      });
    }
  };

  const stopTest = async () => {
    try {
      await Motion.removeAllListeners();
      setIsTestActive(false);
      setIsAnalyzing(true);
      
      toast({
        title: "Test Complete",
        description: "Analyzing your balance data...",
      });

      await analyzeResults();
    } catch (error) {
      console.error('Failed to stop motion tracking:', error);
    }
  };

  const analyzeResults = async () => {
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        throw new Error('User not logged in');
      }

      // Convert motion data to the format expected by API
      const accelArray = accelerometerData.map(d => [d.x, d.y, d.z]);
      const gyroArray = gyroscopeData.map(d => [d.x, d.y, d.z]);

      const sensorData: SensorData = {
        accel: accelArray,
        gyro: gyroArray,
        user_id: currentUser._id
      };

      const result = await apiService.analyzeBalance(sensorData);
      
      // Display result based on API response
      if (result.stroke_detected || result.abnormality_detected) {
        setTestResult('Potential balance abnormalities detected. Please consult a healthcare professional.');
        toast({
          title: "Test Result",
          description: "Potential balance issues detected",
          variant: "destructive",
        });
      } else {
        setTestResult('No significant balance abnormalities detected.');
        toast({
          title: "Test Result",
          description: "Balance appears normal",
        });
      }
    } catch (error) {
      console.error('Balance analysis failed:', error);
      setTestResult('Analysis failed. Please try again.');
      toast({
        title: "Analysis Error",
        description: "Failed to analyze balance data",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-blue-800">Balance Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Hold your phone against your chest with both hands and walk normally for 10 seconds.
            </p>
          </div>

          {countdown > 0 && (
            <div className="text-center">
              <div className="text-6xl font-bold text-blue-600 mb-2">{countdown}</div>
              <p className="text-gray-600">Get ready to walk...</p>
            </div>
          )}

          {isTestActive && countdown === 0 && (
            <div className="text-center space-y-4">
              <div className="text-2xl font-bold text-green-600">Walking Test Active</div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                  style={{ width: `${testProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600">{Math.round(testProgress)}% Complete</p>
            </div>
          )}

          {isAnalyzing && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-600">Analyzing balance data...</p>
            </div>
          )}

          {testResult && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Test Result:</h3>
              <p className="text-gray-700">{testResult}</p>
            </div>
          )}

          <Button 
            onClick={startTest}
            disabled={isTestActive || isAnalyzing}
            className="w-full"
          >
            {isTestActive ? 'Test in Progress...' : 'Start Balance Test'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default BalanceTest;
