// Finite State Machine (FSM) Pengatur Siklus Game, Modal, dan Kunci Input

import { eventBus, GameEvents } from './EventBus.js';

export const GameStates = {
  INTRO: 'INTRO',
  EXPLORING: 'EXPLORING',
  MODAL: 'MODAL',
  CINEMATIC: 'CINEMATIC'
};

export const ModalTypes = {
  NONE: null,
  LORE: 'LORE',
  DIALOGUE: 'DIALOGUE',
  ARTIFACT: 'ARTIFACT',
  ATLAS: 'ATLAS',
  JOURNAL: 'JOURNAL',
  QUIZ: 'QUIZ',
  HELP: 'HELP',
  QUEST_POPOVER: 'QUEST_POPOVER',
  HEADER_MENU: 'HEADER_MENU'
};

class GameStateManager {
  constructor() {
    this.currentState = GameStates.INTRO;
    this.activeModal = ModalTypes.NONE;
    this.modalData = null;
    this.isMovementLocked = false;
    this.isCameraLocked = false;
  }

  setGameStart() {
    this.currentState = GameStates.EXPLORING;
    this.activeModal = ModalTypes.NONE;
    this.isMovementLocked = false;
    this.isCameraLocked = false;
    eventBus.emit(GameEvents.STATE_CHANGE, { state: this.currentState });
    eventBus.emit(GameEvents.PLAYER_LOCK, { movement: false, camera: false });
  }

  openModal(modalType, data = null) {
    if (this.activeModal === modalType) return;

    // Jika ada modal lain terbuka, tutup dulu untuk menjamin Single-Modal
    if (this.activeModal !== ModalTypes.NONE) {
      this.closeModal(this.activeModal, false);
    }

    this.currentState = GameStates.MODAL;
    this.activeModal = modalType;
    this.modalData = data;
    this.isMovementLocked = true;
    this.isCameraLocked = true;

    eventBus.emit(GameEvents.STATE_CHANGE, { state: this.currentState, activeModal: modalType });
    eventBus.emit(GameEvents.PLAYER_LOCK, { movement: true, camera: true });
    eventBus.emit(GameEvents.MODAL_OPEN, { modalType, data });
  }

  closeModal(modalType = null, returnToExploring = true) {
    if (modalType && this.activeModal !== modalType) return;

    const closedType = this.activeModal;
    this.activeModal = ModalTypes.NONE;
    this.modalData = null;

    if (returnToExploring) {
      this.currentState = GameStates.EXPLORING;
      this.isMovementLocked = false;
      this.isCameraLocked = false;
      eventBus.emit(GameEvents.PLAYER_LOCK, { movement: false, camera: false });
    }

    eventBus.emit(GameEvents.STATE_CHANGE, { state: this.currentState, closedModal: closedType });
    eventBus.emit(GameEvents.MODAL_CLOSE, { modalType: closedType });
  }

  toggleModal(modalType, data = null) {
    if (this.activeModal === modalType) {
      this.closeModal(modalType);
    } else {
      this.openModal(modalType, data);
    }
  }

  closeAllModals() {
    if (this.activeModal !== ModalTypes.NONE) {
      this.closeModal(this.activeModal);
    }
  }

  setCinematic(active) {
    if (active) {
      this.currentState = GameStates.CINEMATIC;
      this.isMovementLocked = true;
      this.isCameraLocked = true;
    } else {
      this.currentState = this.activeModal !== ModalTypes.NONE ? GameStates.MODAL : GameStates.EXPLORING;
      this.isMovementLocked = this.currentState === GameStates.MODAL;
      this.isCameraLocked = this.currentState === GameStates.MODAL;
    }
    eventBus.emit(GameEvents.STATE_CHANGE, { state: this.currentState });
    eventBus.emit(GameEvents.PLAYER_LOCK, { movement: this.isMovementLocked, camera: this.isCameraLocked });
  }

  isInteractionModalOpen() {
    return (
      this.activeModal === ModalTypes.LORE ||
      this.activeModal === ModalTypes.DIALOGUE ||
      this.activeModal === ModalTypes.ARTIFACT ||
      this.activeModal === ModalTypes.QUEST_POPOVER
    );
  }

  isModalOpen() {
    return this.activeModal !== ModalTypes.NONE;
  }

  isAnyModalOpen() {
    return this.activeModal !== ModalTypes.NONE;
  }

  canPlayerMove() {
    return this.currentState === GameStates.EXPLORING && !this.isMovementLocked;
  }

  canPlayerLook() {
    return this.currentState === GameStates.EXPLORING && !this.isCameraLocked;
  }
}

export { GameStateManager };
export const gameState = new GameStateManager();
