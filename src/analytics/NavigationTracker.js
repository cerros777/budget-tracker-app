import React, { useEffect } from 'react';
import { useNavigationState } from '@react-navigation/native';
import { trackScreenView } from './index';

/**
 * NavigationTracker Component
 * 
 * This component automatically tracks screen views when the user navigates
 * between different screens in the app. It uses React Navigation's state
 * to detect route changes and log them to Firebase Analytics.
 * 
 * Usage: Add this component to your App.js or main navigation container
 */

export const NavigationTracker = ({ children }) => {
  const navigationState = useNavigationState(state => state);

  useEffect(() => {
    if (navigationState) {
      const currentRoute = navigationState.routes[navigationState.index];
      if (currentRoute) {
        // Track the screen view
        trackScreenView(currentRoute.name, currentRoute.name);
      }
    }
  }, [navigationState]);

  return <>{children}</>;
};

export default NavigationTracker;
