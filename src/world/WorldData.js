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
    position: { x: -36, z: 8 },
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

  // 2. Kolam Segaran - Tangga Bata Merah Keluar/Masuk Kolam
  // Tangga Timur Kolam Segaran (menghadap jalan utama Kotaraja)
  { type: 'ramp', xMin: -42.5, xMax: -33.0, zMin: 0.5, zMax: 9.5, yStart: -0.4, yEnd: 2.05, axis: 'x' },
  // Tangga Selatan Kolam Segaran
  { type: 'ramp', xMin: -56.5, xMax: -47.5, zMin: 23.5, zMax: 33.0, yStart: -0.4, yEnd: 2.05, axis: 'z' },
  // Tangga Barat & Utara Kolam Segaran agar dari sisi mana pun mudah keluar
  { type: 'ramp', xMin: -71.0, xMax: -61.5, zMin: 0.5, zMax: 9.5, yStart: 2.05, yEnd: -0.4, axis: 'x' },
  { type: 'ramp', xMin: -56.5, xMax: -47.5, zMin: -23.0, zMax: -13.5, yStart: 2.05, yEnd: -0.4, axis: 'z' },

  // 3. Kapal Layar Jung Jawa (x: -142..-116, z: 12..26)
  // Titian naik (Gangway) dari dermaga kayu (x: -115, y: 1.85m) ke dek kapal (x: -122, y: 3.2m)
  { type: 'ramp', xMin: -122, xMax: -115, zMin: 16.0, zMax: 22.0, yStart: 3.2, yEnd: 1.85, axis: 'x' },
  // Landasan penghubung landai dari tanah lapang (x: -110, y: 1.4m) ke dermaga kayu (x: -115, y: 1.85m)
  { type: 'ramp', xMin: -115, xMax: -110, zMin: 15.0, zMax: 23.0, yStart: 1.85, yEnd: 1.4, axis: 'x' },
  // Geladak Utama Kapal Jung
  { type: 'box', xMin: -138, xMax: -121, zMin: 13, zMax: 25, topY: 3.2 },
  // Geladak Buritan Nakhoda (Poop Deck)
  { type: 'box', xMin: -142, xMax: -136, zMin: 14, zMax: 24, topY: 4.5 },
  // Tangga naik ke buritan kapal
  { type: 'ramp', xMin: -136, xMax: -133, zMin: 17, zMax: 21, yStart: 3.2, yEnd: 4.5, axis: 'x' },

  // 4. Kedaton Agung - Balairung Pendopo Kencana (x: -14..14, z: -126..-100)
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
  { type: 'box', xMin: -46.5, xMax: 46.5, zMin: -164.5, zMax: -161.5, yMin: 2.0, yMax: 10.0 },
  // Tembok Barat Kedaton (x: -45)
  { type: 'box', xMin: -46.5, xMax: -43.5, zMin: -164.0, zMax: -67.0, yMin: 2.0, yMax: 10.0 },
  // Tembok Timur Kedaton (x: 45)
  { type: 'box', xMin: 43.5, xMax: 46.5, zMin: -164.0, zMax: -67.0, yMin: 2.0, yMax: 10.0 },
  // Tembok Selatan Sayap Barat (Kiri Gerbang, x: -46.5..-4.5)
  { type: 'box', xMin: -46.5, xMax: -4.5, zMin: -74.5, zMax: -71.5, yMin: 2.0, yMax: 10.0 },
  // Tembok Selatan Sayap Timur (Kanan Gerbang, x: 4.5..46.5)
  { type: 'box', xMin: 4.5, xMax: 46.5, zMin: -74.5, zMax: -71.5, yMin: 2.0, yMax: 10.0 },
  // Pilar Gerbang Paduraksa Selatan Kedaton (Kiri & Kanan lorong tengah)
  { type: 'box', xMin: -8.8, xMax: -4.5, zMin: -75.2, zMax: -70.8, yMin: 2.0, yMax: 12.0 },
  { type: 'box', xMin: 4.5, xMax: 8.8, zMin: -75.2, zMax: -70.8, yMin: 2.0, yMax: 12.0 },
  // 4 Menara Sudut Bastion Kedaton
  { type: 'box', xMin: -47.5, xMax: -42.5, zMin: -165.5, zMax: -160.5, yMin: 2.0, yMax: 12.0 },
  { type: 'box', xMin: 42.5, xMax: 47.5, zMin: -165.5, zMax: -160.5, yMin: 2.0, yMax: 12.0 },
  { type: 'box', xMin: -47.5, xMax: -42.5, zMin: -75.5, zMax: -70.5, yMin: 2.0, yMax: 12.0 },
  { type: 'box', xMin: 42.5, xMax: 47.5, zMin: -75.5, zMax: -70.5, yMin: 2.0, yMax: 12.0 },
  // Sandaran Singgasana Emas Hayam Wuruk
  { type: 'box', xMin: -2.0, xMax: 2.0, zMin: -123.5, zMax: -121.5, yMin: 4.5, yMax: 9.0 },

  // 2. Gerbang Candi Bentar Wringin Lawang (Menara Kembar Terbelah Bata Merah)
  // Menara Barat (x: -5.0..-1.7, z: 35.8..40.2)
  { type: 'box', xMin: -5.0, xMax: -1.7, zMin: 35.8, zMax: 40.2, yMin: 0.5, yMax: 16.0 },
  // Menara Timur (x: 1.7..5.0, z: 35.8..40.2)
  { type: 'box', xMin: 1.7, xMax: 5.0, zMin: 35.8, zMax: 40.2, yMin: 0.5, yMax: 16.0 },

  // 3. Barak Pasukan Elit Bhayangkara (Markas Komando Militer Bata Merah, x: -98, z: 14)
  { type: 'box', xMin: -105.2, xMax: -90.8, zMin: 9.3, zMax: 18.7, yMin: 0.5, yMax: 10.0 },

  // 4. Candi Bajang Ratu: Dinding Pilar Paduraksa Sisi Utara & Selatan Lorong
  // Sisi Selatan Lorong (z: -15.0..-11.6)
  { type: 'box', xMin: 103.5, xMax: 112.5, zMin: -15.0, zMax: -11.6, yMin: 12.0, yMax: 22.0 },
  // Sisi Utara Lorong (z: -8.4..-5.0)
  { type: 'box', xMin: 103.5, xMax: 112.5, zMin: -8.4, zMax: -5.0, yMin: 12.0, yMax: 22.0 },

  // 5. Sanggar Pujangga (Meja Naskah Lontar Mpu Prapanca)
  { type: 'box', xMin: 123.8, xMax: 128.2, zMin: -15.4, zMax: -13.8, yMin: 9.8, yMax: 12.0 },

  // 6. Perkemahan Raden Wijaya Hutan Tarik (Lumbung Padi Kayu)
  { type: 'box', xMin: -17.5, xMax: -14.5, zMin: 122.5, zMax: 125.5, yMin: 1.0, yMax: 7.0 },

  // 7. Pohon Maja Agung & Pohon Beringin Raksasa Majapahit (Batang Utama Kayu)
  { type: 'circle', x: -16, z: 132, radius: 1.5, yMin: 0.5, yMax: 12.0 },
  { type: 'circle', x: 16, z: 42, radius: 1.6, yMin: 0.5, yMax: 12.0 },
  { type: 'circle', x: -20, z: -10, radius: 1.6, yMin: 0.5, yMax: 12.0 },
  { type: 'circle', x: 22, z: -46, radius: 1.6, yMin: 0.5, yMax: 12.0 },
  { type: 'circle', x: -22, z: -46, radius: 1.6, yMin: 0.5, yMax: 12.0 },
  { type: 'circle', x: 88, z: 6, radius: 1.6, yMin: 0.5, yMax: 12.0 },
  { type: 'circle', x: -92, z: 10, radius: 1.6, yMin: 0.5, yMax: 12.0 },
  { type: 'circle', x: 26, z: 118, radius: 1.6, yMin: 0.5, yMax: 12.0 },

  // 8. Stan Meja Rempah & Koin Gobog Pasar Kotaraja
  { type: 'box', xMin: 12.2, xMax: 15.8, zMin: 7.0, zMax: 9.0, yMin: 1.0, yMax: 3.5 },
  { type: 'box', xMin: 20.2, xMax: 23.8, zMin: 6.0, zMax: 8.0, yMin: 1.0, yMax: 3.5 },
  { type: 'box', xMin: 13.2, xMax: 16.8, zMin: 16.0, zMax: 18.0, yMin: 1.0, yMax: 3.5 },
  { type: 'box', xMin: 21.2, xMax: 24.8, zMin: 15.0, zMax: 17.0, yMin: 1.0, yMax: 3.5 },

  // 9. Kapal Layar Jung Jawa (Kabin Buritan Nakhoda)
  { type: 'box', xMin: -142.5, xMax: -138.5, zMin: 14.2, zMax: 23.8, yMin: 1.0, yMax: 8.0 }
];
