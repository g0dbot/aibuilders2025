import { SceneManager } from '../engine/SceneManager.js';

export class LevelManager {
  constructor(game, images) {
    this.game = game;
    this.canvasWidth = game.canvas.width;
    this.canvasHeight = game.canvas.height;
    this.blockSize = 32;

    this.totalDistance = 0;
    this.maxPlayerX = 0;
    this.sceneChangeDistance = 3000;

    this.sceneManager = new SceneManager(images, this.blockSize, this.canvasHeight, this.canvasWidth);
  }

  updateDistanceTracking(playerX) {
    if (playerX > this.maxPlayerX) {
      this.totalDistance += playerX - this.maxPlayerX;
      this.maxPlayerX = playerX;
    }

    const scenesPassed = Math.floor(this.totalDistance / this.sceneChangeDistance);
    const newSceneIndex = scenesPassed % this.sceneManager.getSceneCount();

    this.sceneManager.handleSceneSwitch(newSceneIndex);
  }

  update(delta, cameraX) {
    const deltaX = cameraX - (this.lastCameraX ?? cameraX);
    this.lastCameraX = cameraX;

    const playerSpeed = this.game.player.speed;
    const playerX = this.game.player.pos.x;

    this.sceneManager.update(deltaX, cameraX, playerSpeed, playerX);
    this.updateDistanceTracking(playerX);
    this.sceneManager.extendPlatformsIfNeeded(cameraX);
    this.sceneManager.handleCollisions(this.game.player);
  }

  render(ctx, cameraX) {
    this.sceneManager.render(ctx, cameraX);
    this.drawDistanceInfo(ctx);
  }

  drawDistanceInfo(ctx) {
    ctx.fillStyle = 'white';
    ctx.font = '14px Arial';
    ctx.fillText(`Distance: ${Math.floor(this.totalDistance)}`, 10, 20);
    ctx.fillText(
      `Scene: ${this.sceneManager.getCurrentSceneIndex() + 1}/${this.sceneManager.getSceneCount()}`,
      10,
      40
    );
  }

  switchEnvironment(index) {
    if (
      index >= 0 &&
      index < this.sceneManager.getSceneCount() &&
      !this.sceneManager.isTransitioning()
    ) {
      this.sceneManager.handleSceneSwitch(index);
    }
  }

  getTotalDistance() {
    return this.totalDistance;
  }

  getCurrentSceneIndex() {
    return this.sceneManager.getCurrentSceneIndex();
  }

  setSceneChangeDistance(distance) {
    this.sceneChangeDistance = distance;
  }

  getPlatforms() {
    return this.sceneManager.getPlatforms();
  }

  resetLevel() {
    this.totalDistance = 0;
    this.maxPlayerX = 0;
    this.sceneManager.reset();
  }
}
