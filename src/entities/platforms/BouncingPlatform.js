import { FloatingPlatform } from './FloatingPlatform.js';

export class BouncingPlatform extends FloatingPlatform {
  constructor(x, y, canvasHeight, blockSize = 32) {
    super(x, y, canvasHeight, blockSize);

    this.bounceVelocity = -20;  // stronger upward velocity for bounce
  }

  // Override handleCollision to add bounce effect
  handleCollision(player) {
    const playerBottom = player.pos.y + player.size.height;
    const playerNextBottom = playerBottom + player.velocityY;
    const platformTop = this.pos.y;
    const playerRight = player.pos.x + player.size.width;
    const playerLeft = player.pos.x;
    const platformLeft = this.pos.x;
    const platformRight = this.pos.x + this.size.width;

    const isFallingOrStandingStill = player.velocityY >= 0;
    const horizontallyAligned = playerRight > platformLeft && playerLeft < platformRight;
    const willLandOnPlatform = playerBottom <= platformTop && playerNextBottom >= platformTop;

    if (isFallingOrStandingStill && horizontallyAligned && willLandOnPlatform) {
      // Snap player exactly on top
      player.pos.y = platformTop - player.size.height;

      // Bounce player up with bounce velocity
      player.velocityY = this.bounceVelocity;

      // Player is in air after bounce
      player.grounded = false;

      // Reset jump count so player can jump again after bounce
      player.jumpCount = 0;

      // Change player state (optional)
      if (player.state.current !== 'attacking') {
        player.state.setState('jumping');
      }
    }
  }


  render(ctx, cameraX) {
    super.render(ctx, cameraX);

    // Thicker glowing green line at top
    ctx.strokeStyle = 'limegreen';
    ctx.lineWidth = 4;
    ctx.shadowColor = 'limegreen';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.moveTo(this.pos.x - cameraX, this.pos.y + 1);
    ctx.lineTo(this.pos.x - cameraX + this.size.width, this.pos.y + 1);
    ctx.stroke();

    // Reset shadow to avoid affecting others
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
  }
}
