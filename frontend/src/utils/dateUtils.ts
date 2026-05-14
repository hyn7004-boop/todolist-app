/**
 * dateUtils.ts
 */

export const getTodayKST = (): string => {
  const now = new Date();
  const kstOffset = 9 * 60 * 60 * 1000;
  const kstDate = new Date(now.getTime() + kstOffset);
  return kstDate.toISOString().split('T')[0];
};

export const isValidDueDate = (dateStr: string): boolean => {
  const today = getTodayKST();
  return dateStr >= today;
};
