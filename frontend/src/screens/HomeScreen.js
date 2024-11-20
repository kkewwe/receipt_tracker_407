import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import AppLogo from "../../assets/bill.png";

export default function HomeScreen({ navigation }) {
  const [isUserSide, setIsUserSide] = useState(true); // Toggle state

  const toggleSide = () => setIsUserSide(previousState => !previousState);

  return (
    <View style={styles.container}>
      <View style={styles.appTitle}>
        <Image style={styles.logo} source={AppLogo} />
        <Text style={styles.title}>Centsible Scans</Text>
      </View>
      
      {/* Custom Toggle */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            isUserSide && styles.activeToggleButton,
          ]}
          onPress={() => !isUserSide && toggleSide()}
        >
          <Text
            style={[
              styles.toggleText,
              isUserSide && styles.activeToggleText,
            ]}
          >
            User Side
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            !isUserSide && styles.activeToggleButton,
          ]}
          onPress={() => isUserSide && toggleSide()}
        >
          <Text
            style={[
              styles.toggleText,
              !isUserSide && styles.activeToggleText,
            ]}
          >
            Restaurant Side
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={styles.button} 
        onPress={() => navigation.navigate('Login', { isUserSide })}
      >
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.button}
        onPress={() => navigation.navigate('Register', { isUserSide })}
      >
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  appTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  toggleButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 5,
    borderRadius: 5,
    backgroundColor: '#f5f5f5',
  },
  activeToggleButton: {
    backgroundColor: '#000',
  },
  toggleText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  activeToggleText: {
    color: '#fff',
  },
  button: {
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 5,
    width: '100%',
    maxWidth: 300,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  logo: {
    width: 70,
    height: 70,
  },
});
