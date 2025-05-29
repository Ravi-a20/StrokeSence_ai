
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiService, UserCreate, EmergencyContact } from '../services/apiService';
import { useNavigate } from 'react-router-dom';
import { Brain, Plus, Trash2, Upload, Calendar } from 'lucide-react';

const PatientRegistrationForm = () => {
  const [formData, setFormData] = useState<UserCreate>({
    name: '',
    email: '',
    password: '',
    role: 'patient',
    emergency_contacts: [{ name: '', relation: '', phone: '' }]
  });
  
  const [patientData, setPatientData] = useState({
    photo: null as File | null,
    voice_sample: null as File | null,
    height_cm: '',
    weight_kg: '',
    medical_history: [{ condition: '', diagnosed_at: '', notes: '' }]
  });
  
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

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

  const addEmergencyContact = () => {
    setFormData(prev => ({
      ...prev,
      emergency_contacts: [...prev.emergency_contacts!, { name: '', relation: '', phone: '' }]
    }));
  };

  const removeEmergencyContact = (index: number) => {
    if (formData.emergency_contacts!.length > 1) {
      setFormData(prev => ({
        ...prev,
        emergency_contacts: prev.emergency_contacts!.filter((_, i) => i !== index)
      }));
    }
  };

  const updateEmergencyContact = (index: number, field: keyof EmergencyContact, value: string) => {
    setFormData(prev => ({
      ...prev,
      emergency_contacts: prev.emergency_contacts!.map((contact, i) => 
        i === index ? { ...contact, [field]: value } : contact
      )
    }));
  };

  const addMedicalHistory = () => {
    setPatientData(prev => ({
      ...prev,
      medical_history: [...prev.medical_history, { condition: '', diagnosed_at: '', notes: '' }]
    }));
  };

  const removeMedicalHistory = (index: number) => {
    if (patientData.medical_history.length > 1) {
      setPatientData(prev => ({
        ...prev,
        medical_history: prev.medical_history.filter((_, i) => i !== index)
      }));
    }
  };

  const updateMedicalHistory = (index: number, field: string, value: string) => {
    setPatientData(prev => ({
      ...prev,
      medical_history: prev.medical_history.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

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
      // First create the user
      await apiService.createUser(formData);
      
      // Then create patient profile (this would need authentication)
      toast({
        title: "Success",
        description: "Account created successfully! Please log in to complete your profile.",
        variant: "default",
      });
      navigate('/login');
    } catch (error) {
      console.error('Registration failed:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Registration failed",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
      <Card className="w-full max-w-4xl">
        <CardHeader className="text-center">
          <Brain className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <CardTitle className="text-2xl font-bold text-blue-800">
            Complete Patient Registration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    placeholder="Create a strong password"
                  />
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Confirm your password"
                  />
                </div>
              </div>
            </div>

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
                <h3 className="text-lg font-semibold text-gray-800">Medical History</h3>
                <Button type="button" variant="outline" size="sm" onClick={addMedicalHistory}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add History
                </Button>
              </div>
              
              {patientData.medical_history.map((history, index) => (
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

            {/* Emergency Contacts */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Emergency Contacts</h3>
                <Button type="button" variant="outline" size="sm" onClick={addEmergencyContact}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Contact
                </Button>
              </div>
              
              {formData.emergency_contacts!.map((contact, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3 p-4 border rounded-lg">
                  <Input
                    placeholder="Name"
                    value={contact.name}
                    onChange={(e) => updateEmergencyContact(index, 'name', e.target.value)}
                  />
                  <Input
                    placeholder="Relation"
                    value={contact.relation}
                    onChange={(e) => updateEmergencyContact(index, 'relation', e.target.value)}
                  />
                  <Input
                    placeholder="Phone"
                    value={contact.phone}
                    onChange={(e) => updateEmergencyContact(index, 'phone', e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeEmergencyContact(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>

            <div className="text-center text-sm">
              <span className="text-gray-600">Already have an account? </span>
              <Button
                type="button"
                variant="link"
                className="p-0 h-auto"
                onClick={() => navigate('/login')}
              >
                Login here
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientRegistrationForm;
