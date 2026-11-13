import * as THREE from 'three';

/**
 * Prolog 3D: Laboratorium Kronos Nusantara & Portal Ruang-Waktu
 * Urutan fase:
 *  - 'INTRO'     : Kamera mengorbit lembut di dalam lab di balik layar intro
 *  - 'LAB'       : Pemain bebas berjalan di Lab 3D (WASD / Joystick) menuju Portal di depan
 *  - 'SUCK'      : Pemain mendekati portal -> terhisap ke pusat pusaran ruang-waktu
 *  - 'WORMHOLE'  : Animasi terlempar melintasi lorong ruang-waktu & hitungan mundur tahun (2026 -> 1350 M)
 *  - 'ARRIVAL'   : Kilatan transisi & pendaratan dramatis ke Hutan Tarik Majapahit 1350 M
 *  - 'MAJAPAHIT' : Prolog selesai, kendali penuh di dunia terbuka Majapahit
 */
export class TimeLabPrologue {
  constructor(isMobile = false) {
    this.isMobile = isMobile;
    this.phase = 'INTRO'; // INTRO | LAB | SUCK | WORMHOLE | ARRIVAL | MAJAPAHIT
    this.phaseTimer = 0;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#070b18');
    this.scene.fog = new THREE.FogExp2('#070b18', 0.018);

    this.labGroup = new THREE.Group();
    this.wormholeGroup = new THREE.Group();
    this.wormholeGroup.visible = false;
    this.scene.add(this.labGroup);
    this.scene.add(this.wormholeGroup);

    this.portalPos = new THREE.Vector3(0, 2.75, -8.5);
    this.spawnPos = new THREE.Vector3(0, 0, 8.6);
    this.suckStartPos = new THREE.Vector3();
    this.suckStartRotY = 0;

    // Animated references
    this.chronoRings = [];
    this.holoSurya = null;
    this.portalMotes = null;
    this.wormholeRings = [];
    this.wormholeStars = null;
    this.floorGuidePulse = null;
    this.floorPulseMats = [];

    this._scratchVec = new THREE.Vector3();
    this._scratchTarget = new THREE.Vector3();

    this.shaderUniforms = {
      uTime: { value: 0 },
      uIntensity: { value: 1.0 }
    };

    this.initLights();
    this.buildLaboratoryRoom();
    this.buildTimePortal();
    this.buildWormholeTunnel();
  }

  initLights() {
    const hemi = new THREE.HemisphereLight('#86d9ff', '#1b1429', 1.15);
    this.scene.add(hemi);

    const keyLight = new THREE.DirectionalLight('#e8f4ff', 1.45);
    keyLight.position.set(6, 11, 8);
    keyLight.castShadow = !this.isMobile;
    if (!this.isMobile) {
      keyLight.shadow.mapSize.set(1024, 1024);
      keyLight.shadow.camera.near = 1;
      keyLight.shadow.camera.far = 36;
      keyLight.shadow.camera.left = -14;
      keyLight.shadow.camera.right = 14;
      keyLight.shadow.camera.top = 14;
      keyLight.shadow.camera.bottom = -14;
    }
    this.scene.add(keyLight);

    // Cahaya portal cyan-emas yang berdenyut hidup
    this.portalLight = new THREE.PointLight('#4ee2ec', 5.2, 24, 1.5);
    this.portalLight.position.set(0, 3.0, -7.8);
    this.labGroup.add(this.portalLight);

    const rearWarmLight = new THREE.PointLight('#f0be43', 2.6, 20, 1.5);
    rearWarmLight.position.set(0, 5.8, 7.5);
    this.labGroup.add(rearWarmLight);

    // Cahaya dramatis di dalam lorong wormhole
    this.wormholeLightFront = new THREE.PointLight('#52ebff', 4.5, 32, 1.2);
    this.wormholeLightFront.position.set(0, 2.5, -10);
    this.wormholeGroup.add(this.wormholeLightFront);

    this.wormholeLightGold = new THREE.PointLight('#ffd269', 3.5, 28, 1.2);
    this.wormholeLightGold.position.set(0, -1.5, 4);
    this.wormholeGroup.add(this.wormholeLightGold);
  }

