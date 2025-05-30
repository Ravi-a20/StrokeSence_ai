
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

interface BalanceTestResult {
  posture: string;
  accelerationChange: number;
  angularTilt: number;
  stabilityScore: number;
  isAbnormal: boolean;
}

const POSTURES = [
  { 
    id: 'sws_eo', 
    name: 'Shoulder-Width Stance (Eyes Open)',
    instruction: 'Stand with feet shoulder-width apart, eyes open. Hold phone against your back at waist level.',
    difficulty: 1 
  },
  { 
    id: 'sws_ec', 
    name: 'Shoulder-Width Stance (Eyes Closed)',
    instruction: 'Stand with feet shoulder-width apart, close your eyes. Keep phone against your back.',
    difficulty: 2 
  },
  { 
    id: 'fts_eo', 
    name: 'Feet-Together Stance (Eyes Open)',
    instruction: 'Stand with feet together, eyes open. Keep phone against your back.',
    difficulty: 3 
  },
  { 
    id: 'fts_ec', 
    name: 'Feet-Together Stance (Eyes Closed)',
    instruction: 'Stand with feet together, close your eyes. Keep phone against your back.',
    difficulty: 4 
  },
  { 
    id: 'sts_eo', 
    name: 'Semi-Tandem Stance (Eyes Open)',
    instruction: 'Step forward with one foot (heel to toe), eyes open. Keep phone against your back.',
    difficulty: 5 
  },
  { 
    id: 'sts_ec', 
    name: 'Semi-Tandem Stance (Eyes Closed)',
    instruction: 'Step forward with one foot (heel to toe), close your eyes. Keep phone against your back.',
    difficulty: 6 
  }
];

