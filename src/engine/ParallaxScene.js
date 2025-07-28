import { ParallaxLayer } from './ParallaxLayer.js';

export class ParallaxScene {
  constructor(layers = []) {
    this.layers = layers;
  }

  update(deltaX) {
    for (const layer of this.layers) {
      layer.update(deltaX);
    }
  }

  render(ctx, cameraX) {
    for (const layer of this.layers) {
      layer.render(ctx, cameraX);
    }
  }
}
