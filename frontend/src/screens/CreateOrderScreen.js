// src/screens/CreateOrderScreen.js

import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList } from 'react-native';

export default function CreateOrderScreen() {
  const [selectedDishes, setSelectedDishes] = useState([]);

  const dishes = [
    { id: '1', name: 'Spaghetti Bolognese' },
    { id: '2', name: 'Margherita Pizza' },
    { id: '3', name: 'Caesar Salad' },
    // ... other dishes
  ];

  const toggleDishSelection = (dishId) => {
    if (selectedDishes.includes(dishId)) {
      setSelectedDishes(selectedDishes.filter((id) => id !== dishId));
    } else {
      setSelectedDishes([...selectedDishes, dishId]);
    }
  };

  const renderDish = ({ item }) => (
    <TouchableOpacity
      onPress={() => toggleDishSelection(item.id)}
      style={[
        styles.dishButton,
        selectedDishes.includes(item.id) && styles.dishButtonSelected,
      ]}
    >
      <Text
        style={[
          styles.dishButtonText,
          selectedDishes.includes(item.id) && styles.dishButtonTextSelected,
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Order</Text>
      <Text style={styles.subtitle}>Select Dishes</Text>

      <FlatList
        data={dishes}
        renderItem={renderDish}
        keyExtractor={(item) => item.id}
        extraData={selectedDishes}
      />

      <TouchableOpacity style={styles.createQRButton}>
        <Text style={styles.createQRButtonText}>Create QR Code</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  // Styles for CreateOrderScreen
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 15,
  },
  dishButton: {
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    marginBottom: 10,
  },
  dishButtonSelected: {
    backgroundColor: '#000',
  },
  dishButtonText: {
    fontSize: 16,
    color: '#000',
  },
  dishButtonTextSelected: {
    color: '#fff',
  },
  createQRButton: {
    marginTop: 20,
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  createQRButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
