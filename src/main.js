import * as THREE from 'three';
import { gameState, ModalTypes } from './core/GameState.js';
import { eventBus, GameEvents } from './core/EventBus.js';
import { spatialGrid } from './core/SpatialGrid.js';
import { SOLID_COLLIDERS, LANDMARKS } from './world/WorldData.js';
import { NPC_DATA } from './quests/QuestData.js';
import { TerrainSystem } from './world/Terrain.js';
import { SkyAndLightingSystem, TIME_PRESETS } from './world/SkyAndLighting.js';
import { VegetationAndNatureSystem } from './world/Vegetation.js';
import { ArchitectureSystem } from './world/Architecture.js';
import { ExplorationSystem } from './exploration/ExplorationSystem.js';
import { NPCSystem } from './npc/NPCSystem.js';
import { QuestSystem } from './quests/QuestSystem.js';
import { JournalSystem } from './journal/JournalSystem.js';
import { QuizSystem } from './quiz/QuizSystem.js';
import { ExplorerController } from './player/ExplorerController.js?v=2.2';
import { MinimapAndHUD } from './ui/MinimapAndHUD.js?v=2.2';
import { AudioSystem } from './audio/AudioSystem.js?v=2.2';
import { TimeLabPrologue } from './prologue/TimeLabPrologue.js?v=2.2';

class MajapahitWorldApp {
  constructor() {
    this.container = document.getElementById('canvas-container');
    this.clock = new THREE.Clock();
    this.isMobile =
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      window.innerWidth <= 1024;

    this.audio = new AudioSystem();
    this.initRendererAndScene();
    this.initWorldSystems();
    this.initUIBindings();
    this.animate();
  }

  initRendererAndScene() {
    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.5,
      this.isMobile ? 380 : 600
    );

    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isMobile || window.devicePixelRatio < 2,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.isMobile ? 1.35 : 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = this.isMobile ? THREE.PCFShadowMap : THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;

