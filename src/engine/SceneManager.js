import { ParallaxScene } from '../engine/ParallaxScene.js';
import { ParallaxLayer } from '../engine/ParallaxLayer.js';

export class SceneManager {
  constructor() {
    this.parallax = null;
    this.platforms = null;
    this.currentSceneIndex = 0;
  }

  createScenes(images) {
    const scene1 = new ParallaxScene([
      new ParallaxLayer(images.bg_green_l1, 1),
      new ParallaxLayer(images.bg_green_l2, 1),
      new ParallaxLayer(images.bg_green_l3, 2),
      new ParallaxLayer(images.bg_green_l4, 1),
      new ParallaxLayer(images.bg_green_l5, 5),
    ]);
    scene1.startX = 0;
    scene1.endX = 1200;

    const scene2 = new ParallaxScene([
      new ParallaxLayer(images.bg_blue_l1, 1),
      //new ParallaxLayer(images.bg_blue_l2, 1),
      new ParallaxLayer(images.bg_blue_l3, 2),
      new ParallaxLayer(images.bg_blue_l4, 1),
      new ParallaxLayer(images.bg_blue_l5, 5),
    ]);
    scene2.startX = 1200;
    scene2.endX = 2400;

    return [scene1, scene2];
  }

  setup(parallaxManager, platformManager) {
    this.parallax = parallaxManager;
    this.platforms = platformManager;
  }

  configurePlatforms() {
    this.platforms.configureGlobalPlatforms([
      { type: 'floating', height: 0.5 }
    ]);

    this.platforms.configureScenePlatforms(0, [
      { type: 'floating', height: 0.7, y: 150, sceneCondition: (i) => i === 0 },
      { type: 'floating', height: 1.0, y: 300, sceneCondition: (i) => i === 0 }
    ]);

    this.platforms.configureScenePlatforms(1, [
      { type: 'floating', height: 0.3, y: 100, sceneCondition: (i) => i === 1 },
      { type: 'floating', height: 0.8, y: 250, sceneCondition: (i) => i === 1 }
    ]);
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

  extendPlatformsIfNeeded(cameraX, screenWidth) {
    this.platforms.extendPlatformsIfNeeded(cameraX, screenWidth, this.currentSceneIndex);
  }

  handleCollisions(player) {
    this.platforms.handlePlatformCollisions(player);
  }
}
