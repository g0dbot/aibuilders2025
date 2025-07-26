export class Entity {
  constructor(x, y, width, height) {
    this.pos = { x, y };
    this.size = { width, height };
  }

  update(delta) {}
  render(ctx) {}
}
