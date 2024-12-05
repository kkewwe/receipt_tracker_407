import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function ClientDashboard() {
  const recentScans = [
    { id: 1, restaurant: "Joe's Diner", date: "2024-12-05", saved: 12.50 },
    { id: 2, restaurant: "Pizza Place", date: "2024-12-04", saved: 8.75 },
    { id: 3, restaurant: "Sushi Bar", date: "2024-12-03", saved: 15.00 },
  ];

  const renderRecentScan = (scan) => (
    <TouchableOpacity key={scan.id} style={styles.scanCard}>
      <View style={styles.scanHeader}>
        <Text style={styles.restaurantName}>{scan.restaurant}</Text>
        <Text style={styles.scanDate}>{new Date(scan.date).toLocaleDateString()}</Text>
      </View>
      <Text style={styles.savedAmount}>Saved ${scan.saved.toFixed(2)}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.welcomeText}>Welcome back!</Text>
      
      {/* Main Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <MaterialCommunityIcons name="qrcode-scan" size={24} color="#000" />
          <Text style={styles.statNumber}>23</Text>
          <Text style={styles.statLabel}>Total Scans</Text>
        </View>
        <View style={styles.statCard}>
          <MaterialCommunityIcons name="cash" size={24} color="#000" />
          <Text style={styles.statNumber}>$156.25</Text>
          <Text style={styles.statLabel}>Total Saved</Text>
        </View>
      </View>

      {/* Monthly Progress */}
      <View style={styles.progressSection}>
        <Text style={styles.sectionTitle}>Monthly Progress</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '75%' }]} />
        </View>
        <Text style={styles.progressText}>75% towards monthly goal</Text>
      </View>

      {/* Recent Activity */}
      <View style={styles.recentActivity}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        {recentScans.map(renderRecentScan)}
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.actionButton}>
          <MaterialCommunityIcons name="qrcode-scan" size={24} color="white" />
          <Text style={styles.actionButtonText}>New Scan</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
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
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    width: '48%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  progressSection: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  progressBar: {
    height: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 5,
  },
  progressText: {
    color: '#666',
    fontSize: 14,
  },
  recentActivity: {
    marginBottom: 20,
  },
  scanCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
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
  },
  scanDate: {
    color: '#666',
  },
  savedAmount: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 10,
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: 'white',
    marginLeft: 10,
    fontWeight: '600',
  },
});