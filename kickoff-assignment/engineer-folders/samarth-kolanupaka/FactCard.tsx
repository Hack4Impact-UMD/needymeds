import React from "react";
import { View, Text, StyleSheet, Linking, TouchableOpacity } from "react-native";
import { Fact } from "./client"

interface FactCardProps {
  fact: Fact;
}

export default function FactCard({ fact }: FactCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.text}>{fact.text}</Text>
      <Text style={styles.source}>Source: {fact.source}</Text>

      <TouchableOpacity onPress={() => Linking.openURL(fact.source_url)}>
        <Text style={styles.link}>Read More</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#f5f5f5",
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3, // Android shadow
  },
  text: {
    fontSize: 16,
    color: "#333",
    marginBottom: 8,
  },
  source: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  link: {
    fontSize: 14,
    color: "#007BFF",
    textDecorationLine: "underline",
  },
});
