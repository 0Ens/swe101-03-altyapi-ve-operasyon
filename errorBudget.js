export function calculateAllowedDowntime(sloPercent, windowDays) {
  if (typeof sloPercent !== 'number' || Number.isNaN(sloPercent) || sloPercent < 0 || sloPercent > 100) {
    throw new Error('SLO yüzdesi 0 ile 100 arasında olmalı');
  }
  if (typeof windowDays !== 'number' || Number.isNaN(windowDays) || windowDays <= 0) {
    throw new Error('Zaman penceresi pozitif bir sayı olmalı');
  }

  const windowSeconds = windowDays * 24 * 60 * 60;
  const downtimeSeconds = windowSeconds * (100 - sloPercent) / 100;

  // Kayan nokta hassasiyet hatalarını (ör. 100 - 99.9) temizler.
  return Math.round(downtimeSeconds * 1000) / 1000;
}

export function formatDuration(totalSeconds) {
  if (typeof totalSeconds !== 'number' || Number.isNaN(totalSeconds) || totalSeconds < 0) {
    throw new Error('Süre negatif olamaz');
  }

  const days = Math.floor(totalSeconds / 86400);
  let remainder = totalSeconds - days * 86400;
  const hours = Math.floor(remainder / 3600);
  remainder -= hours * 3600;
  const minutes = Math.floor(remainder / 60);
  const seconds = Math.round(remainder - minutes * 60);

  const parts = [];
  if (days > 0) parts.push(`${days} gün`);
  if (hours > 0) parts.push(`${hours} sa`);
  if (minutes > 0) parts.push(`${minutes} dk`);
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds} sn`);

  return parts.join(' ');
}
