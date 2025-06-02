
import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiService } from '../../services/apiService';
import { authService } from '../../services/authService';
import { Mic, MicOff, Play, Square } from 'lucide-react';

const SpeechTest = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  const testPhrases = [
    "The quick brown fox jumps over the lazy dog",
    "She sells seashells by the seashore",
    "Peter Piper picked a peck of pickled peppers",
    "How much wood would a woodchuck chuck if a woodchuck could chuck wood"
  ];

  const [currentPhrase] = useState(testPhrases[Math.floor(Math.random() * testPhrases.length)]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        setHasRecording(true);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);

      toast({
        title: "Recording Started",
        description: "Please read the phrase clearly and naturally",
      });
    } catch (error) {
      console.error('Failed to start recording:', error);
      toast({
        title: "Error",
        description: "Failed to access microphone",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      toast({
        title: "Recording Complete",
        description: "You can now analyze your speech or record again",
      });
    }
  };

  const playRecording = () => {
    if (audioBlob) {
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();
    }
  };

  const analyzeRecording = async () => {
    if (!audioBlob) {
      toast({
        title: "Error",
        description: "No recording to analyze",
        variant: "destructive",
      });
      return;
    }

    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      toast({
        title: "Error",
        description: "Please log in to analyze speech",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const audioFile = new File([audioBlob], 'speech-test.wav', { type: 'audio/wav' });
      const result = await apiService.analyzeSpeech(audioFile);
      
      // Display result based on API response
      if (result.stroke_detected || result.abnormality_detected) {
        setTestResult('Potential speech abnormalities detected. Please consult a healthcare professional immediately.');
        toast({
          title: "Test Result",
          description: "Speech abnormalities detected",
          variant: "destructive",
        });
      } else {
        setTestResult('No significant speech abnormalities detected.');
        toast({
          title: "Test Result",
          description: "Speech appears normal",
        });
      }
    } catch (error) {
      console.error('Speech analysis failed:', error);
      setTestResult('Analysis failed. Please try again.');
      toast({
        title: "Analysis Error",
        description: "Failed to analyze speech data",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetTest = () => {
    setHasRecording(false);
    setAudioBlob(null);
    setTestResult(null);
    setIsRecording(false);
    audioChunksRef.current = [];
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-blue-800">Speech Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Please read the following phrase clearly and naturally:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <p className="text-lg font-medium text-gray-800 italic">
                "{currentPhrase}"
              </p>
            </div>
          </div>

          {/* Recording Controls */}
          <div className="flex justify-center space-x-4">
            {!isRecording && !hasRecording && (
              <Button onClick={startRecording} className="px-8 py-4">
                <Mic className="h-5 w-5 mr-2" />
                Start Recording
              </Button>
            )}

            {isRecording && (
              <Button onClick={stopRecording} variant="destructive" className="px-8 py-4">
                <MicOff className="h-5 w-5 mr-2" />
                Stop Recording
              </Button>
            )}

            {hasRecording && !isRecording && (
              <div className="flex space-x-2">
                <Button onClick={playRecording} variant="outline">
                  <Play className="h-4 w-4 mr-2" />
                  Play
                </Button>
                <Button onClick={resetTest} variant="outline">
                  <Square className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              </div>
            )}
          </div>

          {/* Recording Status */}
          {isRecording && (
            <div className="text-center">
              <div className="animate-pulse text-red-600 font-semibold mb-2">
                🔴 Recording in progress...
              </div>
              <p className="text-sm text-gray-600">Speak clearly and naturally</p>
            </div>
          )}

          {/* Analysis */}
          {hasRecording && !isRecording && (
            <div className="space-y-4">
              <Button 
                onClick={analyzeRecording}
                disabled={isAnalyzing}
                className="w-full"
              >
                {isAnalyzing ? 'Analyzing Speech...' : 'Analyze Recording'}
              </Button>
            </div>
          )}

          {isAnalyzing && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-600">Analyzing speech patterns...</p>
            </div>
          )}

          {testResult && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Test Result:</h3>
              <p className="text-gray-700">{testResult}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SpeechTest;
