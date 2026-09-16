/**
 * ECHO//ZERO: THE LAST SIGNAL — Inventory Engine
 * Handles item collection, inspection overlays, and item-to-environment interactions.
 */

import { gameState } from './game-state.js';
import { sound } from './audio.js';

export class InventoryEngine {
  constructor() {
    this.modal = null;
    this.gridContainer = null;
    this.badge = null;
  }

  init() {
    this.modal = document.getElementById('inventory-modal');
    this.gridContainer = document.getElementById('inventory-grid-container');
    this.badge = document.getElementById('hud-inventory-badge');

    const invBtn = document.getElementById('hud-inventory-btn');
    if (invBtn) {
      invBtn.addEventListener('click', () => {
        sound.playRelayClick();
        this.openModal();
      });
    }

    const closeBtn = document.getElementById('inventory-modal-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        sound.playRelayClick();
        this.closeModal();
      });
    }

    gameState.subscribe((state, changeKey) => {
      if (changeKey === 'inventory' || changeKey === 'reset') {
        this.updateBadge(state);
      }
    });

    this.updateBadge(gameState.state);
  }

  updateBadge(state) {
    if (this.badge) {
      this.badge.textContent = state.inventory.length;
    }
  }

  openModal() {
    if (!this.modal || !this.gridContainer) return;
    this.renderSlots();
    this.modal.classList.add('active');
  }

  closeModal() {
    if (this.modal) {
      this.modal.classList.remove('active');
    }
  }

  renderSlots() {
    const totalSlots = 8;
    const items = gameState.state.inventory;
    let html = '';

    for (let i = 0; i < totalSlots; i++) {
      if (i < items.length) {
        const item = items[i];
        html += `
          <div class="inventory-slot" data-item-index="${i}">
            <div style="font-size:24px; color:var(--accent-cyan);">▰</div>
            <div class="inventory-item-title">${item.name}</div>
          </div>
        `;
      } else {
        html += `
          <div class="inventory-slot empty">
            <div style="font-family:var(--font-mono); font-size:10px; color:var(--text-dark);">[ EMPTY ]</div>
          </div>
        `;
      }
    }

    this.gridContainer.innerHTML = html;

    const slotEls = this.gridContainer.querySelectorAll('.inventory-slot[data-item-index]');
    slotEls.forEach(slot => {
      slot.addEventListener('click', () => {
        const idx = parseInt(slot.getAttribute('data-item-index'), 10);
        sound.playRelayClick();
        this.inspectItem(items[idx]);
      });
    });
  }

  inspectItem(item) {
    const inspectorEl = document.getElementById('item-inspector-view');
    if (!inspectorEl) return;

    document.getElementById('inspect-item-type').textContent = item.type;
    document.getElementById('inspect-item-name').textContent = item.name;
    document.getElementById('inspect-item-desc').textContent = item.desc;
    document.getElementById('inspect-item-lore').textContent = item.lore;

    inspectorEl.style.display = 'block';
  }
}

export const inventory = new InventoryEngine();
