import * as THREE from 'three';
import { getTerrainHeight, getRoadFactor } from './Terrain.js';
import { LANDMARKS } from './WorldData.js';

export class VegetationAndNatureSystem {
  constructor(scene) {
    this.scene = scene;
    this.flameMeshes = [];
    this.torchLights = [];
    this.beaconRings = [];
    this.colliders = [];

    this.initSharedMaterials();
    this.buildSacredMajaTree();
    this.buildGiantBanyanTrees();
    this.populateForestAndPalms();
    this.populateRocksAndLotus();
    this.buildRoyalTorches();
    this.buildHistoricalSignposts();
    this.initAmbientParticles();
  }

  isInsideProtectedArea(x, z) {
    // Kolam Segaran
    if (x > -74 && x < -30 && z > -26 && z < 36) return true;
    // Kedaton Agung courtyard & perimeter
    if (Math.abs(x) < 48 && z > -168 && z < -68) return true;
    // Pasar Kotaraja
    if (x > 6 && x < 32 && z > -2 && z < 26) return true;
    // Candi Bajang Ratu & Sanggar Pujangga
    if (x > 90 && x < 136 && z > -24 && z < 4) return true;
    // Barak Bhayangkara & Dermaga Jung
    if (x < -86 && x > -148 && z > 2 && z < 32) return true;
    // Perkemahan Raden Wijaya
    if (x > -24 && x < -4 && z > 112 && z < 138) return true;
    // Spawn point clearance
    if (Math.hypot(x, z - 142) < 9) return true;
    return false;
  }

  initSharedMaterials() {
    this.trunkMat = new THREE.MeshStandardMaterial({ color: '#5c3d28', roughness: 0.9, flatShading: true });
    this.banyanTrunkMat = new THREE.MeshStandardMaterial({ color: '#4d3322', roughness: 0.92, flatShading: true });
    this.palmTrunkMat = new THREE.MeshStandardMaterial({ color: '#78563c', roughness: 0.88, flatShading: true });

    this.leafLushMat = new THREE.MeshStandardMaterial({ color: '#2e6f32', roughness: 0.8, flatShading: true });
    this.leafBrightMat = new THREE.MeshStandardMaterial({ color: '#498c39', roughness: 0.78, flatShading: true });
    this.leafBanyanMat = new THREE.MeshStandardMaterial({ color: '#245929', roughness: 0.82, flatShading: true });
    this.majaFruitMat = new THREE.MeshStandardMaterial({
      color: '#a8cf45',
      emissive: '#3b4f0d',
      roughness: 0.4
    });

    this.rockMat = new THREE.MeshStandardMaterial({ color: '#6b655e', roughness: 0.92, flatShading: true });
    this.brickMat = new THREE.MeshStandardMaterial({ color: '#a63e2a', roughness: 0.85, flatShading: true });
    this.goldMat = new THREE.MeshStandardMaterial({
      color: '#f2c14e',
      emissive: '#6e4f0a',
      roughness: 0.3,
      metalness: 0.75
    });
    this.flameMat = new THREE.MeshBasicMaterial({ color: '#ffae33' });
  }

