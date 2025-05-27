
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiService, UserCreate, EmergencyContact } from '../services/apiService';
import { useNavigate } from 'react-router-dom';
import { Brain, Plus, Trash2 } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState<UserCreate>({
    name: '',
    email: '',
    password: '',
    role: 'patient',
    emergency_contacts: []
  });
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
    setFormData(prev => ({
      ...prev,
      emergency_contacts: prev.emergency_contacts!.filter((_, i) => i !== index)
    }));
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
    
    setIsLoading(true);
    try {
      await apiService.signup(formData);
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
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <Brain className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <CardTitle className="text-2xl font-bold text-blue-800">
            Join Stroke Sense
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
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
                <Label htmlFor="email">Email</Label>
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
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
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
              <div className="flex items-center justify-between mb-4">
                <Label className="text-lg font-semibold">Emergency Contacts</Label>
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
              className="w-full"
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

export default Register;
