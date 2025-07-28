// ParallaxLayer.js

const LAYER_SPEEDS = {
  1: 0,
  2: 0.1, // Maps to slow speed
  3: 0.2,
  4: 0.5, // Maps to slow speed
  5: 1.0
};

// Define a threshold for what constitutes a "non-looping" layer based on speed
const NON_LOOPING_SPEED_THRESHOLD = 0.15; // Adjust if needed, slightly above 0.1

export class ParallaxLayer {
  constructor(image, speedRatio) {
    this.image = image;
    // Use the mapped speed from LAYER_SPEEDS, defaulting to 0.5 if not found
    this.speedRatio = LAYER_SPEEDS[speedRatio] !== undefined ? LAYER_SPEEDS[speedRatio] : 0.5;
  }

  update(deltaX) {
    // No-op: rendering is based on cameraX
  }

  render(ctx, cameraX) {
    const { width: canvasWidth, height: canvasHeight } = ctx.canvas;
    const imageRatio = this.image.width / this.image.height;
    const scaledHeight = canvasHeight;
    const scaledWidth = scaledHeight * imageRatio;

    if (this.speedRatio === 0) {
      // Force one draw at fixed position (x = 0)
      ctx.drawImage(this.image, 0, 0, scaledWidth, scaledHeight);
      return;
    }

    // Check if the layer should be non-looping based on its speed
    if (this.speedRatio <= NON_LOOPING_SPEED_THRESHOLD) {
      // Calculate position for non-looping layer
      // Use floor to prevent sub-pixel shifts that might cause flickering
      const x = Math.floor(-cameraX * this.speedRatio);
      ctx.drawImage(this.image, x, 0, scaledWidth, scaledHeight);
      return;
    }

    // --- Looping parallax for faster layers (original logic) ---
    let x = -(cameraX * this.speedRatio) % scaledWidth;
    if (x > 0) x -= scaledWidth;
    // Ensure we start drawing at least one image if x is way off screen to the left
    if (x < -scaledWidth) {
       // Adjust x to be within one image width of the visible area start
       const offset = Math.ceil((-scaledWidth - x) / scaledWidth) * scaledWidth;
       x += offset;
    }
    for (; x < canvasWidth; x += scaledWidth) {
      ctx.drawImage(this.image, x, 0, scaledWidth, scaledHeight);
    }
  }
}
