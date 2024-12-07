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
      <Text style={styles.totalAmount}>${scan.total.toFixed(2)}</Text>
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
          <MaterialCommunityIcons name="qrcode-scan" size={24} color="#000" />
          <Text style={styles.statNumber}>{stats.totalScans}</Text>
          <Text style={styles.statLabel}>Total Orders</Text>
        </View>
        <View style={styles.statCard}>
          <MaterialCommunityIcons name="cash" size={24} color="#000" />
          <Text style={styles.statNumber}>${stats.totalSpent}</Text>
          <Text style={styles.statLabel}>Total Spent</Text>
        </View>
      </View>

      {/* Monthly Spending */}
      <View style={styles.monthlySection}>
        <Text style={styles.sectionTitle}>This Month</Text>
        <View style={styles.monthlyCard}>
          <MaterialCommunityIcons name="calendar-month" size={24} color="#000" />
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
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
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
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Shadow for Android
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 5,
    color: '#fff',
  },
  statLabel: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
  },
  monthlySection: {
    marginBottom: 20,
  },
  monthlyCard: {
    backgroundColor: '#000',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Shadow for Android
    elevation: 3,
  },
  monthlyAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#fff',
  },
  monthlyLabel: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
  },
  sectionTitle: {
    fontSize: 18,
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
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    // Shadow for Android
    elevation: 2,
  },
  scanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  scanDate: {
    color: '#666',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
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
  },
  actionButtonText: {
    color: '#fff',
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '600',
  },
});