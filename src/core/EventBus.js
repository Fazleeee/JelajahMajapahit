// Central Event Bus / Mediator untuk Komunikasi Antar-Sistem Ekspedisi Majapahit

export const GameEvents = {
  // Siklus Game & Status
  GAME_START: 'game:start',
  STATE_CHANGE: 'game:state-change',
  PLAYER_LOCK: 'player:lock-change',

  // Eksplorasi & Interaksi Dunia
  INSPECT_LANDMARK: 'majapahit:inspect-landmark',
  OPEN_DIALOGUE: 'majapahit:open-dialogue',
  CLOSE_DIALOGUE: 'majapahit:close-dialogue',
  ARTIFACT_COLLECTED: 'majapahit:artifact-collected',
  VIEWPOINT_SYNCED: 'majapahit:viewpoint-synced',
  QUEST_COMPLETED: 'majapahit:quest-completed',
  LANTERN_TOGGLE: 'majapahit:lantern-toggle',

  // UI & Jendela Modal
  MODAL_OPEN: 'modal:open',
  MODAL_CLOSE: 'modal:close',
  CLOSE_ALL_MODALS: 'majapahit:close-external-modals',
  CLOSE_INTERACTION_MODALS: 'majapahit:close-interaction-modals',

  // Shortcut Aksi
  OPEN_QUIZ: 'majapahit:open-quiz',
  TOGGLE_JOURNAL: 'majapahit:toggle-journal',
  TOGGLE_ATLAS: 'majapahit:toggle-atlas',
  TOGGLE_HELP: 'majapahit:toggle-help'
};

class GameEventBus {
  constructor() {
    this.listeners = new Map();
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    return () => this.off(event, callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  }

  emit(event, data = null) {
    // 1. Panggil pendengar lokal di EventBus
    if (this.listeners.has(event)) {
      for (const cb of this.listeners.get(event)) {
        try {
          cb(data);
        } catch (err) {
          console.error(`[EventBus Error] pada event "${event}":`, err);
        }
      }
    }

    // 2. Sinkronkan dengan CustomEvent DOM untuk interoperabilitas mulus
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(event, { detail: data }));
    }
  }
}

export { GameEventBus };
export const eventBus = new GameEventBus();
