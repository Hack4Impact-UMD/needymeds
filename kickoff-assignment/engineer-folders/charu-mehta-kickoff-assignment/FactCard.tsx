import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

interface FactCardProps {
  fact: string;
}

export default function FactCard({ fact }: FactCardProps) {
  return (
    <View style={styles.card}>
      <Image
        source={{ uri: 'https://cdn2.thecatapi.com/images/MTY3ODIyMQ.jpg' }}
        style={styles.image}
      />
      <Text style={styles.title}>🐱 Random Cat Fact</Text>
      <Text style={styles.fact}>{fact}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 20,
    margin: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  fact: {
    fontSize: 16,
    lineHeight: 22,
  },
  image: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    marginBottom: 15,
  },
});