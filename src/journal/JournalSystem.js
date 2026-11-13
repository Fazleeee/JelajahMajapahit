import * as THREE from 'three';
import { HISTORICAL_ARTIFACTS } from '../exploration/ExplorationSystem.js';
import { gameState, ModalTypes } from '../core/GameState.js';
import { eventBus, GameEvents } from '../core/EventBus.js';

export const HISTORICAL_BIOGRAPHIES = [
  {
    name: 'Raden Wijaya (Kertarajasa Jayawardhana)',
    reign: '1293 – 1309 M',
    role: 'Pendiri & Raja Pertama Majapahit',
    icon: '👑',
    desc: 'Menantu Kertanegara (Raja Singasari terakhir). Dengan kecerdikan siasat diplomasi, beliau memanfaatkan kedatangan tentara Tartar/Mongol (Dinasti Yuan) untuk menumpas Jayakatwang, lalu mengusir tentara Mongol keluar dari tanah Jawa pada 1293 M.'
  },
  {
    name: 'Tribhuwana Tunggadewi',
    reign: '1328 – 1350 M',
    role: 'Ratu Penguasa Majapahit (Ibu Hayam Wuruk)',
    icon: '👸',
    desc: 'Penguasa perempuan agung yang memimpin Majapahit menghadapi masa-masa genting (Pemberontakan Sadeng dan Keta). Beliau yang mengangkat Gajah Mada sebagai Mahapatih dan menerima ikrar Sumpah Palapa.'
  },
  {
    name: 'Mahapatih Gajah Mada',
    reign: '1336 – 1364 M',
    role: 'Panglima Tertinggi & Arsitek Penyatuan Nusantara',
    icon: '⚔️',
    desc: 'Pahlawan militer dan negarawan legendaris. Membentuk korps pengawal elit Bhayangkara, membangun armada maritim raksasa Jung Jawa, dan mengikrarkan Sumpah Palapa untuk menyatukan pulau-pulau Nusantara di bawah satu kedaulatan maritim.'
  },
  {
    name: 'Sri Rajasanagara (Prabu Hayam Wuruk)',
    reign: '1350 – 1389 M',
    role: 'Raja Terbesar Majapahit (Masa Kejayaan Emas)',
    icon: '☀️',
    desc: 'Naik tahta pada usia 16 tahun, didampingi Mahapatih Gajah Mada. Di masa pemerintahannya, Majapahit mencapai puncak keemasan politik, perdagangan internasional, kemakmuran pertanian, dan perkembangan sastra budaya Nusantara.'
  },
  {
    name: 'Dang Acarya Prapanca (Mpu Prapanca)',
    reign: 'Abad ke-14 M',
    role: 'Pujangga Agung Istana (Dharmadhyaksa Kasogatan)',
    icon: '📜',
    desc: 'Pejabat tinggi urusan agama Buddha sekaligus sastrawan agung pencipta Kakawin Desawarnana / Negarakertagama (1365 M), karya sastra yang menjadi rujukan sejarah terlengkap mengenai Nusantara kuno.'
  },
  {
    name: 'Mpu Tantular',
    reign: 'Abad ke-14 M',
    role: 'Pujangga Luhur Toleransi (Penulis Kitab Sutasoma)',
    icon: '🕊️',
    desc: 'Pujangga beraliran Buddha yang menggubah Kakawin Sutasoma dan Arjunawijaya. Beliau yang memformulasikan ajaran luhur persatuan dan toleransi antarumat beragama: "Bhinneka Tunggal Ika Tan Hana Dharma Mangrwa".'
  }
];

