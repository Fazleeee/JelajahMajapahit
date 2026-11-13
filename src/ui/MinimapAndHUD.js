import { ZONES, LANDMARKS, BRIDGES } from '../world/WorldData.js';
import { getRiverCenterZ } from '../world/Terrain.js';
import { HISTORICAL_ARTIFACTS, VIEWPOINTS } from '../exploration/ExplorationSystem.js';
import { NPC_DATA } from '../quests/QuestData.js';
import { gameState, GameStates, ModalTypes } from '../core/GameState.js';
import { eventBus, GameEvents } from '../core/EventBus.js';

// Pemetaan Fraksi & Gelar Tradisional Tokoh Sejarah Kotaraja Majapahit
const NPC_FACTIONS = {
  ki_pedagang: 'Syahbandar & Saudagar Rempah Kotaraja',
  mpu_prapanca: 'Dharmadhyaksa ring Kasogatan & Pujangga Keraton',
  gajah_mada: 'Komando Tertinggi Pasukan Elit Bhayangkara',
  hayam_wuruk: 'Bhattara Saptaprabhu & Dinasti Rajasa',
  prajurit_brantas: 'Garda Keamanan Perbatasan & Jembatan Brantas'
};

// Kutipan Naskah Kuno Primer untuk Kropak Lontar Sejarah
const LORE_SOURCES_MAP = [
  {
    match: ['pohon maja', 'raden wijaya', 'hutan tarik'],
    source: 'Serat Pararaton (1600 M) & Kidung Harsawijaya',
    quote: '"...Hana ta sira rāden wijaya anangun desa ring wana tarik, ana wwang mangan woh maja rasanya pahiyt, yata matangnyan inaranan Majapahit."'
  },
  {
    match: ['jembatan', 'brantas', 'sungai', 'perahu'],
    source: 'Prasasti Canggu / Trowulan I (1358 M, Lempeng V)',
    quote: '"...Nāhan tikanang tambang i curabhāya, naditira makasumber ning drawnya ring parahu, lumaku tan patambangan ri sang prabhu."'
  },
  {
    match: ['wringin lawang', 'candi bentar', 'gerbang'],
    source: 'Kakawin Nagarakertagama (Desawarnana, Pupuh VIII:1)',
    quote: '"...Bata bang winangun raras pinarikik ring pura wringin lawang, pinakā dwāra utama ring kutha rika sang mantri lumaku."'
  },
  {
    match: ['pasar', 'gobog', 'rempah', 'saudagar'],
    source: 'Yingya Shenglan (Catatan Ma Huan, Ekspedisi Cheng Ho 1416 M)',
    quote: '"...Mata uang tembaga dari Tiongkok kuno dipakai dalam segala urusan jual beli. Pasar mereka menjual buah pinang, lada, pala, beras putih bermutu tinggi, dan kain tenun bermotif burung."'
  },
  {
    match: ['kolam segaran', 'waduk', 'terakota', 'air'],
    source: 'Tradisi Lisan Trowulan & Catatan Babad Majapahit',
    quote: '"...Waduk agung kinarya tirta suci, papan pasamuan para duta manca nagara, wadah pasang surut tirta kotaraja."'
  },
  {
    match: ['bajang ratu', 'paduraksa', 'jayanegara'],
    source: 'Kakawin Nagarakertagama (Pupuh LXIV:1-2)',
    quote: '"...Sira ta sinungan dharmeng Criranggappura winangun paduraksa kencana, pinarikik ring bata bang sinangling acala."'
  },
  {
    match: ['sanggar pujangga', 'sutasoma', 'prapanca', 'tantular', 'bhinneka'],
    source: 'Kakawin Sutasoma (Pupuh CXXXIX:5, Mpu Tantular)',
    quote: '"...Rwaneka dhatu winuwus Buddha Wiswa, Bhinneki rakwa ring apan kena parwanosen, Mangka ng Jinatwa kalawan Siwatatwa tunggal, Bhinneka Tunggal Ika Tan Hana Dharma Mangrwa."'
  },
  {
    match: ['kapal jung', 'maritim', 'cetbang', 'armada'],
    source: 'Suma Oriental karya Tomé Pires (1515 M)',
    quote: '"...Orang Jawa adalah pelaut yang sangat ahli. Jung-jung mereka berukuran sangat besar, berbobot 500-1000 ton dengan kayu jati berlapis empat yang tidak dapat ditembus meriam."'
  },
  {
    match: ['bhayangkara', 'gajah mada', 'sumpah palapa'],
    source: 'Serat Pararaton (Teks Asli Sumpah Palapa 1336 M)',
    quote: '"...Sira Gajah Mada patih Amangkubhumi tan ayun amukti palapa, sira Gajah Mada: Lamun huwus kalah Nusantara isun amukti palapa..."'
  },
  {
    match: ['kedaton', 'balairung', 'singgasana', 'hayam wuruk'],
    source: 'Kakawin Nagarakertagama (Pupuh VIII - XII)',
    quote: '"...Ri purnameng asuji prabhu hayam wuruk manggihaken para ratu kabeh, linggih ring witana mas pinatik ratna dwipa surya majapahit."'
  }
];

export class MinimapAndHUD {
  constructor(audioSystem, explorationSystem, questSystem) {
    this.audio = audioSystem;
    this.exploration = explorationSystem;
    this.quests = questSystem;

    this.minimapFrame = document.querySelector('.minimap-frame');
    this.minimapCanvas = document.getElementById('minimap-canvas');
    this.ctx = this.minimapCanvas.getContext('2d');

    // Minimalist Top Bar Navigation
    this.zonePill = document.getElementById('zone-pill');
    this.zoneNameEl = document.getElementById('zone-name');
    this.coordsEl = document.getElementById('coords-display');

    // Quest Pill & Popover
    this.questPill = document.getElementById('quest-pill');
    this.questPillBadge = document.getElementById('quest-pill-badge');
    this.questTitleEl = document.getElementById('quest-tracker-title');
    this.questDetailPopover = document.getElementById('quest-detail-popover');
    this.btnQuestClose = document.getElementById('btn-quest-close');
    this.questTaskEl = document.getElementById('quest-tracker-task');
    this.questProgressEl = document.getElementById('quest-tracker-progress');

    // Unified Header Menu
    this.btnToggleMenu = document.getElementById('btn-toggle-menu');
    this.unifiedHeaderMenu = document.getElementById('unified-header-menu');
    this.btnCloseMenu = document.getElementById('btn-close-menu');
    this.playerRankTitle = document.getElementById('player-rank-title');
    this.profileRelicCount = document.getElementById('profile-relic-count');

    // Unified Menu Action Buttons
    this.menuBtnMap = document.getElementById('menu-btn-map');
    this.menuBtnJournal = document.getElementById('menu-btn-journal');
    this.menuBtnLantern = document.getElementById('menu-btn-lantern');
    this.menuBtnQuiz = document.getElementById('menu-btn-quiz');
    this.menuBtnHelp = document.getElementById('menu-btn-help');
    this.menuBtnFullscreen = document.getElementById('menu-btn-fullscreen');

    // Quest Completion Non-Intrusive Toast
    this.questCompleteToast = document.getElementById('quest-complete-toast');
    this.qtoastTitle = document.getElementById('qtoast-title');
    this.qtoastLore = document.getElementById('qtoast-lore');
    this.btnQtoastClose = document.getElementById('btn-qtoast-close');

    // Prompt Interaksi [Tekan E]
    this.interactPrompt = document.getElementById('interact-prompt');
    this.interactActionEl = document.querySelector('.prompt-action');
    this.interactTargetName = document.getElementById('interact-target-name');

    // Modal Catatan Prasasti / Jurnal (Kropak Lontar)
    this.loreModal = document.getElementById('lore-modal');
    this.loreModalTitle = document.getElementById('lore-modal-title');
    this.loreModalBody = document.getElementById('lore-modal-body');
    this.loreSourceBox = document.getElementById('lore-source-box');
    this.btnLoreClose = document.getElementById('btn-lore-close');

    // Modal Penemuan Artefak
    this.artifactModal = document.getElementById('artifact-modal');
    this.artTitleEl = document.getElementById('art-modal-title');
    this.artEraEl = document.getElementById('art-modal-era');
    this.artZoneEl = document.getElementById('art-modal-zone');
    this.artLoreEl = document.getElementById('art-modal-lore');
    this.btnArtClose = document.getElementById('btn-art-close');

    // Modal Dialog Tokoh Sejarah (RPG Dialogue Box)
    this.dialogueModal = document.getElementById('dialogue-modal');
    this.speakerIconEl = document.getElementById('speaker-icon');
    this.speakerNameEl = document.getElementById('speaker-name');
    this.speakerTitleEl = document.getElementById('speaker-title');
    this.speakerFactionEl = document.getElementById('speaker-faction');
    this.dialogueTextEl = document.getElementById('dialogue-text');
    this.dialogueChoicesEl = document.getElementById('dialogue-choices');
    this.btnDialogueClose = document.getElementById('btn-dialogue-close');

    // Banner Sinematik Sinkronisasi Viewpoint
    this.viewpointBanner = document.getElementById('viewpoint-banner');
    this.vpTitleEl = document.getElementById('vp-banner-title');
    this.vpZoneEl = document.getElementById('vp-banner-zone');

    // Dialog RPG Typewriter
    this.typewriterTimer = null;
    this.fullDialogueText = '';
    this.isTyping = false;

    // Fullscreen Atlas Modal
    this.atlasModal = document.getElementById('atlas-modal');
    this.atlasCanvas = document.getElementById('atlas-canvas');
    this.atlasCtx = this.atlasCanvas ? this.atlasCanvas.getContext('2d') : null;
    this.btnAtlasClose = document.getElementById('btn-atlas-close');
    this.btnMapExpand = document.getElementById('btn-map-expand');
    this.atlasCurrentZone = document.getElementById('atlas-current-zone');
    this.atlasCurrentDesc = document.getElementById('atlas-current-desc');

    // Help Modal
    this.helpModal = document.getElementById('help-modal');
    this.btnHelpClose = document.getElementById('btn-help-close');

    this.currentZoneId = null;
    this.currentZoneObj = ZONES[0];
    this.currentDialogueNPC = null;
    this._lastCoordsText = '';
    this._lastMinimapDrawTime = 0;
    this._lastAtlasDrawTime = 0;
    this.savedPlayerPos = { x: 0, z: 120, y: 2 };
    this.savedPlayerYaw = 0;

    // Pre-rendered offscreen canvases for ultra-fast Minimap rendering
    this.initMinimapLayers();

    this.bindEvents();
    this.initGameStateListeners();
    this.updateRelicBadge();
    this.updateQuestTracker();
  }

