// Sistem Kuis Evaluasi Belajar Sejarah SMP & Sertifikat Penjelajah Waktu
import { gameState, ModalTypes } from '../core/GameState.js';
import { eventBus, GameEvents } from '../core/EventBus.js';

export const QUIZ_QUESTIONS = [
  {
    id: 1,
    topic: 'Asal-Usul & Pendiri',
    question: 'Mengapa kerajaan agung yang didirikan oleh Raden Wijaya pada tahun 1293 M dinamakan "Majapahit"?',
    options: [
      'Prajurit Raden Wijaya memakan buah pohon Maja di Hutan Tarik yang rasanya pahit',
      'Sungai Brantas mengeluarkan rasa pahit akibat letusan abu vulkanik',
      'Raden Wijaya mengenang masa-masa pahit saat Kerajaan Singasari runtuh',
      'Mpu Prapanca meracik obat herbal pahit untuk mengobati para perwira'
    ],
    correctIndex: 0,
    explanation: 'Ketika membuka Hutan Tarik bersama para pengikutnya pada 1293 M, prajurit Raden Wijaya memetik buah pohon Maja yang rasanya sangat pahit. Kejadian ini menginspirasi nama "Majapahit".'
  },
  {
    id: 2,
    topic: 'Visi Penyatuan Nusantara',
    question: 'Apa isi dan makna terpenting dari Sumpah Palapa yang diikrarkan Mahapatih Gajah Mada pada tahun 1336 M?',
    options: [
      'Tidak akan menikmati istirahat atau kenikmatan duniawi sebelum kepulauan Nusantara bersatu',
      'Tidak akan makan nasi sebelum menaklukkan seluruh armada tentara Mongol',
      'Menolak diangkat menjadi Mahapatih sebelum Prabu Hayam Wuruk dewasa',
      'Bersumpah berlayar mengelilingi Samudra Hindia dengan kapal Jung Jawa'
    ],
    correctIndex: 0,
    explanation: 'Dalam Kitab Pararaton, Gajah Mada bersumpah: "Lamun huwus kalah Nusantara isun amukti palapa..." Beliau pantang menikmati kemewahan/istirahat sebelum wilayah maritim Nusantara bersatu di bawah kedaulatan Majapahit.'
  },
  {
    id: 3,
    topic: 'Karya Sastra & Semboyan Nasional',
    question: 'Semboyan resmi negara Indonesia "Bhinneka Tunggal Ika" berasal dari mahakarya sastra Majapahit abad ke-14 gubahan Mpu Tantular, yaitu...',
    options: [
      'Kitab Sutasoma',
      'Kitab Negarakertagama',
      'Kitab Pararaton',
      'Prasasti Kudadu'
    ],
    correctIndex: 0,
    explanation: 'Mpu Tantular menulis bait "Bhinneka Tunggal Ika Tan Hana Dharma Mangrwa" dalam Kitab Sutasoma untuk mengajarkan kerukunan hidup antara penganut agama Siwa (Hindu) dan Buddha di Majapahit.'
  },
  {
    id: 4,
    topic: 'Ekonomi & Jalur Perdagangan',
    question: 'Mata uang perunggu berlubang segi empat di tengahnya yang digunakan dalam transaksi perdagangan bebas di Pasar Kotaraja Majapahit adalah...',
    options: [
      'Koin Gobog Majapahit',
      'Dinar Emas Samudra Pasai',
      'Uang Kertas Gulden',
      'Keping Real Spanyol'
    ],
    correctIndex: 0,
    explanation: 'Koin Gobog adalah mata uang perunggu berlubang segi empat khas Majapahit berhiaskan relief wayang dan pohon hayat, digunakan untuk perdagangan lokal dan antarpulau.'
  },
  {
    id: 5,
    topic: 'Diplomasi & Puncak Kejayaan',
    question: 'Di masa keemasan Prabu Hayam Wuruk, Majapahit menjalin hubungan persahabatan setara dengan kerajaan-kerajaan di Asia Tenggara (Siam, Campa, Kamboja) dengan prinsip...',
    options: [
      'Mitreka Satata (Sahabat yang Setara)',
      'Sumpah Palapa',
      'Dharmadhyaksa',
      'Satya Haprabu'
    ],
    correctIndex: 0,
    explanation: 'Prinsip "Mitreka Satata" berarti memandang kerajaan-kerajaan sahabat mancanegara sebagai mitra sejajar yang saling menghormati dan bekerja sama dalam bidang perdagangan maritim.'
  }
];

