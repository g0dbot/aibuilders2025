import { BasePlatform } from '../entities/platforms/BasePlatform.js';
import { BouncyPlatform } from '../entities/platforms/BouncyPlatform.js';
import { FloatingPlatform } from '../entities/platforms/FloatingPlatform.js';

export class LevelManager {
  constructor(entities, canvasWidth, canvasHeight) {
    this.entities = entities;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;

    this.platformSpacing = 200;
    this.lastPlatformX = canvasWidth;

    // Base platform configuration
    this.basePlatformY = this.canvasHeight * 0.75;
    this.segmentWidth = 200;
    this.gapWidth = 100;

    // Floating platform configuration
    this.platformMinY = this.basePlatformY - 250;
    this.platformMaxY = this.basePlatformY - 50;
    this.platformWidthRange = [100, 250];

    // Platform type definitions
    this.platformTypes = [BasePlatform, BouncyPlatform];
    this.floatingTypes = [FloatingPlatform];

    this.spawnBaseSegments();
  }

  update(scrollSpeed) {
    this.generateBaseSegments(scrollSpeed);
    this.generateFloatingPlatforms();
    this.cleanPlatforms();
  }

  spawnBaseSegments() {
    let x = 0;
    while (x < this.canvasWidth * 2) {
      const width = this.random(this.platformWidthRange[0], this.platformWidthRange[1]);
      const gap = this.random(60, 140);

      const platform = this.spawnPlatformFromTypes(this.platformTypes, x, this.basePlatformY, width, this.canvasHeight - this.basePlatformY);
      if (platform) this.entities.push(platform);

      x += width + gap;
    }
  }

  generateBaseSegments(scrollSpeed) {
    const basePlatforms = this.entities
      .filter(e => e.type === 'base')
      .sort((a, b) => b.pos.x - a.pos.x);

    if (basePlatforms.length === 0) return;

    const last = basePlatforms[0];
    const rightEdge = last.pos.x + last.size.width;

    if (rightEdge < this.canvasWidth + 200) {
      const width = this.random(this.platformWidthRange[0], this.platformWidthRange[1]);
      const gap = this.random(60, 140);

      const platform = this.spawnPlatformFromTypes(
        this.platformTypes,
        rightEdge + gap,
        this.basePlatformY,
        width,
        this.canvasHeight - this.basePlatformY
      );
      if (platform) this.entities.push(platform);
    }
  }

  generateFloatingPlatforms() {
    const rightEdge = this.getFarthestPlatformX();

    while (this.lastPlatformX < rightEdge + 400) {
      const width = this.random(this.platformWidthRange[0], this.platformWidthRange[1]);
      const y = this.random(this.platformMinY, this.platformMaxY);

      const platform = this.spawnPlatformFromTypes(this.floatingTypes, this.lastPlatformX, y, width, 20);
      if (platform && platform.pos.y + platform.size.height <= this.basePlatformY - 10) {
        this.entities.push(platform);
      }

      this.lastPlatformX += width + this.platformSpacing;
    }
  }

  spawnPlatformFromTypes(types, x, y, width, height) {
    for (let Type of types) {
      if (Type.canSpawnAt?.(x, y)) {
        return Type.generate(x, y, width, height);
      }
    }
    return null;
  }

  cleanPlatforms() {
    for (let i = this.entities.length - 1; i >= 0; i--) {
      const e = this.entities[i];
      if (e.pos.x + e.size.width < -100) {
        this.entities.splice(i, 1);
      }
    }
  }

  getFarthestPlatformX() {
    let farthest = 0;
    for (let e of this.entities) {
      if (e.pos && e.size) {
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
