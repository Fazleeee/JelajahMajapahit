import * as THREE from 'three';

export const TIME_PRESETS = {
  morning: {
    id: 'morning',
    label: 'Pagi Berkabut (07:00)',
    icon: '🌅',
    zenithColor: new THREE.Color('#2d6da3'),
    horizonColor: new THREE.Color('#f7c68a'),
    fogColor: new THREE.Color('#d9c3a5'),
    fogDensity: 0.0042,
    sunColor: new THREE.Color('#ffe1a8'),
    sunIntensity: 1.75,
    sunPosition: new THREE.Vector3(110, 62, 65),
    hemiSky: new THREE.Color('#9ec9ff'),
    hemiGround: new THREE.Color('#4d3c2c'),
    hemiIntensity: 0.72,
    waterColor: new THREE.Color('#287482'),
    torchIntensity: 0.4,
    starOpacity: 0.0
  },
  noon: {
    id: 'noon',
    label: 'Siang Khatulistiwa (12:00)',
    icon: '☀️',
    zenithColor: new THREE.Color('#1c64b5'),
    horizonColor: new THREE.Color('#9ad1f5'),
    fogColor: new THREE.Color('#b8d8eb'),
    fogDensity: 0.0028,
    sunColor: new THREE.Color('#fff9eb'),
    sunIntensity: 2.2,
    sunPosition: new THREE.Vector3(35, 145, 25),
    hemiSky: new THREE.Color('#b8e0ff'),
    hemiGround: new THREE.Color('#544633'),
    hemiIntensity: 0.9,
    waterColor: new THREE.Color('#1d7e91'),
    torchIntensity: 0.15,
    starOpacity: 0.0
  },
  sunset: {
    id: 'sunset',
    label: 'Sore Keemasan Trowulan (17:00)',
    icon: '🌇',
    zenithColor: new THREE.Color('#2b244d'),
    horizonColor: new THREE.Color('#e87a46'),
    fogColor: new THREE.Color('#c97a53'),
    fogDensity: 0.0044,
    sunColor: new THREE.Color('#ff9d52'),
    sunIntensity: 1.85,
    sunPosition: new THREE.Vector3(-125, 42, 50),
    hemiSky: new THREE.Color('#f59862'),
    hemiGround: new THREE.Color('#3b2316'),
    hemiIntensity: 0.68,
    waterColor: new THREE.Color('#2f5966'),
    torchIntensity: 1.6,
    starOpacity: 0.25
  },
  night: {
    id: 'night',
    label: 'Malam Obor Kerajaan (21:00)',
    icon: '🌙',
    zenithColor: new THREE.Color('#070b19'),
    horizonColor: new THREE.Color('#182442'),
    fogColor: new THREE.Color('#10182b'),
    fogDensity: 0.0052,
    sunColor: new THREE.Color('#7aa2e3'),
    sunIntensity: 0.55,
    sunPosition: new THREE.Vector3(-80, 95, -60),
    hemiSky: new THREE.Color('#263a66'),
    hemiGround: new THREE.Color('#14100d'),
    hemiIntensity: 0.35,
    waterColor: new THREE.Color('#0d2b38'),
    torchIntensity: 2.6,
    starOpacity: 1.0
  }
};

export class SkyAndLightingSystem {
  constructor(scene, waterMaterial, isMobile = false) {
    this.scene = scene;
    this.waterMaterial = waterMaterial;
    this.isMobile = isMobile;
    this.currentPresetKey = 'sunset';
    this.targetPreset = TIME_PRESETS.sunset;

    // Live interpolated state
    this.state = {
      zenithColor: this.targetPreset.zenithColor.clone(),
      horizonColor: this.targetPreset.horizonColor.clone(),
      fogColor: this.targetPreset.fogColor.clone(),
      fogDensity: this.targetPreset.fogDensity,
      sunColor: this.targetPreset.sunColor.clone(),
      sunIntensity: this.targetPreset.sunIntensity,
      sunPosition: this.targetPreset.sunPosition.clone(),
      hemiSky: this.targetPreset.hemiSky.clone(),
      hemiGround: this.targetPreset.hemiGround.clone(),
      hemiIntensity: this.targetPreset.hemiIntensity,
      waterColor: this.targetPreset.waterColor.clone(),
      torchIntensity: this.targetPreset.torchIntensity,
      starOpacity: this.targetPreset.starOpacity
    };

    this.initLights();
    this.initSkyDome();
    this.initStarField();
  }

  initLights() {
    this.scene.fog = new THREE.FogExp2(this.state.fogColor, this.state.fogDensity);

    this.hemiLight = new THREE.HemisphereLight(
      this.state.hemiSky,
      this.state.hemiGround,
      this.state.hemiIntensity
    );
    this.hemiLight.position.set(0, 80, 0);
    this.scene.add(this.hemiLight);

    this.sunLight = new THREE.DirectionalLight(this.state.sunColor, this.state.sunIntensity);
    this.sunLight.position.copy(this.state.sunPosition);
    this.sunLight.castShadow = true;

    // Adaptive shadow resolution: 512x512 on mobile (16x faster), 1024x1024 on desktop
    const shadowRes = this.isMobile ? 512 : 1024;
    this.sunLight.shadow.mapSize.width = shadowRes;
    this.sunLight.shadow.mapSize.height = shadowRes;
    this.sunLight.shadow.camera.near = 10;
    this.sunLight.shadow.camera.far = 280;

    // Tight dynamic frustum centered on player (crisper shadows at lighter cost)
    const d = this.isMobile ? 48 : 72;
    this.sunLight.shadow.camera.left = -d;
    this.sunLight.shadow.camera.right = d;
    this.sunLight.shadow.camera.top = d;
    this.sunLight.shadow.camera.bottom = -d;
    this.sunLight.shadow.bias = -0.0006;
    this.scene.add(this.sunLight);
    this.scene.add(this.sunLight.target);
    this._transitionTimer = 0;
  }

