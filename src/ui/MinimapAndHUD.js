import { ZONES, LANDMARKS, BRIDGES } from '../world/WorldData.js';
import { getRiverCenterZ } from '../world/Terrain.js';
import { HISTORICAL_ARTIFACTS, VIEWPOINTS } from '../exploration/ExplorationSystem.js';
import { NPC_DATA } from '../quests/QuestData.js';
import { gameState, GameStates, ModalTypes } from '../core/GameState.js';
import { eventBus, GameEvents } from '../core/EventBus.js';
import { DialogueModal } from './DialogueModal.js';
import { AtlasMap } from './AtlasMap.js';

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

    // Modul Dialog Tokoh Sejarah & Atlas Interaktif
    this.dialogue = new DialogueModal(audioSystem, questSystem);
    this.atlas = new AtlasMap(explorationSystem, questSystem, audioSystem);

    // Banner Sinematik Sinkronisasi Viewpoint
    this.viewpointBanner = document.getElementById('viewpoint-banner');
    this.vpTitleEl = document.getElementById('vp-banner-title');
    this.vpZoneEl = document.getElementById('vp-banner-zone');

    // Tombol Buka Atlas pada Minimap
    this.btnMapExpand = document.getElementById('btn-map-expand');

    // Help Modal
    this.helpModal = document.getElementById('help-modal');
    this.btnHelpClose = document.getElementById('btn-help-close');

    this.currentZoneId = null;
    this.currentZoneObj = ZONES[0];
    this._lastCoordsText = '';
    this._lastMinimapDrawTime = 0;
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
        window.dispatchEvent(new CustomEvent('majapahit:lantern-request'));
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
          if (this.dialogue) this.dialogue.show(data?.npc);
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
          if (this.atlas) this.atlas.show(this.savedPlayerPos, this.savedPlayerYaw);
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
          if (this.dialogue) this.dialogue.hide();
          break;
        case ModalTypes.ARTIFACT:
          if (this.artifactModal) {
            this.artifactModal.classList.add('hidden');
            this.updateQuestTracker();
          }
          break;
        case ModalTypes.ATLAS:
          if (this.atlas) this.atlas.hide();
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
    if (exceptType !== ModalTypes.DIALOGUE && this.dialogue) this.dialogue.hide();
    if (exceptType !== ModalTypes.ARTIFACT && this.artifactModal) this.artifactModal.classList.add('hidden');
    if (exceptType !== ModalTypes.ATLAS && this.atlas) this.atlas.hide();
    if (exceptType !== ModalTypes.HELP && this.helpModal) this.helpModal.classList.add('hidden');
    if (exceptType !== ModalTypes.QUEST_POPOVER && this.questDetailPopover) this.questDetailPopover.classList.add('hidden');
    if (exceptType !== ModalTypes.HEADER_MENU && this.unifiedHeaderMenu) {
      this.unifiedHeaderMenu.classList.add('hidden');
      if (this.btnToggleMenu) this.btnToggleMenu.classList.remove('active');
    }
  }

  updateRelicBadge() {
    if (!this.exploration) return;
    const total = HISTORICAL_ARTIFACTS.length;
    const count = this.exploration.collectedArtifacts.length;

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
    if (this.atlas) {
      this.atlas.updateIfOpen(now, playerPos, playerYaw);
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
}
