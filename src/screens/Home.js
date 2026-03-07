import React from 'react';
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
  Zap,
  Leaf,
  Footprints,
  MoreHorizontal,
  TriangleAlert,
  TrendingDown,
  BarChart3,
  Users,
  Wind,
  ChevronRight,
} from 'lucide-react-native';
import GreenPointsHeader from '../components/GreenPointsHeader';
import StatCard          from '../components/StatCard';
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '../theme/theme';
import { useGP } from '../context/GPContext';

// ─── Bar chart data (12 months, no external library) ──────────────────────────
const CHART_DATA = [
  { m: 'J', v: 62 }, { m: 'F', v: 54 }, { m: 'M', v: 68 }, { m: 'A', v: 78 },
  { m: 'M', v: 88 }, { m: 'J', v: 100 },{ m: 'J', v: 96 }, { m: 'A', v: 105 },
  { m: 'S', v: 90 }, { m: 'O', v: 74 }, { m: 'N', v: 66 }, { m: 'D', v: 71 },
];
const MAX_V = Math.max(...CHART_DATA.map((d) => d.v));

// ─── Quick-action grid ─────────────────────────────────────────────────────────
const ACTIONS = [
  { icon: Zap,          label: 'Utilities',        color: COLORS.primary,     bg: COLORS.primaryLight },
  { icon: Leaf,         label: 'Green Goals',       color: COLORS.green,       bg: COLORS.greenLight   },
  { icon: Footprints,   label: 'Carbon\nFootprint', color: COLORS.orange,      bg: COLORS.orangeLight  },
  { icon: MoreHorizontal,label: 'More',             color: COLORS.textMuted,   bg: COLORS.borderLight  },
];

