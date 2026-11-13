// Data Geografis, Zona Eksplorasi, Titik Sejarah, dan Colliders Trowulan 1350 M

export const WORLD_SIZE = 440;

export const ZONES = [
  {
    id: 'hutan_tarik',
    name: '1. Hutan Tarik & Tepian Sungai Brantas',
    caption: 'Tempat Raden Wijaya membuka hutan & menemukan buah Maja yang pahit (1293 M)',
    lore: 'Awal mula nama Majapahit: prajurit Raden Wijaya memakan buah Maja yang rasanya pahit saat membangun pemukiman di tepi Sungai Brantas.',
    center: { x: 0, z: 125 },
    radius: 68,
    color: '#3c8d40'
  },
  {
    id: 'pasar_segaran',
    name: '2. Gerbang Wringin Lawang & Kolam Segaran',
    caption: 'Pusat ekonomi, kolam raksasa kuno, dan pertukaran Koin Gobog Kotaraja',
    lore: 'Kolam Segaran adalah waduk kuno raksasa berlapis bata merah tempat menjamu tamu mancanegara sekaligus pengatur air ibu kota.',
    center: { x: -10, z: 10 },
    radius: 62,
    color: '#d48737'
  },
  {
    id: 'lembah_candi',
    name: '3. Lembah Candi & Sanggar Pujangga',
    caption: 'Bukit Timur tempat Candi Bajang Ratu, Mpu Prapanca, dan Mpu Tantular',
    lore: 'Di kawasan suci ini lahirlah karya sastra agung Kitab Negarakertagama dan semboyan Bhinneka Tunggal Ika dalam Kitab Sutasoma.',
    center: { x: 105, z: -10 },
    radius: 65,
    color: '#c44d34'
  },
  {
    id: 'barak_dermaga',
    name: '4. Barak Bhayangkara & Dermaga Jung Jawa',
    caption: 'Markas pasukan elit Gajah Mada dan armada maritim Nusantara di tepi barat',
    lore: 'Armada kapal Jung raksasa dan meriam Cetbang menjadi tulang punggung penyatuan Nusantara oleh Mahapatih Gajah Mada.',
    center: { x: -115, z: 15 },
    radius: 65,
    color: '#3a7ca5'
  },
  {
    id: 'kedaton_agung',
    name: '5. Kedaton Agung (Istana Raja Hayam Wuruk)',
    caption: 'Jantung pemerintahan Majapahit tempat Sumpah Palapa dikumandangkan',
    lore: 'Dikelilingi parit pertahanan dan benteng bata merah, Kedaton Agung menjadi pusat kejayaan Nusantara pada abad ke-14.',
    center: { x: 0, z: -115 },
    radius: 72,
    color: '#d4af37'
  }
];

