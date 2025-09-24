import { SpookyJoke } from "@/engineer-folders/dhanya-desai-kickoff-assignment/client";
import React from "react";
import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Button } from "react-native";
import { fetchSpookyJoke } from "@/engineer-folders/dhanya-desai-kickoff-assignment/client";
import JokeCard from "@/engineer-folders/dhanya-desai-kickoff-assignment/JokeCard";

function DhanyaPage() {
    const [jokeList, setJokeList] = useState<SpookyJoke[]>([]);
    useEffect(() => {
        fetchSpookyJoke().then((data) => {
            setJokeList([data]);
        });
    }, []);
    return (
        <View>
            <Text>Halloween Jokes</Text>
            {jokeList.map((joke) => (
                <JokeCard id={joke.id}
                key={joke.id}
                setup={joke.setup}
                delivery={joke.delivery}/>         
           ))}
           <TouchableOpacity
            style={{
                backgroundColor: "#FFAC1C",
                padding: 12,
                borderRadius: 8,
                marginTop: 16,
                alignItems: "center",
            }}
            onPress={() => {
                fetchSpookyJoke().then((data) => {
                setJokeList((prev) => [...prev, data]);
                });
            }}
            >
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>
                Get Another Joke
            </Text>
            </TouchableOpacity>
        </View>
    )


}

export default DhanyaPage;
