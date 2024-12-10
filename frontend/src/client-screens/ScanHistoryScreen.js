import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://receipt-tracker-407.onrender.com';

export default function ScanHistoryScreen({ navigation }) {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadScans();
    
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity 
          onPress={() => navigation.navigate('MainApp', { 
            isUserSide: true,
            screen: 'Dashboard' 
          })}
          style={{ marginLeft: 10 }}
        >
          <Text style={{ color: '#007AFF' }}>Back</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const loadScans = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const response = await fetch(`${API_URL}/api/client/scans/${userId}`);
      const data = await response.json();
      setScans(data);
    } catch (error) {
      console.error('Error loading scans:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderScan = ({ item }) => (
    <TouchableOpacity 
      style={styles.scanCard}
      onPress={() => navigation.navigate('ScanDetails', { orderData: item })}
    >
      <View style={styles.scanHeader}>
        <Text style={styles.restaurantName}>{item.restaurantName}</Text>
        <Text style={styles.scanDate}>
          {new Date(item.date).toLocaleDateString()}
        </Text>
      </View>
      <View style={styles.scanDetails}>
        <MaterialCommunityIcons name="receipt" size={20} color="#666" />
        <Text style={styles.total}>${item.total.toFixed(2)}</Text>
      </View>
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
    <View style={styles.container}>
      <Text style={styles.title}>Order History</Text>
      {scans.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="receipt" size={48} color="#666" />
          <Text style={styles.emptyText}>No orders yet</Text>
        </View>
      ) : (
        <FlatList
          data={scans}
          renderItem={renderScan}
          keyExtractor={item => item.scanId}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  scanCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
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
    marginBottom: 10,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: '600',
  },
  scanDate: {
    color: '#666',
  },
  scanDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  total: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  listContainer: {
    paddingBottom: 20,
  },
});