
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiService, UserCreate, EmergencyContact } from '../services/apiService';
import { useNavigate } from 'react-router-dom';
import { Brain, Plus, Trash2 } from 'lucide-react';

const SimpleRegistrationForm = () => {
  const [formData, setFormData] = useState<UserCreate>({
    name: '',
    email: '',
    password: '',
    role: 'patient',
    emergency_contacts: [{ name: '', relation: '', phone: '' }]
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

    setIsLoading(true);
    try {
      await apiService.createUser(formData);
      
      toast({
        title: "Success",
        description: "Account created successfully! Please log in.",
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
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Brain className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <CardTitle className="text-2xl font-bold text-blue-800">
            Create Your Account
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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

            {/* Emergency Contacts */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="text-sm font-medium">Emergency Contacts</Label>
                <Button type="button" variant="outline" size="sm" onClick={addEmergencyContact}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {formData.emergency_contacts!.map((contact, index) => (
                <div key={index} className="space-y-2 p-3 border rounded-lg mb-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Contact {index + 1}</span>
                    {formData.emergency_contacts!.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeEmergencyContact(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <Input
                    placeholder="Name"
                    value={contact.name}
                    onChange={(e) => updateEmergencyContact(index, 'name', e.target.value)}
                  />
                  <Input
                    placeholder="Relation (e.g., Son, Daughter)"
                    value={contact.relation}
                    onChange={(e) => updateEmergencyContact(index, 'relation', e.target.value)}
                  />
                  <Input
                    placeholder="Phone Number"
                    value={contact.phone}
                    onChange={(e) => updateEmergencyContact(index, 'phone', e.target.value)}
                  />
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

export default SimpleRegistrationForm;
