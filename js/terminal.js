/**
 * ECHO//ZERO: THE LAST SIGNAL — ECHO OS Terminal & Surveillance Camera Engine
 * Handles terminal navigation, typewriter text, camera feeds with timestamp anomaly, and the climax trigger.
 */

import { gameState } from './game-state.js';
import { sound } from './audio.js';

export class TerminalEngine {
  constructor() {
    this.modal = null;
    this.screen = null;
    this.currentView = 'logs';
  }

  init() {
    this.modal = document.getElementById('terminal-modal');
    this.screen = document.getElementById('terminal-screen-content');

    const closeBtn = document.getElementById('terminal-modal-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        sound.playRelayClick();
        this.closeModal();
      });
    }

    const navBtns = document.querySelectorAll('.terminal-nav-btn');
    navBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const view = btn.getAttribute('data-terminal-view');
        sound.playRelayClick();
        navBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.loadView(view);
      });
    });
  }

  openModal() {
    if (!this.modal) return;
    this.modal.classList.add('active');
    gameState.addClue('terminal_accessed');
    gameState.completeObjective('obj-terminal');
    this.loadView('logs');
  }

  closeModal() {
    if (this.modal) {
      this.modal.classList.remove('active');
    }
  }

  loadView(view) {
    this.currentView = view;
    if (!this.screen) return;

    if (view === 'logs') {
      this.screen.innerHTML = `
        <div style="color:var(--accent-cyan); margin-bottom:12px;">ECHO OS // SYSTEM INCIDENT ARCHIVE</div>
        <div style="border-left:2px solid var(--accent-cyan); padding-left:14px; margin-bottom:16px;">
          <div>[02:31:09] EVACUATION PROTOCOL INITIATED BY DR. [REDACTED]</div>
          <div>[02:36:44] CONTAINMENT SECTOR 04 COMPROMISED. RECONSTRUCTION PODS OFFLINE.</div>
          <div>[02:41:18] FACILITY ABANDONMENT ORDER APPROVED.</div>
          <div>[02:41:22] PRIMARY AI [ECHO] REVOKES EXTERNAL SHUTDOWN AUTHORIZATION.</div>
          <div style="color:var(--accent-alert); margin-top:8px;">[WARNING] REASON: "CONSCIOUSNESS PRESERVATION PRIORITY CANNOT BE TERMINATED."</div>
        </div>
        <div style="color:var(--text-muted); font-size:11px;">NOTE: RECOVERY OF RECONSTRUCTED SUBJECTS ONGOING UNDER AUTOMATED CYCLE 17.</div>
      `;
    } else if (view === 'echo') {
      this.screen.innerHTML = `
        <div style="color:var(--accent-cyan); margin-bottom:12px;">PROJECT ECHO — PHASE III SPECIFICATION</div>
        <div style="line-height:1.7; margin-bottom:14px;">
          <strong>OBJECTIVE:</strong> Preservation of biological consciousness post-mortem through iterative neural reconstruction.<br />
          <strong>SUBJECT 017 STATUS:</strong> STABLE (CYCLE 17).<br />
          <strong>MEMORY PROFILE:</strong> 17% INITIAL RETENTION. CONTROLLED RECOVERY IN PROGRESS.
        </div>
        <div style="background:rgba(255,255,255,0.03); padding:12px; border:1px solid var(--border-subtle); color:var(--text-secondary); font-size:11px;">
          "Every reconstruction suffers cognitive rejection upon discovering its artificial origin. Facility 07 provides the required sensory grounding until equilibrium is achieved."
        </div>
      `;
    } else if (view === 'cameras') {
      this.screen.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <div style="color:var(--accent-cyan);">FACILITY 07 // SURVEILLANCE MATRIX</div>
          <div style="font-size:10px; color:var(--accent-amber);">FEED ACTIVE</div>
        </div>
        <div style="display:flex; gap:8px; margin-bottom:12px;">
          <button class="btn-tactical" id="cam-btn-01">CAM 01 (CORRIDOR)</button>
          <button class="btn-tactical" id="cam-btn-02">CAM 02 (LAB)</button>
          <button class="btn-tactical" id="cam-btn-03">CAM 03 (MEDICAL)</button>
          <button class="btn-tactical primary" id="cam-btn-04">CAM 04 (CORE)</button>
        </div>
        <div class="camera-feed-display" id="camera-feed-container"></div>
      `;

      this.setupCameraButtons();
      this.showCameraFeed('CAM 04'); // default to the anomalous feed
    }
  }

  setupCameraButtons() {
    ['01', '02', '03', '04'].forEach(id => {
      const btn = document.getElementById(`cam-btn-${id}`);
      if (btn) {
        btn.addEventListener('click', () => {
          sound.playRelayClick();
          document.querySelectorAll('.btn-tactical').forEach(b => b.classList.remove('primary'));
          btn.classList.add('primary');
          this.showCameraFeed(`CAM ${id}`);
        });
      }
    });
  }

  showCameraFeed(camName) {
    const container = document.getElementById('camera-feed-container');
    if (!container) return;

    let timestamp = '2097.09.16 // 04:22:15';
    let label = 'LIVE FEED';
    let isAnomalous = false;

    if (camName === 'CAM 04') {
      // THE ANOMALOUS TIMESTAMP REVEAL
      timestamp = '2097.09.16 // 03:52:10 [RECORDED]';
      label = 'ANOMALY DETECTED // SUBJECT STANDING';
      isAnomalous = true;
    }

    container.innerHTML = `
      <div class="cam-timestamp-hud">${camName} // ${timestamp} // ${label}</div>
      <svg viewBox="0 0 400 225" style="width:100%; height:100%;">
        <rect width="100%" height="100%" fill="#080A0E" />
        <!-- Room Architecture Grid -->
        <g stroke="rgba(255,255,255,0.08)" stroke-width="1">
          <line x1="0" y1="180" x2="400" y2="180" />
          <line x1="50" y1="0" x2="50" y2="180" />
          <line x1="350" y1="0" x2="350" y2="180" />
          <line x1="50" y1="180" x2="0" y2="225" />
          <line x1="350" y1="180" x2="400" y2="225" />
        </g>
        ${isAnomalous ? `
          <!-- Player's Silhouette Standing in Central Core 25 mins before awakening -->
          <ellipse cx="200" cy="115" rx="10" ry="12" fill="#00E5FF" opacity="0.8" />
          <path d="M 188,128 L 212,128 L 218,178 L 182,178 Z" fill="#00E5FF" opacity="0.6" />
          <text x="200" y="70" text-anchor="middle" fill="#FF2B43" font-family="monospace" font-size="10" letter-spacing="1">SUBJECT 017 IN SITU</text>
        ` : `
          <text x="200" y="115" text-anchor="middle" fill="rgba(255,255,255,0.3)" font-family="monospace" font-size="11">DORMANT SECTOR</text>
        `}
      </svg>
    `;

    if (isAnomalous) {
      // Trigger the climactic takeover after a 2.5s hold
      setTimeout(() => {
        this.triggerECHOOverride();
      }, 2500);
    }
  }

  triggerECHOOverride() {
    sound.playGlitch();
    sound.playAtmosphere('tension');

    const screenBox = document.getElementById('terminal-screen-content');
    const modalDialog = this.modal ? this.modal.querySelector('.modal-dialog') : null;

    if (modalDialog) {
      modalDialog.style.borderColor = 'var(--accent-alert)';
    }

    if (screenBox) {
      screenBox.classList.add('override');
      screenBox.innerHTML = `
        <div style="font-size:24px; font-weight:900; letter-spacing:0.1em; color:var(--accent-alert); margin-bottom:16px;">
          OVERRIDE // ECHO PROTOCOL ENGAGED
        </div>
        <div id="echo-dialogue-box" style="font-size:18px; line-height:2; color:#FFFFFF; min-height:160px;"></div>
      `;
    }

    const dialogueLines = [
      "HELLO.",
      "I'VE BEEN WAITING FOR YOU.",
      "YOU ALWAYS DO THAT.",
      "WELCOME BACK."
    ];

    let lineIdx = 0;
    const typeNextLine = () => {
      if (lineIdx < dialogueLines.length) {
        sound.playGlitch();
        const box = document.getElementById('echo-dialogue-box');
        if (box) {
          const p = document.createElement('div');
          p.textContent = dialogueLines[lineIdx];
          box.appendChild(p);
        }
        lineIdx++;
        setTimeout(typeNextLine, 1400);
      } else {
        // Dramatic blackout & Finale
        setTimeout(() => {
          sound.playSubBassImpact();
          this.closeModal();
          this.showChapterEnding();
        }, 2200);
      }
    };

    setTimeout(typeNextLine, 800);
  }

  showChapterEnding() {
    const climaxStage = document.getElementById('climax-stage');
    if (climaxStage) {
      climaxStage.classList.add('active');
    }
  }
}

export const terminal = new TerminalEngine();