export const HISTORICAL_TIMELINE = [
  {
    year: '1293 M',
    event: 'Berdirinya Kerajaan Majapahit',
    detail: 'Raden Wijaya membuka Hutan Tarik, mengalahkan tentara Mongol (Kubilai Khan), dan dinobatkan sebagai Raja Kertarajasa Jayawardhana.'
  },
  {
    year: '1309 – 1328 M',
    event: 'Pemerintahan Raja Jayanegara',
    detail: 'Masa pergolakan sejumlah pemberontakan (Ranggalawe, Sora, Nambi, Kuti). Gajah Mada mulai bersinar menyelamatkan raja bersama pasukan Bhayangkara.'
  },
  {
    year: '1336 M',
    event: 'Pengucapan Sumpah Palapa',
    detail: 'Gajah Mada diangkat menjadi Mahapatih oleh Ratu Tribhuwana Tunggadewi dan bersumpah tidak menikmati kenikmatan duniawi sebelum Nusantara bersatu.'
  },
  {
    year: '1350 – 1389 M',
    event: 'Puncak Kejayaan Hayam Wuruk',
    detail: 'Majapahit mencapai zaman keemasan. Wilayah pengaruh maritim terbentang dari Semenanjung Melayu hingga Maluku dan Papua.'
  },
  {
    year: '1365 M',
    event: 'Penulisan Kitab Negarakertagama',
    detail: 'Mpu Prapanca menyelesaikan naskah daun lontar yang mengabadikan hukum ketatanegaraan, tata ruang kota Trowulan, dan wilayah kedaulatan Majapahit.'
  },
  {
    year: '1405 – 1406 M',
    event: 'Perang Saudara (Perang Paregreg)',
    detail: 'Pertikaian antara istana barat (Wikramawardhana) dan istana timur (Bhre Wirabhumi) yang melemahkan kedaulatan pusat kerajaan.'
  },
  {
    year: '1527 M',
    event: 'Berakhirnya Era Majapahit',
    detail: 'Pusat kekuasaan di Jawa Timur beralih seiring berkembangnya Kesultanan Demak dan era kerajaan-kerajaan Islam di pesisir Nusantara.'
  }
];

export class JournalSystem {
  constructor(explorationSystem, audioSystem) {
    this.exploration = explorationSystem;
    this.audio = audioSystem;

    this.modal = document.getElementById('journal-modal');
    this.tabButtons = document.querySelectorAll('.journal-tab-btn');
    this.tabPanels = document.querySelectorAll('.journal-tab-panel');
    this.btnClose = document.getElementById('btn-journal-close');

    // 3D Relic Inspector Viewer Components
    this.viewerCanvas = document.getElementById('relic-viewer-canvas');
    this.relicDetailTitle = document.getElementById('relic-detail-title');
    this.relicDetailEra = document.getElementById('relic-detail-era');
    this.relicDetailZone = document.getElementById('relic-detail-zone');
    this.relicDetailDesc = document.getElementById('relic-detail-desc');
    this.relicListContainer = document.getElementById('relic-grid-list');

    this.selectedRelicId = 'buah_maja_kuno';
    this.isDragging = false;
    this.prevMouse = { x: 0, y: 0 };

    this.init3DViewer();
    this.bindEvents();
    this.populateBiographies();
    this.populateTimeline();
  }

  init3DViewer() {
    if (!this.viewerCanvas) return;

    this.viewerScene = new THREE.Scene();
    this.viewerCamera = new THREE.PerspectiveCamera(45, 1, 0.1, 50);
    this.viewerCamera.position.set(0, 1.2, 4.5);
    this.viewerCamera.lookAt(0, 0, 0);

    try {
      this.viewerRenderer = new THREE.WebGLRenderer({
        canvas: this.viewerCanvas,
        alpha: true,
        antialias: true
      });
    } catch {
      this.viewerRenderer = null;
      return;
    }
    this.viewerRenderer.setSize(260, 260);
    this.viewerRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Pencahayaan studio 3D viewer
    const amb = new THREE.AmbientLight(0xfff5e6, 1.2);
    this.viewerScene.add(amb);

    const keyLight = new THREE.DirectionalLight(0xffecd1, 2.2);
    keyLight.position.set(4, 5, 4);
    this.viewerScene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xd4af37, 1.4);
    fillLight.position.set(-4, -2, -3);
    this.viewerScene.add(fillLight);