    this.container.appendChild(this.renderer.domElement);

    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.isMobile ? 1.35 : 2));
    });
  }

  initWorldSystems() {
    // 1. Terrain, River Brantas, Kolam Segaran, Hills, Moat & Bridges (GPU Shader Water + Merged Geometries)
    this.terrain = new TerrainSystem(this.scene);

    // 2. Dynamic Sky Dome, Sun/Moon Shadows (Adaptive Resolution & Player-Tracking Frustum)
    this.sky = new SkyAndLightingSystem(this.scene, this.terrain.waterMaterial, this.isMobile);

    // 3. Nusantara Flora (InstancedMesh Forest, GPU Fireflies, 3 Pooled PointLights)
    this.vegetation = new VegetationAndNatureSystem(this.scene, this.isMobile);

    // 4. Spatial Grid Optimization O(1) for architectural + procedural tree/torch/rock colliders
    const allColliders = [...SOLID_COLLIDERS, ...(this.vegetation.colliders || [])];
    spatialGrid.populate(allColliders, LANDMARKS, NPC_DATA);

    // 4. Arsitektur Megah 5 Wilayah Majapahit (Candi Bajang Ratu, Wringin Lawang, Pasar, Kapal Jung, Kedaton)
    this.architecture = new ArchitectureSystem(this.scene);

    // 5. Sistem Eksplorasi (Fog of War, Viewpoints, 10 Peti Artefak Rahasia, Lentera Waktu)
    this.exploration = new ExplorationSystem(this.scene, this.audio);

    // 6. Tokoh Sejarah Hidup (Gajah Mada, Hayam Wuruk, Prapanca, Pedagang, Prajurit)
    this.npcSystem = new NPCSystem(this.scene);

    // 7. Sistem Misi Sejarah Berantai (Quest System)
    this.questSystem = new QuestSystem(this.exploration, this.audio);

    // 8. Jurnal Sejarah Digital & Pemutar Artefak 3D 360°
    this.journalSystem = new JournalSystem(this.exploration, this.audio);

    // 9. Sistem Ujian Kuis Gerbang Palapa & Sertifikat
    this.quizSystem = new QuizSystem(this.audio);

    // 10. Explorer Character & 360° Camera Controller
    this.explorer = new ExplorerController(
      this.scene,
      this.camera,
      this.renderer.domElement,
      this.audio,
      this.exploration,
      this.npcSystem
    );

    // 10.5. Prolog Laboratorium & Portal Ruang-Waktu (Tahap Awal Game)
    this.labPrologue = new TimeLabPrologue(this.isMobile);
    this.explorer.enterLabMode(this.labPrologue);
    document.body.classList.add('prologue-lab-active');

    // 11. Minimap, Compass, Zone Detector, Fog of War & Quest HUD
    this.hud = new MinimapAndHUD(this.audio, this.exploration, this.questSystem);
  }

  completeArrivalToMajapahit() {
    if (!this.labPrologue || this.labPrologue.phase === 'MAJAPAHIT') return;

    this.labPrologue.finishPrologue();
    this.explorer.exitLabModeAndArrive();
    gameState.setCinematic(false);

    document.body.classList.remove('prologue-lab-active');
    document.body.classList.remove('cinematic-warp-active');

    const ttOverlay = document.getElementById('timetravel-overlay');
    const ttFlash = document.getElementById('timetravel-flash');
    if (ttOverlay) ttOverlay.classList.add('hidden');
    if (ttFlash) {
      ttFlash.classList.add('flash-burst');
      setTimeout(() => ttFlash.classList.remove('flash-burst'), 1050);
    }

    this.audio.playPortalArrival();
    this.audio.startGamelanAmbient();
    this.audio.initSpatialAmbience();
  }

  initUIBindings() {
    const introOverlay = document.getElementById('intro-overlay');
    const hudOverlay = document.getElementById('hud-overlay');
    const btnStart = document.getElementById('btn-start-game');
    const btnForceLandscape = document.getElementById('btn-force-landscape');

    const requestLandscapeAndFullscreen = () => {
      if (window.screen && window.screen.orientation && window.screen.orientation.lock) {
        window.screen.orientation.lock('landscape').catch(() => {});
      }
      if (!document.fullscreenElement) {
        const el = document.documentElement;
        if (el.requestFullscreen) {
          el.requestFullscreen().catch(() => {});
        } else if (el.webkitRequestFullscreen) {
          el.webkitRequestFullscreen().catch(() => {});
        }
      }
    };

    if (btnForceLandscape) {
      btnForceLandscape.addEventListener('click', () => {
        requestLandscapeAndFullscreen();
      });
    }

    btnStart.addEventListener('click', () => {
      this.audio.ensureContext();
      this.audio.playLabBootChime();
      introOverlay.classList.add('hidden');
      hudOverlay.classList.remove('hud-hidden');
      if (this.labPrologue && this.labPrologue.phase === 'INTRO') {
        this.labPrologue.startLab();
      }
      gameState.setGameStart();

      if (window.innerWidth <= 1024 || 'ontouchstart' in window) {
        requestLandscapeAndFullscreen();
      }
    });

    const btnSkipWarp = document.getElementById('btn-skip-warp');
    if (btnSkipWarp) {
      btnSkipWarp.addEventListener('click', (e) => {
        e.stopPropagation();
        this.completeArrivalToMajapahit();
      });
    }

    // Buka Ujian Kuis Gerbang Palapa (via Menu atau Event)
    window.addEventListener('majapahit:open-quiz', () => {
      gameState.openModal(ModalTypes.QUIZ);
    });

    window.addEventListener('majapahit:close-external-modals', () => {
      gameState.closeAllModals();
    });

    // Slider Sensitivitas Kamera 360°
    const camSlider = document.getElementById('cam-sensitivity-slider');
    const camSensVal = document.getElementById('cam-sensitivity-val');
    if (camSlider) {
      camSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10) || 100;
        if (camSensVal) camSensVal.textContent = `${val}%`;
        this.explorer.setMouseSensitivity(val / 100);
      });
    }

    // Audio Mute/Unmute Toggle
    const btnAudio = document.getElementById('btn-toggle-audio');
    if (btnAudio) {
      btnAudio.addEventListener('click', () => {
        const isMuted = this.audio.toggleMute();
        btnAudio.innerHTML = isMuted ? '<span>🔇</span> Suara Senyap' : '<span>🔊</span> Musik Gamelan';
        btnAudio.classList.toggle('muted', isMuted);
      });
    }

    // Click on interact prompt to interact (supports mouse/mobile touch)
    const interactPrompt = document.getElementById('interact-prompt');
    if (interactPrompt) {
      interactPrompt.addEventListener('click', () => {
        this.explorer.handleInteraction();
      });
    }

    // Time of Day buttons
    const timeButtons = document.querySelectorAll('.btn-time');
    const timeIcon = document.getElementById('time-icon');
    const timeLabel = document.getElementById('time-label');

    const applyPresetUI = (preset) => {
      if (timeIcon) timeIcon.textContent = preset.icon;
      if (timeLabel) timeLabel.textContent = preset.label;
      timeButtons.forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.preset === preset.id);
      });
    };

    timeButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.preset;
        this.sky.setPreset(key);
        applyPresetUI(TIME_PRESETS[key]);
      });
    });

    // Camera Mode Toggle Button
    const btnCamMode = document.getElementById('btn-toggle-cam');
    const updateCamButtonText = (isEagle) => {
      if (btnCamMode) {
        btnCamMode.innerHTML = isEagle
          ? '<span>🦅</span> Kamera Elang (V)'
          : '<span>🧭</span> Kamera Penjelajah (V)';
        btnCamMode.classList.toggle('active', isEagle);
      }
    };

    if (btnCamMode) {
      btnCamMode.addEventListener('click', () => {
        const isEagle = this.explorer.toggleEagleMode();
        updateCamButtonText(isEagle);
      });
    }

    // Keyboard shortcuts for Time (T), Eagle Camera (V), and Single-Modal Guard (J / K)
    window.addEventListener('keydown', (e) => {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
      if (document.body.classList.contains('prologue-lab-active')) return;
      if (e.code === 'KeyT') {
        const nextPreset = this.sky.cyclePreset();
        applyPresetUI(nextPreset);
      } else if (e.code === 'KeyV') {
        const isEagle = this.explorer.toggleEagleMode();
        updateCamButtonText(isEagle);
      } else if (e.code === 'KeyJ') {
        gameState.toggleModal(ModalTypes.JOURNAL);
      } else if (e.code === 'KeyK') {
        gameState.toggleModal(ModalTypes.QUIZ);
      }
    });
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const dt = Math.min(this.clock.getDelta(), 0.05);
    const elapsedTime = this.clock.getElapsedTime();

    // Tahap Prolog: Render Adegan Laboratorium & Portal Ruang-Waktu secara terisolasi & super mulus
    if (this.labPrologue && this.labPrologue.phase !== 'MAJAPAHIT') {
      const pPhase = this.labPrologue.phase;

      if (pPhase === 'LAB') {
        this.explorer.update(dt, elapsedTime);
        const distEl = document.getElementById('lab-portal-dist');
        if (distEl) {
          const d = Math.max(0, Math.round(Math.hypot(this.explorer.position.x, this.explorer.position.z - (-8.5)) - 3));
          distEl.textContent = d <= 1 ? 'MASUK!' : `${d}m`;
        }

        if (this.labPrologue.isNearPortalTrigger(this.explorer.position)) {
          this.labPrologue.startSuction(
            this.explorer.position,
            this.explorer.characterRig.group.rotation.y
          );
          gameState.setCinematic(true);
          if (this.explorer.touchControls) {
            this.explorer.touchControls.resetJoystick();
          }
          document.body.classList.add('cinematic-warp-active');

          const ttOverlay = document.getElementById('timetravel-overlay');
          const ttStatus = document.getElementById('timetravel-status');
          const ttYear = document.getElementById('timetravel-year');
          if (ttOverlay) ttOverlay.classList.remove('hidden');
          if (ttYear) ttYear.textContent = '2026 M';
          if (ttStatus) ttStatus.textContent = 'MEDAN GRAVITASI PORTAL AKTIF • TERHISAP...';
          this.audio.playPortalSuction();
        }
      }

      const warpResult = this.labPrologue.update(
        dt,
        elapsedTime,
        this.camera,
        this.explorer.characterRig,
        this.explorer.position
      );

      if (warpResult === 'ENTER_WORMHOLE') {
        this.audio.playWormholeWarp();
        const ttStatus = document.getElementById('timetravel-status');
        if (ttStatus) ttStatus.textContent = 'MENEMBUS LORONG RUANG & WAKTU NUSANTARA...';
      } else if (warpResult && warpResult.event === 'WORMHOLE_PROGRESS') {
        const p = warpResult.progress;
        const yr = Math.round(2026 - Math.pow(p, 0.72) * (2026 - 1350));
        const ttYear = document.getElementById('timetravel-year');
        const ttStatus = document.getElementById('timetravel-status');
        if (ttYear) ttYear.textContent = `${yr} M`;
        if (ttStatus) {
          if (p > 0.76) {
            ttStatus.textContent = 'KOORDINAT TERKUNCI • KERAJAAN MAJAPAHIT (1350 M)';
          } else if (p > 0.4) {
            ttStatus.textContent = 'MELINTASI GELOMBANG MASA NUSANTARA...';
          }
        }
      } else if (warpResult === 'ARRIVE_MAJAPAHIT') {
        this.completeArrivalToMajapahit();
        this.renderer.render(this.scene, this.camera);
        return;
      }

      this.renderer.render(this.labPrologue.scene, this.camera);
      return;
    }

    this.journalSystem.update(dt);

    // Smart Render Pause: saat Modal penuh/buram terbuka (Jurnal 3D, Kuis, Bantuan),
    // hentikan beban render dunia utama di latar belakang agar HP dingin & hemat baterai.
    const modal = gameState.activeModal;
    const isOpaqueModal =
      modal === ModalTypes.JOURNAL ||
      modal === ModalTypes.QUIZ ||
      modal === ModalTypes.HELP;

    if (isOpaqueModal) {
      return;
    }

    this.terrain.update(elapsedTime);
    this.sky.update(dt, this.explorer.position);
    this.vegetation.update(elapsedTime, this.sky.state.torchIntensity, this.explorer.position);
    this.architecture.update(elapsedTime);
    this.exploration.update(dt, elapsedTime, this.explorer.position, this.questSystem);
    this.npcSystem.update(dt, elapsedTime, this.explorer.position, this.questSystem);
    this.explorer.update(dt, elapsedTime);
    this.audio.updateAmbience(this.explorer.position, dt);
    this.hud.update(
      this.explorer.position,
      this.explorer.yaw,
      this.explorer.nearLandmark,
      this.explorer.nearInteractive
    );

    this.renderer.render(this.scene, this.camera);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new MajapahitWorldApp();
});
