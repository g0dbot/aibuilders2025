// entities/platforms/BouncyPlatform.js
import { BasePlatform } from './BasePlatform.js';

export class BouncyPlatform extends BasePlatform {
  constructor(x, y, width, height) {
    super(x, y, width, height, 'bouncy');
  }

  static canSpawnAt(x, y) {
    return true; // always allowed
  }

  static generate(x, y, width, height) {
    return new BasePlatform(x, y, width, height);
  }
  
  onPlayerCollide(player) {
    player.velocityY = -15; // bounce effect
    player.jumpCount = 0;
  }
}
