import { GameObject } from './GameObject.js';

export class PushableObject extends GameObject {
  private targetX: number;

  private targetY: number;

  private isMoving: boolean = false;

  private speed: number = 400; // pixels per second

  public constructor(x: number, y: number, width: number, height: number, spriteName: string = 'metal-block') {
    super(x, y, width, height, spriteName);
    this.targetX = x;
    this.targetY = y;
  }

  /**
   * Push the object in a direction
   */
  public push(dx: number, dy: number, tileSize: number): void {
    if (this.isMoving) return;

    this.targetX = this.x + (dx * tileSize);
    this.targetY = this.y + (dy * tileSize);
    this.isMoving = true;
  }

  public override update(deltaTime: number): void {
    if (!this.isMoving) return;

    const dt: number = deltaTime / 1000;
    const moveDistance: number = this.speed * dt;

    const dx: number = this.targetX - this.x;
    const dy: number = this.targetY - this.y;
    const distance: number = Math.sqrt(dx * dx + dy * dy);

    if (distance <= moveDistance) {
      this.x = this.targetX;
      this.y = this.targetY;
      this.isMoving = false;
    } else {
      const ratio: number = moveDistance / distance;
      this.x += dx * ratio;
      this.y += dy * ratio;
      this.gridX += dx;
      this.gridY += dy;
      this.targetX = this.gridX * tileSize;
      this.targetY = this.gridY * tileS
    }
  }

  public getIsMoving(): boolean {
    return this.isMoving;
  }
}
