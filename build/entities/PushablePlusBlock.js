import { GameObject } from './GameObject.js';
export class PushablePlusBlock extends GameObject {
    gridX;
    gridY;
    targetX;
    targetY;
    isMoving = false;
    speed = 400;
    constructor(x, y, tileSize) {
        super(x * tileSize, y * tileSize, tileSize, tileSize, 'pushable-plus-block');
        this.gridX = x;
        this.gridY = y;
        this.targetX = this.x;
        this.targetY = this.y;
    }
    push(dx, dy, tileSize) {
        this.gridX += dx;
        this.gridY += dy;
        this.targetX = this.gridX * tileSize;
        this.targetY = this.gridY * tileSize;
        this.isMoving = true;
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
//# sourceMappingURL=PushablePlusBlock.js.map