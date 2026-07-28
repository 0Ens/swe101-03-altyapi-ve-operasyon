# Error Budget Hesaplayıcısı

Bir SLO (Service Level Objective) yüzdesi ve bir zaman penceresi girildiğinde,
o pencere içinde izin verilen toplam kesinti (downtime) süresini hesaplayan
tek sayfalık bir web uygulaması. Her push'ta testler otomatik koşar; testler
geçerse site otomatik olarak GitHub Pages'e yayınlanır.

**Canlı site:** https://0ens.github.io/swe101-03-altyapi-ve-operasyon/

## Kurulum

Bağımlılık yok, sadece Node.js (v18+) gerekiyor.

```bash
git clone https://github.com/0Ens/swe101-03-altyapi-ve-operasyon.git
cd swe101-03-altyapi-ve-operasyon
```

Sayfayı yerelde açmak için basit bir HTTP sunucusu gerekir (dosyayı doğrudan
`file://` ile açmak, tarayıcının ES module `import`'larını CORS nedeniyle
engellemesine yol açar):

```bash
python -m http.server 8000
# tarayıcıda http://localhost:8000 adresini aç
```

## Testleri çalıştırma

```bash
npm test
```

Node'un yerleşik test çalıştırıcısını (`node:test`) kullanır, ek bağımlılık
kurulmaz. `errorBudget.test.js` içinde 9 test var; SLO için sınır değerleri
(%100, %0, negatif, 100'den büyük) ve `formatDuration` için ayrı senaryoları
kapsıyor.

## Hesap mantığı

`errorBudget.js` içinde iki saf fonksiyon var:

- `calculateAllowedDowntime(sloPercent, windowDays)` → izinli kesinti
  süresini **saniye** olarak döndürür. Formül: `pencere_saniye × (100 − SLO) / 100`.
- `formatDuration(totalSeconds)` → saniyeyi `"43 dk 12 sn"` gibi okunur
  bir metne çevirir.

Örnek: %99,9 SLO, 30 gün → 2.592.000 sn × %0,1 = 2592 sn = **43 dk 12 sn**.

## Pipeline akışı

```
push (main) ─▶ [test job]
                  │  npm test
                  │
        ┌─────────┴─────────┐
        │                   │
   testler geçti        testler kırık
        │                   │
        ▼                   ▼
  [deploy job]          (deploy job hiç
   needs: test           tetiklenmez —
   GitHub Pages'e         pipeline durur)
   yayınla
```

`.github/workflows/ci.yml` içinde iki ayrı job var: `test` ve `deploy`.
`deploy` job'ı `needs: test` ile `test` job'ına bağımlı — yani `test` fail
olursa `deploy` **hiç çalışmaz**. Bunu kanıtlamak için Actions geçmişinde
bilerek kırılmış bir test koşusu duruyor: bir commit'te beklenen değer
bilerek yanlış yazıldı, push'landı, `test` job'ı fail oldu ve `deploy` job'ı
tetiklenmedi (0 saniyede skip). Bir sonraki commit'te düzeltilip tekrar
push'landı ve pipeline tekrar yeşile döndü.

## Ne öğrendim

- "Tersini almak" ile "yüzde 100'e tamamlamak" farklı şeyler: %99,9 → %0,1
  kesinti oranı direkt `100 − SLO` ile bulunuyor; `toplam × 100/SLO` gibi bir
  bölme yapmak yanlış (ve fazladan kesintiyi de içeren şişirilmiş bir sayı
  veriyor) — bu hatayı kağıt üstünde yaparken yakaladım.
- `deploy` job'ının `test` job'ına `needs:` ile bağımlı olması, pipeline'ın
  asıl koruma mekanizması. Aynı job içinde art arda adımlar olsaydı bu
  garantiyi bu kadar net ve görünür şekilde ifade edemezdik.
- Statik bir sayfada `type="module"` ile `import` kullanmak `file://`
  protokolünde CORS hatasına takılıyor; gerçek (hatta yerel) bir HTTP
  sunucusu gerekiyor. GitHub Pages zaten HTTP üzerinden servis ettiği için
  prod'da sorun çıkmıyor ama yerel test sırasında bunu gördüm.
- Kırık bir testi bilerek push'layıp Actions'ta kırmızı koşuyu görmek,
  pipeline'ın "çalıştığını iddia etmek" ile "çalıştığını kanıtlamak"
  arasındaki farkı gösterdi.
