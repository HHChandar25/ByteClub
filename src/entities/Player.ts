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
   * Attempts to move the object in a given direction.
   *
   * - Considers pushables (including command blocks) and obstacles when checking movement.
   * - Updates the object's target position and sets `isMoving` to true if movement succeeds.
   *
   * @param dx - Horizontal movement offset.
   * @param dy - Vertical movement offset.
   * @param grid - The grid to validate movement against.
   * @param pushables - Objects that can be pushed, including command blocks.
   * @param [isHolding=false] - Whether the object is being held (affects movement rules).
   * @param [obstacles=[]] - Obstacles to check for blocking movement.
   * @returns True if the movement succeeded, otherwise false.
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

  /**
   * Attempts to move a chain of pushable objects in a specified direction.
   * * The method identifies all adjacent pushable objects in a line starting from `firstObj`.
   * It validates if the "final" position (the space after the last object in the chain)
   * is clear of boundaries, non-walkable tiles, static obstacles, or other pushables.
   * If the path is clear, it moves the entire chain.
   *
   * @param firstObj - The initial object being pushed.
   * @param dx - The horizontal grid direction (-1, 0, or 1).
   * @param dy - The vertical grid direction (-1, 0, or 1).
   * @param grid - The game grid used for boundary and tile validation.
   * @param pushables - Array of all pushable objects currently in the scene.
   * @param obstacles - Array of static obstacles to check for collisions.
   * @returns True if the chain was successfully pushed; false if blocked.
  */
  private tryPushChain(
    firstObj: Pushable,
    dx: number,
    dy: number,
    grid: Grid,
    pushables: Pushable[],
    obstacles: Obstacle[]
  ): boolean {
    const chain: Pushable[] = [];
    let currentObj: Pushable | null = firstObj;

    while (currentObj) {
      chain.push(currentObj);

      const objGridX: number = Math.floor(currentObj.x / this.tileSize);
      const objGridY: number = Math.floor(currentObj.y / this.tileSize);

      const nextGridX: number = objGridX + dx;
      const nextGridY: number = objGridY + dy;

      const nextObj: Pushable | null = this.getPushableAt(nextGridX, nextGridY, pushables);

      if (nextObj && !chain.includes(nextObj)) {
        currentObj = nextObj;
      } else {
        currentObj = null;
      }
    }

    const lastObj: Pushable = chain[chain.length - 1];
    const lastObjGridX: number = Math.floor(lastObj.x / this.tileSize);
    const lastObjGridY: number = Math.floor(lastObj.y / this.tileSize);
    const finalGridX: number = lastObjGridX + dx;
    const finalGridY: number = lastObjGridY + dy;

    if (!grid.isValid(finalGridX, finalGridY)) {
      return false;
    }

    const finalTile: Tile = grid.getTile(finalGridX, finalGridY)!;
    if (!finalTile || !Player.isWalkableTile(finalTile.type)) {
      return false;
    }

    for (const obstacle of obstacles) {
      const obsPos: { x: number, y: number } = obstacle.getGridPosition();
      if (obsPos.x === finalGridX && obsPos.y === finalGridY) {
        return false;
      }
    }

    const blocking: Pushable | null = this.getPushableAt(finalGridX, finalGridY, pushables);
    if (blocking && !chain.includes(blocking)) {
      return false;
    }

    for (let i: number = chain.length - 1; i >= 0; i--) {
      chain[i].push(dx, dy, this.tileSize);
    }

    return true;
  }

  /**
   * Locates a pushable object at a specific grid coordinate.
   * * This method iterates through the provided array and converts each object's
   * world-space coordinates (pixels) into grid-space coordinates using `tileSize`
   * to determine if it occupies the target cell.
   *
   * @param gridX - The target horizontal grid index.
   * @param gridY - The target vertical grid index.
   * @param pushables - The collection of pushable objects to search.
   * @returns The object found at the coordinates, or null if the cell is empty.
  */
  private getPushableAt(gridX: number, gridY: number, pushables: Pushable[]): Pushable | null {
    for (const obj of pushables) {
      const objGridX: number = Math.floor(obj.x / this.tileSize);
      const objGridY: number = Math.floor(obj.y / this.tileSize);

      if (objGridX === gridX && objGridY === gridY) {
        return obj;
      }
    }
    return null;
  }

  /**
   * Determines if a specific tile type allows for movement or object placement.
   * * This is a static utility used to filter out non-traversable terrain
   * (like walls or water) by checking against a whitelist of walkable floor types.
   *
   * @param type - The unique identifier/string key of the tile type.
   * @returns True if the tile is a floor or exit; false otherwise.
  */
  private static isWalkableTile(type: string): boolean {
    const walkableTiles: string[] = ['floor1', 'floor2', 'floor3', 'exit'];
    return walkableTiles.includes(type);
  }

  private updateDirection(dx: number, dy: number): void {
    if (dx > 0) {
      this.direction = 'right';
      this.spriteName = 'character-right';
    } else if (dx < 0) {
      this.direction = 'left';
      this.spriteName = 'character-left';
    } else if (dy < 0) {
      this.direction = 'front';
      this.spriteName = 'character-back';
    } else if (dy > 0) {
      this.direction = 'down';
      this.spriteName = 'character-front';
    }
  }

  /**
   * Updates the object's position based on its current movement state.
   * * This method handles smooth linear interpolation between the current position
   * and a target destination. It calculates movement based on elapsed time
   * (frame-rate independence) and ensures the object snaps exactly to the target
   * coordinates once it is within range to prevent overshooting.
   *
   * @param deltaTime - The time elapsed since the last frame in milliseconds.
  */
  public override update(deltaTime: number): void {
    if (!this.isMoving) {
      return;
    }

    const dt: number = deltaTime / 1000; // Convert to seconds
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
