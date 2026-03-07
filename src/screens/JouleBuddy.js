import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import {
  Flame,
  Trophy,
  Star,
  Leaf,
  Sparkles,
  ListChecks,
} from 'lucide-react-native';
import GreenPointsHeader from '../components/GreenPointsHeader';
import TaskCard          from '../components/TaskCard';
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY, getLevel, getLevelProgress } from '../theme/theme';
import { useGP } from '../context/GPContext';

// ─────────────────────────────────────────────────────────────────────────────
export default function JouleBuddyScreen() {
  const { totalGP, streak, quests, isCompleted, completeQuest, completedQuestIds } = useGP();

  const lvl         = getLevel(totalGP);
  const progress    = getLevelProgress(totalGP);
  const doneCount   = completedQuestIds.size;
  const totalCount  = quests.length;
  const gpToday     = useMemo(
    () => quests.filter((q) => isCompleted(q.id)).reduce((s, q) => s + q.gp, 0),
    [quests, isCompleted],
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <GreenPointsHeader title="JouleBuddy" subtitle="Daily Eco-Quests" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Streak + Level hero card ── */}
        <View style={styles.heroCard}>
          {/* Streak */}
          <View style={styles.heroStat}>
            <View style={[styles.heroIcon, { backgroundColor: COLORS.orangeLight }]}>
              <Flame size={22} color={COLORS.orange} strokeWidth={2.5} />
            </View>
            <Text style={styles.heroStatValue}>{streak}</Text>
            <Text style={styles.heroStatLabel}>Day{streak !== 1 ? 's' : ''} Streak{streak >= 3 ? ' 🔥' : ''}</Text>
          </View>

          <View style={styles.heroDivider} />

          {/* GP today */}
          <View style={styles.heroStat}>
            <View style={[styles.heroIcon, { backgroundColor: COLORS.greenLight }]}>
              <Leaf size={22} color={COLORS.green} strokeWidth={2.5} />
            </View>
            <Text style={styles.heroStatValue}>+{gpToday}</Text>
            <Text style={styles.heroStatLabel}>GP Today</Text>
          </View>

          <View style={styles.heroDivider} />

          {/* Quests done */}
          <View style={styles.heroStat}>
            <View style={[styles.heroIcon, { backgroundColor: COLORS.primaryLight }]}>
              <ListChecks size={22} color={COLORS.primary} strokeWidth={2.5} />
            </View>
            <Text style={styles.heroStatValue}>{doneCount}/{totalCount}</Text>
            <Text style={styles.heroStatLabel}>Quests Done</Text>
          </View>
        </View>

        {/* ── Level progress card ── */}
        <View style={styles.levelCard}>
          <View style={styles.levelTop}>
            <Text style={styles.levelEmoji}>{lvl.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.levelName}>{lvl.icon} Level {lvl.level}: {lvl.title}</Text>
              <Text style={styles.levelSub}>
                {totalGP.toLocaleString()} GP
                {lvl.level < 5 ? ` · ${(lvl.max - totalGP).toLocaleString()} to next level` : ' · Max Level!'}
              </Text>
            </View>
            <View style={[styles.levelBadge, { backgroundColor: lvl.color }]}>
              <Trophy size={14} color={COLORS.white} strokeWidth={2.5} />
              <Text style={styles.levelBadgeText}>Lv.{lvl.level}</Text>
            </View>
          </View>
          <View style={styles.levelBarTrack}>
            <View
              style={[
                styles.levelBarFill,
                {
                  width: `${Math.round(progress * 100)}%`,
                  backgroundColor: lvl.color,
                },
              ]}
            />
          </View>
          <View style={styles.levelEndLabels}>
            <Text style={styles.levelEndText}>{lvl.min.toLocaleString()} GP</Text>
            {lvl.level < 5 && (
              <Text style={styles.levelEndText}>{lvl.max.toLocaleString()} GP</Text>
            )}
          </View>
        </View>

        {/* ── Daily quests ── */}
        <View style={styles.questSection}>
          <View style={styles.questSectionHeader}>
            <Sparkles size={16} color={COLORS.primary} strokeWidth={2} />
            <Text style={styles.questSectionTitle}>Today's Eco-Quests</Text>
            <View style={styles.questCountPill}>
              <Text style={styles.questCountText}>{totalCount - doneCount} left</Text>
            </View>
          </View>

          {/* Quest list: pending first, completed second */}
          {[
            ...quests.filter((q) => !isCompleted(q.id)),
            ...quests.filter((q) =>  isCompleted(q.id)),
          ].map((quest) => (
            <TaskCard
              key={quest.id}
              quest={quest}
              completed={isCompleted(quest.id)}
              onComplete={completeQuest}
            />
          ))}

          {doneCount === totalCount && (
            <View style={styles.allDoneBanner}>
              <Star size={22} color={COLORS.gold} strokeWidth={2} fill={COLORS.gold} />
              <View style={{ flex: 1 }}>
                <Text style={styles.allDoneTitle}>All quests complete! 🎉</Text>
                <Text style={styles.allDoneSub}>
                  Come back tomorrow for a fresh set of Eco-Quests.
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* ── Tips ── */}
        <View style={styles.tipCard}>
          <Text style={styles.tipEyebrow}>💡  JouleBuddy Tip</Text>
          <Text style={styles.tipText}>
            Completing all daily quests gives you a <Text style={{ fontWeight: '700', color: COLORS.green }}>10% GP bonus</Text> at the end of the day — don't miss a single one!
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.primary },
  scroll: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { padding: SPACING.base, gap: SPACING.md, paddingBottom: SPACING.xxl },

  // Hero stats card
  heroCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.base,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  heroStat: { flex: 1, alignItems: 'center', gap: SPACING.xs },
  heroIcon: {
    width: 46,
    height: 46,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroStatValue: { ...TYPOGRAPHY.h3, color: COLORS.text },
  heroStatLabel: { ...TYPOGRAPHY.caption, color: COLORS.textMuted, textAlign: 'center' },
  heroDivider:   { width: 1, height: 60, backgroundColor: COLORS.borderLight },

  // Level card
  levelCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.base,
    gap: SPACING.sm,
    ...SHADOWS.sm,
  },
  levelTop: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  levelEmoji: { fontSize: 22 },
  levelName: { ...TYPOGRAPHY.h4, color: COLORS.text },
  levelSub:  { ...TYPOGRAPHY.caption, color: COLORS.textMuted, marginTop: 2 },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: RADIUS.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexShrink: 0,
  },
  levelBadgeText: { ...TYPOGRAPHY.captionBold, color: COLORS.white },
  levelBarTrack: {
    height: 10,
    backgroundColor: COLORS.borderLight,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  levelBarFill: {
    height: '100%',
    borderRadius: RADIUS.full,
  },
  levelEndLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  levelEndText:   { ...TYPOGRAPHY.caption, color: COLORS.textMuted },

  // Quest section
  questSection: { gap: SPACING.sm },
  questSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  questSectionTitle: { ...TYPOGRAPHY.h4, color: COLORS.text, flex: 1 },
  questCountPill: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: RADIUS.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  questCountText: { ...TYPOGRAPHY.captionBold, color: COLORS.primary },

  // All done
  allDoneBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: COLORS.goldLight,
    borderRadius: RADIUS.lg,
    padding: SPACING.base,
    borderWidth: 1,
    borderColor: COLORS.gold,
  },
  allDoneTitle: { ...TYPOGRAPHY.h4, color: COLORS.text },
  allDoneSub:   { ...TYPOGRAPHY.bodySm, color: COLORS.textSub, marginTop: 2 },

  // Tip
  tipCard: {
    backgroundColor: COLORS.greenPale,
    borderRadius: RADIUS.lg,
    padding: SPACING.base,
    gap: SPACING.sm,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.green,
  },
  tipEyebrow: { ...TYPOGRAPHY.captionBold, color: COLORS.greenDark },
  tipText:    { ...TYPOGRAPHY.bodySm, color: COLORS.textSub, lineHeight: 20 },
});
