import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

const DST_DDCCardFront = require('../assets/DST_DDCDetailsFront.png');
const DST_DDCCardBack = require('../assets/DST_DDCBackDetails.png');
const ScriptSave_DDCCardFront = require('../assets/ScriptSave_DDCDetailsFront.png');
const ScriptSave_DDCCardBack = require('../assets/ScriptSave_DDCBackDetails.png');

const DDCExpand = () => {
  const params = useLocalSearchParams();
  const adjudicator = params.adjudicator as string;

  const [showFront, setShowFront] = useState(true);
  const flipAnim = useRef(new Animated.Value(0)).current;

  const flipCard = () => {
    Animated.timing(flipAnim, {
      toValue: showFront ? 1 : 0,
      duration: 450,
      useNativeDriver: true,
    }).start(() => setShowFront(!showFront));
  };

  const frontRotation = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const backRotation = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  const frontImage = adjudicator === 'DSNT' ? DST_DDCCardFront : ScriptSave_DDCCardFront;
  const backImage = adjudicator === 'DSNT' ? DST_DDCCardBack : ScriptSave_DDCCardBack;

  return (
    <View style={styles.expandContainer}>
      <Pressable style={styles.overlay_expand} />

      <View style={styles.headerRow}>
        <Ionicons
          name="arrow-back"
          size={25}
          color="#181C20"
          onPress={() => {
            router.push({
              pathname: '/ddc',
              params: {
                drugName: params.drugName,
                quantity: params.quantity,
                form: params.form,
                adjudicator: params.adjudicator,
                pharmacyName: params.pharmacyName,
                pharmacyAddress: params.pharmacyAddress,
                pharmacyPhone: params.pharmacyPhone,
                ndc: params.ndc,
                labelName: params.labelName,
                price: params.price,
                latitude: params.latitude,
                longitude: params.longitude,
                distance: params.distance,
              },
            });
          }}
        />
      </View>

      <View style={styles.cardWrapper}>
        <Text style={styles.flipHint}>Tap card to flip:</Text>

        <Pressable onPress={flipCard} style={styles.flipContainer}>
          <Animated.Image
            source={frontImage}
            resizeMode="contain"
            style={[
              styles.flipImage,
              { transform: [{ rotateX: frontRotation }], zIndex: showFront ? 1 : 0 },
            ]}
          />
          <Animated.Image
            source={backImage}
            resizeMode="contain"
            style={[
              styles.flipImage,
              { transform: [{ rotateX: backRotation }], zIndex: showFront ? 0 : 1 },
            ]}
          />
        </Pressable>
      </View>
    </View>
  );
};

export default DDCExpand;

const styles = StyleSheet.create({
  expandContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
    backgroundColor: '#E7EDF5',
  },
  overlay_expand: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  flipContainer: {
    width: '100%',
    aspectRatio: 2,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  flipImage: {
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden',
    position: 'absolute',
  },
  flipHint: {
    marginBottom: 8,
    color: '#000000',
    fontSize: 18,
    paddingHorizontal: 20,
    textAlign: 'left',
    alignSelf: 'flex-start',
  },
  cardWrapper: {
    paddingHorizontal: 20,
    justifyContent: 'center',
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
  },
  headerRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingTop: 100,
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 3,
  },
});
