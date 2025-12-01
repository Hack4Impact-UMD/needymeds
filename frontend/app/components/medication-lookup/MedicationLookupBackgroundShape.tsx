import { Dimensions, StyleSheet, View } from 'react-native';

const { width } = Dimensions.get('window');

type Props = {
  top?: number;
  maxHeight?: number;
  color?: string;
  translateY?: number;
  maxWidth?: number;
};

export default function MedicationLookupBackgroundShape({
  top = 50,
  maxHeight,
  color = '#226488',
  translateY = -100,
  maxWidth,
}: Props) {
  const containerWidth = maxWidth || width;
  const circleWidth = containerWidth * 0.85;
  const radius = circleWidth;

  return (
    <View pointerEvents="none" style={[styles.wrap, { top, maxWidth: maxWidth }]}>
      <View
        style={{
          width: circleWidth,
          height: maxHeight ?? Math.round(circleWidth * 0.5),
          backgroundColor: color,
          borderTopLeftRadius: radius,
          borderTopRightRadius: radius,
          transform: [
            { scaleX: 1.05 }, // wide
            { translateY }, // arc up/down, controlled by prop
          ],
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1,
  },
});
