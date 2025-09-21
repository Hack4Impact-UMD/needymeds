import { StyleSheet, View, Text } from "react-native";

interface CardProps{
    id: number;
    advice: string;
}

export default function FactCard(props: CardProps){

    return(
        <View style ={styles.container}>
            <Text style ={styles.text}> {props.advice} </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 20,
        backgroundColor: '#90D5FF',
        marginLeft: 25,
        marginRight: 25,
        borderRadius: 20,
        justifyContent: 'center',
        padding: 5,
    },
    text: {
        fontSize: 20,
        textAlign: 'center',
        fontFamily: "Marker Felt",    
        margin: 5,
    }
}); 