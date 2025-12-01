import { useRef, useState } from 'react';
import { Animated, Pressable, View, StyleSheet, Image, Text } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

const DST_DDCCardFront = require('../assets/DST_DDCDetailsFront.svg');
const DST_DDCCardBack = require('../assets/DST_DDCBackDetails.svg');
const ScriptSave_DDCCardFront = require('../assets/ScriptSave_DDCDetailsFront.svg');
const ScriptSave_DDCCardBack = require('../assets/ScriptSave_DDCBackDetails.svg');
const backArrow = require('../assets/arrow_back.svg');

const Expand = () => {
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
        <Pressable
          onPress={() => {
            router.push({
              pathname: '/DDC',
              params: {
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
          style={styles.backButton}
        >
          <Image source={backArrow} style={styles.backIcon} resizeMode="contain" />
        </Pressable>
      </View>

      <View style={styles.cardWrapper}>
        <Text style={styles.flipHint}>Tap card to flip: </Text>

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

export default Expand;

const styles = StyleSheet.create({
  expandContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
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
    width: 400,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
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
  },
  cardWrapper: {
    justifyContent: 'center',
    marginTop: 20,
  },
  headerRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 3,
  },
  backButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },

  backIcon: {
    width: 24,
    height: 24,
  },
});
