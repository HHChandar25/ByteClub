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

    // Level 2
    this.levels.push({
      name: 'Level 2',
      grid: [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 0, 0, 0],
        [0, 0, 0, 0, 0, 5, 0, 0, 0, 5, 2, 5, 0, 0, 0],
        [0, 5, 5, 5, 8, 2, 9, 5, 4, 5, 2, 5, 0, 0, 0],
        [0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 5, 0, 0, 0],
        [0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 7, 0, 0],
        [0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      ],
      playerStart: { x: 2, y: 5 },
      pushables: [],
      pushablePlusBlocks: [],
      commandBlocks: [
        { x: 5, y: 5, direction: 'up', blockColor: 'gray', commandColor: 'yellow' }
      ],
      obstacleGroups: [
        { x: 10, y: 4, color: 'yellow', blocks: ['top', 'middle', 'bottom'] }
      ],
      exit: { x: 12, y: 5 }
    });

    // Level 3
    this.levels.push({
      name: 'Level 3',
      grid: [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 5, 2, 5, 0, 0, 0, 0, 0],
        [0, 0, 0, 8, 2, 9, 5, 5, 2, 5, 4, 5, 2, 2, 0],
        [0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 7],
        [0, 0, 2, 2, 2, 2, 2, 4, 5, 4, 2, 5, 0, 0, 0],
        [0, 0, 2, 2, 2, 2, 2, 0, 0, 4, 2, 5, 0, 0, 0],
        [0, 0, 0, 2, 2, 2, 0, 0, 0, 4, 5, 5, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      ],
      playerStart: { x: 2, y: 5 },
      pushables: [],
      pushablePlusBlocks: [],
      commandBlocks: [
        { x: 4, y: 5, direction: 'up', blockColor: 'gray', commandColor: 'yellow' },
        { x: 9, y: 4, direction: 'down', blockColor: 'gray', commandColor: 'yellow' }
      ],
      obstacleGroups: [
        { x: 8, y: 3, color: 'yellow', blocks: ['top', 'bottom'] },
        { x: 10, y: 5, color: 'yellow', blocks: ['top', 'bottom'] }
      ],
      exit: { x: 14, y: 4 }
    });

    // Level 4
    this.levels.push({
      name: 'Level 4 - Narrow Path',
      grid: [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 5, 5, 4, 0, 5, 5, 4, 0, 0],
        [0, 0, 0, 0, 0, 0, 5, 1, 4, 0, 5, 1, 4, 0, 0],
        [0, 0, 1, 1, 1, 9, 5, 1, 4, 5, 5, 1, 4, 5, 0],
        [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 7],
        [0, 0, 0, 2, 3, 2, 4, 5, 5, 2, 4, 5, 4, 5, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 5, 3, 4, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 4, 5, 4, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      ],
      playerStart: { x: 2, y: 5 },
      pushables: [],
      pushablePlusBlocks: [{ x: 4, y: 4 }],
      commandBlocks: [
        { x: 7, y: 5, direction: 'up', blockColor: 'gray', commandColor: 'yellow' },
        { x: 8, y: 5, direction: 'down', blockColor: 'gray', commandColor: 'yellow' }
      ],
      obstacleGroups: [
        { x: 7, y: 3, color: 'yellow', blocks: ['top', 'bottom'] },
        { x: 9, y: 5, color: 'yellow', blocks: ['top', 'bottom'] },
        { x: 11, y: 3, color: 'yellow', blocks: ['top', 'bottom'] }
      ],
      exit: { x: 14, y: 5 }
    });

    // Level 5
    this.levels.push({
      name: 'Level 5',
      grid: [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 4, 0, 0, 0],
        [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
        [0, 0, 0, 0, 0, 4, 8, 1, 9, 5, 1, 1, 1, 0, 0, 0],
        [0, 0, 0, 0, 0, 5, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 7, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      ],
      playerStart: { x: 2, y: 6 },
      pushables: [],
      pushablePlusBlocks: [],
      commandBlocks: [
        { x: 12, y: 7, direction: 'down', blockColor: 'gray', commandColor: 'yellow' },
        { x: 7, y: 2, direction: 'left', blockColor: 'yellow', commandColor: 'green' }
      ],
      obstacleGroups: [
        { x: 10, y: 8, color: 'green', blocks: ['left', 'center', 'right'] }
      ],
      exit: { x: 13, y: 9 }
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
