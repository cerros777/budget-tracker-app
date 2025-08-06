import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, Button, TextInput, FlatList, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HomeScreen from './screens/HomeScreen';
import CategoryScreen from './screens/CategoryScreen';
import EditTransactionScreen from './screens/EditTransactionScreen';
import WelcomeScreen from './screens/WelcomeScreen';
import GoalScreen from './screens/GoalScreen';
import CategorySetupScreen from './screens/CategorySetupScreen';
import SuccessScreen from './screens/SuccessScreen';

const Stack = createNativeStackNavigator();

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingBottom: 100, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginVertical: 10, borderRadius: 5 },
  categoryItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
  categoryText: { fontSize: 18 },
});

export default function App() {
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(null);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const status = await AsyncStorage.getItem('onboardingComplete');
      setIsOnboardingComplete(status === 'true');
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setIsOnboardingComplete(false);
    }
  };

  const handleOnboardingComplete = () => {
    setIsOnboardingComplete(true);
  };

  // Show loading screen while checking onboarding status
  if (isOnboardingComplete === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#667eea' }}>
        <Text style={{ color: '#ffffff', fontSize: 18 }}>Cargando...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!isOnboardingComplete ? (
          // Onboarding Flow
          <>
            <Stack.Screen 
              name="Welcome" 
              component={WelcomeScreen} 
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="GoalScreen" 
              component={GoalScreen} 
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="CategorySetupScreen" 
              component={CategorySetupScreen} 
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="SuccessScreen" 
              options={{ headerShown: false }}
            >
              {(props) => <SuccessScreen {...props} onComplete={handleOnboardingComplete} />}
            </Stack.Screen>
          </>
        ) : (
          // Main App Flow
          <>
            <Stack.Screen 
              name="Home" 
              component={HomeScreen} 
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="Category" 
              component={CategoryScreen} 
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="EditTransaction" 
              component={EditTransactionScreen} 
              options={{ headerShown: false }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}