// File: GreenFlyEnemy.js
import { Enemy } from './Enemy.js';

export class BlueFlyEnemy extends Enemy {
  constructor(x, y, sprite, scaleRatio = 0.2) {
    // Add totalFrames = 4, frameSpeed = 6 (adjust based on your sprite)
    super(x, y, sprite, 218, 177, scaleRatio, 1, 4, 6); 

    this.baseX = x;
    this.t = Math.random() * 100;
    this.floatSpeed = 0.05 + Math.random() * 0.03;
    this.floatAmplitude = 30 + Math.random() * 10;
    this.riseSpeed = -0.5 - Math.random();
  }

  update(player) {
    super.update(player); // Now includes animation

    this.t += this.floatSpeed;
    this.pos.x = this.baseX + Math.sin(this.t) * this.floatAmplitude;
    this.pos.y += this.riseSpeed;

    if (this.pos.y + this.size.height < 0) {
      this.markedForRemoval = true;
    }
  }
}