export const LANDMARKS = [
  {
    id: 'pohon_maja_agung',
    title: 'Pohon Maja & Pondok Raden Wijaya',
    position: { x: -16, z: 129.5 },
    radius: 13,
    text: 'Pada tahun 1292–1293 M, Raden Wijaya mendirikan pemukiman di Hutan Tarik atas bantuan Adipati Songennep (Madura), Arya Wiraraja. Nama Majapahit lahir saat prajurit memetik buah pohon Maja yang rasanya pahit.'
  },
  {
    id: 'jembatan_brantas',
    title: 'Jembatan Agung Sungai Brantas',
    position: { x: 0, z: 72 },
    radius: 14,
    text: 'Sungai Brantas merupakan urat nadi perairan utama yang membelah Jawa Timur, memungkinkan perahu dagang mondar-mandir dari pelabuhan Canggu dan Hujung Galuh ke ibu kota Trowulan.'
  },
  {
    id: 'wringin_lawang',
    title: 'Gerbang Candi Bentar Wringin Lawang',
    position: { x: 0, z: 38 },
    radius: 14,
    text: 'Gerbang terbelah (Candi Bentar) setinggi 15 meter dari bata merah terakota tanpa atap penghubung, berfungsi sebagai pintu gerbang masuk utama menuju kawasan permukiman pejabat dan alun-alun Kotaraja.'
  },
  {
    id: 'pasar_kotaraja',
    title: 'Pasar Kotaraja & Rempah Nusantara',
    position: { x: 18, z: 12 },
    radius: 16,
    text: 'Pusat perdagangan bebas internasional Majapahit: tempat diperjualbelikannya rempah pala dan cengkeh dari Maluku, kain sutra Tiongkok, manik-manik India, serta mata uang koin perunggu berlubang (Gobog Majapahit).'
  },
  {
    id: 'kolam_segaran',
    title: 'Kolam Segaran & Rekayasa Air Kuno',
    position: { x: -31.8, z: 5.0 },
    radius: 16,
    text: 'Waduk buatan seluas 6,5 hektar dengan dinding bata tebal setinggi 3 meter. Berfungsi sebagai penampung air banjir, irigasi sawah di musim kemarau, serta tempat pesta jamuan air para duta asing.'
  },
  {
    id: 'candi_bajang_ratu',
    title: 'Candi Bajang Ratu (Gapura Paduraksa)',
    position: { x: 108, z: -10 },
    radius: 18,
    text: 'Gapura Paduraksa beratap tinggi dengan tangga berundak dan relief Kala raksasa di atas pintu. Dibangun untuk mengenang Raja Jayanegara dan sebagai pintu masuk ke kompleks peribadatan suci.'
  },
  {
    id: 'sanggar_pujangga',
    title: 'Sanggar Pujangga & Naskah Lontar',
    position: { x: 126, z: -12.5 },
    radius: 15,
    text: 'Tempat berteduhnya pujangga agung Mpu Prapanca menulis Kitab Negarakertagama (1365 M) dan Mpu Tantular menyuratkan bait luhur toleransi "Bhinneka Tunggal Ika Tan Hana Dharma Mangrwa" dalam Kakawin Sutasoma.'
  },
  {
    id: 'kapal_jung',
    title: 'Geladak Kapal Layar Jung Jawa',
    position: { x: -128, z: 19 },
    radius: 17,
    text: 'Kapal perang dan niaga raksasa kebanggaan maritim Nusantara dengan multi-lapis lambung kayu jati, tiga tiang layar tanja, dan persenjataan meriam Cetbang perunggu yang disegani di Samudra Hindia dan Laut Tiongkok Selatan.'
  },
  {
    id: 'barak_bhayangkara',
    title: 'Barak Pasukan Elit Bhayangkara',
    position: { x: -98, z: 21.5 },
    radius: 16,
    text: 'Markas komando pengawal kerajaan yang dibentuk oleh Mahapatih Gajah Mada dengan semboyan 4 Satya Bhayangkara (Satya Haprabu, dsb.) guna mengamankan raja dan menjaga stabilitas negara.'
  },
  {
    id: 'balairung_kencana',
    title: 'Kedaton Agung & Singgasana Surya Majapahit',
    position: { x: 0, z: -115 },
    radius: 20,
    text: 'Balairung agung bertiang emas tempat Sri Rajasanagara (Raja Hayam Wuruk) memimpin sidang kerajaan, didampingi Mahapatih Gajah Mada dengan lambang matahari bersinar 8 penjuru mata angin (Surya Majapahit).'
  }
];

// Jembatan Penyeberangan (Menghubungkan jalan dengan mulus tanpa patahan tinggi)
export const BRIDGES = [
  // 1. Jembatan Utama Sungai Brantas (Hutan Tarik -> Gapura Wringin Lawang)
  { xMin: -6.5, xMax: 6.5, zMin: 52, zMax: 90, yNorth: 1.65, ySouth: 1.55, archHeight: 1.15 },
  // 2. Jembatan Timur Sungai Brantas (Menuju Bukit Candi Bajang Ratu)
  { xMin: 78, xMax: 88, zMin: 44, zMax: 78, yNorth: 1.8, ySouth: 1.55, archHeight: 1.05 },
  // 3. Jembatan Parit Pertahanan Kedaton Agung (Landai dari jalan y:1.65m naik ke pelataran Kedaton y:3.6m)
  { xMin: -6.5, xMax: 6.5, zMin: -76, zMax: -50, yNorth: 3.6, ySouth: 1.65, archHeight: 0.4 }
];

