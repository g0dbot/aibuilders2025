import { Entity } from '../Entity.js';

export class Platform extends Entity {
  constructor(x, y, width = 100, height = 20, options = {}) {
    super(x, y, width, height);
    this.type = 'base';
    this.blockSize = 32;
    this.heightInBlocks = 1;

    // New properties for controlling gaps and height difference
    this.minGapBlocks = options.minGapBlocks ?? 1;
    this.maxGapBlocks = options.maxGapBlocks ?? 3;
    this.minWidthBlocks = options.minWidthBlocks ?? 4;
    this.maxWidthBlocks = options.maxWidthBlocks ?? 10;

    this.minY = options.minY ?? 0;
    this.maxY = options.maxY ?? 600;  // example default max Y (can be changed)
    this.maxHeightDiff = options.maxHeightDiff ?? 50; // max vertical difference allowed
  }

  setBlockSize(size) {
    this.blockSize = size;
    this.size.height = this.heightInBlocks * size;
    return this;
  }

  setHeightInBlocks(blocks) {
    this.heightInBlocks = blocks;
    this.size.height = blocks * this.blockSize;
    return this;
  }

  positionAtBottom(canvasHeight) {
    this.pos.y = canvasHeight - this.size.height;
    return this;
  }

  getRandomGap(minBlocks = this.minGapBlocks, maxBlocks = this.maxGapBlocks) {
    const actualMin = Math.max(1, minBlocks);
    const gapBlocks = Math.floor(actualMin + Math.random() * (maxBlocks - actualMin + 1));
    return gapBlocks * this.blockSize;
  }

  getRandomWidth(minBlocks = this.minWidthBlocks, maxBlocks = this.maxWidthBlocks) {
    const widthBlocks = Math.floor(minBlocks + Math.random() * (maxBlocks - minBlocks + 1));
    return widthBlocks * this.blockSize;
  }

  // New method: createNextPlatform with height difference limit
  createNextPlatform(lastX, lastY) {
    const gap = this.getRandomGap();
    const width = this.getRandomWidth();
    const nextX = lastX + this.size.width + gap;

    // Calculate random Y within minY-maxY
    let candidateY = this.minY + Math.random() * (this.maxY - this.minY);

    // Clamp vertical difference based on lastY
    if (lastY !== undefined) {
      if (candidateY > lastY + this.maxHeightDiff) candidateY = lastY + this.maxHeightDiff;
      if (candidateY < lastY - this.maxHeightDiff) candidateY = lastY - this.maxHeightDiff;
    }

    // Create new platform (same class) with updated x, y, width
    const newPlatform = new this.constructor(nextX, candidateY, width, this.size.height, {
      minGapBlocks: this.minGapBlocks,
      maxGapBlocks: this.maxGapBlocks,
      minWidthBlocks: this.minWidthBlocks,
      maxWidthBlocks: this.maxWidthBlocks,
      minY: this.minY,
      maxY: this.maxY,
      maxHeightDiff: this.maxHeightDiff,
      blockSize: this.blockSize,
      heightInBlocks: this.heightInBlocks,
    });

    return newPlatform;
  }

  handleCollision(player) {
    const playerBottom = player.pos.y + player.size.height;
    const playerTop = player.pos.y;
    const playerRight = player.pos.x + player.size.width;
    const playerLeft = player.pos.x;

    const platformTop = this.pos.y;
    const platformBottom = this.pos.y + this.size.height;
    const platformLeft = this.pos.x;
    const platformRight = this.pos.x + this.size.width;

    // Improved collision detection
    const isFalling = player.velocityY >= 0;
    const wasAbove = playerBottom - player.velocityY <= platformTop;
    const horizontallyAligned = playerRight > platformLeft && playerLeft < platformRight;

    // More precise vertical collision check
    const willLandOnPlatform = playerBottom <= platformTop &&
                              playerBottom + player.velocityY >= platformTop;

    if (isFalling && (wasAbove || willLandOnPlatform) && horizontallyAligned) {
      // Additional safety check to prevent falling through
      if (Math.abs(playerBottom - platformTop) < player.velocityY + 5) {
        player.pos.y = platformTop - player.size.height;
        player.velocityY = 0;
        player.grounded = true;
        player.jumpCount = 0;

        if (player.state.current !== 'attacking') {
          player.state.setState(
            player.keys['ArrowLeft'] || player.keys['ArrowRight'] ? 'running' : 'idle'
          );
        }
      }
    }
  }
  drawBaseGradient(ctx, x, y, width, height) {
    const dark = '#020202';
    const light = '#1B1B1B';

    const gradient = ctx.createLinearGradient(x, y, x, y + height);
    gradient.addColorStop(0, dark);
    gradient.addColorStop(1, light);
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, width, height);

    // Draw subtle block separation lines
    ctx.strokeStyle = dark;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.4;

    const blockSize = this.blockSize || 32;
    for (let i = 0; i < width; i += blockSize) {
      ctx.beginPath();
      ctx.moveTo(x + i, y);
      ctx.lineTo(x + i, y + height);
      ctx.stroke();
    }

    for (let i = 0; i < height; i += blockSize) {
      ctx.beginPath();
      ctx.moveTo(x, y + i);
      ctx.lineTo(x + width, y + i);
      ctx.stroke();
    }

    ctx.globalAlpha = 1.0;
  }

  render(ctx, cameraX) {
    // Default render uses the base gradient
    this.drawBaseGradient(ctx, this.pos.x - cameraX, this.pos.y, this.size.width, this.size.height);

    // Optionally, subclasses can add extra renderings here

    // Uncomment below if you want a border for all platforms by default
    // ctx.strokeStyle = 'black';
    // ctx.lineWidth = 2;
    // ctx.strokeRect(this.pos.x - cameraX, this.pos.y, this.size.width, this.size.height);
  }
}