  initSkyDome() {
    const skyGeo = new THREE.SphereGeometry(340, 32, 24);
    this.skyUniforms = {
      uZenithColor: { value: this.state.zenithColor },
      uHorizonColor: { value: this.state.horizonColor },
      uSunPosition: { value: this.state.sunPosition }
    };

    const skyMat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: this.skyUniforms,
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 uZenithColor;
        uniform vec3 uHorizonColor;
        uniform vec3 uSunPosition;
        varying vec3 vWorldPosition;

        void main() {
          vec3 dir = normalize(vWorldPosition);
          float h = clamp(dir.y, 0.0, 1.0);
          vec3 col = mix(uHorizonColor, uZenithColor, pow(h, 0.55));

          vec3 sunDir = normalize(uSunPosition);
          float sunAmt = max(dot(dir, sunDir), 0.0);
          col += vec3(1.0, 0.78, 0.45) * pow(sunAmt, 36.0) * 0.45;
          col += vec3(1.0, 0.95, 0.8) * smoothstep(0.996, 0.9992, sunAmt) * 0.9;

          gl_FragColor = vec4(col, 1.0);
        }
      `
    });

    this.skyDome = new THREE.Mesh(skyGeo, skyMat);
    this.scene.add(this.skyDome);
  }

  initStarField() {
    const starCount = 700;
    const positions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 0.85 + 0.12);
      const r = 310;
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.cos(phi);
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }

    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    this.starMat = new THREE.PointsMaterial({
      color: 0xfff4d4,
      size: 2.1,
      transparent: true,
      opacity: this.state.starOpacity,
      depthWrite: false
    });

    this.stars = new THREE.Points(starGeo, this.starMat);
    this.scene.add(this.stars);
  }

  setPreset(presetKey) {
    if (!TIME_PRESETS[presetKey]) return;
    this.currentPresetKey = presetKey;
    this.targetPreset = TIME_PRESETS[presetKey];
    this._transitionTimer = 2.6;
  }

  cyclePreset() {
    const keys = Object.keys(TIME_PRESETS);
    const nextIdx = (keys.indexOf(this.currentPresetKey) + 1) % keys.length;
    this.setPreset(keys[nextIdx]);
    return TIME_PRESETS[keys[nextIdx]];
  }

  update(dt, playerPos = null) {
    if (this._transitionTimer > 0) {
      this._transitionTimer = Math.max(0, this._transitionTimer - dt);
      const speed = Math.min(1, dt * 2.5);
      const t = this.targetPreset;

      this.state.zenithColor.lerp(t.zenithColor, speed);
      this.state.horizonColor.lerp(t.horizonColor, speed);
      this.state.fogColor.lerp(t.fogColor, speed);
      this.state.fogDensity = THREE.MathUtils.lerp(this.state.fogDensity, t.fogDensity, speed);
      this.state.sunColor.lerp(t.sunColor, speed);
      this.state.sunIntensity = THREE.MathUtils.lerp(this.state.sunIntensity, t.sunIntensity, speed);
      this.state.sunPosition.lerp(t.sunPosition, speed);
      this.state.hemiSky.lerp(t.hemiSky, speed);
      this.state.hemiGround.lerp(t.hemiGround, speed);
      this.state.hemiIntensity = THREE.MathUtils.lerp(this.state.hemiIntensity, t.hemiIntensity, speed);
      this.state.waterColor.lerp(t.waterColor, speed);
      this.state.torchIntensity = THREE.MathUtils.lerp(this.state.torchIntensity, t.torchIntensity, speed);
      this.state.starOpacity = THREE.MathUtils.lerp(this.state.starOpacity, t.starOpacity, speed);

      // Apply to lights, fog, sky, stars, and water
      this.scene.fog.color.copy(this.state.fogColor);
      this.scene.fog.density = this.state.fogDensity;

      this.sunLight.color.copy(this.state.sunColor);
      this.sunLight.intensity = this.state.sunIntensity;

      this.hemiLight.color.copy(this.state.hemiSky);
      this.hemiLight.groundColor.copy(this.state.hemiGround);
      this.hemiLight.intensity = this.state.hemiIntensity;

      this.starMat.opacity = this.state.starOpacity;

      if (this.waterMaterial) {
        this.waterMaterial.color.copy(this.state.waterColor);
      }
    }

    // Center shadow frustum around player (aligned to 2m grid to avoid shadow shimmering)
    if (playerPos) {
      const snapX = Math.round(playerPos.x * 0.5) * 2;
      const snapZ = Math.round(playerPos.z * 0.5) * 2;
      if (this.sunLight.target.position.x !== snapX || this.sunLight.target.position.z !== snapZ || this._transitionTimer > 0) {
        this.sunLight.target.position.set(snapX, 0, snapZ);
        this.sunLight.target.updateMatrixWorld();
        this.sunLight.position.set(
          snapX + this.state.sunPosition.x,
          this.state.sunPosition.y,
          snapZ + this.state.sunPosition.z
        );
      }
    } else if (this._transitionTimer > 0) {
      this.sunLight.position.copy(this.state.sunPosition);
    }
  }
}
