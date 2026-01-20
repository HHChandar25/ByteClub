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

  /**
   * Determines whether a group of obstacles can move in the specified direction.
   *
   * @param dx - Horizontal movement offset.
   * @param dy - Vertical movement offset.
   * @param grid - The grid to check movement against.
   * @param allObstacles - All obstacles present in the grid.
   * @param [pushables=[]] - Optional pushable objects to consider in movement.
   * @param [player=null] - Optional player to check for blocking.
   * @param [commandBlocks=[]] - Optional command blocks affecting movement.
   * @param [movedObstacles=new Set()] - Tracks obstacles already moved in this check.
   * @returns Object indicating if movement is possible and the chain of movable obstacles.
  */
  private canGroupMove(
    dx: number,
    dy: number,
    grid: Grid,
    allObstacles: Obstacle[],
    pushables: Pushable[] = [],
    player: Player | null = null,
    commandBlocks: CommandBlock[] = [],
    movedObstacles: Set<Obstacle> = new Set()
  ): { canMove: boolean, chain: Obstacle[] } {
    const chain: Obstacle[] = [];

    // Check if all blocks in the group can move
    for (const block of this.obstacleGroup) {
      const newGridX: number = block.gridX + dx;
      const newGridY: number = block.gridY + dy;

      if (!grid.isValid(newGridX, newGridY)) {
        return { canMove: false, chain: [] };
      }

      const tile: Tile | null = grid.getTile(newGridX, newGridY);
      if (!tile || !Obstacle.isWalkableTile(tile.type)) {
        return { canMove: false, chain: [] };
      }

      // Check if player is blocking
      if (player) {
        const playerPos: { x: number, y: number } = player.getGridPosition();
        if (playerPos.x === newGridX && playerPos.y === newGridY) {
          return { canMove: false, chain: [] };
        }
      }

      // Check if pushable objects are blocking
      if (pushables) {
        const tileSize: number = this.tileSize;
        for (const pushable of pushables) {
          const pushGridX: number = Math.floor(pushable.x / tileSize);
          const pushGridY: number = Math.floor(pushable.y / tileSize);
          if (pushGridX === newGridX && pushGridY === newGridY) {
            return { canMove: false, chain: [] };
          }
        }
      }

      // Check if command blocks are blocking
      if (commandBlocks) {
        for (const cmdBlock of commandBlocks) {
          const cmdPos: { x: number, y: number } = cmdBlock.getGridPosition();
          if (cmdPos.x === newGridX && cmdPos.y === newGridY) {
            return { canMove: false, chain: [] };
          }
        }
      }

      // Check if another obstacle (not in our group and not already moved) is blocking
      for (const obstacle of allObstacles) {
        if (this.obstacleGroup.includes(obstacle)) {
          continue;
        }
        if (movedObstacles.has(obstacle)) {
          continue;
        }

        const obstaclePos: { x: number, y: number } = obstacle.getGridPosition();
        if (obstaclePos.x === newGridX && obstaclePos.y === newGridY) {
          const chainResult: { canMove: boolean, chain: Obstacle[] } = obstacle.canGroupMove(
            dx,
            dy,
            grid,
            allObstacles,
            pushables,
            player,
            commandBlocks,
            new Set([...movedObstacles, ...this.obstacleGroup])
          );
          if (!chainResult.canMove) {
            return { canMove: false, chain: [] };
          }

          chain.push(...chainResult.chain);
        }
      }
    }

    return { canMove: true, chain: chain };
  }

  /**
   * Attempts to move the obstacle (or its group) in the specified direction.
   *
   * - Checks for grid bounds, walkable tiles, player, pushables, command blocks,
   *   and other obstacles that might block movement.
   * - Handles both single-block and grouped movement with chained obstacles.
   * - Updates grid and target positions and sets `isMoving` to true if movement succeeds.
   *
   * @param dx - Horizontal movement offset.
   * @param dy - Vertical movement offset.
   * @param grid - The grid to check for movement validity.
   * @param obstacles - All obstacles in the grid.
   * @param [pushables=[]] - Optional pushable objects to consider.
   * @param [player=null] - Optional player to check for collisions.
   * @param commandColor - The command color required to move this obstacle.
   * @param [commandBlocks=[]] - Optional command blocks affecting movement.
   * @returns True if the movement was successful, otherwise false.
  */
  public tryMove(
    dx: number,
    dy: number,
    grid: Grid,
    obstacles: Obstacle[],
    pushables: Pushable[] = [],
    player: Player | null = null,
    commandColor: ObstacleColor,
    commandBlocks: CommandBlock[] = []
  ): boolean {
    if (this.isMoving) {
      return false;
    }

    if (this.color !== commandColor) {
      return false;
    }

    // If this block is part of a group, check if entire group (and chain) can move
    if (this.obstacleGroup.length > 0) {
      const moveResult: { canMove: boolean, chain: Obstacle[] } = this.canGroupMove(
        dx,
        dy,
        grid,
        obstacles,
        pushables,
        player,
        commandBlocks
      );
      if (!moveResult.canMove) {
        return false;
      }

      const allToMove: Set<Obstacle> = new Set([...this.obstacleGroup]);

      for (const chainedObstacle of moveResult.chain) {
        if (chainedObstacle.obstacleGroup.length > 0) {
          for (const block of chainedObstacle.obstacleGroup) {
            allToMove.add(block);
          }
        } else {
          allToMove.add(chainedObstacle);
        }
      }

      for (const block of allToMove) {
        block.gridX += dx;
        block.gridY += dy;
        block.targetX = block.gridX * this.tileSize;
        block.targetY = block.gridY * this.tileSize;
        block.isMoving = true;
      }

      return true;
    }

    // Single block movement (fallback)
    const newGridX: number = this.gridX + dx;
    const newGridY: number = this.gridY + dy;

    if (!grid.isValid(newGridX, newGridY)) {
      return false;
    }

    const tile: Tile | null = grid.getTile(newGridX, newGridY);
    if (!tile || !Obstacle.isWalkableTile(tile.type)) {
      return false;
    }

    if (player) {
      const playerPos: { x: number, y: number } = player.getGridPosition();
      if (playerPos.x === newGridX && playerPos.y === newGridY) {
        return false;
      }
    }

    if (pushables) {
      const tileSize: number = this.tileSize;
      for (const pushable of pushables) {
        const pushGridX: number = Math.floor(pushable.x / tileSize);
        const pushGridY: number = Math.floor(pushable.y / tileSize);
        if (pushGridX === newGridX && pushGridY === newGridY) {
          return false;
        }
      }
    }

    if (commandBlocks) {
      for (const cmdBlock of commandBlocks) {
        const cmdPos: { x: number, y: number } = cmdBlock.getGridPosition();
        if (cmdPos.x === newGridX && cmdPos.y === newGridY) {
          return false;
        }
      }
    }

    for (const obstacle of obstacles) {
      if (obstacle === this) {
        continue;
      }
      const obstaclePos: { x: number, y: number } = obstacle.getGridPosition();
      if (obstaclePos.x === newGridX && obstaclePos.y === newGridY) {
        if (
          !obstacle.tryMove(
            dx,
            dy,
            grid,
            obstacles,
            pushables,
            player,
            commandColor,
            commandBlocks
          )
        ) {
          return false;
        }
      }
    }

    this.gridX = newGridX;
    this.gridY = newGridY;
    this.targetX = newGridX * this.tileSize;
    this.targetY = newGridY * this.tileSize;
    this.isMoving = true;

    return true;
  }

  private static isWalkableTile(type: string): boolean {
    const walkableTiles: string[] = ['floor1', 'floor2', 'floor3'];
    return walkableTiles.includes(type);
  }

  /**
   * Updates the obstacle's position toward its target if it is moving.
   *
   * - Moves the object smoothly based on its speed and elapsed time.
   * - Stops movement when the target position is reached.
   *
   * @param deltaTime - Time elapsed since the last update in milliseconds.
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

  public getGridPosition(): { x: number, y: number } {
    return { x: this.gridX, y: this.gridY };
  }

  public getIsMoving(): boolean {
    return this.isMoving;
  }
}
