// lib/api.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { navigate } from './navigation';

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('authToken');
  console.log('Token:', token);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
        await AsyncStorage.clear();
        navigate('index'); // Redirect to login
      }
    return Promise.reject(error);
  }
);

export const fetchDashboardData = async () => {
    const response = await api.get('/api/dashboard');
    console.log('Dashboard response:', response.data);
    return response.data;
  };
  