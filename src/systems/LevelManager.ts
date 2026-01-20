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