  initMinimapLayers() {
    const w = this.minimapCanvas.width;
    const h = this.minimapCanvas.height;
    const scale = w / 380;
    const toMapX = (wx) => w * 0.5 + wx * scale;
    const toMapY = (wz) => h * 0.5 + wz * scale;

    // 1. Static Base Map Layer (rendered once)
    this.staticMapCanvas = document.createElement('canvas');
    this.staticMapCanvas.width = w;
    this.staticMapCanvas.height = h;
    const sCtx = this.staticMapCanvas.getContext('2d');

    // Latar kartografi radarmap bertekstur radial zamrud gelap
    const bgGrad = sCtx.createRadialGradient(w * 0.5, h * 0.5, w * 0.1, w * 0.5, h * 0.5, w * 0.52);
    bgGrad.addColorStop(0, '#2a4224');
    bgGrad.addColorStop(0.7, '#1d2f1a');
    bgGrad.addColorStop(1, '#121d11');
    sCtx.fillStyle = bgGrad;
    sCtx.fillRect(0, 0, w, h);

    // Lingkaran cincin radar konsentris halus
    sCtx.strokeStyle = 'rgba(229, 184, 66, 0.12)';
    sCtx.lineWidth = 1;
    for (const rFrac of [0.28, 0.45]) {
      sCtx.beginPath();
      sCtx.arc(w * 0.5, h * 0.5, w * rFrac, 0, Math.PI * 2);
      sCtx.stroke();
    }

    // Zona-zona
    for (const z of ZONES) {
      sCtx.beginPath();
      sCtx.arc(toMapX(z.center.x), toMapY(z.center.z), z.radius * scale * 0.65, 0, Math.PI * 2);
      sCtx.fillStyle = z.color + '33';
      sCtx.fill();
      sCtx.strokeStyle = z.color + '88';
      sCtx.lineWidth = 1;
      sCtx.stroke();
    }

    // Sungai Brantas
    sCtx.beginPath();
    for (let wx = -190; wx <= 190; wx += 8) {
      const rz = getRiverCenterZ(wx);
      const mx = toMapX(wx);
      const my = toMapY(rz);
      if (wx === -190) sCtx.moveTo(mx, my);
      else sCtx.lineTo(mx, my);
    }
    sCtx.strokeStyle = '#257d8f';
    sCtx.lineWidth = 8;
    sCtx.stroke();

    // Kolam Segaran
    sCtx.fillStyle = '#257d8f';
    sCtx.strokeStyle = '#b84a39';
    sCtx.lineWidth = 1.5;
    const kx = toMapX(-68);
    const ky = toMapY(-20);
    const kw = 32 * scale;
    const kh = 50 * scale;
    sCtx.fillRect(kx, ky, kw, kh);
    sCtx.strokeRect(kx, ky, kw, kh);

    // Jalan Kerajaan
    sCtx.strokeStyle = '#b86843';
    sCtx.lineWidth = 2.5;
    sCtx.beginPath();
    sCtx.moveTo(toMapX(0), toMapY(160));
    sCtx.lineTo(toMapX(0), toMapY(-130));
    sCtx.moveTo(toMapX(-135), toMapY(-4));
    sCtx.lineTo(toMapX(120), toMapY(-4));
    sCtx.stroke();

    // Jembatan
    sCtx.fillStyle = '#d4af37';
    for (const b of BRIDGES) {
      sCtx.fillRect(
        toMapX(b.xMin) - 1,
        toMapY(b.zMin),
        Math.max(3, (b.xMax - b.xMin) * scale),
        (b.zMax - b.zMin) * scale
      );
    }

    // Titik Prasasti Sejarah
    for (const lm of LANDMARKS) {
      const lx = toMapX(lm.position.x);
      const ly = toMapY(lm.position.z);
      sCtx.fillStyle = '#f9d976';
      sCtx.beginPath();
      sCtx.arc(lx, ly, 2.6, 0, Math.PI * 2);
      sCtx.fill();
    }

    // Titik NPC Tokoh Sejarah (Ikon Bulat Hijau Zamrud)
    for (const npc of NPC_DATA) {
      const nx = toMapX(npc.coords.x);
      const ny = toMapY(npc.coords.z);
      sCtx.fillStyle = '#2ecc71';
      sCtx.beginPath();
      sCtx.arc(nx, ny, 3.8, 0, Math.PI * 2);
      sCtx.fill();
      sCtx.strokeStyle = '#fff';
      sCtx.lineWidth = 1;
      sCtx.stroke();
    }

    // 2. Cached Fog of War Layer (updated only when fogDirty is true)
    this.fogCanvas = document.createElement('canvas');
    this.fogCanvas.width = w;
    this.fogCanvas.height = h;
    this.fogCtx = this.fogCanvas.getContext('2d');
  }

