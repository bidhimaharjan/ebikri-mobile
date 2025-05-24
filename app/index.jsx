import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secureEntry, setSecureEntry] = useState(true);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // login handler
  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/mobile-login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      if (!response.ok) {
        const text = await response.text(); // get the raw text
        throw new Error(text); // or a custom message
      }

      const data = await response.json();
      console.log("Response Data:", data);

      if (response.ok) {
        // store both token and user data
        await AsyncStorage.multiSet([
          ["authToken", data.token],
          ["user", JSON.stringify(data.user)],
        ]);
        router.replace("/(auth)/dashboard");
        console.log("Logged in");
      } else {
        throw new Error(data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/images/eBikri-logo-purple.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.title}>Welcome Back</Text>

      {/* Email Field */}
      <View style={styles.inputContainer}>
        <Ionicons name="mail-outline" size={20} style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      {/* Password Button */}
      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed-outline" size={20} style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={secureEntry}
        />
        <TouchableOpacity onPress={() => setSecureEntry(!secureEntry)}>
          <Ionicons
            name={secureEntry ? "eye-off-outline" : "eye-outline"}
            size={20}
            style={styles.icon}
          />
        </TouchableOpacity>
      </View>

      {/* Login Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Login</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f9fafb",
    justifyContent: "center",
  },
  logo: {
    width: 150,
    height: 120,
    alignSelf: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 40,
    textAlign: "center",
    color: "#111827",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    borderColor: "#e5e7eb",
    borderWidth: 1,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  icon: {
    color: "#6b7280",
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    color: "#111827",
  },
  button: {
    backgroundColor: "#6e4b9c",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  }
});
