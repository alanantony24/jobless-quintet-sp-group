// ─────────────────────────────────────────────────────────────────────────────
// Energy Data Service
//
// Fetches appliance-breakdown data from the ML backend.
// Falls back to local random generation when the API is unreachable
// (so the app always works, even without the server).
// ─────────────────────────────────────────────────────────────────────────────

// *** Backend URL – deployed on Render ***
const API_BASE = "https://joulebuddy-backend.onrender.com";

const CHART_COLORS = ["#FF6B6B", "#FFB84D", "#4ECDC4", "#A78BFA"];

// ── API-based fetching ──────────────────────────────────────────────────────

function fetchWithTimeout(url, timeoutMs = 60000) {
  return Promise.race([
    fetch(url),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout after ${timeoutMs}ms`)), timeoutMs),
    ),
  ]);
}

export async function fetchEnergyFromAPI() {
  console.log("[EnergyService] Attempting to fetch from:", API_BASE);
  try {
    const [daily, weekly, monthly] = await Promise.all([
      fetchWithTimeout(`${API_BASE}/api/energy?period=daily`).then((r) => r.json()),
      fetchWithTimeout(`${API_BASE}/api/energy?period=weekly`).then((r) => r.json()),
      fetchWithTimeout(`${API_BASE}/api/energy?period=monthly`).then((r) => r.json()),
    ]);
    console.log("[EnergyService] ✓ API data received successfully");

    // The API returns data in the same shape the app expects,
    // but insight.text1 needs to be a function (the API sends raw strings).
    // We wrap them here so Home.js doesn't need to change.
    const wrapInsight = (apiData, periodLabel) => {
      const dom = apiData.data.reduce(
        (a, b) => (b.pct > a.pct ? b : a),
        apiData.data[0],
      );
      return {
        ...apiData,
        subtitle: `${apiData.label} by category`,
        insight: {
          text1: (_dom) =>
            `${dom.name} accounted for ${dom.pct}% of your electricity ${periodLabel} — the largest category. (ML model, ${apiData.modelAccuracy}% accuracy)`,
          text2: `Peak usage detected around ${apiData.insight.peak}. This prediction is based on our ML model trained on 100K household readings.`,
          peak: apiData.insight.peak,
          savings: `${apiData.insight.savings}/${periodLabel === "today" ? "day" : periodLabel === "this week" ? "week" : "month"}`,
        },
      };
    };

    return {
      daily: wrapInsight(daily, "today"),
      weekly: wrapInsight(weekly, "this week"),
      monthly: wrapInsight(monthly, "this month"),
      source: "ml-model",
      timing: {
        daily: daily.timing || null,
        weekly: weekly.timing || null,
        monthly: monthly.timing || null,
      },
    };
  } catch (err) {
    console.warn("[EnergyService] ✗ API call failed:", err.message);
    console.warn("[EnergyService] Make sure API_BASE IP is your Wi-Fi IP (not VirtualBox). Current:", API_BASE);
    return null;
  }
}

export async function fetchQuickStatsFromAPI() {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/api/quick-stats`);
    return await res.json();
  } catch (err) {
    console.warn("[EnergyService] Quick stats fetch failed:", err.message);
    return null;
  }
}

export async function fetchAIInsight(period = "monthly") {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/api/ai-insight?period=${period}`, 15000);
    const data = await res.json();
    console.log("[EnergyService] ✓ AI insight received (source:", data.source, ")");
    return data;
  } catch (err) {
    console.warn("[EnergyService] AI insight fetch failed:", err.message);
    return null;
  }
}

export async function fetchEnergyTiming(period = "monthly", fallbackTotalKwh = null) {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/api/energy-timing?period=${period}`);
    const data = await res.json();
    if (data && data.data && data.data.length >= 3) {
      console.log("[EnergyService] ✓ Timing data received (source:", data.dataSource, ")");
      return data;
    }
    console.warn("[EnergyService] Timing API returned unexpected shape, using fallback");
    return generateTimingData(period, fallbackTotalKwh);
  } catch (err) {
    console.warn("[EnergyService] Timing data fetch failed:", err.message, "— using fallback");
    return generateTimingData(period, fallbackTotalKwh);
  }
}

export async function fetchAllTimingData(totals = {}) {
  const periods = ["daily", "weekly", "monthly"];
  const results = {};
  for (const p of periods) {
    results[p] = await fetchEnergyTiming(p, totals[p] ?? null);
  }
  return results;
}

