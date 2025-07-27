// src/managers/PlatformManager.js

import { BasePlatform } from '../entities/platforms/BasePlatform.js';
import { FloatingPlatform } from '../entities/platforms/FloatingPlatform.js';

export class PlatformManager {
  constructor(blockSize, canvasHeight) {
    this.blockSize = blockSize;
    this.canvasHeight = canvasHeight;
    this.lastPlatformX = 0;
    this.platforms = [];
    
    // Scene-specific platform configurations
    this.scenePlatformConfigs = new Map();
    
    // Global platforms that appear in all scenes
    this.globalPlatformConfigs = [];
  }

  // Configure platforms for specific scenes
  configureScenePlatforms(sceneIndex, platformConfigs) {
    this.scenePlatformConfigs.set(sceneIndex, platformConfigs);
  }

  // Configure global platforms that appear in all scenes
  configureGlobalPlatforms(platformConfigs) {
    this.globalPlatformConfigs = platformConfigs;
  }

  initializePlatforms(currentSceneIndex = 0) {
    // Clear any existing platforms
    this.platforms = [];
    this.lastPlatformX = 0;

    // Create initial platforms based on current scene
    this.createInitialScenePlatforms(currentSceneIndex);
  }

  createInitialScenePlatforms(sceneIndex) {
    // Get scene-specific configurations
    const sceneConfigs = this.scenePlatformConfigs.get(sceneIndex) || [];
    const allConfigs = [...this.globalPlatformConfigs, ...sceneConfigs];

    // Create initial platforms based on configurations
    let currentX = 0;
    
    // Always start with a base platform
    const firstBase = new BasePlatform(0, this.canvasHeight, this.blockSize);
    firstBase.setHeightInBlocks(2);
    this.platforms.push(firstBase);
    currentX = firstBase.pos.x + firstBase.size.width;
    this.lastPlatformX = currentX;

    // Create platforms based on configurations
    for (const config of allConfigs) {
      if (config.type === 'floating' && (!config.sceneCondition || config.sceneCondition(sceneIndex))) {
        const platform = new FloatingPlatform(
          config.x || currentX + 200,
          config.y || 200,
          this.canvasHeight,
          this.blockSize
        );
        platform.setHeightInBlocks(config.height || 0.5);
        this.platforms.push(platform);
      }
      // Add more platform types as needed
    }

    // Generate additional base platforms
    for (let i = 0; i < 10; i++) {
      const lastBase = this.platforms.filter(p => p instanceof BasePlatform).pop();
      if (lastBase) {
        const newBase = lastBase.createNextPlatform(this.lastPlatformX);
        newBase.setHeightInBlocks(2);
        this.platforms.push(newBase);
        this.lastPlatformX = newBase.pos.x + newBase.size.width;
      }
    }
  }

  extendPlatformsIfNeeded(cameraX, screenWidth, currentSceneIndex) {
    const rightEdge = cameraX + screenWidth;

    while (this.lastPlatformX < rightEdge + 500) {
      // Get scene-specific configurations for platform generation
      const sceneConfigs = this.scenePlatformConfigs.get(currentSceneIndex) || [];
      const allConfigs = [...this.globalPlatformConfigs, ...sceneConfigs];

      // Randomly decide what type of platform to create
      const shouldCreateSpecial = Math.random() < 0.3; // 30% chance for special platform
      
      if (shouldCreateSpecial && allConfigs.length > 0) {
        // Create a special platform based on scene configuration
        const validConfigs = allConfigs.filter(config => 
          !config.sceneCondition || config.sceneCondition(currentSceneIndex)
        );
        
        if (validConfigs.length > 0) {
          const config = validConfigs[Math.floor(Math.random() * validConfigs.length)];
          
          if (config.type === 'floating') {
            const platform = new FloatingPlatform(
              this.lastPlatformX + 100,
              config.y || (Math.random() * 300 + 100),
              this.canvasHeight,
              this.blockSize
            );
            platform.setHeightInBlocks(config.height || 0.5);
            this.platforms.push(platform);
            this.lastPlatformX = platform.pos.x + platform.size.width;
          }
        }
      } else {
        // Create default base platform
        const lastBase = this.platforms.filter(p => p instanceof BasePlatform).pop();
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
      platform.handleCollision(player);
    }
  }

  renderPlatforms(ctx, cameraX) {
    for (const platform of this.platforms) {
      platform.render(ctx, cameraX);
    }
  }

  // Getter methods
  getPlatforms() {
    return this.platforms;
  }

  getLastPlatformX() {
    return this.lastPlatformX;
  }

  setLastPlatformX(x) {
    this.lastPlatformX = x;
  }

  // Utility methods for level management
  reset() {
    this.initializePlatforms();
  }

  addPlatform(platform) {
    this.platforms.push(platform);
    if (platform.pos.x + platform.size.width > this.lastPlatformX) {
      this.lastPlatformX = platform.pos.x + platform.size.width;
    }
  }

  // Method to handle scene transitions
  onSceneChange(newSceneIndex) {
    // Optionally regenerate platforms based on new scene
    // For now, we'll continue with existing platform generation logic
    // but you could reset or modify based on scene
  }
}