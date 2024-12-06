// src/screens/RestaurantDashboard.js

import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function RestaurantDashboard() {
  // Sample data
  const stats = {
    totalOrders: 120,
    mostPopularDish: 'Spaghetti Bolognese',
  };

  const dishes = [
    { id: 1, name: 'Spaghetti Bolognese', orders: 50 },
    { id: 2, name: 'Margherita Pizza', orders: 30 },
    { id: 3, name: 'Caesar Salad', orders: 40 },
  ];

  const renderDish = (dish) => (
    <View key={dish.id} style={styles.dishCard}>
      <View style={styles.dishInfo}>
        <Text style={styles.dishName}>{dish.name}</Text>
        <Text style={styles.dishOrders}>{dish.orders} orders</Text>
      </View>
      <TouchableOpacity style={styles.editButton}>
        <MaterialCommunityIcons name="pencil" size={20} color="#000" />
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.welcomeText}>Welcome back!</Text>

      {/* Main Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <MaterialCommunityIcons name="receipt" size={24} color="#000" />
          <Text style={styles.statNumber}>{stats.totalOrders}</Text>
          <Text style={styles.statLabel}>Total Orders</Text>
        </View>
        <View style={styles.statCard}>
          <MaterialCommunityIcons name="star" size={24} color="#000" />
          <Text style={styles.statNumber}>{stats.mostPopularDish}</Text>
          <Text style={styles.statLabel}>Most Popular Dish</Text>
        </View>
      </View>

      {/* Dishes */}
      <View style={styles.dishesSection}>
        <Text style={styles.sectionTitle}>Current Dishes</Text>
        {dishes.map(renderDish)}
        <TouchableOpacity style={styles.addButton}>
          <MaterialCommunityIcons name="plus-circle" size={24} color="white" />
          <Text style={styles.addButtonText}>Add New Dish</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // Similar styles as in ClientDashboard
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
});