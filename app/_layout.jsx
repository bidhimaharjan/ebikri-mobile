import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export default function RootLayout() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);
  const router = useRouter();
  const segments = useSegments();

  // create a new QueryClient
  const queryClient = new QueryClient();

  // check if user is logged in based on the stored auth token
  const checkAuthStatus = async () => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      setUser({ token }); 
    }
    setInitializing(false);
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  useEffect(() => {
    if (initializing) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (user && !inAuthGroup) {
      router.replace('/(auth)/dashboard'); // redirect to the /dashboard if authenticated
    } else if (!user && inAuthGroup) {
      router.replace('/'); // redirect to login if not authenticated
    }
  }, [user, initializing]);

  if (initializing)
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator size="large" />
      </View>
    );

  return (
    <QueryClientProvider client={queryClient}>
      <Stack>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack>
    </QueryClientProvider>
  );
}
