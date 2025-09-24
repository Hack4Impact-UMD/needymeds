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
        backgroundColor: "#25344F",
        padding: 16,
        marginVertical: 8,
        marginHorizontal: 16,
        borderRadius: 12,
        justifyContent: 'center'
    },
    text: {
        fontSize: 20,
        lineHeight: 22,
        textAlign: "center",
        color: "#D5BB93",
        fontFamily: 'System'
    },
});

export default JokeCard;