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

  /**
   * Try to move in a direction
   * pushables now includes both regular pushable objects AND command blocks
   * obstacles parameter added to check for yellow obstacles
   */
  public tryMove(
    dx: number,
    dy: number,
    grid: Grid,
    pushables: Pushable[],
    isHolding: boolean = false,
    obstacles: Obstacle[] = []
  ): boolean {
    if (this.isMoving) {
      return false;
    }

    if(!isHolding) {
      this.updateDirection(dx, dy);
    }

    const newGridX: number = this.gridX + dx;
    const newGridY: number = this.gridY + dy;

    if (!grid.isValid(newGridX, newGridY)) {
      return false;
    }

    const tile: Tile = grid.getTile(newGridX, newGridY)!;
    if (!tile || !Player.isWalkableTile(tile.type)) {
      return false;
    }

    for (const obstacle of obstacles) {
      const obsPos: { x: number, y: number } = obstacle.getGridPosition();
      if (obsPos.x === newGridX && obsPos.y === newGridY) {
        return false;
      }
    }

    const pushableInFront: Pushable | null = this.getPushableAt(newGridX, newGridY, pushables);

    if (isHolding) {
      let faceDX: number = 0;
      let faceDY: number = 0;

      switch (this.direction) {
        case 'left':
          faceDX = -1;
          faceDY = 0;
          break;
        case 'right':
          faceDX = 1;
          faceDY = 0;
          break;
        case 'front':
          faceDX = 0;
          faceDY = -1;
          break;
        case 'down':
          faceDX = 0;
          faceDY = 1;
          break;
      }

      const blockX: number = this.gridX + faceDX;
      const blockY: number = this.gridY + faceDY;

      const heldBlock: Pushable | null = this.getPushableAt(blockX, blockY, pushables);
      if (heldBlock) {
        if (pushableInFront) {
          return false;
        }

        const blockNewX: number = blockX + dx;
        const blockNewY: number = blockY + dy;

        if (!grid.isValid(blockNewX, blockNewY)) {
          return false;
        }

        const blockTile: Tile = grid.getTile(blockNewX, blockNewY)!;
        if (!blockTile || !Player.isWalkableTile(blockTile.type)) {
          return false;
        }

        for (const obstacle of obstacles) {
          const oPos: { x: number, y: number } = obstacle.getGridPosition();
          if (oPos.x === blockNewX && oPos.y === blockNewY) {
            return false;
          }
        }

        const blocking: Pushable | null = this.getPushableAt(blockNewX, blockNewY, pushables);
        if (blocking && blocking !== heldBlock) {
          return false;
        }

        this.gridX = newGridX;
        this.gridY = newGridY;
        this.targetX = newGridX * this.tileSize;
        this.targetY = newGridY * this.tileSize;
        this.isMoving = true;

        heldBlock.push(dx, dy, this.tileSize);

        return true;
      }
    }

    if (pushableInFront) {
      const pushResult: boolean = this.tryPushChain(
        pushableInFront, dx, dy, grid, pushables, obstacles
      );
      if (!pushResult) {
        return false;
      }
    }

    this.gridX = newGridX;
    this.gridY = newGridY;
    this.targetX = newGridX * this.tileSize;
    this.targetY = newGridY * this.tileSize;
    this.isMoving = true;

    return true;
  }

  public getIsMoving(): boolean {
    return this.isMoving;
  }

  public getGridPosition(): { x: number, y: number } {
    return { x: this.gridX, y: this.gridY };
  }
}
