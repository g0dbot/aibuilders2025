import { FloatingPlatform } from './FloatingPlatform.js';

export class SlipperyFloatingPlatform extends FloatingPlatform {
  constructor(x, y, canvasHeight, blockSize = 32) {
    super(x, y, canvasHeight, blockSize);
    this.isSlippery = true; // flag for sliding logic
  }

  render(ctx, cameraX) {
    super.render(ctx, cameraX);

    ctx.strokeStyle = '#00BFFF'; // glowing blue line
    ctx.lineWidth = 2;
    ctx.shadowColor = '#00BFFF';
    ctx.shadowBlur = 10;

    ctx.beginPath();
    ctx.moveTo(this.pos.x - cameraX, this.pos.y + 2);
    ctx.lineTo(this.pos.x - cameraX + this.size.width, this.pos.y + 2);
    ctx.stroke();

    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
  }
}