    this.relicObjectGroup = new THREE.Group();
    this.viewerScene.add(this.relicObjectGroup);

    // Shared materials for 3D Relic Viewer (avoids recreating materials on click)
    this.relicMats = {
      gold: new THREE.MeshStandardMaterial({
        color: '#f0c14b',
        emissive: '#4d370b',
        roughness: 0.35,
        metalness: 0.75
      }),
      bronze: new THREE.MeshStandardMaterial({ color: '#8f6d3a', roughness: 0.45, metalness: 0.65 }),
      wood: new THREE.MeshStandardMaterial({ color: '#57371f', roughness: 0.8 }),
      terracotta: new THREE.MeshStandardMaterial({ color: '#a63e2a', roughness: 0.85, flatShading: true }),
      parchment: new THREE.MeshStandardMaterial({ color: '#eee4d1', roughness: 0.85 }),
      majaGreen: new THREE.MeshStandardMaterial({ color: '#a8cf45', roughness: 0.4 }),
      darkSlot: new THREE.MeshBasicMaterial({ color: '#17110c' }),
      silhouette: new THREE.MeshStandardMaterial({ color: '#2d241e', roughness: 0.9 })
    };

    // Pointer drag rotation on 3D relic canvas (mendukung mouse & sentuhan mobile)
    this.viewerCanvas.style.touchAction = 'none';
    this.viewerCanvas.addEventListener('pointerdown', (e) => {
      this.isDragging = true;
      this.prevMouse.x = e.clientX;
      this.prevMouse.y = e.clientY;
    });

    const stopDrag = () => {
      this.isDragging = false;
    };
    window.addEventListener('pointerup', stopDrag);
    window.addEventListener('pointercancel', stopDrag);

