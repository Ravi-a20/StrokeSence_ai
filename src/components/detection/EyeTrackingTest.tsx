
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Eye, CheckCircle, XCircle } from 'lucide-react';

interface EyeTrackingTestProps {
  onComplete: (result: any) => void;
}

const EyeTrackingTest: React.FC<EyeTrackingTestProps> = ({ onComplete }) => {
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [currentDirection, setCurrentDirection] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [matchedDirections, setMatchedDirections] = useState<Set<string>>(new Set());
  const [permissionGranted, setPermissionGranted] = useState(false);
  
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // All 8 possible gaze directions based on your model
  const directions = ["Left", "Right", "Up", "Down", "Up-Left", "Up-Right", "Down-Left", "Down-Right"];
  const [directionsToTest, setDirectionsToTest] = useState<string[]>([]);
  const [currentDirectionIndex, setCurrentDirectionIndex] = useState(0);

  useEffect(() => {
    checkCameraPermissions();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
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
    setMatchedDirections(new Set());
    
    // Randomize directions like in your Python model
    const shuffledDirections = [...directions].sort(() => Math.random() - 0.5);
    setDirectionsToTest(shuffledDirections);
    setCurrentDirectionIndex(0);
    setCurrentDirection(shuffledDirections[0]);
    setTimeRemaining(3); // 3 seconds per direction

    toast({
      title: "Eye Tracking Test Started",
      description: "Follow the instructions and look in the indicated directions",
    });

    // Start the direction timer
    startDirectionTimer();
  };

  const startDirectionTimer = () => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Move to next direction or complete test
          const nextIndex = currentDirectionIndex + 1;
          if (nextIndex < directionsToTest.length) {
            setCurrentDirectionIndex(nextIndex);
            setCurrentDirection(directionsToTest[nextIndex]);
            return 3; // Reset timer for next direction
          } else {
            // Test completed
            completeTest();
            clearInterval(timer);
            return 0;
          }
        }
        return prev - 1;
      });
    }, 1000);
  };

  const completeTest = () => {
    setIsTestRunning(false);
    
    // Analyze results based on your model logic
    const correctCount = matchedDirections.size;
    const result = correctCount === 8 ? 'normal' : 'abnormal';
    const resultText = correctCount === 8 
      ? "No abnormalities detected - All directions matched correctly"
      : `Potential abnormalities detected - Matched ${correctCount}/8 directions`;

    setTestResult(result);

    const testResult = {
      type: 'eyeTracking',
      result,
      score: Math.round((correctCount / 8) * 100),
      details: resultText,
      rawData: {
        matchedDirections: Array.from(matchedDirections),
        totalDirections: 8,
      },
      timestamp: new Date().toISOString(),
    };

    onComplete(testResult);

    toast({
      title: "Test Complete",
      description: resultText,
    });
  };

  const simulateGazeDetection = () => {
    // Simulate eye tracking detection (in real implementation, this would use computer vision)
    const detectionAccuracy = 0.8; // 80% accuracy simulation
    if (Math.random() < detectionAccuracy) {
      setMatchedDirections(prev => new Set([...prev, currentDirection]));
      toast({
        title: "Direction Matched",
        description: `Successfully detected gaze direction: ${currentDirection}`,
      });
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
                <div className="text-2xl font-bold text-gray-800 mt-2">
                  {timeRemaining}s
                </div>
              </div>
              
              <Progress value={progress} className="w-full" />
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 text-center">
                  Progress: {matchedDirections.size}/8 directions detected
                </p>
              </div>

              <Button onClick={simulateGazeDetection} className="w-full">
                Simulate Gaze Detection (for testing)
              </Button>
              
              <Button 
                onClick={() => setIsTestRunning(false)} 
                variant="destructive" 
                className="w-full"
              >
                Stop Test
              </Button>
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
                  <li>When a direction appears, look in that direction</li>
                  <li>Hold your gaze for the full duration</li>
                  <li>The test will automatically progress through 8 directions</li>
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
