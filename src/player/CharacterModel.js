import * as THREE from 'three';

export class CharacterModel {
  constructor() {
    this.group = new THREE.Group();
    this.stepTriggerCallbacks = [];
    this.prevStepPhase = 0;
    this.landCompression = 0;

    this.initMaterials();
    this.buildRig();
  }

  initMaterials() {
    this.matSkin = new THREE.MeshStandardMaterial({ color: '#e0a37e', roughness: 0.65 });
    this.matSurjan = new THREE.MeshStandardMaterial({ color: '#8e3422', roughness: 0.75, flatShading: true });
    this.matPants = new THREE.MeshStandardMaterial({ color: '#2d2420', roughness: 0.85, flatShading: true });
    this.matGold = new THREE.MeshStandardMaterial({
      color: '#f0c14b',
      emissive: '#4d370b',
      roughness: 0.35,
      metalness: 0.65
    });
    this.matLeather = new THREE.MeshStandardMaterial({ color: '#57371f', roughness: 0.8 });
    this.matWood = new THREE.MeshStandardMaterial({ color: '#402613', roughness: 0.7 });
    this.matHair = new THREE.MeshStandardMaterial({ color: '#171210', roughness: 0.9 });
    this.matLanternGlow = new THREE.MeshBasicMaterial({ color: '#ffb347' });
  }

