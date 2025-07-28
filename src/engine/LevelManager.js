import { ParallaxManager } from './ParallaxManager.js';
import { PlatformManager } from './PlatformManager.js';
import { SceneManager } from './SceneManager.js';
import { Coin } from '../entities/Coin.js';
import { Enemy } from '../entities/Enemy.js';

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
    this.minDistanceBetweenCoins = 40;

    this.enemies = [];
    this.sceneEnemyFactories = new Map();

    // Spawn control maps: track timers and intervals (ms) per scene
    this.spawnTimers = new Map();
    this.spawnIntervals = new Map();

    // Managers
    this.sceneManager = new SceneManager();
    const scenes = this.sceneManager.createScenes(images);
    this.parallaxManager = new ParallaxManager(scenes);
    this.platformManager = new PlatformManager(this.blockSize, this.canvasHeight);

    this.sceneManager.setup(this.parallaxManager, this.platformManager);
    this.sceneManager.configurePlatforms();
    this.platformManager.initializePlatforms(this.currentSceneIndex);
  }

  setEnemyFactory(sceneIndex, factoryFn, spawnInterval = 3000) {
    this.sceneEnemyFactories.set(sceneIndex, factoryFn);
    this.spawnIntervals.set(sceneIndex, spawnInterval);
    this.spawnTimers.set(sceneIndex, 0);
  }

  update(delta, cameraX) {
    const deltaX = cameraX - (this.lastCameraX ?? cameraX);
    this.lastCameraX = cameraX;

    const player = this.game.player;
    const playerSpeed = player.speed;

    this.sceneManager.update(deltaX, cameraX, playerSpeed, player.pos.x);
    this.updateDistanceTracking(player.pos.x);
    this.sceneManager.extendPlatformsIfNeeded(cameraX, this.canvasWidth);

    this.spawnCoinsNearNewPlatforms();
    this.handleEnemySpawning(delta, cameraX);

    this.platformManager.updatePlatforms(player);
    this.platformManager.handlePlatformCollisions(player);

    // Update coins and handle collection
    for (let i = this.coins.length - 1; i >= 0; i--) {
      const coin = this.coins[i];
      coin.update();
      if (coin.collect(player)) {
        this.coins.splice(i, 1);
        this.score++;
        // playSound('coin.wav'); // Add sound if needed
      }
    }
      // --- ADD THIS BLOCK: Player-Enemy Collision Detection ---
      // Check collision for each active enemy
      for (let i = 0; i < this.enemies.length; i++) {
        const enemy = this.enemies[i];

        // Ensure the enemy has the hitsPlayer method and the player is not already dead
        if (enemy.hitsPlayer && typeof enemy.hitsPlayer === 'function' && !player.dead) {
          // Use the existing hitsPlayer method for collision detection
          if (enemy.hitsPlayer(player)) {
            // Collision detected, trigger player death
            player.die();
            // Optional: Mark the enemy for removal if it should disappear on hit
            // enemy.markedForRemoval = true;
            // Break if you only want one collision check per frame (good if die() stops further interaction)
            // break;
          }
        }
      }

    // Update enemies
    for (const enemy of this.enemies) {
      enemy.update(player);
    }
    this.enemies = this.enemies.filter(e => !e.markedForRemoval);
  }

  render(ctx, cameraX) {
    this.sceneManager.render(ctx, cameraX);
    this.drawDistanceInfo(ctx);

    for (const coin of this.coins) {
      coin.render(ctx, cameraX);
    }

    for (const enemy of this.enemies) {
      enemy.render(ctx, cameraX);
    }

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

  spawnCoinsNearNewPlatforms() {
    const cameraRightEdge = this.game.cameraX + this.canvasWidth;

    const candidatePlatforms = this.platformManager.platforms.filter(p =>
      p.pos.x > cameraRightEdge && p.pos.x < cameraRightEdge + 400
    );

    for (const platform of candidatePlatforms) {
      const closeCoin = this.coins.find(c => Math.abs(c.pos.x - platform.pos.x) < this.minDistanceBetweenCoins);
      if (closeCoin) continue;

      const coinX = platform.pos.x + Math.random() * platform.size.width;
      const coinY = platform.pos.y - 50;

      const tooClose = this.coins.some(c => Math.abs(c.pos.x - coinX) < this.minDistanceBetweenCoins);
      if (tooClose) continue;

      const newCoin = new Coin(coinX, coinY);
      this.coins.push(newCoin);
    }
  }

  handleEnemySpawning(delta, cameraX) {
    const sceneIndex = this.currentSceneIndex;
    const factory = this.sceneEnemyFactories.get(sceneIndex);
    if (!factory) return;

    // Update spawn timer
    const lastSpawn = this.spawnTimers.get(sceneIndex) ?? 0;
    const interval = this.spawnIntervals.get(sceneIndex) ?? 3000;
    this.spawnTimers.set(sceneIndex, lastSpawn + delta);

    if (this.spawnTimers.get(sceneIndex) < interval) return;

    // Reset timer
    this.spawnTimers.set(sceneIndex, 0);

    // Limit max enemies on screen
    if (this.enemies.length >= 5) return;

    // Choose random x near the right edge offscreen + small random offset
    const spawnX = cameraX + this.game.canvas.width + Math.random() * 200;

    // Spawn Y: random within reasonable vertical range (adjust as needed)
    const spawnY = 100 + Math.random() * (this.game.canvas.height - 200);

    // Create enemy and add
    const enemy = factory(spawnX, spawnY);
    this.enemies.push(enemy);
  }

  spawnEnemiesNearNewPlatforms() {
    // Optional alternative spawn method if you want spawn tied strictly to new platforms
    // Not used if you prefer handleEnemySpawning instead

    const cameraRightEdge = this.game.cameraX + this.canvasWidth;
    const factory = this.sceneEnemyFactories.get(this.currentSceneIndex);
    if (!factory) return;

    const candidatePlatforms = this.platformManager.platforms.filter(p =>
      p.pos.x > cameraRightEdge && p.pos.x < cameraRightEdge + 400
    );

    for (const platform of candidatePlatforms) {
      const exists = this.enemies.some(e => Math.abs(e.pos.x - platform.pos.x) < 50);
      if (exists) continue;

      const enemy = factory(platform.pos.x + platform.size.width / 2 - 16, platform.pos.y - 32);
      this.enemies.push(enemy);
    }
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
    this.enemies = [];
    this.sceneManager.reset();
  }
}
