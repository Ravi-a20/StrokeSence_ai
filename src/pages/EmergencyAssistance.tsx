
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { apiService, UserOut } from '../services/apiService';
import { ArrowLeft, Brain, Phone, AlertTriangle, Users } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const EmergencyAssistance = () => {
  const [user, setUser] = useState<UserOut | null>(null);
  const [assistanceData, setAssistanceData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setUser(currentUser);
    loadAssistanceData(currentUser._id!);
  }, [navigate]);

  const loadAssistanceData = async (userId: string) => {
    try {
      const data = await apiService.getUserTimelyAssistance(userId);
      setAssistanceData(data);
    } catch (error) {
      console.error('Failed to load assistance data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const callEmergencyServices = () => {
    // In a real app, this would trigger emergency calling
    window.open('tel:911');
    toast({
      title: "Emergency Call",
      description: "Calling emergency services...",
      variant: "destructive",
    });
  };

  const callEmergencyContact = (phone: string, name: string) => {
    window.open(`tel:${phone}`);
    toast({
      title: "Calling Emergency Contact",
      description: `Calling ${name}...`,
    });
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-red-600" />
              <h1 className="text-2xl font-bold text-red-800">Emergency Assistance</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Emergency Warning */}
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-800 flex items-center">
                <AlertTriangle className="h-6 w-6 mr-2" />
                Medical Emergency
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-700 mb-4">
                If you are experiencing stroke symptoms (face drooping, arm weakness, speech difficulty), 
                call emergency services immediately.
              </p>
              <Button 
                onClick={callEmergencyServices}
                variant="destructive" 
                size="lg" 
                className="w-full text-lg py-4"
              >
                <Phone className="h-6 w-6 mr-2" />
                Call 911 Emergency Services
              </Button>
            </CardContent>
          </Card>

          {/* Emergency Contacts */}
          {user?.emergency_contacts && user.emergency_contacts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-6 w-6 mr-2" />
                  Emergency Contacts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {user.emergency_contacts.map((contact, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-semibold">{contact.name}</h3>
                      <p className="text-sm text-gray-600">{contact.relation}</p>
                      <p className="text-sm text-gray-800">{contact.phone}</p>
                    </div>
                    <Button 
                      onClick={() => callEmergencyContact(contact.phone, contact.name)}
                      variant="outline"
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Call
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Stroke Warning Signs */}
          <Card>
            <CardHeader>
              <CardTitle>Recognize Stroke Symptoms - FAST</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold text-blue-800">F - Face</h3>
                    <p className="text-sm text-blue-700">Face drooping or numbness</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <h3 className="font-semibold text-green-800">A - Arms</h3>
                    <p className="text-sm text-green-700">Arm weakness or numbness</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <h3 className="font-semibold text-yellow-800">S - Speech</h3>
                    <p className="text-sm text-yellow-700">Speech difficulty or slurred speech</p>
                  </div>
                  <div className="p-3 bg-red-50 rounded-lg">
                    <h3 className="font-semibold text-red-800">T - Time</h3>
                    <p className="text-sm text-red-700">Time to call emergency services</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Help */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Resources</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                Poison Control: 1-800-222-1222
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Mental Health Crisis: 988
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Non-Emergency Medical: Contact your doctor
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default EmergencyAssistance;
