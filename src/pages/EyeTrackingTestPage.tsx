
import React from 'react';
import { useNavigate } from 'react-router-dom';
import EyeTrackingTest from '../components/detection/EyeTrackingTest';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const EyeTrackingTestPage = () => {
  const navigate = useNavigate();

  const handleTestComplete = (result: any) => {
    console.log('Eye tracking test completed:', result);
    // Navigate back to dashboard after a short delay
    setTimeout(() => {
      navigate('/dashboard');
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-4">
        <Button 
          variant="outline" 
          onClick={() => navigate('/dashboard')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>
      
      <EyeTrackingTest onComplete={handleTestComplete} />
    </div>
  );
};

export default EyeTrackingTestPage;
