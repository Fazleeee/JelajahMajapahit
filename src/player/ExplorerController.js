import * as THREE from 'three';
import { getTerrainHeight, getWalkableHeight, getRoadFactor } from '../world/Terrain.js';
import { BRIDGES, LANDMARKS, SOLID_COLLIDERS } from '../world/WorldData.js';
import { CharacterModel } from './CharacterModel.js';
import { ParticleFX } from './ParticleFX.js';
import { TouchControls } from './TouchControls.js';
import { gameState, GameStates, ModalTypes } from '../core/GameState.js';
import { spatialGrid } from '../core/SpatialGrid.js';

export class ExplorerController {
  constructor(scene, camera, domElement, audioSystem, explorationSystem, npcSystem) {
    this.scene = scene;
    this.camera = camera;
    this.domElement = domElement;
    this.audio = audioSystem;
    this.exploration = explorationSystem;
    this.npcSystem = npcSystem;

    // Start position in Hutan Tarik (Zona 1)
    this.position = new THREE.Vector3(0, getWalkableHeight(0, 142), 142);
    this.verticalVelocity = 0;
    this.isGrounded = true;
    this.isWater = false;

    // Speed and Jump tuning
    this.baseSpeed = 12.0;
    this.sprintMultiplier = 1.85;
    this.waterSpeedMultiplier = 0.58;
    this.jumpForce = 10.8;
    this.gravity = 27.0;

    // Camera Orbit
    this.yaw = 0; // Menghadap Utara (-Z) ke arah Kotaraja & Kedaton
    this.pitch = 0.32;
    this.cameraDistance = 10.5;
    this.targetCameraDistance = 10.5;
    this.mouseSensitivity = 1.0;
    this.isEagleMode = false;

    // Keys State
    this.keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      sprint: false,
      jump: false
    };

    this.isDragging = false;
    this.prevMouse = { x: 0, y: 0 };
    this.nearLandmark = null;
    this.nearInteractive = null;
    this.lastInteractionTime = 0;

    // Cinematic Viewpoint Sweep State
    this.isCinematicSync = false;
    this.cinematicTimer = 0;
    this._viewpointTimeoutId = null;
    this.cinematicCenter = new THREE.Vector3();
    this.isSprintingNow = false;

    // Pre-allocated scratch vectors (Zero GC allocation per frame)
    this._forward = new THREE.Vector3();
    this._right = new THREE.Vector3();
    this._moveDir = new THREE.Vector3();
    this._camOffset = new THREE.Vector3();
    this._targetCamPos = new THREE.Vector3();

    // Subsystems
    this.characterRig = new CharacterModel();
    this.scene.add(this.characterRig.group);

    this.particles = new ParticleFX(scene);

    // Precompute ground Prasasti stone stele colliders (hindari yang di dalam jembatan/terbang)
    this.steleObstacles = LANDMARKS
      .filter((lm) => !['jembatan_brantas', 'candi_bajang_ratu', 'balairung_kencana', 'kapal_jung'].includes(lm.id))
      .map((lm) => {
        const y = Math.max(getTerrainHeight(lm.position.x, lm.position.z), 1.6);
        return { x: lm.position.x, z: lm.position.z, yMin: y - 0.6, yMax: y + 2.6, radius: 0.46 };
      });

