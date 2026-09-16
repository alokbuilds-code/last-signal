/**
 * ECHO//ZERO: THE LAST SIGNAL — Save System Engine
 * Manages localStorage state persistence and cycle sessions.
 */

import { gameState } from './game-state.js';

const STORAGE_KEY = 'ECHO_ZERO_SAVE_V1';

export class SaveSystem {
  constructor() {}

  init() {
    this.setupAutoSave();
    this.setupRestartButton();
  }

  setupAutoSave() {
    gameState.subscribe((state) => {
      try {
        const payload = {
          sessionNumber: state.sessionNumber,
          powerRestored: state.powerRestored,
          keycardFound: state.keycardFound,
          doorUnlocked: state.doorUnlocked,
          inventory: state.inventory,
          discoveredClues: state.discoveredClues,
          objectives: state.objectives
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      } catch (e) {}
    });
  }

  loadSave() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        Object.assign(gameState.state, parsed);
      }
    } catch (e) {}
  }

  setupRestartButton() {
    const restartBtn = document.getElementById('btn-restart-cycle');
    if (restartBtn) {
      restartBtn.addEventListener('click', () => {
        const climaxStage = document.getElementById('climax-stage');
        if (climaxStage) climaxStage.classList.remove('active');

        gameState.resetCycle();

        // Reopen opening stage with Session 18
        const openingStage = document.getElementById('opening-stage');
        if (openingStage) {
          openingStage.style.display = 'flex';
          openingStage.classList.remove('dismissed');

          const metaTag = document.getElementById('opening-meta-tag');
          if (metaTag) {
            metaTag.textContent = `SYSTEM BOOT // SESSION ${gameState.state.sessionNumber}`;
          }

          const titleLine = document.getElementById('opening-voice-sub');
          if (titleLine) {
            titleLine.textContent = "YOU HAVE BEEN HERE BEFORE.";
            titleLine.classList.add('visible');
          }
        }
      });
    }
  }
}

export const saveSystem = new SaveSystem();