export default function HomeScreen() {
  const { totalGP, completedQuestIds } = useGP();

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <GreenPointsHeader title="WattWise" subtitle="SP Group Dashboard" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Stats row ── */}
        <View style={styles.statsRow}>
          <StatCard
            style={styles.statCardHalf}
            icon={<Zap size={20} color={COLORS.primary} strokeWidth={2} />}
            label="This Month"
            value="$142"
            unit=".50"
            accent={COLORS.primaryLight}
          />
          <StatCard
            style={styles.statCardHalf}
            icon={<TrendingDown size={20} color={COLORS.green} strokeWidth={2} />}
            label="vs Last Month"
            value="-8"
            unit="%"
            accent={COLORS.greenLight}
          />
          <StatCard
            style={styles.statCardHalf}
            icon={<Leaf size={20} color={COLORS.green} strokeWidth={2} />}
            label="GreenPoints"
            value={totalGP.toLocaleString()}
            unit="GP"
            accent={COLORS.greenLight}
          />
          <StatCard
            style={styles.statCardHalf}
            icon={<BarChart3 size={20} color={COLORS.teal} strokeWidth={2} />}
            label="Quests Done"
            value={completedQuestIds.size}
            unit="today"
            accent={COLORS.tealLight}
          />
        </View>

        {/* ── Quick actions ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Quick Actions</Text>
          <View style={styles.actionGrid}>
            {ACTIONS.map(({ icon: Icon, label, color, bg }) => (
              <TouchableOpacity key={label} style={styles.actionItem} activeOpacity={0.75}>
                <View style={[styles.actionIconBubble, { backgroundColor: bg }]}>
                  <Icon size={26} color={color} strokeWidth={2} />
                </View>
                <Text style={styles.actionLabel}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Maintenance alert ── */}
        <View style={[styles.card, styles.alertCard]}>
          <TriangleAlert size={20} color={COLORS.warningText} strokeWidth={2} />
          <View style={{ flex: 1 }}>
            <Text style={styles.alertTitle}>Scheduled Maintenance</Text>
            <Text style={styles.alertBody}>
              15 Mar 2026 · 10 PM – 2 AM. MySP services may be temporarily unavailable.
            </Text>
          </View>
        </View>

        {/* ── Neighbours comparison ── */}
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <View>
              <Text style={styles.cardTitle}>You vs Neighbours</Text>
              <Text style={styles.cardSub}>Similar 4-room HDB households</Text>
            </View>
            <Users size={18} color={COLORS.textMuted} strokeWidth={2} />
          </View>
          <View style={styles.compareRow}>
            <View style={styles.compareItem}>
              <Text style={styles.compareName}>You</Text>
              <View style={[styles.compareBar, { width: '86%', backgroundColor: COLORS.primary }]} />
              <Text style={[styles.compareVal, { color: COLORS.primary }]}>90 kWh</Text>
            </View>
            <View style={styles.compareItem}>
              <Text style={styles.compareName}>Avg.</Text>
              <View style={[styles.compareBar, { width: '72%', backgroundColor: COLORS.green }]} />
              <Text style={[styles.compareVal, { color: COLORS.green }]}>76 kWh</Text>
            </View>
          </View>
          <Text style={styles.compareHint}>
            You used 18% more than average — complete today's eco-quests to close the gap!
          </Text>
        </View>

        {/* ── Bar chart ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Avg. HDB Electricity Usage</Text>
          <Text style={styles.cardSub}>kWh per month · 2025</Text>
          <View style={styles.chartArea}>
            {CHART_DATA.map((d, i) => {
              const h       = (d.v / MAX_V) * 90;
              const isPeak  = d.v === MAX_V;
              return (
                <View key={i} style={styles.barCol}>
                  <Text style={styles.barVal}>{d.v}</Text>
                  <View
                    style={[
                      styles.bar,
                      { height: h, backgroundColor: isPeak ? COLORS.orange : COLORS.primary, opacity: isPeak ? 1 : 0.7 },
                    ]}
                  />
                  <Text style={styles.barMonth}>{d.m}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* ── UOB Promo ── */}
        <TouchableOpacity style={styles.promoCard} activeOpacity={0.85}>
          <View style={styles.promoLeft}>
            <Text style={styles.promoEyebrow}>FEATURED OFFER</Text>
            <Text style={styles.promoTitle}>UOB One Card</Text>
            <Text style={styles.promoSub}>Up to 10% cashback on utilities</Text>
          </View>
          <View style={styles.promoBadge}>
            <Text style={styles.promoPct}>10%</Text>
            <Text style={styles.promoCb}>cashback</Text>
            <ChevronRight size={16} color={COLORS.white} strokeWidth={2.5} />
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.primary },
  scroll: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { padding: SPACING.base, gap: SPACING.md, paddingBottom: SPACING.xxl },

  // Stats grid
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  statCardHalf: { width: '47.5%' },

  // Generic card shell
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.base,
    gap: SPACING.md,
    ...SHADOWS.sm,
  },
  cardTitle: { ...TYPOGRAPHY.h4, color: COLORS.text },
  cardSub:   { ...TYPOGRAPHY.caption, color: COLORS.textMuted, marginTop: -8 },
  rowBetween: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },

  // Action grid
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionItem: { width: '48%', alignItems: 'center', paddingVertical: SPACING.md, gap: SPACING.sm },
  actionIconBubble: {
    width: 60,
    height: 60,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: { ...TYPOGRAPHY.captionBold, color: COLORS.text, textAlign: 'center' },

  // Alert card
  alertCard: {
    backgroundColor: COLORS.warning,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warningBorder,
  },
  alertTitle: { ...TYPOGRAPHY.captionBold, color: COLORS.warningText },
  alertBody:  { ...TYPOGRAPHY.caption,     color: '#5D3A00', marginTop: 2, lineHeight: 16 },

  // Neighbours
  compareRow: { gap: SPACING.sm },
  compareItem: { gap: 4 },
  compareName: { ...TYPOGRAPHY.captionBold, color: COLORS.textSub },
  compareBar:  { height: 10, borderRadius: RADIUS.full },
  compareVal:  { ...TYPOGRAPHY.captionBold },
  compareHint: { ...TYPOGRAPHY.bodySm, color: COLORS.textSub, lineHeight: 18 },

  // Bar chart
  chartArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 130,
    justifyContent: 'space-between',
  },
  barCol:    { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  bar:       { width: '70%', borderRadius: 3, minHeight: 3 },
  barVal:    { fontSize: 7, color: COLORS.textMuted, marginBottom: 2 },
  barMonth:  { fontSize: 9, color: COLORS.textMuted, marginTop: 3 },

  // Promo
  promoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    padding: SPACING.base,
    ...SHADOWS.md,
  },
  promoLeft:    { gap: 3 },
  promoEyebrow: { ...TYPOGRAPHY.micro, color: 'rgba(255,255,255,0.65)' },
  promoTitle:   { ...TYPOGRAPHY.h3,    color: COLORS.white },
  promoSub:     { ...TYPOGRAPHY.caption, color: 'rgba(255,255,255,0.75)' },
  promoBadge:   { alignItems: 'center', gap: 2 },
  promoPct:     { fontSize: 28, fontWeight: '800', color: COLORS.white, lineHeight: 30 },
  promoCb:      { ...TYPOGRAPHY.micro, color: 'rgba(255,255,255,0.8)' },
});
