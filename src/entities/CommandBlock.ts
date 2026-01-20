import { GameObject } from './GameObject.js';
import { Grid, Tile } from '../systems/Grid.js';

export type Direction = 'up' | 'down' | 'left' | 'right';
export type BlockColor = 'gray' | 'yellow' | 'green';
export type CommandColor = 'yellow' | 'green';

export class CommandBlock extends GameObject {
  private direction: Direction;

  private blockColor: BlockColor;

  private commandColor: CommandColor;

  private activationTimer: number = 0;

  private activationInterval: number = 1000; // 1 second

  private isActive: boolean = false;

  private gridX: number;

  private gridY: number;

  private targetX: number;

  private targetY: number;

  private isMoving: boolean = false;

  private speed: number = 200;

  public constructor(
    x: number,
    y: number,
    tileSize: number,
    direction: Direction,
    blockColor: BlockColor = 'yellow',
    commandColor: CommandColor = 'yellow'
  ) {
    // Determine sprite based on block color and command color
    const spriteName: string = CommandBlock.getSpriteKey(blockColor, commandColor, direction);

    super(x * tileSize, y * tileSize, tileSize, tileSize, spriteName);
    this.direction = direction;
    this.blockColor = blockColor;
    this.commandColor = commandColor;
    this.gridX = x;
    this.gridY = y;
    this.targetX = this.x;
    this.targetY = this.y;
  }

  private static getSpriteKey(
    blockColor: BlockColor,
    commandColor: CommandColor,
    direction: Direction
  ): string {
    if (blockColor === 'gray' && commandColor === 'yellow') {
      return `${direction}-arrow`;
    } else {
      return `green-${direction}-arrow`;
    }
  }

  /**
   * Moves the object by the specified grid offset and sets the target position.
   *
   * @param dx - Horizontal grid offset.
   * @param dy - Vertical grid offset.
   * @param tileSize - Size of a single grid tile.
  */
  public push(dx: number, dy: number, tileSize: number): void {
    this.gridX += dx;
    this.gridY += dy;
    this.targetX = this.gridX * tileSize;
    this.targetY = this.gridY * tileSize;
    this.isMoving = true;
  }

  /**
   * Checks if the object should be activated based on surrounding tiles or a circuit flag.
   *
   * @param grid - The grid to check for activation.
   * @param gridX - The object's x-coordinate on the grid.
   * @param gridY - The object's y-coordinate on the grid.
   * @param [isInCircuit=false] - If true, forces activation regardless of surrounding tiles.
   * @returns True if the object becomes active, otherwise false.
  */
  public checkActivation(
    grid: Grid,
    gridX: number,
    gridY: number,
    isInCircuit: boolean = false
  ): boolean {
    if (isInCircuit) {
      this.isActive = true;
      return true;
    }

    // Check horizontal activation (plus on left, minus on right)
    const leftTile: Tile = grid.getTile(gridX - 1, gridY)!;
    const rightTile: Tile = grid.getTile(gridX + 1, gridY)!;
    if (leftTile?.type === 'plus-block' && rightTile?.type === 'minus-block') {
      this.isActive = true;
      return true;
    }

    // Check vertical activation (plus above, minus below)
    const topTile: Tile = grid.getTile(gridX, gridY - 1)!;
    const bottomTile: Tile = grid.getTile(gridX, gridY + 1)!;

    if (topTile?.type === 'plus-block' && bottomTile?.type === 'minus-block') {
      this.isActive = true;
      return true;
    }

    this.isActive = false;
    return false;
  }

  /**
   * Updates the object's movement and activation state.
   *
   * - Moves the object toward its target if `isMoving` is true.
   * - Tracks the activation timer and returns true when the activation interval is reached.
   *
   * @param deltaTime - Time elapsed since the last update in milliseconds.
   * @returns True if the activation interval has elapsed, otherwise false.
   */
  public override update(deltaTime: number): boolean {
    if (this.isMoving) {
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

    if (!this.isActive) {
      this.activationTimer = 0;
      return false;
    }

    this.activationTimer += deltaTime;
    if (this.activationTimer >= this.activationInterval) {
      this.activationTimer = 0;
      return true;
    }

    return false;
  }

  public getDirection(): { dx: number, dy: number } {
    switch (this.direction) {
      case 'up': return { dx: 0, dy: -1 };
      case 'down': return { dx: 0, dy: 1 };
      case 'left': return { dx: -1, dy: 0 };
      case 'right': return { dx: 1, dy: 0 };
    }
  }

  public getBlockColor(): BlockColor {
    return this.blockColor;
  }

  public getCommandColor(): CommandColor {
    return this.commandColor;
  }

  public getIsActive(): boolean {
    return this.isActive;
  }

  public getIsMoving(): boolean {
    return this.isMoving;
  }

  public getGridPosition(): { x: number, y: number } {
    return {
      x: this.gridX,
      y: this.gridY
    };
  }
}
