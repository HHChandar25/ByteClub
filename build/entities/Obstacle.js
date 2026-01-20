import { GameObject } from './GameObject.js';
export class Obstacle extends GameObject {
    gridX;
    gridY;
    targetX;
    targetY;
    isMoving = false;
    speed = 300;
    tileSize;
    color;
    blockType;
    obstacleGroup = [];
    constructor(x, y, tileSize, color, blockType = 'top') {
        const spriteName = `${color}-obstacle-${blockType}`;
        super(x * tileSize, y * tileSize, tileSize, tileSize, spriteName);
        this.gridX = x;
        this.gridY = y;
        this.targetX = this.x;
        this.targetY = this.y;
        this.tileSize = tileSize;
        this.color = color;
        this.blockType = blockType;
    }
    setObstacleGroup(group) {
        this.obstacleGroup = group;
    }
    getColor() {
        return this.color;
    }
    canGroupMove(dx, dy, grid, allObstacles, pushables = [], player = null, commandBlocks = [], movedObstacles = new Set()) {
        const chain = [];
        for (const block of this.obstacleGroup) {
            const newGridX = block.gridX + dx;
            const newGridY = block.gridY + dy;
            if (!grid.isValid(newGridX, newGridY)) {
                return { canMove: false, chain: [] };
            }
            const tile = grid.getTile(newGridX, newGridY);
            if (!tile || !Obstacle.isWalkableTile(tile.type)) {
                return { canMove: false, chain: [] };
            }
            if (player) {
                const playerPos = player.getGridPosition();
                if (playerPos.x === newGridX && playerPos.y === newGridY) {
                    return { canMove: false, chain: [] };
                }
            }
            if (pushables) {
                const tileSize = this.tileSize;
                for (const pushable of pushables) {
                    const pushGridX = Math.floor(pushable.x / tileSize);
                    const pushGridY = Math.floor(pushable.y / tileSize);
                    if (pushGridX === newGridX && pushGridY === newGridY) {
                        return { canMove: false, chain: [] };
                    }
                }
            }
            if (commandBlocks) {
                for (const cmdBlock of commandBlocks) {
                    const cmdPos = cmdBlock.getGridPosition();
                    if (cmdPos.x === newGridX && cmdPos.y === newGridY) {
                        return { canMove: false, chain: [] };
                    }
                }
            }
            for (const obstacle of allObstacles) {
                if (this.obstacleGroup.includes(obstacle)) {
                    continue;
                }
                if (movedObstacles.has(obstacle)) {
                    continue;
                }
                const obstaclePos = obstacle.getGridPosition();
                if (obstaclePos.x === newGridX && obstaclePos.y === newGridY) {
                    const chainResult = obstacle.canGroupMove(dx, dy, grid, allObstacles, pushables, player, commandBlocks, new Set([...movedObstacles, ...this.obstacleGroup]));
                    if (!chainResult.canMove) {
                        return { canMove: false, chain: [] };
                    }
                    chain.push(...chainResult.chain);
                }
            }
        }
        return { canMove: true, chain: chain };
    }
    tryMove(dx, dy, grid, obstacles, pushables = [], player = null, commandColor, commandBlocks = []) {
        if (this.isMoving) {
            return false;
        }
        if (this.color !== commandColor) {
            return false;
        }
        if (this.obstacleGroup.length > 0) {
            const moveResult = this.canGroupMove(dx, dy, grid, obstacles, pushables, player, commandBlocks);
            if (!moveResult.canMove) {
                return false;
            }
            const allToMove = new Set([...this.obstacleGroup]);
            for (const chainedObstacle of moveResult.chain) {
                if (chainedObstacle.obstacleGroup.length > 0) {
                    for (const block of chainedObstacle.obstacleGroup) {
                        allToMove.add(block);
                    }
                }
                else {
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
        const newGridX = this.gridX + dx;
        const newGridY = this.gridY + dy;
        if (!grid.isValid(newGridX, newGridY)) {
            return false;
        }
        const tile = grid.getTile(newGridX, newGridY);
        if (!tile || !Obstacle.isWalkableTile(tile.type)) {
            return false;
        }
        if (player) {
            const playerPos = player.getGridPosition();
            if (playerPos.x === newGridX && playerPos.y === newGridY) {
                return false;
            }
        }
        if (pushables) {
            const tileSize = this.tileSize;
            for (const pushable of pushables) {
                const pushGridX = Math.floor(pushable.x / tileSize);
                const pushGridY = Math.floor(pushable.y / tileSize);
                if (pushGridX === newGridX && pushGridY === newGridY) {
                    return false;
                }
            }
        }
        if (commandBlocks) {
            for (const cmdBlock of commandBlocks) {
                const cmdPos = cmdBlock.getGridPosition();
                if (cmdPos.x === newGridX && cmdPos.y === newGridY) {
                    return false;
                }
            }
        }
        for (const obstacle of obstacles) {
            if (obstacle === this) {
                continue;
            }
            const obstaclePos = obstacle.getGridPosition();
            if (obstaclePos.x === newGridX && obstaclePos.y === newGridY) {
                if (!obstacle.tryMove(dx, dy, grid, obstacles, pushables, player, commandColor, commandBlocks)) {
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
    static isWalkableTile(type) {
        const walkableTiles = ['floor1', 'floor2', 'floor3'];
        return walkableTiles.includes(type);
    }
    update(deltaTime) {
        if (!this.isMoving) {
            return;
        }
        const dt = deltaTime / 1000;
        const moveDistance = this.speed * dt;
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance <= moveDistance) {
            this.x = this.targetX;
            this.y = this.targetY;
            this.isMoving = false;
        }
        else {
            const ratio = moveDistance / distance;
            this.x += dx * ratio;
            this.y += dy * ratio;
        }
    }
    getGridPosition() {
        return { x: this.gridX, y: this.gridY };
    }
    getIsMoving() {
        return this.isMoving;
    }
}
//# sourceMappingURL=Obstacle.js.map