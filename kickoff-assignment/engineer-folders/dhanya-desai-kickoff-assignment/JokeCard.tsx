import React, { useState } from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
    
export interface JokeProps {
    setup: string;
    delivery: string;
    id: number;
}
const JokeCard: React.FC<JokeProps> = ({ setup, delivery, id }) => {
    const [showDelivery, setShowDelivery] = useState(false);

    return (
        
        <View style={styles.card}>
            <Text style={styles.text}>{setup}</Text>
            {showDelivery ? (
                <Text style={styles.text}>{delivery}</Text>
            ) : (
                <TouchableOpacity onPress={() => setShowDelivery(true)}>
                <Text style={styles.text}>Click Me!</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};
export default JokeCard;

const styles = StyleSheet.create({
    card: { 
        backgroundColor: "#FFFDD0",
        borderRadius: 12,
        padding: 16,
        marginVertical: 10,
        alignItems: "center"
    },
    text: {
        fontSize: 16,
        color: "#FFAC1C",
    }
});
