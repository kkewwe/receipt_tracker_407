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

const API_URL = 'https://receipt-tracker-407.onrender.com';

export default function RegisterScreen({ navigation, route }) {
  const [username, setUsername] = useState('');
  const [restaurantName, setRestaurantName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [categories, setCategories] = useState('');
  const [loading, setLoading] = useState(false);

  const { isUserSide } = route.params;

  const handleRegister = async () => {
    if (
      !username ||
      !password ||
      !confirmPassword ||
      !email ||
      (!isUserSide && (!address || !restaurantName))
    ) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          name: isUserSide ? username : restaurantName,
          ...(isUserSide ? {} : { username }),
          userType: isUserSide ? 'client' : 'restaurant',
          ...(isUserSide
            ? {}
            : {
                address,
                description,
                categories: categories.split(',').map((cat) => cat.trim()),
                businessHours: {
                  monday: { open: '9:00', close: '17:00' },
                  tuesday: { open: '9:00', close: '17:00' },
                  wednesday: { open: '9:00', close: '17:00' },
                  thursday: { open: '9:00', close: '17:00' },
                  friday: { open: '9:00', close: '17:00' },
                  saturday: { open: '10:00', close: '15:00' },
                  sunday: { open: 'closed', close: 'closed' },
                },
              }),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', 'Registration successful', [
          { text: 'OK', onPress: () => navigation.navigate('Login', { isUserSide }) },
        ]);
      } else {
        Alert.alert('Error', data.error || data.message || 'Registration failed');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>{isUserSide ? 'User Sign Up' : 'Restaurant Sign Up'}</Text>

        <Text style={styles.label}>Username:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />

        {!isUserSide && (
          <>
            <Text style={styles.label}>Restaurant Name:</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Restaurant Name"
              value={restaurantName}
              onChangeText={setRestaurantName}
            />
          </>
        )}

        <Text style={styles.label}>Password:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
        />

        <Text style={styles.label}>Confirm Password:</Text>
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          autoCapitalize="none"
        />

        <Text style={styles.label}>Email:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {!isUserSide && (
          <>
            <Text style={styles.label}>Address:</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Address"
              value={address}
              onChangeText={setAddress}
            />

            <Text style={styles.label}>Description:</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Enter Restaurant Description"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
            />

            <Text style={styles.label}>Categories:</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Categories (comma-separated)"
              value={categories}
              onChangeText={setCategories}
            />
          </>
        )}

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Signing Up...' : 'Sign Up'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('Login', { isUserSide })}
          disabled={loading}
        >
          <Text style={styles.loginText}>Already registered? Log in</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  backButton: {
    marginBottom: 20,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007BFF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 20,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  textArea: {
    height: 80,
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  loginText: {
    fontSize: 16,
    color: '#007BFF',
    textAlign: 'center',
  },
});

