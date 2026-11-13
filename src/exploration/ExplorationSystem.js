import * as THREE from 'three';
import { getWalkableHeight, getTerrainHeight } from '../world/Terrain.js';
import { NPC_DATA } from '../quests/QuestData.js';

export const HISTORICAL_ARTIFACTS = [
  {
    id: 'buah_maja_kuno',
    title: 'Buah Maja Bersejarah',
    zone: 'Hutan Tarik',
    coords: { x: -16, z: 129.5 },
    hint: 'Tergantung di bawah dahan Pohon Maja Agung di Hutan Tarik',
    era: '1293 M (Masa Raden Wijaya)',
    lore: 'Buah berakar keras dari pohon Aegle marmelos yang ditemukan prajurit Raden Wijaya saat membuka hutan. Rasanya yang pahit melahirkan nama "Majapahit", yang kemudian menjadi imperium terbesar di Nusantara.'
  },
  {
    id: 'prasasti_kudadu',
    title: 'Fragmen Prasasti Kudadu (1294 M)',
    zone: 'Tepian Sungai Brantas',
    coords: { x: -48, z: 68 },
    hint: 'Tersembunyi di bebatuan seberang barat bantaran Sungai Brantas',
    era: '1294 M',
    lore: 'Prasasti lempengan tembaga peninggalan Raden Wijaya yang memuat kisah pelariannya ke Madura setelah Singasari runtuh, serta ucapan terima kasih kepada Kepala Desa Kudadu yang telah melindunginya.'
  },
  {
    id: 'koin_gobog_wayang',
    title: 'Koin Gobog Wayang Majapahit',
    zone: 'Pasar Kotaraja',
    coords: { x: 19, z: 9 },
    hint: 'Tercecer di kolong meja stan rempah-rempah Pasar Kotaraja',
    era: 'Abad ke-14 M',
    lore: 'Mata uang perunggu berbentuk keping bundar dengan lubang segi empat di tengahnya, dihiasi relief tokoh wayang, pohon hayat, dan binatang mitologi. Digunakan sebagai alat tukar resmi dan jimat keselamatan.'
  },
  {
    id: 'celengan_terakota',
    title: 'Celengan Babi Terakota Trowulan',
    zone: 'Kolam Segaran',
    coords: { x: -31.6, z: 29.5 },
    hint: 'Terselip di luar sudut tanggul bata merah tenggara Kolam Segaran',
    era: 'Abad ke-14–15 M',
    lore: 'Karya seni tanah liat bakar (terakota) berbentuk babi hutan (celeng) dengan lubang koin di punggungnya. Ini adalah bukti autentik masyarakat Majapahit kuno sudah mengenal budaya menabung koin Gobog.'
  },
  {
    id: 'lontar_negarakertagama',
    title: 'Fragmen Kitab Negarakertagama',
    zone: 'Sanggar Pujangga',
    coords: { x: 126, z: -12.5 },
    hint: 'Di atas meja tulis kayu Sanggar Pujangga lereng Candi',
    era: '1365 M (Mpu Prapanca)',
    lore: 'Kakawin sastra gubahan Dang Acarya Prapanca (Mpu Prapanca) beraksara Kawi pada daun lontar. Menjadi sumber sejarah primer terpenting mengenai tata kota Trowulan, hukum ketatanegaraan, dan wilayah kedaulatan Majapahit.'
  },
  {
    id: 'lontar_sutasoma',
    title: 'Lontar Sutasoma ("Bhinneka Tunggal Ika")',
    zone: 'Lembah Candi Bajang Ratu',
    coords: { x: 108, z: -10 },
    hint: 'Di dalam lorong teras atas Candi Bajang Ratu',
    era: 'Abad ke-14 M (Mpu Tantular)',
    lore: 'Kitab epos gubahan Mpu Tantular yang mengajarkan kerukunan antara penganut Siwa (Hindu) dan Buddha. Memuat semboyan suci: "Bhinneka Tunggal Ika Tan Hana Dharma Mangrwa" yang kini menjadi semboyan resmi Republik Indonesia.'
  },
  {
    id: 'cetbang_bullet',
    title: 'Peluru Perunggu Meriam Cetbang',
    zone: 'Barak Bhayangkara',
    coords: { x: -93, z: 21.5 },
    hint: 'Di dekat dudukan meriam putar Cetbang Barak Bhayangkara',
    era: 'Abad ke-14 M',
    lore: 'Amunisi bola perunggu padat berbobot tinggi untuk meriam putar Cetbang. Pasukan artileri Majapahit memanfaatkan mesiu bubuk mesiu (bedil) hasil modifikasi teknologi Dinasti Yuan yang berhasil dikalahkan Raden Wijaya.'
  },
  {
    id: 'kompas_jung',
    title: 'Kompas Navigasi Layar Jung Jawa',
    zone: 'Dermaga Barat',
    coords: { x: -138, z: 19 },
    hint: 'Di atas meja kemudi anjungan buritan Kapal Jung Jawa',
    era: 'Abad ke-14 M',
    lore: 'Alat penunjuk arah bintang dan jarum magnetik yang digunakan pelaut ulung Majapahit saat mengarungi perairan Nusantara hingga ke Kepulauan Maluku, Campa, dan pesisir utara Australia.'
  },
  {
    id: 'keris_majapahit',
    title: 'Keris Luk 9 Bertatah Emas',
    zone: 'Pelataran Gerbang Kedaton',
    coords: { x: -12, z: -70 },
    hint: 'Terselip di balik pilar jembatan parit pertahanan Kedaton Agung',
    era: 'Abad ke-14 M',
    lore: 'Senjata pusaka berbilah lekuk sembilan (luk songo) dengan pamor besi meteorit berpamor emas. Keris Majapahit merupakan mahakarya metalurgi Nusantara sekaligus lambang status kehormatan seorang ksatria.'
  },
  {
    id: 'arca_harihara',
    title: 'Arca Emas Dewa Harihara',
    zone: 'Kedaton Agung',
    coords: { x: 0, z: -120.2 },
    hint: 'Di altar suci tepat di belakang Singgasana Surya Majapahit',
    era: '1309 M',
    lore: 'Arca perwujudan Dewa Wisnu dan Siwa yang dipadukan menjadi satu (Harihara), melambangkan pemuliaan anumerta pendiri Majapahit, Raden Wijaya (Kertarajasa Jayawardhana), sebagai pemersatu dua aliran keyakinan agung.'
  }
];

