import { prisma } from "../lib/prisma";

export interface AnalyticsGraphData {
  points: string;
  labels: string[];
  yAxis: string[];
  total: string;
  successRate: string;
}

export interface HomeAnalyticsResponse {
  cards: {
    totalWorkflows: number;
    executionsToday: number;
    executionsYesterday: number;
    percentChangeVsYesterday: number | null;
    successRate: number;
    totalExecutions: number;
    completedExecutions: number;
    failedExecutions: number;
  };
  graph: {
    Today: AnalyticsGraphData;
    "7 Days": AnalyticsGraphData;
    "30 Days": AnalyticsGraphData;
  };
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
  return num.toString();
}

function getYAxisTicks(maxVal: number): { ticks: string[]; maxTick: number } {
  if (maxVal <= 0) {
    return { ticks: ["10", "8", "5", "2", "0"], maxTick: 10 };
  }
  let step: number;
  if (maxVal <= 5) step = 1;
  else if (maxVal <= 20) step = 5;
  else if (maxVal <= 100) step = 20;
  else if (maxVal <= 500) step = 100;
  else if (maxVal <= 2000) step = 500;
  else step = Math.ceil(maxVal / 4 / 1000) * 1000;

  const maxTick = Math.max(step * 4, Math.ceil(maxVal / step) * step);
  const ticks = [
    formatNumber(maxTick),
    formatNumber(Math.round(maxTick * 0.75)),
    formatNumber(Math.round(maxTick * 0.5)),
    formatNumber(Math.round(maxTick * 0.25)),
    "0",
  ];
  return { ticks, maxTick };
}

function buildSvgPoints(counts: number[], maxTick: number): string {
  const n = counts.length;
  if (n <= 1) return "0,90 100,90";

  return counts
    .map((count, i) => {
      const x = Math.round((i / (n - 1)) * 100);
      const y = Math.round(90 - (count / maxTick) * 75);
      return `${x},${Math.max(10, Math.min(95, y))}`;
    })
    .join(" ");
}

