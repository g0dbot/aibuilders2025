import { Player } from '../entities/Player.js';
import { LevelManager } from './LevelManager.js';
import { GreenFlyEnemy } from '../entities/GreenFlyEnemy.js';

export class Game {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.cameraX = 0;
    this.scrollSpeed = 0; // 0 for player-centered, >0 for auto-scroll

    // Position player at 1/3 from left of canvas
    this.player = new Player(canvas.width / 3, canvas.height - 300);

    // Temporarily null until images load
    this.levelManager = null;

    this.lastTimestamp = 0;
    this.isAutoScroll = false;
  }

  update(delta) {
    if (!this.levelManager) return;

    this.player.update(delta, this);

    if (this.isAutoScroll) {
      this.cameraX += this.scrollSpeed;
    } else {
      this.cameraX = this.player.pos.x - (this.canvas.width / 3);
    }

    this.levelManager.update(delta, this.cameraX);
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

  async start() {
    // Base images for backgrounds
    const images = {
      bg_green_l1: new Image(),
      bg_green_l2: new Image(),
      bg_green_l3: new Image(),
      bg_green_l4: new Image(),
      bg_green_l5: new Image(),

      bg_blue_l1: new Image(),
      // bg_blue_l2: new Image(),
      bg_blue_l3: new Image(),
      bg_blue_l4: new Image(),
      bg_blue_l5: new Image(),

      enemy_greenFly: new Image(),
      // Add other enemy sprites here when needed
    };

    // Set image sources
    images.bg_green_l1.src = './src/assets/background/green/g_layer-1.png';
    images.bg_green_l2.src = './src/assets/background/green/g_layer-2.png';
    images.bg_green_l3.src = './src/assets/background/green/g_layer-3.png';
    images.bg_green_l4.src = './src/assets/background/green/g_layer-4.png';
    images.bg_green_l5.src = './src/assets/background/green/g_layer-5.png';

    images.bg_blue_l1.src = './src/assets/background/blue/b_layer-1.png';
    // images.bg_blue_l2.src = './src/assets/background/blue/g_layer-2.png';
    images.bg_blue_l3.src = './src/assets/background/blue/b_layer-3.png';
    images.bg_blue_l4.src = './src/assets/background/blue/b_layer-4.png';
    images.bg_blue_l5.src = './src/assets/background/blue/b_layer-5.png';

    images.enemy_greenFly.src = './src/assets/enemies/enemy1.png';

    // Wait for all images to load before starting
    await Promise.all(Object.values(images).map(img => new Promise(res => {
      if (img.complete) return res();
      img.onload = res;
    })));

    this.levelManager = new LevelManager(this, images);

    // Set enemy factories per scene here, example for scene 0 (green flyer)
    this.levelManager.setEnemyFactory(0, (x, y) => new GreenFlyEnemy(x, y, images.enemy_greenFly));

    requestAnimationFrame(this.loop);
  }
}
