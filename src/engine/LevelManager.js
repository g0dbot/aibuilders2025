import { ParallaxManager } from '../engine/ParallaxManager.js';
import { PlatformManager } from './PlatformManager.js';
import { SceneManager } from './SceneManager.js';
import { Coin } from '../entities/Coin.js'; // import your Coin class

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

    this.coins = [];
    this.score = 0;

    this.minDistanceBetweenCoins = 40; // minimum horizontal distance between coins

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

  // Spawn coins only near platforms newly generated offscreen (right)
  spawnCoinsNearNewPlatforms() {
    const cameraRightEdge = this.game.cameraX + this.canvasWidth;

    // Platforms that just appeared offscreen ahead (+400px buffer)
    const candidatePlatforms = this.platformManager.platforms.filter(p => {
      return p.pos.x > cameraRightEdge && p.pos.x < cameraRightEdge + 400;
    });

    for (const platform of candidatePlatforms) {
      // Check if a coin already exists near this platform to avoid dense clustering
      const closeCoin = this.coins.find(c => Math.abs(c.pos.x - platform.pos.x) < this.minDistanceBetweenCoins);
      if (closeCoin) continue;

      // Calculate coin position: random X on platform, 50 pixels above
      const coinX = platform.pos.x + Math.random() * platform.size.width;
      const coinY = platform.pos.y - 50;

      // Ensure this coin is not too close to existing coins
      const tooCloseToOtherCoin = this.coins.some(c => Math.abs(c.pos.x - coinX) < this.minDistanceBetweenCoins);
      if (tooCloseToOtherCoin) continue;

      const newCoin = new Coin(coinX, coinY);
      this.coins.push(newCoin);
    }
  }

  update(delta, cameraX) {
    const deltaX = cameraX - (this.lastCameraX ?? cameraX);
    this.lastCameraX = cameraX;

    const playerSpeed = this.game.player.speed;
    this.sceneManager.update(deltaX, cameraX, playerSpeed, this.game.player.pos.x);
    this.updateDistanceTracking(this.game.player.pos.x);
    this.sceneManager.extendPlatformsIfNeeded(cameraX, this.canvasWidth);

    // Spawn coins near platforms just generated offscreen
    this.spawnCoinsNearNewPlatforms();

    // Update platforms
    this.platformManager.updatePlatforms(this.game.player);

    // Handle platform collisions
    this.platformManager.handlePlatformCollisions(this.game.player);

    // Update coins and check collisions with player
    for (let i = this.coins.length - 1; i >= 0; i--) {
      const coin = this.coins[i];
      coin.update();

      if (coin.collect(this.game.player)) {
        this.coins.splice(i, 1);
        this.score++;

        // TODO: Play coin collection sound here
        // Example: playSound('coin.wav');
      }
    }
  }

  render(ctx, cameraX) {
    this.sceneManager.render(ctx, cameraX);
    this.drawDistanceInfo(ctx);

    // Render coins
    for (const coin of this.coins) {
      coin.render(ctx, cameraX);
    }

    // Draw score on HUD
    ctx.fillStyle = 'yellow';
    ctx.font = '16px Arial';
    ctx.fillText(`Score: ${this.score}`, 10, 60);
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
    this.score = 0;
    this.coins = [];
    this.sceneManager.reset();
  }
}
