import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

const API_URL = 'https://receipt-tracker-407.onrender.com';

export default function ClientDashboard({ navigation }) {
  const [stats, setStats] = useState({
    totalScans: 0,
    totalSpent: 0,
    monthlySpent: 0,
  });
  const [recentScans, setRecentScans] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, [])
  );

  const loadDashboardData = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const response = await fetch(`${API_URL}/api/client/dashboard/${userId}`);
      const data = await response.json();

      setStats(data.stats);
      setRecentScans(data.recentScans);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderRecentScan = (scan) => (
    <TouchableOpacity
      key={scan.scanId}
      style={styles.scanCard}
      onPress={() => navigation.navigate('ScanDetails', { orderData: scan })}
    >
      <View style={styles.scanHeader}>
        <Text style={styles.restaurantName}>{scan.restaurantName}</Text>
        <Text style={styles.scanDate}>
          {new Date(scan.date).toLocaleDateString()}
        </Text>
      </View>
      <Text style={styles.totalAmount}>-${scan.total.toFixed(2)}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.welcomeText}>Welcome back!</Text>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <MaterialCommunityIcons name="qrcode-scan" size={24} color="#fff" />
          <Text style={styles.statNumber}>{stats.totalScans}</Text>
          <Text style={styles.statLabel}>Total Orders</Text>
        </View>
        <View style={styles.statCard}>
          <MaterialCommunityIcons name="cash" size={24} color="#fff" />
          <Text style={styles.statNumber}>${stats.totalSpent}</Text>
          <Text style={styles.statLabel}>Total Spent</Text>
        </View>
      </View>

      {/* Monthly Spending */}
      <View style={styles.monthlySection}>
        <Text style={styles.sectionTitle}>This Month</Text>
        <View style={styles.monthlyCard}>
          <MaterialCommunityIcons name="calendar-month" size={24} color="#fff" />
          <Text style={styles.monthlyAmount}>${stats.monthlySpent}</Text>
          <Text style={styles.monthlyLabel}>Spent this month</Text>
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.recentActivity}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        {recentScans.map(renderRecentScan)}
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('QR Scan')}
        >
          <MaterialCommunityIcons name="qrcode-scan" size={24} color="white" />
          <Text style={styles.actionButtonText}>Scan Order</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('ScanHistory')}
        >
          <MaterialCommunityIcons name="history" size={24} color="white" />
          <Text style={styles.actionButtonText}>View History</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#000',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: '#000',
    padding: 20,
    borderRadius: 15,
    width: '48%',
    alignItems: 'center',
    elevation: 5,
  },
  statNumber: {
    fontSize: 26,
    fontWeight: 'bold',
    marginVertical: 5,
    color: '#fff',
  },
  statLabel: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.7,
  },
  monthlySection: {
    marginBottom: 25,
  },
  monthlyCard: {
    backgroundColor: '#000',
    padding: 25,
    borderRadius: 15,
    alignItems: 'center',
    elevation: 5,
  },
  monthlyAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#fff',
  },
  monthlyLabel: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.7,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#000',
  },
  recentActivity: {
    marginBottom: 20,
  },
  scanCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  scanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  scanDate: {
    color: '#666',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ff0000',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: '#000',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    width: '48%',
    elevation: 5,
  },
  actionButtonText: {
    color: '#fff',
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '600',
  },
});