  bindEvents() {
    if (this.btnLoreClose) {
      this.btnLoreClose.addEventListener('click', (e) => {
        e.stopPropagation();
        gameState.closeModal(ModalTypes.LORE);
      });
    }

    if (this.loreModal) {
      this.loreModal.addEventListener('click', (e) => {
        if (e.target === this.loreModal) {
          gameState.closeModal(ModalTypes.LORE);
        }
      });
      this.loreModal.addEventListener('wheel', (e) => e.stopPropagation());
      this.loreModal.addEventListener('mousedown', (e) => e.stopPropagation());
    }

    if (this.btnArtClose) {
      this.btnArtClose.addEventListener('click', (e) => {
        e.stopPropagation();
        gameState.closeModal(ModalTypes.ARTIFACT);
      });
    }

    if (this.btnDialogueClose) {
      this.btnDialogueClose.addEventListener('click', (e) => {
        e.stopPropagation();
        gameState.closeModal(ModalTypes.DIALOGUE);
      });
    }

    if (this.dialogueModal) {
      this.dialogueModal.addEventListener('click', (e) => {
        if (this.isTyping) {
          // Klik/ketuk saat teks sedang diketik langsung menyelesaikannya seketika
          this.finishTypewriter();
          return;
        }
        if (e.target === this.dialogueModal) {
          gameState.closeModal(ModalTypes.DIALOGUE);
        }
      });
      this.dialogueModal.addEventListener('wheel', (e) => e.stopPropagation());
      this.dialogueModal.addEventListener('mousedown', (e) => e.stopPropagation());
    }

    if (this.artifactModal) {
      this.artifactModal.addEventListener('click', (e) => {
        if (e.target === this.artifactModal) {
          gameState.closeModal(ModalTypes.ARTIFACT);
        }
      });
      this.artifactModal.addEventListener('mousedown', (e) => e.stopPropagation());
      this.artifactModal.addEventListener('wheel', (e) => e.stopPropagation());
    }

    if (this.interactPrompt) {
      this.interactPrompt.addEventListener('mousedown', (e) => e.stopPropagation());
      this.interactPrompt.addEventListener('touchstart', (e) => e.stopPropagation(), { passive: true });
      this.interactPrompt.addEventListener('click', (e) => {
        e.stopPropagation();
        window.dispatchEvent(new CustomEvent('majapahit:interact'));
      });
    }

    // Interaksi Zone Pill (Buka Penjelasan Sejarah saat Diklik)
    if (this.zonePill) {
      this.zonePill.addEventListener('click', (e) => {
        e.stopPropagation();
        const z = this.currentZoneObj || ZONES[0];
        this.showLoreModal(z.name, z.lore);
      });
    }

    // Interaksi Quest Pill (Buka Popover Rincian Misi saat Diklik)
    if (this.questPill && this.questDetailPopover) {
      this.questPill.addEventListener('click', (e) => {
        e.stopPropagation();
        gameState.toggleModal(ModalTypes.QUEST_POPOVER);
      });
    }

    if (this.btnQuestClose && this.questDetailPopover) {
      this.btnQuestClose.addEventListener('click', (e) => {
        e.stopPropagation();
        gameState.closeModal(ModalTypes.QUEST_POPOVER);
      });
    }

    // Interaksi Menu Utama & Slide-Down Header Drawer
    if (this.btnToggleMenu && this.unifiedHeaderMenu) {
      this.btnToggleMenu.addEventListener('click', (e) => {
        e.stopPropagation();
        gameState.toggleModal(ModalTypes.HEADER_MENU);
      });
    }

    if (this.btnCloseMenu && this.unifiedHeaderMenu) {
      this.btnCloseMenu.addEventListener('click', (e) => {
        e.stopPropagation();
        gameState.closeModal(ModalTypes.HEADER_MENU);
      });
    }

    // Menu Tindakan Cepat di dalam Header
    if (this.menuBtnMap) {
      this.menuBtnMap.addEventListener('click', () => {
        gameState.openModal(ModalTypes.ATLAS);
      });
    }

    if (this.menuBtnJournal) {
      this.menuBtnJournal.addEventListener('click', () => {
        gameState.openModal(ModalTypes.JOURNAL);
      });
    }

    if (this.menuBtnLantern) {
      this.menuBtnLantern.addEventListener('click', () => {
        window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyF' }));
      });
    }

    if (this.menuBtnQuiz) {
      this.menuBtnQuiz.addEventListener('click', () => {
        gameState.openModal(ModalTypes.QUIZ);
      });
    }

    if (this.menuBtnHelp) {
      this.menuBtnHelp.addEventListener('click', () => {
        gameState.openModal(ModalTypes.HELP);
      });
    }

    if (this.menuBtnFullscreen) {
      this.menuBtnFullscreen.addEventListener('click', () => {
        gameState.closeModal(ModalTypes.HEADER_MENU);
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        } else {
          document.exitFullscreen().catch(() => {});
        }
      });
    }

    if (this.btnQtoastClose && this.questCompleteToast) {
      this.btnQtoastClose.addEventListener('click', (e) => {
        e.stopPropagation();
        this.questCompleteToast.classList.add('hidden');
      });
    }

    // Klik di mana saja pada bingkai Minimap (kanvas, judul, maupun tombol) membuka Peta (Maks. 1/2 Layar)
    if (this.minimapFrame) {
      this.minimapFrame.addEventListener('click', (e) => {
        e.stopPropagation();
        gameState.toggleModal(ModalTypes.ATLAS);
      });
    } else if (this.minimapCanvas) {
      this.minimapCanvas.addEventListener('click', (e) => {
        e.stopPropagation();
        gameState.toggleModal(ModalTypes.ATLAS);
      });
    }

    // Klik di luar popover menutup popover
    window.addEventListener('click', (e) => {
      if (this.questDetailPopover && !this.questDetailPopover.classList.contains('hidden')) {
        if (!this.questDetailPopover.contains(e.target) && e.target !== this.questPill && !this.questPill.contains(e.target)) {
          gameState.closeModal(ModalTypes.QUEST_POPOVER);
        }
      }
      if (this.unifiedHeaderMenu && !this.unifiedHeaderMenu.classList.contains('hidden')) {
        if (!this.unifiedHeaderMenu.contains(e.target) && e.target !== this.btnToggleMenu && !this.btnToggleMenu.contains(e.target)) {
          gameState.closeModal(ModalTypes.HEADER_MENU);
        }
      }
    });

    // Atlas Modal Events
    if (this.btnAtlasClose) {
      this.btnAtlasClose.addEventListener('click', (e) => {
        e.stopPropagation();
        gameState.closeModal(ModalTypes.ATLAS);
      });
    }
    if (this.atlasModal) {
      this.atlasModal.addEventListener('click', (e) => {
        if (e.target === this.atlasModal) gameState.closeModal(ModalTypes.ATLAS);
      });
      this.atlasModal.addEventListener('wheel', (e) => e.stopPropagation());
      this.atlasModal.addEventListener('mousedown', (e) => e.stopPropagation());
    }

    // Interaktivitas Atlas Canvas (Hover & Klik POI)
    if (this.atlasCanvas) {
      this.atlasCanvas.addEventListener('mousemove', (e) => {
        const rect = this.atlasCanvas.getBoundingClientRect();
        const cx = ((e.clientX - rect.left) / rect.width) * this.atlasCanvas.width;
        const cy = ((e.clientY - rect.top) / rect.height) * this.atlasCanvas.height;
        this.handleAtlasHover(cx, cy);
      });

      this.atlasCanvas.addEventListener('click', (e) => {
        const rect = this.atlasCanvas.getBoundingClientRect();
        const cx = ((e.clientX - rect.left) / rect.width) * this.atlasCanvas.width;
        const cy = ((e.clientY - rect.top) / rect.height) * this.atlasCanvas.height;
        this.handleAtlasClick(cx, cy);
      });

      this.atlasCanvas.addEventListener('mousedown', (e) => e.stopPropagation());
      this.atlasCanvas.addEventListener('wheel', (e) => e.stopPropagation());
    }

    // Help Modal Events
    if (this.btnHelpClose) {
      this.btnHelpClose.addEventListener('click', () => gameState.closeModal(ModalTypes.HELP));
    }
    if (this.helpModal) {
      this.helpModal.addEventListener('click', (e) => {
        if (e.target === this.helpModal) gameState.closeModal(ModalTypes.HELP);
      });
      this.helpModal.addEventListener('wheel', (e) => e.stopPropagation());
      this.helpModal.addEventListener('mousedown', (e) => e.stopPropagation());
    }

    // Tangkap Custom Events
    window.addEventListener('majapahit:inspect-landmark', (e) => {
      const lm = e.detail.landmark;
      if (lm) {
        this.showLoreModal(lm.title, lm.text);
      }
    });

    window.addEventListener('majapahit:open-dialogue', (e) => {
      const npc = e.detail.npc;
      if (npc) {
        this.showDialogue(npc);
      }
    });

    window.addEventListener('majapahit:artifact-collected', (e) => {
      const art = e.detail.artifact;
      if (art) {
        this.showArtifactModal(art);
        this.updateRelicBadge();
        this.updateQuestTracker();
      }
    });

    window.addEventListener('majapahit:viewpoint-synced', (e) => {
      const vp = e.detail.viewpoint;
      if (vp) {
        this.showViewpointBanner(vp);
      }
    });

    window.addEventListener('majapahit:quest-completed', (e) => {
      const q = e.detail.quest;
      this.showQuestCompleteToast(q.title, q.loreReward);
      this.updateQuestTracker();
    });

    window.addEventListener('majapahit:lantern-toggle', (e) => {
      const active = e.detail.active;
      if (this.menuBtnLantern) {
        this.menuBtnLantern.classList.toggle('active', active);
      }
      document.body.classList.toggle('lantern-active', active);
    });

