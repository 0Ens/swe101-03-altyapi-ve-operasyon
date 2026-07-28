import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculateAllowedDowntime, formatDuration } from './errorBudget.js';

test('%99,9 SLO / 30 gün -> 2592 saniye', () => {
  assert.equal(calculateAllowedDowntime(99.9, 30), 9999); // bilerek kırıldı: pipeline'ı kanıtlamak için
});

test('%100 SLO (sınır değer) -> 0 saniye kesinti', () => {
  assert.equal(calculateAllowedDowntime(100, 30), 0);
});

test('%0 SLO (sınır değer) -> tüm pencere kesinti', () => {
  assert.equal(calculateAllowedDowntime(0, 30), 30 * 24 * 60 * 60);
});

test('negatif SLO geçersiz -> hata fırlatır', () => {
  assert.throws(() => calculateAllowedDowntime(-5, 30));
});

test("100'den büyük SLO geçersiz -> hata fırlatır", () => {
  assert.throws(() => calculateAllowedDowntime(150, 30));
});

test('geçersiz zaman penceresi (0 veya negatif) -> hata fırlatır', () => {
  assert.throws(() => calculateAllowedDowntime(99.9, 0));
  assert.throws(() => calculateAllowedDowntime(99.9, -1));
});

test('formatDuration: 2592 sn -> "43 dk 12 sn"', () => {
  assert.equal(formatDuration(2592), '43 dk 12 sn');
});

test('formatDuration: 0 sn -> "0 sn"', () => {
  assert.equal(formatDuration(0), '0 sn');
});

test('formatDuration: negatif süre -> hata fırlatır', () => {
  assert.throws(() => formatDuration(-1));
});
