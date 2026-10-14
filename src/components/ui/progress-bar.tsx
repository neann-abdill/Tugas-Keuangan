import { StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

import { useTheme } from '@/hooks/use-theme';

type ProgressBarProps = {
  /** 0..1 (boleh > 1, dipotong untuk lebar). */
  ratio: number;
  color?: string;
  height?: number;
  style?: ViewStyle;
};

export function ProgressBar({ ratio, color, height = 8, style }: ProgressBarProps) {
  const theme = useTheme();
  const clamped = Math.max(0, Math.min(1, ratio));
  const animated = useAnimatedStyle(() => ({ width: `${Math.round(clamped * 100)}%` }));

  return (
    <View
      style={[styles.track, { backgroundColor: theme.backgroundSelected, height, borderRadius: height / 2 }, style]}
    >
      <Animated.View
        style={[
          styles.fill,
          animated,
          {
            height,
            borderRadius: height / 2,
            backgroundColor: color ?? theme.primary,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    overflow: 'hidden',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
});
