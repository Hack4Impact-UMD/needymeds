import { View, Text, StyleSheet } from "react-native";

interface JokeProps {
    joke: string;
}

const FactCard: React.FC<JokeProps> = ({ joke }) => {
    return (
        <View style={styles.card}>
            <Text style={styles.text}>{joke}</Text>
        </View>
    )
}

// styling for the FactCard component
const styles = StyleSheet.create({
    card: {
        paddingHorizontal: 120,
        paddingVertical: 40,
        justifyContent: 'center',
        backgroundColor: 'pink',
        height: 400,
        width: 'fit'
    },
    text: {
        textAlign: 'center',
        fontSize: 30
    }
});


export default FactCard;