import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ButtonProps = {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'md' | 'sm';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled,
  style,
}: ButtonProps) {
  const theme = useTheme();

  const backgroundColor =
    variant === 'primary'
      ? theme.primary
      : variant === 'secondary'
        ? theme.primarySoft
        : 'transparent';

  const borderColor = variant === 'danger' ? theme.danger : 'transparent';
  const textColor =
    variant === 'primary'
      ? '#FFFFFF'
      : variant === 'secondary'
        ? theme.primary
        : variant === 'danger'
          ? theme.danger
          : theme.text;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        size === 'sm' && styles.small,
        { backgroundColor, borderColor, opacity: disabled ? 0.5 : pressed ? 0.85 : 1 },
        style,
      ]}
    >
      <ThemedText
        type={size === 'sm' ? 'smallBold' : 'heading'}
        style={{ color: textColor }}
        maxFontSizeMultiplier={1.2}
      >
        {title}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.md,
    paddingVertical: 14,
    paddingHorizontal: Spacing.four,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  small: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: Radius.sm,
  },
});
