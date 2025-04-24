import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AuthLayout() {
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem('authToken');
      const inAuthGroup = segments[0] === '(auth)';
      
      if (!token && inAuthGroup) {
        // If no token but trying to access protected route
        router.replace('/');
      } else if (token && !inAuthGroup) {
        // If has token but trying to access public route
        router.replace('/(auth)/dashboard');
      }
    };

    checkAuth();
  }, [segments]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="sales" />
      <Stack.Screen name="profile" />
    </Stack>
  );
}