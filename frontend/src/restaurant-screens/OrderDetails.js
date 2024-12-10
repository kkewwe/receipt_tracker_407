import { Alert } from 'react-native';
import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity 
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const API_URL = 'https://receipt-tracker-407.onrender.com';

export default function OrderDetails({ route, navigation }) {
  const orderData = route.params?.order || {};
  const dishes = orderData.dishes || [];

  const handleStatusUpdate = async (newStatus) => {
    try {
      const response = await fetch(`${API_URL}/api/restaurant/order/${orderData.orderID}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
  
      if (response.ok) {
        Alert.alert('Success', 'Order status updated', [
          {
            text: 'OK',
            onPress: () => navigation.goBack() // Navigate back to order list
          }
        ]);
      } else {
        throw new Error('Failed to update status');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update order status');
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Order Info Card */}
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.orderId}>Order #{orderData.orderID}</Text>
          <Text style={styles.orderDate}>
            {new Date(orderData.createdAt).toLocaleDateString()}
          </Text>
        </View>
        
        <View style={styles.statusSection}>
          <Text style={styles.label}>Status:</Text>
          <Text style={[styles.status, styles[orderData.status || 'pending']]}>
            {(orderData.status || 'PENDING').toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Items Card */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Order Items</Text>
        {dishes.map((item, index) => (
          <View key={index} style={styles.itemRow}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemQuantity}>x{item.quantity}</Text>
            </View>
            <Text style={styles.itemPrice}>${(item.price * item.quantity).toFixed(2)}</Text>
          </View>
        ))}
        
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>${orderData.total?.toFixed(2)}</Text>
        </View>
      </View>

      {/* Status Update Buttons */}
      <View style={styles.actionButtons}>
        {orderData.status === 'pending' && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.confirmButton]}
            onPress={() => handleStatusUpdate('confirmed')}
          >
            <MaterialCommunityIcons name="check-circle" size={20} color="white" />
            <Text style={styles.buttonText}>Confirm Order</Text>
          </TouchableOpacity>
        )}

        {orderData.status === 'confirmed' && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.completeButton]}
            onPress={() => handleStatusUpdate('completed')}
          >
            <MaterialCommunityIcons name="flag-checkered" size={20} color="white" />
            <Text style={styles.buttonText}>Mark as Completed</Text>
          </TouchableOpacity>
        )}

        {orderData.status === 'pending' && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.cancelButton]}
            onPress={() => handleStatusUpdate('cancelled')}
          >
            <MaterialCommunityIcons name="close-circle" size={20} color="white" />
            <Text style={styles.buttonText}>Cancel Order</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 15,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  orderDate: {
    color: '#666',
  },
  statusSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  label: {
    fontSize: 14,
    marginRight: 10,
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '500',
  },
  itemQuantity: {
    color: '#666',
    marginTop: 4,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '600',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  actionButtons: {
    marginTop: 10,
    gap: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  confirmButton: {
    backgroundColor: '#28a745',
  },
  completeButton: {
    backgroundColor: '#007bff',
  },
  cancelButton: {
    backgroundColor: '#dc3545',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});