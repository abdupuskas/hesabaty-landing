export function toStored(egp: number): number {
  return Math.round(egp * 100);
}

export function toDisplay(stored: number): number {
  return stored / 100;
}

export function formatEGP(stored: number, locale: string = 'en-EG'): string {
  const tag = locale === 'ar' ? 'ar-EG' : 'en-EG';
  return (stored / 100).toLocaleString(tag, {
    style: 'currency',
    currency: 'EGP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
