// Virtual Joystick, Touch Camera Orbit, and Roblox Mobile Controls for Ekspedisi Majapahit 3D
import * as THREE from 'three';
import { gameState } from '../core/GameState.js';

export class TouchControls {
  constructor(domElement, explorerController) {
    this.domElement = domElement;
    this.explorer = explorerController;

    // Detection
    this.isTouchDevice = this.detectTouchDevice();
    this.enabled = this.isTouchDevice;

    // Virtual Joystick State
    this.joystickActive = false;
    this.joystickTouchId = null;
    this.joystickCenter = { x: 0, y: 0 };
    this.joystickVector = { x: 0, y: 0, magnitude: 0 }; // Normalized -1 to 1
    this.maxJoystickRadius = 48; // px

    // Camera Orbit Touch State
    this.cameraTouchId = null;
    this.lastCameraPos = { x: 0, y: 0 };
    this.cameraSensitivity = 0.0058;

    // Pinch Zoom State
    this.pinchTouchId1 = null;
    this.pinchTouchId2 = null;
    this.lastPinchDist = 0;

    // Mobile Buttons State
    this.isSprintActive = false;

    // Scratch vector to return (zero GC allocation)
    this._moveVector = { x: 0, y: 0, magnitude: 0 };

    this.initDOMReferences();
    this.bindEvents();
    this.updateVisibility();
  }

  detectTouchDevice() {
    return (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      navigator.msMaxTouchPoints > 0 ||
      window.matchMedia('(pointer: coarse)').matches
    );
  }

  initDOMReferences() {
    this.container = document.getElementById('mobile-controls');
    this.joystickZone = document.getElementById('joystick-zone');
    this.joystickBase = document.getElementById('joystick-base');
    this.joystickKnob = document.getElementById('joystick-knob');

    this.btnJump = document.getElementById('btn-mobile-jump');
    this.btnSprint = document.getElementById('btn-mobile-sprint');
    this.btnInteract = document.getElementById('btn-mobile-interact');
    this.btnInteractLabel = document.getElementById('btn-mobile-interact-label');
  }

  updateVisibility() {
    if (!this.container) return;
    if (this.isTouchDevice || window.innerWidth <= 1024) {
      this.container.classList.remove('hidden-desktop');
      document.body.classList.add('touch-mode-active');
    } else {
      this.container.classList.add('hidden-desktop');
      document.body.classList.remove('touch-mode-active');
    }
  }

  bindEvents() {
    // Window resize / orientation change detection
    window.addEventListener('resize', () => {
      this.updateVisibility();
    });

    if (window.screen && window.screen.orientation) {
      window.screen.orientation.addEventListener('change', () => {
        this.updateVisibility();
      });
    }

    // 1. Virtual Joystick Touch Events
    if (this.joystickZone) {
      this.joystickZone.addEventListener(
        'touchstart',
        (e) => this.handleJoystickStart(e),
        { passive: false }
      );
    }

    // 2. Mobile Action Buttons (Jump, Sprint, Interact)
    if (this.btnJump) {
      this.btnJump.addEventListener(
        'touchstart',
        (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.triggerJump();
        },
        { passive: false }
      );
    }

    if (this.btnSprint) {
      this.btnSprint.addEventListener(
        'touchstart',
        (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.toggleSprint();
        },
        { passive: false }
      );
    }

    if (this.btnInteract) {
      this.btnInteract.addEventListener(
        'touchstart',
        (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.triggerInteract();
        },
        { passive: false }
      );
    }

    // 3. Global Canvas Touch for Camera Look & Pinch Zoom & Joystick Move/End
    window.addEventListener(
      'touchstart',
      (e) => this.handleGlobalTouchStart(e),
      { passive: false }
    );
    window.addEventListener(
      'touchmove',
      (e) => this.handleGlobalTouchMove(e),
      { passive: false }
    );
    window.addEventListener(
      'touchend',
      (e) => this.handleGlobalTouchEnd(e),
      { passive: false }
    );
    window.addEventListener(
      'touchcancel',
      (e) => this.handleGlobalTouchEnd(e),
      { passive: false }
    );
  }

