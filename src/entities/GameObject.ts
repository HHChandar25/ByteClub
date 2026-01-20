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

  /**
   * Check collision with another object
   */
  public collidesWith(other: GameObject): boolean {
    return (
      this.x < other.x + other.width &&
      this.x + this.width > other.x &&
      this.y < other.y + other.height &&
      this.y + this.height > other.y
    );
  }
}
