// AddDish.js
import { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Alert 
} from 'react-native';

const API_URL = 'https://receipt-tracker-407.onrender.com';

export default function AddDish({ navigation, route }) {
  const { restaurantID } = route.params;
  const [dishData, setDishData] = useState({
    name: '',
    description: '',
    category: '',
    cost: '',
    isAvailable: true
  });

  const handleSubmit = async () => {
    try {
      if (!dishData.name || !dishData.cost) {
        Alert.alert('Error', 'Name and price are required');
        return;
      }

      const response = await fetch(`${API_URL}/api/restaurant/dishes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...dishData,
          cost: parseFloat(dishData.cost),
          restaurantID
        }),
      });

      if (!response.ok) throw new Error('Failed to add dish');

      Alert.alert('Success', 'Dish added successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Add New Dish</Text>

      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        value={dishData.name}
        onChangeText={(text) => setDishData({ ...dishData, name: text })}
        placeholder="Enter dish name"
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={dishData.description}
        onChangeText={(text) => setDishData({ ...dishData, description: text })}
        placeholder="Enter dish description"
        multiline
        numberOfLines={4}
      />

      <Text style={styles.label}>Category</Text>
      <TextInput
        style={styles.input}
        value={dishData.category}
        onChangeText={(text) => setDishData({ ...dishData, category: text })}
        placeholder="Enter dish category"
      />

      <Text style={styles.label}>Price ($)</Text>
      <TextInput
        style={styles.input}
        value={dishData.cost}
        onChangeText={(text) => setDishData({ ...dishData, cost: text })}
        placeholder="Enter price"
        keyboardType="decimal-pad"
      />

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Add Dish</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}