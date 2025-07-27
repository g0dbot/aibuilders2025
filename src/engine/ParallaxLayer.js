// src/engine/ParallaxLayer.js

export class ParallaxLayer {
  constructor(image, speed) {
    this.image = image;
    this.speed = speed;
    this.offsetX = 0;
  }

  update(deltaX) {
    if (!this.image || !this.image.width) return; // Skip if image not loaded
    this.offsetX += deltaX * this.speed;
    this.offsetX %= this.image.width;
  }

  render(ctx, cameraX, canvasHeight) {
    if (!this.image || !this.image.width) return; // Skip if image not loaded

    const aspectRatio = this.image.width / this.image.height;
    const drawHeight = canvasHeight;
    const drawWidth = drawHeight * aspectRatio;

    let x = -this.offsetX;
    while (x < ctx.canvas.width) {
      ctx.drawImage(this.image, x, 0, drawWidth, drawHeight);
      x += drawWidth;
    }
  }
}
