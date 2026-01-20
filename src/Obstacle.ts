import { GameObject } from './GameObject.js';
import { Grid, Tile } from '../systems/Grid.js';

export type ObstacleColor = 'yellow' | 'green';
export type ObstacleBlockType = 'top' | 'middle' | 'bottom' | 'left' | 'center' | 'right';

interface Pushable {
  x: number;
  y: number;
}

interface CommandBlock {
  getGridPosition(): { x: number; y: number };
}

interface Player {
  getGridPosition(): { x: number; y: number };
}

export class Obstacle extends GameObject {
  private gridX: number;

  private gridY: number;

  private targetX: number;

  private targetY: number;

  private isMoving: boolean = false;

  private speed: number = 300;

  private tileSize: number;

  private color: ObstacleColor;

  private blockType: ObstacleBlockType;

  private obstacleGroup: Obstacle[] = [];

  public constructor(
    x: number,
    y: number,
    tileSize: number,
    color: ObstacleColor,
    blockType: ObstacleBlockType = 'top'
  ) {
    const spriteName: string = `${color}-obstacle-${blockType}`;
    super(x * tileSize, y * tileSize, tileSize, tileSize, spriteName);
    this.gridX = x;
    this.gridY = y;
    this.targetX = this.x;
    this.targetY = this.y;
    this.tileSize = tileSize;
    this.color = color;
    this.blockType = blockType;
  }

  public setObstacleGroup(group: Obstacle[]): void {
    this.obstacleGroup = group;
  }

  public getColor(): ObstacleColor {
    return this.color;
  }

  private static isWalkableTile(type: string): boolean {
    const walkableTiles: string[] = ['floor1', 'floor2', 'floor3'];
    return walkableTiles.includes(type);
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

  public getGridPosition(): { x: number, y: number } {
    return { x: this.gridX, y: this.gridY };
  }

  public getIsMoving(): boolean {
    return this.isMoving;
  }
}
