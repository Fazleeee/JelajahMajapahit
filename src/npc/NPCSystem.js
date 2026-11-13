import * as THREE from 'three';
import { getWalkableHeight } from '../world/Terrain.js';
import { NPC_DATA } from '../quests/QuestData.js';

export class NPCSystem {
  constructor(scene) {
    this.scene = scene;
    this.npcMeshes = [];

    this.initSharedMaterials();
    this.initBadgeTextures();
    this.buildNPCModels();
  }

  initBadgeTextures() {
    this.badgeTextures = {
      turn_in: this.createBadgeTexture('🏆', '#d97706', '#fef08a', 'rgba(245, 158, 11, 0.45)'),
      active_quest: this.createBadgeTexture('❗', '#b45309', '#ffffff', 'rgba(217, 119, 6, 0.45)'),
      in_progress: this.createBadgeTexture('📜', '#2563eb', '#93c5fd', 'rgba(37, 99, 235, 0.4)'),
      completed: this.createBadgeTexture('✅', '#059669', '#a7f3d0', 'rgba(5, 150, 105, 0.4)'),
      chat: this.createBadgeTexture('💬', '#7c3aed', '#ddd6fe', 'rgba(124, 58, 237, 0.35)')
    };
  }

  createBadgeTexture(iconText, bgColor, borderColor, glowColor) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    // Outer radiant aura
    const grad = ctx.createRadialGradient(64, 64, 20, 64, 64, 62);
    grad.addColorStop(0, glowColor);
    grad.addColorStop(0.75, glowColor);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(64, 64, 60, 0, Math.PI * 2);
    ctx.fill();

    // Solid badge circular disc
    ctx.fillStyle = bgColor;
    ctx.beginPath();
    ctx.arc(64, 64, 46, 0, Math.PI * 2);
    ctx.fill();

    // Border stroke
    ctx.lineWidth = 5;
    ctx.strokeStyle = borderColor;
    ctx.stroke();

    // Centered icon
    ctx.font = 'bold 46px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(iconText, 64, 68);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }

  initSharedMaterials() {
    this.matSkin = new THREE.MeshStandardMaterial({ color: '#d99872', roughness: 0.65 });
    this.matHair = new THREE.MeshStandardMaterial({ color: '#17120f', roughness: 0.9 });
    this.matGold = new THREE.MeshStandardMaterial({
      color: '#f9d254',
      emissive: '#4d370b',
      roughness: 0.35,
      metalness: 0.75
    });
    this.matBronze = new THREE.MeshStandardMaterial({ color: '#8a6534', roughness: 0.5, metalness: 0.6 });
    this.matPrapancaRobe = new THREE.MeshStandardMaterial({ color: '#f5efe1', roughness: 0.8 });
    this.matPedagangCloth = new THREE.MeshStandardMaterial({ color: '#69482d', roughness: 0.85 });
    this.matGajahMadaArmor = new THREE.MeshStandardMaterial({
      color: '#8f2e1b',
      emissive: '#2e0f09',
      roughness: 0.45,
      metalness: 0.5
    });
    this.matPrajuritArmor = new THREE.MeshStandardMaterial({ color: '#3d2e24', roughness: 0.8 });
    this.matCaping = new THREE.MeshStandardMaterial({ color: '#9c7b47', roughness: 0.9, flatShading: true });
    this.matLontar = new THREE.MeshStandardMaterial({ color: '#ded1b4', roughness: 0.7 });
  }

  buildNPCModels() {
    NPC_DATA.forEach((data, idx) => {
      const x = data.coords.x;
      const z = data.coords.z;
      const y = getWalkableHeight(x, z);

      const group = new THREE.Group();
      group.position.set(x, y, z);

      let headGroup = null;

      if (data.id === 'gajah_mada') {
        headGroup = this.createGajahMadaMesh(group);
      } else if (data.id === 'hayam_wuruk') {
        headGroup = this.createHayamWurukMesh(group);
      } else if (data.id === 'mpu_prapanca') {
        headGroup = this.createMpuPrapancaMesh(group);
      } else if (data.id === 'ki_pedagang') {
        headGroup = this.createPedagangMesh(group);
      } else {
        headGroup = this.createPrajuritMesh(group);
      }

      // Indikator Cincin Emas Interaktif di Lantai
      const ringGeo = new THREE.RingGeometry(1.4, 1.7, 24);
      ringGeo.rotateX(-Math.PI / 2);
      const ringMat = new THREE.MeshBasicMaterial({
        color: '#ffc83b',
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.75
      });
      const floorRing = new THREE.Mesh(ringGeo, ringMat);
      floorRing.position.y = 0.06;
      group.add(floorRing);

      // Dynamic Overhead Quest & Lore Badge (Billboard Sprite)
      const spriteMat = new THREE.SpriteMaterial({
        map: this.badgeTextures.chat,
        transparent: true,
        depthTest: false
      });
      const badgeSprite = new THREE.Sprite(spriteMat);
      badgeSprite.position.y = 3.15;
      badgeSprite.scale.set(1.05, 1.05, 1.0);
      group.add(badgeSprite);

      // Cincin Halo Emas Berputar di Bawah Badge
      const haloGeo = new THREE.RingGeometry(0.32, 0.42, 16);
      haloGeo.rotateX(-Math.PI / 2);
      const haloMat = new THREE.MeshBasicMaterial({
        color: '#ffd700',
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85
      });
      const haloMesh = new THREE.Mesh(haloGeo, haloMat);
      haloMesh.position.y = 2.65;
      group.add(haloMesh);

      this.scene.add(group);

      this.npcMeshes.push({
        data,
        group,
        headGroup,
        floorRing,
        badgeSprite,
        haloMesh,
        currentBadgeType: 'chat',
        phase: idx * 1.3
      });
    });
  }

