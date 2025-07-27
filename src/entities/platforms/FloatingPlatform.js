// entities/platforms/FloatingPlatform.js
import { Platform } from './Platform.js';

export class FloatingPlatform extends Platform {
  constructor(x, y, width, height, subtype = 'default') {
    super(x, y, width, height, 'floating');
    this.subtype = subtype;
  }

  static canSpawnAt(x, y) {
    return y >= 150 && y <= 400; // enforce vertical range
  }

  static generate(x, y, width) {
    return new FloatingPlatform(x, y, width, 20);
  }

  onPlayerCollide(player) {
    // floating platform behavior
    player.velocityY = 0;
    player.grounded = true;
  }
}