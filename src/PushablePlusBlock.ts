import { GameObject } from './GameObject.js';

export class PushablePlusBlock extends GameObject {
  private gridX: number;
  private gridY: number;
  private targetX: number;
  private targetY: number;
  private isMoving: boolean = false;
  private speed: number = 400;

  public constructor(x: number, y: number, tileSize: number) {
    super(x * tileSize, y * tileSize, tileSize, tileSize, 'pushable-plus-block');
    this.gridX = x;
    this.gridY = y;
    this.targetX = this.x;
    this.targetY = this.y;
  }

  public push(dx: number, dy: number, tileSize: number): void {
    this.gridX += dx;
    this.gridY += dy;
    this.targetX = this.gridX * tileSize;
    this.targetY = this.gridY * tileSize;
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
    }
  }

  public getIsMoving(): boolean {
    return this.isMoving;
  }

  public getGridPosition(): { x: number, y: number } {
    return { x: this.gridX, y: this.gridY };
  }
}
