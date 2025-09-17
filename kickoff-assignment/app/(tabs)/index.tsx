import { View, Text } from "react-native";
import { Link } from "expo-router";

export default function HomeScreen() {
  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Welcome to NeedyMeds!</Text>
      <Link href="/">NM Engineer Display</Link>
      <Link href="/NMEngineerDisplay">NM Engineer Display</Link>
      <Link href="/angela">Angela's Page</Link>
      <Link href="/ayaan">Ayaan's Page</Link>
      <Link href="/bhavya">Bhavya's Page</Link>
      <Link href="/dhanya">Dhanya's Page</Link>
      <Link href="/eileen">Eileen's Page</Link>
      <Link href="/parsa">Parsa's Page</Link>
      <Link href="/samarth">Samarth's Page</Link>
    </View>
  );
}