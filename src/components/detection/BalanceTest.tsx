
import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Motion } from '@capacitor/motion';
import { useNavigate } from 'react-router-dom';
import { Phone, AlertTriangle, Activity } from 'lucide-react';

interface MotionData {
  x: number;
  y: number;
  z: number;
  timestamp: number;
}

interface GaitAnalysisResult {
  accelerationChange: number;
  angularTilt: number;
  overallScore: number;
  isAbnormal: boolean;
}

const BalanceTest = ({ onComplete }: { onComplete?: (result: any) => void }) => {
  const [isTestActive, setIsTestActive] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [testProgress, setTestProgress] = useState(0);
  const [accelerometerData, setAccelerometerData] = useState<MotionData[]>([]);
  const [gyroscopeData, setGyroscopeData] = useState<MotionData[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [testResult, setTestResult] = useState<GaitAnalysisResult | null>(null);
  const [showEmergency, setShowEmergency] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const accelListenerRef = useRef<any>(null);
  const gyroListenerRef = useRef<any>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (countdown === 0 && isTestActive) {
      startGaitTracking();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [countdown, isTestActive]);

  useEffect(() => {
    return () => {
      // Cleanup listeners on unmount
      stopMotionListeners();
    };
  }, []);

  const stopMotionListeners = async () => {
    try {
      if (accelListenerRef.current) {
        await accelListenerRef.current.remove();
        accelListenerRef.current = null;
      }
      if (gyroListenerRef.current) {
        await gyroListenerRef.current.remove();
        gyroListenerRef.current = null;
      }
    } catch (error) {
      console.error('Error stopping motion listeners:', error);
    }
  };

  const startTest = async () => {
    setIsTestActive(true);
    setCountdown(5);
    setTestProgress(0);
    setAccelerometerData([]);
    setGyroscopeData([]);
    setShowResults(false);
    setShowEmergency(false);
    setTestResult(null);
    
    toast({
      title: "Gait Balance Test Starting",
      description: "Prepare to walk normally with phone held against chest",
    });
  };

  const startGaitTracking = async () => {
    try {
      setAccelerometerData([]);
      setGyroscopeData([]);

      console.log('Starting motion tracking...');

      // Start accelerometer
      accelListenerRef.current = await Motion.addListener('accel', (event) => {
        const data: MotionData = {
          x: event.acceleration.x,
          y: event.acceleration.y,
          z: event.acceleration.z,
          timestamp: Date.now()
        };
        console.log('Accel data:', data);
        setAccelerometerData(prev => [...prev, data]);
      });

      // Start gyroscope
      gyroListenerRef.current = await Motion.addListener('orientation', (event) => {
        const data: MotionData = {
          x: event.alpha || 0,
          y: event.beta || 0,
          z: event.gamma || 0,
          timestamp: Date.now()
        };
        console.log('Gyro data:', data);
        setGyroscopeData(prev => [...prev, data]);
      });

      toast({
        title: "Start Walking",
        description: "Walk naturally for 15 seconds with phone against your chest",
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
          stopGaitTest();
        }
      }, 100);

    } catch (error) {
      console.error('Failed to start motion tracking:', error);
      toast({
        title: "Error",
        description: "Failed to start motion sensors. Using simulated data for demo.",
        variant: "destructive",
      });
      
      // Fallback to simulated data for web testing
      simulateMotionData();
    }
  };

  const simulateMotionData = () => {
    console.log('Using simulated motion data...');
    const testDuration = 15000;
    const startTime = Date.now();
    
    const simulationInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / testDuration) * 100, 100);
      setTestProgress(progress);
      
      // Generate realistic motion data
      const accelData: MotionData = {
        x: (Math.random() - 0.5) * 4 + Math.sin(elapsed / 500) * 2,
        y: (Math.random() - 0.5) * 4 + Math.cos(elapsed / 600) * 1.5,
        z: 9.8 + (Math.random() - 0.5) * 3,
        timestamp: Date.now()
      };
      
      const gyroData: MotionData = {
        x: (Math.random() - 0.5) * 0.3,
        y: (Math.random() - 0.5) * 0.3,
        z: (Math.random() - 0.5) * 0.2,
        timestamp: Date.now()
      };
      
      setAccelerometerData(prev => [...prev, accelData]);
      setGyroscopeData(prev => [...prev, gyroData]);
      
      if (elapsed >= testDuration) {
        clearInterval(simulationInterval);
        stopGaitTest();
      }
    }, 50);
  };

  const stopGaitTest = async () => {
    console.log('Stopping gait test...');
    try {
      await stopMotionListeners();
      setIsAnalyzing(true);
      
      console.log('Accel data points:', accelerometerData.length);
      console.log('Gyro data points:', gyroscopeData.length);
      
      // Analyze the gait data
      const result = analyzeGaitPattern(accelerometerData, gyroscopeData);
      setTestResult(result);
      
      console.log('Analysis result:', result);
      
      if (result.isAbnormal) {
        setShowEmergency(true);
        toast({
          title: "Abnormal Gait Detected",
          description: "Emergency assistance activated",
          variant: "destructive",
        });
      } else {
        setShowResults(true);
        toast({
          title: "Gait Analysis Complete",
          description: "Normal walking pattern detected",
        });
      }

      setIsAnalyzing(false);
      setIsTestActive(false);

      if (onComplete) {
        onComplete({
          stroke_detected: result.isAbnormal,
          abnormality_detected: result.isAbnormal,
          gait_analysis: result
        });
      }

    } catch (error) {
      console.error('Failed to stop gait tracking:', error);
      setIsAnalyzing(false);
    }
  };

  const analyzeGaitPattern = (accelData: MotionData[], gyroData: MotionData[]): GaitAnalysisResult => {
    if (accelData.length < 10) {
      console.log('Insufficient acceleration data');
      return { 
        accelerationChange: 0, 
        angularTilt: 0, 
        overallScore: 0, 
        isAbnormal: true 
      };
    }

    // Calculate acceleration change using the research formula
    let totalAccelChange = 0;
    for (let i = 1; i < accelData.length; i++) {
      const dx = accelData[i].x - accelData[i-1].x;
      const dy = accelData[i].y - accelData[i-1].y;
      const change = Math.sqrt(dx * dx + dy * dy);
      totalAccelChange += change;
    }
    const accelerationChange = totalAccelChange / (accelData.length - 1);

    // Calculate angular tilt using the research formula
    let totalAngularTilt = 0;
    if (gyroData.length > 0) {
      const samplingRate = 50; // 50 Hz
      for (const gyroPoint of gyroData) {
        const ax = Math.abs(gyroPoint.x) / samplingRate * (180 / Math.PI);
        const ay = Math.abs(gyroPoint.y) / samplingRate * (180 / Math.PI);
        const az = Math.abs(gyroPoint.z) / samplingRate * (180 / Math.PI);
        totalAngularTilt += ax + ay + az;
      }
    }
    const angularTilt = totalAngularTilt;

    // Calculate overall score
    const overallScore = accelerationChange * 0.6 + angularTilt * 0.4;

    console.log('Analysis:', {
      accelerationChange,
      angularTilt,
      overallScore,
      accelDataLength: accelData.length,
      gyroDataLength: gyroData.length
    });

    // Determine if abnormal (adjusted thresholds for walking test)
    const isAbnormal = accelerationChange > 3.0 || angularTilt > 15.0 || overallScore > 12.0;

    return {
      accelerationChange,
      angularTilt,
      overallScore,
      isAbnormal
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
            <CardTitle className="text-red-800 text-2xl">Abnormal Gait Detected</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-red-700 text-center mb-6">
              Your walking pattern shows irregularities that may indicate balance issues. 
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
                  <p>Acceleration Change: {testResult.accelerationChange.toFixed(2)}</p>
                  <p>Angular Tilt: {testResult.angularTilt.toFixed(2)}</p>
                  <p>Overall Score: {testResult.overallScore.toFixed(2)}</p>
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
            Quick Gait Balance Test
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {!isTestActive && !showResults && (
            <div className="text-center space-y-4">
              <p className="text-gray-600">
                This test analyzes your walking pattern to detect balance abnormalities. 
                Simply hold your phone against your chest and walk naturally for 15 seconds.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Instructions:</h4>
                <ol className="text-sm text-blue-700 space-y-2 text-left">
                  <li>1. Hold phone firmly against your chest</li>
                  <li>2. Walk at your normal pace</li>
                  <li>3. Walk in a straight line if possible</li>
                  <li>4. Keep the phone steady against your body</li>
                </ol>
              </div>
            </div>
          )}

          {countdown > 0 && (
            <div className="text-center">
              <div className="text-6xl font-bold text-blue-600 mb-2">{countdown}</div>
              <p className="text-gray-600">Get ready to walk...</p>
              <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-700">
                  Position your phone against your chest and prepare to walk naturally
                </p>
              </div>
            </div>
          )}

          {isTestActive && countdown === 0 && (
            <div className="text-center space-y-4">
              <div className="text-2xl font-bold text-green-600">
                Walking Test Active
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                  style={{ width: `${testProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600">
                Keep walking naturally: {Math.round(15 - (testProgress * 0.15))}s remaining
              </p>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-700">
                  📱 Keep phone against chest<br/>
                  👟 Walk at normal pace<br/>
                  ➡️ Walk in straight line
                </p>
              </div>
            </div>
          )}

          {isAnalyzing && (
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600">Analyzing gait pattern...</p>
              <p className="text-sm text-gray-500">Processing sensor data...</p>
            </div>
          )}

          {showResults && testResult && (
            <div className="space-y-4">
              <h3 className="font-semibold text-center text-green-800">✅ Normal Gait Pattern</h3>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-800 mb-2">Test Results:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Acceleration Change:</span>
                    <span className="font-medium">{testResult.accelerationChange.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Angular Tilt:</span>
                    <span className="font-medium">{testResult.angularTilt.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-semibold">Overall Score:</span>
                    <span className="font-bold text-green-600">{testResult.overallScore.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700">
                  Your walking pattern appears normal with no significant balance abnormalities detected.
                </p>
              </div>
            </div>
          )}

          <Button 
            onClick={startTest}
            disabled={isTestActive || isAnalyzing}
            className="w-full"
          >
            {isTestActive ? 'Test in Progress...' : showResults ? 'Restart Test' : 'Start Gait Test'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default BalanceTest;
