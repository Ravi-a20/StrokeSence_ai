
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Eye, CheckCircle, XCircle, Clock } from 'lucide-react';

interface EyeTrackingTestProps {
  onComplete: (result: any) => void;
}

const EyeTrackingTest: React.FC<EyeTrackingTestProps> = ({ onComplete }) => {
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [currentDirection, setCurrentDirection] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  
  // New state for improved test logic
  const [missedDirections, setMissedDirections] = useState<string[]>([]);
  const [consecutiveMisses, setConsecutiveMisses] = useState(0);
  const [completedDirections, setCompletedDirections] = useState<string[]>([]);
  const [testHistory, setTestHistory] = useState<Array<{direction: string, result: 'success' | 'miss'}>>([]);
  
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const checkCameraPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setPermissionGranted(true);
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

  const startTest = () => {
    if (!permissionGranted) {
      checkCameraPermissions();
      return;
    }

    setIsTestRunning(true);
    setTestResult(null);
    setMissedDirections([]);
    setConsecutiveMisses(0);
    setCompletedDirections([]);
    setTestHistory([]);
    
    // Randomize directions
    const shuffledDirections = [...directions].sort(() => Math.random() - 0.5);
    setDirectionsToTest(shuffledDirections);
    setCurrentDirectionIndex(0);
    setCurrentDirection(shuffledDirections[0]);
    
    toast({
      title: "Eye Tracking Test Started",
      description: "Follow the instructions and look in the indicated directions",
    });

    // Announce direction with text-to-speech
    speakDirection(shuffledDirections[0]);
    
    // Start the 5-second timer for this direction
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
    setTimeRemaining(5); // 5 seconds per direction
    
    const countdown = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(countdown);
          // Time's up - mark as miss
          handleDirectionMiss();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    timerRef.current = countdown;
  };

  const handleDirectionSuccess = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    const currentDir = directionsToTest[currentDirectionIndex];
    setCompletedDirections(prev => [...prev, currentDir]);
    setTestHistory(prev => [...prev, { direction: currentDir, result: 'success' }]);
    setConsecutiveMisses(0); // Reset consecutive misses

    toast({
      title: "Direction Matched!",
      description: `Successfully detected gaze direction: ${currentDir}`,
    });

    // Move to next direction or complete test
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
    setTestHistory(prev => [...prev, { direction: currentDir, result: 'miss' }]);
    
    const newConsecutiveMisses = consecutiveMisses + 1;
    setConsecutiveMisses(newConsecutiveMisses);

    toast({
      title: "Direction Missed",
      description: `Failed to detect gaze direction: ${currentDir}`,
      variant: "destructive",
    });

    // Check for 2 consecutive misses
    if (newConsecutiveMisses >= 2) {
      completeTest('abnormal_detected');
      return;
    }

    // Move to next direction
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
    
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    let result: string;
    let resultText: string;
    let score: number;

    if (reason === 'abnormal_detected') {
      result = 'abnormal';
      resultText = "Abnormal Eye Movement Detected – Possible Stroke Symptoms";
      score = 0;
    } else {
      // Check if there were any successful matches
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
        reason
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
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };

  const progress = directionsToTest.length > 0 ? ((currentDirectionIndex / directionsToTest.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="max-w-2xl mx-auto">
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
          {!permissionGranted && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800">
                Camera access is required for this test. Please allow camera permissions.
              </p>
            </div>
          )}

          {/* Video feed */}
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-64 bg-black rounded-lg object-cover"
            />
            {/* Safety margin overlay */}
            <div className="absolute inset-4 border-2 border-green-500 rounded-lg pointer-events-none" />
          </div>

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
                    Consecutive misses: {consecutiveMisses}/2
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <Button onClick={handleDirectionSuccess} className="flex-1">
                  Simulate Success
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

              <div className="space-y-3">
                <h3 className="font-semibold text-gray-800">Instructions:</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                  <li>Position your face within the green rectangle</li>
                  <li>Look directly at the camera to start</li>
                  <li>When a direction appears, look in that direction within 5 seconds</li>
                  <li>The test will stop early if 2 consecutive directions are missed</li>
                  <li>Audio instructions will guide you through each direction</li>
                </ol>
              </div>
              
              <Button 
                onClick={startTest} 
                className="w-full"
                disabled={!permissionGranted}
              >
                Start Eye Tracking Test
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EyeTrackingTest;
