export class SceneManager {
  constructor(parallaxManager, platformManager) {
    this.parallax = parallaxManager;
    this.platforms = platformManager;
    this.currentSceneIndex = 0;
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
