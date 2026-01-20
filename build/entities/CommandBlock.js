import { GameObject } from './GameObject.js';
export class CommandBlock extends GameObject {
    direction;
    blockColor;
    commandColor;
    activationTimer = 0;
    activationInterval = 1000;
    isActive = false;
    gridX;
    gridY;
    targetX;
    targetY;
    isMoving = false;
    speed = 200;
    constructor(x, y, tileSize, direction, blockColor = 'yellow', commandColor = 'yellow') {
        const spriteName = CommandBlock.getSpriteKey(blockColor, commandColor, direction);
        super(x * tileSize, y * tileSize, tileSize, tileSize, spriteName);
        this.direction = direction;
        this.blockColor = blockColor;
        this.commandColor = commandColor;
        this.gridX = x;
        this.gridY = y;
        this.targetX = this.x;
        this.targetY = this.y;
    }
    static getSpriteKey(blockColor, commandColor, direction) {
        if (blockColor === 'gray' && commandColor === 'yellow') {
            return `${direction}-arrow`;
        }
        else {
            return `green-${direction}-arrow`;
        }
    }
    push(dx, dy, tileSize) {
        this.gridX += dx;
        this.gridY += dy;
        this.targetX = this.gridX * tileSize;
        this.targetY = this.gridY * tileSize;
        this.isMoving = true;
    }
    checkActivation(grid, gridX, gridY, isInCircuit = false) {
        if (isInCircuit) {
            this.isActive = true;
            return true;
        }
        const leftTile = grid.getTile(gridX - 1, gridY);
        const rightTile = grid.getTile(gridX + 1, gridY);
        if (leftTile?.type === 'plus-block' && rightTile?.type === 'minus-block') {
            this.isActive = true;
            return true;
        }
        const topTile = grid.getTile(gridX, gridY - 1);
        const bottomTile = grid.getTile(gridX, gridY + 1);
        if (topTile?.type === 'plus-block' && bottomTile?.type === 'minus-block') {
            this.isActive = true;
            return true;
        }
        this.isActive = false;
        return false;
    }
    update(deltaTime) {
        if (this.isMoving) {
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
    getDirection() {
        switch (this.direction) {
            case 'up': return { dx: 0, dy: -1 };
            case 'down': return { dx: 0, dy: 1 };
            case 'left': return { dx: -1, dy: 0 };
            case 'right': return { dx: 1, dy: 0 };
        }
    }
    getBlockColor() {
        return this.blockColor;
    }
    getCommandColor() {
        return this.commandColor;
    }
    getIsActive() {
        return this.isActive;
    }
    getIsMoving() {
        return this.isMoving;
    }
    getGridPosition() {
        return {
            x: this.gridX,
            y: this.gridY
        };
    }
}
//# sourceMappingURL=CommandBlock.js.map