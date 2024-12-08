// EditDish.js
import { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  Switch 
} from 'react-native';

export default function EditDish({ navigation, route }) {
  const { dish, restaurantID } = route.params;
  const [dishData, setDishData] = useState({
    name: dish.name,
    description: dish.description || '',
    category: dish.category || '',
    cost: dish.cost.toString(),
    isAvailable: dish.isAvailable
  });

  const handleUpdate = async () => {
    try {
      const response = await fetch(`${API_URL}/api/restaurant/dishes/${dish.dishID}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...dishData,
          cost: parseFloat(dishData.cost),
          restaurantID
        }),
      });

      if (!response.ok) throw new Error('Failed to update dish');

      Alert.alert('Success', 'Dish updated successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Edit Dish</Text>

      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        value={dishData.name}
        onChangeText={(text) => setDishData({ ...dishData, name: text })}
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={dishData.description}
        onChangeText={(text) => setDishData({ ...dishData, description: text })}
        multiline
        numberOfLines={4}
      />

      <Text style={styles.label}>Category</Text>
      <TextInput
        style={styles.input}
        value={dishData.category}
        onChangeText={(text) => setDishData({ ...dishData, category: text })}
      />

      <Text style={styles.label}>Price ($)</Text>
      <TextInput
        style={styles.input}
        value={dishData.cost}
        onChangeText={(text) => setDishData({ ...dishData, cost: text })}
        keyboardType="decimal-pad"
      />

      <View style={styles.switchContainer}>
        <Text style={styles.label}>Available</Text>
        <Switch
          value={dishData.isAvailable}
          onValueChange={(value) => setDishData({ ...dishData, isAvailable: value })}
        />
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={handleUpdate}>
        <Text style={styles.submitButtonText}>Update Dish</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.deleteButton} 
        onPress={() => {
          Alert.alert(
            'Delete Dish',
            'Are you sure you want to delete this dish?',
            [
              { text: 'Cancel', style: 'cancel' },
              { 
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                  try {
                    const response = await fetch(
                      `${API_URL}/api/restaurant/dishes/${dish.dishID}`,
                      { method: 'DELETE' }
                    );
                    if (!response.ok) throw new Error('Failed to delete dish');
                    navigation.goBack();
                  } catch (error) {
                    Alert.alert('Error', error.message);
                  }
                }
              }
            ]
          );
        }}
      >
        <Text style={styles.deleteButtonText}>Delete Dish</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}