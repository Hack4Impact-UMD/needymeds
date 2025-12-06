import { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  PanResponder,
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';

type BottomSheetModalProps = {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  backdropOpacity?: number;
  animationDuration?: number;
  enableSwipeDown?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
};

const SCREEN_HEIGHT = Dimensions.get('window').height;

const BottomSheetModal = ({
  visible,
  onClose,
  children,
  backdropOpacity = 0.7,
  animationDuration = 250,
  enableSwipeDown = true,
  contentContainerStyle,
}: BottomSheetModalProps) => {
  const [isMounted, setIsMounted] = useState(visible);
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdrop = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setIsMounted(true);
      Animated.parallel([
        Animated.timing(backdrop, {
          toValue: backdropOpacity,
          duration: animationDuration,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: animationDuration,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (isMounted) {
      Animated.parallel([
        Animated.timing(backdrop, {
          toValue: 0,
          duration: animationDuration,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: SCREEN_HEIGHT,
          duration: animationDuration,
          useNativeDriver: true,
        }),
      ]).start(() => setIsMounted(false));
    }
  }, [animationDuration, backdrop, backdropOpacity, isMounted, translateY, visible]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) =>
          enableSwipeDown && gesture.dy > 6 && Math.abs(gesture.dx) < 24,
        onPanResponderMove: (_, gesture) => {
          if (gesture.dy > 0) {
            translateY.setValue(gesture.dy);
            backdrop.setValue(
              Math.max(0, backdropOpacity * (1 - gesture.dy / (SCREEN_HEIGHT * 0.75)))
            );
          }
        },
        onPanResponderRelease: (_, gesture) => {
          const shouldClose = gesture.dy > 140 || gesture.vy > 1.2;
          if (shouldClose) {
            onClose();
          } else {
            Animated.parallel([
              Animated.spring(translateY, {
                toValue: 0,
                useNativeDriver: true,
                bounciness: 0,
                speed: 18,
              }),
              Animated.timing(backdrop, {
                toValue: backdropOpacity,
                duration: 120,
                useNativeDriver: true,
              }),
            ]).start();
          }
        },
      }),
    [backdrop, backdropOpacity, enableSwipeDown, onClose, translateY]
  );

  if (!isMounted) {
    return null;
  }

  return (
    <Modal
      transparent
      visible={isMounted}
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <Animated.View style={[styles.backdrop, { opacity: backdrop }]} />
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <Animated.View
          style={[styles.sheetContainer, { transform: [{ translateY }] }, contentContainerStyle]}
          {...(enableSwipeDown ? panResponder.panHandlers : {})}
        >
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  sheetContainer: {
    width: '100%',
    alignSelf: 'center',
  },
});

export default BottomSheetModal;
