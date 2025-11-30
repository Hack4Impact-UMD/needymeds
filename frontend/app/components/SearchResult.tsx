import { StyleSheet, Text, View } from 'react-native';
import { Divider, IconButton } from 'react-native-paper';

type SearchResultProps = {
    name: string;
    address: string;
    distance: string;
    onPress: () => void;
};

const SearchResult = ({ name, address, distance, onPress }: SearchResultProps) => {
    return (
        <View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 8 }}>
                <View style={{ flexDirection: 'column', justifyContent: 'center' }}>
                    <Text style={styles.resultTitle}>{name}</Text>
                    <Text style={styles.resultSubtitle}>{address}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text>{distance}mi</Text>
                    <IconButton
                        icon="menu-right"
                        iconColor="#41484D"
                        size={24}
                        onPress={onPress}
                    />
                </View>
            </View>
            <Divider style={styles.divider} />
        </View>
    );
}

const styles = StyleSheet.create({
    resultTitle: {
        fontSize: 16,
        fontWeight: 400,
        lineHeight: 24,
        letterSpacing: 0.5,
        color: '#181C20',
    },
    resultSubtitle: {
        fontSize: 14,
        fontWeight: 400,
        lineHeight: 20,
        letterSpacing: 0.25,
        color: '#41484D',
    },
    resultMiles: {
        fontSize: 11,
        fontWeight: 500,
        lineHeight: 16,
        letterSpacing: 0.5,
        color: '#41484D',
    },

    divider: {
        alignSelf: 'flex-end', 
        width: '96%',
        color: '#C1C7CE'
    }
});

export default SearchResult;