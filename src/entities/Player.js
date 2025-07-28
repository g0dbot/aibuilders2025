import { Entity } from './Entity.js';
import { PlayerState } from '../states/PlayerState.js';

export class Player extends Entity {
  constructor(x, y) {
    super(x, y, 44, 64);
    this.speed = 5;
    this.direction = 'right';
    this.velocityY = 0;
    this.gravity = 0.6;
    this.jumpForce = -13;
    this.jumpCount = 0;
    this.maxJumps = 2;
    this.grounded = false;
    this.dead = false;
    this.state = new PlayerState('idle');
    this.keys = {};
    this.currentPlatform = null;

    this.normalSpeed = 5;
    this.slideSpeed = 0;
    this.slideAcceleration = 0.15;
    this.maxSlideSpeed = 10;

    this.setupControls();
    this.attackAnimationToggle = false;
    this.sprites = {};

    const states = [
      { key: 'idle', frameCount: 4, frameWidth: 32, frameHeight: 64, src: './src/assets/player/idle.png' },
      { key: 'running', frameCount: 6, frameWidth: 32, frameHeight: 64, src: './src/assets/player/running.png' },
      { key: 'jumping', frameCount: 8, frameWidth: 32, frameHeight: 64, src: './src/assets/player/jumping.png' },
      { key: 'doubleJump', frameCount: 8, frameWidth: 32, frameHeight: 64, src: './src/assets/player/jumping.png' },
      { key: 'attacking', frameCount: 4, frameWidth: 32, frameHeight: 64, src: './src/assets/player/atk.png' },
      { key: 'attack2', frameCount: 6, frameWidth: 32, frameHeight: 64, src: './src/assets/player/atk2.png' },
      { key: 'hurt', frameCount: 4, frameWidth: 32, frameHeight: 64, src: './src/assets/player/hurt.png' },
      { key: 'death', frameCount: 8, frameWidth: 64, frameHeight: 64, src: './src/assets/player/death.png' },
    ];

    states.forEach(({ key, frameCount, frameWidth, frameHeight, src }) => {
      const img = new Image();
      img.src = src;
      this.sprites[key] = {
        image: img,
        frameCount,
        frameWidth,
        frameHeight,
        frameIndex: 0,
        frameTimer: 0,
        frameDuration: 100,
      };
    });
  }

  spawnOnPlatform(platformY) {
    this.pos.y = platformY - this.size.height;
  }

  setupControls() {
    window.addEventListener('keydown', e => {
      if (this.dead) return;
      this.keys[e.code] = true;
      if (e.code === 'Space') this.jump();
      if (e.code === 'KeyF') this.attack();
    });
    window.addEventListener('keyup', e => {
      this.keys[e.code] = false;
    });
  }

  jump() {
    if (this.jumpCount < this.maxJumps) {
      this.velocityY = this.jumpForce;
      this.grounded = false;
      this.jumpCount++;
      if (this.jumpCount === 1) {
        this.state.setState('jumping');
      } else if (this.jumpCount === 2) {
        this.state.setState('doubleJump');
      }
      this.currentPlatform = null; // Leaving platform when jumping
    }
  }

  attack() {
    if (this.dead) return;
    if (this.state.current !== 'attacking') {
      this.state.setState('attacking');
      this.attackAnimationToggle = !this.attackAnimationToggle;
      const key = this.attackAnimationToggle ? 'attack2' : 'attacking';
      this.sprites[key].frameIndex = 0;
      this.sprites[key].frameTimer = 0;
    }
  }

  hurt() {
    if (this.dead) return;
    this.state.setState('hurt');
    setTimeout(() => {
      this.state.setState(this.grounded ? 'idle' : 'jumping');
    }, 400);
  }

  die() {
    this.state.setState('death');
    this.dead = true;
  }

  getCurrentSpriteKey() {
    if (this.state.current !== 'attacking') return this.state.getSpriteKey();
    return this.attackAnimationToggle ? 'attack2' : 'attacking';
  }

  update(delta, game) {
    if (this.dead) return;

    // Reset grounded and currentPlatform at start of frame.
    this.grounded = false;
    this.currentPlatform = null;

    // Horizontal movement
    if (this.keys['ArrowLeft']) {
      this.direction = 'left';
      this.pos.x -= this.normalSpeed;
      this.slideSpeed = 0;
    }
    if (this.keys['ArrowRight']) {
      this.direction = 'right';
      this.pos.x += this.normalSpeed;
      this.slideSpeed = 0;
    }

    // Gravity and vertical movement
    if (!this.grounded) {
      this.velocityY += this.gravity;
      const maxFallSpeed = 20;
      if (this.velocityY > maxFallSpeed) this.velocityY = maxFallSpeed;
    }

    this.pos.y += this.velocityY;

    // Floor collision
    if (this.pos.y > game.canvas.height) {
      this.pos.y = game.canvas.height - this.size.height;
      this.velocityY = 0;
      this.grounded = true;
      this.jumpCount = 0;
      this.currentPlatform = null;
    }

    if (this.pos.x < 0) this.pos.x = 0;

    // Slippery platform sliding logic
    if (this.currentPlatform && this.currentPlatform.isSlippery) {
      this.slideSpeed += this.slideAcceleration;
      if (this.slideSpeed > this.maxSlideSpeed) this.slideSpeed = this.maxSlideSpeed;
      if (this.direction === 'right') {
        this.pos.x += this.slideSpeed * delta * 0.01;
      } else if (this.direction === 'left') {
        this.pos.x -= this.slideSpeed * delta * 0.01;
      }
    } else {
      this.slideSpeed = 0;
    }

    // Animate sprites
    const spriteKey = this.getCurrentSpriteKey();
    if (spriteKey && this.sprites[spriteKey]) {
      const sprite = this.sprites[spriteKey];
      sprite.frameTimer += delta;
      if (sprite.frameTimer > sprite.frameDuration) {
        sprite.frameIndex++;
        sprite.frameTimer = 0;
        if (sprite.frameIndex >= sprite.frameCount) {
          sprite.frameIndex = 0;
          if (this.state.current === 'attacking') {
            this.state.setState(this.grounded ? 'idle' : 'jumping');
          }
        }
      }
    }
  }

  render(ctx, cameraX) {
    const spriteKey = this.getCurrentSpriteKey();
    if (spriteKey && this.sprites[spriteKey]) {
      const sprite = this.sprites[spriteKey];
      const sx = sprite.frameIndex * sprite.frameWidth;
      if (sprite.image.complete && sprite.image.naturalWidth !== 0) {
        ctx.save();
        const drawX = this.pos.x - cameraX - 8; // sprite adjustment
        const drawY = this.pos.y;
        if (this.direction === 'left') {
          ctx.translate(drawX + sprite.frameWidth * 2, drawY);
          ctx.scale(-1, 1);
          ctx.drawImage(
            sprite.image,
            sx, 0,
            sprite.frameWidth, sprite.frameHeight,
            0, 0,
            sprite.frameWidth * 2, sprite.frameHeight * 2
          );
        } else {
          ctx.drawImage(
            sprite.image,
            sx, 0,
            sprite.frameWidth, sprite.frameHeight,
            drawX, drawY,
            sprite.frameWidth * 2, sprite.frameHeight * 2
          );
        }
        ctx.restore();
      }
    } else {
      ctx.fillStyle = this.state.getColor();
      ctx.fillRect(this.pos.x - cameraX, this.pos.y, this.size.width, this.size.height);
    }

    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    ctx.strokeRect(this.pos.x - cameraX, this.pos.y, this.size.width, this.size.height);
  }
}
