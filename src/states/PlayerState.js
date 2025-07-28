export class PlayerState {
  constructor(initialState) {
    this.states = {
      idle:       { color: '#ff0000', sprite: 'idle' },
      running:    { color: '#00ff00', sprite: 'running' },
      jumping:    { color: '#0000ff', sprite: 'jumping' },
      doubleJump: { color: '#0077ff', sprite: 'doubleJump' },
      attacking:  { color: '#ffa500', sprite: 'attacking' },  // Only one attacking
      hurt:       { color: '#9900cc', sprite: 'hurt' },
      death:      { color: '#000000', sprite: 'death' }
    };


    this.current = initialState;
  }

  setState(newState) {
    if (this.states[newState]) {
      this.current = newState;
    }
  }

  getColor() {
    return this.states[this.current]?.color || '#000000';
  }

  getSpriteKey() {
    return this.states[this.current]?.sprite || null;
  }
}
