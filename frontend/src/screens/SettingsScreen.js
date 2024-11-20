import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

export default function SettingsScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <TouchableOpacity 
        style={styles.settingItem}
        onPress={() => {/* Handle profile edit */}}
      >
        <Text style={styles.settingText}>Edit Profile</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.settingItem}
        onPress={() => {/* Handle notifications */}}
      >
        <Text style={styles.settingText}>Notifications</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.settingItem, styles.logoutButton]}
        onPress={() => navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        })}
      >
        <Text style={[styles.settingText, styles.logoutText]}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  settingItem: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  settingText: {
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: '#ff4444',
    marginTop: 20,
  },
  logoutText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});