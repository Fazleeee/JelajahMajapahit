import * as THREE from 'three';
import { WORLD_SIZE, BRIDGES, ARCH_COLLIDERS } from './WorldData.js';

// Deterministic pseudo-noise helper
function hash2D(x, z) {
  const s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453123;
  return s - Math.floor(s);
}

function smoothNoise(x, z) {
  const ix = Math.floor(x);
  const iz = Math.floor(z);
  const fx = x - ix;
  const fz = z - iz;
  const ux = fx * fx * (3.0 - 2.0 * fx);
  const uz = fz * fz * (3.0 - 2.0 * fz);

  const a = hash2D(ix, iz);
  const b = hash2D(ix + 1, iz);
  const c = hash2D(ix, iz + 1);
  const d = hash2D(ix + 1, iz + 1);

  return a + (b - a) * ux + (c - a) * uz + (a - b - c + d) * ux * uz;
}

export function fbmNoise(x, z) {
  let val = 0;
  let amp = 0.5;
  let freq = 0.022;
  for (let i = 0; i < 4; i++) {
    val += amp * smoothNoise(x * freq, z * freq);
    freq *= 2.05;
    amp *= 0.48;
  }
  return val;
}

// River centerline Z for a given X
export function getRiverCenterZ(x) {
  return 70 + Math.sin(x * 0.022) * 8 + Math.cos(x * 0.011) * 4;
}

// Check if (x,z) is on a main road
export function getRoadFactor(x, z) {
  let road = 0;

  // North-South Royal Avenue (Hutan Tarik -> Pasar -> Kedaton) along X = 0, Z from -130 to 160
  if (z >= -135 && z <= 165) {
    const distNS = Math.abs(x - Math.sin(z * 0.02) * 2.5);
    if (distNS < 5.2) {
      road = Math.max(road, 1.0 - Math.max(0, (distNS - 2.8) / 2.4));
    }
  }

  // East-West Road (Dermaga Jung <- Pasar -> Lembah Candi) around Z = -4
  if (x >= -140 && x <= 125) {
    const targetZ = -4 + Math.sin(x * 0.025) * 4;
    const distEW = Math.abs(z - targetZ);
    if (distEW < 4.8) {
      road = Math.max(road, 1.0 - Math.max(0, (distEW - 2.4) / 2.4));
    }
  }

  // Southern forest trail to Pohon Maja Agung (-16, 132)
  const dxMaja = x + 16;
  const dzMaja = z - 132;
  const distMaja = Math.hypot(dxMaja, dzMaja);
  if (distMaja < 12) {
    road = Math.max(road, 0.85 * (1 - distMaja / 12));
  }

  return Math.min(1, road);
}

