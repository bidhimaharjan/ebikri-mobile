import axios from "axios";
import Constants from 'expo-constants';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { navigate } from "./navigation";

// get the API base URL from Expo app config
const baseURL = Constants.expoConfig.extra.API_URL;

// create axios instance with base URL
const api = axios.create({
  baseURL: baseURL,
});

/**
 * Request Interceptor:
 * - attaches auth token to every request if it exists
 * - logs request details in development
 */
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("authToken");
  console.log("Token:", token);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`; // add the token to authorization header to send to backend
  }
  return config;
});

/**
 * Response Interceptor:
 * - handles unauthorized errors globally
 * - logs response errors in development
 */
api.interceptors.response.use(
    (response) => response, // return response directly on success
    async (error) => {
      if (error.response?.status === 401) {
        // clear stored auth data and redirect to login
        await AsyncStorage.multiRemove(['authToken', 'user']);
        navigate('index');
      }
      return Promise.reject(error);
    }
  );

// function to fetch dashboard data from /api/dashboard endpoint
export const fetchDashboardData = async () => {
  try {
    const response = await api.get("/api/dashboard");
    console.log("Fetched Dashboard");
    return response.data;
  } catch (error) {
    console.error("Dashboard fetch error:", error);
    throw error;
  }
};

// function to fetch sales data from /api/sales endpoint
export const fetchSalesData = async () => {
  try {
    const response = await api.get("/api/sales");
    console.log("Fetched Sales Analytics");
    return response.data;
  } catch (error) {
    console.error("Sales fetch error:", error);
    throw error;
  }
};

// function to fetch profile data from /api/settings/[id] endpoint
export const fetchProfileData = async () => {
  try {
    // get the stored user data
    const userString = await AsyncStorage.getItem('user');
    if (!userString) throw new Error('User not found in storage');
    
    const user = JSON.parse(userString);
    // fetch the user profile data using the user ID
    const response = await api.get(`/api/settings/${user.id}`);
    console.log("Fetched Profile");
    return response.data;
  } catch (error) {
    console.error("Profile fetch error:", error);
    throw error;
  }
};