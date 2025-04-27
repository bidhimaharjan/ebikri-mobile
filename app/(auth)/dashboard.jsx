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
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Dashboard() {
  const router = useRouter();
  const [menuVisible, setMenuVisible] = useState(false); // state to control menu visibility
  const [logoutConfirmVisible, setLogoutConfirmVisible] = useState(false); // state to control logout confirmation modal visibility

  // fetch dashboard data using react query
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["dashboard"], // unique key for the query
    queryFn: fetchDashboardData, // function to fetch dashboard data
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
    let errorMessage = "Error loading dashboard data";
    if (error.response) {
      if (error.response.status === 401) {
        handleLogout();
        return null;
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

  // render dashboard data
  return (
    <View style={styles.mainContainer}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Business Dashboard</Text>
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

            {/* Profile Menu Item */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                router.push("/(auth)/profile");
                setMenuVisible(false);
              }}
            >
              <MaterialIcons name="person" size={20} color="#6b7280" />
              <Text style={styles.menuItemText}>Profile</Text>
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
        contentContainerStyle={styles.scrollContent}
      >
        {/* Business Overview Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Business Overview</Text>
          <View style={styles.cardContainer}>
            {/* Total Revenue Card */}
            <View style={styles.card}>
              <FontAwesome5 name="dollar-sign" size={24} color="#22c55e" />
              <Text style={[styles.cardTitle, { color: "#22c55e" }]}>
                Revenue
              </Text>
              <Text style={[styles.cardValue, { color: "#22c55e" }]}>
                Rs. {Number(data.revenue).toLocaleString()}
              </Text>
            </View>

            {/* Total Products Card */}
            <View style={styles.card}>
              <FontAwesome5 name="box" size={24} color="#3b82f6" />
              <Text style={[styles.cardTitle, { color: "#3b82f6" }]}>
                Products
              </Text>
              <Text style={[styles.cardValue, { color: "#3b82f6" }]}>
                {data.totalProducts}
              </Text>
            </View>

            {/* Total Customers Card */}
            <View style={styles.card}>
              <FontAwesome5 name="users" size={24} color="#f97316" />
              <Text style={[styles.cardTitle, { color: "#f97316" }]}>
                Customers
              </Text>
              <Text style={[styles.cardValue, { color: "#f97316" }]}>
                {data.totalCustomers}
              </Text>
            </View>
          </View>
        </View>

        {/* Orders & Payments Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Orders & Payments</Text>
          <View style={styles.ordersPaymentsContainer}>
            {/* Orders Card - Left */}
            <View style={styles.ordersCard}>
              <View style={styles.cardContent}>
                <FontAwesome5 name="shopping-cart" size={24} color="#ef4444" />
                <Text style={[styles.cardTitle, { color: "#ef4444" }]}>
                  Total Orders
                </Text>
                <Text style={[styles.cardValue, { color: "#ef4444" }]}>
                  {data.totalOrders}
                </Text>
              </View>
            </View>

            {/* Payments Cards - Right */}
            <View style={styles.paymentsColumn}>
              {/* Paid Payments Card */}
              <View style={styles.paymentCard}>
                <View style={styles.paymentCardHeader}>
                  <FontAwesome5 name="check-circle" size={18} color="#10b981" />
                  <Text style={[styles.paymentCardTitle, { color: "#10b981" }]}>
                    Paid
                  </Text>
                </View>
                <Text style={[styles.paymentCardValue, { color: "#10b981" }]}>
                  {data.totalPaidPayments}
                </Text>
              </View>

              {/* Pending Payments Card */}
              <View style={styles.paymentCard}>
                <View style={styles.paymentCardHeader}>
                  <FontAwesome5 name="clock" size={18} color="#f59e0b" />
                  <Text style={[styles.paymentCardTitle, { color: "#f59e0b" }]}>
                    Pending
                  </Text>
                </View>
                <Text style={[styles.paymentCardValue, { color: "#f59e0b" }]}>
                  {data.totalPendingPayments}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Marketing Campaigns Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Marketing Campaigns</Text>
          <View style={styles.campaignsContainer}>
            {data.activeCampaigns.map((campaign) => (
              <View key={campaign.id} style={styles.campaignCard}>
                <View style={styles.campaignHeader}>
                  <FontAwesome5 name="bullhorn" size={18} color="#8b5cf6" />
                  <Text style={styles.campaignName}>{campaign.name}</Text>
                </View>
                <View style={styles.campaignDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Discount:</Text>
                    <Text style={[styles.detailValue, { color: "#8b5cf6" }]}>
                      {campaign.discount}%
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Promo Code:</Text>
                    <Text style={styles.detailValue}>{campaign.promoCode}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Duration:</Text>
                    <Text style={styles.detailValue}>
                      {new Date(campaign.startDate).toLocaleDateString()} -{" "}
                      {new Date(campaign.endDate).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// Stylesheet
const styles = StyleSheet.create({
  // Layout
  mainContainer: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  // Header
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 56,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1f2937",
  },
  menuButton: {
    padding: 8,
  },
  // Sections
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4b5563",
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  // Cards
  cardContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    width: "48%",
    height: 125,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 14,
    marginTop: 8,
    fontWeight: "600",
  },
  cardValue: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 4,
  },
  // Orders & Payments
  ordersPaymentsContainer: {
    flexDirection: "row",
    gap: 12,
    height: 130,
  },
  ordersCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    width: "48%",
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardContent: {
    alignItems: "center",
  },
  paymentsColumn: {
    width: "48%",
    justifyContent: 'space-between',
  },
  paymentCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 12,
    height: '46%',
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  paymentCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 4,
  },
  paymentCardTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  paymentCardValue: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: 'center',
  },
  // Marketing Campaigns
  campaignsContainer: {
    gap: 12,
  },
  campaignCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  campaignHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  campaignName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4b5563",
  },
  campaignDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  detailLabel: {
    fontSize: 14,
    color: "#6b7280",
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1f2937",
  },
  // Modals
  menuOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 60,
    paddingRight: 16,
  },
  menuContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    paddingVertical: 8,
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
    paddingHorizontal: 16,
  },
  menuItemText: {
    marginLeft: 12,
    fontSize: 16,
    color: "#374151",
  },
  logoutItem: {
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    marginTop: 4,
    paddingTop: 12,
  },
  logoutText: {
    color: "#ef4444",
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
    padding: 24,
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
    gap: 12,
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#6e4b9c",
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
    marginBottom: 12,
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
});
