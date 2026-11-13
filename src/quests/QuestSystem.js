import { QUESTS, NPC_DATA } from './QuestData.js';

export class QuestSystem {
  constructor(explorationSystem, audioSystem) {
    this.exploration = explorationSystem;
    this.audio = audioSystem;

    // Load quest states from localStorage (validate array & prevent stale resurrection)
    this.completedQuestIds = this.loadCompletedQuestsStorage();
    const savedActive = this.loadActiveQuestStorage();
    if (savedActive === 'NONE') {
      this.activeQuestId = null;
    } else if (savedActive && this.getQuest(savedActive) && !this.completedQuestIds.includes(savedActive)) {
      this.activeQuestId = savedActive;
    } else {
      const nextUnfinished = QUESTS.find((q) => !this.completedQuestIds.includes(q.id));
      this.activeQuestId = nextUnfinished ? nextUnfinished.id : null;
    }
  }

  loadActiveQuestStorage() {
    try {
      return localStorage.getItem('majapahit_active_quest');
    } catch {
      return null;
    }
  }

  saveActiveQuestStorage() {
    try {
      localStorage.setItem('majapahit_active_quest', this.activeQuestId || 'NONE');
    } catch {
      // storage unavailable
    }
  }

  loadCompletedQuestsStorage() {
    try {
      const saved = localStorage.getItem('majapahit_completed_quests');
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  saveCompletedQuestsStorage() {
    try {
      localStorage.setItem('majapahit_completed_quests', JSON.stringify(this.completedQuestIds));
    } catch {
      // storage unavailable
    }
  }

  getQuest(questId) {
    return QUESTS.find((q) => q.id === questId);
  }

  getActiveQuest() {
    return this.getQuest(this.activeQuestId);
  }

  isQuestCompleted(questId) {
    return this.completedQuestIds.includes(questId);
  }

  // Cek apakah artefak yang dibutuhkan untuk quest sudah dikoleksi
  canCompleteQuest(questId) {
    const quest = this.getQuest(questId);
    if (!quest) return false;
    const collected = this.exploration ? this.exploration.collectedArtifacts : [];
    return quest.requiredRelics.every((relicId) => collected.includes(relicId));
  }

  getQuestRelicProgress(questId) {
    const quest = this.getQuest(questId);
    if (!quest) return { current: 0, total: 0 };
    const collected = this.exploration ? this.exploration.collectedArtifacts : [];
    const current = quest.requiredRelics.filter((r) => collected.includes(r)).length;
    return { current, total: quest.requiredRelics.length };
  }

  // Selesaikan quest aktif dan buka quest selanjutnya
  completeQuest(questId) {
    if (this.completedQuestIds.includes(questId)) return null;

    const quest = this.getQuest(questId);
    if (!quest) return null;

    this.completedQuestIds.push(questId);
    this.saveCompletedQuestsStorage();

    if (this.audio) this.audio.playQuestComplete();

    // Tentukan quest berikutnya
    const currentIdx = QUESTS.findIndex((q) => q.id === questId);
    if (currentIdx + 1 < QUESTS.length) {
      this.activeQuestId = QUESTS[currentIdx + 1].id;
    } else {
      this.activeQuestId = null; // Semua quest selesai!
    }
    this.saveActiveQuestStorage();

    window.dispatchEvent(
      new CustomEvent('majapahit:quest-completed', {
        detail: { quest }
      })
    );

    return quest;
  }

  // Zero-allocation badge state lookup for per-frame NPC overhead icons
  getNPCBadgeState(npcId) {
    const relatedQuest = QUESTS.find((q) => q.npcId === npcId);
    if (relatedQuest) {
      if (this.isQuestCompleted(relatedQuest.id)) return 'completed';
      if (this.activeQuestId === relatedQuest.id) {
        return this.canCompleteQuest(relatedQuest.id) ? 'turn_in' : 'in_progress';
      }
    }
    const activeQ = this.getActiveQuest();
    if (activeQ && activeQ.npcId === npcId) return 'active_quest';
    return 'chat';
  }

  // Ambil state dialog dinamis untuk NPC tertentu
  getNPCDialogueState(npcId) {
    const npc = NPC_DATA.find((n) => n.id === npcId);
    if (!npc) return null;

    const relatedQuest = QUESTS.find((q) => q.npcId === npcId);
    let questPrompt = null;
    let questCanTurnIn = false;

    if (relatedQuest) {
      if (this.isQuestCompleted(relatedQuest.id)) {
        questPrompt = {
          status: 'completed',
          text: `Terima kasih atas baktimu, wahai ksatria. Misi "${relatedQuest.title}" telah kau selesaikan dengan sangat gemilang!`
        };
      } else if (this.activeQuestId === relatedQuest.id) {
        const canTurnIn = this.canCompleteQuest(relatedQuest.id);
        const progress = this.getQuestRelicProgress(relatedQuest.id);
        questCanTurnIn = canTurnIn;

        if (canTurnIn) {
          questPrompt = {
            status: 'can_turn_in',
            text: `Luar biasa! Kau telah membawa seluruh peninggalan bersejarah yang dibutuhkan (${progress.current}/${progress.total}). Aku menerima baktimu!`,
            questId: relatedQuest.id
          };
        } else {
          questPrompt = {
            status: 'in_progress',
            text: `Aku masih menantikan bukti baktimu: ${relatedQuest.summary} (Progres saat ini: ${progress.current}/${progress.total} artefak ditemukan).`,
            questId: relatedQuest.id
          };
        }
      } else {
        questPrompt = {
          status: 'locked',
          text: `Selesaikan dahulu tugasmu yang lain sebelum menerima titah dariku, ksatria muda.`
        };
      }
    }

    return {
      npc,
      questPrompt,
      questCanTurnIn
    };
  }
}
