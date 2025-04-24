import 'dotenv/config';

export default {
  expo: {
    extra: {
      API_URL: process.env.EXPO_PUBLIC_API_URL,
    },
  },
  "expo": {
    "extra": {
      "EXPO_PUBLIC_API_URL": "http://192.168.1.244:3000"
    },
    "scheme": "com.yourappname",
    "newArchEnabled": true
  }
};
