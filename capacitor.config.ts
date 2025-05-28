
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
    VoiceRecorder: {
      permissions: ['microphone']
    },
    Filesystem: {
      permissions: ['publicStorage']
    }
  }
};

export default config;
