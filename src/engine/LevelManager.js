import { ParallaxManager } from '../engine/ParallaxManager.js';
import { PlatformManager } from './PlatformManager.js';
import { SceneManager } from './SceneManager.js';

export class LevelManager {
  constructor(game, images) {
    this.game = game;
    this.canvasWidth = game.canvas.width;
    this.canvasHeight = game.canvas.height;
    this.blockSize = 32;

    this.totalDistance = 0;
    this.maxPlayerX = 0;
    this.sceneChangeDistance = 2400;
    this.currentSceneIndex = 0;

    // Setup SceneManager
    this.sceneManager = new SceneManager();
    const scenes = this.sceneManager.createScenes(images);
    const parallaxManager = new ParallaxManager(scenes);
    const platformManager = new PlatformManager(this.blockSize, this.canvasHeight);

    this.sceneManager.setup(parallaxManager, platformManager);
    this.sceneManager.configurePlatforms();

    this.parallaxManager = parallaxManager;
    this.platformManager = platformManager;

    this.platformManager.initializePlatforms(this.currentSceneIndex);
  }

  updateDistanceTracking(playerX) {
    if (playerX > this.maxPlayerX) {
      const distanceMoved = playerX - this.maxPlayerX;
      this.totalDistance += distanceMoved;
      this.maxPlayerX = playerX;
    }

    const scenesPassed = Math.floor(this.totalDistance / this.sceneChangeDistance);
    const newSceneIndex = scenesPassed % this.sceneManager.getSceneCount();

    if (newSceneIndex !== this.currentSceneIndex && !this.sceneManager.isTransitioning()) {
      this.currentSceneIndex = newSceneIndex;
      this.sceneManager.handleSceneSwitch(this.currentSceneIndex);
      console.log(`Auto-switching to scene ${this.currentSceneIndex}. Total distance: ${Math.floor(this.totalDistance)}`);
    }
  }

  update(delta, cameraX) {
    const deltaX = cameraX - (this.lastCameraX ?? cameraX);
    this.lastCameraX = cameraX;

    const playerSpeed = this.game.player.speed;
    this.sceneManager.update(deltaX, cameraX, playerSpeed, this.game.player.pos.x);
    this.updateDistanceTracking(this.game.player.pos.x);
    this.sceneManager.extendPlatformsIfNeeded(cameraX, this.canvasWidth);
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
    ctx.fillText(`Scene: ${this.currentSceneIndex + 1}/${this.sceneManager.getSceneCount()}`, 10, 40);
  }

  switchEnvironment(index) {
    if (index >= 0 && index < this.sceneManager.getSceneCount() && !this.sceneManager.isTransitioning()) {
      this.currentSceneIndex = index;
      this.sceneManager.handleSceneSwitch(index);
    }
  }

  getTotalDistance() {
    return this.totalDistance;
  }

  getCurrentSceneIndex() {
    return this.currentSceneIndex;
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
    this.currentSceneIndex = 0;
    this.sceneManager.reset();
  }
}
