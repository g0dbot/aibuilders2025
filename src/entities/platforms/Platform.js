import { Entity } from '../Entity.js';

export class Platform extends Entity {
  constructor(x, y, width = 100, height = 20) {
    super(x, y, width, height);
    this.type = 'base';
    this.blockSize = 32;
    this.heightInBlocks = 1;
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

  getRandomGap(minBlocks = 1, maxBlocks = 3) {
    const actualMin = Math.max(1, minBlocks);
    const gapBlocks = Math.floor(actualMin + Math.random() * (maxBlocks - actualMin + 1));
    return gapBlocks * this.blockSize;
  }

  getRandomWidth(minBlocks = 4, maxBlocks = 10) {
    const widthBlocks = Math.floor(minBlocks + Math.random() * (maxBlocks - minBlocks + 1));
    return widthBlocks * this.blockSize;
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

  render(ctx, cameraX) {
    ctx.fillStyle = 'gray';
    ctx.fillRect(this.pos.x - cameraX, this.pos.y, this.size.width, this.size.height);
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.strokeRect(this.pos.x - cameraX, this.pos.y, this.size.width, this.size.height);
  }
}