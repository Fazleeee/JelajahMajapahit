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

    // Dada & Baju Surjan Beskap Tapered
    const chestGeo = new THREE.CylinderGeometry(0.39, 0.34, 0.88, 12);
    const chest = new THREE.Mesh(chestGeo, this.matSurjan);
    chest.scale.set(1.08, 1.0, 0.68);
    chest.position.y = 0.44;
    chest.castShadow = true;
    this.torsoGroup.add(chest);

    const collar = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.045, 6, 12), this.matGold);
    collar.rotation.x = Math.PI / 2;
    collar.position.y = 0.88;
    this.torsoGroup.add(collar);

    // Sabuk Emas Kerajaan (Pending Emas Majapahit)
    const belt = new THREE.Mesh(new THREE.CylinderGeometry(0.365, 0.37, 0.16, 12), this.matGold);
    belt.scale.set(1.08, 1.0, 0.72);
    belt.position.y = 0.08;
    this.torsoGroup.add(belt);

    // Rumbai Selendang Samping
    this.sash = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.11, 0.62, 8), this.matGold);
    this.sash.scale.set(1.0, 1.0, 0.45);
    this.sash.position.set(0.36, -0.22, 0.16);
    this.torsoGroup.add(this.sash);

    // Tas Selempang Penjelajah Waktu + Penutup Lengkung
    const bag = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.56, 0.24), this.matLeather);
    bag.position.set(0, 0.48, 0.29);
    bag.castShadow = true;
    this.torsoGroup.add(bag);

    // Gulungan Lontar di atas tas
    const scroll = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.58, 8), this.matSkin);
    scroll.rotation.z = Math.PI / 2;
    scroll.position.set(0, 0.82, 0.28);
    this.torsoGroup.add(scroll);

    // Keris Pusaka di pinggang belakang
    const kerisSheath = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.025, 0.48, 6), this.matGold);
    kerisSheath.position.set(-0.22, -0.02, 0.28);
    kerisSheath.rotation.z = 0.45;
    this.torsoGroup.add(kerisSheath);

    const kerisHilt = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.05, 0.22, 6), this.matWood);
    kerisHilt.position.set(-0.34, 0.24, 0.28);
    kerisHilt.rotation.z = 0.45;
    this.torsoGroup.add(kerisHilt);

    // 2. Leher, Kepala & Udeng Jawa Timur Berkibar
    this.headGroup = new THREE.Group();
    this.headGroup.position.set(0, 0.92, 0);
    this.torsoGroup.add(this.headGroup);

    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.13, 0.14, 10), this.matSkin);
    neck.position.y = 0.04;
    this.headGroup.add(neck);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.27, 14, 12), this.matSkin);
    head.scale.set(0.95, 1.08, 0.96);
    head.position.y = 0.29;
    head.castShadow = true;
    this.headGroup.add(head);

    // Mata Penjelajah
    for (const ex of [-0.09, 0.09]) {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.032, 6, 6), this.matHair);
      eye.position.set(ex, 0.30, -0.24);
      this.headGroup.add(eye);
    }

    // Rambut & Udeng / Ikat Kepala Tradisional Jawa Timur
    const hair = new THREE.Mesh(new THREE.SphereGeometry(0.28, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.55), this.matHair);
    hair.position.set(0, 0.31, 0.02);
    hair.rotation.x = 0.18;
    this.headGroup.add(hair);

    const udengBase = new THREE.Mesh(new THREE.TorusGeometry(0.255, 0.068, 8, 16), this.matSurjan);
    udengBase.rotation.x = Math.PI / 2 - 0.08;
    udengBase.position.y = 0.41;
    this.headGroup.add(udengBase);

    const udengFold = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.24, 6), this.matGold);
    udengFold.position.set(0, 0.50, -0.23);
    udengFold.rotation.x = -0.25;
    this.headGroup.add(udengFold);

    // 3. Lengan Kiri (Bahu + Lengan Beskap + Tangan) & Lentera Penjelajah
    this.leftArmGroup = new THREE.Group();
    this.leftArmGroup.position.set(-0.48, 0.82, 0);
    this.torsoGroup.add(this.leftArmGroup);

    const leftShoulder = new THREE.Mesh(new THREE.SphereGeometry(0.125, 10, 8), this.matSurjan);
    this.leftArmGroup.add(leftShoulder);

    const leftSleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.095, 0.44, 10), this.matSurjan);
    leftSleeve.position.y = -0.22;
    leftSleeve.castShadow = true;
    this.leftArmGroup.add(leftSleeve);

    const leftForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.075, 0.34, 10), this.matSkin);
    leftForearm.position.y = -0.56;
    leftForearm.castShadow = true;
    this.leftArmGroup.add(leftForearm);

    const leftHand = new THREE.Mesh(new THREE.SphereGeometry(0.085, 8, 8), this.matSkin);
    leftHand.position.y = -0.74;
    this.leftArmGroup.add(leftHand);

    // Lentera Perunggu Menyala di tangan kiri
    this.lanternGroup = new THREE.Group();
    this.lanternGroup.position.set(0, -0.82, -0.15);
    this.leftArmGroup.add(this.lanternGroup);

    const lanternCap = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.12, 6), this.matGold);
    lanternCap.position.y = 0.16;
    this.lanternGroup.add(lanternCap);

    const lanternFrame = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.28, 6), this.matWood);
    this.lanternGroup.add(lanternFrame);

    const lanternCore = new THREE.Mesh(new THREE.SphereGeometry(0.095, 8, 8), this.matLanternGlow);
    lanternCore.position.y = 0.01;
    this.lanternGroup.add(lanternCore);

    this.lanternLight = new THREE.PointLight('#ff9933', 1.2, 16, 1.8);
    this.lanternLight.position.set(0, 0.05, 0);
    this.lanternGroup.add(this.lanternLight);

    // 4. Lengan Kanan (Simetris Bersiluet Halus)
    this.rightArmGroup = new THREE.Group();
    this.rightArmGroup.position.set(0.48, 0.82, 0);
    this.torsoGroup.add(this.rightArmGroup);

    const rightShoulder = new THREE.Mesh(new THREE.SphereGeometry(0.125, 10, 8), this.matSurjan);
    this.rightArmGroup.add(rightShoulder);

    const rightSleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.095, 0.44, 10), this.matSurjan);
    rightSleeve.position.y = -0.22;
    rightSleeve.castShadow = true;
    this.rightArmGroup.add(rightSleeve);

    const rightForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.075, 0.34, 10), this.matSkin);
    rightForearm.position.y = -0.56;
    rightForearm.castShadow = true;
    this.rightArmGroup.add(rightForearm);

    const rightHand = new THREE.Mesh(new THREE.SphereGeometry(0.085, 8, 8), this.matSkin);
    rightHand.position.y = -0.74;
    this.rightArmGroup.add(rightHand);

    // 5. Kaki Kiri & Kanan (Silinder Meruncing + Alas Kaki Terompah Halus)
    this.leftLegGroup = new THREE.Group();
    this.leftLegGroup.position.set(-0.21, 1.05, 0);
    this.group.add(this.leftLegGroup);

    const leftLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.145, 0.115, 0.94, 10), this.matPants);
    leftLeg.position.y = -0.47;
    leftLeg.castShadow = true;
    this.leftLegGroup.add(leftLeg);

    const leftFoot = new THREE.Mesh(new THREE.CapsuleGeometry ? new THREE.CapsuleGeometry(0.095, 0.16, 4, 8) : new THREE.BoxGeometry(0.24, 0.12, 0.38), this.matLeather);
    leftFoot.rotation.x = Math.PI / 2;
    leftFoot.position.set(0, -0.96, -0.06);
    this.leftLegGroup.add(leftFoot);

    this.rightLegGroup = new THREE.Group();
    this.rightLegGroup.position.set(0.21, 1.05, 0);
    this.group.add(this.rightLegGroup);

    const rightLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.145, 0.115, 0.94, 10), this.matPants);
    rightLeg.position.y = -0.47;
    rightLeg.castShadow = true;
    this.rightLegGroup.add(rightLeg);

    const rightFoot = new THREE.Mesh(new THREE.CapsuleGeometry ? new THREE.CapsuleGeometry(0.095, 0.16, 4, 8) : new THREE.BoxGeometry(0.24, 0.12, 0.38), this.matLeather);
    rightFoot.rotation.x = Math.PI / 2;
    rightFoot.position.set(0, -0.96, -0.06);
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
