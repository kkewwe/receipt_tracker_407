// OrderDetails.js
import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Alert 
} from 'react-native';

export default function OrderDetails({ route }) {
  const { order } = route.params;
  const [status, setStatus] = useState(order.status);

  const updateStatus = async (newStatus) => {
    try {
      const response = await fetch(
        `${API_URL}/api/restaurant/order/${order.orderID}/status`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus })
        }
      );

      if (!response.ok) throw new Error('Failed to update order status');

      setStatus(newStatus);
      Alert.alert('Success', 'Order status updated');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Order Details</Text>

      <View style={styles.orderInfo}>
        <Text style={styles.orderID}>Order #{order.orderID}</Text>
        <Text style={styles.orderDate}>
          {new Date(order.orderDate).toLocaleString()}
        </Text>
      </View>

      <View style={styles.statusContainer}>
        <Text style={styles.label}>Status:</Text>
        <Text style={[styles.status, styles[status]]}>{status}</Text>
      </View>

      <Text style={styles.sectionTitle}>Items</Text>
      {order.dishes.map((dish, index) => (
        <View key={index} style={styles.dishItem}>
          <Text style={styles.dishName}>{dish.name}</Text>
          <View style={styles.dishDetails}>
            <Text style={styles.quantity}>x{dish.quantity}</Text>
            <Text style={styles.price}>${dish.price.toFixed(2)}</Text>
          </View>
        </View>
      ))}

      <View style={styles.totals}>
        <Text style={styles.totalLabel}>Subtotal:</Text>
        <Text style={styles.totalAmount}>${order.subtotal.toFixed(2)}</Text>
        {order.discount > 0 && (
          <>
            <Text style={styles.totalLabel}>Discount:</Text>
            <Text style={styles.totalAmount}>-${order.discount.toFixed(2)}</Text>
          </>
        )}
        <Text style={styles.totalLabel}>Total:</Text>
        <Text style={styles.totalAmount}>${order.total.toFixed(2)}</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, status === 'pending' && styles.actionButtonActive]}
          onPress={() => updateStatus('confirmed')}
          disabled={status !== 'pending'}
        >
          <Text style={styles.actionButtonText}>Confirm Order</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, status === 'confirmed' && styles.actionButtonActive]}
          onPress={() => updateStatus('completed')}
          disabled={status !== 'confirmed'}
        >
          <Text style={styles.actionButtonText}>Mark as Completed</Text>
        </TouchableOpacity>

        {status === 'pending' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.cancelButton]}
            onPress={() => updateStatus('cancelled')}
          >
            <Text style={styles.actionButtonText}>Cancel Order</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  // ... Add all necessary styles for the components ...
});