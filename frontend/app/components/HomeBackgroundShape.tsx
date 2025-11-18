import { View, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

type Props = {
  top?: number;
  height?: number;
  color?: string;
  translateY?: number;
};

export default function HomeBackgroundShape({
  top = 160,
  height = 320,
  color = '#226488',
  translateY = 0,
}: Props) {
  const circleWidth = width * 1.35;
  const radius = circleWidth;

  return (
    <View pointerEvents="none" style={[styles.wrap, { top }]}>
      <View
        style={{
          width: circleWidth,
          height,
          backgroundColor: color,
          borderTopLeftRadius: radius,
          borderTopRightRadius: radius,
          transform: [
            { scaleX: 1.05 }, // wide
            { translateY: 30 }, // arc up/down
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
    zIndex: -1,
  },
});
