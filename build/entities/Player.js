import { GameObject } from './GameObject.js';
export class Player extends GameObject {
    speed = 400;
    gridX;
    gridY;
    targetX;
    targetY;
    isMoving = false;
    direction = 'front';
    tileSize;
    constructor(gridX, gridY, tileSize) {
        const worldPos = {
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
    tryMove(dx, dy, grid, pushables, isHolding = false, obstacles = []) {
        if (this.isMoving) {
            return false;
        }
        if (!isHolding) {
            this.updateDirection(dx, dy);
        }
        const newGridX = this.gridX + dx;
        const newGridY = this.gridY + dy;
        if (!grid.isValid(newGridX, newGridY)) {
            return false;
        }
        const tile = grid.getTile(newGridX, newGridY);
        if (!tile || !Player.isWalkableTile(tile.type)) {
            return false;
        }
        for (const obstacle of obstacles) {
            const obsPos = obstacle.getGridPosition();
            if (obsPos.x === newGridX && obsPos.y === newGridY) {
                return false;
            }
        }
        const pushableInFront = this.getPushableAt(newGridX, newGridY, pushables);
        if (isHolding) {
            let faceDX = 0;
            let faceDY = 0;
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
            const blockX = this.gridX + faceDX;
            const blockY = this.gridY + faceDY;
            const heldBlock = this.getPushableAt(blockX, blockY, pushables);
            if (heldBlock) {
                if (pushableInFront) {
                    return false;
                }
                const blockNewX = blockX + dx;
                const blockNewY = blockY + dy;
                if (!grid.isValid(blockNewX, blockNewY)) {
                    return false;
                }
                const blockTile = grid.getTile(blockNewX, blockNewY);
                if (!blockTile || !Player.isWalkableTile(blockTile.type)) {
                    return false;
                }
                for (const obstacle of obstacles) {
                    const oPos = obstacle.getGridPosition();
                    if (oPos.x === blockNewX && oPos.y === blockNewY) {
                        return false;
                    }
                }
                const blocking = this.getPushableAt(blockNewX, blockNewY, pushables);
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
            const pushResult = this.tryPushChain(pushableInFront, dx, dy, grid, pushables, obstacles);
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
    tryPushChain(firstObj, dx, dy, grid, pushables, obstacles) {
        const chain = [];
        let currentObj = firstObj;
        while (currentObj) {
            chain.push(currentObj);
            const objGridX = Math.floor(currentObj.x / this.tileSize);
            const objGridY = Math.floor(currentObj.y / this.tileSize);
            const nextGridX = objGridX + dx;
            const nextGridY = objGridY + dy;
            const nextObj = this.getPushableAt(nextGridX, nextGridY, pushables);
            if (nextObj && !chain.includes(nextObj)) {
                currentObj = nextObj;
            }
            else {
                currentObj = null;
            }
        }
        const lastObj = chain[chain.length - 1];
        const lastObjGridX = Math.floor(lastObj.x / this.tileSize);
        const lastObjGridY = Math.floor(lastObj.y / this.tileSize);
        const finalGridX = lastObjGridX + dx;
        const finalGridY = lastObjGridY + dy;
        if (!grid.isValid(finalGridX, finalGridY)) {
            return false;
        }
        const finalTile = grid.getTile(finalGridX, finalGridY);
        if (!finalTile || !Player.isWalkableTile(finalTile.type)) {
            return false;
        }
        for (const obstacle of obstacles) {
            const obsPos = obstacle.getGridPosition();
            if (obsPos.x === finalGridX && obsPos.y === finalGridY) {
                return false;
            }
        }
        const blocking = this.getPushableAt(finalGridX, finalGridY, pushables);
        if (blocking && !chain.includes(blocking)) {
            return false;
        }
        for (let i = chain.length - 1; i >= 0; i--) {
            chain[i].push(dx, dy, this.tileSize);
        }
        return true;
    }
    getPushableAt(gridX, gridY, pushables) {
        for (const obj of pushables) {
            const objGridX = Math.floor(obj.x / this.tileSize);
            const objGridY = Math.floor(obj.y / this.tileSize);
            if (objGridX === gridX && objGridY === gridY) {
                return obj;
            }
        }
        return null;
    }
    static isWalkableTile(type) {
        const walkableTiles = ['floor1', 'floor2', 'floor3', 'exit'];
        return walkableTiles.includes(type);
    }
    updateDirection(dx, dy) {
        if (dx > 0) {
            this.direction = 'right';
            this.spriteName = 'character-right';
        }
        else if (dx < 0) {
            this.direction = 'left';
            this.spriteName = 'character-left';
        }
        else if (dy < 0) {
            this.direction = 'front';
            this.spriteName = 'character-back';
        }
        else if (dy > 0) {
            this.direction = 'down';
            this.spriteName = 'character-front';
        }
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
    getIsMoving() {
        return this.isMoving;
    }
    getGridPosition() {
        return { x: this.gridX, y: this.gridY };
    }
}
//# sourceMappingURL=Player.js.map