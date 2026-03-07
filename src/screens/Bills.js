import React, { useState } from 'react';
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
  CheckCircle,
  Clock,
  Download,
  CreditCard,
  ChevronRight,
  ArrowUpRight,
  Banknote,
} from 'lucide-react-native';
import GreenPointsHeader from '../components/GreenPointsHeader';
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '../theme/theme';

// ─── Mock data ────────────────────────────────────────────────────────────────
const BILLS = [
  {
    id: 'b1',
    month: 'October 2025',
    amount: 142.50,
    dueDate: '15 Nov 2025',
    status: 'due',
    breakdown: { electricity: 98.40, water: 29.60, gas: 14.50 },
  },
  {
    id: 'b2',
    month: 'September 2025',
    amount: 138.20,
    dueDate: '15 Oct 2025',
    status: 'paid',
    breakdown: { electricity: 94.80, water: 28.40, gas: 15.00 },
  },
  {
    id: 'b3',
    month: 'August 2025',
    amount: 155.80,
    dueDate: '15 Sep 2025',
    status: 'paid',
    breakdown: { electricity: 110.20, water: 30.60, gas: 15.00 },
  },
  {
    id: 'b4',
    month: 'July 2025',
    amount: 148.30,
    dueDate: '15 Aug 2025',
    status: 'paid',
    breakdown: { electricity: 102.60, water: 30.20, gas: 15.50 },
  },
];

const PAYMENT_METHODS = [
  { id: 'm1', label: 'OCBC Debit ···4521', icon: CreditCard },
  { id: 'm2', label: 'PayNow',              icon: Banknote   },
];

