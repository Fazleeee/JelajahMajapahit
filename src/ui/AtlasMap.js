import { ZONES, LANDMARKS, BRIDGES } from '../world/WorldData.js';
import { getRiverCenterZ } from '../world/Terrain.js';
import { HISTORICAL_ARTIFACTS, VIEWPOINTS } from '../exploration/ExplorationSystem.js';
import { NPC_DATA } from '../quests/QuestData.js';
import { gameState, ModalTypes } from '../core/GameState.js';

export class AtlasMap {
  constructor(explorationSystem, questSystem, audioSystem) {
    this.exploration = explorationSystem;
    this.quests = questSystem;
    this.audio = audioSystem;

    this.modal = document.getElementById('atlas-modal');
    this.canvas = document.getElementById('atlas-canvas');
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.btnClose = document.getElementById('btn-atlas-close');
    this.currentZoneEl = document.getElementById('atlas-current-zone');
    this.currentDescEl = document.getElementById('atlas-current-desc');

    this._lastDrawTime = 0;
    this.bindEvents();
  }

  bindEvents() {
    if (this.btnClose) {
      this.btnClose.addEventListener('click', (e) => {
        e.stopPropagation();
        gameState.closeModal(ModalTypes.ATLAS);
      });
    }

    if (this.modal) {
      this.modal.addEventListener('click', (e) => {
        if (e.target === this.modal) gameState.closeModal(ModalTypes.ATLAS);
      });
      this.modal.addEventListener('wheel', (e) => e.stopPropagation());
      this.modal.addEventListener('mousedown', (e) => e.stopPropagation());
    }

    if (this.canvas) {
      this.canvas.addEventListener('mousemove', (e) => {
        const rect = this.canvas.getBoundingClientRect();
        const cx = ((e.clientX - rect.left) / rect.width) * this.canvas.width;
        const cy = ((e.clientY - rect.top) / rect.height) * this.canvas.height;
        this.handleHover(cx, cy);
      });

      this.canvas.addEventListener('click', (e) => {
        const rect = this.canvas.getBoundingClientRect();
        const cx = ((e.clientX - rect.left) / rect.width) * this.canvas.width;
        const cy = ((e.clientY - rect.top) / rect.height) * this.canvas.height;
        this.handleClick(cx, cy);
      });

      this.canvas.addEventListener('mousedown', (e) => e.stopPropagation());
      this.canvas.addEventListener('wheel', (e) => e.stopPropagation());
    }
  }

  show(playerPos, playerYaw) {
    if (this.modal) {
      this.modal.classList.remove('hidden');
      if (this.audio) this.audio.playDialoguePop();
      this.draw(playerPos, playerYaw);
    }
  }

  hide() {
    if (this.modal) this.modal.classList.add('hidden');
  }

  updateIfOpen(now, playerPos, playerYaw) {
    if (this.modal && !this.modal.classList.contains('hidden')) {
      if (now - this._lastDrawTime >= 65) {
        this._lastDrawTime = now;
        this.draw(playerPos, playerYaw);
      }
    }
  }

  handleHover(cx, cy) {
    if (!this.canvas) return;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const scale = (w - 40) / 380;
    const wx = (cx - w * 0.5) / scale;
    const wz = (cy - h * 0.5) / scale;

    let found = false;

    for (const lm of LANDMARKS) {
      const dist = Math.hypot(wx - lm.position.x, wz - lm.position.z);
      if (dist < 18) {
        if (this.currentZoneEl) this.currentZoneEl.textContent = lm.title;
        if (this.currentDescEl) this.currentDescEl.textContent = lm.text;
        this.canvas.style.cursor = 'pointer';
        found = true;
        break;
      }
    }

    if (!found) {
      for (const npc of NPC_DATA) {
        const dist = Math.hypot(wx - npc.coords.x, wz - npc.coords.z);
        if (dist < 18) {
          if (this.currentZoneEl) this.currentZoneEl.textContent = `${npc.icon} ${npc.name} (${npc.title})`;
          if (this.currentDescEl) this.currentDescEl.textContent = `Tokoh Sejarah di ${npc.zone}: "${npc.greeting}"`;
          this.canvas.style.cursor = 'pointer';
          found = true;
          break;
        }
      }
    }

    if (!found) {
      for (const vp of VIEWPOINTS) {
        const dist = Math.hypot(wx - vp.coords.x, wz - vp.coords.z);
        if (dist < 18) {
          if (this.currentZoneEl) this.currentZoneEl.textContent = `🦅 ${vp.name}`;
          if (this.currentDescEl) this.currentDescEl.textContent = `Titik Sinkronisasi Menara Pandang (${vp.zoneTitle}).`;
          this.canvas.style.cursor = 'pointer';
          found = true;
          break;
        }
      }
    }

    if (!found) {
      this.canvas.style.cursor = 'crosshair';
    }
  }