export class QuizSystem {
  constructor(audioSystem) {
    this.audio = audioSystem;

    this.modal = document.getElementById('quiz-modal');
    this.btnClose = document.getElementById('btn-quiz-close');

    // Quiz Step Elements
    this.quizQuestionNumEl = document.getElementById('quiz-question-num');
    this.quizTopicEl = document.getElementById('quiz-topic');
    this.quizTextEl = document.getElementById('quiz-text');
    this.quizOptionsContainer = document.getElementById('quiz-options-list');
    this.quizFeedbackBox = document.getElementById('quiz-feedback-box');
    this.quizFeedbackText = document.getElementById('quiz-feedback-text');
    this.btnNextQuestion = document.getElementById('btn-quiz-next');

    // Certificate Result Elements
    this.certificateView = document.getElementById('quiz-certificate-view');
    this.quizCardView = document.getElementById('quiz-card-view');
    this.certStudentName = document.getElementById('cert-student-name');
    this.certScore = document.getElementById('cert-score');
    this.certTitle = document.getElementById('cert-title');
    this.inputStudentName = document.getElementById('input-student-name');
    this.btnCertUpdate = document.getElementById('btn-cert-update');
    this.btnRestartQuiz = document.getElementById('btn-quiz-restart');
    this.btnCertClose = document.getElementById('btn-cert-close');

    this.currentQuestionIdx = 0;
    this.score = 0;
    this.hasAnsweredCurrent = false;

    this.bindEvents();
  }

  bindEvents() {
    if (this.btnClose) {
      this.btnClose.addEventListener('click', (e) => {
        e.stopPropagation();
        this.close();
      });
    }

    if (this.modal) {
      this.modal.addEventListener('click', (e) => {
        if (e.target === this.modal) {
          this.close();
        }
      });
      this.modal.addEventListener('wheel', (e) => e.stopPropagation());
      this.modal.addEventListener('mousedown', (e) => e.stopPropagation());
    }

    window.addEventListener('keydown', (e) => {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
      if (e.code === 'KeyK') {
        this.toggle();
      } else if (e.code === 'Escape' && this.modal && !this.modal.classList.contains('hidden')) {
        this.close();
      }
    });

    if (this.btnNextQuestion) {
      this.btnNextQuestion.addEventListener('click', () => {
        this.nextQuestion();
      });
    }

    if (this.btnCertUpdate) {
      this.btnCertUpdate.addEventListener('click', () => {
        const name = this.inputStudentName.value.trim() || 'Penjelajah Waktu';
        this.certStudentName.textContent = name;
        if (this.audio) this.audio.playDiscoveryChime();
      });
    }

    if (this.inputStudentName) {
      this.inputStudentName.addEventListener('keydown', (e) => {
        e.stopPropagation();
        if (e.key === 'Enter' && this.btnCertUpdate) {
          this.btnCertUpdate.click();
        }
      });
    }

    if (this.btnRestartQuiz) {
      this.btnRestartQuiz.addEventListener('click', () => {
        this.startQuiz();
      });
    }

    if (this.btnCertClose) {
      this.btnCertClose.addEventListener('click', (e) => {
        e.stopPropagation();
        this.close();
      });
    }

    eventBus.on(GameEvents.MODAL_CLOSE, ({ modalType }) => {
      if (!modalType || modalType === ModalTypes.QUIZ) {
        if (this.modal && !this.modal.classList.contains('hidden')) {
          this.modal.classList.add('hidden');
        }
      }
    });

    eventBus.on(GameEvents.MODAL_OPEN, ({ modalType }) => {
      if (modalType === ModalTypes.QUIZ) {
        this.openDirect();
      }
    });
  }

  toggle() {
    gameState.toggleModal(ModalTypes.QUIZ);
  }

