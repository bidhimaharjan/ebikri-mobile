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
  import { fetchDashboardData } from "../../lib/api";
  import { MaterialIcons } from "@expo/vector-icons";
  import { useRouter } from "expo-router";
  import AsyncStorage from "@react-native-async-storage/async-storage";
  
  export default function Profile() {
    const router = useRouter();
    const [menuVisible, setMenuVisible] = useState(false);
    const [logoutConfirmVisible, setLogoutConfirmVisible] = useState(false);

    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ["dashboard"],
        queryFn: fetchDashboardData,
      });
  
    const [refreshing, setRefreshing] = useState(false);
  
    const onRefresh = async () => {
      setRefreshing(true);
      await Promise.all([refetch()]);
      setRefreshing(false);
    };
  
    const handleLogout = async () => {
      try {
        // Clear all stored data
        await AsyncStorage.multiRemove(["authToken", "user"]);
  
        // Redirect to login screen
        router.replace("/");
  
        // Close the menu
        setMenuVisible(false);
      } catch (error) {
        console.error("Logout error:", error);
        // Handle error if needed
      }
    };
  
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6D28D9" />
        </View>
      );
    }
  
    if (error) {
      let errorMessage = "Error loading dashboard data";
      if (error.response) {
        if (error.response.status === 401) {
          // Auto-redirect on 401 errors
          handleLogout();
          return null; // Don't render anything while redirecting
        } else if (error.response.status === 500) {
          errorMessage = "Server error. Please try again later.";
        }
      }
  
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{errorMessage}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }
  
    return (
      <View style={styles.mainContainer}>
        {/* Header with Menu Button */}
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
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={() => {
                    handleLogout();
                    setLogoutConfirmVisible(false);
                  }}
                >
                  <Text style={styles.confirmButtonText}>Confirm</Text>
                </TouchableOpacity>
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
  
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.container}
        >
          
        </ScrollView>
      </View>
    );
  }
  
  const styles = StyleSheet.create({
    mainContainer: {
      flex: 1,
      backgroundColor: "#f3f4f6",
    },
    headerContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingTop: 70,
    },
    menuButton: {
      padding: 10,
    },
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
    container: {
      padding: 20,
      paddingTop: 10,
    },
    header: {
      fontSize: 26,
      fontWeight: "bold",
      color: "#1f2937",
      marginBottom: 4,
    },
    subHeader: {
      fontSize: 14,
      color: "#6b7280",
      marginBottom: 20,
      paddingHorizontal: 20,
    },
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
    },
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
  });
  