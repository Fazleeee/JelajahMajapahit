# ☀️ Ekspedisi Majapahit 1350 M — Petualangan Sejarah 3D

> **Platform Web Pembelajaran Interaktif 3D Sejarah Kerajaan Majapahit di Kotaraja Trowulan**  
> Disesuaikan untuk **Materi Sejarah SMP Kelas VII (Kurikulum Merdeka)**.

---

## 🏛️ Sekilas Tentang Proyek

**Ekspedisi Majapahit 1350 M** mengajak siswa dan penjelajah waktu menelusuri langsung masa keemasan Nusantara di bawah kepemimpinan **Prabu Hayam Wuruk** dan **Mahapatih Gajah Mada**. Dibangun sepenuhnya menggunakan teknologi **Three.js** dan WebGL modern tanpa *engine* berat, game ini dapat dimainkan langsung di peramban web (*browser*) baik di komputer desktop maupun perangkat ponsel/tablet pintar (HP).

---

## ✨ Fitur-Fitur Utama

### 1. Eksplorasi 5 Wilayah Sejarah Bersejarah
1. **🌿 Hutan Tarik & Sungai Brantas**: Latar berdirinya Wangsa Rajasa oleh Raden Wijaya tahun 1293 M dan sistem pertahanan air.
2. **🏺 Pasar Kotaraja & Kolam Segaran**: Denyut ekonomi maritim, transaksi koin gobog, dan waduk kuno seluas 6,5 hektar.
3. **🛕 Lembah Candi & Sanggar Pujangga**: Kawasan Candi Bajang Ratu, Candi Tikus, dan tempat Empu Prapanca menggubah *Kakawin Nagarakretagama*.
4. **⛵ Barak Pasukan Bhayangkara & Dermaga Kapal Jung**: Pusat komando pasukan elite 15 pengawal raja dan armada maritim penjelajah samudra.
5. **👑 Kedaton Agung Istana Majapahit**: Pusat singgasana Surya Majapahit, bale manguntur, dan alun-alun keraton.

### 2. Tokoh Sejarah Interaktif (Sistem Dialog RPG)
* **Mahapatih Gajah Mada**: Tokoh militer pengucap Sumpah Palapa di Barak Bhayangkara.
* **Prabu Hayam Wuruk**: Raja agung pelindung rakyat dan kebudayaan di Kedaton Agung.
* **Empu Prapanca**: Pujangga sastra keraton pencatat sejarah di Sanggar Candi.
* **Pedagang Majapahit**: Pedagang rempah dan tembikar di Pasar Kotaraja.
* **Prajurit Pengawal Gerbang**: Penjaga pintu gerbang Candi Wringin Lawang.

### 3. Sistem Misi Sejarah & 10 Artefak 3D
* **Rantai Misi Terpadu**: Misi bertahap mulai dari mencari koin gobog, celengan terakota, keris luk, prasasti tembaga, hingga mahkota emas.
* **Digital Codex & 3D Relic Viewer**: Ensiklopedia sejarah interaktif yang dilengkapi penampil model 3D artefak yang dapat diputar $360^\circ$.
* **Menara Pandang (Viewpoint Synchronization)**: Sinkronisasi menara pandang bergaya sinematik elang untuk mengungkap kabut peta (*Fog of War*).
* **Lentera Waktu (F)**: Memancarkan pilar cahaya vertikal ke angkasa yang menuntun penjelajah ke artefak terdekat.

### 4. Audio Spasial Musik Gamelan Nusantara
* Generator audio berbasis Web Audio API (Sintesis laras Slendro & Pelog Majapahit, instrumen bonang, kendang, gong ageng, dan suling bambu).
* Tata suara dinamis (*spatial ambience*): suara aliran air Sungai Brantas, kicauan burung hutan, dan keriuhan pasar.

### 5. Evaluasi Pembelajaran & Piagam Sertifikat
* **Ujian Kuis Gerbang Palapa**: Evaluasi 5 soal pilihan ganda berbasis materi sejarah kurikulum.
* **Piagam Digital Real-Time**: Piagam penghargaan yang dapat diberi nama siswa dan nilai akhir untuk bukti pembelajaran.

