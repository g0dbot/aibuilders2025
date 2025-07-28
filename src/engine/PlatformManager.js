import { BasePlatform } from '../entities/platforms/BasePlatform.js';
// import { FloatingPlatform } from '../entities/platforms/FloatingPlatform.js'; // <-- commented out
import { BouncingPlatform } from '../entities/platforms/BouncingPlatform.js';
import { SlipperyFloatingPlatform } from '../entities/platforms/SlipperyFloatingPlatform.js';
import { FallingFloatingPlatform } from '../entities/platforms/FallingFloatingPlatform.js'; // <-- import kept

export class PlatformManager {
  constructor(blockSize, canvasHeight) {
    this.blockSize = blockSize;
    this.canvasHeight = canvasHeight;
    this.lastPlatformX = 0;
    this.platforms = [];

    this.scenePlatformConfigs = new Map();
    this.globalPlatformConfigs = [];

    // Weights for platform type spawn chances, excluding floating platform
    this.platformWeights = {
      base: 2,
      bouncing: 1,
      // floating: 1,  // commented out
      slippery: 1,
      falling: 1,
    };
  }

  configureScenePlatforms(sceneIndex, platformConfigs) {
    this.scenePlatformConfigs.set(sceneIndex, platformConfigs);
  }

  configureGlobalPlatforms(platformConfigs) {
    this.globalPlatformConfigs = platformConfigs;
  }

  setPlatformWeights(weights) {
    this.platformWeights = {
      base: weights.base || 1,
      bouncing: weights.bouncing || 1,
      floating: weights.floating || 0, // commented out
      slippery: weights.slippery || 1,
      // falling: weights.falling || 0,
    };
  }

  initializePlatforms(currentSceneIndex = 0) {
    this.platforms = [];
    this.lastPlatformX = 0;

    const firstBase = new BasePlatform(0, this.canvasHeight, this.blockSize);
    firstBase.setHeightInBlocks(2);
    this.platforms.push(firstBase);
    this.lastPlatformX = firstBase.pos.x + firstBase.size.width;

    this.extendPlatformsIfNeeded(this.lastPlatformX - 500, 1000, currentSceneIndex);
  }

  createPlatformByType(type, x, y, height) {
    switch (type) {
      case 'base': {
        const p = new BasePlatform(x, this.canvasHeight, this.blockSize);
        p.setHeightInBlocks(height || 2);
        return p;
      }
      case 'bouncing': {
        const p = new BouncingPlatform(x, y, this.canvasHeight, this.blockSize);
        p.setHeightInBlocks(height || 0.5);
        return p;
      }
      case 'floating': {  // commented out
        const p = new FloatingPlatform(x, y, this.canvasHeight, this.blockSize);
        p.setHeightInBlocks(height || 0.5);
        return p;
      }
      case 'slippery': {
        const p = new SlipperyFloatingPlatform(x, y, this.canvasHeight, this.blockSize);
        p.setHeightInBlocks(height || 0.5);
        return p;
      }
      // case 'falling': {
      //   const p = new FallingFloatingPlatform(x, y, this.canvasHeight, this.blockSize);
      //   p.setHeightInBlocks(height || 0.5);
      //   return p;
      // }
      default:
        return null;
    }
  }

  pickWeightedPlatformType() {
    const entries = Object.entries(this.platformWeights);
    const totalWeight = entries.reduce((sum, [, w]) => sum + w, 0);
    let rand = Math.random() * totalWeight;

    for (const [type, weight] of entries) {
      if (rand < weight) return type;
      rand -= weight;
    }
    return entries[0][0];
  }

  extendPlatformsIfNeeded(cameraX, screenWidth, currentSceneIndex) {
    const rightEdge = cameraX + screenWidth;

    while (this.lastPlatformX < rightEdge + 500) {
      const sceneConfigs = this.scenePlatformConfigs.get(currentSceneIndex) || [];
      const allConfigs = [...this.globalPlatformConfigs, ...sceneConfigs];

      const validConfigs = [];

      const configIterator = allConfigs[Symbol.iterator]();
      let next = configIterator.next();

      while (!next.done) {
        const config = next.value;
        if (!config.sceneCondition || config.sceneCondition(currentSceneIndex)) {
          validConfigs.push(config);
        }
        next = configIterator.next();
      }

      const chosenType = this.pickWeightedPlatformType();

      let chosenConfig = validConfigs.find(c => c.type === chosenType);
      if (!chosenConfig) {
        if (chosenType === 'base') {
          chosenConfig = {
            type: 'base',
            height: 2,
            y: this.canvasHeight,
          };
        } else if (chosenType === 'bouncing') {
          chosenConfig = { type: 'bouncing', height: 0.5, y: 250 };
        } else if (chosenType === 'falling') {
          chosenConfig = { type: 'falling', height: 0.5, y: 200 };
        } else {
          chosenConfig = { type: chosenType, height: 0.5, y: 200 };
        }
      }

      let newPlatform;

      if (chosenType === 'base') {
        const lastBase = [...this.platforms].reverse().find(p => p instanceof BasePlatform);
        if (lastBase) {
          newPlatform = lastBase.createNextPlatform(this.lastPlatformX);
          newPlatform.setHeightInBlocks(chosenConfig.height || 2);
        } else {
          newPlatform = this.createPlatformByType('base', this.lastPlatformX, this.canvasHeight, chosenConfig.height);
        }
      } else {
        newPlatform = this.createPlatformByType(
          chosenConfig.type,
          this.lastPlatformX + 100,
          chosenConfig.y || 200,
          chosenConfig.height || 0.5
        );
      }

      if (newPlatform) {
        this.platforms.push(newPlatform);
        this.lastPlatformX = newPlatform.pos.x + newPlatform.size.width;
      } else {
        const lastBase = [...this.platforms].reverse().find(p => p instanceof BasePlatform);
        if (lastBase) {
          const newBase = lastBase.createNextPlatform(this.lastPlatformX);
          newBase.setHeightInBlocks(2);
          this.platforms.push(newBase);
          this.lastPlatformX = newBase.pos.x + newBase.size.width;
        }
      }
    }
  }

  handlePlatformCollisions(player) {
    for (const platform of this.platforms) {
      if (typeof platform.update === 'function') {
        platform.update(player);
      }
      platform.handleCollision(player);
    }

    this.platforms = this.platforms.filter(p => !p.markedForRemoval);
  }

  renderPlatforms(ctx, cameraX) {
    for (const platform of this.platforms) {
      platform.render(ctx, cameraX);
    }
  }

  getPlatforms() {
    return this.platforms;
  }

  getLastPlatformX() {
    return this.lastPlatformX;
  }

  setLastPlatformX(x) {
    this.lastPlatformX = x;
  }

  reset() {
    this.initializePlatforms();
  }

  addPlatform(platform) {
    this.platforms.push(platform);
    if (platform.pos.x + platform.size.width > this.lastPlatformX) {
      this.lastPlatformX = platform.pos.x + platform.size.width;
    }
  }

  updatePlatforms(player) {
    for (const platform of this.platforms) {
      if (typeof platform.update === 'function') {
        platform.update(player);
      }
    }
  }

  onSceneChange(newSceneIndex) {
    // Optional scene logic
  }
}
