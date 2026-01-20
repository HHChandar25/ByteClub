export class GameObject {
  public x: number;

  public y: number;

  public width: number;

  public height: number;

  public spriteName: string;

  public constructor(x: number, y: number, width: number, height: number, spriteName: string) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.spriteName = spriteName;
  }

  /**
   * Updates the object. Intended to be overridden in subclasses.
   *
   * @param deltaTime - Time elapsed since the last update in milliseconds.
   */
  // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
  public update(deltaTime: number): void {
    // Override in subclasses
  }

  public getBounds(): { x: number, y: number, width: number, height: number } {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height
    };
  }
}
