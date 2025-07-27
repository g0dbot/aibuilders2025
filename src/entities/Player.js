import { Entity } from './Entity.js';
import { PlayerState } from '../states/PlayerState.js';

export class Player extends Entity {
  constructor(x, y) {
    super(x, y, 32, 64);

    this.speed = 5;
    this.direction = 'right';
    this.velocityY = 0;
    this.gravity = 0.6;
    this.jumpForce = -13;
    this.jumpCount = 0;
    this.maxJumps = 2;
    this.grounded = false;

    this.state = new PlayerState('idle');
    this.keys = {};

    this.setupControls();
  }

  setupControls() {
    window.addEventListener('keydown', e => {
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
      this.state.setState('jumping');
    }
  }

  attack() {
    this.state.setState('attacking');
    setTimeout(() => {
      this.state.setState(this.grounded ? 'idle' : 'jumping');
    }, 200);
  }

  update(delta, game) {
    // Reset grounded state each frame
    this.grounded = false;

    // Horizontal movement
    if (this.keys['ArrowLeft']) {
      this.pos.x -= this.speed;
      this.direction = 'left';
    }
    if (this.keys['ArrowRight']) {
      this.pos.x += this.speed;
      this.direction = 'right';
    }

    // Apply gravity with max fall speed
    this.velocityY += this.gravity;
    const maxFallSpeed = 20;
    if (this.velocityY > maxFallSpeed) {
      this.velocityY = maxFallSpeed;
    }
    
    this.pos.y += this.velocityY;

    // Boundary constraints
    if (this.pos.x < 0) this.pos.x = 0;
    
    // Safety net at bottom
    if (this.pos.y > game.canvas.height) {
      this.pos.y = game.canvas.height - this.size.height;
      this.velocityY = 0;
      this.grounded = true;
      this.jumpCount = 0;
    }
  }

  render(ctx, cameraX) {
    ctx.fillStyle = this.state.getColor();
    ctx.fillRect(this.pos.x - cameraX, this.pos.y, this.size.width, this.size.height);
    
    ctx.fillStyle = this.direction === 'right' ? 'white' : 'black';
    ctx.fillRect(
      this.direction === 'right' ? 
        this.pos.x - cameraX + this.size.width : 
        this.pos.x - cameraX - 5,
      this.pos.y + this.size.height / 2 - 5,
      5,
      10
    );
  }
}