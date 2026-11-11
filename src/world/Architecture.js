import * as THREE from 'three';
import { getTerrainHeight } from './Terrain.js';

export class ArchitectureSystem {
  constructor(scene) {
    this.scene = scene;
    this.animatedBanners = [];

    this.initSharedMaterials();
    this.buildRadenWijayaCamp();
    this.buildWringinLawangGate();
    this.buildPasarKotaraja();
    this.buildCandiBajangRatu();
    this.buildSanggarPujangga();
    this.buildBarakBhayangkara();
    this.buildKapalJungJawa();
    this.buildKedatonAgung();
  }

  initSharedMaterials() {
    this.matBrickRed = new THREE.MeshStandardMaterial({
      color: '#a33924',
      roughness: 0.85,
      flatShading: true
    });
    this.matBrickDark = new THREE.MeshStandardMaterial({
      color: '#6e2316',
      roughness: 0.88,
      flatShading: true
    });
    this.matBrickTrim = new THREE.MeshStandardMaterial({
      color: '#bf4e39',
      roughness: 0.8
    });
    this.matWood = new THREE.MeshStandardMaterial({
      color: '#5a3821',
      roughness: 0.78
    });
    this.matWoodDark = new THREE.MeshStandardMaterial({
      color: '#382213',
      roughness: 0.85
    });
    this.matThatch = new THREE.MeshStandardMaterial({
      color: '#826640',
      roughness: 0.95,
      flatShading: true
    });
    this.matStoneSteps = new THREE.MeshStandardMaterial({
      color: '#7a7065',
      roughness: 0.88,
      flatShading: true
    });
    this.matGold = new THREE.MeshStandardMaterial({
      color: '#f0be43',
      emissive: '#4d370b',
      roughness: 0.35,
      metalness: 0.75
    });
    this.matBronze = new THREE.MeshStandardMaterial({
      color: '#8f6d3a',
      roughness: 0.45,
      metalness: 0.65
    });
    this.matSail = new THREE.MeshStandardMaterial({
      color: '#ded1b6',
      side: THREE.DoubleSide,
      roughness: 0.9
    });
    this.matBannerRed = new THREE.MeshStandardMaterial({
      color: '#a82319',
      side: THREE.DoubleSide,
      roughness: 0.7
    });
    this.matBannerWhite = new THREE.MeshStandardMaterial({
      color: '#ede4d3',
      side: THREE.DoubleSide,
      roughness: 0.7
    });
  }

