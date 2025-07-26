import { Platform } from '../entities/Platform.js';

export class LevelManager {
  constructor(entities, canvasWidth, canvasHeight) {
    this.entities = entities;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;

    this.platformSpacing = 200;
    this.lastPlatformX = canvasWidth;

    // Base platform height 25% from bottom
    this.basePlatformY = this.canvasHeight * 0.75;

    // Platforms can be anywhere between base and higher (to allow pitfalls)
    this.platformMinY = this.basePlatformY - 150; // max height above base
    this.platformMaxY = this.basePlatformY;

    this.platformWidthRange = [100, 250];
  }

  update(scrollSpeed) {
    this.generatePlatforms();
    this.cleanPlatforms();
  }

  generatePlatforms() {
    //console.log('[LevelManager] Generating platforms...');

    // Check distance to right side of screen
    const rightEdge = this.getFarthestPlatformX();

    // Only generate if there's space to fill ahead
    while (this.lastPlatformX < rightEdge + 400) {
      const width = this.random(this.platformWidthRange[0], this.platformWidthRange[1]);
      const y = this.random(this.platformMinY, this.platformMaxY);
      const newPlatform = new Platform(this.lastPlatformX, y, width, 20);
      this.entities.push(newPlatform);

      //console.log(`[LevelManager] New platform at x=${this.lastPlatformX}, width=${width}, y=${y}`);

      this.lastPlatformX += width + this.platformSpacing;
    }
  }

  cleanPlatforms() {
    for (let i = this.entities.length - 1; i >= 0; i--) {
      const e = this.entities[i];
      if (e instanceof Platform && e.pos.x + e.size.width < -100) {
        //console.log(`[LevelManager] Removing platform at x=${e.pos.x}`);
        this.entities.splice(i, 1);
      }
    }
  }

  getFarthestPlatformX() {
    let farthest = 0;
    for (let e of this.entities) {
      if (e instanceof Platform) {
        const right = e.pos.x + e.size.width;
        if (right > farthest) {
          farthest = right;
        }
      }
    }
    return farthest;
  }

  random(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  }
}