    window.addEventListener('majapahit:close-interaction-modals', () => {
      this.closeInteractionModals();
    });

    window.addEventListener('keydown', (e) => {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
      if (gameState.currentState === GameStates.INTRO) return;
      if (e._majapahitKeyEHandled) return;

      if (e.code === 'KeyM') {
        gameState.toggleModal(ModalTypes.ATLAS);
      } else if (e.code === 'KeyH') {
        gameState.toggleModal(ModalTypes.HELP);
      } else if (e.code === 'Escape' || e.code === 'KeyE') {
        if (gameState.isModalOpen()) {
          gameState.closeAllModals();
        }
      }
    });
  }

  handleAtlasHover(cx, cy) {
    if (!this.atlasCanvas) return;
    const w = this.atlasCanvas.width;
    const h = this.atlasCanvas.height;
    const scale = (w - 40) / 380;
    const wx = (cx - w * 0.5) / scale;
    const wz = (cy - h * 0.5) / scale;

    let found = false;

    // Check Landmarks
    for (const lm of LANDMARKS) {
      const dist = Math.hypot(wx - lm.position.x, wz - lm.position.z);
      if (dist < 18) {
        if (this.atlasCurrentZone) this.atlasCurrentZone.textContent = lm.title;
        if (this.atlasCurrentDesc) this.atlasCurrentDesc.textContent = lm.text;
        this.atlasCanvas.style.cursor = 'pointer';
        found = true;
        break;
      }
    }

    if (!found) {
      // Check NPCs
      for (const npc of NPC_DATA) {
        const dist = Math.hypot(wx - npc.coords.x, wz - npc.coords.z);
        if (dist < 18) {
          if (this.atlasCurrentZone) this.atlasCurrentZone.textContent = `${npc.icon} ${npc.name} (${npc.title})`;
          if (this.atlasCurrentDesc) this.atlasCurrentDesc.textContent = `Tokoh Sejarah di ${npc.zone}: "${npc.greeting}"`;
          this.atlasCanvas.style.cursor = 'pointer';
          found = true;
          break;
        }
      }
    }

    if (!found) {
      // Check Viewpoints
      for (const vp of VIEWPOINTS) {
        const dist = Math.hypot(wx - vp.coords.x, wz - vp.coords.z);
        if (dist < 18) {
          if (this.atlasCurrentZone) this.atlasCurrentZone.textContent = `🦅 ${vp.name}`;
          if (this.atlasCurrentDesc) this.atlasCurrentDesc.textContent = `Titik Sinkronisasi Menara Pandang (${vp.zoneTitle}).`;
          this.atlasCanvas.style.cursor = 'pointer';
          found = true;
          break;
        }
      }
    }

    if (!found) {
      this.atlasCanvas.style.cursor = 'crosshair';
    }
  }

  handleAtlasClick(cx, cy) {
    const w = this.atlasCanvas.width;
    const h = this.atlasCanvas.height;
    const scale = (w - 40) / 380;
    const wx = (cx - w * 0.5) / scale;
    const wz = (cy - h * 0.5) / scale;

    // Klik NPC membuka Dialog Sejarah
    for (const npc of NPC_DATA) {
      const dist = Math.hypot(wx - npc.coords.x, wz - npc.coords.z);
      if (dist < 18) {
        this.closeAtlas();
        this.showDialogue(npc);
        return;
      }
    }

    // Klik landmark membuka Kropak Lontar
    for (const lm of LANDMARKS) {
      const dist = Math.hypot(wx - lm.position.x, wz - lm.position.z);
      if (dist < 18) {
        this.showLoreModal(lm.title, lm.text);
        return;
      }
    }

    // Klik Viewpoint menampilkan info di sidebar Peta
    for (const vp of VIEWPOINTS) {
      const dist = Math.hypot(wx - vp.coords.x, wz - vp.coords.z);
      if (dist < 18) {
        if (this.atlasCurrentZone) this.atlasCurrentZone.textContent = `🦅 ${vp.name}`;
        if (this.atlasCurrentDesc) this.atlasCurrentDesc.textContent = `Menara Pandang di ${vp.zoneTitle}. Kunjungi puncak menara ini dan tekan E / Interaksi untuk membuka peta!`;
        return;
      }
    }
  }

  initGameStateListeners() {
    eventBus.on(GameEvents.MODAL_OPEN, ({ modalType, data }) => {
      this.closeAllDOMModals(modalType);

      switch (modalType) {
        case ModalTypes.LORE:
          if (data) {
            const title = data.landmark ? data.landmark.title : data.title;
            const text = data.landmark ? data.landmark.text : data.text;
            if (title && text) this.populateLoreContent(title, text);
          }
          if (this.loreModal) this.loreModal.classList.remove('hidden');
          break;
        case ModalTypes.DIALOGUE:
          if (data && data.npc) {
            this.populateDialogueContent(data.npc);
          }
          if (this.dialogueModal) this.dialogueModal.classList.remove('hidden');
          break;
        case ModalTypes.ARTIFACT:
          if (data && data.artifact) {
            this.populateArtifactContent(data.artifact);
            this.updateRelicBadge();
            this.updateQuestTracker();
          }
          if (this.artifactModal) this.artifactModal.classList.remove('hidden');
          break;
        case ModalTypes.ATLAS:
          if (this.atlasModal) {
            this.atlasModal.classList.remove('hidden');
            if (this.audio) this.audio.playDialoguePop();
            this.drawAtlasMap(this.savedPlayerPos, this.savedPlayerYaw);
          }
          break;
        case ModalTypes.HELP:
          if (this.helpModal) {
            this.helpModal.classList.remove('hidden');
            if (this.audio) this.audio.playDialoguePop();
          }
          break;
        case ModalTypes.QUEST_POPOVER:
          if (this.questDetailPopover) this.questDetailPopover.classList.remove('hidden');
          break;
        case ModalTypes.HEADER_MENU:
          if (this.unifiedHeaderMenu) this.unifiedHeaderMenu.classList.remove('hidden');
          if (this.btnToggleMenu) this.btnToggleMenu.classList.add('active');
          break;
      }
    });

    eventBus.on(GameEvents.MODAL_CLOSE, ({ modalType }) => {
      if (!modalType) {
        this.closeAllDOMModals();
        return;
      }
      switch (modalType) {
        case ModalTypes.LORE:
          if (this.loreModal) this.loreModal.classList.add('hidden');
          break;
        case ModalTypes.DIALOGUE:
          this.finishTypewriter();
          if (this.dialogueModal) this.dialogueModal.classList.add('hidden');
          break;
        case ModalTypes.ARTIFACT:
          if (this.artifactModal) {
            this.artifactModal.classList.add('hidden');
            this.updateQuestTracker();
          }
          break;
        case ModalTypes.ATLAS:
          if (this.atlasModal) this.atlasModal.classList.add('hidden');
          break;
        case ModalTypes.HELP:
          if (this.helpModal) this.helpModal.classList.add('hidden');
          break;
        case ModalTypes.QUEST_POPOVER:
          if (this.questDetailPopover) this.questDetailPopover.classList.add('hidden');
          break;
        case ModalTypes.HEADER_MENU:
          if (this.unifiedHeaderMenu) this.unifiedHeaderMenu.classList.add('hidden');
          if (this.btnToggleMenu) this.btnToggleMenu.classList.remove('active');
          break;
      }
    });
  }

  closeAllDOMModals(exceptType = null) {
    if (exceptType !== ModalTypes.LORE && this.loreModal) this.loreModal.classList.add('hidden');
    if (exceptType !== ModalTypes.DIALOGUE && this.dialogueModal) {
      this.finishTypewriter();
      this.dialogueModal.classList.add('hidden');
    }
    if (exceptType !== ModalTypes.ARTIFACT && this.artifactModal) this.artifactModal.classList.add('hidden');
    if (exceptType !== ModalTypes.ATLAS && this.atlasModal) this.atlasModal.classList.add('hidden');
    if (exceptType !== ModalTypes.HELP && this.helpModal) this.helpModal.classList.add('hidden');
    if (exceptType !== ModalTypes.QUEST_POPOVER && this.questDetailPopover) this.questDetailPopover.classList.add('hidden');
    if (exceptType !== ModalTypes.HEADER_MENU && this.unifiedHeaderMenu) {
      this.unifiedHeaderMenu.classList.add('hidden');
      if (this.btnToggleMenu) this.btnToggleMenu.classList.remove('active');
    }
  }

  toggleAtlas() {
    gameState.toggleModal(ModalTypes.ATLAS);
  }

  closeAllHUDModals() {
    gameState.closeAllModals();
  }

  closeInteractionModals() {
    if (gameState.isModalOpen()) {
      gameState.closeAllModals();
      return true;
    }
    return false;
  }

  openAtlas() {
    gameState.openModal(ModalTypes.ATLAS);
  }

  closeAtlas() {
    gameState.closeModal(ModalTypes.ATLAS);
  }

  toggleHelp() {
    gameState.toggleModal(ModalTypes.HELP);
  }

  openHelp() {
    gameState.openModal(ModalTypes.HELP);
  }

  closeHelp() {
    gameState.closeModal(ModalTypes.HELP);
  }

  closeDialogue() {
    gameState.closeModal(ModalTypes.DIALOGUE);
  }

  startTypewriter(text) {
    if (this.typewriterTimer) {
      clearInterval(this.typewriterTimer);
      this.typewriterTimer = null;
    }

    this.fullDialogueText = text;
    this.isTyping = true;
    this.dialogueTextEl.textContent = '';

    const cursor = document.createElement('span');
    cursor.className = 'typing-cursor';
    this.dialogueTextEl.appendChild(cursor);

    let idx = 0;
    const len = text.length;

    this.typewriterTimer = setInterval(() => {
      if (idx < len) {
        this.dialogueTextEl.textContent = text.slice(0, idx + 1);
        this.dialogueTextEl.appendChild(cursor);
        idx++;
      } else {
        this.finishTypewriter();
      }
    }, 15);
  }

  finishTypewriter() {
    if (this.typewriterTimer) {
      clearInterval(this.typewriterTimer);
      this.typewriterTimer = null;
    }
    this.isTyping = false;
    if (this.dialogueTextEl) {
      this.dialogueTextEl.textContent = this.fullDialogueText;
    }
  }

  updateRelicBadge() {
    if (!this.exploration) return;
    const total = HISTORICAL_ARTIFACTS.length;
    const count = this.exploration.collectedArtifacts.length;

    if (this.relicCounterEl) {
      this.relicCounterEl.textContent = `🏺 ${count}/${total} Artefak`;
    }
    if (this.profileRelicCount) {
      this.profileRelicCount.textContent = `🏺 ${count}/${total} Artefak`;
    }

    if (this.playerRankTitle) {
      let rank = 'Pengelana Hutan Tarik';
      if (count >= 9) {
        rank = 'Mahapatih Sejarah Nusantara ☀️';
      } else if (count >= 6) {
        rank = 'Ksatria Luhur Bhayangkara ⚔️';
      } else if (count >= 3) {
        rank = 'Pencari Jejak Majapahit 📜';
      }
      this.playerRankTitle.textContent = rank;
    }
  }

  updateQuestTracker() {
    if (!this.quests) return;
    const activeQ = this.quests.getActiveQuest();

    if (!activeQ) {
      if (this.questTitleEl) this.questTitleEl.textContent = `Seluruh Misi Selesai 🏆`;
      if (this.questPillBadge) this.questPillBadge.textContent = `🏆 Tuntas`;
      if (this.questPill) this.questPill.classList.add('quest-ready');
      if (this.questTaskEl) this.questTaskEl.textContent = `Semua titah sejarah telah tuntas! Bersiaplah menuju Gerbang Evaluasi Kedaton.`;
      if (this.questProgressEl) this.questProgressEl.innerHTML = `<span class="ready-badge">🏆 Kejayaan Nusantara Terpelihara</span>`;
      return;
    }

    const progress = this.quests.getQuestRelicProgress(activeQ.id);
    const canTurnIn = this.quests.canCompleteQuest(activeQ.id);

    if (this.questTitleEl) {
      this.questTitleEl.textContent = `${activeQ.icon} ${activeQ.title}`;
    }
    if (this.questTaskEl) {
      this.questTaskEl.textContent = activeQ.summary;
    }

    if (this.questPill) {
      this.questPill.classList.toggle('quest-ready', canTurnIn);
    }

    if (canTurnIn) {
      if (this.questPillBadge) {
        this.questPillBadge.textContent = `✨ Siap Lapor!`;
      }
      if (this.questProgressEl) {
        this.questProgressEl.innerHTML = `<span class="ready-badge">✨ Lengkap! Bicara dengan ${activeQ.giverName} di ${activeQ.zone}</span>`;
      }
    } else {
      if (this.questPillBadge) {
        this.questPillBadge.textContent = `${progress.current}/${progress.total}`;
      }
      if (this.questProgressEl) {
        this.questProgressEl.textContent = `Progres Artefak: ${progress.current}/${progress.total} ditemukan`;
      }
    }
  }

  // RPG Dialogue System (Genshin Impact Style)
  populateDialogueContent(npc) {
    if (!npc) return;
    this.currentDialogueNPC = npc;
    this.speakerIconEl.textContent = npc.icon;
    this.speakerNameEl.textContent = npc.name;
    this.speakerTitleEl.textContent = `${npc.title} • ${npc.zone}`;
    if (this.speakerFactionEl) {
      this.speakerFactionEl.textContent = NPC_FACTIONS[npc.id] || 'Tokoh Kerajaan Majapahit';
    }

    if (this.audio) {
      this.audio.playNPCGreeting(npc.id);
    }

    this.renderDialogueNode('root');
  }

  showDialogue(npc) {
    gameState.openModal(ModalTypes.DIALOGUE, { npc });
  }

  renderDialogueNode(nodeKey) {
    const npc = this.currentDialogueNPC;
    if (!npc) return;

    if (this.audio) this.audio.playDialoguePop();

    // Cek jika node adalah quest check
    if (nodeKey === 'quest_check') {
      const qState = this.quests ? this.quests.getNPCDialogueState(npc.id) : null;
      if (qState && qState.questPrompt) {
        this.startTypewriter(qState.questPrompt.text);
        this.dialogueChoicesEl.innerHTML = '';

        if (qState.questCanTurnIn) {
          const btnTurnIn = document.createElement('button');
          btnTurnIn.className = 'btn-choice btn-choice-quest';
          btnTurnIn.innerHTML = `<span class="choice-ico">🏆</span><span class="choice-txt">Serahkan Bukti Sejarah & Selesaikan Misi!</span>`;
          btnTurnIn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.quests.completeQuest(qState.questPrompt.questId);
            this.renderDialogueNode('root');
          });
          this.dialogueChoicesEl.appendChild(btnTurnIn);
        }

        const btnBack = document.createElement('button');
        btnBack.className = 'btn-choice btn-choice-farewell';
        btnBack.innerHTML = `<span class="choice-ico">↩️</span><span class="choice-txt">Kembali ke pokok pembicaraan.</span>`;
        btnBack.addEventListener('click', (e) => {
          e.stopPropagation();
          this.renderDialogueNode('root');
        });
        this.dialogueChoicesEl.appendChild(btnBack);
        return;
      }
    }

    const node = npc.dialogues[nodeKey] || npc.dialogues['root'];
    this.startTypewriter(node.text);
    this.dialogueChoicesEl.innerHTML = '';

    if (node.options && node.options.length > 0) {
      node.options.forEach((opt, optIdx) => {
        const btn = document.createElement('button');
        const isQuestAction = opt.next === 'quest_check' || opt.text.toLowerCase().includes('tugas') || opt.text.toLowerCase().includes('misi');
        const isFarewell = opt.next === 'root_close' || opt.text.toLowerCase().includes('pamit') || opt.text.toLowerCase().includes('terima kasih');

        const iconSpan = document.createElement('span');
        iconSpan.className = 'choice-ico';
        if (isQuestAction) {
          btn.className = 'btn-choice btn-choice-quest';
          iconSpan.textContent = '❗';
        } else if (isFarewell) {
          btn.className = 'btn-choice btn-choice-farewell';
          iconSpan.textContent = '👋';
        } else {
          btn.className = 'btn-choice';
          iconSpan.textContent = '💬';
        }

        btn.style.animationDelay = `${optIdx * 48}ms`;

        const textSpan = document.createElement('span');
        textSpan.className = 'choice-txt';
        textSpan.textContent = opt.text;

        btn.appendChild(iconSpan);
        btn.appendChild(textSpan);

        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.renderDialogueNode(opt.next);
        });
        this.dialogueChoicesEl.appendChild(btn);
      });
    } else {
      const btnClose = document.createElement('button');
      btnClose.className = 'btn-choice btn-choice-farewell';
      btnClose.innerHTML = `<span class="choice-ico">🚪</span><span class="choice-txt">Pamit & Lanjutkan Penjelajahan</span>`;
      btnClose.addEventListener('click', (e) => {
        e.stopPropagation();
        this.closeDialogue();
      });
      this.dialogueChoicesEl.appendChild(btnClose);
    }
  }

  populateLoreContent(title, text) {
    this.loreModalTitle.textContent = title;
    this.loreModalBody.textContent = text;

    if (this.loreSourceBox) {
      const lower = `${title} ${text}`.toLowerCase();
      const matched = LORE_SOURCES_MAP.find((entry) =>
        entry.match.some((kw) => lower.includes(kw))
      );

      if (matched) {
        this.loreSourceBox.innerHTML = `
          <div class="lontar-source-title">📜 Sumber Naskah Primer: ${matched.source}</div>
          <div class="lontar-source-quote">${matched.quote}</div>
        `;
      } else {
        this.loreSourceBox.innerHTML = `
          <div class="lontar-source-title">📜 Sumber Naskah Primer: Tradisi Lisan & Babad Trowulan</div>
          <div class="lontar-source-quote">"Mitreka Satata • Bhinneka Tunggal Ika Tan Hana Dharma Mangrwa • Satya Aprabhu"</div>
        `;
      }
    }

    if (this.audio) this.audio.playDialoguePop();
  }

  showLoreModal(title, text) {
    gameState.openModal(ModalTypes.LORE, { title, text });
  }

  populateArtifactContent(art) {
    if (!art) return;
    this.artTitleEl.textContent = art.title;
    this.artEraEl.textContent = art.era;
    this.artZoneEl.textContent = `📍 Lokasi: ${art.zone}`;
    this.artLoreEl.textContent = art.lore;
  }

  showArtifactModal(art) {
    gameState.openModal(ModalTypes.ARTIFACT, { artifact: art });
  }

  showViewpointBanner(vp) {
    this.vpTitleEl.textContent = `SINKRONISASI MENARA PANDANG`;
    this.vpZoneEl.textContent = `${vp.name.toUpperCase()} • ${vp.zoneTitle}`;
    this.viewpointBanner.classList.remove('hidden');

    if (this._viewpointBannerTimer) clearTimeout(this._viewpointBannerTimer);
    this._viewpointBannerTimer = setTimeout(() => {
      this._viewpointBannerTimer = null;
      this.viewpointBanner.classList.add('hidden');
    }, 4200);
  }

  update(playerPos, playerYaw, nearLandmark, nearInteractive) {
    // 0. Simpan posisi & orientasi pemain untuk Atlas
    this.savedPlayerPos.x = playerPos.x;
    this.savedPlayerPos.y = playerPos.y;
    this.savedPlayerPos.z = playerPos.z;
    this.savedPlayerYaw = playerYaw;

    // 1. Update Koordinat & Elevasi (hanya sentuh DOM jika berubah)
    const coordsText = `X: ${Math.round(playerPos.x)} | Z: ${Math.round(playerPos.z)} | Elevasi: ${playerPos.y.toFixed(1)}m`;
    if (coordsText !== this._lastCoordsText) {
      this._lastCoordsText = coordsText;
      if (this.coordsEl) this.coordsEl.textContent = coordsText;
    }

    // 2. Deteksi Wilayah Saat Ini (Simpel, Tanpa Banner & Sound Mengganggu)
    let matchedZone = ZONES[0];
    let bestDist = Infinity;
    for (const z of ZONES) {
      const d = Math.hypot(playerPos.x - z.center.x, playerPos.z - z.center.z);
      if (d < bestDist) {
        bestDist = d;
        matchedZone = z;
      }
    }

    if (matchedZone && matchedZone.id !== this.currentZoneId) {
      this.currentZoneId = matchedZone.id;
      this.currentZoneObj = matchedZone;

      // Hanya tampilkan nama simpel (misal: "Barak Bhayangkara" atau "Kedaton Agung")
      const cleanName = matchedZone.name.replace(/^\d+\.\s*/, '');
      if (this.zoneNameEl) {
        this.zoneNameEl.textContent = cleanName;
      }
      if (this.atlasCurrentZone) {
        this.atlasCurrentZone.textContent = matchedZone.name;
      }
      if (this.atlasCurrentDesc) {
        this.atlasCurrentDesc.textContent = matchedZone.lore;
      }
      // CATATAN: TIDAK ADA LAGI pop-up toast atau suara chime otomatis yang mengganggu setiap masuk tempat baru!
      // Pemain cukup mengeklik pill nama tempat jika ingin membaca penjelasannya.
    }

    // 3. Update Tampilan Prompt Interaksi [Tekan E]
    const isAnyModalOpen = gameState.isModalOpen();

    if (isAnyModalOpen) {
      this.interactPrompt.classList.add('hidden');
    } else if (nearInteractive) {
      if (nearInteractive.type === 'npc') {
        if (this.interactActionEl) this.interactActionEl.textContent = 'Bicara dengan Tokoh';
        this.interactTargetName.textContent = `${nearInteractive.target.icon} ${nearInteractive.target.name}`;
      } else if (nearInteractive.type === 'viewpoint') {
        if (this.interactActionEl) this.interactActionEl.textContent = 'Sinkronisasi Menara Pandang';
        this.interactTargetName.textContent = nearInteractive.target.data.name;
      } else if (nearInteractive.type === 'artifact') {
        if (this.interactActionEl) this.interactActionEl.textContent = 'Buka Peti Artefak';
        this.interactTargetName.textContent = nearInteractive.target.data.title;
      }
      this.interactPrompt.classList.remove('hidden');
    } else if (nearLandmark) {
      if (this.interactActionEl) this.interactActionEl.textContent = 'Periksa & Pelajari';
      this.interactTargetName.textContent = nearLandmark.title;
      this.interactPrompt.classList.remove('hidden');
    } else {
      this.interactPrompt.classList.add('hidden');
    }

    const now = performance.now();

    // 4. Throttle Minimap Redraw ke ~15 FPS (setiap 65ms) agar CPU bebas hambatan
    if (now - this._lastMinimapDrawTime >= 65) {
      this._lastMinimapDrawTime = now;
      this.drawMinimap(playerPos, playerYaw);
    }

    // 5. Throttle Atlas Resolusi Tinggi ke ~15 FPS jika sedang terbuka
    if (this.atlasModal && !this.atlasModal.classList.contains('hidden')) {
      if (now - this._lastAtlasDrawTime >= 65) {
        this._lastAtlasDrawTime = now;
        this.drawAtlasMap(playerPos, playerYaw);
      }
    }
  }

  showQuestCompleteToast(title, lore) {
    if (!this.questCompleteToast || !this.qtoastTitle) return;
    this.qtoastTitle.textContent = title;
    if (this.qtoastLore) this.qtoastLore.textContent = lore;
    this.questCompleteToast.classList.remove('hidden');

    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      if (this.questCompleteToast) this.questCompleteToast.classList.add('hidden');
    }, 6500);
  }

  drawMinimap(playerPos, playerYaw) {
    const ctx = this.ctx;
    const w = this.minimapCanvas.width;
    const h = this.minimapCanvas.height;
    const scale = w / 380;
    const toMapX = (wx) => w * 0.5 + wx * scale;
    const toMapY = (wz) => h * 0.5 + wz * scale;

    // 1. Salin Peta Dasar Statis (Zona, Sungai, Kolam Segaran, Jalan, Jembatan, Prasasti, NPC)
    ctx.drawImage(this.staticMapCanvas, 0, 0);

    // 2. Viewpoint Icons (Menara Pandang 🦅)
    for (const vp of VIEWPOINTS) {
      const vx = toMapX(vp.coords.x);
      const vy = toMapY(vp.coords.z);
      const isSynced = this.exploration ? this.exploration.syncedViewpoints.includes(vp.id) : false;

      ctx.fillStyle = isSynced ? '#ffd700' : '#4fa3e3';
      ctx.beginPath();
      ctx.arc(vx, vy, 4.0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // 3. Peti Artefak (jika Lentera Waktu aktif)
    if (this.exploration && this.exploration.isLanternActive) {
      for (const art of HISTORICAL_ARTIFACTS) {
        if (this.exploration.collectedArtifacts.includes(art.id)) continue;
        const ax = toMapX(art.coords.x);
        const ay = toMapY(art.coords.z);
        ctx.fillStyle = '#ffb300';
        ctx.beginPath();
        ctx.arc(ax, ay, 2.8, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 3.5. Beacon Sasaran Misi Aktif di Minimap (Pulsing Target Ring)
    if (this.quests) {
      const activeQ = this.quests.getActiveQuest();
      if (activeQ) {
        const canTurnIn = this.quests.canCompleteQuest(activeQ.id);
        let qx = 0;
        let qy = 0;
        let hasBeacon = false;
        let beaconColor = '#ffea60';

        if (canTurnIn) {
          const npc = NPC_DATA.find((n) => n.id === activeQ.npcId);
          if (npc) {
            qx = toMapX(npc.coords.x);
            qy = toMapY(npc.coords.z);
            hasBeacon = true;
            beaconColor = '#5df2bd';
          }
        } else {
          const reqRelics = activeQ.requiredRelics.filter(
            (rId) => !this.exploration.collectedArtifacts.includes(rId)
          );
          if (reqRelics.length > 0) {
            const art = HISTORICAL_ARTIFACTS.find((a) => a.id === reqRelics[0]);
            if (art) {
              qx = toMapX(art.coords.x);
              qy = toMapY(art.coords.z);
              hasBeacon = true;
              beaconColor = '#ffc83b';
            }
          }
        }

        if (hasBeacon) {
          const pulse = (Date.now() * 0.003) % 1.0;
          ctx.strokeStyle = beaconColor;
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.arc(qx, qy, 4 + pulse * 8, 0, Math.PI * 2);
          ctx.stroke();

          ctx.fillStyle = beaconColor;
          ctx.beginPath();
          ctx.arc(qx, qy, 3.6, 0, Math.PI * 2);
          ctx.fill();

          // Penunjuk arah kompas misi pada tepi cincin radar bila jaraknya jauh dari pemain
          const pxRaw = toMapX(playerPos.x);
          const pyRaw = toMapY(playerPos.z);
          const dxQ = qx - pxRaw;
          const dyQ = qy - pyRaw;
          const distQ = Math.hypot(dxQ, dyQ);
          if (distQ > 12) {
            const angQ = Math.atan2(dyQ, dxQ);
            const ringR = w * 0.43;
            const cxRim = w * 0.5 + Math.cos(angQ) * ringR;
            const cyRim = h * 0.5 + Math.sin(angQ) * ringR;
            ctx.save();
            ctx.translate(cxRim, cyRim);
            ctx.rotate(angQ);
            ctx.fillStyle = beaconColor;
            ctx.strokeStyle = '#1c1008';
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(6, 0);
            ctx.lineTo(-4, -4);
            ctx.lineTo(-2, 0);
            ctx.lineTo(-4, 4);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.restore();
          }
        }
      }
    }

    // 4. FOG OF WAR OVERLAY (Hanya render ulang kanvas kabut ketika ada sel baru yang terbuka)
    if (this.exploration && this.exploration.fogGrid) {
      if (this.exploration.fogDirty) {
        const gSize = this.exploration.gridSize;
        const cellW = w / gSize;
        const cellH = h / gSize;
        const fCtx = this.fogCtx;

        fCtx.clearRect(0, 0, w, h);
        fCtx.fillStyle = 'rgba(20, 13, 8, 0.88)';
        for (let gx = 0; gx < gSize; gx++) {
          for (let gz = 0; gz < gSize; gz++) {
            if (!this.exploration.fogGrid[gx][gz]) {
              fCtx.fillRect(gx * cellW, gz * cellH, cellW + 0.6, cellH + 0.6);
            }
          }
        }
        this.exploration.fogDirty = false;
      }
      ctx.drawImage(this.fogCanvas, 0, 0);
    }

    // 5. Posisi Pemain & Segitiga Arah Pandang
    const px = toMapX(playerPos.x);
    const py = toMapY(playerPos.z);

    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(-playerYaw);

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-7, -14);
    ctx.lineTo(7, -14);
    ctx.closePath();
    ctx.fillStyle = 'rgba(249, 217, 118, 0.45)';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(0, 0, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = '#fff5d6';
    ctx.fill();
    ctx.strokeStyle = '#b84a39';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.restore();

    // 6. Sapuan radar berputar halus, tanda mata angin T/S/B & cincin vignette melingkar
    const sweepAng = (Date.now() * 0.0014) % (Math.PI * 2);
    ctx.save();
    ctx.translate(w * 0.5, h * 0.5);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, w * 0.48, sweepAng, sweepAng + 0.52);
    ctx.closePath();
    const sweepGrad = ctx.createRadialGradient(0, 0, 4, 0, 0, w * 0.48);
    sweepGrad.addColorStop(0, 'rgba(251, 226, 136, 0.02)');
    sweepGrad.addColorStop(1, 'rgba(251, 226, 136, 0.14)');
    ctx.fillStyle = sweepGrad;
    ctx.fill();
    ctx.restore();

    const rimGrad = ctx.createRadialGradient(w * 0.5, h * 0.5, w * 0.36, w * 0.5, h * 0.5, w * 0.51);
    rimGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    rimGrad.addColorStop(0.75, 'rgba(10, 6, 4, 0.2)');
    rimGrad.addColorStop(1, 'rgba(10, 6, 4, 0.66)');
    ctx.fillStyle = rimGrad;
    ctx.fillRect(0, 0, w, h);

    ctx.font = 'bold 8.5px "Cinzel", serif';
    ctx.fillStyle = 'rgba(251, 226, 136, 0.72)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('S', w * 0.5, h - 10);
    ctx.fillText('T', w - 10, h * 0.5);
    ctx.fillText('B', 10, h * 0.5);
  }

  // Render Fullscreen Interactive Atlas (Resolusi 620x620)
  drawAtlasMap(playerPos, playerYaw) {
    if (!this.atlasCanvas || !this.atlasCtx) return;
    const ctx = this.atlasCtx;
    const w = this.atlasCanvas.width;
    const h = this.atlasCanvas.height;
    const scale = (w - 48) / 380;
    const toMapX = (wx) => w * 0.5 + wx * scale;
    const toMapY = (wz) => h * 0.5 + wz * scale;

    ctx.clearRect(0, 0, w, h);

    // 1. Latar Belakang Kartografi Kuno (Perkamen Bata Gelap)
    ctx.fillStyle = '#18100b';
    ctx.fillRect(0, 0, w, h);

    // Garis Grid Kartografis
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 32; x < w - 32; x += 36) {
      ctx.beginPath();
      ctx.moveTo(x, 24);
      ctx.lineTo(x, h - 24);
      ctx.stroke();
    }
    for (let y = 32; y < h - 32; y += 36) {
      ctx.beginPath();
      ctx.moveTo(24, y);
      ctx.lineTo(w - 24, y);
      ctx.stroke();
    }

    // Bingkai Ganda Kerajaan Majapahit
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.35)';
    ctx.lineWidth = 2;
    ctx.strokeRect(12, 12, w - 24, h - 24);
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.85)';
    ctx.lineWidth = 1;
    ctx.strokeRect(16, 16, w - 32, h - 32);

    // Ornamen Sudut Keemasan
    const corners = [
      [16, 16],
      [w - 16, 16],
      [16, h - 16],
      [w - 16, h - 16]
    ];
    ctx.fillStyle = '#e5b842';
    for (const [cx, cy] of corners) {
      ctx.beginPath();
      ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // 2. Zona-Zona Sejarah (Lingkaran Transparan & Label Plakat)
    for (const z of ZONES) {
      const zx = toMapX(z.center.x);
      const zy = toMapY(z.center.z);
      const zr = z.radius * scale;

      ctx.beginPath();
      ctx.arc(zx, zy, zr, 0, Math.PI * 2);
      ctx.fillStyle = z.color + '24';
      ctx.fill();
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = z.color + '77';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.setLineDash([]);

      // Plakat Nama Wilayah
      const label = z.name.replace(/^\d+\.\s*/, '').toUpperCase();
      ctx.font = 'bold 9.5px "Cinzel", serif';
      const tw = ctx.measureText(label).width;
      ctx.fillStyle = 'rgba(16, 9, 6, 0.85)';
      ctx.fillRect(zx - tw * 0.5 - 6, zy - zr + 4, tw + 12, 16);
      ctx.strokeStyle = z.color;
      ctx.lineWidth = 1;
      ctx.strokeRect(zx - tw * 0.5 - 6, zy - zr + 4, tw + 12, 16);
      ctx.fillStyle = '#fce8b2';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, zx, zy - zr + 12);
    }

    // 3. Sungai Brantas & Kanal Canggu
    ctx.beginPath();
    for (let wx = -190; wx <= 190; wx += 4) {
      const rz = getRiverCenterZ(wx);
      const mx = toMapX(wx);
      const my = toMapY(rz);
      if (wx === -190) ctx.moveTo(mx, my);
      else ctx.lineTo(mx, my);
    }
    ctx.strokeStyle = '#257d8f';
    ctx.lineWidth = 15;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    ctx.strokeStyle = '#4cb3c4';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.font = 'italic 10px serif';
    ctx.fillStyle = '#afe6f0';
    ctx.fillText('~ Sungai Brantas & Aliran Air Kotaraja ~', toMapX(-45), toMapY(getRiverCenterZ(-45)) - 12);

    // 4. Waduk Kolam Segaran Kuno (6,5 Hektar)
    const kx = toMapX(-68);
    const ky = toMapY(-20);
    const kw = 32 * scale;
    const kh = 50 * scale;

    ctx.fillStyle = '#1b6473';
    ctx.fillRect(kx, ky, kw, kh);
    ctx.strokeStyle = '#b84a39';
    ctx.lineWidth = 3.5;
    ctx.strokeRect(kx, ky, kw, kh);
    ctx.strokeStyle = '#e5b842';
    ctx.lineWidth = 1;
    ctx.strokeRect(kx + 2, ky + 2, kw - 4, kh - 4);

    ctx.font = 'bold 9px "Cinzel", serif';
    ctx.fillStyle = '#fce8b2';
    ctx.fillText('KOLAM SEGARAN', kx + kw * 0.5, ky + kh * 0.5);

    // 5. Jaringan Jalan Kerajaan
    ctx.strokeStyle = '#b86843';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(toMapX(0), toMapY(160));
    ctx.lineTo(toMapX(0), toMapY(-130));
    ctx.moveTo(toMapX(-140), toMapY(12));
    ctx.lineTo(toMapX(135), toMapY(12));
    ctx.lineTo(toMapX(125), toMapY(-20));
    ctx.moveTo(toMapX(0), toMapY(8));
    ctx.lineTo(toMapX(-36), toMapY(8));
    ctx.stroke();

    ctx.strokeStyle = '#dfa57e';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 6]);
    ctx.stroke();
    ctx.setLineDash([]);

    // 6. Parit Pertahanan & Benteng Kedaton Agung
    const kedX = toMapX(-46);
    const kedY = toMapY(-146);
    const kedW = 92 * scale;
    const kedH = 62 * scale;
    ctx.strokeStyle = '#257d8f';
    ctx.lineWidth = 4;
    ctx.strokeRect(kedX, kedY, kedW, kedH);
    ctx.strokeStyle = '#a33a26';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(kedX + 4, kedY + 4, kedW - 8, kedH - 8);

    // 7. Jembatan Emas / Kayu Kerajaan
    ctx.fillStyle = '#d4af37';
    for (const b of BRIDGES) {
      const bx = toMapX(b.xMin);
      const by = toMapY(b.zMin);
      const bw = Math.max(5, (b.xMax - b.xMin) * scale);
      const bh = Math.max(5, (b.zMax - b.zMin) * scale);
      ctx.fillRect(bx, by, bw, bh);
      ctx.strokeStyle = '#5a3014';
      ctx.lineWidth = 1;
      ctx.strokeRect(bx, by, bw, bh);
    }

    // 8. Titik Prasasti Sejarah (Landmarks)
    for (const lm of LANDMARKS) {
      const lx = toMapX(lm.position.x);
      const ly = toMapY(lm.position.z);

      ctx.save();
      ctx.translate(lx, ly);
      ctx.rotate(Math.PI / 4);
      ctx.fillStyle = '#f9d976';
      ctx.fillRect(-4, -4, 8, 8);
      ctx.strokeStyle = '#5a3014';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(-4, -4, 8, 8);
      ctx.restore();

      ctx.font = '8.5px sans-serif';
      ctx.fillStyle = '#ffecb3';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(lm.title.split(' ')[0], lx, ly + 6);
    }

    // 9. Tokoh Sejarah NPC
    for (const npc of NPC_DATA) {
      const nx = toMapX(npc.coords.x);
      const ny = toMapY(npc.coords.z);

      ctx.beginPath();
      ctx.arc(nx, ny, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#2ecc71';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.font = 'bold 10px sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(npc.icon, nx, ny - 6);
    }

    // 10. Menara Pandang (Viewpoints 🦅)
    for (const vp of VIEWPOINTS) {
      const vx = toMapX(vp.coords.x);
      const vy = toMapY(vp.coords.z);
      const isSynced = this.exploration ? this.exploration.syncedViewpoints.includes(vp.id) : false;

      ctx.beginPath();
      ctx.arc(vx, vy, 6, 0, Math.PI * 2);
      ctx.fillStyle = isSynced ? '#ffd700' : '#4fa3e3';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.font = '10px sans-serif';
      ctx.fillStyle = isSynced ? '#ffd700' : '#88d1f7';
      ctx.fillText('🦅', vx, vy - 7);
    }

    // 11. Peti Artefak (Jika Lentera Waktu Menyala)
    if (this.exploration && this.exploration.isLanternActive) {
      for (const art of HISTORICAL_ARTIFACTS) {
        if (this.exploration.collectedArtifacts.includes(art.id)) continue;
        const ax = toMapX(art.coords.x);
        const ay = toMapY(art.coords.z);

        ctx.beginPath();
        ctx.arc(ax, ay, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffb300';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }
    }

    // 12. Posisi Pemain Aktif, Lingkaran Sinyal & Sudut Pandang
    const px = toMapX(playerPos.x);
    const py = toMapY(playerPos.z);

    // Cincin radar berkedip hidup di Atlas
    const atlasPulse = (Date.now() * 0.0022) % 1.0;
    ctx.beginPath();
    ctx.arc(px, py, 10 + atlasPulse * 14, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255, 230, 100, ${(1 - atlasPulse) * 0.68})`;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Tanda Sasaran Misi Aktif pada Atlas Besar
    if (this.quests) {
      const aq = this.quests.getActiveQuest();
      if (aq) {
        const turnIn = this.quests.canCompleteQuest(aq.id);
        let tx = null;
        let tz = null;
        if (turnIn) {
          const npc = NPC_DATA.find((n) => n.id === aq.npcId);
          if (npc) { tx = npc.coords.x; tz = npc.coords.z; }
        } else {
          const rem = aq.requiredRelics.filter((rId) => !this.exploration.collectedArtifacts.includes(rId));
          if (rem.length > 0) {
            const art = HISTORICAL_ARTIFACTS.find((a) => a.id === rem[0]);
            if (art) { tx = art.coords.x; tz = art.coords.z; }
          }
        }
        if (tx !== null && tz !== null) {
          const axQ = toMapX(tx);
          const ayQ = toMapY(tz);
          ctx.beginPath();
          ctx.arc(axQ, ayQ, 9 + atlasPulse * 8, 0, Math.PI * 2);
          ctx.strokeStyle = turnIn ? 'rgba(93, 242, 189, 0.8)' : 'rgba(255, 210, 72, 0.85)';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }
    }

    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(-playerYaw);

    // Sudut pandang kerucut
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-12, -26);
    ctx.lineTo(12, -26);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255, 215, 0, 0.38)';
    ctx.fill();

    // Titik pusat pemain
    ctx.beginPath();
    ctx.arc(0, 0, 6.5, 0, Math.PI * 2);
    ctx.fillStyle = '#fff5d6';
    ctx.fill();
    ctx.strokeStyle = '#c0392b';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.restore();

    ctx.font = 'bold 9.5px sans-serif';
    ctx.fillStyle = '#fff2d1';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('📍 Anda di Sini', px, py + 16);

    // 13. Surya Majapahit Kompas Penunjuk Arah Mata Angin
    const rx = w - 46;
    const ry = 46;
    ctx.font = 'bold 12px "Cinzel", serif';
    ctx.fillStyle = '#d4af37';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('☀️', rx, ry);
    ctx.font = 'bold 9px "Cinzel", serif';
    ctx.fillText('U', rx, ry - 17);
    ctx.fillText('S', rx, ry + 17);
    ctx.fillText('T', rx + 17, ry);
    ctx.fillText('B', rx - 17, ry);
  }
}