  open() {
    gameState.openModal(ModalTypes.QUIZ);
  }

  openDirect() {
    if (this.audio) this.audio.playDialoguePop();
    this.startQuiz();
    if (this.modal) this.modal.classList.remove('hidden');
  }

  close() {
    gameState.closeModal(ModalTypes.QUIZ);
  }

  startQuiz() {
    this.currentQuestionIdx = 0;
    this.score = 0;
    this.hasAnsweredCurrent = false;

    this.quizCardView.classList.remove('hidden');
    this.certificateView.classList.add('hidden');
    this.renderQuestion();
  }

  renderQuestion() {
    this.hasAnsweredCurrent = false;
    this.quizFeedbackBox.classList.add('hidden');
    this.btnNextQuestion.classList.add('hidden');

    const q = QUIZ_QUESTIONS[this.currentQuestionIdx];
    this.quizQuestionNumEl.textContent = `SOAL ${this.currentQuestionIdx + 1} DARI ${QUIZ_QUESTIONS.length}`;
    this.quizTopicEl.textContent = `Materi: ${q.topic}`;
    this.quizTextEl.textContent = q.question;

    this.quizOptionsContainer.innerHTML = '';
    q.options.forEach((optText, idx) => {
      const btn = document.createElement('button');
      btn.className = 'btn-quiz-option';
      btn.innerHTML = `
        <span class="option-letter">${String.fromCharCode(65 + idx)}</span>
        <span class="option-text">${optText}</span>
      `;

      btn.addEventListener('click', () => {
        if (this.hasAnsweredCurrent) return;
        this.selectAnswer(idx, btn, q);
      });

      this.quizOptionsContainer.appendChild(btn);
    });
  }

  selectAnswer(selectedIndex, selectedBtn, question) {
    this.hasAnsweredCurrent = true;
    const isCorrect = selectedIndex === question.correctIndex;

    const allButtons = this.quizOptionsContainer.querySelectorAll('.btn-quiz-option');
    allButtons.forEach((btn, idx) => {
      btn.disabled = true;
      if (idx === question.correctIndex) {
        btn.classList.add('correct');
      } else if (idx === selectedIndex && !isCorrect) {
        btn.classList.add('wrong');
      }
    });

    if (isCorrect) {
      this.score += 20; // 5 soal x 20 = 100
      if (this.audio) this.audio.playQuizCorrect();
      this.quizFeedbackBox.className = 'quiz-feedback-box correct';
      this.quizFeedbackText.innerHTML = `<strong>Jawaban Benar! (+20 Poin)</strong><br>${question.explanation}`;
    } else {
      if (this.audio) this.audio.playQuizWrong();
      this.quizFeedbackBox.className = 'quiz-feedback-box wrong';
      this.quizFeedbackText.innerHTML = `<strong>Kurang Tepat.</strong><br>${question.explanation}`;
    }

    this.quizFeedbackBox.classList.remove('hidden');
    this.btnNextQuestion.classList.remove('hidden');
    this.btnNextQuestion.textContent =
      this.currentQuestionIdx + 1 < QUIZ_QUESTIONS.length
        ? 'Lanjut ke Soal Berikutnya →'
        : 'Lihat Hasil & Terbitkan Sertifikat 🏆';
  }

  nextQuestion() {
    if (this.currentQuestionIdx + 1 < QUIZ_QUESTIONS.length) {
      this.currentQuestionIdx++;
      this.renderQuestion();
    } else {
      this.showCertificate();
    }
  }

  showCertificate() {
    this.quizCardView.classList.add('hidden');
    this.certificateView.classList.remove('hidden');

    if (this.audio) this.audio.playQuestComplete();

    this.certScore.textContent = `${this.score}/100`;

    let titleRank = 'Pengelana Sejarah Nusantara';
    if (this.score === 100) {
      titleRank = 'Mahapatih Utama Sejarah Nusantara (Sempurna)';
    } else if (this.score >= 80) {
      titleRank = 'Senopati Luhur Majapahit';
    } else if (this.score >= 60) {
      titleRank = 'Ksatria Bhayangkara Sejati';
    }
    this.certTitle.textContent = titleRank;
  }
}
