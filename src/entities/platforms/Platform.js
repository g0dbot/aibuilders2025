import { Entity } from '../Entity.js';

export class Platform extends Entity {
  constructor(x, y, width, height, type = 'regular') {
    super(x, y, width, height);
    this.type = type; // 'base' or 'floating'
  }

  render(ctx) {
    ctx.fillStyle = '#888';
    ctx.fillRect(this.pos.x, this.pos.y, this.size.width, this.size.height);

    // Draw hitbox outline
    ctx.strokeStyle = 'red';
    ctx.strokeRect(this.pos.x, this.pos.y, this.size.width, this.size.height);
  }
}