function generateTimingData(period = "monthly", suppliedTotal = null) {
  // Realistic Singapore household timing split:
  //   Off-Peak (11 PM – 7 AM):  ~25-32% — baseload, fridge, water heater
  //   Normal   (7 AM – 6 PM):   ~33-40% — daytime appliances
  //   Peak     (6 PM – 11 PM):  ~30-38% — AC, cooking, entertainment
  const totalKwh = suppliedTotal != null ? round1(suppliedTotal) : round1(rand(11, 15) * (period === "daily" ? 1 : period === "weekly" ? 7 : 30));

  const offPeakPct = Math.round(rand(25, 32));
  const peakPct = Math.round(rand(30, 38));
  const normalPct = 100 - offPeakPct - peakPct;

  const data = [
    { name: "Off-Peak", value: round1((offPeakPct / 100) * totalKwh), pct: offPeakPct, color: "#3B82F6" },
    { name: "Normal",   value: round1((normalPct / 100) * totalKwh),  pct: normalPct,  color: "#10B981" },
    { name: "Peak",     value: round1((peakPct / 100) * totalKwh),    pct: peakPct,     color: "#F59E0B" },
  ];

  data.sort((a, b) => b.pct - a.pct);

  return { data, totalKwh, dataSource: "local" };
}

// ── Local fallback (original random generation) ─────────────────────────────

const CATEGORIES = [
  { name: "Cooling", minPct: 40, maxPct: 48 },
  { name: "Laundry", minPct: 22, maxPct: 28 },
  { name: "Kitchen", minPct: 18, maxPct: 22 },
  { name: "Baseload", minPct: 8, maxPct: 12 },
];

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function round1(v) {
  return Math.round(v * 10) / 10;
}

function buildCategoryData(totalKwh) {
  const raw = CATEGORIES.map((c) => ({
    name: c.name,
    rawPct: rand(c.minPct, c.maxPct),
  }));
  const sum = raw.reduce((s, r) => s + r.rawPct, 0);

  return raw.map((r, i) => {
    const pct = Math.round((r.rawPct / sum) * 100);
    return {
      name: r.name,
      value: round1((pct / 100) * totalKwh),
      pct,
      color: CHART_COLORS[i],
    };
  });
}

function peakHoursText() {
  const starts = [6, 7, 8];
  const s = starts[Math.floor(Math.random() * starts.length)];
  return `${s} PM – ${s + 3} PM`;
}

export function generateEnergyData() {
  const monthlyTotal = round1(rand(350, 450));
  const weeklyTotal = round1(monthlyTotal / 4.3);
  const dailyTotal = round1(monthlyTotal / 30);

  const today = new Date();
  const day = today.getDate();
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const mon = monthNames[today.getMonth()];
  const year = today.getFullYear();
  const weekStart = Math.max(1, day - 6);

  const dailyData = buildCategoryData(dailyTotal);
  const weeklyData = buildCategoryData(weeklyTotal);
  const monthlyData = buildCategoryData(monthlyTotal);

  const peak = peakHoursText();

  return {
    daily: {
      label: "Today",
      badge: `${day} ${mon} ${year}`,
      subtitle: "Today by category",
      data: dailyData,
      insight: {
        text1: (dom) =>
          `${dom.name} accounted for the highest electricity usage today (${dom.pct}%).`,
        text2: `Most of this usage occurred between ${peak}. This likely corresponds to air conditioning during evening hours.`,
        peak,
        savings: `$${round1(dailyTotal * 0.012)}/day`,
      },
    },
    weekly: {
      label: "This Week",
      badge: `${weekStart} – ${day} ${mon}`,
      subtitle: "This week by category",
      data: weeklyData,
      insight: {
        text1: (dom) =>
          `${dom.name} was your top consumer this week at ${dom.pct}% of total usage.`,
        text2: `Usage peaked on weekday evenings (Mon – Fri, ${peak}). Weekend usage was 30% lower.`,
        peak: "Weekday evenings",
        savings: `$${round1(weeklyTotal * 0.012)}/week`,
      },
    },
    monthly: {
      label: "This Month",
      badge: `${mon} ${year}`,
      subtitle: "This month by category",
      data: monthlyData,
      insight: {
        text1: (dom) =>
          `${dom.name} accounted for ${dom.pct}% of your electricity this month — the largest category.`,
        text2:
          "Your cooling usage is 8% higher than the neighbourhood average. Adjusting AC temperature could yield significant savings.",
        peak: `Evenings, ${peak}`,
        savings: `$${round1(monthlyTotal * 0.012)}/month`,
      },
    },
    source: "local",
  };
}

export function computeQuickStats(monthlyData) {
  const totalKwh = monthlyData.reduce((s, d) => s + d.value, 0);
  const efficiency = Math.round(rand(82, 94));
  const saved = round1(totalKwh * 0.012 * rand(0.8, 1.2));
  const carbon = Math.round(totalKwh * 0.11);

  return [
    { label: "Avg. Efficiency", value: `${efficiency}%` },
    { label: "Total Saved", value: `$${saved}` },
    { label: "Carbon Offset", value: `${carbon} kg` },
    { label: "Peak Hours", value: "7–10 PM" },
  ];
}