// ─── BillRow component ────────────────────────────────────────────────────────
function BillRow({ bill, expanded, onToggle }) {
  const isDue = bill.status === 'due';

  return (
    <TouchableOpacity
      style={[styles.billCard, isDue && styles.billCardDue]}
      onPress={onToggle}
      activeOpacity={0.85}
    >
      {/* Main row */}
      <View style={styles.billMain}>
        <View style={[styles.billIcon, { backgroundColor: isDue ? COLORS.orangeLight : COLORS.greenLight }]}>
          {isDue
            ? <Clock      size={18} color={COLORS.orange} strokeWidth={2} />
            : <CheckCircle size={18} color={COLORS.green}  strokeWidth={2} />}
        </View>
        <View style={styles.billInfo}>
          <Text style={styles.billMonth}>{bill.month}</Text>
          <Text style={styles.billDue}>Due {bill.dueDate}</Text>
        </View>
        <View style={styles.billRight}>
          <Text style={[styles.billAmount, isDue && { color: COLORS.primary }]}>
            ${bill.amount.toFixed(2)}
          </Text>
          <View style={[styles.statusPill, { backgroundColor: isDue ? COLORS.orangeLight : COLORS.greenLight }]}>
            <Text style={[styles.statusText, { color: isDue ? COLORS.orange : COLORS.green }]}>
              {isDue ? 'Due' : 'Paid'}
            </Text>
          </View>
        </View>
      </View>

      {/* Expanded breakdown */}
      {expanded && (
        <View style={styles.breakdown}>
          <View style={styles.breakdownDivider} />
          {Object.entries(bill.breakdown).map(([key, val]) => (
            <View key={key} style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>{key.charAt(0).toUpperCase() + key.slice(1)}</Text>
              <Text style={styles.breakdownVal}>${val.toFixed(2)}</Text>
            </View>
          ))}
          {isDue && (
            <TouchableOpacity style={styles.payBtn} activeOpacity={0.8}>
              <Text style={styles.payBtnText}>Pay Now</Text>
              <ArrowUpRight size={16} color={COLORS.white} strokeWidth={2.5} />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.downloadRow} activeOpacity={0.75}>
            <Download size={14} color={COLORS.primary} strokeWidth={2} />
            <Text style={styles.downloadText}>Download PDF</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function BillsScreen() {
  const [expandedId, setExpandedId] = useState('b1');

  const toggle = (id) => setExpandedId((prev) => (prev === id ? null : id));

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <GreenPointsHeader title="Bills & Payments" subtitle="SP Group · 4-room HDB" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Outstanding banner */}
        <View style={styles.outstandingBanner}>
          <View>
            <Text style={styles.outLabel}>Current Outstanding</Text>
            <Text style={styles.outAmount}>$142.50</Text>
            <Text style={styles.outDue}>Due by 15 Nov 2025</Text>
          </View>
          <TouchableOpacity style={styles.payNowBtn} activeOpacity={0.85}>
            <Text style={styles.payNowText}>Pay Now</Text>
            <ArrowUpRight size={16} color={COLORS.primary} strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        {/* Payment methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Saved Payment Methods</Text>
          {PAYMENT_METHODS.map(({ id, label, icon: Icon }) => (
            <TouchableOpacity key={id} style={styles.methodRow} activeOpacity={0.75}>
              <View style={styles.methodIcon}>
                <Icon size={18} color={COLORS.primary} strokeWidth={2} />
              </View>
              <Text style={styles.methodLabel}>{label}</Text>
              <ChevronRight size={16} color={COLORS.textMuted} strokeWidth={2} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Bill history */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bill History</Text>
          {BILLS.map((bill) => (
            <BillRow
              key={bill.id}
              bill={bill}
              expanded={expandedId === bill.id}
              onToggle={() => toggle(bill.id)}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.primary },
  scroll: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { padding: SPACING.base, gap: SPACING.lg, paddingBottom: SPACING.xxl },

  // Outstanding
  outstandingBanner: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    padding: SPACING.base,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...SHADOWS.md,
  },
  outLabel:  { ...TYPOGRAPHY.caption, color: 'rgba(255,255,255,0.75)' },
  outAmount: { ...TYPOGRAPHY.h1,      color: COLORS.white, marginVertical: 2 },
  outDue:    { ...TYPOGRAPHY.caption, color: 'rgba(255,255,255,0.7)' },
  payNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  payNowText: { ...TYPOGRAPHY.bodyMd, color: COLORS.primary, fontWeight: '700' },

  // Section
  section:      { gap: SPACING.sm },
  sectionTitle: { ...TYPOGRAPHY.h4, color: COLORS.text },

  // Payment method row
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    ...SHADOWS.xs,
  },
  methodIcon: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodLabel: { ...TYPOGRAPHY.bodyMd, color: COLORS.text, flex: 1 },

  // Bill card
  billCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.sm,
  },
  billCardDue: {
    borderLeftWidth: 3,
    borderLeftColor: COLORS.orange,
  },
  billMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  billIcon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  billInfo:   { flex: 1 },
  billMonth:  { ...TYPOGRAPHY.bodyMd, color: COLORS.text },
  billDue:    { ...TYPOGRAPHY.caption, color: COLORS.textMuted, marginTop: 2 },
  billRight:  { alignItems: 'flex-end', gap: 4 },
  billAmount: { ...TYPOGRAPHY.h4, color: COLORS.text, fontWeight: '700' },
  statusPill: {
    borderRadius: RADIUS.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  statusText: { ...TYPOGRAPHY.micro, fontSize: 9 },

  // Breakdown
  breakdown:       { marginTop: SPACING.md, gap: SPACING.sm },
  breakdownDivider:{ height: 1, backgroundColor: COLORS.borderLight },
  breakdownRow:    { flexDirection: 'row', justifyContent: 'space-between' },
  breakdownLabel:  { ...TYPOGRAPHY.bodySm, color: COLORS.textSub },
  breakdownVal:    { ...TYPOGRAPHY.bodyMd, color: COLORS.text },
  payBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    marginTop: SPACING.sm,
  },
  payBtnText:   { ...TYPOGRAPHY.h4, color: COLORS.white },
  downloadRow:  { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, justifyContent: 'center' },
  downloadText: { ...TYPOGRAPHY.captionBold, color: COLORS.primary },
});
