/**
 * ECHO//ZERO: THE LAST SIGNAL — Master Application Bootloader
 * Orchestrates opening cinematic flow, speech synthesis, room visualizers, and game initialization.
 */

import { sound } from './audio.js';
import { gameState } from './game-state.js';
import { interaction } from './interaction.js';
import { puzzle } from './puzzle.js';
import { terminal } from './terminal.js';
import { inventory } from './inventory.js';
import { objectives } from './objectives.js';
import { saveSystem } from './save-system.js';

document.addEventListener('DOMContentLoaded', () => {
  console.log('// ECHO//ZERO ENGINE INITIALIZING...');

  // Setup HUD Sound Mute/Unmute
  const soundBtn = document.getElementById('hud-sound-btn');
  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      const isAudible = sound.toggleMute();
      soundBtn.classList.toggle('playing', isAudible);
      const label = soundBtn.querySelector('.sound-label');
      if (label) label.textContent = isAudible ? 'AUDIO: ON' : 'AUDIO: OFF';
    });
  }

  // Initialize Subsystems
  interaction.init();
  puzzle.init();
  terminal.init();
  inventory.init();
  objectives.init();
  saveSystem.init();

  // Watch for state changes to update room visualizer classes
  gameState.subscribe((state, changeKey) => {
    if (changeKey === 'powerRestored') {
      const roomCore = document.getElementById('room-core');
      if (roomCore) {
        roomCore.classList.remove('unpowered');
        roomCore.classList.add('powered');
      }

      const statusDot = document.querySelector('.status-dot');
      const statusText = document.getElementById('hud-system-status-text');
      if (statusDot) {
        statusDot.classList.add('online');
      }
      if (statusText) {
        statusText.textContent = 'SYSTEM AUXILIARY: ONLINE';
      }

      // Trigger overhead camera tracking event in Central Core!
      setTimeout(() => {
        triggerSurveillanceEvent();
      }, 1200);
    }
  });

  // Start Opening Cinematic
  initOpeningCinematic();
});

function triggerSurveillanceEvent() {
  const banner = document.getElementById('camera-surveillance-banner');
  if (banner) {
    sound.playHydraulicDoor();
    banner.classList.add('active');
    setTimeout(() => {
      banner.classList.remove('active');
    }, 4500);
  }
}

function initOpeningCinematic() {
  const openingStage = document.getElementById('opening-stage');
  const metaTag = document.getElementById('opening-meta-tag');
  const mainTitle = document.getElementById('opening-main-title');
  const subtitle = document.getElementById('opening-subtitle');
  const voiceSub = document.getElementById('opening-voice-sub');
  const facilityCard = document.getElementById('opening-facility-card');
  const enterBtn = document.getElementById('btn-enter-facility');

  if (!openingStage) return;

  // Step 1: System Boot Label after ~1s
  setTimeout(() => {
    if (metaTag) {
      metaTag.textContent = "SYSTEM BOOT // 04:17:32 // MEMORY INTEGRITY: 17%";
      metaTag.style.opacity = '1';
    }
  }, 1000);

  // Step 2: Memory Errors with Glitch
  setTimeout(() => {
    sound.playGlitch();
    if (metaTag) {
      metaTag.textContent = "MEMORY ERROR // RECONSTRUCTION HALTED";
      metaTag.style.color = "var(--accent-alert)";
    }
  }, 2200);

  // Step 3: ECHO//ZERO Title Reveal
  setTimeout(() => {
    sound.playAtmosphere('opening');
    if (mainTitle) mainTitle.classList.add('revealed');
    if (subtitle) subtitle.classList.add('revealed');
  }, 3200);

  // Step 4: The First Voice ("Wake up... Can you hear me?... Don't trust the system.")
  setTimeout(() => {
    if (voiceSub) {
      voiceSub.textContent = "Wake up.";
      voiceSub.classList.add('visible');
    }
    sound.speakLine("Wake up.", () => {
      setTimeout(() => {
        if (voiceSub) voiceSub.textContent = "Can you hear me?";
        sound.speakLine("Can you hear me?", () => {
          setTimeout(() => {
            if (voiceSub) voiceSub.textContent = "Don't trust the system.";
            sound.speakLine("Don't trust the system.", () => {
              // Step 5: World Reveal
              setTimeout(() => {
                revealWorld();
              }, 1200);
            });
          }, 1200);
        });
      }, 1200);
    });
  }, 5000);

  function revealWorld() {
    if (voiceSub) voiceSub.style.opacity = '0';
    if (facilityCard) facilityCard.classList.add('visible');
  }

  // Step 6: Enter Facility Action
  if (enterBtn) {
    enterBtn.addEventListener('click', () => {
      sound.playSubBassImpact();
      openingStage.classList.add('dismissed');

      const soundBtn = document.getElementById('hud-sound-btn');
      if (soundBtn) soundBtn.classList.add('playing');

      sound.playAtmosphere('unpowered');

      setTimeout(() => {
        openingStage.style.display = 'none';
      }, 1100);
    });
  }
}
