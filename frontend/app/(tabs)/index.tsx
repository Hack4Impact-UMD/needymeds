import { Text, ScrollView } from 'react-native';
import { Stack } from 'expo-router';

export default function HomeScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Home' }} />
      <ScrollView>
        <Text>Welcome!</Text>
      </ScrollView>
    </>
  );
}
