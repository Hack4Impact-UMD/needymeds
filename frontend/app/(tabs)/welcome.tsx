import { Text, ScrollView, Button } from 'react-native';

const WelcomeScreen = ({ navigation }: any) => {
  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center' }}
    >
      <Text>Welcome!</Text>
      <Button title="Go to Search" onPress={() => navigation.navigate('Search')} />
    </ScrollView>
  );
};
export default WelcomeScreen;
