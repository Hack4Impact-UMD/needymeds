import * as React from 'react';
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { UselessFact } from './client';

interface FactCardProps {
  fact: UselessFact;
}

export default function FactCard({ fact }: FactCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>💡 Useless Fact</Text>
      <Text style={styles.text}>{fact.text}</Text>
      <Text style={styles.source}>Source: {fact.source}</Text>
      <TouchableOpacity onPress={() => Linking.openURL(fact.source_url)}>
        <Text style={styles.link}>Read More →</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
    marginBottom: 6,
  },
  text: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  source: {
    fontSize: 13,
    color: '#888',
    marginBottom: 4,
  },
  link: {
    fontSize: 14,
    color: '#007AFF',
  },
});