  buildRig() {
    // 1. Torso & Upper Body
    this.torsoGroup = new THREE.Group();
    this.torsoGroup.position.y = 1.05;
    this.group.add(this.torsoGroup);

    // Dada & Baju Surjan
    const chestGeo = new THREE.BoxGeometry(0.74, 0.88, 0.44);
    const chest = new THREE.Mesh(chestGeo, this.matSurjan);
    chest.position.y = 0.44;
    chest.castShadow = true;
    this.torsoGroup.add(chest);

    // Sabuk Emas Kerajaan (Pending Emas Majapahit)
    const belt = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.16, 0.48), this.matGold);
    belt.position.y = 0.08;
    this.torsoGroup.add(belt);

    // Rumbai Selendang Samping
    this.sash = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.62, 0.08), this.matGold);
    this.sash.position.set(0.35, -0.22, 0.18);
    this.torsoGroup.add(this.sash);

    // Tas Selempang Penjelajah Waktu
    const bag = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.62, 0.28), this.matLeather);
    bag.position.set(0, 0.48, 0.3);
    bag.castShadow = true;
    this.torsoGroup.add(bag);

    // Gulungan Lontar di atas tas
    const scroll = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.58, 8), this.matSkin);
    scroll.rotation.z = Math.PI / 2;
    scroll.position.set(0, 0.82, 0.28);
    this.torsoGroup.add(scroll);

    // Keris Pusaka di pinggang belakang
    const kerisHilt = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.35, 6), this.matWood);
    kerisHilt.position.set(-0.25, 0.12, 0.28);
    kerisHilt.rotation.z = 0.45;
    this.torsoGroup.add(kerisHilt);

    // 2. Leher, Kepala & Udeng
    this.headGroup = new THREE.Group();
    this.headGroup.position.set(0, 0.92, 0);
    this.torsoGroup.add(this.headGroup);

    const head = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.52, 0.5), this.matSkin);
    head.position.y = 0.26;
    head.castShadow = true;
    this.headGroup.add(head);

    // Rambut
    const hair = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.2, 0.54), this.matHair);
    hair.position.y = 0.46;
    this.headGroup.add(hair);

    // Udeng / Ikat Kepala Tradisional Jawa Timur
    const udengBase = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.12, 0.56), this.matSurjan);
    udengBase.position.y = 0.38;
    this.headGroup.add(udengBase);

    const udengFold = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.16, 0.14), this.matGold);
    udengFold.position.set(0, 0.45, -0.26);
    this.headGroup.add(udengFold);

    // 3. Lengan Kiri & Lentera Penjelajah
    this.leftArmGroup = new THREE.Group();
    this.leftArmGroup.position.set(-0.52, 0.82, 0);
    this.torsoGroup.add(this.leftArmGroup);

    const leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.76, 0.24), this.matSkin);
    leftArm.position.y = -0.38;
    leftArm.castShadow = true;
    this.leftArmGroup.add(leftArm);

    // Lentera Perunggu Menyala di tangan kiri
    this.lanternGroup = new THREE.Group();
    this.lanternGroup.position.set(0, -0.78, -0.15);
    this.leftArmGroup.add(this.lanternGroup);

    const lanternFrame = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 0.32, 6), this.matWood);
    this.lanternGroup.add(lanternFrame);

    const lanternCore = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), this.matLanternGlow);
    lanternCore.position.y = 0.02;
    this.lanternGroup.add(lanternCore);

    this.lanternLight = new THREE.PointLight('#ff9933', 1.2, 16, 1.8);
    this.lanternLight.position.set(0, 0.05, 0);
    this.lanternGroup.add(this.lanternLight);

    // 4. Lengan Kanan
    this.rightArmGroup = new THREE.Group();
    this.rightArmGroup.position.set(0.52, 0.82, 0);
    this.torsoGroup.add(this.rightArmGroup);

    const rightArm = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.76, 0.24), this.matSkin);
    rightArm.position.y = -0.38;
    rightArm.castShadow = true;
    this.rightArmGroup.add(rightArm);

    // 5. Kaki Kiri & Kanan (Pangkal paha)
    this.leftLegGroup = new THREE.Group();
    this.leftLegGroup.position.set(-0.22, 1.05, 0);
    this.group.add(this.leftLegGroup);

    const leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.98, 0.28), this.matPants);
    leftLeg.position.y = -0.49;
    leftLeg.castShadow = true;
    this.leftLegGroup.add(leftLeg);

    const leftFoot = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.12, 0.42), this.matLeather);
    leftFoot.position.set(0, -0.98, -0.06);
    this.leftLegGroup.add(leftFoot);

    this.rightLegGroup = new THREE.Group();
    this.rightLegGroup.position.set(0.22, 1.05, 0);
    this.group.add(this.rightLegGroup);

    const rightLeg = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.98, 0.28), this.matPants);
    rightLeg.position.y = -0.49;
    rightLeg.castShadow = true;
    this.rightLegGroup.add(rightLeg);

    const rightFoot = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.12, 0.42), this.matLeather);
    rightFoot.position.set(0, -0.98, -0.06);
    this.rightLegGroup.add(rightFoot);
  }

  onStep(cb) {
    this.stepTriggerCallbacks.push(cb);
  }

  triggerStep(footIndex) {
    this.stepTriggerCallbacks.forEach((cb) => cb(footIndex));
  }

  setLandCompression() {
    this.landCompression = 0.4;
  }

  // Update procedural animation cycle
  update(animState, dt, time) {
    const { isMoving, isSprinting, isGrounded, isWater, verticalVelocity } = animState;

    // Decay land compression impact
    if (this.landCompression > 0) {
      this.landCompression = Math.max(0, this.landCompression - dt * 2.8);
    }

    if (!isGrounded) {
      // 1. Air Pose (Lompat / Melayang)
      const isAscending = verticalVelocity > 0;
      this.torsoGroup.position.y = 1.05 + (isAscending ? 0.08 : -0.05) - this.landCompression * 0.5;
      this.torsoGroup.rotation.x = THREE.MathUtils.lerp(this.torsoGroup.rotation.x, isAscending ? -0.12 : 0.15, dt * 8);

      // Angkat kedua lengan saat melompat
      this.leftArmGroup.rotation.x = THREE.MathUtils.lerp(this.leftArmGroup.rotation.x, -0.85, dt * 10);
      this.rightArmGroup.rotation.x = THREE.MathUtils.lerp(this.rightArmGroup.rotation.x, -0.85, dt * 10);

      // Tekuk lutut di udara
      this.leftLegGroup.rotation.x = THREE.MathUtils.lerp(this.leftLegGroup.rotation.x, 0.45, dt * 10);
      this.rightLegGroup.rotation.x = THREE.MathUtils.lerp(this.rightLegGroup.rotation.x, 0.65, dt * 10);

      this.sash.rotation.x = 0.5;
    } else if (isWater) {
      // 2. Water Wading / Swimming Pose (Menerobos Air)
      const freq = isMoving ? 5.5 : 2.0;
      const bob = Math.sin(time * freq) * 0.08;
      this.torsoGroup.position.y = 0.95 + bob - this.landCompression;
      this.torsoGroup.rotation.x = isMoving ? 0.28 : 0.05;

      if (isMoving) {
        const stroke = Math.sin(time * freq) * 0.65;
        this.leftArmGroup.rotation.x = stroke;
        this.rightArmGroup.rotation.x = -stroke;
        this.leftLegGroup.rotation.x = -stroke * 0.6;
        this.rightLegGroup.rotation.x = stroke * 0.6;

        // Step sound trigger for water splash
        const currentPhase = Math.sin(time * freq);
        if (this.prevStepPhase < 0 && currentPhase >= 0) this.triggerStep(0);
        else if (this.prevStepPhase > 0 && currentPhase <= 0) this.triggerStep(1);
        this.prevStepPhase = currentPhase;
      } else {
        this.leftArmGroup.rotation.x = THREE.MathUtils.lerp(this.leftArmGroup.rotation.x, 0, dt * 6);
        this.rightArmGroup.rotation.x = THREE.MathUtils.lerp(this.rightArmGroup.rotation.x, 0, dt * 6);
        this.leftLegGroup.rotation.x = THREE.MathUtils.lerp(this.leftLegGroup.rotation.x, 0, dt * 6);
        this.rightLegGroup.rotation.x = THREE.MathUtils.lerp(this.rightLegGroup.rotation.x, 0, dt * 6);
      }
    } else if (isMoving) {
      // 3. Walk & Sprint Cycle
      const freq = isSprinting ? 14.5 : 9.2;
      const legAmplitude = isSprinting ? 0.95 : 0.62;
      const armAmplitude = isSprinting ? 0.85 : 0.55;

      const cycle = Math.sin(time * freq);
      this.leftLegGroup.rotation.x = cycle * legAmplitude;
      this.rightLegGroup.rotation.x = -cycle * legAmplitude;

      this.leftArmGroup.rotation.x = -cycle * armAmplitude;
      this.rightArmGroup.rotation.x = cycle * armAmplitude;

      // Bobbing naik-turun tubuh saat melangkah
      const bounce = Math.abs(Math.sin(time * freq)) * (isSprinting ? 0.12 : 0.06);
      this.torsoGroup.position.y = 1.05 + bounce - this.landCompression;

      // Kemiringan tubuh ke depan saat sprint
      const targetLean = isSprinting ? 0.32 : 0.12;
      this.torsoGroup.rotation.x = THREE.MathUtils.lerp(this.torsoGroup.rotation.x, targetLean, dt * 8);

      // Ayunan selendang emas ke belakang
      this.sash.rotation.x = isSprinting ? 0.65 : 0.3;

      // Deteksi pijakan kaki untuk efek suara & partikel debu
      if (this.prevStepPhase < 0 && cycle >= 0) {
        this.triggerStep(0); // Kaki kiri menjejak
      } else if (this.prevStepPhase > 0 && cycle <= 0) {
        this.triggerStep(1); // Kaki kanan menjejak
      }
      this.prevStepPhase = cycle;
    } else {
      // 4. Idle Stance (Bernapas tenang di pelataran Trowulan)
      const breath = Math.sin(time * 2.2) * 0.025;
      this.torsoGroup.position.y = 1.05 + breath - this.landCompression;
      this.torsoGroup.rotation.x = THREE.MathUtils.lerp(this.torsoGroup.rotation.x, 0, dt * 6);

      this.leftLegGroup.rotation.x = THREE.MathUtils.lerp(this.leftLegGroup.rotation.x, 0, dt * 8);
      this.rightLegGroup.rotation.x = THREE.MathUtils.lerp(this.rightLegGroup.rotation.x, 0, dt * 8);
      this.leftArmGroup.rotation.x = THREE.MathUtils.lerp(this.leftArmGroup.rotation.x, 0.08, dt * 8);
      this.rightArmGroup.rotation.x = THREE.MathUtils.lerp(this.rightArmGroup.rotation.x, -0.08, dt * 8);

      this.sash.rotation.x = THREE.MathUtils.lerp(this.sash.rotation.x, 0.05, dt * 6);
      this.headGroup.rotation.y = Math.sin(time * 0.7) * 0.12;
    }

    // Goyangan lentera
    const lanternSway = Math.sin(time * 4) * 0.15;
    this.lanternGroup.rotation.z = lanternSway;
    this.lanternGroup.rotation.x = -lanternSway * 0.5;
  }
}