  // 1. Iconic Sacred Pohon Maja Agung in Hutan Tarik (-16, 132)
  buildSacredMajaTree() {
    const x = -16;
    const z = 132;
    const y = getTerrainHeight(x, z);
    const group = new THREE.Group();
    group.position.set(x, y, z);

    // Ancient stone ring around the tree
    const baseRing = new THREE.Mesh(
      new THREE.CylinderGeometry(3.8, 4.4, 0.7, 12),
      this.brickMat
    );
    baseRing.position.y = 0.35;
    baseRing.receiveShadow = true;
    group.add(baseRing);

    // Main gnarled trunk
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.85, 1.45, 7.5, 9),
      this.banyanTrunkMat
    );
    trunk.position.y = 3.8;
    trunk.castShadow = true;
    group.add(trunk);

    // Multi-layered lush canopy
    const canopyOffsets = [
      [0, 8.2, 0, 4.4],
      [-2.4, 7.2, 1.5, 3.2],
      [2.5, 7.4, -1.2, 3.3],
      [0.8, 6.9, 2.4, 3.0],
      [-1.5, 7.0, -2.2, 2.9]
    ];

    for (const [cx, cy, cz, r] of canopyOffsets) {
      const crown = new THREE.Mesh(new THREE.DodecahedronGeometry(r, 1), this.leafBrightMat);
      crown.position.set(cx, cy, cz);
      crown.scale.y = 0.78;
      crown.castShadow = true;
      crown.receiveShadow = true;
      group.add(crown);
    }

    // Hanging Iconic Maja Fruits (Buah Maja)
    const fruitCoords = [
      [-2.2, 5.5, 1.8], [2.1, 5.7, 1.5], [0.4, 5.3, 2.7],
      [-1.8, 5.6, -2.0], [2.4, 5.4, -1.5], [0, 5.9, -2.5],
      [1.4, 5.2, 0.9], [-1.2, 5.1, 0.6]
    ];
    for (const [fx, fy, fz] of fruitCoords) {
      const fruit = new THREE.Mesh(new THREE.SphereGeometry(0.38, 10, 10), this.majaFruitMat);
      fruit.position.set(fx, fy, fz);
      group.add(fruit);
    }

    this.scene.add(group);
  }

  // 2. Giant Majapahit Banyan Trees (Pohon Beringin Agung) with aerial roots
  buildGiantBanyanTrees() {
    const banyanLocations = [
      [16, 42],    // South of Wringin Lawang
      [-20, -10],  // Near Pasar & Kolam Segaran
      [22, -46],   // Royal Plaza before Kedaton Moat
      [-22, -46],  // Royal Plaza West
      [88, 6],     // Foot of Lembah Candi
      [-92, 10],   // Entrance to Barak Bhayangkara
      [26, 118]    // Deep Hutan Tarik
    ];

    for (const [bx, bz] of banyanLocations) {
      const by = getTerrainHeight(bx, bz);
      const banyan = new THREE.Group();
      banyan.position.set(bx, by, bz);

      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.8, 8.5, 9), this.banyanTrunkMat);
      trunk.position.y = 4.2;
      trunk.castShadow = true;
      banyan.add(trunk);

      // Hanging aerial roots (Akar Gantung Beringin)
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const rx = Math.cos(angle) * 2.3;
        const rz = Math.sin(angle) * 2.3;
        const root = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 5.5, 5), this.banyanTrunkMat);
        root.position.set(rx, 2.75, rz);
        banyan.add(root);
      }

      // Broad layered canopy
      const puffs = [
        [0, 9.0, 0, 5.2],
        [-3.2, 7.8, 1.8, 3.8],
        [3.2, 7.9, -1.6, 3.8],
        [1.5, 7.6, 3.0, 3.5],
        [-1.8, 7.7, -2.8, 3.6]
      ];
      for (const [px, py, pz, pr] of puffs) {
        const foliage = new THREE.Mesh(new THREE.DodecahedronGeometry(pr, 1), this.leafBanyanMat);
        foliage.position.set(px, py, pz);
        foliage.scale.y = 0.7;
        foliage.castShadow = true;
        foliage.receiveShadow = true;
        banyan.add(foliage);
      }

      this.scene.add(banyan);
    }
  }

  // 3. Procedural Forest Trees, Maja Trees, and Coconut Palms across the 5 Zones
  populateForestAndPalms() {
    const treeGroup = new THREE.Group();

    // Deterministic scatter for 240 trees across the 440x440 world
    for (let i = 0; i < 240; i++) {
      const seed1 = Math.sin(i * 78.233) * 43758.5453;
      const seed2 = Math.cos(i * 45.164) * 23421.6312;
      const rx = ((seed1 - Math.floor(seed1)) - 0.5) * 350;
      const rz = ((seed2 - Math.floor(seed2)) - 0.5) * 350;

      const ry = getTerrainHeight(rx, rz);
      const roadFactor = getRoadFactor(rx, rz);

      // Don't place trees underwater, on roads, or inside protected structures
      if (ry < 0.75 || roadFactor > 0.18 || this.isInsideProtectedArea(rx, rz)) continue;

      const scale = 0.8 + (i % 7) * 0.12;

      // Near riverbanks or harbor -> Coconut Palm Tree
      if (ry < 1.55 || (rx < -85 && Math.abs(rz - 20) < 45)) {
        const palm = this.createCoconutPalm(scale);
        palm.position.set(rx, ry, rz);
        palm.rotation.y = (i * 1.7) % (Math.PI * 2);
        treeGroup.add(palm);

        this.colliders.push({
          type: 'circle',
          x: rx,
          z: rz,
          radius: 0.42 * scale,
          yMin: -2.0,
          yMax: ry + 8.0
        });
      } else {
        // Tropical Hardwood or Maja Tree (in Hutan Tarik z > 80)
        const hasMajaFruit = rz > 80 && i % 3 === 0;
        const tree = this.createTropicalTree(scale, hasMajaFruit);
        tree.position.set(rx, ry, rz);
        tree.rotation.y = (i * 2.3) % (Math.PI * 2);
        treeGroup.add(tree);

        this.colliders.push({
          type: 'circle',
          x: rx,
          z: rz,
          radius: 0.52 * scale,
          yMin: -2.0,
          yMax: ry + 8.0
        });
      }
    }

    this.scene.add(treeGroup);
  }

  createTropicalTree(scale = 1, withMajaFruit = false) {
    const g = new THREE.Group();
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.32 * scale, 0.55 * scale, 4.2 * scale, 7), this.trunkMat);
    trunk.position.y = 2.1 * scale;
    trunk.castShadow = true;
    g.add(trunk);

    const mat = withMajaFruit ? this.leafBrightMat : this.leafLushMat;
    const mainCrown = new THREE.Mesh(new THREE.DodecahedronGeometry(2.3 * scale, 1), mat);
    mainCrown.position.y = 4.6 * scale;
    mainCrown.scale.y = 0.82;
    mainCrown.castShadow = true;
    g.add(mainCrown);

    const subCrown = new THREE.Mesh(new THREE.DodecahedronGeometry(1.65 * scale, 1), mat);
    subCrown.position.set(1.1 * scale, 3.9 * scale, 0.6 * scale);
    subCrown.castShadow = true;
    g.add(subCrown);

    if (withMajaFruit) {
      for (let f = 0; f < 3; f++) {
        const angle = (f / 3) * Math.PI * 2;
        const fruit = new THREE.Mesh(new THREE.SphereGeometry(0.24 * scale, 7, 7), this.majaFruitMat);
        fruit.position.set(Math.cos(angle) * 1.3 * scale, 3.5 * scale, Math.sin(angle) * 1.3 * scale);
        g.add(fruit);
      }
    }

    return g;
  }

  createCoconutPalm(scale = 1) {
    const g = new THREE.Group();

    // Slightly curved segmented palm trunk
    for (let s = 0; s < 5; s++) {
      const seg = new THREE.Mesh(
        new THREE.CylinderGeometry((0.28 - s * 0.03) * scale, (0.32 - s * 0.03) * scale, 1.25 * scale, 7),
        this.palmTrunkMat
      );
      seg.position.set(s * 0.14 * scale, (s * 1.15 + 0.6) * scale, 0);
      seg.rotation.z = -s * 0.06;
      seg.castShadow = true;
      g.add(seg);
    }

    const topX = 0.6 * scale;
    const topY = 5.8 * scale;

    // Palm fronds
    for (let f = 0; f < 6; f++) {
      const angle = (f / 6) * Math.PI * 2;
      const frond = new THREE.Mesh(new THREE.BoxGeometry(2.4 * scale, 0.12 * scale, 0.55 * scale), this.leafBrightMat);
      frond.position.set(
        topX + Math.cos(angle) * 1.1 * scale,
        topY - 0.15 * scale,
        Math.sin(angle) * 1.1 * scale
      );
      frond.rotation.y = -angle;
      frond.rotation.z = -0.38;
      frond.castShadow = true;
      g.add(frond);
    }

    return g;
  }

  // 4. River Rocks, Highland Boulders, and Lotus Pads on Kolam Segaran
  populateRocksAndLotus() {
    const group = new THREE.Group();

    // Boulders along riverbanks and hills
    for (let i = 0; i < 95; i++) {
      const s1 = Math.sin(i * 19.19) * 9876.54;
      const s2 = Math.cos(i * 37.73) * 5432.19;
      const rx = ((s1 - Math.floor(s1)) - 0.5) * 320;
      const rz = ((s2 - Math.floor(s2)) - 0.5) * 320;
      const ry = getTerrainHeight(rx, rz);

      if (getRoadFactor(rx, rz) > 0.1 || ry < -0.5 || this.isInsideProtectedArea(rx, rz)) continue;
      if (Math.hypot(rx - -48, rz - 68) < 4.5) continue; // Bebaskan area Prasasti Kudadu

      const rSize = 0.5 + (i % 5) * 0.35;
      const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(rSize, 0), this.rockMat);
      rock.position.set(rx, ry + rSize * 0.35, rz);
      rock.scale.set(1.2, 0.75, 1.0);
      rock.rotation.set(i * 0.4, i * 1.1, 0);
      rock.castShadow = true;
      rock.receiveShadow = true;
      group.add(rock);

      if (rSize >= 0.75) {
        this.colliders.push({
          type: 'circle',
          x: rx,
          z: rz,
          radius: rSize * 0.85,
          yMin: -2.0,
          yMax: ry + 4.0
        });
      }
    }

    // Lotus pads floating on Kolam Segaran (x: -66..-38, z: -18..28)
    const lotusPadMat = new THREE.MeshStandardMaterial({ color: '#3b8c40', roughness: 0.7 });
    const lotusFlowerMat = new THREE.MeshStandardMaterial({ color: '#f582ae', emissive: '#4d1429', roughness: 0.4 });

    for (let i = 0; i < 24; i++) {
      const lx = -64 + (i % 6) * 4.6 + Math.sin(i) * 1.2;
      const lz = -15 + Math.floor(i / 6) * 11.5 + Math.cos(i) * 1.5;

      const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 0.06, 10), lotusPadMat);
      pad.position.set(lx, 0.3, lz);
      group.add(pad);

      if (i % 2 === 0) {
        const flower = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.35, 7), lotusFlowerMat);
        flower.position.set(lx, 0.46, lz);
        group.add(flower);
      }
    }

    this.scene.add(group);
  }

  // 5. Royal Majapahit Terracotta Torches along roads and bridges
  buildRoyalTorches() {
    const torchCoords = [
      // Hutan Tarik road & Bridge South
      [-5.5, 136], [5.5, 136],
      [-5.5, 110], [5.5, 110],
      [-6.5, 89], [6.5, 89],
      // Bridge North & Wringin Lawang Avenue
      [-6.5, 53], [6.5, 53],
      [-6.0, 26], [6.0, 26],
      [-6.0, 0], [6.0, 0],
      [-6.0, -28], [6.0, -28],
      // Kedaton Moat Bridge
      [-6.2, -53], [6.2, -53],
      [-6.2, -75], [6.2, -75],
      [-8.0, -105], [8.0, -105],
      // East Road to Lembah Candi
      [35, -8], [65, -8], [95, -10],
      // West Road to Dermaga Jung
      [-35, -1], [-78, 2], [-112, 16]
    ];

    const torchGroup = new THREE.Group();

    torchCoords.forEach(([tx, tz], idx) => {
      const ty = getTerrainHeight(tx, tz);
      const stand = new THREE.Group();
      stand.position.set(tx, ty, tz);

      // Brick pillar base
      const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.85, 2.2, 0.85), this.brickMat);
      pillar.position.y = 1.1;
      pillar.castShadow = true;
      stand.add(pillar);

      this.colliders.push({
        type: 'circle',
        x: tx,
        z: tz,
        radius: 0.52,
        yMin: -2.0,
        yMax: ty + 5.0
      });

      // Flame cone
      const flame = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.78, 7), this.flameMat);
      flame.position.y = 2.55;
      stand.add(flame);
      this.flameMeshes.push({ mesh: flame, phase: idx * 0.9 });

      // Add real PointLight on key torches for atmospheric night/sunset glow
      if (idx % 2 === 0) {
        const light = new THREE.PointLight('#ff8c2b', 1.4, 24, 1.6);
        light.position.set(0, 2.9, 0);
        stand.add(light);
        this.torchLights.push(light);
      }

      torchGroup.add(stand);
    });

    this.scene.add(torchGroup);
  }

  // 6. Historical Signposts / Prasasti Markers at the 6 Landmarks
  buildHistoricalSignposts() {
    const group = new THREE.Group();

    LANDMARKS.forEach((lm, idx) => {
      const y = getTerrainHeight(lm.position.x, lm.position.z);
      const marker = new THREE.Group();
      marker.position.set(lm.position.x, Math.max(y, 1.6), lm.position.z);

      // Carved stone prasasti stele
      const steleBase = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.5, 1.2), this.brickMat);
      steleBase.position.y = 0.25;
      marker.add(steleBase);

      const steleBody = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.3, 0.45), this.rockMat);
      steleBody.position.y = 1.5;
      steleBody.castShadow = true;
      marker.add(steleBody);

      const goldEmblem = new THREE.Mesh(new THREE.OctahedronGeometry(0.38, 0), this.goldMat);
      goldEmblem.position.y = 3.1;
      marker.add(goldEmblem);

      // Glowing ground ring to invite player exploration
      const ringGeo = new THREE.RingGeometry(1.8, 2.15, 28);
      ringGeo.rotateX(-Math.PI / 2);
      const ringMat = new THREE.MeshBasicMaterial({
        color: '#f9d976',
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.65
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.y = 0.12;
      marker.add(ring);

      this.beaconRings.push({ ring, emblem: goldEmblem, phase: idx * 1.1 });
      group.add(marker);
    });

    this.scene.add(group);
  }

  // 7. Ambient Fireflies / Golden Dust Particles
  initAmbientParticles() {
    const count = 260;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 280;
      positions[i * 3 + 1] = 1.5 + Math.random() * 14;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 280;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.PointsMaterial({
      color: '#ffe27a',
      size: 0.42,
      transparent: true,
      opacity: 0.78
    });

    this.particles = new THREE.Points(geo, mat);
    this.scene.add(this.particles);
  }

  update(elapsedTime, torchIntensity = 1.2) {
    // Animate torch flames
    for (const f of this.flameMeshes) {
      const s = 0.88 + Math.sin(elapsedTime * 11 + f.phase) * 0.16;
      f.mesh.scale.set(s, 0.9 + Math.cos(elapsedTime * 14 + f.phase) * 0.2, s);
    }

    // Update torch point light intensities based on time of day
    for (let i = 0; i < this.torchLights.length; i++) {
      const flicker = 0.9 + Math.sin(elapsedTime * 9 + i) * 0.12;
      this.torchLights[i].intensity = torchIntensity * flicker;
    }

    // Pulse landmark prasasti rings & rotating golden emblems
    for (const b of this.beaconRings) {
      b.emblem.rotation.y = elapsedTime * 1.4 + b.phase;
      b.emblem.position.y = 3.1 + Math.sin(elapsedTime * 2.5 + b.phase) * 0.18;
      const pulse = 1.0 + Math.sin(elapsedTime * 2.2 + b.phase) * 0.1;
      b.ring.scale.set(pulse, pulse, 1);
    }

    // Gentle drift for ambient fireflies / golden dust
    const pos = this.particles.geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i) + Math.sin(elapsedTime * 1.5 + i) * 0.005;
      pos.setY(i, y);
    }
    pos.needsUpdate = true;
  }
}
