import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  FlatList, 
  Alert, 
  Image,
  ActivityIndicator 
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://receipt-tracker-407.onrender.com';

export default function CreateOrderScreen({ navigation }) {
  const [dishes, setDishes] = useState([]);
  const [selectedDishes, setSelectedDishes] = useState([]);
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [restaurantID, setRestaurantID] = useState(null);

  useEffect(() => {
    loadRestaurantID();
  }, []);

  const loadRestaurantID = async () => {
    try {
      const storedID = await AsyncStorage.getItem('restaurantID');
      if (storedID) {
        setRestaurantID(storedID);
        fetchDishes(storedID);
      } else {
        Alert.alert('Error', 'Restaurant ID not found');
      }
    } catch (error) {
      console.error('Error loading restaurantID:', error);
      Alert.alert('Error', 'Failed to load restaurant data');
    }
  };

  const fetchDishes = async (id) => {
    try {
      setLoading(true);
      console.log('Fetching dishes for restaurant:', id);
      
      const response = await fetch(`${API_URL}/api/restaurant/menu/${id}`);
      const responseText = await response.text();
      
      console.log('Raw response:', responseText);
      
      try {
        const data = JSON.parse(responseText);
        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch menu');
        }
        
        console.log('Parsed dishes:', data);
        setDishes(data);
      } catch (parseError) {
        console.error('Error parsing response:', parseError);
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Fetch dishes error:', error);
      Alert.alert('Error', 'Failed to fetch menu items');
    } finally {
      setLoading(false);
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

  // In CreateOrderScreen.js, update the handleCreateOrder function
const handleCreateOrder = async () => {
  if (selectedDishes.length === 0) {
    Alert.alert('Error', 'Please select at least one dish.');
    return;
  }

  try {
    const orderData = {
      restaurantID,
      dishes: selectedDishes.map(dish => ({
        dishID: dish.dishID,
        quantity: dish.quantity
      }))
    };

    console.log('Sending order data:', orderData);

    const response = await fetch(`${API_URL}/api/restaurant/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(orderData),
    });

    const responseText = await response.text();
    console.log('Raw order response:', responseText);

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('Error parsing order response:', e);
      throw new Error('Invalid server response');
    }

    if (!response.ok) {
      throw new Error(data.message || 'Failed to create order');
    }

    setQrCode(data.qrCode);
    Alert.alert(
      'Success', 
      'Order created and QR Code generated!',
      [
        {
          text: 'OK',
          onPress: () => {
            // Optionally reset the form or navigate away
            setSelectedDishes([]);
          }
        }
      ]
    );
  } catch (error) {
    console.error('Order creation error:', error);
    Alert.alert(
      'Error',
      error.message || 'Failed to create order. Please try again.'
    );
  }
};

  const renderDish = ({ item }) => {
    const isSelected = selectedDishes.some(d => d.dishID === item.dishID);
    const selectedDish = selectedDishes.find(d => d.dishID === item.dishID);

    return (
      <View style={styles.dishCard}>
        <TouchableOpacity
          onPress={() => toggleDishSelection(item)}
          style={[styles.dishContent, isSelected && styles.dishSelected]}
        >
          <View style={styles.dishInfo}>
            <Text style={styles.dishName}>{item.name}</Text>
            <Text style={styles.dishPrice}>${item.cost}</Text>
            {item.category && (
              <Text style={styles.dishCategory}>{item.category}</Text>
            )}
          </View>

          {isSelected && (
            <View style={styles.quantityContainer}>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => updateQuantity(item.dishID, -1)}
              >
                <Text style={styles.quantityButtonText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.quantityText}>{selectedDish.quantity}</Text>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => updateQuantity(item.dishID, 1)}
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Order</Text>
      
      {dishes.length === 0 ? (
        <Text style={styles.emptyText}>No menu items available</Text>
      ) : (
        <FlatList
          data={dishes}
          renderItem={renderDish}
          keyExtractor={item => item.dishID}
          contentContainerStyle={styles.listContainer}
        />
      )}

      <TouchableOpacity 
        style={styles.createOrderButton} 
        onPress={handleCreateOrder}
        disabled={selectedDishes.length === 0}
      >
        <Text style={styles.buttonText}>
          Create Order & Generate QR
        </Text>
      </TouchableOpacity>

      {qrCode && (
        <View style={styles.qrContainer}>
          <Image source={{ uri: qrCode }} style={styles.qrCode} />
        </View>
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
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 40,
  },
  listContainer: {
    paddingBottom: 20,
  },
  dishCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 10,
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    // Shadow for Android
    elevation: 2,
  },
  dishContent: {
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dishSelected: {
    backgroundColor: '#f8f9fa',
  },
  dishInfo: {
    flex: 1,
  },
  dishName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  dishPrice: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  dishCategory: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 5,
    padding: 5,
  },
  quantityButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    borderRadius: 15,
  },
  quantityButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 15,
  },
  createOrderButton: {
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  qrContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  qrCode: {
    width: 200,
    height: 200,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 20,
  }
});