  handleJoystickStart(e) {
    if (!gameState.canPlayerMove()) return;
    e.preventDefault();

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (this.joystickTouchId === null) {
        this.joystickTouchId = touch.identifier;
        this.joystickActive = true;

        if (this.joystickBase) {
          const rect = this.joystickBase.getBoundingClientRect();
          this.joystickCenter = {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2
          };
        }

        this.updateJoystickPosition(touch.clientX, touch.clientY);
        break;
      }
    }
  }

  handleGlobalTouchStart(e) {
    if (gameState.currentState !== 'EXPLORING') return;

    // Abaikan sentuhan jika target adalah tombol UI, modal, form, atau intro screen
    const target = e.target;
    if (
      target.closest('.overlay-screen') ||
      target.closest('#intro-overlay') ||
      target.closest('.hud-top-bar') ||
      target.closest('.unified-header-menu') ||
      target.closest('.minimap-frame') ||
      target.closest('.lore-modal') ||
      target.closest('.dialogue-modal') ||
      target.closest('.artifact-modal') ||
      target.closest('.journal-modal') ||
      target.closest('.quiz-modal') ||
      target.closest('.atlas-modal') ||
      target.closest('.help-modal') ||
      target.closest('.intro-card') ||
      target.closest('.mobile-actions-cluster') ||
      target.closest('.joystick-zone')
    ) {
      return;
    }

    // Hanya tangani kamera jika modal tidak aktif
    if (!gameState.canPlayerLook()) return;

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      // Sentuhan di sisi kanan layar (x > 38% lebar layar) untuk rotasi kamera 360°
      if (touch.clientX > window.innerWidth * 0.35) {
        if (this.cameraTouchId === null) {
          this.cameraTouchId = touch.identifier;
          this.lastCameraPos = { x: touch.clientX, y: touch.clientY };
        } else if (this.pinchTouchId2 === null) {
          // Sentuhan jari kedua di kanan: aktifkan pinch-to-zoom
          this.pinchTouchId1 = this.cameraTouchId;
          this.pinchTouchId2 = touch.identifier;
          this.lastPinchDist = this.getTouchesDistance(e.touches, this.pinchTouchId1, this.pinchTouchId2);
        }
      }
    }
  }

  handleGlobalTouchMove(e) {
    if (gameState.currentState !== 'EXPLORING') return;

    // 1. Perbarui Joystick jika aktif
    if (this.joystickActive && this.joystickTouchId !== null) {
      for (let i = 0; i < e.touches.length; i++) {
        const touch = e.touches[i];
        if (touch.identifier === this.joystickTouchId) {
          this.updateJoystickPosition(touch.clientX, touch.clientY);
          break;
        }
      }
    }

    // 2. Perbarui Pinch-to-Zoom jika 2 jari aktif
    if (this.pinchTouchId1 !== null && this.pinchTouchId2 !== null) {
      const dist = this.getTouchesDistance(e.touches, this.pinchTouchId1, this.pinchTouchId2);
      if (dist > 0 && this.lastPinchDist > 0 && this.explorer) {
        const delta = this.lastPinchDist - dist;
        this.explorer.targetCameraDistance = THREE.MathUtils.clamp(
          this.explorer.targetCameraDistance + delta * 0.05,
          5.0,
          36.0
        );
        this.lastPinchDist = dist;
      }
      return;
    }

    // 3. Perbarui Kamera Look jika 1 jari aktif
    if (this.cameraTouchId !== null && gameState.canPlayerLook() && this.explorer) {
      for (let i = 0; i < e.touches.length; i++) {
        const touch = e.touches[i];
        if (touch.identifier === this.cameraTouchId) {
          const dx = touch.clientX - this.lastCameraPos.x;
          const dy = touch.clientY - this.lastCameraPos.y;
          this.lastCameraPos = { x: touch.clientX, y: touch.clientY };

          this.explorer.yaw -= dx * this.cameraSensitivity * this.explorer.mouseSensitivity;
          this.explorer.pitch = THREE.MathUtils.clamp(
            this.explorer.pitch + dy * (this.cameraSensitivity * 0.85) * this.explorer.mouseSensitivity,
            0.06,
            1.35
          );
          break;
        }
      }
    }
  }

  handleGlobalTouchEnd(e) {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];

      // Lepas Joystick
      if (touch.identifier === this.joystickTouchId) {
        this.resetJoystick();
      }

      // Lepas Kamera
      if (touch.identifier === this.cameraTouchId) {
        this.cameraTouchId = null;
      }

      // Lepas Pinch Zoom
      if (touch.identifier === this.pinchTouchId1 || touch.identifier === this.pinchTouchId2) {
        this.pinchTouchId1 = null;
        this.pinchTouchId2 = null;
        this.lastPinchDist = 0;
      }
    }
  }

  updateJoystickPosition(clientX, clientY) {
    if (!gameState.canPlayerMove()) {
      this.resetJoystick();
      return;
    }

    const dx = clientX - this.joystickCenter.x;
    const dy = clientY - this.joystickCenter.y;
    const distance = Math.hypot(dx, dy);

    if (distance === 0) {
      this.joystickVector.x = 0;
      this.joystickVector.y = 0;
      this.joystickVector.magnitude = 0;
      if (this.joystickKnob) {
        this.joystickKnob.style.transform = `translate(0px, 0px)`;
      }
      return;
    }

    const clampedDist = Math.min(distance, this.maxJoystickRadius);
    const normX = dx / distance;
    const normY = dy / distance;

    // Posisi knob joystick
    const knobX = normX * clampedDist;
    const knobY = normY * clampedDist;

    if (this.joystickKnob) {
      this.joystickKnob.style.transform = `translate(${knobX}px, ${knobY}px)`;
    }

    // Nilai analog vektor pergerakan
    const magnitude = clampedDist / this.maxJoystickRadius;
    this.joystickVector.x = normX * magnitude;
    this.joystickVector.y = -normY * magnitude; // Y ke atas adalah nilai positif (maju)
    this.joystickVector.magnitude = magnitude;

    // Auto-sprint jika joystick didorong penuh (> 85% radius)
    if (magnitude > 0.88) {
      this.isSprintActive = true;
      if (this.btnSprint) this.btnSprint.classList.add('active');
    }
  }

  resetJoystick() {
    this.joystickActive = false;
    this.joystickTouchId = null;
    this.joystickVector.x = 0;
    this.joystickVector.y = 0;
    this.joystickVector.magnitude = 0;

    if (this.joystickKnob) {
      this.joystickKnob.style.transform = `translate(0px, 0px)`;
    }
  }

  triggerJump() {
    if (!gameState.canPlayerMove() || !this.explorer) return;
    if (this.explorer.isGrounded || this.explorer.isWater) {
      this.explorer.verticalVelocity = this.explorer.jumpForce;
      this.explorer.isGrounded = false;
      if (this.explorer.audio) this.explorer.audio.playJump();

      // Efek haptic vibration pada ponsel jika didukung
      if (navigator.vibrate) navigator.vibrate(20);
    }
  }

  toggleSprint() {
    this.isSprintActive = !this.isSprintActive;
    if (this.btnSprint) {
      this.btnSprint.classList.toggle('active', this.isSprintActive);
    }
    if (navigator.vibrate) navigator.vibrate(15);
  }

  triggerInteract() {
    if (!this.explorer) return;
    this.explorer.handleInteraction();
    if (navigator.vibrate) navigator.vibrate(25);
  }

  updateInteractButton(interactive) {
    if (!this.btnInteract) return;

    if (!interactive || gameState.isModalOpen()) {
      this.btnInteract.classList.add('hidden');
      return;
    }

    let actionLabel = 'E';
    let actionIco = '✨';

    if (interactive.type === 'npc') {
      actionLabel = 'Bicara';
      actionIco = '💬';
    } else if (interactive.type === 'viewpoint') {
      actionLabel = 'Sinkron';
      actionIco = '🦅';
    } else if (interactive.type === 'artifact') {
      actionLabel = 'Buka Peti';
      actionIco = '🏺';
    } else if (interactive.type === 'landmark' || interactive.title) {
      actionLabel = 'Prasasti';
      actionIco = '📜';
    }

    if (this.btnInteractLabel) {
      this.btnInteractLabel.textContent = actionLabel;
    }
    const iconSpan = this.btnInteract.querySelector('.btn-mobile-icon');
    if (iconSpan) {
      iconSpan.textContent = actionIco;
    }

    this.btnInteract.classList.remove('hidden');
  }

  getMoveVector() {
    if (!gameState.canPlayerMove()) {
      if (this.joystickActive) this.resetJoystick();
      this._moveVector.x = 0;
      this._moveVector.y = 0;
      this._moveVector.magnitude = 0;
      return this._moveVector;
    }

    this._moveVector.x = this.joystickVector.x;
    this._moveVector.y = this.joystickVector.y;
    this._moveVector.magnitude = this.joystickVector.magnitude;
    return this._moveVector;
  }

  isSprinting() {
    return this.isSprintActive;
  }

  getTouchesDistance(touches, id1, id2) {
    let t1 = null;
    let t2 = null;
    for (let i = 0; i < touches.length; i++) {
      if (touches[i].identifier === id1) t1 = touches[i];
      if (touches[i].identifier === id2) t2 = touches[i];
    }
    if (t1 && t2) {
      return Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
    }
    return 0;
  }
}
