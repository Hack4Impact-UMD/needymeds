// import { Text, ScrollView } from 'react-native';
// import { Stack } from 'expo-router';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeScreen from './welcome';
import SearchScreen from './search';

const Stack = createNativeStackNavigator();

export default function HomeScreen() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Join" component={WelcomeScreen} />
      <Stack.Screen name="Search" component={SearchScreen} />
    </Stack.Navigator>
  );
}
