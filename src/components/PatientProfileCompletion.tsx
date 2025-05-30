
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiService } from '../services/apiService';
import { useNavigate } from 'react-router-dom';
import { Brain, Plus, Trash2, Upload } from 'lucide-react';

interface MedicalHistoryEntry {
  condition: string;
  diagnosed_at: string;
  notes: string;
}

const PatientProfileCompletion = () => {
  const [patientData, setPatientData] = useState({
    photo: null as File | null,
    voice_sample: null as File | null,
    height_cm: '',
    weight_kg: ''
  });
  
  const [medicalHistory, setMedicalHistory] = useState<MedicalHistoryEntry[]>([
    { condition: '', diagnosed_at: '', notes: '' }
  ]);
  
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handlePatientDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPatientData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'photo' | 'voice_sample') => {
    const file = e.target.files?.[0];
    if (file) {
      setPatientData(prev => ({
        ...prev,
        [field]: file
      }));
    }
  };

  const addMedicalHistory = () => {
    setMedicalHistory(prev => [...prev, { condition: '', diagnosed_at: '', notes: '' }]);
  };

  const removeMedicalHistory = (index: number) => {
    if (medicalHistory.length > 1) {
      setMedicalHistory(prev => prev.filter((_, i) => i !== index));
    }
  };

  const updateMedicalHistory = (index: number, field: keyof MedicalHistoryEntry, value: string) => {
    setMedicalHistory(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!patientData.photo || !patientData.voice_sample) {
      toast({
        title: "Error",
        description: "Please upload both photo and voice sample",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Create patient profile
      await apiService.createPatientProfile({
        photo: patientData.photo,
        voice_sample: patientData.voice_sample,
        height_cm: Number(patientData.height_cm),
        weight_kg: Number(patientData.weight_kg)
      });
      
      toast({
        title: "Success",
        description: "Profile completed successfully!",
        variant: "default",
      });
      navigate('/dashboard');
    } catch (error) {
      console.error('Profile completion failed:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Profile completion failed",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <Brain className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <CardTitle className="text-2xl font-bold text-blue-800">
            Complete Your Profile
          </CardTitle>
          <p className="text-gray-600">Add additional information for better analysis</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Physical Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Physical Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="height_cm">Height (cm) *</Label>
                  <Input
                    id="height_cm"
                    name="height_cm"
                    type="number"
                    value={patientData.height_cm}
                    onChange={handlePatientDataChange}
                    required
                    placeholder="Enter height in centimeters"
                  />
                </div>
                
                <div>
                  <Label htmlFor="weight_kg">Weight (kg) *</Label>
                  <Input
                    id="weight_kg"
                    name="weight_kg"
                    type="number"
                    value={patientData.weight_kg}
                    onChange={handlePatientDataChange}
                    required
                    placeholder="Enter weight in kilograms"
                  />
                </div>
              </div>
            </div>

            {/* File Uploads */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Required Uploads</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="photo">Profile Photo *</Label>
                  <div className="mt-1">
                    <Input
                      id="photo"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'photo')}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="voice_sample">Voice Sample *</Label>
                  <div className="mt-1">
                    <Input
                      id="voice_sample"
                      type="file"
                      accept="audio/*"
                      onChange={(e) => handleFileChange(e, 'voice_sample')}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Medical History */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Medical History (Optional)</h3>
                <Button type="button" variant="outline" size="sm" onClick={addMedicalHistory}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add History
                </Button>
              </div>
              
              {medicalHistory.map((history, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3 p-4 border rounded-lg">
                  <Input
                    placeholder="Condition"
                    value={history.condition}
                    onChange={(e) => updateMedicalHistory(index, 'condition', e.target.value)}
                  />
                  <Input
                    type="date"
                    placeholder="Diagnosed Date"
                    value={history.diagnosed_at}
                    onChange={(e) => updateMedicalHistory(index, 'diagnosed_at', e.target.value)}
                  />
                  <Input
                    placeholder="Notes (optional)"
                    value={history.notes}
                    onChange={(e) => updateMedicalHistory(index, 'notes', e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeMedicalHistory(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex gap-4">
              <Button 
                type="submit" 
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading ? 'Completing Profile...' : 'Complete Profile'}
              </Button>
              
              <Button 
                type="button"
                variant="outline"
                onClick={handleSkip}
                className="flex-1"
              >
                Skip for Now
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientProfileCompletion;