// Pure terrain elevation at (x, z)
export function getTerrainHeight(x, z) {
  // Base rolling hills
  const n = fbmNoise(x + 200, z + 200);
  let h = (n - 0.35) * 4.2 + 1.4;

  // Flatten central capital area (Pasar Kotaraja)
  const distCenter = Math.hypot(x, z - 5);
  if (distCenter < 68) {
    const flatFactor = 1 - Math.pow(distCenter / 68, 2);
    h = THREE.MathUtils.lerp(h, 1.65, flatFactor * 0.82);
  }

  // Zone 3: Lembah Candi & Sanggar Pujangga (Eastern Highland with Terraces)
  const dxHill = x - 112;
  const dzHill = z + 12;
  const distHill = Math.hypot(dxHill * 0.85, dzHill);
  if (distHill < 62) {
    // Jalur pendakian landai menuju Candi Bajang Ratu (z: -16..-4)
    if (x >= 70 && x <= 94.5 && Math.abs(z + 10) < 6.0) {
      const tRoad = (x - 70) / (94.5 - 70);
      h = THREE.MathUtils.lerp(1.65, 9.8, tRoad);
    } else if (x >= 92 && x <= 130 && z >= -22 && z <= 2) {
      // Pelataran rata di puncak bukit Candi Bajang Ratu & Sanggar Pujangga
      h = 9.8;
    } else {
      const t = 1 - distHill / 62;
      const rawHill = Math.pow(t, 1.35) * 9.5;
      const terraced = Math.floor(rawHill / 2.4) * 2.4 + (rawHill % 2.4) * 0.45;
      const isRamp = x < 108 && Math.abs(z + 10) < 11.5;
      h = Math.min(9.8, h + (isRamp ? rawHill * 0.85 : terraced));
    }
  }

  // Zone 5: Kedaton Agung Northern Plateau & Surrounding Defensive Moat
  if (z < -52) {
    const inMoatZ = z > -73 && z < -55;
    const inMoatX = Math.abs(x) < 68;
    const inKedatonCore = z <= -73 && z > -158 && Math.abs(x) < 64;

    if (inMoatZ && inMoatX) {
      // Moat trench around south wall of Kedaton
      const moatDepth = Math.sin(((z + 73) / 18) * Math.PI);
      h = 1.4 - moatDepth * 3.2;
    } else if (inKedatonCore) {
      h = 3.5 + (n - 0.45) * 0.6;
    }
  }

  // Zone 2: Kolam Segaran (Ancient Rectangular Reservoir at x: -68..-36, z: -20..30)
  if (x > -70 && x < -34 && z > -22 && z < 32) {
    const bx = Math.min(x - (-70), -34 - x);
    const bz = Math.min(z - (-22), 32 - z);
    const borderDist = Math.min(bx, bz);
    if (borderDist > 4.2) {
      // Deep water basin
      h = -1.6;
    } else if (borderDist > 2.2) {
      // Undakan miring di tepi dalam kolam agar mudah naik dari segala sisi
      const slopeT = (4.2 - borderDist) / 2.0;
      h = THREE.MathUtils.lerp(-0.4, 2.05, slopeT);
    } else {
      // Raised red-brick embankment around Kolam Segaran
      h = 2.05;
    }
  }

  // Zone 1/2 Boundary: Sungai Brantas River Valley
  const riverZ = getRiverCenterZ(x);
  const distRiver = Math.abs(z - riverZ);
  if (distRiver < 16) {
    const riverProfile = Math.cos((distRiver / 16) * (Math.PI * 0.5));
    h = THREE.MathUtils.lerp(h, -2.2, Math.pow(riverProfile, 1.5));
  }

  // Zone 4: Western Canal / Dermaga Jung Harbor Basin (x < -122, z between -25 and 75)
  if (x < -118 && z > -28 && z < 78) {
    const canalDist = Math.min(-118 - x, 25);
    const tCanal = canalDist / 25;
    h = THREE.MathUtils.lerp(h, -1.9, Math.min(1, tCanal * 1.4));
  }

  // Outer world border mountains (natural boundary around the 440x440 map)
  const edgeDist = Math.max(Math.abs(x), Math.abs(z));
  if (edgeDist > 175) {
    const borderT = (edgeDist - 175) / 45;
    h += Math.pow(borderT, 1.8) * 18 * (0.7 + 0.6 * n);
  }

  return h;
}

// Walkable height including Bridges and Decks
export function getWalkableHeight(x, z) {
  let h = getTerrainHeight(x, z);

  // Check if player is on any bridge
  for (const b of BRIDGES) {
    if (x >= b.xMin && x <= b.xMax && z >= b.zMin && z <= b.zMax) {
      const normZ = (z - b.zMin) / (b.zMax - b.zMin);
      const baseDeckY = THREE.MathUtils.lerp(b.yNorth, b.ySouth, normZ);
      const arch = Math.sin(normZ * Math.PI) * b.archHeight;
      const bridgeY = baseDeckY + arch;
      if (bridgeY > h) {
        h = bridgeY;
      }
    }
  }

  // Check if player is on Western Dermaga wooden pier (x: -134..-114, z: 12..26)
  if (x >= -135 && x <= -114 && z >= 12 && z <= 26) {
    h = Math.max(h, 1.85);
  }

  // Check Architectural Colliders (Candi Bajang Ratu, Kapal Jung, Kedaton Pendopo)
  for (const c of ARCH_COLLIDERS) {
    if (x >= c.xMin && x <= c.xMax && z >= c.zMin && z <= c.zMax) {
      if (c.type === 'box') {
        if (c.topY > h) h = c.topY;
      } else if (c.type === 'ramp') {
        const t = c.axis === 'x'
          ? (x - c.xMin) / (c.xMax - c.xMin)
          : (z - c.zMin) / (c.zMax - c.zMin);
        const rampY = c.yStart + t * (c.yEnd - c.yStart);
        if (rampY > h) h = rampY;
      }
    }
  }

  return h;
}

