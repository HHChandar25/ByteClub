import { Grid, Tile } from './Grid.js';
import { PushableObject } from '../entities/PushableObject.js';
import { CommandBlock, Direction, BlockColor, CommandColor } from '../entities/CommandBlock.js';
import { Obstacle, ObstacleColor, ObstacleBlockType } from '../entities/Obstacle.js';
import { PushablePlusBlock } from '../entities/PushablePlusBlock.js';

export interface LevelData {
  name: string;
  grid: number[][];
  playerStart: { x: number, y: number };
  pushables: { x: number, y: number }[];
  pushablePlusBlocks: { x: number, y: number }[];
  commandBlocks: {
    x: number, y: number, direction: Direction, blockColor: BlockColor, commandColor: CommandColor
  }[];
  obstacleGroups: { x: number, y: number, color: ObstacleColor, blocks: ObstacleBlockType[] }[];
  exit: { x: number, y: number };
}

export class LevelManager {
  private levels: LevelData[] = [];

  private currentLevelIndex: number = 0;

  public constructor() {
    this.initializeLevels();
  }

  /**
   * Initialize all game levels
   */
  private initializeLevels(): void {
    // Level 1
    this.levels.push({
      name: 'Level 1',
      grid: [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 4, 5, 0, 0, 0, 0, 0, 0],
        [0, 0, 4, 5, 4, 5, 4, 2, 2, 4, 5, 0, 0, 0, 0],
        [0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 7, 0, 0, 0],
        [0, 0, 0, 0, 2, 2, 4, 5, 4, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      ],
      playerStart: { x: 2, y: 5 },
      pushables: [{ x: 7, y: 5 }],
      pushablePlusBlocks: [],
      commandBlocks: [],
      obstacleGroups: [],
      exit: { x: 11, y: 5 }
    });


  }

  /**
   * Get current level data
   */
  public getCurrentLevel(): LevelData {
    return this.levels[this.currentLevelIndex];
  }

  /**
   * Load level into grid and return setup data
   */
  public loadLevel(grid: Grid, tileSize: number): {
    playerStart: { x: number, y: number },
    pushables: PushableObject[],
    pushablePlusBlocks: PushablePlusBlock[],
    commandBlocks: CommandBlock[],
    obstacles: Obstacle[],
    exit: { x: number, y: number }
  } {
    // eslint-disable-next-line @typescript-eslint/typedef
    const level = this.getCurrentLevel();

    const tileMap: { [key: number]: string } = {
      0: 'empty',
      1: 'floor1',
      2: 'floor2',
      3: 'floor3',
      4: 'wall-start',
      5: 'wall-end',
      7: 'exit',
      8: 'plus-block',
      9: 'minus-block',
    };

    for (let y: number = 0; y < level.grid.length && y < grid.getHeight(); y++) {
      for (let x: number = 0; x < level.grid[y].length && x < grid.getWidth(); x++) {
        const tileType: string = tileMap[level.grid[y][x]];
        grid.setTile(x, y, tileType);
      }
    }

    const pushables: PushableObject[] = [];
    for (const pos of level.pushables) {
      pushables.push(new PushableObject(pos.x * tileSize, pos.y * tileSize, tileSize, tileSize));
    }

    const commandBlocks: CommandBlock[] = [];
    for (const cmd of level.commandBlocks) {
      commandBlocks.push(
        new CommandBlock(cmd.x, cmd.y, tileSize, cmd.direction, cmd.blockColor, cmd.commandColor)
      );
    }

    const pushablePlusBlocks: PushablePlusBlock[] = [];
    for (const ppb of level.pushablePlusBlocks) {
      pushablePlusBlocks.push(new PushablePlusBlock(ppb.x, ppb.y, tileSize));
    }

    const obstacles: Obstacle[] = [];
    for (const group of level.obstacleGroups) {
      const groupBlocks: Obstacle[] = [];

      for (let i: number = 0; i < group.blocks.length; i++) {
        const blockType: ObstacleBlockType = group.blocks[i];

        const isHorizontal: boolean = ['left', 'center', 'right'].includes(blockType);

        let obstacle: Obstacle;
        if (isHorizontal) {
          obstacle = new Obstacle(group.x + i, group.y, tileSize, group.color, blockType);
        } else {
          obstacle = new Obstacle(group.x, group.y + i, tileSize, group.color, blockType);
        }

        groupBlocks.push(obstacle);
        obstacles.push(obstacle);
      }

      for (const block of groupBlocks) {
        block.setObstacleGroup(groupBlocks);
      }
    }

    return {
      playerStart: level.playerStart,
      pushables: pushables,
      pushablePlusBlocks: pushablePlusBlocks,
      commandBlocks: commandBlocks,
      obstacles: obstacles,
      exit: level.exit
    };
  }

  /**
   * Advance to next level
   */
  public nextLevel(): boolean {
    if (this.currentLevelIndex < this.levels.length - 1) {
      this.currentLevelIndex += 1;
      return true;
    }
    return false;
  }

  /**
   * Reset to first level
   */
  public reset(): void {
    this.currentLevelIndex = 0;
  }

  /**
   * Get current level number
   */
  public getCurrentLevelNumber(): number {
    return this.currentLevelIndex + 1;
  }

  /**
   * Get total number of levels
   */
  public getTotalLevels(): number {
    return this.levels.length;
  }

  /**
   * Check if all levels completed
   */
  public isGameComplete(): boolean {
    return this.currentLevelIndex >= this.levels.length - 1;
  }
}
