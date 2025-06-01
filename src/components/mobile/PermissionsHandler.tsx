
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Camera, Mic, HardDrive, Activity, CheckCircle, XCircle, Settings } from 'lucide-react';
import { permissionsService, PermissionStatus } from '@/services/permissionsService';
import { Capacitor } from '@capacitor/core';

interface PermissionsHandlerProps {
  onPermissionsGranted: () => void;
}

const PermissionsHandler: React.FC<PermissionsHandlerProps> = ({ onPermissionsGranted }) => {
  const [permissions, setPermissions] = useState<PermissionStatus>({
    camera: false,
    microphone: false,
    storage: false,
    motion: false
  });
  const [isChecking, setIsChecking] = useState(false);
  const [showPermissions, setShowPermissions] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkInitialPermissions();
  }, []);

  const checkInitialPermissions = async () => {
    try {
      // Only show permissions screen on native platforms
      if (!Capacitor.isNativePlatform()) {
        console.log('Web platform detected, skipping permissions');
        onPermissionsGranted();
        return;
      }

      console.log('Native platform detected, checking permissions');
      const currentPermissions = await permissionsService.checkPermissions();
      setPermissions(currentPermissions);
      
      // If all critical permissions are granted, proceed
      if (currentPermissions.camera && currentPermissions.microphone) {
        console.log('Critical permissions already granted, proceeding');
        onPermissionsGranted();
      } else {
        console.log('Permissions needed, showing permissions screen');
        setShowPermissions(true);
      }
    } catch (error) {
      console.error('Error checking initial permissions:', error);
      setError('Failed to check permissions. Continuing anyway...');
      // Continue to app even if permission check fails
      setTimeout(() => {
        onPermissionsGranted();
      }, 2000);
    }
  };

  const requestPermissions = async () => {
    setIsChecking(true);
    setError(null);
    
    try {
      console.log('Requesting permissions...');
      const newPermissions = await permissionsService.requestAllPermissions();
      setPermissions(newPermissions);
      
      // Check if critical permissions are granted (camera and microphone are most important)
      if (newPermissions.camera || newPermissions.microphone) {
        console.log('At least one critical permission granted, proceeding');
        onPermissionsGranted();
      } else {
        setError('Some permissions were denied. You can still use the app with limited functionality.');
      }
    } catch (error) {
      console.error('Permission request failed:', error);
      setError('Permission request failed. You can still continue to use the app.');
    } finally {
      setIsChecking(false);
    }
  };

  const skipPermissions = () => {
    console.log('User chose to skip permissions');
    onPermissionsGranted();
  };

  // Auto-continue if there's an error after 3 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        onPermissionsGranted();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, onPermissionsGranted]);

  if (!showPermissions && !error) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-blue-600">App Permissions</CardTitle>
          <p className="text-gray-600">
            Stroke Sense works best with these permissions
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert className="border-orange-200 bg-orange-50">
              <Settings className="h-4 w-4" />
              <AlertDescription className="text-orange-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Camera className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">Camera</p>
                  <p className="text-sm text-gray-600">For eye tracking tests</p>
                </div>
              </div>
              {permissions.camera ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Mic className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">Microphone</p>
                  <p className="text-sm text-gray-600">For speech analysis</p>
                </div>
              </div>
              {permissions.microphone ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <HardDrive className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="font-medium">Storage</p>
                  <p className="text-sm text-gray-600">For saving test results</p>
                </div>
              </div>
              {permissions.storage ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Activity className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="font-medium">Motion Sensors</p>
                  <p className="text-sm text-gray-600">For balance testing</p>
                </div>
              </div>
              {permissions.motion ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
            </div>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={requestPermissions}
              disabled={isChecking}
              className="w-full"
            >
              {isChecking ? 'Requesting Permissions...' : 'Grant Permissions'}
            </Button>
            
            <Button 
              onClick={skipPermissions}
              variant="outline"
              className="w-full"
            >
              Continue to App
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PermissionsHandler;