### 6. Dukungan Penuh Ponsel / HP (Roblox-Style Mobile Controls)
* **Wajib Landscape (Layar Mendatar)**: Otomatis mendeteksi orientasi perangkat dan menampilkan animasi interaktif pembalik layar jika dibuka dalam mode potret.
* **Virtual Thumbstick (Analog $360^\circ$)**: Kontrol jempol kiri dengan pegas kembali (*spring-back*) dan akselerasi lari otomatis.
* **Tombol Aksi Kanan (Roblox Style)**: Tombol lompat besar, toggle lari (*sprint*), dan tombol interaksi kontekstual `[E]` dinamis yang berdenyut saat berada di dekat objek bersejarah.
* **Kontrol Kamera Sentuh & Pinch Zoom**: Geser satu jari di separuh layar kanan untuk memutar kamera $360^\circ$ dan cubit dua jari untuk mengatur jarak pandang (*zoom*).

---

## 🏗️ Arsitektur Perangkat Lunak

Dibangun dengan prinsip *clean code* dan arsitektur pengembang senior:
* **Finite State Machine (`GameState.js`)**: Manajemen status terpusat (`INTRO`, `EXPLORING`, `MODAL`, `CINEMATIC`) dengan jaminan pencegahan penumpukan modal (*single-modal guarantee*) dan penguncian kontrol pemain otomatis saat membaca teks.
* **Central Event Bus (`EventBus.js`)**: Komunikasi berbasis *publish/subscribe* terisolasi tanpa *circular dependency*.
* **Spatial Hash Grid ($O(1)$ Spasial)**: Mengelompokkan seluruh objek padat, prasasti, dan NPC ke dalam sel berukuran $20\text{ m} \times 20\text{ m}$ untuk deteksi tabrakan instan bebas *lag*, menjaga performa konstan pada 60 FPS.
* **Zero-Allocation Game Loop**: Pemanfaatan vektor memori yang telah dialokasikan terlebih dahulu (*pre-allocated scratch vectors*) untuk mencegah *Garbage Collection pause* di tengah permainan.

---

## 🚀 Cara Menjalankan secara Lokal

### Prasyarat
* [Node.js](https://nodejs.org/) (Versi 16 atau lebih baru)

### Langkah Menjalankan
1. Clone repositori ini:
   ```bash
   git clone https://github.com/Fazleeee/JelajahMajapahit.git
   cd JelajahMajapahit
   ```
2. Jalankan server lokal:
   ```bash
   node server.mjs
   ```
3. Buka peramban (*browser*) di alamat:
   ```
   http://localhost:5173
   ```

---

## 🎮 Panduan Kontrol

| Aksi | Keyboard (Desktop) | Sentuh (HP / Tablet) |
|---|---|---|
| **Bergerak** | `W`, `A`, `S`, `D` / Panah | Virtual Thumbstick (Jempol Kiri) |
| **Lari Cepat (Sprint)** | `Shift` | Tombol Kilat `⚡` / Dorong Joystick Penuh |
| **Melompat** | `Space` | Tombol Lompat `🦘` (Kanan Bawah) |
| **Putar Kamera 360°** | Klik Kiri & Geser Mouse | Geser Layar Sebelah Kanan |
| **Zoom Kamera** | Scroll Roda Mouse | Cubit Layar 2 Jari (*Pinch*) |
| **Interaksi / Tutup** | `E` / `Esc` | Tombol Dinamis `✨ E` |
| **Atlas Peta Penuh** | `M` | Menu Header / Tombol Peta |
| **Jurnal Sejarah 3D** | `J` | Menu Header / Tombol Jurnal |
| **Ujian Kuis Palapa** | `K` | Menu Header / Tombol Kuis |
| **Lentera Waktu** | `F` | Menu Header / Tombol Lentera |
| **Ubah Waktu** | `T` | Menu Header / Tombol Waktu |
| **Kamera Elang** | `V` | Menu Header / Tombol Kamera |

---

*Hak Cipta © 2026 Ekspedisi Majapahit 1350 M — Wilwatikta Nusantara.*
