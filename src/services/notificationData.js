// ─────────────────────────────────────────────────────────────────────────────
// Smart Notification Generator
//
// Generates threshold-based energy notifications:
//   • Congrats when user is BELOW their usage threshold
//   • Nudge/warning when user EXCEEDS their usage threshold
//   • Category insights and tips
// ─────────────────────────────────────────────────────────────────────────────

// SP Group average monthly kWh for a 4-room HDB flat in Singapore
const MONTHLY_THRESHOLD_KWH = 390;
const DAILY_THRESHOLD_KWH = Math.round(MONTHLY_THRESHOLD_KWH / 30); // ~13 kWh

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Generate smart notifications from energy breakdown data.
 * @param {Array} dailyData — array of { name, value, pct, color }
 * @param {Object} opts — optional { monthlyKwh, hourlyData }
 * @returns {Array} notification objects
 */
export function generateSmartNotifications(dailyData, opts = {}) {
  if (!dailyData || dailyData.length === 0) return fallbackNotifications();

  const totalKwh = dailyData.reduce((s, d) => s + d.value, 0);
  const dominant = [...dailyData].sort((a, b) => b.pct - a.pct)[0];
  const monthlyKwh = opts.monthlyKwh || totalKwh * 30;
  const notifications = [];
  let id = 1;

  const aboveMonthly = monthlyKwh > MONTHLY_THRESHOLD_KWH;
  const pctDiff = Math.abs(Math.round(((monthlyKwh - MONTHLY_THRESHOLD_KWH) / MONTHLY_THRESHOLD_KWH) * 100));

  // ── 1. Monthly threshold notification (most important — always first) ──
  if (aboveMonthly) {
    notifications.push({
      id: `n${id++}`,
      title: "Usage above threshold",
      body: `Your projected usage of ${Math.round(monthlyKwh)} kWh is ${pctDiff}% above the ${MONTHLY_THRESHOLD_KWH} kWh threshold for a 4-room HDB. Consider reducing ${dominant.name.toLowerCase()} usage.`,
      time: "Just now",
      read: false,
      icon: "Zap",
      type: "nudge",
    });
  } else {
    notifications.push({
      id: `n${id++}`,
      title: "You're below the threshold!",
      body: `Great job! Your projected usage of ${Math.round(monthlyKwh)} kWh is ${pctDiff}% below the ${MONTHLY_THRESHOLD_KWH} kWh threshold. Keep up the good habits!`,
      time: "Just now",
      read: false,
      icon: "Leaf",
      type: "congrats",
    });
  }

  // ── 2. Daily usage check ───────────────────────────────────────────────
  if (totalKwh > DAILY_THRESHOLD_KWH) {
    const overBy = (totalKwh - DAILY_THRESHOLD_KWH).toFixed(1);
    notifications.push({
      id: `n${id++}`,
      title: "Daily usage exceeds average",
      body: `Today's usage is ${totalKwh.toFixed(1)} kWh — that's ${overBy} kWh over the daily average of ${DAILY_THRESHOLD_KWH} kWh.`,
      time: "1h ago",
      read: false,
      icon: "Zap",
      type: "nudge",
    });
  } else {
    notifications.push({
      id: `n${id++}`,
      title: "Great energy day!",
      body: `Only ${totalKwh.toFixed(1)} kWh used today — that's below the daily average of ${DAILY_THRESHOLD_KWH} kWh. Well done!`,
      time: "1h ago",
      read: true,
      icon: "Leaf",
      type: "congrats",
    });
  }

  // ── 3. Dominant category tip ───────────────────────────────────────────
  if (dominant.pct >= 30) {
    const tips = {
      Cooling: "Try setting your AC to 25°C or using a fan during cooler hours to cut cooling costs.",
      Kitchen: "Batch cooking and using lids can cut kitchen energy by up to 30%.",
      Laundry: "Running full loads during off-peak hours (after 11 PM) saves the most energy.",
      Baseload: "Check for devices left on standby — they add up overnight. Use a smart plug to monitor.",
    };
    notifications.push({
      id: `n${id++}`,
      title: `${dominant.name} is ${dominant.pct}% of usage`,
      body: tips[dominant.name] || "Consider optimising this category to save more.",
      time: "3h ago",
      read: true,
      icon: "Sparkles",
      type: "info",
    });
  }

  // ── 4. Peak hour warning if hourly data available ──────────────────────
  if (opts.hourlyData && opts.hourlyData.length > 0) {
    const peakIdx = opts.hourlyData.reduce((pi, d, i) =>
      d.kwh > opts.hourlyData[pi].kwh ? i : pi, 0
    );
    const h = opts.hourlyData[peakIdx].hour;
    const label = `${h % 12 === 0 ? 12 : h % 12}${h < 12 ? "am" : "pm"}`;
    if (h >= 18 && h <= 23) {
      notifications.push({
        id: `n${id++}`,
        title: "Peak hour usage alert",
        body: `Your highest usage is at ${label} during peak pricing hours (6 PM–11 PM). Shifting usage to off-peak can save up to 20%.`,
        time: "5h ago",
        read: true,
        icon: "Zap",
        type: "nudge",
      });
    }
  }

  // ── 5. Bill estimate ───────────────────────────────────────────────────
  const estimatedBill = Math.round(monthlyKwh * 0.33); // ~$0.33/kWh SP tariff
  notifications.push({
    id: `n${id}`,
    title: "Estimated bill this month",
    body: `Based on current usage, your bill is projected at ~$${estimatedBill}. ${aboveMonthly ? "Reducing usage now could lower it." : "You're on track for a good bill!"}`,
    time: "Today",
    read: true,
    icon: "Receipt",
    type: aboveMonthly ? "nudge" : "info",
  });

  return notifications;
}

/** Static fallback when no energy data is available yet */
function fallbackNotifications() {
  return [
    {
      id: "f1",
      title: "Welcome to JouleBuddy",
      body: "We're analysing your energy data — check back soon for insights.",
      time: "Just now",
      read: false,
      icon: "Sparkles",
      type: "info",
    },
  ];
}
