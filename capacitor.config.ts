
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.f85da54ec88748fb8806c807b4e13848',
  appName: 'Stroke Sense',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    Camera: {
      permissions: ['camera']
    },
    Filesystem: {
      permissions: ['publicStorage']
    },
    Device: {
      permissions: ['camera', 'microphone']
    },
    Motion: {
      permissions: ['motion']
    },
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#488AFF",
      sound: "beep.wav",
    }
  },
  android: {
    permissions: [
      'android.permission.CAMERA',
      'android.permission.RECORD_AUDIO',
      'android.permission.WRITE_EXTERNAL_STORAGE',
      'android.permission.READ_EXTERNAL_STORAGE',
      'android.permission.ACCESS_COARSE_LOCATION',
      'android.permission.ACCESS_FINE_LOCATION',
      'android.permission.VIBRATE',
      'android.permission.WAKE_LOCK'
    ]
  },
  ios: {
    permissions: [
      'NSCameraUsageDescription',
      'NSMicrophoneUsageDescription',
      'NSMotionUsageDescription'
    ]
  }
};

export default config;
