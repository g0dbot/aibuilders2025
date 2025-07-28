import { Platform } from './Platform.js';

export class FallingFloatingPlatform extends Platform {
  constructor(x, y, canvasHeight, blockSize = 32) {
    super(x, y, 160, 32);
    this.canvasHeight = canvasHeight;
    this.setBlockSize(blockSize);
    this.setHeightInBlocks(2);

    this.centerY = this.pos.y;
    this.oscillationAmplitude = 80;
    this.oscillationSpeed = 0.02;
    this.oscillationOffset = 0;

    this.minY = this.centerY - this.oscillationAmplitude;
    this.maxY = this.centerY + this.oscillationAmplitude;

    this.velocityY = 0;
    this.lastY = this.pos.y;
  }

  isPlayerOnTop(player) {
    const playerBottom = player.pos.y + player.size.height;
    const platformTop = this.pos.y;
    const playerRight = player.pos.x + player.size.width;
    const platformRight = this.pos.x + this.size.width;

    const verticalOverlap = playerBottom >= platformTop - 5 && playerBottom <= platformTop + 5;
    const horizontalOverlap = player.pos.x < platformRight && playerRight > this.pos.x;
    const fallingOntoPlatform = player.velocityY >= 0;

    return verticalOverlap && horizontalOverlap && fallingOntoPlatform;
  }

  update(player) {
    // 1. If player on top, move player by platform's previous velocity before platform moves
    if (this.isPlayerOnTop(player)) {
      player.pos.y += this.velocityY;

      // Snap player exactly on top
      player.pos.y = this.pos.y - player.size.height;

      player.velocityY = this.velocityY;
      player.grounded = true;

      // Set player's current platform to this
      player.currentPlatform = this;
    } else {
      // Player not on platform resets grounded and currentPlatform here or in player update
      if (player.currentPlatform === this) {
        player.currentPlatform = null;
        player.grounded = false;
      }
    }

    // 2. Update platform position (oscillation)
    this.oscillationOffset += this.oscillationSpeed;

    const newY = Math.max(
      this.minY,
      Math.min(
        this.maxY,
        this.centerY + Math.sin(this.oscillationOffset) * this.oscillationAmplitude
      )
    );

    this.pos.y = newY;

    // 3. Calculate velocity based on new position and last position
    this.velocityY = this.pos.y - this.lastY;
    this.lastY = this.pos.y;
  }

  handleCollision(player) {
    // Optional: no changes here
  }

  render(ctx, cameraX) {
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(this.pos.x - cameraX, this.pos.y, this.size.width, this.size.height);

    const lineThickness = 4;
    const glowIntensity = 0.7;
    const orangeGlowColor = `rgba(255, 165, 0, ${glowIntensity})`;

    ctx.fillStyle = orangeGlowColor;
    ctx.fillRect(this.pos.x - cameraX, this.pos.y, this.size.width, lineThickness);

    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.strokeRect(this.pos.x - cameraX, this.pos.y, this.size.width, this.size.height);
  }
}
