/**
 * validators.ts
 */

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPassword = (password: string): boolean => {
  // 최소 8자, 영문 + 숫자 각 1자 이상
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
};

export const isNotEmpty = (value: string): boolean => {
  return value.trim().length > 0;
};

export const isMaxLength = (value: string, max: number): boolean => {
  return value.length <= max;
};