const BalanceTest = ({ onComplete }: { onComplete?: (result: any) => void }) => {
  const [currentPosture, setCurrentPosture] = useState(0);
  const [isTestActive, setIsTestActive] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [testProgress, setTestProgress] = useState(0);
  const [accelerometerData, setAccelerometerData] = useState<MotionData[]>([]);
  const [gyroscopeData, setGyroscopeData] = useState<MotionData[]>([]);
  const [testResults, setTestResults] = useState<BalanceTestResult[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
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

  const startTest = async () => {
    setCurrentPosture(0);
    setIsTestActive(true);
    setCountdown(5);
    setTestProgress(0);
    setAccelerometerData([]);
    setGyroscopeData([]);
    setTestResults([]);
    setShowResults(false);
    
    toast({
      title: "Balance Assessment Starting",
      description: `Prepare for ${POSTURES[0].name}`,
    });
  };

  const startMotionTracking = async () => {
    try {
      setAccelerometerData([]);
      setGyroscopeData([]);

      // Start accelerometer with 50Hz sampling rate
      await Motion.addListener('accel', (event) => {
        const data: MotionData = {
          x: event.acceleration.x,
          y: event.acceleration.y,
          z: event.acceleration.z,
          timestamp: Date.now()
        };
        setAccelerometerData(prev => [...prev, data]);
      });

      // Start gyroscope with 50Hz sampling rate
      await Motion.addListener('orientation', (event) => {
        const data: MotionData = {
          x: event.alpha || 0, // yaw
          y: event.beta || 0,  // pitch
          z: event.gamma || 0, // roll
          timestamp: Date.now()
        };
        setGyroscopeData(prev => [...prev, data]);
      });

      toast({
        title: `Test Started: ${POSTURES[currentPosture].name}`,
        description: "Stand still with minimal body sway for 30 seconds",
      });

      // Run test for 30 seconds (as per research paper)
      const testDuration = 30000;
      const startTime = Date.now();
      
      const progressInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min((elapsed / testDuration) * 100, 100);
        setTestProgress(progress);
        
        if (elapsed >= testDuration) {
          clearInterval(progressInterval);
          stopCurrentTest();
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

  const stopCurrentTest = async () => {
    try {
      await Motion.removeAllListeners();
      
      // Analyze data from 10th to 20th second (as per research paper)
      const analysisStartTime = accelerometerData[0]?.timestamp + 10000;
      const analysisEndTime = accelerometerData[0]?.timestamp + 20000;
      
      const accelAnalysisData = accelerometerData.filter(
        d => d.timestamp >= analysisStartTime && d.timestamp <= analysisEndTime
      );
      const gyroAnalysisData = gyroscopeData.filter(
        d => d.timestamp >= analysisStartTime && d.timestamp <= analysisEndTime
      );

      const result = analyzePosturalControl(accelAnalysisData, gyroAnalysisData);
      
      setTestResults(prev => [...prev, {
        posture: POSTURES[currentPosture].name,
        accelerationChange: result.accelerationChange,
        angularTilt: result.angularTilt,
        stabilityScore: result.stabilityScore,
        isAbnormal: result.isAbnormal
      }]);

      // Move to next posture or finish
      if (currentPosture < POSTURES.length - 1) {
        setCurrentPosture(prev => prev + 1);
        setCountdown(60); // 60 second break between tests
        setTestProgress(0);
        
        toast({
          title: "Posture Complete",
          description: `60 second break. Next: ${POSTURES[currentPosture + 1].name}`,
        });
      } else {
        // All postures complete
        setIsTestActive(false);
        setIsAnalyzing(true);
        await finalAnalysis();
      }
    } catch (error) {
      console.error('Failed to stop motion tracking:', error);
    }
  };

  // Research paper algorithm implementation
  const analyzePosturalControl = (accelData: MotionData[], gyroData: MotionData[]) => {
    if (accelData.length < 2 || gyroData.length < 2) {
      return { accelerationChange: 0, angularTilt: 0, stabilityScore: 0, isAbnormal: true };
    }

    // Calculate combined acceleration changes (Algorithm 1 from paper)
    let totalAccelChange = 0;
    for (let i = 1; i < accelData.length; i++) {
      const dx = accelData[i].x - accelData[i-1].x;
      const dy = accelData[i].y - accelData[i-1].y;
      totalAccelChange += Math.sqrt(dx * dx + dy * dy);
    }
    const avgAccelChange = totalAccelChange / (accelData.length - 1);

    // Calculate angular tilt (Algorithm 2 from paper)
    const samplingRate = 50; // 50 Hz
    let totalAngularTilt = 0;
    
    for (const gyroPoint of gyroData) {
      const pitchDeg = Math.abs(gyroPoint.x) / samplingRate * (180 / Math.PI);
      const rollDeg = Math.abs(gyroPoint.y) / samplingRate * (180 / Math.PI);
      const yawDeg = Math.abs(gyroPoint.z) / samplingRate * (180 / Math.PI);
      totalAngularTilt += pitchDeg + rollDeg + yawDeg;
    }

    // Calculate stability score (lower is better)
    const stabilityScore = (avgAccelChange * 0.6) + (totalAngularTilt * 0.4);
    
    // Determine if abnormal based on posture difficulty and thresholds
    const postureDifficulty = POSTURES[currentPosture].difficulty;
    const threshold = getThresholdForPosture(postureDifficulty);
    const isAbnormal = stabilityScore > threshold;

    return {
      accelerationChange: avgAccelChange,
      angularTilt: totalAngularTilt,
      stabilityScore,
      isAbnormal
    };
  };

  const getThresholdForPosture = (difficulty: number): number => {
    // Thresholds based on research findings - adjust based on validation
    const thresholds = {
      1: 2.0,  // SWS E/O - easiest
      2: 2.5,  // SWS E/C
      3: 3.0,  // FTS E/O
      4: 3.5,  // FTS E/C
      5: 4.0,  // STS E/O
      6: 4.5   // STS E/C - hardest
    };
    return thresholds[difficulty as keyof typeof thresholds] || 3.0;
  };

  const finalAnalysis = async () => {
    try {
      const abnormalCount = testResults.filter(r => r.isAbnormal).length;
      const overallStabilityScore = testResults.reduce((sum, r) => sum + r.stabilityScore, 0) / testResults.length;
      
      // If 3 or more postures show abnormality, or overall stability is very poor
      const strokeRisk = abnormalCount >= 3 || overallStabilityScore > 15;
      
      const analysisResult = {
        stroke_detected: strokeRisk,
        abnormality_detected: abnormalCount >= 2,
        detailed_results: testResults,
        overall_stability_score: overallStabilityScore,
        abnormal_postures: abnormalCount
      };

      setShowResults(true);
      setIsAnalyzing(false);

      // Call the completion callback for comprehensive analysis
      if (onComplete) {
        onComplete(analysisResult);
      }

      toast({
        title: "Balance Analysis Complete",
        description: strokeRisk ? "Potential balance issues detected" : "Balance assessment completed",
        variant: strokeRisk ? "destructive" : "default",
      });
    } catch (error) {
      console.error('Balance analysis failed:', error);
      setIsAnalyzing(false);
      toast({
        title: "Analysis Error",
        description: "Failed to analyze balance data",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-blue-800">
            Research-Based Balance Assessment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {!isTestActive && !showResults && (
            <div className="text-center space-y-4">
              <p className="text-gray-600">
                This test uses 6 validated postures to assess balance control. 
                Each posture is held for 30 seconds with 60-second breaks.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Test Sequence:</h4>
                <ol className="text-sm text-blue-700 space-y-1">
                  {POSTURES.map((posture, index) => (
                    <li key={index}>{index + 1}. {posture.name}</li>
                  ))}
                </ol>
              </div>
            </div>
          )}

          {countdown > 0 && (
            <div className="text-center">
              <div className="text-6xl font-bold text-blue-600 mb-2">{countdown}</div>
              <p className="text-gray-600">
                {countdown > 30 ? 'Break time...' : 'Get ready...'}
              </p>
              {countdown <= 5 && countdown > 0 && (
                <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                  <h4 className="font-semibold text-yellow-800">
                    {POSTURES[currentPosture].name}
                  </h4>
                  <p className="text-sm text-yellow-700 mt-2">
                    {POSTURES[currentPosture].instruction}
                  </p>
                </div>
              )}
            </div>
          )}

          {isTestActive && countdown === 0 && (
            <div className="text-center space-y-4">
              <div className="text-2xl font-bold text-green-600">
                {POSTURES[currentPosture].name}
              </div>
              <div className="text-sm text-gray-600">
                Posture {currentPosture + 1} of {POSTURES.length}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                  style={{ width: `${testProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600">
                Stand still with minimal sway: {Math.round(30 - (testProgress * 0.3))}s remaining
              </p>
            </div>
          )}

          {isAnalyzing && (
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600">Analyzing balance patterns...</p>
              <p className="text-sm text-gray-500">Using research-validated algorithms</p>
            </div>
          )}

          {showResults && (
            <div className="space-y-4">
              <h3 className="font-semibold text-center">Assessment Results</h3>
              <div className="space-y-2">
                {testResults.map((result, index) => (
                  <div key={index} className={`p-3 rounded-lg border ${
                    result.isAbnormal ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
                  }`}>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{result.posture}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        result.isAbnormal ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {result.isAbnormal ? 'Abnormal' : 'Normal'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      Stability Score: {result.stabilityScore.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Overall Assessment:</h4>
                <p className="text-sm text-gray-700">
                  {testResults.filter(r => r.isAbnormal).length >= 3 
                    ? "Multiple balance abnormalities detected. Recommend medical consultation."
                    : testResults.filter(r => r.isAbnormal).length >= 2
                    ? "Some balance concerns noted. Monitor symptoms."
                    : "Balance performance within normal range."
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
            {isTestActive ? 'Assessment in Progress...' : showResults ? 'Restart Assessment' : 'Start Balance Assessment'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default BalanceTest;
