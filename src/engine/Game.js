import { Renderer } from './Renderer.js';
import { Player } from '../entities/Player.js';
import { Platform } from '../entities/Platform.js';
import { LevelManager } from './LevelManager.js';

export class Game {
  constructor(canvas) {
    this.ctx = canvas.getContext('2d');
    this.canvas = canvas;
    this.renderer = new Renderer(this.ctx);
    

    this.scrollSpeed = 1;
    this.maxScrollSpeed = 4;
    this.scrollAccel = 0.0005;

    this.entities = [];
    this.player = new Player(100, 300);
    this.entities.push(this.player);

    this.levelManager = new LevelManager(this.entities, canvas.width, canvas.height);

    // Initial platforms
    this.entities.push(new Platform(50, 400, 300, 20));
    this.entities.push(new Platform(400, 350, 150, 20));
    //this.entities.push(new Platform(0, this.levelManager.basePlatformY, this.canvasWidth, 40));
  }

  start() {
    this.lastTime = performance.now();
    requestAnimationFrame(this.loop.bind(this));
  }

  loop(currentTime) {
    const delta = currentTime - this.lastTime;
    this.lastTime = currentTime;

    this.update(delta);
    this.render();

    requestAnimationFrame(this.loop.bind(this));
  }

  update(delta) {
    this.scrollSpeed = Math.min(this.scrollSpeed + this.scrollAccel * delta, this.maxScrollSpeed);

    for (let entity of this.entities) {
      if (entity !== this.player) {
        entity.pos.x -= this.scrollSpeed;
      }
      entity.update?.(delta);
    }

    this.levelManager.update(this.scrollSpeed);
    this.checkPlayerPlatformCollision();

    // Always apply scroll to player (remove grounded check)
    this.player.pos.x -= this.scrollSpeed;
  }


  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.renderer.render(this.entities);
  }

  checkPlayerPlatformCollision() {
    const player = this.player;
    const playerBottom = player.pos.y + player.size.height;

    player.grounded = false;

    for (let entity of this.entities) {
      if (!(entity instanceof Platform)) continue;

      const horizontallyAligned =
        player.pos.x + player.size.width > entity.pos.x &&
        player.pos.x < entity.pos.x + entity.size.width;

      if (!horizontallyAligned) continue;

      const platformTop = entity.pos.y;

      // Check if player is overlapping the platform from above
      if (playerBottom >= platformTop && player.pos.y <= platformTop) {
        player.pos.y = platformTop - player.size.height;
        player.velocityY = 0;
        player.grounded = true;
        player.jumpCount = 0;

        if (player.state.current !== 'attacking' && (player.keys['ArrowLeft'] || player.keys['ArrowRight'])) {
          player.state.setState('running');
        } else if (player.state.current !== 'attacking') {
          player.state.setState('idle');
        }
      }
    }
  }


}
