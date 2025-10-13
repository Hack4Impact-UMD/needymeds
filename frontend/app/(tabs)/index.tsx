import { Stack } from 'expo-router';
import { ScrollView, Text } from 'react-native';

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
