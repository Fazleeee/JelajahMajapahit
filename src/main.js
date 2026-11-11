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
import { ExplorerController } from './player/ExplorerController.js';
import { MinimapAndHUD } from './ui/MinimapAndHUD.js';
import { AudioSystem } from './audio/AudioSystem.js';

class MajapahitWorldApp {
  constructor() {
    this.container = document.getElementById('canvas-container');
    this.clock = new THREE.Clock();

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
      600
    );

    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;

    this.container.appendChild(this.renderer.domElement);

    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  initWorldSystems() {
    // 0. Spatial Grid Optimization O(1) for collisions and landmarks
    spatialGrid.populate(SOLID_COLLIDERS, LANDMARKS, NPC_DATA);

    // 1. Terrain, River Brantas, Kolam Segaran, Hills, Moat & Bridges
    this.terrain = new TerrainSystem(this.scene);

    // 2. Dynamic Sky Dome, Sun/Moon Shadows, Atmosphere & Time of Day
    this.sky = new SkyAndLightingSystem(this.scene, this.terrain.waterMaterial);

    // 3. Nusantara Flora (Pohon Maja Agung, Beringin, Kelapa, Lotus, Torches, Prasasti Signposts)
    this.vegetation = new VegetationAndNatureSystem(this.scene);

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

    // 11. Minimap, Compass, Zone Detector, Fog of War & Quest HUD
    this.hud = new MinimapAndHUD(this.audio, this.exploration, this.questSystem);
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
      this.audio.startGamelanAmbient();
      this.audio.initSpatialAmbience();
      introOverlay.classList.add('hidden');
      hudOverlay.classList.remove('hud-hidden');
      gameState.setGameStart();

      if (window.innerWidth <= 1024 || 'ontouchstart' in window) {
        requestLandscapeAndFullscreen();
      }
    });

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

    this.terrain.update(elapsedTime);
    this.sky.update(dt);
    this.vegetation.update(elapsedTime, this.sky.state.torchIntensity);
    this.architecture.update(elapsedTime);
    this.exploration.update(dt, elapsedTime, this.explorer.position, this.questSystem);
    this.npcSystem.update(dt, elapsedTime, this.explorer.position, this.questSystem);
    this.journalSystem.update(dt);
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