export const VIEWPOINTS = [
  {
    id: 'vp_bajang_ratu',
    name: 'Puncak Candi Bajang Ratu',
    zoneTitle: 'LEMBAH CANDI & SANGGAR PUJANGGA',
    coords: { x: 108, y: 13.8, z: -10 },
    revealZone: 'lembah_candi',
    radius: 4.0
  },
  {
    id: 'vp_kapal_jung',
    name: 'Anjungan Buritan Kapal Jung Jawa',
    zoneTitle: 'ARMADA MARITIM & BARAK BHAYANGKARA',
    coords: { x: -136, y: 4.5, z: 19 },
    revealZone: 'barak_dermaga',
    radius: 4.0
  },
  {
    id: 'vp_kedaton',
    name: 'Pelataran Kedaton Agung',
    zoneTitle: 'KEDATON AGUNG & SINGGASANA MAJAPAHIT',
    coords: { x: 0, y: 5.3, z: -115 },
    revealZone: 'kedaton_agung',
    radius: 5.0
  }
];

export class ExplorationSystem {
  constructor(scene, audioSystem) {
    this.scene = scene;
    this.audio = audioSystem;

    // Lentera Waktu State
    this.isLanternActive = false;

    // Fog of War Grid (88x88 cells covering 440x440 world, each cell ~5m)
    this.gridSize = 88;
    this.fogGrid = Array.from({ length: this.gridSize }, () => Array(this.gridSize).fill(false));

    // Load collected artifacts from localStorage
    this.collectedArtifacts = this.loadCollectedStorage();
    this.syncedViewpoints = this.loadViewpointStorage();

    // Visual Meshes Collections
    this.artifactMeshes = [];
    this.viewpointRings = [];
    this.beaconPillars = [];
    this.trailFootprints = [];

    // Dirty flag & cell cache for Fog of War optimization
    this.fogDirty = true;
    this._lastFogCellX = -1;
    this._lastFogCellZ = -1;

    this.initSharedMaterials();
    this.buildArtifactChests();
    this.buildViewpointMonuments();
    this.initLenteraWaktuTrails();

    // Reveal starting area around Hutan Tarik
    this.revealFogCircle(0, 142, 45, true);
  }

