import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator 
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

const API_URL = 'https://receipt-tracker-407.onrender.com';

export default function OrdersListScreen({ navigation, route }) {
  const [orders, setOrders] = useState([]);  // Initialize as empty array instead of undefined
  const [loading, setLoading] = useState(true);
  const { restaurantID } = route.params;

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [])
  );

  const fetchOrders = async () => {
    try {
      console.log('Fetching orders for restaurant:', restaurantID); // Debug log
      const response = await fetch(`${API_URL}/api/restaurant/${restaurantID}/orders`);
      const data = await response.json();
      console.log('Received orders:', data); // Debug log
      setOrders(data || []); // Ensure we set an empty array if data is null/undefined
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const renderOrder = ({ item }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => navigation.navigate('OrderDetails', { order: item })}
    >
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>Order #{item.orderID.slice(-8)}</Text>
        <Text style={[styles.status, styles[item.status || 'pending']]}>
          {(item.status || 'PENDING').toUpperCase()}
        </Text>
      </View>
      <View style={styles.orderInfo}>
        <Text style={styles.orderDate}>
          {new Date(item.createdAt).toLocaleTimeString()}
        </Text>
        <Text style={styles.orderTotal}>
          ${item.total?.toFixed(2) || '0.00'}
        </Text>
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
      {orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="receipt" size={48} color="#666" />
          <Text style={styles.emptyText}>No orders yet</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrder}
          keyExtractor={item => item.orderID}
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
    padding: 15,
  },
  orderCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '600',
  },
  orderInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderDate: {
    color: '#666',
    fontSize: 14,
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: '600',
  },
  status: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: '600',
  },
  pending: {
    backgroundColor: '#fff3cd',
    color: '#856404',
  },
  confirmed: {
    backgroundColor: '#d4edda',
    color: '#155724',
  },
  completed: {
    backgroundColor: '#cce5ff',
    color: '#004085',
  },
  cancelled: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
  },
});