/**
 * ECHO//ZERO: THE LAST SIGNAL — Unified Standalone Engine
 * Self-contained bundle guaranteeing offline execution via file:// and http:// protocols.
 */

(function() {
  'use strict';

  /* ==========================================================================
     1. SOUND ENGINE (Web Audio API & Formant Synthesizer)
     ========================================================================== */
  class SoundEngine {
    constructor() {
      this.ctx = null;
      this.masterGain = null;
      this.isMuted = false;
      this.activeDrones = [];
      this.currentAtmosphere = null;
    }

    init() {
      if (this.ctx) return;
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.4, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      } catch (e) {
        console.warn('AudioContext failed to initialize', e);
      }
    }

    ensureContext() {
      if (!this.ctx) {
        this.init();
      } else if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    toggleMute() {
      this.ensureContext();
      this.isMuted = !this.isMuted;
      if (this.masterGain && this.ctx) {
        this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : 0.4, this.ctx.currentTime, 0.05);
      }
      return !this.isMuted;
    }

    stopDrones() {
      if (!this.ctx) return;
      this.activeDrones.forEach(drone => {
        try {
          if (drone.gain) {
            drone.gain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.5);
            setTimeout(() => {
              try { drone.osc.stop(); } catch (e) {}
            }, 600);
          } else {
            drone.stop();
          }
        } catch (e) {}
      });
      this.activeDrones = [];
    }

    playAtmosphere(type) {
      this.ensureContext();
      if (!this.ctx || this.currentAtmosphere === type) return;
      this.currentAtmosphere = type;
      this.stopDrones();

      switch (type) {
        case 'opening':
          this.playDeepRumble();
          break;
        case 'unpowered':
          this.playDormantFacilityHum();
          break;
        case 'powered':
          this.playActiveFacilityHum();
          break;
        case 'tension':
          this.playTensionDrone();
          break;
      }
    }

    playDeepRumble() {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(38, this.ctx.currentTime);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(95, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.01, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.35, this.ctx.currentTime + 2.5);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start();
      this.activeDrones.push({ osc, gain });
    }

    playDormantFacilityHum() {
      if (!this.ctx) return;
      [48, 96].forEach((f, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, this.ctx.currentTime);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(140, this.ctx.currentTime);

        gain.gain.setValueAtTime(0.01, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.12 / (i + 1), this.ctx.currentTime + 1.8);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        this.activeDrones.push({ osc, gain });
      });
    }

    playActiveFacilityHum() {
      if (!this.ctx) return;
      [60, 120, 180].forEach((f, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, this.ctx.currentTime);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(320, this.ctx.currentTime);

        gain.gain.setValueAtTime(0.01, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.08 / (i + 1), this.ctx.currentTime + 2);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        this.activeDrones.push({ osc, gain });
      });
    }

    playTensionDrone() {
      if (!this.ctx) return;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(65.41, this.ctx.currentTime);
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(92.50, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.01, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.15, this.ctx.currentTime + 1.5);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(220, this.ctx.currentTime);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc1.start();
      osc2.start();
      this.activeDrones.push({ osc: osc1, gain }, { osc: osc2, gain });
    }

    playSubBassImpact() {
      this.ensureContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(90, now);
      osc.frequency.exponentialRampToValueAtTime(22, now + 1.4);

      gain.gain.setValueAtTime(0.85, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 1.6);
    }

    playRelayClick() {
      this.ensureContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.03);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.04);
    }

    playPowerSurge() {
      this.ensureContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(60, now);
      osc.frequency.exponentialRampToValueAtTime(720, now + 0.6);

      gain.gain.setValueAtTime(0.05, now);
      gain.gain.linearRampToValueAtTime(0.35, now + 0.5);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, now);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.85);
    }

    playHydraulicDoor() {
      this.ensureContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      try {
        const bufferSize = this.ctx.sampleRate * 0.8;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1200, now);
        filter.frequency.exponentialRampToValueAtTime(300, now + 0.7);

        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.2, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.75);

        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(this.masterGain);
        noise.start(now);
        noise.stop(now + 0.8);
      } catch (e) {}

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(120, now + 0.4);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.8);
      gain.gain.setValueAtTime(0.3, now + 0.4);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now + 0.4);
      osc.stop(now + 0.9);
    }

    playKeycardBeep(granted = true) {
      this.ensureContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      if (granted) {
        osc.frequency.setValueAtTime(1400, now);
        osc.frequency.setValueAtTime(1850, now + 0.08);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.start(now);
        osc.stop(now + 0.24);
      } else {
        osc.frequency.setValueAtTime(420, now);
        osc.frequency.setValueAtTime(280, now + 0.1);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
        osc.start(now);
        osc.stop(now + 0.3);
      }

      osc.connect(gain);
      gain.connect(this.masterGain);
    }

    playGlitch() {
      this.ensureContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(80, now);
      osc.frequency.linearRampToValueAtTime(2400, now + 0.06);
      osc.frequency.linearRampToValueAtTime(120, now + 0.12);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.15);
    }

    speakLine(text, onComplete) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.pitch = 0.55;
        utterance.rate = 0.82;
        utterance.volume = this.isMuted ? 0 : 0.85;

        utterance.onend = () => { if (onComplete) onComplete(); };
        utterance.onerror = () => { if (onComplete) onComplete(); };

        window.speechSynthesis.speak(utterance);
      } else {
        setTimeout(() => { if (onComplete) onComplete(); }, 1800);
      }
    }
  }

  const sound = new SoundEngine();

  /* ==========================================================================
     2. GAME STATE STORE
     ========================================================================== */
  class GameStateStore {
    constructor() {
      this.state = {
        sessionNumber: 17,
        currentRoom: 'core',
        powerRestored: false,
        keycardFound: false,
        doorUnlocked: false,
        cameraObserved: false,
        terminalLogged: false,
        climaxTriggered: false,
        trustEcho: 0,
        inventory: [],
        discoveredClues: [],
        objectives: [
          { id: 'obj-power', text: 'RESTORE AUXILIARY POWER GRID', done: false },
          { id: 'obj-keycard', text: 'LOCATE SECURITY CLEARANCE KEYCARD', done: false },
          { id: 'obj-lab', text: 'ACCESS RESEARCH LAB BULKHEAD', done: false },
          { id: 'obj-terminal', text: 'ACCESS ECHO SYSTEM LOGS', done: false }
        ]
      };
      this.listeners = [];
    }

    subscribe(listener) {
      this.listeners.push(listener);
    }

    notify(changeKey, value) {
      this.listeners.forEach(fn => fn(this.state, changeKey, value));
    }

    setRoom(roomKey) {
      this.state.currentRoom = roomKey;
      this.notify('currentRoom', roomKey);
    }

    restorePower() {
      this.state.powerRestored = true;
      this.completeObjective('obj-power');
      this.notify('powerRestored', true);
    }

    findKeycard() {
      this.state.keycardFound = true;
      this.addItem({
        id: 'item-keycard',
        name: 'LEVEL-02 KEYCARD',
        type: 'ACCESS TOKEN',
        desc: 'Standard security clearance keycard belonging to Facility 07 research personnel. Authorizes access to the Research Wing.',
        lore: 'Recovered from Maintenance Locker 04. Emits a low-frequency RFID handshake.'
      });
      this.completeObjective('obj-keycard');
      this.notify('keycardFound', true);
    }

    unlockDoor() {
      this.state.doorUnlocked = true;
      this.completeObjective('obj-lab');
      this.notify('doorUnlocked', true);
    }

    addItem(item) {
      if (this.state.inventory.find(i => i.id === item.id)) return;
      this.state.inventory.push(item);
      this.notify('inventory', this.state.inventory);
    }

    hasItem(itemId) {
      return !!this.state.inventory.find(i => i.id === itemId);
    }

    addClue(clueKey) {
      if (!this.state.discoveredClues.includes(clueKey)) {
        this.state.discoveredClues.push(clueKey);
        this.notify('discoveredClues', this.state.discoveredClues);
      }
    }

    completeObjective(objId) {
      const obj = this.state.objectives.find(o => o.id === objId);
      if (obj && !obj.done) {
        obj.done = true;
        this.notify('objectives', this.state.objectives);
      }
    }

    resetCycle() {
      this.state.sessionNumber += 1;
      this.state.currentRoom = 'core';
      this.state.powerRestored = false;
      this.state.keycardFound = false;
      this.state.doorUnlocked = false;
      this.state.cameraObserved = false;
      this.state.terminalLogged = false;
      this.state.climaxTriggered = false;
      this.state.inventory = [];
      this.state.discoveredClues = [];
      this.state.objectives = [
        { id: 'obj-power', text: 'RESTORE AUXILIARY POWER GRID', done: false },
        { id: 'obj-keycard', text: 'LOCATE SECURITY CLEARANCE KEYCARD', done: false },
        { id: 'obj-lab', text: 'ACCESS RESEARCH LAB BULKHEAD', done: false },
        { id: 'obj-terminal', text: 'ACCESS ECHO SYSTEM LOGS', done: false }
      ];
      this.notify('reset', this.state);
    }
  }

  const gameState = new GameStateStore();

  /* ==========================================================================
     3. POWER GRID CIRCUIT PUZZLE ENGINE
     ========================================================================== */
  class PowerPuzzleEngine {
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
        AD: true,
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
      this.nodes.B.energized = false;
      this.nodes.C.energized = false;
      this.nodes.D.energized = false;
      this.nodes.E.energized = false;
      this.nodes.F.energized = false;

      if (this.switches.AD) this.nodes.D.energized = true;
      if (this.switches.AB) this.nodes.B.energized = true;

      if (this.nodes.B.energized && this.switches.BC) this.nodes.C.energized = true;
      if (this.nodes.D.energized && this.switches.DE) this.nodes.E.energized = true;

      if (this.nodes.C.energized && this.switches.CF) this.nodes.F.energized = true;
      if (this.nodes.E.energized && this.switches.EF) this.nodes.F.energized = true;

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

      Object.keys(this.nodes).forEach(k => {
        const btn = document.getElementById(`node-btn-${k}`);
        const stateEl = document.getElementById(`node-state-${k}`);
        if (btn) btn.classList.toggle('energized', this.nodes[k].energized);
        if (stateEl) stateEl.textContent = this.nodes[k].energized ? 'LIVE' : 'OFF';
      });

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

  const puzzle = new PowerPuzzleEngine();

  /* ==========================================================================
     4. ECHO OS TERMINAL & SURVEILLANCE ENGINE
     ========================================================================== */
  class TerminalEngine {
    constructor() {
      this.modal = null;
      this.screen = null;
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
        this.showCameraFeed('CAM 04');
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
        timestamp = '2097.09.16 // 03:52:10 [RECORDED]';
        label = 'ANOMALY DETECTED // SUBJECT STANDING';
        isAnomalous = true;
      }

      container.innerHTML = `
        <div class="cam-timestamp-hud">${camName} // ${timestamp} // ${label}</div>
        <svg viewBox="0 0 400 225" style="width:100%; height:100%;">
          <rect width="100%" height="100%" fill="#080A0E" />
          <g stroke="rgba(255,255,255,0.08)" stroke-width="1">
            <line x1="0" y1="180" x2="400" y2="180" />
            <line x1="50" y1="0" x2="50" y2="180" />
            <line x1="350" y1="0" x2="350" y2="180" />
            <line x1="50" y1="180" x2="0" y2="225" />
            <line x1="350" y1="180" x2="400" y2="225" />
          </g>
          ${isAnomalous ? `
            <ellipse cx="200" cy="115" rx="10" ry="12" fill="#00E5FF" opacity="0.8" />
            <path d="M 188,128 L 212,128 L 218,178 L 182,178 Z" fill="#00E5FF" opacity="0.6" />
            <text x="200" y="70" text-anchor="middle" fill="#FF2B43" font-family="monospace" font-size="10" letter-spacing="1">SUBJECT 017 IN SITU</text>
          ` : `
            <text x="200" y="115" text-anchor="middle" fill="rgba(255,255,255,0.3)" font-family="monospace" font-size="11">DORMANT SECTOR</text>
          `}
        </svg>
      `;

      if (isAnomalous) {
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
          setTimeout(() => {
            sound.playSubBassImpact();
            this.closeModal();
            const climaxStage = document.getElementById('climax-stage');
            if (climaxStage) climaxStage.classList.add('active');
          }, 2200);
        }
      };

      setTimeout(typeNextLine, 800);
    }
  }

  const terminal = new TerminalEngine();

  /* ==========================================================================
     5. INVENTORY & OBJECTIVES ENGINE
     ========================================================================== */
  class InventoryEngine {
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
      if (this.modal) this.modal.classList.remove('active');
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

  const inventory = new InventoryEngine();

  class ObjectivesEngine {
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
      if (this.modal) this.modal.classList.remove('active');
    }
  }

  const objectives = new ObjectivesEngine();

  /* ==========================================================================
     6. ENVIRONMENTAL INTERACTION & CURSOR ENGINE
     ========================================================================== */
  class InteractionEngine {
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
      // Core Hotzones
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
            sound.playKeycardBeep(true);
            sound.playHydraulicDoor();
            gameState.unlockDoor();
            this.transitionToRoom('lab');
          }
        });
      }

      // Lab Hotzones
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

  const interaction = new InteractionEngine();

  /* ==========================================================================
     7. INITIALIZATION & OPENING CINEMATIC
     ========================================================================== */
  document.addEventListener('DOMContentLoaded', () => {
    console.log('// ECHO//ZERO ENGINE ONLINE.');

    const soundBtn = document.getElementById('hud-sound-btn');
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        const isAudible = sound.toggleMute();
        soundBtn.classList.toggle('playing', isAudible);
        const label = soundBtn.querySelector('.sound-label');
        if (label) label.textContent = isAudible ? 'AUDIO: ON' : 'AUDIO: OFF';
      });
    }

    interaction.init();
    puzzle.init();
    terminal.init();
    inventory.init();
    objectives.init();

    // Reset button on climax stage
    const restartBtn = document.getElementById('btn-restart-cycle');
    if (restartBtn) {
      restartBtn.addEventListener('click', () => {
        const climaxStage = document.getElementById('climax-stage');
        if (climaxStage) climaxStage.classList.remove('active');

        gameState.resetCycle();

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

    gameState.subscribe((state, changeKey) => {
      if (changeKey === 'powerRestored') {
        const roomCore = document.getElementById('room-core');
        if (roomCore) {
          roomCore.classList.remove('unpowered');
          roomCore.classList.add('powered');
        }

        const statusDot = document.querySelector('.status-dot');
        const statusText = document.getElementById('hud-system-status-text');
        if (statusDot) statusDot.classList.add('online');
        if (statusText) statusText.textContent = 'SYSTEM AUXILIARY: ONLINE';

        setTimeout(() => {
          const banner = document.getElementById('camera-surveillance-banner');
          if (banner) {
            sound.playHydraulicDoor();
            banner.classList.add('active');
            setTimeout(() => { banner.classList.remove('active'); }, 4500);
          }
        }, 1200);
      }
    });

    initOpeningCinematic();
  });

  function initOpeningCinematic() {
    const openingStage = document.getElementById('opening-stage');
    const metaTag = document.getElementById('opening-meta-tag');
    const mainTitle = document.getElementById('opening-main-title');
    const subtitle = document.getElementById('opening-subtitle');
    const voiceSub = document.getElementById('opening-voice-sub');
    const facilityCard = document.getElementById('opening-facility-card');
    const enterBtn = document.getElementById('btn-enter-facility');

    if (!openingStage) return;

    setTimeout(() => {
      if (metaTag) {
        metaTag.textContent = "SYSTEM BOOT // 04:17:32 // MEMORY INTEGRITY: 17%";
        metaTag.style.opacity = '1';
      }
    }, 1000);

    setTimeout(() => {
      sound.playGlitch();
      if (metaTag) {
        metaTag.textContent = "MEMORY ERROR // RECONSTRUCTION HALTED";
        metaTag.style.color = "var(--accent-alert)";
      }
    }, 2200);

    setTimeout(() => {
      sound.playAtmosphere('opening');
      if (mainTitle) mainTitle.classList.add('revealed');
      if (subtitle) subtitle.classList.add('revealed');
    }, 3200);

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
                setTimeout(() => {
                  if (voiceSub) voiceSub.style.opacity = '0';
                  if (facilityCard) facilityCard.classList.add('visible');
                }, 1200);
              });
            }, 1200);
          });
        }, 1200);
      });
    }, 5000);

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

})();
