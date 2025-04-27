import 'dotenv/config';

export default {
  expo: {
    scheme: "com.ebikrimobile",
    newArchEnabled: true,
    extra: {
      API_URL: process.env.EXPO_PUBLIC_API_URL,
    },
  },
};
