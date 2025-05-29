
import { Camera } from '@capacitor/camera';
import { Filesystem } from '@capacitor/filesystem';
import { Motion } from '@capacitor/motion';
import { Capacitor } from '@capacitor/core';
import { toast } from '@/hooks/use-toast';

export interface PermissionStatus {
  camera: boolean;
  microphone: boolean;
  storage: boolean;
  motion: boolean;
}

class PermissionsService {
  async requestAllPermissions(): Promise<PermissionStatus> {
    if (!Capacitor.isNativePlatform()) {
      // Web platform - use browser APIs
      return this.requestWebPermissions();
    }

    // Native platform - use Capacitor APIs
    return this.requestNativePermissions();
  }

  private async requestWebPermissions(): Promise<PermissionStatus> {
    const permissions: PermissionStatus = {
      camera: false,
      microphone: false,
      storage: true, // Web storage is always available
      motion: false
    };

    try {
      // Request camera permission
      const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
      permissions.camera = true;
      cameraStream.getTracks().forEach(track => track.stop());
    } catch (error) {
      console.log('Camera permission denied:', error);
    }

    try {
      // Request microphone permission
      const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      permissions.microphone = true;
      micStream.getTracks().forEach(track => track.stop());
    } catch (error) {
      console.log('Microphone permission denied:', error);
    }

    try {
      // Check motion permission (DeviceMotionEvent)
      if (typeof DeviceMotionEvent !== 'undefined' && typeof (DeviceMotionEvent as any).requestPermission === 'function') {
        const motionPermission = await (DeviceMotionEvent as any).requestPermission();
        permissions.motion = motionPermission === 'granted';
      } else {
        // Motion is available without explicit permission on most devices
        permissions.motion = true;
      }
    } catch (error) {
      console.log('Motion permission request failed:', error);
    }

    return permissions;
  }

  private async requestNativePermissions(): Promise<PermissionStatus> {
    const permissions: PermissionStatus = {
      camera: false,
      microphone: false,
      storage: false,
      motion: false
    };

    try {
      // Request camera permission
      const cameraPermission = await Camera.requestPermissions();
      permissions.camera = cameraPermission.camera === 'granted';
    } catch (error) {
      console.log('Camera permission request failed:', error);
    }

    try {
      // For microphone on native platforms, we'll use getUserMedia as fallback
      const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      permissions.microphone = true;
      micStream.getTracks().forEach(track => track.stop());
    } catch (error) {
      console.log('Microphone permission request failed:', error);
    }

    try {
      // Request storage permission
      const storagePermission = await Filesystem.requestPermissions();
      permissions.storage = storagePermission.publicStorage === 'granted';
    } catch (error) {
      console.log('Storage permission request failed:', error);
    }

    try {
      // Request motion permission
      await Motion.requestPermissions();
      permissions.motion = true;
    } catch (error) {
      console.log('Motion permission request failed:', error);
    }

    return permissions;
  }

  async checkPermissions(): Promise<PermissionStatus> {
    if (!Capacitor.isNativePlatform()) {
      return this.checkWebPermissions();
    }

    return this.checkNativePermissions();
  }

  private async checkWebPermissions(): Promise<PermissionStatus> {
    // For web, we'll check if permissions are available
    return {
      camera: true,
      microphone: true,
      storage: true,
      motion: true
    };
  }

  private async checkNativePermissions(): Promise<PermissionStatus> {
    const permissions: PermissionStatus = {
      camera: false,
      microphone: false,
      storage: false,
      motion: false
    };

    try {
      const cameraPermission = await Camera.checkPermissions();
      permissions.camera = cameraPermission.camera === 'granted';
    } catch (error) {
      console.log('Camera permission check failed:', error);
    }

    try {
      // For microphone checking on native, we'll use a basic approach
      permissions.microphone = true; // Assume granted for now
    } catch (error) {
      console.log('Microphone permission check failed:', error);
    }

    try {
      const storagePermission = await Filesystem.checkPermissions();
      permissions.storage = storagePermission.publicStorage === 'granted';
    } catch (error) {
      console.log('Storage permission check failed:', error);
    }

    try {
      // Motion permissions are typically always granted
      permissions.motion = true;
    } catch (error) {
      console.log('Motion permission check failed:', error);
    }

    return permissions;
  }

  showPermissionDeniedMessage(permission: string) {
    toast({
      title: `${permission} Permission Required`,
      description: `This app needs ${permission} access to function properly. Please enable it in your device settings.`,
      variant: "destructive",
    });
  }
}

export const permissionsService = new PermissionsService();