  loadCollectedStorage() {
    try {
      const saved = localStorage.getItem('majapahit_relics_collected');
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  saveCollectedStorage() {
    try {
      localStorage.setItem('majapahit_relics_collected', JSON.stringify(this.collectedArtifacts));
    } catch {
      // storage unavailable
    }
  }

  loadViewpointStorage() {
    try {
      const saved = localStorage.getItem('majapahit_viewpoints_synced');
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  saveViewpointStorage() {
    try {
      localStorage.setItem('majapahit_viewpoints_synced', JSON.stringify(this.syncedViewpoints));
    } catch {
      // storage unavailable
    }
  }

  initSharedMaterials() {
    this.matChestWood = new THREE.MeshStandardMaterial({ color: '#54341b', roughness: 0.8 });
    this.matChestGold = new THREE.MeshStandardMaterial({
      color: '#f9d976',
      emissive: '#593e0b',
      roughness: 0.3,
      metalness: 0.75
    });
    this.matGlowOrb = new THREE.MeshBasicMaterial({ color: '#ffe680' });
    this.matBeaconPillar = new THREE.MeshBasicMaterial({
      color: '#ffd04d',
      transparent: true,
      opacity: 0.22,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    this.matGroundRing = new THREE.MeshBasicMaterial({
      color: '#f9d976',
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.65
    });

    // Shared Geometries for all 10 sculpted Majapahit treasure chests
    this.geoChestPlinth = new THREE.CylinderGeometry(0.56, 0.64, 0.14, 8);
    this.geoChestBase = new THREE.CylinderGeometry(0.46, 0.50, 0.36, 8);
    this.geoChestRim = new THREE.CylinderGeometry(0.49, 0.49, 0.08, 8);
    this.geoChestLid = new THREE.CylinderGeometry(0.29, 0.29, 0.84, 10, 1, false, 0, Math.PI);
    this.geoChestLid.rotateZ(Math.PI / 2);
    this.geoGlowOrb = new THREE.OctahedronGeometry(0.24, 1);
    this.geoBeaconPillar = new THREE.CylinderGeometry(0.32, 0.68, 38, 12, 1, true);
    this.geoGroundRing = new THREE.RingGeometry(1.18, 1.44, 24);
    this.geoGroundRing.rotateX(-Math.PI / 2);
  }

  buildArtifactChests() {
    HISTORICAL_ARTIFACTS.forEach((art, idx) => {
      const x = art.coords.x;
      const z = art.coords.z;
      const y = getWalkableHeight(x, z);

      const group = new THREE.Group();
      group.position.set(x, y, z);

      // Batur Oktagonal & Peti Kayu Ukir Tutup Lengkung Majapahit
      const chestPlinth = new THREE.Mesh(this.geoChestPlinth, this.matChestWood);
      chestPlinth.position.y = 0.07;
      chestPlinth.receiveShadow = true;
      group.add(chestPlinth);

      const chestBase = new THREE.Mesh(this.geoChestBase, this.matChestWood);
      chestBase.position.y = 0.32;
      chestBase.castShadow = true;
      group.add(chestBase);

      const chestRim = new THREE.Mesh(this.geoChestRim, this.matChestGold);
      chestRim.position.y = 0.50;
      group.add(chestRim);

      const chestLid = new THREE.Mesh(this.geoChestLid, this.matChestGold);
      chestLid.position.y = 0.52;
      chestLid.scale.set(1.0, 0.72, 1.0);
      chestLid.castShadow = true;
      group.add(chestLid);

      // Bola Energi Emas Melayang
      const floatingOrb = new THREE.Mesh(this.geoGlowOrb, this.matGlowOrb);
      floatingOrb.position.y = 1.0;
      group.add(floatingOrb);

      // Pilar Cahaya Emas Tinggi ke Langit (Lentera Waktu)
      const pillar = new THREE.Mesh(this.geoBeaconPillar, this.matBeaconPillar.clone());
      pillar.position.y = 19;
      pillar.visible = false; // Hanya terlihat terang saat Lentera Waktu aktif
      group.add(pillar);

      // Cincin Lantai Penanda
      const groundRing = new THREE.Mesh(this.geoGroundRing, this.matGroundRing);
      groundRing.position.y = 0.05;
      group.add(groundRing);

      this.scene.add(group);

      this.artifactMeshes.push({
        data: art,
        group,
        orb: floatingOrb,
        pillar,
        ring: groundRing,
        phase: idx * 0.9,
        collected: this.collectedArtifacts.includes(art.id)
      });

      if (this.collectedArtifacts.includes(art.id)) {
        floatingOrb.visible = false;
        groundRing.visible = false;
        pillar.visible = false;
      }
    });
  }

  buildViewpointMonuments() {
    VIEWPOINTS.forEach((vp, idx) => {
      const group = new THREE.Group();
      group.position.set(vp.coords.x, vp.coords.y, vp.coords.z);

      // Platform Cincin Surya Majapahit 8 Arah
      const discGeo = new THREE.CylinderGeometry(2.2, 2.4, 0.2, 16);
      const discMat = new THREE.MeshStandardMaterial({
        color: '#d4af37',
        emissive: '#4d3a0e',
        roughness: 0.35,
        metalness: 0.65
      });
      const platform = new THREE.Mesh(discGeo, discMat);
      platform.position.y = 0.1;
      group.add(platform);

      // Lambang Elang / Surya Emas Melayang
      const emblem = new THREE.Mesh(new THREE.DodecahedronGeometry(0.48, 0), this.matChestGold);
      emblem.position.y = 1.35;
      group.add(emblem);

      // Cincin Berdenyut
      const pulseGeo = new THREE.RingGeometry(2.3, 2.7, 28);
      pulseGeo.rotateX(-Math.PI / 2);
      const pulseMat = new THREE.MeshBasicMaterial({
        color: '#f9d976',
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8
      });
      const pulseRing = new THREE.Mesh(pulseGeo, pulseMat);
      pulseRing.position.y = 0.15;
      group.add(pulseRing);

      this.scene.add(group);

      const isSynced = this.syncedViewpoints.includes(vp.id);
      if (isSynced) {
        this.revealZoneQuadrant(vp.revealZone);
      }

      this.viewpointRings.push({
        data: vp,
        group,
        emblem,
        pulseRing,
        phase: idx * 1.6,
        synced: isSynced
      });
    });
  }

  initLenteraWaktuTrails() {
    // 52 Jejak Partikel Cahaya Pemandu Misi & Lentera Waktu
    const count = 52;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.85,
      vertexColors: true,
      transparent: true,
      opacity: 0.0,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    this.trailPoints = new THREE.Points(geo, mat);
    this.scene.add(this.trailPoints);

    // Pre-allocated lookup cache for 32-segment trail elevation profile (Zero per-frame noise calculation)
    this._trailSampleCount = 32;
    this._trailHeightProfile = new Float32Array(this._trailSampleCount + 1);
    this._lastTrailPlayerX = Infinity;
    this._lastTrailPlayerZ = Infinity;
    this._lastTrailTargetX = Infinity;
    this._lastTrailTargetZ = Infinity;
  }

  toggleLenteraWaktu() {
    this.isLanternActive = !this.isLanternActive;
    if (this.audio) this.audio.playLantern(this.isLanternActive);

    // Tampilkan / sembunyikan pilar cahaya artefak ke angkasa
    for (const a of this.artifactMeshes) {
      if (!a.collected) {
        a.pillar.visible = this.isLanternActive;
      }
    }

    return this.isLanternActive;
  }

  // Buka kabut di sekitar pemain secara lingkaran (dengan caching posisi sel agar hemat CPU)
  revealFogCircle(worldX, worldZ, radius = 28, force = false) {
    const half = 220;
    const scale = this.gridSize / 440;
    const cx = Math.floor((worldX + half) * scale);
    const cz = Math.floor((worldZ + half) * scale);

    if (!force && cx === this._lastFogCellX && cz === this._lastFogCellZ) {
      return;
    }
    this._lastFogCellX = cx;
    this._lastFogCellZ = cz;

    const rCells = Math.ceil(radius * scale);
    const rSq = rCells * rCells;

    for (let dx = -rCells; dx <= rCells; dx++) {
      for (let dz = -rCells; dz <= rCells; dz++) {
        if (dx * dx + dz * dz <= rSq) {
          const gx = cx + dx;
          const gz = cz + dz;
          if (gx >= 0 && gx < this.gridSize && gz >= 0 && gz < this.gridSize) {
            if (!this.fogGrid[gx][gz]) {
              this.fogGrid[gx][gz] = true;
              this.fogDirty = true;
            }
          }
        }
      }
    }
  }

  // Buka seluruh kuadran wilayah saat sinkronisasi viewpoint
  revealZoneQuadrant(zoneId) {
    let targetX = 0;
    let targetZ = 0;
    if (zoneId === 'lembah_candi') {
      targetX = 105;
      targetZ = -10;
    } else if (zoneId === 'barak_dermaga') {
      targetX = -115;
      targetZ = 15;
    } else if (zoneId === 'kedaton_agung') {
      targetX = 0;
      targetZ = -115;
    }

    this.revealFogCircle(targetX, targetZ, 95, true);
  }

  // Cek apakah ada artefak atau viewpoint dekat pemain
  checkProximity(playerPos) {
    // 1. Cek Viewpoints yang belum disinkronkan
    for (const vp of this.viewpointRings) {
      const d = Math.hypot(playerPos.x - vp.data.coords.x, playerPos.z - vp.data.coords.z);
      const dy = Math.abs(playerPos.y - vp.data.coords.y);
      if (d <= vp.data.radius && dy <= 2.5 && !vp.synced) {
        return { type: 'viewpoint', target: vp };
      }
    }

    // 2. Cek Peti Artefak yang belum dikoleksi
    for (const art of this.artifactMeshes) {
      if (art.collected) continue;
      const d = Math.hypot(playerPos.x - art.data.coords.x, playerPos.z - art.data.coords.z);
      if (d <= 4.0) {
        return { type: 'artifact', target: art };
      }
    }

    return null;
  }

  collectArtifact(artMesh) {
    if (artMesh.collected) return null;
    artMesh.collected = true;
    artMesh.orb.visible = false;
    artMesh.ring.visible = false;
    artMesh.pillar.visible = false;

    if (!this.collectedArtifacts.includes(artMesh.data.id)) {
      this.collectedArtifacts.push(artMesh.data.id);
      this.saveCollectedStorage();
    }

    if (this.audio) this.audio.playChestOpen();

    return artMesh.data;
  }

  syncViewpoint(vpItem) {
    if (vpItem.synced) return;
    vpItem.synced = true;
    if (!this.syncedViewpoints.includes(vpItem.data.id)) {
      this.syncedViewpoints.push(vpItem.data.id);
      this.saveViewpointStorage();
    }

    if (this.audio) this.audio.playViewpointSync();
    this.revealZoneQuadrant(vpItem.data.revealZone);
    return vpItem.data;
  }

  update(dt, elapsedTime, playerPos, questSystem = null) {
    // 1. Update Fog of War di sekitar pemain
    this.revealFogCircle(playerPos.x, playerPos.z, 28);

    // 2. Animate Peti Artefak (Floating Orb & Beacons, distance-culled within 70m)
    for (const a of this.artifactMeshes) {
      if (a.collected) continue;
      const dSq = (a.data.coords.x - playerPos.x) ** 2 + (a.data.coords.z - playerPos.z) ** 2;
      if (dSq > 4900 && !this.isLanternActive) continue;

      a.orb.position.y = 0.95 + Math.sin(elapsedTime * 2.8 + a.phase) * 0.14;
      a.orb.rotation.y = elapsedTime * 1.8 + a.phase;
      const pulse = 1.0 + Math.sin(elapsedTime * 3.0 + a.phase) * 0.12;
      a.ring.scale.set(pulse, pulse, 1);

      if (this.isLanternActive) {
        a.pillar.material.opacity = 0.25 + Math.sin(elapsedTime * 4.0 + a.phase) * 0.1;
      }
    }

    // 3. Animate Viewpoint Rings (distance-culled within 75m)
    for (const vp of this.viewpointRings) {
      const dSq = (vp.data.coords.x - playerPos.x) ** 2 + (vp.data.coords.z - playerPos.z) ** 2;
      if (dSq > 5625) continue;

      vp.emblem.rotation.y = elapsedTime * 1.5 + vp.phase;
      vp.emblem.position.y = 1.35 + Math.sin(elapsedTime * 2.2 + vp.phase) * 0.12;
      const pulse = 1.0 + Math.sin(elapsedTime * 2.5 + vp.phase) * 0.08;
      vp.pulseRing.scale.set(pulse, pulse, 1);
    }

    // 4. Update Trail Partikel Cahaya Pemandu Misi & Lentera Waktu (Zero-Allocation & Cached Elevation)
    let targetX = 0;
    let targetZ = 0;
    let hasTarget = false;
    let isTurnIn = false;

    if (questSystem) {
      const activeQuest = questSystem.getActiveQuest();
      if (activeQuest) {
        const canTurnIn = questSystem.canCompleteQuest(activeQuest.id);
        if (canTurnIn) {
          const npc = NPC_DATA.find((n) => n.id === activeQuest.npcId);
          if (npc) {
            targetX = npc.coords.x;
            targetZ = npc.coords.z;
            hasTarget = true;
            isTurnIn = true;
          }
        } else {
          // Cari artefak misi aktif yang belum dikoleksi tanpa alokasi array .filter()
          let closestRelic = null;
          let minD = Infinity;
          for (const a of this.artifactMeshes) {
            if (a.collected || !activeQuest.requiredRelics.includes(a.data.id)) continue;
            const dSq = (playerPos.x - a.data.coords.x) ** 2 + (playerPos.z - a.data.coords.z) ** 2;
            if (dSq < minD) {
              minD = dSq;
              closestRelic = a;
            }
          }
          if (closestRelic) {
            targetX = closestRelic.data.coords.x;
            targetZ = closestRelic.data.coords.z;
            hasTarget = true;
          }
        }
      }
    }

    // Fallback: Jika tidak ada misi khusus, pandu ke artefak terdekat di peta
    if (!hasTarget) {
      let closestArt = null;
      let minD = Infinity;
      for (const a of this.artifactMeshes) {
        if (a.collected) continue;
        const dSq = (playerPos.x - a.data.coords.x) ** 2 + (playerPos.z - a.data.coords.z) ** 2;
        if (dSq < minD) {
          minD = dSq;
          closestArt = a;
        }
      }
      if (closestArt) {
        targetX = closestArt.data.coords.x;
        targetZ = closestArt.data.coords.z;
        hasTarget = true;
      }
    }

    if (hasTarget && (this.isLanternActive || (questSystem && questSystem.activeQuestId))) {
      this.trailPoints.material.opacity = this.isLanternActive ? 0.92 : 0.42;

      // Recompute 32-point terrain elevation cache ONLY when player or target moves > 1.5m
      const playerMovedSq = (playerPos.x - this._lastTrailPlayerX) ** 2 + (playerPos.z - this._lastTrailPlayerZ) ** 2;
      const targetMovedSq = (targetX - this._lastTrailTargetX) ** 2 + (targetZ - this._lastTrailTargetZ) ** 2;

      if (playerMovedSq > 2.25 || targetMovedSq > 2.25) {
        this._lastTrailPlayerX = playerPos.x;
        this._lastTrailPlayerZ = playerPos.z;
        this._lastTrailTargetX = targetX;
        this._lastTrailTargetZ = targetZ;

        const samples = this._trailSampleCount;
        for (let s = 0; s <= samples; s++) {
          const st = s / samples;
          const sx = THREE.MathUtils.lerp(playerPos.x, targetX, st);
          const sz = THREE.MathUtils.lerp(playerPos.z, targetZ, st);
          this._trailHeightProfile[s] = getWalkableHeight(sx, sz);
        }
      }

      const posAttr = this.trailPoints.geometry.attributes.position;
      const colAttr = this.trailPoints.geometry.attributes.color;
      const count = posAttr.count;
      const maxIdx = this._trailSampleCount;

      const speed = isTurnIn ? 0.65 : 0.45;
      const rColor = isTurnIn ? 0.36 : 1.0;
      const gColor = isTurnIn ? 0.96 : 0.78;
      const bColor = isTurnIn ? 0.74 : 0.23;

      for (let i = 0; i < count; i++) {
        const t = (i / count + (elapsedTime * speed) % 1.0) % 1.0;
        const px = THREE.MathUtils.lerp(playerPos.x, targetX, t);
        const pz = THREE.MathUtils.lerp(playerPos.z, targetZ, t);

        // Interpolate terrain height from cached 32-segment lookup profile (0 fbmNoise calls!)
        const fIdx = t * maxIdx;
        const idx0 = Math.min(maxIdx - 1, Math.floor(fIdx));
        const frac = fIdx - idx0;
        const cachedGroundY = this._trailHeightProfile[idx0] * (1 - frac) + this._trailHeightProfile[idx0 + 1] * frac;
        const py = cachedGroundY + 0.32 + Math.sin(t * Math.PI) * 0.25;

        posAttr.setXYZ(i, px, py, pz);

        const fade = Math.sin(t * Math.PI);
        colAttr.setXYZ(i, rColor * fade, gColor * fade, bColor * fade);
      }
      posAttr.needsUpdate = true;
      colAttr.needsUpdate = true;
    } else {
      this.trailPoints.material.opacity = 0.0;
    }
  }
}
