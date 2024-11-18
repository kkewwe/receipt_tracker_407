import { StyleSheet, Text, View, TouchableOpacity, Animated, useAnimatedValue, Image, Button, SafeAreaView} from 'react-native';
import AppLogo from "../../assets/bill.png"

export default function HomeScreen({ navigation }) {
  const fadeAnim = useAnimatedValue(0);

  const fadeIn = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 5000,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={styles.appTitle}
      >
        <Image style={styles.logo} source={AppLogo} />
        <Text style={styles.title}>Centsible Scans</Text>
      </Animated.View>
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.button}
        onPress={() => navigation.navigate('Register')}
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
  appTitle:{
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30
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
  }
});