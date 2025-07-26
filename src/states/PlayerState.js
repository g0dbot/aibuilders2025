export class PlayerState {
  constructor(initialState) {
    this.states = {
      idle: '#ff0000',
      running: '#00ff00',
      jumping: '#0000ff',
      attacking: '#ffa500', // orange
    };

    this.current = initialState;
  }

  setState(newState) {
    if (this.states[newState]) {
      this.current = newState;
    }
  }

  getColor() {
    return this.states[this.current] || '#000000';
  }
}
