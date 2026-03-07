import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Leaf, Flame, ChevronRight } from 'lucide-react-native';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../theme/theme';
import { useGP } from '../context/GPContext';
import { getLevel, getLevelProgress } from '../theme/theme';

// ─────────────────────────────────────────────────────────────────────────────
// GreenPointsHeader
// Placed at the top of EVERY screen (below SafeAreaView / StatusBar).
// Displays: screen title, streak flame, GP balance, and a compact level bar.
// ─────────────────────────────────────────────────────────────────────────────
export default function GreenPointsHeader({ title, subtitle }) {
  const { totalGP, streak } = useGP();
  const lvl      = getLevel(totalGP);
  const progress = getLevelProgress(totalGP);

  return (
    <View style={styles.wrapper}>
      {/* ── Row 1: title + badges ── */}
      <View style={styles.row}>
        <View style={styles.titleBlock}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>
          ) : null}
        </View>

        <View style={styles.badges}>
          {/* Streak pill */}
          {streak > 0 && (
            <View style={styles.streakPill}>
              <Flame size={13} color="#FF7043" strokeWidth={2.5} />
              <Text style={styles.streakText}>{streak} Day{streak > 1 ? 's' : ''}</Text>
            </View>
          )}

          {/* GP pill */}
          <View style={styles.gpPill}>
            <Leaf size={13} color={COLORS.greenDark} strokeWidth={2.5} />
            <Text style={styles.gpValue}>{totalGP.toLocaleString()}</Text>
            <Text style={styles.gpUnit}>GP</Text>
          </View>
        </View>
      </View>

      {/* ── Row 2: level progress bar ── */}
      <View style={styles.levelRow}>
        <Text style={styles.levelEmoji}>{lvl.icon}</Text>
        <View style={styles.barTrack}>
          <View style={[styles.barFill, { width: `${Math.round(progress * 100)}%`, backgroundColor: lvl.color }]} />
        </View>
        <Text style={styles.levelTitle} numberOfLines={1}>
          Lv.{lvl.level} {lvl.title}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.base,
    paddingTop: SPACING.base,
    paddingBottom: SPACING.lg,
    gap: SPACING.sm,
  },

  // ── Row 1 ──
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  titleBlock: { flex: 1 },
  title: {
    ...TYPOGRAPHY.h2,
    color: COLORS.white,
  },
  subtitle: {
    ...TYPOGRAPHY.bodySm,
    color: 'rgba(255,255,255,0.72)',
    marginTop: 2,
  },
  badges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flexShrink: 0,
  },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: RADIUS.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  streakText: {
    ...TYPOGRAPHY.captionBold,
    color: COLORS.white,
  },
  gpPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.greenLight,
    borderRadius: RADIUS.full,
    paddingHorizontal: 11,
    paddingVertical: 6,
  },
  gpValue: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.greenDark,
  },
  gpUnit: {
    ...TYPOGRAPHY.micro,
    color: COLORS.greenDark,
  },

  // ── Row 2: level bar ──
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  levelEmoji: {
    fontSize: 14,
  },
  barTrack: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: RADIUS.full,
  },
  levelTitle: {
    ...TYPOGRAPHY.captionBold,
    color: 'rgba(255,255,255,0.82)',
    flexShrink: 0,
    maxWidth: 130,
  },
});
