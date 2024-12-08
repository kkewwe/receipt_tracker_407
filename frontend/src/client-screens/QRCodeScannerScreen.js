import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, Alert, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://receipt-tracker-407.onrender.com';

export default function QRCodeScannerScreen({ navigation }) {
  const [hasPermission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastScannedCode, setLastScannedCode] = useState(null);

  const handleBarCodeScanned = async ({ data }) => {
    try {
      // Prevent multiple scans of the same code
      if (scanned || data === lastScannedCode) {
        return;
      }

      setScanned(true);
      setLastScannedCode(data);
      setLoading(true);

      const orderData = JSON.parse(data);
      const userId = await AsyncStorage.getItem('userId');

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
        // Navigate away from scanner immediately to prevent more scans
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
      // Keep scanned true until component unmounts or user explicitly resets
      setTimeout(() => {
        setScanned(false);
        setLastScannedCode(null);
      }, 3000);
    }
  };

  // Reset states when component unmounts
  useEffect(() => {
    return () => {
      setScanned(false);
      setLastScannedCode(null);
      setLoading(false);
    };
  }, []);

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