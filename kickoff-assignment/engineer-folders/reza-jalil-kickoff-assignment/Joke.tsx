import React from 'react';
import { StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';

interface JokeProps {
  joke: string;
  cardStyle?: ViewStyle;
  textStyle?: TextStyle;
}

export default function JokeCard({ joke, cardStyle, textStyle }: JokeProps) {
  return (
    <View style={[styles.card, cardStyle]}>
      <Text style={[styles.text, textStyle]}>{joke}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 30,
    marginHorizontal: 50,
    padding: 15,
    borderRadius: 15,
    

  },
  text: {
    fontSize: 25,
    lineHeight: 25,
    color: 'black',
    textAlign: 'center',
  },
});
