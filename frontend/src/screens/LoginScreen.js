import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://receipt-tracker-407.onrender.com';

export default function LoginScreen({ navigation, route }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { isUserSide } = route.params;

  const handleSignIn = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const requestBody = {
        ...(isUserSide ? { name: username } : { username }),
        password,
        userType: isUserSide ? 'client' : 'restaurant',
      };

      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (response.ok) {
        await AsyncStorage.setItem('userToken', data.token);
        await AsyncStorage.setItem('userId', data.userId);
        await AsyncStorage.setItem('userType', data.userType);
        if (!isUserSide) {
          await AsyncStorage.setItem('restaurantID', data.restaurantID);
        }

        navigation.reset({
          index: 0,
          routes: [
            {
              name: 'MainApp',
              params: { isUserSide, restaurantID: data.restaurantID },
            },
          ],
        });
      } else {
        Alert.alert('Error', data.message || 'Login failed');
      }
    } catch (error) {
      Alert.alert(
        'Error',
        `Connection failed. Please check your internet connection. (${error.message})`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={{ flex: 1, overflow: 'auto' }} contentContainerStyle={styles.container}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>
          {isUserSide ? 'User Login' : 'Restaurant Login'}
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          autoCorrect={false}
          editable={!loading}
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          editable={!loading}
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSignIn}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Signing In...' : 'Sign In'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('Register', { isUserSide })}
          disabled={loading}
        >
          <Text style={styles.registerText}>Not registered? Sign up</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 40,
    marginTop: 60,
  },
  container: {
    alignItems: 'center',
    padding: 20,
    paddingBottom: 100,
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
  buttonDisabled: {
    backgroundColor: '#666',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  registerText: {
    color: '#000',
    marginTop: 20,
    fontSize: 14,
    textDecorationLine: 'underline',
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
  },
});
