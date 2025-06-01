
import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Motion } from '@capacitor/motion';
import { useNavigate } from 'react-router-dom';
import { Phone, AlertTriangle, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

interface MotionData {
  x: number;
  y: number;
  z: number;
  timestamp: number;
}

interface BalanceAnalysisResult {
  shakeIntensity: number;
  stabilityScore: number;
  overallScore: number;
  isAbnormal: boolean;
}

const BalanceTest = ({ onComplete }: { onComplete?: (result: any) => void }) => {
  const [isTestActive, setIsTestActive] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [testProgress, setTestProgress] = useState(0);
  const [accelerometerData, setAccelerometerData] = useState<MotionData[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [testResult, setTestResult] = useState<BalanceAnalysisResult | null>(null);
  const [showEmergency, setShowEmergency] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const accelListenerRef = useRef<any>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (countdown === 0 && isTestActive) {
      startBalanceTracking();
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
    } catch (error) {
      console.error('Error stopping motion listeners:', error);
    }
  };

  const startTest = async () => {
    setIsTestActive(true);
    setCountdown(5);
    setTestProgress(0);
    setAccelerometerData([]);
    setShowResults(false);
    setShowEmergency(false);
    setTestResult(null);
    
    toast({
      title: "Balance Stability Test Starting",
      description: "Prepare to hold phone against chest and stay still",
    });
  };

  const startBalanceTracking = async () => {
    try {
      setAccelerometerData([]);

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

      toast({
        title: "Stay Still",
        description: "Hold the phone against your chest and stay as still as possible for 15 seconds",
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
          stopBalanceTest();
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
        x: (Math.random() - 0.5) * 0.4,
        y: (Math.random() - 0.5) * 0.4,
        z: 9.8 + (Math.random() - 0.5) * 0.3,
        timestamp: Date.now()
      };
      
      setAccelerometerData(prev => [...prev, accelData]);
      
      if (elapsed >= testDuration) {
        clearInterval(simulationInterval);
        stopBalanceTest();
      }
    }, 50);
  };

  const stopBalanceTest = async () => {
    console.log('Stopping balance test...');
    try {
      await stopMotionListeners();
      setIsAnalyzing(true);
      
      console.log('Accel data points:', accelerometerData.length);
      
      // Analyze the balance data
      const result = analyzeBalanceStability(accelerometerData);
      setTestResult(result);
      
      console.log('Analysis result:', result);
      
      if (result.isAbnormal) {
        setShowEmergency(true);
        toast({
          title: "Abnormal Balance Detected",
          description: "Emergency assistance activated",
          variant: "destructive",
        });
        
        // Redirect to emergency page if abnormal
        setTimeout(() => {
          navigate('/emergency');
        }, 3000);
      } else {
        setShowResults(true);
        toast({
          title: "Balance Analysis Complete",
          description: "Normal balance stability detected",
        });
      }

      setIsAnalyzing(false);
      setIsTestActive(false);

      if (onComplete) {
        onComplete({
          stroke_detected: result.isAbnormal,
          abnormality_detected: result.isAbnormal,
          balance_analysis: result
        });
      }

    } catch (error) {
      console.error('Failed to stop balance tracking:', error);
      setIsAnalyzing(false);
    }
  };

  const analyzeBalanceStability = (accelData: MotionData[]): BalanceAnalysisResult => {
    if (accelData.length < 10) {
      console.log('Insufficient acceleration data');
      return { 
        shakeIntensity: 0, 
        stabilityScore: 0, 
        overallScore: 0, 
        isAbnormal: true 
      };
    }

    // Calculate shake intensity
    let totalShake = 0;
    for (let i = 1; i < accelData.length; i++) {
      const dx = accelData[i].x - accelData[i-1].x;
      const dy = accelData[i].y - accelData[i-1].y;
      const dz = accelData[i].z - accelData[i-1].z;
      const shake = Math.sqrt(dx * dx + dy * dy + dz * dz);
      totalShake += shake;
    }
    const shakeIntensity = totalShake / (accelData.length - 1);

    // Calculate stability score
    let stabilitySum = 0;
    for (const dataPoint of accelData) {
      const deviation = Math.abs(dataPoint.z - 9.8);
      stabilitySum += deviation;
    }
    const stabilityScore = stabilitySum / accelData.length;

    // Calculate overall score
    const overallScore = shakeIntensity * 0.7 + stabilityScore * 0.3;

    console.log('Analysis:', {
      shakeIntensity,
      stabilityScore,
      overallScore,
      accelDataLength: accelData.length
    });

    // Determine if abnormal (adjusted thresholds for balance test)
    const isAbnormal = shakeIntensity > 0.6 || stabilityScore > 0.4 || overallScore > 0.5;

    return {
      shakeIntensity,
      stabilityScore,
      overallScore,
      isAbnormal
    };
  };

  const goToEmergencyPage = () => {
    navigate('/emergency');
  };

  const cardVariants = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  const pulseVariants = {
    animate: {
      scale: [1, 1.05, 1],
      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
    }
  };

  if (showEmergency) {
    return (
      <motion.div 
        className="p-4 max-w-md mx-auto"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          animate={{ 
            boxShadow: [
              "0 0 0 0 rgba(239, 68, 68, 0.7)",
              "0 0 0 20px rgba(239, 68, 68, 0)",
              "0 0 0 0 rgba(239, 68, 68, 0)"
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Card className="border-red-200 bg-red-50">
            <CardHeader className="text-center">
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <AlertTriangle className="h-16 w-16 text-red-600 mx-auto mb-4" />
              </motion.div>
              <CardTitle className="text-red-800 text-2xl">Abnormal Balance Detected</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <motion.p 
                className="text-red-700 text-center mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                Excessive shaking detected while holding the phone. This may indicate balance issues. 
                Please seek immediate medical attention.
              </motion.p>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <Button 
                  onClick={() => window.open('tel:911')}
                  variant="destructive" 
                  size="lg" 
                  className="w-full text-lg py-4 shadow-lg"
                >
                  <Phone className="h-6 w-6 mr-2" />
                  Call 911 Emergency Services
                </Button>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.5 }}
              >
                <Button 
                  onClick={goToEmergencyPage}
                  variant="outline" 
                  className="w-full border-red-300 text-red-700"
                >
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Emergency Assistance Page
                </Button>
              </motion.div>
              
              {testResult && (
                <motion.div 
                  className="bg-red-100 p-4 rounded-lg mt-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9, duration: 0.5 }}
                >
                  <h4 className="font-semibold text-red-800 mb-2">Test Results:</h4>
                  <div className="text-sm text-red-700 space-y-1">
                    <p>Shake Intensity: {testResult.shakeIntensity.toFixed(2)}</p>
                    <p>Stability Score: {testResult.stabilityScore.toFixed(2)}</p>
                    <p>Overall Score: {testResult.overallScore.toFixed(2)}</p>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="p-4 max-w-md mx-auto"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
    >
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-blue-800 flex items-center justify-center">
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="mr-2"
            >
              <Activity className="h-6 w-6" />
            </motion.div>
            Balance Stability Test
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {!isTestActive && !showResults && (
            <motion.div 
              className="text-center space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-gray-600">
                This test detects balance issues by monitoring phone stability. 
                Hold your phone firmly against your chest and try to stay as still as possible for 15 seconds.
              </p>
              <motion.div 
                className="bg-blue-50 p-4 rounded-lg"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <h4 className="font-semibold text-blue-800 mb-2">Instructions:</h4>
                <ol className="text-sm text-blue-700 space-y-2 text-left">
                  <li>1. Hold phone firmly against your chest</li>
                  <li>2. Stand still and maintain balance</li>
                  <li>3. Try to minimize any shaking or movement</li>
                  <li>4. Keep the phone steady for the entire test</li>
                </ol>
              </motion.div>
            </motion.div>
          )}

          {countdown > 0 && (
            <motion.div 
              className="text-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <motion.div 
                className="text-6xl font-bold text-blue-600 mb-2"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, ease: "easeInOut" }}
              >
                {countdown}
              </motion.div>
              <p className="text-gray-600">Get ready...</p>
              <motion.div 
                className="mt-4 p-4 bg-yellow-50 rounded-lg"
                animate={{ backgroundColor: ["#fefce8", "#fef3c7", "#fefce8"] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <p className="text-sm text-yellow-700">
                  Position your phone against your chest and prepare to stay very still
                </p>
              </motion.div>
            </motion.div>
          )}

          {isTestActive && countdown === 0 && (
            <motion.div 
              className="text-center space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div 
                className="text-2xl font-bold text-green-600"
                variants={pulseVariants}
                animate="animate"
              >
                Stay Very Still
              </motion.div>
              <motion.div 
                className="w-full bg-gray-200 rounded-full h-4 overflow-hidden"
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 0.5 }}
              >
                <motion.div 
                  className="bg-gradient-to-r from-blue-600 to-green-600 h-4 rounded-full"
                  style={{ width: `${testProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>
              <p className="text-sm text-gray-600">
                Keep phone steady: {Math.round(15 - (testProgress * 0.15))}s remaining
              </p>
              <motion.div 
                className="bg-green-50 p-4 rounded-lg"
                animate={{ backgroundColor: ["#f0fdf4", "#dcfce7", "#f0fdf4"] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <p className="text-sm text-green-700">
                  📱 Hold phone against chest<br/>
                  🧘 Stay very still<br/>
                  ⚖️ Maintain balance
                </p>
              </motion.div>
            </motion.div>
          )}

          {isAnalyzing && (
            <motion.div 
              className="text-center space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="mx-auto w-8 h-8"
              >
                <div className="rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </motion.div>
              <p className="text-gray-600">Analyzing balance stability...</p>
              <motion.p 
                className="text-sm text-gray-500"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Processing movement data...
              </motion.p>
            </motion.div>
          )}

          {showResults && testResult && (
            <motion.div 
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <motion.h3 
                className="font-semibold text-center text-green-800"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
              >
                ✅ Normal Balance Detected
              </motion.h3>
              <motion.div 
                className="bg-green-50 p-4 rounded-lg border border-green-200"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <h4 className="font-semibold text-green-800 mb-2">Test Results:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Shake Intensity:</span>
                    <span className="font-medium">{testResult.shakeIntensity.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Stability Score:</span>
                    <span className="font-medium">{testResult.stabilityScore.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-semibold">Overall Score:</span>
                    <span className="font-bold text-green-600">{testResult.overallScore.toFixed(2)}</span>
                  </div>
                </div>
              </motion.div>
              <motion.div 
                className="bg-gray-50 p-4 rounded-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <p className="text-sm text-gray-700">
                  Your balance stability appears normal with no significant abnormalities detected.
                </p>
              </motion.div>
            </motion.div>
          )}

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button 
              onClick={startTest}
              disabled={isTestActive || isAnalyzing}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300"
            >
              {isTestActive ? 'Test in Progress...' : showResults ? 'Restart Test' : 'Start Balance Test'}
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default BalanceTest;
