import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Import screens by folder structure
// Client Screens
import ClientDashboard from './src/client-screens/ClientDashboard';
import QRCodeScannerScreen from './src/client-screens/QRCodeScannerScreen';
import ScanDetailsScreen from './src/client-screens/ScanDetailsScreen';
import ScanHistoryScreen from './src/client-screens/ScanHistoryScreen';

// Restaurant Screens
import RestaurantDashboard from './src/restaurant-screens/RestaurantDashboard';
import CreateOrderScreen from './src/restaurant-screens/CreateOrderScreen';
import AddDish from './src/restaurant-screens/AddDish';
import EditDish from './src/restaurant-screens/EditDish';
import OrderDetails from './src/restaurant-screens/OrderDetails';

// Common Screens
import HomeScreen from './src/screens/HomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function ClientTabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'QR Scan') {
            iconName = focused ? 'qr-code' : 'qr-code-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'black',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Dashboard" component={ClientDashboard} />
      <Tab.Screen name="QR Scan" component={QRCodeScannerScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

function RestaurantTabNavigator({ route }) {
  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Create Order') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'black',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={RestaurantDashboard}
        initialParams={{ restaurantID: route?.params?.restaurantID }}
      />
      <Tab.Screen 
        name="Create Order" 
        component={CreateOrderScreen}
        initialParams={{ restaurantID: route?.params?.restaurantID }}
      />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

function MainApp({ route }) {
  if (!route?.params) {
    return null;
  }
  const { isUserSide, restaurantID } = route.params;
  return isUserSide ? (
    <ClientTabNavigator />
  ) : (
    <RestaurantTabNavigator route={{ params: { restaurantID } }} />
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* Auth Screens */}
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        
        {/* Main App */}
        <Stack.Screen name="MainApp" component={MainApp} />
        
        {/* Restaurant Screens */}
        <Stack.Screen name="AddDish" component={AddDish} />
        <Stack.Screen name="EditDish" component={EditDish} />
        <Stack.Screen name="OrderDetails" component={OrderDetails} />
        
        {/* Client Screens */}
        <Stack.Screen 
          name="ScanDetails" 
          component={ScanDetailsScreen} 
          options={{
            headerShown: true,
            headerTitle: 'Order Details',
            headerBackTitle: 'Back'
          }}
        />
        <Stack.Screen 
          name="ScanHistory" 
          component={ScanHistoryScreen}
          options={{
            headerShown: true,
            headerTitle: 'Order History',
            headerBackTitle: 'Back'
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}