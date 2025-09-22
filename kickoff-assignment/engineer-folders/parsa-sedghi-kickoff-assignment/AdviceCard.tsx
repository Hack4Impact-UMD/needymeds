import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface AdviceCardProps {
  id: number;
  advice: string;
}

const AdviceCard: React.FC<AdviceCardProps> = ({ id, advice }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.adviceText}>"{advice}"</Text>
      <Text style={styles.idText}>Advice #{id}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#f0f8ff",
    borderRadius: 12,
    padding: 16,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    alignItems: "center",
  },
  adviceText: {
    fontSize: 18,
    fontStyle: "italic",
    color: "#333",
    textAlign: "center",
    marginBottom: 8,
  },
  idText: {
    fontSize: 14,
    color: "#777",
  },
});

export default AdviceCard;
