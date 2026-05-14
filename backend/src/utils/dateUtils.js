const KST_OFFSET_MS = 9 * 60 * 60 * 1000; // UTC+9

function getTodayKST() {
  const now = new Date();
  const kstDate = new Date(now.getTime() + KST_OFFSET_MS);
  return kstDate.toISOString().slice(0, 10); // 'YYYY-MM-DD'
}

function isValidDateFormat(dateStr) {
  if (typeof dateStr !== 'string') return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  // 형식적으로 올바르지만 존재하지 않는 날짜(예: 2026-02-30) 거부
  const parsed = new Date(dateStr);
  return !isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === dateStr;
}

function isValidDueDate(dateStr) {
  // BR-07: KST 기준 오늘 이상이어야 함 (당일 허용)
  if (!isValidDateFormat(dateStr)) return false;
  return dateStr >= getTodayKST();
}

function isValidDateRange(from, to) {
  // from <= to 검증
  if (!isValidDateFormat(from) || !isValidDateFormat(to)) return false;
  return from <= to;
}

module.exports = { getTodayKST, isValidDueDate, isValidDateFormat, isValidDateRange };
