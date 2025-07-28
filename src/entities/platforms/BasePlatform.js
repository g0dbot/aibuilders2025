import { Platform } from './Platform.js';

export class BasePlatform extends Platform {
  constructor(x, canvasHeight, blockSize = 32) {
    super(x, 0, 320, 32);
    
    this.canvasHeight = canvasHeight;
    this.setBlockSize(blockSize);
    this.setHeightInBlocks(2);
    
    this.minGapBlocks = 1;
    this.maxGapBlocks = 10;
    this.minWidthBlocks = 20;
    this.maxWidthBlocks = 30;
    
    // Two-color palette
    this.colors = {
      dark: '#020202',  // Darker top
      light: '#1B1B1B'  // Lighter bottom
    };
    
    this.positionAtBottom(canvasHeight);
  }

  setBlockSize(size) {
    super.setBlockSize(size);
    this.positionAtBottom(this.canvasHeight);
    return this;
  }

  setHeightInBlocks(blocks) {
    super.setHeightInBlocks(blocks);
    this.positionAtBottom(this.canvasHeight);
    return this;
  }

  getRandomGap() {
    return super.getRandomGap(this.minGapBlocks, this.maxGapBlocks);
  }

  getRandomWidth() {
    return super.getRandomWidth(this.minWidthBlocks, this.maxWidthBlocks);
  }

  createNextPlatform(lastX) {
    const gap = this.getRandomGap();
    const width = this.getRandomWidth();
    const nextX = lastX + gap;

    const newPlatform = new BasePlatform(nextX, this.canvasHeight, this.blockSize);
    newPlatform.setHeightInBlocks(this.heightInBlocks);
    newPlatform.size.width = width;
    return newPlatform;
  } 

  render(ctx, cameraX) {
    // Draw base gradient and grid lines from parent
    super.render(ctx, cameraX);

    // Glowing white line at the top
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.shadowColor = 'white';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(this.pos.x - cameraX, this.pos.y + 1);
    ctx.lineTo(this.pos.x - cameraX + this.size.width, this.pos.y + 1);
    ctx.stroke();

    // Reset shadow for other drawings
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;

    // Draw wave pattern
    ctx.strokeStyle = '#191970'; // Midnight blue
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let x = 0; x < this.size.width; x += 10) {
      const waveY = this.pos.y + 5 + Math.sin(x / 5) * 3;
      if (x === 0) {
        ctx.moveTo(this.pos.x - cameraX + x, waveY);
      } else {
        ctx.lineTo(this.pos.x - cameraX + x, waveY);
      }
    }
    ctx.stroke();

    // Platform border
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.strokeRect(this.pos.x - cameraX, this.pos.y, this.size.width, this.size.height);
  }
}