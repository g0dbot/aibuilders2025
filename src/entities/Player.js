import { Entity } from './Entity.js';
import { PlayerState } from '../states/PlayerState.js';

export class Player extends Entity {
  constructor(x, y) {
    super(x, y, 40, 40);

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

    window.addEventListener('keydown', e => {
      this.keys[e.code] = true;

      if (e.code === 'Space') {
        this.jump();
      }

      if (e.code === 'KeyF') {
        this.attack();
      }
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
      if (this.grounded) {
        this.state.setState('idle');
      } else {
        this.state.setState('jumping');
      }
    }, 200);
  }

  update(delta) {
    if (!this.grounded) {
      this.velocityY += this.gravity;
    } else {
      this.velocityY = 0;
    }

    this.pos.y += this.velocityY;

    if (this.keys['ArrowLeft']) {
      this.pos.x -= this.speed;
      this.direction = 'left';
    } else if (this.keys['ArrowRight']) {
      this.pos.x += this.speed;
      this.direction = 'right';
    }

    if (this.pos.x < 0) this.pos.x = 0;
    if (this.pos.x + this.size.width > 800) this.pos.x = 800 - this.size.width;
  }

  render(ctx) {
    ctx.fillStyle = this.state.getColor();
    ctx.fillRect(this.pos.x, this.pos.y, this.size.width, this.size.height);

    ctx.fillStyle = this.direction === 'right' ? 'white' : 'black';
    ctx.fillRect(
      this.direction === 'right' ? this.pos.x + this.size.width : this.pos.x - 5,
      this.pos.y + this.size.height / 2 - 5,
      5,
      10
    );
  }
}
