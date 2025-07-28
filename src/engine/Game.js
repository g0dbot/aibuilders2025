// File: src/core/Game.js
import { Player } from '../entities/Player.js';
import { LevelManager } from './LevelManager.js';
import { GreenFlyEnemy } from '../entities/GreenFlyEnemy.js';
import { BlueFlyEnemy } from '../entities/BlueFlyEnemy.js';

export class Game {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.cameraX = 0;
    this.scrollSpeed = 0;
    this.player = new Player(canvas.width / 3, canvas.height - 300);
    this.levelManager = null;
    this.lastTimestamp = 0;
    this.isAutoScroll = false;
    this.images = null; // Store images for potential use
    this.sfx = null;    // Store sfx for potential use
    this.music = null;  // Store music
    this.audioInitialized = false; // Flag to track if audio context is unlocked
    this.isGameOver = false;
    this.isGameStarted = false;
    this.isCountdownActive = false;
  }

  update(delta) {
    //if (this.isGameOver || !this.levelManager || !this.isGameStarted || this.isCountdownActive) return;
    if (this.isGameOver || !this.levelManager) return;

    this.player.update(delta, this);

    if (this.isAutoScroll) {
      this.cameraX += this.scrollSpeed;
    } else {
      this.cameraX = this.player.pos.x - (this.canvas.width / 3);
    }

    this.levelManager.update(delta, this.cameraX);

    // Check death
    if (this.player.dead) {
      this.triggerGameOver();
    }
  }

  render() {
    if (!this.levelManager) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.levelManager.render(this.ctx, this.cameraX);
    this.player.render(this.ctx, this.cameraX);
  }

  loop = (timestamp) => {
    const delta = timestamp - this.lastTimestamp;
    this.lastTimestamp = timestamp;
    this.update(delta);
    this.render();
    requestAnimationFrame(this.loop);
  }

  // Function to initialize audio playback (requires user interaction)
  async initAudio() {
    if (this.audioInitialized || !this.music) return; // Already done or not ready

    console.log("Attempting to initialize audio...");
    try {
      // Attempt to play the *first* music track (scene 0) to unlock audio
      // The LevelManager will handle switching/playing the correct one
      const firstTrackKey = Object.keys(this.music)[0];
      if (this.music[firstTrackKey]) {
         // Mute briefly to comply with autoplay policies if needed (optional)
         // const originalVolume = this.music[firstTrackKey].volume;
         // this.music[firstTrackKey].volume = 0;
         await this.music[firstTrackKey].play();
         // this.music[firstTrackKey].pause(); // Pause immediately if you don't want it to start yet
         // this.music[firstTrackKey].currentTime = 0;
         // this.music[firstTrackKey].volume = originalVolume;
         console.log("Audio initialized successfully.");
      }
      this.audioInitialized = true;
      // Now that audio is initialized, tell the level manager to play the correct initial track
      if (this.levelManager) {
          this.levelManager.switchSceneMusic(this.levelManager.currentSceneIndex); // Play initial scene music
      }
    } catch (error) {
       console.warn("Audio play failed (likely due to autoplay policy):", error);
       // If the first attempt fails, we'll wait for the next interaction
       // You could add a visual prompt here asking the user to click
    }
  }

  async start() {
    const images = {
      bg_green_l1: new Image(),
      bg_green_l2: new Image(),
      bg_green_l3: new Image(),
      bg_green_l4: new Image(),
      bg_green_l5: new Image(),
      bg_blue_l1: new Image(),
      bg_blue_l3: new Image(),
      bg_blue_l4: new Image(),
      bg_blue_l5: new Image(),
      enemy_greenFly: new Image(),
      enemy_blueFly: new Image(),
    };

    // Set image sources
    images.bg_green_l1.src = './src/assets/background/green/g_layer-1.png';
    images.bg_green_l2.src = './src/assets/background/green/g_layer-2.png';
    images.bg_green_l3.src = './src/assets/background/green/g_layer-3.png';
    images.bg_green_l4.src = './src/assets/background/green/g_layer-4.png';
    images.bg_green_l5.src = './src/assets/background/green/g_layer-5.png';
    images.bg_blue_l1.src = './src/assets/background/blue/b_layer-1.png';
    images.bg_blue_l3.src = './src/assets/background/blue/b_layer-3.png';
    images.bg_blue_l4.src = './src/assets/background/blue/b_layer-4.png';
    images.bg_blue_l5.src = './src/assets/background/blue/b_layer-5.png';
    images.enemy_greenFly.src = './src/assets/enemies/enemy1.png';
    images.enemy_blueFly.src = './src/assets/enemies/enemy2.png';

    const sfx = {
      coin: new Audio('./src/assets/sfx/coin.mp3'),
    };

    const music = {
      0: new Audio('./src/assets/music/green.mp3'), // Scene 0 music
      1: new Audio('./src/assets/music/blue.mp3'),  // Scene 1 music (assuming different)
    };

    // Store references
    this.images = images;
    this.sfx = sfx;
    this.music = music;

    // Preload and configure SFX
    sfx.coin.load();
    sfx.coin.volume = 0.4;

    // Preload and configure Music
    for (const [key, track] of Object.entries(music)) {
      track.loop = true;
      track.volume = 0.5;
      track.preload = "auto";
      // Note: We remove the await for canplaythrough here because it might not be necessary
      // if we are just preloading. The initAudio function handles playing.
      // await new Promise(res => {
      //   track.addEventListener('canplaythrough', res, { once: true });
      // });
    }

    // Preload Images
    await Promise.all(Object.values(images).map(img => new Promise(res => {
      if (img.complete) return res();
      img.onload = res;
    })));

    // Create LevelManager *after* assets are loaded
    this.levelManager = new LevelManager(this, images, sfx, music);

    // Set Enemy Factories
    const desiredSpawnIntervalMs = 2000; // 2 seconds seems more reasonable than 200ms
    this.levelManager.setEnemyFactory(0, (x, y) => new GreenFlyEnemy(x, y, images.enemy_greenFly), desiredSpawnIntervalMs);
    this.levelManager.setEnemyFactory(0, (x, y) => new BlueFlyEnemy(x, y, images.enemy_blueFly), desiredSpawnIntervalMs);
    // Assuming you might want enemies in scene 1 too? Add factories for index 1 if needed.

    // Start the game loop
    requestAnimationFrame(this.loop);

    // --- Add Event Listener for User Interaction ---
    // Add it to the canvas or document
    const handleFirstInteraction = async () => {
      await this.initAudio();
      // Remove the event listener after the first successful interaction
      this.canvas.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction); // Also listen for key press
      console.log("First interaction handled, event listeners removed.");
    };

    this.canvas.addEventListener('click', handleFirstInteraction);
    document.addEventListener('keydown', handleFirstInteraction); // Covers spacebar, enter, etc.
    console.log("Added click/keydown listeners for audio initialization.");
  }
  
  triggerGameOver() {
    this.isGameOver = true;
    this.showGameOverPopup();
  }

  showGameOverPopup() {
    const popup = document.createElement('div');
    popup.id = 'game-over-popup';
    popup.style.position = 'absolute';
    popup.style.top = '50%';
    popup.style.left = '50%';
    popup.style.transform = 'translate(-50%, -50%)';
    popup.style.background = 'rgba(0,0,0,0.8)';
    popup.style.color = 'white';
    popup.style.padding = '30px';
    popup.style.borderRadius = '10px';
    popup.style.textAlign = 'center';
    popup.style.fontSize = '24px';
    popup.innerHTML = `
      <p>Game Over</p>
      <button id="restart-btn" style="padding:10px 20px; font-size:18px;">Restart</button>
    `;
    document.body.appendChild(popup);

    document.getElementById('restart-btn').addEventListener('click', () => this.restartGame());
  }

    restartGame() {
    this.levelManager.resetLevel();
    this.player.reset();
    this.isGameOver = false;

    const popup = document.getElementById('game-over-popup');
    if (popup) popup.remove();
  }
}