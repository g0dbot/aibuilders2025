// src/managers/LevelManager.js

import { ParallaxManager } from '../engine/ParallaxManager.js';
import { ParallaxScene } from '../engine/ParallaxScene.js';
import { ParallaxLayer } from '../engine/ParallaxLayer.js';
import { PlatformManager } from './PlatformManager.js';

export class LevelManager {
  constructor(game, images) {
    this.game = game;
    this.canvasWidth = game.canvas.width;
    this.canvasHeight = game.canvas.height;
    this.blockSize = 32;

    this.totalDistance = 0;
    this.maxPlayerX = 0;
    this.sceneChangeDistance = 3000;
    this.currentSceneIndex = 0;

    // Define scenes with layers
    const scene1 = new ParallaxScene([
      new ParallaxLayer(images.bg1_far, 0.2),
      new ParallaxLayer(images.bg1_mid, 0.4),
      new ParallaxLayer(images.bg1_near, 0.6),
    ]);
    scene1.startX = 0;
    scene1.endX = 1000;

    const scene2 = new ParallaxScene([
      new ParallaxLayer(images.bg2_far, 0.1),
      new ParallaxLayer(images.bg2_mid, 0.3),
      new ParallaxLayer(images.bg2_near, 0.5),
      new ParallaxLayer(images.bg2_front, 0.7),
    ]);
    scene2.startX = 1000;
    scene2.endX = 2000;

    this.parallaxManager = new ParallaxManager([scene1, scene2]);

    // Use PlatformManager
    this.platformManager = new PlatformManager(this.blockSize, this.canvasHeight);
    this.configurePlatformScenes();
    this.platformManager.initializePlatforms(this.currentSceneIndex);
  }

  configurePlatformScenes() {
    // Configure global platforms (appear in all scenes)
    this.platformManager.configureGlobalPlatforms([
      {
        type: 'floating',
        height: 0.5,
        // No sceneCondition means it appears everywhere
      }
    ]);

    // Configure scene-specific platforms
    this.platformManager.configureScenePlatforms(0, [
      {
        type: 'floating',
        height: 0.7,
        y: 150,
        sceneCondition: (sceneIndex) => sceneIndex === 0 // Only in scene 0
      },
      {
        type: 'floating',
        height: 1.0,
        y: 300,
        sceneCondition: (sceneIndex) => sceneIndex === 0 // Only in scene 0
      }
    ]);

    this.platformManager.configureScenePlatforms(1, [
      {
        type: 'floating',
        height: 0.3,
        y: 100,
        sceneCondition: (sceneIndex) => sceneIndex === 1 // Only in scene 1
      },
      {
        type: 'floating',
        height: 0.8,
        y: 250,
        sceneCondition: (sceneIndex) => sceneIndex === 1 // Only in scene 1
      }
    ]);
  }

  updateDistanceTracking(playerX) {
    if (playerX > this.maxPlayerX) {
      const distanceMoved = playerX - this.maxPlayerX;
      this.totalDistance += distanceMoved;
      this.maxPlayerX = playerX;
    }

    const scenesPassed = Math.floor(this.totalDistance / this.sceneChangeDistance);
    const newSceneIndex = scenesPassed % this.parallaxManager.getSceneCount();

    if (newSceneIndex !== this.currentSceneIndex && !this.parallaxManager.isTransitioning()) {
      this.currentSceneIndex = newSceneIndex;
      this.parallaxManager.switchTo(this.currentSceneIndex);
      this.platformManager.onSceneChange(this.currentSceneIndex);
      console.log(`Auto-switching to scene ${this.currentSceneIndex}. Total distance: ${Math.floor(this.totalDistance)}`);
    }
  }

  update(delta, cameraX) {
    const deltaX = cameraX - (this.lastCameraX ?? cameraX);
    this.lastCameraX = cameraX;

    const playerSpeed = this.game.player.speed;
    this.parallaxManager.update(deltaX, cameraX, playerSpeed);

    this.updateDistanceTracking(this.game.player.pos.x);

    // Delegate platform management to PlatformManager with current scene
    this.platformManager.extendPlatformsIfNeeded(cameraX, this.canvasWidth, this.currentSceneIndex);

    // Handle collisions
    this.platformManager.handlePlatformCollisions(this.game.player);
  }

  render(ctx, cameraX) {
    this.parallaxManager.render(ctx, cameraX);

    // Render platforms via PlatformManager
    this.platformManager.renderPlatforms(ctx, cameraX);

    this.drawDistanceInfo(ctx);
  }

  drawDistanceInfo(ctx) {
    ctx.fillStyle = 'white';
    ctx.font = '14px Arial';
    ctx.fillText(`Distance: ${Math.floor(this.totalDistance)}`, 10, 20);
    ctx.fillText(`Scene: ${this.currentSceneIndex + 1}/${this.parallaxManager.getSceneCount()}`, 10, 40);
  }

  switchEnvironment(index) {
    if (index >= 0 && index < this.parallaxManager.getSceneCount() && !this.parallaxManager.isTransitioning()) {
      this.currentSceneIndex = index;
      this.parallaxManager.switchTo(this.currentSceneIndex);
      this.platformManager.onSceneChange(this.currentSceneIndex);
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

  // Additional methods that might be useful
  getPlatforms() {
    return this.platformManager.getPlatforms();
  }

  resetLevel() {
    this.totalDistance = 0;
    this.maxPlayerX = 0;
    this.currentSceneIndex = 0;
    this.platformManager.reset();
    this.parallaxManager.switchTo(0);
  }
}