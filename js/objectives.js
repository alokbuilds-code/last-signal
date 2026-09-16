/**
 * ECHO//ZERO: THE LAST SIGNAL — Objectives Engine
 * Tracks and updates current tasks and dynamic HUD indicators.
 */

import { gameState } from './game-state.js';
import { sound } from './audio.js';

export class ObjectivesEngine {
  constructor() {
    this.hudText = null;
    this.modal = null;
  }

  init() {
    this.hudText = document.getElementById('hud-objective-text');
    this.modal = document.getElementById('objectives-modal');

    const objBox = document.getElementById('hud-objectives-box');
    if (objBox) {
      objBox.addEventListener('click', () => {
        sound.playRelayClick();
        this.openModal();
      });
    }

    const closeBtn = document.getElementById('objectives-modal-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        sound.playRelayClick();
        this.closeModal();
      });
    }

    gameState.subscribe((state, changeKey) => {
      if (changeKey === 'objectives' || changeKey === 'reset') {
        this.updateHUD(state);
      }
    });

    this.updateHUD(gameState.state);
  }

  updateHUD(state) {
    if (!this.hudText) return;
    const current = state.objectives.find(o => !o.done);
    if (current) {
      this.hudText.textContent = current.text;
    } else {
      this.hudText.textContent = 'INVESTIGATE ECHO SYSTEM // COMPLETE';
    }
  }

  openModal() {
    if (!this.modal) return;
    const listEl = document.getElementById('objectives-modal-list');
    if (listEl) {
      listEl.innerHTML = gameState.state.objectives.map(o => `
        <li style="display:flex; align-items:center; gap:12px; padding:10px 0; border-bottom:1px solid rgba(255,255,255,0.06); font-family:var(--font-mono); font-size:12px;">
          <span style="color:${o.done ? 'var(--accent-cyan)' : 'var(--text-muted)'}; font-weight:bold;">${o.done ? '✓' : '○'}</span>
          <span style="color:${o.done ? 'var(--text-muted)' : 'var(--text-lead)'}; text-decoration:${o.done ? 'line-through' : 'none'};">${o.text}</span>
        </li>
      `).join('');
    }
    this.modal.classList.add('active');
  }

  closeModal() {
    if (this.modal) {
      this.modal.classList.remove('active');
    }
  }
}

export const objectives = new ObjectivesEngine();
