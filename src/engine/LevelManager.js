import { Platform } from '../entities/Platform.js';

export class LevelManager {
  constructor(entities, canvasWidth, canvasHeight) {
    this.entities = entities;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;

    this.platformSpacing = 200;
    this.lastPlatformX = canvasWidth;

    // Base platform configuration
    this.basePlatformY = this.canvasHeight * 0.75; // 25% from bottom
    this.segmentWidth = 200; // Added segment width
    this.gapWidth = 100; // Added gap width

    // Floating platform configuration
    this.platformMinY = this.basePlatformY - 250; // Highest point
    this.platformMaxY = this.basePlatformY - 50; 
    this.platformWidthRange = [100, 250];

    // Initial platform setup
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
      const gap = this.random(60, 140); // minGap = 60, maxGap = 140

      this.entities.push(new Platform(
        x,
        this.basePlatformY,
        width,
        this.canvasHeight - this.basePlatformY, // height from base up to bottom
        'base'
      ));

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

      this.entities.push(new Platform(
        rightEdge + gap,
        this.basePlatformY,
        width,
        this.canvasHeight - this.basePlatformY,
        'base'
      ));
    }
  }


  generateFloatingPlatforms() {
  const rightEdge = this.getFarthestPlatformX();

  while (this.lastPlatformX < rightEdge + 400) {
    const width = this.random(
      this.platformWidthRange[0],
      this.platformWidthRange[1]
    );

    const safeMaxY = Math.min(
      this.platformMaxY,
      this.basePlatformY - 30 // ensures no overlap with base
    );

    const y = this.random(this.platformMinY, safeMaxY);

    const newPlatform = new Platform(
      this.lastPlatformX,
      y,
      width,
      20,
      'floating'
    );

    if (newPlatform.pos.y + newPlatform.size.height <= this.basePlatformY - 10) {
      this.entities.push(newPlatform);
    }

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
