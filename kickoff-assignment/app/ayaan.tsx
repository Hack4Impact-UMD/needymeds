import { Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import { getJoke, Joke } from "../engineer-folders/ayaan-hussain-kickoff-assignment/client";
import JokeCard from "../engineer-folders/ayaan-hussain-kickoff-assignment/JokeCard";

function AyaanPage() {
    const[jokes, setJokes] = useState<Joke[]>([]);

    useEffect(() => {
        const fetchJokes = async() => {
            const results: Joke[] = [];
            for (let i = 0; i < 3; i++) {
                const joke = await getJoke();
                results.push(joke);
            }
            setJokes(results);
        }
        fetchJokes();
    }, [])
    return (
        <View style={{ backgroundColor: "white" }}>
            <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 12, color: 'black', textAlign: 'center', fontFamily: 'System' }}>Some Jokes:</Text>
            {jokes.map((joke, ind) => (
                <JokeCard key={ind} data={joke} />
            ))}
        </View>
    )
}

export default AyaanPage;