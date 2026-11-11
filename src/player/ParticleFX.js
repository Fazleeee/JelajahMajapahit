import * as THREE from 'three';

export class ParticleFX {
  constructor(scene) {
    this.scene = scene;
    this._dummy = new THREE.Object3D();

    // 1. Instanced Dust Particles Pool (40 particles -> 1 Draw Call!)
    this.dustCount = 40;
    this.dustPool = [];
    const dustGeo = new THREE.DodecahedronGeometry(0.18, 0);
    const dustMat = new THREE.MeshBasicMaterial({
      color: '#d4af82',
      transparent: true,
      opacity: 0.65
    });

    this.dustInstanced = new THREE.InstancedMesh(dustGeo, dustMat, this.dustCount);
    this.dustInstanced.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.dustInstanced.frustumCulled = false;

    this._dummy.scale.setScalar(0);
    this._dummy.updateMatrix();
    for (let i = 0; i < this.dustCount; i++) {
      this.dustInstanced.setMatrixAt(i, this._dummy.matrix);
      this.dustPool.push({
        active: false,
        life: 0,
        maxLife: 0.6,
        baseScale: 1.0,
        x: 0,
        y: 0,
        z: 0,
        vx: 0,
        vy: 0,
        vz: 0
      });
    }
    this.dustInstanced.instanceMatrix.needsUpdate = true;
    this.scene.add(this.dustInstanced);

    // 2. Instanced Water Ripples Pool (20 ripples -> 1 Draw Call!)
    this.rippleCount = 20;
    this.ripplePool = [];
    const rippleGeo = new THREE.RingGeometry(0.2, 0.32, 20);
    rippleGeo.rotateX(-Math.PI / 2);
    const rippleMat = new THREE.MeshBasicMaterial({
      color: '#c0e8f0',
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.72
    });

    this.rippleInstanced = new THREE.InstancedMesh(rippleGeo, rippleMat, this.rippleCount);
    this.rippleInstanced.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.rippleInstanced.frustumCulled = false;

    for (let i = 0; i < this.rippleCount; i++) {
      this.rippleInstanced.setMatrixAt(i, this._dummy.matrix);
      this.ripplePool.push({
        active: false,
        life: 0,
        maxLife: 0.85,
        scaleSpeed: 3.2,
        x: 0,
        y: 0,
        z: 0
      });
    }
    this.rippleInstanced.instanceMatrix.needsUpdate = true;
    this.scene.add(this.rippleInstanced);
  }

  // Munculkan kepulan debu di kaki
  spawnDust(position) {
    let p = null;
    for (let i = 0; i < this.dustCount; i++) {
      if (!this.dustPool[i].active) {
        p = this.dustPool[i];
        break;
      }
    }
    if (!p) return;

    p.active = true;
    p.x = position.x + (Math.random() - 0.5) * 0.3;
    p.y = position.y + 0.1;
    p.z = position.z + (Math.random() - 0.5) * 0.3;
    p.vx = (Math.random() - 0.5) * 0.8;
    p.vy = 0.6 + Math.random() * 0.5;
    p.vz = (Math.random() - 0.5) * 0.8;
    p.life = 0;
    p.maxLife = 0.45 + Math.random() * 0.25;
    p.baseScale = 0.7 + Math.random() * 0.6;
  }

  // Munculkan riak lingkaran air
  spawnWaterRipple(position, waterY = 0.26) {
    let r = null;
    for (let i = 0; i < this.rippleCount; i++) {
      if (!this.ripplePool[i].active) {
        r = this.ripplePool[i];
        break;
      }
    }
    if (!r) return;

    r.active = true;
    r.x = position.x;
    r.y = waterY;
    r.z = position.z;
    r.life = 0;
  }

  update(dt) {
    // Update Instanced Dust Pool
    let dustDirty = false;
    for (let i = 0; i < this.dustCount; i++) {
      const p = this.dustPool[i];
      if (!p.active) continue;

      dustDirty = true;
      p.life += dt;
      if (p.life >= p.maxLife) {
        p.active = false;
        this._dummy.scale.setScalar(0);
        this._dummy.updateMatrix();
        this.dustInstanced.setMatrixAt(i, this._dummy.matrix);
        continue;
      }

      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.z += p.vz * dt;
      p.vy -= 1.8 * dt;

      const progress = p.life / p.maxLife;
      // Smooth grow & shrink out at end of life
      const s = p.baseScale * (1.0 + progress * 1.4) * (1.0 - progress * progress);

      this._dummy.position.set(p.x, p.y, p.z);
      this._dummy.scale.setScalar(s);
      this._dummy.updateMatrix();
      this.dustInstanced.setMatrixAt(i, this._dummy.matrix);
    }
    if (dustDirty) {
      this.dustInstanced.instanceMatrix.needsUpdate = true;
    }

    // Update Instanced Water Ripples Pool
    let rippleDirty = false;
    for (let i = 0; i < this.rippleCount; i++) {
      const r = this.ripplePool[i];
      if (!r.active) continue;

      rippleDirty = true;
      r.life += dt;
      if (r.life >= r.maxLife) {
        r.active = false;
        this._dummy.scale.setScalar(0);
        this._dummy.updateMatrix();
        this.rippleInstanced.setMatrixAt(i, this._dummy.matrix);
        continue;
      }

      const progress = r.life / r.maxLife;
      // Shrink thickness slightly to fade visually while ring expands
      const curScale = 0.6 + progress * r.scaleSpeed;
      const fadeY = 1.0 - progress;

      this._dummy.position.set(r.x, r.y, r.z);
      this._dummy.scale.set(curScale, fadeY, curScale);
      this._dummy.updateMatrix();
      this.rippleInstanced.setMatrixAt(i, this._dummy.matrix);
    }
    if (rippleDirty) {
      this.rippleInstanced.instanceMatrix.needsUpdate = true;
    }
  }
}
