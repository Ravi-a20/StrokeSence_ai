
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from 'react-router-dom';
import { authService, AuthUser } from '../services/authService';
import { apiService, UserUpdate, EmergencyContact } from '../services/apiService';
import { ArrowLeft, Brain, Plus, Trash2, Save } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<UserUpdate>({
    name: '',
    emergency_contacts: []
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setUser(currentUser);
    setFormData({
      name: currentUser.name,
      emergency_contacts: currentUser.emergency_contacts || []
    });
  }, [navigate]);

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
      emergency_contacts: [...(prev.emergency_contacts || []), { name: '', relation: '', phone: '' }]
    }));
  };

  const removeEmergencyContact = (index: number) => {
    setFormData(prev => ({
      ...prev,
      emergency_contacts: prev.emergency_contacts?.filter((_, i) => i !== index) || []
    }));
  };

  const updateEmergencyContact = (index: number, field: keyof EmergencyContact, value: string) => {
    setFormData(prev => ({
      ...prev,
      emergency_contacts: prev.emergency_contacts?.map((contact, i) => 
        i === index ? { ...contact, [field]: value } : contact
      ) || []
    }));
  };

  const handleSave = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const updatedUser = await apiService.updateCurrentUser(formData);
      setUser({
        _id: updatedUser._id!,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        created_at: updatedUser.created_at,
        emergency_contacts: updatedUser.emergency_contacts
      });
      setIsEditing(false);
      
      // Update localStorage
      authService.setCurrentUser(updatedUser);
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      console.error('Profile update failed:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.name,
        emergency_contacts: user.emergency_contacts || []
      });
    }
    setIsEditing(false);
  };

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-blue-800">Profile</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>User Profile</CardTitle>
                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)}>
                    Edit Profile
                  </Button>
                ) : (
                  <div className="space-x-2">
                    <Button onClick={handleSave} disabled={isLoading}>
                      <Save className="h-4 w-4 mr-2" />
                      {isLoading ? 'Saving...' : 'Save'}
                    </Button>
                    <Button variant="outline" onClick={handleCancel}>
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  {isEditing ? (
                    <Input
                      id="name"
                      name="name"
                      value={formData.name || ''}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <p className="text-lg font-medium">{user.name}</p>
                  )}
                </div>

                <div>
                  <Label>Email</Label>
                  <p className="text-lg">{user.email}</p>
                  <p className="text-sm text-gray-500">Email cannot be changed</p>
                </div>

                <div>
                  <Label>Role</Label>
                  <p className="text-lg capitalize">{user.role}</p>
                </div>

                <div>
                  <Label>Member Since</Label>
                  <p className="text-lg">{new Date(user.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Emergency Contacts */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <Label className="text-lg font-semibold">Emergency Contacts</Label>
                  {isEditing && (
                    <Button type="button" variant="outline" size="sm" onClick={addEmergencyContact}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Contact
                    </Button>
                  )}
                </div>
                
                <div className="space-y-3">
                  {(isEditing ? formData.emergency_contacts : user.emergency_contacts)?.map((contact, index) => (
                    <div key={index} className="p-4 border rounded-lg bg-gray-50">
                      {isEditing ? (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
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
                      ) : (
                        <div>
                          <h3 className="font-semibold">{contact.name}</h3>
                          <p className="text-sm text-gray-600">{contact.relation}</p>
                          <p className="text-sm">{contact.phone}</p>
                        </div>
                      )}
                    </div>
                  )) || (
                    <p className="text-gray-500 italic">No emergency contacts added</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Profile;
