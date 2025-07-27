export class ParallaxLayer {
  constructor(image, speedRatio) {
    this.image = image;
    this.speedRatio = speedRatio;
  }

  update(deltaX) {
    // Not required to store cameraX; layer scroll is computed in render based on cameraX & speedRatio
    // Left here if you want to extend behavior.
  }

  render(ctx, cameraX) {
    const { width: canvasWidth, height: canvasHeight } = ctx.canvas;
    const imageRatio = this.image.width / this.image.height;
    const scaledHeight = canvasHeight;
    const scaledWidth = scaledHeight * imageRatio;

    // Calculate horizontal offset with speed ratio and wrap for seamless looping
    let x = -(cameraX * this.speedRatio) % scaledWidth;
    if (x > 0) x -= scaledWidth;

    // Draw repeated images across the canvas width
    for (; x < canvasWidth; x += scaledWidth) {
      ctx.drawImage(this.image, x, 0, scaledWidth, scaledHeight);
    }
  }
}
