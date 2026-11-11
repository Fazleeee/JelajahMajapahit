// Data Dialog Bercabang, Tokoh Sejarah, dan Misi (Quest) Materi Sejarah SMP

export const NPC_DATA = [
  {
    id: 'ki_pedagang',
    name: 'Ki Tumenggung Arya',
    title: 'Syahbandar & Saudagar Rempah Kotaraja',
    zone: 'Pasar Kotaraja',
    icon: '🏺',
    coords: { x: 17, z: 10 },
    greeting: 'Selamat datang di Pasar Kotaraja, wahai penjelajah muda! Dari bau pakaianmu, kau tampak datang dari negeri yang sangat jauh.',
    dialogues: {
      root: {
        text: 'Di pasar ini, kapal-kapal dari Maluku, Campa, India, hingga Tiongkok bertukar komoditas berharga di bawah perlindungan armada Majapahit.',
        options: [
          {
            text: 'Apa saja barang dagangan paling berharga di Majapahit?',
            next: 'topic_rempah'
          },
          {
            text: 'Bagaimana sistem pembayaran dan mata uang di pasar ini?',
            next: 'topic_gobog'
          },
          {
            text: 'Adakah tugas yang bisa kubantu, Ki Tumenggung?',
            next: 'quest_check'
          }
        ]
      },
      topic_rempah: {
        text: 'Rempah-rempah Nusantara! Buah pala dan cengkeh dari Kepulauan Maluku adalah emas hitam dunia. Bangsa barat menempuh ribuan mil laut hanya demi segenggam cengkeh yang bernilai setara emas murni.',
        options: [
          { text: 'Lalu bagaimana dengan mata uangnya?', next: 'topic_gobog' },
          { text: 'Kembali ke pembicaraan awal.', next: 'root' }
        ]
      },
      topic_gobog: {
        text: 'Kami menggunakan koin perunggu berlubang yang disebut "Koin Gobog Majapahit". Koin ini kami adaptasi dari koin kepeng Tiongkok, namun kami beri ukiran khas Jawa seperti tokoh wayang dan pohon hayat!',
        options: [
          { text: 'Wah, menarik sekali! Lalu celengan babi itu untuk apa?', next: 'topic_celengan' },
          { text: 'Kembali ke pembicaraan awal.', next: 'root' }
        ]
      },
      topic_celengan: {
        text: 'Masyarakat Majapahit rajin menabung! Kami membuat celengan dari tanah liat (terakota) berbentuk babi hutan (celeng). Jika sudah penuh dengan koin Gobog, celengan dipecahkan.',
        options: [
          { text: 'Saya paham sekarang!', next: 'root' }
        ]
      }
    }
  },
  {
    id: 'mpu_prapanca',
    name: 'Dang Acarya Prapanca',
    title: 'Pujangga Agung Istana (Penulis Negarakertagama)',
    zone: 'Sanggar Pujangga',
    icon: '📜',
    coords: { x: 124, z: -11.5 },
    greeting: 'Salam damai dalam lindungan Hyang Widhi, Ananda. Di sanggar hening lereng candi inilah kami menggoreskan sejarah di atas lembaran daun lontar.',
    dialogues: {
      root: {
        text: 'Aku bersama sahabatku Mpu Tantular sedang mencatat tata peradaban dan keagungan hukum negara yang menaungi rakyat dari berbagai keyakinan.',
        options: [
          {
            text: 'Apa yang tertulis dalam Kitab Negarakertagama, Mpu?',
            next: 'topic_negarakertagama'
          },
          {
            text: 'Apa makna sesungguhnya dari kalimat "Bhinneka Tunggal Ika"?',
            next: 'topic_sutasoma'
          },
          {
            text: 'Adakah naskah lontar yang perlu kutemukan?',
            next: 'quest_check'
          }
        ]
      },
      topic_negarakertagama: {
        text: 'Kitab Kakawin Desawarnana atau Negarakertagama (1365 M) mencatat perjalanan Prabu Hayam Wuruk memeriksa desa-desa, struktur birokrasi, serta daerah-daerah sahabat di seberang lautan.',
        options: [
          { text: 'Bagaimana dengan toleransi beragama di masa ini?', next: 'topic_sutasoma' },
          { text: 'Kembali ke pokok pembicaraan.', next: 'root' }
        ]
      },
      topic_sutasoma: {
        text: 'Sahabatku Mpu Tantular menulis dalam Kitab Sutasoma: "Rwaneka dhatu winuwus Buddha Wiswa, Bhinneki rakwa ring apan kena parwanosen, Mangka ng Jinatwa kalawan Siwatatwa tunggal, Bhinneka Tunggal Ika Tan Hana Dharma Mangrwa." Artinya: Meskipun Siwa dan Buddha tampak berbeda, hakikat kebenarannya adalah tunggal. Tidak ada kebenaran yang mendua!',
        options: [
          { text: 'Luar biasa! Konsep ini menjadi semboyan bangsa kami di masa depan.', next: 'root' }
        ]
      }
    }
  },
  {
    id: 'gajah_mada',
    name: 'Mahapatih Gajah Mada',
    title: 'Panglima Tertinggi Komando Bhayangkara',
    zone: 'Barak Bhayangkara',
    icon: '⚔️',
    coords: { x: -95, z: 22.5 },
    greeting: 'Tegakkan pandanganmu, Ksatria Muda! Di hadapan armada Jung Jawa dan barisan Bhayangkara, tidak ada tempat bagi keraguan!',
    dialogues: {
      root: {
        text: 'Sejak kuikrarkan Sumpah Palapa di hadapan Ibu Suri Tribhuwana Tunggadewi pada tahun 1336 M, tekadku bulat untuk mempersatukan pulau-pulau di seberang lautan Nusantara.',
        options: [
          {
            text: 'Mengapa Mahapatih mengucapkan Sumpah Palapa?',
            next: 'topic_sumpah'
          },
          {
            text: 'Bagaimana ketangguhan armada maritim dan meriam Cetbang?',
            next: 'topic_maritim'
          },
          {
            text: 'Aku siap mengabdi membela Nusantara, Mahapatih!',
            next: 'quest_check'
          }
        ]
      },
      topic_sumpah: {
        text: '"Lamun huwus kalah Nusantara isun amukti palapa..." Aku bersumpah tidak akan mengecap kenikmatan duniawi sebelum Gurun, Seram, Tanjungpura, Haru, Pahang, Dompo, Bali, Sunda, Palembang, dan Tumasik bersatu di bawah panji kedaulatan!',
        options: [
          { text: 'Apakah Sumpah Palapa itu tentang penaklukan atau persatuan?', next: 'topic_persatuan' },
          { text: 'Bagaimana cara menjaganya di lautan?', next: 'topic_maritim' }
        ]
      },
      topic_persatuan: {
        text: 'Bukan sekadar penaklukan, melainkan integrasi maritim agar perairan Nusantara bebas dari perompak dan bangsa luar tidak dapat memecah-belah kerajaan-kerajaan pulau kita!',
        options: [
          { text: 'Visi persatuan yang sangat berani dan visioner!', next: 'root' }
        ]
      },
      topic_maritim: {
        text: 'Kapal Jung Jawa kami memiliki papan kayu jati berlapis ganda yang kebal terhadap tembakan panah api, dipersenjatai meriam Cetbang perunggu hasil karya pandai besi terbaik kotaraja!',
        options: [
          { text: 'Sungguh membanggakan kejayaan maritim Nusantara!', next: 'root' }
        ]
      }
    }
  },
  {
    id: 'hayam_wuruk',
    name: 'Sri Rajasanagara (Prabu Hayam Wuruk)',
    title: 'Maharaja Agung Penguasa Imperium Majapahit',
    zone: 'Kedaton Agung',
    icon: '👑',
    coords: { x: 0, z: -119 },
    greeting: 'Selamat datang ke hadapan Singgasana Surya Majapahit, Penjelajah Waktu. Kami telah mendengar kabar mengenai baktimu mengarungi Trowulan.',
    dialogues: {
      root: {
        text: 'Di bawah naungan lambang Surya bersinar delapan, Majapahit mencapai puncak kemakmuran bukan hanya karena kekuatan bala tentara, melainkan karena keadilan hukum dan kesejahteraan rakyat jelata.',
        options: [
          {
            text: 'Bagaimana Baginda menjaga hubungan dengan kerajaan lain?',
            next: 'topic_mitreka'
          },
          {
            text: 'Bagaimana Baginda memakmurkan bidang pertanian dan perairan?',
            next: 'topic_irigasi'
          },
          {
            text: 'Hamba menghadap untuk mempersembahkan bukti bakti hamba.',
            next: 'quest_check'
          }
        ]
      },
      topic_mitreka: {
        text: 'Kami memegang prinsip "Mitreka Satata", yaitu persahabatan yang setara dan saling menghormati dengan kerajaan sahabat di seberang benua seperti Syangka (Siam/Thailand), Campa (Vietnam), Kamboja, dan Tiongkok.',
        options: [
          { text: 'Lalu bagaimana dengan pertanian rakyat?', next: 'topic_irigasi' },
          { text: 'Kembali ke hadapan Baginda.', next: 'root' }
        ]
      },
      topic_irigasi: {
        text: 'Kami membangun bendungan di Sungai Brantas dan waduk raksasa Kolam Segaran agar sawah-sawah rakyat tetap teraliri air saat musim kemarau panjang. Rakyat yang kenyang adalah tiang negara yang kokoh!',
        options: [
          { text: 'Kebijakan yang sangat bijaksana, Baginda Raja.', next: 'root' }
        ]
      }
    }
  },
  {
    id: 'prajurit_brantas',
    name: 'Senopati Danu',
    title: 'Perwira Pengawal Jembatan Sungai Brantas',
    zone: 'Jembatan Brantas',
    icon: '🛡️',
    coords: { x: 5, z: 56 },
    greeting: 'Berhenti sejenak, Pengelana! Jembatan Sungai Brantas ini dijaga ketat siang dan malam demi keamanan Kotaraja Trowulan.',
    dialogues: {
      root: {
        text: 'Jika kau hendak menyeberang ke arah utara, perhatikan Gerbang Wringin Lawang dan jangan membuat keonaran di Pasar Kotaraja.',
        options: [
          {
            text: 'Mengapa Sungai Brantas ini begitu penting?',
            next: 'topic_brantas'
          },
          {
            text: 'Terima kasih atas petunjuknya, Senopati.',
            next: 'root_close'
          }
        ]
      },
      topic_brantas: {
        text: 'Sungai Brantas membelah bumi Jawa Timur dari hulu Gunung Arjuno hingga muara pesisir. Segala kapal niaga dan upeti daerah bawahan melintasi air sungai ini!',
        options: [
          { text: 'Saya mengerti, Senopati. Terima kasih!', next: 'root' }
        ]
      },
      root_close: {
        text: 'Silakan melintas dengan tertib dan waspada di jalan raya kerajaan!',
        options: []
      }
    }
  }
];

