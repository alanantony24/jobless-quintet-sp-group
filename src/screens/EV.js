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
  MapPin,
  Navigation,
  Zap,
  CircleDot,
  Filter,
  ChevronRight,
  Clock,
  Battery,
} from 'lucide-react-native';
import GreenPointsHeader from '../components/GreenPointsHeader';
import StatCard          from '../components/StatCard';
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '../theme/theme';

// ─── Mock EV station data ─────────────────────────────────────────────────────
const STATIONS = [
  {
    id: 'ev1',
    name: 'Toa Payoh Hub',
    address: '480 Lorong 6 Toa Payoh, S310480',
    distance: '0.8 km',
    available: 4,
    total: 6,
    type: 'AC / DC',
    power: '22 kW',
    waitTime: null,
    price: '$0.45/kWh',
  },
  {
    id: 'ev2',
    name: 'Jurong West St 42',
    address: 'Blk 498 Jurong West St 42, S640498',
    distance: '2.3 km',
    available: 2,
    total: 6,
    type: 'AC',
    power: '7.4 kW',
    waitTime: '~10 min',
    price: '$0.38/kWh',
  },
  {
    id: 'ev3',
    name: 'Bishan North CC',
    address: '51 Bishan St 13, S579799',
    distance: '3.1 km',
    available: 6,
    total: 6,
    type: 'DC Fast',
    power: '50 kW',
    waitTime: null,
    price: '$0.55/kWh',
  },
  {
    id: 'ev4',
    name: 'Clementi MRT Station',
    address: '3155 Commonwealth Ave W, S129588',
    distance: '4.4 km',
    available: 0,
    total: 4,
    type: 'AC',
    power: '11 kW',
    waitTime: '~25 min',
    price: '$0.38/kWh',
  },
];

const FILTERS = ['All', 'Available', 'DC Fast', 'AC'];

