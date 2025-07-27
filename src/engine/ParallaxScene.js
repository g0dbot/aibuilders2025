import { ParallaxLayer } from './ParallaxLayer.js';

export class ParallaxScene {
  constructor(imageList = [], effectLayer = null) {
    // Predefined speeds for layers 1 to 5
    const predefinedSpeeds = [0.1, 0.2, 0.3, 0.4, 0.5];

    this.layers = imageList.map((img, i) => {
      const speed = predefinedSpeeds[i] ?? 0.5;
      return new ParallaxLayer(img, speed);
    });

    this.effectLayer = effectLayer; // optional ParallaxLayer
    this.startX = 0;
    this.endX = Infinity;
  }

  update(deltaX) {
    for (const layer of this.layers) {
      layer.update(deltaX);
    }
    if (this.effectLayer) {
      this.effectLayer.update(deltaX);
    }
  }

  render(ctx, cameraX, canvasHeight) {
    for (const layer of this.layers) {
      layer.render(ctx, cameraX, canvasHeight);
    }
    if (this.effectLayer) {
      this.effectLayer.render(ctx, cameraX, canvasHeight);
    }
  }
}