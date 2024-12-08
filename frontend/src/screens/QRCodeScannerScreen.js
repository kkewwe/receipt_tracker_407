// QRCodeScannerScreen.js
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

export default function QRCodeScannerScreen({ navigation }) {
  const [hasPermission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    (async () => {
      if (!hasPermission?.granted) {
        await requestPermission();
      }
    })();
  }, []);

  const handleBarCodeScanned = async ({ data }) => {
    try {
      setScanned(true);
      const orderData = JSON.parse(data);
      
      // Handle scanned QR code data for client
      Alert.alert(
        'QR Code Scanned',
        'Order details scanned successfully',
        [
          { 
            text: 'OK', 
            onPress: () => setScanned(false) 
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Invalid QR code');
      setScanned(false);
    }
  };

  if (!hasPermission?.granted) {
    return (
      <View style={styles.container}>
        <Text>Camera permission is required</Text>
        <Button title="Grant Permission" onPress={requestPermission} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      />
      {scanned && (
        <Button title="Scan Again" onPress={() => setScanned(false)} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});