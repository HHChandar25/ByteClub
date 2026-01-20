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
    if (this.isMoving) {
      return;
    }

    this.targetX = this.x + (dx * tileSize);
    this.targetY = this.y + (dy * tileSize);
    this.isMoving = true;
  }

  /**
   * Updates the object's world position every frame using linear interpolation.
   * * * This method calculates frame-rate independent movement. It computes the
   * Euclidean distance to the target and moves the object by a specific `moveDistance`
   * defined by the object's speed and the elapsed time.
   * * To prevent "jitter" or overshooting the destination, the object will snap
   * exactly to the target coordinates if it is within range of its next step.
   *
   * @param deltaTime - The time elapsed since the last update in milliseconds.
  */
  public override update(deltaTime: number): void {
    if (!this.isMoving) {
      return;
    }

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
}
