import { Player } from '../entities/Player.js';
import { LevelManager } from './LevelManager.js';

export class Game {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.cameraX = 0;
    this.scrollSpeed = 0; // 0 for player-centered, >0 for auto-scroll

    // Position player at 1/3 from left of canvas
    this.player = new Player(canvas.width / 3, canvas.height - 150);

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

  start() {
    const images = {
      bg1_far: new Image(),
      bg1_mid: new Image(),
      bg1_near: new Image(),
      bg2_far: new Image(),
      bg2_mid: new Image(),
      bg2_near: new Image(),
      bg2_front: new Image()
    };

    images.bg1_far.src = './src/assets/background/layer-1.png';
    images.bg1_mid.src = './src/assets/background/layer-2.png';
    images.bg1_near.src = './src/assets/background/layer-3.png';
    images.bg2_far.src = './src/assets/background/layer-4.png';
    images.bg2_mid.src = './src/assets/background/layer-5.png';
    images.bg2_near.src = './src/assets/background/layer-4.png';
    images.bg2_front.src = './src/assets/background/layer-5.png';

    Promise.all(Object.values(images).map(img => new Promise(res => img.onload = res)))
      .then(() => {
        this.levelManager = new LevelManager(this, images);
        requestAnimationFrame(this.loop);
      });
  }
}
