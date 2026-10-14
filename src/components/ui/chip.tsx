import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  color?: string;
};

export function Chip({ label, selected, onPress, color }: ChipProps) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: selected ? (color ?? theme.primary) : theme.surface,
          borderColor: selected ? (color ?? theme.primary) : theme.border,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <ThemedText
        type="small"
        style={{
          color: selected ? '#FFFFFF' : theme.textSecondary,
          fontWeight: selected ? '700' : '500',
        }}
      >
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: Radius.full,
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginRight: Spacing.two,
    marginBottom: Spacing.two,
  },
});
