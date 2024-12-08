// CreateOrderScreen.js
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, Alert, Image } from 'react-native';

const API_URL = 'https://receipt-tracker-407.onrender.com';

export default function CreateOrderScreen({ route }) {
  const [dishes, setDishes] = useState([]);
  const [selectedDishes, setSelectedDishes] = useState([]);
  const [qrCode, setQrCode] = useState(null);
  
  const { restaurantID } = route.params;

  useEffect(() => {
    fetchDishes();
  }, []);

  const fetchDishes = async () => {
    try {
      const response = await fetch(`${API_URL}/api/restaurant/menu/${restaurantID}`);
      const data = await response.json();
      setDishes(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch menu items');
    }
  };

  const toggleDishSelection = (dish) => {
    const index = selectedDishes.findIndex(d => d.dishID === dish.dishID);
    if (index >= 0) {
      setSelectedDishes(selectedDishes.filter(d => d.dishID !== dish.dishID));
    } else {
      setSelectedDishes([...selectedDishes, { ...dish, quantity: 1 }]);
    }
  };

  const updateQuantity = (dishID, increment) => {
    setSelectedDishes(selectedDishes.map(dish => 
      dish.dishID === dishID 
        ? { ...dish, quantity: Math.max(1, dish.quantity + increment) }
        : dish
    ));
  };

  const handleCreateOrder = async () => {
    if (selectedDishes.length === 0) {
      Alert.alert('Error', 'Please select at least one dish.');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/restaurant/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantID,
          dishes: selectedDishes.map(dish => ({
            dishID: dish.dishID,
            quantity: dish.quantity
          }))
        }),
      });

      if (!response.ok) throw new Error('Failed to create order');

      const data = await response.json();
      setQrCode(data.qrCode);
      Alert.alert('Success', 'Order created and QR Code generated!');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const renderDish = ({ item }) => {
    const isSelected = selectedDishes.some(d => d.dishID === item.dishID);
    const selectedDish = selectedDishes.find(d => d.dishID === item.dishID);

    return (
      <View style={styles.dishItem}>
        <TouchableOpacity
          onPress={() => toggleDishSelection(item)}
          style={[styles.dishButton, isSelected && styles.dishButtonSelected]}
        >
          <Text style={styles.dishName}>{item.name}</Text>
          <Text style={styles.dishPrice}>${item.cost}</Text>
          <Text style={styles.dishCategory}>{item.category}</Text>
        </TouchableOpacity>

        {isSelected && (
          <View style={styles.quantityContainer}>
            <TouchableOpacity onPress={() => updateQuantity(item.dishID, -1)}>
              <Text style={styles.quantityButton}>-</Text>
            </TouchableOpacity>
            <Text style={styles.quantity}>{selectedDish.quantity}</Text>
            <TouchableOpacity onPress={() => updateQuantity(item.dishID, 1)}>
              <Text style={styles.quantityButton}>+</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Order</Text>
      <FlatList
        data={dishes}
        renderItem={renderDish}
        keyExtractor={item => item.dishID}
        style={styles.list}
      />

      <TouchableOpacity style={styles.createOrderButton} onPress={handleCreateOrder}>
        <Text style={styles.buttonText}>Create Order & Generate QR</Text>
      </TouchableOpacity>

      {qrCode && (
        <View style={styles.qrContainer}>
          <Image source={{ uri: qrCode }} style={styles.qrCode} />
        </View>
      )}
    </View>
  );
}