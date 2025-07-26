export class Renderer {
  constructor(ctx) {
    this.ctx = ctx;
  }

  render(entities) {
    for (const entity of entities) {
      entity.render(this.ctx);
    }
  }
}
