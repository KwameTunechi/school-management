export type Grade = 'A1' | 'B2' | 'B3' | 'C4' | 'C5' | 'C6' | 'D7' | 'E8' | 'F9';

export function getGrade(total: number): Grade {
  if (total >= 90) return 'A1';
  if (total >= 80) return 'B2';
  if (total >= 70) return 'B3';
  if (total >= 60) return 'C4';
  if (total >= 55) return 'C5';
  if (total >= 50) return 'C6';
  if (total >= 45) return 'D7';
  if (total >= 40) return 'E8';
  return 'F9';
}

export function getGradeRemark(grade: Grade): string {
  switch (grade) {
    case 'A1': return 'Excellent';
    case 'B2': return 'Very Good';
    case 'B3': return 'Good';
    case 'C4': return 'Credit';
    case 'C5': return 'Credit';
    case 'C6': return 'Credit';
    case 'D7': return 'Pass';
    case 'E8': return 'Pass';
    case 'F9': return 'Fail';
  }
}

export function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
