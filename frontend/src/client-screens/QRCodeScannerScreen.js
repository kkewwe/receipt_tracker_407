import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, Alert, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const API_URL = 'https://receipt-tracker-407.onrender.com';

// Keep the isProcessing flag outside the component to prevent multiple submissions
let isProcessing = false;

export default function QRCodeScannerScreen({ navigation }) {
  const [hasPermission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);

  // Reset scanned state when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      setScanned(false);
      setLoading(false);
      isProcessing = false;  // Reset the processing flag when screen comes into focus
      return () => {
        setScanned(false);
        setLoading(false);
      };
    }, [])
  );

  const handleBarCodeScanned = async ({ data }) => {
    if (isProcessing || scanned) {
      console.log('Processing or already scanned, ignoring...');
      return;
    }

    isProcessing = true;
    setScanned(true);
    setLoading(true);

    try {
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
        navigation.navigate('ScanDetails', { 
          scanId: result.scanId,
          orderData: orderData
        });
      } else {
        throw new Error('Failed to save scan');
      }
    } catch (error) {
      Alert.alert('Error', 'Invalid QR code or failed to save scan', [
        { text: 'OK', onPress: () => {
          setScanned(false);
          isProcessing = false;
        }}
      ]);
    } finally {
      setLoading(false);
      // i removed reset isProcessing here :Pr
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
  }
});