import { Entity } from './Entity.js';

export class Enemy extends Entity {
  constructor(
    x,
    y,
    spriteSheet,
    originalFrameWidth,
    originalFrameHeight,
    scaleRatio = 1,
    frameGap = 0,
    totalFrames = 1,
    frameSpeed = 6
  ) {
    const width = originalFrameWidth * scaleRatio;
    const height = originalFrameHeight * scaleRatio;
    super(x, y, width, height);

    this.spriteSheet = spriteSheet;
    this.originalFrameWidth = originalFrameWidth;
    this.originalFrameHeight = originalFrameHeight;
    this.scaleRatio = scaleRatio;
    this.frameGap = frameGap;

    // Animation state
    this.totalFrames = totalFrames;
    this.frameSpeed = frameSpeed;     // How many updates before advancing frame
    this.currentFrame = 0;
    this.frameCounter = 0;

    this.markedForRemoval = false;
  }

  update(player) {
    this.frameCounter++;
    if (this.frameCounter >= this.frameSpeed) {
      this.currentFrame = (this.currentFrame + 1) % this.totalFrames;
      this.frameCounter = 0;
    }
  }

  render(ctx, cameraX) {
    if (!this.spriteSheet) {
      ctx.fillStyle = 'red';
      ctx.fillRect(this.pos.x - cameraX, this.pos.y, this.size.width, this.size.height);
      return;
    }

    // Calculate source rectangle for current frame
    const sx = this.currentFrame * (this.originalFrameWidth + this.frameGap);
    const sy = 0;
    const sWidth = this.originalFrameWidth;
    const sHeight = this.originalFrameHeight;

    const dx = this.pos.x - cameraX;
    const dy = this.pos.y;
    const dWidth = this.originalFrameWidth * this.scaleRatio;
    const dHeight = this.originalFrameHeight * this.scaleRatio;

    ctx.drawImage(
      this.spriteSheet,
      sx, sy, sWidth, sHeight,
      dx, dy, dWidth, dHeight
    );

    // Hitbox (optional)
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    ctx.strokeRect(dx, dy, this.size.width, this.size.height);
  }

  hitsPlayer(player) {
    const collided =
      this.pos.x < player.pos.x + player.size.width &&
      this.pos.x + this.size.width > player.pos.x &&
      this.pos.y < player.pos.y + player.size.height &&
      this.pos.y + this.size.height > player.pos.y;

    if (collided) {
      console.log('Player collided with enemy!');
    }

    return collided;
  }

}