// Dynamic Architectural Colliders (Teras, Tangga Candi, Tangga Kolam Segaran, Geladak Kapal, Pendopo)
export const ARCH_COLLIDERS = [
  // 1. Candi Bajang Ratu - Tangga Barat, Lorong Gapura & Tangga Timur (x: 94.5..121.5, z: -14.5..-5.5)
  // Tangga barat mendaki dari pelataran bukit (y: 9.8m) naik ke teras kaki candi (y: 13.4m)
  { type: 'ramp', xMin: 94.5, xMax: 103.0, zMin: -12.8, zMax: -7.2, yStart: 9.8, yEnd: 13.4, axis: 'x' },
  // Pelataran teras & lorong tengah Candi Bajang Ratu
  { type: 'box', xMin: 103.0, xMax: 113.0, zMin: -14.5, zMax: -5.5, topY: 13.4 },
  // Tangga timur menurun dari teras candi (y: 13.4m) ke pelataran Sanggar Pujangga (y: 9.8m)
  { type: 'ramp', xMin: 113.0, xMax: 121.5, zMin: -12.8, zMax: -7.2, yStart: 13.4, yEnd: 9.8, axis: 'x' },

  // 2. Kolam Segaran - Tangga Bata Merah Keluar/Masuk Kolam (Sesuai Tangga Visual Timur & Selatan)
  // Tangga Timur Kolam Segaran (menghadap jalan utama Kotaraja)
  { type: 'ramp', xMin: -42.5, xMax: -32.8, zMin: 1.4, zMax: 8.6, yStart: -0.4, yEnd: 2.05, axis: 'x' },
  // Tangga Selatan Kolam Segaran
  { type: 'ramp', xMin: -55.8, xMax: -48.2, zMin: 24.0, zMax: 33.2, yStart: -0.4, yEnd: 2.05, axis: 'z' },

  // 3. Kapal Layar Jung Jawa & Dermaga Barat (x: -142..-114, z: 12..26)
  // Titian naik (Gangway) dari sisi selatan Dermaga kayu (z: 26.2, y: 1.85m) ke geladak kapal (z: 23.2, y: 3.2m)
  { type: 'ramp', xMin: -127.5, xMax: -123.5, zMin: 23.2, zMax: 26.2, yStart: 3.2, yEnd: 1.85, axis: 'z' },
  // Landasan penghubung landai dari tanah lapang (x: -110, y: 1.4m) ke dermaga kayu (x: -115, y: 1.85m)
  { type: 'ramp', xMin: -115, xMax: -110, zMin: 15.0, zMax: 23.0, yStart: 1.85, yEnd: 1.4, axis: 'x' },
  // Geladak Utama Kapal Jung
  { type: 'box', xMin: -138, xMax: -120.5, zMin: 14.0, zMax: 24.0, topY: 3.2 },
  // Geladak Buritan Nakhoda (Poop Deck)
  { type: 'box', xMin: -142, xMax: -136, zMin: 14.0, zMax: 24.0, topY: 4.5 },
  // Tangga naik ke buritan kapal
  { type: 'ramp', xMin: -136, xMax: -133, zMin: 17, zMax: 21, yStart: 3.2, yEnd: 4.5, axis: 'x' },

  // 4. Pondok Kayu Raden Wijaya Hutan Tarik (Panggung Kayu Terangkat)
  { type: 'box', xMin: -19.5, xMax: -12.5, zMin: 117.0, zMax: 123.0, topY: 2.35 },
  { type: 'ramp', xMin: -17.8, xMax: -14.2, zMin: 122.8, zMax: 124.2, yStart: 2.35, yEnd: 1.55, axis: 'z' },

  // 5. Kedaton Agung - Balairung Pendopo Kencana (x: -14..14, z: -126..-100)
  // Tangga Selatan naik ke lantai Balairung Pendopo (dari halaman y: 3.6m ke panggung y: 4.6m)
  { type: 'ramp', xMin: -6.0, xMax: 6.0, zMin: -105.5, zMax: -100.5, yStart: 4.6, yEnd: 3.6, axis: 'z' },
  // Undakan panggung pendopo dari halaman keraton (y: 3.6m) ke lantai marmer bata (y: 4.6m)
  { type: 'box', xMin: -13, xMax: 13, zMin: -125, zMax: -105, topY: 4.6 },
  // Panggung singgasana Hayam Wuruk di ujung utara pendopo
  { type: 'box', xMin: -4.5, xMax: 4.5, zMin: -124, zMax: -118, topY: 5.3 }
];