// ─── Station card ─────────────────────────────────────────────────────────────
function StationCard({ station }) {
  const isAvailable = station.available > 0;
  const isFull      = station.available === station.total;
  const dotColor    = !isAvailable ? COLORS.error : isFull ? COLORS.green : COLORS.orange;

  return (
    <View style={styles.stationCard}>
      {/* Header */}
      <View style={styles.stationHeader}>
        <View style={{ flex: 1 }}>
          <View style={styles.stationNameRow}>
            <CircleDot size={11} color={dotColor} strokeWidth={3} />
            <Text style={styles.stationName}>{station.name}</Text>
          </View>
          <View style={styles.addressRow}>
            <MapPin size={11} color={COLORS.textMuted} strokeWidth={2} />
            <Text style={styles.stationAddress}>{station.address}</Text>
          </View>
        </View>
        <Text style={styles.stationDist}>{station.distance}</Text>
      </View>

      {/* Charger slot visualisation */}
      <View style={styles.slotsRow}>
        {Array.from({ length: station.total }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.slotBlock,
              {
                backgroundColor:
                  i < station.available ? COLORS.green : COLORS.borderLight,
              },
            ]}
          />
        ))}
        <Text style={styles.slotsLabel}>
          <Text style={{ color: isAvailable ? COLORS.green : COLORS.error, fontWeight: '700' }}>
            {station.available}
          </Text>
          /{station.total} available
        </Text>
      </View>

      {/* Meta badges */}
      <View style={styles.metaRow}>
        <View style={styles.metaBadge}>
          <Zap size={11} color={COLORS.primary} strokeWidth={2} />
          <Text style={styles.metaText}>{station.type}</Text>
        </View>
        <View style={styles.metaBadge}>
          <Battery size={11} color={COLORS.primary} strokeWidth={2} />
          <Text style={styles.metaText}>{station.power}</Text>
        </View>
        <View style={styles.metaBadge}>
          <Text style={styles.metaText}>{station.price}</Text>
        </View>
        {station.waitTime && (
          <View style={[styles.metaBadge, { backgroundColor: COLORS.orangeLight }]}>
            <Clock size={11} color={COLORS.orange} strokeWidth={2} />
            <Text style={[styles.metaText, { color: COLORS.orange }]}>{station.waitTime}</Text>
          </View>
        )}
      </View>

      {/* Navigate button */}
      <TouchableOpacity style={styles.navigateBtn} activeOpacity={0.8}>
        <Navigation size={14} color={COLORS.white} strokeWidth={2.5} />
        <Text style={styles.navigateBtnText}>Navigate</Text>
        <ChevronRight size={14} color={COLORS.white} strokeWidth={2.5} />
      </TouchableOpacity>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function EVScreen() {
  const [activeFilter, setActiveFilter] = useState('All');

  const filtered = STATIONS.filter((s) => {
    if (activeFilter === 'All')       return true;
    if (activeFilter === 'Available') return s.available > 0;
    if (activeFilter === 'DC Fast')   return s.type.includes('DC');
    if (activeFilter === 'AC')        return s.type.includes('AC');
    return true;
  });

  const totalAvailable = STATIONS.reduce((a, s) => a + s.available, 0);
  const totalChargers  = STATIONS.reduce((a, s) => a + s.total, 0);
  const inUse          = totalChargers - totalAvailable;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <GreenPointsHeader title="EV Charging" subtitle="Near you · Singapore" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary stats */}
        <View style={styles.statsRow}>
          <StatCard
            style={styles.statHalf}
            icon={<Zap size={20} color={COLORS.green} strokeWidth={2} />}
            label="Available Now"
            value={totalAvailable}
            unit="chargers"
            accent={COLORS.greenLight}
          />
          <StatCard
            style={styles.statHalf}
            icon={<CircleDot size={20} color={COLORS.orange} strokeWidth={2} />}
            label="Chargers In Use"
            value={inUse}
            unit={`of ${totalChargers}`}
            accent={COLORS.orangeLight}
          />
        </View>

        {/* Map placeholder */}
        <View style={styles.mapPlaceholder}>
          <MapPin size={36} color={COLORS.textMuted} strokeWidth={1.5} />
          <Text style={styles.mapText}>Interactive Map</Text>
          <Text style={styles.mapSub}>{STATIONS.length} stations in your area</Text>
        </View>

        {/* Filter chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          <Filter size={14} color={COLORS.textMuted} strokeWidth={2} style={{ marginRight: 6, alignSelf: 'center' }} />
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterChip, activeFilter === f && styles.filterChipActive]}
              onPress={() => setActiveFilter(f)}
              activeOpacity={0.75}
            >
              <Text style={[styles.filterChipText, activeFilter === f && styles.filterChipTextActive]}>
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Station cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{filtered.length} Station{filtered.length !== 1 ? 's' : ''} Found</Text>
          {filtered.map((s) => (
            <StationCard key={s.id} station={s} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.primary },
  scroll: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { padding: SPACING.base, gap: SPACING.md, paddingBottom: SPACING.xxl },

  statsRow: { flexDirection: 'row', gap: SPACING.sm },
  statHalf: { flex: 1 },

  mapPlaceholder: {
    height: 140,
    backgroundColor: '#E9ECEF',
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
  },
  mapText: { ...TYPOGRAPHY.h4, color: COLORS.textSub },
  mapSub:  { ...TYPOGRAPHY.caption, color: COLORS.textMuted },

  filterScroll: { marginHorizontal: -SPACING.base, paddingHorizontal: SPACING.base },
  filterChip: {
    borderRadius: RADIUS.full,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginRight: SPACING.sm,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterChipText:   { ...TYPOGRAPHY.captionBold, color: COLORS.textSub },
  filterChipTextActive: { color: COLORS.white },

  section:      { gap: SPACING.sm },
  sectionTitle: { ...TYPOGRAPHY.caption, color: COLORS.textMuted },

  // Station card
  stationCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.base,
    gap: SPACING.md,
    ...SHADOWS.sm,
  },
  stationHeader:  { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm },
  stationNameRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 3 },
  stationName:    { ...TYPOGRAPHY.h4, color: COLORS.text },
  addressRow:     { flexDirection: 'row', alignItems: 'center', gap: 4 },
  stationAddress: { ...TYPOGRAPHY.caption, color: COLORS.textMuted, flex: 1, lineHeight: 16 },
  stationDist:    { ...TYPOGRAPHY.captionBold, color: COLORS.primary, flexShrink: 0 },

  slotsRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  slotBlock: { flex: 1, height: 8, borderRadius: RADIUS.full },
  slotsLabel: { ...TYPOGRAPHY.caption, color: COLORS.textSub, flexShrink: 0 },

  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primaryLight,
    borderRadius: RADIUS.full,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  metaText: { ...TYPOGRAPHY.micro, color: COLORS.primary, fontSize: 9 },

  navigateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
  },
  navigateBtnText: { ...TYPOGRAPHY.bodyMd, color: COLORS.white, fontWeight: '700' },
});
