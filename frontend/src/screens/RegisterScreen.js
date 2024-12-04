import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';

const API_URL = 'http://10.140.149.173:5000'; 

export default function RegisterScreen({ navigation, route }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { isUserSide } = route.params;

  const handleRegister = async () => {
    console.log('Registration started');
    if (!email || !password || !confirmPassword || !username) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
  
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
  
    setLoading(true);
    try {
      const endpoint = isUserSide ? '/api/auth/register' : '/api/auth/register';
      console.log('Making request to:', API_URL + endpoint); 
      console.log('With body:', {  
        email,
        password,
        name: username,
        userType: isUserSide ? 'client' : 'restaurant',
        ...(isUserSide ? {} : { address: 'Default Address' }),
      });
      
      const response = await fetch(API_URL + endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          name: username,
          userType: isUserSide ? 'client' : 'restaurant',
          ...(isUserSide ? {} : { address: 'Default Address' }),
        }),
      });
  
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);  
        
      if (response.ok) {
        alert('Registration successful');
        navigation.navigate('Login', { isUserSide });
      } else {
        alert(data.error || 'Registration failed');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
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
        placeholder={isUserSide ? "Enter User Name" : "Enter Restaurant Name"}
        value={username}
        onChangeText={setUsername}
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

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login', { isUserSide })}>
        <Text style={styles.loginText}>
          {isUserSide ? 'Already a user? Log in as User' : 'Already a user? Log in as Restaurant'}
        </Text>
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
    marginBottom: 40,
  },
  label: {
    width: '100%',
    maxWidth: 300,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  input: {
    width: '100%',
    maxWidth: 300,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 15,
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
  loginText: {
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