  handleClick(cx, cy) {
    const w = this.canvas.width;
    const h = this.canvas.height;
    const scale = (w - 40) / 380;
    const wx = (cx - w * 0.5) / scale;
    const wz = (cy - h * 0.5) / scale;

    for (const npc of NPC_DATA) {
      const dist = Math.hypot(wx - npc.coords.x, wz - npc.coords.z);
      if (dist < 18) {
        gameState.openModal(ModalTypes.DIALOGUE, { npc });
        return;
      }
    }

    for (const lm of LANDMARKS) {
      const dist = Math.hypot(wx - lm.position.x, wz - lm.position.z);
      if (dist < 18) {
        gameState.openModal(ModalTypes.LORE, { landmark: lm });
        return;
      }
    }

    for (const vp of VIEWPOINTS) {
      const dist = Math.hypot(wx - vp.coords.x, wz - vp.coords.z);
      if (dist < 18) {
        if (this.currentZoneEl) this.currentZoneEl.textContent = `🦅 ${vp.name}`;
        if (this.currentDescEl) this.currentDescEl.textContent = `Menara Pandang di ${vp.zoneTitle}. Kunjungi puncak menara ini dan tekan E / Interaksi untuk membuka peta!`;
        return;
      }
    }
  }

  draw(playerPos, playerYaw) {
    if (!this.canvas || !this.ctx) return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const scale = (w - 48) / 380;
    const toMapX = (wx) => w * 0.5 + wx * scale;
    const toMapY = (wz) => h * 0.5 + wz * scale;

    ctx.clearRect(0, 0, w, h);

    // 1. Latar Belakang Kartografi Kuno (Perkamen Bata Gelap)
    ctx.fillStyle = '#18100b';
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = 'rgba(212, 175, 55, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 32; x < w - 32; x += 36) {
      ctx.beginPath();
      ctx.moveTo(x, 24);
      ctx.lineTo(x, h - 24);
      ctx.stroke();
    }
    for (let y = 32; y < h - 32; y += 36) {
      ctx.beginPath();
      ctx.moveTo(24, y);
      ctx.lineTo(w - 24, y);
      ctx.stroke();
    }

