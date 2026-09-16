/**
 * ECHO//ZERO: THE LAST SIGNAL — Power Circuit Puzzle Engine
 * Interactive 6-node circuit routing from Generator A to Core F.
 */

import { gameState } from './game-state.js';
import { sound } from './audio.js';

export class PowerPuzzleEngine {
  constructor() {
    this.modal = null;
    this.nodes = {
      A: { energized: true, label: 'A: GEN', x: 20, y: 30 },
      B: { energized: false, label: 'B: RELAY 1', x: 50, y: 30 },
      C: { energized: false, label: 'C: BUS', x: 80, y: 30 },
      D: { energized: false, label: 'D: SUB', x: 20, y: 70 },
      E: { energized: false, label: 'E: RELAY 2', x: 50, y: 70 },
      F: { energized: false, label: 'F: CORE', x: 80, y: 70 }
    };
    this.switches = {
      AB: false,
      BC: false,
      CF: false,
      AD: true, // initial state gives hints
      DE: false,
      EF: false
    };
  }

  init() {
    this.modal = document.getElementById('puzzle-modal');
    const closeBtn = document.getElementById('puzzle-modal-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        sound.playRelayClick();
        this.closeModal();
      });
    }

    this.renderBoard();
  }

  openModal() {
    if (!this.modal) return;
    this.modal.classList.add('active');
    this.updateCircuitState();
  }

  closeModal() {
    if (this.modal) {
      this.modal.classList.remove('active');
    }
  }

  renderBoard() {
    const board = document.getElementById('circuit-board-container');
    if (!board) return;

    let html = `
      <svg id="circuit-svg" viewBox="0 0 100 100" preserveAspectRatio="none" style="position:absolute; top:0; left:0; width:100%; height:100%; pointer-events:none;">
        <line id="line-AB" x1="20" y1="30" x2="50" y2="30" stroke="rgba(255,255,255,0.15)" stroke-width="2" />
        <line id="line-BC" x1="50" y1="30" x2="80" y2="30" stroke="rgba(255,255,255,0.15)" stroke-width="2" />
        <line id="line-CF" x1="80" y1="30" x2="80" y2="70" stroke="rgba(255,255,255,0.15)" stroke-width="2" />
        <line id="line-AD" x1="20" y1="30" x2="20" y2="70" stroke="rgba(255,255,255,0.15)" stroke-width="2" />
        <line id="line-DE" x1="20" y1="70" x2="50" y2="70" stroke="rgba(255,255,255,0.15)" stroke-width="2" />
        <line id="line-EF" x1="50" y1="70" x2="80" y2="70" stroke="rgba(255,255,255,0.15)" stroke-width="2" />
      </svg>
    `;

    // Render node buttons
    Object.keys(this.nodes).forEach(key => {
      const n = this.nodes[key];
      html += `
        <div class="circuit-node-button" id="node-btn-${key}" style="left:${n.x}%; top:${n.y}%;" data-node="${key}">
          <div class="circuit-node-label">${n.label}</div>
          <div class="circuit-node-state" id="node-state-${key}">${n.energized ? 'LIVE' : 'OFF'}</div>
        </div>
      `;
    });

    board.innerHTML = html;

    // Node click toggles conduits connected to it
    const buttons = board.querySelectorAll('.circuit-node-button');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-node');
        sound.playRelayClick();
        this.toggleConnectionsForNode(key);
      });
    });
  }

  toggleConnectionsForNode(nodeKey) {
    if (gameState.state.powerRestored) return;

    if (nodeKey === 'A' || nodeKey === 'B') this.switches.AB = !this.switches.AB;
    if (nodeKey === 'B' || nodeKey === 'C') this.switches.BC = !this.switches.BC;
    if (nodeKey === 'C' || nodeKey === 'F') this.switches.CF = !this.switches.CF;
    if (nodeKey === 'D' || nodeKey === 'E') this.switches.DE = !this.switches.DE;
    if (nodeKey === 'E' || nodeKey === 'F') this.switches.EF = !this.switches.EF;

    this.updateCircuitState();
  }

  updateCircuitState() {
    // Reset live status
    this.nodes.B.energized = false;
    this.nodes.C.energized = false;
    this.nodes.D.energized = false;
    this.nodes.E.energized = false;
    this.nodes.F.energized = false;

    // Propagate from A (source)
    if (this.switches.AD) this.nodes.D.energized = true;
    if (this.switches.AB) this.nodes.B.energized = true;

    if (this.nodes.B.energized && this.switches.BC) this.nodes.C.energized = true;
    if (this.nodes.D.energized && this.switches.DE) this.nodes.E.energized = true;

    if (this.nodes.C.energized && this.switches.CF) this.nodes.F.energized = true;
    if (this.nodes.E.energized && this.switches.EF) this.nodes.F.energized = true;

    // Update lines visual
    const updateLine = (id, live) => {
      const el = document.getElementById(id);
      if (el) {
        el.setAttribute('stroke', live ? '#00E5FF' : 'rgba(255,255,255,0.15)');
        el.setAttribute('stroke-width', live ? '3' : '2');
      }
    };

    updateLine('line-AB', this.switches.AB && this.nodes.A.energized);
    updateLine('line-BC', this.switches.BC && this.nodes.B.energized);
    updateLine('line-CF', this.switches.CF && this.nodes.C.energized);
    updateLine('line-AD', this.switches.AD && this.nodes.A.energized);
    updateLine('line-DE', this.switches.DE && this.nodes.D.energized);
    updateLine('line-EF', this.switches.EF && this.nodes.E.energized);

    // Update node buttons
    Object.keys(this.nodes).forEach(k => {
      const btn = document.getElementById(`node-btn-${k}`);
      const stateEl = document.getElementById(`node-state-${k}`);
      if (btn) btn.classList.toggle('energized', this.nodes[k].energized);
      if (stateEl) stateEl.textContent = this.nodes[k].energized ? 'LIVE' : 'OFF';
    });

    // Check Victory (Core F energized)
    if (this.nodes.F.energized && !gameState.state.powerRestored) {
      sound.playPowerSurge();
      gameState.restorePower();
      sound.playAtmosphere('powered');

      const diag = document.getElementById('circuit-diagnostic-msg');
      if (diag) {
        diag.textContent = 'CIRCUIT CLOSED // POWER RESTORED TO FACILITY 07';
        diag.style.color = 'var(--accent-cyan)';
      }

      setTimeout(() => {
        this.closeModal();
      }, 1600);
    }
  }
}

export const puzzle = new PowerPuzzleEngine();
