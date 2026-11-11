import * as THREE from 'three';

export class ParticleFX {
  constructor(scene) {
    this.scene = scene;

    // Dust particles pool for running on dry ground
    this.dustParticles = [];
    this.dustGeo = new THREE.DodecahedronGeometry(0.18, 0);
    this.dustMat = new THREE.MeshBasicMaterial({
      color: '#d4af82',
      transparent: true,
      opacity: 0.65
    });

    for (let i = 0; i < 40; i++) {
      const mesh = new THREE.Mesh(this.dustGeo, this.dustMat.clone());
      mesh.visible = false;
      this.scene.add(mesh);
      this.dustParticles.push({
        mesh,
        life: 0,
        maxLife: 0.6,
        velocity: new THREE.Vector3()
      });
    }

    // Water ripple rings pool when moving through water
    this.waterRipples = [];
    this.rippleGeo = new THREE.RingGeometry(0.2, 0.32, 24);
    this.rippleGeo.rotateX(-Math.PI / 2);
    this.rippleMat = new THREE.MeshBasicMaterial({
      color: '#c0e8f0',
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8
    });

    for (let i = 0; i < 20; i++) {
      const mesh = new THREE.Mesh(this.rippleGeo, this.rippleMat.clone());
      mesh.visible = false;
      this.scene.add(mesh);
      this.waterRipples.push({
        mesh,
        life: 0,
        maxLife: 0.85,
        scaleSpeed: 3.2
      });
    }
  }

  // Munculkan kepulan debu di kaki
  spawnDust(position) {
    const p = this.dustParticles.find((item) => !item.mesh.visible);
    if (!p) return;

    p.mesh.position.set(
      position.x + (Math.random() - 0.5) * 0.3,
      position.y + 0.1,
      position.z + (Math.random() - 0.5) * 0.3
    );
    p.velocity.set(
      (Math.random() - 0.5) * 0.8,
      0.6 + Math.random() * 0.5,
      (Math.random() - 0.5) * 0.8
    );
    p.life = 0;
    p.maxLife = 0.45 + Math.random() * 0.25;
    p.mesh.scale.setScalar(0.7 + Math.random() * 0.6);
    p.mesh.material.opacity = 0.65;
    p.mesh.visible = true;
  }

  // Munculkan riak lingkaran air
  spawnWaterRipple(position, waterY = 0.26) {
    const r = this.waterRipples.find((item) => !item.mesh.visible);
    if (!r) return;

    r.mesh.position.set(position.x, waterY, position.z);
    r.mesh.scale.setScalar(0.6);
    r.mesh.material.opacity = 0.75;
    r.life = 0;
    r.mesh.visible = true;
  }

  update(dt) {
    // Update dust
    for (const p of this.dustParticles) {
      if (!p.mesh.visible) continue;
      p.life += dt;
      if (p.life >= p.maxLife) {
        p.mesh.visible = false;
        continue;
      }

      p.mesh.position.addScaledVector(p.velocity, dt);
      p.velocity.y -= 1.8 * dt; // gravitasi ringan pada debu
      const progress = p.life / p.maxLife;
      p.mesh.material.opacity = (1 - progress) * 0.65;
      const s = 1.0 + progress * 1.5;
      p.mesh.scale.setScalar(s);
    }

    // Update ripples
    for (const r of this.waterRipples) {
      if (!r.mesh.visible) continue;
      r.life += dt;
      if (r.life >= r.maxLife) {
        r.mesh.visible = false;
        continue;
      }

      const progress = r.life / r.maxLife;
      const curScale = 0.6 + progress * r.scaleSpeed;
      r.mesh.scale.set(curScale, curScale, curScale);
      r.mesh.material.opacity = (1 - progress) * 0.75;
    }
  }
}