    // Bingkai Ganda Kerajaan Majapahit
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.35)';
    ctx.lineWidth = 2;
    ctx.strokeRect(12, 12, w - 24, h - 24);
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.85)';
    ctx.lineWidth = 1;
    ctx.strokeRect(16, 16, w - 32, h - 32);

    const corners = [
      [16, 16],
      [w - 16, 16],
      [16, h - 16],
      [w - 16, h - 16]
    ];
    ctx.fillStyle = '#e5b842';
    for (const [cx, cy] of corners) {
      ctx.beginPath();
      ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // 2. Zona-Zona Sejarah
    for (const z of ZONES) {
      const zx = toMapX(z.center.x);
      const zy = toMapY(z.center.z);
      const zr = z.radius * scale;

      ctx.beginPath();
      ctx.arc(zx, zy, zr, 0, Math.PI * 2);
      ctx.fillStyle = z.color + '24';
      ctx.fill();
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = z.color + '77';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.setLineDash([]);

      const label = z.name.replace(/^\d+\.\s*/, '').toUpperCase();
      ctx.font = 'bold 9.5px "Cinzel", serif';
      const tw = ctx.measureText(label).width;
      ctx.fillStyle = 'rgba(16, 9, 6, 0.85)';
      ctx.fillRect(zx - tw * 0.5 - 6, zy - zr + 4, tw + 12, 16);
      ctx.strokeStyle = z.color;
      ctx.lineWidth = 1;
      ctx.strokeRect(zx - tw * 0.5 - 6, zy - zr + 4, tw + 12, 16);
      ctx.fillStyle = '#fce8b2';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, zx, zy - zr + 12);
    }

    // 3. Sungai Brantas & Kanal Canggu
    ctx.beginPath();
    for (let wx = -190; wx <= 190; wx += 4) {
      const rz = getRiverCenterZ(wx);
      const mx = toMapX(wx);
      const my = toMapY(rz);
      if (wx === -190) ctx.moveTo(mx, my);
      else ctx.lineTo(mx, my);
    }
    ctx.strokeStyle = '#257d8f';
    ctx.lineWidth = 15;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    ctx.strokeStyle = '#4cb3c4';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.font = 'italic 10px serif';
    ctx.fillStyle = '#afe6f0';
    ctx.fillText('~ Sungai Brantas & Aliran Air Kotaraja ~', toMapX(-45), toMapY(getRiverCenterZ(-45)) - 12);

    // 4. Waduk Kolam Segaran Kuno
    const kx = toMapX(-68);
    const ky = toMapY(-20);
    const kw = 32 * scale;
    const kh = 50 * scale;

    ctx.fillStyle = '#1b6473';
    ctx.fillRect(kx, ky, kw, kh);
    ctx.strokeStyle = '#b84a39';
    ctx.lineWidth = 3.5;
    ctx.strokeRect(kx, ky, kw, kh);
    ctx.strokeStyle = '#e5b842';
    ctx.lineWidth = 1;
    ctx.strokeRect(kx + 2, ky + 2, kw - 4, kh - 4);

    ctx.font = 'bold 9px "Cinzel", serif';
    ctx.fillStyle = '#fce8b2';
    ctx.fillText('KOLAM SEGARAN', kx + kw * 0.5, ky + kh * 0.5);

    // 5. Jaringan Jalan Kerajaan
    ctx.strokeStyle = '#b86843';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(toMapX(0), toMapY(160));
    ctx.lineTo(toMapX(0), toMapY(-130));
    ctx.moveTo(toMapX(-140), toMapY(12));
    ctx.lineTo(toMapX(135), toMapY(12));
    ctx.lineTo(toMapX(125), toMapY(-20));
    ctx.moveTo(toMapX(0), toMapY(8));
    ctx.lineTo(toMapX(-36), toMapY(8));
    ctx.stroke();

    ctx.strokeStyle = '#dfa57e';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 6]);
    ctx.stroke();
    ctx.setLineDash([]);

    // 6. Parit Pertahanan & Benteng Kedaton Agung
    const kedX = toMapX(-46);
    const kedY = toMapY(-146);
    const kedW = 92 * scale;
    const kedH = 62 * scale;
    ctx.strokeStyle = '#257d8f';
    ctx.lineWidth = 4;
    ctx.strokeRect(kedX, kedY, kedW, kedH);
    ctx.strokeStyle = '#a33a26';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(kedX + 4, kedY + 4, kedW - 8, kedH - 8);

    // 7. Jembatan Kerajaan
    ctx.fillStyle = '#d4af37';
    for (const b of BRIDGES) {
      const bx = toMapX(b.xMin);
      const by = toMapY(b.zMin);
      const bw = Math.max(5, (b.xMax - b.xMin) * scale);
      const bh = Math.max(5, (b.zMax - b.zMin) * scale);
      ctx.fillRect(bx, by, bw, bh);
      ctx.strokeStyle = '#5a3014';
      ctx.lineWidth = 1;
      ctx.strokeRect(bx, by, bw, bh);
    }

    // 8. Titik Prasasti Sejarah (Landmarks)
    for (const lm of LANDMARKS) {
      const lx = toMapX(lm.position.x);
      const ly = toMapY(lm.position.z);

      ctx.save();
      ctx.translate(lx, ly);
      ctx.rotate(Math.PI / 4);
      ctx.fillStyle = '#f9d976';
      ctx.fillRect(-4, -4, 8, 8);
      ctx.strokeStyle = '#5a3014';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(-4, -4, 8, 8);
      ctx.restore();

      ctx.font = '8.5px sans-serif';
      ctx.fillStyle = '#ffecb3';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(lm.title.split(' ')[0], lx, ly + 6);
    }

    // 9. Tokoh Sejarah NPC
    for (const npc of NPC_DATA) {
      const nx = toMapX(npc.coords.x);
      const ny = toMapY(npc.coords.z);

      ctx.beginPath();
      ctx.arc(nx, ny, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#2ecc71';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.font = 'bold 10px sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(npc.icon, nx, ny - 6);
    }

    // 10. Menara Pandang (Viewpoints)
    for (const vp of VIEWPOINTS) {
      const vx = toMapX(vp.coords.x);
      const vy = toMapY(vp.coords.z);
      const isSynced = this.exploration ? this.exploration.syncedViewpoints.includes(vp.id) : false;

      ctx.beginPath();
      ctx.arc(vx, vy, 6, 0, Math.PI * 2);
      ctx.fillStyle = isSynced ? '#ffd700' : '#4fa3e3';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.font = '10px sans-serif';
      ctx.fillStyle = isSynced ? '#ffd700' : '#88d1f7';
      ctx.fillText('🦅', vx, vy - 7);
    }

    // 11. Peti Artefak (Jika Lentera Waktu Menyala)
    if (this.exploration && this.exploration.isLanternActive) {
      for (const art of HISTORICAL_ARTIFACTS) {
        if (this.exploration.collectedArtifacts.includes(art.id)) continue;
        const ax = toMapX(art.coords.x);
        const ay = toMapY(art.coords.z);

        ctx.beginPath();
        ctx.arc(ax, ay, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffb300';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }
    }

    // 12. Posisi Pemain Aktif & Sasaran Misi
    const px = toMapX(playerPos.x);
    const py = toMapY(playerPos.z);

    const atlasPulse = (performance.now() * 0.0022) % 1.0;
    ctx.beginPath();
    ctx.arc(px, py, 10 + atlasPulse * 14, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255, 230, 100, ${(1 - atlasPulse) * 0.68})`;
    ctx.lineWidth = 2;
    ctx.stroke();

    if (this.quests) {
      const aq = this.quests.getActiveQuest();
      if (aq) {
        const turnIn = this.quests.canCompleteQuest(aq.id);
        let tx = null;
        let tz = null;
        if (turnIn) {
          const npc = NPC_DATA.find((n) => n.id === aq.npcId);
          if (npc) { tx = npc.coords.x; tz = npc.coords.z; }
        } else {
          const rem = aq.requiredRelics.filter((rId) => !this.exploration.collectedArtifacts.includes(rId));
          if (rem.length > 0) {
            const art = HISTORICAL_ARTIFACTS.find((a) => a.id === rem[0]);
            if (art) { tx = art.coords.x; tz = art.coords.z; }
          }
        }
        if (tx !== null && tz !== null) {
          const axQ = toMapX(tx);
          const ayQ = toMapY(tz);
          ctx.beginPath();
          ctx.arc(axQ, ayQ, 9 + atlasPulse * 8, 0, Math.PI * 2);
          ctx.strokeStyle = turnIn ? 'rgba(93, 242, 189, 0.8)' : 'rgba(255, 210, 72, 0.85)';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }
    }

    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(-playerYaw);

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-12, -26);
    ctx.lineTo(12, -26);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255, 215, 0, 0.38)';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(0, 0, 6.5, 0, Math.PI * 2);
    ctx.fillStyle = '#fff5d6';
    ctx.fill();
    ctx.strokeStyle = '#c0392b';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.restore();

    ctx.font = 'bold 9.5px sans-serif';
    ctx.fillStyle = '#fff2d1';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('📍 Anda di Sini', px, py + 16);

    // 13. Surya Majapahit Kompas
    const rx = w - 46;
    const ry = 46;
    ctx.font = 'bold 12px "Cinzel", serif';
    ctx.fillStyle = '#d4af37';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('☀️', rx, ry);
    ctx.font = 'bold 9px "Cinzel", serif';
    ctx.fillText('U', rx, ry - 17);
    ctx.fillText('S', rx, ry + 17);
    ctx.fillText('T', rx + 17, ry);
    ctx.fillText('B', rx - 17, ry);
  }
}
