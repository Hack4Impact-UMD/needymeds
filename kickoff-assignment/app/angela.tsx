import { View, Text, StyleSheet, Linking } from "react-native";
import { useState, useEffect } from "react";

// JokeAPI's interface and get function
import { getJoke } from "../engineer-folders/angela-ngo-kickoff-assignment/client"
import Joke from "../engineer-folders/angela-ngo-kickoff-assignment/client";

import FactCard from "../engineer-folders/angela-ngo-kickoff-assignment/FactCard";

function AngelaPage() {
    const temp: Joke = { joke: "" };
    const [joke, setJoke] = useState(temp);

    useEffect(() => {
        async function fetchJoke() {
            const fetchedJoke = await getJoke();
            setJoke(fetchedJoke);
        }
        fetchJoke();
    }, []);

    return (
        <View>
            <Text style={styles.title}>✨ Generated joke... ✨</Text>
            <FactCard joke={joke.joke} />
            <Text style={styles.footer} onPress={() => Linking.openURL("https://sv443.net/jokeapi/v2/")}>Check out the API here</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    title: {
        textAlign: 'center',
        margin: 40,
        fontSize: 50,
        fontWeight: 'bold',
        color: '#63103c'
    },
    footer: {
        textAlign: 'center',
        margin: 10,
        textDecorationLine: 'underline',
        color: '#3350ab'
    }
});

export default AngelaPage;