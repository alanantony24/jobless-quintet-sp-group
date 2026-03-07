import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { GPProvider } from './src/context/GPContext';
import AppNavigator  from './src/navigation/AppNavigator';

export default function App() {
  return (
    <GPProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </GPProvider>
  );
}
