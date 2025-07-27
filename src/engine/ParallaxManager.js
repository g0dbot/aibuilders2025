export class ParallaxManager {
  constructor(scenes = []) {
    this.scenes = scenes;
    this.activeSceneIndex = 0;
    this.transitioning = false;
    this.transitionProgress = 0;
    this.transitionSpeed = 0.02;
  }

  getSceneCount() {
    return this.scenes.length;
  }

  getCurrentSceneIndex() {
    return this.activeSceneIndex;
  }

  isTransitioning() {
    return this.transitioning;
  }

  startTransitionTo(index) {
    if (index === this.activeSceneIndex || index < 0 || index >= this.scenes.length) return;
    this.nextSceneIndex = index;
    this.transitioning = true;
    this.transitionProgress = 0;
  }

  update(deltaX, cameraX) {
    if (this.transitioning) {
      this.transitionProgress += this.transitionSpeed;
      if (this.transitionProgress >= 1) {
        this.activeSceneIndex = this.nextSceneIndex;
        this.transitioning = false;
        this.transitionProgress = 0;
      }
    }
    this.scenes[this.activeSceneIndex].update(deltaX);
  }

  render(ctx, cameraX, canvasHeight) {
    const scene = this.scenes[this.activeSceneIndex];
    scene.render(ctx, cameraX, canvasHeight);
  }
}
