import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Image,
  Alert,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {
  Check,
  Camera,
  ImageIcon,
  X,
  Leaf,
  ChevronRight,
  Sparkles,
} from 'lucide-react-native';
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '../theme/theme';

// ─────────────────────────────────────────────────────────────────────────────
// Difficulty badge colours
// ─────────────────────────────────────────────────────────────────────────────
const DIFF_COLORS = {
  Easy:   { bg: COLORS.greenLight,   text: COLORS.greenDark },
  Medium: { bg: COLORS.orangeLight,  text: COLORS.orange    },
  Hard:   { bg: COLORS.errorLight,   text: COLORS.error     },
};

// ─────────────────────────────────────────────────────────────────────────────
// TaskCard
// Props:
//   quest      – quest object from QUEST_CATALOGUE
//   completed  – boolean (controlled by parent via GPContext)
//   onComplete – callback(questId, gp) called after photo verification passes
// ─────────────────────────────────────────────────────────────────────────────
export default function TaskCard({ quest, completed, onComplete }) {
  const [modalVisible, setModalVisible]   = useState(false);
  const [previewUri,   setPreviewUri]     = useState(null);
  const [confirming,   setConfirming]     = useState(false);
  const [celebrating,  setCelebrating]    = useState(false);

  const diff = DIFF_COLORS[quest.difficulty] ?? DIFF_COLORS.Easy;

  // ── Request permissions helper ──────────────────────────────────────────────
  const ensurePermission = async (type) => {
    if (type === 'camera') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      return status === 'granted';
    }
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return status === 'granted';
  };

  // ── Launch camera ────────────────────────────────────────────────────────────
  const launchCamera = useCallback(async () => {
    const ok = await ensurePermission('camera');
    if (!ok) {
      Alert.alert('Permission Needed', 'Camera access is required to verify this quest.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.75,
    });
    if (!result.canceled) setPreviewUri(result.assets[0].uri);
  }, []);

  // ── Launch library ───────────────────────────────────────────────────────────
  const launchLibrary = useCallback(async () => {
    const ok = await ensurePermission('library');
    if (!ok) {
      Alert.alert('Permission Needed', 'Photo library access is required to verify this quest.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.75,
    });
    if (!result.canceled) setPreviewUri(result.assets[0].uri);
  }, []);

  // ── Confirm verification ─────────────────────────────────────────────────────
  const confirmVerification = useCallback(async () => {
    setConfirming(true);
    // Simulated 1.2 s "AI processing" delay for UX delight
    await new Promise((r) => setTimeout(r, 1200));
    setConfirming(false);
    setModalVisible(false);
    setPreviewUri(null);

    // Flash celebration state briefly
    setCelebrating(true);
    setTimeout(() => setCelebrating(false), 2000);

    // Award points via context
    onComplete(quest.id, quest.gp);
  }, [quest, onComplete]);

  // ── Reset modal ──────────────────────────────────────────────────────────────
  const closeModal = () => {
    setModalVisible(false);
    setPreviewUri(null);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Card body ── */}
      <View
        style={[
          styles.card,
          completed && styles.cardDone,
          celebrating && styles.cardCelebrating,
        ]}
      >
        {/* Left colour strip */}
        <View style={[styles.strip, { backgroundColor: quest.color }]} />

        {/* Icon bubble */}
        <View style={[styles.iconBubble, { backgroundColor: quest.colorLight }]}>
          <QuestIcon name={quest.icon} color={quest.color} size={22} />
        </View>

        {/* Text block */}
        <View style={styles.textBlock}>
          <View style={styles.titleRow}>
            <Text style={[styles.questTitle, completed && styles.textStrike]}>
              {quest.title}
            </Text>
            <View style={[styles.diffPill, { backgroundColor: diff.bg }]}>
              <Text style={[styles.diffText, { color: diff.text }]}>
                {quest.difficulty}
              </Text>
            </View>
          </View>

          <Text style={styles.questDesc} numberOfLines={2}>
            {quest.description}
          </Text>

          {/* GP reward */}
          <View style={styles.rewardRow}>
            <Leaf size={12} color={COLORS.green} strokeWidth={2.5} />
            <Text style={styles.rewardText}>+{quest.gp} GP</Text>
            <View style={styles.categoryPill}>
              <Text style={styles.categoryText}>{quest.category}</Text>
            </View>
          </View>
        </View>

        {/* CTA button */}
        <View style={styles.ctaCol}>
          {completed ? (
            <View style={styles.doneCircle}>
              <Check size={16} color={COLORS.white} strokeWidth={3} />
            </View>
          ) : (
            <TouchableOpacity
              style={styles.verifyBtn}
              onPress={() => setModalVisible(true)}
              activeOpacity={0.8}
            >
              <Camera size={14} color={COLORS.white} strokeWidth={2.5} />
              <Text style={styles.verifyText}>Verify</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Photo Verification Modal ── */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={closeModal} />
          <View style={styles.modalSheet}>

            {/* Handle */}
            <View style={styles.modalHandle} />

            {/* Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleBlock}>
                <Sparkles size={18} color={COLORS.primary} strokeWidth={2} />
                <Text style={styles.modalTitle}>Photo Verification</Text>
              </View>
              <TouchableOpacity onPress={closeModal} style={styles.modalClose}>
                <X size={20} color={COLORS.textMuted} strokeWidth={2} />
              </TouchableOpacity>
            </View>

            {/* Quest recap */}
            <View style={[styles.modalQuestBadge, { backgroundColor: quest.colorLight }]}>
              <QuestIcon name={quest.icon} color={quest.color} size={18} />
              <Text style={[styles.modalQuestName, { color: quest.color }]}>
                {quest.title}
              </Text>
              <View style={styles.gpPillModal}>
                <Leaf size={11} color={COLORS.greenDark} strokeWidth={2.5} />
                <Text style={styles.gpPillText}>+{quest.gp} GP</Text>
              </View>
            </View>

            {/* Instructions */}
            <Text style={styles.modalInstruction}>
              Take or upload a photo to prove you completed this quest.
              Our AI will verify your submission instantly.
            </Text>

            {/* Preview area */}
            {previewUri ? (
              <View style={styles.previewContainer}>
                <Image source={{ uri: previewUri }} style={styles.previewImage} />
                <TouchableOpacity
                  style={styles.retakeBtn}
                  onPress={() => setPreviewUri(null)}
                >
                  <X size={14} color={COLORS.white} strokeWidth={2.5} />
                  <Text style={styles.retakeText}>Retake</Text>
                </TouchableOpacity>
              </View>
            ) : (
              /* Picker buttons */
              <View style={styles.pickerRow}>
                <TouchableOpacity style={styles.pickerBtn} onPress={launchCamera} activeOpacity={0.8}>
                  <View style={styles.pickerIcon}>
                    <Camera size={22} color={COLORS.primary} strokeWidth={2} />
                  </View>
                  <Text style={styles.pickerLabel}>Take Photo</Text>
                  <Text style={styles.pickerSub}>Camera</Text>
                </TouchableOpacity>

                <View style={styles.pickerDivider} />

                <TouchableOpacity style={styles.pickerBtn} onPress={launchLibrary} activeOpacity={0.8}>
                  <View style={styles.pickerIcon}>
                    <ImageIcon size={22} color={COLORS.primary} strokeWidth={2} />
                  </View>
                  <Text style={styles.pickerLabel}>Upload Photo</Text>
                  <Text style={styles.pickerSub}>Photo Library</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Confirm button */}
            {previewUri && (
              <TouchableOpacity
                style={[styles.confirmBtn, confirming && styles.confirmBtnLoading]}
                onPress={confirmVerification}
                disabled={confirming}
                activeOpacity={0.85}
              >
                {confirming ? (
                  <>
                    <ActivityIndicator size="small" color={COLORS.white} />
                    <Text style={styles.confirmText}>Verifying with AI…</Text>
                  </>
                ) : (
                  <>
                    <Check size={18} color={COLORS.white} strokeWidth={3} />
                    <Text style={styles.confirmText}>Confirm & Earn {quest.gp} GP</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Inline icon resolver (maps string names from quest catalogue → lucide icons)
// ─────────────────────────────────────────────────────────────────────────────
function QuestIcon({ name, color, size }) {
  const props = { size, color, strokeWidth: 2 };
  const icons = {
    Wind:         require('lucide-react-native').Wind,
    ZapOff:       require('lucide-react-native').ZapOff,
    Droplets:     require('lucide-react-native').Droplets,
    Sun:          require('lucide-react-native').Sun,
    Thermometer:  require('lucide-react-native').Thermometer,
    Leaf:         require('lucide-react-native').Leaf,
  };
  const Icon = icons[name] ?? require('lucide-react-native').Leaf;
  return <Icon {...props} />;
}

// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // ── Card ──
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.sm,
    overflow: 'hidden',
    ...SHADOWS.sm,
  },
  cardDone: {
    opacity: 0.72,
  },
  cardCelebrating: {
    borderWidth: 1.5,
    borderColor: COLORS.green,
  },
  strip: {
    width: 5,
    alignSelf: 'stretch',
  },
  iconBubble: {
    width: 46,
    height: 46,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    margin: SPACING.md,
    flexShrink: 0,
  },
  textBlock: {
    flex: 1,
    paddingVertical: SPACING.md,
    paddingRight: SPACING.sm,
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flexWrap: 'wrap',
  },
  questTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text,
    flexShrink: 1,
  },
  textStrike: {
    textDecorationLine: 'line-through',
    color: COLORS.textMuted,
  },
  questDesc: {
    ...TYPOGRAPHY.bodySm,
    color: COLORS.textSub,
  },
  rewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  rewardText: {
    ...TYPOGRAPHY.captionBold,
    color: COLORS.green,
  },
  categoryPill: {
    backgroundColor: COLORS.borderLight,
    borderRadius: RADIUS.full,
    paddingHorizontal: 7,
    paddingVertical: 2,
    marginLeft: 4,
  },
  categoryText: {
    ...TYPOGRAPHY.micro,
    color: COLORS.textMuted,
    fontSize: 9,
  },
  diffPill: {
    borderRadius: RADIUS.full,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  diffText: {
    ...TYPOGRAPHY.micro,
    fontSize: 9,
  },

  // ── CTA ──
  ctaCol: {
    paddingRight: SPACING.md,
    flexShrink: 0,
  },
  verifyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  verifyText: {
    ...TYPOGRAPHY.captionBold,
    color: COLORS.white,
  },
  doneCircle: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.green,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Modal overlay ──
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.overlay,
  },
  modalSheet: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: RADIUS.xxl,
    borderTopRightRadius: RADIUS.xxl,
    paddingHorizontal: SPACING.base,
    paddingBottom: SPACING.xxxl,
    paddingTop: SPACING.md,
    gap: SPACING.md,
    ...SHADOWS.lg,
  },
  modalHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.border,
    marginBottom: SPACING.sm,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitleBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  modalTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
  },
  modalClose: {
    padding: SPACING.xs,
  },
  modalQuestBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
  },
  modalQuestName: {
    ...TYPOGRAPHY.bodyMd,
    flex: 1,
    fontWeight: '600',
  },
  gpPillModal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: COLORS.greenLight,
    borderRadius: RADIUS.full,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  gpPillText: {
    ...TYPOGRAPHY.captionBold,
    color: COLORS.greenDark,
  },
  modalInstruction: {
    ...TYPOGRAPHY.bodySm,
    color: COLORS.textSub,
    textAlign: 'center',
    lineHeight: 20,
  },

  // ── Picker buttons ──
  pickerRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  pickerBtn: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.lg,
    gap: SPACING.sm,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  pickerIcon: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerLabel: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.text,
  },
  pickerSub: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
  },
  pickerDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    alignSelf: 'stretch',
  },

  // ── Preview ──
  previewContainer: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  retakeBtn: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.60)',
    borderRadius: RADIUS.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  retakeText: {
    ...TYPOGRAPHY.captionBold,
    color: COLORS.white,
  },

  // ── Confirm button ──
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.green,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.base,
  },
  confirmBtnLoading: {
    backgroundColor: COLORS.greenMid,
  },
  confirmText: {
    ...TYPOGRAPHY.h4,
    color: COLORS.white,
  },
});
