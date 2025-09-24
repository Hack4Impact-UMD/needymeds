import * as React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import JokeCard from "../engineer-folders/eileen-chen/Joke";
import { getJoke, Joke } from "../engineer-folders/eileen-chen/client";

function EileenPage() {
    const [jokes, setJokes] = React.useState<Joke[]>([]);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        let isMounted = true;
        (async () => {
            try {
                const results = await Promise.all(
                    Array.from({ length: 10 }).map(() => getJoke())
                );
                if (isMounted) setJokes(results);
            } catch (e: any) {
                if (isMounted) setError("Failed to load jokes.");
            }
        })();
        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
            <Text style={styles.title}>Random Jokes</Text>
            {error && <Text style={styles.error}>{error}</Text>}
            <View style={styles.list}>
                {jokes.map((joke, index) => (
                    <JokeCard key={`joke-${index}`} data={joke} />
                ))}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scroll: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    container: {
        paddingVertical: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: "700",
        textAlign: "center",
        marginBottom: 12,
    },
    error: {
        color: "#B00020",
        textAlign: "center",
        marginBottom: 8,
    },
    list: {
        paddingBottom: 24,
    },
});

export default EileenPage;