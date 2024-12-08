import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, Alert, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://receipt-tracker-407.onrender.com';

export default function QRCodeScannerScreen({ navigation }) {
  const [hasPermission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recentScans] = useState(new Set()); // Track recent scans

  const handleBarCodeScanned = async ({ data }) => {
    try {
      if (scanned) return; // Prevent multiple scans
      setScanned(true);
      setLoading(true);

      const orderData = JSON.parse(data);
      
      // Check if this order was recently scanned
      if (recentScans.has(orderData.orderID)) {
        Alert.alert('Already Scanned', 'This order has already been scanned.');
        setLoading(false);
        setScanned(false);
        return;
      }

      const userId = await AsyncStorage.getItem('userId');
      
      // Save scan to history
      const response = await fetch(`${API_URL}/api/client/scans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: userId,
          orderId: orderData.orderID,
          restaurantId: orderData.restaurantID,
          restaurantName: orderData.restaurantName,
          total: orderData.total,
          items: orderData.dishes,
          date: new Date()
        })
      });

      if (response.ok) {
        const result = await response.json();
        // Add to recent scans
        recentScans.add(orderData.orderID);
        navigation.navigate('ScanDetails', { 
          scanId: result.scanId,
          orderData: orderData
        });
      } else {
        throw new Error('Failed to save scan');
      }
    } catch (error) {
      Alert.alert('Error', 'Invalid QR code or failed to save scan');
    } finally {
      setLoading(false);
      // Don't reset scanned state immediately to prevent double scans
      setTimeout(() => setScanned(false), 1000);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      />
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Processing scan...</Text>
        </View>
      )}
      {scanned && !loading && (
        <View style={styles.buttonContainer}>
          <Button title="Scan Again" onPress={() => setScanned(false)} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
});