import { ParallaxScene } from './ParallaxScene.js';

export class ParallaxManager {
  constructor(scenes = [], playerOffsetX = 150) {
    this.scenes = scenes;
    this.activeSceneIndex = 0;
    this.nextSceneIndex = null;
    this.transitioning = false;
    this.transitionDirection = 0; // 1 forward, -1 backward
    this.transitionProgress = 0;
    this.playerOffsetX = playerOffsetX;
    this.lastPlayerX = 0;
  }

  get currentScene() {
    return this.scenes[this.activeSceneIndex];
  }

  getSceneCount() {
    return this.scenes.length;
  }

  switchTo(index) {
    if (index === this.activeSceneIndex || this.transitioning) return;
    if (index < 0 || index >= this.scenes.length) return;

    this.nextSceneIndex = index;
    this.transitioning = true;
    this.transitionProgress = 0;
    this.transitionDirection = index > this.activeSceneIndex ? 1 : -1;
  }

  update(deltaX, cameraX, playerSpeed = 10) {
    const playerX = cameraX + this.playerOffsetX;
    const movement = playerX - this.lastPlayerX;
    this.lastPlayerX = playerX;

    // Cap movement delta to player's speed times a small factor (e.g., 0.1)
    const maxTransitionSpeed = playerSpeed * 0.1;
    const cappedMovement = Math.max(-maxTransitionSpeed, Math.min(maxTransitionSpeed, movement));

    if (this.transitioning) {
      if ((cappedMovement > 0 && this.transitionDirection > 0) ||
          (cappedMovement < 0 && this.transitionDirection < 0)) {
        this.transitionProgress += Math.abs(cappedMovement) / 500;
        if (this.transitionProgress >= 1) {
          this.transitionProgress = 1;
          this.activeSceneIndex = this.nextSceneIndex;
          this.transitioning = false;
          this.transitionDirection = 0;
        }
      } else if ((cappedMovement < 0 && this.transitionDirection > 0) ||
                (cappedMovement > 0 && this.transitionDirection < 0)) {
        this.transitionProgress -= Math.abs(cappedMovement) / 500;
        if (this.transitionProgress <= 0) {
          this.transitionProgress = 0;
          this.transitioning = false;
          this.nextSceneIndex = null;
          this.transitionDirection = 0;
        }
      }

      this.scenes[this.activeSceneIndex].update(deltaX);
      if (this.nextSceneIndex !== null) {
        this.scenes[this.nextSceneIndex].update(deltaX);
      }
    } else {
      // Normal scene switching logic unchanged
      const currentScene = this.scenes[this.activeSceneIndex];
      const nextIndex = (this.activeSceneIndex + 1) % this.scenes.length;
      const prevIndex = (this.activeSceneIndex - 1 + this.scenes.length) % this.scenes.length;

      if (playerX > currentScene.endX) {
        this.nextSceneIndex = nextIndex;
        this.transitioning = true;
        this.transitionProgress = 0;
        this.transitionDirection = 1;
      } else if (playerX < currentScene.startX) {
        this.nextSceneIndex = prevIndex;
        this.transitioning = true;
        this.transitionProgress = 0;
        this.transitionDirection = -1;
      }

      this.scenes[this.activeSceneIndex].update(deltaX);
    }
  }

  render(ctx, cameraX) {
  const canvasWidth = ctx.canvas.width;

  if (!this.transitioning) {
    this.scenes[this.activeSceneIndex].render(ctx, cameraX);
    return;
  }

  const progress = this.transitionProgress;
  const dir = this.transitionDirection;

  // Calculate horizontal pixel offset for transition
  const offset = canvasWidth * progress * dir;

  // Adjust cameraX passed to scenes to sync their scroll smoothly

  // Current scene moves left/right by offset
  const currentSceneCameraX = cameraX - offset;

  // Next scene moves in from right/left by (canvasWidth - offset)
  const nextSceneCameraX = cameraX - offset + canvasWidth * dir;

  ctx.save();
  ctx.globalAlpha = 1 - progress;
  ctx.translate(-offset, 0);
  this.scenes[this.activeSceneIndex].render(ctx, currentSceneCameraX);
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = progress;
  ctx.translate(canvasWidth - offset, 0);
  this.scenes[this.nextSceneIndex].render(ctx, nextSceneCameraX);
  ctx.restore();

  ctx.globalAlpha = 1.0;
}

  isTransitioning() {
    return this.transitioning;
  }
}
