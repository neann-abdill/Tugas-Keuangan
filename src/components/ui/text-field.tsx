import { StyleSheet, TextInput, type TextInputProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type TextFieldProps = TextInputProps & {
  label: string;
  hint?: string;
  error?: string;
};

/** Input teks dengan label, hint, dan status error terpadu. */
export function TextField({ label, hint, error, style, ...otherProps }: TextFieldProps) {
  const theme = useTheme();
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="smallBold" style={styles.label}>
        {label}
      </ThemedText>
      <TextInput
        placeholderTextColor={theme.textSecondary}
        style={[
          styles.input,
          { backgroundColor: theme.surface, borderColor: error ? theme.danger : theme.border, color: theme.text },
          style,
        ]}
        {...otherProps}
      />
      {error ? (
        <ThemedText type="caption" themeColor="danger" style={styles.hint}>
          {error}
        </ThemedText>
      ) : hint ? (
        <ThemedText type="caption" themeColor="textSecondary" style={styles.hint}>
          {hint}
        </ThemedText>
      ) : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.one + 2,
  },
  label: {
    fontSize: 13,
  },
  input: {
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: 12,
    fontSize: 16,
  },
  hint: {
    fontSize: 12,
  },
});
