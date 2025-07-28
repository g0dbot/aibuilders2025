// File: src/managers/LevelManager.js
import { ParallaxManager } from './ParallaxManager.js';
import { PlatformManager } from './PlatformManager.js';
import { SceneManager } from './SceneManager.js';
import { Coin } from '../entities/Coin.js';
import { Enemy } from '../entities/Enemy.js';

export class LevelManager {
  constructor(game, images, sfx, music) {
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
    this.sfx = sfx;
    this.music = music;
    this.currentMusicIndex = null;

    // --- Modified to store arrays of factories ---
    // Stores Map<sceneIndex, Array<factoryFn>>
    this.sceneEnemyFactories = new Map();
    // --- End of modification ---

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

  // --- Modified setEnemyFactory to support multiple factories ---
  setEnemyFactory(sceneIndex, factoryFn, spawnInterval = 3000) {
    // Check if we already have factories for this scene
    if (!this.sceneEnemyFactories.has(sceneIndex)) {
      // If not, initialize the array for this scene and set the interval/timer
      this.sceneEnemyFactories.set(sceneIndex, []); // Initialize array
      this.spawnIntervals.set(sceneIndex, spawnInterval); // Set interval (first call's value used)
      this.spawnTimers.set(sceneIndex, 0); // Initialize timer
    }
    // Push the new factory function to the array for this scene
    this.sceneEnemyFactories.get(sceneIndex).push(factoryFn);
    // Note: spawnInterval is set only on the FIRST call for a scene index.
    // You might want to refine this if you need per-enemy-type interval control.
  }
  // --- End of modification ---
  switchSceneMusic(index) {
      if (this.currentMusicIndex === index) return;

      // Stop old music
      if (this.music[this.currentMusicIndex]) {
        this.music[this.currentMusicIndex].pause();
        this.music[this.currentMusicIndex].currentTime = 0;
      }

      // Play new music
      if (this.music[index]) {
        this.music[index].play();
        this.currentMusicIndex = index;
      }
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
    // --- Call the modified spawning handler ---
    this.handleEnemySpawning(delta, cameraX);
    // --- End of change ---
    this.platformManager.updatePlatforms(player);
    this.platformManager.handlePlatformCollisions(player);

    // Update coins and handle collection
    for (let i = this.coins.length - 1; i >= 0; i--) {
      const coin = this.coins[i];
      coin.update();
      if (coin.collect(player)) {
        this.coins.splice(i, 1);
        this.score++;
        //playSound('./assets/sfx/coin.mp3'); // Add sound if needed
        this.sfx.coin.currentTime = 0;
        this.sfx.coin.play();
      }
    }

    // --- Player-Enemy Collision Detection ---
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

    const newSceneIndex = this.sceneManager.getCurrentSceneIndex();
    
    if (newSceneIndex !== this.currentSceneIndex && !this.sceneManager.isTransitioning()) {
      this.currentSceneIndex = newSceneIndex;
      this.sceneManager.handleSceneSwitch(this.currentSceneIndex);
      this.switchSceneMusic(newSceneIndex); // <--- ADD THIS
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
    //ctx.fillText(`Score: ${this.score}`, 10, 60);
  }

  drawDistanceInfo(ctx) {
    // ctx.fillStyle = 'white';
    // ctx.font = '14px Arial';
    // ctx.fillText(`Distance: ${Math.floor(this.totalDistance)}`, 10, 20);
    // ctx.fillText(`Scene: ${this.currentSceneIndex + 1}/${this.sceneManager.getSceneCount()}`, 10, 40);

    // === Custom HUD ===
    const scoreText = `Score: ${this.score}`;
    const distanceText = `Distance: ${Math.floor(this.totalDistance)}`;
    const sceneText = `Scene: ${this.currentSceneIndex + 1}/${this.sceneManager.getSceneCount()}`;

    const x = 20;
    let y = 30;

    ctx.font = 'bold 18px "Lucida Console", Monaco, monospace';
    ctx.textBaseline = 'top';
    ctx.shadowColor = '#ffea00'; // Bright yellow glow
    ctx.shadowBlur = 10;
    ctx.lineJoin = 'round';

    const drawGlowingText = (text, x, y) => {
      ctx.fillStyle = 'black'; // Base fill
      ctx.strokeStyle = '#ffea00'; // Yellow outline
      ctx.lineWidth = 2.5;

      ctx.strokeText(text, x, y); // Glow outline
      ctx.fillText(text, x, y);   // Solid core text
    };

    // Draw each line with spacing
    drawGlowingText(scoreText, x, y);
    drawGlowingText(distanceText, x, y + 24);
    drawGlowingText(sceneText, x, y + 48);

    // Optional: reset shadow after drawing
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';
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

  // --- Modified handleEnemySpawning for multiple random enemies ---
  handleEnemySpawning(delta, cameraX) {
    const sceneIndex = this.currentSceneIndex;
    // Get the ARRAY of factories for the current scene
    const factories = this.sceneEnemyFactories.get(sceneIndex);

    // Check if there are any factories for this scene
    if (!factories || factories.length === 0) return;

    // Update spawn timer for the scene
    const lastSpawn = this.spawnTimers.get(sceneIndex) ?? 0;
    // Gets interval set when the first factory was added for this scene
    const interval = this.spawnIntervals.get(sceneIndex) ?? 3000;
    this.spawnTimers.set(sceneIndex, lastSpawn + delta);

    // Check if it's time to spawn based on the interval
    if (this.spawnTimers.get(sceneIndex) < interval) return;

    // Reset timer
    this.spawnTimers.set(sceneIndex, 0);

    // Limit max enemies on screen
    if (this.enemies.length >= 5) return;

    // --- Randomize Monster Spawn Generation ---
    // Randomly pick one factory from the available ones for this scene
    const randomFactoryIndex = Math.floor(Math.random() * factories.length);
    const selectedFactory = factories[randomFactoryIndex];
    // --- End of randomization ---

    // Choose random x near the right edge offscreen + small random offset
    const spawnX = cameraX + this.game.canvas.width + Math.random() * 200;
    // Spawn Y: random within reasonable vertical range (adjust as needed)
    const spawnY = 100 + Math.random() * (this.game.canvas.height - 200);

    // Create enemy using the SELECTED factory and add it
    const enemy = selectedFactory(spawnX, spawnY);
    this.enemies.push(enemy);
  }
  // --- End of modification ---

  spawnEnemiesNearNewPlatforms() {
    // Optional alternative spawn method if you want spawn tied strictly to new platforms
    // Not used if you prefer handleEnemySpawning instead
    const cameraRightEdge = this.game.cameraX + this.canvasWidth;
    // --- This part would also need updating if you use this method ---
    // Get factories array
    const factories = this.sceneEnemyFactories.get(this.currentSceneIndex);
    if (!factories || factories.length === 0) return; // Check array instead of single factory
    // Randomly select a factory
    const randomFactoryIndex = Math.floor(Math.random() * factories.length);
    const factory = factories[randomFactoryIndex]; // Use selected factory
    // --- End of potential update ---
    const candidatePlatforms = this.platformManager.platforms.filter(p =>
      p.pos.x > cameraRightEdge && p.pos.x < cameraRightEdge + 400
    );

    for (const platform of candidatePlatforms) {
      const exists = this.enemies.some(e => Math.abs(e.pos.x - platform.pos.x) < 50);
      if (exists) continue;
      // Use the selected factory
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