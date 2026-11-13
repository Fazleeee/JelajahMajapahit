import * as THREE from 'three';
import { getTerrainHeight } from './Terrain.js';

export class ArchitectureSystem {
  constructor(scene) {
    this.scene = scene;
    this.animatedBanners = [];
    this.animatedFlames = [];
    this.shipGroup = null;

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
    this.matHullPlank = new THREE.MeshStandardMaterial({
      color: '#4f2f18',
      roughness: 0.74,
      flatShading: true,
      side: THREE.DoubleSide
    });
    this.matDeckPlank = new THREE.MeshStandardMaterial({
      color: '#784c2b',
      roughness: 0.76,
      flatShading: true
    });
    this.matRope = new THREE.MeshStandardMaterial({
      color: '#9c8359',
      roughness: 0.92
    });
    this.matLanternGlow = new THREE.MeshStandardMaterial({
      color: '#ffdf85',
      emissive: '#ff9624',
      emissiveIntensity: 1.5,
      roughness: 0.3
    });
    this.matFabricBlue = new THREE.MeshStandardMaterial({
      color: '#265c78',
      roughness: 0.72
    });
    this.matFlameOuter = new THREE.MeshBasicMaterial({
      color: '#ff6a1a',
      transparent: true,
      opacity: 0.88
    });
    this.matFlameInner = new THREE.MeshBasicMaterial({
      color: '#ffe57f',
      transparent: true,
      opacity: 0.95
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

    // 1. Pondok Kayu Rintisan (Batur Panggung + Tangga Kayu + Atap Pelana Bertingkat)
    const floor = new THREE.Mesh(new THREE.BoxGeometry(7, 0.45, 6), this.matWood);
    floor.position.set(0, 0.52, 0);
    floor.castShadow = true;
    floor.receiveShadow = true;
    camp.add(floor);

    for (let s = 0; s < 3; s++) {
      const step = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.2, 0.55), this.matWoodDark);
      step.position.set(0, 0.1 + s * 0.22, 3.85 - s * 0.45);
      step.castShadow = true;
      camp.add(step);
    }

    // 6 Tiang Penyangga
    const pillarPositions = [
      [-3.1, -2.6], [0, -2.6], [3.1, -2.6],
      [-3.1, 2.6], [0, 2.6], [3.1, 2.6]
    ];
    for (const [px, pz] of pillarPositions) {
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.24, 3.6, 8), this.matWoodDark);
      p.position.set(px, 1.8, pz);
      p.castShadow = true;
      camp.add(p);
    }

    // Dinding Bilik Kayu Belakang & Samping
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(6.6, 2.4, 0.15), this.matWood);
    backWall.position.set(0, 2.0, -2.6);
    camp.add(backWall);

    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.15, 2.4, 3.2), this.matWood);
    leftWall.position.set(-3.1, 2.0, -1.0);
    camp.add(leftWall);

    // Atap Rumbia Berundak + Balok Bubungan
    const roof = new THREE.Mesh(new THREE.ConeGeometry(5.4, 2.3, 4), this.matThatch);
    roof.position.set(0, 4.35, 0);
    roof.rotation.y = Math.PI / 4;
    roof.scale.set(1.12, 1, 0.92);
    roof.castShadow = true;
    camp.add(roof);

    const ridge = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 2.8, 8), this.matWoodDark);
    ridge.rotation.z = Math.PI / 2;
    ridge.position.set(0, 5.42, 0);
    camp.add(ridge);

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

    // 3. Api Unggun Batu Kuno + Nyala Api & Kuali Memasak
    const fireBase = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.28, 8, 12), this.matStoneSteps);
    fireBase.rotation.x = Math.PI / 2;
    fireBase.position.set(0, 0.2, 4.8);
    camp.add(fireBase);

    const embers = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.9, 0.3, 8), this.matBrickDark);
    embers.position.set(0, 0.15, 4.8);
    camp.add(embers);

    // Kayu bakar menyilang
    for (let k = 0; k < 3; k++) {
      const log = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 1.4, 6), this.matWoodDark);
      log.position.set(0, 0.34, 4.8);
      log.rotation.z = Math.PI / 2 - 0.35;
      log.rotation.y = (k / 3) * Math.PI;
      camp.add(log);
    }

    // Nyala api hidup (animated in update)
    const flameGroup = new THREE.Group();
    flameGroup.position.set(0, 0.32, 4.8);
    const outerFlame = new THREE.Mesh(new THREE.ConeGeometry(0.45, 1.25, 7), this.matFlameOuter);
    outerFlame.position.y = 0.55;
    flameGroup.add(outerFlame);
    const innerFlame = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.85, 6), this.matFlameInner);
    innerFlame.position.y = 0.42;
    flameGroup.add(innerFlame);
    camp.add(flameGroup);
    this.animatedFlames.push({ mesh: flameGroup, phase: 0.4 });

    // Kaki tiga bambu + periuk perunggu
    for (let t = 0; t < 3; t++) {
      const ang = (t / 3) * Math.PI * 2;
      const tripodLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 2.35, 6), this.matWoodDark);
      tripodLeg.position.set(Math.cos(ang) * 0.55, 1.05, 4.8 + Math.sin(ang) * 0.55);
      tripodLeg.rotation.set(Math.sin(ang) * 0.38, 0, -Math.cos(ang) * 0.38);
      camp.add(tripodLeg);
    }
    const pot = new THREE.Mesh(new THREE.SphereGeometry(0.36, 10, 8), this.matBronze);
    pot.position.set(0, 1.38, 4.8);
    pot.scale.y = 0.82;
    camp.add(pot);

    // Lentera gantung di teras pondok
    const campLantern = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.12, 0.34, 6), this.matLanternGlow);
    campLantern.position.set(2.2, 2.85, 2.7);
    camp.add(campLantern);

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

      // Tubuh Candi Bertingkat dengan Penampil Silang (Cruciform) & Antefix Sudut Khas Trowulan
      const body1 = new THREE.Mesh(new THREE.BoxGeometry(halfWidth, 3.8, halfDepth), this.matBrickRed);
      body1.position.y = 4.3;
      body1.castShadow = true;
      tower.add(body1);

      // Penampil Depan/Belakang & Luar agar tidak seperti balok polos
      const penampilZ = new THREE.Mesh(new THREE.BoxGeometry(halfWidth * 0.55, 3.6, halfDepth + 0.48), this.matBrickDark);
      penampilZ.position.y = 4.25;
      tower.add(penampilZ);

      const trim1 = new THREE.Mesh(new THREE.BoxGeometry(halfWidth + 0.35, 0.4, halfDepth + 0.35), this.matBrickTrim);
      trim1.position.y = 6.3;
      tower.add(trim1);

      // Puncak Menara Berundak Piramidal + Menara Kecil Antefix Sudut
      const tiers = [
        { w: halfWidth - 0.3, h: 2.2, d: halfDepth - 0.4, y: 7.5 },
        { w: halfWidth - 0.8, h: 2.0, d: halfDepth - 0.9, y: 9.5 },
        { w: halfWidth - 1.4, h: 1.8, d: halfDepth - 1.5, y: 11.3 },
        { w: halfWidth - 1.9, h: 1.6, d: halfDepth - 2.1, y: 12.9 }
      ];

      tiers.forEach((t, ti) => {
        const tierMesh = new THREE.Mesh(new THREE.BoxGeometry(t.w, t.h, t.d), this.matBrickRed);
        tierMesh.position.y = t.y;
        tierMesh.castShadow = true;
        tower.add(tierMesh);

        // Relung bayangan penampil tengah tiap tingkat
        const wingMesh = new THREE.Mesh(new THREE.BoxGeometry(t.w * 0.52, t.h * 0.92, t.d + 0.28), this.matBrickDark);
        wingMesh.position.y = t.y;
        tower.add(wingMesh);

        const edgeTrim = new THREE.Mesh(new THREE.BoxGeometry(t.w + 0.24, 0.25, t.d + 0.24), this.matBrickTrim);
        edgeTrim.position.y = t.y + t.h * 0.5;
        tower.add(edgeTrim);

        // Antefix Ratna pada keempat sudut tingkat 0 & 1
        if (ti <= 1) {
          for (const sx of [-1, 1]) {
            for (const sz of [-1, 1]) {
              const antefix = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.62, 5), this.matBrickTrim);
              antefix.position.set(sx * (t.w * 0.48), t.y + t.h * 0.5 + 0.32, sz * (t.d * 0.48));
              tower.add(antefix);
            }
          }
        }
      });

      // Padmasana Teratai + Mahkota Kemuncak Puncak (Mastaka Candi Bentar)
      const lotusBase = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.56, 0.45, 8), this.matBrickTrim);
      lotusBase.position.y = 13.9;
      tower.add(lotusBase);

      const finial = new THREE.Mesh(new THREE.ConeGeometry(0.32, 1.15, 6), this.matGold);
      finial.position.y = 14.55;
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

      // Meja Kayu Dagang dengan Bingkai Lis
      const table = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.78, 1.8), this.matWood);
      table.position.y = 0.42;
      table.castShadow = true;
      stallGroup.add(table);

      const tableRim = new THREE.Mesh(new THREE.BoxGeometry(3.78, 0.1, 1.96), this.matWoodDark);
      tableRim.position.y = 0.84;
      stallGroup.add(tableRim);

      // 4 Tiang Bambu Kanopi Oktagonal
      for (const [px, pz] of [[-1.7, -0.8], [1.7, -0.8], [-1.7, 0.8], [1.7, 0.8]]) {
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 2.9, 8), this.matWoodDark);
        pole.position.set(px, 1.45, pz);
        stallGroup.add(pole);
      }

      // Atap Pelana Kembar Khas Warung Majapahit + Kain Rumbai Depan
      const roofMat = idx % 2 === 0 ? this.matBannerRed : this.matThatch;
      const frontRoof = new THREE.Mesh(new THREE.BoxGeometry(4.3, 0.1, 1.45), roofMat);
      frontRoof.position.set(0, 2.86, 0.65);
      frontRoof.rotation.x = 0.34;
      frontRoof.castShadow = true;
      stallGroup.add(frontRoof);

      const backRoof = new THREE.Mesh(new THREE.BoxGeometry(4.3, 0.1, 1.45), roofMat);
      backRoof.position.set(0, 2.86, -0.65);
      backRoof.rotation.x = -0.34;
      backRoof.castShadow = true;
      stallGroup.add(backRoof);

      const ridgeBeam = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 4.45, 8), this.matWoodDark);
      ridgeBeam.rotation.z = Math.PI / 2;
      ridgeBeam.position.set(0, 3.12, 0);
      stallGroup.add(ridgeBeam);

      const valance = new THREE.Mesh(
        new THREE.BoxGeometry(4.1, 0.24, 0.06),
        idx % 2 === 0 ? this.matGold : this.matBannerRed
      );
      valance.position.set(0, 2.54, 1.28);
      stallGroup.add(valance);

      // Lentera Hangat di Depan Kios Pasar
      const stallLantern = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.1, 0.28, 8), this.matLanternGlow);
      stallLantern.position.set(1.45, 2.38, 1.24);
      stallGroup.add(stallLantern);

      // Komoditas Dagangan di Meja
      if (idx === 0) {
        // Karung rempah pala & cengkeh
        for (let b = -1.1; b <= 1.1; b += 0.75) {
          const sack = new THREE.Mesh(new THREE.DodecahedronGeometry(0.35, 1), this.matThatch);
          sack.position.set(b, 0.95, 0.1);
          sack.scale.y = 1.25;
          stallGroup.add(sack);
        }
      } else if (idx === 1) {
        // Gulungan Kain Tenun, Sutra & Batik Kerajaan Majapahit
        const clothMats = [this.matBannerRed, this.matFabricBlue, this.matGold, this.matBannerWhite];
        for (let f = 0; f < 4; f++) {
          const roll = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 1.1, 10), clothMats[f]);
          roll.rotation.x = Math.PI / 2;
          roll.position.set(-1.1 + f * 0.72, 1.02, 0.05);
          stallGroup.add(roll);
        }
      } else if (idx === 2) {
        // Tempayan & Guci Terakota Berlekuk Halus (LatheGeometry) Khas Trowulan
        const amphoraPts = [
          new THREE.Vector2(0, 0),
          new THREE.Vector2(0.18, 0.02),
          new THREE.Vector2(0.32, 0.26),
          new THREE.Vector2(0.28, 0.48),
          new THREE.Vector2(0.14, 0.62),
          new THREE.Vector2(0.21, 0.72),
          new THREE.Vector2(0.17, 0.72)
        ];
        const jarGeo = new THREE.LatheGeometry(amphoraPts, 12);
        for (let j = -1.15; j <= 1.15; j += 0.76) {
          const jar = new THREE.Mesh(jarGeo, this.matBrickRed);
          jar.position.set(j, 0.88, 0.08);
          jar.castShadow = true;
          stallGroup.add(jar);
        }
      } else if (idx === 3) {
        // Koin Gobog Perunggu Berlubang & Peti Emas
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

    // 3. Tubuh Candi Paduraksa dengan Lorong Tembus (Archway Corridor) & Pilar Sudut
    // Sisi Utara & Selatan lorong
    for (const side of [-1, 1]) {
      const wallPillar = new THREE.Mesh(new THREE.BoxGeometry(8.8, 5.5, 2.6), this.matBrickRed);
      wallPillar.position.set(0, 6.4, side * 3.2);
      wallPillar.castShadow = true;
      candi.add(wallPillar);

      // Pilaster Sudut & Sabuk Tengah Tubuh Candi
      const cornerButtress = new THREE.Mesh(new THREE.BoxGeometry(9.2, 5.1, 1.4), this.matBrickDark);
      cornerButtress.position.set(0, 6.3, side * 3.6);
      candi.add(cornerButtress);
    }

    // Arca Padupan / Batu Penjaga Kaki Tangga Barat
    for (const side of [-2.6, 2.6]) {
      const postPedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.56, 1.4, 6), this.matStoneSteps);
      postPedestal.position.set(-14.2, 0.7, side);
      candi.add(postPedestal);

      const postLamp = new THREE.Mesh(new THREE.SphereGeometry(0.24, 8, 6), this.matLanternGlow);
      postLamp.position.set(-14.2, 1.55, side);
      candi.add(postLamp);
    }

    // Balok Ambang Pintu Atas (Lintel) dengan Relief Kala Emas Berbingkai
    const lintel = new THREE.Mesh(new THREE.BoxGeometry(8.8, 1.4, 4.2), this.matBrickTrim);
    lintel.position.set(0, 9.6, 0);
    lintel.castShadow = true;
    candi.add(lintel);

    // Relief Kepala Kala Pelindung di kedua sisi barat-timur atas lorong
    for (const dir of [-1, 1]) {
      const kalaFrame = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.16, 6, 12, Math.PI), this.matBrickTrim);
      kalaFrame.rotation.y = Math.PI / 2;
      kalaFrame.position.set(dir * 4.45, 9.0, 0);
      candi.add(kalaFrame);

      const kalaHead = new THREE.Mesh(new THREE.DodecahedronGeometry(0.75, 1), this.matGold);
      kalaHead.position.set(dir * 4.55, 9.75, 0);
      kalaHead.scale.set(0.6, 1.0, 1.2);
      candi.add(kalaHead);
    }

    // 4. Atap Piramidal Bertingkat Sembilan (Khas Paduraksa Majapahit + Antefix Sudut)
    const roofTiers = [
      { w: 8.2, h: 1.8, d: 8.2, y: 10.9 },
      { w: 7.0, h: 1.6, d: 7.0, y: 12.4 },
      { w: 5.8, h: 1.5, d: 5.8, y: 13.8 },
      { w: 4.6, h: 1.4, d: 4.6, y: 15.1 },
      { w: 3.4, h: 1.3, d: 3.4, y: 16.3 },
      { w: 2.2, h: 1.2, d: 2.2, y: 17.4 }
    ];

    roofTiers.forEach((rt, ti) => {
      const roofMesh = new THREE.Mesh(new THREE.BoxGeometry(rt.w, rt.h, rt.d), this.matBrickRed);
      roofMesh.position.y = rt.y;
      roofMesh.castShadow = true;
      candi.add(roofMesh);

      // Sayap Penampil Salib agar siluet candi mengerucut berlekuk
      const crossX = new THREE.Mesh(new THREE.BoxGeometry(rt.w + 0.55, rt.h * 0.85, rt.d * 0.48), this.matBrickDark);
      crossX.position.y = rt.y;
      candi.add(crossX);

      const crossZ = new THREE.Mesh(new THREE.BoxGeometry(rt.w * 0.48, rt.h * 0.85, rt.d + 0.55), this.matBrickDark);
      crossZ.position.y = rt.y;
      candi.add(crossZ);

      const roofTrim = new THREE.Mesh(new THREE.BoxGeometry(rt.w + 0.34, 0.25, rt.d + 0.34), this.matBrickTrim);
      roofTrim.position.y = rt.y + rt.h * 0.5;
      candi.add(roofTrim);

      if (ti < 4) {
        for (const sx of [-1, 1]) {
          for (const sz of [-1, 1]) {
            const ratna = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.68, 5), this.matBrickTrim);
            ratna.position.set(sx * (rt.w * 0.48), rt.y + rt.h * 0.5 + 0.34, sz * (rt.d * 0.48));
            candi.add(ratna);
          }
        }
      }
    });

    // Mahkota Kemuncak Utama (Mastaka Emas Bajang Ratu)
    const topPinnacle = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.72, 2.3, 8), this.matGold);
    topPinnacle.position.y = 18.85;
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

    // 1. Batur Kaki Candi Berundak Markas Militer
    const batur = new THREE.Mesh(new THREE.BoxGeometry(15.2, 0.7, 10.2), this.matBrickDark);
    batur.position.y = 0.35;
    batur.receiveShadow = true;
    barak.add(batur);

    // 2. Bangunan Markas Utama + Pilaster Sudut & Sabuk Lis Bata Merah
    const mainHall = new THREE.Mesh(new THREE.BoxGeometry(14, 4.3, 9), this.matBrickRed);
    mainHall.position.y = 2.55;
    mainHall.castShadow = true;
    barak.add(mainHall);

    const wallBelt = new THREE.Mesh(new THREE.BoxGeometry(14.35, 0.32, 9.35), this.matBrickTrim);
    wallBelt.position.y = 4.6;
    barak.add(wallBelt);

    for (const px of [-6.9, 0, 6.9]) {
      for (const pz of [-4.45, 4.45]) {
        const pilaster = new THREE.Mesh(new THREE.BoxGeometry(0.85, 4.5, 0.65), this.matBrickDark);
        pilaster.position.set(px, 2.55, pz);
        barak.add(pilaster);
      }
    }

    // Gerbang Kayu Jati Ganda & Relung Lengkung Surya Bhayangkara
    const doorFrame = new THREE.Mesh(new THREE.BoxGeometry(3.2, 3.2, 0.4), this.matBrickDark);
    doorFrame.position.set(0, 2.0, 4.55);
    barak.add(doorFrame);

    const doorPanel = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.8, 0.35), this.matWoodDark);
    doorPanel.position.set(0, 1.9, 4.65);
    barak.add(doorPanel);

    const emblemArch = new THREE.Mesh(new THREE.OctahedronGeometry(0.5, 0), this.matGold);
    emblemArch.position.set(0, 3.85, 4.82);
    barak.add(emblemArch);

    // 3. Serambi Depan Berpilar Kayu (Portico) & Atap Kanopi
    for (const px of [-4.0, -1.8, 1.8, 4.0]) {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.24, 3.4, 8), this.matWoodDark);
      col.position.set(px, 1.9, 5.7);
      col.castShadow = true;
      barak.add(col);

      const plinth = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.38, 0.4, 8), this.matStoneSteps);
      plinth.position.set(px, 0.2, 5.7);
      barak.add(plinth);
    }

    const porchRoof = new THREE.Mesh(new THREE.BoxGeometry(10.2, 0.2, 2.4), this.matBrickTrim);
    porchRoof.position.set(0, 3.75, 5.4);
    porchRoof.rotation.x = 0.22;
    porchRoof.castShadow = true;
    barak.add(porchRoof);

    // 4. Atap Tajug Dua Susun Khas Majapahit + Mastaka Emas
    const lowerRoof = new THREE.Mesh(new THREE.ConeGeometry(9.6, 2.4, 4), this.matBrickDark);
    lowerRoof.position.y = 5.7;
    lowerRoof.rotation.y = Math.PI / 4;
    lowerRoof.scale.set(1.26, 0.9, 0.88);
    lowerRoof.castShadow = true;
    barak.add(lowerRoof);

    const upperRoof = new THREE.Mesh(new THREE.ConeGeometry(5.6, 2.1, 4), this.matBrickTrim);
    upperRoof.position.y = 7.45;
    upperRoof.rotation.y = Math.PI / 4;
    upperRoof.scale.set(1.25, 0.9, 0.85);
    upperRoof.castShadow = true;
    barak.add(upperRoof);

    const mastaka = new THREE.Mesh(new THREE.OctahedronGeometry(0.55, 0), this.matGold);
    mastaka.position.y = 8.75;
    barak.add(mastaka);

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
    ship.userData.baseY = y;
    this.shipGroup = ship;

    // 1. Lambung Lengkung Kayu Jati Lofted Multi-Station (Menggantikan balok kotak!)
    // Catatan kolider: Main Deck y=2.85 (world 3.20) x=-10..+7.5, Poop Deck y=4.15 (world 4.50) x=-14..-8
    const hullStations = [
      { x: -15.4, halfBeam: 2.35, keelY: 0.95, gunwaleY: 4.60 }, // Buritan transom
      { x: -13.8, halfBeam: 4.35, keelY: -0.35, gunwaleY: 4.25 },
      { x: -10.5, halfBeam: 4.78, keelY: -0.78, gunwaleY: 4.15 }, // Poop deck mid
      { x: -8.2, halfBeam: 4.88, keelY: -0.88, gunwaleY: 3.18 },  // Step poop->main
      { x: -5.8, halfBeam: 4.94, keelY: -0.94, gunwaleY: 2.86 },
      { x: 0.0, halfBeam: 4.98, keelY: -0.96, gunwaleY: 2.86 },   // Midship terlebar
      { x: 6.5, halfBeam: 4.82, keelY: -0.84, gunwaleY: 2.95 },   // Bahu depan
      { x: 10.2, halfBeam: 4.02, keelY: -0.42, gunwaleY: 3.28 },
      { x: 12.8, halfBeam: 2.55, keelY: 0.32, gunwaleY: 3.72 },
      { x: 14.8, halfBeam: 1.05, keelY: 1.45, gunwaleY: 4.20 },
      { x: 16.5, halfBeam: 0.08, keelY: 2.95, gunwaleY: 4.75 }   // Linggi haluan tajam
    ];

    const halfSegs = 7;
    const cols = halfSegs * 2 + 1;
    const hullPositions = [];
    const hullIndices = [];

    for (let i = 0; i < hullStations.length; i++) {
      const st = hullStations[i];
      for (let j = -halfSegs; j <= halfSegs; j++) {
        const u = j / halfSegs; // -1 (port) .. 0 (keel) .. +1 (starboard)
        const absU = Math.abs(u);
        const pz = Math.sign(u) * st.halfBeam * Math.pow(absU, 0.62);
        const py = st.keelY + (st.gunwaleY - st.keelY) * Math.pow(absU, 2.15);
        hullPositions.push(st.x, py, pz);
      }
    }

    for (let i = 0; i < hullStations.length - 1; i++) {
      for (let j = 0; j < cols - 1; j++) {
        const a = i * cols + j;
        const b = (i + 1) * cols + j;
        const c = (i + 1) * cols + (j + 1);
        const d = i * cols + (j + 1);
        hullIndices.push(a, b, d, b, c, d);
      }
    }

    // Tutup bidang buritan transom (stasiun 0) agar tidak berongga dari belakang
    const transomCenterIdx = hullPositions.length / 3;
    hullPositions.push(hullStations[0].x, 3.05, 0);
    for (let j = 0; j < cols - 1; j++) {
      hullIndices.push(transomCenterIdx, j + 1, j);
    }

    const hullGeo = new THREE.BufferGeometry();
    hullGeo.setAttribute('position', new THREE.Float32BufferAttribute(hullPositions, 3));
    hullGeo.setIndex(hullIndices);
    hullGeo.computeVertexNormals();

    const mainHullMesh = new THREE.Mesh(hullGeo, this.matHullPlank);
    mainHullMesh.castShadow = true;
    mainHullMesh.receiveShadow = true;
    ship.add(mainHullMesh);

    // Fungsi bantu lebar lambung pada posisi X tertentu untuk dek & sabuk gading
    const sampleBeam = (qx) => {
      if (qx <= hullStations[0].x) return hullStations[0].halfBeam;
      for (let i = 0; i < hullStations.length - 1; i++) {
        const s0 = hullStations[i];
        const s1 = hullStations[i + 1];
        if (qx >= s0.x && qx <= s1.x) {
          const t = (qx - s0.x) / (s1.x - s0.x);
          return s0.halfBeam + (s1.halfBeam - s0.halfBeam) * t;
        }
      }
      return 0.08;
    };

    const sampleSheerY = (qx) => {
      if (qx <= hullStations[0].x) return hullStations[0].gunwaleY;
      for (let i = 0; i < hullStations.length - 1; i++) {
        const s0 = hullStations[i];
        const s1 = hullStations[i + 1];
        if (qx >= s0.x && qx <= s1.x) {
          const t = (qx - s0.x) / (s1.x - s0.x);
          return s0.gunwaleY + (s1.gunwaleY - s0.gunwaleY) * t;
        }
      }
      return 4.75;
    };

    // Dek Utama Kayu Papan Lengkung (y = 2.85 local -> World = 3.20)
    const buildFittedDeck = (xStops, yFn, thickness) => {
      const pos = [];
      const idx = [];
      for (let i = 0; i < xStops.length; i++) {
        const dx = xStops[i];
        const bw = sampleBeam(dx) * 0.96;
        const dy = yFn(dx);
        pos.push(dx, dy, -bw, dx, dy, bw);
        pos.push(dx, dy - thickness, -bw, dx, dy - thickness, bw);
      }
      for (let i = 0; i < xStops.length - 1; i++) {
        const o0 = i * 4;
        const o1 = (i + 1) * 4;
        idx.push(o0, o0 + 1, o1 + 1, o0, o1 + 1, o1); // top deck
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      g.setIndex(idx);
      g.computeVertexNormals();
      const mesh = new THREE.Mesh(g, this.matDeckPlank);
      mesh.receiveShadow = true;
      return mesh;
    };

    ship.add(buildFittedDeck(
      [-8.4, -4.0, 0.0, 4.0, 7.6, 10.2, 12.8, 14.8, 16.0],
      (dx) => (dx <= 7.8 ? 2.85 : 2.85 + (dx - 7.8) * 0.16),
      0.24
    ));

    // Dek Buritan Bertingkat / Poop Deck (y = 4.15 local -> World = 4.50)
    ship.add(buildFittedDeck(
      [-15.1, -13.8, -11.5, -9.5, -8.2],
      () => 4.15,
      0.24
    ));

    // Sabuk Gading-Gading Luar & Bibiran Gunwale Melengkung di Kiri/Kanan Lambung
    const gunwaleStationsX = [-15.2, -13.8, -10.5, -8.2, -5.8, 0.0, 6.5, 10.2, 12.8, 14.8, 16.4];
    for (const side of [-1, 1]) {
      const rubPts = gunwaleStationsX.map((gx) => new THREE.Vector3(gx, sampleSheerY(gx) - 0.15, side * sampleBeam(gx)));
      const rubCurve = new THREE.CatmullRomCurve3(rubPts);
      const rubGeo = new THREE.TubeGeometry(rubCurve, 28, 0.16, 6, false);
      const rubRail = new THREE.Mesh(rubGeo, this.matWood);
      rubRail.castShadow = true;
      ship.add(rubRail);

      const lowerBeltPts = gunwaleStationsX.slice(1, -1).map((gx) =>
        new THREE.Vector3(gx, sampleSheerY(gx) * 0.55 + 0.35, side * sampleBeam(gx) * 0.88)
      );
      const lowerCurve = new THREE.CatmullRomCurve3(lowerBeltPts);
      const lowerBelt = new THREE.Mesh(new THREE.TubeGeometry(lowerCurve, 22, 0.14, 6, false), this.matWoodDark);
      ship.add(lowerBelt);
    }

    // Lunas Linggi Haluan (Curved Stempost) & Tiang Cucur + Kepala Garuda Emas
    const stemCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(10.0, -0.45, 0),
      new THREE.Vector3(13.2, 0.7, 0),
      new THREE.Vector3(15.6, 2.5, 0),
      new THREE.Vector3(16.9, 5.2, 0)
    ]);
    const stemPost = new THREE.Mesh(new THREE.TubeGeometry(stemCurve, 14, 0.22, 7, false), this.matWoodDark);
    stemPost.castShadow = true;
    ship.add(stemPost);

    const bowsprit = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.24, 5.4, 8), this.matWood);
    bowsprit.position.set(16.6, 4.75, 0);
    bowsprit.rotation.z = -Math.PI / 2 + 0.34;
    ship.add(bowsprit);

    const figurehead = new THREE.Mesh(new THREE.OctahedronGeometry(0.46, 1), this.matGold);
    figurehead.position.set(19.1, 5.65, 0);
    ship.add(figurehead);

    // Pagar Susur & Tonggak Geladak Utama (Terbuka di celah gangway x = +0.5..+4.5, z = +4.55)
    for (const px of [-7.5, -5.0, -2.5, 0.0, 4.9, 7.2]) {
      for (const side of [-1, 1]) {
        if (side === 1 && px > 0.2 && px < 4.7) continue;
        const gz = side * (sampleBeam(px) * 0.92);
        const stanchion = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.85, 6), this.matWoodDark);
        stanchion.position.set(px, 3.25, gz);
        ship.add(stanchion);
      }
    }
    const railNorth = new THREE.Mesh(new THREE.BoxGeometry(15.2, 0.14, 0.22), this.matWood);
    railNorth.position.set(-0.2, 3.68, -4.52);
    ship.add(railNorth);
    const railSouthW = new THREE.Mesh(new THREE.BoxGeometry(7.8, 0.14, 0.22), this.matWood);
    railSouthW.position.set(-3.9, 3.68, 4.52);
    ship.add(railSouthW);
    const railSouthE = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.14, 0.22), this.matWood);
    railSouthE.position.set(6.1, 3.68, 4.52);
    ship.add(railSouthE);

    // Kabin Nakhoda Buritan (Anjungan Jung Jawa) + Jendela Lentera Hangat
    const sternCabin = new THREE.Mesh(new THREE.BoxGeometry(3.3, 2.15, 7.8), this.matWood);
    sternCabin.position.set(-13.2, 5.2, 0);
    sternCabin.castShadow = true;
    ship.add(sternCabin);

    const sternRoof = new THREE.Mesh(new THREE.CylinderGeometry(4.15, 4.15, 3.8, 8, 1, false, 0, Math.PI), this.matBrickRed);
    sternRoof.rotation.z = Math.PI / 2;
    sternRoof.rotation.y = Math.PI / 2;
    sternRoof.position.set(-13.2, 6.22, 0);
    sternRoof.scale.set(1, 0.36, 1);
    ship.add(sternRoof);

    // Jendela Kabin & Lentera Buritan Bercahaya
    for (const wz of [-2.1, 0, 2.1]) {
      const win = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.72, 1.05), this.matLanternGlow);
      win.position.set(-11.52, 5.35, wz);
      ship.add(win);

      const sternBackWin = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.72, 1.05), this.matLanternGlow);
      sternBackWin.position.set(-14.88, 5.35, wz);
      ship.add(sternBackWin);
    }

    // Kemudi Kembar Khas Nusantara (Twin Quarter Rudders / Kemudi Samping)
    for (const side of [-1, 1]) {
      const rudderPivot = new THREE.Group();
      rudderPivot.position.set(-13.2, 2.2, side * 4.55);
      rudderPivot.rotation.set(side * 0.28, 0, 0.42);
      const oarShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.14, 4.6, 8), this.matWoodDark);
      rudderPivot.add(oarShaft);
      const oarBlade = new THREE.Mesh(new THREE.BoxGeometry(0.95, 2.2, 0.14), this.matWood);
      oarBlade.position.y = -1.75;
      rudderPivot.add(oarBlade);
      ship.add(rudderPivot);
    }

    // Jangkar Batu/Kayu & Tong Rempah di Sisi Dek (Tidak menghalangi jalur tengah)
    const anchor = new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.11, 6, 10, Math.PI * 1.2), this.matBronze);
    anchor.position.set(10.5, 2.55, 4.15);
    anchor.rotation.z = -0.5;
    ship.add(anchor);

    const coilRope = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.12, 6, 12), this.matRope);
    coilRope.rotation.x = Math.PI / 2;
    coilRope.position.set(6.8, 2.98, 2.9);
    ship.add(coilRope);

    for (const [bx, bz] of [[-4.8, -3.4], [-3.8, -3.5], [3.2, -3.4]]) {
      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.95, 10), this.matWood);
      barrel.position.set(bx, 3.32, bz);
      barrel.castShadow = true;
      ship.add(barrel);
      const band = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.12, 10), this.matBronze);
      band.position.set(bx, 3.48, bz);
      ship.add(band);
    }

    // Tangga Kayu dari Dek Utama ke Buritan
    for (let st = 0; st < 4; st++) {
      const sMesh = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.28, 3.6), this.matWood);
      sMesh.position.set(-5.2 - st * 0.72, 3.0 + st * 0.32, 0);
      ship.add(sMesh);
    }

    // 2. Titian Penghubung Lebar (Gangway) dari Sisi Selatan Dermaga ke Geladak Utama
    const gangway = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.28, 3.6), this.matWood);
    gangway.position.set(2.5, 2.15, 5.7);
    gangway.rotation.x = 0.42;
    gangway.castShadow = true;
    ship.add(gangway);

    // 3. Tiga Tiang Layar Tanja Menggembung Ditiup Angin + Tali Tambang Shrouds
    const masts = [
      { x: 5.5, h: 18, radius: 0.32, sailW: 8.5, sailH: 9.5 },
      { x: -1.2, h: 22, radius: 0.42, sailW: 10.5, sailH: 12.0 },
      { x: -6.8, h: 16, radius: 0.28, sailW: 6.8, sailH: 7.8 }
    ];

    masts.forEach((m, idx) => {
      // Tiang Utama Kayu
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(m.radius * 0.7, m.radius, m.h, 8), this.matWood);
      pole.position.set(m.x, m.h * 0.5 + 2.8, 0);
      pole.castShadow = true;
      ship.add(pole);

      // Tali Laberang (Shrouds) dari puncak tiang ke lambung kiri & kanan
      for (const side of [-1, 1]) {
        const shroudStart = new THREE.Vector3(m.x, m.h + 1.8, 0);
        const shroudEnd = new THREE.Vector3(m.x - 0.5, 3.1, side * (sampleBeam(m.x) * 0.9));
        const shroudDir = new THREE.Vector3().subVectors(shroudEnd, shroudStart);
        const shroudLen = shroudDir.length();
        const shroud = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, shroudLen, 5), this.matRope);
        shroud.position.copy(shroudStart).addScaledVector(shroudDir, 0.5);
        shroud.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), shroudDir.normalize());
        ship.add(shroud);
      }

      // Palang Bambu Atas, Tengah & Bawah Layar Tanja
      for (const sparFrac of [-0.46, 0.0, 0.46]) {
        const spar = new THREE.Mesh(
          new THREE.CylinderGeometry(sparFrac === 0 ? 0.045 : 0.08, sparFrac === 0 ? 0.045 : 0.08, m.sailW + 0.6, 6),
          this.matWoodDark
        );
        spar.rotation.x = Math.PI / 2;
        spar.rotation.z = -0.12;
        spar.position.set(m.x + 0.35 + (sparFrac === 0 ? 0.85 : 0), m.h * 0.5 + 4.2 + m.sailH * sparFrac, 0);
        ship.add(spar);
      }

      // Layar Tanja Menggembung (Displaced Bezier/Sine Belly Geometry agar tidak datar papan)
      const sailGeo = new THREE.PlaneGeometry(m.sailW, m.sailH, 10, 8);
      const sPos = sailGeo.attributes.position;
      for (let vi = 0; vi < sPos.count; vi++) {
        const lx = sPos.getX(vi) / m.sailW + 0.5;
        const ly = sPos.getY(vi) / m.sailH + 0.5;
        const bulge = Math.sin(lx * Math.PI) * Math.sin(ly * Math.PI) * 1.18;
        sPos.setZ(vi, bulge);
      }
      sailGeo.computeVertexNormals();

      const sail = new THREE.Mesh(sailGeo, this.matSail);
      sail.position.set(m.x + 0.3, m.h * 0.5 + 4.2, 0);
      sail.rotation.y = Math.PI / 2 + 0.18;
      sail.rotation.z = -0.12; // Sudut miring khas Tanja Nusantara
      sail.castShadow = true;
      ship.add(sail);
      this.animatedBanners.push({ mesh: sail, phase: idx * 1.5, baseRotZ: -0.12, amp: 0.035 });

      // Panji Bendera Gula Kelapa (Merah Putih Majapahit) di Puncak Tiang
      const flagGeo = new THREE.PlaneGeometry(2.6, 1.25, 6, 2);
      const flag = new THREE.Mesh(flagGeo, this.matBannerRed);
      flag.position.set(m.x + 1.3, m.h + 2.8, 0);
      flag.rotation.y = Math.PI / 2;
      ship.add(flag);
      this.animatedBanners.push({ mesh: flag, phase: idx * 2.2, baseRotY: Math.PI / 2, amp: 0.18, isFlag: true });
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

      const pilaster = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.55, 7.6, 8), this.matGold);
      pilaster.position.set(side * 4.45, 3.8, 43.9);
      kedaton.add(pilaster);
    }

    // Ambang Atas & Atap Paduraksa Gerbang Selatan (Tinggi di atas kepala pemain agar bebas lewat)
    const gateLintel = new THREE.Mesh(new THREE.BoxGeometry(18.0, 2.4, 4.6), this.matBrickRed);
    gateLintel.position.set(0, 8.8, 42);
    gateLintel.castShadow = true;
    kedaton.add(gateLintel);

    const gateRoofTop = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 8.6, 3.2, 4), this.matBrickDark);
    gateRoofTop.position.set(0, 11.4, 42);
    gateRoofTop.rotation.y = Math.PI / 4;
    gateRoofTop.scale.set(1.45, 1.0, 0.45);
    kedaton.add(gateRoofTop);

    const gateFinial = new THREE.Mesh(new THREE.OctahedronGeometry(0.75, 0), this.matGold);
    gateFinial.position.set(0, 13.4, 42);
    kedaton.add(gateFinial);

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

    // Lambang Cakra Surya Majapahit Emas Bercahaya (8 Sinar Pancar) di belakang Singgasana
    const sunRing = new THREE.Mesh(new THREE.TorusGeometry(1.15, 0.14, 8, 16), this.matGold);
    sunRing.position.set(0, 2.4, -0.95);
    throneGroup.add(sunRing);

    const sunEmblem = new THREE.Mesh(new THREE.OctahedronGeometry(0.68, 0), this.matGold);
    sunEmblem.position.set(0, 2.4, -0.9);
    throneGroup.add(sunEmblem);

    for (let ray = 0; ray < 8; ray++) {
      const ang = (ray / 8) * Math.PI * 2;
      const spearRay = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.92, 4), this.matGold);
      spearRay.position.set(Math.cos(ang) * 1.55, 2.4 + Math.sin(ang) * 1.55, -0.95);
      spearRay.rotation.z = ang - Math.PI / 2;
      throneGroup.add(spearRay);
    }

    // Padupan Dupa Emas Menyala di Kaki Tangga Balairung Pendopo
    for (const side of [-5.8, 5.8]) {
      const brazierBase = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.62, 1.0, 8), this.matBronze);
      brazierBase.position.set(side, 0.5, 13.0);
      kedaton.add(brazierBase);
      const brazierBowl = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.38, 0.42, 8), this.matGold);
      brazierBowl.position.set(side, 1.15, 13.0);
      kedaton.add(brazierBowl);
      const brazierGlow = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.72, 6), this.matFlameOuter);
      brazierGlow.position.set(side, 1.65, 13.0);
      kedaton.add(brazierGlow);
      this.animatedFlames.push({ mesh: brazierGlow, phase: side });
    }

    // Sandaran tangan singgasana berukir
    for (const side of [-1.45, 1.45]) {
      const armRest = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.24, 1.35, 8), this.matGold);
      armRest.position.set(side, 1.25, -0.2);
      throneGroup.add(armRest);
    }

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
    // 1. Animasi kibaran layar & panji bendera Majapahit (oskilasi sinus tanpa drift!)
    for (const b of this.animatedBanners) {
      if (b.isFlag) {
        b.mesh.rotation.y = (b.baseRotY || Math.PI / 2) + Math.sin(elapsedTime * 4.5 + b.phase) * (b.amp || 0.18);
      } else {
        b.mesh.rotation.z = (b.baseRotZ ?? -0.12) + Math.sin(elapsedTime * 2.4 + b.phase) * (b.amp || 0.035);
      }
    }

    // 2. Ayunan lembut Kapal Jung di permukaan air sungai Brantas
    if (this.shipGroup) {
      this.shipGroup.position.y = (this.shipGroup.userData.baseY || 0.35) + Math.sin(elapsedTime * 1.15) * 0.045;
      this.shipGroup.rotation.z = Math.sin(elapsedTime * 0.85) * 0.008;
    }

    // 3. Kedip nyala api unggun & padupan istana
    for (const f of this.animatedFlames) {
      const s = 0.88 + Math.sin(elapsedTime * 8.5 + f.phase) * 0.16;
      f.mesh.scale.set(1.0 - (s - 1.0) * 0.3, s, 1.0 - (s - 1.0) * 0.3);
    }
  }
}
