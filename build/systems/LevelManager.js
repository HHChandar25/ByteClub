import { PushableObject } from '../entities/PushableObject.js';
import { CommandBlock } from '../entities/CommandBlock.js';
import { Obstacle } from '../entities/Obstacle.js';
import { PushablePlusBlock } from '../entities/PushablePlusBlock.js';
export class LevelManager {
    levels = [];
    currentLevelIndex = 0;
    constructor() {
        this.initializeLevels();
    }
    initializeLevels() {
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
    getCurrentLevel() {
        return this.levels[this.currentLevelIndex];
    }
    loadLevel(grid, tileSize) {
        const level = this.getCurrentLevel();
        const tileMap = {
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
        for (let y = 0; y < level.grid.length && y < grid.getHeight(); y++) {
            for (let x = 0; x < level.grid[y].length && x < grid.getWidth(); x++) {
                const tileType = tileMap[level.grid[y][x]];
                grid.setTile(x, y, tileType);
            }
        }
        const pushables = [];
        for (const pos of level.pushables) {
            pushables.push(new PushableObject(pos.x * tileSize, pos.y * tileSize, tileSize, tileSize));
        }
        const commandBlocks = [];
        for (const cmd of level.commandBlocks) {
            commandBlocks.push(new CommandBlock(cmd.x, cmd.y, tileSize, cmd.direction, cmd.blockColor, cmd.commandColor));
        }
        const pushablePlusBlocks = [];
        for (const ppb of level.pushablePlusBlocks) {
            pushablePlusBlocks.push(new PushablePlusBlock(ppb.x, ppb.y, tileSize));
        }
        const obstacles = [];
        for (const group of level.obstacleGroups) {
            const groupBlocks = [];
            for (let i = 0; i < group.blocks.length; i++) {
                const blockType = group.blocks[i];
                const isHorizontal = ['left', 'center', 'right'].includes(blockType);
                let obstacle;
                if (isHorizontal) {
                    obstacle = new Obstacle(group.x + i, group.y, tileSize, group.color, blockType);
                }
                else {
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
    nextLevel() {
        if (this.currentLevelIndex < this.levels.length - 1) {
            this.currentLevelIndex += 1;
            return true;
        }
        return false;
    }
    reset() {
        this.currentLevelIndex = 0;
    }
    getCurrentLevelNumber() {
        return this.currentLevelIndex + 1;
    }
    getTotalLevels() {
        return this.levels.length;
    }
    isGameComplete() {
        return this.currentLevelIndex >= this.levels.length - 1;
    }
}
//# sourceMappingURL=LevelManager.js.map