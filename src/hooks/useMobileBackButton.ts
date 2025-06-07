
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { App as CapacitorApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

export const useMobileBackButton = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      return; // Only handle on mobile platforms
    }

    const handleBackButton = () => {
      // Define routes where back button should have special behavior
      const currentPath = location.pathname;
      
      // If on home/dashboard, minimize app instead of closing
      if (currentPath === '/' || currentPath === '/dashboard') {
        CapacitorApp.minimizeApp();
        return;
      }
      
      // For other routes, navigate back
      if (window.history.length > 1) {
        navigate(-1);
      } else {
        // If no history, go to dashboard
        navigate('/dashboard');
      }
    };

    // Add the back button listener
    let listenerHandle: any;
    
    const setupListener = async () => {
      listenerHandle = await CapacitorApp.addListener('backButton', handleBackButton);
    };
    
    setupListener();

    // Cleanup
    return () => {
      if (listenerHandle) {
        listenerHandle.remove();
      }
    };
  }, [navigate, location.pathname]);
};
