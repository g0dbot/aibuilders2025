import { Platform } from './Platform.js';

export class FloatingPlatform extends Platform {
  constructor(x, y, canvasHeight, blockSize = 32) {
    super(x, y, 160, 32); // Default size
    
    this.canvasHeight = canvasHeight;
    this.setBlockSize(blockSize);
    this.setHeightInBlocks(2); // Half-block height
    
    // Position at specified Y (not bottom)
    this.pos.y = y;
    
    // Floating platform configurations
    this.minGapBlocks = 2;
    this.maxGapBlocks = 3;
    this.minWidthBlocks = 3;
    this.maxWidthBlocks = 8;
  }

  createNextPlatform(lastX, lastY) {
    // Calculate gap and width as before
    const gap = this.getRandomGap(this.minGapBlocks, this.maxGapBlocks);
    const width = this.getRandomWidth(this.minWidthBlocks, this.maxWidthBlocks);
    const nextX = lastX + this.size.width + gap;

    // Define min and max Y allowed overall (scene limits)
    const minY = this.canvasHeight * 0.2;
    const maxY = this.canvasHeight * 0.6;

    // Define max vertical difference allowed from last platform's Y
    const maxHeightDiff = 50; // adjust this value as needed (in pixels)

    // Pick a random Y near lastY but clamp within minY/maxY and height difference constraints
    let nextY = lastY + (Math.random() * 2 - 1) * maxHeightDiff; // random shift up/down

    // Clamp nextY within the scene's min/max bounds
    nextY = Math.min(Math.max(nextY, minY), maxY);

    // Create new FloatingPlatform instance
    const newPlatform = new FloatingPlatform(nextX, nextY, this.canvasHeight, this.blockSize);
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