  // =========================================================================
  // ZONA 1: PERKEMAHAN RINTISAN RADEN WIJAYA (Hutan Tarik, x: -16, z: 120)
  // =========================================================================
  buildRadenWijayaCamp() {
    const x = -16;
    const z = 120;
    const y = getTerrainHeight(x, z);
    const camp = new THREE.Group();
    camp.position.set(x, y, z);

    // 1. Pondok Kayu Rintisan
    const floor = new THREE.Mesh(new THREE.BoxGeometry(7, 0.4, 6), this.matWood);
    floor.position.set(0, 0.7, 0);
    floor.castShadow = true;
    floor.receiveShadow = true;
    camp.add(floor);

    // 6 Tiang Penyangga
    const pillarPositions = [
      [-3.1, -2.6], [0, -2.6], [3.1, -2.6],
      [-3.1, 2.6], [0, 2.6], [3.1, 2.6]
    ];
    for (const [px, pz] of pillarPositions) {
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 3.6, 6), this.matWoodDark);
      p.position.set(px, 1.8, pz);
      p.castShadow = true;
      camp.add(p);
    }

    // Dinding Bilik Kayu Belakang & Samping
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(6.6, 2.4, 0.15), this.matWood);
    backWall.position.set(0, 2.1, -2.6);
    camp.add(backWall);

    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.15, 2.4, 3.2), this.matWood);
    leftWall.position.set(-3.1, 2.1, -1.0);
    camp.add(leftWall);

    // Atap Rumbia Miring (Limas Pelana)
    const roof = new THREE.Mesh(new THREE.ConeGeometry(5.2, 2.2, 4), this.matThatch);
    roof.position.set(0, 4.3, 0);
    roof.rotation.y = Math.PI / 4;
    roof.scale.set(1.1, 1, 0.9);
    roof.castShadow = true;
    camp.add(roof);

    // 2. Lumbung Padi Kuno (Pantangan Berpanggung)
    const granary = new THREE.Group();
    granary.position.set(6.5, 0, -2.5);

    for (const [gx, gz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 2.2, 6), this.matWoodDark);
      leg.position.set(gx, 1.1, gz);
      granary.add(leg);
    }
    const granaryBody = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.0, 2.6), this.matWood);
    granaryBody.position.y = 2.8;
    granary.add(granaryBody);

    const granaryRoof = new THREE.Mesh(new THREE.ConeGeometry(2.5, 1.6, 4), this.matThatch);
    granaryRoof.position.y = 4.4;
    granaryRoof.rotation.y = Math.PI / 4;
    granary.add(granaryRoof);
    camp.add(granary);

    // 3. Api Unggun Batu Kuno
    const fireBase = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.28, 8, 12), this.matStoneSteps);
    fireBase.rotation.x = Math.PI / 2;
    fireBase.position.set(0, 0.2, 4.8);
    camp.add(fireBase);

    const embers = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.9, 0.3, 8), this.matBrickDark);
    embers.position.set(0, 0.15, 4.8);
    camp.add(embers);

    this.scene.add(camp);
  }

  // =========================================================================
  // ZONA 2: GERBANG BENTAR WRINGIN LAWANG (x: 0, z: 38)
  // =========================================================================
  buildWringinLawangGate() {
    const x = 0;
    const z = 38;
    const y = getTerrainHeight(x, z);
    const gateGroup = new THREE.Group();
    gateGroup.position.set(x, y, z);

    // Candi Bentar terdiri dari 2 menara kembar terbelah (sayap barat & timur)
    const halfWidth = 2.8;
    const halfDepth = 3.6;
    const gap = 3.8; // Lebar jalan di antara gerbang

    [-1, 1].forEach((side) => {
      const tower = new THREE.Group();
      tower.position.set(side * (gap * 0.5 + halfWidth * 0.5), 0, 0);

      // Kaki Candi (Batur Berundak)
      const base1 = new THREE.Mesh(new THREE.BoxGeometry(halfWidth + 0.8, 1.4, halfDepth + 0.8), this.matBrickDark);
      base1.position.y = 0.7;
      base1.castShadow = true;
      tower.add(base1);

      const base2 = new THREE.Mesh(new THREE.BoxGeometry(halfWidth + 0.4, 1.2, halfDepth + 0.4), this.matBrickRed);
      base2.position.y = 1.9;
      base2.castShadow = true;
      tower.add(base2);

      // Tubuh Candi Bertingkat dengan Profil Khas Trowulan
      const body1 = new THREE.Mesh(new THREE.BoxGeometry(halfWidth, 3.8, halfDepth), this.matBrickRed);
      body1.position.y = 4.3;
      body1.castShadow = true;
      tower.add(body1);

      const trim1 = new THREE.Mesh(new THREE.BoxGeometry(halfWidth + 0.3, 0.4, halfDepth + 0.3), this.matBrickTrim);
      trim1.position.y = 6.3;
      tower.add(trim1);

      // Puncak Menara Berundak Piramidal
      const tiers = [
        { w: halfWidth - 0.3, h: 2.2, d: halfDepth - 0.4, y: 7.5 },
        { w: halfWidth - 0.8, h: 2.0, d: halfDepth - 0.9, y: 9.5 },
        { w: halfWidth - 1.4, h: 1.8, d: halfDepth - 1.5, y: 11.3 },
        { w: halfWidth - 1.9, h: 1.6, d: halfDepth - 2.1, y: 12.9 }
      ];

      for (const t of tiers) {
        const tierMesh = new THREE.Mesh(new THREE.BoxGeometry(t.w, t.h, t.d), this.matBrickRed);
        tierMesh.position.y = t.y;
        tierMesh.castShadow = true;
        tower.add(tierMesh);

        const edgeTrim = new THREE.Mesh(new THREE.BoxGeometry(t.w + 0.2, 0.25, t.d + 0.2), this.matBrickTrim);
        edgeTrim.position.y = t.y + t.h * 0.5;
        tower.add(edgeTrim);
      }

      // Mahkota Kemuncak Puncak (Mastaka Candi Bentar)
      const finial = new THREE.Mesh(new THREE.OctahedronGeometry(0.45, 0), this.matGold);
      finial.position.y = 14.1;
      tower.add(finial);

      gateGroup.add(tower);
    });

    // Lantai Paving Bata Merah di Antara Gerbang
    const roadFloor = new THREE.Mesh(new THREE.BoxGeometry(gap + 0.6, 0.3, halfDepth + 2.4), this.matBrickDark);
    roadFloor.position.set(0, 0.15, 0);
    roadFloor.receiveShadow = true;
    gateGroup.add(roadFloor);

    this.scene.add(gateGroup);
  }

  // =========================================================================
  // ZONA 2: PASAR KOTARAJA (x: 18, z: 12)
  // =========================================================================
  buildPasarKotaraja() {
    const market = new THREE.Group();
    const stalls = [
      { x: 14, z: 8, rot: 0.2, title: 'Rempah Maluku (Pala & Cengkeh)' },
      { x: 22, z: 7, rot: -0.15, title: 'Kain Tenun & Sutra' },
      { x: 15, z: 17, rot: 0.1, title: 'Gerabah & Celengan Terakota' },
      { x: 23, z: 16, rot: -0.25, title: 'Tukar Koin Gobog & Perhiasan' }
    ];

    stalls.forEach((s, idx) => {
      const sy = getTerrainHeight(s.x, s.z);
      const stallGroup = new THREE.Group();
      stallGroup.position.set(s.x, sy, s.z);
      stallGroup.rotation.y = s.rot;

      // Meja Kayu Dagang
      const table = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.8, 1.8), this.matWood);
      table.position.y = 0.45;
      table.castShadow = true;
      stallGroup.add(table);

      // 4 Tiang Bambu Kanopi
      for (const [px, pz] of [[-1.7, -0.8], [1.7, -0.8], [-1.7, 0.8], [1.7, 0.8]]) {
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 2.8, 6), this.matWoodDark);
        pole.position.set(px, 1.4, pz);
        stallGroup.add(pole);
      }

      // Atap Miring Kain Terpal / Jerami
      const roofMat = idx % 2 === 0 ? this.matBannerRed : this.matThatch;
      const roof = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.12, 2.6), roofMat);
      roof.position.set(0, 2.8, 0.2);
      roof.rotation.x = 0.22;
      roof.castShadow = true;
      stallGroup.add(roof);

      // Komoditas Dagangan di Meja
      if (idx === 0) {
        // Karung rempah pala & cengkeh
        for (let b = -1.1; b <= 1.1; b += 0.75) {
          const sack = new THREE.Mesh(new THREE.DodecahedronGeometry(0.35, 1), this.matThatch);
          sack.position.set(b, 0.95, 0.1);
          sack.scale.y = 1.25;
          stallGroup.add(sack);
        }
      } else if (idx === 2) {
        // Tempayan & Celengan Babi Terakota Khas Trowulan
        for (let j = -1.2; j <= 1.2; j += 0.8) {
          const jar = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.32, 0.65, 8), this.matBrickRed);
          jar.position.set(j, 1.05, 0.1);
          stallGroup.add(jar);
        }
      } else if (idx === 3) {
        // Koin Gobog Perunggu Berlubang
        const coinBox = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.25, 0.85), this.matWoodDark);
        coinBox.position.set(0, 0.95, 0);
        stallGroup.add(coinBox);

        for (let c = 0; c < 5; c++) {
          const coin = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.04, 10), this.matBronze);
          coin.position.set((c - 2) * 0.14, 1.12, 0);
          stallGroup.add(coin);
        }
      }

      market.add(stallGroup);
    });

    this.scene.add(market);
  }

  // =========================================================================
  // ZONA 3: CANDI BAJANG RATU (Paduraksa Bertingkat, x: 108, z: -10)
  // =========================================================================
  buildCandiBajangRatu() {
    const x = 108;
    const z = -10;
    const y = getTerrainHeight(x, z); // 9.8m di atas pelataran bukit timur
    const candi = new THREE.Group();
    candi.position.set(x, y, z);

    // 1. Kaki Candi (Batur Bawah Berundak hingga tinggi teras 3.6m)
    const base1 = new THREE.Mesh(new THREE.BoxGeometry(11.5, 2.2, 11.5), this.matBrickDark);
    base1.position.y = 1.1;
    base1.castShadow = true;
    base1.receiveShadow = true;
    candi.add(base1);

    const base2 = new THREE.Mesh(new THREE.BoxGeometry(10.2, 1.4, 10.2), this.matBrickRed);
    base2.position.y = 2.9;
    base2.castShadow = true;
    base2.receiveShadow = true;
    candi.add(base2);

    // 2. Tangga Barat & Tangga Timur yang Menghadap Turun ke Tanah (Bisa Dinaiki!)
    // Anak tangga dari tanah bawah (y: 0.18m di x: -13.2) mendaki NAIK ke teras candi (y: 3.45m di x: -5.2)
    for (let s = 0; s < 10; s++) {
      const stepY = 0.18 + s * 0.36;
      const stepOffset = 13.2 - s * 0.88;

      // Tangga Barat (menghadap jalan dari Kotaraja)
      const stepWest = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.38, 4.6), this.matStoneSteps);
      stepWest.position.set(-stepOffset, stepY, 0);
      stepWest.castShadow = true;
      stepWest.receiveShadow = true;
      candi.add(stepWest);

      // Tangga Timur (menurun ke arah Sanggar Pujangga Mpu Prapanca)
      const stepEast = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.38, 4.6), this.matStoneSteps);
      stepEast.position.set(stepOffset, stepY, 0);
      stepEast.castShadow = true;
      stepEast.receiveShadow = true;
      candi.add(stepEast);
    }

    // Pagar Pembatas Tangga (Pipi Tangga Candi) miring dari tanah bawah naik ke tubuh candi
    for (const side of [-2.45, 2.45]) {
      // Pipi tangga barat (miring naik ke arah timur / +X)
      const wingWest = new THREE.Mesh(new THREE.BoxGeometry(9.2, 1.3, 0.45), this.matBrickRed);
      wingWest.position.set(-9.2, 1.9, side);
      wingWest.rotation.z = 0.39;
      wingWest.castShadow = true;
      candi.add(wingWest);

      // Pipi tangga timur (miring turun ke arah timur / +X)
      const wingEast = new THREE.Mesh(new THREE.BoxGeometry(9.2, 1.3, 0.45), this.matBrickRed);
      wingEast.position.set(9.2, 1.9, side);
      wingEast.rotation.z = -0.39;
      wingEast.castShadow = true;
      candi.add(wingEast);
    }

    // 3. Tubuh Candi Paduraksa dengan Lorong Tembus (Archway Corridor)
    // Sisi Utara & Selatan lorong
    for (const side of [-1, 1]) {
      const wallPillar = new THREE.Mesh(new THREE.BoxGeometry(8.8, 5.5, 2.6), this.matBrickRed);
      wallPillar.position.set(0, 6.4, side * 3.2);
      wallPillar.castShadow = true;
      candi.add(wallPillar);
    }

    // Balok Ambang Pintu Atas (Lintel) dengan Relief Kala Emas
    const lintel = new THREE.Mesh(new THREE.BoxGeometry(8.8, 1.4, 4.2), this.matBrickTrim);
    lintel.position.set(0, 9.6, 0);
    lintel.castShadow = true;
    candi.add(lintel);

    // Relief Kepala Kala Pelindung di atas lorong
    const kalaHead = new THREE.Mesh(new THREE.DodecahedronGeometry(0.85, 1), this.matGold);
    kalaHead.position.set(-4.5, 9.6, 0);
    kalaHead.scale.set(0.6, 1.0, 1.2);
    candi.add(kalaHead);

    // 4. Atap Piramidal Bertingkat Sembilan (Khas Paduraksa Majapahit)
    const roofTiers = [
      { w: 8.2, h: 1.8, d: 8.2, y: 10.9 },
      { w: 7.0, h: 1.6, d: 7.0, y: 12.4 },
      { w: 5.8, h: 1.5, d: 5.8, y: 13.8 },
      { w: 4.6, h: 1.4, d: 4.6, y: 15.1 },
      { w: 3.4, h: 1.3, d: 3.4, y: 16.3 },
      { w: 2.2, h: 1.2, d: 2.2, y: 17.4 }
    ];

    for (const rt of roofTiers) {
      const roofMesh = new THREE.Mesh(new THREE.BoxGeometry(rt.w, rt.h, rt.d), this.matBrickRed);
      roofMesh.position.y = rt.y;
      roofMesh.castShadow = true;
      candi.add(roofMesh);

      const roofTrim = new THREE.Mesh(new THREE.BoxGeometry(rt.w + 0.3, 0.25, rt.d + 0.3), this.matBrickTrim);
      roofTrim.position.y = rt.y + rt.h * 0.5;
      candi.add(roofTrim);
    }

    // Mahkota Kemuncak Utama (Mastaka Emas Bajang Ratu)
    const topPinnacle = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.7, 2.2, 8), this.matGold);
    topPinnacle.position.y = 18.8;
    candi.add(topPinnacle);

    this.scene.add(candi);
  }

  // =========================================================================
  // ZONA 3: SANGGAR PUJANGGA (Mpu Prapanca & Mpu Tantular, x: 126, z: -14)
  // =========================================================================
  buildSanggarPujangga() {
    const x = 126;
    const z = -14;
    const y = getTerrainHeight(x, z);
    const studio = new THREE.Group();
    studio.position.set(x, y, z);

    // Panggung Kayu Pendopo
    const stage = new THREE.Mesh(new THREE.BoxGeometry(9, 0.6, 7), this.matWood);
    stage.position.y = 0.3;
    stage.castShadow = true;
    studio.add(stage);

    // Tiang Kayu Ukir
    for (const [px, pz] of [[-3.8, -2.8], [3.8, -2.8], [-3.8, 2.8], [3.8, 2.8], [0, -2.8], [0, 2.8]]) {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 3.8, 8), this.matWoodDark);
      col.position.set(px, 2.2, pz);
      col.castShadow = true;
      studio.add(col);
    }

    // Atap Joglo Limasan Ijuk/Jerami
    const roof = new THREE.Mesh(new THREE.ConeGeometry(6.5, 2.8, 4), this.matThatch);
    roof.position.set(0, 4.8, 0);
    roof.rotation.y = Math.PI / 4;
    roof.scale.set(1.15, 1.0, 0.95);
    roof.castShadow = true;
    studio.add(roof);

    // Meja Menulis Daun Lontar (Meja Pujangga)
    const desk = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.45, 1.4), this.matWoodDark);
    desk.position.set(0, 0.8, -0.6);
    studio.add(desk);

    // Gulungan-gulungan naskah Lontar
    for (let l = -1.4; l <= 1.4; l += 0.7) {
      const lontar = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.8, 8), this.matSail);
      lontar.rotation.z = Math.PI / 2;
      lontar.position.set(l, 1.1, -0.6);
      studio.add(lontar);
    }

    this.scene.add(studio);
  }

  // =========================================================================
  // ZONA 4: BARAK PASUKAN ELIT BHAYANGKARA (x: -98, z: 14)
  // =========================================================================
  buildBarakBhayangkara() {
    const x = -98;
    const z = 14;
    const y = getTerrainHeight(x, z);
    const barak = new THREE.Group();
    barak.position.set(x, y, z);

    // Bangunan Markas Militer Bata Merah Kokoh
    const mainHall = new THREE.Mesh(new THREE.BoxGeometry(14, 4.5, 9), this.matBrickRed);
    mainHall.position.y = 2.25;
    mainHall.castShadow = true;
    barak.add(mainHall);

    // Atap Pelana Bata Merah
    const roof = new THREE.Mesh(new THREE.ConeGeometry(9.2, 3.2, 4), this.matBrickDark);
    roof.position.y = 5.8;
    roof.rotation.y = Math.PI / 4;
    roof.scale.set(1.25, 0.9, 0.85);
    barak.add(roof);

    // Rak Tombak Prajurit di Pelataran Luar
    for (const side of [-4.5, 4.5]) {
      const rack = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.25, 0.6), this.matWoodDark);
      rack.position.set(side, 0.4, 5.2);
      barak.add(rack);

      for (let s = -0.9; s <= 0.9; s += 0.45) {
        const spear = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 3.4, 6), this.matWoodDark);
        spear.position.set(side + s, 1.8, 5.2);
        barak.add(spear);

        const spearTip = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.4, 6), this.matBronze);
        spearTip.position.set(side + s, 3.6, 5.2);
        barak.add(spearTip);
      }
    }

    // Dua Unit Meriam Putar Cetbang Khas Majapahit
    for (const side of [-6.2, 6.2]) {
      const cetbangGroup = new THREE.Group();
      cetbangGroup.position.set(side, 0.5, 6.8);
      cetbangGroup.rotation.y = Math.PI * 0.9;

      // Dudukan Pivot Kayu
      const pivot = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.9, 0.7), this.matWoodDark);
      pivot.position.y = 0.45;
      cetbangGroup.add(pivot);

      // Laras Meriam Perunggu
      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.25, 2.4, 10), this.matBronze);
      barrel.rotation.x = Math.PI / 2;
      barrel.position.set(0, 1.05, 0.4);
      barrel.castShadow = true;
      cetbangGroup.add(barrel);

      barak.add(cetbangGroup);
    }

    this.scene.add(barak);
  }

  // =========================================================================
  // ZONA 4: KAPAL LAYAR JUNG JAWA RAKSASA (x: -128, z: 19)
  // =========================================================================
  buildKapalJungJawa() {
    const x = -128;
    const z = 19;
    const y = 0.35; // Mengapung di kanal air pelabuhan barat
    const ship = new THREE.Group();
    ship.position.set(x, y, z);

    // 1. Lambung Utama Kayu Jati Ganda (Double-planked Teak Hull)
    const hullMat = this.matWoodDark;

    // Bagian Tengah Lambung
    const midHull = new THREE.Mesh(new THREE.BoxGeometry(18, 4.2, 9.5), hullMat);
    midHull.position.set(0, 1.4, 0);
    midHull.castShadow = true;
    ship.add(midHull);

    // Haluan Kapal (Bow - Moncong Depan Melengkung ke arah Z positif)
    const bow = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 4.8, 8.5, 4), hullMat);
    bow.position.set(11.5, 1.8, 0);
    bow.rotation.z = -Math.PI / 2;
    bow.scale.set(0.85, 1.0, 1.05);
    ship.add(bow);

    // Buritan Kapal Bertingkat (Poop Deck)
    const stern = new THREE.Mesh(new THREE.BoxGeometry(7.2, 5.8, 9.2), hullMat);
    stern.position.set(-10.8, 2.4, 0);
    stern.castShadow = true;
    ship.add(stern);

    // 2. Titian Penghubung (Gangway) dari Dermaga ke Geladak Kapal
    const gangway = new THREE.Mesh(new THREE.BoxGeometry(6.2, 0.3, 2.2), this.matWood);
    gangway.position.set(9.5, 2.2, 5.2);
    gangway.rotation.y = -0.35;
    gangway.rotation.x = -0.16;
    gangway.castShadow = true;
    ship.add(gangway);

    // 3. Tiga Tiang Layar Tanja (Fore, Main, Mizzen Mast)
    const masts = [
      { x: 5.5, h: 18, radius: 0.32, sailW: 8.5, sailH: 9.5 },
      { x: -1.2, h: 22, radius: 0.42, sailW: 10.5, sailH: 12.0 },
      { x: -8.5, h: 16, radius: 0.30, sailW: 7.2, sailH: 8.0 }
    ];

    masts.forEach((m, idx) => {
      // Tiang Utama Kayu
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(m.radius * 0.7, m.radius, m.h, 8), this.matWood);
      pole.position.set(m.x, m.h * 0.5 + 2.8, 0);
      pole.castShadow = true;
      ship.add(pole);

      // Layar Tanja Anyaman Tradisional
      const sail = new THREE.Mesh(new THREE.PlaneGeometry(m.sailW, m.sailH), this.matSail);
      sail.position.set(m.x + 0.3, m.h * 0.5 + 4.2, 0);
      sail.rotation.y = Math.PI / 2 + 0.18;
      sail.rotation.z = -0.12; // Sudut miring khas Tanja Nusantara
      sail.castShadow = true;
      ship.add(sail);
      this.animatedBanners.push({ mesh: sail, phase: idx * 1.5 });

      // Panji Bendera Gula Kelapa (Merah Putih Majapahit) di Puncak Tiang
      const flagGeo = new THREE.PlaneGeometry(2.4, 1.2, 6, 2);
      const flag = new THREE.Mesh(flagGeo, this.matBannerRed);
      flag.position.set(m.x + 1.2, m.h + 2.8, 0);
      flag.rotation.y = Math.PI / 2;
      ship.add(flag);
      this.animatedBanners.push({ mesh: flag, phase: idx * 2.2 });
    });

    this.scene.add(ship);
  }

  // =========================================================================
  // ZONA 5: KEDATON AGUNG & BALAIRUNG PENDOPO KENCANA (x: 0, z: -115)
  // =========================================================================
  buildKedatonAgung() {
    const kedaton = new THREE.Group();
    const cx = 0;
    const cz = -115;
    const cy = 3.6; // Elevasi dataran istana
    kedaton.position.set(cx, cy, cz);

    // 1. Tembok Benteng Bata Merah Melingkari Kedaton
    const wallHeight = 4.8;
    const wallThick = 2.4;
    const wallBounds = [
      { x: 0, z: -48, w: 92, d: wallThick },   // Tembok Utara
      { x: -45, z: 0, w: wallThick, d: 96 },   // Tembok Barat
      { x: 45, z: 0, w: wallThick, d: 96 },    // Tembok Timur
      { x: -28, z: 42, w: 38, d: wallThick },  // Tembok Selatan Kiri
      { x: 28, z: 42, w: 38, d: wallThick }    // Tembok Selatan Kanan
    ];

    wallBounds.forEach((wb) => {
      const wall = new THREE.Mesh(new THREE.BoxGeometry(wb.w, wallHeight, wb.d), this.matBrickRed);
      wall.position.set(wb.x, wallHeight * 0.5, wb.z);
      wall.castShadow = true;
      wall.receiveShadow = true;
      kedaton.add(wall);

      // Puncak tepi benteng (Crenellations)
      const cap = new THREE.Mesh(new THREE.BoxGeometry(wb.w + 0.3, 0.4, wb.d + 0.3), this.matBrickTrim);
      cap.position.set(wb.x, wallHeight + 0.2, wb.z);
      kedaton.add(cap);
    });

    // Menara Sudut Benteng Kedaton (Bastion Menara Pengawas)
    const corners = [
      [-45, -48], [45, -48],
      [-45, 42], [45, 42]
    ];
    corners.forEach(([kx, kz]) => {
      const tower = new THREE.Mesh(new THREE.BoxGeometry(4.8, 7.5, 4.8), this.matBrickDark);
      tower.position.set(kx, 3.75, kz);
      tower.castShadow = true;
      kedaton.add(tower);

      const roof = new THREE.Mesh(new THREE.ConeGeometry(3.6, 2.6, 4), this.matBrickTrim);
      roof.position.set(kx, 8.8, kz);
      roof.rotation.y = Math.PI / 4;
      kedaton.add(roof);
    });

    // 2. Gerbang Paduraksa Kencana Kedaton di Tembok Selatan (x: 0, z: 42) - Lorong Terbuka Lebar!
    for (const side of [-1, 1]) {
      const gatePillar = new THREE.Mesh(new THREE.BoxGeometry(4.6, 8.2, 4.2), this.matBrickRed);
      gatePillar.position.set(side * 6.5, 4.1, 42);
      gatePillar.castShadow = true;
      gatePillar.receiveShadow = true;
      kedaton.add(gatePillar);
    }

    // Ambang Atas & Atap Paduraksa Gerbang Selatan (Tinggi di atas kepala pemain agar bebas lewat)
    const gateLintel = new THREE.Mesh(new THREE.BoxGeometry(18.0, 2.4, 4.6), this.matBrickRed);
    gateLintel.position.set(0, 8.8, 42);
    gateLintel.castShadow = true;
    kedaton.add(gateLintel);

    const gateRoofTop = new THREE.Mesh(new THREE.BoxGeometry(13.5, 1.8, 3.8), this.matBrickDark);
    gateRoofTop.position.set(0, 10.8, 42);
    kedaton.add(gateRoofTop);

    const gateArchTrim = new THREE.Mesh(new THREE.BoxGeometry(18.4, 0.7, 4.9), this.matGold);
    gateArchTrim.position.set(0, 7.6, 42);
    kedaton.add(gateArchTrim);

    // 3. Balairung Pendopo Kencana (Pusat Istana Singgasana Hayam Wuruk)
    // Lantai Panggung Marmer Bata Merah Terakota
    const stage = new THREE.Mesh(new THREE.BoxGeometry(26, 1.0, 20), this.matBrickDark);
    stage.position.set(0, 0.5, 0);
    stage.receiveShadow = true;
    kedaton.add(stage);

    const stageFloor = new THREE.Mesh(new THREE.BoxGeometry(24.5, 0.15, 18.5), this.matBrickTrim);
    stageFloor.position.set(0, 1.08, 0);
    kedaton.add(stageFloor);

    // Tangga Utama Naik ke Balairung Pendopo (Sisi Selatan z: 10..14)
    for (let s = 0; s < 4; s++) {
      const pStep = new THREE.Mesh(new THREE.BoxGeometry(9.5, 0.26, 1.1), this.matStoneSteps);
      pStep.position.set(0, 0.13 + s * 0.25, 13.5 - s * 1.0);
      pStep.receiveShadow = true;
      kedaton.add(pStep);
    }

    // 16 Pilar Kayu Jati Emas (Soko Guru)
    const pillarGrid = [];
    for (let px = -10.5; px <= 10.5; px += 7.0) {
      for (let pz = -7.5; pz <= 7.5; pz += 5.0) {
        pillarGrid.push([px, pz]);
      }
    }

    pillarGrid.forEach(([px, pz]) => {
      const isInner = Math.abs(px) < 5 && Math.abs(pz) < 4;
      const colHeight = isInner ? 7.8 : 5.8;
      const pillar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.28, 0.36, colHeight, 8),
        isInner ? this.matGold : this.matWoodDark
      );
      pillar.position.set(px, 1.0 + colHeight * 0.5, pz);
      pillar.castShadow = true;
      kedaton.add(pillar);
    });

    // Atap Tumpuk Tiga (Tajug / Meru Kencana)
    const roofTiers = [
      { w: 28, h: 2.8, d: 22, y: 7.2, mat: this.matThatch },
      { w: 20, h: 2.6, d: 15, y: 9.6, mat: this.matThatch },
      { w: 12, h: 3.2, d: 9, y: 12.2, mat: this.matBrickTrim }
    ];

    roofTiers.forEach((rt) => {
      const r = new THREE.Mesh(new THREE.ConeGeometry(rt.w * 0.5, rt.h, 4), rt.mat);
      r.position.set(0, rt.y, 0);
      r.rotation.y = Math.PI / 4;
      r.scale.set(1.2, 1.0, 0.9);
      r.castShadow = true;
      kedaton.add(r);
    });

    // Mastaka Surya Majapahit Emas di Puncak Atap Kedaton
    const crown = new THREE.Mesh(new THREE.OctahedronGeometry(1.2, 0), this.matGold);
    crown.position.set(0, 14.8, 0);
    kedaton.add(crown);

    // 4. Singgasana Emas Raja Hayam Wuruk (Di Ujung Utara Pendopo)
    const throneGroup = new THREE.Group();
    throneGroup.position.set(0, 1.1, -6.5);

    // Batur Panggung Kursi
    const throneBase = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.7, 3.2), this.matGold);
    throneBase.position.y = 0.35;
    throneGroup.add(throneBase);

    // Sandaran Kursi Megah Berlambang Surya Majapahit
    const backRest = new THREE.Mesh(new THREE.BoxGeometry(3.2, 2.6, 0.4), this.matBrickRed);
    backRest.position.set(0, 1.8, -1.2);
    throneGroup.add(backRest);

    // Lambang Surya Majapahit Emas Bercahaya
    const sunEmblem = new THREE.Mesh(new THREE.OctahedronGeometry(0.85, 0), this.matGold);
    sunEmblem.position.set(0, 2.4, -0.9);
    throneGroup.add(sunEmblem);

    const throneLight = new THREE.PointLight('#ffd269', 1.8, 18, 1.5);
    throneLight.position.set(0, 2.5, 0);
    throneGroup.add(throneLight);

    // Payung Upacara Kerajaan Kembar (Payung Kencana Merah Emas)
    for (const side of [-2.4, 2.4]) {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 4.2, 6), this.matWoodDark);
      pole.position.set(side, 2.1, -1.1);
      throneGroup.add(pole);

      const umbrella = new THREE.Mesh(new THREE.ConeGeometry(1.2, 0.45, 12), this.matBannerRed);
      umbrella.position.set(side, 4.1, -1.1);
      throneGroup.add(umbrella);
    }

    kedaton.add(throneGroup);

    this.scene.add(kedaton);
  }

  update(elapsedTime) {
    // Animasi kibaran layar kapal Jung dan panji bendera Majapahit
    for (const b of this.animatedBanners) {
      const flutter = Math.sin(elapsedTime * 3.2 + b.phase) * 0.06;
      b.mesh.rotation.z += flutter * 0.01;
    }
  }
}