  createDisplayTexture(line1, line2, accent = '#4ee2ec') {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#071324';
    ctx.fillRect(0, 0, 512, 256);

    ctx.strokeStyle = accent;
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, 492, 236);

    ctx.fillStyle = 'rgba(78, 226, 236, 0.12)';
    for (let y = 26; y < 235; y += 22) {
      ctx.fillRect(16, y, 480, 1);
    }

    ctx.font = 'bold 28px "Cinzel", serif';
    ctx.fillStyle = '#fbe288';
    ctx.textAlign = 'center';
    ctx.fillText(line1, 256, 106);

    ctx.font = '600 22px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = accent;
    ctx.fillText(line2, 256, 158);

    // Radar circle graphic
    ctx.strokeStyle = '#fbe288';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(82, 128, 34, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(430, 128, 34, 0, Math.PI * 2);
    ctx.stroke();

    const tex = new THREE.CanvasTexture(canvas);
    return tex;
  }

  buildLaboratoryRoom() {
    const matDarkMetal = new THREE.MeshStandardMaterial({
      color: '#171d2e',
      roughness: 0.42,
      metalness: 0.65
    });
    const matWallPanel = new THREE.MeshStandardMaterial({
      color: '#1e263b',
      roughness: 0.55,
      metalness: 0.45
    });
    const matBronzeGold = new THREE.MeshStandardMaterial({
      color: '#e0ae3c',
      emissive: '#3d2807',
      roughness: 0.32,
      metalness: 0.78
    });
    const matCyanNeon = new THREE.MeshBasicMaterial({ color: '#4ee2ec' });
    const matGoldNeon = new THREE.MeshBasicMaterial({ color: '#ffd466' });
    const matGlass = new THREE.MeshPhysicalMaterial({
      color: '#73ecff',
      transparent: true,
      opacity: 0.24,
      roughness: 0.1,
      metalness: 0.15
    });

    // 1. Lantai Laboratorium Futuristik + Kisi Energi Lantai
    const floorGeo = new THREE.PlaneGeometry(24, 28);
    floorGeo.rotateX(-Math.PI / 2);
    const floorMat = new THREE.MeshStandardMaterial({
      color: '#0e1424',
      roughness: 0.32,
      metalness: 0.55
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.receiveShadow = true;
    this.labGroup.add(floor);

    const grid = new THREE.GridHelper(24, 24, '#36b5c4', '#182b45');
    grid.position.y = 0.015;
    this.labGroup.add(grid);

    // Jalur Pemandu Bercahaya Menuju Portal (Center Aisle Chevron Strips)
    for (const side of [-1.75, 1.75]) {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.04, 15.5), matCyanNeon);
      rail.position.set(side, 0.025, 2.2);
      this.labGroup.add(rail);
    }

    for (let zStep = 7.2; zStep >= -3.2; zStep -= 2.0) {
      const stripMat = new THREE.MeshBasicMaterial({
        color: '#52ebff',
        transparent: true,
        opacity: 0.55
      });
      this.floorPulseMats.push({ mat: stripMat, phase: -zStep * 0.45 });
      const strip = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.03, 0.22), stripMat);
      strip.position.set(0, 0.02, zStep);
      this.labGroup.add(strip);
    }

    // 2. Dinding Samping, Dinding Belakang & Langit-Langit Berbingkai Rib
    const wallLeft = new THREE.Mesh(new THREE.BoxGeometry(0.8, 9.2, 28), matWallPanel);
    wallLeft.position.set(-11.8, 4.6, 0);
    this.labGroup.add(wallLeft);

    const wallRight = new THREE.Mesh(new THREE.BoxGeometry(0.8, 9.2, 28), matWallPanel);
    wallRight.position.set(11.8, 4.6, 0);
    this.labGroup.add(wallRight);

    const wallBack = new THREE.Mesh(new THREE.BoxGeometry(24, 9.2, 0.8), matWallPanel);
    wallBack.position.set(0, 4.6, -13.8);
    this.labGroup.add(wallBack);

    const wallSouth = new THREE.Mesh(new THREE.BoxGeometry(24, 9.2, 0.8), matWallPanel);
    wallSouth.position.set(0, 4.6, 13.8);
    this.labGroup.add(wallSouth);

    const ceiling = new THREE.Mesh(new THREE.BoxGeometry(24, 0.6, 28), matDarkMetal);
    ceiling.position.set(0, 9.4, 0);
    this.labGroup.add(ceiling);

    // Balok Lengkung Struktural Ruangan & Lampu Neon Atas
    for (let rz = -10; rz <= 10; rz += 5) {
      for (const side of [-11.1, 11.1]) {
        const rib = new THREE.Mesh(new THREE.BoxGeometry(0.65, 9.0, 0.75), matDarkMetal);
        rib.position.set(side, 4.5, rz);
        this.labGroup.add(rib);

        const strip = new THREE.Mesh(new THREE.BoxGeometry(0.12, 6.2, 0.16), rz === -10 ? matGoldNeon : matCyanNeon);
        strip.position.set(side - Math.sign(side) * 0.34, 4.2, rz);
        this.labGroup.add(strip);
      }

      const ceilBeam = new THREE.Mesh(new THREE.BoxGeometry(22.4, 0.48, 0.7), matDarkMetal);
      ceilBeam.position.set(0, 8.9, rz);
      this.labGroup.add(ceilBeam);

      const ceilLight = new THREE.Mesh(new THREE.BoxGeometry(9.0, 0.08, 0.24), matCyanNeon);
      ceilLight.position.set(0, 8.64, rz);
      this.labGroup.add(ceilLight);
    }

    // 3. Sayap Kiri (-7.6): Vitrin Hologram Cakra Surya Majapahit & Tabung Riset
    const holoPedestal = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.65, 1.15, 8), matDarkMetal);
    holoPedestal.position.set(-7.6, 0.58, -1.2);
    this.labGroup.add(holoPedestal);

    const holoTrim = new THREE.Mesh(new THREE.TorusGeometry(1.32, 0.08, 8, 24), matCyanNeon);
    holoTrim.rotation.x = Math.PI / 2;
    holoTrim.position.set(-7.6, 1.18, -1.2);
    this.labGroup.add(holoTrim);

    const holoGlass = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 2.3, 16, 1, true), matGlass);
    holoGlass.position.set(-7.6, 2.35, -1.2);
    this.labGroup.add(holoGlass);

    // Hologram Surya Majapahit 8-Sinar Melayang di dalam Vitrin
    this.holoSurya = new THREE.Group();
    this.holoSurya.position.set(-7.6, 2.35, -1.2);
    const coreGem = new THREE.Mesh(new THREE.OctahedronGeometry(0.45, 0), matBronzeGold);
    this.holoSurya.add(coreGem);
    const ringHolo = new THREE.Mesh(new THREE.TorusGeometry(0.68, 0.05, 8, 24), matGoldNeon);
    this.holoSurya.add(ringHolo);
    for (let r = 0; r < 8; r++) {
      const ang = (r / 8) * Math.PI * 2;
      const spike = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.42, 4), matGoldNeon);
      spike.position.set(Math.cos(ang) * 0.92, Math.sin(ang) * 0.92, 0);
      spike.rotation.z = ang - Math.PI / 2;
      this.holoSurya.add(spike);
    }
    this.labGroup.add(this.holoSurya);

    // Rak Komputer / Tabung Energi di Dinding Kiri
    for (const tz of [-5.2, 3.2]) {
      const podBase = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.85, 0.7, 12), matDarkMetal);
      podBase.position.set(-8.8, 0.35, tz);
      this.labGroup.add(podBase);
      const podTube = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.52, 3.6, 14), matGlass);
      podTube.position.set(-8.8, 2.5, tz);
      this.labGroup.add(podTube);
      const podCore = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 3.2, 10), matCyanNeon);
      podCore.position.set(-8.8, 2.4, tz);
      this.labGroup.add(podCore);
    }

    // 4. Sayap Kanan (+7.6): Konsol Kontrol Kronos & Pemindai Lontar Nagarakretagama
    const consoleDesk = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.05, 4.8), matDarkMetal);
    consoleDesk.position.set(7.8, 0.52, -1.2);
    consoleDesk.castShadow = true;
    this.labGroup.add(consoleDesk);

    const screenTex = this.createDisplayTexture(
      'KRONOS-1350 AKTIF',
      'KOORDINAT: TROWULAN • HUTAN TARIK',
      '#4ee2ec'
    );
    const screenMat = new THREE.MeshBasicMaterial({ map: screenTex });
    const monitorGroup = new THREE.Group();
    monitorGroup.position.set(8.6, 2.15, -1.2);
    monitorGroup.rotation.y = 0.22;

    const monitor = new THREE.Mesh(new THREE.BoxGeometry(0.14, 1.85, 3.8), matDarkMetal);
    monitorGroup.add(monitor);

    const monitorFace = new THREE.Mesh(new THREE.PlaneGeometry(3.55, 1.65), screenMat);
    monitorFace.position.set(-0.09, 0, 0);
    monitorFace.rotation.y = -Math.PI / 2;
    monitorGroup.add(monitorFace);
    this.labGroup.add(monitorGroup);

    // Konsol Pemindai Naskah Lontar Kuno di atas Meja
    const scannerPad = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.12, 1.5), matBronzeGold);
    scannerPad.position.set(7.4, 1.1, -1.2);
    this.labGroup.add(scannerPad);

    const lontarScroll = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.9, 8), matBronzeGold);
    lontarScroll.rotation.x = Math.PI / 2;
    lontarScroll.position.set(7.4, 1.24, -1.2);
    this.labGroup.add(lontarScroll);

    // Papan Layar Utama Portal di atas Portal (-8.5)
    const bannerTex = this.createDisplayTexture(
      'PORTAL RUANG-WAKTU',
      'TUJUAN: ERA MAJAPAHIT • 1350 M',
      '#ffd466'
    );
    const overheadSign = new THREE.Mesh(
      new THREE.PlaneGeometry(5.6, 1.8),
      new THREE.MeshBasicMaterial({ map: bannerTex })
    );
    overheadSign.position.set(0, 6.9, -8.3);
    this.labGroup.add(overheadSign);
  }

  buildTimePortal() {
    // Platform Undakan Altar Portal di z = -8.5 (Dapat didaki karakter!)
    const daisBase = new THREE.Mesh(
      new THREE.CylinderGeometry(4.8, 5.2, 0.28, 24),
      new THREE.MeshStandardMaterial({ color: '#1c2336', roughness: 0.4, metalness: 0.65 })
    );
    daisBase.position.set(0, 0.14, -8.5);
    daisBase.receiveShadow = true;
    this.labGroup.add(daisBase);

    const daisTop = new THREE.Mesh(
      new THREE.CylinderGeometry(3.7, 4.1, 0.28, 24),
      new THREE.MeshStandardMaterial({ color: '#27314a', roughness: 0.35, metalness: 0.7 })
    );
    daisTop.position.set(0, 0.42, -8.5);
    daisTop.receiveShadow = true;
    this.labGroup.add(daisTop);

    const matRimGold = new THREE.MeshStandardMaterial({
      color: '#e5b842',
      emissive: '#3d2a05',
      roughness: 0.3,
      metalness: 0.8
    });
    const matGlowCyan = new THREE.MeshBasicMaterial({ color: '#58f0ff' });

    const daisHalo = new THREE.Mesh(new THREE.TorusGeometry(3.72, 0.08, 8, 40), matGlowCyan);
    daisHalo.rotation.x = Math.PI / 2;
    daisHalo.position.set(0, 0.56, -8.5);
    this.labGroup.add(daisHalo);

    // Dua Pilar Penopang Mesin Portal
    for (const side of [-3.35, 3.35]) {
      const pylon = new THREE.Mesh(
        new THREE.BoxGeometry(0.95, 5.4, 1.25),
        new THREE.MeshStandardMaterial({ color: '#1c2438', roughness: 0.45, metalness: 0.65 })
      );
      pylon.position.set(side, 2.75, -8.5);
      pylon.castShadow = true;
      this.labGroup.add(pylon);

      const coil = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 4.2, 8), matRimGold);
      coil.position.set(side - Math.sign(side) * 0.46, 2.8, -8.5);
      this.labGroup.add(coil);

      const beaconOrb = new THREE.Mesh(new THREE.OctahedronGeometry(0.38, 0), matGlowCyan);
      beaconOrb.position.set(side, 5.65, -8.5);
      this.labGroup.add(beaconOrb);
    }

    // 3 Cincin Kronos Konsentris Berputar Berlawanan Arah
    const ring1 = new THREE.Group();
    ring1.position.copy(this.portalPos);
    ring1.add(new THREE.Mesh(new THREE.TorusGeometry(2.85, 0.16, 12, 48), matRimGold));
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2;
      const node = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.32, 0.4), matGlowCyan);
      node.position.set(Math.cos(a) * 2.85, Math.sin(a) * 2.85, 0);
      node.rotation.z = a;
      ring1.add(node);
    }
    this.labGroup.add(ring1);
    this.chronoRings.push({ mesh: ring1, speedZ: 0.42, speedX: 0 });

    const ring2 = new THREE.Group();
    ring2.position.copy(this.portalPos);
    ring2.add(new THREE.Mesh(new THREE.TorusGeometry(2.42, 0.08, 10, 44), matGlowCyan));
    this.labGroup.add(ring2);
    this.chronoRings.push({ mesh: ring2, speedZ: -0.95, speedX: 0.15 });

    const ring3 = new THREE.Group();
    ring3.position.copy(this.portalPos);
    ring3.add(new THREE.Mesh(new THREE.TorusGeometry(2.05, 0.055, 8, 40), matRimGold));
    this.labGroup.add(ring3);
    this.chronoRings.push({ mesh: ring3, speedZ: 1.35, speedX: -0.18 });

    // Cakrawala Peristiwa (Swirling Dimensional Event Horizon Shader!)
    const horizonGeo = new THREE.CircleGeometry(2.35, 48);
    const horizonMat = new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      transparent: true,
      uniforms: this.shaderUniforms,
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uIntensity;
        varying vec2 vUv;

        void main() {
          vec2 p = (vUv - 0.5) * 2.0;
          float r = length(p);
          if (r > 1.0) discard;

          float ang = atan(p.y, p.x);
          float swirl = sin(ang * 5.0 - r * 14.0 + uTime * 4.5);
          float pulse = 0.5 + 0.5 * sin(r * 18.0 - uTime * 6.0);
          float coreGlow = smoothstep(0.55, 0.0, r);
          float rimGlow = smoothstep(0.65, 1.0, r);

          vec3 cCyan = vec3(0.18, 0.88, 0.98);
          vec3 cDeep = vec3(0.08, 0.14, 0.42);
          vec3 cGold = vec3(1.0, 0.84, 0.36);

          vec3 col = mix(cDeep, cCyan, 0.45 + 0.35 * swirl + 0.25 * pulse);
          col = mix(col, cGold, coreGlow * 0.85 + rimGlow * 0.45);
          col *= (1.0 + uIntensity * 0.45);

          float alpha = smoothstep(1.0, 0.86, r) * (0.86 + 0.14 * pulse);
          gl_FragColor = vec4(col, alpha);
        }
      `
    });
    this.eventHorizon = new THREE.Mesh(horizonGeo, horizonMat);
    this.eventHorizon.position.copy(this.portalPos);
    this.labGroup.add(this.eventHorizon);

    // Partikel Energi Berpusar di Depan Portal
    const count = this.isMobile ? 65 : 110;
    const motePos = new Float32Array(count * 3);
    this.moteSeeds = [];
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const rad = 0.6 + Math.random() * 2.6;
      motePos[i * 3] = Math.cos(a) * rad;
      motePos[i * 3 + 1] = this.portalPos.y + Math.sin(a) * rad * 0.9;
      motePos[i * 3 + 2] = this.portalPos.z + (Math.random() - 0.3) * 3.5;
      this.moteSeeds.push({ a, rad, speed: 1.2 + Math.random() * 1.8 });
    }
    const moteGeo = new THREE.BufferGeometry();
    moteGeo.setAttribute('position', new THREE.BufferAttribute(motePos, 3));
    const moteMat = new THREE.PointsMaterial({
      color: '#9cf6ff',
      size: 0.14,
      transparent: true,
      opacity: 0.85
    });
    this.portalMotes = new THREE.Points(moteGeo, moteMat);
    this.labGroup.add(this.portalMotes);
  }

  buildWormholeTunnel() {
    // Terowongan Ruang-Waktu 3D Hyper-Vortex
    const tunnelGeo = new THREE.CylinderGeometry(7.5, 7.5, 140, 32, 32, true);
    tunnelGeo.rotateX(Math.PI / 2);

    const tunnelMat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      uniforms: this.shaderUniforms,
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        varying vec2 vUv;

        void main() {
          float angle = vUv.x * 6.28318 * 3.0;
          float depth = vUv.y * 18.0 - uTime * 9.5;
          float waves = sin(angle + depth) * 0.5 + 0.5;
          float streaks = sin(vUv.x * 38.0 + depth * 1.7) * 0.5 + 0.5;
          float energy = smoothstep(0.35, 0.95, waves * 0.65 + streaks * 0.45);

          vec3 colSpace = vec3(0.03, 0.05, 0.16);
          vec3 colCyan = vec3(0.18, 0.85, 0.98);
          vec3 colViolet = vec3(0.52, 0.24, 0.82);
          vec3 colGold = vec3(0.98, 0.78, 0.30);

          vec3 band = mix(colViolet, colCyan, waves);
          band = mix(band, colGold, smoothstep(0.75, 1.0, streaks) * 0.65);
          vec3 col = mix(colSpace, band, energy * 0.85);

          // Pusat ujung jauh bersinar keemasan (Majapahit beckoning!)
          float endGlow = smoothstep(0.25, 0.0, vUv.y);
          col = mix(col, colGold, endGlow * 0.8);

          gl_FragColor = vec4(col, 1.0);
        }
      `
    });
    const tunnel = new THREE.Mesh(tunnelGeo, tunnelMat);
    tunnel.position.set(0, 0, -45);
    this.wormholeGroup.add(tunnel);

    // 18 Cincin Dimensi Berkecepatan Tinggi
    const ringGeo = new THREE.TorusGeometry(4.8, 0.09, 8, 32);
    const ringMatCyan = new THREE.MeshBasicMaterial({ color: '#5ef2ff', transparent: true, opacity: 0.72 });
    const ringMatGold = new THREE.MeshBasicMaterial({ color: '#ffd966', transparent: true, opacity: 0.78 });

    for (let i = 0; i < 18; i++) {
      const mesh = new THREE.Mesh(ringGeo, i % 3 === 0 ? ringMatGold : ringMatCyan);
      mesh.position.set(0, 0, -90 + i * 5.8);
      this.wormholeGroup.add(mesh);
      this.wormholeRings.push(mesh);
    }

    // Garis Bintang Kecepatan Cahaya (Warp Stars)
    const starCount = this.isMobile ? 180 : 320;
    const sPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 1.8 + Math.random() * 4.8;
      sPos[i * 3] = Math.cos(a) * r;
      sPos[i * 3 + 1] = Math.sin(a) * r;
      sPos[i * 3 + 2] = -100 + Math.random() * 115;
    }
    const sGeo = new THREE.BufferGeometry();
    sGeo.setAttribute('position', new THREE.BufferAttribute(sPos, 3));
    const sMat = new THREE.PointsMaterial({ color: '#fff3c4', size: 0.22, transparent: true, opacity: 0.9 });
    this.wormholeStars = new THREE.Points(sGeo, sMat);
    this.wormholeGroup.add(this.wormholeStars);
  }

  // Sistem pijakan & rintangan di dalam Laboratorium
  getWalkableHeight(x, z) {
    const dist = Math.hypot(x, z - (-8.5));
    if (dist <= 3.7) return 0.56;
    if (dist <= 5.0) return 0.28;
    return 0;
  }

  canMoveTo(x, z) {
    if (Math.abs(x) > 9.6 || z < -11.6 || z > 11.8) return false;
    // Pilar portal kiri/kanan (di x = ±3.35, z = -8.5)
    for (const side of [-3.35, 3.35]) {
      if (Math.hypot(x - side, z - (-8.5)) < 1.25) return false;
    }
    // Vitrin kiri & tabung energi
    if (x < -5.8 && z > -6.5 && z < 4.5) return false;
    // Meja konsol kanan
    if (x > 6.1 && z > -4.2 && z < 1.8) return false;
    // Belakang portal
    if (z < -9.5 && Math.abs(x) < 4.5) return false;
    return true;
  }

  isNearPortalTrigger(pos) {
    const d = Math.hypot(pos.x - this.portalPos.x, pos.z - (-8.0));
    return d <= 3.55;
  }

  startLab() {
    this.phase = 'LAB';
    this.phaseTimer = 0;
    this.labGroup.visible = true;
    this.wormholeGroup.visible = false;
  }

  startSuction(playerPos, playerRotY) {
    if (this.phase !== 'LAB') return;
    this.phase = 'SUCK';
    this.phaseTimer = 0;
    this.suckStartPos.copy(playerPos);
    this.suckStartRotY = playerRotY;
  }

  enterWormhole() {
    this.phase = 'WORMHOLE';
    this.phaseTimer = 0;
    this.labGroup.visible = false;
    this.wormholeGroup.visible = true;
  }

  skipToArrival() {
    this.phase = 'ARRIVAL';
    this.phaseTimer = 0;
    this.wormholeGroup.visible = false;
    this.labGroup.visible = false;
  }

  finishPrologue() {
    this.phase = 'MAJAPAHIT';
    this.labGroup.visible = false;
    this.wormholeGroup.visible = false;
  }

  /**
   * Update visual Lab, Portal, Animasi Sedot, dan Terowongan Ruang-Waktu
   * Mengembalikan aksi transisi event ke controller utama bila fase berganti!
   */
  update(dt, elapsedTime, camera, characterRig, playerPos) {
    this.shaderUniforms.uTime.value = elapsedTime;

    // 1. Animasi Cincin Portal, Hologram & Strip Lantai
    for (const cr of this.chronoRings) {
      const boost = this.phase === 'SUCK' ? 3.8 : 1.0;
      cr.mesh.rotation.z += cr.speedZ * boost * dt;
      cr.mesh.rotation.x = Math.sin(elapsedTime * 1.4 + cr.speedX) * 0.14;
    }

    if (this.holoSurya) {
      this.holoSurya.rotation.y = elapsedTime * 0.9;
      this.holoSurya.position.y = 2.35 + Math.sin(elapsedTime * 2.2) * 0.12;
    }

    for (const fp of this.floorPulseMats) {
      fp.mat.opacity = 0.28 + 0.55 * (0.5 + 0.5 * Math.sin(elapsedTime * 4.5 + fp.phase));
    }

    if (this.portalLight) {
      const suckBoost = this.phase === 'SUCK' ? 3.5 : 0;
      this.portalLight.intensity = 4.6 + Math.sin(elapsedTime * 3.8) * 0.9 + suckBoost;
    }

    // Update partikel tersedot ke tengah portal
    if (this.portalMotes && this.labGroup.visible) {
      const mAttr = this.portalMotes.geometry.attributes.position;
      for (let i = 0; i < this.moteSeeds.length; i++) {
        const s = this.moteSeeds[i];
        const a = s.a + elapsedTime * s.speed;
        const r = Math.max(0.2, s.rad - ((elapsedTime * 0.9 + i * 0.1) % 2.4) * 0.65);
        mAttr.setXYZ(i, Math.cos(a) * r, this.portalPos.y + Math.sin(a) * r * 0.9, this.portalPos.z + Math.sin(elapsedTime * 2 + i) * 0.9);
      }
      mAttr.needsUpdate = true;
    }

    // 2. Fase INTRO: Kamera mengorbit tenang di Lab menampilkan karakter & Portal
    if (this.phase === 'INTRO') {
      const orbitA = Math.sin(elapsedTime * 0.25) * 0.32;
      camera.position.set(Math.sin(orbitA) * 5.8, 3.6 + Math.sin(elapsedTime * 0.4) * 0.25, 12.2);
      camera.lookAt(0, 2.3, -4.5);
      characterRig.group.position.copy(this.spawnPos);
      characterRig.group.rotation.y = 0;
      characterRig.update({ isMoving: false, isGrounded: true, isWater: false }, dt, elapsedTime);
      return null;
    }

    // 3. Fase SUCK: Terhisap masuk ke pusaran portal!
    if (this.phase === 'SUCK') {
      this.phaseTimer += dt;
      const t = Math.min(1, this.phaseTimer / 1.45);
      const easeIn = t * t * t;

      // Tarik & putar karakter naik menuju pusat cakrawala portal
      const spiralR = (1 - t) * 1.1;
      const spiralAng = t * Math.PI * 3.2;
      playerPos.lerpVectors(this.suckStartPos, this.portalPos, easeIn);
      playerPos.x += Math.sin(spiralAng) * spiralR * t;
      playerPos.y = THREE.MathUtils.lerp(this.suckStartPos.y, this.portalPos.y - 0.6, easeIn);

      characterRig.group.position.copy(playerPos);
      characterRig.group.rotation.y = this.suckStartRotY + t * Math.PI * 5;
      characterRig.group.rotation.x = t * 0.6;
      const scaleOut = Math.max(0.18, 1.0 - Math.max(0, t - 0.55) * 1.8);
      characterRig.group.scale.setScalar(scaleOut);
      characterRig.update({ isMoving: false, isGrounded: false, isWater: false }, dt, elapsedTime);

      // Kamera terseret maju + FOV melebar dramatis
      camera.fov = THREE.MathUtils.lerp(60, 82, easeIn);
      camera.updateProjectionMatrix();
      this._scratchTarget.set(0, 2.6, -2.5).lerp(new THREE.Vector3(0, 2.75, -6.4), easeIn);
      camera.position.lerp(this._scratchTarget, Math.min(1, dt * 8));
      camera.lookAt(0, 2.75, -8.5);

      if (t >= 1) {
        this.enterWormhole();
        return 'ENTER_WORMHOLE';
      }
      return null;
    }

    // 4. Fase WORMHOLE: Terlempar melintasi lorong ruang & waktu!
    if (this.phase === 'WORMHOLE') {
      this.phaseTimer += dt;
      const duration = 3.75;
      const t = Math.min(1, this.phaseTimer / duration);

      // Kembalikan skala karakter penuh & pose melayang membelah dimensi
      characterRig.group.scale.setScalar(1.0);
      const driftX = Math.sin(elapsedTime * 2.4) * 1.1;
      const driftY = Math.cos(elapsedTime * 2.1) * 0.75 - 0.3;
      characterRig.group.position.set(driftX, driftY, -4.5);
      characterRig.group.rotation.set(
        -0.9 + Math.sin(elapsedTime * 3.1) * 0.28,
        Math.PI + elapsedTime * 2.2,
        Math.cos(elapsedTime * 2.7) * 0.35
      );
      characterRig.update({ isMoving: false, isGrounded: false, isWater: false }, dt, elapsedTime);

      // Alirkan cincin & bintang warp berkecepatan tinggi ke arah kamera
      const warpSpeed = 38 + t * 26;
      for (const r of this.wormholeRings) {
        r.position.z += warpSpeed * dt;
        r.rotation.z += dt * 1.4;
        if (r.position.z > 12) {
          r.position.z -= 104.4;
        }
      }

      if (this.wormholeStars) {
        const stAttr = this.wormholeStars.geometry.attributes.position;
        for (let i = 0; i < stAttr.count; i++) {
          let sz = stAttr.getZ(i) + warpSpeed * 1.45 * dt;
          if (sz > 15) sz -= 115;
          stAttr.setZ(i, sz);
        }
        stAttr.needsUpdate = true;
      }

      // Kamera bergoyang halus mengikuti pusaran dengan FOV tinggi
      camera.fov = 82 + Math.sin(t * Math.PI) * 8;
      camera.updateProjectionMatrix();
      camera.position.set(
        Math.sin(elapsedTime * 3.2) * 0.35,
        Math.cos(elapsedTime * 2.6) * 0.28,
        2.6
      );
      camera.lookAt(driftX * 0.5, driftY * 0.5, -24);

      if (t >= 1) {
        this.phase = 'ARRIVAL';
        this.phaseTimer = 0;
        this.wormholeGroup.visible = false;
        this.labGroup.visible = false;
        return 'ARRIVE_MAJAPAHIT';
      }
      return { event: 'WORMHOLE_PROGRESS', progress: t };
    }

    return null;
  }
}
