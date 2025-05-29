import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Eye, CheckCircle, XCircle, Clock, Camera, Target } from 'lucide-react';
import EyeTrackingConfig from './EyeTrackingConfig';

interface EyeTrackingTestProps {
  onComplete: (result: any) => void;
}

const EyeTrackingTest: React.FC<EyeTrackingTestProps> = ({ onComplete }) => {
  // Configuration with default values
  const [config, setConfig] = useState({
    movementThreshold: 40,
    calibrationTime: 3,
    directionTime: 5,
    maxConsecutiveMisses: 2,
    detectionInterval: 100,
    smoothingFactor: 0.3
  });

  const [isTestRunning, setIsTestRunning] = useState(false);
  const [currentDirection, setCurrentDirection] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [eyePosition, setEyePosition] = useState({ x: 0, y: 0 });
  const [smoothedPosition, setSmoothedPosition] = useState({ x: 0, y: 0 });
  const [baselinePosition, setBaselinePosition] = useState({ x: 0, y: 0 });
  const [showConfig, setShowConfig] = useState(false);
  
  // Test state
  const [missedDirections, setMissedDirections] = useState<string[]>([]);
  const [consecutiveMisses, setConsecutiveMisses] = useState(0);
  const [completedDirections, setCompletedDirections] = useState<string[]>([]);
  const [testHistory, setTestHistory] = useState<Array<{direction: string, result: 'success' | 'miss', movement?: {x: number, y: number}}>>([]);
  const [currentMovement, setCurrentMovement] = useState({ x: 0, y: 0 });
  const [detectedDirection, setDetectedDirection] = useState('');
  
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const detectionRef = useRef<NodeJS.Timeout | null>(null);
  const calibrationSamples = useRef<Array<{x: number, y: number}>>([]);

  // All 8 possible gaze directions
  const directions = ["Left", "Right", "Up", "Down", "Up-Left", "Up-Right", "Down-Left", "Down-Right"];
  const [directionsToTest, setDirectionsToTest] = useState<string[]>([]);
  const [currentDirectionIndex, setCurrentDirectionIndex] = useState(0);

  useEffect(() => {
    checkCameraPermissions();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (timerRef.current) clearTimeout(timerRef.current);
      if (detectionRef.current) clearTimeout(detectionRef.current);
    };
  }, []);

  const checkCameraPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: 640, 
          height: 480,
          facingMode: 'user'
        } 
      });
      setPermissionGranted(true);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          console.log('Video loaded, starting face detection');
          startFaceDetection();
        };
      }
    } catch (error) {
      console.error('Camera permission denied:', error);
      toast({
        title: "Camera Access Required",
        description: "Please grant camera permission to use the eye tracking test",
        variant: "destructive",
      });
    }
  };

  const startFaceDetection = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const detectFace = () => {
      if (!video.videoWidth || !ctx) return;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Simple center-based detection (in real app, use MediaPipe)
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      // Apply smoothing to reduce noise
      const newX = smoothedPosition.x + (centerX - smoothedPosition.x) * config.smoothingFactor;
      const newY = smoothedPosition.y + (centerY - smoothedPosition.y) * config.smoothingFactor;
      
      setEyePosition({ x: centerX, y: centerY });
      setSmoothedPosition({ x: newX, y: newY });
      
      if (isTestRunning && !isCalibrating && baselinePosition.x && baselinePosition.y) {
        checkGazeDirection(newX, newY);
      }
      
      detectionRef.current = setTimeout(detectFace, config.detectionInterval);
    };

    detectFace();
  };

  const checkGazeDirection = (x: number, y: number) => {
    const deltaX = x - baselinePosition.x;
    const deltaY = y - baselinePosition.y;
    const threshold = config.movementThreshold;
    
    setCurrentMovement({ x: deltaX, y: deltaY });
    
    let detected = '';
    
    // Determine direction based on movement with improved logic
    const horizontalMovement = Math.abs(deltaX) > threshold;
    const verticalMovement = Math.abs(deltaY) > threshold;
    
    if (horizontalMovement || verticalMovement) {
      if (horizontalMovement && verticalMovement) {
        // Diagonal movement
        if (deltaY < 0) {
          detected = deltaX > 0 ? 'Up-Right' : 'Up-Left';
        } else {
          detected = deltaX > 0 ? 'Down-Right' : 'Down-Left';
        }
      } else if (horizontalMovement) {
        // Horizontal movement
        detected = deltaX > 0 ? 'Right' : 'Left';
      } else {
        // Vertical movement
        detected = deltaY > 0 ? 'Down' : 'Up';
      }
    }
    
    setDetectedDirection(detected);
    
    console.log(`Target: ${currentDirection}, Detected: ${detected}, Movement: (${deltaX.toFixed(1)}, ${deltaY.toFixed(1)}), Threshold: ${threshold}`);
    
    if (detected === currentDirection) {
      handleDirectionSuccess();
    }
  };

  const calibrateBaseline = () => {
    setIsCalibrating(true);
    calibrationSamples.current = [];
    
    toast({
      title: "Calibrating",
      description: `Look straight at the camera for ${config.calibrationTime} seconds`,
    });
    
    // Collect samples during calibration
    const sampleInterval = setInterval(() => {
      calibrationSamples.current.push({ x: smoothedPosition.x, y: smoothedPosition.y });
    }, 200);
    
    setTimeout(() => {
      clearInterval(sampleInterval);
      
      // Calculate average position from samples
      if (calibrationSamples.current.length > 0) {
        const avgX = calibrationSamples.current.reduce((sum, pos) => sum + pos.x, 0) / calibrationSamples.current.length;
        const avgY = calibrationSamples.current.reduce((sum, pos) => sum + pos.y, 0) / calibrationSamples.current.length;
        
        setBaselinePosition({ x: avgX, y: avgY });
        console.log('Calibration complete. Baseline set to:', { x: avgX, y: avgY });
        console.log('Samples collected:', calibrationSamples.current.length);
      }
      
      setIsCalibrating(false);
      toast({
        title: "Calibration Complete",
        description: "You can now start the eye tracking test",
      });
    }, config.calibrationTime * 1000);
  };

  const startTest = () => {
    if (!permissionGranted) {
      checkCameraPermissions();
      return;
    }

    if (!baselinePosition.x || !baselinePosition.y) {
      calibrateBaseline();
      return;
    }

    setIsTestRunning(true);
    setTestResult(null);
    setMissedDirections([]);
    setConsecutiveMisses(0);
    setCompletedDirections([]);
    setTestHistory([]);
    
    const shuffledDirections = [...directions].sort(() => Math.random() - 0.5);
    setDirectionsToTest(shuffledDirections);
    setCurrentDirectionIndex(0);
    setCurrentDirection(shuffledDirections[0]);
    
    toast({
      title: "Eye Tracking Test Started",
      description: "Follow the instructions and look in the indicated directions",
    });

    speakDirection(shuffledDirections[0]);
    startDirectionTimer();
  };

  const speakDirection = (direction: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(`Look ${direction}`);
      utterance.rate = 0.8;
      utterance.volume = 0.7;
      speechSynthesis.speak(utterance);
    }
  };

  const startDirectionTimer = () => {
    setTimeRemaining(config.directionTime);
    
    const countdown = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(countdown);
          handleDirectionMiss();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    timerRef.current = countdown;
  };

  const handleDirectionSuccess = () => {
    if (timerRef.current) clearTimeout(timerRef.current);

    const currentDir = directionsToTest[currentDirectionIndex];
    setCompletedDirections(prev => [...prev, currentDir]);
    setTestHistory(prev => [...prev, { 
      direction: currentDir, 
      result: 'success',
      movement: { x: currentMovement.x, y: currentMovement.y }
    }]);
    setConsecutiveMisses(0);

    toast({
      title: "Direction Matched!",
      description: `Successfully detected gaze direction: ${currentDir}`,
    });

    const nextIndex = currentDirectionIndex + 1;
    if (nextIndex < directionsToTest.length) {
      setCurrentDirectionIndex(nextIndex);
      setCurrentDirection(directionsToTest[nextIndex]);
      speakDirection(directionsToTest[nextIndex]);
      startDirectionTimer();
    } else {
      completeTest('all_completed');
    }
  };

  const handleDirectionMiss = () => {
    const currentDir = directionsToTest[currentDirectionIndex];
    setMissedDirections(prev => [...prev, currentDir]);
    setTestHistory(prev => [...prev, { 
      direction: currentDir, 
      result: 'miss',
      movement: { x: currentMovement.x, y: currentMovement.y }
    }]);
    
    const newConsecutiveMisses = consecutiveMisses + 1;
    setConsecutiveMisses(newConsecutiveMisses);

    toast({
      title: "Direction Missed",
      description: `Failed to detect gaze direction: ${currentDir}`,
      variant: "destructive",
    });

    if (newConsecutiveMisses >= config.maxConsecutiveMisses) {
      completeTest('abnormal_detected');
      return;
    }

    const nextIndex = currentDirectionIndex + 1;
    if (nextIndex < directionsToTest.length) {
      setCurrentDirectionIndex(nextIndex);
      setCurrentDirection(directionsToTest[nextIndex]);
      speakDirection(directionsToTest[nextIndex]);
      startDirectionTimer();
    } else {
      completeTest('completed_with_misses');
    }
  };

  const completeTest = (reason: 'all_completed' | 'abnormal_detected' | 'completed_with_misses') => {
    setIsTestRunning(false);
    if (timerRef.current) clearTimeout(timerRef.current);

    let result: string;
    let resultText: string;
    let score: number;

    if (reason === 'abnormal_detected') {
      result = 'abnormal';
      resultText = "Abnormal Eye Movement Detected – Possible Stroke Symptoms";
      score = 0;
    } else {
      const hasSuccessfulMatches = completedDirections.length > 0;
      if (hasSuccessfulMatches) {
        result = 'normal';
        resultText = "No Abnormality Detected";
        score = Math.round((completedDirections.length / directionsToTest.length) * 100);
      } else {
        result = 'abnormal';
        resultText = "No successful eye movements detected";
        score = 0;
      }
    }

    setTestResult(result);

    const testResultData = {
      type: 'eyeTracking',
      result,
      score,
      details: resultText,
      rawData: {
        completedDirections,
        missedDirections,
        consecutiveMisses,
        testHistory,
        totalDirections: directionsToTest.length,
        reason,
        config
      },
      timestamp: new Date().toISOString(),
    };

    onComplete(testResultData);

    toast({
      title: "Test Complete",
      description: resultText,
      variant: result === 'normal' ? 'default' : 'destructive',
    });
  };

  const stopTest = () => {
    setIsTestRunning(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const progress = directionsToTest.length > 0 ? ((currentDirectionIndex / directionsToTest.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-4">
        {showConfig && (
          <EyeTrackingConfig config={config} onConfigChange={setConfig} />
        )}
        
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-2xl text-blue-600">
              <Eye className="h-8 w-8" />
              Eye Tracking Test
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Look at the camera and follow the gaze direction instructions
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Video feed with debug info */}
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-64 bg-black rounded-lg object-cover"
              />
              <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-64 opacity-30 pointer-events-none"
              />
              
              {/* Safety margin and center indicator */}
              <div className="absolute inset-4 border-2 border-green-500 rounded-lg pointer-events-none" />
              <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-blue-500 rounded-full transform -translate-x-1/2 -translate-y-1/2" />
              
              {/* Eye position indicator */}
              {eyePosition.x > 0 && (
                <div 
                  className="absolute w-3 h-3 bg-red-500 rounded-full border-2 border-white"
                  style={{
                    left: `${(smoothedPosition.x / 640) * 100}%`,
                    top: `${(smoothedPosition.y / 480) * 100}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                />
              )}
              
              {/* Movement indicator */}
              {baselinePosition.x > 0 && (
                <div 
                  className="absolute w-2 h-2 bg-yellow-500 rounded-full"
                  style={{
                    left: `${(baselinePosition.x / 640) * 100}%`,
                    top: `${(baselinePosition.y / 480) * 100}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                />
              )}
            </div>

            {/* Debug information */}
            <div className="bg-gray-100 rounded-lg p-3 text-sm font-mono">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p>Movement: ({currentMovement.x.toFixed(1)}, {currentMovement.y.toFixed(1)})</p>
                  <p>Threshold: {config.movementThreshold}px</p>
                </div>
                <div>
                  <p>Detected: {detectedDirection || 'None'}</p>
                  <p>Target: {currentDirection || 'None'}</p>
                </div>
              </div>
            </div>

            {/* Test controls and status */}
            {isCalibrating && (
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-2">
                  Calibrating...
                </div>
                <p className="text-gray-600">Look straight at the camera</p>
              </div>
            )}

            {isTestRunning ? (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-6xl font-bold text-blue-600 mb-2">
                    {currentDirection}
                  </div>
                  <p className="text-gray-600">Look in this direction</p>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <Clock className="h-5 w-5 text-gray-600" />
                    <span className="text-2xl font-bold text-gray-800">
                      {timeRemaining}s
                    </span>
                  </div>
                </div>
                
                <Progress value={progress} className="w-full" />
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-green-800 font-medium">Completed: {completedDirections.length}</p>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-red-800 font-medium">Missed: {missedDirections.length}</p>
                  </div>
                </div>

                {consecutiveMisses > 0 && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                    <p className="text-orange-800 text-sm">
                      Consecutive misses: {consecutiveMisses}/{config.maxConsecutiveMisses}
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button onClick={handleDirectionSuccess} className="flex-1" variant="outline">
                    Force Success (Dev)
                  </Button>
                  <Button onClick={stopTest} variant="destructive" className="flex-1">
                    Stop Test
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {testResult && (
                  <div className={`border rounded-lg p-4 ${
                    testResult === 'normal' 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      {testResult === 'normal' ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                      <span className={`font-semibold ${
                        testResult === 'normal' ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {testResult === 'normal' ? 'Normal Eye Tracking' : 'Abnormalities Detected'}
                      </span>
                    </div>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Button 
                    onClick={calibrateBaseline} 
                    className="flex-1"
                    disabled={!permissionGranted}
                    variant="outline"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Calibrate
                  </Button>
                  <Button 
                    onClick={startTest} 
                    className="flex-1"
                    disabled={!permissionGranted || (!baselinePosition.x && !isCalibrating)}
                  >
                    <Target className="h-4 w-4 mr-2" />
                    Start Test
                  </Button>
                  <Button 
                    onClick={() => setShowConfig(!showConfig)} 
                    variant="outline"
                  >
                    Settings
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EyeTrackingTest;
