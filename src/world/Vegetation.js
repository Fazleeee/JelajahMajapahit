import * as THREE from 'three';
import { getTerrainHeight, getRoadFactor } from './Terrain.js';
import { LANDMARKS } from './WorldData.js';

export class VegetationAndNatureSystem {
  constructor(scene, isMobile = false) {
    this.scene = scene;
    this.isMobile = isMobile;
    this.beaconRings = [];
    this.colliders = [];

    // GPU Shader uniform for flames & ambient fireflies (0% CPU loop cost!)
    this.vegetationUniforms = {
      uTime: { value: 0 }
    };

    // Pooled dynamic lights for torches (3 active nearest PointLights instead of 13+)
    this.torchPositions = [];
    this.torchLightPool = [];
    this._nearestTorchIdx = [0, 1, 2];
    this._lastLightPlayerX = Infinity;
    this._lastLightPlayerZ = Infinity;

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

    // GPU Vertex Shader flickering flame material for InstancedMesh torches
    this.flameMat = new THREE.MeshBasicMaterial({ color: '#ffae33' });
    this.flameMat.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = this.vegetationUniforms.uTime;
      shader.vertexShader = 'uniform float uTime;\n' + shader.vertexShader;
      shader.vertexShader = shader.vertexShader.replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        float flickerPhase = 0.0;
        #ifdef USE_INSTANCING
          flickerPhase = instanceMatrix[3][0] * 0.37 + instanceMatrix[3][2] * 0.53;
        #endif
        float sx = 0.88 + sin(uTime * 11.0 + flickerPhase) * 0.16;
        float sy = 0.90 + cos(uTime * 14.0 + flickerPhase) * 0.20;
        transformed.x *= sx;
        transformed.z *= sx;
        transformed.y *= sy;`
      );
    };
  }

  createInstancedGroup(geo, mat, matrices, castShadow = false, receiveShadow = false) {
    if (matrices.length === 0) {
      geo.dispose();
      return null;
    }
    const im = new THREE.InstancedMesh(geo, mat, matrices.length);
    for (let i = 0; i < matrices.length; i++) {
      im.setMatrixAt(i, matrices[i]);
    }
    im.instanceMatrix.needsUpdate = true;
    im.castShadow = castShadow;
    im.receiveShadow = receiveShadow;
    if (im.computeBoundingSphere) im.computeBoundingSphere();
    this.scene.add(im);
    return im;
  }

  // 1. Iconic Sacred Pohon Maja Agung in Hutan Tarik (-16, 132)
  buildSacredMajaTree() {
    const x = -16;
    const z = 132;
    const y = getTerrainHeight(x, z);
    const group = new THREE.Group();
    group.position.set(x, y, z);

    const baseRing = new THREE.Mesh(
      new THREE.CylinderGeometry(3.8, 4.4, 0.7, 12),
      this.brickMat
    );
    baseRing.position.y = 0.35;
    baseRing.receiveShadow = true;
    group.add(baseRing);

    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.85, 1.45, 7.5, 9),
      this.banyanTrunkMat
    );
    trunk.position.y = 3.8;
    trunk.castShadow = true;
    group.add(trunk);

    const canopyOffsets = [
      [0, 8.2, 0, 4.4],
      [-2.4, 7.2, 1.5, 3.2],
      [2.5, 7.4, -1.2, 3.3],
      [0.8, 6.9, 2.4, 3.0],
      [-1.5, 7.0, -2.2, 2.9]
    ];

    const crownGeo = new THREE.DodecahedronGeometry(1.0, 1);
    for (const [cx, cy, cz, r] of canopyOffsets) {
      const crown = new THREE.Mesh(crownGeo, this.leafBrightMat);
      crown.position.set(cx, cy, cz);
      crown.scale.set(r, r * 0.78, r);
      crown.castShadow = true;
      crown.receiveShadow = true;
      group.add(crown);
    }

    const fruitGeo = new THREE.SphereGeometry(0.38, 8, 8);
    const fruitCoords = [
      [-2.2, 5.5, 1.8], [2.1, 5.7, 1.5], [0.4, 5.3, 2.7],
      [-1.8, 5.6, -2.0], [2.4, 5.4, -1.5], [0, 5.9, -2.5],
      [1.4, 5.2, 0.9], [-1.2, 5.1, 0.6]
    ];
    for (const [fx, fy, fz] of fruitCoords) {
      const fruit = new THREE.Mesh(fruitGeo, this.majaFruitMat);
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

    const trunkMatrices = [];
    const rootMatrices = [];
    const foliageMatrices = [];

    const parentObj = new THREE.Object3D();
    const childObj = new THREE.Object3D();
    parentObj.add(childObj);

    const puffs = [
      [0, 9.0, 0, 5.2],
      [-3.2, 7.8, 1.8, 3.8],
      [3.2, 7.9, -1.6, 3.8],
      [1.5, 7.6, 3.0, 3.5],
      [-1.8, 7.7, -2.8, 3.6]
    ];

    for (const [bx, bz] of banyanLocations) {
      const by = getTerrainHeight(bx, bz);
      parentObj.position.set(bx, by, bz);
      parentObj.rotation.set(0, 0, 0);
      parentObj.scale.setScalar(1);

      // Trunk
      childObj.position.set(0, 4.2, 0);
      childObj.rotation.set(0, 0, 0);
      childObj.scale.setScalar(1);
      parentObj.updateMatrixWorld(true);
      trunkMatrices.push(childObj.matrixWorld.clone());

      // Aerial roots
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        childObj.position.set(Math.cos(angle) * 2.3, 2.75, Math.sin(angle) * 2.3);
        childObj.rotation.set(0, 0, 0);
        childObj.scale.setScalar(1);
        parentObj.updateMatrixWorld(true);
        rootMatrices.push(childObj.matrixWorld.clone());
      }

      // Canopy puffs
      for (const [px, py, pz, pr] of puffs) {
        childObj.position.set(px, py, pz);
        childObj.rotation.set(0, 0, 0);
        childObj.scale.set(pr, pr * 0.7, pr);
        parentObj.updateMatrixWorld(true);
        foliageMatrices.push(childObj.matrixWorld.clone());
      }
    }

    this.createInstancedGroup(
      new THREE.CylinderGeometry(1.1, 1.8, 8.5, 9),
      this.banyanTrunkMat,
      trunkMatrices,
      true,
      false
    );
    this.createInstancedGroup(
      new THREE.CylinderGeometry(0.12, 0.18, 5.5, 5),
      this.banyanTrunkMat,
      rootMatrices,
      false,
      false
    );
    this.createInstancedGroup(
      new THREE.DodecahedronGeometry(1.0, 1),
      this.leafBanyanMat,
      foliageMatrices,
      !this.isMobile,
      true
    );
  }

  // 3. Instanced Procedural Forest Trees, Maja Trees, and Coconut Palms (Collapses 1600+ meshes into 6 draw calls!)
  populateForestAndPalms() {
    const trunkMatrices = [];
    const lushCrownMatrices = [];
    const brightCrownMatrices = [];
    const majaFruitMatrices = [];
    const palmTrunkMatrices = [];
    const palmFrondMatrices = [];

    const parentObj = new THREE.Object3D();
    const childObj = new THREE.Object3D();
    parentObj.add(childObj);

    for (let i = 0; i < 240; i++) {
      const seed1 = Math.sin(i * 78.233) * 43758.5453;
      const seed2 = Math.cos(i * 45.164) * 23421.6312;
      const rx = ((seed1 - Math.floor(seed1)) - 0.5) * 350;
      const rz = ((seed2 - Math.floor(seed2)) - 0.5) * 350;

      const ry = getTerrainHeight(rx, rz);
      const roadFactor = getRoadFactor(rx, rz);

      if (ry < 0.75 || roadFactor > 0.18 || this.isInsideProtectedArea(rx, rz)) continue;

      const scale = 0.8 + (i % 7) * 0.12;
      parentObj.position.set(rx, ry, rz);
      parentObj.scale.setScalar(scale);

      if (ry < 1.55 || (rx < -85 && Math.abs(rz - 20) < 45)) {
        // Coconut Palm Tree
        parentObj.rotation.set(0, (i * 1.7) % (Math.PI * 2), 0);

        for (let s = 0; s < 5; s++) {
          const trunkScaleFactor = 1.0 - s * 0.1;
          childObj.position.set(s * 0.14, s * 1.15 + 0.6, 0);
          childObj.rotation.set(0, 0, -s * 0.06);
          childObj.scale.set(trunkScaleFactor, 1, trunkScaleFactor);
          parentObj.updateMatrixWorld(true);
          palmTrunkMatrices.push(childObj.matrixWorld.clone());
        }

        const topX = 0.6;
        const topY = 5.8;
        for (let f = 0; f < 6; f++) {
          const angle = (f / 6) * Math.PI * 2;
          childObj.position.set(topX + Math.cos(angle) * 1.1, topY - 0.15, Math.sin(angle) * 1.1);
          childObj.rotation.set(0, -angle, -0.38);
          childObj.scale.setScalar(1);
          parentObj.updateMatrixWorld(true);
          palmFrondMatrices.push(childObj.matrixWorld.clone());
        }

        this.colliders.push({
          type: 'circle',
          x: rx,
          z: rz,
          radius: 0.42 * scale,
          yMin: -2.0,
          yMax: ry + 8.0
        });
      } else {
        // Tropical Hardwood or Maja Tree
        const hasMajaFruit = rz > 80 && i % 3 === 0;
        parentObj.rotation.set(0, (i * 2.3) % (Math.PI * 2), 0);

        // Trunk
        childObj.position.set(0, 2.1, 0);
        childObj.rotation.set(0, 0, 0);
        childObj.scale.setScalar(1);
        parentObj.updateMatrixWorld(true);
        trunkMatrices.push(childObj.matrixWorld.clone());

        // Main crown
        const crownTarget = hasMajaFruit ? brightCrownMatrices : lushCrownMatrices;
        childObj.position.set(0, 4.6, 0);
        childObj.rotation.set(0, 0, 0);
        childObj.scale.set(2.3, 2.3 * 0.82, 2.3);
        parentObj.updateMatrixWorld(true);
        crownTarget.push(childObj.matrixWorld.clone());

        // Sub crown
        childObj.position.set(1.1, 3.9, 0.6);
        childObj.rotation.set(0, 0, 0);
        childObj.scale.setScalar(1.65);
        parentObj.updateMatrixWorld(true);
        crownTarget.push(childObj.matrixWorld.clone());

        if (hasMajaFruit) {
          for (let f = 0; f < 3; f++) {
            const angle = (f / 3) * Math.PI * 2;
            childObj.position.set(Math.cos(angle) * 1.3, 3.5, Math.sin(angle) * 1.3);
            childObj.rotation.set(0, 0, 0);
            childObj.scale.setScalar(1);
            parentObj.updateMatrixWorld(true);
            majaFruitMatrices.push(childObj.matrixWorld.clone());
          }
        }

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

    const castTreeShadow = !this.isMobile;
    this.createInstancedGroup(
      new THREE.CylinderGeometry(0.32, 0.55, 4.2, 7),
      this.trunkMat,
      trunkMatrices,
      castTreeShadow,
      false
    );
    this.createInstancedGroup(
      new THREE.DodecahedronGeometry(1.0, 1),
      this.leafLushMat,
      lushCrownMatrices,
      castTreeShadow,
      true
    );
    this.createInstancedGroup(
      new THREE.DodecahedronGeometry(1.0, 1),
      this.leafBrightMat,
      brightCrownMatrices,
      castTreeShadow,
      true
    );
    this.createInstancedGroup(
      new THREE.SphereGeometry(0.24, 6, 6),
      this.majaFruitMat,
      majaFruitMatrices,
      false,
      false
    );
    this.createInstancedGroup(
      new THREE.CylinderGeometry(0.27, 0.31, 1.25, 6),
      this.palmTrunkMat,
      palmTrunkMatrices,
      castTreeShadow,
      false
    );
    this.createInstancedGroup(
      new THREE.BoxGeometry(2.4, 0.12, 0.55),
      this.leafBrightMat,
      palmFrondMatrices,
      false,
      false
    );
  }

  // 4. Instanced River Rocks, Highland Boulders, and Lotus Pads on Kolam Segaran (3 Draw Calls!)
  populateRocksAndLotus() {
    const rockMatrices = [];
    const padMatrices = [];
    const flowerMatrices = [];
    const dummy = new THREE.Object3D();

    for (let i = 0; i < 95; i++) {
      const s1 = Math.sin(i * 19.19) * 9876.54;
      const s2 = Math.cos(i * 37.73) * 5432.19;
      const rx = ((s1 - Math.floor(s1)) - 0.5) * 320;
      const rz = ((s2 - Math.floor(s2)) - 0.5) * 320;
      const ry = getTerrainHeight(rx, rz);

      if (getRoadFactor(rx, rz) > 0.1 || ry < -0.5 || this.isInsideProtectedArea(rx, rz)) continue;
      if (Math.hypot(rx - -48, rz - 68) < 4.5) continue;

      const rSize = 0.5 + (i % 5) * 0.35;
      dummy.position.set(rx, ry + rSize * 0.35, rz);
      dummy.scale.set(rSize * 1.2, rSize * 0.75, rSize * 1.0);
      dummy.rotation.set(i * 0.4, i * 1.1, 0);
      dummy.updateMatrix();
      rockMatrices.push(dummy.matrix.clone());

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

    const lotusPadMat = new THREE.MeshStandardMaterial({ color: '#3b8c40', roughness: 0.7 });
    const lotusFlowerMat = new THREE.MeshStandardMaterial({ color: '#f582ae', emissive: '#4d1429', roughness: 0.4 });

    for (let i = 0; i < 24; i++) {
      const lx = -64 + (i % 6) * 4.6 + Math.sin(i) * 1.2;
      const lz = -15 + Math.floor(i / 6) * 11.5 + Math.cos(i) * 1.5;

      dummy.position.set(lx, 0.3, lz);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      padMatrices.push(dummy.matrix.clone());

      if (i % 2 === 0) {
        dummy.position.set(lx, 0.46, lz);
        dummy.updateMatrix();
        flowerMatrices.push(dummy.matrix.clone());
      }
    }

    this.createInstancedGroup(
      new THREE.DodecahedronGeometry(1.0, 0),
      this.rockMat,
      rockMatrices,
      !this.isMobile,
      true
    );
    this.createInstancedGroup(
      new THREE.CylinderGeometry(0.85, 0.85, 0.06, 10),
      lotusPadMat,
      padMatrices,
      false,
      false
    );
    this.createInstancedGroup(
      new THREE.ConeGeometry(0.28, 0.35, 7),
      lotusFlowerMat,
      flowerMatrices,
      false,
      false
    );
  }

  // 5. Royal Majapahit Terracotta Torches with InstancedMesh + 3 Pooled PointLights (Saves 77% Light Cost!)
  buildRoyalTorches() {
    const torchCoords = [
      [-5.5, 136], [5.5, 136],
      [-5.5, 110], [5.5, 110],
      [-6.5, 89], [6.5, 89],
      [-6.5, 53], [6.5, 53],
      [-6.0, 26], [6.0, 26],
      [-6.0, 0], [6.0, 0],
      [-6.0, -28], [6.0, -28],
      [-6.2, -53], [6.2, -53],
      [-6.2, -75], [6.2, -75],
      [-8.0, -105], [8.0, -105],
      [35, -8], [65, -8], [95, -10],
      [-35, -1], [-78, 2], [-112, 16]
    ];

    const pillarMatrices = [];
    const flameMatrices = [];
    const dummy = new THREE.Object3D();

    torchCoords.forEach(([tx, tz]) => {
      const ty = getTerrainHeight(tx, tz);

      // Stand base
      dummy.position.set(tx, ty + 1.1, tz);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      pillarMatrices.push(dummy.matrix.clone());

      // Flame cone
      dummy.position.set(tx, ty + 2.55, tz);
      dummy.updateMatrix();
      flameMatrices.push(dummy.matrix.clone());

      this.torchPositions.push({ x: tx, y: ty + 2.9, z: tz });

      this.colliders.push({
        type: 'circle',
        x: tx,
        z: tz,
        radius: 0.52,
        yMin: -2.0,
        yMax: ty + 5.0
      });
    });

    this.createInstancedGroup(
      new THREE.BoxGeometry(0.85, 2.2, 0.85),
      this.brickMat,
      pillarMatrices,
      !this.isMobile,
      false
    );
    this.createInstancedGroup(
      new THREE.ConeGeometry(0.32, 0.78, 7),
      this.flameMat,
      flameMatrices,
      false,
      false
    );

    // 3 Pooled PointLights that dynamically track the 3 closest torches to the player
    const poolSize = 3;
    for (let i = 0; i < poolSize; i++) {
      const light = new THREE.PointLight('#ff8c2b', 1.4, 28, 1.5);
      const tPos = this.torchPositions[i] || { x: 0, y: 4, z: 136 };
      light.position.set(tPos.x, tPos.y, tPos.z);
      this.scene.add(light);
      this.torchLightPool.push(light);
    }
  }

  // 6. Historical Signposts / Prasasti Markers at the 10 Landmarks
  buildHistoricalSignposts() {
    const baseMatrices = [];
    const bodyMatrices = [];
    const dummy = new THREE.Object3D();
    const ringGeo = new THREE.RingGeometry(1.8, 2.15, 24);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: '#f9d976',
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.65
    });
    const emblemGeo = new THREE.OctahedronGeometry(0.38, 0);

    LANDMARKS.forEach((lm, idx) => {
      const y = getTerrainHeight(lm.position.x, lm.position.z);
      const baseY = Math.max(y, 1.6);

      dummy.position.set(lm.position.x, baseY + 0.25, lm.position.z);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      baseMatrices.push(dummy.matrix.clone());

      dummy.position.set(lm.position.x, baseY + 1.5, lm.position.z);
      dummy.updateMatrix();
      bodyMatrices.push(dummy.matrix.clone());

      const marker = new THREE.Group();
      marker.position.set(lm.position.x, baseY, lm.position.z);

      const goldEmblem = new THREE.Mesh(emblemGeo, this.goldMat);
      goldEmblem.position.y = 3.1;
      marker.add(goldEmblem);

      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.y = 0.12;
      marker.add(ring);

      this.scene.add(marker);
      this.beaconRings.push({
        ring,
        emblem: goldEmblem,
        phase: idx * 1.1,
        x: lm.position.x,
        z: lm.position.z
      });
    });

    this.createInstancedGroup(new THREE.BoxGeometry(1.8, 0.5, 1.2), this.brickMat, baseMatrices, false, false);
    this.createInstancedGroup(new THREE.BoxGeometry(1.2, 2.3, 0.45), this.rockMat, bodyMatrices, !this.isMobile, false);
  }

  // 7. Ambient Fireflies / Golden Dust Particles (Animated 100% on GPU Vertex Shader!)
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

    // GPU Vertex Shader floating oscillation (0% CPU cost!)
    mat.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = this.vegetationUniforms.uTime;
      shader.vertexShader = 'uniform float uTime;\n' + shader.vertexShader;
      shader.vertexShader = shader.vertexShader.replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        transformed.y += sin(uTime * 1.5 + position.x * 0.45 + position.z * 0.45) * 0.55;`
      );
    };

    this.particles = new THREE.Points(geo, mat);
    this.scene.add(this.particles);
  }

  updateNearestTorches(playerPos) {
    const px = playerPos.x;
    const pz = playerPos.z;
    if ((px - this._lastLightPlayerX) ** 2 + (pz - this._lastLightPlayerZ) ** 2 < 2.25) {
      return;
    }
    this._lastLightPlayerX = px;
    this._lastLightPlayerZ = pz;

    let d0 = Infinity, d1 = Infinity, d2 = Infinity;
    let i0 = 0, i1 = 1, i2 = 2;

    for (let i = 0; i < this.torchPositions.length; i++) {
      const tp = this.torchPositions[i];
      const dSq = (tp.x - px) ** 2 + (tp.z - pz) ** 2;
      if (dSq < d0) {
        d2 = d1; i2 = i1;
        d1 = d0; i1 = i0;
        d0 = dSq; i0 = i;
      } else if (dSq < d1) {
        d2 = d1; i2 = i1;
        d1 = dSq; i1 = i;
      } else if (dSq < d2) {
        d2 = dSq; i2 = i;
      }
    }

    this._nearestTorchIdx[0] = i0;
    this._nearestTorchIdx[1] = i1;
    this._nearestTorchIdx[2] = i2;

    for (let k = 0; k < this.torchLightPool.length; k++) {
      const tp = this.torchPositions[this._nearestTorchIdx[k]];
      if (tp) {
        this.torchLightPool[k].position.set(tp.x, tp.y, tp.z);
      }
    }
  }

  update(elapsedTime, torchIntensity = 1.2, playerPos = null) {
    // 1. Single uniform update drives ALL 26 torch flames + ALL 260 fireflies on GPU!
    this.vegetationUniforms.uTime.value = elapsedTime;

    // 2. Pooled dynamic PointLights (only 3 lights, snapped to nearest torches)
    if (playerPos) {
      this.updateNearestTorches(playerPos);
    }
    for (let i = 0; i < this.torchLightPool.length; i++) {
      const flicker = 0.9 + Math.sin(elapsedTime * 9 + i) * 0.12;
      this.torchLightPool[i].intensity = torchIntensity * flicker;
    }

    // 3. Distance-culled beacon animation (only animate beacons within 65m of player)
    for (const b of this.beaconRings) {
      if (playerPos) {
        const dSq = (b.x - playerPos.x) ** 2 + (b.z - playerPos.z) ** 2;
        if (dSq > 4225) continue;
      }
      b.emblem.rotation.y = elapsedTime * 1.4 + b.phase;
      b.emblem.position.y = 3.1 + Math.sin(elapsedTime * 2.5 + b.phase) * 0.18;
      const pulse = 1.0 + Math.sin(elapsedTime * 2.2 + b.phase) * 0.1;
      b.ring.scale.set(pulse, pulse, 1);
    }
  }
}
