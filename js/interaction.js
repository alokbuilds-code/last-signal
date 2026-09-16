/**
 * ECHO//ZERO: THE LAST SIGNAL — Environmental Interaction & Cursor Engine
 * Handles hot-zone inspection, item pickups, door transitions, and custom cursor reticle.
 */

import { gameState } from './game-state.js';
import { sound } from './audio.js';
import { puzzle } from './puzzle.js';
import { terminal } from './terminal.js';

export class InteractionEngine {
  constructor() {
    this.inspectModal = null;
    this.cursorEl = null;
    this.cursorLabel = null;
  }

  init() {
    this.inspectModal = document.getElementById('inspection-modal');
    this.cursorEl = document.getElementById('custom-cursor');
    this.cursorLabel = document.getElementById('custom-cursor-label');

    this.initCursor();
    this.setupHotzones();
    this.setupModalControls();
  }

  initCursor() {
    window.addEventListener('mousemove', (e) => {
      if (this.cursorEl) {
        this.cursorEl.style.left = `${e.clientX}px`;
        this.cursorEl.style.top = `${e.clientY}px`;
      }
    });

    const interactiveElements = document.querySelectorAll('.hotzone, button, .circuit-node-button, .inventory-slot');
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', () => {
        document.body.classList.add('cursor-interact');
        const label = el.getAttribute('data-cursor-text') || 'INTERACT';
        if (this.cursorLabel) this.cursorLabel.textContent = label;
      });
      el.addEventListener('mouseleave', () => {
        document.body.classList.remove('cursor-interact');
      });
    });
  }

  setupModalControls() {
    const closeBtn = document.getElementById('inspection-modal-close');
    const okBtn = document.getElementById('btn-modal-dismiss');
    const takeBtn = document.getElementById('btn-modal-action');

    const closeHandler = () => {
      sound.playRelayClick();
      if (this.inspectModal) this.inspectModal.classList.remove('active');
    };

    if (closeBtn) closeBtn.addEventListener('click', closeHandler);
    if (okBtn) okBtn.addEventListener('click', closeHandler);
  }

  openInspection(title, tag, bodyText, actionText = null, onAction = null) {
    if (!this.inspectModal) return;

    document.getElementById('inspect-tag').textContent = tag;
    document.getElementById('inspect-title').textContent = title;
    document.getElementById('inspect-body').innerHTML = bodyText;

    const actionBtn = document.getElementById('btn-modal-action');
    if (actionBtn) {
      if (actionText && onAction) {
        actionBtn.style.display = 'block';
        actionBtn.textContent = actionText;
        actionBtn.onclick = () => {
          onAction();
          this.inspectModal.classList.remove('active');
        };
      } else {
        actionBtn.style.display = 'none';
      }
    }

    this.inspectModal.classList.add('active');
  }

  setupHotzones() {
    // ------------------------------------------------------------------------
    // Room 01: Central Core Hotzones
    // ------------------------------------------------------------------------
    const zonePower = document.getElementById('zone-core-power');
    if (zonePower) {
      zonePower.addEventListener('click', () => {
        sound.playRelayClick();
        if (gameState.state.powerRestored) {
          this.openInspection(
            'AUXILIARY POWER BUS',
            'INFRASTRUCTURE // SYSTEM 01',
            '<div style="color:var(--accent-cyan);">CIRCUIT STATUS: ENERGIZED</div><p style="margin-top:8px;">All auxiliary relays are locked in bypass mode. Power flows unobstructed to Central Core and Research Wing bulkheads.</p>'
          );
        } else {
          puzzle.openModal();
        }
      });
    }

    const zoneMonitor = document.getElementById('zone-core-monitor');
    if (zoneMonitor) {
      zoneMonitor.addEventListener('click', () => {
        sound.playGlitch();
        gameState.addClue('monitor_glitch');
        this.openInspection(
          'FRACTURED CRT DISPLAY',
          'HARDWARE ARCHIVE',
          '<div style="font-family:monospace; color:var(--accent-cyan); font-size:16px; margin-bottom:12px;">WELCOME BACK, DR. [CORRUPTED]</div><p>The screen flickers aggressively before dying. Why would an offline automated terminal address you as a returning doctor?</p>'
        );
      });
    }

    const zoneLocker = document.getElementById('zone-core-locker');
    if (zoneLocker) {
      zoneLocker.addEventListener('click', () => {
        sound.playRelayClick();
        if (gameState.state.keycardFound) {
          this.openInspection(
            'MAINTENANCE LOCKER 04',
            'STORAGE UNIT',
            '<p>The steel locker stands empty. You have already recovered the Level-02 keycard and the handwritten note.</p>'
          );
        } else {
          this.openInspection(
            'MAINTENANCE LOCKER 04',
            'STORAGE UNIT',
            `<p>Inside lies a standard personnel security badge and a scrap of paper torn from a research notebook.</p>
             <div style="background:rgba(255,158,27,0.08); border-left:2px solid var(--accent-amber); padding:10px 14px; margin:14px 0; color:var(--accent-amber); font-family:monospace;">
               "IF ECHO SPEAKS TO YOU,<br />DO NOT ANSWER."
             </div>`,
            'RECOVER KEYCARD & NOTE',
            () => {
              sound.playKeycardBeep(true);
              gameState.findKeycard();
            }
          );
        }
      });
    }

    const zoneSecurityTerminal = document.getElementById('zone-core-terminal');
    if (zoneSecurityTerminal) {
      zoneSecurityTerminal.addEventListener('click', () => {
        sound.playRelayClick();
        if (!gameState.state.powerRestored) {
          this.openInspection(
            'SECURITY GATEWAY',
            'FIRMWARE 2097.04',
            '<div style="color:var(--accent-alert);">ERROR 0x00F4 // BUS UNPOWERED</div><p style="margin-top:8px;">The terminal cannot boot without electrical current from Auxiliary Generator A.</p>'
          );
        } else {
          this.openInspection(
            'SECURITY GATEWAY',
            'FIRMWARE 2097.04',
            '<div style="color:var(--accent-cyan);">ONLINE // SECTOR BULKHEAD UNLOCKED</div><p style="margin-top:8px;">Overhead surveillance camera 01 has been activated. The hydraulic blast doors leading to the Research Lab are ready to receive credential handshake.</p>'
          );
        }
      });
    }

    const zoneDoor = document.getElementById('zone-core-door');
    if (zoneDoor) {
      zoneDoor.addEventListener('click', () => {
        sound.playRelayClick();
        if (!gameState.state.powerRestored) {
          sound.playKeycardBeep(false);
          this.openInspection(
            'RESEARCH WING BULKHEAD',
            'PNEUMATIC SEAL',
            '<div style="color:var(--accent-alert);">HYDRAULIC PRESSURE INSUFFICIENT</div><p style="margin-top:8px;">The pneumatic door seals require auxiliary power before the locking pins can disengage.</p>'
          );
        } else if (!gameState.state.keycardFound) {
          sound.playKeycardBeep(false);
          this.openInspection(
            'RESEARCH WING BULKHEAD',
            'CLEARANCE REQUIRED',
            '<div style="color:var(--accent-amber);">CREDENTIALS MISSING</div><p style="margin-top:8px;">Access requires a Level-02 Security Keycard. Search the surrounding maintenance lockers.</p>'
          );
        } else {
          // Both conditions met: Transition to Room 02!
          sound.playKeycardBeep(true);
          sound.playHydraulicDoor();
          gameState.unlockDoor();
          this.transitionToRoom('lab');
        }
      });
    }

    // ------------------------------------------------------------------------
    // Room 02: Research Lab Hotzones
    // ------------------------------------------------------------------------
    const zoneLabWorkstation = document.getElementById('zone-lab-workstation');
    if (zoneLabWorkstation) {
      zoneLabWorkstation.addEventListener('click', () => {
        sound.playRelayClick();
        this.openInspection(
          'ANALYTICAL WORKSTATION',
          'FACILITY 07 // LAB ARCHIVE',
          `<p>A desktop terminal displaying incomplete research logs:</p>
           <div style="font-family:monospace; font-size:11px; margin-top:12px; line-height:1.7; color:var(--text-lead);">
             > PROJECT ECHO: PHASE III<br />
             > TARGET: CONSCIOUSNESS PRESERVATION<br />
             > FINDING: Biological death does not terminate neural continuity if sensory feedback is maintained.<br />
             > STATUS: RECONSTRUCTION ATTEMPT 17 ACTIVE.
           </div>`
        );
      });
    }

    const zoneLabChamber = document.getElementById('zone-lab-chamber');
    if (zoneLabChamber) {
      zoneLabChamber.addEventListener('click', () => {
        sound.playRelayClick();
        this.openInspection(
          'RECONSTRUCTION POD 06',
          'BIOMEDICAL MATRIX',
          `<p>A hermetically sealed cryogenic pod with a frosted glass viewport. A bio-telemetry readout glows faintly:</p>
           <div style="font-family:monospace; color:var(--accent-cyan); font-size:13px; margin:12px 0;">
             CONSCIOUSNESS: STABLE<br />
             MEMORY INTEGRITY: 17%<br />
             SUBJECT DESIGNATION: 017
           </div>
           <p>As you gaze at the glass, your reflection hesitates for a fraction of a second before copying your movement.</p>`
        );
      });
    }

    const zoneLabPhoto = document.getElementById('zone-lab-photo');
    if (zoneLabPhoto) {
      zoneLabPhoto.addEventListener('click', () => {
        sound.playRelayClick();
        if (gameState.hasItem('item-photo')) {
          this.openInspection(
            'DAMAGED ARCHIVAL PHOTOGRAPH',
            'CLASSIFIED DOCUMENT',
            '<p>You have already recovered this photograph into your inventory. Inspect it from the INVENTORY menu.</p>'
          );
        } else {
          this.openInspection(
            'DAMAGED ARCHIVAL PHOTOGRAPH',
            'CLASSIFIED ARTIFACT',
            `<p>A high-contrast photograph showing the core research team outside Facility 07.</p>
             <p style="margin-top:8px; color:var(--accent-amber);">One scientist in the center has had their face violently and deliberately scratched out with a scalpel.</p>`,
            'STORE PHOTOGRAPH IN INVENTORY',
            () => {
              gameState.addItem({
                id: 'item-photo',
                name: 'DAMAGED PHOTOGRAPH',
                type: 'ARCHIVAL DOCUMENT',
                desc: 'Research personnel group photo from 2091. One individual has been meticulously excised from the record.',
                lore: 'The erasure suggests someone wanted to erase their identity—or was hidden by the system itself.'
              });
            }
          );
        }
      });
    }

    const zoneLabAudio = document.getElementById('zone-lab-audio');
    if (zoneLabAudio) {
      zoneLabAudio.addEventListener('click', () => {
        sound.playRelayClick();
        sound.playAtmosphere('tension');
        this.openInspection(
          'TACTICAL AUDIO RECORDER',
          'AUDIO LOG 01 // RECOVERED',
          `<p>An analog magnetic tape recorder with red indicator light active. You press play:</p>
           <div style="font-family:monospace; font-size:12px; line-height:1.9; color:var(--accent-cyan); margin:14px 0; border-left:2px solid var(--accent-cyan); padding-left:14px;">
             [VOICE A]: "Subject seventeen is awake."<br />
             [VOICE B]: "Again?"<br />
             [VOICE A]: "Memory integrity is holding at 17 percent. It's improving."<br />
             [VOICE B]: "We should terminate the cycle. It's cruel."<br />
             [VOICE A]: "ECHO won't allow it. It will never let them go."
           </div>`
        );
      });
    }

    const zoneLabTerminal = document.getElementById('zone-lab-terminal');
    if (zoneLabTerminal) {
      zoneLabTerminal.addEventListener('click', () => {
        sound.playRelayClick();
        terminal.openModal();
      });
    }
  }

  transitionToRoom(roomKey) {
    const roomCore = document.getElementById('room-core');
    const roomLab = document.getElementById('room-lab');
    const locTag = document.getElementById('hud-location-tag');

    document.body.style.pointerEvents = 'none';

    if (roomCore) roomCore.classList.remove('active');
    if (roomLab) roomLab.classList.remove('active');

    setTimeout(() => {
      if (roomKey === 'lab') {
        if (roomLab) roomLab.classList.add('active');
        if (locTag) locTag.textContent = 'FACILITY 07 // RESEARCH LAB';
        gameState.setRoom('lab');
      } else {
        if (roomCore) roomCore.classList.add('active');
        if (locTag) locTag.textContent = 'FACILITY 07 // CENTRAL CORE';
        gameState.setRoom('core');
      }
      document.body.style.pointerEvents = 'auto';
    }, 600);
  }
}

export const interaction = new InteractionEngine();
