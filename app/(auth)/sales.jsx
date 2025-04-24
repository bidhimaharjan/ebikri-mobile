import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Modal,
  RefreshControl,
} from "react-native";
import { LineChart, BarChart } from "react-native-chart-kit";
import { useQuery } from "@tanstack/react-query";
import { fetchSalesData } from "../../lib/api";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");

export default function Sales() {
  // Navigation and UI State
  const router = useRouter();
  const [menuVisible, setMenuVisible] = useState(false);
  const [logoutConfirmVisible, setLogoutConfirmVisible] = useState(false);
  const [viewMode, setViewMode] = useState("monthly");
  // Data State
  const [salesGrowth, setSalesGrowth] = useState(null);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [monthlyTrends, setMonthlyTrends] = useState([]);
  const [yearlyTrends, setYearlyTrends] = useState([]);
  const [topProducts, setTopProducts] = useState([]);

  // fetch sales data using react-query
  const { data: salesData, isLoading, error, refetch } = useQuery({
    queryKey: ["sales"], // unique key for the query
    queryFn: fetchSalesData, // function to fetch sales data
  });

  // state to control refresh indicator
  const [refreshing, setRefreshing] = useState(false);

  // function to handle pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetch()]);
    setRefreshing(false);
  };

  // process data when salesData or viewMode changes
  useEffect(() => {
    if (!salesData) return;

    const newMonthlyTrends = calculateTrends(salesData, "month");
    const newYearlyTrends = calculateTrends(salesData, "year");
    const newTopProducts = calculateTopProducts(salesData, viewMode);

    setMonthlyTrends(newMonthlyTrends);
    setYearlyTrends(newYearlyTrends);
    setTopProducts(newTopProducts);

    const currentTotals = calculateCurrentTotals(
      viewMode === "monthly" ? newMonthlyTrends : newYearlyTrends
    );
    setTotalRevenue(currentTotals.revenue);
    setTotalSales(currentTotals.quantitySold);

    // calculate growth percent
    if (viewMode === "monthly" && newMonthlyTrends.length >= 2) {
      const growth = calculateGrowth(newMonthlyTrends);
      setSalesGrowth(growth);
    } else if (viewMode === "yearly" && newYearlyTrends.length >= 2) {
      const growth = calculateGrowth(newYearlyTrends);
      setSalesGrowth(growth);
    }
  }, [salesData, viewMode]);

  // helper functions
  // to calculate trends (monthly/yearly)
  const calculateTrends = (data, period) => {
    const trends = {};

    data.forEach((sale) => {
      const date = new Date(sale.saleDate);
      const key =
        period === "month"
          ? `${date.getFullYear()}-${date.getMonth() + 1}` // Format: YYYY-MM
          : `${date.getFullYear()}`; // Format: YYYY

      if (!trends[key]) {
        trends[key] = { period: key, revenue: 0, quantitySold: 0 };
      }

      trends[key].revenue += parseFloat(sale.revenue);
      trends[key].quantitySold += sale.quantitySold;
    });

    return Object.values(trends).sort((a, b) =>
      a.period.localeCompare(b.period)
    );
  };

  // to calculate top-selling products
  const calculateTopProducts = (data, period) => {
    const products = {};

    data.forEach((sale) => {
      const date = new Date(sale.saleDate);
      const key =
        period === "month"
          ? `${date.getFullYear()}-${date.getMonth() + 1}`
          : `${date.getFullYear()}`;

      if (!products[sale.productId]) {
        products[sale.productId] = {
          productId: sale.productId,
          productName: sale.productName || `Product ${sale.productId}`,
          quantitySold: 0,
        };
      }

      products[sale.productId].quantitySold += sale.quantitySold;
    });

    return Object.values(products)
      .sort((a, b) => b.quantitySold - a.quantitySold)
      .slice(0, 3);
  };

  // to calculate current totals
  const calculateCurrentTotals = (trends) => {
    if (trends.length === 0) return { revenue: 0, quantitySold: 0 };
    const current = trends[trends.length - 1];
    return {
      revenue: current.revenue,
      quantitySold: current.quantitySold,
    };
  };

  // to calculate growth (percent change)
  const calculateGrowth = (trends) => {
    if (trends.length < 2) return null;
    const latest = trends[trends.length - 1].revenue;
    const previous = trends[trends.length - 2].revenue;

    if (previous === 0) {
      return latest === 0 ? 0 : 100;
    }

    return ((latest - previous) / previous) * 100;
  };

  // to prepare chart data
  const prepareChartData = (data, mode) => {
    const validatedData = data.map((item) => ({
      ...item,
      revenue: isFinite(item.revenue) ? item.revenue : 0,
      quantitySold: isFinite(item.quantitySold) ? item.quantitySold : 0,
    }));

    return {
      labels: validatedData.map((item) =>
        mode === "monthly" ? item.period.split("-")[1] : item.period
      ),
      datasets: [
        {
          data: validatedData.map((item) => item.revenue),
          color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    };
  };

  // chart configuration
  const chartConfig = {
    backgroundColor: "#ffffff",
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    decimalPlaces: 2,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: { borderRadius: 16 },
    propsForDots: {
      r: "6",
      strokeWidth: "2",
      stroke: "#ffa726",
    },
    propsForVerticalLabels: { fontSize: 10 },
    propsForHorizontalLabels: { fontSize: 10 },
  };

  // handle logout
  const handleLogout = async () => {
    try {
      await AsyncStorage.multiRemove(["authToken", "user"]);
      router.replace("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // check for loading state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6D28D9" />
      </View>
    );
  }

  // check for empty data after loading completes
  if (!isLoading && (!monthlyTrends.length || !yearlyTrends.length)) {
    return (
      <View style={styles.loadingContainer}>
        <Text>No sales data available</Text>
      </View>
    );
  }

  // check for error state
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error loading sales data</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // render sales data
  return (
    <View style={styles.mainContainer}>
      {/* Header Section */}
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Sales Analytics</Text>
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
                router.push("/(auth)/profile");
                setMenuVisible(false);
              }}
            >
              <MaterialIcons name="person" size={20} color="#6b7280" />
              <Text style={styles.menuItemText}>Profile</Text>
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

      {/* View Mode Toggle */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            viewMode === "monthly" && styles.activeToggle,
          ]}
          onPress={() => setViewMode("monthly")}
        >
          <Text
            style={[
              styles.toggleText,
              viewMode === "monthly" && styles.activeToggleText,
            ]}
          >
            Monthly
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            viewMode === "yearly" && styles.activeToggle,
          ]}
          onPress={() => setViewMode("yearly")}
        >
          <Text
            style={[
              styles.toggleText,
              viewMode === "yearly" && styles.activeToggleText,
            ]}
          >
            Yearly
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {/* Summary Cards Section */}
        <View style={styles.summaryGrid}>
          {/* Revenue Card (Left) */}
          <View style={[styles.summaryCard, styles.revenueCard]}>
            <Text style={styles.summaryLabel}>
              {viewMode === "monthly" ? "Monthly Revenue" : "Yearly Revenue"}
            </Text>
            <Text style={[styles.summaryValue, { color: "#22c55e" }]}>
              Rs. {totalRevenue.toFixed(2)}
            </Text>
          </View>

          {/* Sales Card (Top Right) */}
          <View style={[styles.summaryCard, styles.salesCard]}>
            <Text style={styles.summaryLabel}>
              {viewMode === "monthly" ? "Monthly Sales" : "Yearly Sales"}
            </Text>
            <Text style={[styles.summaryValue, { color: "#3b82f6" }]}>
              {totalSales} Items
            </Text>
          </View>

          {/* Growth Card (Bottom Right) */}
          <View style={[styles.summaryCard, styles.growthCard]}>
            <Text style={styles.summaryLabel}>
              {viewMode === "monthly" ? "Monthly Growth" : "Yearly Growth"}
            </Text>
            <Text style={[styles.summaryValue, { color: "#f97316" }]}>
              {salesGrowth !== null ? `${salesGrowth.toFixed(2)}%` : "N/A"}
            </Text>
          </View>
        </View>

        {/* Chart Section */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>
            {viewMode === "monthly"
              ? "Monthly Sales Trend"
              : "Yearly Sales Trend"}
          </Text>
          {viewMode === "monthly" ? (
            // LineChart for monthly
            <LineChart
              data={prepareChartData(monthlyTrends, "monthly")}
              width={width - 40}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={{
                marginVertical: 8,
                borderRadius: 16,
              }}
              fromZero={true}
            />
          ) : (
            // BarChart for yearly
            <BarChart
              data={prepareChartData(yearlyTrends, "yearly")}
              width={width - 40}
              height={220}
              chartConfig={chartConfig}
              style={{
                marginVertical: 8,
                borderRadius: 16,
              }}
              fromZero={true}
            />
          )}
        </View>

        {/* Top Products Section */}
        <View style={styles.topProductsContainer}>
          <Text style={styles.topProductsTitle}>
            {viewMode === "monthly"
              ? "Top Products This Month"
              : "Top Products This Year"}
          </Text>
          {topProducts.map((product, index) => (
            <View key={product.productId} style={styles.productCard}>
              <Text style={styles.productName}>
                {product.productName} (ID: {product.productId})
              </Text>
              <Text style={styles.productSales}>
                {product.quantitySold} items sold
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // Layout
  mainContainer: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    padding: 20,
    paddingTop: 70,
  },
  // Header
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
  },
  menuButton: {
    padding: 10,
  },
  // Toggle
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
    backgroundColor: "#e5e7eb",
    borderRadius: 8,
    padding: 5,
  },
  toggleButton: {
    flex: 1,
    padding: 10,
    borderRadius: 6,
    alignItems: "center",
  },
  activeToggle: {
    backgroundColor: "#6e4b9c",
  },
  toggleText: {
    color: "#6b7280",
    fontWeight: "600",
  },
  activeToggleText: {
    color: "white",
  },
  // Summary Grid
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
    gap: 10,
  },
  summaryCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  revenueCard: {
    width: "48%", // Left side
  },
  salesCard: {
    width: "48%", // Top right
    marginBottom: 5,
  },
  growthCard: {
    width: "48%", // Bottom right
    marginTop: 5,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: "bold",
  },
  // Chart
  chartContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    width: "100%",
    overflow: "hidden",
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 10,
  },
  // Top Products
  topProductsContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  topProductsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 12,
  },
  productCard: {
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  productName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1f2937",
    marginBottom: 4,
  },
  productSales: {
    fontSize: 12,
    color: "#6b7280",
  },
  // States
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
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: "#6e4b9c",
    padding: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  // Modals
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
  activeMenuItem: {
    backgroundColor: "#f3e8ff",
  },
  menuItemText: {
    marginLeft: 12,
    fontSize: 16,
    color: "#374151",
  },
  activeMenuItemText: {
    color: "#6D28D9",
    fontWeight: "600",
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
  contentContainer: {
    paddingHorizontal: 20,
  },
});