// Solid Obstacle Hitbox Colliders (Mencegah pemain tembus dinding, gapura, pilar candi, markas, stan & pohon)
export const SOLID_COLLIDERS = [
  // 1. Kedaton Agung: Benteng Bata Merah Keliling (Tinggi 4.8m)
  // Tembok Utara Kedaton (z: -163)
  { type: 'box', xMin: -46.5, xMax: 46.5, zMin: -164.5, zMax: -161.5, yMin: 1.5, yMax: 10.0 },
  // Tembok Barat Kedaton (x: -45)
  { type: 'box', xMin: -46.5, xMax: -43.5, zMin: -164.0, zMax: -67.0, yMin: 1.5, yMax: 10.0 },
  // Tembok Timur Kedaton (x: 45)
  { type: 'box', xMin: 43.5, xMax: 46.5, zMin: -164.0, zMax: -67.0, yMin: 1.5, yMax: 10.0 },
  // Tembok Selatan Sayap Barat (Kiri Gerbang, x: -46.5..-4.5)
  { type: 'box', xMin: -46.5, xMax: -4.5, zMin: -74.5, zMax: -71.5, yMin: 1.5, yMax: 10.0 },
  // Tembok Selatan Sayap Timur (Kanan Gerbang, x: 4.5..46.5)
  { type: 'box', xMin: 4.5, xMax: 46.5, zMin: -74.5, zMax: -71.5, yMin: 1.5, yMax: 10.0 },
  // Pilar Gerbang Paduraksa Selatan Kedaton (Kiri & Kanan lorong tengah)
  { type: 'box', xMin: -8.8, xMax: -4.2, zMin: -75.2, zMax: -70.8, yMin: 1.5, yMax: 12.0 },
  { type: 'box', xMin: 4.2, xMax: 8.8, zMin: -75.2, zMax: -70.8, yMin: 1.5, yMax: 12.0 },
  // 4 Menara Sudut Bastion Kedaton
  { type: 'box', xMin: -47.5, xMax: -42.5, zMin: -165.5, zMax: -160.5, yMin: 1.5, yMax: 12.0 },
  { type: 'box', xMin: 42.5, xMax: 47.5, zMin: -165.5, zMax: -160.5, yMin: 1.5, yMax: 12.0 },
  { type: 'box', xMin: -47.5, xMax: -42.5, zMin: -75.5, zMax: -70.5, yMin: 1.5, yMax: 12.0 },
  { type: 'box', xMin: 42.5, xMax: 47.5, zMin: -75.5, zMax: -70.5, yMin: 1.5, yMax: 12.0 },
  // Sandaran Singgasana Emas Hayam Wuruk & Payung Upacara Kembar
  { type: 'box', xMin: -2.0, xMax: 2.0, zMin: -123.5, zMax: -121.5, yMin: 4.0, yMax: 9.0 },
  { type: 'circle', x: -2.4, z: -122.6, radius: 0.35, yMin: 4.0, yMax: 9.5 },
  { type: 'circle', x: 2.4, z: -122.6, radius: 0.35, yMin: 4.0, yMax: 9.5 },
  // 16 Pilar Kayu Jati Emas (Soko Guru) di Balairung Pendopo Kencana Kedaton
  { type: 'circle', x: -10.5, z: -122.5, radius: 0.45, yMin: 3.5, yMax: 14.0 },
  { type: 'circle', x: -3.5, z: -122.5, radius: 0.45, yMin: 3.5, yMax: 14.0 },
  { type: 'circle', x: 3.5, z: -122.5, radius: 0.45, yMin: 3.5, yMax: 14.0 },
  { type: 'circle', x: 10.5, z: -122.5, radius: 0.45, yMin: 3.5, yMax: 14.0 },
  { type: 'circle', x: -10.5, z: -117.5, radius: 0.45, yMin: 3.5, yMax: 14.0 },
  { type: 'circle', x: -3.5, z: -117.5, radius: 0.45, yMin: 3.5, yMax: 14.0 },
  { type: 'circle', x: 3.5, z: -117.5, radius: 0.45, yMin: 3.5, yMax: 14.0 },
  { type: 'circle', x: 10.5, z: -117.5, radius: 0.45, yMin: 3.5, yMax: 14.0 },
  { type: 'circle', x: -10.5, z: -112.5, radius: 0.45, yMin: 3.5, yMax: 14.0 },
  { type: 'circle', x: -3.5, z: -112.5, radius: 0.45, yMin: 3.5, yMax: 14.0 },
  { type: 'circle', x: 3.5, z: -112.5, radius: 0.45, yMin: 3.5, yMax: 14.0 },
  { type: 'circle', x: 10.5, z: -112.5, radius: 0.45, yMin: 3.5, yMax: 14.0 },
  { type: 'circle', x: -10.5, z: -107.5, radius: 0.45, yMin: 3.5, yMax: 14.0 },
  { type: 'circle', x: -3.5, z: -107.5, radius: 0.45, yMin: 3.5, yMax: 14.0 },
  { type: 'circle', x: 3.5, z: -107.5, radius: 0.45, yMin: 3.5, yMax: 14.0 },
  { type: 'circle', x: 10.5, z: -107.5, radius: 0.45, yMin: 3.5, yMax: 14.0 },

  // 2. Gerbang Candi Bentar Wringin Lawang (Menara Kembar Terbelah Bata Merah)
  // Menara Barat (x: -5.1..-1.5, z: 35.8..40.2)
  { type: 'box', xMin: -5.1, xMax: -1.5, zMin: 35.8, zMax: 40.2, yMin: -2.0, yMax: 16.0 },
  // Menara Timur (x: 1.5..5.1, z: 35.8..40.2)
  { type: 'box', xMin: 1.5, xMax: 5.1, zMin: 35.8, zMax: 40.2, yMin: -2.0, yMax: 16.0 },

  // 3. Barak Pasukan Elit Bhayangkara (Markas Komando Militer Bata Merah, x: -98, z: 14)
  { type: 'box', xMin: -105.2, xMax: -90.8, zMin: 9.3, zMax: 18.7, yMin: -2.0, yMax: 10.0 },
  // 4 Pilar Serambi Depan Barak Bhayangkara
  { type: 'circle', x: -102.0, z: 19.7, radius: 0.36, yMin: -2.0, yMax: 6.5 },
  { type: 'circle', x: -99.8, z: 19.7, radius: 0.36, yMin: -2.0, yMax: 6.5 },
  { type: 'circle', x: -96.2, z: 19.7, radius: 0.36, yMin: -2.0, yMax: 6.5 },
  { type: 'circle', x: -94.0, z: 19.7, radius: 0.36, yMin: -2.0, yMax: 6.5 },
  // Dua Rak Tombak Prajurit di depan Barak
  { type: 'box', xMin: -103.8, xMax: -101.2, zMin: 18.8, zMax: 19.6, yMin: -2.0, yMax: 6.0 },
  { type: 'box', xMin: -94.8, xMax: -92.2, zMin: 18.8, zMax: 19.6, yMin: -2.0, yMax: 6.0 },
  // Dua Meriam Putar Cetbang Perunggu di Pelataran Barak
  { type: 'circle', x: -104.2, z: 20.8, radius: 0.75, yMin: -2.0, yMax: 5.0 },
  { type: 'circle', x: -91.8, z: 20.8, radius: 0.75, yMin: -2.0, yMax: 5.0 },

  // 4. Candi Bajang Ratu: Dinding Pilar Paduraksa & Pipi Tangga
  // Sisi Selatan Lorong (z: -15.0..-11.6)
  { type: 'box', xMin: 103.5, xMax: 112.5, zMin: -15.0, zMax: -11.6, yMin: 9.0, yMax: 22.0 },
  // Sisi Utara Lorong (z: -8.4..-5.0)
  { type: 'box', xMin: 103.5, xMax: 112.5, zMin: -8.4, zMax: -5.0, yMin: 9.0, yMax: 22.0 },
  // Pipi Tangga Barat (z: -12.7..-12.2 & -7.8..-7.3)
  { type: 'box', xMin: 95.0, xMax: 103.0, zMin: -12.7, zMax: -12.2, yMin: 9.0, yMax: 16.0 },
  { type: 'box', xMin: 95.0, xMax: 103.0, zMin: -7.8, zMax: -7.3, yMin: 9.0, yMax: 16.0 },
  // Pipi Tangga Timur
  { type: 'box', xMin: 113.0, xMax: 121.0, zMin: -12.7, zMax: -12.2, yMin: 9.0, yMax: 16.0 },
  { type: 'box', xMin: 113.0, xMax: 121.0, zMin: -7.8, zMax: -7.3, yMin: 9.0, yMax: 16.0 },

  // 5. Sanggar Pujangga (Meja Naskah Lontar & 6 Pilar Kayu Pendopo)
  { type: 'box', xMin: 123.8, xMax: 128.2, zMin: -15.4, zMax: -13.8, yMin: 8.5, yMax: 13.0 },
  { type: 'circle', x: 122.2, z: -16.8, radius: 0.35, yMin: 8.5, yMax: 16.0 },
  { type: 'circle', x: 126.0, z: -16.8, radius: 0.35, yMin: 8.5, yMax: 16.0 },
  { type: 'circle', x: 129.8, z: -16.8, radius: 0.35, yMin: 8.5, yMax: 16.0 },
  { type: 'circle', x: 122.2, z: -11.2, radius: 0.35, yMin: 8.5, yMax: 16.0 },
  { type: 'circle', x: 126.0, z: -11.2, radius: 0.35, yMin: 8.5, yMax: 16.0 },
  { type: 'circle', x: 129.8, z: -11.2, radius: 0.35, yMin: 8.5, yMax: 16.0 },

  // 6. Perkemahan Raden Wijaya Hutan Tarik (x: -16, z: 120)
  // Dinding Belakang & Samping Pondok Kayu
  { type: 'box', xMin: -19.3, xMax: -12.7, zMin: 117.1, zMax: 117.7, yMin: -2.0, yMax: 7.0 },
  { type: 'box', xMin: -19.3, xMax: -18.9, zMin: 117.4, zMax: 120.6, yMin: -2.0, yMax: 7.0 },
  // 6 Tiang Pondok Kayu Raden Wijaya
  { type: 'circle', x: -19.1, z: 122.6, radius: 0.32, yMin: -2.0, yMax: 7.0 },
  { type: 'circle', x: -16.0, z: 122.6, radius: 0.32, yMin: -2.0, yMax: 7.0 },
  { type: 'circle', x: -12.9, z: 122.6, radius: 0.32, yMin: -2.0, yMax: 7.0 },
  // Lumbung Padi Kayu (Koordinat Riil Dunia: x: -9.5, z: 117.5)
  { type: 'box', xMin: -11.0, xMax: -8.0, zMin: 116.0, zMax: 119.0, yMin: -2.0, yMax: 8.0 },
  // Api Unggun Batu Kuno (x: -16, z: 124.8)
  { type: 'circle', x: -16.0, z: 124.8, radius: 1.25, yMin: -2.0, yMax: 5.0 },

  // 7. Pohon Maja Agung & Pohon Beringin Raksasa Majapahit (Batang Utama Kayu)
  { type: 'circle', x: -16, z: 132, radius: 1.5, yMin: -2.0, yMax: 12.0 },
  { type: 'circle', x: 16, z: 42, radius: 1.6, yMin: -2.0, yMax: 12.0 },
  { type: 'circle', x: -20, z: -10, radius: 1.6, yMin: -2.0, yMax: 12.0 },
  { type: 'circle', x: 22, z: -46, radius: 1.6, yMin: -2.0, yMax: 12.0 },
  { type: 'circle', x: -22, z: -46, radius: 1.6, yMin: -2.0, yMax: 12.0 },
  { type: 'circle', x: 88, z: 6, radius: 1.6, yMin: -2.0, yMax: 12.0 },
  { type: 'circle', x: -92, z: 10, radius: 1.6, yMin: -2.0, yMax: 12.0 },
  { type: 'circle', x: 26, z: 118, radius: 1.6, yMin: -2.0, yMax: 12.0 },

  // 8. Stan Meja Rempah & Koin Gobog Pasar Kotaraja
  { type: 'box', xMin: 12.2, xMax: 15.8, zMin: 7.0, zMax: 9.0, yMin: -2.0, yMax: 4.5 },
  { type: 'box', xMin: 20.2, xMax: 23.8, zMin: 6.0, zMax: 8.0, yMin: -2.0, yMax: 4.5 },
  { type: 'box', xMin: 13.2, xMax: 16.8, zMin: 16.0, zMax: 18.0, yMin: -2.0, yMax: 4.5 },
  { type: 'box', xMin: 21.2, xMax: 24.8, zMin: 15.0, zMax: 17.0, yMin: -2.0, yMax: 4.5 },

  // 9. Kapal Layar Jung Jawa (Kabin Buritan, 3 Tiang Layar, Haluan & Pagar Geladak)
  { type: 'box', xMin: -142.5, xMax: -139.4, zMin: 14.2, zMax: 23.8, yMin: 1.0, yMax: 9.0 },
  { type: 'box', xMin: -119.5, xMax: -112.2, zMin: 16.6, zMax: 21.4, yMin: -2.0, yMax: 7.5 },
  { type: 'circle', x: -122.5, z: 19.0, radius: 0.55, yMin: 0.0, yMax: 25.0 },
  { type: 'circle', x: -129.2, z: 19.0, radius: 0.60, yMin: 0.0, yMax: 25.0 },
  { type: 'circle', x: -134.8, z: 19.0, radius: 0.45, yMin: 0.0, yMax: 22.0 },
  // Pagar Bulwark Geladak Utama & Buritan (Sisakan celah di Gangway selatan x: -127.5..-123.5)
  { type: 'box', xMin: -137.0, xMax: -120.2, zMin: 13.7, zMax: 14.4, yMin: 2.0, yMax: 5.5 },
  { type: 'box', xMin: -137.0, xMax: -127.8, zMin: 23.6, zMax: 24.3, yMin: 2.0, yMax: 5.5 },
  { type: 'box', xMin: -123.2, xMax: -120.2, zMin: 23.6, zMax: 24.3, yMin: 2.0, yMax: 5.5 },
  { type: 'box', xMin: -142.0, xMax: -136.0, zMin: 13.7, zMax: 14.4, yMin: 3.5, yMax: 6.8 },
  { type: 'box', xMin: -142.0, xMax: -136.0, zMin: 23.6, zMax: 24.3, yMin: 3.5, yMax: 6.8 },

  // 10. Kolam Segaran (Tembok Bata Keliling, 4 Pilar Tangga & 4 Menara Sudut Terakota)
  { type: 'box', xMin: -70.0, xMax: -34.0, zMin: -22.6, zMax: -20.4, yMin: -2.0, yMax: 5.5 },
  { type: 'box', xMin: -70.0, xMax: -56.0, zMin: 30.4, zMax: 32.6, yMin: -2.0, yMax: 5.5 },
  { type: 'box', xMin: -48.0, xMax: -34.0, zMin: 30.4, zMax: 32.6, yMin: -2.0, yMax: 5.5 },
  { type: 'box', xMin: -70.6, xMax: -68.4, zMin: -22.5, zMax: 32.5, yMin: -2.0, yMax: 5.5 },
  { type: 'box', xMin: -35.6, xMax: -33.4, zMin: -22.5, zMax: 1.5, yMin: -2.0, yMax: 5.5 },
  { type: 'box', xMin: -35.6, xMax: -33.4, zMin: 8.5, zMax: 32.5, yMin: -2.0, yMax: 5.5 },
  // 4 Pilar Tangga Kolam Segaran
  { type: 'box', xMin: -35.8, xMax: -33.2, zMin: -0.3, zMax: 2.3, yMin: -2.0, yMax: 6.0 },
  { type: 'box', xMin: -35.8, xMax: -33.2, zMin: 7.7, zMax: 10.3, yMin: -2.0, yMax: 6.0 },
  { type: 'box', xMin: -57.3, xMax: -54.7, zMin: 30.2, zMax: 32.8, yMin: -2.0, yMax: 6.0 },
  { type: 'box', xMin: -49.3, xMax: -46.7, zMin: 30.2, zMax: 32.8, yMin: -2.0, yMax: 6.0 },
  // 4 Menara Sudut Kolam Segaran
  { type: 'box', xMin: -71.1, xMax: -67.9, zMin: -23.1, zMax: -19.9, yMin: -2.0, yMax: 6.5 },
  { type: 'box', xMin: -36.1, xMax: -32.9, zMin: -23.1, zMax: -19.9, yMin: -2.0, yMax: 6.5 },
  { type: 'box', xMin: -71.1, xMax: -67.9, zMin: 29.9, zMax: 33.1, yMin: -2.0, yMax: 6.5 },
  { type: 'box', xMin: -36.1, xMax: -32.9, zMin: 29.9, zMax: 33.1, yMin: -2.0, yMax: 6.5 },

  // 11. Pagar & Pilar Jembatan Sungai Brantas & Parit Kedaton + Tiang Dermaga Barat
  // Jembatan Utama Sungai Brantas (xMin: -6.5, xMax: 6.5, z: 52..90)
  { type: 'box', xMin: -6.5, xMax: -5.9, zMin: 52.0, zMax: 90.0, yMin: 1.0, yMax: 5.5 },
  { type: 'box', xMin: 5.9, xMax: 6.5, zMin: 52.0, zMax: 90.0, yMin: 1.0, yMax: 5.5 },
  // Jembatan Timur Sungai Brantas (xMin: 78, xMax: 88, z: 44..78)
  { type: 'box', xMin: 78.0, xMax: 78.6, zMin: 44.0, zMax: 78.0, yMin: 1.0, yMax: 5.5 },
  { type: 'box', xMin: 87.4, xMax: 88.0, zMin: 44.0, zMax: 78.0, yMin: 1.0, yMax: 5.5 },
  // Jembatan Parit Pertahanan Kedaton (xMin: -6.5, xMax: 6.5, z: -76..-50)
  { type: 'box', xMin: -6.5, xMax: -5.9, zMin: -76.0, zMax: -50.0, yMin: 1.0, yMax: 6.5 },
  { type: 'box', xMin: 5.9, xMax: 6.5, zMin: -76.0, zMax: -50.0, yMin: 1.0, yMax: 6.5 },
  // Tiang Tambat Kayu Dermaga Barat (Bollards)
  { type: 'circle', x: -133.0, z: 13.0, radius: 0.48, yMin: -2.0, yMax: 4.5 },
  { type: 'circle', x: -127.5, z: 13.0, radius: 0.48, yMin: -2.0, yMax: 4.5 },
  { type: 'circle', x: -122.0, z: 13.0, radius: 0.48, yMin: -2.0, yMax: 4.5 },
  { type: 'circle', x: -116.5, z: 13.0, radius: 0.48, yMin: -2.0, yMax: 4.5 },
  { type: 'circle', x: -133.0, z: 25.0, radius: 0.48, yMin: -2.0, yMax: 4.5 },
  { type: 'circle', x: -128.2, z: 25.0, radius: 0.48, yMin: -2.0, yMax: 4.5 },
  { type: 'circle', x: -122.8, z: 25.0, radius: 0.48, yMin: -2.0, yMax: 4.5 },
  { type: 'circle', x: -116.5, z: 25.0, radius: 0.48, yMin: -2.0, yMax: 4.5 }
];
