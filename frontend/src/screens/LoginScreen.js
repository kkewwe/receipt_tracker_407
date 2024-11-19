import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = () => {
  
    console.log('Email:', email);
    console.log('Password:', password);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>User Login</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
      />
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={handleSignIn}
      >
        <Text style={styles.buttonText}>Sign In</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.registerText}>Not registered? Register</Text>
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
  registerText: {
    color: '#000',
    marginTop: 20,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});