  // 1. Mahapatih Gajah Mada (Zirah Perunggu Emas, Udeng Perwira)
  createGajahMadaMesh(parent) {
    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.46, 1.05, 8), this.matGajahMadaArmor);
    torso.position.y = 1.35;
    torso.scale.set(1.1, 1.0, 0.68);
    torso.castShadow = true;
    parent.add(torso);

    const goldBreastplate = new THREE.Mesh(new THREE.CylinderGeometry(0.41, 0.43, 0.56, 8), this.matGold);
    goldBreastplate.position.y = 1.48;
    goldBreastplate.scale.set(1.12, 1.0, 0.72);
    parent.add(goldBreastplate);

    const legs = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.38, 0.88, 8), this.matGajahMadaArmor);
    legs.position.y = 0.45;
    legs.scale.set(1.05, 1.0, 0.65);
    parent.add(legs);

    const headGroup = new THREE.Group();
    headGroup.position.set(0, 2.15, 0);
    const head = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.5, 10), this.matSkin);
    headGroup.add(head);

    const udeng = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.3, 0.22, 10), this.matGajahMadaArmor);
    udeng.position.y = 0.2;
    headGroup.add(udeng);

    const goldCrest = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.35, 6), this.matGold);
    goldCrest.position.set(0, 0.38, -0.14);
    headGroup.add(goldCrest);

    parent.add(headGroup);
    return headGroup;
  }

  // 2. Prabu Hayam Wuruk (Mahkota Kencana Bertatah Emas)
  createHayamWurukMesh(parent) {
    const robe = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.52, 1.38, 10), this.matGold);
    robe.position.y = 1.25;
    robe.scale.set(1.1, 1.0, 0.74);
    parent.add(robe);

    const sash = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.44, 0.2, 10), this.matGajahMadaArmor);
    sash.position.y = 1.05;
    sash.scale.set(1.1, 1.0, 0.76);
    parent.add(sash);

    const headGroup = new THREE.Group();
    headGroup.position.set(0, 2.25, 0);
    const head = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.48, 10), this.matSkin);
    headGroup.add(head);

    // Mahkota Bertingkat Emas (Makuta Majapahit)
    const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.33, 0.55, 8), this.matGold);
    crown.position.y = 0.45;
    headGroup.add(crown);

    parent.add(headGroup);
    return headGroup;
  }

  // 3. Mpu Prapanca (Jubah Putih Sastrawan, Naskah Lontar)
  createMpuPrapancaMesh(parent) {
    const robe = new THREE.Mesh(new THREE.CylinderGeometry(0.33, 0.48, 1.32, 10), this.matPrapancaRobe);
    robe.position.y = 1.18;
    robe.scale.set(1.08, 1.0, 0.72);
    parent.add(robe);

    // Lontar di Tangan
    const scroll = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.65, 8), this.matLontar);
    scroll.rotation.z = Math.PI / 2;
    scroll.position.set(0, 1.15, -0.32);
    parent.add(scroll);

    const headGroup = new THREE.Group();
    headGroup.position.set(0, 2.1, 0);
    const head = new THREE.Mesh(new THREE.CylinderGeometry(0.23, 0.23, 0.46, 10), this.matSkin);
    headGroup.add(head);

    const turban = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.28, 0.2, 10), this.matPrapancaRobe);
    turban.position.y = 0.22;
    headGroup.add(turban);

    parent.add(headGroup);
    return headGroup;
  }

  // 4. Ki Tumenggung Arya Pedagang (Topi Caping Bambu Anyaman)
  createPedagangMesh(parent) {
    const shirt = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.44, 1.22, 8), this.matPedagangCloth);
    shirt.position.y = 1.15;
    shirt.scale.set(1.06, 1.0, 0.72);
    parent.add(shirt);

    const headGroup = new THREE.Group();
    headGroup.position.set(0, 2.05, 0);
    const head = new THREE.Mesh(new THREE.CylinderGeometry(0.23, 0.23, 0.46, 10), this.matSkin);
    headGroup.add(head);

    // Topi Caping Bambu Khas Petani / Pedagang
    const caping = new THREE.Mesh(new THREE.ConeGeometry(0.68, 0.28, 12), this.matCaping);
    caping.position.y = 0.32;
    headGroup.add(caping);

    parent.add(headGroup);
    return headGroup;
  }

  // 5. Prajurit Pengawal Brantas (Helm Tembaga, Tombak)
  createPrajuritMesh(parent) {
    const armor = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.44, 1.22, 8), this.matPrajuritArmor);
    armor.position.y = 1.2;
    armor.scale.set(1.08, 1.0, 0.72);
    parent.add(armor);

    // Tombak Panjang
    const spearPole = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 3.2, 6), this.matPedagangCloth);
    spearPole.position.set(0.55, 1.6, -0.15);
    parent.add(spearPole);

    const spearTip = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.35, 6), this.matBronze);
    spearTip.position.set(0.55, 3.35, -0.15);
    parent.add(spearTip);

    const headGroup = new THREE.Group();
    headGroup.position.set(0, 2.1, 0);
    const head = new THREE.Mesh(new THREE.CylinderGeometry(0.23, 0.23, 0.46, 10), this.matSkin);
    headGroup.add(head);

    const helmet = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.29, 0.24, 10), this.matBronze);
    helmet.position.y = 0.22;
    headGroup.add(helmet);

    parent.add(headGroup);
    return headGroup;
  }

  // Cek apakah pemain berada dekat dengan NPC untuk memicu dialog
  checkProximity(playerPos) {
    for (const item of this.npcMeshes) {
      const d = Math.hypot(playerPos.x - item.data.coords.x, playerPos.z - item.data.coords.z);
      if (d <= 3.6) {
        return { type: 'npc', target: item.data };
      }
    }
    return null;
  }

  update(dt, elapsedTime, playerPos, questSystem = null) {
    for (const item of this.npcMeshes) {
      // 1. Tentukan status lencana quest dinamis untuk NPC ini
      let badgeType = 'chat';
      let floorColor = '#ffc83b';
      let haloColor = '#ffd700';

      if (questSystem) {
        const qState = questSystem.getNPCDialogueState(item.data.id);
        if (qState) {
          if (qState.questCanTurnIn) {
            badgeType = 'turn_in'; // 🏆 Siap diserahkan & selesai!
            floorColor = '#5df2bd';
            haloColor = '#5df2bd';
          } else if (qState.status === 'in_progress') {
            badgeType = 'in_progress'; // 📜 Sedang berjalan, mengumpulkan artefak
            floorColor = '#60a5fa';
            haloColor = '#93c5fd';
          } else if (qState.status === 'completed') {
            badgeType = 'completed'; // ✅ Misi telah selesai
            floorColor = '#10b981';
            haloColor = '#6ee7b7';
          }
        } else {
          // Cek apakah NPC ini adalah pemberi misi aktif yang belum diambil
          const activeQ = questSystem.getActiveQuest();
          if (activeQ && activeQ.npcId === item.data.id) {
            badgeType = 'active_quest'; // ❗ Misi baru tersedia!
            floorColor = '#f59e0b';
            haloColor = '#fef08a';
          }
        }
      }

      // Update tekstur lencana jika terjadi perubahan status
      if (item.currentBadgeType !== badgeType) {
        item.currentBadgeType = badgeType;
        if (this.badgeTextures[badgeType]) {
          item.badgeSprite.material.map = this.badgeTextures[badgeType];
          item.badgeSprite.material.needsUpdate = true;
        }
        item.floorRing.material.color.set(floorColor);
        item.haloMesh.material.color.set(haloColor);
      }

      // 2. Animasi Denyut & Pantulan Melayang
      const isTurnIn = badgeType === 'turn_in';
      const bounceSpeed = isTurnIn ? 5.0 : 2.6;
      const bounceAmp = isTurnIn ? 0.22 : 0.12;
      item.badgeSprite.position.y = 3.15 + Math.sin(elapsedTime * bounceSpeed + item.phase) * bounceAmp;

      const scalePulse = isTurnIn
        ? 1.15 + Math.sin(elapsedTime * 6.0 + item.phase) * 0.15
        : 1.0 + Math.sin(elapsedTime * 2.4 + item.phase) * 0.06;
      item.badgeSprite.scale.set(scalePulse, scalePulse, 1.0);

      // Cincin halo di bawah badge berputar & berdenyut
      item.haloMesh.rotation.y = elapsedTime * (isTurnIn ? 3.5 : 1.2);
      item.haloMesh.position.y = 2.62 + Math.sin(elapsedTime * bounceSpeed + item.phase) * 0.08;

      // Denyut cincin emas di lantai
      const floorPulse = 1.0 + Math.sin(elapsedTime * (isTurnIn ? 4.5 : 2.5) + item.phase) * (isTurnIn ? 0.14 : 0.08);
      item.floorRing.scale.set(floorPulse, floorPulse, 1);

      // 3. Jika pemain dekat, NPC memutar kepala menghadap pemain
      const dist = Math.hypot(playerPos.x - item.data.coords.x, playerPos.z - item.data.coords.z);
      if (dist < 14.0 && item.headGroup) {
        const angle = Math.atan2(playerPos.x - item.data.coords.x, playerPos.z - item.data.coords.z);
        item.headGroup.rotation.y = THREE.MathUtils.lerp(item.headGroup.rotation.y, angle, dt * 6);
      }
    }
  }
}
