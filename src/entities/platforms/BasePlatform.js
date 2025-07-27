// entities/platforms/BasePlatform.js
import { Platform } from './Platform.js';

export class BasePlatform extends Platform {
  constructor(x, y, width, height, subtype = 'default') {
    super(x, y, width, height, 'base');
    this.subtype = subtype;
  }

  static canSpawnAt(x, y) {
    return true; // always allowed
  }

  static generate(x, y, width, height) {
    return new BasePlatform(x, y, width, height);
  }

  onPlayerCollide(player) {
    // Default base behavior
    player.velocityY = 0;
    player.grounded = true;
    player.jumpCount = 0;
  }
}
