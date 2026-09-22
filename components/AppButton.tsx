import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '@/constants/colors';

type Props = {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  theme?: 'primary';
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
};

export default function AppButton({ title, icon, theme, onPress, disabled, loading }: Props) {
  const primary = theme === 'primary';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: !!disabled, busy: !!loading }}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [styles.button, primary ? styles.primary : styles.secondary, pressed && styles.pressed, (disabled || loading) && styles.disabled]}
    >
      <View style={styles.content}>
        {loading ? <ActivityIndicator color={primary ? COLORS.textOnPrimary : COLORS.primary} /> : <Ionicons name={icon} size={22} color={primary ? COLORS.textOnPrimary : COLORS.textPrimary} />}
        <Text style={[styles.label, primary && styles.primaryLabel]}>{loading ? 'Please wait...' : title}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { minHeight: 52, borderRadius: 10, justifyContent: 'center', paddingHorizontal: 18, marginVertical: 6, borderWidth: 1 },
  primary: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  secondary: { backgroundColor: COLORS.card, borderColor: COLORS.border },
  content: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  label: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '600' },
  primaryLabel: { color: COLORS.textOnPrimary, fontWeight: '700' },
  pressed: { opacity: 0.78 },
  disabled: { opacity: 0.45 },
});