    window.addEventListener('pointermove', (e) => {
      if (!this.isDragging || !this.relicObjectGroup) return;
      const dx = e.clientX - this.prevMouse.x;
      const dy = e.clientY - this.prevMouse.y;
      this.prevMouse.x = e.clientX;
      this.prevMouse.y = e.clientY;

      this.relicObjectGroup.rotation.y += dx * 0.015;
      this.relicObjectGroup.rotation.x += dy * 0.015;
    });
  }

  bindEvents() {
    if (this.btnClose) {
      this.btnClose.addEventListener('click', (e) => {
        e.stopPropagation();
        this.close();
      });
    }

    if (this.modal) {
      // Klik area gelap di luar kartu jurnal untuk menutup modal
      this.modal.addEventListener('click', (e) => {
        if (e.target === this.modal) {
          this.close();
        }
      });
      // Cegah scroll atau drag di dalam modal menggerakkan kamera 3D
      this.modal.addEventListener('wheel', (e) => e.stopPropagation());
      this.modal.addEventListener('mousedown', (e) => e.stopPropagation());
    }

    this.tabButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const tabId = btn.dataset.tab;
        this.switchTab(tabId);
      });
    });

    eventBus.on(GameEvents.MODAL_CLOSE, ({ modalType }) => {
      if (!modalType || modalType === ModalTypes.JOURNAL) {
        if (this.modal && !this.modal.classList.contains('hidden')) {
          this.modal.classList.add('hidden');
        }
      }
    });

    eventBus.on(GameEvents.MODAL_OPEN, ({ modalType }) => {
      if (modalType === ModalTypes.JOURNAL) {
        this.openDirect();
      }
    });
  }

  toggle() {
    gameState.toggleModal(ModalTypes.JOURNAL);
  }

  open() {
    gameState.openModal(ModalTypes.JOURNAL);
  }

  openDirect() {
    if (this.audio) this.audio.playDialoguePop();
    this.populateRelicsGrid();
    if (this.modal) this.modal.classList.remove('hidden');
  }

  close() {
    gameState.closeModal(ModalTypes.JOURNAL);
  }

  switchTab(tabId) {
    this.tabButtons.forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.tab === tabId);
    });
    this.tabPanels.forEach((panel) => {
      panel.classList.toggle('active', panel.id === `tab-${tabId}`);
    });
  }

  populateRelicsGrid() {
    if (!this.relicListContainer) return;
    this.relicListContainer.innerHTML = '';

    const collected = this.exploration ? this.exploration.collectedArtifacts : [];

    HISTORICAL_ARTIFACTS.forEach((art) => {
      const isFound = collected.includes(art.id);
      const card = document.createElement('div');
      card.className = `relic-item-card ${isFound ? 'found' : 'locked'} ${art.id === this.selectedRelicId ? 'selected' : ''}`;

      card.innerHTML = `
        <div class="relic-item-icon">${isFound ? '✨' : '🔒'}</div>
        <div class="relic-item-info">
          <div class="relic-item-title">${isFound ? art.title : 'Artefak Tersembunyi'}</div>
          <div class="relic-item-zone">${isFound ? art.zone : art.hint}</div>
        </div>
      `;

      card.addEventListener('click', () => {
        this.selectedRelicId = art.id;
        document.querySelectorAll('.relic-item-card').forEach((c) => c.classList.remove('selected'));
        card.classList.add('selected');
        this.displayRelicDetail(art, isFound);
      });

      this.relicListContainer.appendChild(card);
    });

    const activeArt = HISTORICAL_ARTIFACTS.find((a) => a.id === this.selectedRelicId) || HISTORICAL_ARTIFACTS[0];
    this.displayRelicDetail(activeArt, collected.includes(activeArt.id));
  }

  displayRelicDetail(art, isFound) {
    if (isFound) {
      this.relicDetailTitle.textContent = art.title;
      this.relicDetailEra.textContent = `Era: ${art.era}`;
      this.relicDetailZone.textContent = `Lokasi: ${art.zone}`;
      this.relicDetailDesc.textContent = art.lore;
    } else {
      this.relicDetailTitle.textContent = 'Artefak Belum Ditemukan';
      this.relicDetailEra.textContent = 'Era: ???';
      this.relicDetailZone.textContent = 'Lokasi Rahasia';
      this.relicDetailDesc.textContent = `Petunjuk: "${art.hint}". Nyalakan Lentera Waktu (F) untuk menemukan jejaknya!`;
    }

    this.build3DRelicModel(art.id, isFound);
  }

  build3DRelicModel(artId, isFound) {
    if (!this.relicObjectGroup || !this.relicMats) return;

    while (this.relicObjectGroup.children.length > 0) {
      const child = this.relicObjectGroup.children[0];
      if (child.geometry) child.geometry.dispose();
      this.relicObjectGroup.remove(child);
    }

    const m = this.relicMats;
    const activeMat = isFound ? null : m.silhouette;

    if (artId === 'buah_maja_kuno') {
      const fruit = new THREE.Mesh(new THREE.SphereGeometry(1.0, 16, 16), activeMat || m.majaGreen);
      fruit.scale.set(1.0, 1.15, 1.0);
      this.relicObjectGroup.add(fruit);

      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.6, 6), activeMat || m.wood);
      stem.position.set(0, 1.2, 0);
      this.relicObjectGroup.add(stem);
    } else if (artId === 'koin_gobog_wayang') {
      const coin = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 0.12, 24), activeMat || m.bronze);
      coin.rotation.x = Math.PI / 4;
      this.relicObjectGroup.add(coin);

      const squareHole = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.2, 0.48), m.darkSlot);
      squareHole.rotation.x = Math.PI / 4;
      this.relicObjectGroup.add(squareHole);
    } else if (artId === 'celengan_terakota') {
      const body = new THREE.Mesh(new THREE.SphereGeometry(0.9, 14, 14), activeMat || m.terracotta);
      body.scale.set(1.4, 0.95, 0.95);
      this.relicObjectGroup.add(body);

      const snout = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.4, 0.5, 10), activeMat || m.terracotta);
      snout.rotation.z = Math.PI / 2;
      snout.position.set(1.2, 0, 0);
      this.relicObjectGroup.add(snout);

      const slot = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.15, 0.08), m.darkSlot);
      slot.position.set(0, 0.92, 0);
      this.relicObjectGroup.add(slot);
    } else if (artId === 'keris_majapahit') {
      for (let w = 0; w < 7; w++) {
        const seg = new THREE.Mesh(new THREE.BoxGeometry(0.25 - w * 0.02, 0.4, 0.08), activeMat || m.gold);
        seg.position.set(Math.sin(w * 0.8) * 0.15, (w - 3) * 0.35, 0);
        seg.rotation.z = Math.cos(w * 0.8) * 0.25;
        this.relicObjectGroup.add(seg);
      }
      const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.65, 8), activeMat || m.wood);
      handle.position.set(0, -1.4, 0);
      this.relicObjectGroup.add(handle);
    } else if (artId === 'lontar_negarakertagama' || artId === 'lontar_sutasoma') {
      const scroll1 = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 1.8, 12), activeMat || m.parchment);
      scroll1.rotation.z = Math.PI / 2;
      scroll1.position.y = 0.35;
      this.relicObjectGroup.add(scroll1);

      const leaf = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.04, 0.8), activeMat || m.parchment);
      this.relicObjectGroup.add(leaf);
    } else if (artId === 'cetbang_bullet') {
      const cannonball = new THREE.Mesh(new THREE.SphereGeometry(1.0, 16, 16), activeMat || m.bronze);
      this.relicObjectGroup.add(cannonball);

      const ring = new THREE.Mesh(new THREE.TorusGeometry(1.02, 0.08, 8, 24), activeMat || m.gold);
      this.relicObjectGroup.add(ring);
    } else {
      const arca = new THREE.Mesh(new THREE.OctahedronGeometry(1.1, 1), activeMat || m.gold);
      arca.scale.set(0.8, 1.4, 0.8);
      this.relicObjectGroup.add(arca);

      const lotusPedestal = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.4, 0.4, 12), activeMat || m.bronze);
      lotusPedestal.position.y = -1.1;
      this.relicObjectGroup.add(lotusPedestal);
    }
  }

  populateBiographies() {
    const container = document.getElementById('biography-list');
    if (!container) return;
    container.innerHTML = '';

    HISTORICAL_BIOGRAPHIES.forEach((bio) => {
      const card = document.createElement('div');
      card.className = 'bio-card';
      card.innerHTML = `
        <div class="bio-header">
          <div class="bio-icon">${bio.icon}</div>
          <div>
            <h3 class="bio-name">${bio.name}</h3>
            <div class="bio-role">${bio.role} (${bio.reign})</div>
          </div>
        </div>
        <p class="bio-desc">${bio.desc}</p>
      `;
      container.appendChild(card);
    });
  }

  populateTimeline() {
    const container = document.getElementById('timeline-list');
    if (!container) return;
    container.innerHTML = '';

    HISTORICAL_TIMELINE.forEach((t) => {
      const item = document.createElement('div');
      item.className = 'timeline-item';
      item.innerHTML = `
        <div class="timeline-year">${t.year}</div>
        <div class="timeline-content">
          <h4 class="timeline-event">${t.event}</h4>
          <p class="timeline-detail">${t.detail}</p>
        </div>
      `;
      container.appendChild(item);
    });
  }

  update(dt) {
    if (this.modal && !this.modal.classList.contains('hidden')) {
      if (this.relicObjectGroup && !this.isDragging) {
        this.relicObjectGroup.rotation.y += dt * 0.7;
      }
      if (this.viewerRenderer && this.viewerScene && this.viewerCamera) {
        this.viewerRenderer.render(this.viewerScene, this.viewerCamera);
      }
    }
  }
}
