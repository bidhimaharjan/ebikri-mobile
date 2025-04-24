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
        router.replace('/');
      } else if (token && !inAuthGroup) {
        router.replace('/(auth)/dashboard');
      }
    };

    checkAuth();
  }, [segments]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="dashboard" />
      {/* Other protected screens */}
    </Stack>
  );
}