    this.initFootstepAudioBinding();
    this.bindEvents();
    this.touchControls = new TouchControls(this.domElement, this);
  }

  initFootstepAudioBinding() {
    this.characterRig.onStep(() => {
      const surface = this.getCurrentSurfaceType();
      if (this.audio) {
        this.audio.playFootstep(surface);
      }

      // Munculkan efek partikel sesuai pijakan
      if (this.isWater) {
        this.particles.spawnWaterRipple(this.position, 0.26);
      } else if (this.isSprintingNow && this.isGrounded) {
        this.particles.spawnDust(this.position);
      }
    });
  }

  getCurrentSurfaceType() {
    if (this.isWater) return 'water';

    // Cek apakah di atas jembatan kayu atau dermaga
    for (const b of BRIDGES) {
      if (
        this.position.x >= b.xMin &&
        this.position.x <= b.xMax &&
        this.position.z >= b.zMin &&
        this.position.z <= b.zMax
      ) {
        return 'wood';
      }
    }
    if (this.position.x <= -114 && this.position.x >= -135 && this.position.z >= 12 && this.position.z <= 26) {
      return 'wood';
    }

    // Cek apakah di jalan bata merah atau area candi
    const rf = getRoadFactor(this.position.x, this.position.z);
    if (rf > 0.4 || this.position.x > 75 || this.position.z < -60) {
      return 'stone';
    }

    return 'grass';
  }

  bindEvents() {
    window.addEventListener('keydown', (e) => {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;

      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          this.keys.forward = true;
          break;
        case 'KeyS':
        case 'ArrowDown':
          this.keys.backward = true;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          this.keys.left = true;
          break;
        case 'KeyD':
        case 'ArrowRight':
          this.keys.right = true;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          this.keys.sprint = true;
          break;
        case 'Space':
          if (gameState.canPlayerMove() && (this.isGrounded || this.isWater)) {
            this.verticalVelocity = this.jumpForce;
            this.isGrounded = false;
            if (this.audio) this.audio.playJump();
          }
          break;
        case 'KeyE':
          if (e.repeat) return;
          if (gameState.currentState === GameStates.INTRO) return;
          if (this.handleInteraction()) {
            e._majapahitKeyEHandled = true;
            e.stopImmediatePropagation();
          }
          break;
        case 'KeyF':
          if (gameState.currentState === GameStates.INTRO) return;
          this.toggleLenteraWaktu();
          break;
      }
    });

    window.addEventListener('keyup', (e) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          this.keys.forward = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          this.keys.backward = false;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          this.keys.left = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          this.keys.right = false;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          this.keys.sprint = false;
          break;
      }
    });

    // Mouse Drag untuk putar kamera
    this.domElement.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.prevMouse.x = e.clientX;
      this.prevMouse.y = e.clientY;
      if (this.audio) this.audio.ensureContext();
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      if (!gameState.canPlayerLook()) return;
      const dx = e.clientX - this.prevMouse.x;
      const dy = e.clientY - this.prevMouse.y;
      this.prevMouse.x = e.clientX;
      this.prevMouse.y = e.clientY;

      this.yaw -= dx * 0.0055 * this.mouseSensitivity;
      this.pitch = THREE.MathUtils.clamp(
        this.pitch + dy * 0.0045 * this.mouseSensitivity,
        0.06,
        1.35
      );
    });

    this.domElement.addEventListener(
      'wheel',
      (e) => {
        if (!gameState.canPlayerLook()) return;
        this.targetCameraDistance = THREE.MathUtils.clamp(
          this.targetCameraDistance + e.deltaY * 0.012,
          5.0,
          38.0
        );
      },
      { passive: true }
    );
    window.addEventListener('majapahit:interact', () => {
      this.handleInteraction();
    });
    window.addEventListener('majapahit:lantern-request', () => {
      if (gameState.currentState !== GameStates.INTRO) {
        this.toggleLenteraWaktu();
      }
    });
  }

  handleInteraction() {
    if (this.isCinematicSync) return false;
    if (gameState.currentState === GameStates.INTRO) return false;

    const now = performance.now();
    if (now - this.lastInteractionTime < 220) return false;
    this.lastInteractionTime = now;

    // 1. Jika ada jendela interaksi (Lore Kropak Lontar, Dialog Tokoh, Peti Artefak, atau Quest Popover) yang sedang terbuka,
    // menekan tombol E akan langsung menutupnya via Central GameState
    if (gameState.isInteractionModalOpen()) {
      if (this.audio) this.audio.playDialoguePop();
      gameState.closeAllModals();
      return true;
    }

    // Jika modal non-interaksi (Atlas, Panduan, Quiz, Jurnal, Menu) sedang terbuka, jangan pemicu interaksi dunia di bawahnya
    if (gameState.isModalOpen()) return false;

    if (this.nearInteractive) {
      if (this.nearInteractive.type === 'npc') {
        if (this.audio) this.audio.playDialoguePop();
        gameState.openModal(ModalTypes.DIALOGUE, { npc: this.nearInteractive.target });
        return true;
      } else if (this.nearInteractive.type === 'viewpoint') {
        const vpData = this.exploration.syncViewpoint(this.nearInteractive.target);
        if (vpData) {
          this.startViewpointCinematic(vpData);
          return true;
        }
        return false;
      } else if (this.nearInteractive.type === 'artifact') {
        const artData = this.exploration.collectArtifact(this.nearInteractive.target);
        if (artData) {
          gameState.openModal(ModalTypes.ARTIFACT, { artifact: artData });
          return true;
        }
        return false;
      }
    }

    if (this.nearLandmark) {
      if (this.audio) this.audio.playDiscoveryChime();
      gameState.openModal(ModalTypes.LORE, { landmark: this.nearLandmark });
      return true;
    }

    return false;
  }

  toggleLenteraWaktu() {
    if (!this.exploration) return;
    const active = this.exploration.toggleLenteraWaktu();

    // Perkuat cahaya lentera pada karakter
    if (this.characterRig && this.characterRig.lanternLight) {
      this.characterRig.lanternLight.intensity = active ? 3.4 : 1.2;
      this.characterRig.lanternLight.distance = active ? 32 : 16;
      this.characterRig.lanternLight.color.set(active ? '#ffe169' : '#ff9933');
    }

    window.dispatchEvent(
      new CustomEvent('majapahit:lantern-toggle', {
        detail: { active }
      })
    );
  }

  startViewpointCinematic(vpData) {
    this.isCinematicSync = true;
    this.cinematicTimer = 0;
    this.cinematicCenter.copy(this.position);

    window.dispatchEvent(
      new CustomEvent('majapahit:viewpoint-synced', {
        detail: { viewpoint: vpData }
      })
    );

    if (this._viewpointTimeoutId) clearTimeout(this._viewpointTimeoutId);
    this._viewpointTimeoutId = setTimeout(() => {
      this._viewpointTimeoutId = null;
      this.isCinematicSync = false;
    }, 3800);
  }

  toggleEagleMode() {
    this.isEagleMode = !this.isEagleMode;
    return this.isEagleMode;
  }

  setMouseSensitivity(multiplier) {
    this.mouseSensitivity = THREE.MathUtils.clamp(multiplier, 0.25, 2.5);
  }

  canMoveTo(targetX, targetZ, currentY) {
    if (Math.abs(targetX) > 185 || Math.abs(targetZ) > 185) return false;

    const currentWalkY = Math.max(getWalkableHeight(this.position.x, this.position.z), currentY);
    const targetWalkY = getWalkableHeight(targetX, targetZ);
    const stepUpDelta = targetWalkY - currentWalkY;

    // Tidak boleh menaiki dinding atau tebing curam (> 1.35m)
    if (stepUpDelta > 1.35) return false;

    // Cek rintangan padat via Spatial Hash Grid O(1)
    const playerRadius = 0.45;
    const colliders = spatialGrid.queryColliders(targetX, targetZ, 4);
    for (let i = 0; i < colliders.length; i++) {
      const obs = colliders[i];
      if (currentY >= obs.yMin && currentY <= obs.yMax) {
        if (obs.type === 'circle') {
          const d2 = (targetX - obs.x) ** 2 + (targetZ - obs.z) ** 2;
          const r = obs.radius + playerRadius;
          if (d2 < r * r) return false;
        } else {
          if (
            targetX >= obs.xMin - playerRadius &&
            targetX <= obs.xMax + playerRadius &&
            targetZ >= obs.zMin - playerRadius &&
            targetZ <= obs.zMax + playerRadius
          ) {
            return false;
          }
        }
      }
    }

    // Hitbox Tubuh Tokoh Sejarah NPC agar pemain tidak menembus tubuh tokoh
    if (this.npcSystem && this.npcSystem.npcMeshes) {
      for (let i = 0; i < this.npcSystem.npcMeshes.length; i++) {
        const item = this.npcSystem.npcMeshes[i];
        const ny = item.group.position.y;
        if (currentY >= ny - 1.0 && currentY <= ny + 2.4) {
          const r = 0.42 + playerRadius;
          const d2 = (targetX - item.data.coords.x) ** 2 + (targetZ - item.data.coords.z) ** 2;
          if (d2 < r * r) return false;
        }
      }
    }

    // Hitbox Peti Artefak Sejarah
    if (this.exploration && this.exploration.artifactMeshes) {
      for (let i = 0; i < this.exploration.artifactMeshes.length; i++) {
        const item = this.exploration.artifactMeshes[i];
        const ay = item.group.position.y;
        if (currentY >= ay - 0.8 && currentY <= ay + 1.4) {
          const r = 0.36 + playerRadius;
          const d2 = (targetX - item.data.coords.x) ** 2 + (targetZ - item.data.coords.z) ** 2;
          if (d2 < r * r) return false;
        }
      }
    }

    // Hitbox Prasasti Sejarah Batu
    if (this.steleObstacles) {
      for (let i = 0; i < this.steleObstacles.length; i++) {
        const st = this.steleObstacles[i];
        if (currentY >= st.yMin && currentY <= st.yMax) {
          const r = st.radius + playerRadius;
          const d2 = (targetX - st.x) ** 2 + (targetZ - st.z) ** 2;
          if (d2 < r * r) return false;
        }
      }
    }

    return true;
  }

  update(dt, elapsedTime) {
    // 1. Hitung vektor pergerakan relatif terhadap arah kamera (tanpa alokasi memori baru)
    const forward = this._forward.set(-Math.sin(this.yaw), 0, -Math.cos(this.yaw));
    const right = this._right.set(Math.cos(this.yaw), 0, -Math.sin(this.yaw));

    const moveDir = this._moveDir.set(0, 0, 0);
    if (this.keys.forward) moveDir.add(forward);
    if (this.keys.backward) moveDir.sub(forward);
    if (this.keys.right) moveDir.add(right);
    if (this.keys.left) moveDir.sub(right);

    // Integrasi Virtual Joystick Roblox
    if (this.touchControls) {
      const tv = this.touchControls.getMoveVector();
      if (tv.magnitude > 0.02) {
        moveDir.addScaledVector(forward, tv.y);
        moveDir.addScaledVector(right, tv.x);
      }
    }

    const canMove = gameState.canPlayerMove() && !this.isCinematicSync;
    const isMoving = canMove && moveDir.lengthSq() > 0.001;

    // Cek apakah sedang berada di dalam air
    const terrainOnlyY = getTerrainHeight(this.position.x, this.position.z);
    this.isWater = terrainOnlyY < 0.22 && this.position.y <= 0.35;

    // Kecepatan adaptif (dukung Sprint fisik tombol keyboard & tombol Sprint mobile)
    let speed = this.baseSpeed;
    const isSprinting = this.keys.sprint || (this.touchControls && this.touchControls.isSprinting());
    this.isSprintingNow = isSprinting;
    if (this.isWater) {
      speed *= this.waterSpeedMultiplier;
    } else if (isSprinting) {
      speed *= this.sprintMultiplier;
    }

    if (this.isEagleMode) speed *= 1.8;

    if (isMoving) {
      moveDir.normalize();

      const dx = moveDir.x * speed * dt;
      const dz = moveDir.z * speed * dt;

      let newX = this.position.x;
      let newZ = this.position.z;

      // 1. Coba gerak diagonal penuh
      if (this.canMoveTo(this.position.x + dx, this.position.z + dz, this.position.y)) {
        newX = this.position.x + dx;
        newZ = this.position.z + dz;
      } else {
        // 2. Sliding sepanjang sumbu X jika membentur dinding menyudut
        if (Math.abs(dx) > 0.0001 && this.canMoveTo(this.position.x + dx, this.position.z, this.position.y)) {
          newX = this.position.x + dx;
        }
        // 3. Sliding sepanjang sumbu Z
        if (Math.abs(dz) > 0.0001 && this.canMoveTo(newX, this.position.z + dz, this.position.y)) {
          newZ = this.position.z + dz;
        }
      }

      this.position.x = newX;
      this.position.z = newZ;

      // Putar tubuh karakter menghadap arah gerak
      const targetAngle = Math.atan2(moveDir.x, moveDir.z) + Math.PI;
      let diff = targetAngle - this.characterRig.group.rotation.y;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      this.characterRig.group.rotation.y += diff * Math.min(1, dt * 14);
    }

    // 2. Gravitasi & Pendaratan
    const groundY = Math.max(-0.4, getWalkableHeight(this.position.x, this.position.z));
    this.verticalVelocity -= this.gravity * dt;
    this.position.y += this.verticalVelocity * dt;

    if (this.position.y <= groundY) {
      if (!this.isGrounded && this.verticalVelocity < -5.5) {
        // Efek pendaratan
        if (this.audio) this.audio.playLand();
        this.characterRig.setLandCompression();
      }
      this.position.y = groundY;
      this.verticalVelocity = 0;
      this.isGrounded = true;
    }

    this.characterRig.group.position.copy(this.position);

    // 3. Update Animasi Prosedural Karakter
    this.characterRig.update(
      {
        isMoving,
        isSprinting: this.isSprintingNow,
        isGrounded: this.isGrounded,
        isWater: this.isWater,
        verticalVelocity: this.verticalVelocity,
        speed
      },
      dt,
      elapsedTime
    );

    // 4. Update Partikel
    this.particles.update(dt);

    // 5. Cek Kedekatan dengan NPC, Peti Artefak & Viewpoint
    let interactive = this.npcSystem ? this.npcSystem.checkProximity(this.position) : null;
    if (!interactive && this.exploration) {
      interactive = this.exploration.checkProximity(this.position);
    }
    this.nearInteractive = interactive;

    // Cek Kedekatan dengan Titik Sejarah (Landmark) via Spatial Grid O(1)
    let foundNearby = null;
    const nearbyLandmarks = spatialGrid.queryLandmarks(this.position.x, this.position.z, 24);
    for (let i = 0; i < nearbyLandmarks.length; i++) {
      const lm = nearbyLandmarks[i];
      const d = Math.hypot(this.position.x - lm.position.x, this.position.z - lm.position.z);
      if (d <= lm.radius) {
        foundNearby = lm;
        break;
      }
    }
    this.nearLandmark = foundNearby;

    if (this.touchControls) {
      this.touchControls.updateInteractButton(this.nearInteractive || this.nearLandmark);
    }

    // 6. Update Kamera 360° yang Halus (atau Mode Cinematic Sinkronisasi Viewpoint)
    if (this.isCinematicSync) {
      this.cinematicTimer += dt;
      const progress = this.cinematicTimer / 3.8;
      const sweepYaw = progress * Math.PI * 2 + this.yaw;
      const camH = 6.8 + Math.sin(progress * Math.PI) * 4.0;
      const camR = 14.5 + Math.sin(progress * Math.PI) * 3.0;

      const sweepCamPos = this._targetCamPos.set(
        this.cinematicCenter.x + Math.sin(sweepYaw) * camR,
        this.cinematicCenter.y + camH,
        this.cinematicCenter.z + Math.cos(sweepYaw) * camR
      );
      this.camera.position.lerp(sweepCamPos, Math.min(1, dt * 10));
      this.camera.lookAt(this.cinematicCenter.x, this.cinematicCenter.y + 2.0, this.cinematicCenter.z);
    } else {
      this.cameraDistance = THREE.MathUtils.lerp(this.cameraDistance, this.targetCameraDistance, dt * 8);
      const activeDist = this.isEagleMode ? 65 : this.cameraDistance;
      const activePitch = this.isEagleMode ? 0.82 : this.pitch;

      const cosPitch = Math.cos(activePitch);
      const camOffset = this._camOffset.set(
        Math.sin(this.yaw) * cosPitch * activeDist,
        Math.sin(activePitch) * activeDist + 2.2,
        Math.cos(this.yaw) * cosPitch * activeDist
      );

      const targetCamPos = this._targetCamPos.copy(this.position).add(camOffset);
      const camGroundY = getWalkableHeight(targetCamPos.x, targetCamPos.z) + 1.2;
      if (targetCamPos.y < camGroundY) targetCamPos.y = camGroundY;

      this.camera.position.lerp(targetCamPos, Math.min(1, dt * 12));
      this.camera.lookAt(this.position.x, this.position.y + 1.8, this.position.z);
    }
  }
}