export const getHomeAnalytics = async (
  userId: string,
): Promise<HomeAnalyticsResponse> => {
  const now = new Date();

  // Start of today (local time)
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  // Start of yesterday
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);

  // 7 days ago
  const startOf7DaysAgo = new Date(startOfToday);
  startOf7DaysAgo.setDate(startOf7DaysAgo.getDate() - 6);

  // 30 days ago
  const startOf30DaysAgo = new Date(startOfToday);
  startOf30DaysAgo.setDate(startOf30DaysAgo.getDate() - 29);

  // 1. Total workflows for user
  const totalWorkflows = await prisma.workflow.count({
    where: { userId },
  });

  // 2. Fetch all executions for this user in the last 30 days (for graph + cards)
  const executionsLast30Days = await prisma.workflowExecution.findMany({
    where: {
      userId,
      startedAt: { gte: startOf30DaysAgo },
    },
    select: {
      id: true,
      status: true,
      startedAt: true,
    },
    orderBy: { startedAt: "asc" },
  });

  // 3. Lifetime totals for user
  const [totalExecutions, completedExecutions, failedExecutions] =
    await Promise.all([
      prisma.workflowExecution.count({ where: { userId } }),
      prisma.workflowExecution.count({
        where: { userId, status: "COMPLETED" },
      }),
      prisma.workflowExecution.count({
        where: { userId, status: "FAILED" },
      }),
    ]);

  // Overall success rate = (completed / total) * 100
  const successRate =
    totalExecutions > 0
      ? Math.round((completedExecutions / totalExecutions) * 1000) / 10
      : 0;

  // Executions Today
  const executionsTodayList = executionsLast30Days.filter(
    (e) => e.startedAt >= startOfToday,
  );
  const executionsToday = executionsTodayList.length;

  // Executions Yesterday
  const executionsYesterdayList = executionsLast30Days.filter(
    (e) => e.startedAt >= startOfYesterday && e.startedAt < startOfToday,
  );
  const executionsYesterday = executionsYesterdayList.length;

  let percentChangeVsYesterday: number | null = null;
  if (executionsYesterday > 0) {
    percentChangeVsYesterday = Math.round(
      ((executionsToday - executionsYesterday) / executionsYesterday) * 100,
    );
  }

  // --- Graph: Today (7 intervals: 00:00, 04:00, 08:00, 12:00, 16:00, 20:00, Now) ---
  const todayLabels = ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "Now"];
  const todayCounts = [0, 0, 0, 0, 0, 0, 0];
  let todayCompleted = 0;

  executionsTodayList.forEach((e) => {
    if (e.status === "COMPLETED") todayCompleted++;
    const hours = e.startedAt.getHours();
    const bucket = Math.min(Math.floor(hours / 4), 5);
    todayCounts[bucket] = (todayCounts[bucket] ?? 0) + 1;
  });
  // The 7th point represents current/latest activity
  todayCounts[6] = executionsTodayList.filter(
    (e) => now.getTime() - e.startedAt.getTime() <= 60 * 60 * 1000,
  ).length;

  const todayMax = Math.max(...todayCounts);
  const todayYAxis = getYAxisTicks(todayMax);
  const todayPoints = buildSvgPoints(todayCounts, todayYAxis.maxTick);
  const todaySuccessRate =
    executionsToday > 0
      ? `${((todayCompleted / executionsToday) * 100).toFixed(1)}%`
      : "0%";

  // --- Graph: 7 Days (7 daily intervals) ---
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const sevenDaysLabels: string[] = [];
  const sevenDaysCounts: number[] = [];
  let sevenDaysCompleted = 0;
  let sevenDaysTotal = 0;

  for (let i = 0; i < 7; i++) {
    const d = new Date(startOf7DaysAgo);
    d.setDate(d.getDate() + i);
    const dayStart = new Date(d);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    sevenDaysLabels.push(daysOfWeek[dayStart.getDay()] ?? "Day");

    const dayRuns = executionsLast30Days.filter(
      (e) => e.startedAt >= dayStart && e.startedAt < dayEnd,
    );
    sevenDaysCounts.push(dayRuns.length);
    sevenDaysTotal += dayRuns.length;
    sevenDaysCompleted += dayRuns.filter((e) => e.status === "COMPLETED").length;
  }

  const sevenDaysMax = Math.max(...sevenDaysCounts);
  const sevenDaysYAxis = getYAxisTicks(sevenDaysMax);
  const sevenDaysPoints = buildSvgPoints(sevenDaysCounts, sevenDaysYAxis.maxTick);
  const sevenDaysSuccessRate =
    sevenDaysTotal > 0
      ? `${((sevenDaysCompleted / sevenDaysTotal) * 100).toFixed(1)}%`
      : "0%";

  // --- Graph: 30 Days (5 intervals: 6-day buckets) ---
  const thirtyDaysLabels: string[] = [];
  const thirtyDaysCounts: number[] = [];
  let thirtyDaysCompleted = 0;
  let thirtyDaysTotal = 0;

  for (let i = 0; i < 5; i++) {
    const bStart = new Date(startOf30DaysAgo);
    bStart.setDate(bStart.getDate() + i * 6);
    bStart.setHours(0, 0, 0, 0);

    const bEnd = new Date(bStart);
    bEnd.setDate(bEnd.getDate() + 6);

    thirtyDaysLabels.push(`Day ${i * 6 + 1}`);

    const bucketRuns = executionsLast30Days.filter(
      (e) => e.startedAt >= bStart && e.startedAt < bEnd,
    );
    thirtyDaysCounts.push(bucketRuns.length);
    thirtyDaysTotal += bucketRuns.length;
    thirtyDaysCompleted += bucketRuns.filter(
      (e) => e.status === "COMPLETED",
    ).length;
  }

  const thirtyDaysMax = Math.max(...thirtyDaysCounts);
  const thirtyDaysYAxis = getYAxisTicks(thirtyDaysMax);
  const thirtyDaysPoints = buildSvgPoints(
    thirtyDaysCounts,
    thirtyDaysYAxis.maxTick,
  );
  const thirtyDaysSuccessRate =
    thirtyDaysTotal > 0
      ? `${((thirtyDaysCompleted / thirtyDaysTotal) * 100).toFixed(1)}%`
      : "0%";

  return {
    cards: {
      totalWorkflows,
      executionsToday,
      executionsYesterday,
      percentChangeVsYesterday,
      successRate,
      totalExecutions,
      completedExecutions,
      failedExecutions,
    },
    graph: {
      Today: {
        points: todayPoints,
        labels: todayLabels,
        yAxis: todayYAxis.ticks,
        total: executionsToday.toLocaleString(),
        successRate: todaySuccessRate,
      },
      "7 Days": {
        points: sevenDaysPoints,
        labels: sevenDaysLabels,
        yAxis: sevenDaysYAxis.ticks,
        total: sevenDaysTotal.toLocaleString(),
        successRate: sevenDaysSuccessRate,
      },
      "30 Days": {
        points: thirtyDaysPoints,
        labels: thirtyDaysLabels,
        yAxis: thirtyDaysYAxis.ticks,
        total: thirtyDaysTotal.toLocaleString(),
        successRate: thirtyDaysSuccessRate,
      },
    },
  };
};
