import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://receipt-tracker-407.onrender.com';

export default function RestaurantDashboard({ navigation, route }) {
  const [dishes, setDishes] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    monthlyOrders: 0,
    monthlyRevenue: 0
  });
  const [restaurantID, setRestaurantID] = useState(route.params?.restaurantID);

  useEffect(() => {
    const loadRestaurantID = async () => {
      try {
        // If no restaurantID in route params, try to get it from AsyncStorage
        if (!restaurantID) {
          const storedID = await AsyncStorage.getItem('restaurantID');
          if (storedID) {
            setRestaurantID(storedID);
          } else {
            Alert.alert('Error', 'Restaurant ID not found', [
              {
                text: 'OK',
                onPress: () => navigation.replace('Login', { isUserSide: false })
              }
            ]);
          }
        }
      } catch (error) {
        console.error('Error loading restaurantID:', error);
      }
    };

    loadRestaurantID();
  }, []);

  useEffect(() => {
    if (restaurantID) {
      fetchDishes();
      fetchStats();
    }
  }, [restaurantID]);

  const fetchDishes = async () => {
    try {
      const response = await fetch(`${API_URL}/api/restaurant/menu/${restaurantID}`);
      const data = await response.json();
      setDishes(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch menu items');
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_URL}/api/restaurant/${restaurantID}/stats`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch statistics');
    }
  };

  const handleAddDish = () => {
    navigation.navigate('AddDish', { restaurantID });
  };

  const handleEditDish = (dish) => {
    navigation.navigate('EditDish', { dish, restaurantID });
  };

  const handleViewOrders = () => {
    navigation.navigate('OrdersList', { restaurantID });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.welcomeText}>Restaurant Dashboard</Text>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <MaterialCommunityIcons name="receipt" size={24} color="#000" />
          <Text style={styles.statNumber}>{stats.monthlyOrders}</Text>
          <Text style={styles.statLabel}>Monthly Orders</Text>
        </View>
        <View style={styles.statCard}>
          <MaterialCommunityIcons name="cash" size={24} color="#000" />
          <Text style={styles.statNumber}>${stats.monthlyRevenue}</Text>
          <Text style={styles.statLabel}>Monthly Revenue</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.ordersButton} onPress={handleViewOrders}>
        <MaterialCommunityIcons name="clipboard-list" size={24} color="white" />
        <Text style={styles.ordersButtonText}>View Orders</Text>
      </TouchableOpacity>

      <View style={styles.dishesSection}>
        <Text style={styles.sectionTitle}>Menu Items</Text>
        {dishes.map((dish) => (
          <View key={dish.dishID} style={styles.dishCard}>
            <View style={styles.dishInfo}>
              <Text style={styles.dishName}>{dish.name}</Text>
              <Text style={styles.dishPrice}>${dish.cost}</Text>
              <Text style={styles.dishCategory}>{dish.category}</Text>
            </View>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => handleEditDish(dish)}
            >
              <MaterialCommunityIcons name="pencil" size={20} color="#000" />
            </TouchableOpacity>
          </View>
        ))}
        
        <TouchableOpacity style={styles.addButton} onPress={handleAddDish}>
          <MaterialCommunityIcons name="plus-circle" size={24} color="white" />
          <Text style={styles.addButtonText}>Add New Dish</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    width: '48%',
    alignItems: 'center',
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Shadow for Android
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 5,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  dishesSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  dishCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    // Shadow for Android
    elevation: 2,
  },
  dishInfo: {
    flex: 1,
  },
  dishName: {
    fontSize: 16,
    fontWeight: '600',
  },
  dishOrders: {
    color: '#666',
  },
  editButton: {
    marginLeft: 10,
  },
  addButton: {
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  addButtonText: {
    color: 'white',
    marginLeft: 10,
    fontWeight: '600',
  },
  ordersButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  ordersButtonText: {
    color: 'white',
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '600',
  },
  dishPrice: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  dishCategory: {
    fontSize: 12,
    color: '#666',
  },
});