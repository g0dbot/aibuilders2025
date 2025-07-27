// src/engine/SceneManager.js
import { ParallaxManager } from './ParallaxManager.js';
import { ParallaxScene } from './ParallaxScene.js';
import { ParallaxLayer } from './ParallaxLayer.js';
import { PlatformManager } from './PlatformManager.js';

export class SceneManager {
  constructor(images, blockSize, canvasHeight, canvasWidth) {
    this.canvasWidth = canvasWidth;

    const predefinedSpeeds = [0.1, 0.25, 0.4, 0.55, 0.7]; // fixed speeds for layers 1–5

    // Scene 1
    const scene1Layers = [
      new ParallaxLayer(images.bg1_layer1, predefinedSpeeds[0]),
      new ParallaxLayer(images.bg1_layer2, predefinedSpeeds[1]),
      new ParallaxLayer(images.bg1_layer3, predefinedSpeeds[2]),
      new ParallaxLayer(images.bg1_layer4, predefinedSpeeds[3]),
      new ParallaxLayer(images.bg1_layer5, predefinedSpeeds[4])
    ];
    const scene1Effect = new ParallaxLayer(images.rainEffect, 0); // Optional weather effect
    const scene1 = new ParallaxScene(scene1Layers, scene1Effect);
    scene1.startX = 0;
    scene1.endX = 1000;

    // Scene 2
    const scene2Layers = [
      new ParallaxLayer(images.bg2_layer1, predefinedSpeeds[0]),
      new ParallaxLayer(images.bg2_layer2, predefinedSpeeds[1]),
      new ParallaxLayer(images.bg2_layer3, predefinedSpeeds[2]),
      new ParallaxLayer(images.bg2_layer4, predefinedSpeeds[3]),
      new ParallaxLayer(images.bg2_layer5, predefinedSpeeds[4])
    ];
    const scene2Effect = new ParallaxLayer(images.snowEffect, 0); // Optional weather effect
    const scene2 = new ParallaxScene(scene2Layers, scene2Effect);
    scene2.startX = 1000;
    scene2.endX = 2000;

    this.parallax = new ParallaxManager([scene1, scene2]);
    this.platforms = new PlatformManager(blockSize, canvasHeight);
    this.currentSceneIndex = 0;

    // Platform config
    this.platforms.configureGlobalPlatforms([
      { type: 'floating', height: 0.5 }
    ]);

    this.platforms.configureScenePlatforms(0, [
      { type: 'floating', height: 0.7, y: 150, sceneCondition: idx => idx === 0 },
      { type: 'floating', height: 1.0, y: 300, sceneCondition: idx => idx === 0 }
    ]);

    this.platforms.configureScenePlatforms(1, [
      { type: 'floating', height: 0.3, y: 100, sceneCondition: idx => idx === 1 },
      { type: 'floating', height: 0.8, y: 250, sceneCondition: idx => idx === 1 }
    ]);

    this.platforms.initializePlatforms(0);
  }

  update(deltaX, cameraX, playerSpeed, playerX) {
    this.parallax.update(deltaX, cameraX, playerSpeed);
  }

  render(ctx, cameraX) {
    this.parallax.render(ctx, cameraX);
    this.platforms.renderPlatforms(ctx, cameraX);
  }

  handleSceneSwitch(newIndex) {
    if (newIndex !== this.currentSceneIndex && !this.parallax.isTransitioning()) {
      this.currentSceneIndex = newIndex;
      this.parallax.switchTo(newIndex);
      this.platforms.onSceneChange(newIndex);
    }
  }

  getCurrentSceneIndex() {
    return this.currentSceneIndex;
  }

  getSceneCount() {
    return this.parallax.getSceneCount();
  }

  isTransitioning() {
    return this.parallax.isTransitioning();
  }

  getPlatforms() {
    return this.platforms.getPlatforms();
  }

  reset() {
    this.currentSceneIndex = 0;
    this.parallax.switchTo(0);
    this.platforms.reset();
  }

  extendPlatformsIfNeeded(cameraX) {
    this.platforms.extendPlatformsIfNeeded(cameraX, this.canvasWidth, this.currentSceneIndex);
  }

  handleCollisions(player) {
    this.platforms.handlePlatformCollisions(player);
  }
}
