# Night Ledger

[![make.fun · best-stealth-game-20261121-1759](https://make.fun/badge/best-stealth-game-20261121-1759.svg)](https://make.fun/bounty/best-stealth-game-20261121-1759?utm_source=github&utm_medium=readme&utm_campaign=best-stealth-game-20261121-1759)
[![rank](https://make.fun/badge/best-stealth-game-20261121-1759/jpmax2027/stealth-game/rank.svg)](https://make.fun/bounty/best-stealth-game-20261121-1759/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-stealth-game-20261121-1759)
[![reward](https://make.fun/badge/best-stealth-game-20261121-1759/jpmax2027/stealth-game/reward.svg)](https://make.fun/bounty/best-stealth-game-20261121-1759?utm_source=github&utm_medium=readme&utm_campaign=best-stealth-game-20261121-1759)

https://make.fun/r/zbqpv30a

Game stealth top-down 2D yang orisinal: kau seorang pencuri dokumen yang menyelinap
di malam hari. Ambil semua dokumen di tiap level, lalu keluar lewat pintu hijau —
tanpa terlihat penjaga.

## Cara main

- **WASD / panah** — bergerak
- **Shift** — menyelinap pelan (penjaga lebih lambat menyadarimu)
- **E** — ambil dokumen
- **P / Esc** — jeda
- **R** — ulangi level saat tertangkap
- **M** — bisu
- Klik tombol di layar menu dengan mouse.

## Aturan stealth

- **Kerucut penglihatan penjaga**: kuning saat tenang, oranye saat curiga, merah saat alarm.
  Masuk kerucut dan meter deteksi di atas penjaga akan naik — makin dekat makin cepat.
- **Patroli yang bisa dipelajari**: tiap penjaga berjalan di rute waypoint yang sama,
  berhenti sejenak di tiap titik. Pelajari ritmenya, lalu bergerak di celahnya.
- **Kesempatan pulih**: keluar dari pandangan dan meter deteksi turun; penjaga yang
  kehilangan jejakmu akan kembali berpatroli setelah beberapa detik.
- **Cover**: peti kayu menahan pandangan dan gerakan; semak menyembunyikanmu
  sepenuhnya saat kau berdiri di dalamnya.
- **Pintu keluar** terkunci sampai semua dokumen di level itu dikumpulkan.
- **3 level** dengan kesulitan naik: lebih banyak penjaga, patroli lebih cepat,
  penglihatan lebih tajam.

## Suara

Semua suara disintesis dengan WebAudio (tanpa file audio): langkah kaki, bunyi
ambil dokumen, sirene alarm, dan jingle kemenangan.

## Menjalankan

```sh
node serve.ts
# buka http://localhost:8080
```

Tidak ada build step dan tidak ada request network — semua file statis di `game/`.

## Struktur source

- `game/src/config.js` — semua angka tuning di satu tempat
- `game/src/levels.js` — definisi 3 level (dinding, cover, dokumen, penjaga, exit)
- `game/src/vision.js` — line-of-sight dan uji kerucut penglihatan
- `game/src/guards.js` — AI patroli, curiga, alarm, dan pemulihan
- `game/src/player.js` — gerakan, sembunyi, ambil dokumen, pintu keluar
- `game/src/audio.js` — synth suara WebAudio
- `game/src/input.js` — keyboard dan mouse
- `game/src/render.js` — semua gambar canvas: level, HUD, minimap, layar menu
- `game/src/shots.js` — adegan deterministik untuk screenshot (`?shot=...`)
- `game/src/main.js` — loop game dan mesin state layar

## Lisensi

MIT — lihat `LICENSE`.
