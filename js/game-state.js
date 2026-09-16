/**
 * ECHO//ZERO: THE LAST SIGNAL — Central Game State Store
 * Manages inventory, power grid status, clue discoveries, objectives, and cycle sessions.
 */

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

  triggerClimax() {
    this.state.climaxTriggered = true;
    this.notify('climaxTriggered', true);
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

export const gameState = new GameStateStore();
