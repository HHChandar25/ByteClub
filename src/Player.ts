import { Grid, Tile } from '../systems/Grid.js';
import { GameObject } from './GameObject.js';
import { Obstacle } from './Obstacle.js';

interface Pushable extends GameObject {
  push(dx: number, dy: number, tileSize: number): void;
}

export class Player extends GameObject {
  private speed: number = 400; // pixels per second

  private gridX: number;

  private gridY: number;

  private targetX: number;

  private targetY: number;

  private isMoving: boolean = false;

  private direction: string = 'front';

  private tileSize: number;

  public constructor(gridX: number, gridY: number, tileSize: number) {
    const worldPos: { x: number, y: number } = {
      x: gridX * tileSize,
      y: gridY * tileSize
    };
    super(worldPos.x, worldPos.y, tileSize, tileSize, 'character-front');

    this.gridX = gridX;
    this.gridY = gridY;
    this.targetX = worldPos.x;
    this.targetY = worldPos.y;
    this.tileSize = tileSize;
  }

  public getIsMoving(): boolean {
    return this.isMoving;
  }

  public getGridPosition(): { x: number, y: number } {
    return { x: this.gridX, y: this.gridY };
  }
}
