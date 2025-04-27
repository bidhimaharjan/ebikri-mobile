import axios from "axios";
import Constants from 'expo-constants';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { navigate } from "./navigation";

// get the API base URL from Expo app config
const baseURL = Constants.expoConfig.extra.API_URL;

const api = axios.create({
  baseURL: baseURL,
});

// interceptor to attach the auth token to every request if it exists
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("authToken");
  console.log("Token:", token);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`; // add the token to authorization header to send to backend
  }
  return config;
});

// interceptor to handle unauthorized errors globally
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
  const response = await api.get("/api/dashboard");
  return response.data;
};

// function to fetch sales data from /api/sales endpoint
export const fetchSalesData = async () => {
  const response = await api.get("/api/sales");
  return response.data;
};
