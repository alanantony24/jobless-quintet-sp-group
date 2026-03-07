import React, { createContext, useContext, useState, useCallback } from 'react';

// ─── Quest catalogue (single source of truth) ─────────────────────────────────
export const QUEST_CATALOGUE = [
  {
    id: 'q1',
    icon: 'Wind',
    title: 'Switch AC to Fan Mode',
    description: 'Use a ceiling / standing fan instead of AC for at least 2 hours today.',
    gp: 30,
    category: 'Cooling',
    difficulty: 'Easy',
    color: '#1565C0',
    colorLight: '#E3F2FD',
  },
  {
    id: 'q2',
    icon: 'ZapOff',
    title: 'Unplug Standby Devices',
    description: 'Power off and unplug all electronics on standby before going to bed.',
    gp: 20,
    category: 'Power',
    difficulty: 'Easy',
    color: '#FF7043',
    colorLight: '#FFF3E0',
  },
  {
    id: 'q3',
    icon: 'Droplets',
    title: 'Cold Wash Laundry',
    description: 'Run one full laundry load on a cold-water cycle instead of warm.',
    gp: 40,
    category: 'Laundry',
    difficulty: 'Medium',
    color: '#0288D1',
    colorLight: '#E1F5FE',
  },
  {
    id: 'q4',
    icon: 'Sun',
    title: 'Natural Light Day',
    description: 'Rely on daylight only — keep indoor lights off until after 7 PM.',
    gp: 25,
    category: 'Lighting',
    difficulty: 'Easy',
    color: '#FFB300',
    colorLight: '#FFF8E1',
  },
  {
    id: 'q5',
    icon: 'Thermometer',
    title: 'Set AC to 25°C',
    description: 'Maintain your air-conditioner at exactly 25°C for the full day.',
    gp: 15,
    category: 'Cooling',
    difficulty: 'Easy',
    color: '#00ACC1',
    colorLight: '#E0F7FA',
  },
  {
    id: 'q6',
    icon: 'Leaf',
    title: 'Green Transport Day',
    description: 'Take public transport, cycle, or walk instead of driving today.',
    gp: 50,
    category: 'Transport',
    difficulty: 'Medium',
    color: '#2E7D32',
    colorLight: '#E8F5E9',
  },
];

// ─── Badge catalogue ──────────────────────────────────────────────────────────
export const BADGE_CATALOGUE = [
  { id: 'b1', emoji: '🌱', title: 'First Quest',      desc: 'Complete your first eco-quest.',       threshold: 1,   type: 'quests'  },
  { id: 'b2', emoji: '🔥', title: 'Streak Starter',  desc: 'Maintain a 3-day quest streak.',        threshold: 3,   type: 'streak'  },
  { id: 'b3', emoji: '⚡', title: 'Power Saver',     desc: 'Earn 200 GreenPoints total.',           threshold: 200, type: 'gp'      },
  { id: 'b4', emoji: '💧', title: 'Water Wise',      desc: 'Complete Cold Wash quest 3 times.',     threshold: 3,   type: 'q3_count'},
  { id: 'b5', emoji: '🌿', title: 'Eco Streak',      desc: 'Maintain a 7-day streak.',              threshold: 7,   type: 'streak'  },
  { id: 'b6', emoji: '🏆', title: 'GP Champion',     desc: 'Earn 500 GreenPoints total.',           threshold: 500, type: 'gp'      },
  { id: 'b7', emoji: '🚌', title: 'Green Commuter',  desc: 'Complete Green Transport quest.',       threshold: 1,   type: 'q6_count'},
  { id: 'b8', emoji: '🌍', title: 'Planet Protector',desc: 'Reach Level 4: Eco Champion.',          threshold: 4,   type: 'level'   },
];

// ─── Context ──────────────────────────────────────────────────────────────────
const GPContext = createContext(null);

export function GPProvider({ children }) {
  const [totalGP, setTotalGP]               = useState(340);
  const [streak, setStreak]                 = useState(5);
  const [completedQuestIds, setCompleted]   = useState(new Set());
  const [questCompletionLog, setLog]        = useState({}); // { questId: count }

  const completeQuest = useCallback((questId, gp) => {
    setCompleted((prev) => {
      if (prev.has(questId)) return prev;           // already done today — no double award
      const next = new Set(prev);
      next.add(questId);
      return next;
    });
    setTotalGP((p) => p + gp);
    setLog((prev) => ({ ...prev, [questId]: (prev[questId] ?? 0) + 1 }));
  }, []);

  const isCompleted = useCallback(
    (questId) => completedQuestIds.has(questId),
    [completedQuestIds],
  );

  // Derived badge unlock state
  const unlockedBadgeIds = (() => {
    const unlocked = new Set();
    const { level: lvl } = require('../theme/theme').getLevel(totalGP);
    BADGE_CATALOGUE.forEach((b) => {
      if (b.type === 'quests'  && completedQuestIds.size >= b.threshold) unlocked.add(b.id);
      if (b.type === 'streak'  && streak >= b.threshold)                  unlocked.add(b.id);
      if (b.type === 'gp'      && totalGP >= b.threshold)                 unlocked.add(b.id);
      if (b.type === 'level'   && lvl >= b.threshold)                     unlocked.add(b.id);
      if (b.type === 'q3_count'&& (questCompletionLog['q3'] ?? 0) >= b.threshold) unlocked.add(b.id);
      if (b.type === 'q6_count'&& (questCompletionLog['q6'] ?? 0) >= b.threshold) unlocked.add(b.id);
    });
    return unlocked;
  })();

  return (
    <GPContext.Provider
      value={{
        totalGP,
        streak,
        completedQuestIds,
        questCompletionLog,
        quests: QUEST_CATALOGUE,
        completeQuest,
        isCompleted,
        unlockedBadgeIds,
      }}
    >
      {children}
    </GPContext.Provider>
  );
}

export const useGP = () => {
  const ctx = useContext(GPContext);
  if (!ctx) throw new Error('useGP must be used within <GPProvider>');
  return ctx;
};