export const QUESTS = [
  {
    id: 'quest_1_rempah',
    npcId: 'ki_pedagang',
    title: 'Misi 1: Aroma Rempah & Koin Gobog Kotaraja',
    giverName: 'Ki Tumenggung Arya',
    zone: 'Pasar Kotaraja',
    icon: '🪙',
    summary: 'Temukan Koin Gobog Wayang di Pasar Kotaraja dan Celengan Babi Terakota di Kolam Segaran untuk memahami sistem perdagangan kuno Majapahit.',
    requiredRelics: ['koin_gobog_wayang', 'celengan_terakota'],
    loreReward: 'Kamu telah mempelajari komoditas rempah pala/cengkeh dan sistem menabung koin Gobog masyarakat Majapahit abad ke-14.'
  },
  {
    id: 'quest_2_lontar',
    npcId: 'mpu_prapanca',
    title: 'Misi 2: Bait Sumpah & Toleransi Luhur Nusantara',
    giverName: 'Dang Acarya Prapanca',
    zone: 'Lembah Candi & Sanggar Pujangga',
    icon: '📜',
    summary: 'Kumpulkan Fragmen Kitab Negarakertagama di Sanggar Pujangga dan Lontar Sutasoma di Candi Bajang Ratu.',
    requiredRelics: ['lontar_negarakertagama', 'lontar_sutasoma'],
    loreReward: 'Kamu memahami lahirnya semboyan suci "Bhinneka Tunggal Ika Tan Hana Dharma Mangrwa" serta catatan sejarah Negarakertagama.'
  },
  {
    id: 'quest_3_sumpah',
    npcId: 'gajah_mada',
    title: 'Misi 3: Sumpah Palapa Sang Mahapatih',
    giverName: 'Mahapatih Gajah Mada',
    zone: 'Barak Bhayangkara & Dermaga Jung',
    icon: '⚔️',
    summary: 'Bawakan Kompas Layar Jung Jawa dan Peluru Perunggu Meriam Cetbang ke hadapan Mahapatih Gajah Mada.',
    requiredRelics: ['kompas_jung', 'cetbang_bullet'],
    loreReward: 'Gajah Mada menganugerahimu Lencana Ksatria Bhayangkara atas pemahamanmu terhadap kejayaan maritim Nusantara.'
  },
  {
    id: 'quest_4_kedaton',
    npcId: 'hayam_wuruk',
    title: 'Misi 4: Titah Luhur Sri Rajasanagara',
    giverName: 'Prabu Hayam Wuruk',
    zone: 'Kedaton Agung',
    icon: '👑',
    summary: 'Persembahkan Keris Luk 9 Emas dan Arca Emas Harihara ke hadapan Singgasana Surya Majapahit.',
    requiredRelics: ['keris_majapahit', 'arca_harihara'],
    loreReward: 'Prabu Hayam Wuruk memberkatimu sebagai Duta Penjelajah Waktu Sejarah Nusantara sejati!'
  }
];