export class TerrainSystem {
  constructor(scene) {
    this.scene = scene;
    this.waterMeshes = [];
    this.buildTerrainMesh();
    this.buildWaterBodies();
    this.buildKolamSegaranWalls();
    this.buildBridgesAndPier();
  }

  buildTerrainMesh() {
    const segments = 220;
    const geo = new THREE.PlaneGeometry(WORLD_SIZE, WORLD_SIZE, segments, segments);
    geo.rotateX(-Math.PI / 2);

    const posAttr = geo.attributes.position;
    const colors = new Float32Array(posAttr.count * 3);

    const cDeepMud = new THREE.Color('#3b2f26');
    const cSandBank = new THREE.Color('#a68b5b');
    const cLushGrass = new THREE.Color('#3e7a37');
    const cForestGrass = new THREE.Color('#2d5e29');
    const cHighlandGrass = new THREE.Color('#5c8238');
    const cTerracottaRoad = new THREE.Color('#9e5236');
    const cTempleStone = new THREE.Color('#786b5e');
    const cMountainRock = new THREE.Color('#574f47');
    const tempColor = new THREE.Color();

    for (let i = 0; i < posAttr.count; i++) {
      const vx = posAttr.getX(i);
      const vz = posAttr.getZ(i);
      const vy = getTerrainHeight(vx, vz);
      posAttr.setY(i, vy);

      const n = fbmNoise(vx * 1.4, vz * 1.4);
      const roadFactor = getRoadFactor(vx, vz);

      if (vy < -0.3) {
        tempColor.copy(cDeepMud);
      } else if (vy < 0.75) {
        tempColor.copy(cSandBank).lerp(cLushGrass, (vy + 0.3) / 1.05);
      } else if (vy > 8.5) {
        tempColor.copy(cTempleStone).lerp(cMountainRock, Math.min(1, (vy - 8.5) / 10));
      } else if (vz > 75) {
        // Hutan Tarik lush deep forest green
        tempColor.copy(cForestGrass).lerp(cLushGrass, n);
      } else if (vx > 65) {
        // Lembah Candi highland moss & stone
        tempColor.copy(cHighlandGrass).lerp(cTempleStone, Math.min(1, (vy - 2.0) / 8.0));
      } else {
        tempColor.copy(cLushGrass).lerp(cHighlandGrass, n * 0.65);
      }

      // Blend Royal Terracotta/Dirt Roads on dry land
      if (roadFactor > 0.05 && vy > 0.6) {
        tempColor.lerp(cTerracottaRoad, roadFactor * 0.85);
      }

      colors[i * 3] = tempColor.r;
      colors[i * 3 + 1] = tempColor.g;
      colors[i * 3 + 2] = tempColor.b;
    }

    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.computeVertexNormals();

    const mat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.92,
      metalness: 0.04,
      flatShading: true
    });

    this.terrainMesh = new THREE.Mesh(geo, mat);
    this.terrainMesh.receiveShadow = true;
    this.scene.add(this.terrainMesh);
  }

  buildWaterBodies() {
    // Shared animated water material
    this.waterMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#1f6e7a'),
      emissive: new THREE.Color('#09252c'),
      roughness: 0.18,
      metalness: 0.55,
      transparent: true,
      opacity: 0.86
    });

    // Main water plane covering river, Kolam Segaran, western harbor, and moat
    const waterGeo = new THREE.PlaneGeometry(WORLD_SIZE, WORLD_SIZE, 90, 90);
    waterGeo.rotateX(-Math.PI / 2);

    this.waterMesh = new THREE.Mesh(waterGeo, this.waterMaterial);
    this.waterMesh.position.y = 0.25;
    this.waterMesh.receiveShadow = true;
    this.scene.add(this.waterMesh);

    // Store initial water vertices for wave animation
    this.waterPosAttr = waterGeo.attributes.position;
  }

  buildKolamSegaranWalls() {
    // Iconic Majapahit Red-Brick Walls surrounding Kolam Segaran (x: -70..-34, z: -22..32)
    const brickMat = new THREE.MeshStandardMaterial({
      color: '#a83e2b',
      roughness: 0.85,
      flatShading: true
    });

    const capMat = new THREE.MeshStandardMaterial({
      color: '#c95b42',
      roughness: 0.8
    });

    const group = new THREE.Group();

    const walls = [
      { x: -52, z: -21.5, w: 36, d: 2.2 },   // North rim
      { x: -63.0, z: 31.5, w: 14, d: 2.2 },  // South rim West half (leaves z=31.5, x=-56..-48 open for stairs)
      { x: -41.0, z: 31.5, w: 14, d: 2.2 },  // South rim East half
      { x: -69.5, z: 5, w: 2.2, d: 55 },     // West rim
      { x: -34.5, z: -10.5, w: 2.2, d: 24 }, // East rim North half (leaves x=-34.5, z=1..9 open for stairs)
      { x: -34.5, z: 20.5, w: 2.2, d: 24 }   // East rim South half
    ];

    for (const w of walls) {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w.w, 2.8, w.d), brickMat);
      mesh.position.set(w.x, 1.1, w.z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      group.add(mesh);

      const cap = new THREE.Mesh(new THREE.BoxGeometry(w.w + 0.3, 0.35, w.d + 0.3), capMat);
      cap.position.set(w.x, 2.55, w.z);
      group.add(cap);
    }

    // Undakan Tangga Bata Merah Kolam Segaran (Sisi Timur & Sisi Selatan)
    for (let s = 0; s < 8; s++) {
      // Tangga Timur (x: -41.5 naik ke -34.5, z: 5)
      const stepEast = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.35, 7.6), capMat);
      stepEast.position.set(-41.5 + s * 1.0, -0.2 + s * 0.31, 5.0);
      stepEast.receiveShadow = true;
      group.add(stepEast);

      // Tangga Selatan (z: 24.5 naik ke 31.5, x: -52)
      const stepSouth = new THREE.Mesh(new THREE.BoxGeometry(7.6, 0.35, 1.1), capMat);
      stepSouth.position.set(-52.0, -0.2 + s * 0.31, 24.5 + s * 1.0);
      stepSouth.receiveShadow = true;
      group.add(stepSouth);
    }

    // Pilar Pengapit Tangga Kolam Segaran
    const stairPillars = [
      [-34.5, 1.0], [-34.5, 9.0],
      [-56.0, 31.5], [-48.0, 31.5]
    ];
    for (const [px, pz] of stairPillars) {
      const sp = new THREE.Mesh(new THREE.BoxGeometry(2.6, 3.6, 2.6), brickMat);
      sp.position.set(px, 1.6, pz);
      sp.castShadow = true;
      group.add(sp);
    }

    // Corner Majapahit Terracotta Pillars with Torch Braziers on Kolam Segaran
    const corners = [
      [-69.5, -21.5], [-34.5, -21.5],
      [-69.5, 31.5], [-34.5, 31.5]
    ];
    for (const [cx, cz] of corners) {
      const pillar = new THREE.Mesh(new THREE.BoxGeometry(3.2, 4.2, 3.2), brickMat);
      pillar.position.set(cx, 1.9, cz);
      pillar.castShadow = true;
      group.add(pillar);
    }

    this.scene.add(group);
  }

  buildBridgesAndPier() {
    const woodMat = new THREE.MeshStandardMaterial({
      color: '#6b4423',
      roughness: 0.88
    });
    const darkWoodMat = new THREE.MeshStandardMaterial({
      color: '#472b14',
      roughness: 0.9
    });
    const brickMat = new THREE.MeshStandardMaterial({
      color: '#9e3b28',
      roughness: 0.82
    });

    const bridgeGroup = new THREE.Group();

    for (const b of BRIDGES) {
      const width = b.xMax - b.xMin;
      const length = b.zMax - b.zMin;
      const centerX = (b.xMin + b.xMax) * 0.5;
      const steps = 18;
      const segLen = length / steps;

      for (let i = 0; i < steps; i++) {
        const z0 = b.zMin + (i + 0.5) * segLen;
        const normZ = (i + 0.5) / steps;
        const baseDeckY = THREE.MathUtils.lerp(b.yNorth, b.ySouth, normZ);
        const arch = Math.sin(normZ * Math.PI) * b.archHeight;
        const y0 = baseDeckY + arch;

        const plank = new THREE.Mesh(
          new THREE.BoxGeometry(width, 0.35, segLen * 0.94),
          woodMat
        );
        plank.position.set(centerX, y0 - 0.15, z0);
        plank.castShadow = true;
        plank.receiveShadow = true;
        bridgeGroup.add(plank);

        // Side posts every 3 planks
        if (i % 3 === 0 || i === steps - 1) {
          for (const side of [-1, 1]) {
            const post = new THREE.Mesh(
              new THREE.BoxGeometry(0.45, 2.4, 0.45),
               i === 0 || i === steps - 1 ? brickMat : darkWoodMat
            );
            post.position.set(centerX + side * (width * 0.5 - 0.3), y0 + 0.8, z0);
            post.castShadow = true;
            bridgeGroup.add(post);
          }
        }
      }

      // Support piers into riverbed
      for (const frac of [0.2, 0.5, 0.8]) {
        const pz = b.zMin + frac * length;
        for (const side of [-1, 1]) {
          const pier = new THREE.Mesh(
            new THREE.CylinderGeometry(0.45, 0.55, 6, 8),
            darkWoodMat
          );
          pier.position.set(centerX + side * (width * 0.38), 0.5, pz);
          bridgeGroup.add(pier);
        }
      }
    }

    // Western Dermaga Jung Wooden Pier (x: -135..-114, z: 12..26)
    const pierDeck = new THREE.Mesh(new THREE.BoxGeometry(22, 0.45, 14), woodMat);
    pierDeck.position.set(-124.5, 1.65, 19);
    pierDeck.castShadow = true;
    pierDeck.receiveShadow = true;
    bridgeGroup.add(pierDeck);

    for (let px = -133; px <= -116; px += 5.5) {
      for (const pz of [13, 25]) {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.45, 5.2, 8), darkWoodMat);
        post.position.set(px, 0.6, pz);
        bridgeGroup.add(post);
      }
    }

    // Stepping stones across the western shallow bend of Sungai Brantas (around x = -52, z = 58..80)
    const stoneMat = new THREE.MeshStandardMaterial({ color: '#78726a', roughness: 0.9, flatShading: true });
    for (let sz = 57; sz <= 81; sz += 3.2) {
      const stone = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.5, 1.2, 7), stoneMat);
      stone.position.set(-52 + Math.sin(sz * 0.5) * 1.2, 0.05, sz);
      stone.receiveShadow = true;
      bridgeGroup.add(stone);
    }

    this.scene.add(bridgeGroup);
  }

  update(elapsedTime) {
    // Gentle ripple animation on water vertices (direct TypedArray access for 4x faster loop)
    const pos = this.waterPosAttr;
    const arr = pos.array;
    const t1 = elapsedTime * 1.8;
    const t2 = elapsedTime * 1.4;
    for (let i = 0, len = arr.length; i < len; i += 3) {
      const x = arr[i];
      const z = arr[i + 2];
      arr[i + 1] = Math.sin(x * 0.12 + t1) * 0.07 + Math.cos(z * 0.15 + t2) * 0.06;
    }
    pos.needsUpdate = true;
  }
}
