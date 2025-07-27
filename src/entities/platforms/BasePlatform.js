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

  // Draw two-color block texture
  drawTwoColorTexture(ctx, x, y, width, height) {
    // Create gradient from dark top to light bottom
    const gradient = ctx.createLinearGradient(x, y, x, y + height);
    gradient.addColorStop(0, this.colors.dark);   // Darker at top
    gradient.addColorStop(1, this.colors.light);  // Lighter at bottom
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, width, height);
    
    // Draw subtle block separation lines
    ctx.strokeStyle = this.colors.dark;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.4;
    
    // Vertical block lines
    const blockSize = this.blockSize;
    for (let i = 0; i < width; i += blockSize) {
      ctx.beginPath();
      ctx.moveTo(x + i, y);
      ctx.lineTo(x + i, y + height);
      ctx.stroke();
    }
    
    // Horizontal block lines (subtle)
    for (let i = 0; i < height; i += blockSize) {
      ctx.beginPath();
      ctx.moveTo(x, y + i);
      ctx.lineTo(x + width, y + i);
      ctx.stroke();
    }
    
    // Reset drawing state
    ctx.globalAlpha = 1.0;
  }

  render(ctx, cameraX) {
    // Draw the two-color gradient texture
    this.drawTwoColorTexture(ctx, this.pos.x - cameraX, this.pos.y, this.size.width, this.size.height);
    
    // Subtle border to define platform edges
    // ctx.strokeStyle = this.colors.dark;
    // ctx.lineWidth = 1;
    // ctx.strokeRect(this.pos.x - cameraX, this.pos.y, this.size.width, this.size.height);
  }
}