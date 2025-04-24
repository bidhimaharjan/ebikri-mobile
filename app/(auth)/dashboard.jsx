// app/(auth)/dashboard.js
import { View, Text, StyleSheet, ScrollView, Button } from 'react-native';
import React, { useState } from "react";
import { useQuery } from '@tanstack/react-query';
import { fetchDashboardData } from '../../lib/api';
import { RefreshControl } from 'react-native';

export default function Dashboard() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboardData,
  });

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  // In your dashboard component
if (error) {
  let errorMessage = 'Error loading dashboard data';
  if (error.response) {
    if (error.response.status === 401) {
      errorMessage = 'Session expired. Please login again.';
    } else if (error.response.status === 500) {
      errorMessage = 'Server error. Please try again later.';
    }
  }
  
  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>{errorMessage}</Text>
      <Button 
        title="Retry" 
        onPress={() => refetch()} 
      />
    </View>
  );
}

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      contentContainerStyle={styles.container}
    >
    <View style={styles.container}>
      <Text style={styles.header}>Business Dashboard</Text>
      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Total Revenue</Text>
        <Text style={styles.cardValue}>{data ? `$${Number(data.revenue).toFixed(2)}` : '0.00'}</Text>
      </View>

      <View style={styles.row}>
        <View style={[styles.card, styles.halfCard]}>
          <Text style={styles.cardTitle}>Total Orders</Text>
          <Text style={styles.cardValue}>{data?.totalOrders || 0}</Text>
        </View>

        <View style={[styles.card, styles.halfCard]}>
          <Text style={styles.cardTitle}>Total Customers</Text>
          <Text style={styles.cardValue}>{data?.totalCustomers || 0}</Text>
        </View>
      </View>
    </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  halfCard: {
    flex: 1,
    marginHorizontal: 5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
});