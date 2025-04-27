import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
} from "react-native";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchProfileData } from "../../lib/api";
import { MaterialIcons, Ionicons, FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Profile() {
  // Navigation and UI State
  const router = useRouter();
  const [menuVisible, setMenuVisible] = useState(false);
  const [logoutConfirmVisible, setLogoutConfirmVisible] = useState(false);

  // fetch profile data using react query
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["profile"], // unique key for the query
    queryFn: fetchProfileData, // function to fetch profile data
  });

  // state to control refresh indicator
  const [refreshing, setRefreshing] = useState(false);

  // function to handle pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetch()]);
    setRefreshing(false);
  };

  // function to handle logout
  const handleLogout = async () => {
    try {
      // clear all stored data
      await AsyncStorage.multiRemove(["authToken", "user"]);
      router.replace("/"); // redirect to login screen
      setMenuVisible(false); // close the menu
      console.log("Logged out");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // handle loading state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6D28D9" />
      </View>
    );
  }

  // handle error state
  if (error) {
    let errorMessage = "Error loading profile data";
    if (error.response) {
      if (error.response.status === 401) {
        handleLogout();
        return null; // do not render anything while redirecting
      } else if (error.response.status === 500) {
        errorMessage = "Server error. Please try again later.";
      }
    }

    // display error message with retry button
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{errorMessage}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // render profile data
  return (
    <View style={styles.mainContainer}>
      {/* Header Section */}
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Profile</Text>
        <TouchableOpacity
          onPress={() => setMenuVisible(true)}
          style={styles.menuButton}
        >
          <MaterialIcons name="menu" size={24} color="#6b7280" />
        </TouchableOpacity>
      </View>

      {/* Menu Modal */}
      <Modal
        transparent={true}
        visible={menuVisible}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.menuOverlay}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.menuContainer}>
            {/* Dashboard Menu Item */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                router.push("/(auth)/dashboard");
                setMenuVisible(false);
              }}
            >
              <MaterialIcons name="dashboard" size={20} color="#6b7280" />
              <Text style={styles.menuItemText}>Dashboard</Text>
            </TouchableOpacity>

            {/* Sales Analytics Menu Item */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                router.push("/(auth)/sales");
                setMenuVisible(false);
              }}
            >
              <MaterialIcons name="analytics" size={20} color="#6b7280" />
              <Text style={styles.menuItemText}>Sales Analytics</Text>
            </TouchableOpacity>

            {/* Logout Menu Item */}
            <TouchableOpacity
              style={[styles.menuItem, styles.logoutItem]}
              onPress={() => {
                setMenuVisible(false);
                setLogoutConfirmVisible(true);
              }}
            >
              <MaterialIcons name="logout" size={20} color="#ef4444" />
              <Text style={[styles.menuItemText, styles.logoutText]}>
                Log Out
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Logout Confirmation Modal */}
      <Modal
        transparent={true}
        visible={logoutConfirmVisible}
        animationType="fade"
        onRequestClose={() => setLogoutConfirmVisible(false)}
      >
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmContainer}>
            <Text style={styles.confirmTitle}>
              Are you sure you want to log out?
            </Text>
            <View style={styles.confirmButtonContainer}>
              {/* Confirm Logout Button */}
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={() => {
                  handleLogout();
                  setLogoutConfirmVisible(false);
                }}
              >
                <Text style={styles.confirmButtonText}>Confirm</Text>
              </TouchableOpacity>

              {/* Cancel Logout Button */}
              <TouchableOpacity
                style={[styles.confirmButton, styles.cancelButton]}
                onPress={() => setLogoutConfirmVisible(false)}
              >
                <Text
                  style={[styles.confirmButtonText, styles.cancelButtonText]}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Main Content ScrollView */}
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.container}
      >
        {/* Personal Information Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="person-circle" size={24} color="#6D28D9" />
            <Text style={styles.cardHeaderText}>Personal Information</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Name:</Text>
            <Text style={styles.infoValue}>{data?.user?.name}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>{data?.user?.email}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phone:</Text>
            <Text style={styles.infoValue}>{data?.user?.phoneNumber}</Text>
          </View>
        </View>

        {/* Business Information Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <FontAwesome name="building" size={20} color="#6D28D9" />
            <Text style={styles.cardHeaderText}>Business Information</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Business Name:</Text>
            <Text style={styles.infoValue}>{data?.business?.businessName}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Business Type:</Text>
            <Text style={styles.infoValue}>{data?.business?.businessType}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Business Email:</Text>
            <Text style={styles.infoValue}>
              {data?.business?.businessEmail}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>PAN Number:</Text>
            <Text style={styles.infoValue}>{data?.business?.panNumber}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // Main Container
  mainContainer: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    padding: 16,
  },
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  // Header
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 8,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1f2937",
  },
  menuButton: {
    padding: 8,
  },
  // Menu Modal
  menuOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 60,
    paddingRight: 20,
  },
  menuContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    paddingVertical: 10,
    width: 200,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  menuItemText: {
    marginLeft: 12,
    fontSize: 16,
    color: "#374151",
  },
  logoutItem: {
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    marginTop: 5,
    paddingTop: 15,
  },
  logoutText: {
    color: "#ef4444",
  },
  // Confirmation Modal
  confirmOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  confirmContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 30,
    width: "80%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 20,
    textAlign: "center",
  },
  confirmButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#6e4b9c",
    marginHorizontal: 5,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#e5e7eb",
  },
  confirmButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButtonText: {
    color: "#374151",
  },
  // Loading & Error States
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "#6e4b9c",
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "600",
  },
  // Card & Info
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    paddingBottom: 12,
  },
  cardHeaderText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginLeft: 10,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 15,
    color: "#6b7280",
    width: "40%",
  },
  infoValue: {
    fontSize: 15,
    color: "#1f2937",
    fontWeight: "500",
    width: "60%",
    textAlign: "right",
  },
});
