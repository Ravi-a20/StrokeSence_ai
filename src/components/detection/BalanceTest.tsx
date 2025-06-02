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

const SHAKE_THRESHOLD = 4.5; // Adjust this value for sensitivity (m/s^2)
const NORMAL_SHAKE_MAX = 2;  // 2 or fewer shakes = normal
const ABNORMAL_SHAKE_MIN = 8; // 8 or more shakes = abnormal
const TEST_DURATION = 10000; // 10 seconds

const BalanceTest = ({ onComplete }: { onComplete?: (result: any) => void }) => {
  const [isTestActive, setIsTestActive] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [testProgress, setTestProgress] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showEmergency, setShowEmergency] = useState(false);
  const [shakeCount, setShakeCount] = useState(0);
  const [isShaking, setIsShaking] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const accelListenerRef = useRef<any>(null);
  const lastAccelRef = useRef<MotionData | null>(null);
  const testTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

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
      stopMotionListener();
      if (testTimerRef.current) clearTimeout(testTimerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, []);

  const startTest = () => {
    setIsTestActive(true);
    setCountdown(3);
    setTestProgress(0);
    setShowResults(false);
    setShowEmergency(false);
    setShakeCount(0);
    setIsShaking(false);
    lastAccelRef.current = null;
    toast({
      title: "Balance Test Starting",
      description: "Hold your phone firmly against your chest and stand still.",
    });
  };

  const startBalanceTracking = async () => {
    setShakeCount(0);
    setIsShaking(false);
    lastAccelRef.current = null;

    try {
      accelListenerRef.current = await Motion.addListener('accel', (event) => {
        const current: MotionData = {
          x: event.acceleration.x,
          y: event.acceleration.y,
          z: event.acceleration.z,
          timestamp: Date.now()
        };

        if (lastAccelRef.current) {
          const dx = current.x - lastAccelRef.current.x;
          const dy = current.y - lastAccelRef.current.y;
          const dz = current.z - lastAccelRef.current.z;
          const delta = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (delta > SHAKE_THRESHOLD) {
            setShakeCount(prev => prev + 1);
            setIsShaking(true);
            setTimeout(() => setIsShaking(false), 300);
          }
        }
        lastAccelRef.current = current;
      });

      toast({
        title: "Hold Still",
        description: "Remain as steady as possible for 10 seconds.",
      });

      // Progress bar
      const startTime = Date.now();
      progressIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min((elapsed / TEST_DURATION) * 100, 100);
        setTestProgress(progress);
      }, 100);

      // End test after duration
      testTimerRef.current = setTimeout(() => {
        stopBalanceTest();
      }, TEST_DURATION);

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start motion sensors.",
        variant: "destructive",
      });
      setIsTestActive(false);
    }
  };

  const stopMotionListener = async () => {
    try {
      if (accelListenerRef.current) {
        await accelListenerRef.current.remove();
        accelListenerRef.current = null;
      }
    } catch (error) {
      // Ignore
    }
  };

  const stopBalanceTest = async () => {
    setIsAnalyzing(true);
    await stopMotionListener();
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);

    // Decision logic
    if (shakeCount >= ABNORMAL_SHAKE_MIN) {
      setShowEmergency(true);
      setIsTestActive(false);
      setIsAnalyzing(false);
      toast({
        title: "Abnormal Balance Detected",
        description: "Sudden shakes detected. Emergency assistance activated.",
        variant: "destructive",
      });
      window.open('tel:911');
      if (onComplete) {
        onComplete({ abnormal: true, shakeCount });
      }
    } else {
      setShowResults(true);
      setIsTestActive(false);
      setIsAnalyzing(false);
      toast({
        title: "Normal Balance",
        description: "No abnormal shakes detected.",
      });
      if (onComplete) {
        onComplete({ abnormal: false, shakeCount });
      }
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

  const goToEmergencyPage = () => {
    navigate('/emergency');
  };

  if (showEmergency) {
    return (
      <div className="p-4 max-w-md mx-auto">
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="text-center">
            <AlertTriangle className="h-16 w-16 text-red-600 mx-auto mb-4" />
            <CardTitle className="text-red-800 text-2xl">Abnormal Balance Detected</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-red-700 text-center mb-6">
              Sudden shakes or instability detected. Please seek immediate medical attention.
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
            <div className="bg-red-100 p-4 rounded-lg mt-4">
              <h4 className="font-semibold text-red-800 mb-2">Test Summary:</h4>
              <div className="text-sm text-red-700 space-y-1">
                <p>Shake Events Detected: {shakeCount}</p>
              </div>
            </div>
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
            Quick Body Balance Test
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {!isTestActive && !showResults && (
            <div className="text-center space-y-4">
              <p className="text-gray-600">
                This test checks your body balance by detecting sudden shakes or instability. 
                Hold your phone firmly against your chest and stand as still as possible for 10 seconds.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Instructions:</h4>
                <ol className="text-sm text-blue-700 space-y-2 text-left">
                  <li>1. Hold phone firmly against your chest</li>
                  <li>2. Stand still and do not move</li>
                  <li>3. Remain steady for 10 seconds</li>
                  <li>4. Avoid sudden movements or shakes</li>
                </ol>
              </div>
            </div>
          )}

          {countdown > 0 && (
            <div className="text-center">
              <div className="text-6xl font-bold text-blue-600 mb-2">{countdown}</div>
              <p className="text-gray-600">Get ready to begin...</p>
              <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-700">
                  Hold your phone against your chest and prepare to stand still.
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
                Remain steady: {Math.max(0, Math.round(TEST_DURATION / 1000 - (testProgress * (TEST_DURATION / 100) / 1000)))}s remaining
              </p>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-700">
                  📱 Hold phone against chest<br/>
                  🧍 Stand still<br/>
                  🚫 Avoid sudden shakes
                </p>
              </div>
              {isShaking && (
                <div className="mt-2 text-red-600 font-semibold animate-pulse">
                  Sudden shake detected!
                </div>
              )}
            </div>
          )}

          {isAnalyzing && (
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600">Analyzing balance...</p>
              <p className="text-sm text-gray-500">Detecting sudden shakes</p>
            </div>
          )}

          {showResults && (
            <div className="space-y-4">
              <h3 className={`font-semibold text-center ${shakeCount >= ABNORMAL_SHAKE_MIN ? "text-red-800" : "text-green-800"}`}>
                {shakeCount >= ABNORMAL_SHAKE_MIN ? "❌ Abnormal Body Balance" : "✅ Normal Body Balance"}
              </h3>
              <div className={`p-4 rounded-lg border ${shakeCount >= ABNORMAL_SHAKE_MIN ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"}`}>
                <h4 className={`font-semibold mb-2 ${shakeCount >= ABNORMAL_SHAKE_MIN ? "text-red-800" : "text-green-800"}`}>Test Summary:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Shake Events Detected:</span>
                    <span className="font-medium">{shakeCount}</span>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700">
                  {shakeCount >= ABNORMAL_SHAKE_MIN
                    ? "Abnormal shakes detected during the test. Please seek medical attention."
                    : "Your body balance appears normal. No abnormal shakes detected during the test."
                  }
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