import { Entity } from './Entity.js';

export class Coin extends Entity {
  constructor(x, y, radius = 10) {
    super(x, y, radius * 2, radius * 2);
    this.radius = radius;
    this.collected = false;
    this.glowIntensity = 3;  // lower glow for subtle effect
    this.glowDirection = 1;
  }

  update() {
    // Animate glow intensity between 0.4 and 0.7 for subtle glow
    this.glowIntensity += 0.005 * this.glowDirection;
    if (this.glowIntensity >= 0.7) this.glowDirection = -1;
    else if (this.glowIntensity <= 0.4) this.glowDirection = 1;
  }

  checkCollision(player) {
    if (this.collected) return false;

    const playerLeft = player.pos.x;
    const playerRight = player.pos.x + player.size.width;
    const playerTop = player.pos.y;
    const playerBottom = player.pos.y + player.size.height;

    const coinLeft = this.pos.x;
    const coinRight = this.pos.x + this.size.width;
    const coinTop = this.pos.y;
    const coinBottom = this.pos.y + this.size.height;

    return !(playerRight < coinLeft || playerLeft > coinRight || playerBottom < coinTop || playerTop > coinBottom);
  }

  collect(player) {
    if (this.checkCollision(player)) {
      this.collected = true;
      // TODO: play coin collection sound here
      return true;
    }
    return false;
  }

  render(ctx, cameraX) {
    if (this.collected) return;

    ctx.save();
    ctx.beginPath();

    // Subtle glow
    ctx.shadowColor = 'rgba(255, 215, 0,' + this.glowIntensity + ')'; // golden glow
    ctx.shadowBlur = 8;

    // Draw solid black circle
    ctx.fillStyle = 'black';
    ctx.arc(this.pos.x - cameraX + this.radius, this.pos.y + this.radius, this.radius, 0, Math.PI * 2);
    ctx.fill();

    // Draw golden saturated yellow outline
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(255, 215, 0, 1)'; // golden yellow
    ctx.stroke();

    ctx.restore();
  }
}
