// Web Audio API Procedural Sound & Ambient Generative Gamelan Engine
// Menghasilkan efek suara interaktif & alunan gamelan tradisional tanpa perlu file audio eksternal

export class AudioSystem {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.lastFootstepTime = 0;

    // Ambient Generative Gamelan State
    this.isAmbientPlaying = false;
    this.ambientTimer = null;
    // Skala Laras Pelog Tradisional Majapahit (Hz): Bem(1), Gulu(2), Dada(3), Pelog(4), Lima(5), Nem(6), Barang(7)
    this.pelogScale = [261.63, 277.18, 329.63, 349.23, 392.0, 440.0, 493.88, 523.25];

    // Spatial Procedural Ambience State (Sungai Brantas, Kolam Segaran, Angin Candi, Dermaga Jung)
    this.spatialInitialized = false;
    this.waterGain = null;
    this.waterFilter = null;
    this.windGain = null;
    this.windFilter = null;
    this.harborGain = null;
    this.harborFilter = null;
    this.lastCreakTime = 0;
  }

  ensureContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    if (this.ctx && !this.spatialInitialized) {
      this.initSpatialAmbience();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopGamelanAmbient();
      this.muteSpatialAmbience();
    } else {
      this.startGamelanAmbient();
    }
    return this.isMuted;
  }

  // Generative Gamelan Laras Pelog Ambient (Alunan bonang & gong lembut di latar belakang)
  startGamelanAmbient() {
    if (this.isAmbientPlaying || this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    this.isAmbientPlaying = true;
    this.scheduleNextGamelanNote();
  }

  stopGamelanAmbient() {
    this.isAmbientPlaying = false;
    if (this.ambientTimer) {
      clearTimeout(this.ambientTimer);
      this.ambientTimer = null;
    }
  }

  scheduleNextGamelanNote() {
    if (!this.isAmbientPlaying || this.isMuted) return;

    const delay = 1400 + Math.random() * 2200; // interval acak alami 1.4 - 3.6 detik
    this.ambientTimer = setTimeout(() => {
      this.playGamelanPluck();
      this.scheduleNextGamelanNote();
    }, delay);
  }

  playGamelanPluck() {
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;

    const noteIdx = Math.floor(Math.random() * this.pelogScale.length);
    const baseFreq = this.pelogScale[noteIdx];
    const isGong = Math.random() < 0.18; // 18% kemungkinan dentuman gong agung dalam

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    if (isGong) {
      // Suara Gong Ageng Dalam & Menggema
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(baseFreq * 0.5, now);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, now);

      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 3.8);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 3.9);
    } else {
      // Suara Bonang / Kenong Emas Berdenting Lembut
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, now);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 1.9);
    }
  }

  // Suara langkah kaki adaptif
  playFootstep(surface = 'grass') {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    if (now - this.lastFootstepTime < 0.22) return;
    this.lastFootstepTime = now;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    if (surface === 'water') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.12);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, now);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);
      osc.start(now);
      osc.stop(now + 0.15);
    } else if (surface === 'wood') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(65, now + 0.08);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.09);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (surface === 'stone') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(280, now);
      osc.frequency.exponentialRampToValueAtTime(90, now + 0.06);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.07);
      osc.start(now);
      osc.stop(now + 0.08);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.07);

      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.09);
    }
  }

  playJump() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(380, now + 0.15);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.16);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.17);
  }

  playLand() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(110, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.12);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.15);
  }

  playDiscoveryChime() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [659.25, 830.61, 987.77, 1318.51];

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      const startTime = now + idx * 0.08;
      gain.gain.setValueAtTime(0.22, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.9);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.95);
    });
  }

  playChestOpen() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const freqs = [293.66, 369.99, 440.0, 587.33];
    freqs.forEach((f, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, now + i * 0.12);

      const t0 = now + i * 0.12;
      gain.gain.setValueAtTime(0.28, t0);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + 1.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t0);
      osc.stop(t0 + 1.25);
    });
  }

  playLantern(active = true) {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    if (active) {
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(540, now + 0.28);
    } else {
      osc.frequency.setValueAtTime(540, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.22);
    }

    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.32);
  }

  playViewpointSync() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const chord = [440, 554.37, 659.25, 880, 1108.73, 1318.51];
    chord.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.14);

      const t0 = now + idx * 0.14;
      gain.gain.setValueAtTime(0.24, t0);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + 1.8);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t0);
      osc.stop(t0 + 1.9);
    });
  }

  playQuestUpdate() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [587.33, 880.0];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.1);

      const t0 = now + idx * 0.1;
      gain.gain.setValueAtTime(0.2, t0);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.8);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t0);
      osc.stop(t0 + 0.85);
    });
  }

  playQuestComplete() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const chords = [329.63, 440.0, 554.37, 659.25, 880.0];
    chords.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      const t0 = now + idx * 0.08;
      gain.gain.setValueAtTime(0.26, t0);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + 2.0);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t0);
      osc.stop(t0 + 2.1);
    });
  }

  playDialoguePop() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(420, now);
    osc.frequency.exponentialRampToValueAtTime(280, now + 0.04);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.06);
  }

  // Suara Kuis: Jawaban Benar (Melodi Gembira)
  playQuizCorrect() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      const t0 = now + idx * 0.08;
      gain.gain.setValueAtTime(0.24, t0);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.6);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t0);
      osc.stop(t0 + 0.65);
    });
  }

  // Suara Kuis: Jawaban Kurang Tepat (Nada Rendah)
  playQuizWrong() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.28);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.35);
  }

  // -------------------------------------------------------------
  // SPATIAL PROCEDURAL AMBIENCE (Air Sungai, Kolam, Angin Candi & Dermaga)
  // -------------------------------------------------------------
  initSpatialAmbience() {
    if (!this.ctx || this.spatialInitialized) return;
    this.spatialInitialized = true;

    try {
      // Create a seamless 3-second loopable pink-noise buffer
      const bufferSize = this.ctx.sampleRate * 3;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99765 * b0 + white * 0.0990460;
        b1 = 0.96300 * b1 + white * 0.1600000;
        b2 = 0.57000 * b2 + white * 0.4496730;
        output[i] = (b0 + b1 + b2 + white * 0.1848) * 0.12;
      }

      // 1. Water Ambience (Sungai Brantas & Kolam Segaran)
      this.waterSource = this.ctx.createBufferSource();
      this.waterSource.buffer = noiseBuffer;
      this.waterSource.loop = true;

      this.waterFilter = this.ctx.createBiquadFilter();
      this.waterFilter.type = 'lowpass';
      this.waterFilter.frequency.setValueAtTime(360, this.ctx.currentTime);

      this.waterGain = this.ctx.createGain();
      this.waterGain.gain.setValueAtTime(0, this.ctx.currentTime);

      this.waterSource.connect(this.waterFilter);
      this.waterFilter.connect(this.waterGain);
      this.waterGain.connect(this.ctx.destination);
      this.waterSource.start(0);

      // 2. Highland Wind Ambience (Lembah Candi Bajang Ratu & Sanggar)
      this.windSource = this.ctx.createBufferSource();
      this.windSource.buffer = noiseBuffer;
      this.windSource.loop = true;

      this.windFilter = this.ctx.createBiquadFilter();
      this.windFilter.type = 'bandpass';
      this.windFilter.frequency.setValueAtTime(320, this.ctx.currentTime);
      this.windFilter.Q.setValueAtTime(1.8, this.ctx.currentTime);

      this.windGain = this.ctx.createGain();
      this.windGain.gain.setValueAtTime(0, this.ctx.currentTime);

      this.windSource.connect(this.windFilter);
      this.windFilter.connect(this.windGain);
      this.windGain.connect(this.ctx.destination);
      this.windSource.start(0);

      // 3. Harbor & Kapal Jung Swell (Dermaga Barat)
      this.harborSource = this.ctx.createBufferSource();
      this.harborSource.buffer = noiseBuffer;
      this.harborSource.loop = true;

      this.harborFilter = this.ctx.createBiquadFilter();
      this.harborFilter.type = 'lowpass';
      this.harborFilter.frequency.setValueAtTime(140, this.ctx.currentTime);

      this.harborGain = this.ctx.createGain();
      this.harborGain.gain.setValueAtTime(0, this.ctx.currentTime);

      this.harborSource.connect(this.harborFilter);
      this.harborFilter.connect(this.harborGain);
      this.harborGain.connect(this.ctx.destination);
      this.harborSource.start(0);
    } catch {
      // Audio node fallback
    }
  }

  muteSpatialAmbience() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    if (this.waterGain) this.waterGain.gain.setTargetAtTime(0, now, 0.1);
    if (this.windGain) this.windGain.gain.setTargetAtTime(0, now, 0.1);
    if (this.harborGain) this.harborGain.gain.setTargetAtTime(0, now, 0.1);
  }

  updateAmbience(playerPos, dt = 0.016) {
    if (this.isMuted || !this.ctx) return;
    if (!this.spatialInitialized) {
      this.initSpatialAmbience();
      if (!this.spatialInitialized) return;
    }

    const now = this.ctx.currentTime;

    // 1. Water Ambience (Sungai Brantas z ~ 72, Kolam Segaran x: -70..-34, z: -22..32)
    const distRiver = Math.abs(playerPos.z - 72);
    let riverFactor = 0;
    if (distRiver < 34) {
      riverFactor = Math.pow(1 - distRiver / 34, 1.4) * 0.22;
    }

    const dxSegaran = Math.max(0, Math.max(-70 - playerPos.x, playerPos.x - (-34)));
    const dzSegaran = Math.max(0, Math.max(-22 - playerPos.z, playerPos.z - 32));
    const distSegaran = Math.hypot(dxSegaran, dzSegaran);
    let segaranFactor = 0;
    if (distSegaran < 28) {
      segaranFactor = Math.pow(1 - distSegaran / 28, 1.4) * 0.18;
    }
    const targetWater = Math.max(riverFactor, segaranFactor);
    if (this.waterGain) this.waterGain.gain.setTargetAtTime(targetWater, now, 0.35);

    // Subtle water ripple frequency modulation
    if (this.waterFilter) {
      const waterLFO = 360 + Math.sin(now * 1.6) * 80;
      this.waterFilter.frequency.setTargetAtTime(waterLFO, now, 0.2);
    }

    // 2. Wind Ambience (Eastern hill Candi Bajang Ratu x > 75 or elevation > 7.0m)
    let windFactor = 0;
    if (playerPos.x > 75) {
      const hillDist = Math.hypot(playerPos.x - 112, playerPos.z + 10);
      if (hillDist < 48) {
        windFactor = Math.pow(1 - hillDist / 48, 1.2) * 0.24;
      }
    }
    if (playerPos.y > 7.0) {
      const elevFactor = Math.min(0.24, (playerPos.y - 7.0) * 0.04);
      windFactor = Math.max(windFactor, elevFactor);
    }
    if (this.windGain) this.windGain.gain.setTargetAtTime(windFactor, now, 0.4);

    if (this.windFilter) {
      const windLFO = 320 + Math.sin(now * 0.8) * 110;
      this.windFilter.frequency.setTargetAtTime(windLFO, now, 0.25);
    }

    // 3. Harbor Swell (Western canal & Jung Jawa x < -105)
    let harborFactor = 0;
    if (playerPos.x < -105 && playerPos.z > -10 && playerPos.z < 45) {
      const hDist = Math.max(0, -105 - playerPos.x);
      harborFactor = Math.min(0.22, hDist * 0.012 + 0.06);

      // Decit kayu lambung kapal jati berkala
      if (now - this.lastCreakTime > 9.0 + Math.random() * 6.0) {
        this.lastCreakTime = now;
        this.playWoodCreak();
      }
    }
    if (this.harborGain) this.harborGain.gain.setTargetAtTime(harborFactor, now, 0.4);
  }

  // Efek decit pelan kayu jati lambung kapal Jung Jawa
  playWoodCreak() {
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.linearRampToValueAtTime(145, now + 0.18);
    osc.frequency.linearRampToValueAtTime(115, now + 0.38);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(280, now);
    filter.Q.setValueAtTime(3.2, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.06, now + 0.12);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.48);
  }

  // -------------------------------------------------------------
  // SAPAAN AUDIO TRADISIONAL TOKOH SEJARAH MAJAPAHIT (NPC GREETINGS)
  // -------------------------------------------------------------
  playNPCGreeting(npcId) {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    if (npcId === 'gajah_mada') {
      // Sangkakala Perunggu Bhayangkara (Brassy Fanfare Chord: A3, C#4, E4, A4)
      const freqs = [220, 277.18, 329.63, 440];
      freqs.forEach((f, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(f, now + i * 0.06);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(750, now + i * 0.06);
        filter.frequency.exponentialRampToValueAtTime(1400, now + i * 0.06 + 0.15);

        const t0 = now + i * 0.06;
        gain.gain.setValueAtTime(0.001, t0);
        gain.gain.linearRampToValueAtTime(0.18, t0 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.85);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t0);
        osc.stop(t0 + 0.9);
      });
    } else if (npcId === 'mpu_prapanca') {
      // Genta Doa Suci Meditasi Pendeta / Singing Bowl Shimmer (D5 + Harmonics)
      const harmonics = [587.33, 1174.66, 1762.0, 2349.32];
      harmonics.forEach((f, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now);

        const vol = 0.2 / (i + 1);
        gain.gain.setValueAtTime(vol, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8 + i * 0.3);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 2.2);
      });
    } else if (npcId === 'ki_pedagang') {
      // Gemrincing Keping Koin Perunggu Gobog Majapahit
      const coinPings = [2637, 3136, 3520, 3951];
      coinPings.forEach((f, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        const t0 = now + i * 0.045;
        osc.frequency.setValueAtTime(f, t0);

        gain.gain.setValueAtTime(0.16, t0);
        gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.22);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t0);
        osc.stop(t0 + 0.25);
      });
    } else if (npcId === 'hayam_wuruk') {
      // Gong Ageng Sri Maharaja (Gong Keraton Agung)
      const gongFreqs = [110, 220, 330, 440];
      gongFreqs.forEach((f, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450, now);

        const vol = 0.22 / (i + 1);
        gain.gain.setValueAtTime(vol, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 2.8);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 2.9);
      });
    } else {
      // Prajurit Garda Brantas: Dentang Tombak & Perisai Ksatria
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(95, now + 0.12);

      gain.gain.setValueAtTime(0.24, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    }
  }

  // -------------------------------------------------------------
  // EFEK AUDIO PROLOG LABORATORIUM & PORTAL RUANG-WAKTU
  // -------------------------------------------------------------
  playLabBootChime() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      const t0 = now + idx * 0.08;
      osc.frequency.setValueAtTime(freq, t0);
      gain.gain.setValueAtTime(0.001, t0);
      gain.gain.linearRampToValueAtTime(0.11, t0 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.55);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t0);
      osc.stop(t0 + 0.6);
    });
  }

  playPortalSuction() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Gelombang hisapan energi kronos menaik dramatis
    const osc = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(85, now);
    osc.frequency.exponentialRampToValueAtTime(520, now + 1.35);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(190, now);
    osc2.frequency.exponentialRampToValueAtTime(980, now + 1.35);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(240, now);
    filter.frequency.exponentialRampToValueAtTime(2400, now + 1.35);
    filter.Q.setValueAtTime(2.6, now);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.24, now + 0.85);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.55);

    osc.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc2.start(now);
    osc.stop(now + 1.6);
    osc2.stop(now + 1.6);
  }

  playWormholeWarp() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.linearRampToValueAtTime(210, now + 1.8);
    osc.frequency.linearRampToValueAtTime(110, now + 3.6);

    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(6.5, now);
    lfoGain.gain.setValueAtTime(220, now);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(520, now);
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.4);
    gain.gain.linearRampToValueAtTime(0.14, now + 2.8);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 3.65);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    lfo.start(now);
    osc.stop(now + 3.7);
    lfo.stop(now + 3.7);
  }

  playPortalArrival() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Gong Keraton + Gemintang Pendaratan di Era Majapahit 1350 M
    const chord = [130.81, 261.63, 392.0, 523.25, 659.25];
    chord.forEach((f, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = idx < 2 ? 'triangle' : 'sine';
      const t0 = now + idx * 0.05;
      osc.frequency.setValueAtTime(f, t0);
      gain.gain.setValueAtTime(0.2 / (idx * 0.4 + 1), t0);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + 2.8);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t0);
      osc.stop(t0 + 2.9);
    });
  }
}
