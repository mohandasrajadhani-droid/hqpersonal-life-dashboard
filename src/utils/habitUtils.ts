import { Habit, HabitCategory } from '../types';

export interface HabitStreakInfo {
  currentStreak: number;
  longestStreak: number;
  completedToday: boolean;
  completedYesterday: boolean;
  totalCompletions: number;
  completionRate30Days: number;
}

export interface DayStatus {
  date: string; // YYYY-MM-DD
  dayName: string; // Mon, Tue, etc.
  dayNumber: number;
  isToday: boolean;
  isCompleted: boolean;
}

/**
 * Format a Date object as YYYY-MM-DD in local time
 */
export function formatLocalDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Get date string offset by N days from given date
 */
export function offsetDateString(baseDateStr: string, offsetDays: number): string {
  const [y, m, d] = baseDateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + offsetDays);
  return formatLocalDate(date);
}

/**
 * Calculate streak and consistency metrics for a habit.
 */
export function calculateHabitStreak(
  completedDates: string[] = [],
  todayStr: string
): HabitStreakInfo {
  const dateSet = new Set(completedDates);
  const completedToday = dateSet.has(todayStr);
  const yesterdayStr = offsetDateString(todayStr, -1);
  const completedYesterday = dateSet.has(yesterdayStr);

  // Calculate Current Streak
  let currentStreak = 0;
  // If today is completed, walk backwards from today.
  // If today is not completed yet, walk backwards from yesterday (streak is not broken yet today!)
  let checkDate = completedToday ? todayStr : completedYesterday ? yesterdayStr : null;

  if (checkDate) {
    while (dateSet.has(checkDate)) {
      currentStreak++;
      checkDate = offsetDateString(checkDate, -1);
    }
  }

  // Calculate Longest Streak
  let longestStreak = 0;
  if (completedDates.length > 0) {
    const sortedDates = Array.from(dateSet).sort();
    let tempStreak = 0;
    let prevDate: Date | null = null;

    for (const dStr of sortedDates) {
      const [y, m, d] = dStr.split('-').map(Number);
      const curr = new Date(y, m - 1, d);

      if (prevDate === null) {
        tempStreak = 1;
      } else {
        const diffMs = curr.getTime() - prevDate.getTime();
        const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          tempStreak++;
        } else if (diffDays > 1) {
          tempStreak = 1;
        }
      }
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
      prevDate = curr;
    }
  }

  // 30-Day Completion Rate
  let past30Count = 0;
  for (let i = 0; i < 30; i++) {
    const dStr = offsetDateString(todayStr, -i);
    if (dateSet.has(dStr)) {
      past30Count++;
    }
  }
  const completionRate30Days = Math.round((past30Count / 30) * 100);

  return {
    currentStreak,
    longestStreak: Math.max(longestStreak, currentStreak),
    completedToday,
    completedYesterday,
    totalCompletions: dateSet.size,
    completionRate30Days,
  };
}

/**
 * Get recent N days status for a habit (e.g., past 7 days for the mini dot matrix)
 */
export function getRecentDaysStatus(
  completedDates: string[] = [],
  todayStr: string,
  numDays: number = 7
): DayStatus[] {
  const dateSet = new Set(completedDates);
  const result: DayStatus[] = [];

  for (let i = numDays - 1; i >= 0; i--) {
    const dStr = offsetDateString(todayStr, -i);
    const [y, m, d] = dStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });

    result.push({
      date: dStr,
      dayName,
      dayNumber: d,
      isToday: dStr === todayStr,
      isCompleted: dateSet.has(dStr),
    });
  }

  return result;
}

export interface HabitPreset {
  name: string;
  category: HabitCategory;
  frequency: 'daily' | 'weekdays';
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'anytime';
  color: string;
  icon: string;
  description: string;
}

export const HABIT_PRESETS: HabitPreset[] = [
  {
    name: 'Daily Exercise / Workout',
    category: 'fitness',
    frequency: 'daily',
    timeOfDay: 'morning',
    color: 'emerald',
    icon: 'Dumbbell',
    description: '30 mins of gym, running, yoga, or home workout',
  },
  {
    name: 'Read 20 Minutes',
    category: 'learning',
    frequency: 'daily',
    timeOfDay: 'evening',
    color: 'blue',
    icon: 'BookOpen',
    description: 'Read non-fiction, fiction, or educational articles',
  },
  {
    name: 'Drink 2.5L Water',
    category: 'health',
    frequency: 'daily',
    timeOfDay: 'anytime',
    color: 'cyan',
    icon: 'Droplets',
    description: 'Stay properly hydrated throughout the day',
  },
  {
    name: 'Morning Meditation',
    category: 'mindfulness',
    frequency: 'daily',
    timeOfDay: 'morning',
    color: 'violet',
    icon: 'Brain',
    description: '10-15 mins of breathwork or mindfulness meditation',
  },
  {
    name: '10,000 Daily Steps',
    category: 'fitness',
    frequency: 'daily',
    timeOfDay: 'anytime',
    color: 'teal',
    icon: 'Footprints',
    description: 'Maintain active movement and cardiovascular health',
  },
  {
    name: 'Night Journaling & Reflection',
    category: 'lifestyle',
    frequency: 'daily',
    timeOfDay: 'evening',
    color: 'amber',
    icon: 'Moon',
    description: 'Write down 3 gratitudes and review the day',
  },
];

export const HABIT_CATEGORIES: { id: HabitCategory; label: string; color: string }[] = [
  { id: 'fitness', label: 'Fitness & Movement', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400' },
  { id: 'health', label: 'Health & Nutrition', color: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-950/40 dark:text-cyan-400' },
  { id: 'mindfulness', label: 'Mindfulness & Peace', color: 'text-violet-600 bg-violet-50 dark:bg-violet-950/40 dark:text-violet-400' },
  { id: 'learning', label: 'Learning & Growth', color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400' },
  { id: 'productivity', label: 'Focus & Productivity', color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400' },
  { id: 'lifestyle', label: 'Lifestyle & Sleep', color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-400' },
  { id: 'other', label: 'Other Habits', color: 'text-slate-600 bg-slate-50 dark:bg-slate-800 dark:text-slate-300' },
];
