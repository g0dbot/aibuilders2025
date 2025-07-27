import { Platform } from './Platform.js';

export class FloatingPlatform extends Platform {
  constructor(x, y, canvasHeight, blockSize = 32) {
    super(x, y, 160, 32); // Default size
    
    this.canvasHeight = canvasHeight;
    this.setBlockSize(blockSize);
    this.setHeightInBlocks(0.5); // Half-block height
    
    // Position at specified Y (not bottom)
    this.pos.y = y;
    
    // Floating platform configurations
    this.minGapBlocks = 2;
    this.maxGapBlocks = 3;
    this.minWidthBlocks = 3;
    this.maxWidthBlocks = 8;
  }

  createNextPlatform(lastX) {
    const gap = this.getRandomGap(this.minGapBlocks, this.maxGapBlocks);
    const width = this.getRandomWidth(this.minWidthBlocks, this.maxWidthBlocks);
    const nextX = lastX + this.size.width + gap;
    
    // Position randomly in upper area
    const minY = this.canvasHeight * 0.2;
    const maxY = this.canvasHeight * 0.6;
    const nextY = minY + Math.random() * (maxY - minY);

    const newPlatform = new FloatingPlatform(nextX, nextY, this.canvasHeight, this.blockSize);
    newPlatform.setHeightInBlocks(this.heightInBlocks); // Inherit height
    newPlatform.size.width = width;
    return newPlatform;
  }

  render(ctx, cameraX) {
    ctx.fillStyle = '#4169E1'; // Royal blue
    ctx.fillRect(this.pos.x - cameraX, this.pos.y, this.size.width, this.size.height);
    
    // Draw wave pattern
    ctx.strokeStyle = '#191970'; // Midnight blue
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x < this.size.width; x += 10) {
      const waveY = this.pos.y + 5 + Math.sin(x/5) * 3;
      if (x === 0) {
        ctx.moveTo(this.pos.x - cameraX + x, waveY);
      } else {
        ctx.lineTo(this.pos.x - cameraX + x, waveY);
      }
    }
    ctx.stroke();
    
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.strokeRect(this.pos.x - cameraX, this.pos.y, this.size.width, this.size.height);
  }
}