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

  // Updated handleSubmit function in AddDish.js
const handleSubmit = async () => {
  try {
    if (!dishData.name || !dishData.cost) {
      Alert.alert('Error', 'Name and price are required');
      return;
    }

    const requestData = {
      ...dishData,
      cost: parseFloat(dishData.cost),
      restaurantID
    };

    console.log('Sending request with data:', requestData);

    const response = await fetch(`${API_URL}/api/restaurant/dishes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'  // Add this to ensure JSON response
      },
      body: JSON.stringify(requestData),
    });

    // First try to parse the response as JSON
    let data;
    try {
      const textResponse = await response.text();
      try {
        data = JSON.parse(textResponse);
      } catch (e) {
        console.error('Server response:', textResponse);
        throw new Error('Invalid server response');
      }
    } catch (e) {
      throw new Error('Failed to parse server response');
    }

    if (!response.ok) {
      throw new Error(data.message || 'Failed to add dish');
    }

    Alert.alert('Success', 'Dish added successfully', [
      {
        text: 'OK',
        onPress: () => {
          navigation.goBack();
        }
      }
    ]);
  } catch (error) {
    console.error('Error adding dish:', error);
    Alert.alert(
      'Error',
      error.message || 'Failed to add dish. Please try again.'
    );
  }
};

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ alignItems: 'center' }}
    keyboardShouldPersistTaps="handled">
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>

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

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#f5f5f5',
      padding: 20,
    },
    backButton: {
      position: 'absolute',
      top: 50,
      left: 20,
      padding: 10,
    },
    backButtonText: {
      fontSize: 16,
      color: '#000',
      position: 'absolute',
      top: 50,
      left: 20,
      padding: 10,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      marginBottom: 40,
      marginTop: 60,
    },
    label: {
      fontSize: 16,
      marginBottom: 8,
      color: '#333',
      fontWeight: '500',
    },
    input: {
      width: '100%',
      maxWidth: 300,
      padding: 10,
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 5,
      marginBottom: 15,
      backgroundColor: 'white',
      alignSelf: 'center',
      // Shadow for iOS
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      // Shadow for Android
      elevation: 2,
    },
    textArea: {
      height: 80,
      textAlignVertical: 'top',
    },
    submitButton: {
      backgroundColor: '#000',
      padding: 15,
      borderRadius: 5,
      width: '100%',
      maxWidth: 300,
      alignItems: 'center',
      alignSelf: 'center',
      marginTop: 20,
      marginBottom: 30,
      // Shadow for iOS
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      // Shadow for Android
      elevation: 3,
    },
    submitButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    }
  });