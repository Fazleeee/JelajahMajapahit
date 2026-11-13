import { gameState, ModalTypes } from '../core/GameState.js';

// Pemetaan Fraksi & Gelar Tradisional Tokoh Sejarah Kotaraja Majapahit
const NPC_FACTIONS = {
  ki_pedagang: 'Syahbandar & Saudagar Rempah Kotaraja',
  mpu_prapanca: 'Dharmadhyaksa ring Kasogatan & Pujangga Keraton',
  gajah_mada: 'Komando Tertinggi Pasukan Elit Bhayangkara',
  hayam_wuruk: 'Bhattara Saptaprabhu & Dinasti Rajasa',
  prajurit_brantas: 'Garda Keamanan Perbatasan & Jembatan Brantas'
};

export class DialogueModal {
  constructor(audioSystem, questSystem) {
    this.audio = audioSystem;
    this.quests = questSystem;

    this.modal = document.getElementById('dialogue-modal');
    this.speakerIconEl = document.getElementById('speaker-icon');
    this.speakerNameEl = document.getElementById('speaker-name');
    this.speakerTitleEl = document.getElementById('speaker-title');
    this.speakerFactionEl = document.getElementById('speaker-faction');
    this.textEl = document.getElementById('dialogue-text');
    this.choicesEl = document.getElementById('dialogue-choices');
    this.btnClose = document.getElementById('btn-dialogue-close');

    this.typewriterTimer = null;
    this.fullDialogueText = '';
    this.isTyping = false;
    this.currentNPC = null;

    this.bindEvents();
  }

  bindEvents() {
    if (this.btnClose) {
      this.btnClose.addEventListener('click', (e) => {
        e.stopPropagation();
        gameState.closeModal(ModalTypes.DIALOGUE);
      });
    }

    if (this.modal) {
      this.modal.addEventListener('click', (e) => {
        if (this.isTyping) {
          this.finishTypewriter();
          return;
        }
        if (e.target === this.modal) {
          gameState.closeModal(ModalTypes.DIALOGUE);
        }
      });
      this.modal.addEventListener('wheel', (e) => e.stopPropagation());
      this.modal.addEventListener('mousedown', (e) => e.stopPropagation());
    }
  }

  show(npc) {
    if (npc) this.populate(npc);
    if (this.modal) this.modal.classList.remove('hidden');
  }

  hide() {
    this.finishTypewriter();
    if (this.modal) this.modal.classList.add('hidden');
  }

  populate(npc) {
    if (!npc) return;
    this.currentNPC = npc;
    this.speakerIconEl.textContent = npc.icon;
    this.speakerNameEl.textContent = npc.name;
    this.speakerTitleEl.textContent = `${npc.title} • ${npc.zone}`;
    if (this.speakerFactionEl) {
      this.speakerFactionEl.textContent = NPC_FACTIONS[npc.id] || 'Tokoh Kerajaan Majapahit';
    }

    if (this.audio) {
      this.audio.playNPCGreeting(npc.id);
    }

    this.renderNode('root');
  }

  renderNode(nodeKey) {
    const npc = this.currentNPC;
    if (!npc) return;

    if (this.audio) this.audio.playDialoguePop();

    if (nodeKey === 'quest_check') {
      const qState = this.quests ? this.quests.getNPCDialogueState(npc.id) : null;
      if (qState && qState.questPrompt) {
        this.startTypewriter(qState.questPrompt.text);
        this.choicesEl.innerHTML = '';

        if (qState.questCanTurnIn) {
          const btnTurnIn = document.createElement('button');
          btnTurnIn.className = 'btn-choice btn-choice-quest';
          btnTurnIn.innerHTML = `<span class="choice-ico">🏆</span><span class="choice-txt">Serahkan Bukti Sejarah & Selesaikan Misi!</span>`;
          btnTurnIn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.quests.completeQuest(qState.questPrompt.questId);
            this.renderNode('root');
          });
          this.choicesEl.appendChild(btnTurnIn);
        }

        const btnBack = document.createElement('button');
        btnBack.className = 'btn-choice btn-choice-farewell';
        btnBack.innerHTML = `<span class="choice-ico">↩️</span><span class="choice-txt">Kembali ke pokok pembicaraan.</span>`;
        btnBack.addEventListener('click', (e) => {
          e.stopPropagation();
          this.renderNode('root');
        });
        this.choicesEl.appendChild(btnBack);
        return;
      }
    }

    const node = npc.dialogues[nodeKey] || npc.dialogues['root'];
    this.startTypewriter(node.text);
    this.choicesEl.innerHTML = '';

    if (node.options && node.options.length > 0) {
      node.options.forEach((opt, optIdx) => {
        const btn = document.createElement('button');
        const isQuestAction = opt.next === 'quest_check' || opt.text.toLowerCase().includes('tugas') || opt.text.toLowerCase().includes('misi');
        const isFarewell = opt.next === 'root_close' || opt.text.toLowerCase().includes('pamit') || opt.text.toLowerCase().includes('terima kasih');

        const iconSpan = document.createElement('span');
        iconSpan.className = 'choice-ico';
        if (isQuestAction) {
          btn.className = 'btn-choice btn-choice-quest';
          iconSpan.textContent = '❗';
        } else if (isFarewell) {
          btn.className = 'btn-choice btn-choice-farewell';
          iconSpan.textContent = '👋';
        } else {
          btn.className = 'btn-choice';
          iconSpan.textContent = '💬';
        }

        btn.style.animationDelay = `${optIdx * 48}ms`;

        const textSpan = document.createElement('span');
        textSpan.className = 'choice-txt';
        textSpan.textContent = opt.text;

        btn.appendChild(iconSpan);
        btn.appendChild(textSpan);

        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.renderNode(opt.next);
        });
        this.choicesEl.appendChild(btn);
      });
    } else {
      const btnClose = document.createElement('button');
      btnClose.className = 'btn-choice btn-choice-farewell';
      btnClose.innerHTML = `<span class="choice-ico">🚪</span><span class="choice-txt">Pamit & Lanjutkan Penjelajahan</span>`;
      btnClose.addEventListener('click', (e) => {
        e.stopPropagation();
        gameState.closeModal(ModalTypes.DIALOGUE);
      });
      this.choicesEl.appendChild(btnClose);
    }
  }

  startTypewriter(text) {
    if (this.typewriterTimer) {
      clearInterval(this.typewriterTimer);
      this.typewriterTimer = null;
    }

    this.fullDialogueText = text;
    this.isTyping = true;
    this.textEl.textContent = '';

    const cursor = document.createElement('span');
    cursor.className = 'typing-cursor';
    this.textEl.appendChild(cursor);

    let idx = 0;
    const len = text.length;

    this.typewriterTimer = setInterval(() => {
      if (idx < len) {
        this.textEl.textContent = text.slice(0, idx + 1);
        this.textEl.appendChild(cursor);
        idx++;
      } else {
        this.finishTypewriter();
      }
    }, 15);
  }

  finishTypewriter() {
    if (this.typewriterTimer) {
      clearInterval(this.typewriterTimer);
      this.typewriterTimer = null;
    }
    this.isTyping = false;
    if (this.textEl) {
      this.textEl.textContent = this.fullDialogueText;
    }
  }
}
