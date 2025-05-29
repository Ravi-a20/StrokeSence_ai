import React, { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Eye, CheckCircle, XCircle, Camera, Volume2 } from 'lucide-react';

interface EyeTrackingTestProps {
  onComplete: (result: any) => void;
}

const directions = [
  'up', 'down', 'left', 'right',
  'top-left', 'top-right', 'bottom-left', 'bottom-right'
];

interface TestResult {
  status: 'pass' | 'anomaly';
  missed: number;
  consecutiveMisses: number;
  completedDirections: string[];
  missedDirections: string[];
}

const EyeTrackingTest: React.FC<EyeTrackingTestProps> = ({ onComplete }) => {
  const [faceAligned, setFaceAligned] = useState(false);
  const [testStarted, setTestStarted] = useState(false);
  const [currentDirection, setCurrentDirection] = useState<string | null>(null);
  const [directionIndex, setDirectionIndex] = useState(0);
  const [missedCount, setMissedCount] = useState(0);
  const [consecutiveMisses, setConsecutiveMisses] = useState(0);
  const [result, setResult] = useState<TestResult | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(6);
  const [completedDirections, setCompletedDirections] = useState<string[]>([]);
  const [missedDirections, setMissedDirections] = useState<string[]>([]);
  const [cameraPermission, setCameraPermission] = useState(false);
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const { toast } = useToast();

  useEffect(() => {
    checkCameraPermission();
    return () => {
      cleanup();
    };
  }, []);

  useEffect(() => {
    if (testStarted && directionIndex < directions.length && faceAligned) {
      const dir = directions[directionIndex];
      setCurrentDirection(dir);
      setTimeRemaining(6);
      playAudio(dir);
      startCountdown();

      timeoutRef.current = setTimeout(() => {
        handleDirectionComplete(dir);
      }, 6000); // 6 seconds per direction

      return () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (countdownRef.current) clearTimeout(countdownRef.current);
      };
    }
  }, [testStarted, directionIndex, faceAligned]);

  const cleanup = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (countdownRef.current) clearTimeout(countdownRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  const checkCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: 640, 
          height: 480,
          facingMode: 'user'
        } 
      });
      setCameraPermission(true);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
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

  const startCountdown = () => {
    const countdown = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(countdown);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    countdownRef.current = countdown;
  };

  const handleDirectionComplete = (direction: string) => {
    const matched = isDirectionMatched(direction);
    
    if (!matched) {
      setMissedCount(prev => prev + 1);
      setConsecutiveMisses(prev => prev + 1);
      setMissedDirections(prev => [...prev, direction]);
      
      toast({
        title: "Direction Missed",
        description: `Failed to detect gaze direction: ${direction.toUpperCase()}`,
        variant: "destructive",
      });
    } else {
      setConsecutiveMisses(0);
      setCompletedDirections(prev => [...prev, direction]);
      
      toast({
        title: "Direction Matched!",
        description: `Successfully detected gaze direction: ${direction.toUpperCase()}`,
      });
    }

    const newMissedCount = missedCount + (matched ? 0 : 1);
    const newConsecutiveMisses = matched ? 0 : consecutiveMisses + 1;
    const nextIndex = directionIndex + 1;

    // Check anomaly conditions
    if (newMissedCount >= 3 || newConsecutiveMisses >= 2) {
      const testResult: TestResult = {
        status: 'anomaly',
        missed: newMissedCount,
        consecutiveMisses: newConsecutiveMisses,
        completedDirections,
        missedDirections: matched ? missedDirections : [...missedDirections, direction]
      };
      setResult(testResult);
      setTestStarted(false);
      completeTest(testResult);
      return;
    }

    if (nextIndex < directions.length) {
      setDirectionIndex(nextIndex);
    } else {
      const testResult: TestResult = {
        status: 'pass',
        missed: newMissedCount,
        consecutiveMisses: 0,
        completedDirections: matched ? [...completedDirections, direction] : completedDirections,
        missedDirections: matched ? missedDirections : [...missedDirections, direction]
      };
      setResult(testResult);
      setTestStarted(false);
      completeTest(testResult);
    }
  };

  const completeTest = (testResult: TestResult) => {
    const resultData = {
      type: 'eyeTracking',
      result: testResult.status === 'pass' ? 'normal' : 'abnormal',
      score: Math.round(((directions.length - testResult.missed) / directions.length) * 100),
      details: testResult.status === 'pass' 
        ? "No Abnormality Detected" 
        : "Abnormal Eye Movement Detected – Possible Stroke Symptoms",
      rawData: {
        ...testResult,
        totalDirections: directions.length,
        testSequence: directions
      },
      timestamp: new Date().toISOString(),
    };

    onComplete(resultData);
  };

  const handleStartTest = () => {
    if (!cameraPermission) {
      checkCameraPermission();
      return;
    }

    setDirectionIndex(0);
    setMissedCount(0);
    setConsecutiveMisses(0);
    setCompletedDirections([]);
    setMissedDirections([]);
    setResult(null);
    setTestStarted(true);
    
    toast({
      title: "Eye Tracking Test Started",
      description: "Follow the audio instructions and look in the indicated directions",
    });
  };

  const simulateFaceAlignment = () => {
    if (!cameraPermission) {
      checkCameraPermission();
      return;
    }
    setFaceAligned(true);
    toast({
      title: "Face Aligned",
      description: "Your face is properly aligned. You can now start the test.",
    });
  };

  const resetTest = () => {
    setTestStarted(false);
    setFaceAligned(false);
    setDirectionIndex(0);
    setMissedCount(0);
    setConsecutiveMisses(0);
    setCompletedDirections([]);
    setMissedDirections([]);
    setResult(null);
    setCurrentDirection(null);
    setTimeRemaining(6);
  };

  const progress = directions.length > 0 ? ((directionIndex / directions.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-2xl text-blue-600">
              <Eye className="h-8 w-8" />
              Eye Tracking Test
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Align your face in the rectangle and follow the gaze direction instructions
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Camera Feed */}
            <div className="relative mx-auto w-80 h-80">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full bg-black rounded-lg object-cover"
              />
              
              {/* Face Alignment Rectangle */}
              <div className="absolute inset-4 border-4 border-blue-500 rounded-xl">
                {!faceAligned && (
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-center bg-black bg-opacity-50 px-3 py-2 rounded">
                    <Camera className="h-6 w-6 mx-auto mb-2" />
                    <p className="text-sm">Align your face</p>
                  </div>
                )}
                
                {faceAligned && currentDirection && (
                  <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-lg">
                    <div className="text-center">
                      <Volume2 className="h-4 w-4 mx-auto mb-1" />
                      <p className="text-lg font-bold">{currentDirection.toUpperCase()}</p>
                      {testStarted && (
                        <p className="text-sm">Time: {timeRemaining}s</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Test Progress */}
            {testStarted && (
              <div className="space-y-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mx-auto mb-1" />
                    <p className="text-green-800 font-medium">Completed: {completedDirections.length}</p>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                    <XCircle className="h-5 w-5 text-red-600 mx-auto mb-1" />
                    <p className="text-red-800 font-medium">Missed: {missedDirections.length}</p>
                  </div>
                </div>

                {consecutiveMisses > 0 && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-center">
                    <p className="text-orange-800 text-sm">
                      Consecutive misses: {consecutiveMisses}/2
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Control Buttons */}
            <div className="space-y-4">
              {!faceAligned ? (
                <Button
                  onClick={simulateFaceAlignment}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={!cameraPermission}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Align Face
                </Button>
              ) : !testStarted ? (
                <Button
                  onClick={handleStartTest}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Start Test
                </Button>
              ) : (
                <div className="text-center">
                  <p className="text-lg font-medium text-blue-600 mb-4">
                    Testing in progress...
                  </p>
                  <Button onClick={resetTest} variant="outline">
                    Stop Test
                  </Button>
                </div>
              )}
            </div>

            {/* Results */}
            {result && (
              <Card className={`${
                result.status === 'pass' 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <CardContent className="p-6">
                  <div className="text-center">
                    {result.status === 'pass' ? (
                      <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    ) : (
                      <XCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
                    )}
                    
                    <h3 className={`text-xl font-bold mb-4 ${
                      result.status === 'pass' ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {result.status === 'pass' ? '✅ Normal Eye Movement' : '❌ Anomaly Detected'}
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium">Directions Missed:</p>
                        <p className="text-lg">{result.missed}/{directions.length}</p>
                      </div>
                      <div>
                        <p className="font-medium">Consecutive Misses:</p>
                        <p className="text-lg">{result.consecutiveMisses}</p>
                      </div>
                    </div>
                    
                    <Button onClick={resetTest} className="mt-4" variant="outline">
                      Test Again
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Placeholder for audio - uses speech synthesis as fallback
function playAudio(direction: string) {
  // Try to play audio file first
  const audio = new Audio(`/audio/${direction}.mp3`);
  audio.play().catch(() => {
    // Fallback to speech synthesis if audio file not found
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(`Look ${direction.replace('-', ' ')}`);
      utterance.rate = 0.8;
      utterance.volume = 0.7;
      speechSynthesis.speak(utterance);
    }
  });
}

// Placeholder for actual eye tracking logic
function isDirectionMatched(direction: string): boolean {
  // This should be replaced with real-time gaze comparison using MediaPipe
  // For now, returning a random result with ~75% success rate
  return Math.random() > 0.25;
}

export default EyeTrackingTest;
