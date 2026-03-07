import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '../theme/theme';

// ─────────────────────────────────────────────────────────────────────────────
// StatCard
// A compact metric tile.
// Props:
//   icon       – React element (lucide icon or any component)
//   label      – small grey label above the number
//   value      – bold primary number / text
//   unit       – unit string appended to value (optional)
//   accent     – background fill colour for the icon bubble (optional)
//   style      – extra outer styles
// ─────────────────────────────────────────────────────────────────────────────
export default function StatCard({ icon, label, value, unit, accent, style }) {
  const iconBg = accent ?? COLORS.primaryLight;

  return (
    <View style={[styles.card, style]}>
      <View style={[styles.iconBubble, { backgroundColor: iconBg }]}>
        {icon}
      </View>
      <Text style={styles.label} numberOfLines={1}>{label}</Text>
      <View style={styles.valueRow}>
        <Text style={styles.value} numberOfLines={1}>{value}</Text>
        {unit ? <Text style={styles.unit}>{unit}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'flex-start',
    gap: SPACING.xs,
    ...SHADOWS.sm,
  },
  iconBubble: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  label: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
  },
  value: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
  },
  unit: {
    ...TYPOGRAPHY.captionBold,
    color: COLORS.textMuted,
  },
});
