import { Button, Text, ScrollView } from 'react-native';
import { router, Stack } from 'expo-router';

export default function HomeScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Home' }} />
      <ScrollView>
        <Text>Index beginning page</Text>
        <Button title="Go to Search" onPress={() => router.navigate('/search')} />
      </ScrollView>
    </>
  );
}

// router.push('/search')
// router.back()
// router.replace('')
