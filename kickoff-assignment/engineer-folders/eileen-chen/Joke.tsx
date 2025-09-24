import * as React from "react";
import { StyleSheet, View, Text } from "react-native";
import { Joke } from "./client";

interface JokeCardProps {
    data: Joke;
}

const JokeCard = ({ data } : JokeCardProps) => {
    return (
        <View style={styles.card}>
            <Text style={styles.text}>{data.joke}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#FFFFFF",
        padding: 18,
        marginVertical: 8,
        marginHorizontal: 16,
        borderRadius: 12,
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: "#E0E0E0",
    },
    text: {
        fontSize: 18,
        lineHeight: 22,
        textAlign: "center",
        color: "#000000",
        fontFamily: 'System'
    },
});

export default JokeCard;