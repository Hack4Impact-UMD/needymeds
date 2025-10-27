// import { Text, ScrollView } from 'react-native';
// import { Stack } from 'expo-router';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeScreen from './welcome';
import SearchScreen from './search';

const Stack = createNativeStackNavigator();

export default function HomeScreen() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Join" component={WelcomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Search" component={SearchScreen} options={{ title: 'Search Page' }} />
    </Stack.Navigator>
  );
}
