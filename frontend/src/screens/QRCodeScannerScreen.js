import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, Button, Alert } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";

export default function QRCodeScannerScreen() {
  const [hasPermission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    (async () => {
      if (!hasPermission?.granted) {
        await requestPermission();
      }
    })();
  }, [hasPermission]);

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    Alert.alert("QR Code Scanned", `Type: ${type}\nData: ${data}`, [
      { text: "OK", onPress: () => setScanned(false) },
    ]);
  };

  if (hasPermission === null || !hasPermission) {
    return (
      <View style={styles.container}>
        <Text>Requesting camera permissions...</Text>
        <Button title="Allow Camera" onPress={requestPermission} />
      </View>
    );
  }

  if (!hasPermission.granted) {
    return (
      <View style={styles.container}>
        <Text>No access to camera</Text>
        <Button
          title="Allow Camera"
          onPress={async () => await requestPermission()}
        />
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
        <Button
          title="Tap to Scan Again"
          onPress={() => setScanned(false)}
          style={styles.scanAgainButton}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scanAgainButton: {
    marginTop: 20,
  },
});
