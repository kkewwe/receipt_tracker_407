import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, Alert, Image } from 'react-native';

const API_URL = 'https://receipt-tracker-407.onrender.com';

export default function CreateOrderScreen() {
  const [selectedDishes, setSelectedDishes] = useState([]);
  const [qrCode, setQrCode] = useState(null);

  const dishes = [
    { id: '1', name: 'Spaghetti Bolognese' },
    { id: '2', name: 'Margherita Pizza' },
    { id: '3', name: 'Caesar Salad' },
  ];

  const toggleDishSelection = (dishId) => {
    if (selectedDishes.includes(dishId)) {
      setSelectedDishes(selectedDishes.filter((id) => id !== dishId));
    } else {
      setSelectedDishes([...selectedDishes, dishId]);
    }
  };

  const handleGenerateQR = async () => {
    if (selectedDishes.length === 0) {
      Alert.alert('Error', 'Please select at least one dish.');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/generate-qr`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dishes: selectedDishes,
          restaurantID: '12345',
        }),
      });

      if (!response.ok) {
        const errorDetails = await response.text();
        console.error('Error details:', errorDetails);
        throw new Error(`Failed to generate QR: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setQrCode(data.qrCode);
      Alert.alert('Success', 'QR Code generated successfully!');
    } catch (error) {
      console.error('Error in handleGenerateQR:', error);
      Alert.alert('Error', error.message || 'Failed to generate QR Code.');
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

      <TouchableOpacity style={styles.createQRButton} onPress={handleGenerateQR}>
        <Text style={styles.createQRButtonText}>Generate QR Code</Text>
      </TouchableOpacity>

      {qrCode && (
        <View style={styles.qrCodeContainer}>
          <Text style={styles.qrCodeText}>Generated QR Code:</Text>
          <Image source={{ uri: qrCode }} style={styles.qrCodeImage} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
  qrCodeContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  qrCodeText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  qrCodeImage: {
    width: 200,
    height: 200,
  },
});
